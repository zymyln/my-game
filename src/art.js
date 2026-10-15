// Code-drawn placeholders. Replace portraits/backgrounds through assets/manifest.json.
function rect(ctx, color, x, y, w, h) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function polygon(ctx, color, points) {
  ctx.fillStyle = color; ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath(); ctx.fill();
}
function seededRandom(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

export const NPC = Object.freeze({ x: 378, y: 202 });
export const START = Object.freeze({ x: 281, y: 245 });
const trees = [[41, 185, 1.1], [82, 167, .95], [17, 264, 1.3], [54, 333, 1.25], [590, 189, 1.05], [625, 241, 1.3], [591, 322, 1.15], [548, 344, .8]];
const obstacles = [{ x: 79, y: 238, w: 84, h: 27 }, ...trees.map(([x, y]) => ({ x: x - 8, y: y - 10, w: 16, h: 16 }))];

export function canStand(x, y) {
  return x >= 26 && x <= 614 && y >= 151 && y <= 338 && !obstacles.some(b => x + 6 > b.x && x - 6 < b.x + b.w && y > b.y && y - 5 < b.y + b.h) && Math.hypot(x - NPC.x, y - NPC.y) > 14;
}
export function isNearNPC(player) { return Math.hypot(player.x - NPC.x, player.y - NPC.y) < 43; }

function drawTree(ctx, x, y, scale) {
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(scale, scale);
  rect(ctx, '#718f653c', -20, 0, 44, 8);
  rect(ctx, '#806e4b', -4, -34, 8, 36); rect(ctx, '#a39063', -2, -31, 3, 30);
  rect(ctx, '#4c7753', -21, -44, 43, 16); rect(ctx, '#4c7753', -26, -57, 53, 18);
  rect(ctx, '#5e8b59', -23, -72, 47, 24); rect(ctx, '#5e8b59', -14, -83, 31, 25);
  rect(ctx, '#709a61', -15, -78, 26, 23); rect(ctx, '#709a61', -21, -65, 18, 17);
  rect(ctx, '#83aa6b', -10, -78, 15, 7); rect(ctx, '#83aa6b', -17, -62, 10, 5);
  rect(ctx, '#638958', 11, -63, 12, 14); rect(ctx, '#436d4e', 6, -39, 14, 9);
  ctx.restore();
}
function drawHouse(ctx, x, y, scale, roof) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  rect(ctx, '#82906855', -5, 1, 51, 7); rect(ctx, '#e4d8ac', 0, -29, 42, 33);
  rect(ctx, '#c7bd93', 0, -4, 42, 8); rect(ctx, '#ac8b66', 4, -28, 3, 32); rect(ctx, '#ac8b66', 35, -28, 3, 32);
  polygon(ctx, roof, [[-5,-27],[20,-49],[47,-27]]); rect(ctx, '#6f6d52', -5, -27, 52, 3);
  rect(ctx, '#a89b77', 18, -14, 10, 18); rect(ctx, '#6f775b', 20, -12, 7, 16);
  rect(ctx, '#7d8f76', 7, -18, 7, 8); rect(ctx, '#eddfac', 8, -17, 4, 4);
  rect(ctx, '#7d8f76', 30, -18, 6, 8); rect(ctx, '#eddfac', 31, -17, 3, 4);
  rect(ctx, '#c5b48b', 31, -45, 5, 13); ctx.restore();
}

export function createMeadow() {
  const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 360;
  const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
  rect(ctx, '#dbe8cd', 0, 0, 640, 360);
  rect(ctx, '#e8ecd3', 0, 0, 640, 35); rect(ctx, '#e0e8ce', 0, 35, 640, 35);
  rect(ctx, '#f5eed2', 477, 26, 22, 18); rect(ctx, '#f5eed2', 481, 22, 14, 26);
  [[71,29,61],[252,20,43],[543,52,49]].forEach(([x,y,w]) => { rect(ctx, '#f1f0db', x, y, w, 6); rect(ctx, '#f1f0db', x+9, y-4, w-22, 13); });
  polygon(ctx, '#bbd1b4', [[0,91],[36,75],[89,72],[115,59],[171,76],[214,63],[263,80],[311,56],[354,71],[401,61],[469,79],[520,62],[572,80],[640,68],[640,145],[0,145]]);
  polygon(ctx, '#a6c29c', [[0,116],[57,103],[98,112],[157,85],[224,102],[287,91],[345,108],[413,92],[471,110],[546,93],[603,107],[640,100],[640,160],[0,160]]);
  polygon(ctx, '#8fb48a', [[0,134],[76,122],[146,136],[222,111],[298,129],[371,116],[454,133],[526,119],[586,131],[640,125],[640,170],[0,170]]);
  rect(ctx, '#a3bf89', 0, 147, 640, 213);
  polygon(ctx, '#b2c996', [[0,154],[91,145],[182,160],[274,144],[366,160],[468,145],[560,158],[640,148],[640,232],[559,224],[488,239],[397,219],[304,232],[233,218],[136,235],[62,219],[0,236]]);
  polygon(ctx, '#abc58d', [[0,270],[94,256],[170,279],[258,263],[340,280],[416,255],[515,274],[640,258],[640,360],[0,360]]);
  // A narrow path winds toward a village that is scenery in this first slice.
  polygon(ctx, '#c9c597', [[180,360],[228,315],[279,286],[305,263],[355,244],[402,215],[425,181],[456,161],[485,148],[492,152],[465,169],[441,190],[420,226],[370,257],[322,275],[300,301],[253,329],[224,360]]);
  polygon(ctx, '#d7cda0', [[192,360],[240,317],[289,289],[314,267],[361,249],[410,219],[433,185],[460,166],[487,150],[490,152],[463,169],[439,189],[417,224],[365,253],[319,272],[295,295],[246,323],[214,360]]);
  const random = seededRandom(1024);
  for (let i = 0; i < 1200; i++) {
    const x = Math.floor(random()*640), y = 151 + Math.floor(random()*209);
    if (x > 185 && x < 445 && y > 216 && Math.abs(x - (560 - y)) < 45) continue;
    const color = ['#92b47c','#b9ce9a','#a4c18b','#8caf79'][i%4];
    rect(ctx, color, x, y, i%3 === 0 ? 3 : 2, 1);
    if (i%4===0) rect(ctx, color, x+1, y-2, 1, 2);
    if (i%17===0) { rect(ctx, '#7fa56f', x, y-2, 1, 3); rect(ctx, i%34===0?'#f0dfb2':'#e4e9ca', x-1, y-3, 3, 2); }
  }
  // A little still pool, with square pixel edges rather than a smooth vector oval.
  rect(ctx, '#8bab83', 78, 241, 86, 23); rect(ctx, '#91b4a0', 83, 239, 76, 23);
  rect(ctx, '#a6c4ac', 90, 236, 59, 28); rect(ctx, '#86ae9c', 83, 247, 76, 9);
  [[93,243,17],[121,251,21],[101,258,13]].forEach(([x,y,w])=>rect(ctx,'#d0dfc2',x,y,w,1));
  drawHouse(ctx, 485, 147, .85, '#a58b65'); drawHouse(ctx, 532, 143, .65, '#a39872'); drawHouse(ctx, 453, 144, .58, '#9b8261');
  for (let x=438;x<565;x+=9) { rect(ctx,'#9d9f76',x,152,2,12); rect(ctx,'#b6b18b',x,155,9,2); }
  rect(ctx,'#b7b08a',473,154,13,9);
  // Small foreground stones and flower patches.
  [[205,191],[445,278],[174,307]].forEach(([x,y])=>{rect(ctx,'#8c9b7c',x,y,9,5);rect(ctx,'#bcc6a4',x+1,y-2,6,5);});
  for (const [x,y,s] of trees) drawTree(ctx,x,y,s);
  return canvas;
}

export function drawSprite(ctx, actor, x, y, { moving = false, direction = 'down', time = 0 } = {}) {
  ctx.save(); ctx.translate(Math.round(x),Math.round(y));
  rect(ctx,'#385d4630',-9,-1,19,4);
  const step = moving ? Math.floor(time/125)%2 : 0;
  if (actor === 'elaina') {
    rect(ctx,'#474450',-6,-13,12,12); rect(ctx,'#686072',-7,-14,14,5);
    rect(ctx,'#ddd9d0',-6,-23,12,14); rect(ctx,'#eeeadb',-3,-22,6,12);
    rect(ctx,'#f3d8bb',-4,-20,8,7);
    if(direction !== 'up') { rect(ctx,'#665777',direction==='left'?-4:direction==='right'?2:-3,-18,2,2); if(direction==='down')rect(ctx,'#665777',2,-18,2,2); }
    else rect(ctx,'#dedcd3',-5,-21,10,11);
    rect(ctx,'#4e4a59',-9,-25,18,3); rect(ctx,'#575160',-6,-30,11,6);rect(ctx,'#575160',-3,-34,6,5);rect(ctx,'#575160',-1,-36,3,3);
    rect(ctx,'#a9986c',-6,-26,12,2);rect(ctx,'#d7d1bf',4,-27,3,3);
    rect(ctx,'#d5cab5',-4,-11,8,2);rect(ctx,'#b8a16c',-1,-10,2,3);
    rect(ctx,'#39383f',-4,-2,3,3+step);rect(ctx,'#39383f',2,-2,3,4-step);
    rect(ctx,'#776951',6,-14,3,11);rect(ctx,'#b29c6a',5,-5,6,3);
  } else {
    rect(ctx,'#c6b37d',-5,-15,10,12);rect(ctx,'#eee0b5',-6,-15,3,9);rect(ctx,'#eee0b5',4,-15,3,9);
    rect(ctx,'#e7c49d',-5,-23,10,9);rect(ctx,'#90734c',-6,-25,12,5);rect(ctx,'#aa8956',-4,-27,9,5);rect(ctx,'#b69760',-6,-24,5,4);
    rect(ctx,'#526c50',-3,-20,2,2);rect(ctx,'#526c50',2,-20,2,2);rect(ctx,'#809773',-4,-15,8,3);
    rect(ctx,'#6a6d54',-4,-4,3,5);rect(ctx,'#6a6d54',2,-4,3,5);
    rect(ctx,'#c6ded0',6,-16,6,10);rect(ctx,'#eef2cb',7,-14,3,6);rect(ctx,'#a18b5a',7,-18,4,3);
  }
  ctx.restore();
}

export function drawPortrait(canvas, actor, expression = '') {
  const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,96,128);ctx.imageSmoothingEnabled=false;
  const elaina = actor === 'elaina';
  const chief = actor === 'chief';
  const nino = actor === 'nino';
  const hair = elaina ? '#dcdcd9' : nino ? '#b68b69' : chief ? '#70665b' : '#b18d57';
  const hairLight = elaina ? '#f0eee5' : nino ? '#c6a184' : '#c7a46c';
  const coat = elaina ? '#595363' : nino ? '#5d6869' : chief ? '#64705a' : '#ac9565';
  const skin = '#edcbaa', shade = '#d8ad8b';
  // The busts are deliberately simple placeholders, with consistent framing.
  rect(ctx, '#344e3b18', 14, 120, 68, 6);
  if(elaina || nino) { rect(ctx,hair,22,36,52,62);rect(ctx,hairLight,25,44,9,60);rect(ctx,hairLight,66,46,7,58); }
  rect(ctx,coat,27,80,43,48);rect(ctx,coat,17,91,63,37);
  rect(ctx,elaina?'#6e6876':'#c1ab7b',18,92,9,36);rect(ctx,elaina?'#474451':'#99855d',70,94,10,34);
  rect(ctx,skin,40,68,18,17);rect(ctx,shade,40,69,18,6);
  rect(ctx,skin,29,35,38,36);rect(ctx,skin,33,31,30,44);
  rect(ctx,shade,29,51,4,14);rect(ctx,shade,63,48,4,20);
  rect(ctx,hair,25,29,45,14);rect(ctx,hairLight,30,29,31,8);
  rect(ctx,hair,25,39,8,16);rect(ctx,hair,62,37,8,17);rect(ctx,hair,33,36,8,8);rect(ctx,hair,47,36,13,6);
  rect(ctx,hairLight,32,32,10,6);rect(ctx,hairLight,48,31,12,5);
  if(elaina) {
    rect(ctx,'#4c4858',9,29,78,7);rect(ctx,'#5c5768',20,17,56,14);rect(ctx,'#5c5768',29,8,40,11);rect(ctx,'#5c5768',38,0,26,11);
    rect(ctx,'#70697a',31,12,11,10);rect(ctx,'#c0ab72',21,23,53,5);rect(ctx,'#ddd5bd',63,21,9,9);rect(ctx,'#77707c',65,23,5,5);
    rect(ctx,'#ebe4d3',30,81,36,5);polygon(ctx,'#f1ebda',[[29,79],[45,84],[40,96]]);polygon(ctx,'#ddd5c6',[[67,79],[51,84],[56,96]]);
    rect(ctx,'#ae9560',45,86,8,5);rect(ctx,'#ccb985',48,91,3,8);rect(ctx,'#79717f',37,103,3,25);
  } else {
    rect(ctx,hair,24,26,46,12);rect(ctx,hairLight,30,24,31,10);rect(ctx,hair,25,37,7,12);rect(ctx,hair,62,34,8,13);
    rect(ctx,'#ede2c5',31,80,10,48);rect(ctx,'#ede2c5',58,80,8,48);
    polygon(ctx,'#7c966e',[[30,77],[50,84],[67,77],[64,89],[47,94],[30,88]]);rect(ctx,'#91a780',43,91,9,24);
    rect(ctx,'#c9dcd0',62,102,21,25);rect(ctx,'#dce8ce',65,104,10,20);rect(ctx,'#eaf0d7',68,109,9,4);rect(ctx,'#9a8358',67,97,12,6);
    rect(ctx,skin,58,117,12,8);rect(ctx,shade,58,123,10,3);
  }
  const smile = /smile|bright|smirk/.test(expression), panic = /panic|surprised|terrified/.test(expression), down = /down|pout|blank/.test(expression);
  const eyes = elaina ? '#776187' : '#637256';
  if(smile) { rect(ctx,eyes,35,53,8,2);rect(ctx,eyes,53,53,8,2);rect(ctx,eyes,35,55,2,2);rect(ctx,eyes,59,55,2,2); }
  else { rect(ctx,'#fcf4df',34,51,10,6);rect(ctx,'#fcf4df',52,51,10,6);rect(ctx,eyes,38,51,4,panic?7:5);rect(ctx,eyes,54,51,4,panic?7:5);rect(ctx,'#45414b',35,50,9,2);rect(ctx,'#45414b',52,50,9,2); }
  if(down) { rect(ctx,hair,35,47,8,2);rect(ctx,hair,54,48,7,2); }
  rect(ctx,shade,46,59,3,2);rect(ctx,'#bd8b7d',44,65,9,2);
  if(smile)rect(ctx,'#bd8b7d',46,67,5,2);
  if(panic)rect(ctx,'#a66f64',46,64,5,5);
}

export function drawInterior(ctx) {
  rect(ctx,'#c2b393',0,0,640,360);rect(ctx,'#e4d9ba',0,0,640,190);
  for(let x=0;x<640;x+=64)rect(ctx,'#98866a',x,0,7,190);
  rect(ctx,'#877257',0,185,640,8);
  for(let y=203;y<360;y+=24)rect(ctx,'#ae9d7c',0,y,640,2);
  for(const x of [94,440]) {rect(ctx,'#948a6c',x,38,90,112);rect(ctx,'#b6c8b0',x+5,43,80,102);rect(ctx,'#e3dcba',x+43,43,4,102);rect(ctx,'#e3dcba',x+5,90,80,4);}
  rect(ctx,'#9a805b',189,238,264,22);rect(ctx,'#d4c39a',194,235,254,17);rect(ctx,'#8b7354',202,260,12,66);rect(ctx,'#8b7354',426,260,12,66);
}
