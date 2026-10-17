import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readChapter, ChapterFlow, shotPresentation, glassCue, impactCue, portraitReaction } from './chapter.mjs';

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
  assert.equal(thought.speaker,'旁白');assert.equal(thought.face,chapter.faces.get('伊蕾娜:站立·正色'));
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
  assert.equal(seen.at(-1),chapter.shots.get('SH-15').steps.at(-1));
});
test('small dialogue edits are read on refresh and unknown expression tags fail clearly',()=>{
  const opening=chapter.shots.get('SH-01').steps[0];
  const edited=readChapter(source.replace(opening.text,'新的开场台词。'));
  assert.equal(edited.shots.get('SH-01').steps[0].text,'新的开场台词。');
  const elainaLine=source.split(/\r?\n/).find(line=>/^伊蕾娜\[/.test(line));
  assert.ok(elainaLine,'the expression-validation fixture must exist');
  assert.throws(()=>readChapter(source.replace(elainaLine,elainaLine.replace(/\[[^\]]+\]/,'[不存在]'))),/找不到表情/);
  assert.throws(()=>readChapter(source.replace('## 附录', '### SH-16　新镜头\n\n旁白：尚未编排。\n\n## 附录')),/尚未编排/);
  const face=chapter.faces.get('伊蕾娜:站立·平常');
  assert.ok(source.includes(`\`${face}\``));
  assert.throws(()=>readChapter(source.replace(`\`${face}\``,'`emil_invalid`')),/角色不对应/);
});

test('only the glass impact and the first chief shout cue a screen shake',()=>{
  const impacts=[...chapter.shots.values()].flatMap(shot=>shot.steps).map(impactCue).filter(Boolean);
  assert.deepEqual(impacts,['glass','shout']);
  assert.equal(impactCue({shotId:'SH-09',speaker:'村长',text:'——你在搞什么啊！'}),null);
  assert.equal(impactCue({shotId:'SH-10',speaker:'旁白',text:'——你在搞什么啊！'}),null);
  assert.equal(impactCue({shotId:'SH-10',speaker:'村长',text:'马上给我扫干净！'}),null);
});
test('the final pause, portrait-free epilogue and glass restoration are staged',()=>{
  assert.equal(shotPresentation('SH-09').rightFace,'chief_calm');
  assert.equal(shotPresentation('SH-14').hold,3000);
  assert.equal(shotPresentation('SH-15').hidePortraits,true);
  const cues=chapter.shots.get('SH-10').steps.map(glassCue).filter(Boolean);
  assert.deepEqual(cues,['sound','broken','broken','mist','whole']);
});

test('Elaina reacts while listening, settles before intervening, and keeps her casting pose through restoration',()=>{
  const steps=chapter.shots.get('SH-10').steps;
  let left='elaina_thinking';
  const faces=steps.map(step=>{
    if(step.face?.startsWith('elaina_'))left=step.face;
    const reaction=portraitReaction(step);
    if(reaction?.left)left=reaction.left;
    assert.ok(!reaction?.right,'listener reactions must not replace the speaking actor');
    return left;
  });
  const sound=steps.findIndex(step=>step.text.includes('匡啷'));
  const scolding=steps.findIndex(step=>step.text==='——你在搞什么啊！');
  const cast=steps.findIndex(step=>step.speaker==='伊蕾娜'&&step.text.startsWith('这种东西'));
  const gentle=steps.findIndex(step=>step.speaker==='伊蕾娜'&&step.text.startsWith('小心下次'));
  assert.ok(sound>=0&&sound<scolding&&scolding<cast&&cast<gentle);
  assert.ok(faces.slice(sound,scolding).every(face=>face==='elaina_standing_surprised'));
  assert.ok(faces.slice(scolding,cast).every(face=>face==='elaina_standing'));
  assert.ok(faces.slice(cast,gentle).every(face=>face==='elaina_explaining'));
  assert.equal(faces[gentle],'elaina_standing_smile');
  assert.equal(faces.at(-1),'elaina_standing_smile');
  assert.equal(portraitReaction({shotId:'SH-04',speaker:'旁白',text:'匡啷'}),null);
  assert.equal(portraitReaction({shotId:'SH-11',speaker:'村长',text:'——你在搞什么啊！'}),null);
});
