import { MagicPlayer } from './magic.mjs';
import { drawMagicEffect } from './magic-art.js';
import { drawPortrait } from './art.js';
import { StagePlayer, MOODS, drawAtmosphere } from './staging.mjs';

const moodSequence=['meadow','calm','unease','pressure','calm','gaze','afterglow'];
const moodDescriptions={meadow:'暖光、微风，镜头轻轻靠近。',calm:'柔和的窗光回到餐厅，紧绷的画面逐渐放松。',unease:'冷色慢慢渗入餐厅，边缘收暗。',pressure:'光线收紧，强调冲突带来的压迫感。',gaze:'左侧退暗，让注意力停在妮诺的回望。',afterglow:'暮色、微风和留白，旅途继续。'};

export function setupEffectsPreview({backgrounds,sound,onSoundChange}) {
  const root=document.getElementById('effects-preview');
  const canvas=document.getElementById('effects-canvas'),ctx=canvas.getContext('2d');
  const action=document.getElementById('effects-action'),status=document.getElementById('effects-status');
  const pause=document.getElementById('effects-pause'),audio=document.getElementById('effects-sound');
  const tabs=[...root.querySelectorAll('[data-effect-kind]')];
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const player=new MagicPlayer({reducedMotion});
  const stage=new StagePlayer({reducedMotion});
  const portraits=new Map(['elaina','emil','chief','nino'].map(actor=>{
    const image=document.createElement('canvas');image.width=96;image.height=128;
    drawPortrait(image,actor,actor==='nino'?'nino_empty':`${actor}_standing`);return [actor,image];
  }));
  let kind='bottle',moodIndex=0;
  let frameId=0,last=0,paused=false,sequence=false,sequenceTime=0,restoreFocus=null,inertStates=[];

  function trigger(name) {
    if(player.trigger(name))sound.play({shatter:'glass',restore:'restore',release:'bottle'}[name]);
  }
  function choose(nextKind) {
    kind=nextKind;paused=false;sequence=false;sequenceTime=0;moodIndex=0;
    if(kind==='mood'){stage.reset();stage.select(moodSequence[0],{immediate:true});}else player.select(kind);
    for(const tab of tabs)tab.setAttribute('aria-pressed',String(tab.dataset.effectKind===kind));
  }
  function nextMood() {
    moodIndex=(moodIndex+1)%moodSequence.length;
    stage.select(moodSequence[moodIndex]);
  }
  function updateUI() {
    const phase=kind==='mood'?`mood-${stage.mood}`:player.phase;
    const labels=kind==='mood'?['下一段光影',`${MOODS[stage.mood].label} · ${moodDescriptions[stage.mood]}`]:{
      'bottle-idle':['打开瓶塞','幸福化作光点，在玻璃瓶中缓缓流动。'],
      'bottle-release':['幸福正在逸出…','瓶塞轻轻浮起，幸福沿着微光飞向瓶外。'],
      'bottle-open':['重新装满光点','瓶子已经打开，最后的微光仍留在玻璃上。'],
      'cup-whole':['打碎玻璃杯','一只普通的玻璃杯，正等待故事发生。'],
      'cup-shatter':['碎片正在落下…','杯身碎开，玻璃碎片旋转着落向地面。'],
      'cup-broken':['施放还原魔法','碎片散落在地上。让伊蕾娜试着还原它。'],
      'cup-restore':['还原魔法生效中…','白雾托起碎片，沿魔法轨迹回到原处。'],
      'cup-restored':['再摔碎一次','最后一道裂痕消失，玻璃杯重新成形。'],
    }[phase];
    if(action.textContent!==labels[0])action.textContent=labels[0];
    if(status.textContent!==labels[1])status.textContent=labels[1];
    action.disabled=kind!=='mood'&&player.busy;
    pause.textContent=paused?'继续演出':'暂停演出';
    audio.textContent=sound.enabled?'音效：开':'音效：关';audio.setAttribute('aria-pressed',String(sound.enabled));
    root.dataset.kind=kind;root.dataset.phase=phase;root.dataset.progress=(kind==='mood'?stage.elapsed/Math.max(1,stage.duration):player.progress).toFixed(3);root.dataset.paused=String(paused);
  }
  function frame(time) {
    if(root.hidden){frameId=0;return;}
    const dt=last?Math.min(time-last,60):0;last=time;
    if(!paused) {
      if(kind==='mood'){
        stage.update(dt);
        if(sequence){sequenceTime+=dt;if(sequenceTime>=5000){sequenceTime=0;if(moodIndex===moodSequence.length-1)sequence=false;else nextMood();}}
      } else player.update(dt);
      if(sequence&&kind!=='mood') {
        sequenceTime+=dt;
        if(player.kind==='bottle') {
          if(sequenceTime>=900&&player.phase==='bottle-idle')trigger('release');
          if(player.phase==='bottle-open')sequence=false;
        } else {
          if(sequenceTime>=800&&player.phase==='cup-whole')trigger('shatter');
          if(sequenceTime>=800+(reducedMotion?700:1800)+750&&player.phase==='cup-broken')trigger('restore');
          if(player.phase==='cup-restored')sequence=false;
        }
      }
    }
    ctx.clearRect(0,0,640,360);
    if(kind==='mood'){
      const state=stage.snapshot();ctx.save();ctx.translate(state.x*640,state.y*360);ctx.scale(state.zoom,state.zoom);ctx.translate(-state.x*640,-state.y*360);
      ctx.drawImage(backgrounds.get(MOODS[stage.mood].scene),0,0);ctx.restore();
      drawAtmosphere(ctx,state,{clear:false});
      if(stage.mood!=='afterglow'){
        ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=stage.mood==='gaze'?.5:1;
        ctx.drawImage(portraits.get('elaina'),72,113,96,128);ctx.globalAlpha=1;
        ctx.drawImage(portraits.get(stage.mood==='gaze'?'nino':['unease','pressure'].includes(stage.mood)?'chief':'emil'),472,113,96,128);ctx.restore();
      }
      ctx.fillStyle='#f4efd9';ctx.font='16px SimSun,serif';ctx.textAlign='center';ctx.shadowColor='#162f2a';ctx.shadowBlur=7;
      ctx.fillText(MOODS[stage.mood].label,320,154);ctx.shadowBlur=0;
    } else {
      ctx.drawImage(backgrounds.get(player.kind==='bottle'?'field_day':'hall'),0,0);
      ctx.fillStyle=player.kind==='bottle'?'#173832e8':'#293b35e5';ctx.fillRect(0,0,640,360);
      const light=ctx.createRadialGradient(320,160,15,320,160,240);
      light.addColorStop(0,'#bedbb119');light.addColorStop(1,'#071e1d44');ctx.fillStyle=light;ctx.fillRect(0,0,640,360);
      drawMagicEffect(canvas,player,{clear:false,placement:'preview'});
    }
    updateUI();
    frameId=requestAnimationFrame(frame);
  }
  function open(kind='bottle') {
    if(!root.hidden){choose(kind);return;}
    restoreFocus=document.activeElement;
    inertStates=[...root.parentElement.children].filter(element=>element!==root).map(element=>[element,element.inert]);
    for(const [element]of inertStates)element.inert=true;
    choose(kind);root.hidden=false;last=0;canvas.focus({preventScroll:true});
    frameId=requestAnimationFrame(frame);
  }
  function close() {
    root.hidden=true;cancelAnimationFrame(frameId);frameId=0;
    for(const [element,value]of inertStates)element.inert=value;
    inertStates=[];onSoundChange();restoreFocus?.focus({preventScroll:true});
  }
  tabs.forEach(tab=>tab.addEventListener('click',()=>choose(tab.dataset.effectKind)));
  document.getElementById('effects-open').addEventListener('click',()=>open());
  document.getElementById('effects-close').addEventListener('click',close);
  action.addEventListener('click',()=>{
    sequence=false;paused=false;
    if(kind==='mood')nextMood();
    else if(player.kind==='bottle'){if(player.phase==='bottle-idle')trigger('release');else player.select('bottle');}
    else trigger(player.phase==='cup-broken'?'restore':'shatter');
  });
  document.getElementById('effects-sequence').addEventListener('click',()=>{choose(kind);sequence=true;sequenceTime=0;paused=false;});
  pause.addEventListener('click',()=>{paused=!paused;});
  audio.addEventListener('click',async()=>{try{await sound.toggle();onSoundChange();}catch{audio.textContent='音效不可用';}});
  root.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}
    if(event.key===' '&&event.target===canvas){event.preventDefault();paused=!paused;}
  });
  document.addEventListener('visibilitychange',()=>{last=0;});
  return {open,close,get active(){return !root.hidden;}};
}
