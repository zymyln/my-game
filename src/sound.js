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
    const frequencies=kind==='glass'?[1020,1760,2540]:[380];
    frequencies.forEach((frequency,index)=>{
      const oscillator=ctx.createOscillator(),gain=ctx.createGain();
      oscillator.type=kind==='glass'?'triangle':'sine';oscillator.frequency.setValueAtTime(frequency,start);
      if(kind!=='glass')oscillator.frequency.exponentialRampToValueAtTime(85,start+.12);
      gain.gain.setValueAtTime(kind==='glass' ? 0.018 : 0.05,start+index*.015);
      gain.gain.exponentialRampToValueAtTime(.0001,start+.25);
      oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(start+index*.015);oscillator.stop(start+.27);
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
    });
  }
}
