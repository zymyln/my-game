// Short synthesized stage cues; no background music or external audio files.
export class SoundEffects {
  constructor() { this.enabled=false; this.context=null; }
  async toggle() {
    if (!this.enabled) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return false;
      this.context ??= new Audio();
      await this.context.resume();
    }
    this.enabled=!this.enabled;return this.enabled;
  }
  play(kind) {
    if (!this.enabled || !this.context || this.context.state!=='running') return;
    const ctx=this.context,start=ctx.currentTime;
    const healing=kind==='restore';
    const frequencies=kind==='glass'?[1020,1760,2540]:healing?[523,784,1046]:[380];
    const duration=healing?1.15:.25;
    frequencies.forEach((frequency,index)=>{
      const oscillator=ctx.createOscillator(),gain=ctx.createGain();
      oscillator.type=kind==='glass'?'triangle':'sine';oscillator.frequency.setValueAtTime(frequency,start);
      if(!healing&&kind!=='glass')oscillator.frequency.exponentialRampToValueAtTime(85,start+.12);
      const onset=start+index*(healing ? .07 : .015);
      gain.gain.setValueAtTime(healing ? .0001 : kind==='glass' ? 0.018 : 0.05,onset);
      if(healing)gain.gain.exponentialRampToValueAtTime(.014,onset+.06);
      gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
      oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(onset);oscillator.stop(start+duration+.02);
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
    });
  }
}
