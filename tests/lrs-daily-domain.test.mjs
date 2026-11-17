import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as daily from '../modules/lrs/daily/analytics.mjs';
import * as oldEntry from '../app/lrunes/daily-analytics-model.mjs';
import {
 DAILY_TRANSFER_FORMAT,DAILY_TRANSFER_MAX_BYTES,DAILY_TRANSFER_BATCH,
 makeDailyTransfer,parseDailyTransfer,planDailyTransfer,parseDailyCsv
} from '../modules/lrs/daily/transfer-contract.mjs';

test('canonical daily analytics owns native legacy entry without duplicating its logic',()=>{
 for(const name of ['normalizeDailyDraws','dailyTrend','rankDailyDraws','dailyDirectionTrend','dailyCategoryTrend'])
  assert.strictEqual(oldEntry[name],daily[name],name);
 const legacy=readFileSync(new URL('../app/lrunes/daily-analytics-model.mjs',import.meta.url),'utf8');
 assert.match(legacy,/export \* from '\.\.\/\.\.\/modules\/lrs\/daily\/analytics\.mjs'/);
 const logic=readFileSync(new URL('../modules/lrs/daily/analytics.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(logic,/(?:app\/loc|app\/modular|loc:dialect)/);
});
test('week starts on Monday, daily ranking and direction mean remain unchanged',()=>{
 const rows=daily.normalizeDailyDraws([
  {record_date:'2026-11-17',rune_number:1,rune_name:'靈',direction:'正位',draw_kind:'main',recorded_phase:'新月',moon_phase:1},
  {record_date:'2026-11-18',rune_number:1,rune_name:'靈',direction:'逆位',draw_kind:'supplement',recorded_phase:'新月',moon_phase:1}
 ],()=> '新月');
 assert.equal(rows.length,2);
 assert.deepEqual(daily.dailyTrend(rows,'week'),[{period:'2026/11/16',total:2}]);
 assert.equal(daily.rankDailyDraws(rows,'rune')[0].count,2);
 assert.equal(daily.dailyDirectionTrend(rows,'week')[0].directionAverage,0);
 assert.equal(daily.dailyRuneInteractionScore(rows[0]).score,1.25);
});
test('old backup format, byte/row limits and duplicate policy remain identical',()=>{
 assert.equal(DAILY_TRANSFER_FORMAT,'loc.lrunes.daily.v1');
 assert.equal(DAILY_TRANSFER_BATCH,1000);
 assert.equal(DAILY_TRANSFER_MAX_BYTES,24*1048576);
 const one={record_date:'2026-11-17',draw_kind:'main',rune_number:1,direction:'正位',recorded_phase:'新月'};
 const payload=makeDailyTransfer([one]);
 assert.deepEqual(parseDailyTransfer(payload),[one]);
 const result=planDailyTransfer([one],[one]);
 assert.equal(result.duplicateCount,1);
 assert.equal(result.newCount,0);
 assert.equal(result.conflictCount,0);
 assert.throws(()=>makeDailyTransfer([one,one]),/重複紀錄/);
 assert.deepEqual(parseDailyCsv('record_date,draw_kind,rune_number,direction,recorded_phase\n2026-11-17,main,1,正位,新月\n').records[0],
 {record_date:'2026-11-17',draw_kind:'main',rune_number:'1',direction:'正位',recorded_phase:'新月'});
 const transfer=readFileSync(new URL('../modules/lrs/daily/transfer-contract.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(transfer,/(?:app\/loc|app\/modular|query-batch-size)/);
});
