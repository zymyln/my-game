import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readChapter, ChapterFlow, shotPresentation, glassCue } from './chapter.mjs';

const source=await readFile(new URL('../content/script/ch1.md',import.meta.url),'utf8');
const chapter=readChapter(source);
function finish(flow,seen=[]) { while(flow.phase==='reading') {seen.push(flow.session.current);flow.advance();}return seen; }

test('the active script is parsed without directions, observations or appendix becoming dialogue',()=>{
  assert.equal(chapter.shots.size,15);
  const activeSource=source.split(/^##\s+附录/m)[0];
  const speechLines=activeSource.split(/\r?\n/).filter(line=>/^(旁白[:：]|(?:伊蕾娜|艾米尔|妮诺|村长)\[)/.test(line.trim()));
  assert.equal(chapter.lineCount,speechLines.length);
  assert.equal(chapter.shots.get('SH-12').steps.filter(step=>step.kind==='memory').length,6);
  const steps=[...chapter.shots.values()].flatMap(shot=>shot.steps);
  assert.ok(steps.every(step=>!step.text.includes('【演出】')&&!step.text.startsWith('- 光粒子')));
  assert.ok(!steps.some(step=>step.text.includes('井绳磨得很旧')));
  const thought=steps.find(step=>step.thought);
  assert.equal(thought.speaker,'旁白');assert.equal(thought.face,'elaina_serious');
});
test('the original 22 sample lines still match the working script and IDs remain untouched',async()=>{
  const sample=JSON.parse(await readFile(new URL('../content/dialogue.json',import.meta.url),'utf8'));
  const sourceLines=chapter.shots.get('SH-04').steps;
  assert.deepEqual(sourceLines.map(({speaker,text,face,bg})=>({speaker,text,face,bg})),Object.values(sample).map(({speaker,text,face,bg})=>({speaker,text,face,bg})));
});
test('the whole chapter follows its gates and optional observations never gate lunch',()=>{
  const flow=new ChapterFlow(chapter),seen=[];
  flow.start();finish(flow,seen);assert.equal(flow.phase,'meet');
  assert.deepEqual(flow.interactions(),['emil']);assert.throws(()=>flow.arrive('hall'));
  flow.meet();finish(flow,seen);assert.equal(flow.phase,'to-hall');
  flow.arrive('hall');finish(flow,seen);assert.equal(flow.phase,'waiting');
  assert.ok(flow.interactions().includes('wait-lunch'));
  flow.sit();finish(flow,seen);assert.equal(flow.phase,'to-gate');
  flow.arrive('gate_dusk');finish(flow,seen);assert.equal(flow.phase,'to-dusk');
  flow.arrive('field_dusk');finish(flow,seen);assert.equal(flow.phase,'complete');
  assert.equal(new Set(seen.map(step=>step.cursor)).size,seen.length);
  assert.equal(seen.length,chapter.lineCount+6);
  assert.equal(seen.at(-1).text,'去了肯定只会徒增悲伤而已。');
});
test('small dialogue edits are read on refresh and unknown expression tags fail clearly',()=>{
  const edited=readChapter(source.replace('不用说也知道那是谁——没错，就是我。','新的开场台词。'));
  assert.equal(edited.shots.get('SH-01').steps[2].text,'新的开场台词。');
  assert.throws(()=>readChapter(source.replace('伊蕾娜[微笑]：你好。','伊蕾娜[不存在]：你好。')),/找不到表情/);
  assert.throws(()=>readChapter(source.replace('## 附录', '### SH-16　新镜头\n\n旁白：尚未编排。\n\n## 附录')),/尚未编排/);
  assert.throws(()=>readChapter(source.replace('`elaina_normal`','`emil_normal`')),/角色不对应/);
});
test('the final pause, portrait-free epilogue and glass restoration are staged',()=>{
  assert.equal(shotPresentation('SH-14').hold,3000);
  assert.equal(shotPresentation('SH-15').hidePortraits,true);
  const cues=chapter.shots.get('SH-10').steps.map(glassCue).filter(Boolean);
  assert.deepEqual(cues,['sound','broken','broken','mist','whole']);
});
