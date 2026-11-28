// Existing Rune view bridge: the actual draw and reading engine is lrs:card.
// The LRS Worker owns the PostgreSQL dialect; the browser never sees credentials.
import {createCardModule,randomIndex,buildFixedReading} from '../../../modules/lrs/card/draw-core.mjs';
export {LRS_LUCUS_DRAWABLE_RUNE_IDS,lrsLucusDrawCandidates} from '../../../modules/lrs/lucus/lrs-lucus.mjs';
let activeCardModule=null;
export function bindCardDialect(adapter){activeCardModule=createCardModule(adapter);return activeCardModule;}
export async function loadDrawCards(...args){
  if(!activeCardModule)throw new Error('lrs:card requires the LRS Rune read port before loading cards');
  return activeCardModule.loadDrawCards(...args);
}
export {randomIndex,buildFixedReading};
