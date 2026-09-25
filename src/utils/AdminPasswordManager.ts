import { AuditLogger } from './AuditLogger';

export interface AdminAuthSession {
  isUnlocked: boolean;
  unlockedAt: number | null;
  expiresAt: number | null;
  attemptsCount: number;
}

const MASTER_ADMIN_PIN = '101010';
const SESSION_STORAGE_KEY = 'bismillah_admin_auth_session';
const SESSION_DURATION_MS = 60 * 60 * 1000; // 1 Hour

export class AdminPasswordManager {
  private static listeners: Set<(unlocked: boolean) => void> = new Set();
  private static FAILED_ATTEMPTS_KEY = 'bismillah_admin_failed_attempts';
  private static LOCK_UNTIL_KEY = 'bismillah_admin_lock_until';

  private static getFailedAttempts(): number {
    try {
      return parseInt(localStorage.getItem(this.FAILED_ATTEMPTS_KEY) || '0', 10) || 0;
    } catch {
      return 0;
    }
  }

  private static setFailedAttempts(count: number): void {
    try {
      localStorage.setItem(this.FAILED_ATTEMPTS_KEY, count.toString());
    } catch {
      // fallback
    }
  }

  private static getLockUntil(): number {
    try {
      return parseInt(localStorage.getItem(this.LOCK_UNTIL_KEY) || '0', 10) || 0;
    } catch {
      return 0;
    }
  }

  private static setLockUntil(timestamp: number): void {
    try {
      localStorage.setItem(this.LOCK_UNTIL_KEY, timestamp.toString());
    } catch {
      // fallback
    }
  }

  /**
   * Verify whether the provided password matches the master admin password '101010'
   */
  public static verifyPassword(inputPin: string): boolean {
    if (!inputPin) return false;
    const sanitized = inputPin.trim();
    return sanitized === MASTER_ADMIN_PIN;
  }

  /**
   * Attempt unlocking the admin panel with PIN
   */
  public static unlock(inputPin: string): { success: boolean; message: string; remainingLockSeconds?: number } {
    const now = Date.now();
    const lockUntil = this.getLockUntil();

    if (lockUntil > now) {
      const waitSeconds = Math.ceil((lockUntil - now) / 1000);
      return {
        success: false,
        message: `Security Lockout Active! Pehle ${waitSeconds}s intezar karein.`,
        remainingLockSeconds: waitSeconds
      };
    }

    if (this.verifyPassword(inputPin)) {
      this.setFailedAttempts(0);
      this.setLockUntil(0);
      const session: AdminAuthSession = {
        isUnlocked: true,
        unlockedAt: now,
        expiresAt: now + SESSION_DURATION_MS,
        attemptsCount: 0
      };

      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch (e) {
        console.warn('[AdminPasswordManager] sessionStorage write failed', e);
      }

      AuditLogger.log(
        'ADMIN_AUTH_SUCCESS',
        'SUCCESS',
        'Master Admin PIN',
        'Admin panel unlocked via 6-digit master password (101010).'
      );

      this.notifyListeners(true);
      return {
        success: true,
        message: 'Master Admin Access Granted!'
      };
    } else {
      const currentAttempts = this.getFailedAttempts() + 1;
      this.setFailedAttempts(currentAttempts);

      AuditLogger.log(
        'ADMIN_AUTH_FAILED',
        'FAILED',
        'Master Admin PIN',
        `Incorrect PIN attempt count: ${currentAttempts}.`
      );

      if (currentAttempts % 5 === 0) {
        // Enforce 60-second non-dismissible lockout in localStorage
        const lockExpiration = now + 60 * 1000;
        this.setLockUntil(lockExpiration);
        this.notifyListeners(false);
        return {
          success: false,
          message: '⚠️ 5 Ghalat koshishein! Admin panel 60 seconds k liye lock ho gaya hai.',
          remainingLockSeconds: 60
        };
      }

      this.notifyListeners(false);
      return {
        success: false,
        message: `Ghalat Master PIN! Sirf authorized admin (101010) use karein. (${5 - (currentAttempts % 5)} koshishein baqi)`
      };
    }
  }

  /**
   * Check if current session is active and unlocked
   */
  public static isUnlocked(): boolean {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return false;
      const session: AdminAuthSession = JSON.parse(raw);
      if (session.isUnlocked && session.expiresAt && session.expiresAt > Date.now()) {
        return true;
      }
      this.lock();
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Lock admin access immediately
   */
  public static lock(): void {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
    AuditLogger.log(
      'ADMIN_AUTH_LOCKED',
      'SUCCESS',
      'Session',
      'Admin panel locked and session destroyed.'
    );
    this.notifyListeners(false);
  }

  /**
   * Subscribe to lock/unlock changes
   */
  public static subscribe(callback: (unlocked: boolean) => void): () => void {
    this.listeners.add(callback);
    callback(this.isUnlocked());
    return () => {
      this.listeners.delete(callback);
    };
  }

  private static notifyListeners(unlocked: boolean): void {
    this.listeners.forEach((cb) => {
      try {
        cb(unlocked);
      } catch (e) {
        console.error('[AdminPasswordManager] listener error', e);
      }
    });
  }
}
