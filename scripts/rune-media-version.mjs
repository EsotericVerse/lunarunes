/** A single stable content version for LRS-owned pictures and authored VFX.
 * Web JS/CSS changes MUST NOT affect this identity. Consumers compare this
 * version, not an app commit or the old original-art source commit.
 */
import {createHash} from 'node:crypto';

export const RUNE_MEDIA_VERSION_SCHEMA='lrs.media.v1';
export function isRuneMediaPath(path){
  return /^(?:assets\/lunarunes\/cards\/\d{2}\.png|assets\/site\/icons\/lrunes-[^/]+|vendor\/(?:effekseer|rune-semantic-icons)\/.+|pics\/[^/]+(?:\/[^/]+)*)$/.test(path);
}
export function runeMediaVersion(entries){
  if(!Array.isArray(entries))throw TypeError('Rune release entries required');
  const media=entries.filter(e=>isRuneMediaPath(e?.path)).sort((a,b)=>
    a.path<b.path?-1:a.path>b.path?1:0);
  if(!media.some(e=>e.path==='assets/lunarunes/cards/00.png')||
     !media.some(e=>e.path==='assets/lunarunes/cards/66.png')||
     !media.some(e=>e.path==='vendor/effekseer/effekseer.wasm'))
    throw Error('Incomplete Rune picture and effect version inputs');
  const hash=createHash('sha256');
  hash.update(RUNE_MEDIA_VERSION_SCHEMA+'\n');
  const seen=new Set();
  for(const e of media){
    if(seen.has(e.path)||!/^[0-9a-f]{64}$/.test(e.sha256)||
       !Number.isSafeInteger(e.bytes)||e.bytes<0)
      throw Error('Invalid or repeated Rune media file: '+e.path);
    seen.add(e.path);
    hash.update(e.path+'\0'+e.bytes+'\0'+e.sha256+'\n');
  }
  return hash.digest('hex');
}
