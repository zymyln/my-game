const modes=new Set(['dialogue','memory','flight','interlude','transition']);
export class FastForward {
  constructor(){this.reset();}
  reset(){this.held=false;this.toggled=false;this.elapsed=0;this.token=null;}
  get active(){return this.held||this.toggled;}
  get scale(){return this.active?8:1;}
  enter(mode){if(!modes.has(mode))this.reset();}
  hold(mode){if(modes.has(mode)&&mode!=='transition')this.held=true;}
  release(){this.held=false;this.elapsed=0;}
  toggle(mode){if(modes.has(mode)&&mode!=='transition'){this.toggled=!this.active;this.held=false;this.elapsed=0;}}
  update(ms,{mode,token,ready}){
    if(!this.active||!['dialogue','memory'].includes(mode)||!ready){this.elapsed=0;this.token=token;return false;}
    if(token!==this.token){this.elapsed=0;this.token=token;}
    this.elapsed+=Math.max(0,Math.min(50,ms));
    if(this.elapsed<180)return false;
    this.elapsed=0;return true;
  }
}
