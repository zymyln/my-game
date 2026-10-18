import test from 'node:test';
import assert from 'node:assert/strict';
import {SCORES,PROFILES,audioProfile,branchSoundCue,frequency,scoreLength} from './score.mjs';
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


test('branch sound leaves room for reflection, resolves softly and rests during the curtain',()=>{
  assert.equal(audioProfile({mode:'dialogue',shot:'SH-20'}),'reflection');
  assert.equal(PROFILES.reflection.music,null);
  assert.equal(audioProfile({mode:'dialogue',shot:'SH-21'}),'resolve');
  assert.equal(PROFILES.resolve.music,PROFILES.hope.music);
  assert.ok(PROFILES.resolve.musicScale<PROFILES.hope.musicScale);
  assert.equal(audioProfile({mode:'dialogue',shot:'SH-23'}),'night');
  assert.equal(audioProfile({mode:'dialogue',shot:'SH-24',kind:'curtain'}),'quiet');
  assert.equal(branchSoundCue({shotId:'SH-16',speaker:'旁白',text:'他跑进厨房，脚步很响。'}),'kitchen-steps');
  assert.equal(branchSoundCue({shotId:'SH-17',speaker:'旁白',text:'厨房里传来碗盘相碰的声音。'}),'crockery');
  assert.equal(branchSoundCue({shotId:'SH-17',speaker:'旁白',text:'接着，他的声音停了。'}),null);
  assert.equal(branchSoundCue({shotId:'SH-10',speaker:'旁白',text:'厨房里传来碗盘相碰的声音。'}),null);
});
