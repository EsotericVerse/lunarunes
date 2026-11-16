/** Only the LRS Rune public Hero image display contract; no editor writes. */
export function parseBlockImage(value){
 if(value&&typeof value==='object'&&!Array.isArray(value))return value;
 if(typeof value!=='string'||!value.trim())return null;
 try{const parsed=JSON.parse(value);return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:null;}
 catch{return null;}
}
