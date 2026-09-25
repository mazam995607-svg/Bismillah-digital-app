import React, { useState } from 'react';
import { WalletBalances } from '../types';
import { X, Landmark, ArrowUpRight, ArrowDownLeft, ShieldCheck, Wallet, Plus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  wallets: WalletBalances;
  onAddCustomWallet?: (name: string, initialBalance: number) => void;
}

export const CashRegistersModal: React.FC<Props> = ({ isOpen, onClose, wallets, onAddCustomWallet }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [initialBal, setInitialBal] = useState('');

  if (!isOpen) return null;

  const reservedKeys = ['Jazz', 'Jazz 2', 'Telenor', 'Telenor 2', 'Zong', 'Zong 2', 'Ufone', 'Ufone 2', 'Udhaar App', 'loadCash', 'easyCash'];
  const customWalletKeys = Object.keys(wallets).filter(k => !reservedKeys.includes(k));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (walletName.trim() && onAddCustomWallet) {
      onAddCustomWallet(walletName.trim(), parseFloat(initialBal) || 0);
      setWalletName('');
      setInitialBal('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">
                Dukan Cash Registers & Custom Wallets
              </h3>
              <p className="text-xs text-slate-400">
                Physical Load Cash Box, Digital Easy Cash & Custom Accounts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(!showAddModal)}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow flex items-center gap-1 transition"
            >
              <Plus className="w-4 h-4" /> Add Custom Box
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Custom Register Modal */}
        {showAddModal && (
          <form onSubmit={handleAddSubmit} className="mb-4 p-4 bg-slate-800 border border-amber-500/50 rounded-2xl space-y-3">
            <h4 className="text-xs font-extrabold text-amber-400 uppercase">Add New Network / Custom Cash Register</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="e.g. Zong 3, Jazz 3, SadaPay 2"
                value={walletName}
                onChange={e => setWalletName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-white outline-none focus:border-amber-500"
              />
              <input
                type="number"
                placeholder="Initial Balance (Rs.)"
                value={initialBal}
                onChange={e => setInitialBal(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-white outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow"
              >
                Create Register
              </button>
            </div>
          </form>
        )}

        {/* 2 Main Register Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          
          {/* 1. Physical Dukan Load Cash Box */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-emerald-500/40 p-5 rounded-3xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Wallet className="w-4 h-4" /> Dukan Load Cash
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  Physical Drawer
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-100">
                Rs. {(wallets.loadCash || 0).toLocaleString()}
              </h2>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/80 text-[11px] text-slate-400 space-y-1">
              <p className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ArrowDownLeft className="w-3.5 h-3.5" /> Easyload cash adds here
              </p>
              <p className="flex items-center gap-1 text-rose-400 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" /> Purchase load deducts here
              </p>
            </div>
          </div>

          {/* 2. Digital Easy Cash Box */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-blue-500/40 p-5 rounded-3xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <Landmark className="w-4 h-4" /> Easy Cash Box
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full">
                  Digital / Banks
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-100">
                Rs. {(wallets.easyCash || 0).toLocaleString()}
              </h2>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/80 text-[11px] text-slate-400 space-y-1">
              <p className="flex items-center gap-1 text-blue-400 font-semibold">
                <ArrowDownLeft className="w-3.5 h-3.5" /> Cash In (Deposits) adds here
              </p>
              <p className="flex items-center gap-1 text-amber-400 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" /> Cash Out (Withdrawals) tracks here
              </p>
            </div>
          </div>

        </div>

        {/* Custom Created Wallets List */}
        {customWalletKeys.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-black text-amber-400 uppercase mb-2">Custom Added Load / Cash Boxes:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {customWalletKeys.map(k => (
                <div key={k} className="bg-slate-800 border border-slate-700 p-2.5 rounded-xl flex flex-col">
                  <span className="text-[11px] font-extrabold text-slate-300 truncate">{k}</span>
                  <span className="text-sm font-black text-emerald-400">Rs. {(wallets[k] || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workflow Explanation Banner */}
        <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl text-xs text-slate-300 space-y-2">
          <p className="font-bold text-amber-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Automated Ledger Balance Synchronization:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
            <li>When you perform a <b>Mobile Load</b> (e.g. Rs. 200 Zong), Rs. 200 deducts from Zong load wallet and automatically saves into <b>Dukan Load Cash</b>.</li>
            <li>When you perform a <b>Load Purchase</b> (e.g. Rs. 1000 Jazz load purchase), Rs. 1000 deducts from <b>Dukan Load Cash</b> and adds to Jazz load wallet.</li>
            <li>Money Transfer forms allow toggling between <b>Cash In</b> (Customer Deposit) and <b>Cash Out</b> (Customer Cash Withdrawal).</li>
          </ul>
        </div>

      </div>
    </div>
  );
};
