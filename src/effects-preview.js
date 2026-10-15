import { MagicPlayer } from './magic.mjs';
import { drawMagicEffect } from './magic-art.js';

export function setupEffectsPreview({backgrounds,sound,onSoundChange}) {
  const root=document.getElementById('effects-preview');
  const canvas=document.getElementById('effects-canvas'),ctx=canvas.getContext('2d');
  const action=document.getElementById('effects-action'),status=document.getElementById('effects-status');
  const pause=document.getElementById('effects-pause'),audio=document.getElementById('effects-sound');
  const tabs=[...root.querySelectorAll('[data-effect-kind]')];
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const player=new MagicPlayer({reducedMotion});
  let frameId=0,last=0,paused=false,sequence=false,sequenceTime=0,restoreFocus=null,inertStates=[];

  function trigger(name) {
    if(player.trigger(name))sound.play({shatter:'glass',restore:'restore',release:'bottle'}[name]);
  }
  function choose(kind) {
    player.select(kind);paused=false;sequence=false;sequenceTime=0;
    for(const tab of tabs)tab.setAttribute('aria-pressed',String(tab.dataset.effectKind===kind));
  }
  function updateUI() {
    const phase=player.phase;
    const labels={
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
    action.disabled=player.busy;
    pause.textContent=paused?'继续演出':'暂停演出';
    audio.textContent=sound.enabled?'音效：开':'音效：关';audio.setAttribute('aria-pressed',String(sound.enabled));
    root.dataset.kind=player.kind;root.dataset.phase=phase;root.dataset.progress=player.progress.toFixed(3);root.dataset.paused=String(paused);
  }
  function frame(time) {
    if(root.hidden){frameId=0;return;}
    const dt=last?Math.min(time-last,60):0;last=time;
    if(!paused) {
      player.update(dt);
      if(sequence) {
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
    ctx.clearRect(0,0,640,360);ctx.drawImage(backgrounds.get(player.kind==='bottle'?'field_day':'hall'),0,0);
    ctx.fillStyle=player.kind==='bottle'?'#173832e8':'#293b35e5';ctx.fillRect(0,0,640,360);
    const light=ctx.createRadialGradient(320,160,15,320,160,240);
    light.addColorStop(0,'#bedbb119');light.addColorStop(1,'#071e1d44');ctx.fillStyle=light;ctx.fillRect(0,0,640,360);
    drawMagicEffect(canvas,player,{clear:false,placement:'preview'});updateUI();
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
    if(player.kind==='bottle'){if(player.phase==='bottle-idle')trigger('release');else player.select('bottle');}
    else trigger(player.phase==='cup-broken'?'restore':'shatter');
  });
  document.getElementById('effects-sequence').addEventListener('click',()=>{player.select(player.kind);sequence=true;sequenceTime=0;paused=false;});
  pause.addEventListener('click',()=>{paused=!paused;});
  audio.addEventListener('click',async()=>{try{await sound.toggle();onSoundChange();}catch{audio.textContent='音效不可用';}});
  root.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}
    if(event.key===' '&&event.target===canvas){event.preventDefault();paused=!paused;}
  });
  document.addEventListener('visibilitychange',()=>{last=0;});
  return {open,close,get active(){return !root.hidden;}};
}
