// Program-side atmosphere only: the script and dialogue timing stay untouched.
export const MOODS = {
  clear:{label:'自然光',scene:'field_day',tint:[0,0,0],wash:0,edge:0,x:.5,y:.43,zoom:1,bars:0,light:0,wind:0},
  meadow:{label:'草原微风',scene:'field_day',tint:[244,221,163],wash:.035,edge:.07,x:.5,y:.42,zoom:1.012,bars:0,light:.10,wind:.6},
  calm:{label:'餐厅暖光',scene:'hall',tint:[236,210,151],wash:.035,edge:.10,x:.55,y:.43,zoom:1.006,bars:0,light:.07,wind:0},
  unease:{label:'餐厅渐冷',scene:'hall',tint:[28,49,68],wash:.13,edge:.27,x:.64,y:.43,zoom:1.018,bars:5,light:0,wind:0},
  pressure:{label:'冲突的压迫感',scene:'hall',tint:[27,37,49],wash:.19,edge:.40,x:.72,y:.43,zoom:1.028,bars:9,light:0,wind:0},
  gaze:{label:'那个眼神',scene:'gate_dusk',tint:[29,45,61],wash:.15,edge:.53,x:.80,y:.40,zoom:1.022,bars:12,light:0,wind:0},
  afterglow:{label:'黄昏留白',scene:'field_dusk',tint:[164,111,134],wash:.07,edge:.21,x:.59,y:.40,zoom:1.012,bars:6,light:.04,wind:.5},
  reflection:{label:'静静看着',scene:'hall',tint:[48,58,69],wash:.10,edge:.20,x:.80,y:.40,zoom:1.025,bars:5,light:.025,wind:0},
  night:{label:'安静的村口',scene:'gate_dusk',tint:[16,29,57],wash:.46,edge:.25,x:.5,y:.43,zoom:1.006,bars:5,light:0,wind:.15},
};
const values=['wash','edge','x','y','zoom','bars','light','wind'];
const copy=profile=>({...profile,tint:[...profile.tint]});
export class StagePlayer {
  constructor({reducedMotion=false}={}){this.reducedMotion=reducedMotion;this.reset();}
  reset(){this.mood='clear';this.time=0;this.elapsed=0;this.duration=0;this.from=copy(MOODS.clear);this.current=copy(MOODS.clear);}
  select(mood,{immediate=false}={}){
    if(!MOODS[mood])throw new Error(`Unknown mood: ${mood}`);
    if(this.mood===mood)return;
    this.from=this.snapshot();this.mood=mood;this.elapsed=0;
    this.duration=immediate||this.reducedMotion?0:mood==='pressure'?650:1600;
    if(!this.duration)this.current=copy(MOODS[mood]);
  }
  update(milliseconds){
    if(!Number.isFinite(milliseconds)||milliseconds<0)return;
    if(!this.reducedMotion)this.time+=milliseconds;
    this.elapsed=Math.min(this.duration,this.elapsed+milliseconds);
    if(this.elapsed>=this.duration){this.current=copy(MOODS[this.mood]);return;}
    const target=MOODS[this.mood],fraction=this.duration?this.elapsed/this.duration:1,t=fraction*fraction*(3-2*fraction);
    this.current=copy(target);
    for(const key of values)this.current[key]=this.from[key]+(target[key]-this.from[key])*t;
    this.current.tint=target.tint.map((value,index)=>this.from.tint[index]+(value-this.from.tint[index])*t);
  }
  snapshot(){const state=copy(this.current);return {...state,time:this.time,zoom:this.reducedMotion?1:state.zoom,wind:this.reducedMotion?0:state.wind};}
}
export function moodForShot(shot){
  if(['SH-01','SH-02','SH-03','SH-04'].includes(shot))return 'meadow';
  if(['SH-09','SH-10'].includes(shot))return 'unease';
  if(shot==='SH-14')return 'gaze';
  if(['SH-13','SH-15'].includes(shot))return 'afterglow';
  if(['SH-17','SH-18','SH-19'].includes(shot))return 'unease';
  if(shot==='SH-20')return 'reflection';
  if(shot==='SH-23')return 'night';
  if(shot==='SH-24')return 'afterglow';
  return 'calm';
}

export function drawAtmosphere(ctx,state,{clear=true}={}){
  const {width:w,height:h}=ctx.canvas;
  if(clear)ctx.clearRect(0,0,w,h);
  ctx.save();ctx.scale(w/640,h/360);
  const color=state.tint.map(Math.round).join(',');
  ctx.fillStyle=`rgba(${color},${state.wash})`;ctx.fillRect(0,0,640,360);
  const shade=ctx.createRadialGradient(state.x*640,state.y*360,45,state.x*640,state.y*360,430);
  shade.addColorStop(0,'rgba(12,24,30,0)');shade.addColorStop(1,`rgba(12,24,30,${state.edge})`);
  ctx.fillStyle=shade;ctx.fillRect(0,0,640,360);
  if(state.light>.001){
    const beam=ctx.createLinearGradient(150,0,450,320);beam.addColorStop(0,`rgba(255,235,178,${state.light})`);beam.addColorStop(1,'rgba(255,235,178,0)');
    ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(230,0);ctx.lineTo(355,0);ctx.lineTo(535,330);ctx.lineTo(305,330);ctx.closePath();ctx.fill();
  }
  if(state.wind>.001)for(let i=0;i<7;i++){
    const x=(state.time/170+i*101)%710-35,y=150+(i*37)%145+Math.sin(state.time/2400+i)*3;
    ctx.fillStyle=`rgba(239,226,184,${state.wind*.30})`;ctx.fillRect(Math.round(x),Math.round(y),i%2?3:2,1);
  }
  ctx.fillStyle='#12232c';ctx.globalAlpha=.7;ctx.fillRect(0,0,640,state.bars);ctx.fillRect(0,360-state.bars,640,state.bars);
  ctx.restore();
}
