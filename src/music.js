import {SCORES,frequency,scoreLength} from './score.mjs';

// Render each original score once; playback uses a seamless stereo loop.
export async function renderScore(id,Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext){
  const score=SCORES[id];if(!score||!Offline)return null;
  const rate=24000,length=scoreLength(score),tail=4;
  const ctx=new Offline(2,Math.ceil((length+tail)*rate),rate),mix=ctx.createGain();mix.gain.value=.65;
  const low=ctx.createBiquadFilter();low.type='lowpass';low.frequency.value=5200;mix.connect(low);low.connect(ctx.destination);
  // Small stereo room: quiet, filtered echoes instead of a harsh dry oscillator.
  for(const [delay,pan,volume]of[[.19,-.65,.13],[.31,.65,.10],[.47,-.3,.055]]){
    const echo=ctx.createDelay(1),gain=ctx.createGain(),stereo=ctx.createStereoPanner(),filter=ctx.createBiquadFilter();
    echo.delayTime.value=delay;gain.gain.value=volume;stereo.pan.value=pan;filter.type='lowpass';filter.frequency.value=2100;
    mix.connect(echo);echo.connect(filter);filter.connect(gain);gain.connect(stereo);stereo.connect(ctx.destination);
  }
  function note(pitch,start,duration,volume,voice,pan=0){
    const tones=voice==='piano'?[[1,1],[2,.23],[3,.055]]:voice==='bell'?[[1,1],[2,.24],[3.01,.09]]:voice==='flute'?[[1,1],[2,.13],[3,.025]]:[[1,1],[2,.08]];
    const output=ctx.createGain(),stereo=ctx.createStereoPanner();stereo.pan.value=pan;output.connect(stereo);stereo.connect(mix);
    output.gain.setValueAtTime(0,start);
    const attack=voice==='pad'?.65:voice==='flute'?.075:.012,release=voice==='pad'?1.1:voice==='bell'?1.7:.55;
    output.gain.linearRampToValueAtTime(volume,start+attack);
    output.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*(voice==='pad'?.8:voice==='flute'?.65:.16)),start+Math.max(attack+.01,duration));
    output.gain.exponentialRampToValueAtTime(.0001,start+Math.max(attack+.02,duration)+release);
    for(const [harmonic,weight]of tones){
      const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=frequency(pitch)*harmonic;gain.gain.value=weight;
      osc.connect(gain);gain.connect(output);osc.start(start);osc.stop(start+Math.max(attack+.03,duration)+release+.02);
    }
  }
  const beat=60/score.bpm;
  for(let section=0;section<(id==='tension'?1:2);section++)score.chords.forEach((chord,bar)=>{
    const start=(section*score.chords.length+bar)*score.beats*beat;
    chord.forEach((pitch,i)=>note(pitch,start,score.beats*beat-.1,id==='tension'?.026:.013,'pad',(i-1.5)*.22));
    if(id!=='tension'){
      note(chord[0]-12,start,.7*beat,.065,'piano',-.1);
      for(let step=1;step<score.beats*2;step++)note(chord[1+((step+section)%3)],start+step*.5*beat,.30*beat,id==='memory'?.015:.025,'piano',step%2?.3:-.3);
    }
    const melody=section&&id==='meadow'?score.melody[bar].filter((note,index)=>index%2===0):score.melody[bar];
    for(const [offset,pitch,duration]of melody){
      const register=section&&(id==='memory'||id==='dusk'||bar<4)?-12:0;
      note(pitch+register,start+offset*beat,duration*beat,(id==='memory'?.075:id==='dusk'?.085:.09)*(section?.85:1),section&&id==='meadow'?'bell':score.voice,section?-.12:.08);
    }
  });
  const rendered=await ctx.startRendering(),frames=Math.round(length*rate),buffer=ctx.createBuffer(2,frames,rate);
  for(let channel=0;channel<2;channel++){
    const source=rendered.getChannelData(channel),target=buffer.getChannelData(channel);target.set(source.subarray(0,frames));
    // Wrap the last reverb/note release into the next loop's opening.
    for(let i=frames;i<source.length;i++)target[i-frames]+=source[i];
  }
  let peak=0,energy=0;
  for(let channel=0;channel<2;channel++)for(const value of buffer.getChannelData(channel)){peak=Math.max(peak,Math.abs(value));energy+=value*value;}
  const rms=Math.sqrt(energy/(frames*2)),scale=Math.min(.72/Math.max(.001,peak),(id==='tension'?.045:.14)/Math.max(.001,rms));
  for(let channel=0;channel<2;channel++){const data=buffer.getChannelData(channel);for(let i=0;i<data.length;i++)data[i]*=scale;}
  return buffer;
}
