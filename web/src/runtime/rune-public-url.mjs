// Browser Web uses the same-origin LRS Worker API. Native Capacitor may use
// an explicitly supplied HTTPS endpoint; it never receives database Secrets.
export function runePublicReadUrl(){
  const configured=String(import.meta.env?.VITE_LRS_PUBLIC_READ_URL||'').trim();
  if(configured){
    try{
      const target=new URL(configured);
      return target.protocol==='https:'?target.href:'';
    }catch{return '';}
  }
  if(typeof window==='undefined')return '';
  const {protocol,hostname}=window.location;
  // Do not make the local Vite dev server or a static GitHub Pages site
  // masquerade as the Worker API.
  if(protocol==='https:'&&(hostname==='lrs.lo3rwang.cc'||
    hostname==='lunarunes.esotericverse.workers.dev'||
    hostname.endsWith('.workers.dev')))return '/api/lrs/public-read';
  return '';
}
