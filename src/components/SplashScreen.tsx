import React, { useEffect, useState, useRef } from 'react';
import { ShieldCheck, Sparkles, Zap, Lock, Cpu } from 'lucide-react';

interface Props {
  onComplete?: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Bismillah POS System...');
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const statusMessages = [
      'Initializing Bismillah POS System...',
      'Loading AES-256 Encryption Engine...',
      'Verifying Biometric & Ledger Integrity...',
      'Connecting Cloud Sync & Offline Storage...',
      'System Ready!'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep += 1;
      const pct = Math.min(100, Math.round((currentStep / 20) * 100));
      setProgress(pct);

      if (pct > 20 && pct <= 40) setStatusText(statusMessages[1]);
      else if (pct > 40 && pct <= 70) setStatusText(statusMessages[2]);
      else if (pct > 70 && pct < 100) setStatusText(statusMessages[3]);
      else if (pct >= 100) setStatusText(statusMessages[4]);

      if (currentStep >= 20) {
        clearInterval(interval);
        if (onCompleteRef.current) {
          setTimeout(() => {
            onCompleteRef.current?.();
          }, 200);
        }
      }
    }, 80);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 overflow-hidden">
      {/* Background Animated Glowing Orbs */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center space-y-6">
        {/* Animated Brand Logo Icon */}
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 blur-xl opacity-60 animate-pulse"></div>
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-2xl shadow-amber-500/40 border border-amber-300/40 transform hover:scale-105 transition duration-500">
            <ShieldCheck className="w-14 h-14 drop-shadow-md" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            DigiDukaan POS
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Universal Digital POS & Ledger
          </p>
        </div>

        {/* Status indicator badges */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-amber-400 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-amber-500/30 shadow-inner">
          <Cpu className="w-3.5 h-3.5 animate-spin text-amber-400" />
          <span>{statusText}</span>
        </div>

        {/* 3-Second Progress Bar */}
        <div className="w-full space-y-1.5">
          <div className="w-full bg-slate-900 border border-slate-800 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1 font-bold">
            <span>SECURE BOOT</span>
            <span className="text-amber-400 font-extrabold">{progress}%</span>
          </div>
        </div>

        {/* Security badges bottom footer */}
        <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-slate-500 pt-4">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-400" /> AES-256 Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Offline-Ready
          </span>
        </div>
      </div>
    </div>
  );
};
