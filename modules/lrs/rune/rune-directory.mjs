import {runeAssetUrl} from './asset-url.mjs';
import {
  LRS_LUCUS_GROUPS,lrsLucusRuneIdsForGroup,
  lrsLucusRuneNumberForRoute,lrsLucusLocalRuneId
} from '../lucus/lrs-lucus.mjs';

export function groupImage(id){
  const group=LRS_LUCUS_GROUPS.find(item=>item.id===Number(id));
  return group?runeAssetUrl(group.image):'';
}
// The 3D sanctuary uses the published full-resolution group art, not small
// list thumbnails. Rendering quality must not depend on stretched previews.
export function groupPreviewImage(id){return groupImage(id);}

// Official 月之符文 identity, not the LOC app emblem nor Rune 50 artwork.
export const RUNE_CARD_BACK_IMAGE=runeAssetUrl('assets/site/icons/lrunes-favicon.png');

export function runeName(card){return String(card?.rune_name||'').replace(/之符文$/,'').trim();}
// Rune ID is the only canonical image identity on both Web and iOS.
export function runeImage(card){
  const id=Number(card?.rune_id??card?.id??card?.rune_number);
  if(!Number.isInteger(id)||id<0||id>66)return '';
  return runeAssetUrl(`assets/lunarunes/cards/${String(id).padStart(2,'0')}.png`);
}
export function runeNumbersForGroup(groupId){return [...lrsLucusRuneIdsForGroup(groupId)];}
export function runeNumberForRoute(groupId,runeId){
  return lrsLucusRuneNumberForRoute(groupId,runeId);
}
export function localRuneId(groupId,card){
  return lrsLucusLocalRuneId(groupId,card?.rune_id);
}
export function groupParams(){
  return LRS_LUCUS_GROUPS.map(group=>({group:String(group.id).padStart(2,'0')}));
}
export function runeParams(){
  return LRS_LUCUS_GROUPS.flatMap(group=>group.runeIds.map(rune=>({
    group:String(group.id).padStart(2,'0'),
    rune:lrsLucusLocalRuneId(group.id,rune)
  })));
}
