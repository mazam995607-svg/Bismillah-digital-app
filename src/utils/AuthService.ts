import { SecurityManager } from './SecurityManager';

export interface OTPChallenge {
  email: string;
  otpHash: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  verified: boolean;
  rawOtp: string;
}

type OTPListener = (otp: string, email: string) => void;

export class AuthService {
  private static activeOTPChallenges: Map<string, OTPChallenge> = new Map();
  private static otpListeners: Set<OTPListener> = new Set();

  // Subscribe to automated incoming OTP listener (Bank App style Auto-Paste)
  static subscribeOTPListener(listener: OTPListener) {
    this.otpListeners.add(listener);
    return () => this.otpListeners.delete(listener);
  }

  private static notifyOTPListeners(otp: string, email: string) {
    this.otpListeners.forEach(fn => fn(otp, email));
  }

  // Generate unique 6-digit cryptographic OTP for email/SMS verification
  static async sendEmailOTP(email: string): Promise<{ success: boolean; message: string; simulatedOTP?: string }> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Invalid email address provided.' };
    }

    // Generate random multiple unique 6-digit numeric OTP every single time
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const otp = (100000 + (array[0] % 900000)).toString();

    const otpHash = await SecurityManager.hashString(otp);
    const challenge: OTPChallenge = {
      email: cleanEmail,
      otpHash,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes validity
      attempts: 0,
      verified: false,
      rawOtp: otp
    };

    this.activeOTPChallenges.set(cleanEmail, challenge);

    // Save to LocalEncrypted for state persistence across reloads
    localStorage.setItem(`bismillah_otp_${cleanEmail}`, SecurityManager.encryptData(challenge));

    // Audit log
    SecurityManager.createAuditLog(
      'EMAIL_OTP_DISPATCHED',
      'SUCCESS',
      'Bank Auth Gateway',
      `Sent unique 6-digit OTP verification challenge to ${cleanEmail}`
    );

    // Trigger automated incoming SMS / Email listener after short network delay (simulating banking app auto-paste)
    setTimeout(() => {
      this.notifyOTPListeners(otp, cleanEmail);
    }, 1200);

    return {
      success: true,
      message: `Verification code sent to ${cleanEmail}. Auto-paste listener active!`,
      simulatedOTP: otp
    };
  }

  // Verify OTP Code
  static async verifyEmailOTP(email: string, inputOTP: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.toLowerCase().trim();
    let challenge = this.activeOTPChallenges.get(cleanEmail);

    if (!challenge) {
      const stored = localStorage.getItem(`bismillah_otp_${cleanEmail}`);
      if (stored) {
        challenge = SecurityManager.decryptData(stored);
      }
    }

    if (!challenge) {
      return { success: false, message: 'No active OTP verification session found. Please request a new code.' };
    }

    if (Date.now() > challenge.expiresAt) {
      this.activeOTPChallenges.delete(cleanEmail);
      localStorage.removeItem(`bismillah_otp_${cleanEmail}`);
      return { success: false, message: 'OTP verification code has expired. Please request a new code.' };
    }

    if (challenge.attempts >= 5) {
      this.activeOTPChallenges.delete(cleanEmail);
      localStorage.removeItem(`bismillah_otp_${cleanEmail}`);
      return { success: false, message: 'Maximum failed verification attempts reached. Security lockout activated.' };
    }

    const inputHash = await SecurityManager.hashString(inputOTP.trim());
    if (inputHash !== challenge.otpHash && inputOTP.trim() !== challenge.rawOtp) {
      challenge.attempts += 1;
      this.activeOTPChallenges.set(cleanEmail, challenge);
      localStorage.setItem(`bismillah_otp_${cleanEmail}`, SecurityManager.encryptData(challenge));
      return { success: false, message: `Incorrect verification code! Attempts remaining: ${5 - challenge.attempts}` };
    }

    // Success
    challenge.verified = true;
    this.activeOTPChallenges.set(cleanEmail, challenge);
    localStorage.setItem(`bismillah_otp_${cleanEmail}`, SecurityManager.encryptData(challenge));

    return { success: true, message: 'Email address verified successfully!' };
  }

  // Check if an email has been verified
  static isEmailVerified(email: string): boolean {
    const cleanEmail = email.toLowerCase().trim();
    const challenge = this.activeOTPChallenges.get(cleanEmail);
    if (challenge && challenge.verified) return true;

    const stored = localStorage.getItem(`bismillah_otp_${cleanEmail}`);
    if (stored) {
      const parsed = SecurityManager.decryptData(stored);
      return parsed && parsed.verified === true;
    }
    return false;
  }

  // Generate Bank-Grade Session JWT Token
  static async createBankSessionToken(email: string): Promise<string> {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: email.toLowerCase().trim(),
        role: 'ROOT_ADMIN',
        iss: 'Bismillah-Bank-Guard',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 3600
      })
    );

    const signatureRaw = await SecurityManager.hashString(`${header}.${payload}.BISMILLAH_BANK_SECURE_SECRET_2026`);
    return `${header}.${payload}.${signatureRaw.substring(0, 32)}`;
  }
}
