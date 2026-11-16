/**
 * Module IDs are not repository names or public Scope IDs.
 * The three independently owned Luna modules are: lrune, las, loc.
 * This repository only implements lrune; las belongs to LunArcus.
 */
export const LRUNE_MODULE=Object.freeze({
  id:'lrune',
  name:'LunaRunes',
  repository:'EsotericVerse/lunarunes',
  scope:'lrunes',
  roles:Object.freeze(['rune-core','rune-art','rune-vfx','local-game','future-game-engine']),
  contracts:Object.freeze({web:'lunarunes.artifacts.v1',native:'lunarunes.artifacts.v1'})
});
