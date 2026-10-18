// Small code-native pixel characters, grounded at (x,y), matching the portraits.
export function drawVillagerSprite(ctx,actor,x,y,{direction='down',moving=false,time=0}={}){
  const nino=actor==='nino',back=direction==='up',side=['left','right'].includes(direction);
  const stride=moving?[0,1,0,-1][Math.floor(time/145)%4]:0;
  const r=(color,x,y,w,h)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  const outline='#302c35',skin='#efd0af',skinShade='#d4a58c',linen='#eee2c5',linenShade='#cbbd9f';
  const hair=nino?'#292831':'#d7b659',hairLight=nino?'#42404b':'#f2d47f';
  const blue='#466c89',blueShade='#335269',rose='#ad7e8b',roseShade='#805d70';
  ctx.save();ctx.translate(Math.round(x),Math.round(y));
  r('#2b40322c',-8,0,17,3);
  if(direction==='left')ctx.scale(-1,1);
  // Two alternating planted feet; the anchor never floats during the walk cycle.
  const feet=nino?'#3d3031':'#513d30';
  r(outline,-5,-4,5,6);r(outline,1,-4,5,6);
  r(feet,-4,-3+Math.min(0,stride),3,4);r(feet,2,-3+Math.min(0,-stride),3,4);
  if(!nino){r('#929084',-5,-10,5,7);r('#75766e',1,-10,5,7);}
  const bodyTop=-18;
  if(nino){
    // Full skirt with a darker hem and restrained vertical folds.
    r(outline,-7,-11,15,10);r('#716358',-6,-11,13,9);r('#827367',-5,-10,4,7);
    r('#594e49',-6,-2,13,2);r('#62534d',2,-9,2,8);
    r(outline,-6,bodyTop,13,10);r(rose,-5,bodyTop,11,8);r(roseShade,3,bodyTop,3,8);
  }else{
    r(outline,-7,bodyTop,15,11);r(blue,-6,bodyTop,13,9);r(blueShade,3,bodyTop,4,9);
    r('#59422e',-6,-10,13,2);r('#c0aa79',0,-10,3,2);
  }
  // Linen sleeves swing in opposing directions, with small visible hands.
  r(outline,-8,-18+stride,4,10);r(linen,-7,-17+stride,3,7);r(skin,-7,-10+stride,3,2);
  r(outline,5,-18-stride,4,10);r(linenShade,6,-17-stride,2,7);r(skinShade,6,-10-stride,2,2);
  if(!back){
    r(linen,-3,-19,7,3);
    if(nino){r('#493b37',-2,-16,5,1);r('#493b37',0,-16,1,6);r('#d4b5b3',-1,-12,3,1);}
    else{r('#273946',-4,-19,3,3);r('#273946',2,-19,3,3);r('#d7b964',-3,-17,1,1);r('#d7b964',3,-17,1,1);}
  }
  // Head outline and hair silhouette.
  r(outline,-7,-30,14,13);r(hair,-6,-29,12,11);
  if(nino){
    r(linenShade,-8,-29,2,15);r(linen,-7,-31,13,3);r(linen,-8,-28,3,11);
    r(linenShade,6,-29,3,15);r(linen,5,-30,2,3);
    r(hair,-6,-22,3,9);r(hair,4,-22,3,9);
  }else{
    r(hairLight,-4,-30,8,3);r(hairLight,-6,-27,3,3);r('#b69543',4,-27,2,7);
  }
  if(!back){
    r(skin,side?-2:-5,-25,side?7:10,7);r(skinShade,side?4:3,-23,2,5);
    if(nino){
      r(hair,-5,-28,11,5);r(hair,0,-24,6,6);r(hairLight,1,-26,2,4);
      r('#a84e58',-4,-22,2,2);r('#f8e9d3',-4,-22,1,1);
    }else{
      r(hair,-6,-28,12,4);r('#b69543',-3,-26,1,2);r('#b69543',1,-26,1,2);
      r('#425a6c',side?2:-4,-22,2,2);if(!side)r('#425a6c',2,-22,2,2);
    }
    r('#b88979',side?3:-1,-18,2,1);
  }else{
    r(hairLight,-4,-27,2,6);
    if(nino){r(linen,-6,-30,11,3);r(linenShade,-5,-27,2,9);r(hair,-2,-26,7,10);}
  }
  // Side view narrows the far shoulder without changing the feet anchor.
  if(side){r(nino?roseShade:blueShade,-4,-17,3,7);r(linen,2,-17+stride,3,7);r(skin,2,-10+stride,3,2);}
  ctx.restore();
}
