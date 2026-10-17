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
};
const ACTORS = { '伊蕾娜':'elaina', '艾米尔':'emil', '妮诺':'nino', '村长':'chief' };
export const ACTOR_NAMES = Object.fromEntries(Object.entries(ACTORS).map(([name,id])=>[id,name]));

export function readChapter(markdown) {
  const shots = new Map(), faces = new Map();
  let scene = null, shot = null;
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
      shots.set(shot.id,shot); continue;
    }
    if (!shot || !line || line==='---' || line.startsWith('【')) continue;
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
  for (const block of Object.values(BLOCKS)) for (const id of block.shots) {
    if (!shots.get(id)?.steps.length) throw new Error(`剧本缺少镜头或台词：${id}`);
  }
  const planned=new Set(Object.values(BLOCKS).flatMap(block=>block.shots));
  for(const id of shots.keys())if(!planned.has(id))throw new Error(`新增镜头尚未编排进剧情流程：${id}`);
  const memories = shots.get('SH-12').steps.filter(step=>step.kind==='memory');
  if (memories.length!==6) throw new Error('赠瓶镜头需要六条光粒子文字。');
  memories.forEach((step,index)=>{step.memoryNumber=index+1;});
  for (const current of shots.values()) current.steps.forEach((step,index)=>{
    step.shotId=current.id; step.shotTitle=current.title;
    step.cursor=`${current.id}:${index}`;
  });
  return { shots, faces, lineCount:[...shots.values()].reduce((sum,current)=>sum+current.steps.filter(step=>step.kind==='line').length,0) };
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
  constructor(chapter) { this.chapter=chapter; this.phase='idle'; this.session=null; this.block=null; }
  read(block) { this.block=block; this.phase='reading'; this.session=new ScriptSession(this.chapter,BLOCKS[block].shots); return this.session; }
  start() { return this.read('opening'); }
  advance() {
    if (this.phase!=='reading') return null;
    const current=this.session.advance();
    if (!current) this.phase=BLOCKS[this.block].after;
    return current;
  }
  meet() { if(this.phase!=='meet')throw new Error('相遇的时机不正确。'); return this.read('meeting'); }
  sit() { if(this.phase!=='waiting')throw new Error('还没到等候午餐的时机。'); return this.read('lunch'); }
  arrive(scene) {
    const routes={ 'to-hall':['hall','arrival'], 'to-gate':['gate_dusk','farewell'], 'to-dusk':['field_dusk','epilogue'] };
    const route=routes[this.phase];
    if (!route || route[0]!==scene) throw new Error('这个场景不在当前剧情路线中。');
    return this.read(route[1]);
  }
  interactions() {
    return {
      meet:['emil'], 'to-hall':['meadow-hall'],
      waiting:['painting','kitchen','apron','table','wait-lunch'],
      'to-gate':['hall-gate'], 'to-dusk':['gate-dusk'],
    }[this.phase] ?? [];
  }
  objective() {
    return {
      meet:'走近草原上的少年，听听他想说什么。',
      'to-hall':'沿右上方的小路，前往艾米尔家的餐厅。',
      waiting:'可以四处调查；准备好后，到餐桌下方按 E 坐下。',
      'to-gate':'午后的故事告一段落，前往右下方的出口。',
      'to-dusk':'穿过两棵树之间的小路，走向黄昏草原。',
    }[this.phase] ?? '';
  }
}

// Program-side staging only. No shared dialogue fields or author IDs are changed.
export function shotPresentation(id) {
  return {
    hidePortraits:['SH-01','SH-07','SH-15'].includes(id),
    hideSprites:['SH-07','SH-15'].includes(id),
    rightFace:{'SH-05':'emil_bright','SH-08':'chief_calm','SH-09':'chief_calm','SH-11':'emil_pout','SH-13':'emil_down','SH-14':'nino_empty'}[id] ?? null,
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

// Event-driven listener reactions persist until a new reaction or their own line.
// These affect the portrait only, never the speaker label or active-side lighting.
export function portraitReaction(step) {
  if(step.shotId!=='SH-10')return null;
  const impact=impactCue(step);
  if(impact==='glass')return {left:'elaina_standing_surprised'};
  if(impact==='shout')return {left:'elaina_standing'};
  if(glassCue(step)==='mist')return {left:'elaina_explaining'};
  return null;
}
