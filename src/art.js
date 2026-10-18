import { drawElainaSprite } from './elaina-sprite.js';
import { drawVillagerSprite } from './villager-sprites.js';
import { detailInterior, detailGate } from './scene-details.js';
// Code-drawn scenes and NPC placeholders. Elaina has a dedicated pixel sprite.
function rect(ctx, color, x, y, w, h) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function polygon(ctx, color, points) {
  ctx.fillStyle = color; ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath(); ctx.fill();
}
function seededRandom(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

const trees = [[41, 185, 1.1], [82, 167, .95], [17, 264, 1.3], [54, 333, 1.25], [590, 189, 1.05], [625, 241, 1.3], [591, 322, 1.15], [548, 344, .8]];

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

function drawMeadowVillage(ctx) {
  drawHouse(ctx,485,147,.85,'#a58b65');drawHouse(ctx,532,143,.65,'#a39872');drawHouse(ctx,453,144,.58,'#9b8261');
  for(let x=438;x<565;x+=9){rect(ctx,'#9d9f76',x,152,2,12);rect(ctx,'#b6b18b',x,155,9,2);}
  rect(ctx,'#b7b08a',473,154,13,9);
}

export function createMeadow({withScenery=true} = {}) {
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
  // A narrow path winds toward the village exit.
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
  if(withScenery)drawMeadowVillage(ctx);
  // Small foreground stones and flower patches.
  [[205,191],[445,278],[174,307]].forEach(([x,y])=>{rect(ctx,'#8c9b7c',x,y,9,5);rect(ctx,'#bcc6a4',x+1,y-2,6,5);});
  if(withScenery)for (const [x,y,s] of trees) drawTree(ctx,x,y,s);
  return canvas;
}

export function drawSprite(ctx, actor, x, y, { moving = false, direction = 'down', time = 0 } = {}) {
  if(actor==='elaina'){drawElainaSprite(ctx,x,y,{moving,direction,time});return;}
  if(actor==='emil'||actor==='nino'){drawVillagerSprite(ctx,actor,x,y,{moving,direction,time});return;}
  ctx.save(); ctx.translate(Math.round(x),Math.round(y));
  rect(ctx,'#385d4630',-9,-1,19,4);
  const stride=moving?Math.round(Math.sin(time/105)*1.5):0;
  if(moving)ctx.translate(0,Math.abs(stride)===2?-1:0);
  {
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
  } else if(nino) {
    rect(ctx,'#e2d7bd',32,80,32,48);rect(ctx,'#f0e7d0',35,82,26,43);
    rect(ctx,'#bdb69e',35,109,26,2);rect(ctx,'#f3ead5',29,83,8,11);rect(ctx,'#f3ead5',61,83,8,11);
    rect(ctx,skin,22,116,8,10);rect(ctx,skin,68,116,8,10);
  } else if(chief) {
    polygon(ctx,'#e3d6b9',[[32,79],[48,89],[65,79],[60,95],[37,95]]);
    rect(ctx,'#475246',45,90,7,27);rect(ctx,'#bba575',47,103,3,3);rect(ctx,'#bba575',47,116,3,3);
    rect(ctx,'#8b8273',37,69,22,8);rect(ctx,'#8b8273',41,76,14,4);
  } else {
    rect(ctx,hair,24,26,46,12);rect(ctx,hairLight,30,24,31,10);rect(ctx,hair,25,37,7,12);rect(ctx,hair,62,34,8,13);
    rect(ctx,'#ede2c5',31,80,10,48);rect(ctx,'#ede2c5',58,80,8,48);
    polygon(ctx,'#7c966e',[[30,77],[50,84],[67,77],[64,89],[47,94],[30,88]]);rect(ctx,'#91a780',43,91,9,24);
    rect(ctx,'#c9dcd0',62,102,21,25);rect(ctx,'#dce8ce',65,104,10,20);rect(ctx,'#eaf0d7',68,109,9,4);rect(ctx,'#9a8358',67,97,12,6);
    rect(ctx,skin,58,117,12,8);rect(ctx,shade,58,123,10,3);
  }
  const smile = /smile|bright|smirk|confident|explaining/.test(expression), panic = /panic|surprised|terrified|flustered/.test(expression), down = /down|pout|blank/.test(expression);
  const eyes = elaina ? '#776187' : '#637256';
  if(smile) { rect(ctx,eyes,35,53,8,2);rect(ctx,eyes,53,53,8,2);rect(ctx,eyes,35,55,2,2);rect(ctx,eyes,59,55,2,2); }
  else { rect(ctx,'#fcf4df',34,51,10,6);rect(ctx,'#fcf4df',52,51,10,6);rect(ctx,eyes,38,51,4,panic?7:5);rect(ctx,eyes,54,51,4,panic?7:5);rect(ctx,'#45414b',35,50,9,2);rect(ctx,'#45414b',52,50,9,2); }
  if(down) { rect(ctx,hair,35,47,8,2);rect(ctx,hair,54,48,7,2); }
  rect(ctx,shade,46,59,3,2);rect(ctx,'#bd8b7d',44,65,9,2);
  if(smile)rect(ctx,'#bd8b7d',46,67,5,2);
  if(panic)rect(ctx,'#a66f64',46,64,5,5);
  if(/teary/.test(expression)){rect(ctx,'#b9d6ce',39,57,3,12);rect(ctx,'#b9d6ce',55,57,3,12);}
  if(/empty/.test(expression)){rect(ctx,'#514f53',36,51,7,6);rect(ctx,'#514f53',53,51,7,6);}
  if(/angry/.test(expression)){polygon(ctx,'#5a5148',[[33,46],[44,50],[44,53],[33,49]]);polygon(ctx,'#5a5148',[[63,46],[52,50],[52,53],[63,49]]);}
}

export function drawInterior(ctx) {
  rect(ctx,'#d9ccb0',0,0,640,360);
  rect(ctx,'#d2bd95',0,0,640,13);rect(ctx,'#8a7455',0,13,640,7);
  rect(ctx,'#e5d8b9',17,20,606,100);
  for(let x=23;x<620;x+=14)rect(ctx,'#d7ccae',x,25,1,85);
  for(const x of [12,222,444,620]){rect(ctx,'#937a55',x,20,8,106);rect(ctx,'#b49c70',x+1,21,3,102);}
  rect(ctx,'#8d7553',0,117,640,10);rect(ctx,'#b49a71',0,127,640,233);
  const random=seededRandom(42);
  for(let y=131;y<360;y+=19){
    rect(ctx,y%2?'#c1a87e':'#c8af85',19,y,602,17);
    for(let x=20+(y%3)*27;x<620;x+=80){rect(ctx,'#a88d66',x,y,1,17);rect(ctx,'#cfb990',x+9,y+8,28+Math.floor(random()*20),1);}
  }
  rect(ctx,'#80694f',14,122,5,238);rect(ctx,'#80694f',621,122,5,238);
  // Daylight windows, linen curtains and long quiet bands of light.
  for(const x of [270,373]){
    rect(ctx,'#a58d67',x-4,30,82,79);rect(ctx,'#eee4c8',x,33,74,72);
    rect(ctx,'#b8ccbb',x+5,37,64,62);rect(ctx,'#d5dfc5',x+7,39,60,24);
    polygon(ctx,'#8fad8c',[[x+5,90],[x+22,70],[x+43,83],[x+69,65],[x+69,99],[x+5,99]]);
    rect(ctx,'#f1e8cc',x+35,37,4,62);rect(ctx,'#f1e8cc',x+5,66,64,4);
    rect(ctx,'#ece3c7',x-7,30,12,73);rect(ctx,'#ece3c7',x+69,30,12,73);
    rect(ctx,'#d4c8a7',x-4,34,3,65);rect(ctx,'#d4c8a7',x+74,34,3,65);
    polygon(ctx,'#fff3cb1c',[[x,128],[x+71,128],[x+25,310],[x-95,310]]);
  }
  // The painting is an actual object on the back wall, above its interaction point.
  rect(ctx,'#8f7652',137,45,69,57);rect(ctx,'#c9af77',141,49,61,49);rect(ctx,'#dce3c1',146,54,51,39);
  polygon(ctx,'#9cb588',[[146,77],[161,63],[180,78],[197,65],[197,93],[146,93]]);
  polygon(ctx,'#7e9d70',[[146,88],[164,78],[179,87],[197,81],[197,93],[146,93]]);
  rect(ctx,'#efe8c0',184,59,6,5);
  // Kitchen door and an apron hanging nearby.
  rect(ctx,'#7e694e',526,39,53,81);rect(ctx,'#5c6250',532,45,41,74);
  for(let x=536;x<573;x+=9)rect(ctx,'#69705a',x,48,2,69);
  rect(ctx,'#c6ad78',538,79,3,3);rect(ctx,'#a18a63',523,118,60,8);
  rect(ctx,'#937b57',473,48,17,4);rect(ctx,'#79684d',480,48,3,11);
  polygon(ctx,'#e2d7bc',[[475,61],[487,61],[489,72],[495,79],[491,104],[470,104],[467,79],[474,71]]);
  rect(ctx,'#f2e9d0',476,63,9,14);rect(ctx,'#c0b292',479,83,3,19);rect(ctx,'#b6a98d',474,88,14,2);
  // Cupboard, stacked crockery and potted plants.
  rect(ctx,'#816b50',46,178,80,69);rect(ctx,'#a68b63',49,181,74,59);rect(ctx,'#c4ab7d',45,174,82,10);
  for(const x of [55,90]){rect(ctx,'#8d7453',x,190,27,44);rect(ctx,'#ba9b6e',x+2,192,23,39);rect(ctx,'#e1c58c',x+20,211,3,3);}
  rect(ctx,'#dcd7bb',60,168,25,5);rect(ctx,'#ece7cd',63,165,20,3);rect(ctx,'#c4c6aa',98,161,10,12);rect(ctx,'#eee8cf',99,159,8,3);
  const plant=(x,y)=>{
    rect(ctx,'#796e4f28',x-11,y,28,6);rect(ctx,'#aa8060',x-9,y-12,21,17);rect(ctx,'#c0976c',x-11,y-15,25,5);
    rect(ctx,'#69805c',x,y-42,3,29);rect(ctx,'#68845b',x-12,y-35,13,8);rect(ctx,'#809766',x+3,y-43,12,8);
    rect(ctx,'#69845d',x+2,y-26,16,8);rect(ctx,'#8da36c',x-14,y-45,14,7);rect(ctx,'#54734e',x-9,y-27,10,7);
  };
  plant(75,159);plant(568,221);
  // A woven rug and a large table with only three place settings.
  rect(ctx,'#8b795d25',210,160,237,144);rect(ctx,'#a88373',212,159,232,140);rect(ctx,'#c3a38a',216,163,224,132);
  rect(ctx,'#967964',221,168,214,122);rect(ctx,'#b49a7b',226,173,204,112);
  for(let x=216;x<440;x+=6){rect(ctx,'#c9ad8d',x,156,2,5);rect(ctx,'#c9ad8d',x,299,2,5);}
  const chair=(x,y)=>{rect(ctx,'#6e5a4533',x-1,y+6,28,20);rect(ctx,'#795e45',x,y,24,23);rect(ctx,'#b18a60',x+3,y+3,18,13);rect(ctx,'#d0ab76',x+3,y-3,18,7);};
  chair(266,163);chair(363,163);chair(266,259);chair(363,259);
  rect(ctx,'#715e4930',246,195,174,69);rect(ctx,'#866a4a',249,192,164,66);rect(ctx,'#b69160',245,184,170,65);
  rect(ctx,'#d3ad74',249,187,162,56);rect(ctx,'#e1bd87',251,189,158,3);
  for(let y=199;y<241;y+=13)rect(ctx,'#bc965f',253,y,154,1);
  rect(ctx,'#e1d6b9',313,187,33,57);rect(ctx,'#c9bb97',317,189,2,53);rect(ctx,'#c9bb97',341,189,2,53);
  for(const [x,y] of [[279,201],[378,201],[279,234]]){rect(ctx,'#b59c7733',x-10,y-5,22,12);rect(ctx,'#eee8d0',x-10,y-7,20,11);rect(ctx,'#d1d2b9',x-7,y-5,14,7);rect(ctx,'#eee8d0',x-4,y-3,8,3);rect(ctx,'#d4c8a7',x+14,y-7,2,11);}
  rect(ctx,'#b3bda2',325,206,10,18);rect(ctx,'#dee1c2',327,205,6,17);rect(ctx,'#d3bc8b',322,221,16,2);
  rect(ctx,'#5c7250',329,194,2,13);rect(ctx,'#e2c9aa',326,192,8,5);
  // Two readable floor exits.
  for(const x of [64,529]){rect(ctx,'#7c6b4f',x,335,45,7);rect(ctx,'#dcc395',x+2,337,41,3);}
  rect(ctx,'#c6b07e',70,310,33,21);rect(ctx,'#9d895f',73,314,27,13);
  rect(ctx,'#c6b07e',535,310,33,21);rect(ctx,'#9d895f',538,314,27,13);
  detailInterior(ctx);
}

function createCanvas(paint) {
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=360;
  const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;paint(ctx);return canvas;
}

function drawDuskSky(ctx,{night=false}={}) {
  const bands=night?['#18233a','#1d2943','#23314b','#29394f','#344453','#40525b']:['#b1a5b7','#c2adba','#d6b7b6','#e5c3ad','#edcda9','#dfc7ac'];
  bands.forEach((color,index)=>rect(ctx,color,0,index*22,640,23));
  if(night){
    rect(ctx,'#d9dfd5',451,59,23,21);rect(ctx,'#d9dfd5',456,54,14,31);rect(ctx,'#23314b',461,52,15,25);
    for(const [x,y]of[[44,23],[97,61],[161,35],[236,15],[306,47],[369,24],[530,36],[599,17]])rect(ctx,'#c5d4d6',x,y,1,1);
  } else {rect(ctx,'#f1d7ad',451,59,31,25);rect(ctx,'#f1d7ad',456,54,21,35);}
  polygon(ctx,'#a9a9a0',[[0,102],[65,81],[128,96],[195,72],[271,98],[337,76],[403,97],[479,84],[547,104],[640,82],[640,146],[0,146]]);
  polygon(ctx,'#8b9d8e',[[0,128],[91,107],[168,124],[244,101],[323,123],[409,105],[487,127],[566,110],[640,124],[640,159],[0,159]]);
}

function drawGate(ctx,{night=false}={}) {
  drawDuskSky(ctx,{night});rect(ctx,'#9fa584',0,149,640,211);
  polygon(ctx,'#aeb18d',[[0,165],[100,158],[205,173],[322,158],[430,177],[531,160],[640,174],[640,245],[0,245]]);
  polygon(ctx,'#c9b793',[[297,139],[342,139],[338,198],[358,275],[389,360],[248,360],[282,269],[303,195]]);
  polygon(ctx,'#d9c59e',[[307,139],[333,139],[330,203],[349,278],[374,360],[267,360],[293,271],[311,199]]);
  drawHouse(ctx,252,156,.85,'#9a8074');drawHouse(ctx,365,159,.7,'#9d8176');drawHouse(ctx,104,163,.6,'#9a8a77');drawHouse(ctx,492,166,.65,'#8c8174');
  for(const [start,end] of [[18,233],[410,624]])for(let x=start;x<end;x+=13){rect(ctx,'#7c7d65',x,225,4,27);rect(ctx,'#bab18b',x+1,223,2,27);rect(ctx,'#a6a07c',x,231,13,3);rect(ctx,'#a6a07c',x,243,13,3);}
  drawTree(ctx,176,263,1.55);drawTree(ctx,453,263,1.55);
  rect(ctx,'#6c725b',224,211,5,41);rect(ctx,'#a29471',228,212,27,3);
  rect(ctx,'#74745d',245,213,2,10);rect(ctx,'#887855',239,223,15,21);rect(ctx,'#e9ca85',242,226,9,14);rect(ctx,'#bba16d',238,222,17,3);rect(ctx,'#9b8359',241,243,11,3);
  const random=seededRandom(125);
  for(let i=0;i<400;i++){const x=Math.floor(random()*640),y=174+Math.floor(random()*186);if(Math.abs(x-320)<45)continue;rect(ctx,i%2?'#bac09a':'#8b9b77',x,y,2,1);if(i%19===0)rect(ctx,'#d6cfaa',x,y-2,2,2);}
  rect(ctx,'#8e78641a',0,0,640,360);
  detailGate(ctx,{night});
}

export function createSceneBackgrounds() {
  const meadow=createMeadow();
  const duskGround=createMeadow({withScenery:false});
  const duskScenery=createCanvas(ctx=>{
    drawMeadowVillage(ctx);
    for(const [x,y,s]of trees)drawTree(ctx,x,y,s);
    ctx.globalCompositeOperation='source-atop';rect(ctx,'#79557566',0,0,640,360);ctx.globalCompositeOperation='source-over';
  });
  return new Map([
    ['field_day',meadow],
    ['hall',createCanvas(drawInterior)],
    ['gate_dusk',createCanvas(drawGate)],
    ['gate_night',createCanvas(ctx=>drawGate(ctx,{night:true}))],
    ['field_dusk',createCanvas(ctx=>{ctx.drawImage(duskGround,0,0);rect(ctx,'#79557566',0,0,640,360);drawDuskSky(ctx);rect(ctx,'#dbc8a116',0,150,640,210);ctx.drawImage(duskScenery,0,0);})],
  ]);
}

export function drawAmbient(ctx,scene,time,reducedMotion) {
  if(reducedMotion)return;
  if(scene==='hall'){
    for(let i=0;i<9;i++){const x=250+(i*23+time/110)%180,y=142+(i*29+time/250)%126;rect(ctx,'#fff6cd70',Math.round(x),Math.round(y),1,1);}
  } else if(scene.includes('dusk')) {
    for(let i=0;i<12;i++){
      const x=70+(i*83)%510+Math.sin(time/1800+i)*5,y=187+(i*31)%137+Math.cos(time/1600+i)*4;
      const alpha=.15+Math.max(0,Math.sin(time/800+i))* .65;
      ctx.globalAlpha=alpha;rect(ctx,'#f4e5b4',Math.round(x),Math.round(y),2,2);ctx.globalAlpha=1;
    }
  } else {
    for(let i=0;i<5;i++){const x=(time/110+i*127)%660-10,y=176+(i*29)%130+Math.sin(time/1700+i)*4;rect(ctx,'#e2e7b877',Math.round(x),Math.round(y),3,1);}
  }
}
