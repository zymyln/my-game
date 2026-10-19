import test from 'node:test';
import assert from 'node:assert/strict';
import {FastForward} from './fast-forward.mjs';
test('hold and click fast-forward stop at choice, pause, exploration and title',()=>{
  for(const blocked of ['choice','pause','explore','inspect','title','complete']){
    const fast=new FastForward();fast.hold('dialogue');assert.equal(fast.scale,8);
    fast.enter(blocked);assert.equal(fast.active,false);assert.equal(fast.scale,1);
    fast.hold(blocked);assert.equal(fast.active,false);
  }
  const fast=new FastForward();fast.toggle('memory');assert.equal(fast.active,true);
  fast.toggle('memory');assert.equal(fast.active,false);
  fast.hold('dialogue');fast.release();assert.equal(fast.active,false);
});
test('fast-forward advances once per interval, respects locks and never bursts after a stalled frame',()=>{
  const fast=new FastForward();fast.hold('dialogue');
  const state={mode:'dialogue',token:'line-1',ready:true};
  assert.equal(fast.update(10000,state),false);
  assert.equal(fast.update(50,state),false);assert.equal(fast.update(50,state),false);assert.equal(fast.update(50,state),true);
  assert.equal(fast.update(50,{...state,token:'line-2'}),false);
  for(let i=0;i<8;i++)assert.equal(fast.update(50,{...state,ready:false}),false);
  fast.enter('transition');assert.equal(fast.active,true);
  fast.enter('choice');assert.equal(fast.update(1000,{...state,mode:'choice'}),false);
});
