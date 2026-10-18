// Original short scores, in MIDI pitch numbers. No downloaded music or samples.
const phrase=(notes)=>notes.map((pitch,i)=>[i*.5,pitch,i%4===3?.8:.45]);
export const SCORES={
  hope:{name:'各自启程',bpm:64,beats:4,voice:'piano',chords:[[48,55,60,64],[45,52,57,60],[41,48,53,57],[43,50,55,62]],melody:[
    [[.5,72,1],[2.5,76,1]],[[0,74,1.5],[2.5,72,1]],[[.5,69,1],[2,72,1.5]],[[0,71,1],[2,72,1.8]],
  ]},
  meadow:{name:'风经过的地方',bpm:88,beats:3,voice:'flute',chords:[[48,55,60,64],[45,52,57,60],[41,48,53,57],[43,50,55,59],[48,55,60,64],[45,52,57,60],[41,48,53,57],[43,50,55,59]],melody:[
    phrase([76,79,81,79,76,74]),phrase([72,76,79,76,72,69]),phrase([72,74,77,76,74,72]),phrase([71,74,79,77,74,71]),
    phrase([76,79,84,83,81,79]),phrase([81,79,76,72,71,69]),phrase([69,72,77,76,74,72]),[[0,71,.7],[1,74,.6],[2,72,.9]],
  ]},
  hall:{name:'窗边的午后',bpm:70,beats:4,voice:'piano',chords:[[50,57,62,65],[46,53,58,62],[41,48,53,57],[48,55,60,64],[50,57,62,65],[43,50,55,58],[46,53,58,62],[45,52,57,61]],melody:[
    [[0,77,.9],[1.5,76,.45],[2,74,1.6]],[[0,74,.9],[1.5,72,.45],[2,70,1.5]],[[0,69,.8],[1,72,.8],[2.5,77,1]],[[0,76,.8],[1.5,72,.6],[3,67,.7]],
    [[0,69,.8],[1,74,.8],[2.5,77,1]],[[0,79,.8],[1.5,77,.5],[2.5,74,1]],[[0,74,.8],[1.5,72,.5],[2.5,70,1]],[[0,73,.8],[1.5,76,.7],[3,69,.8]],
  ]},
  memory:{name:'被收藏的光',bpm:66,beats:4,voice:'bell',chords:[[48,55,60,64],[45,52,59,64],[41,48,55,60],[43,50,57,62],[48,55,62,64],[45,52,59,64],[41,48,57,60],[43,50,59,62]],melody:[
    [[0,84,1.4],[2,79,1.3]],[[.5,83,1.3],[2.5,76,1]],[[0,81,1.5],[2.5,79,1]],[[1,74,1],[2.5,79,1]],
    [[0,84,1],[1.5,86,.8],[3,88,.8]],[[.5,83,1.3],[2.5,79,1]],[[0,81,1],[2,77,1.4]],[[.5,79,1.3],[2.5,74,1]],
  ]},
  dusk:{name:'没有答案的归途',bpm:60,beats:4,voice:'piano',chords:[[45,52,57,60],[41,48,53,57],[48,55,60,64],[43,50,55,59],[45,52,57,60],[41,48,53,57],[50,57,62,65],[40,47,52,56]],melody:[
    [[0,76,1.7],[2.5,72,1]],[[.5,69,2]],[[0,67,1.5],[2.5,72,1]],[[1,71,1.8]],
    [[0,72,1],[1.5,76,1],[3,79,.7]],[[.5,77,1.5],[2.5,72,1]],[[0,74,1.5],[2.5,69,1]],[[1,68,1.8]],
  ]},
  tension:{name:'骤然安静的餐厅',bpm:52,beats:4,voice:'pad',chords:[[38,45,50,53],[38,45,49,55],[34,41,48,50],[37,44,50,53]],melody:[[],[],[],[]]},
};
export const PROFILES={
  quiet:{music:null,ambience:null},meadow:{music:'meadow',ambience:'wind'},hall:{music:'hall',ambience:'room'},
  tension:{music:'tension',ambience:null},memory:{music:'memory',ambience:null},
  dusk:{music:'dusk',ambience:'evening'},hush:{music:null,ambience:'evening',ambientScale:.18},
  reflection:{music:null,ambience:'room',ambientScale:.3},
  resolve:{music:'hope',ambience:'room',ambientScale:.4,musicScale:.48},
  night:{music:null,ambience:'night',ambientScale:.4},
  hope:{music:'hope',ambience:'wind',ambientScale:.25,musicScale:.7},
};
export function audioProfile({mode,scene,shot,kind,glass}){
  if(kind==='curtain')return 'quiet';
  if(['title','complete','transition'].includes(mode))return 'quiet';
  if(mode==='memory'||kind==='memory')return 'memory';
  if(mode==='interlude')return 'hush';
  if(mode==='dialogue'){
    if(shot==='SH-09')return 'quiet';
    if(shot==='SH-14')return 'hush';
    if(shot==='SH-19')return 'quiet';
    if(shot==='SH-20')return 'reflection';
    if(['SH-21','SH-22'].includes(shot))return 'resolve';
    if(shot==='SH-23')return 'night';
    if(shot==='SH-24')return 'hope';
    if(shot==='SH-10')return ['mist','whole'].includes(glass)?'hall':'tension';
  }
  return scene==='hall'?'hall':scene?.includes('dusk')?'dusk':'meadow';
}
export const scoreLength=score=>score.chords.length*score.beats*60/score.bpm*(score.voice==='pad'?1:2);
export const frequency=pitch=>440*2**((pitch-69)/12);

// One restrained cue at the matching narration, never on every click.
export function branchSoundCue(step){
  if(step?.speaker!=='旁白')return null;
  if(step.shotId==='SH-16'&&/^他跑进厨房/.test(step.text))return 'kitchen-steps';
  if(step.shotId==='SH-17'&&/^厨房里传来碗盘/.test(step.text))return 'crockery';
  return null;
}
