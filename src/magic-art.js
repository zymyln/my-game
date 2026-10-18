import { CUP_SHARDS, bottleMote, releasedMote, singleReleasedMote, shardPose, smooth, clamp } from './magic.mjs';

function polygon(ctx,points,fill,stroke=null) {
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
}
function glow(ctx,x,y,radius,rgb,alpha=.4) {
  const gradient=ctx.createRadialGradient(x,y,0,x,y,radius);
  gradient.addColorStop(0,`rgba(${rgb},${alpha})`);gradient.addColorStop(.35,`rgba(${rgb},${alpha*.35})`);gradient.addColorStop(1,`rgba(${rgb},0)`);
  ctx.fillStyle=gradient;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
}
function mote(ctx,m,index,alpha=1) {
  ctx.save();ctx.globalAlpha=clamp(m.alpha*alpha);
  const rgb=index%3===0?'255,217,134':index%3===1?'212,245,216':'247,242,193';
  glow(ctx,m.x,m.y,8+m.size*2,rgb,.65);
  ctx.fillStyle=index%3===0?'#fff0bc':'#f5ffdf';ctx.fillRect(Math.round(m.x),Math.round(m.y),m.size+1,m.size+1);
  if(index%4===0){ctx.fillStyle='#fff6d1bb';ctx.fillRect(Math.round(m.x)-2,Math.round(m.y)+1,6,1);ctx.fillRect(Math.round(m.x)+1,Math.round(m.y)-2,1,6);}
  ctx.restore();
}
const BOTTLE=[[144,56],[176,56],[176,83],[193,94],[201,108],[201,170],[195,182],[125,182],[119,170],[119,108],[127,94],[144,83]];
const CUP=[[125,68],[195,68],[190,106],[178,128],[164,137],[164,169],[188,169],[192,176],[128,176],[132,169],[156,169],[156,137],[142,128],[130,106]];

function bottle(ctx,player) {
  const single=['bottle-release-one','bottle-open-full'].includes(player.phase);
  const flying=single?singleReleasedMote(player):null;
  const sealed=player.phase==='bottle-idle',p=player.busy?player.progress:1;
  const gradient=ctx.createLinearGradient(118,0,204,0);
  gradient.addColorStop(0,'#bdeddb42');gradient.addColorStop(.22,'#daffe916');gradient.addColorStop(.75,'#74bdbb12');gradient.addColorStop(1,'#b0e4d63b');
  glow(ctx,160,145,60,'220,232,171',.07);
  polygon(ctx,BOTTLE,gradient,'#c9e8d3b0');
  ctx.save();polygon(ctx,BOTTLE);ctx.clip();
  const haze=ctx.createRadialGradient(160,142,4,160,142,47);
  haze.addColorStop(0,'#e3f1ce28');haze.addColorStop(1,'#d4e6d100');ctx.fillStyle=haze;ctx.fillRect(118,90,84,95);
  for(let i=0;i<14;i++) {
    if(single&&i===0)continue;
    const m=single?bottleMote(i,player.bottleTime,player.reducedMotion):sealed?bottleMote(i,player.elapsed,player.reducedMotion):releasedMote(i,player);
    if(sealed&&!player.reducedMotion)for(let trail=1;trail<4;trail++)mote(ctx,bottleMote(i,player.elapsed-trail*110),i,(4-trail)*.09);
    mote(ctx,m,i);
  }
  if(flying&&flying.y>=94)mote(ctx,flying,0);
  ctx.restore();
  // Glass stays in front of the motes, so they read as being inside a vessel.
  polygon(ctx,[[124,112],[127,105],[130,105],[128,169],[125,174]],'#edfff13b');
  polygon(ctx,[[194,111],[197,111],[197,166],[193,174],[191,174]],'#bde9db33');
  ctx.strokeStyle='#e8ffeaad';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(147,61);ctx.lineTo(147,83);ctx.lineTo(130,96);ctx.lineTo(125,108);ctx.stroke();
  ctx.strokeStyle='#bfe4d485';ctx.beginPath();ctx.moveTo(130,178);ctx.lineTo(190,178);ctx.stroke();
  ctx.fillStyle='#d1b77f';ctx.fillRect(141,61,38,3);ctx.fillStyle='#8e805b';ctx.fillRect(141,64,38,1);
  ctx.fillStyle='#e1cf99a0';ctx.fillRect(157,157,6,1);ctx.fillRect(160,154,1,7);
  if(!sealed) {
    const releaseGlow=player.busy?Math.sin(Math.PI*p):Math.max(0,.25-player.elapsed/9000);
    glow(ctx,160,59,28,'238,235,167',releaseGlow*.45);
    if(single){if(flying&&flying.y<94)mote(ctx,flying,0);}
    else for(let i=0;i<14;i++) {
      const m=releasedMote(i,player);
      if(m.y<94)mote(ctx,m,i);
    }
    if(player.phase==='bottle-open')for(let i=0;i<3;i++)mote(ctx,{...bottleMote(i,player.elapsed,player.reducedMotion),alpha:.12},i);
  }
  if(sealed||((player.phase==='bottle-release'||player.phase==='bottle-release-one'&&player.releaseWasSealed)&&!player.reducedMotion)) {
    ctx.save();const lift=sealed?0:smooth(p/.55);
    ctx.translate(160+(sealed?0:Math.sin(lift*Math.PI)*12),49-lift*56);ctx.rotate(-lift*.6);
    ctx.globalAlpha=sealed?1:1-smooth((p-.65)/.35);
    ctx.fillStyle='#8f6e48';ctx.fillRect(-16,-8,32,17);ctx.fillStyle='#b08b57';ctx.fillRect(-14,-9,28,6);ctx.fillStyle='#c3a36c';ctx.fillRect(-12,-8,7,2);
    ctx.fillStyle='#705a3e';ctx.fillRect(-11,0,3,2);ctx.fillRect(5,-3,4,2);ctx.fillRect(1,5,6,1);ctx.restore();
  }
}

function wholeCup(ctx,alpha=1) {
  ctx.save();ctx.globalAlpha*=alpha;
  const gradient=ctx.createLinearGradient(124,0,196,0);
  gradient.addColorStop(0,'#cff4e357');gradient.addColorStop(.35,'#dafae61c');gradient.addColorStop(.8,'#93c6c22a');gradient.addColorStop(1,'#d4f3df6b');
  polygon(ctx,CUP,gradient,'#cfe6d2bb');
  ctx.strokeStyle='#f0ffe4d9';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(127,68);ctx.lineTo(193,68);ctx.moveTo(131,74);ctx.lineTo(135,103);ctx.lineTo(144,119);ctx.stroke();
  ctx.strokeStyle='#d8f5d8b3';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(160,139);ctx.lineTo(160,169);ctx.moveTo(132,173);ctx.lineTo(187,173);ctx.stroke();ctx.restore();
}

function magicCircle(ctx,p,reducedMotion) {
  const intensity=Math.sin(Math.PI*clamp(p));
  ctx.save();ctx.globalAlpha=intensity*.75;glow(ctx,160,188,94,'179,231,209',.18);
  ctx.strokeStyle='#c5e8c5';ctx.lineWidth=.7;
  for(const [rx,ry]of[[73,17],[61,13]]){ctx.beginPath();ctx.ellipse(160,188,rx,ry,0,0,Math.PI*2);ctx.stroke();}
  const turn=reducedMotion?0:p*1.4;
  for(let i=0;i<12;i++){
    const angle=i*Math.PI/6+turn,x=160+Math.cos(angle)*67,y=188+Math.sin(angle)*15;
    ctx.beginPath();ctx.moveTo(x-2,y-3);ctx.lineTo(x+2,y+3);ctx.moveTo(x+2,y-3);ctx.lineTo(x-2,y+3);ctx.stroke();
  }
  ctx.restore();
}

function cup(ctx,player) {
  const phase=player.phase,p=player.progress;
  if(['cup-whole','cup-restored'].includes(phase)) {
    if(phase==='cup-restored')glow(ctx,160,116,69,'220,248,211',Math.max(0,.3-player.elapsed/6000));
    wholeCup(ctx);
    if(phase==='cup-restored'&&player.elapsed<1400){const a=1-player.elapsed/1400;for(let i=0;i<5;i++)mote(ctx,{x:130+i*15,y:77+(i%2)*21,alpha:a*.6,size:1},i);}
    return;
  }
  if(phase==='cup-restore') {
    magicCircle(ctx,p,player.reducedMotion);
    // White mist is a guide around the shards; the pieces remain visible.
    const mist=Math.sin(Math.PI*p);
    for(let i=0;i<5;i++)glow(ctx,130+i*15,162-Math.sin(Math.PI*p)*(20+i*5),26,'238,250,229',mist*.18);
  }
  for(let i=0;i<CUP_SHARDS.length;i++) {
    const shard=CUP_SHARDS[i],pose=shardPose(i,player);
    if(phase==='cup-restore'&&!player.reducedMotion) {
      const prior=shardPose(i,{phase,progress:clamp(p-.07),reducedMotion:false});
      ctx.strokeStyle='#dbf2d45c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(prior.x,prior.y);ctx.quadraticCurveTo((prior.x+pose.x)/2,pose.y-8,pose.x,pose.y);ctx.stroke();
      glow(ctx,pose.x,pose.y,12,'211,245,213',Math.sin(Math.PI*p)*.22);
    }
    ctx.save();ctx.translate(pose.x,pose.y);ctx.scale(1,pose.scaleY);ctx.rotate(pose.angle);
    ctx.globalAlpha=phase==='cup-restore'?1-smooth((p-.82)/.18):1;
    polygon(ctx,shard.local,'#b6ddd348','#d4ecdcaf');
    const first=shard.local[0],second=shard.local[1];ctx.strokeStyle='#f0ffe1be';ctx.beginPath();ctx.moveTo(...first);ctx.lineTo(...second);ctx.stroke();ctx.restore();
  }
  if(phase==='cup-restore') {
    wholeCup(ctx,smooth((p-.78)/.22));
    for(let i=0;i<10;i++) {
      const angle=i*2.399+ (player.reducedMotion?0:p*3),radius=22+Math.sin(Math.PI*p)*37;
      mote(ctx,{x:160+Math.cos(angle)*radius,y:161-Math.sin(Math.PI*p)*51+Math.sin(angle)*17,alpha:Math.sin(Math.PI*p)*.4,size:1},i);
    }
  }
}

export function drawMagicEffect(canvas,player,{clear=true,placement='prop'}={}) {
  const ctx=canvas.getContext('2d');ctx.save();ctx.imageSmoothingEnabled=false;
  if(clear)ctx.clearRect(0,0,canvas.width,canvas.height);
  let scale=Math.min(canvas.width/320,canvas.height/240),x=canvas.width/2,y=canvas.height/2;
  if(placement==='preview'){scale*=1.05;if(player.kind==='cup')y-=17;}
  if(placement==='memory'){scale*=.78;x=canvas.width*.23;y=canvas.height*.64;}
  if(placement==='release'){scale*=1.05;y=canvas.height*.57;}
  ctx.translate(x,y);ctx.scale(scale,scale);ctx.translate(-160,-120);
  const shadow=ctx.createRadialGradient(160,192,2,160,192,77);shadow.addColorStop(0,'#182c2b22');shadow.addColorStop(1,'#182c2b00');ctx.fillStyle=shadow;ctx.fillRect(80,185,160,17);
  if(player.kind==='bottle')bottle(ctx,player);else cup(ctx,player);
  ctx.restore();
}
