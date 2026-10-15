import test from 'node:test';
import assert from 'node:assert/strict';
import { MagicPlayer, CUP_SHARDS, DURATIONS, shardPose, bottleMote, releasedMote } from './magic.mjs';

test('repeated narrative cues do not restart a shatter or prematurely restore glass',()=>{
  const player=new MagicPlayer();player.select('cup');
  assert.equal(player.trigger('restore'),false);assert.equal(player.trigger('shatter'),true);
  player.update(800);assert.equal(player.trigger('shatter'),false);assert.equal(player.elapsed,800);
  player.update(DURATIONS.shatter-800);assert.equal(player.phase,'cup-broken');
  assert.equal(player.trigger('restore'),true);player.update(DURATIONS.restore);assert.equal(player.phase,'cup-restored');
});
test('the same shards land on the floor and return to their original cup coordinates',()=>{
  const player=new MagicPlayer();player.select('cup');player.trigger('shatter');
  for(let i=0;i<CUP_SHARDS.length;i++)assert.deepEqual(shardPose(i,player),{...CUP_SHARDS[i].home,angle:0,scaleY:1});
  player.update(DURATIONS.shatter);
  const scattered=CUP_SHARDS.map((_,i)=>shardPose(i,player));
  player.trigger('restore');
  assert.deepEqual(CUP_SHARDS.map((_,i)=>shardPose(i,player)),scattered);
  for(let time=0;time<DURATIONS.restore;time+=100){player.update(100);for(let i=0;i<CUP_SHARDS.length;i++)assert.ok(Object.values(shardPose(i,player)).every(Number.isFinite));}
  for(let i=0;i<CUP_SHARDS.length;i++)assert.deepEqual(shardPose(i,player),{...CUP_SHARDS[i].home,angle:0,scaleY:1});
});
test('bottle motes stay in the body while sealed and a release opens only once',()=>{
  for(let time=0;time<12000;time+=70)for(let i=0;i<14;i++){
    const mote=bottleMote(i,time);assert.ok(mote.x>=130&&mote.x<=190&&mote.y>=99&&mote.y<=165);
  }
  const player=new MagicPlayer();player.update(2800);
  const prior=bottleMote(3,player.elapsed);assert.equal(player.trigger('release'),true);
  assert.deepEqual(releasedMote(3,player),prior);
  for(let p=0;p<=1;p+=.02)for(let i=0;i<14;i++){
    const m=releasedMote(i,{...player,progress:p});
    if(m.y>55&&m.y<84)assert.ok(Math.abs(m.x-160)<17,'a mote escaped through the side of the neck');
  }
  player.update(1000);
  assert.equal(player.trigger('release'),false);player.update(DURATIONS.release-1000);assert.equal(player.phase,'bottle-open');
});
test('animation depends on elapsed time, preserves a still frame, and supports reduced motion',()=>{
  const a=new MagicPlayer(),b=new MagicPlayer();a.select('cup');b.select('cup');a.trigger('shatter');b.trigger('shatter');
  a.update(900);for(let i=0;i<9;i++)b.update(100);assert.deepEqual(shardPose(3,a),shardPose(3,b));
  const still=shardPose(2,a);a.update(0);assert.deepEqual(shardPose(2,a),still);
  const calm=new MagicPlayer({reducedMotion:true});calm.select('cup');calm.trigger('shatter');
  assert.deepEqual(shardPose(0,calm),CUP_SHARDS[0].land);calm.update(700);assert.equal(calm.phase,'cup-broken');
});
