// Retro synthesizer sound effects using the native Web Audio API
// This avoids asset loading overhead, network errors, and keeps bundle sizes minimal.

class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;

  constructor() {
    // Read initial muted state from localStorage
    try {
      const saved = localStorage.getItem('elevez_muted');
      // Default to muted true to respect browser autoplay policies until user unmutes
      this.isMuted = saved !== 'false';
    } catch {
      this.isMuted = true;
    }
  }

  private initContext() {
    if (!this.ctx) {
      // Support standard and legacy AudioContext
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    // Resume context if suspended (common in browsers until user gesture)
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('elevez_muted', muted ? 'true' : 'false');
    } catch (e) {
      console.warn('Could not save mute status to localStorage:', e);
    }
    if (!muted) {
      this.initContext();
      this.playTick(); // Play a confirmation tick on unmute
    }
  }

  public getMuteStatus(): boolean {
    return this.isMuted;
  }

  // 1. Short retro hover blip
  public playTick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  // 2. Wheel spin tick sound (slightly lower pitch, shorter)
  public playWheelTick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.02);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  // 3. Double-tone Retro Coin Sound (satisfied add to cart)
  public playCoin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // First tone (short)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    gain1.gain.setValueAtTime(0.05, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.08);

    // Second tone (slightly delayed, higher)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    gain2.gain.setValueAtTime(0.05, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.35);
  }

  // 4. Cart removal swoosh
  public playSwipe() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  // 5. Celebration success fanfare
  public playSuccess() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major chord arpeggio
    
    notes.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + (index * 0.06));
      
      gain.gain.setValueAtTime(0.08, now + (index * 0.06));
      gain.gain.exponentialRampToValueAtTime(0.001, now + (index * 0.06) + 0.25);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(now + (index * 0.06));
      osc.stop(now + (index * 0.06) + 0.25);
    });
  }

  // 6. Extreme 8-bit game melody (unboxing reward)
  public playUnlock() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 1174.66]; // Ascending minor run
    
    notes.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + (index * 0.05));
      
      gain.gain.setValueAtTime(0.04, now + (index * 0.05));
      gain.gain.exponentialRampToValueAtTime(0.001, now + (index * 0.05) + 0.15);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(now + (index * 0.05));
      osc.stop(now + (index * 0.05) + 0.15);
    });
  }
}

export const audioService = new AudioService();
