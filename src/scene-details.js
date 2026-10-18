// Decorative detail only: existing interaction points and collision geometry stay fixed.
const r=(ctx,color,x,y,w,h)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
export function detailInterior(ctx){
  // A partly open kitchen door reveals a small work surface and stacked dishes.
  r(ctx,'#433f37',533,46,39,72);r(ctx,'#9e9276',541,51,27,49);
  r(ctx,'#b7aa88',543,54,23,25);r(ctx,'#7c7158',541,79,27,4);
  r(ctx,'#6c634c',544,84,22,26);r(ctx,'#8d8062',546,87,18,20);
  for(const y of [65,69,73]){r(ctx,'#d7d7bf',551,y,14,2);r(ctx,'#f0e8cf',553,y-1,10,1);}
  r(ctx,'#a27e53',544,81,7,7);r(ctx,'#c4a06b',545,79,4,2);
  r(ctx,'#6b7058',534,47,7,70);r(ctx,'#a6a382',535,48,2,67);
  r(ctx,'#d7bd80',538,83,2,3);r(ctx,'#605442',528,119,49,3);
  r(ctx,'#d5c4a0',533,126,40,5);r(ctx,'#9c8c6e',533,131,40,2);
  for(let x=535;x<572;x+=5)r(ctx,'#b9a37b',x,128,2,2);
  // Folded seams, patched linen and a short tie make the apron recognizable.
  r(ctx,'#b8a98e',474,76,1,20);r(ctx,'#fff2d7',477,65,1,12);
  r(ctx,'#c6b89c',485,75,1,23);r(ctx,'#d0c1a3',472,100,18,2);
  r(ctx,'#c9b99c',483,91,5,6);r(ctx,'#eee2c6',484,92,3,4);
  r(ctx,'#b6a68b',469,82,5,1);r(ctx,'#b6a68b',490,82,5,1);
  // Window latches, fine curtains and a little meadow beyond the panes.
  for(const x of [270,373]){
    r(ctx,'#9b8e71',x+37,70,2,7);r(ctx,'#f9eed2',x+36,70,1,2);
    for(let j=0;j<4;j++)r(ctx,'#dfd4b7',x-5+j*2,38,1,60-j*3);
    r(ctx,'#809b76',x+8,95,25,2);r(ctx,'#b2c096',x+42,92,24,2);
    r(ctx,'#fff4d3',x-2,106,79,2);r(ctx,'#a18b69',x-5,109,85,3);
  }
  // All three settings remain three; a folded napkin and spoon add scale.
  for(const [x,y]of[[279,201],[378,201],[279,234]]){
    r(ctx,'#f5eed6',x-4,y-5,9,1);r(ctx,'#aa9b7e',x+16,y-6,1,10);
    r(ctx,'#e4ddc4',x+15,y-8,3,3);r(ctx,'#dfd3b6',x-17,y-7,5,10);
    r(ctx,'#b9ad90',x-16,y-6,1,8);
  }
  // Subtle worn boards near the earlier cup accident, with no un-restored shards.
  r(ctx,'#b49b75',537,143,10,1);r(ctx,'#d7be94',540,145,6,1);
  r(ctx,'#e0cca5',165,49,31,1);r(ctx,'#6d614a',142,97,61,2);
}

export function detailGate(ctx,{night=false}={}){
  // Flat inset stones follow the existing open route; no new blockers.
  const stones=[[318,181,9],[312,205,11],[325,227,8],[311,252,12],[329,281,14],[307,313,17],[343,341,13]];
  for(const [x,y,w]of stones){r(ctx,night?'#929b90':'#c1b18f',x,y,w,3);r(ctx,night?'#b0b5a2':'#e3cfaa',x+1,y,w-3,1);r(ctx,night?'#6d7c73':'#aa9e81',x+3,y+3,w-4,1);}
  for(const x of [31,70,109,148,187,421,460,499,538,577,616]){
    r(ctx,'#69745b',x,227,1,22);r(ctx,'#d0c19a',x+1,224,2,2);r(ctx,'#85856a',x+2,240,1,7);
  }
  // Small grass tufts and pale seed heads frame the path instead of filling it.
  for(const [x,y]of[[244,283],[270,218],[376,259],[398,315],[223,327],[426,291],[201,283],[469,316]]){
    r(ctx,night?'#586f67':'#738961',x,y-5,1,6);r(ctx,night?'#718275':'#97a376',x-2,y-3,1,4);r(ctx,night?'#7d8e7d':'#a6b184',x+2,y-4,1,5);
    r(ctx,night?'#a3ad97':'#e1d2a3',x,y-6,2,1);
  }
  // A restrained pool of lantern light; windows remain dark in the sleeping village.
  if(night){
    const light=ctx.createRadialGradient(247,236,2,247,236,30);light.addColorStop(0,'#f2d39b30');light.addColorStop(1,'#f2d39b00');ctx.fillStyle=light;ctx.fillRect(217,206,60,60);
    r(ctx,'#ffe9ad',244,228,4,9);r(ctx,'#e6c37c',242,238,9,1);
  }else{r(ctx,'#d7c49b',232,253,28,2);}
}
