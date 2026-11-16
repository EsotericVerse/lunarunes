#!/usr/bin/env node
/**
 * LRS-only, offline data transfer integrity gate.
 * Never connects to a database, changes a URL, imports rows or activates a target.
 * The operator supplies exported JSONL files from an LRS-approved source and
 * controls any actual database export/import via a separate authorized process.
 */
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {copyFile,readFile,readdir,lstat,mkdir,mkdtemp,rename,rm,access,writeFile} from 'node:fs/promises';
import {createInterface} from 'node:readline';
import {dirname,resolve,join,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const contractFile=join(root,'contracts/lrs-data-ownership.json');
const contractBytes=await readFile(contractFile);
const contract=JSON.parse(contractBytes.toString('utf8'));
const digest=value=>createHash('sha256').update(value).digest('hex');
const contractSha256=digest(contractBytes);
const tables=contract.tables;
const names=tables.map(t=>t.name);
const allowed=new Set(names);
const SHA=/^[a-f0-9]{64}$/;
if(contract.schema!=='lrs.data-ownership.v1'||contract.owner!=='lrs'||
 names.length!==7||new Set(names).size!==7||
 tables.some(t=>!t.required||!Array.isArray(t.key)||t.key.length===0))
 throw new Error('Invalid LRS-only data ownership contract');

function fail(message){throw new Error(message);}
async function mustBePlainFile(filename){
 const stats=await lstat(filename);
 if(!stats.isFile()||stats.isSymbolicLink())
  fail('Data handoff requires a regular file; symlinks are forbidden');
}
function canonical(value){
 if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
 if(value&&typeof value==='object')
  return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
 return JSON.stringify(value);
}
async function fileHash(filename){
 const hash=createHash('sha256');
 for await(const chunk of createReadStream(filename))hash.update(chunk);
 return hash.digest('hex');
}
async function scan(table,filename){
 await mustBePlainFile(filename);
 let count=0;
 const keys=new Set(), rowFingerprints=[];
 const input=createInterface({input:createReadStream(filename,{encoding:'utf8'}),crlfDelay:Infinity});
 for await(const line of input){
  count++;
  if(!line.trim())fail(table.name+' contains an empty row at line '+count);
  let row;
  try{row=JSON.parse(line);}catch{fail(table.name+' has invalid JSON at line '+count);}
  if(!row||typeof row!=='object'||Array.isArray(row))
   fail(table.name+' row '+count+' must be a JSON object');
  const key=table.key.map(field=>row[field]);
  if(key.some((x,index)=>x===null||x===undefined||
    (typeof x!=='string'&&typeof x!=='number')||
    (typeof x==='string'&&!x.trim()&&!(table.name==='runes_etc'&&table.key[index]==='current_moon'&&x===''))||
    (typeof x==='number'&&!Number.isFinite(x))))
   fail(table.name+' missing/invalid primary key at line '+count);
  const identity=JSON.stringify(key);
  if(keys.has(identity))fail(table.name+' duplicate primary key at line '+count);
  keys.add(identity);
  rowFingerprints.push([identity,digest(canonical(row))]);
 }
 if(table.expectedRows!==undefined&&count!==table.expectedRows)
  fail(table.name+' expected '+table.expectedRows+' rows; received '+count);
 rowFingerprints.sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0);
 const semanticSha256=digest(rowFingerprints.map(([key,sha])=>JSON.stringify([key,sha])).join('\n'));
 return {rows:count,sha256:await fileHash(filename),semanticSha256};
}
async function available(path){
 try{await access(path);return true;}catch{return false;}
}
async function directoryFiles(dir){
 const entries=await readdir(dir,{withFileTypes:true});
 if(entries.some(x=>!x.isFile()||x.isSymbolicLink()))
  fail('Data handoff directory must contain regular files only');
 return entries.map(x=>x.name);
}
function safeDestination(path){
 const destination=resolve(path);
 const isRepo=destination===root||destination.startsWith(root+sep);
 const ignored=join(root,'.lrs-data-transfer');
 if(isRepo&&destination!==ignored&&!destination.startsWith(ignored+sep))
  fail('Data output must be outside the source repository or in ignored .lrs-data-transfer/');
 return destination;
}
async function pack(source,destination){
 const input=resolve(source),target=safeDestination(destination);
 if(input===target||await available(target))fail('Data output must be a new directory, distinct from source');
 const files=await directoryFiles(input);
 const expected=new Set(names.map(name=>name+'.jsonl'));
 if(files.length!==expected.size||files.some(x=>!expected.has(x)))
  fail('Data source files must match the exact seven LRS JSONL table names');
 await mkdir(dirname(target),{recursive:true});
 const temporary=await mkdtemp(join(dirname(target),'.lrs-transfer-'));
 try{
  const records=[];
  for(const table of tables){
   const filename=table.name+'.jsonl',sourceFile=join(input,filename);
   const metadata=await scan(table,sourceFile);
   await copyFile(sourceFile,join(temporary,filename));
   records.push({table:table.name,file:filename,key:table.key,...metadata});
  }
  const version=JSON.parse(await readFile(join(root,'release/version.json'),'utf8'));
  const manifest={
   schema:'lrs.data-handoff.v1',owner:'lrs',releaseVersion:version.version,
   contractSha256,mode:'offline-no-cutover',tables:records
  };
  await writeFile(join(temporary,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{mode:0o600});
  await rename(temporary,target);
  console.log('LRS data bundle packed and validated: '+records.length+' tables; no database accessed');
 }catch(error){await rm(temporary,{recursive:true,force:true});throw error;}
}
async function verify(directory){
 const target=resolve(directory);
 const files=await directoryFiles(target);
 const allowedFiles=new Set(['manifest.json',...names.map(n=>n+'.jsonl')]);
 if(files.length!==allowedFiles.size||files.some(x=>!allowedFiles.has(x)))
  fail('Snapshot must contain only the seven LRS tables and manifest.json');
 await mustBePlainFile(join(target,'manifest.json'));
 const manifest=JSON.parse(await readFile(join(target,'manifest.json'),'utf8'));
 if(manifest.schema!=='lrs.data-handoff.v1'||manifest.owner!=='lrs'||
    manifest.contractSha256!==contractSha256||manifest.mode!=='offline-no-cutover'||
    !Array.isArray(manifest.tables)||manifest.tables.length!==tables.length)
  fail('Data handoff manifest or owner contract mismatch');
 const seen=new Set();
 for(const expected of tables){
  const record=manifest.tables.find(t=>t.table===expected.name);
  if(!record||seen.has(record.table)||record.file!==expected.name+'.jsonl'||
     JSON.stringify(record.key)!==JSON.stringify(expected.key)||
     !Number.isSafeInteger(record.rows)||record.rows<0||
     !SHA.test(record.sha256)||!SHA.test(record.semanticSha256))
   fail('Data handoff table manifest mismatch: '+expected.name);
  seen.add(record.table);
  const checked=await scan(expected,join(target,record.file));
  if(checked.rows!==record.rows||checked.sha256!==record.sha256||
     checked.semanticSha256!==record.semanticSha256)
   fail('Data handoff checksum/count mismatch: '+expected.name);
 }
 if(seen.size!==tables.length)fail('Incomplete LRS data handoff');
 return manifest;
}
async function compare(source,target){
 const [a,b]=await Promise.all([verify(source),verify(target)]);
 const mismatches=[];
 for(const name of names){
  const left=a.tables.find(x=>x.table===name),right=b.tables.find(x=>x.table===name);
  if(left.rows!==right.rows||left.semanticSha256!==right.semanticSha256)
   mismatches.push(name+': counts '+left.rows+'/'+right.rows+' or content digest differs');
 }
 if(mismatches.length)fail('LRS source/target mismatch: '+mismatches.join('; '));
 console.log('LRS data parity PASS: '+names.length+' tables, keys, counts and content; activation remains owner-only');
}
try{
 const [command,arg1,arg2]=process.argv.slice(2);
 if(command==='pack'&&arg1&&arg2)await pack(arg1,arg2);
 else if(command==='verify'&&arg1&&!arg2){
  await verify(arg1);console.log('LRS data bundle integrity PASS (no database access)');
 }else if(command==='compare'&&arg1&&arg2)await compare(arg1,arg2);
 else fail('Usage: node scripts/lrs-data-handoff.mjs pack <seven-jsonl-dir> <new-bundle-dir> | verify <bundle-dir> | compare <source-bundle> <target-bundle>');
}catch(error){
 console.error('LRS data handoff blocked: '+error.message);
 process.exitCode=1;
}
