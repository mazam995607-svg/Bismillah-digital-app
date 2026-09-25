import React, { useState } from 'react';
import { WalletBalances } from '../types';
import { AlertTriangle, ShieldCheck, Truck, Settings } from 'lucide-react';

interface Props {
  wallets: WalletBalances;
  onOpenLoadPurchase: (net: string) => void;
}

export const InventoryMonitorWidget: React.FC<Props> = ({ wallets, onOpenLoadPurchase }) => {
  const [criticalThreshold, setCriticalThreshold] = useState<number>(500);
  const [isEditingThreshold, setIsEditingThreshold] = useState<boolean>(false);

  const walletKeys: Array<{ key: keyof WalletBalances; label: string }> = [
    { key: 'Jazz', label: 'Jazz 1' },
    { key: 'Jazz 2', label: 'Jazz 2' },
    { key: 'Telenor', label: 'Telenor 1' },
    { key: 'Telenor 2', label: 'Telenor 2' },
    { key: 'Zong', label: 'Zong 1' },
    { key: 'Zong 2', label: 'Zong 2' },
    { key: 'Ufone', label: 'Ufone 1' },
    { key: 'Ufone 2', label: 'Ufone 2' },
    { key: 'Udhaar App', label: 'Udhaar App' },
  ];

  const lowWallets = walletKeys.filter(item => (wallets[item.key] || 0) < criticalThreshold);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${lowWallets.length > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            {lowWallets.length > 0 ? <AlertTriangle className="w-4 h-4 animate-pulse" /> : <ShieldCheck className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-slate-100 uppercase tracking-wider">Inventory & Wallet Monitor</h3>
            <p className="text-[10px] text-slate-400">
              {lowWallets.length > 0 ? `${lowWallets.length} wallet(s) below critical level` : 'All wallet balances healthy'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditingThreshold(!isEditingThreshold)}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition"
          title="Set Critical Limit"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Threshold Configurator */}
      {isEditingThreshold && (
        <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-300 font-bold text-[11px]">Critical Level (Rs):</span>
          <input
            type="number"
            value={criticalThreshold}
            onChange={(e) => setCriticalThreshold(Math.max(100, Number(e.target.value) || 0))}
            className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-amber-400 outline-none"
          />
        </div>
      )}

      {/* Critical Alert Cards or Healthy Status */}
      {lowWallets.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {lowWallets.map(({ key, label }) => {
            const bal = wallets[key] || 0;
            return (
              <div
                key={key}
                className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-2.5 flex flex-col justify-between space-y-1.5"
              >
                <div className="flex justify-between items-start">
                  <span className="font-extrabold text-xs text-rose-300">{label}</span>
                  <span className="text-[9px] font-mono font-bold bg-rose-500/20 text-rose-200 px-1.5 py-0.5 rounded-full">LOW</span>
                </div>

                <div className="text-sm font-mono font-black text-rose-400">
                  Rs. {bal.toLocaleString()}
                </div>

                <button
                  onClick={() => onOpenLoadPurchase(String(key))}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] py-1 rounded-xl shadow flex items-center justify-center gap-1 transition"
                >
                  <Truck className="w-3 h-3" /> Re-stock Load
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs text-emerald-400">
          <span className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            All wallet balances are above Rs. {criticalThreshold.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">100% Stocked</span>
        </div>
      )}
    </div>
  );
};
