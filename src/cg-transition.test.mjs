import test from 'node:test';
import assert from 'node:assert/strict';
import {CGTransition} from './cg-transition.mjs';
test('curtain changes the picture only under full cover and holds before revealing',()=>{
  const player=new CGTransition();let count=0;player.start(()=>count++,{between:true});
  player.update(325);assert.equal(count,0);assert.equal(player.opacity,.5);
  player.update(325);assert.equal(count,1);assert.equal(player.opacity,1);
  player.update(400);assert.equal(player.opacity,1);player.update(450);assert.equal(player.opacity,.5);
  player.update(450);assert.equal(player.busy,false);assert.equal(count,1);
});
test('pausing, canceling, replaying and reduced motion cannot fire an old picture change',()=>{
  for(const reducedMotion of [false,true]){
    const player=new CGTransition({reducedMotion});let old=0,next=0;player.start(()=>old++);player.update(50);
    const frozen=player.opacity;player.update(0);assert.equal(player.opacity,frozen);
    player.reset();player.update(10000);assert.equal(old,0);
    player.start(()=>next++);player.update(10000);assert.equal(next,1);assert.equal(player.opacity,0);
  }
});
