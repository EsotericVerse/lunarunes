// LRS native iOS reads its own LRS Worker. Website requests stay same-origin.
export function runePublicReadUrl(protocol='https:'){
  return protocol==='capacitor:'
    ?'https://lrs.lo3rwang.cc/api/lrs/public-read'
    :'/api/lrs/public-read';
}
