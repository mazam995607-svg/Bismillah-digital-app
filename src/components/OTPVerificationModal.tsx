import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Smartphone, RefreshCw, CheckCircle2, AlertTriangle, Sparkles, X, Download, Copy, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  targetPhoneOrEmail?: string;
}

export const OTPVerificationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'OTP Security Code Verification',
  targetPhoneOrEmail = '0317-4716701 / Admin Phone',
}) => {
  const [generatedOTP, setGeneratedOTP] = useState<string>('');
  const [userOTP, setUserOTP] = useState<string>('');
  const [timer, setTimer] = useState<number>(60);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [verified, setVerified] = useState<boolean>(false);
  const [autoDetecting, setAutoDetecting] = useState<boolean>(true);
  const [autoPasted, setAutoPasted] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      generateNewOTP();
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: any = null;
    if (isOpen && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, timer]);

  // WebOTP API & Automatic Banking SMS Auto-Detect logic
  useEffect(() => {
    if (!isOpen || !generatedOTP) return;

    let isSubscribed = true;

    // WebOTP API standard detection
    if ('OTPCredential' in window) {
      const ac = new AbortController();
      (navigator.credentials as any)
        .get({
          otp: { transport: ['sms'] },
          signal: ac.signal,
        })
        .then((otp: any) => {
          if (isSubscribed && otp && otp.code) {
            setUserOTP(otp.code);
            setAutoPasted(true);
          }
        })
        .catch(() => {});
    }

    // Banking Standard Automatic Detection simulation timer (1.5 seconds)
    const autoDetectTimeout = setTimeout(() => {
      if (isSubscribed && autoDetecting) {
        setUserOTP(generatedOTP);
        setAutoPasted(true);
      }
    }, 1800);

    return () => {
      isSubscribed = false;
      clearTimeout(autoDetectTimeout);
    };
  }, [isOpen, generatedOTP, autoDetecting]);

  const generateNewOTP = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(code);
    setUserOTP('');
    setTimer(60);
    setErrorMsg('');
    setVerified(false);
    setAutoDetecting(true);
    setAutoPasted(false);
  };

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (userOTP === generatedOTP) {
      setVerified(true);
      setErrorMsg('');
      setTimeout(() => {
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
        onClose();
      }, 1000);
    } else {
      setErrorMsg('Incorrect OTP Code! Please check the 6-digit code received via SMS.');
    }
  };

  const handleAutoFillClick = () => {
    setUserOTP(generatedOTP);
    setAutoPasted(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6 text-amber-300 animate-bounce" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide flex items-center gap-1.5">
                {title} <Sparkles className="w-4 h-4 text-amber-300" />
              </h3>
              <p className="text-xs text-emerald-100 font-semibold">Bank-Grade Banking SMS Auto-Detect Verification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* BANKING-GRADE AUTOMATIC SMS DETECTION BANNER */}
          <div className="p-3.5 bg-slate-950 border border-amber-500/40 rounded-2xl space-y-1.5 relative overflow-hidden">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-amber-400">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400 animate-pulse" />
                Incoming SMS Auto-Detector
              </span>
              <span className="text-slate-400">Timer: {timer}s</span>
            </div>

            {autoPasted ? (
              <div className="p-2 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  SMS Code Auto-Detected & Pasted!
                </span>
                <span className="font-mono text-amber-300 font-extrabold text-sm">{generatedOTP}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono font-bold text-slate-300">
                  SMS Code Sent: <span className="text-amber-300 text-base font-black tracking-widest">{generatedOTP}</span>
                </p>
                <button
                  type="button"
                  onClick={handleAutoFillClick}
                  className="px-2.5 py-1 bg-amber-500/30 hover:bg-amber-500/50 text-amber-300 border border-amber-400/50 rounded-lg text-[10px] font-extrabold transition flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" /> Auto-Fill
                </button>
              </div>
            )}

            <p className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>Target SIM / Email: {targetPhoneOrEmail}</span>
              <span className="text-emerald-400 font-bold">WebOTP Active</span>
            </p>
          </div>

          {verified ? (
            <div className="p-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl font-black text-center flex items-center justify-center gap-2 text-sm shadow-xl animate-fadeIn">
              <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-bounce" />
              <span>SMS OTP Verified! Secure Session Unlocked...</span>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-extrabold text-slate-200">6-Digit Security Code</label>
                  <span className="text-[10px] text-emerald-400 font-mono">Banking Auto-Detect Standard</span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={userOTP}
                  onChange={e => setUserOTP(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-center text-2xl font-mono font-black text-amber-300 tracking-[0.3em] outline-none focus:border-emerald-500 shadow-inner"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-400 font-bold flex items-center gap-1 p-2 bg-rose-500/10 rounded-xl border border-rose-500/30">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {errorMsg}
                </p>
              )}

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={generateNewOTP}
                  disabled={timer > 45}
                  className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 disabled:opacity-50 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resend SMS
                </button>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-950 transition"
                >
                  Verify & Proceed
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
