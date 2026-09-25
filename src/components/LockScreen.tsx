import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SecurityState } from '../types';
import { SecurityManager } from '../utils/SecurityManager';
import { AuditLogger } from '../utils/AuditLogger';
import { SecurityAlarmService } from '../utils/SecurityAlarmService';
import { ShieldCheck, Fingerprint, Key, RefreshCw, KeyRound, Check, X, ShieldAlert, Volume2 } from 'lucide-react';

interface Props {
  securityState: SecurityState;
  onUnlock: () => void;
  onResetPinReq: (email: string, passwordHash: string) => boolean;
}

export const LockScreen: React.FC<Props> = ({ securityState, onUnlock, onResetPinReq }) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [attempts, setAttempts] = useState(() => SecurityAlarmService.getFailedAttempts() || securityState.intruderAttempts || 0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(() => SecurityAlarmService.getState().lockedUntil || securityState.lockedUntil);
  const [remainingLockSeconds, setRemainingLockSeconds] = useState(() => SecurityAlarmService.getRemainingLockSeconds());
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(() => SecurityAlarmService.isAlarmTriggered());
  const [isScanningFido, setIsScanningFido] = useState(false);

  // Fingerprint Scanner Modal
  const [showFingerprintScanner, setShowFingerprintScanner] = useState(false);
  const [selectedFinger, setSelectedFinger] = useState<string>('Finger 1');
  const [fingerScanningState, setFingerScanningState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [fingerFeedback, setFingerFeedback] = useState<string>('');

  // Passkey Modal
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [selectedPasskey, setSelectedPasskey] = useState<string>('Passkey 1');
  const [passkeyScanningState, setPasskeyScanningState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [passkeyFeedback, setPasskeyFeedback] = useState<string>('');

  // Forgot PIN state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');

  const enrolledFingers = SecurityManager.getEnrolledFingerprints();
  const enrolledPasskeys = SecurityManager.getEnrolledPasskeys();

  useEffect(() => {
    const unsubscribe = SecurityAlarmService.subscribe(alarmState => {
      setAttempts(alarmState.failedAttempts);
      setLockoutTime(alarmState.lockedUntil);
      setIsAlarmPlaying(alarmState.isAlarmTriggered);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (lockoutTime && lockoutTime > Date.now()) {
      interval = setInterval(() => {
        const diff = Math.max(0, Math.ceil((lockoutTime - Date.now()) / 1000));
        setRemainingLockSeconds(diff);
        if (diff <= 0) {
          setLockoutTime(null);
          setAttempts(0);
          SecurityAlarmService.resetAlarm();
          setIsAlarmPlaying(false);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTime]);

  const handleSuccessfulUnlock = () => {
    SecurityAlarmService.recordSuccessfulAuth('Terminal Unlock');
    setIsAlarmPlaying(false);
    setSuccess(true);
    setErrorMsg('');
    setTimeout(() => {
      onUnlock();
    }, 600);
  };

  const handleNumpadClick = (num: string) => {
    if (enteredPin.length < 6) {
      const nextPin = enteredPin + num;
      setEnteredPin(nextPin);
      if (nextPin.length === 6) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin(prev => prev.slice(0, -1));
  };

  const recordFailedAttempt = (method: string, reason: string) => {
    setShake(true);
    setEnteredPin('');
    setTimeout(() => setShake(false), 500);

    const res = SecurityAlarmService.recordFailedAttempt(method, reason);
    setAttempts(res.attempts);
    setErrorMsg(res.message);

    if (res.isTriggered) {
      setLockoutTime(Date.now() + 1 * 60 * 1000);
      setIsAlarmPlaying(true);
    }
  };

  const verifyPin = async (pin: string) => {
    let isValid = false;
    if (securityState.salt) {
      const saltedHash = await SecurityManager.hashPinWithSalt(pin, securityState.salt);
      isValid = saltedHash === securityState.pinHash;
    } else {
      const hash = await SecurityManager.hashString(pin);
      isValid = hash === securityState.pinHash;
    }

    if (isValid) {
      AuditLogger.log('AUTHENTICATION_PIN_SUCCESS', 'SUCCESS', 'Master PIN', 'User unlocked terminal via 6-digit Master PIN.');
      handleSuccessfulUnlock();
    } else {
      recordFailedAttempt('Master PIN', 'Galat 6-digit Security PIN enter kia gaya.');
    }
  };

  // Open Fingerprint Scanner
  const handleOpenFingerprint = () => {
    if (!enrolledFingers || enrolledFingers.length === 0) {
      setErrorMsg('⚠️ Koi Fingerprint register nahi hai! Pehle 6-digit PIN se unlock karke Settings -> Security me jakar Fingerprint add karen.');
      return;
    }

    setSelectedFinger(enrolledFingers[0] || 'Finger 1');
    setFingerScanningState('idle');
    setFingerFeedback('');
    setShowFingerprintScanner(true);
  };

  // Execute Fingerprint Scan Authentication
  const handleExecuteFingerprintScan = async (fingerName: string) => {
    setFingerScanningState('scanning');
    setFingerFeedback('Biometric Sensor par finger touch karke rakhein...');

    const result = await SecurityManager.triggerWebAuthnScan(fingerName);

    if (result.success) {
      setFingerScanningState('success');
      setFingerFeedback(result.message || '✓ Fingerprint Match Confirmed!');
      AuditLogger.log('AUTHENTICATION_BIOMETRIC_SUCCESS', 'SUCCESS', 'Fingerprint Biometric', `Unlocked terminal via enrolled biometric profile (${fingerName}).`);
      
      setTimeout(() => {
        setShowFingerprintScanner(false);
        handleSuccessfulUnlock();
      }, 700);
    } else {
      setFingerScanningState('failed');
      setFingerFeedback(result.message || '❌ Biometric Rejected! Fingerprint match nahi hua.');
      recordFailedAttempt('Fingerprint Biometric', `Unauthorized biometric touch on ${fingerName}`);
    }
  };

  // Open Passkey Authenticator
  const handleOpenPasskey = () => {
    if (!enrolledPasskeys || enrolledPasskeys.length === 0) {
      setErrorMsg('⚠️ Koi Passkey register nahi hai! Pehle 6-digit PIN se unlock karke Passkey add karen.');
      return;
    }

    setSelectedPasskey(enrolledPasskeys[0] || 'Passkey 1');
    setPasskeyScanningState('idle');
    setPasskeyFeedback('');
    setShowPasskeyModal(true);
  };

  // Execute Passkey Authentication
  const handleExecutePasskeyAuth = async (passkeyName: string) => {
    setPasskeyScanningState('scanning');
    setPasskeyFeedback('Authenticating device Passkey via WebAuthn...');

    const result = await SecurityManager.triggerPasskeyAuth(passkeyName);

    if (result.success) {
      setPasskeyScanningState('success');
      setPasskeyFeedback(result.message || '✓ Passkey Verified!');
      AuditLogger.log('AUTHENTICATION_PASSKEY_SUCCESS', 'SUCCESS', 'WebAuthn Passkey', `Unlocked terminal via passkey (${passkeyName}).`);
      
      setTimeout(() => {
        setShowPasskeyModal(false);
        handleSuccessfulUnlock();
      }, 700);
    } else {
      setPasskeyScanningState('failed');
      setPasskeyFeedback(result.message || '❌ Passkey Verification Failed.');
      recordFailedAttempt('WebAuthn Passkey', `Failed passkey verification for ${passkeyName}`);
    }
  };

  // Secure FIDO2 Physical Key Authentication
  const handleFidoKeyClick = async () => {
    if (lockoutTime && lockoutTime > Date.now()) return;

    if (!securityState.fidoKeys || securityState.fidoKeys.length === 0) {
      setErrorMsg('⚠️ Koi FIDO2 Hardware Key register nahi hai! Pehle Settings me ja kar Hardware Key enroll karen.');
      return;
    }

    setIsScanningFido(true);
    setErrorMsg('');
    const res = await SecurityManager.verifyFido2Key(securityState.fidoKeys);
    setIsScanningFido(false);

    if (res.success) {
      setSuccess(true);
      AuditLogger.log('AUTHENTICATION_FIDO_SUCCESS', 'SUCCESS', 'FIDO2 Hardware Key', 'Unlocked terminal via physical security key.');
      setTimeout(() => {
        onUnlock();
      }, 600);
    } else {
      recordFailedAttempt('FIDO2 Hardware Key', res.message);
    }
  };

  const handleResetPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwHash = await SecurityManager.hashString(resetPassword);
    const ok = onResetPinReq(resetEmail.trim().toLowerCase(), pwHash);
    if (ok) {
      setShowForgotModal(false);
      setErrorMsg('✓ PIN Reset Successful! New 6-digit PIN enter karen.');
      setAttempts(0);
      setLockoutTime(null);
    } else {
      alert('❌ Invalid Email or Password verification failed!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-[64px] select-none"
    >
      <motion.div
        animate={
          shake
            ? { x: [0, -16, 16, -12, 12, -6, 6, 0] }
            : success
            ? { scale: [1, 1.08, 0.95], opacity: [1, 1, 0] }
            : { x: 0, scale: 1, opacity: 1 }
        }
        transition={
          shake
            ? { duration: 0.5 }
            : success
            ? { duration: 0.6 }
            : { type: 'spring', stiffness: 350, damping: 25 }
        }
        className="w-full max-w-md bg-slate-900/90 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/20 text-slate-100 relative overflow-hidden flex flex-col items-center"
      >
        
        {/* Top Glow & Branding */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center mb-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-xl shadow-amber-500/20 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black tracking-wider text-amber-400 uppercase">
            BISMILLAH POS GUARD
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            {securityState.rootEmail ? `User: ${securityState.rootEmail}` : 'Terminal Encrypted'}
          </p>
        </div>

        {/* Biometric Buttons Row (Fingerprint & Passkey) */}
        <div className="flex items-center gap-4 my-2">
          {/* Fingerprint Sensor */}
          <button
            onClick={handleOpenFingerprint}
            className="group relative p-4 rounded-3xl bg-slate-800/80 border-2 border-amber-500/40 hover:border-amber-400 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/10 flex flex-col items-center cursor-pointer"
          >
            <div className="absolute inset-0 rounded-3xl bg-amber-500/10 blur-md group-hover:bg-amber-500/20 transition"></div>
            <Fingerprint className={`w-10 h-10 text-amber-400 relative z-10 ${showFingerprintScanner ? 'animate-pulse scale-110' : ''}`} />
            <span className="text-[10px] font-black text-amber-300 mt-1">Fingerprint</span>
          </button>

          {/* Device Passkey */}
          <button
            onClick={handleOpenPasskey}
            className="group relative p-4 rounded-3xl bg-slate-800/80 border-2 border-cyan-500/40 hover:border-cyan-400 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-cyan-500/10 flex flex-col items-center cursor-pointer"
          >
            <div className="absolute inset-0 rounded-3xl bg-cyan-500/10 blur-md group-hover:bg-cyan-500/20 transition"></div>
            <KeyRound className="w-10 h-10 text-cyan-400 relative z-10 group-hover:animate-bounce" />
            <span className="text-[10px] font-black text-cyan-300 mt-1">Passkey</span>
          </button>
        </div>

        <span className="text-[11px] font-bold text-slate-400 mb-4">
          Enter 6-Digit PIN or Authenticate via Biometrics / Passkey
        </span>

        {/* Lockout & Siren Alarm Banner */}
        {lockoutTime && lockoutTime > Date.now() ? (
          <div className="my-4 p-4 bg-rose-950/80 border-2 border-rose-500 rounded-2xl text-center w-full shadow-[0_0_30px_rgba(244,63,94,0.4)] animate-pulse">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ShieldAlert className="w-7 h-7 text-rose-400 animate-bounce" />
              <Volume2 className="w-6 h-6 text-rose-400 animate-ping" />
            </div>
            <p className="text-sm font-black text-rose-200 uppercase tracking-wide">🚨 INTRUDER ALARM ACTIVE</p>
            <p className="text-[11px] text-rose-300 font-semibold mt-1">
              Dual-Frequency Emergency Siren sounding at full volume. Enter correct Master PIN or valid Fingerprint/Passkey to stop alarm.
            </p>
            <p className="text-xl font-mono font-black text-rose-400 mt-2">
              {Math.floor(remainingLockSeconds / 60)}m {remainingLockSeconds % 60}s
            </p>
          </div>
        ) : null}

        {/* PIN Indicators */}
        <div className={`flex justify-center gap-3 my-3 ${shake ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3, 4, 5].map(idx => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                idx < enteredPin.length
                  ? success
                    ? 'bg-emerald-400 border-emerald-400 shadow-[0_0_10px_#34d399]'
                    : 'bg-amber-400 border-amber-400 shadow-[0_0_10px_#f59e0b]'
                  : 'border-slate-600 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-xs font-semibold text-rose-400 mb-2 text-center max-w-xs">
            {errorMsg}
          </p>
        )}

        {/* 6-Digit Sleek Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs my-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleNumpadClick(num)}
              className="py-3 rounded-2xl bg-slate-800/80 hover:bg-amber-500/20 active:bg-amber-500 text-slate-100 hover:text-amber-400 font-mono font-bold text-xl border border-slate-700/60 transition shadow cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setShowForgotModal(true)}
            className="py-3 rounded-2xl bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold transition flex items-center justify-center cursor-pointer"
            title="Forgot PIN?"
          >
            Forgot?
          </button>
          <button
            onClick={() => handleNumpadClick('0')}
            className="py-3 rounded-2xl bg-slate-800/80 hover:bg-amber-500/20 active:bg-amber-500 text-slate-100 hover:text-amber-400 font-mono font-bold text-xl border border-slate-700/60 transition shadow cursor-pointer"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="py-3 rounded-2xl bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-sm font-bold transition flex items-center justify-center cursor-pointer"
            title="Backspace"
          >
            ⌫
          </button>
        </div>

        {/* FIDO2 Hardware Key & Reset PIN */}
        <div className="mt-4 pt-3 border-t border-slate-800 w-full">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[11px] text-slate-500 font-semibold">
              🔒 Bismillah Security Shield
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleFidoKeyClick}
                disabled={!!lockoutTime && lockoutTime > Date.now()}
                className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" /> FIDO2 Key
              </button>
              <button
                onClick={() => setShowForgotModal(true)}
                className="text-slate-400 hover:text-slate-200 underline font-semibold cursor-pointer"
              >
                Reset PIN
              </button>
            </div>
          </div>
        </div>

      </motion.div>

      {/* AUTHENTIC FINGERPRINT SCANNER VERIFICATION MODAL */}
      {showFingerprintScanner && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl flex flex-col items-center space-y-4 text-center">
            <div className="flex items-center justify-between w-full border-b border-slate-800 pb-2">
              <span className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                <Fingerprint className="w-4 h-4 text-amber-400" /> Biometric Fingerprint Authenticator
              </span>
              <button
                onClick={() => setShowFingerprintScanner(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select your registered fingerprint profile to authenticate:
            </p>

            {/* Enrolled Finger Selection */}
            <div className="grid grid-cols-3 gap-2 w-full">
              {enrolledFingers.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedFinger(f)}
                  className={`p-2.5 rounded-2xl border text-xs font-extrabold transition cursor-pointer ${
                    selectedFinger === f
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Big Interactive Fingerprint Sensor Touch Area */}
            <div className="relative my-2">
              <button
                onClick={() => handleExecuteFingerprintScan(selectedFinger)}
                disabled={fingerScanningState === 'scanning'}
                className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl ${
                  fingerScanningState === 'success'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_30px_#10b981]'
                    : fingerScanningState === 'failed'
                    ? 'border-rose-500 bg-rose-500/20 text-rose-400 shadow-[0_0_30px_#f43f5e]'
                    : fingerScanningState === 'scanning'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300 animate-pulse shadow-[0_0_30px_#f59e0b]'
                    : 'border-amber-500/50 bg-slate-800 text-amber-400 hover:border-amber-400 hover:scale-105 active:scale-95'
                }`}
              >
                {fingerScanningState === 'success' ? (
                  <Check className="w-14 h-14 stroke-[3]" />
                ) : fingerScanningState === 'failed' ? (
                  <ShieldAlert className="w-14 h-14" />
                ) : (
                  <Fingerprint className={`w-14 h-14 ${fingerScanningState === 'scanning' ? 'animate-pulse' : ''}`} />
                )}
              </button>
            </div>

            <p className="text-xs font-bold text-slate-200">
              {fingerScanningState === 'idle' && `Touch Sensor to verify ${selectedFinger}`}
              {fingerScanningState === 'scanning' && 'Scanning biometric sensor...'}
              {fingerScanningState === 'success' && '✓ Biometric Match Confirmed!'}
              {fingerScanningState === 'failed' && '❌ Verification Failed! Unauthorized finger.'}
            </p>

            {fingerFeedback && (
              <p className={`text-[11px] font-semibold ${fingerScanningState === 'failed' ? 'text-rose-400' : 'text-amber-300'}`}>
                {fingerFeedback}
              </p>
            )}

            <button
              onClick={() => handleExecuteFingerprintScan(selectedFinger)}
              disabled={fingerScanningState === 'scanning'}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs py-3 rounded-2xl shadow transition cursor-pointer"
            >
              Verify Registered Fingerprint
            </button>
          </div>
        </div>
      )}

      {/* PASSKEY AUTHENTICATOR MODAL */}
      {showPasskeyModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-6 shadow-2xl flex flex-col items-center space-y-4 text-center">
            
            <div className="flex items-center justify-between w-full border-b border-slate-800 pb-2">
              <span className="text-xs font-black text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide">
                <KeyRound className="w-4 h-4 text-cyan-400" /> Device Passkey Authenticator
              </span>
              <button
                onClick={() => setShowPasskeyModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select your registered device Passkey to unlock:
            </p>

            {/* Enrolled Passkey Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              {enrolledPasskeys.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPasskey(p)}
                  className={`p-2.5 rounded-2xl border text-xs font-extrabold transition cursor-pointer truncate ${
                    selectedPasskey === p
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Big Interactive Passkey Touch Area */}
            <div className="relative my-2">
              <button
                onClick={() => handleExecutePasskeyAuth(selectedPasskey)}
                disabled={passkeyScanningState === 'scanning'}
                className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl ${
                  passkeyScanningState === 'success'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_30px_#10b981]'
                    : passkeyScanningState === 'failed'
                    ? 'border-rose-500 bg-rose-500/20 text-rose-400 shadow-[0_0_30px_#f43f5e]'
                    : passkeyScanningState === 'scanning'
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 animate-pulse shadow-[0_0_30px_#06b6d4]'
                    : 'border-cyan-500/50 bg-slate-800 text-cyan-400 hover:border-cyan-400 hover:scale-105 active:scale-95'
                }`}
              >
                {passkeyScanningState === 'success' ? (
                  <Check className="w-14 h-14 stroke-[3]" />
                ) : passkeyScanningState === 'failed' ? (
                  <ShieldAlert className="w-14 h-14" />
                ) : (
                  <KeyRound className={`w-14 h-14 ${passkeyScanningState === 'scanning' ? 'animate-pulse' : ''}`} />
                )}
              </button>
            </div>

            <p className="text-xs font-bold text-slate-200">
              {passkeyScanningState === 'idle' && `Click to authenticate ${selectedPasskey}`}
              {passkeyScanningState === 'scanning' && 'Verifying WebAuthn Passkey...'}
              {passkeyScanningState === 'success' && '✓ Passkey Confirmed!'}
              {passkeyScanningState === 'failed' && '❌ Passkey verification failed.'}
            </p>

            {passkeyFeedback && (
              <p className={`text-[11px] font-semibold ${passkeyScanningState === 'failed' ? 'text-rose-400' : 'text-cyan-300'}`}>
                {passkeyFeedback}
              </p>
            )}

            <button
              onClick={() => handleExecutePasskeyAuth(selectedPasskey)}
              disabled={passkeyScanningState === 'scanning'}
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs py-3 rounded-2xl shadow transition cursor-pointer"
            >
              Verify Passkey
            </button>
          </div>
        </div>
      )}

      {/* Forgot PIN Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-amber-400 mb-3 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Reset Security PIN
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter registered Email and Master Password to verify identity.
            </p>
            <form onSubmit={handleResetPinSubmit} className="space-y-3">
              <input
                type="email"
                required
                placeholder="Registered Email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500"
              />
              <input
                type="password"
                required
                placeholder="Master Password"
                value={resetPassword}
                onChange={e => setResetPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 bg-slate-800 text-slate-400 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 text-slate-950 text-xs font-extrabold py-2.5 rounded-xl hover:bg-amber-400 shadow cursor-pointer"
                >
                  Verify & Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};
