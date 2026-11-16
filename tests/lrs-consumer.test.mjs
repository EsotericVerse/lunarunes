import test from 'node:test';
import assert from 'node:assert/strict';
import * as rune from 'lrs/rune';
import * as card from 'lrs/card';
import * as boardgame from 'lrs/boardgame';
import * as daily from 'lrs/daily';
test('lrs subpath imports are usable without any LOC or VFX build dependencies',()=>{
  assert.equal(rune.runeNumbersForGroup(9).join(','),'0,65,66');
  assert.equal(rune.runeImage({rune_id:66}),'/assets/lunarunes/cards/66.png');
  assert.equal(typeof card.createCardModule,'function');
  assert.equal(card.RUNE_ALL_DRAW_MODES.find(m=>m.key==='ow3gs').count,11);
  assert.equal(boardgame.localTabletopRules().events.length,32);
  assert.equal(typeof daily.createDailyModule,'function');
  assert.equal(daily.DAILY_MOON_PHASES.length,5);
});
