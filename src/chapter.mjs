// Read-only adapter for the author's working script. These cursors are private
// playback positions, not persistent dialogue IDs and not a new JSON contract.
const SCENE_IDS = { '01':'field_day', '02':'hall', '03':'gate_dusk', '04':'field_dusk' };
const BLOCKS = {
  opening: { shots:['SH-01'], after:'meet' },
  meeting: { shots:['SH-02','SH-03','SH-04'], after:'to-hall' },
  arrival: { shots:['SH-05','SH-06','SH-07'], after:'waiting' },
  lunch: { shots:['SH-08','SH-09','SH-10','SH-11','SH-12'], after:'to-gate' },
  farewell: { shots:['SH-13','SH-14'], after:'to-dusk' },
  epilogue: { shots:['SH-15'], after:'complete' },
  branchB: { shots:['SH-16','SH-17','SH-18','SH-19','SH-20','SH-21','SH-22'], after:'branch-to-gate', optional:true },
  branchFarewell: { shots:['SH-23'], after:'branch-to-epilogue', optional:true },
  branchEpilogue: { shots:['SH-24'], after:'complete', optional:true },
};
const ACTORS = { '伊蕾娜':'elaina', '艾米尔':'emil', '妮诺':'nino', '村长':'chief' };
export const ACTOR_NAMES = Object.fromEntries(Object.entries(ACTORS).map(([name,id])=>[id,name]));

function parseScript(markdown,{faces=new Map(),branch=false}={}) {
  const shots = new Map();
  let scene = null, shot = null, choice = null;
  const lines = markdown.replace(/^\uFEFF/,'').split(/\r?\n/);
  for (const [index,raw] of lines.entries()) {
    const line = raw.trim();
    if (/^##\s+附录/.test(line)) break;
    const faceRow = line.match(/^\|\s*(伊蕾娜|艾米尔|妮诺|村长)\s*\|([^|]+)\|([^|]+)\|$/);
    if (faceRow) {
      const expressions = faceRow[2].split('/').map(value=>value.trim());
      const files = [...faceRow[3].matchAll(/`([^`]+)`/g)].map(match=>match[1]);
      if (expressions.length!==files.length || !files.length) throw new Error(`第 ${index+1} 行表情表的数量不对应。`);
      if (!files.every(file=>file.startsWith(`${ACTORS[faceRow[1]]}_`))) throw new Error(`第 ${index+1} 行表情文件名与角色不对应。`);
      expressions.forEach((expression,i)=>faces.set(`${faceRow[1]}:${expression}`,files[i]));
      continue;
    }
    const sceneHeading = line.match(/^##\s+SC-(\d+)\s+/);
    if (sceneHeading) {
      scene = SCENE_IDS[sceneHeading[1]];
      if (!scene) throw new Error(`尚未配置场景：${sceneHeading[0].trim()}`);
      shot = null; continue;
    }
    const shotHeading = line.match(/^###\s+(SH-\d+)\s+(.+)/);
    if (shotHeading) {
      if (!scene || shots.has(shotHeading[1])) throw new Error(`第 ${index+1} 行镜头重复或缺少场景。`);
      shot = { id:shotHeading[1], title:shotHeading[2], scene, steps:[], sourceLine:index+1 };
      shots.set(shot.id,shot); choice=null;continue;
    }
    if(branch&&shot&&line==='【选择】'){
      choice={kind:'choice',speaker:'旁白',text:'',face:null,bg:scene,sourceLine:index+1,options:[]};
      shot.steps.push(choice);continue;
    }
    if(choice&&line.startsWith('-')){
      const option=line.match(/^-\s*(.+?)\s*→\s*(.+)$/);
      const target=option?.[2].match(/SH-\d+/)?.[0];
      if(!option||!['SH-12','SH-17'].includes(target))throw new Error(`第 ${index+1} 行选项目标无法识别。`);
      choice.options.push({label:option[1],route:target==='SH-12'?'main':'branchB'});continue;
    }
    if (!shot || !line || line==='---' || line.startsWith('【')) continue;
    choice=null;
    const memory = line.match(/^-\s*光粒子[①②③④⑤⑥1-6][:：](.+)$/);
    if (memory) {
      shot.steps.push({ kind:'memory', text:memory[1], speaker:'旁白', face:null, bg:scene, sourceLine:index+1 });
      continue;
    }
    if (/^-\s+.+：旁白：/.test(line)) continue; // Optional investigations are handled separately.
    const speech = line.match(/^([^\[：:]+?)(?:\[([^\]]+)\])?(（心）|\(心\))?[:：](.+)$/);
    if (!speech) throw new Error(`第 ${index+1} 行无法识别，请使用“角色[表情]：台词”或“旁白：台词”。`);
    const [,name,expression,thought,text] = speech;
    const narration = name==='旁白' || Boolean(thought);
    if (name!=='旁白' && !ACTORS[name]) throw new Error(`第 ${index+1} 行出现了未配置角色：${name}`);
    const face = name==='旁白' ? null : faces.get(`${name}:${expression}`);
    if (name!=='旁白' && !face) throw new Error(`第 ${index+1} 行找不到表情：${name}[${expression}]`);
    shot.steps.push({ kind:'line', speaker:narration?'旁白':name, text, face, thought:Boolean(thought), bg:scene, sourceLine:index+1 });
  }
  return {shots,faces};
}

export function readChapter(markdown,branchMarkdown=null) {
  const {shots,faces}=parseScript(markdown);
  const mainBlocks=Object.values(BLOCKS).filter(block=>!block.optional);
  for (const block of mainBlocks) for (const id of block.shots) {
    if (!shots.get(id)?.steps.length) throw new Error(`剧本缺少镜头或台词：${id}`);
  }
  const planned=new Set(mainBlocks.flatMap(block=>block.shots));
  for(const id of shots.keys())if(!planned.has(id))throw new Error(`新增镜头尚未编排进剧情流程：${id}`);
  const memories = shots.get('SH-12').steps.filter(step=>step.kind==='memory');
  if (memories.length!==6) throw new Error('赠瓶镜头需要六条光粒子文字。');
  memories.forEach((step,index)=>{step.memoryNumber=index+1;});
  if(branchMarkdown!==null){
    const branchFaces=new Map(faces);
    branchFaces.set('伊蕾娜:得意',faces.get('伊蕾娜:扶帽·得意'));
    branchFaces.set('艾米尔:平常','emil_neutral');
    branchFaces.set('妮诺:哭泣',faces.get('妮诺:泪目'));
    const branch=parseScript(branchMarkdown,{faces:branchFaces,branch:true});
    const expected=Object.values(BLOCKS).filter(block=>block.optional).flatMap(block=>block.shots);
    for(const id of expected){
      const shot=branch.shots.get(id);
      if(!shot?.steps.length)throw new Error(`支线缺少镜头或台词：${id}`);
      const scene=Number(id.slice(3))<=22?'hall':id==='SH-23'?'gate_dusk':'field_dusk';
      if(shot.scene!==scene)throw new Error(`支线镜头场景不匹配：${id}`);
      shots.set(id,shot);
    }
    for(const id of branch.shots.keys())if(!expected.includes(id))throw new Error(`支线新增镜头尚未编排：${id}`);
    const choices=expected.flatMap(id=>shots.get(id).steps).filter(step=>step.kind==='choice');
    if(choices.length!==1||!shots.get('SH-16').steps.includes(choices[0])||choices[0].options.length!==2||new Set(choices[0].options.map(option=>option.route)).size!==2)throw new Error('支线 SH-16 需要一组送瓶子/安慰妮诺的选择。');
  }
  for (const current of shots.values()) current.steps.forEach((step,index)=>{
    step.shotId=current.id; step.shotTitle=current.title;
    step.sourceFile=planned.has(current.id)?'content/script/ch1.md':'content/script/ch1_branch_b.md';
    step.cursor=`${current.id}:${index}`;
  });
  const proposals=shots.get('SH-11').steps.filter(step=>step.speaker==='伊蕾娜'&&step.text.includes('这不是送她礼物'));
  if(branchMarkdown!==null&&proposals.length!==1)throw new Error('SH-11 需要唯一的伊蕾娜送礼提议，才能定位选择。');
  return { shots, faces, choiceBefore:proposals[0]?.cursor, branchAvailable:branchMarkdown!==null, lineCount:[...shots.values()].reduce((sum,current)=>sum+current.steps.filter(step=>step.kind==='line').length,0) };
}

class ScriptSession {
  constructor(chapter,ids) {
    this.steps=ids.flatMap(id=>chapter.shots.get(id).steps);
    this.index=0; this.ended=false;
  }
  get current() { return this.steps[this.index] ?? null; }
  get currentId() { return this.current?.cursor ?? null; }
  advance() { this.index++; this.ended=this.index>=this.steps.length; return this.current; }
}

export class ChapterFlow {
  constructor(chapter,{inspected=new Set()}={}) { this.chapter=chapter; this.inspected=inspected;this.route='main';this.choiceResolved=false;this.phase='idle';this.session=null;this.block=null; }
  get branchUnlocked(){return this.chapter.branchAvailable&&['painting','kitchen','apron','table'].every(id=>this.inspected.has(id));}
  read(block) { this.block=block; this.phase='reading'; this.session=new ScriptSession(this.chapter,BLOCKS[block].shots); return this.session; }
  start() { return this.read('opening'); }
  advance() {
    if (this.phase!=='reading') return null;
    const current=this.session.advance();
    if(this.block==='lunch'&&current?.cursor===this.chapter.choiceBefore&&this.branchUnlocked&&!this.choiceResolved){
      this.mainContinuation=this.session;
      this.session=new ScriptSession(this.chapter,['SH-16']);
      this.session.steps=this.session.steps.filter(step=>step.kind==='choice');
      this.phase='choice';
      return this.session.current;
    }
    if(current?.kind==='choice')this.phase='choice';
    if (!current) this.phase=BLOCKS[this.block].after;
    return current;
  }
  choose(route){
    if(this.phase!=='choice'||!this.branchUnlocked||!this.session.current.options.some(option=>option.route===route))throw new Error('这个选择尚未解锁或已经结束。');
    this.route=route;this.choiceResolved=true;
    if(route==='main'){
      this.session=this.mainContinuation;this.mainContinuation=null;this.phase='reading';return this.session;
    }
    this.mainContinuation=null;
    this.read('branchB');
    this.session.steps=this.session.steps.filter(step=>step.kind!=='choice');
    return this.session;
  }
  meet() { if(this.phase!=='meet')throw new Error('相遇的时机不正确。'); return this.read('meeting'); }
  sit() { if(this.phase!=='waiting')throw new Error('还没到等候午餐的时机。'); return this.read('lunch'); }
  arrive(scene) {
    const routes={ 'to-hall':['hall','arrival'], 'to-gate':['gate_dusk','farewell'], 'to-dusk':['field_dusk','epilogue'], 'branch-to-gate':['gate_dusk','branchFarewell'], 'branch-to-epilogue':['field_dusk','branchEpilogue'] };
    const route=routes[this.phase];
    if (!route || route[0]!==scene) throw new Error('这个场景不在当前剧情路线中。');
    return this.read(route[1]);
  }
  interactions() {
    return {
      meet:['emil'], 'to-hall':['meadow-hall'],
      waiting:['painting','kitchen','apron','table','wait-lunch'],
      'to-gate':['hall-gate'],
    }[this.phase] ?? [];
  }
  objective() {
    return {
      meet:'走近草原上的少年，听听他想说什么。',
      'to-hall':'沿右上方的小路，前往艾米尔家的餐厅。',
      waiting:'可以四处调查；准备好后，到餐桌下方按 E 坐下。',
      'to-gate':'午后的故事告一段落，前往右下方的出口。',
      'to-dusk':'骑着扫帚，继续这段旅途。',
    }[this.phase] ?? '';
  }
}

// Program-side staging only. No shared dialogue fields or author IDs are changed.
export function shotPresentation(id) {
  return {
    cg:id==='SH-15' ? 'ch1_ending_field_dusk' : null,
    hidePortraits:['SH-01','SH-07','SH-15','SH-20','SH-24'].includes(id),
    hideSprites:['SH-07','SH-15','SH-24'].includes(id),
    rightFace:{'SH-05':'emil_bright','SH-08':'chief_calm','SH-09':'chief_calm','SH-11':'emil_pout','SH-13':'emil_down','SH-14':'nino_empty','SH-16':'emil_down','SH-17':'emil_bright','SH-18':'emil_down','SH-21':'emil_neutral','SH-23':'emil_down'}[id] ?? null,
    hold:id==='SH-14' ? 3000 : 0,
  };
}

export function glassCue(step) {
  if(step.shotId!=='SH-10')return null;
  if(/匡啷/.test(step.text))return 'sound';
  if(/碎了一地|大小不一的碎片/.test(step.text))return 'broken';
  if(/白雾.*轻抚|轻抚.*碎片/.test(step.text))return 'mist';
  if(/碎片聚集回溯/.test(step.text))return 'whole';
  return null;
}

export function impactCue(step) {
  if(step.shotId!=='SH-10')return null;
  if(glassCue(step)==='sound')return 'glass';
  if(step.speaker==='村长' && /^——你在搞什么啊[！!]/.test(step.text))return 'shout';
  return null;
}

export function speakingPortrait(step) {
  // The first startled sound precedes the chief's scolding; tears come later.
  if(step.shotId==='SH-10'&&step.speaker==='妮诺'&&/^呜/.test(step.text))return 'nino_down';
  return step.face;
}

// Event-driven listener reactions persist until a new reaction or their own line.
// These affect the portrait only, never the speaker label or active-side lighting.
export function portraitReaction(step) {
  // First visible line after the six memory cards: stop the earlier confident pose.
  if(step.shotId==='SH-12'&&step.speaker==='艾米尔'&&/^外面的世界/.test(step.text))return {left:'elaina_standing'};
  if(step.shotId!=='SH-10')return null;
  const impact=impactCue(step);
  if(impact==='glass')return {left:'elaina_standing_surprised'};
  if(impact==='shout')return {left:'elaina_standing_serious'};
  if(glassCue(step)==='mist')return {left:'elaina_explaining'};
  return null;
}
