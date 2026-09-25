import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ShieldCheck, ShieldAlert, Lock, Unlock, KeyRound, Eye, EyeOff, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { AdminPasswordManager } from '../utils/AdminPasswordManager';
import { audioChimes } from '../utils/audioChimes';

interface AdminSecurityContextType {
  isAdminUnlocked: boolean;
  unlockAdmin: (pin: string) => { success: boolean; message: string };
  lockAdmin: () => void;
}

const AdminSecurityContext = createContext<AdminSecurityContextType>({
  isAdminUnlocked: false,
  unlockAdmin: () => ({ success: false, message: '' }),
  lockAdmin: () => {}
});

export const useAdminSecurity = () => useContext(AdminSecurityContext);

export const AdminSecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(AdminPasswordManager.isUnlocked());

  useEffect(() => {
    const unsub = AdminPasswordManager.subscribe((unlocked) => {
      setIsAdminUnlocked(unlocked);
    });
    return () => unsub();
  }, []);

  const unlockAdmin = (pin: string) => {
    const result = AdminPasswordManager.unlock(pin);
    if (result.success) {
      audioChimes.playChime('success');
    } else {
      audioChimes.playChime('alert');
    }
    return result;
  };

  const lockAdmin = () => {
    AdminPasswordManager.lock();
    audioChimes.playChime('info');
  };

  return (
    <AdminSecurityContext.Provider value={{ isAdminUnlocked, unlockAdmin, lockAdmin }}>
      {children}
    </AdminSecurityContext.Provider>
  );
};

interface AdminProtectedGateProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * AdminProtectedGate strictly ensures NO child UI elements are rendered
 * until the 6-digit master password ('101010') check passes.
 */
export const AdminProtectedGate: React.FC<AdminProtectedGateProps> = ({
  children,
  title = 'Admin Master Security Gate',
  subtitle = 'Yeh section 6-digit Master PIN se mehfooz hai. PIN enter karein taake controls khul sakein.'
}) => {
  const { isAdminUnlocked, unlockAdmin, lockAdmin } = useAdminSecurity();
  const [inputPin, setInputPin] = useState<string>('');
  const [showMask, setShowMask] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccessShake, setIsSuccessShake] = useState<boolean>(false);

  // If already unlocked, render the protected children directly with a top session banner
  if (isAdminUnlocked) {
    return (
      <div className="space-y-4">
        {/* Admin Session Indicator & Quick Lock Bar */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/40 rounded-3xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                  Admin Master Session Active
                </span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-extrabold">
                  Verified (101010)
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                Tamam dev tools, OTA updates & staging sandboxes khulay huay hain.
              </p>
            </div>
          </div>

          <button
            onClick={lockAdmin}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Lock Admin Session Now"
          >
            <Lock className="w-3.5 h-3.5" />
            Lock Admin Panel
          </button>
        </div>

        {/* Protected Inner Admin Components */}
        {children}
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPin || inputPin.length < 6) {
      setErrorMsg('6-Digit Master PIN darj karein (e.g. 101010).');
      return;
    }

    const res = unlockAdmin(inputPin);
    if (!res.success) {
      setErrorMsg(res.message);
      setInputPin('');
    } else {
      setErrorMsg(null);
      setIsSuccessShake(true);
    }
  };

  const handleDigitClick = (num: string) => {
    if (inputPin.length < 6) {
      const next = inputPin + num;
      setInputPin(next);
      setErrorMsg(null);
      if (next.length === 6) {
        const res = unlockAdmin(next);
        if (!res.success) {
          setErrorMsg(res.message);
          setInputPin('');
        }
      }
    }
  };

  const handleBackspace = () => {
    setInputPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    setInputPin('');
    setErrorMsg(null);
  };

  return (
    <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-xl mx-auto text-center space-y-6 animate-fadeIn">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
        <Lock className="w-8 h-8 animate-bounce" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-black text-white flex items-center justify-center gap-2">
          {title}
          <span className="text-[10px] bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full font-black uppercase">
            Restricted
          </span>
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {subtitle}
        </p>
      </div>

      {/* 6-Digit PIN Display Circles */}
      <div className="flex justify-center items-center gap-3">
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const filled = inputPin.length > idx;
          const char = inputPin[idx];
          return (
            <div
              key={idx}
              className={`w-12 h-14 rounded-2xl flex items-center justify-center text-xl font-black font-mono transition-all duration-200 border-2 ${
                filled
                  ? 'border-amber-400 bg-amber-500/20 text-amber-300 scale-105 shadow-lg shadow-amber-500/10'
                  : 'border-slate-800 bg-slate-950/60 text-slate-600'
              }`}
            >
              {filled ? (showMask ? char : '●') : ''}
            </div>
          );
        })}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Interactive Quick Numpad */}
      <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto pt-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleDigitClick(num)}
            className="h-12 rounded-2xl bg-slate-900/90 hover:bg-amber-500/20 hover:border-amber-500/50 border border-slate-800 text-white hover:text-amber-300 font-black text-lg transition active:scale-95 shadow cursor-pointer"
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          onClick={handleClear}
          className="h-12 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 font-bold text-xs transition active:scale-95 cursor-pointer"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => handleDigitClick('0')}
          className="h-12 rounded-2xl bg-slate-900/90 hover:bg-amber-500/20 hover:border-amber-500/50 border border-slate-800 text-white hover:text-amber-300 font-black text-lg transition active:scale-95 shadow cursor-pointer"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="h-12 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 font-bold text-xs transition active:scale-95 cursor-pointer"
        >
          ⌫
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 px-4">
        <button
          type="button"
          onClick={() => setShowMask(!showMask)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition"
        >
          {showMask ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showMask ? 'Hide PIN' : 'Show PIN'}
        </button>

        <span className="font-mono text-amber-400/90 text-[11px] font-bold">
          Master Pass: <b>101010</b>
        </span>
      </div>
    </div>
  );
};
