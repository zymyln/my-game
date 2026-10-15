import { DialogueSession } from './dialogue.mjs';
import { AssetLibrary } from './assets.js';
import { NPC, START, canStand, isNearNPC, createMeadow, drawSprite, drawPortrait, drawInterior } from './art.js';

const $ = id => document.getElementById(id);
const ui = Object.fromEntries(['game','world','start','title-screen','loading-message','explore-ui','objective','interact','dialogue-layer','speaker','dialogue-text','advance','advance-label','end-screen','return','replay','fullscreen','error-panel','error-message','retry'].map(id => [id,$(id)]));
const ctx = ui.world.getContext('2d'); ctx.imageSmoothingEnabled = false;
const meadow = createMeadow();
const assets = new AssetLibrary();
const keys = new Set();
const player = { ...START, direction: 'right', moving: false };
let mode = 'title', session = null, lastFrame = 0, typedCount = 0, textStarted = 0, textCharacters = [];
let completed = false;
let portraitFaces = { left: 'elaina_normal', right: 'emil_proud' };
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function setMode(next) {
  mode = next; keys.clear(); player.moving = false;
  ui['title-screen'].hidden = next !== 'title';
  ui['explore-ui'].hidden = next !== 'explore';
  ui['dialogue-layer'].hidden = next !== 'dialogue';
  ui['end-screen'].hidden = next !== 'complete';
  ui.game.dataset.mode = next;
}

function displayPortrait(side, face) {
  const container = $(`portrait-${side}`), image = container.querySelector('img'), canvas = container.querySelector('canvas');
  const actor = face.split('_')[0];
  const existing = assets.portrait(face);
  image.hidden = !existing; canvas.hidden = Boolean(existing);
  if (existing) image.src = existing.src;
  else drawPortrait(canvas, actor, face);
  image.alt = `${actor === 'elaina' ? '伊蕾娜' : session.current?.speaker || '对话角色'}立绘`;
  container.dataset.face = face;
}

function showLine() {
  const node = session.current;
  if (!node) return;
  const narration = node.speaker === '旁白';
  ui.speaker.hidden = narration; ui.speaker.textContent = narration ? '' : node.speaker;
  if (node.face !== null && !narration) {
    const actor = node.face.split('_')[0];
    const side = actor === 'elaina' ? 'left' : 'right';
    portraitFaces[side] = node.face;
    if(side === 'right') $('portrait-right').querySelector('.portrait-label').textContent = node.speaker;
  }
  for (const side of ['left','right']) {
    displayPortrait(side, portraitFaces[side]);
    const element = $(`portrait-${side}`);
    element.classList.toggle('narrating', narration);
    element.classList.toggle('active', !narration && (side === 'left' ? node.speaker === '伊蕾娜' : node.speaker !== '伊蕾娜'));
  }
  textCharacters = Array.from(node.text); typedCount = 0; textStarted = performance.now();
  ui['dialogue-text'].textContent = '';
  ui['dialogue-layer'].classList.remove('ready');
  ui['advance-label'].textContent = '显示全文';
  ui.game.dataset.dialogueId = session.currentId;
}

function openDialogue(restart = false) {
  if (!session) return;
  if (restart || !session.current || session.ended) {
    session.start();
    const nodes = Object.values(session.data);
    const firstLeft = nodes.find(node=>node.face?.startsWith('elaina_'));
    const firstRight = nodes.find(node=>node.face && !node.face.startsWith('elaina_') && node.speaker !== '旁白');
    portraitFaces = { left: firstLeft?.face || 'elaina_normal', right: firstRight?.face || 'emil_proud' };
    $('portrait-right').querySelector('.portrait-label').textContent = firstRight?.speaker || '艾米尔';
  }
  setMode('dialogue'); showLine(); ui.game.focus({preventScroll:true});
}

function advance() {
  if (mode !== 'dialogue') return;
  if (typedCount < textCharacters.length) {
    typedCount = textCharacters.length; ui['dialogue-text'].textContent = textCharacters.join('');
    ui['dialogue-layer'].classList.add('ready'); ui['advance-label'].textContent = '继续'; return;
  }
  if (session.advance()) showLine();
  else { completed = true; setMode('complete'); ui.return.focus({preventScroll:true}); }
}

function returnToMeadow() {
  setMode('explore');
  ui.objective.querySelector('span:last-child').textContent = completed ? '这一页故事已读完。还可以找艾米尔重温。' : '草原上的少年，似乎有话想说。';
  ui.game.focus({preventScroll:true});
}

ui.start.addEventListener('click', () => { returnToMeadow(); });
ui.interact.addEventListener('click', () => { if (mode === 'explore' && isNearNPC(player)) openDialogue(); });
ui.advance.addEventListener('click', advance);
ui.return.addEventListener('click', returnToMeadow);
ui.replay.addEventListener('click', () => openDialogue(true));
ui.retry.addEventListener('click', () => location.reload());
async function toggleFullscreen() {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await ui.game.requestFullscreen(); }
  catch { ui.fullscreen.title = '当前浏览器不支持全屏，可按浏览器的 F11。'; }
}
ui.fullscreen.addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', () => { ui.fullscreen.setAttribute('aria-label',document.fullscreenElement ? '退出全屏' : '切换全屏'); });

const movementKeys = ['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'];
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.altKey || event.metaKey || event.isComposing) return;
  if (event.target instanceof HTMLElement && event.target.matches('input,textarea,select,[contenteditable="true"]')) return;
  const key = event.key.toLowerCase();
  const onButton = event.target instanceof HTMLButtonElement;
  if (movementKeys.includes(key)) { if(mode !== 'title') event.preventDefault(); if(mode === 'explore') keys.add(key); return; }
  if (key === 'f' && !event.repeat) {event.preventDefault();toggleFullscreen();return;}
  if (event.repeat) return;
  if (key === 'escape' && ['dialogue','complete'].includes(mode)) {event.preventDefault();returnToMeadow();return;}
  if (mode === 'explore' && key === 'e') {event.preventDefault();if(isNearNPC(player))openDialogue();return;}
  if (mode === 'dialogue' && [' ','enter','e'].includes(key) && !onButton) {event.preventDefault();advance();}
});
document.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
window.addEventListener('blur',()=>{keys.clear();player.moving=false;});
document.addEventListener('visibilitychange',()=>{keys.clear();lastFrame=0;});

function updateMovement(dt) {
  if (mode !== 'explore') return;
  let dx = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
  let dy = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
  const length = Math.hypot(dx,dy); player.moving = length > 0;
  if (length) {
    if (Math.abs(dx)>Math.abs(dy))player.direction=dx>0?'right':'left';else player.direction=dy>0?'down':'up';
    dx = dx / length * 77 * dt; dy = dy / length * 77 * dt;
    if(canStand(player.x+dx,player.y))player.x+=dx;
    if(canStand(player.x,player.y+dy))player.y+=dy;
  }
  ui.interact.hidden = !isNearNPC(player);
}

function draw(time) {
  const node = mode === 'dialogue' ? session?.current : null;
  const background = node ? assets.backgrounds.get(node.bg) : null;
  if(background) {
    const scale = Math.max(640/background.naturalWidth,360/background.naturalHeight);
    const width = background.naturalWidth*scale,height=background.naturalHeight*scale;
    ctx.drawImage(background,(640-width)/2,(360-height)/2,width,height);
  } else if(node?.bg === 'hall') drawInterior(ctx);
  else {
    ctx.drawImage(meadow,0,0);
    if(node?.bg?.includes('dusk')){ctx.fillStyle='#b57a7460';ctx.fillRect(0,0,640,360);}
    const sprites = [{actor:'elaina',...player},{actor:'emil',...NPC}].sort((a,b)=>a.y-b.y);
    for(const sprite of sprites)drawSprite(ctx,sprite.actor,sprite.x,sprite.y,{moving:sprite.moving,direction:sprite.direction,time});
    if(mode === 'explore' && !isNearNPC(player)) {
      const offset = reducedMotion ? 0 : Math.round(Math.sin(time/550)*2);
      ctx.fillStyle='#faf4da';ctx.fillRect(NPC.x-4,NPC.y-47+offset,9,10);ctx.fillStyle='#7d865e';ctx.fillRect(NPC.x,NPC.y-45+offset,1,4);ctx.fillRect(NPC.x,NPC.y-40+offset,1,1);
    }
    // Two subtle glimmers hint at the bottle, without adding an unapproved story event.
    if(!reducedMotion && Math.floor(time/800)%2===0) {ctx.fillStyle='#f9f1cb';ctx.fillRect(NPC.x+10,NPC.y-16,1,3);ctx.fillRect(NPC.x+9,NPC.y-15,3,1);}
  }
  const label = document.querySelector('.location');
  const locations = {field_day:'☀  草原 · 白昼',hall:'⌂  宅邸 · 餐厅',gate_dusk:'☾  村口 · 黄昏',field_dusk:'☾  草原 · 黄昏'};
  const locationKey = node?.bg || 'field_day';
  if(label.dataset.location !== locationKey){label.dataset.location=locationKey;label.textContent=locations[locationKey] || '旅途之中';}
}

function frame(time) {
  const dt = lastFrame ? Math.min((time-lastFrame)/1000,.05) : 0; lastFrame=time;
  updateMovement(dt);
  if(mode === 'dialogue' && typedCount<textCharacters.length) {
    const count = reducedMotion ? textCharacters.length : Math.min(textCharacters.length, Math.floor((time-textStarted)/32));
    if(count !== typedCount){typedCount=count;ui['dialogue-text'].textContent=textCharacters.slice(0,count).join('');}
    if(typedCount===textCharacters.length){ui['dialogue-layer'].classList.add('ready');ui['advance-label'].textContent='继续';}
  }
  draw(time);requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

async function initialize() {
  try {
    if(location.protocol === 'file:')throw new Error('请双击项目里的“开始游戏.cmd”，通过本地服务打开；浏览器不能直接读取文件夹里的剧情数据。');
    const response = await fetch(new URL('../content/dialogue.json',import.meta.url));
    if(!response.ok)throw new Error(`剧情文件读取失败（HTTP ${response.status}）。`);
    session = new DialogueSession(await response.json());
    await assets.load();
    ui.start.disabled=false;ui.start.innerHTML='开始旅行 <span aria-hidden="true">→</span>';
    ui['loading-message'].textContent='键盘探索 · 一段关于幸福的故事';
  } catch(error) {
    ui['error-panel'].hidden=false;ui['error-message'].textContent=error.message;
    console.error('游戏启动失败：',error);
  }
}
initialize();
