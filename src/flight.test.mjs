import test from 'node:test';
import assert from 'node:assert/strict';
import {FlightPlayer} from './flight.mjs';

test('arrival reaches the player anchor, hovers through narration, then lands before exploration',()=>{
  const flight=new FlightPlayer(),point={x:281,y:245};flight.start('arrival',point);
  assert.ok(flight.busy);assert.equal(flight.snapshot().frame,'front');assert.ok(flight.snapshot().y<point.y);
  assert.equal(flight.land(),false,'cannot skip the approach by landing early');
  flight.update(3200);assert.equal(flight.phase,'hover');assert.equal(flight.busy,false);
  assert.equal(flight.snapshot().x,281);assert.equal(flight.snapshot().y,245);
  flight.update(20000);assert.equal(flight.phase,'hover','reading longer must not dismiss the rider');
  assert.equal(flight.land(),true);flight.update(275);
  assert.ok(flight.snapshot().lift<10);assert.equal(flight.snapshot().walkOpacity,.5);
  flight.update(275);assert.ok(flight.complete);assert.equal(flight.snapshot(),null);
});
test('departure takes off from the current anchor and fades into the distance before completion',()=>{
  const flight=new FlightPlayer();flight.start('departure',{x:469,y:201});
  assert.equal(flight.snapshot().frame,'back');assert.equal(flight.snapshot().lift,0);
  flight.update(450);assert.equal(flight.snapshot().lift,10);
  flight.update(2100);const far=flight.snapshot();
  assert.ok(far.x<469&&far.y<201&&far.scale<1&&far.opacity<1);assert.ok(flight.busy);
  flight.update(450);assert.ok(flight.complete);assert.equal(flight.active,false);
});
test('flight advances by elapsed time only, and reset cancels unfinished departures',()=>{
  const a=new FlightPlayer(),b=new FlightPlayer();a.start('departure',{x:469,y:201});b.start('departure',{x:469,y:201});
  a.update(1200);for(let i=0;i<12;i++)b.update(100);assert.deepEqual(a.snapshot(),b.snapshot());
  const still=a.snapshot();a.update(0);a.update(-1);assert.deepEqual(a.snapshot(),still);
  a.reset();assert.equal(a.snapshot(),null);a.update(5000);assert.equal(a.complete,false);
  a.start('arrival',{x:281,y:245});assert.equal(a.snapshot().frame,'front');assert.equal(a.time,0);
});
test('reduced motion uses short stationary arrival and departure changes',()=>{
  const flight=new FlightPlayer({reducedMotion:true});flight.start('arrival',{x:281,y:245});
  flight.update(200);assert.equal(flight.snapshot().x,281);assert.equal(flight.snapshot().y,245);assert.equal(flight.snapshot().lift,10);
  flight.update(250);assert.equal(flight.phase,'hover');flight.land();flight.update(180);assert.ok(flight.complete);
  flight.start('departure',{x:469,y:201});flight.update(225);const state=flight.snapshot();
  assert.equal(state.x,469);assert.equal(state.y,201);assert.equal(state.scale,1);assert.equal(state.opacity,.5);
  flight.update(225);assert.ok(flight.complete);
});
