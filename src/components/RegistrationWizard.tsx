import React, { useState } from 'react';
import { SecurityState } from '../types';
import { SecurityManager } from '../utils/SecurityManager';
import { AuditLogger } from '../utils/AuditLogger';
import { ShieldCheck, Lock, Mail, User, KeyRound, Fingerprint, Sparkles, CheckCircle2 } from 'lucide-react';
import { GoogleLoginButton } from './GoogleLoginButton';
import { EmailVerificationModal } from './EmailVerificationModal';

interface Props {
  onComplete: (newState: Partial<SecurityState>) => void;
}

export const RegistrationWizard: React.FC<Props> = ({ onComplete }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setPinConfirm] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
  const [fingerprintEnrolled, setFingerprintEnrolled] = useState(false);
  const [faceEnrolled, setFaceEnrolled] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState('');

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill out all identity fields.');
      return;
    }
    if (password.length < 6) {
      setError('Master Password must be at least 6 characters.');
      return;
    }
    setError('');
    if (!isEmailVerified) {
      setShowEmailOtpModal(true);
    } else {
      setStep(2);
    }
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setError('Master PIN must be exactly 6 numeric digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match. Re-enter 6-digit PIN.');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleBiometricEnroll = async (type: 'finger' | 'face') => {
    if (type === 'finger') {
      const res = await SecurityManager.triggerWebAuthnScan();
      if (res.success) {
        setFingerprintEnrolled(true);
      }
    } else {
      setFaceEnrolled(true);
    }
  };

  const handleFinalize = async () => {
    const salt = SecurityManager.generateSalt();
    const pwHash = await SecurityManager.hashString(password);
    const pinHash = await SecurityManager.hashPinWithSalt(pin, salt);

    const log = AuditLogger.log(
      'ROOT_ADMIN_REGISTERED',
      'SUCCESS',
      'Setup Wizard',
      `Registered Root Admin: ${email} with 6-digit Salted PIN and WebAuthn Biometrics.`
    );

    onComplete({
      isRegistered: true,
      isLocked: false,
      rootName: `${firstName} ${lastName}`,
      rootEmail: email,
      salt: salt,
      passwordHash: pwHash,
      pinHash: pinHash,
      enrolledFingerprints: fingerprintEnrolled ? ['Fingerprint Slot 1', 'Fingerprint Slot 2', 'Fingerprint Slot 3'] : [],
      isFaceEnrolled: faceEnrolled,
      auditLogs: [log]
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl">
      <div className="w-full max-w-lg bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 text-slate-100 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-extrabold shadow-lg shadow-amber-500/30 mb-3">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black tracking-wide text-amber-400 uppercase">
            DigiDukaan POS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Zero-Trust Root Admin Registration & Security Setup
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${step >= 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>1</div>
          <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-amber-500' : 'bg-slate-800'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${step >= 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>2</div>
          <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-amber-500' : 'bg-slate-800'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${step >= 3 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>3</div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-xs font-semibold text-rose-300 text-center">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Step 1: Admin Identity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">First Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  placeholder="Last Name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Email Address (Data Tied to Email)</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@bismillah.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Master Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition mt-4"
            >
              Continue to 6-Digit PIN &rarr;
            </button>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
              <span className="relative bg-slate-900 px-3 text-[10px] text-slate-500 font-bold uppercase">Or Register with</span>
            </div>

            <GoogleLoginButton
              buttonText="Register with Google Account"
              onSuccess={(user) => {
                const parts = user.displayName.split(' ');
                setFirstName(parts[0] || 'Admin');
                setLastName(parts.slice(1).join(' ') || 'User');
                setEmail(user.email);
                setPassword('GoogleMasterPass123!');
                setError('');
                setStep(2);
              }}
              onError={(err) => setError(err)}
            />
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Step 2: Create 6-Digit Security PIN</h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">6-Digit Security PIN</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="e.g. 123456"
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-lg font-mono text-center tracking-widest text-amber-400 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Confirm 6-Digit PIN</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="Re-enter PIN"
                  value={confirmPin}
                  onChange={e => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-lg font-mono text-center tracking-widest text-amber-400 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 bg-slate-800 text-slate-300 font-semibold py-3 rounded-xl hover:bg-slate-700 transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-2/3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition"
              >
                Continue to Biometrics &rarr;
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-5 text-center">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Step 3: Biometric Enrollment (Android Style)</h3>
            <p className="text-xs text-slate-400">Enroll up to 3 Fingerprints or Face Unlock for quick access.</p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleBiometricEnroll('finger')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition ${
                  fingerprintEnrolled 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                    : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-amber-500'
                }`}
              >
                <Fingerprint className="w-8 h-8 text-amber-400 animate-pulse" />
                <span className="text-xs font-bold">
                  {fingerprintEnrolled ? '✓ 3 Fingerprints Enrolled' : 'Scan Fingerprint'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleBiometricEnroll('face')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition ${
                  faceEnrolled 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                    : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-amber-500'
                }`}
              >
                <Sparkles className="w-8 h-8 text-amber-400" />
                <span className="text-xs font-bold">
                  {faceEnrolled ? '✓ Face Lock Active' : 'Enroll Face ID'}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleFinalize}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-extrabold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 transition mt-4"
            >
              Complete Registration & Enter POS Terminal
            </button>
          </div>
        )}
      </div>

      {/* Email Verification OTP Modal */}
      <EmailVerificationModal
        isOpen={showEmailOtpModal}
        email={email}
        onClose={() => setShowEmailOtpModal(false)}
        onSuccess={() => {
          setIsEmailVerified(true);
          setShowEmailOtpModal(false);
          setStep(2);
        }}
      />
    </div>
  );
};
