import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readChapter,ChapterFlow,shotPresentation} from './chapter.mjs';
import {BranchStagePlayer,branchCast} from './branch-staging.mjs';
import {audioProfile} from './score.mjs';

const source=await readFile(new URL('../content/script/ch1.md',import.meta.url),'utf8');
const branch=await readFile(new URL('../content/script/ch1_branch_b.md',import.meta.url),'utf8');
const chapter=readChapter(source,branch);
const points=['painting','kitchen','apron','table'];
function finish(flow,seen=[]){while(flow.phase==='reading'){seen.push(flow.session.current);flow.advance();}return seen;}
function reachChoice(inspected=new Set(points)){
  const flow=new ChapterFlow(chapter,{inspected});flow.read('lunch');const seen=finish(flow);return {flow,seen};
}

test('both read-only script files parse without production notes becoming player text',async()=>{
  assert.equal(chapter.shots.size,24);assert.equal(chapter.lineCount,316);
  const steps=[...chapter.shots.values()].flatMap(shot=>shot.steps);
  assert.equal(steps.filter(step=>step.kind==='choice').length,1);
  assert.equal(steps.filter(step=>step.kind==='memory').length,6);
  assert.ok(!steps.some(step=>step.text.includes('给主力机')||step.text.includes('并入方式')));
  const manifest=JSON.parse(await readFile(new URL('../assets/manifest.json',import.meta.url),'utf8'));
  for(const step of steps.filter(step=>Number(step.shotId.slice(3))>=16)){
    if(step.face)assert.ok(manifest.portraits[step.face],step.face);
    assert.equal(step.sourceFile,'content/script/ch1_branch_b.md');
  }
  const spokenBranch=branch.split(/\r?\n/).filter(line=>/^(?:旁白：|(?:伊蕾娜|艾米尔|妮诺)\[)/.test(line));
  assert.deepEqual(steps.filter(step=>step.sourceFile.endsWith('ch1_branch_b.md')&&step.kind==='line').map(step=>step.text),spokenBranch.map(line=>line.slice(line.indexOf('：')+1)));
  const packaged=readChapter(source.split(/^##\s+附录/m)[0],branch.slice(branch.search(/^##\s+SC-02/m)));
  assert.equal(packaged.lineCount,chapter.lineCount);assert.deepEqual([...packaged.shots.keys()],[...chapter.shots.keys()]);
});

test('all sixteen inspection combinations unlock only when all four distinct observations were seen',()=>{
  for(let mask=0;mask<16;mask++){
    const inspected=new Set(points.filter((_,index)=>mask&(1<<index)));
    inspected.add('unrelated');
    const {flow,seen}=reachChoice(inspected);
    if(mask===15){assert.equal(flow.phase,'choice');assert.equal(seen.at(-1).shotId,'SH-11');assert.equal(seen.at(-1).text,'不用那么在意。');}
    else {assert.equal(flow.phase,'to-gate');assert.ok(seen.some(step=>step.shotId==='SH-12'));assert.ok(!seen.some(step=>step.shotId==='SH-16'));assert.throws(()=>flow.choose('branchB'));}
  }
});

test('the prompt precedes the gift proposal and choosing main preserves every original lunch step',()=>{
  const {flow,seen}=reachChoice();assert.equal(seen.at(-1).shotId,'SH-11');
  assert.equal(seen.at(-1).text,'不用那么在意。');
  assert.deepEqual(flow.session.current.options.map(option=>option.label),['建议他送出瓶子','建议他安慰妮诺']);
  const cursor=flow.session.currentId;assert.equal(flow.advance(),null);assert.equal(flow.session.currentId,cursor);
  assert.throws(()=>flow.choose('invalid'));flow.choose('main');assert.match(flow.session.current.text,/这不是送她礼物/);assert.throws(()=>flow.choose('branchB'));
  const gift=finish(flow);assert.equal(gift.filter(step=>step.kind==='memory').length,6);assert.equal(flow.phase,'to-gate');
  assert.deepEqual([...seen,...gift],['SH-08','SH-09','SH-10','SH-11','SH-12'].flatMap(id=>chapter.shots.get(id).steps));
  flow.arrive('gate_dusk');finish(flow);assert.equal(flow.phase,'to-dusk');flow.arrive('field_dusk');finish(flow);assert.equal(flow.phase,'complete');assert.equal(flow.route,'main');
});

test('branch B retains all dialogue, skips gift memories and original ending, and reaches its own last line',()=>{
  const {flow,seen}=reachChoice();flow.choose('branchB');
  const branchSteps=finish(flow);assert.equal(branchSteps[0].shotId,'SH-16');assert.equal(branchSteps[0].text,'艾米尔好像很沮丧。');
  assert.ok(!seen.some(step=>/送她礼物|天才|称赞|纯真的孩子/.test(step.text)));
  assert.equal(flow.phase,'branch-to-gate');assert.deepEqual(flow.interactions(),[]);assert.throws(()=>flow.arrive('field_dusk'));
  flow.arrive('gate_dusk');finish(flow,branchSteps);assert.equal(flow.phase,'branch-to-epilogue');
  flow.arrive('field_dusk');finish(flow,branchSteps);assert.equal(flow.phase,'complete');assert.equal(flow.route,'branchB');
  assert.equal(branchSteps.at(-1).text,'没错，就是我。');
  assert.ok(![...seen,...branchSteps].some(step=>['SH-12','SH-13','SH-14','SH-15'].includes(step.shotId)||step.kind==='memory'));
  const expected=[...chapter.shots.values()].filter(shot=>Number(shot.id.slice(3))>=16).flatMap(shot=>shot.steps).filter(step=>step.kind==='line');
  assert.deepEqual(branchSteps,expected);
});

test('a missing or ambiguous gift proposal cannot silently relocate the choice',()=>{
  assert.throws(()=>readChapter(source.replace('这不是送她礼物','可以给她礼物'),branch),/定位选择/);
  assert.throws(()=>readChapter(source.replace('不用那么在意。','这不是送她礼物。'),branch),/定位选择/);
});

test('branch-only expression aliases never weaken validation of the original script or new typos',()=>{
  assert.throws(()=>readChapter(source.replace('扶帽·得意','得意')),/找不到表情/);
  assert.throws(()=>readChapter(source,branch.replace('妮诺[哭泣]','妮诺[不存在]')),/找不到表情/);
  assert.throws(()=>readChapter(source,branch.replace('SH-24　尾声','SH-25　尾声')),/支线缺少镜头/);
  assert.throws(()=>readChapter(source,branch.replace('继续 SH-17','继续 SH-99')),/选项目标/);
  assert.throws(()=>readChapter(source,branch.replace('- 建议他送出瓶子 → 回主线 SH-12','')),/需要一组/);
});

test('a new journey has neither unlocked observations nor a previously selected ending',()=>{
  const old=reachChoice().flow;old.choose('branchB');
  const fresh=new ChapterFlow(chapter);fresh.start();assert.equal(fresh.route,'main');assert.equal(fresh.branchUnlocked,false);assert.equal(fresh.choiceResolved,false);
});

test('reflection waits for readable narration, pauses by elapsed time and resets at the next shot',()=>{
  const player=new BranchStagePlayer(),step=chapter.shots.get('SH-20').steps[0];player.select(step);
  assert.equal(player.kind,'reflection');assert.ok(player.duration>=Array.from(step.text).length*32+1000);
  player.update(player.duration-1);assert.equal(player.complete,false);const still=player.progress;player.update(0);assert.equal(player.progress,still);
  player.update(1);assert.equal(player.complete,true);player.select(chapter.shots.get('SH-21').steps[0]);assert.equal(player.kind,null);
});

test('night farewell moves Emil and Nino only, keeps Elaina still and cancels cleanly',()=>{
  const player=new BranchStagePlayer();player.leave();const before=branchCast('SH-23',player);player.update(1400);const after=branchCast('SH-23',player);
  assert.deepEqual(before[0],after[0]);assert.ok(after[1].y>before[1].y&&after[2].y>before[2].y);
  player.reset();player.update(5000);assert.equal(player.complete,false);assert.equal(player.kind,null);
  const reduced=new BranchStagePlayer({reducedMotion:true});reduced.leave();reduced.update(250);assert.equal(branchCast('SH-23',reduced)[1].opacity,.5);reduced.update(250);assert.equal(reduced.complete,true);
});

test('branch staging hides the reflection portraits and uses its own ending without the original CG',()=>{
  assert.equal(shotPresentation('SH-20').hidePortraits,true);assert.equal(shotPresentation('SH-24').hidePortraits,true);assert.equal(shotPresentation('SH-24').hideSprites,true);assert.equal(shotPresentation('SH-24').cg,null);
  assert.equal(audioProfile({mode:'dialogue',scene:'gate_dusk',shot:'SH-23'}),'hush');assert.equal(audioProfile({mode:'dialogue',scene:'field_dusk',shot:'SH-24'}),'hope');
});
