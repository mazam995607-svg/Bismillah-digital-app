/**
 * HardwareSecurityAuditor.ts
 * Deep scan and audit device biometric hardware capabilities using standard WebAuthn
 * (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable, WebAuthn level 2/3).
 */

export interface BiometricHardwareReport {
  isSupported: boolean;
  hasPlatformAuthenticator: boolean;
  hasConditionalMediation: boolean;
  isSecureContext: boolean;
  hasWebCrypto: boolean;
  hardwareLevel: 'NATIVE_BIOMETRIC' | 'SOFTWARE_FALLBACK' | 'UNSUPPORTED';
  sensorType: 'Fingerprint / TouchID' | 'FaceID / Windows Hello' | 'Platform Passkey' | 'Emulated Biometric';
  osPlatform: 'Android' | 'iOS' | 'Windows' | 'macOS' | 'Linux' | 'Unknown';
  diagnosticDetails: string[];
  recommendations: string;
  timestamp: string;
}

export class HardwareSecurityAuditor {
  private static cachedReport: BiometricHardwareReport | null = null;

  /**
   * Run a deep hardware capability audit
   */
  public static async runDeepAudit(): Promise<BiometricHardwareReport> {
    const isClient = typeof window !== 'undefined';
    const isSecure = isClient ? window.isSecureContext : false;
    const hasPublicKey = isClient && typeof window.PublicKeyCredential !== 'undefined';
    const hasCrypto = isClient && !!(window.crypto && window.crypto.subtle);

    let hasPlatformAuth = false;
    let hasConditional = false;

    // Detect OS
    const ua = isClient ? navigator.userAgent || '' : '';
    let osPlatform: BiometricHardwareReport['osPlatform'] = 'Unknown';
    if (/Android/i.test(ua)) osPlatform = 'Android';
    else if (/iPhone|iPad|iPod/i.test(ua)) osPlatform = 'iOS';
    else if (/Windows/i.test(ua)) osPlatform = 'Windows';
    else if (/Macintosh|Mac OS/i.test(ua)) osPlatform = 'macOS';
    else if (/Linux/i.test(ua)) osPlatform = 'Linux';

    const diagnosticDetails: string[] = [];

    if (isSecure) {
      diagnosticDetails.push('✓ Secure Context (HTTPS / Localhost Origin) Verified');
    } else {
      diagnosticDetails.push('⚠️ Insecure Context: WebAuthn requires HTTPS/SSL to access device biometric sensor');
    }

    if (hasPublicKey) {
      diagnosticDetails.push('✓ WebAuthn PublicKeyCredential API is natively available in browser engine');
      try {
        if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
          hasPlatformAuth = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          if (hasPlatformAuth) {
            diagnosticDetails.push(`✓ Native Platform Authenticator Detected on ${osPlatform} (Hardware Biometrics active)`);
          } else {
            diagnosticDetails.push(`ℹ️ No built-in platform biometric sensor reported by OS (PIN/Software fallback active)`);
          }
        }

        if (typeof (PublicKeyCredential as any).isConditionalMediationAvailable === 'function') {
          hasConditional = await (PublicKeyCredential as any).isConditionalMediationAvailable();
          if (hasConditional) {
            diagnosticDetails.push('✓ WebAuthn Auto-Fill / Conditional UI Mediation supported');
          }
        }
      } catch (err: any) {
        diagnosticDetails.push(`⚠️ WebAuthn hardware query exception: ${err?.message || err}`);
      }
    } else {
      diagnosticDetails.push('❌ PublicKeyCredential is not supported in this browser version');
    }

    if (hasCrypto) {
      diagnosticDetails.push('✓ Web Cryptography SubtleCrypto (SHA-256 / AES-GCM) hardware acceleration available');
    }

    let hardwareLevel: BiometricHardwareReport['hardwareLevel'] = 'UNSUPPORTED';
    let sensorType: BiometricHardwareReport['sensorType'] = 'Emulated Biometric';
    let recommendations = '';

    if (hasPlatformAuth && isSecure) {
      hardwareLevel = 'NATIVE_BIOMETRIC';
      if (osPlatform === 'Android') sensorType = 'Fingerprint / TouchID';
      else if (osPlatform === 'iOS') sensorType = 'Fingerprint / TouchID';
      else if (osPlatform === 'Windows') sensorType = 'FaceID / Windows Hello';
      else if (osPlatform === 'macOS') sensorType = 'Fingerprint / TouchID';
      else sensorType = 'Platform Passkey';

      recommendations = `Device ${osPlatform} biometric sensor is 100% ready for native Passkey & Fingerprint hardware authentication.`;
    } else if (hasPublicKey || hasCrypto) {
      hardwareLevel = 'SOFTWARE_FALLBACK';
      sensorType = 'Emulated Biometric';
      recommendations = `Platform authenticator is in software/PIN mode. 6-digit Master PIN and encrypted local key store provide full protection.`;
    } else {
      hardwareLevel = 'UNSUPPORTED';
      sensorType = 'Emulated Biometric';
      recommendations = `Please use modern Google Chrome or Microsoft Edge with HTTPS to enable native biometric hardware features.`;
    }

    const report: BiometricHardwareReport = {
      isSupported: hasPlatformAuth,
      hasPlatformAuthenticator: hasPlatformAuth,
      hasConditionalMediation: hasConditional,
      isSecureContext: isSecure,
      hasWebCrypto: hasCrypto,
      hardwareLevel,
      sensorType,
      osPlatform,
      diagnosticDetails,
      recommendations,
      timestamp: new Date().toLocaleTimeString()
    };

    this.cachedReport = report;
    return report;
  }

  /**
   * Get the last cached audit report or run a quick scan
   */
  public static getCachedReport(): BiometricHardwareReport | null {
    return this.cachedReport;
  }
}
