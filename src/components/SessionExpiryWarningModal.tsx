import React from 'react';
import { Clock, ShieldAlert } from 'lucide-react';

interface Props {
  remainingSeconds: number;
  onExtendSession: () => void;
  onLockNow: () => void;
}

export const SessionExpiryWarningModal: React.FC<Props> = ({
  remainingSeconds,
  onExtendSession,
  onLockNow,
}) => {
  const percentage = Math.max(0, Math.min(100, (remainingSeconds / 60) * 100));

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl shadow-amber-500/10 text-slate-100 text-center relative overflow-hidden">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mb-3 animate-pulse">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-amber-400 uppercase tracking-wide">
          Session Expiring Soon!
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Terminal will automatically lock due to inactivity.
        </p>

        {/* Visual Progress Bar */}
        <div className="my-5">
          <div className="flex justify-between text-xs font-mono font-bold text-amber-400 mb-1">
            <span>Auto-Lock In:</span>
            <span>{remainingSeconds}s</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-1000"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onLockNow}
            className="bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold py-3 rounded-xl transition"
          >
            Lock Now
          </button>
          <button
            onClick={onExtendSession}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-extrabold py-3 rounded-xl hover:from-amber-400 hover:to-amber-500 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1"
          >
            <Clock className="w-4 h-4" /> +5 Mins Extend
          </button>
        </div>
      </div>
    </div>
  );
};
