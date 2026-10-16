import {renderScore} from './music.js';
import {PROFILES} from './score.mjs';
const defaults={enabled:true,music:.55,effects:.65,ambience:.4};
export class SoundEffects {
  constructor(){
    let saved={};try{saved=JSON.parse(localStorage.getItem('elaina-audio')||'{}')||{};}catch{}
    this.enabled=typeof saved.enabled==='boolean'?saved.enabled:true;
    this.levels=Object.fromEntries(['music','effects','ambience'].map(key=>[key,Number.isFinite(saved[key])?Math.max(0,Math.min(1,saved[key])):defaults[key]]));
    this.context=null;this.profile='quiet';this.paused=false;this.cache=new Map();this.voices=new Set();this.music=null;this.ambient=null;this.distance=0;this.birdAt=0;
  }
  save(){try{localStorage.setItem('elaina-audio',JSON.stringify({enabled:this.enabled,...this.levels}));}catch{}}
  async activate(){
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){this.unavailable=true;return false;}
    if(!this.context){
      const ctx=this.context=new Audio();this.master=ctx.createGain();this.master.gain.value=this.enabled?.7:0;
      const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-18;limiter.knee.value=12;limiter.ratio.value=4;
      this.master.connect(limiter);limiter.connect(ctx.destination);
      this.buses={};for(const channel of ['music','effects','ambience']){const gain=ctx.createGain();gain.gain.value=this.levels[channel];gain.connect(this.master);this.buses[channel]=gain;}
    }
    await this.context.resume();this.refresh();return this.context.state==='running';
  }
  async toggle(){if(!this.enabled)await this.activate();this.enabled=!this.enabled;this.save();this.refresh();return this.enabled;}
  volume(channel,value){if(!Object.hasOwn(this.levels,channel))return;this.levels[channel]=Math.max(0,Math.min(1,Number(value)||0));this.save();this.refresh();}
  ramp(parameter,value,duration=.12){const now=this.context.currentTime;parameter.cancelScheduledValues(now);parameter.setValueAtTime(parameter.value,now);parameter.linearRampToValueAtTime(value,now+duration);}
  refresh(){
    if(!this.context)return;
    this.ramp(this.master.gain,this.enabled&&!this.paused?.7:0);
    for(const channel of Object.keys(this.buses))this.ramp(this.buses[channel].gain,this.levels[channel]);
    if(this.enabled&&!this.paused){this.ensureMusic();this.ensureAmbience();}
  }
  setProfile(profile){if(!PROFILES[profile])profile='quiet';if(this.profile===profile)return;this.profile=profile;if(this.context){this.ensureMusic();this.ensureAmbience();}}
  setPaused(paused){
    if(this.paused===paused)return;this.paused=paused;clearTimeout(this.pauseTimer);
    if(!this.context)return;
    if(!paused)this.context.resume().catch(()=>{});
    this.refresh();
    if(paused){this.stopCues();this.pauseTimer=setTimeout(()=>{if(this.paused)this.context.suspend().catch(()=>{});},160);}
  }
  stopLoop(loop,fade=.8){
    if(!loop)return;this.ramp(loop.gain.gain,0,fade);try{loop.source.stop(this.context.currentTime+fade+.05);}catch{}
  }
  async ensureMusic(){
    const id=PROFILES[this.profile].music;
    if(this.music?.id===id)return;
    if(this.music){this.stopLoop(this.music,1.1);this.music=null;}
    if(!id||!this.enabled||this.paused)return;
    if(!this.cache.has(id))this.cache.set(id,renderScore(id).catch(()=>null));
    const buffer=await this.cache.get(id);
    if(!buffer||PROFILES[this.profile].music!==id||this.music?.id===id||!this.enabled||this.paused)return;
    const ctx=this.context,source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;source.loop=true;gain.gain.value=0;
    source.connect(gain);gain.connect(this.buses.music);source.start();this.ramp(gain.gain,.72,1.2);this.music={id,source,gain};
    source.onended=()=>{source.disconnect();gain.disconnect();};
  }
  ensureAmbience(){
    const profile=PROFILES[this.profile],id=profile.ambience;
    if(this.ambient?.id===id){this.ramp(this.ambient.gain.gain,(profile.ambientScale??1)*(id==='room'?.035:.09),.8);return;}
    this.stopLoop(this.ambient,.7);this.ambient=null;
    if(!id||!this.enabled||this.paused)return;
    const ctx=this.context,source=ctx.createBufferSource(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
    source.buffer=this.noiseBuffer??=this.makeNoise();source.loop=true;filter.type='lowpass';filter.frequency.value=id==='room'?240:id==='evening'?420:720;
    source.connect(filter);filter.connect(gain);gain.connect(this.buses.ambience);gain.gain.value=0;source.start();this.ramp(gain.gain,(profile.ambientScale??1)*(id==='room'?.035:.09),1);
    this.ambient={id,source,gain};this.birdAt=ctx.currentTime+3;
    source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
  }
  makeNoise(){
    const ctx=this.context,buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),data=buffer.getChannelData(0);let seed=8191;
    for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=(seed/4294967296*2-1)*.65;}
    const seam=512;for(let i=0;i<seam;i++){data[i]*=i/seam;data[data.length-1-i]*=i/seam;}
    return buffer;
  }
  cueSource(source,gain,duration,channel='effects',filter=null){
    const ctx=this.context;if(filter){source.connect(filter);filter.connect(gain);}else source.connect(gain);
    gain.connect(this.buses[channel]);this.voices.add(source);source.start();source.stop(ctx.currentTime+duration);
    source.onended=()=>{this.voices.delete(source);source.disconnect();filter?.disconnect();gain.disconnect();};
  }
  tone(frequency,duration,volume,{delay=0,end=frequency,type='sine',channel='effects'}={}){
    const ctx=this.context,start=ctx.currentTime+delay,source=ctx.createOscillator(),gain=ctx.createGain();source.type=type;
    source.frequency.setValueAtTime(frequency,start);source.frequency.exponentialRampToValueAtTime(end,start+duration);
    gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(volume,start+.008);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    this.cueSource(source,gain,delay+duration+.02,channel);
  }
  noise(duration,volume,cutoff=1000,channel='effects'){
    const ctx=this.context,source=ctx.createBufferSource(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();source.buffer=this.noiseBuffer??=this.makeNoise();filter.type='lowpass';filter.frequency.value=cutoff;
    gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(volume,ctx.currentTime+.012);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);
    this.cueSource(source,gain,duration+.02,channel,filter);
  }
  stopCues(){for(const source of this.voices){try{source.stop(this.context.currentTime+.02);}catch{}}this.voices.clear();}
  walk(distance,scene){
    if(!this.enabled||this.paused||!this.context||this.context.state!=='running')return;
    this.distance+=distance;if(this.distance<15)return;this.distance%=15;this.play(scene==='hall'?'step-wood':'step-grass');
  }
  tick(){
    if(!this.enabled||this.paused||!this.context||this.context.state!=='running')return;
    if(this.profile==='meadow'&&this.context.currentTime>=this.birdAt){this.birdAt=this.context.currentTime+6.5;this.tone(2200,.15,.014,{end:2900,channel:'ambience'});this.tone(2850,.18,.010,{delay:.21,end:2300,channel:'ambience'});}
  }
  play(kind){
    if(!this.enabled||this.paused||!this.context||this.context.state!=='running')return;
    if(kind==='glass'){this.noise(.55,.24,7600);[1310,2170,3380,4620].forEach((pitch,i)=>this.tone(pitch,.45+i*.10,.045,{delay:i*.018,type:'triangle',end:pitch*.92}));}
    else if(kind==='restore'){[523,659,784,1046,1318].forEach((pitch,i)=>this.tone(pitch,1.45,.05,{delay:i*.11}));this.noise(.8,.04,1800);}
    else if(kind==='bottle'){this.tone(420,.18,.12,{end:110});this.noise(.12,.10,1600);[1046,1318,1568].forEach((pitch,i)=>this.tone(pitch,.8,.025,{delay:.15+i*.12}));}
    else if(kind==='step-wood'){this.noise(.09,.11,650);this.tone(150,.11,.07,{end:90});}
    else if(kind==='step-grass'){this.noise(.13,.09,1700);this.tone(95,.08,.025,{end:65});}
    else if(kind==='page')this.noise(.16,.075,2600);
    else if(kind==='door'){this.noise(.32,.09,1100);this.tone(180,.28,.035,{end:130});}
    else if(kind==='sparkle')[1046,1568].forEach((pitch,i)=>this.tone(pitch,.8,.032,{delay:i*.13}));
    else if(kind==='impact'){this.noise(.19,.10,280);this.tone(75,.32,.07,{end:48});}
    else if(kind==='ui')this.tone(660,.07,.035,{end:780});
  }
}
