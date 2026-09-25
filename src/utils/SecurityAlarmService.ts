/**
 * SecurityAlarmService.ts
 * Enterprise Security & Intruder Defense Alarm Engine for Bismillah POS.
 * 
 * Features:
 * - Tracks failed login / PIN / biometric / Face ID attempts across browser sessions (persisted in localStorage).
 * - Upon 5 consecutive failed attempts, locks the terminal and fires a continuous HTML5 audio object loop
 *   at max volume (volume = 1.0) along with Web Audio API synthesis.
 * - Alarm state persists across browser page reloads/sessions until authenticated successfully
 *   with valid credentials (isLocked: false) or process terminated.
 */

import { AlarmSoundManager } from './AlarmSoundManager';
import { AuditLogger } from './AuditLogger';

const ALARM_STORAGE_KEY = 'bismillah_security_alarm_state';
const MAX_ALLOWED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 1 * 60 * 1000; // 1 minute lockout (60 seconds)

export interface SecurityAlarmState {
  failedAttempts: number;
  isAlarmTriggered: boolean;
  isLocked: boolean;
  lockedUntil: number | null;
  lastAttemptTime: number | null;
  lastFailureReason: string | null;
}

// Generate continuous dual-tone piercing siren WAV data URI for HTML5 Audio object
function createAlarmWavDataUri(): string {
  try {
    const sampleRate = 22050;
    const duration = 1.0;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // RIFF identifier
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + numSamples * 2, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"

    // fmt chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);

    // data chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, numSamples * 2, true);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const freq = 850 + 550 * Math.sin(2 * Math.PI * 3 * t);
      const sample = Math.sin(2 * Math.PI * freq * t) * 0.95;
      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(44 + i * 2, intSample, true);
    }

    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return 'data:audio/wav;base64,' + btoa(binary);
  } catch {
    return '';
  }
}

class SecurityAlarmServiceImpl {
  private state: SecurityAlarmState = {
    failedAttempts: 0,
    isAlarmTriggered: false,
    isLocked: false,
    lockedUntil: null,
    lastAttemptTime: null,
    lastFailureReason: null
  };

  private listeners: ((state: SecurityAlarmState) => void)[] = [];
  private isAudioRunning = false;
  private checkInterval: any = null;
  private html5AudioElement: HTMLAudioElement | null = null;
  private wavDataUri: string = '';

  constructor() {
    this.loadState();
    if (typeof window !== 'undefined') {
      this.wavDataUri = createAlarmWavDataUri();
      this.initAutoResume();
    }
  }

  /**
   * Load persisted security state from localStorage
   */
  private loadState(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(ALARM_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const failed = Number(parsed.failedAttempts) || 0;
        const triggered = Boolean(parsed.isAlarmTriggered) || failed >= MAX_ALLOWED_ATTEMPTS;
        this.state = {
          failedAttempts: failed,
          isAlarmTriggered: triggered,
          isLocked: Boolean(parsed.isLocked) || triggered,
          lockedUntil: parsed.lockedUntil ? Number(parsed.lockedUntil) : null,
          lastAttemptTime: parsed.lastAttemptTime ? Number(parsed.lastAttemptTime) : null,
          lastFailureReason: parsed.lastFailureReason || null
        };
      }
    } catch (e) {
      console.warn('Failed to load security alarm state from storage:', e);
    }
  }

  /**
   * Persist current state to localStorage
   */
  private saveState(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save security alarm state:', e);
    }
    this.notifyListeners();
  }

  /**
   * Subscribe to alarm state changes
   */
  public subscribe(listener: (state: SecurityAlarmState) => void): () => void {
    this.listeners.push(listener);
    listener({ ...this.state });
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    const copy = { ...this.state };
    this.listeners.forEach(fn => {
      try {
        fn(copy);
      } catch (err) {
        console.error('Error in alarm state listener:', err);
      }
    });
  }

  /**
   * Automatically resume alarm on page startup if locked / triggered
   */
  private initAutoResume(): void {
    if (typeof window === 'undefined') return;

    const checkAndResume = () => {
      const now = Date.now();
      if ((this.state.isAlarmTriggered || this.state.failedAttempts >= MAX_ALLOWED_ATTEMPTS) && this.state.isLocked) {
        if (this.state.lockedUntil && this.state.lockedUntil > now) {
          this.startLoudAlarm();
        } else if (this.state.lockedUntil && this.state.lockedUntil <= now) {
          // 1 minute duration elapsed
          this.stopLoudAlarm();
        }
      }
    };

    checkAndResume();

    this.checkInterval = setInterval(() => {
      const now = Date.now();
      if (this.state.lockedUntil && this.state.lockedUntil <= now && this.state.isAlarmTriggered) {
        this.stopLoudAlarm();
      }
    }, 3000);
  }

  /**
   * Starts continuous HTML5 audio object loop at max volume (volume = 1.0)
   */
  public startLoudAlarm(): void {
    if (this.isAudioRunning) return;
    this.isAudioRunning = true;

    try {
      // 1. Continuous HTML5 Audio object loop at max volume (1.0)
      if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
        if (!this.html5AudioElement && this.wavDataUri) {
          this.html5AudioElement = new Audio(this.wavDataUri);
        }
        if (this.html5AudioElement) {
          this.html5AudioElement.loop = true;
          this.html5AudioElement.volume = 1.0; // Max volume
          this.html5AudioElement.play().catch(e => {
            console.info('HTML5 Audio autoplay requires user gesture or Web Audio fallback:', e);
          });
        }
      }

      // 2. Synthesized Web Audio API Dual-Frequency backup siren
      AlarmSoundManager.triggerIntruderAlarm();
    } catch (err) {
      console.warn('Could not start synthesized siren audio:', err);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('security-alarm-triggered', {
        detail: { ...this.state }
      }));
    }
  }

  /**
   * Stops the continuous HTML5 audio object loop and siren
   */
  public stopLoudAlarm(): void {
    this.isAudioRunning = false;

    // Stop and reset HTML5 Audio Element
    if (this.html5AudioElement) {
      try {
        this.html5AudioElement.pause();
        this.html5AudioElement.currentTime = 0;
      } catch (err) {
        console.warn('Error pausing HTML5 Audio object:', err);
      }
    }

    try {
      AlarmSoundManager.stopIntruderAlarm();
    } catch (err) {
      console.warn('Error stopping intruder siren:', err);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('security-alarm-stopped'));
    }
  }

  /**
   * Update app lock state. When updated to isLocked: false, immediately stops audio.
   */
  public setLocked(isLocked: boolean): void {
    this.state.isLocked = isLocked;
    if (!isLocked) {
      this.state.isAlarmTriggered = false;
      this.state.failedAttempts = 0;
      this.state.lockedUntil = null;
      this.stopLoudAlarm();
    }
    this.saveState();
  }

  /**
   * Record a failed authentication attempt (PIN, Biometric, Face ID, etc.)
   */
  public recordFailedAttempt(method: string, reason: string): { 
    attempts: number; 
    remaining: number; 
    isTriggered: boolean; 
    message: string; 
  } {
    const nextAttempts = this.state.failedAttempts + 1;
    this.state.failedAttempts = nextAttempts;
    this.state.lastAttemptTime = Date.now();
    this.state.lastFailureReason = reason;

    AuditLogger.log(
      'AUTHENTICATION_ATTEMPT_FAILED', 
      'FAILED', 
      method, 
      `${reason} (Consecutive Failed Attempt #${nextAttempts}/${MAX_ALLOWED_ATTEMPTS})`
    );

    if (nextAttempts >= MAX_ALLOWED_ATTEMPTS) {
      this.state.isAlarmTriggered = true;
      this.state.isLocked = true;
      this.state.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      this.saveState();

      // Trigger full-volume continuous HTML5 Audio siren loop
      this.startLoudAlarm();

      AuditLogger.log(
        'INTRUDER_SIREN_TRIGGERED', 
        'WARNING', 
        'Intruder Defense Engine', 
        `🚨 5 consecutive failed attempts detected! Continuous audio siren loop triggered at max volume.`
      );

      return {
        attempts: nextAttempts,
        remaining: 0,
        isTriggered: true,
        message: '🚨 5 MARTABA GALAT INPUT! INTRUDER SIREN ALARM ACTIVATED! Max volume alarm sirf valid credentials se isLocked: false hone par band hoga.'
      };
    }

    const remaining = MAX_ALLOWED_ATTEMPTS - nextAttempts;
    this.saveState();

    return {
      attempts: nextAttempts,
      remaining,
      isTriggered: false,
      message: `❌ Galat Input! ${remaining} attempt(s) baqi hain (5 hone par continuous loud alarm bajega).`
    };
  }

  /**
   * Record a successful authentication attempt. Resets failed attempts, sets isLocked: false, and silences the alarm.
   */
  public recordSuccessfulAuth(method: string): void {
    this.setLocked(false);
    this.state = {
      failedAttempts: 0,
      isAlarmTriggered: false,
      isLocked: false,
      lockedUntil: null,
      lastAttemptTime: Date.now(),
      lastFailureReason: null
    };
    this.saveState();

    AuditLogger.log(
      'AUTHENTICATION_SUCCESS_ALARM_CLEARED', 
      'SUCCESS', 
      method, 
      `Terminal unlocked successfully. isLocked set to false and alarm terminated.`
    );
  }

  /**
   * Manual reset by authorized administrative action
   */
  public resetAlarm(): void {
    this.setLocked(false);
  }

  /**
   * Get current failed attempts count
   */
  public getFailedAttempts(): number {
    return this.state.failedAttempts;
  }

  /**
   * Check if alarm is currently active / triggered
   */
  public isAlarmTriggered(): boolean {
    return Boolean(this.state.isAlarmTriggered && this.state.isLocked);
  }

  /**
   * Get remaining lockout seconds
   */
  public getRemainingLockSeconds(): number {
    if (!this.state.lockedUntil) return 0;
    const diff = Math.ceil((this.state.lockedUntil - Date.now()) / 1000);
    return Math.max(0, diff);
  }

  /**
   * Get full state
   */
  public getState(): SecurityAlarmState {
    return { ...this.state };
  }
}

export const SecurityAlarmService = new SecurityAlarmServiceImpl();
