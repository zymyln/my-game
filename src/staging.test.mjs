import test from 'node:test';
import assert from 'node:assert/strict';
import {StagePlayer,MOODS,moodForShot} from './staging.mjs';

test('interrupted atmosphere transitions start from their visible state without a jump',()=>{
  const stage=new StagePlayer();stage.select('unease');stage.update(650);
  const before=stage.snapshot();stage.select('pressure');assert.deepEqual(stage.snapshot(),before);
  stage.update(650);assert.equal(stage.snapshot().edge,MOODS.pressure.edge);
  stage.select('calm');stage.update(1600);assert.equal(stage.snapshot().edge,MOODS.calm.edge);
});
test('atmosphere time is frame-rate independent and a paused update preserves the frame',()=>{
  const a=new StagePlayer(),b=new StagePlayer();a.select('gaze');b.select('gaze');
  a.update(1000);for(let i=0;i<100;i++)b.update(10);assert.deepEqual(a.snapshot(),b.snapshot());
  const before=a.snapshot();a.update(0);assert.deepEqual(a.snapshot(),before);
  a.select('gaze');assert.deepEqual(a.snapshot(),before);
  a.reset();assert.equal(a.snapshot().edge,0);assert.equal(a.snapshot().zoom,1);
});
test('reduced motion preserves static lighting while disabling camera motion and drifting dust',()=>{
  const stage=new StagePlayer({reducedMotion:true});stage.select('afterglow');stage.update(1000);
  assert.equal(stage.snapshot().zoom,1);assert.equal(stage.snapshot().wind,0);assert.equal(stage.snapshot().time,0);
  assert.equal(stage.snapshot().edge,MOODS.afterglow.edge);assert.throws(()=>stage.select('missing'));
});
test('mainline stages keep the confrontation, restoration and final gaze visually separate',()=>{
  assert.equal(moodForShot('SH-04'),'meadow');assert.equal(moodForShot('SH-09'),'unease');
  assert.equal(moodForShot('SH-10'),'unease');assert.equal(moodForShot('SH-11'),'calm');
  assert.equal(moodForShot('SH-14'),'gaze');assert.equal(moodForShot('SH-15'),'afterglow');
});
