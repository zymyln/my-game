// Frame-clock curtain: no delayed callbacks survive pause or a new journey.
export class CGTransition {
  constructor({reducedMotion=false}={}){this.reducedMotion=reducedMotion;this.reset();}
  reset(){this.elapsed=0;this.duration=0;this.swap=null;this.swapped=false;}
  start(swap,{between=false}={}){
    this.out=this.reducedMotion?120:between?650:380;
    this.hold=this.reducedMotion?80:between?400:180;
    this.into=this.reducedMotion?180:900;
    this.elapsed=0;this.duration=this.out+this.hold+this.into;this.swap=swap;this.swapped=false;
  }
  get busy(){return this.elapsed<this.duration;}
  get opacity(){
    if(!this.busy)return 0;
    const t=this.elapsed<this.out?this.elapsed/this.out:this.elapsed<this.out+this.hold?1:1-(this.elapsed-this.out-this.hold)/this.into;
    return t*t*(3-2*t);
  }
  update(ms){
    if(!this.busy||!Number.isFinite(ms)||ms<=0)return;
    this.elapsed=Math.min(this.duration,this.elapsed+ms);
    if(!this.swapped&&this.elapsed>=this.out){this.swapped=true;const swap=this.swap;this.swap=null;swap?.();}
  }
}
