// Intro/outro staging only. The exploration player and collision anchor stay on foot.
const clamp=value=>Math.max(0,Math.min(1,value));
const smooth=value=>value*value*(3-2*value);

export class FlightPlayer {
  constructor({reducedMotion=false}={}) {this.reducedMotion=reducedMotion;this.reset();}
  reset() {this.kind=null;this.phase='idle';this.elapsed=0;this.time=0;this.point=null;}
  start(kind,point) {
    if(!['arrival','farewell','departure'].includes(kind))throw new Error('Unknown flight sequence');
    this.kind=kind;this.phase='enter';this.elapsed=0;this.time=0;this.point={...point};
  }
  get active() {return this.phase!=='idle'&&this.phase!=='complete';}
  get busy() {return this.active&&this.phase!=='hover';}
  get complete() {return this.phase==='complete';}
  get duration() {
    if(this.phase==='landing')return this.reducedMotion?180:550;
    return this.reducedMotion?450:this.kind==='arrival'?3200:this.kind==='farewell'?2200:3000;
  }
  land() {
    if(this.kind!=='arrival'||this.phase!=='hover')return false;
    this.phase='landing';this.elapsed=0;return true;
  }
  update(milliseconds) {
    if(!this.active||!Number.isFinite(milliseconds)||milliseconds<=0)return;
    this.time+=milliseconds;
    if(this.phase==='hover')return;
    this.elapsed=Math.min(this.elapsed+milliseconds,this.duration);
    if(this.elapsed>=this.duration){
      this.phase=this.kind==='arrival'&&this.phase==='enter'?'hover':'complete';
      this.elapsed=0;
    }
  }
  snapshot() {
    if(!this.active)return null;
    const progress=this.phase==='hover'?1:clamp(this.elapsed/this.duration),point=this.point;
    const state={kind:this.kind,phase:this.phase,progress,frame:'front',x:point.x,y:point.y,lift:10,scale:1,opacity:1,walkOpacity:0};
    if(this.kind==='arrival'){
      if(this.phase==='enter'&&!this.reducedMotion){const distance=1-smooth(progress);state.x-=28*distance;state.y-=65*distance;}
      if(this.phase==='landing'){state.lift=10*(1-smooth(progress));state.opacity=1-progress;state.walkOpacity=progress;}
      else if(!this.reducedMotion)state.lift+=Math.sin(this.time/420);
    }else{
      if(this.reducedMotion){state.opacity=1-progress;}
      else{
        const moving=smooth(clamp((progress-.15)/.85));
        state.y+=(420-point.y)*moving;
        state.lift=10*smooth(clamp(progress/.15))+Math.sin(this.time/420)*moving;
        state.opacity=clamp((1-progress)/.2);
      }
    }
    return state;
  }
}
