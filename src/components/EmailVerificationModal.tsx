import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, RefreshCw, KeyRound, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';
import { AuthService } from '../utils/AuthService';

interface Props {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EmailVerificationModal: React.FC<Props> = ({
  isOpen,
  email,
  onClose,
  onSuccess
}) => {
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [simulatedOTP, setSimulatedOTP] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [incomingSmsBanner, setIncomingSmsBanner] = useState<{ otp: string; show: boolean }>({ otp: '', show: false });

  useEffect(() => {
    if (isOpen && email) {
      handleSendOTP();
    }
  }, [isOpen, email]);

  // Subscribe to Automated Auto-Paste OTP Listener (Bank App Style)
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = AuthService.subscribeOTPListener((receivedOtp, targetEmail) => {
      if (targetEmail === email.toLowerCase().trim()) {
        setIncomingSmsBanner({ otp: receivedOtp, show: true });
        
        // Auto-paste listener effect: auto fill after 800ms
        setTimeout(() => {
          setOtpInput(receivedOtp);
        }, 800);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, email]);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen) return null;

  const handleSendOTP = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setIncomingSmsBanner({ otp: '', show: false });

    const res = await AuthService.sendEmailOTP(email);
    setLoading(false);
    if (res.success) {
      setSuccessMsg(res.message);
      if (res.simulatedOTP) {
        setSimulatedOTP(res.simulatedOTP);
      }
      setResendTimer(30);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length !== 6) {
      setErrorMsg('OTP code must be 6 numeric digits.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const res = await AuthService.verifyEmailOTP(email, otpInput);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Email successfully verified with bank-grade security!');
      setTimeout(() => {
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
        onClose();
      }, 800);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-slate-100 relative overflow-hidden flex flex-col space-y-4">
        
        {/* Floating Incoming Banking SMS Notification Banner */}
        {incomingSmsBanner.show && (
          <div className="animate-bounce bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-3 rounded-2xl shadow-xl border border-emerald-400/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-300 block">Bank SMS / Email Received:</span>
                <p className="text-xs font-mono font-extrabold">Your OTP code is <span className="underline decoration-amber-300">{incomingSmsBanner.otp}</span></p>
              </div>
            </div>
            <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Auto-Pasted!
            </span>
          </div>
        )}

        {/* Glowing Orbs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-amber-400 uppercase tracking-wide">
                Bank Auth OTP Verification
              </h3>
              <p className="text-[10px] text-slate-400">
                Automated SMS & Email Auto-Paste Listener
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          We have dispatched a unique 6-digit One-Time Passcode (OTP) to:
          <span className="font-extrabold text-amber-400 block mt-0.5">{email}</span>
        </p>

        {/* Demo OTP Banner for testing */}
        {simulatedOTP && !incomingSmsBanner.show && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Generated Email OTP Code:</span>
                <span className="text-lg font-black tracking-widest text-amber-300">{simulatedOTP}</span>
              </div>
            </div>
            <button
              onClick={() => setOtpInput(simulatedOTP)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1.5 rounded-xl shadow transition"
            >
              Auto-Fill Code
            </button>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-300">Enter 6-Digit Passcode:</label>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">Auto-Paste Listener Active ⚡</span>
            </div>
            <input
              type="text"
              maxLength={6}
              value={otpInput}
              onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 849201"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-center text-xl font-mono tracking-[0.5em] text-amber-400 outline-none focus:border-amber-400 shadow-inner"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-2xl text-xs font-bold text-rose-300 text-center">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl text-xs font-bold text-emerald-300 text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otpInput.length !== 6}
            className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>Verify & Authenticate Email</span>
          </button>
        </form>

        {/* Resend Action */}
        <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
          <span className="text-slate-400">Didn't receive passcode?</span>
          <button
            onClick={handleSendOTP}
            disabled={resendTimer > 0 || loading}
            className={`font-extrabold ${resendTimer > 0 ? 'text-slate-500' : 'text-amber-400 hover:underline'}`}
          >
            {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend New OTP'}
          </button>
        </div>

      </div>
    </div>
  );
};
