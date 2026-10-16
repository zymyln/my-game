import test from 'node:test';
import assert from 'node:assert/strict';
import {SCORES,PROFILES,audioProfile,frequency,scoreLength} from './score.mjs';
test('original scores have complete phrases with valid pitches, rhythm and loop lengths',()=>{
  for(const score of Object.values(SCORES)){
    assert.equal(score.melody.length,score.chords.length);assert.ok(scoreLength(score)>16&&scoreLength(score)<=64);
    for(const chord of score.chords)assert.ok(chord.length===4&&chord.every(p=>p>=30&&p<=90));
    for(const bar of score.melody)for(const [offset,pitch,duration]of bar){assert.ok(offset>=0&&offset<score.beats);assert.ok(pitch>50&&pitch<100);assert.ok(duration>0&&offset+duration<=score.beats+.01);}
  }
  assert.equal(frequency(69),440);for(const profile of Object.values(PROFILES))assert.ok(!profile.music||SCORES[profile.music]);
});
test('scripted silence and the empty gaze are distinct from missing audio',()=>{
  assert.equal(audioProfile({mode:'dialogue',scene:'hall',shot:'SH-09'}),'quiet');
  assert.equal(audioProfile({mode:'dialogue',scene:'gate_dusk',shot:'SH-14'}),'hush');
  assert.equal(audioProfile({mode:'dialogue',scene:'hall',shot:'SH-10',glass:'broken'}),'tension');
  assert.equal(audioProfile({mode:'dialogue',scene:'hall',shot:'SH-10',glass:'mist'}),'hall');
});
test('scene changes, memories and leaving the chapter choose the intended soundtrack',()=>{
  assert.equal(audioProfile({mode:'explore',scene:'field_day'}),'meadow');
  assert.equal(audioProfile({mode:'inspect',scene:'hall'}),'hall');
  assert.equal(audioProfile({mode:'memory',scene:'hall'}),'memory');
  assert.equal(audioProfile({mode:'dialogue',scene:'field_dusk',shot:'SH-15'}),'dusk');
  for(const mode of ['title','complete','transition'])assert.equal(audioProfile({mode,scene:'hall'}),'quiet');
});
