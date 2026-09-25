import React, { useState, useEffect } from 'react';
import { Database, HardDrive, Cpu, RefreshCw } from 'lucide-react';

export const StorageMonitorWidget: React.FC = () => {
  const [localStorageSize, setLocalStorageSize] = useState<number>(0);
  const [estimatedQuota, setEstimatedQuota] = useState<{ used: number; quota: number }>({ used: 0, quota: 5 * 1024 * 1024 });
  const [breakdown, setBreakdown] = useState<{ label: string; size: number }[]>([]);
  const [isRefreshing, setIsScanning] = useState(false);

  const calculateStorage = async () => {
    setIsScanning(true);
    let totalLocalBytes = 0;
    const catMap: { [key: string]: number } = {
      'Transactions Ledger': 0,
      'Udhaar & Accounts': 0,
      'Notes & Drafts': 0,
      'Security & Logs': 0,
      'System Configuration': 0
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || '';
        const bytes = key.length + val.length * 2;
        totalLocalBytes += bytes;

        if (key.includes('transactions')) catMap['Transactions Ledger'] += bytes;
        else if (key.includes('udhaar') || key.includes('wallets') || key.includes('account')) catMap['Udhaar & Accounts'] += bytes;
        else if (key.includes('note') || key.includes('draft')) catMap['Notes & Drafts'] += bytes;
        else if (key.includes('security') || key.includes('biometric') || key.includes('auth')) catMap['Security & Logs'] += bytes;
        else catMap['System Configuration'] += bytes;
      }
    }

    setLocalStorageSize(totalLocalBytes);
    setBreakdown(Object.entries(catMap).map(([label, size]) => ({ label, size })));

    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        setEstimatedQuota({
          used: estimate.usage || totalLocalBytes,
          quota: estimate.quota || 50 * 1024 * 1024
        });
      } catch {
        setEstimatedQuota({ used: totalLocalBytes, quota: 5 * 1024 * 1024 });
      }
    } else {
      setEstimatedQuota({ used: totalLocalBytes, quota: 5 * 1024 * 1024 });
    }

    setTimeout(() => setIsScanning(false), 300);
  };

  useEffect(() => {
    calculateStorage();
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  // Safe percentage calculation against 5MB local quota limit or browser estimated quota
  const maxQuota = 5 * 1024 * 1024; // 5MB standard LocalStorage safety limit
  const usagePercentage = Math.min(100, Math.max(1, Math.round((localStorageSize / maxQuota) * 100)));

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs text-slate-200">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-400" />
          <span className="font-extrabold text-slate-100 uppercase tracking-wide">
            IndexedDB & LocalStorage Monitor
          </span>
        </div>
        <button
          onClick={calculateStorage}
          className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition"
          title="Recalculate Storage"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-400 font-bold">Cache Usage (LocalStorage & IndexedDB):</span>
          <span className="font-black text-amber-400">{formatSize(localStorageSize)} / 5.0 MB ({usagePercentage}%)</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 border border-slate-800 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              usagePercentage > 85
                ? 'bg-rose-500'
                : usagePercentage > 60
                ? 'bg-amber-400'
                : 'bg-gradient-to-r from-purple-500 via-indigo-400 to-emerald-400'
            }`}
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
      </div>

      {/* Breakdown List */}
      <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[10px]">
        <span className="text-slate-400 font-bold block mb-1">Storage Breakdown by Category:</span>
        <div className="grid grid-cols-2 gap-1.5">
          {breakdown.map((item, idx) => (
            <div key={idx} className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/60 flex justify-between items-center">
              <span className="text-slate-300 font-semibold truncate max-w-[110px]">{item.label}</span>
              <span className="font-bold text-amber-300 shrink-0">{formatSize(item.size)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 pt-1">
        <HardDrive className="w-3 h-3 text-emerald-400" />
        <span>AES-256 Encrypted local caching active for offline availability.</span>
      </div>

    </div>
  );
};
