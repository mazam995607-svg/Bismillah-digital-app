import React, { useState } from 'react';
import { CommissionBreakdown } from '../types';
import { X, DollarSign, Wallet, Phone, Gamepad2, ShieldAlert, GraduationCap, Building2, Globe, FileText, Plus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  commissions: CommissionBreakdown;
  totalCommission: number;
  onAddCustomCommBox?: (name: string, initialVal: number) => void;
}

export const CommissionBreakdownModal: React.FC<Props> = ({
  isOpen,
  onClose,
  commissions,
  totalCommission,
  onAddCustomCommBox
}) => {
  const [showAddBox, setShowAddBox] = useState(false);
  const [boxName, setBoxName] = useState('');
  const [boxValue, setBoxValue] = useState('');

  if (!isOpen) return null;

  const baseKeys = [
    'jazzComm', 'jazz2Comm', 'zongComm', 'zong2Comm',
    'telenorComm', 'telenor2Comm', 'ufoneComm', 'ufone2Comm',
    'udhaarAppComm', 'bankComm', 'gameTopupComm', 'challanComm',
    'eduComm', 'nadraComm', 'onlinePayComm', 'installmentsComm'
  ];

  const customKeys = Object.keys(commissions).filter(k => !baseKeys.includes(k));

  const standardCards = [
    { key: 'jazzComm', label: 'Jazz 1 Commission', value: commissions.jazzComm || 0, icon: Phone, color: 'from-amber-500 to-amber-600' },
    { key: 'jazz2Comm', label: 'Jazz 2 Commission', value: commissions.jazz2Comm || 0, icon: Phone, color: 'from-orange-500 to-red-600' },
    { key: 'zongComm', label: 'Zong 1 Commission', value: commissions.zongComm || 0, icon: Phone, color: 'from-emerald-500 to-emerald-600' },
    { key: 'zong2Comm', label: 'Zong 2 Commission', value: commissions.zong2Comm || 0, icon: Phone, color: 'from-green-600 to-teal-700' },
    { key: 'telenorComm', label: 'Telenor 1 Commission', value: commissions.telenorComm || 0, icon: Phone, color: 'from-cyan-500 to-cyan-600' },
    { key: 'telenor2Comm', label: 'Telenor 2 Commission', value: commissions.telenor2Comm || 0, icon: Phone, color: 'from-blue-600 to-indigo-700' },
    { key: 'ufoneComm', label: 'Ufone 1 Commission', value: commissions.ufoneComm || 0, icon: Phone, color: 'from-rose-500 to-rose-600' },
    { key: 'ufone2Comm', label: 'Ufone 2 Commission', value: commissions.ufone2Comm || 0, icon: Phone, color: 'from-pink-600 to-rose-700' },
    { key: 'udhaarAppComm', label: 'Udhaar App Commission', value: commissions.udhaarAppComm || 0, icon: Wallet, color: 'from-purple-500 to-purple-700' },
    { key: 'bankComm', label: 'Easypaisa / JazzCash / Banks', value: commissions.bankComm || 0, icon: Building2, color: 'from-indigo-500 to-indigo-700' },
    { key: 'gameTopupComm', label: 'FreeFire / PUBG Topup', value: commissions.gameTopupComm || 0, icon: Gamepad2, color: 'from-amber-600 to-orange-700' },
    { key: 'challanComm', label: 'Bike Traffic Challan', value: commissions.challanComm || 0, icon: ShieldAlert, color: 'from-slate-600 to-slate-800' },
    { key: 'eduComm', label: 'Education Vouchers', value: commissions.eduComm || 0, icon: GraduationCap, color: 'from-teal-600 to-emerald-800' },
    { key: 'nadraComm', label: 'NADRA Official Fees', value: commissions.nadraComm || 0, icon: FileText, color: 'from-emerald-600 to-green-800' },
    { key: 'onlinePayComm', label: 'Online Payments', value: commissions.onlinePayComm || 0, icon: Globe, color: 'from-sky-500 to-blue-700' },
    { key: 'installmentsComm', label: 'Installments & Loans', value: commissions.installmentsComm || 0, icon: DollarSign, color: 'from-violet-600 to-purple-900' },
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (boxName.trim() && onAddCustomCommBox) {
      onAddCustomCommBox(boxName.trim(), parseFloat(boxValue) || 0);
      setBoxName('');
      setBoxValue('');
      setShowAddBox(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">
                Separated Commission Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                Individual profit tracking per network & service box
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddBox(!showAddBox)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow flex items-center gap-1 transition"
            >
              <Plus className="w-4 h-4" /> Add Commission Box
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Commission Box Dialog */}
        {showAddBox && (
          <form onSubmit={handleAddSubmit} className="mb-4 p-4 bg-slate-800 border border-emerald-500/40 rounded-2xl space-y-3">
            <h4 className="text-xs font-extrabold text-emerald-400 uppercase">Create New Commission Category Box</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="e.g. Zong 3 Comm, SadaPay Comm"
                value={boxName}
                onChange={e => setBoxName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-white outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                placeholder="Initial Comm Amount (Rs.)"
                value={boxValue}
                onChange={e => setBoxValue(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddBox(false)}
                className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow"
              >
                Save Box
              </button>
            </div>
          </form>
        )}

        {/* Total Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 rounded-2xl shadow-lg mb-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Grand Total Commission</span>
            <h2 className="text-2xl font-black text-white">Rs. {totalCommission.toLocaleString()}</h2>
          </div>
          <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">
            100% Separated Pools
          </span>
        </div>

        {/* Grid of Individual Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto pr-1 flex-grow">
          {standardCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl flex flex-col justify-between hover:border-amber-500/50 transition shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-300 truncate">{card.label}</span>
                  <div className={`p-1.5 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-sm`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h4 className="text-lg font-black text-emerald-400">
                  Rs. {card.value.toLocaleString()}
                </h4>
              </div>
            );
          })}

          {/* Render User-Added Custom Commission Boxes */}
          {customKeys.map((cKey) => (
            <div
              key={cKey}
              className="bg-slate-800/80 border border-emerald-500/50 p-3.5 rounded-2xl flex flex-col justify-between hover:border-amber-500/50 transition shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-emerald-300 truncate uppercase">{cKey}</span>
                <div className="p-1.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-sm">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
              </div>
              <h4 className="text-lg font-black text-emerald-400">
                Rs. {(commissions[cKey] || 0).toLocaleString()}
              </h4>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            * All transaction commissions automatically route into their specific service pools.
          </p>
        </div>

      </div>
    </div>
  );
};
