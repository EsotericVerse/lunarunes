/**
 * The Rune project owns its real asset origin; LOC Web only links to it.
 * Native consumers receive the real files via the separate LunArcus IPA process.
 *
 * On Rune Web, Vite replaces VITE_LRUNE_ASSET_ORIGIN at build time. In generic
 * Node/native module consumers, the default is the local root path instead.
 */
const base=String(import.meta.env?.VITE_LRUNE_ASSET_ORIGIN||'').trim().replace(/\/+$/,'');
if(base&&!/^https?:\/\/[^/]+(?:\/.*)?$/.test(base))
  throw new Error('VITE_LRUNE_ASSET_ORIGIN must be an absolute HTTP(S) origin');

export function runeAssetUrl(relative){
  const source=String(relative||'');
  const parts=source.split('/');
  if(!source||source.startsWith('/')||source.includes('\\')||
    parts.some(x=>!x||x==='.'||x==='..')||/[?#]/.test(source))
    throw new Error('Unsafe Rune asset path: '+source);
  return (base||'')+'/'+source;
}
export const RUNE_WEB_ASSET_ORIGIN=base;
