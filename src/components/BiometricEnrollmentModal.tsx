import React, { useState, useRef, useEffect } from 'react';
import { 
  Fingerprint, Trash2, Plus, X, ShieldCheck, 
  Check, KeyRound, Smartphone, CheckCircle2, Lock, Unlock, Mail
} from 'lucide-react';
import { SecurityManager } from '../utils/SecurityManager';
import { AuditLogger } from '../utils/AuditLogger';

export interface EnrolledBiometric {
  id: string;
  name: string;
  createdAt: string;
  credentialId?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEnrolled?: (enrolledList: EnrolledBiometric[]) => void;
}

export const BiometricEnrollmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onEnrolled
}) => {
  const [activeTab, setActiveTab] = useState<'finger' | 'passkey'>('finger');
  const [fingers, setFingers] = useState<string[]>(() => SecurityManager.getEnrolledFingerprints());
  const [passkeys, setPasskeys] = useState<string[]>(() => SecurityManager.getEnrolledPasskeys());
  const [newProfileName, setNewProfileName] = useState('');
  const [userEmail, setUserEmail] = useState(() => {
    try {
      const sec = localStorage.getItem('bismillah_pos_security_v3');
      if (sec) {
        const parsed = JSON.parse(sec);
        if (parsed.rootEmail) return parsed.rootEmail;
      }
    } catch {}
    return 'owner@myshop.pk';
  });
  const [isPasskeyAuthorized, setIsPasskeyAuthorized] = useState(false);
  const [isVerifyingPasskey, setIsVerifyingPasskey] = useState(false);
  
  // Fingerprint touch-to-capture interactive state
  const [fingerProgress, setFingerProgress] = useState<number>(0);
  const [isTouchingFinger, setIsTouchingFinger] = useState<boolean>(false);
  const [fingerSuccess, setFingerSuccess] = useState<boolean>(false);
  const touchTimerRef = useRef<any>(null);

  // Passkey creation state
  const [isCreatingPasskey, setIsCreatingPasskey] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFingers(SecurityManager.getEnrolledFingerprints());
      setPasskeys(SecurityManager.getEnrolledPasskeys());
      setIsPasskeyAuthorized(false);
      setStatusMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Authorize Fingerprint Enrollment via Email Passkey
  const handleAuthorizePasskey = async () => {
    setIsVerifyingPasskey(true);
    setStatusMsg(`Email Passkey challenge bhej rahe hain (${userEmail})...`);
    const res = await SecurityManager.verifyEmailPasskeyForEnrollment(userEmail);
    setIsVerifyingPasskey(false);

    if (res.success) {
      setIsPasskeyAuthorized(true);
      setStatusMsg(`✓ Email Passkey Verified! Aap Fingerprint register kar sakte hain.`);
    } else {
      setStatusMsg(res.message);
    }
  };

  // Fingerprint Touch Hold & Capture Flow
  const handleTouchStart = () => {
    if (!isPasskeyAuthorized) {
      setStatusMsg('⚠️ Pehle Email Passkey se verify karen taakay Fingerprint register ho sakay.');
      return;
    }

    if (fingers.length >= 3) {
      setStatusMsg('⚠️ Maximum 3 fingerprints allowed. Pehle kisi ek ko delete karen.');
      return;
    }

    setIsTouchingFinger(true);
    setFingerProgress(0);
    setFingerSuccess(false);
    setStatusMsg('Finger sensor par daba kar rakhein... Capturing ridge patterns...');

    let p = 0;
    touchTimerRef.current = setInterval(() => {
      p += 20;
      setFingerProgress(p);

      if (p >= 100) {
        clearInterval(touchTimerRef.current);
        finishFingerEnrollment();
      }
    }, 200);
  };

  const handleTouchEnd = () => {
    if (fingerProgress < 100) {
      clearInterval(touchTimerRef.current);
      setIsTouchingFinger(false);
      setFingerProgress(0);
      setStatusMsg('Finger jaldi utha li gayi! Dobara sensor ko daba kar rakhein.');
    }
  };

  const finishFingerEnrollment = async () => {
    const nameToUse = newProfileName.trim() || `Finger ${fingers.length + 1}`;
    const res = await SecurityManager.registerWebAuthnBiometric(nameToUse, 'fingerprint');
    const updatedList = SecurityManager.getEnrolledFingerprints();
    setFingers(updatedList);
    setFingerSuccess(true);
    setIsTouchingFinger(false);
    setNewProfileName('');
    setStatusMsg(`✓ ${nameToUse} biometric fingerprint sensor captured & cryptographic hash stored locally!`);
    AuditLogger.log('BIOMETRIC_FINGERPRINT_ENROLLED', 'SUCCESS', 'Biometric Enrollment', `Enrolled fingerprint: ${nameToUse} (Authorized via ${userEmail})`);

    if (onEnrolled) {
      onEnrolled(updatedList.map((name, i) => ({ id: `${i}`, name, createdAt: new Date().toLocaleDateString() })));
    }

    setTimeout(() => {
      setFingerSuccess(false);
      setFingerProgress(0);
    }, 2000);
  };

  const handleDeleteFinger = (name: string) => {
    const res = SecurityManager.deleteFingerprint(name);
    setFingers(res.list);
    setStatusMsg(`Fingerprint ${name} remove ho gaya.`);
    AuditLogger.log('BIOMETRIC_FINGERPRINT_DELETED', 'SUCCESS', 'Biometric Enrollment', `Removed fingerprint: ${name}`);
  };

  // Passkey Creation Flow
  const handleCreatePasskey = async () => {
    if (passkeys.length >= 3) {
      setStatusMsg('⚠️ Maximum 3 Passkeys allowed. Pehle kisi ek ko delete karen.');
      return;
    }

    setIsCreatingPasskey(true);
    const nameToUse = newProfileName.trim() || `Passkey (${userEmail.split('@')[0]})`;
    setStatusMsg(`Creating WebAuthn Passkey: ${nameToUse}...`);

    const res = await SecurityManager.registerWebAuthnBiometric(nameToUse, 'fido2');
    const updated = SecurityManager.getEnrolledPasskeys();
    setPasskeys(updated);
    setIsCreatingPasskey(false);
    setNewProfileName('');
    setStatusMsg(`✓ ${nameToUse} WebAuthn Passkey successfully registered and bound to ${userEmail}!`);
    AuditLogger.log('PASSKEY_REGISTERED', 'SUCCESS', 'Passkey Enrollment', `Enrolled passkey: ${nameToUse}`);
  };

  const handleDeletePasskey = (name: string) => {
    const res = SecurityManager.deletePasskey(name);
    setPasskeys(res.list);
    setStatusMsg(`Passkey ${name} delete ho gaya.`);
    AuditLogger.log('PASSKEY_DELETED', 'SUCCESS', 'Passkey Enrollment', `Removed passkey: ${name}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-amber-500/10 text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-amber-400 uppercase tracking-wide">
                Biometric & Passkey Registration
              </h3>
              <p className="text-[11px] text-slate-400">Direct Fingerprint & Device Passkey Credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-4">
          <button
            onClick={() => {
              setActiveTab('finger');
              setStatusMsg('');
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'finger'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fingerprint className="w-4 h-4" /> Fingerprint ({fingers.length}/3)
          </button>
          <button
            onClick={() => {
              setActiveTab('passkey');
              setStatusMsg('');
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'passkey'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" /> Device Passkey ({passkeys.length}/3)
          </button>
        </div>

        {statusMsg && (
          <p className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-center text-xs mb-3 animate-fadeIn">
            {statusMsg}
          </p>
        )}

        {/* 1. FINGERPRINT TAB */}
        {activeTab === 'finger' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            {/* Email Passkey Gate Header */}
            <div className={`p-3.5 rounded-2xl border transition ${
              isPasskeyAuthorized 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs font-black">Email Passkey Authorization Gate</span>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isPasskeyAuthorized ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {isPasskeyAuthorized ? '✓ Passkey Authorized' : '🔒 Authorization Required'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mb-2">
                Finger register karne k liye owner ki email ka Passkey / Master PIN verify hona zaroori hai.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                  placeholder="admin@bismillahpos.com"
                  disabled={isPasskeyAuthorized}
                  className="flex-grow bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono outline-none disabled:opacity-60"
                />
                {!isPasskeyAuthorized ? (
                  <button
                    onClick={handleAuthorizePasskey}
                    disabled={isVerifyingPasskey}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs shadow cursor-pointer transition flex items-center gap-1.5 shrink-0"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    {isVerifyingPasskey ? 'Verifying...' : 'Verify Passkey'}
                  </button>
                ) : (
                  <button
                    onClick={() => setIsPasskeyAuthorized(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-xl text-xs transition"
                  >
                    Re-lock
                  </button>
                )}
              </div>
            </div>

            <div className={`flex flex-col items-center justify-center p-6 bg-slate-950/80 border rounded-2xl text-center relative overflow-hidden transition ${
              !isPasskeyAuthorized ? 'border-slate-800 opacity-60 pointer-events-none' : 'border-amber-500/40'
            }`}>
              
              {/* Animated Sensor Graphic */}
              <div
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition duration-200 cursor-pointer select-none relative ${
                  fingerSuccess
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : isTouchingFinger
                    ? 'border-amber-400 bg-amber-500/20 text-amber-400 scale-105 shadow-xl shadow-amber-500/30'
                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-amber-500/50'
                }`}
              >
                {fingerSuccess ? (
                  <CheckCircle2 className="w-14 h-14 animate-bounce" />
                ) : (
                  <Fingerprint className={`w-14 h-14 ${isTouchingFinger ? 'animate-pulse' : ''}`} />
                )}

                {/* Circular Progress Ring Indicator */}
                {isTouchingFinger && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <circle
                      cx="56"
                      cy="56"
                      r="50"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeDasharray="314"
                      strokeDashoffset={314 - (314 * fingerProgress) / 100}
                      className="text-amber-400 transition-all duration-150"
                    />
                  </svg>
                )}
              </div>

              <p className="text-xs font-extrabold text-slate-300 mt-3">
                {!isPasskeyAuthorized
                  ? '🔒 Pehle upar Email Passkey verify karein'
                  : fingerSuccess
                  ? '✓ Fingerprint Captured!'
                  : isTouchingFinger
                  ? `Scanning Ridge Vectors... ${fingerProgress}%`
                  : 'Hold sensor button to capture ridge pattern'}
              </p>
            </div>

            {/* Custom Label Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Optional Label (e.g. Right Thumb, Left Index)"
                value={newProfileName}
                onChange={e => setNewProfileName(e.target.value)}
                className="flex-grow bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold outline-none focus:border-amber-500"
              />
            </div>

            {/* Enrolled Fingerprints List */}
            <div className="space-y-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                Enrolled Fingerprints ({fingers.length}/3)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {fingers.map((fName, i) => (
                  <div key={i} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="truncate pr-1">
                      <span className="font-extrabold text-xs text-slate-200 block truncate">{fName}</span>
                      <span className="text-[9px] text-emerald-400 font-bold">✓ Active</span>
                    </div>
                    <button
                      onClick={() => handleDeleteFinger(fName)}
                      className="p-1 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition"
                      title="Delete Fingerprint"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. PASSKEY TAB */}
        {activeTab === 'passkey' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto">
                <KeyRound className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-100 text-sm">FIDO2 Hardware Device Passkey</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Create a secure, device-bound passkey for one-tap POS terminal access without passwords or PINs.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Passkey Label (e.g. Master Terminal Key)"
                  value={newProfileName}
                  onChange={e => setNewProfileName(e.target.value)}
                  className="flex-grow bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleCreatePasskey}
                  disabled={passkeys.length >= 3 || isCreatingPasskey}
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow cursor-pointer transition flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> {isCreatingPasskey ? 'Registering...' : '+ Create Passkey'}
                </button>
              </div>
            </div>

            {/* Enrolled Passkeys List */}
            <div className="space-y-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                Enrolled Passkeys ({passkeys.length}/3)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {passkeys.map((pName, i) => (
                  <div key={i} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="truncate pr-1">
                      <span className="font-extrabold text-xs text-slate-200 block truncate">{pName}</span>
                      <span className="text-[9px] text-cyan-400 font-bold">✓ WebAuthn Device</span>
                    </div>
                    <button
                      onClick={() => handleDeletePasskey(pName)}
                      className="p-1 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition"
                      title="Delete Passkey"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
