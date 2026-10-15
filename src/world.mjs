// Scene geometry belongs to the program. Story text remains in content/.
export const START_SCENE = 'field_day';
export const START = Object.freeze({ x: 281, y: 245 });
export const NPC = Object.freeze({ x: 378, y: 202 });
const meadowTrees = [[41,185],[82,167],[17,264],[54,333],[590,189],[625,241],[591,322],[548,344]];
const meadowObstacles = [
  { x: 79, y: 238, w: 84, h: 27 },
  ...meadowTrees.map(([x,y]) => ({ x: x-8, y: y-10, w: 16, h: 16 })),
];

export const SCENES = {
  field_day: {
    name: '草原 · 白昼', icon: '☀', shortName: '草原',
    objective: '与草原上的少年交谈，或沿小路前往宅邸。',
    caption: '草木随风摇曳，远处是一座小村庄。',
    bounds: { left: 26, right: 614, top: 151, bottom: 338 },
    obstacles: meadowObstacles,
    npcs: [{ actor: 'emil', ...NPC }],
    interactions: [
      { id: 'emil', kind: 'dialogue', label: '与艾米尔交谈', x: NPC.x, y: NPC.y, radius: 43 },
      { id: 'meadow-hall', kind: 'exit', label: '沿小路前往宅邸', x: 486, y: 169, radius: 29, to: 'hall', spawn: { x: 113, y: 290 } },
    ],
  },
  hall: {
    name: '宅邸 · 餐厅', icon: '⌂', shortName: '餐厅',
    objective: '在餐厅走走。靠近物品按 E，可以查看见闻。',
    caption: '左侧出口通往草原，右侧出口通往黄昏的村口。',
    bounds: { left: 42, right: 598, top: 129, bottom: 334 },
    obstacles: [
      { x: 246, y: 187, w: 168, h: 66 },
      { x: 266, y: 163, w: 24, h: 24 }, { x: 363, y: 163, w: 24, h: 24 },
      { x: 266, y: 259, w: 24, h: 22 }, { x: 363, y: 259, w: 24, h: 22 },
      { x: 48, y: 179, w: 76, h: 65 },
      { x: 62, y: 143, w: 27, h: 23 }, { x: 555, y: 202, w: 28, h: 27 },
    ],
    npcs: [],
    interactions: [
      { id: 'painting', kind: 'inspect', label: '看看墙上的画', source: '墙上的画', x: 171, y: 139, radius: 36 },
      { id: 'kitchen', kind: 'inspect', label: '看看厨房门口', source: '厨房门口', x: 551, y: 140, radius: 35 },
      { id: 'apron', kind: 'inspect', label: '看看挂着的围裙', source: '挂在门边的围裙', x: 477, y: 140, radius: 31 },
      { id: 'table', kind: 'inspect', label: '看看餐桌', source: '餐桌', x: 330, y: 278, radius: 35 },
      { id: 'hall-meadow', kind: 'exit', label: '返回白昼的草原', x: 86, y: 326, radius: 27, to: 'field_day', spawn: { x: 469, y: 200 } },
      { id: 'hall-gate', kind: 'exit', label: '前往村口', x: 551, y: 326, radius: 27, to: 'gate_dusk', spawn: { x: 320, y: 204 } },
    ],
  },
  gate_dusk: {
    name: '村口 · 黄昏', icon: '☾', shortName: '村口',
    objective: '穿过两棵树之间的小路，继续走向暮色。',
    caption: '身后是村庄，前方的草原已经染上夕色。',
    bounds: { left: 36, right: 604, top: 174, bottom: 338 },
    obstacles: [
      { x: 20, y: 237, w: 212, h: 12 }, { x: 410, y: 237, w: 210, h: 12 },
      { x: 163, y: 247, w: 25, h: 22 }, { x: 441, y: 247, w: 25, h: 22 },
    ],
    npcs: [],
    interactions: [
      { id: 'gate-hall', kind: 'exit', label: '返回宅邸餐厅', x: 320, y: 179, radius: 27, to: 'hall', spawn: { x: 539, y: 290 } },
      { id: 'gate-dusk', kind: 'exit', label: '走向黄昏的草原', x: 320, y: 330, radius: 28, to: 'field_dusk', spawn: { x: 469, y: 201 } },
    ],
  },
  field_dusk: {
    name: '草原 · 黄昏', icon: '☾', shortName: '暮色',
    objective: '在暮色里走走，或沿小路返回村口。',
    caption: '风还在吹，草原上已亮起点点微光。',
    bounds: { left: 26, right: 614, top: 151, bottom: 338 },
    obstacles: meadowObstacles,
    npcs: [],
    interactions: [
      { id: 'dusk-gate', kind: 'exit', label: '沿小路返回村口', x: 486, y: 169, radius: 29, to: 'gate_dusk', spawn: { x: 320, y: 299 } },
    ],
  },
};

export const ROUTE = ['field_day', 'hall', 'gate_dusk', 'field_dusk'];

export function canStand(sceneId, x, y) {
  const scene = SCENES[sceneId];
  if (!scene || !Number.isFinite(x) || !Number.isFinite(y)) return false;
  const { left, right, top, bottom } = scene.bounds;
  if (x < left || x > right || y < top || y > bottom) return false;
  if (scene.obstacles.some(b => x+6 > b.x && x-6 < b.x+b.w && y > b.y && y-5 < b.y+b.h)) return false;
  return scene.npcs.every(npc => Math.hypot(x-npc.x,y-npc.y) > 14);
}

export function nearestInteraction(sceneId, player) {
  return SCENES[sceneId].interactions
    .map(item => ({ item, distance: Math.hypot(player.x-item.x,player.y-item.y) }))
    .filter(({item,distance}) => distance <= item.radius)
    .sort((a,b) => a.distance-b.distance)[0]?.item ?? null;
}

// Read only the four already-approved restaurant observations, not the appendix.
export function readHallObservations(markdown) {
  const start = markdown.indexOf('【可点击调查｜餐厅内');
  if (start < 0) throw new Error('剧本中找不到餐厅调查段落。');
  const tail = markdown.slice(start);
  const nextHeading = tail.search(/^###\s/m);
  const block = nextHeading < 0 ? tail : tail.slice(0,nextHeading);
  const observations = new Map([...block.matchAll(/^-\s+(.+?)：旁白：(.+)\r?$/gm)]
    .map(([,name,text]) => [name.trim(),text.trim()]));
  for (const item of SCENES.hall.interactions.filter(item=>item.kind==='inspect')) {
    if (!observations.has(item.source)) throw new Error(`剧本中找不到调查原文：${item.source}`);
  }
  return observations;
}
