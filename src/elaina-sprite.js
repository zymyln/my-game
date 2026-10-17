// Integer-pixel artwork, drawn once per direction/frame and reused on the map.
// Origin is the middle of the feet; movement and collision keep their old anchor.
const frames=new Map();
const flyingFrames=new WeakMap();
const C={ink:'#272431',coat:'#393342',coatLight:'#514456',fold:'#292734',lining:'#783248',
  gold:'#c7a25f',goldLight:'#edd18a',hair:'#d5c7dc',hairShade:'#a49bb9',hairLight:'#f1e6eb',
  skin:'#f4d9cd',skinShade:'#d5a9b4',eye:'#8963ba',white:'#fff1ec',hat:'#302b3c',
  hatLight:'#43364e',purple:'#734582',pink:'#d884ad',pinkLight:'#f2b1cb',blue:'#4dbfd0'};

function makeFrame(direction,phase){
  const canvas=document.createElement('canvas');canvas.width=36;canvas.height=48;
  const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
  const r=(color,x,y,w,h)=>{ctx.fillStyle=C[color]??color;ctx.fillRect(x,y,w,h);};
  // Fill polygons as horizontal runs, avoiding antialiased edges at this scale.
  const shape=(color,points)=>{
    const top=Math.min(...points.map(p=>p[1])),bottom=Math.max(...points.map(p=>p[1]));
    for(let y=top;y<bottom;y++){
      const hits=[];
      points.forEach(([x1,y1],i)=>{const[x2,y2]=points[(i+1)%points.length];if((y1<=y+.5&&y2>y+.5)||(y2<=y+.5&&y1>y+.5))hits.push(x1+(y+.5-y1)*(x2-x1)/(y2-y1));});
      hits.sort((a,b)=>a-b);
      for(let i=0;i<hits.length;i+=2)r(color,Math.ceil(hits[i]-.5),y,Math.ceil(hits[i+1]-.5)-Math.ceil(hits[i]-.5),1);
    }
  };
  const side=direction==='left'||direction==='right',back=direction==='up';
  const stride=[0,1,0,-1][phase],bob=phase%2;
  if(direction==='left'){ctx.translate(36,0);ctx.scale(-1,1);}
  // Boots stay grounded while the torso lifts by one pixel on passing steps.
  r('ink',side?17:12,41-stride,side?5:4,5);
  r('ink',side?14:21,41+stride,4,5);
  r('coatLight',side?18:13,42-stride,2,2);r('coatLight',side?15:22,42+stride,2,2);
  r('gold',side?17:12,45-stride,5,1);r('gold',side?14:21,45+stride,4,1);
  ctx.save();ctx.translate(0,-bob);
  // Burgundy lining peeks out below a dark, flared travelling cloak.
  shape('ink',[[12,25],[24,25],[29+stride,40],[25,44],[10,44],[7-stride,40]]);
  shape('lining',[[12,28],[24,28],[27+stride,40],[24,42],[10,42],[9-stride,40]]);
  shape('coat',[[12,25],[24,25],[26,35],[25,41],[11,41],[10,35]]);
  shape('fold',[[17,31],[20,31],[22,42],[15,42]]);
  r('coatLight',12,34,2,6);r('coatLight',23,34,1,6);
  // Hair falls behind the face, with independent tips on either side.
  shape('ink',[[11,16],[24,16],[25,24],[27+stride,32],[24,34],[20,27],[12,33],[9-stride,31]]);
  shape('hairShade',[[12,17],[23,17],[24,25],[26+stride,31],[24,32],[20,25],[12,31],[10-stride,30]]);
  r('hair',11,19,3,10);r('hairLight',12,20,1,8);r('hair',22,19,2,11);
  if(back){
    // Back of the hat and silver hair obscure the face and collar.
    shape('hair',[[12,18],[23,18],[23,27],[21,31],[15,32],[12,28]]);
    r('hairLight',14,20,2,9);r('hairShade',19,21,2,9);r('hairLight',22,23,1,6);
    shape('coatLight',[[10,29],[14,31],[18,33],[23,30],[26,31],[25,35],[18,36],[10,34]]);
    r('gold',11,34,4,1);r('gold',20,35,4,1);
    r('skinShade',9,34+stride,2,3);r('skin',25,34-stride,2,3);
  }else if(side){
    shape('skinShade',[[17,17],[23,17],[24,21],[26,22],[24,24],[20,25],[17,23]]);
    r('skin',19,18,4,5);r('skin',23,21,2,2);r('ink',22,20,2,1);r('eye',23,21,1,1);
    r('hair',14,17,5,10);r('hairLight',15,18,2,8);r('hairShade',18,23,2,6);
    r('gold',18,27,2,1);r('hair',18,28,2,3);
    shape('coatLight',[[19,26],[24,28],[26,34+stride],[22,36+stride],[20,32]]);
    r('gold',23,30,1,4);r('skin',23,35+stride,2,2);
    r('white',22,26,2,3);r('blue',23,27,1,2);
  }else{
    r('skinShade',13,17,10,8);r('skin',14,17,8,7);
    r('white',14,20,3,2);r('white',20,20,2,2);
    r('ink',14,19,3,1);r('ink',20,19,2,1);
    r('eye',15,20,2,2);r('eye',20,20,2,2);r('white',15,20,1,1);r('white',20,20,1,1);
    r('skinShade',18,23,2,1);
    shape('hair',[[12,16],[23,16],[23,19],[21,18],[20,21],[18,18],[17,20],[15,18],[13,22]]);
    r('hairLight',14,16,6,1);r('hair',11,20,2,8);r('hairLight',11,21,1,5);
    r('hair',23,20,2,7);r('hairShade',22,25,2,3);r('gold',22,28,2,1);r('hairLight',22,29,2,3);
    r('white',16,25,4,8);r('hairShade',18,28,1,4);
    shape('coatLight',[[11,25],[15,26],[16,30],[13,34+stride],[9,33+stride]]);
    shape('coatLight',[[23,25],[20,27],[20,31],[23,34-stride],[27,33-stride]]);
    r('gold',12,28,1,5);r('gold',24,28,1,4);
    r('skin',10,34+stride,2,2);r('skin',25,34-stride,2,2);
    r('gold',17,26,3,3);r('blue',18,26,1,2);r('blue',17,29,1,2);r('blue',20,29,1,2);
    r('gold',23,29,2,2);r('goldLight',24,29,1,1);
  }
  // Wide purple underside, asymmetric bent crown, and a pink woven band.
  shape('ink',[[2,15],[7,13],[12,12],[25,12],[31,15],[34,17],[31,20],[24,20],[13,18],[5,18]]);
  shape('purple',[[3,15],[12,14],[25,14],[32,17],[30,19],[24,19],[13,17],[5,17]]);
  shape('hat',[[9,14],[11,8],[14,2],[18,1],[23,5],[27,5],[28,9],[25,10],[21,7],[23,14]]);
  shape('hatLight',[[12,9],[15,3],[17,2],[18,6],[17,11]]);
  shape('pink',[[10,11],[12,9],[21,11],[23,13],[23,15],[10,13]]);
  r('pinkLight',12,10,3,1);r('pinkLight',15,11,4,1);r('pinkLight',19,12,3,1);
  r('pinkLight',11,12,2,1);r('pinkLight',15,13,3,1);r('pinkLight',20,14,2,1);
  shape('hat',[[3,14],[10,12],[15,13],[23,15],[29,15],[33,17],[26,17],[14,15],[6,15]]);
  r('gold',27,9,1,3);r('goldLight',28,12,1,2);r('gold',28,14,2,2);r('goldLight',29,14,1,1);
  ctx.restore();return canvas;
}

export function drawElainaSprite(ctx,x,y,{moving=false,direction='down',time=0}={}){
  if(!['up','down','left','right'].includes(direction))direction='down';
  const phase=moving?Math.floor(time/140)%4:0,key=`${direction}:${phase}`;
  if(!frames.has(key))frames.set(key,makeFrame(direction,phase));
  ctx.save();ctx.imageSmoothingEnabled=false;
  ctx.fillStyle='#293d4030';ctx.fillRect(Math.round(x)-9,Math.round(y),18,3);
  ctx.fillRect(Math.round(x)-6,Math.round(y)-1,12,1);
  ctx.drawImage(frames.get(key),Math.round(x)-18,Math.round(y)-46);ctx.restore();
}

export function drawElainaFlight(ctx,image,state){
  if(!image||!state)return;
  if(!flyingFrames.has(image)){
    const frame=document.createElement('canvas');frame.width=64;frame.height=48;
    const paint=frame.getContext('2d');paint.imageSmoothingEnabled=false;
    paint.drawImage(image,0,0,64,48);flyingFrames.set(image,frame);
  }
  const x=Math.round(state.x),y=Math.round(state.y),width=Math.round(64*state.scale),height=Math.round(48*state.scale);
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha*=state.opacity;
  ctx.fillStyle='#293d4030';const shadow=Math.round(19*state.scale);
  ctx.fillRect(x-shadow,y-1,shadow*2,3);ctx.fillRect(x-shadow+5,y-2,Math.max(3,shadow*2-10),1);
  ctx.drawImage(flyingFrames.get(image),x-Math.round(width/2),y-Math.round(state.lift*state.scale)-height,width,height);
  ctx.restore();
}
