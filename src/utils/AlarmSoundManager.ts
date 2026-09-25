/**
 * AlarmSoundManager
 * High-gain Web Audio API dual-frequency synthesized siren & security alert engine.
 * Will continuously sound when 5 failed login attempts occur, and cannot be dismissed
 * until valid PIN, registered Fingerprint, or valid Face+Eyes is provided, or the app is closed.
 */

class AlarmSoundManagerClass {
  private audioCtx: AudioContext | null = null;
  private isAlarmRunning: boolean = false;
  private intervalId: any = null;
  private activeOscillators: OscillatorNode[] = [];
  private masterGain: GainNode | null = null;

  public isAlarmActive(): boolean {
    return this.isAlarmRunning;
  }

  public triggerIntruderAlarm(): void {
    if (this.isAlarmRunning) return;
    this.isAlarmRunning = true;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.audioCtx.currentTime); // MAX gain
      this.masterGain.connect(this.audioCtx.destination);

      // Continuous warbling police/bank siren loop (800Hz <-> 1350Hz)
      const playSirenPulse = () => {
        if (!this.isAlarmRunning || !this.audioCtx || !this.masterGain) return;

        try {
          if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
          }

          const now = this.audioCtx.currentTime;
          
          // Dual oscillators for intense dual-tone piercing siren
          const osc1 = this.audioCtx.createOscillator();
          const osc2 = this.audioCtx.createOscillator();
          const gain1 = this.audioCtx.createGain();

          osc1.type = 'sawtooth';
          osc2.type = 'square';

          // Frequency sweeps up and down
          osc1.frequency.setValueAtTime(800, now);
          osc1.frequency.linearRampToValueAtTime(1400, now + 0.35);
          osc1.frequency.linearRampToValueAtTime(800, now + 0.7);

          osc2.frequency.setValueAtTime(850, now);
          osc2.frequency.linearRampToValueAtTime(1450, now + 0.35);
          osc2.frequency.linearRampToValueAtTime(850, now + 0.7);

          gain1.gain.setValueAtTime(0.85, now);
          gain1.gain.setValueAtTime(0.85, now + 0.65);
          gain1.gain.linearRampToValueAtTime(0.01, now + 0.7);

          osc1.connect(gain1);
          osc2.connect(gain1);
          gain1.connect(this.masterGain);

          osc1.start(now);
          osc2.start(now);

          osc1.stop(now + 0.7);
          osc2.stop(now + 0.7);

          this.activeOscillators.push(osc1, osc2);
          setTimeout(() => {
            this.activeOscillators = this.activeOscillators.filter(o => o !== osc1 && o !== osc2);
          }, 800);
        } catch (e) {
          console.warn('Siren pulse error:', e);
        }
      };

      playSirenPulse();
      this.intervalId = setInterval(playSirenPulse, 720);

      // Also trigger device vibration if available
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([400, 200, 400, 200, 600]);
        } catch {}
      }
    } catch (err) {
      console.warn('Failed to start intruder alarm audio:', err);
    }
  }

  public stopIntruderAlarm(): void {
    this.isAlarmRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    try {
      this.activeOscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
      this.activeOscillators = [];

      if (this.masterGain) {
        this.masterGain.disconnect();
        this.masterGain = null;
      }

      if (this.audioCtx && this.audioCtx.state !== 'closed') {
        this.audioCtx.close();
        this.audioCtx = null;
      }
    } catch (e) {
      console.warn('Error stopping siren:', e);
    }
  }
}

export const AlarmSoundManager = new AlarmSoundManagerClass();
