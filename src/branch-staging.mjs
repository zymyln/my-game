const clamp=value=>Math.max(0,Math.min(1,value));

export class BranchStagePlayer {
  constructor({reducedMotion=false}={}){this.reducedMotion=reducedMotion;this.reset();}
  reset(){this.kind=null;this.elapsed=0;this.duration=0;}
  select(step){
    this.reset();
    if(step.shotId==='SH-20'){
      this.kind='reflection';this.duration=Math.max(1800,Math.min(6800,Array.from(step.text).length*72+1300));
    }
  }
  leave(){this.kind='leaving';this.elapsed=0;this.duration=this.reducedMotion?500:2800;}
  get progress(){return this.duration?clamp(this.elapsed/this.duration):0;}
  get complete(){return Boolean(this.kind)&&this.elapsed>=this.duration;}
  update(milliseconds){if(this.kind&&Number.isFinite(milliseconds)&&milliseconds>0)this.elapsed=Math.min(this.duration,this.elapsed+milliseconds);}
}

export function branchCast(shot,departure=null){
  if(shot==='SH-17')return [{actor:'elaina',x:488,y:190},{actor:'emil',x:525,y:157},{actor:'nino',x:558,y:163}];
  if(shot==='SH-20')return [{actor:'emil',x:522,y:163,direction:'up'}];
  if(shot==='SH-23'){
    const progress=departure?departure.progress:0;
    const distance=departure?.reducedMotion?0:progress*165;
    const opacity=departure?.reducedMotion?1-progress:clamp((1-progress)/.18);
    return [{actor:'elaina',x:370,y:285},
      {actor:'emil',x:308,y:235+distance,direction:'down',moving:Boolean(departure),opacity},
      {actor:'nino',x:335,y:243+distance,direction:'down',moving:Boolean(departure),opacity}];
  }
  return null;
}
