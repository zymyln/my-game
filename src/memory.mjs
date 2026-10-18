import { MagicPlayer, DURATIONS, smooth } from './magic.mjs';

// One light, one memory. All timing follows the game clock so pause freezes fades.
export class MemoryPlayer {
  constructor({reducedMotion=false}={}) {
    this.reducedMotion=reducedMotion;
    this.bottle=new MagicPlayer({reducedMotion});
    this.reset();
  }
  reset() {this.number=0;this.phase='idle';this.elapsed=0;this.bottle.select('bottle');}
  start(number) {
    if(number===1||this.phase==='idle')this.bottle.select('bottle');
    this.number=number;this.phase='release';this.elapsed=0;
    this.bottle.trigger('release-one');
  }
  get duration() {
    return {release:this.reducedMotion?700:DURATIONS.releaseOne,'fade-in':this.reducedMotion?350:850,reading:2000,'fade-out':this.reducedMotion?350:700}[this.phase]??0;
  }
  get ready() {return this.phase==='reading'&&this.elapsed>=this.duration;}
  get opacity() {
    if(this.phase==='reading')return 1;
    if(this.phase==='fade-in')return smooth(this.elapsed/this.duration);
    if(this.phase==='fade-out')return 1-smooth(this.elapsed/this.duration);
    return 0;
  }
  next() {
    if(!this.ready)return false;
    this.phase='fade-out';this.elapsed=0;return true;
  }
  update(milliseconds) {
    if(['idle','complete'].includes(this.phase)||!Number.isFinite(milliseconds)||milliseconds<0)return;
    this.bottle.update(milliseconds);
    this.elapsed+=milliseconds;
    while(!['reading','complete'].includes(this.phase)&&this.elapsed>=this.duration){
      this.elapsed-=this.duration;
      this.phase={release:'fade-in','fade-in':'reading','fade-out':'complete'}[this.phase];
    }
  }
}
