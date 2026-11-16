import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HomeBlock} from '../modules/lrs/rune/hero/home-presentation.mjs';
import {parseBlockImage} from '../modules/lrs/rune/hero/image.mjs';
import {realMoonPhase} from '../modules/lrs/daily/real-moon-phase.mjs';
import {dailyRecordSlots,availableDailyRuneKind} from '../modules/lrs/daily/record-slots.mjs';
import {runeImage} from '../modules/lrs/rune/rune-directory.mjs';

test('Rune Hero presentation is owned locally, without copied LOC editor actions',()=>{
 assert.equal(HomeBlock.heroExtraFor('lrunes')?.key,'moon');
 assert.equal(HomeBlock.heroExtraFor('loc'),null);
 assert.equal(HomeBlock.bubbleColumns([6,{uid:'00000001'}]),6);
 assert.equal(HomeBlock.bubbleColumns([9]),3);
 assert.equal(HomeBlock.childPresentation(''), 'bubble');
 assert.equal(HomeBlock.childPresentation('Title'),'card');
 assert.equal(HomeBlock.removeDuplicatedLegacySubtitle('副標正文','副標'),'正文');
 assert.equal(HomeBlock.plainBlockLine('<strong>符文</strong><br/>之月'),'符文 之月');
 const row=HomeBlock.normalizeEntities([3,{uid:'ABCDEFGH',title:'卡牌',text:'內容'}]);
 assert.deepEqual(row,[{uid:'ABCDEFGH',title:'卡牌',text:'內容',order:1}]);
 const slot={title:'符文',text:'<p>內容</p>',entities:[
  {title:'',text:'<p>內容</p>'},{title:'卡片',text:'獨立段落'}]};
 assert.deepEqual(HomeBlock.visibleEntities(slot).map(x=>x.title),['卡片']);
 assert.equal(parseBlockImage('{"url":"/pics/LunaRunes-hero.jpg"}').url,
   '/pics/LunaRunes-hero.jpg');
 assert.equal(parseBlockImage('invalid'),null);
});
test('LRS daily record handling remains independent and date-specific',()=>{
 const rows=[{record_date:'2026-11-17',draw_kind:'main'},{record_date:'2026-11-16',draw_kind:'supplement'}];
 assert.deepEqual(dailyRecordSlots(rows,'2026-11-17'),{main:true,supplement:false});
 assert.equal(availableDailyRuneKind(rows,'2026-11-17','main'),'supplement');
 assert.equal(realMoonPhase(new Date('nonsense')),'未知');
 assert.match(runeImage({rune_id:66}),/\/66\.png$/);
});
