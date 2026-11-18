import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {RUNE_THEME_IDS,runeThemeId,storedRuneTheme,applyRuneTheme} from '../web/src/runtime/rune-theme.mjs';
const file=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('all eight original LOC theme stylesheets are copied as independent LRS assets',async()=>{
 assert.deepEqual(RUNE_THEME_IDS,Array.from({length:8},(_,i)=>'theme-'+(i+1)));
 for(const id of RUNE_THEME_IDS){
  const css=await file('web/public/themes/'+id+'.css');
  assert.match(css,new RegExp('data-theme-id="'+id+'"'));
  assert.match(css,/--loc-bg:/);
  assert.match(css,/--loc-rune-bg:/);
  assert.doesNotMatch(css,/@import|https?:\/\//);
 }
});

test('theme switching loads only selected local stylesheet and saves local preference',()=>{
 const attrs=new Map(),nodes=[];
 const storage=new Map();
 const head={appendChild(node){nodes.push(node);}};
 const doc={documentElement:{setAttribute(k,v){attrs.set(k,v);}},head,
  getElementById(id){return nodes.find(node=>node.id===id);},
  createElement(tag){assert.equal(tag,'link');const state=new Map();return {setAttribute(k,v){state.set(k,v);},getAttribute(k){return state.get(k);}};}};
 const local={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};
 assert.equal(runeThemeId('theme-8'),'theme-8');
 assert.equal(runeThemeId('theme-99'),'theme-1');
 for(const id of RUNE_THEME_IDS){
  assert.equal(applyRuneTheme(id,{doc,storage:local}),id);
  assert.equal(attrs.get('data-theme-id'),id);
  assert.equal(nodes.length,1);
  assert.equal(nodes[0].getAttribute('href'),'/themes/'+id+'.css');
  assert.equal(storedRuneTheme(local),id);
 }
 assert.equal(attrs.get('data-theme'),'custom');
});

test('LRS Web and iOS package from LRS theme files without LOC runtime fetch',async()=>{
 const [entry,app,ios]=await Promise.all([file('web/src/main.jsx'),file('web/src/RuneApp.jsx'),file('.github/workflows/lrs-ios-device.yml')]);
 assert.match(entry,/applyRuneTheme\(storedRuneTheme\(\)\)/);
 assert.match(app,/RUNE_THEME_IDS\.map/);
 assert.match(ios,/npm run build:cloudflare/);
 assert.doesNotMatch(ios,/lunacodex|LOC_WORKFLOW_KEY/);
});
