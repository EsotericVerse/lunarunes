// LRS iOS packages its own Web and art locally. Its anonymous data queries
// still use the independently deployed LRS Worker, never LOC or a native DB Secret.
export function runePublicReadUrl(protocol='https:'){
  return protocol==='capacitor:'
    ?'https://lrs.lo3rwang.cc/api/lrs/public-read'
    :'/api/lrs/public-read';
}
