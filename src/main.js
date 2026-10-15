import { DialogueSession } from './dialogue.mjs';
import { AssetLibrary } from './assets.js';
import { createSceneBackgrounds, drawSprite, drawPortrait, drawAmbient } from './art.js';
import { SCENES, ROUTE, START, START_SCENE, canStand, nearestInteraction, readHallObservations } from './world.mjs';

const $ = id => document.getElementById(id);
const ui = Object.fromEntries([
  'game','world','start','title-screen','loading-message','explore-ui','objective','interact',
  'dialogue-layer','speaker','dialogue-text','advance','advance-label','end-screen','return',
  'replay','fullscreen','error-panel','error-message','retry','route-strip','scene-caption',
  'inspection','inspection-title','inspection-text','close-inspection','observation-count',
  'scene-transition','arrival-name',
].map(id => [id,$(id)]));
const ctx = ui.world.getContext('2d');
ctx.imageSmoothingEnabled = false;
const backgrounds = createSceneBackgrounds();
const assets = new AssetLibrary();
const keys = new Set();
const player = { ...START, direction: 'right', moving: false };
const visited = new Set([START_SCENE]);
const inspected = new Set();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = milliseconds => new Promise(resolve => setTimeout(resolve,milliseconds));
let mode = 'title', sceneId = START_SCENE, session = null, observations = new Map();
let lastFrame = 0, typedCount = 0, textStarted = 0, textCharacters = [], completed = false;
let portraitFaces = { left: 'elaina_normal', right: 'emil_proud' };
let activeInteraction = null;

for (const [index,id] of ROUTE.entries()) {
  const stop = document.createElement('span');
  stop.className = 'route-stop'; stop.dataset.scene = id;
  stop.innerHTML = `<i aria-hidden="true">${index+1}</i><span>${SCENES[id].shortName}</span>`;
  ui['route-strip'].append(stop);
}

function setMode(next) {
  mode = next; keys.clear(); player.moving = false;
  ui['title-screen'].hidden = next !== 'title';
  ui['explore-ui'].hidden = next !== 'explore';
  ui['dialogue-layer'].hidden = next !== 'dialogue';
  ui['end-screen'].hidden = next !== 'complete';
  ui.inspection.hidden = next !== 'inspect';
  ui.game.dataset.mode = next;
}

function refreshSceneUI() {
  const scene = SCENES[sceneId];
  ui.game.dataset.scene = sceneId;
  ui.objective.querySelector('span:last-child').textContent = sceneId === 'field_day' && completed
    ? '沿远处的小路前往宅邸，继续探索。' : scene.objective;
  ui['scene-caption'].textContent = scene.caption;
  ui['observation-count'].hidden = sceneId !== 'hall';
  ui['observation-count'].textContent = `见闻 ${inspected.size} / 4`;
  for (const stop of ui['route-strip'].children) {
    const isCurrent = stop.dataset.scene === sceneId;
    stop.classList.toggle('current',isCurrent);
    stop.classList.toggle('visited',visited.has(stop.dataset.scene));
    if (isCurrent) stop.setAttribute('aria-current','step'); else stop.removeAttribute('aria-current');
  }
}

function returnToExploration() {
  setMode('explore'); refreshSceneUI(); ui.game.focus({preventScroll:true});
}

async function travel(exit) {
  if (mode !== 'explore') return;
  setMode('transition');
  ui['arrival-name'].textContent = SCENES[exit.to].name;
  ui['scene-transition'].hidden = false;
  await new Promise(resolve => requestAnimationFrame(resolve));
  ui['scene-transition'].classList.add('covered');
  await wait(reducedMotion ? 0 : 260);
  sceneId = exit.to;
  Object.assign(player,exit.spawn,{ direction: 'down', moving: false });
  visited.add(sceneId); activeInteraction = null; refreshSceneUI();
  await wait(reducedMotion ? 0 : 420);
  ui['scene-transition'].classList.remove('covered');
  await wait(reducedMotion ? 0 : 260);
  ui['scene-transition'].hidden = true; returnToExploration();
}

function displayPortrait(side,face) {
  const container = $(`portrait-${side}`);
  const image = container.querySelector('img'), canvas = container.querySelector('canvas');
  const existing = assets.portrait(face);
  image.hidden = !existing; canvas.hidden = Boolean(existing);
  if (existing) image.src = existing.src;
  else drawPortrait(canvas,face.split('_')[0],face);
  image.alt = `${container.querySelector('.portrait-label').textContent}立绘`;
  container.dataset.face = face;
}

function showLine() {
  const node = session.current;
  if (!node) return;
  const narration = node.speaker === '旁白';
  ui.speaker.hidden = narration; ui.speaker.textContent = narration ? '' : node.speaker;
  if (node.face !== null && !narration) {
    const side = node.face.startsWith('elaina_') ? 'left' : 'right';
    portraitFaces[side] = node.face;
    if (side === 'right') $('portrait-right').querySelector('.portrait-label').textContent = node.speaker;
  }
  for (const side of ['left','right']) {
    displayPortrait(side,portraitFaces[side]);
    const element = $(`portrait-${side}`);
    element.classList.toggle('narrating',narration);
    element.classList.toggle('active',!narration && (side === 'left' ? node.speaker === '伊蕾娜' : node.speaker !== '伊蕾娜'));
  }
  textCharacters = Array.from(node.text); typedCount = 0; textStarted = performance.now();
  ui['dialogue-text'].textContent = '';
  ui['dialogue-layer'].classList.remove('ready'); ui['advance-label'].textContent = '显示全文';
  ui.game.dataset.dialogueId = session.currentId;
}

function openDialogue(restart = false) {
  if (!session) return;
  if (restart || !session.current || session.ended) {
    session.start();
    const nodes = Object.values(session.data);
    const firstLeft = nodes.find(node => node.face?.startsWith('elaina_'));
    const firstRight = nodes.find(node => node.face && !node.face.startsWith('elaina_') && node.speaker !== '旁白');
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

function interact(item = activeInteraction) {
  if (mode !== 'explore' || !item) return;
  if (item.kind === 'exit') { travel(item); return; }
  if (item.kind === 'dialogue') { openDialogue(); return; }
  if (item.kind === 'inspect') {
    ui['inspection-title'].textContent = item.source;
    ui['inspection-text'].textContent = observations.get(item.source);
    inspected.add(item.id); setMode('inspect'); refreshSceneUI(); ui.game.focus({preventScroll:true});
  }
}

function updateInteraction() {
  activeInteraction = nearestInteraction(sceneId,player);
  ui.interact.hidden = !activeInteraction;
  if (!activeInteraction) return;
  ui.interact.querySelector('span').textContent = activeInteraction.label;
  ui.interact.dataset.target = activeInteraction.id;
  // Account for letterboxing in fullscreen and cropping in narrow windows.
  const { width,height } = ui.world.getBoundingClientRect();
  const scale = getComputedStyle(ui.world).objectFit === 'cover' ? Math.max(width/640,height/360) : Math.min(width/640,height/360);
  ui.interact.style.left = `${(width-640*scale)/2 + activeInteraction.x*scale}px`;
  ui.interact.style.top = `${(height-360*scale)/2 + (activeInteraction.y-35)*scale}px`;
}

ui.start.addEventListener('click',returnToExploration);
ui.interact.addEventListener('click',() => interact());
ui.advance.addEventListener('click',advance);
ui.return.addEventListener('click',returnToExploration);
ui.replay.addEventListener('click',() => openDialogue(true));
ui['close-inspection'].addEventListener('click',returnToExploration);
ui.retry.addEventListener('click',() => location.reload());
ui.world.addEventListener('click',event => {
  if (mode !== 'explore' || !activeInteraction) return;
  const bounds = ui.world.getBoundingClientRect();
  const scale = getComputedStyle(ui.world).objectFit === 'cover' ? Math.max(bounds.width/640,bounds.height/360) : Math.min(bounds.width/640,bounds.height/360);
  const x = (event.clientX-bounds.left-(bounds.width-640*scale)/2)/scale;
  const y = (event.clientY-bounds.top-(bounds.height-360*scale)/2)/scale;
  if (Math.hypot(x-activeInteraction.x,y-activeInteraction.y) < 50) interact();
});

async function toggleFullscreen() {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await ui.game.requestFullscreen(); }
  catch { ui.fullscreen.title = '当前浏览器不支持全屏，可按浏览器的 F11。'; }
}
ui.fullscreen.addEventListener('click',toggleFullscreen);
document.addEventListener('fullscreenchange',() => ui.fullscreen.setAttribute('aria-label',document.fullscreenElement ? '退出全屏' : '切换全屏'));

const movementKeys = ['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'];
document.addEventListener('keydown',event => {
  if (event.ctrlKey || event.altKey || event.metaKey || event.isComposing) return;
  if (event.target instanceof HTMLElement && event.target.matches('input,textarea,select,[contenteditable="true"]')) return;
  const key = event.key.toLowerCase();
  const onButton = event.target instanceof HTMLButtonElement;
  if (movementKeys.includes(key)) {
    if (mode !== 'title') event.preventDefault();
    if (mode === 'explore') keys.add(key);
    return;
  }
  if (key === 'f' && !event.repeat) { event.preventDefault(); toggleFullscreen(); return; }
  if (event.repeat) return;
  if (key === 'escape' && ['dialogue','complete','inspect'].includes(mode)) { event.preventDefault(); returnToExploration(); return; }
  if (mode === 'explore' && key === 'e') { event.preventDefault(); interact(); return; }
  if (mode === 'inspect' && [' ','enter','e'].includes(key) && !onButton) { event.preventDefault(); returnToExploration(); return; }
  if (mode === 'dialogue' && [' ','enter','e'].includes(key) && !onButton) { event.preventDefault(); advance(); }
});
document.addEventListener('keyup',event => keys.delete(event.key.toLowerCase()));
window.addEventListener('blur',() => { keys.clear(); player.moving = false; });
document.addEventListener('visibilitychange',() => { keys.clear(); lastFrame = 0; });

function updateMovement(dt) {
  if (mode !== 'explore') return;
  let dx = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
  let dy = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
  const length = Math.hypot(dx,dy); player.moving = length > 0;
  if (length) {
    player.direction = Math.abs(dx)>Math.abs(dy) ? (dx>0 ? 'right' : 'left') : (dy>0 ? 'down' : 'up');
    dx = dx/length*88*dt; dy = dy/length*88*dt;
    if (canStand(sceneId,player.x+dx,player.y)) player.x += dx;
    if (canStand(sceneId,player.x,player.y+dy)) player.y += dy;
  }
  updateInteraction();
  ui.game.dataset.playerX = player.x.toFixed(1); ui.game.dataset.playerY = player.y.toFixed(1);
}

function drawMarkers(time) {
  if (mode !== 'explore') return;
  for (const item of SCENES[sceneId].interactions) {
    const near = activeInteraction?.id === item.id;
    const x = item.x, y = item.y-24+(reducedMotion ? 0 : Math.round(Math.sin(time/650)*1));
    ctx.globalAlpha = near ? 1 : .65;
    if (item.kind === 'dialogue') {
      ctx.fillStyle = '#faf4da'; ctx.fillRect(x-4,y-18,9,10);
      ctx.fillStyle = '#7d865e'; ctx.fillRect(x,y-16,1,4); ctx.fillRect(x,y-11,1,1);
    } else {
      ctx.fillStyle = item.kind==='inspect' && inspected.has(item.id) ? '#b9c49d' : '#f3e7bb';
      ctx.fillRect(x-3,y-1,7,3); ctx.fillRect(x-1,y-3,3,7);
      ctx.fillStyle = '#8b835d'; ctx.fillRect(x,y,1,1);
      if (item.kind==='exit') { ctx.fillStyle='#f3e7bb'; ctx.fillRect(x-4,y+7,9,1); }
    }
    ctx.globalAlpha = 1;
  }
}

function draw(time) {
  const node = mode==='dialogue' ? session?.current : null;
  const visibleScene = node?.bg && SCENES[node.bg] ? node.bg : sceneId;
  const background = node ? assets.backgrounds.get(node.bg) : null;
  if (background) {
    const scale = Math.max(640/background.naturalWidth,360/background.naturalHeight);
    const width = background.naturalWidth*scale, height = background.naturalHeight*scale;
    ctx.drawImage(background,(640-width)/2,(360-height)/2,width,height);
  } else {
    ctx.drawImage(backgrounds.get(visibleScene),0,0);
    const sprites = [...SCENES[visibleScene].npcs];
    if (visibleScene===sceneId) sprites.push({actor:'elaina',...player});
    sprites.sort((a,b)=>a.y-b.y);
    for (const sprite of sprites) drawSprite(ctx,sprite.actor,sprite.x,sprite.y,{moving:sprite.moving,direction:sprite.direction,time});
    drawAmbient(ctx,visibleScene,time,reducedMotion); drawMarkers(time);
  }
  const label = document.querySelector('.location');
  if (label.dataset.location !== visibleScene) {
    label.dataset.location = visibleScene;
    label.textContent = `${SCENES[visibleScene].icon}  ${SCENES[visibleScene].name}`;
  }
}

function frame(time) {
  const dt = lastFrame ? Math.min((time-lastFrame)/1000,.05) : 0;
  lastFrame = time; updateMovement(dt);
  if (mode==='dialogue' && typedCount<textCharacters.length) {
    const count = reducedMotion ? textCharacters.length : Math.min(textCharacters.length,Math.floor((time-textStarted)/32));
    if (count!==typedCount) { typedCount=count; ui['dialogue-text'].textContent=textCharacters.slice(0,count).join(''); }
    if (typedCount===textCharacters.length) { ui['dialogue-layer'].classList.add('ready'); ui['advance-label'].textContent='继续'; }
  }
  draw(time); requestAnimationFrame(frame);
}
refreshSceneUI(); requestAnimationFrame(frame);

async function initialize() {
  try {
    if (location.protocol==='file:') throw new Error('请双击项目里的“开始游戏.cmd”，通过本地服务打开；浏览器不能直接读取文件夹里的剧情数据。');
    const [response,script] = await Promise.all([
      fetch(new URL('../content/dialogue.json',import.meta.url)),
      fetch(new URL('../content/script/ch1.md',import.meta.url)),
    ]);
    if (!response.ok) throw new Error(`剧情文件读取失败（HTTP ${response.status}）。`);
    if (!script.ok) throw new Error(`旅行见闻读取失败（HTTP ${script.status}）。`);
    session = new DialogueSession(await response.json());
    observations = readHallObservations(await script.text());
    await assets.load();
    ui.start.disabled = false; ui.start.innerHTML = '开始旅行 <span aria-hidden="true">→</span>';
    ui['loading-message'].textContent = '四处风景 · 一段关于幸福的故事';
  } catch (error) {
    ui['error-panel'].hidden=false; ui['error-message'].textContent=error.message;
    console.error('游戏启动失败：',error);
  }
}
initialize();
