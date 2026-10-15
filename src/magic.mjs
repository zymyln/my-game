// Deterministic, elapsed-time animation. Geometry is shared by the story and preview.
export const DURATIONS = Object.freeze({ shatter:1800, restore:3200, release:3400 });
export const clamp = value => Math.max(0,Math.min(1,value));
export const smooth = value => { const t=clamp(value);return t*t*(3-2*t); };
const mix=(a,b,t)=>a+(b-a)*t;

export const CUP_SHARDS = [
  [[125,68],[159,68],[156,88],[128,88]],
  [[159,68],[195,68],[192,88],[156,88]],
  [[128,88],[156,88],[151,111],[133,113]],
  [[156,88],[192,88],[187,113],[151,111]],
  [[133,113],[151,111],[160,136],[142,128]],
  [[151,111],[187,113],[178,128],[160,136]],
  [[156,136],[164,136],[164,169],[156,169]],
  [[132,169],[188,169],[192,176],[128,176]],
].map((points,index)=>{
  const x=points.reduce((sum,p)=>sum+p[0],0)/points.length;
  const y=points.reduce((sum,p)=>sum+p[1],0)/points.length;
  const land=[[78,185,-.8],[222,186,.7],[103,192,.4],[199,194,-.5],[126,182,-1],[177,187,.6],[145,195,1.4],[163,190,.12]][index];
  return { points, home:{x,y}, land:{x:land[0],y:land[1],angle:land[2],scaleY:.34}, local:points.map(p=>[p[0]-x,p[1]-y]) };
});

export class MagicPlayer {
  constructor({reducedMotion=false}={}) { this.reducedMotion=reducedMotion;this.select('bottle'); }
  select(kind) {
    if(!['bottle','cup'].includes(kind))throw new Error(`Unknown magic prop: ${kind}`);
    this.kind=kind;this.phase=kind==='bottle'?'bottle-idle':'cup-whole';this.elapsed=0;this.releaseOrigin=0;
  }
  get busy() { return ['cup-shatter','cup-restore','bottle-release'].includes(this.phase); }
  get duration() {
    const base={'cup-shatter':DURATIONS.shatter,'cup-restore':DURATIONS.restore,'bottle-release':DURATIONS.release}[this.phase] ?? 0;
    return this.reducedMotion && base ? 700 : base;
  }
  get progress() { return this.duration ? clamp(this.elapsed/this.duration) : 1; }
  trigger(action) {
    const next={shatter:'cup-shatter',restore:'cup-restore',release:'bottle-release'}[action];
    const allowed=action==='shatter' ? ['cup-whole','cup-restored'] : action==='restore' ? ['cup-broken'] : action==='release' ? ['bottle-idle'] : [];
    if(!next||!allowed.includes(this.phase))return false;
    if(action==='release')this.releaseOrigin=this.elapsed;
    this.phase=next;this.elapsed=0;return true;
  }
  update(milliseconds) {
    if(!Number.isFinite(milliseconds)||milliseconds<0)return;
    this.elapsed+=milliseconds;
    if(this.busy&&this.elapsed>=this.duration) {
      const remaining=this.elapsed-this.duration;
      this.phase={'cup-shatter':'cup-broken','cup-restore':'cup-restored','bottle-release':'bottle-open'}[this.phase];
      this.elapsed=remaining;
    }
  }
}

export function shardPose(index,player) {
  const shard=CUP_SHARDS[index],{home,land}=shard;
  let t=player.progress;
  if(player.phase==='cup-broken')return {...land};
  if(player.phase==='cup-shatter') {
    if(player.reducedMotion)return {...land};
    const movement=smooth(t);
    return {x:mix(home.x,land.x,movement),y:mix(home.y,land.y,t)-Math.sin(Math.PI*t)*(17+index*3),angle:land.angle*movement+Math.sin(t*Math.PI*3)*.15*(1-t),scaleY:mix(1,land.scaleY,smooth((t-.6)/.4))};
  }
  if(player.phase==='cup-restore') {
    if(player.reducedMotion)return {...home,angle:0,scaleY:1};
    t=smooth((t-.12)/.76);
    return {x:mix(land.x,home.x,t)+Math.sin(Math.PI*t)*(index%2?8:-8),y:mix(land.y,home.y,t)-Math.sin(Math.PI*t)*(17+index),angle:land.angle*(1-t),scaleY:mix(land.scaleY,1,t)};
  }
  return {...home,angle:0,scaleY:1};
}

export function bottleMote(index,elapsed,reducedMotion=false) {
  const time=reducedMotion?0:elapsed/1000;
  const angle=index*2.399963+time*(.31+(index%3)*.045);
  return {x:160+Math.sin(angle)*(13+index%4*4),y:132+Math.cos(angle*.93)*(20+index%3*6),alpha:reducedMotion ? .8 : .58+.3*Math.sin(time*1.4+index),size:index%4===0?2:1};
}

export function releasedMote(index,player) {
  const start=bottleMote(index,player.releaseOrigin ?? 0,player.reducedMotion);
  if(player.reducedMotion)return {...start,alpha:player.phase==='bottle-open' ? .16 : .55};
  const progress=player.phase==='bottle-open'?1:player.progress;
  const t=smooth((progress-index*.025)/.67);
  const side=index%2?1:-1;
  let x,y;
  if(t<.55) {
    const rise=smooth(t/.55);
    x=mix(start.x,160,rise);y=mix(start.y,55,rise);
  } else {
    const escape=smooth((t-.55)/.45);
    x=mix(160,160+side*(35+(index*17)%62),escape)+Math.sin(escape*Math.PI)*side*10;
    y=mix(55,6-(index*11)%43,escape)-Math.sin(escape*Math.PI)*12;
  }
  return {x,y,alpha:start.alpha*(1-smooth((t-.75)/.25)),size:start.size};
}
