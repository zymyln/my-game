import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryPlayer } from './memory.mjs';

test('each memory waits for one light, fades in, and gives two full seconds to read',()=>{
  const player=new MemoryPlayer();player.start(1);
  assert.equal(player.phase,'release');assert.equal(player.opacity,0);assert.equal(player.next(),false);
  player.update(1800);assert.equal(player.phase,'fade-in');assert.equal(player.opacity,0);
  player.update(425);assert.equal(player.opacity,.5);assert.equal(player.next(),false);
  player.update(425);assert.equal(player.phase,'reading');assert.equal(player.opacity,1);
  player.update(1999);assert.equal(player.ready,false);player.update(1);assert.equal(player.ready,true);
});

test('clicking continues through a full fade-out and repeated input cannot skip a memory',()=>{
  const player=new MemoryPlayer();player.start(1);player.update(4650);
  assert.equal(player.next(),true);assert.equal(player.opacity,1);
  player.update(350);assert.equal(player.opacity,.5);assert.equal(player.next(),false);
  player.update(349);assert.equal(player.phase,'fade-out');assert.ok(player.opacity>0);
  player.update(1);assert.equal(player.phase,'complete');assert.equal(player.opacity,0);
  player.start(2);assert.equal(player.phase,'release');assert.equal(player.next(),false);
});

test('all six cycles use a fresh single release and the bottle stays full and open',()=>{
  const player=new MemoryPlayer();
  for(let number=1;number<=6;number++){
    player.start(number);assert.equal(player.bottle.phase,'bottle-release-one');
    assert.equal(player.bottle.releaseWasSealed,number===1);
    player.update(4650);assert.equal(player.bottle.phase,'bottle-open-full');assert.equal(player.ready,true);
    player.next();player.update(700);assert.equal(player.phase,'complete');
  }
});

test('elapsed timing is deterministic, pause leaves fades still, and reset cancels pending exit',()=>{
  const a=new MemoryPlayer(),b=new MemoryPlayer();a.start(1);b.start(1);
  a.update(2225);for(let i=0;i<89;i++)b.update(25);
  assert.equal(a.opacity,b.opacity);assert.equal(a.phase,b.phase);
  const snapshot=[a.elapsed,a.opacity,a.bottle.bottleTime];a.update(0);a.update(-1);a.update(NaN);
  assert.deepEqual([a.elapsed,a.opacity,a.bottle.bottleTime],snapshot);
  a.reset();a.update(10000);assert.equal(a.phase,'idle');assert.equal(a.number,0);assert.equal(a.opacity,0);
});

test('reduced motion still fades both ways and keeps the full reading time',()=>{
  const player=new MemoryPlayer({reducedMotion:true});player.start(1);
  player.update(700);assert.equal(player.phase,'fade-in');player.update(175);assert.equal(player.opacity,.5);
  player.update(175);assert.equal(player.phase,'reading');player.update(1999);assert.equal(player.next(),false);
  player.update(1);assert.equal(player.next(),true);player.update(175);assert.equal(player.opacity,.5);
  player.update(175);assert.equal(player.phase,'complete');
});
