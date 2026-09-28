// Authentic Dual-Tone Multi-Frequency (DTMF) Signaling Audio Engine
// Generates standard ITU-T telephony frequencies via Web Audio API

class TelephonyAudioEngine {
  private ctx: AudioContext | null = null;

  // ITU-T Q.23 standard DTMF frequencies (Hz)
  private readonly DTMF_FREQS: Record<string, [number, number]> = {
    '1': [697, 1209],
    '2': [697, 1336],
    '3': [697, 1477],
    '4': [770, 1209],
    '5': [770, 1336],
    '6': [770, 1477],
    '7': [852, 1209],
    '8': [852, 1336],
    '9': [852, 1477],
    '*': [941, 1209],
    '0': [941, 1336],
    '#': [941, 1477],
  };

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play realistic dual-tone keypress beep
  playDtmfTone(key: string, durationMs = 150) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const freqs = this.DTMF_FREQS[key];
      if (!freqs) return;

      const now = this.ctx.currentTime;
      const [f1, f2] = freqs;

      // Low frequency oscillator
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(f1, now);

      // High frequency oscillator
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(f2, now);

      // Gain nodes with gentle envelope to avoid audio clicks
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + durationMs / 1000);
      osc2.stop(now + durationMs / 1000);
    } catch (e) {
      // Audio autoplay may be disabled until user gesture
    }
  }

  // Play standard Indian/UK ringback tone (400Hz + 450Hz modulation)
  playRingback() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(425, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  // Play hospital chime for calling patient
  playHospitalChime() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 chime
      notes.forEach((freq, idx) => {
        const now = this.ctx!.currentTime + idx * 0.16;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.15, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 0.4);
      });
    } catch (e) {}
  }

  // Incoming SMS notification chime
  playSmsChime() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [880, 1174.66]; // A5 -> D6
      freqs.forEach((f, i) => {
        const t = now + i * 0.08;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.16);
      });
    } catch (e) {}
  }
}

export const telephonyAudio = new TelephonyAudioEngine();
