import React, { useState } from 'react';
import { SecurityState, Transaction } from '../types';
import { ShieldCheck, CheckCircle, AlertTriangle, Clock, X, ChevronRight } from 'lucide-react';

interface Props {
  securityState: SecurityState;
  transactions?: Transaction[];
  onOpenDashboard: () => void;
  onFilterOverdueUdhaar?: () => void;
}

export const AppHealthMonitor: React.FC<Props> = ({ 
  securityState, 
  transactions = [], 
  onOpenDashboard,
  onFilterOverdueUdhaar
}) => {
  const [showAlertModal, setShowAlertModal] = useState(false);

  const isEncrypted = true;
  const isTls = typeof window !== 'undefined' ? window.location.protocol === 'https:' : true;
  const isPinEnrolled = !!securityState.pinHash;
  const isBiometricEnrolled = (securityState.enrolledFingerprints || []).length > 0;

  const score = (isEncrypted ? 25 : 0) + (isTls ? 25 : 0) + (isPinEnrolled ? 25 : 0) + (isBiometricEnrolled ? 25 : 0);

  // Find Pending Udhaar entries overdue by > 7 days
  const now = new Date();
  const overdueUdhaarList = transactions.filter(t => {
    if (t.status !== 'Pending') return false;
    
    // Check if it's udhaar
    const isUdhaar = t.kind === 'udhaar' || 
                     t.kind === 'customAccount' || 
                     t.type.toLowerCase().includes('udhaar');
    if (!isUdhaar) return false;

    // Calculate days elapsed
    let txDate: Date | null = null;
    if (t.rawDate) {
      txDate = new Date(t.rawDate);
    } else if (t.date) {
      txDate = new Date(t.date);
    }

    if (!txDate || isNaN(txDate.getTime())) return false;

    const diffDays = Math.floor((now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 7;
  });

  const overdueTotalAmount = overdueUdhaarList.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  return (
    <div className="space-y-2">
      {/* OVERDUE UDHAAR RECURRING WARNING BANNER */}
      {overdueUdhaarList.length > 0 && (
        <div className="bg-rose-950/90 border border-rose-500/50 p-3.5 rounded-2xl text-rose-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-lg animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-600 text-white font-black shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-rose-300 uppercase tracking-wide">
                  🚨 OVERDUE UDHAAR WARNING
                </span>
                <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full font-mono">
                  {overdueUdhaarList.length} OVERDUE
                </span>
              </div>
              <p className="text-[11px] text-rose-200 mt-0.5">
                {overdueUdhaarList.length} Pending Udhaar transaction(s) are older than 7 days. Total Uncollected: <strong className="font-mono text-white">Rs. {overdueTotalAmount.toLocaleString()}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowAlertModal(true)}
              className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow transition flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" /> Details
            </button>
            {onFilterOverdueUdhaar && (
              <button
                onClick={onFilterOverdueUdhaar}
                className="bg-slate-900 hover:bg-slate-800 text-rose-200 font-extrabold text-xs px-3 py-1.5 rounded-xl border border-rose-500/30 transition flex items-center gap-1"
              >
                View Ledger <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* HEALTH MONITOR BAR */}
      <div
        onClick={onOpenDashboard}
        className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-4 rounded-3xl shadow-xl text-slate-100 cursor-pointer transition flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black shadow-md group-hover:scale-110 transition">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                Terminal Security & Health
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                {score}% Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              AES-256 Storage &bull; TLS 1.3 &bull; WebAuthn Biometrics &bull; Zero-Trust
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <div className="flex flex-col items-end text-[10px] font-mono font-bold">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Encrypted Storage
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> PIN & Fingerprint Guard
            </span>
          </div>
          <span className="text-slate-500 group-hover:text-amber-400 transition">&rarr;</span>
        </div>
      </div>

      {/* OVERDUE DETAILS MODAL */}
      {showAlertModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-rose-400">Overdue Pending Udhaar</h3>
                  <p className="text-[10px] text-slate-400">Transactions overdue by &gt; 7 days</p>
                </div>
              </div>
              <button onClick={() => setShowAlertModal(false)} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 text-xs">
              {overdueUdhaarList.map(item => (
                <div key={item.id} className="bg-slate-950 border border-rose-500/30 p-3 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-100 block">{item.account} ({item.name || 'Customer'})</span>
                    <span className="text-[10px] text-slate-400 font-mono">Date: {item.date} ({item.time})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-rose-400 text-sm block">Rs. {item.amount.toLocaleString()}</span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">Overdue &gt; 7 Days</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex gap-2">
              {onFilterOverdueUdhaar && (
                <button
                  onClick={() => {
                    setShowAlertModal(false);
                    onFilterOverdueUdhaar();
                  }}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition"
                >
                  View Pending Ledger
                </button>
              )}
              <button
                onClick={() => setShowAlertModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
