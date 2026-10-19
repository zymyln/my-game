import { FastForward } from './fast-forward.mjs';
import { CGTransition } from './cg-transition.mjs';
import { AssetLibrary } from './assets.js';
import { createSceneBackgrounds, drawSprite, drawPortrait, drawAmbient } from './art.js';
import { SCENES, ROUTE, START, START_SCENE, canStand, nearestInteraction, readHallObservations } from './world.mjs';
import { readChapter, ChapterFlow, shotPresentation, glassCue, impactCue, portraitReaction, speakingPortrait, ACTOR_NAMES } from './chapter.mjs';
import { SoundEffects } from './sound.js';
import { MagicPlayer } from './magic.mjs';
import { drawMagicEffect } from './magic-art.js';
import { StagePlayer, moodForShot, drawAtmosphere } from './staging.mjs';
import { audioProfile, branchSoundCue } from './score.mjs';
import { setupAudioPanel } from './audio-panel.js';
import { FlightPlayer } from './flight.mjs';
import { MemoryPlayer } from './memory.mjs';
import { BranchStagePlayer, branchCast } from './branch-staging.mjs';
import { drawElainaFlight } from './elaina-sprite.js';

const $ = id => document.getElementById(id);
const ui = Object.fromEntries([
  'game','world','start','title-screen','loading-message','explore-ui','objective','interact',
  'dialogue-layer','speaker','dialogue-text','advance','advance-label','end-screen','return',
  'replay','fullscreen','error-panel','error-message','retry','route-strip','scene-caption',
  'inspection','inspection-title','inspection-text','inspection-image','close-inspection','observation-count',
  'scene-transition','arrival-name','pause-toggle','pause-screen','resume','back-title',
  'memory-layer','memory-image','memory-text','memory-count','memory-next','memory-picture','memory-release-label','story-prop','glass-prop','sound-toggle',
  'end-kicker','end-title','end-description','passage-label','memory-bottle','scene-atmosphere','story-cg',
  'choice-layer','choice-options',
].map(id => [id,$(id)]));
const ctx = ui.world.getContext('2d');
ctx.imageSmoothingEnabled = false;
const backgrounds = createSceneBackgrounds();
const assets = new AssetLibrary();
const sound = new SoundEffects();
const keys = new Set();
const player = { ...START, direction: 'right', moving: false };
const visited = new Set([START_SCENE]);
const inspected = new Set();
const fast=new FastForward();
const fastButton=document.createElement('button');fastButton.type='button';fastButton.className='fast-forward-control';fastButton.id='fast-forward';fastButton.title='点击切换快进，或按住 Ctrl 临时快进；在选项处停止';fastButton.hidden=true;ui.game.append(fastButton);
fastButton.addEventListener('click',()=>{fast.toggle(mode);ui.game.focus({preventScroll:true});});
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = milliseconds => new Promise(resolve => setTimeout(resolve,milliseconds));
let mode = 'title', sceneId = START_SCENE, session = null, observations = new Map();
let lastFrame = 0, typedCount = 0, textStarted = 0, textCharacters = [];
let portraitFaces = { left: 'elaina_standing', right: 'emil_bright' };
let activeInteraction = null;
let chapter=null,flow=null,lastShot=null;
let advanceReadyAt=0,pausedAt=0,pausedMode=null,glassState=null,propKind=null,effectLocked=false;
const magic=new MagicPlayer({reducedMotion});
const stage=new StagePlayer({reducedMotion});
const flight=new FlightPlayer({reducedMotion});
const memory=new MemoryPlayer({reducedMotion});
const branchStage=new BranchStagePlayer({reducedMotion});
const cgTransition=new CGTransition({reducedMotion});
const curtain=document.createElement('div');curtain.className='cg-curtain';curtain.hidden=true;curtain.setAttribute('aria-hidden','true');ui.game.append(curtain);
function resetCurtain(){cgTransition.reset();curtain.hidden=true;curtain.style.opacity='0';}
let branchContinuation=null;
let flightContinuation=null;
let worldTime=0;
let lastBranchCue=null;
const syncSound=()=>{ui['sound-toggle'].textContent=sound.unavailable?'声音不可用':sound.enabled?'声音：开':'声音：关';ui['sound-toggle'].disabled=Boolean(sound.unavailable);ui['sound-toggle'].setAttribute('aria-pressed',String(sound.enabled&&!sound.unavailable));};
let panelPausedGame=false;
const audioPanel=setupAudioPanel({sound,onChange:syncSound,onOpen:()=>{panelPausedGame=!['title','pause','complete'].includes(mode);if(panelPausedGame)pauseJourney();},onClose:()=>{if(panelPausedGame)resumeJourney();panelPausedGame=false;}});
syncSound();
const lunchSeat={id:'wait-lunch',kind:'story',label:'坐下，等待午餐',x:330,y:304,radius:22};

function availableInteractions() {
  const allowed=flow?.interactions() ?? [];
  return [...SCENES[sceneId].interactions,lunchSeat].filter(item=>allowed.includes(item.id));
}

for (const [index,id] of ROUTE.entries()) {
  const stop = document.createElement('span');
  stop.className = 'route-stop'; stop.dataset.scene = id;
  stop.innerHTML = `<i aria-hidden="true">${index+1}</i><span>${SCENES[id].shortName}</span>`;
  ui['route-strip'].append(stop);
}

function setMode(next) {
  fast.enter(next);
  mode = next; keys.clear(); player.moving = false;
  ui['title-screen'].hidden = next !== 'title';
  ui['explore-ui'].hidden = next !== 'explore';
  ui['dialogue-layer'].hidden = next !== 'dialogue';
  ui['end-screen'].hidden = next !== 'complete';
  ui.inspection.hidden = next !== 'inspect';
  ui['memory-layer'].hidden = next !== 'memory';
  ui['pause-screen'].hidden = next !== 'pause';
  ui['choice-layer'].hidden = next !== 'choice';
  ui['pause-toggle'].hidden = ['title','complete','transition','pause'].includes(next);
  ui['story-prop'].hidden = !(propKind && next==='dialogue');
  ui.game.dataset.mode = next;
  ui.game.dataset.playMode='story';
  ui.game.dataset.storyPhase=flow?.phase ?? 'idle';
  ui.game.dataset.route=flow?.route??'main';
  refreshStoryCG();
}

function refreshStoryCG() {
  const reading=mode==='dialogue'||(mode==='pause'&&pausedMode==='dialogue');
  const name=reading ? shotPresentation(session?.current?.shotId,session?.current).cg : null;
  const image=assets.cg.get(name);
  ui['story-cg'].hidden=!image;
  ui.game.dataset.cg=image ? name : '';
  if(image) {
    if(ui['story-cg'].src!==image.src)ui['story-cg'].src=image.src;
  } else ui['story-cg'].removeAttribute('src');
}

function refreshMemoryUI() {
  const opacity=memory.opacity;
  ui['memory-layer'].dataset.phase=memory.phase;
  ui['memory-layer'].style.setProperty('--memory-opacity',opacity.toFixed(4));
  ui['memory-layer'].style.setProperty('--memory-label-opacity',Math.max(0,1-opacity*4).toFixed(4));
  ui['memory-picture'].setAttribute('aria-hidden',String(opacity===0));
  ui['memory-next'].disabled=!memory.ready;
  ui['memory-next'].textContent=memory.ready?'点击画面继续 · Space':'静静看着…';
  ui['memory-release-label'].textContent=memory.phase==='fade-out'?'让这份幸福，轻轻远去…':'一缕幸福，正从瓶中飞出…';
}

function refreshSceneUI() {
  const scene = SCENES[sceneId];
  ui.game.dataset.scene = sceneId;
  ui.objective.querySelector('span:last-child').textContent = scene.objective;
  ui['scene-caption'].textContent = scene.caption;
  if(flow) {
    ui.objective.querySelector('span:last-child').textContent=flow.objective();
    ui['scene-caption'].textContent=flow.phase==='waiting' ? '调查完全可选；准备好后，到餐桌下方坐下。' : '跟随亮起的标记，继续这段旅途。';
  }
  ui['route-strip'].querySelector('.route-heading').textContent='第一章';
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
  stage.reset();
  setMode('explore'); refreshSceneUI(); ui.game.focus({preventScroll:true});
}

async function travel(exit,{automatic=false}={}) {
  if (mode !== 'explore'&&!automatic) return;
  sound.play('door');
  setMode('transition');
  ui['arrival-name'].textContent = SCENES[exit.to].name;
  ui['scene-transition'].hidden = false;
  await new Promise(resolve => requestAnimationFrame(resolve));
  ui['scene-transition'].classList.add('covered');
  await wait(reducedMotion ? 0 : 260);
  sceneId = exit.to;
  Object.assign(player,exit.spawn,{ direction: 'down', moving: false });
  visited.add(sceneId); activeInteraction = null; refreshSceneUI();
  const continueStory=()=>{session=flow.arrive(sceneId);showLine();ui.game.focus({preventScroll:true});};
  const departing=flow.route==='main'&&sceneId==='field_dusk'&&assets.sprites.has('elaina_flying_front');
  if(departing){
    flight.start('departure',player);flightContinuation=continueStory;
    stage.select('afterglow');
  }
  await wait(reducedMotion ? 0 : 420);
  ui['scene-transition'].classList.remove('covered');
  await wait(reducedMotion ? 0 : 260);
  ui['scene-transition'].hidden = true;
  if(departing){setMode('flight');ui.game.focus({preventScroll:true});}
  else continueStory();
}

function leaveVillage() {
  const exit={...SCENES.gate_dusk.interactions.find(item=>item.id==='gate-dusk'),spawn:{x:320,y:170}};
  const continueDeparture=()=>travel(exit,{automatic:true});
  if(assets.sprites.has('elaina_flying_front')){
    flight.start('farewell',player);flightContinuation=continueDeparture;
    stage.select('afterglow');setMode('flight');ui.game.focus({preventScroll:true});
  } else continueDeparture();
}

function resetJourney() {
  fast.reset();
  lastBranchCue=null;if(sound.context)sound.stopCues();
  sceneId=START_SCENE;Object.assign(player,START,{direction:'right',moving:false});
  visited.clear();visited.add(START_SCENE);inspected.clear();
  lastShot=null;glassState=null;propKind=null;effectLocked=false;advanceReadyAt=0;activeInteraction=null;
  ui.game.classList.remove('impact');
  stage.reset();resetCurtain();
  flight.reset();flightContinuation=null;
  branchStage.reset();branchContinuation=null;
  memory.reset();refreshMemoryUI();
  portraitFaces={left:chapter.faces.get('伊蕾娜:站立·平常') ?? 'elaina_standing',right:'emil_bright'};
  ui['dialogue-layer'].classList.remove('no-portraits');
  $('portrait-right').querySelector('.portrait-label').textContent='艾米尔';
  refreshSceneUI();
}

function startStory() {
  sound.activate().then(syncSound).catch(()=>{});
  resetJourney();flow=new ChapterFlow(chapter,{inspected});session=flow.start();
  if(assets.sprites.has('elaina_flying_front'))flight.start('arrival',START);
  showLine();ui.game.focus({preventScroll:true});
}

function pauseJourney() {
  if(['title','complete','transition','pause'].includes(mode))return;
  pausedMode=mode;pausedAt=performance.now();setMode('pause');ui.resume.focus({preventScroll:true});
}
function resumeJourney() {
  if(mode!=='pause')return;
  const elapsed=performance.now()-pausedAt;
  advanceReadyAt+=elapsed;textStarted+=elapsed;lastFrame=0;
  setMode(pausedMode);ui.game.focus({preventScroll:true});
}
function backToTitle() {resetCurtain();if(sound.context)sound.stopCues();glassState=null;propKind=null;effectLocked=false;stage.reset();flight.reset();flightContinuation=null;branchStage.reset();branchContinuation=null;memory.reset();refreshMemoryUI();ui.game.classList.remove('impact');setMode('title');ui.start.focus({preventScroll:true});}

function playImpact(cue) {
  if(!cue || reducedMotion)return;
  ui.game.classList.remove('impact');
  void ui.game.offsetWidth;
  ui.game.dataset.impact=cue;
  ui.game.classList.add('impact');
}
ui.game.addEventListener('animationend',event=>{
  if(event.target===ui.game && event.animationName==='scene-impact')ui.game.classList.remove('impact');
});

function displayPortrait(side,face) {
  const container = $(`portrait-${side}`);
  const image = container.querySelector('img'), canvas = container.querySelector('canvas');
  const existing = assets.portrait(face);
  const actorChanged=container.dataset.face?.split('_')[0]!==face.split('_')[0];
  image.hidden = !existing; canvas.hidden = Boolean(existing);
  container.classList.toggle('illustrated',Boolean(existing));
  if (existing) image.src = existing.src;
  else drawPortrait(canvas,face.split('_')[0],face);
  image.alt = `${container.querySelector('.portrait-label').textContent}立绘`;
  container.dataset.face = face;
  container.dataset.actor = face.split('_')[0];
  if(actorChanged&&!reducedMotion){container.classList.remove('arriving');void container.offsetWidth;container.classList.add('arriving');}
}

function showLine(transitioned=false) {
  const node = session.current;
  if (!node) return;
  const nextCG=shotPresentation(node.shotId,node).cg;
  if(!transitioned&&flow.route==='branchB'&&nextCG&&assets.cg.has(nextCG)&&ui.game.dataset.cg!==nextCG){
    cgTransition.start(()=>showLine(true));return;
  }
  ui.game.dataset.scriptSource=node.sourceFile;
  branchStage.select(node);
  if(node.kind==='choice'){
    ui['choice-options'].replaceChildren(...node.options.map((option,index)=>{
      const button=document.createElement('button');button.type='button';button.className='choice-option';button.dataset.route=option.route;
      button.tabIndex=-1;
      const number=document.createElement('span');number.textContent=String(index+1);
      const label=document.createElement('span');label.textContent=option.label;button.append(number,label);
      button.addEventListener('click',event=>{if(mode!=='choice'||event.button!==0||event.detail===0||event.pointerType!=='mouse')return;session=flow.choose(option.route);showLine();ui.game.focus({preventScroll:true});});
      return button;
    }));
    ui.game.dataset.shot=node.shotId;ui.game.dataset.stepKind=node.kind;ui.game.dataset.dialogueId=session.currentId;
    setMode('choice');ui.game.focus({preventScroll:true});return;
  }
  const changed=node.shotId!==lastShot,staging=shotPresentation(node.shotId,node);
  if(changed) {
    lastShot=node.shotId;glassState=null;propKind=null;effectLocked=false;
    stage.select(moodForShot(node.shotId));
    if(['SH-04','SH-12'].includes(node.shotId)){propKind='bottle';magic.select('bottle');}
    if(node.shotId==='SH-10'){propKind='cup';glassState='whole';magic.select('cup');}
    advanceReadyAt=performance.now()+staging.hold;
    if(staging.rightFace)portraitFaces.right=staging.rightFace;
  }
  ui['dialogue-layer'].classList.toggle('no-portraits',staging.hidePortraits);
  ui['passage-label'].textContent=node.shotTitle;
  ui.game.dataset.shot=node.shotId;ui.game.dataset.stepKind=node.kind;
  ui.game.dataset.storyPhase=flow.phase;
  const cue=glassCue(node);
  playImpact(impactCue(node));
  if(impactCue(node)==='shout')sound.play('impact');
  if(impactCue(node))stage.select('pressure');
  if(cue==='sound'||cue==='broken') {
    glassState='broken';
    if(magic.trigger('shatter')){sound.play('glass');effectLocked=true;}
  } else if(cue==='mist') {
    stage.select('calm');
    glassState='mist';
    if(magic.trigger('restore')){sound.play('restore');effectLocked=true;}
  } else if(cue==='whole')glassState='whole';
  ui['story-prop'].dataset.state=glassState ?? '';
  if(node.shotId==='SH-12'&&/^妮诺她/.test(node.text))portraitFaces.right='nino_teary';
  if(node.kind==='memory') {
    const image=assets.memories.get(`memory_${node.memoryNumber}`);
    ui['memory-image'].hidden=!image;
    ui['memory-layer'].classList.toggle('illustrated',Boolean(image));
    if(image)ui['memory-image'].src=image.src;
    else ui['memory-image'].removeAttribute('src');
    memory.start(node.memoryNumber);refreshMemoryUI();
    setMode('memory');ui['memory-text'].textContent=node.text;ui['memory-count'].textContent=`${node.memoryNumber} / 6`;
    advanceReadyAt=0;
    ui.game.dataset.dialogueId=session.currentId;
    if(node.memoryNumber===1)sound.play('bottle');
    else if(node.memoryNumber>1)sound.play('sparkle');
    return;
  }
  if(memory.number){memory.reset();refreshMemoryUI();}
  setMode('dialogue');
  if(node.cursor!==lastBranchCue){lastBranchCue=node.cursor;const cue=branchSoundCue(node);if(cue)sound.play(cue);}
  $('portrait-right').querySelector('.portrait-label').textContent=ACTOR_NAMES[portraitFaces.right.split('_')[0]] || '艾米尔';
  const narration = node.speaker === '旁白';
  ui.speaker.hidden = narration; ui.speaker.textContent = narration ? '' : node.speaker;
  const face=speakingPortrait(node);
  if (face !== null && (!narration || node.thought)) {
    const side = face.startsWith('elaina_') ? 'left' : 'right';
    portraitFaces[side] = face;
    if (side === 'right') $('portrait-right').querySelector('.portrait-label').textContent = node.speaker;
  }
  Object.assign(portraitFaces,portraitReaction(node));
  for (const side of ['left','right']) {
    displayPortrait(side,portraitFaces[side]);
    const element = $(`portrait-${side}`);
    element.classList.toggle('narrating',narration);
    element.classList.toggle('active',!narration && (side === 'left' ? node.speaker === '伊蕾娜' : node.speaker !== '伊蕾娜'));
  }
  textCharacters = Array.from(node.text); typedCount = 0; textStarted = performance.now();
  ui['dialogue-text'].textContent = '';
  ui['dialogue-layer'].classList.remove('ready'); ui['advance-label'].textContent = '显示全文';
  ui.advance.disabled=performance.now()<advanceReadyAt||flight.busy||branchStage.kind==='reflection';
  ui.game.dataset.dialogueId = session.currentId;
}

function advance() {
  if (!['dialogue','memory'].includes(mode)||cgTransition.busy) return;
  if(mode==='dialogue'&&branchStage.kind==='reflection')return;
  if(mode==='memory'){memory.next();refreshMemoryUI();return;}
  if (mode==='dialogue' && typedCount < textCharacters.length) {
    typedCount = textCharacters.length; ui['dialogue-text'].textContent = textCharacters.join('');
    ui['dialogue-layer'].classList.add('ready'); ui['advance-label'].textContent = '继续'; return;
  }
  if(performance.now()<advanceReadyAt||(effectLocked&&magic.busy)||flight.busy)return;
  advanceStory();
}

function advanceStory() {
  const next=flow.advance();session=flow.session;
  if(next)showLine();
  else if(flow.phase==='complete')showEnding();
  else if(flow.phase==='to-dusk')leaveVillage();
  else if(flow.phase==='branch-to-gate')travel(SCENES.hall.interactions.find(item=>item.id==='hall-gate'),{automatic:true});
  else if(flow.phase==='branch-to-epilogue'){
    cgTransition.start(()=>{sceneId='field_day';Object.assign(player,{x:320,y:170});refreshSceneUI();session=flow.arrive(sceneId);showLine(true);},{between:true});
  }
  else if(flow.phase==='meet'&&flight.land()){
    flightContinuation=returnToExploration;setMode('flight');
  }
  else returnToExploration();
}

function showEnding() {
  stage.reset();resetCurtain();
  flight.reset();flightContinuation=null;
  glassState=null;propKind=null;effectLocked=false;
  ui['end-kicker'].textContent=flow.route==='branchB'?'第一章 · 支线 B 完':'第一章 · 完';
  ui['end-title'].textContent=flow.route==='branchB'?'不送瓶子':'瓶中的幸福';
  ui['end-description'].textContent='风还在吹。旅途仍将继续。';
  ui.return.textContent='返回标题';
  ui.replay.textContent='从头重读这一章';
  setMode('complete');ui.return.focus({preventScroll:true});
}

function interact(item = activeInteraction) {
  if (mode !== 'explore' || !item) return;
  if (item.kind === 'exit') { travel(item); return; }
  if (item.kind === 'dialogue') {
    session=flow.meet();showLine();ui.game.focus({preventScroll:true});
    return;
  }
  if(item.kind==='story') {
    Object.assign(player,{x:330,y:289,direction:'up'});
    session=flow.sit();showLine();ui.game.focus({preventScroll:true});return;
  }
  if (item.kind === 'inspect') {
    sound.play('page');
    ui['inspection-title'].textContent = item.source;
    ui['inspection-text'].textContent = observations.get(item.source);
    const detail=assets.objects.get(item.id),image=ui['inspection-image'];
    image.hidden=!detail;
    if(detail){image.src=detail.src;image.alt=`${item.source}的像素特写`;}
    else {image.removeAttribute('src');image.alt='';}
    ui.inspection.classList.toggle('has-image',Boolean(detail));
    inspected.add(item.id); setMode('inspect'); refreshSceneUI(); ui.game.focus({preventScroll:true});
  }
}

function updateInteraction() {
  activeInteraction = nearestInteraction(sceneId,player,availableInteractions());
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

ui.start.addEventListener('click',startStory);
ui.interact.addEventListener('click',() => interact());
ui.advance.addEventListener('click',advance);
ui.return.addEventListener('click',backToTitle);
ui.replay.addEventListener('click',startStory);
ui['memory-next'].addEventListener('click',advance);
ui['memory-layer'].addEventListener('click',event=>{
  if(!event.target.closest('button'))advance();
});
ui['pause-toggle'].addEventListener('click',pauseJourney);
ui.resume.addEventListener('click',resumeJourney);
ui['back-title'].addEventListener('click',backToTitle);
ui['sound-toggle'].addEventListener('click',async()=>{
  try {await sound.toggle();syncSound();}
  catch {ui['sound-toggle'].textContent='声音不可用';}
});
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
  if(audioPanel.active)return;
  if(event.key==='Control'){if(!event.repeat){fast.hold(mode);event.preventDefault();}return;}
  if ((event.ctrlKey || event.altKey || event.metaKey) && event.key!=='Escape' || event.isComposing) return;
  if (event.target instanceof HTMLElement && event.target.matches('input,textarea,select,[contenteditable="true"]')) return;
  const key = event.key.toLowerCase();
  const onButton = event.target instanceof HTMLButtonElement;
  if(mode==='choice'&&key!=='escape'){
    event.preventDefault();
    return;
  }
  if (movementKeys.includes(key)) {
    if (mode !== 'title') event.preventDefault();
    if (mode === 'explore') keys.add(key);
    return;
  }
  if (key === 'f' && !event.repeat) { event.preventDefault(); toggleFullscreen(); return; }
  if (event.repeat) return;
  if(key==='escape') {
    if(mode==='pause'){event.preventDefault();resumeJourney();return;}
    if(mode==='inspect'){event.preventDefault();returnToExploration();return;}
    if(mode==='complete'){event.preventDefault();backToTitle();return;}
    if(['explore','dialogue','memory','flight','choice','interlude'].includes(mode)){event.preventDefault();pauseJourney();return;}
  }
  if (mode === 'explore' && key === 'e') { event.preventDefault(); interact(); return; }
  if (mode === 'inspect' && [' ','enter','e'].includes(key) && !onButton) { event.preventDefault(); returnToExploration(); return; }
  if (['dialogue','memory'].includes(mode) && [' ','enter','e'].includes(key) && !onButton) { event.preventDefault(); advance(); }
});
document.addEventListener('keyup',event => {keys.delete(event.key.toLowerCase());if(event.key==='Control')fast.release();});
window.addEventListener('blur',() => { fast.reset();keys.clear(); player.moving = false; });
document.addEventListener('visibilitychange',() => { fast.reset();keys.clear(); lastFrame = 0; });

function updateMovement(dt) {
  if (mode !== 'explore') return;
  const previousX=player.x,previousY=player.y;
  let dx = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
  let dy = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
  const length = Math.hypot(dx,dy); player.moving = length > 0;
  if (length) {
    player.direction = Math.abs(dx)>Math.abs(dy) ? (dx>0 ? 'right' : 'left') : (dy>0 ? 'down' : 'up');
    dx = dx/length*88*dt; dy = dy/length*88*dt;
    if (canStand(sceneId,player.x+dx,player.y)) player.x += dx;
    if (canStand(sceneId,player.x,player.y+dy)) player.y += dy;
  }
  sound.walk(Math.hypot(player.x-previousX,player.y-previousY),sceneId);
  updateInteraction();
  ui.game.dataset.playerX = player.x.toFixed(1); ui.game.dataset.playerY = player.y.toFixed(1);
  if(flow?.phase==='meet'&&activeInteraction?.id==='emil')interact();
}

function drawMarkers(time) {
  if (mode !== 'explore') return;
  for (const item of availableInteractions()) {
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
  const readingMode=mode==='dialogue'||mode==='memory'||(mode==='pause'&&['dialogue','memory'].includes(pausedMode));
  const node = readingMode ? session?.current : null;
  const visibleScene = node?.bg && SCENES[node.bg] ? node.bg : sceneId;
  const night=flow?.route==='branchB'&&visibleScene==='gate_dusk';
  const background = node ? assets.backgrounds.get(node.bg) : null;
  const cinematic=['flight','interlude'].includes(mode)||(mode==='pause'&&['flight','interlude'].includes(pausedMode));
  const staged=readingMode||cinematic;
  const flying=flight.snapshot();
  const hideSprites=node&&shotPresentation(node.shotId,node).hideSprites||mode==='transition'&&(flow?.phase==='to-dusk'||flow?.phase.startsWith('branch-'));
  const lighting=stage.snapshot();
  ctx.clearRect(0,0,640,360);ctx.save();
  if(staged){ctx.translate(lighting.x*640,lighting.y*360);ctx.scale(lighting.zoom,lighting.zoom);ctx.translate(-lighting.x*640,-lighting.y*360);}
  if (background) {
    const scale = Math.max(640/background.naturalWidth,360/background.naturalHeight);
    const width = background.naturalWidth*scale, height = background.naturalHeight*scale;
    ctx.drawImage(background,(640-width)/2,(360-height)/2,width,height);
  } else {
    ctx.drawImage(backgrounds.get(night?'gate_night':visibleScene),0,0);
    const cast=hideSprites?null:branchCast(branchStage.kind==='leaving'?'SH-23':node?.shotId,branchStage.kind==='leaving'?branchStage:null);
    const sprites = hideSprites ? [] : cast??[...SCENES[visibleScene].npcs];
    if (!cast&&!hideSprites&&!flying&&visibleScene===sceneId) sprites.push({actor:'elaina',...player});
    sprites.sort((a,b)=>a.y-b.y);
    for (const sprite of sprites){ctx.save();ctx.globalAlpha=sprite.opacity??1;drawSprite(ctx,sprite.actor,sprite.x,sprite.y,{moving:sprite.moving,direction:sprite.direction,time});ctx.restore();}
    drawAmbient(ctx,visibleScene,time,reducedMotion); drawMarkers(time);
  }
  if(flying){
    if(flying.walkOpacity>0){ctx.save();ctx.globalAlpha=flying.walkOpacity;drawSprite(ctx,'elaina',flying.x,flying.y,{direction:'down',time});ctx.restore();}
    drawElainaFlight(ctx,assets.sprites.get(`elaina_flying_${flying.frame}`),flying);
  }
  ctx.restore();
  ui.game.dataset.flight=flight.kind??'none';ui.game.dataset.flightPhase=flight.phase;
  ui.game.dataset.flightProgress=(flying?.progress??0).toFixed(3);
  ui.game.dataset.flightFrame=flying?.frame??'';
  ui.game.dataset.flightX=flying?.x.toFixed(2)??'';ui.game.dataset.flightY=flying?.y.toFixed(2)??'';
  ui.game.dataset.playerPosture=flying?(flying.phase==='landing'?'landing':'flying'):hideSprites?'hidden':'walking';
  ui['scene-atmosphere'].hidden=!staged||!ui['story-cg'].hidden;
  if(staged&&ui['story-cg'].hidden)drawAtmosphere(ui['scene-atmosphere'].getContext('2d'),lighting);
  ui.game.dataset.mood=staged?stage.mood:'clear';
  ui.game.dataset.stageTime=stage.time.toFixed(0);
  ui.game.dataset.branchStage=branchStage.kind??'none';ui.game.dataset.branchProgress=branchStage.progress.toFixed(3);
  if(propKind&&mode==='dialogue')drawMagicEffect(ui['glass-prop'],magic);
  if(mode==='memory')drawMagicEffect(ui['memory-bottle'],memory.bottle,{placement:'release'});
  ui['story-prop'].dataset.phase=magic.phase;
  ui['story-prop'].dataset.progress=magic.progress.toFixed(3);
  const label = document.querySelector('.location');
  const labelKey=visibleScene+(night?':night':'');
  if (label.dataset.location !== labelKey) {
    label.dataset.location = labelKey;
    label.textContent = night?'☾  村口 · 夜里':`${SCENES[visibleScene].icon}  ${SCENES[visibleScene].name}`;
  }
}

function frame(time) {
  const dt = lastFrame ? Math.min((time-lastFrame)/1000,.05) : 0;
  lastFrame = time; updateMovement(dt);
  const stepMs=dt*1000*fast.scale;
  fastButton.hidden=!['dialogue','memory','flight','interlude'].includes(mode);
  fastButton.textContent=fast.active?'停止快进':'快进 · Ctrl';fastButton.setAttribute('aria-pressed',String(fast.active));
  ui.game.dataset.fastForward=fast.active?'on':'off';
  if(mode!=='pause'&&!document.hidden)cgTransition.update(stepMs);
  curtain.hidden=!cgTransition.busy;curtain.style.opacity=String(cgTransition.opacity);
  ui.game.dataset.cgTransition=cgTransition.busy?'busy':'';
  const audioMode=mode==='pause'?pausedMode:mode;
  const audioNode=['dialogue','memory'].includes(audioMode)?session?.current:null;
  const profile=audioPanel.active&&audioPanel.profile?audioPanel.profile:audioProfile({mode:audioMode,scene:audioNode?.bg??sceneId,shot:audioNode?.shotId??null,glass:glassState,kind:cgTransition.busy?'curtain':null});
  sound.setProfile(profile);
  sound.setPaused(document.hidden||(!audioPanel.active&&mode==='pause'));
  sound.tick();
  ui.game.dataset.audioProfile=profile;ui.game.dataset.audioState=sound.context?.state??'waiting';ui.game.dataset.musicTrack=sound.music?.id??'';
  if(mode!=='pause')worldTime+=dt*1000;
  if(['dialogue','flight','interlude'].includes(mode)){
    stage.update(stepMs);
    if(!document.hidden)flight.update(stepMs);
  }
  if(mode==='flight'&&flight.complete){
    const continueStory=flightContinuation;flightContinuation=null;flight.reset();continueStory?.();
  }
  if(['dialogue','interlude'].includes(mode)&&!document.hidden&&!cgTransition.busy&&branchStage.kind){
    branchStage.update(stepMs);
    if(branchStage.complete){
      if(branchStage.kind==='reflection')advanceStory();
      else{const continueStory=branchContinuation;branchContinuation=null;branchStage.reset();continueStory?.();}
    }
  }
  if(mode==='memory'&&!document.hidden){
    memory.update(stepMs);refreshMemoryUI();
    if(memory.phase==='complete')advanceStory();
  }
  if(propKind&&['dialogue','memory'].includes(mode))magic.update(stepMs);
  if (mode==='dialogue' && !cgTransition.busy && typedCount<textCharacters.length) {
    const count = reducedMotion||fast.active ? textCharacters.length : Math.max(0,Math.min(textCharacters.length,Math.floor((time-textStarted)/32)));
    if (count!==typedCount) { typedCount=count; ui['dialogue-text'].textContent=textCharacters.slice(0,count).join(''); }
    if (typedCount===textCharacters.length) { ui['dialogue-layer'].classList.add('ready'); ui['advance-label'].textContent='继续'; }
  }
  if(mode==='dialogue') {
    if(cgTransition.busy)textStarted=time;
    if(fast.active&&advanceReadyAt>time+240)advanceReadyAt=time+240;
    const held=cgTransition.busy||time<advanceReadyAt||(effectLocked&&magic.busy)||flight.busy||branchStage.kind==='reflection';ui.advance.disabled=held;
    if(held)ui['advance-label'].textContent=branchStage.kind==='reflection'?'静静看着…':'片刻之后…';
    else ui['advance-label'].textContent=typedCount===textCharacters.length?'继续':'显示全文';
  }
  const ready=mode==='memory'?memory.ready:mode==='dialogue'&&!ui.advance.disabled&&typedCount===textCharacters.length;
  if(fast.update(dt*1000,{mode,token:session?.currentId,ready})&&!document.hidden)advance();
  draw(worldTime); requestAnimationFrame(frame);
}
refreshSceneUI(); requestAnimationFrame(frame);
document.addEventListener('visibilitychange',()=>{if(document.hidden)sound.setPaused(true);});

async function initialize() {
  try {
    if (location.protocol==='file:') throw new Error('请双击项目里的“开始游戏.cmd”，通过本地服务打开；浏览器不能直接读取文件夹里的剧情数据。');
    const [script,branchScript] = await Promise.all([
      fetch(new URL('../content/script/ch1.md',import.meta.url)),
      fetch(new URL('../content/script/ch1_branch_b.md',import.meta.url)),
    ]);
    if (!script.ok) throw new Error(`旅行见闻读取失败（HTTP ${script.status}）。`);
    if (!branchScript.ok) throw new Error(`支线剧本读取失败（HTTP ${branchScript.status}）。`);
    const manuscript=await script.text();
    observations = readHallObservations(manuscript);
    chapter=readChapter(manuscript,await branchScript.text());
    await assets.load();
    ui.start.disabled = false; ui.start.innerHTML = '开始旅行 <span aria-hidden="true">→</span>';
    ui['loading-message'].textContent = '第一章 · 瓶中的幸福';
  } catch (error) {
    ui['error-panel'].hidden=false; ui['error-message'].textContent=error.message;
    console.error('游戏启动失败：',error);
  }
}
initialize();
