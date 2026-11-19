// No Cloudflare Worker fallback. GitHub Pages does not host a POST/SQL API.
// Only an explicitly configured independent HTTPS read endpoint is allowed.
// An empty return makes unavailable dynamic data unmistakable.
export function runePublicReadUrl(){
  const url=String(import.meta.env?.VITE_LRS_PUBLIC_READ_URL||'').trim();
  if(!url)return '';
  try{
    const target=new URL(url);
    return target.protocol==='https:'?target.href:'';
  }catch{return '';}
}
