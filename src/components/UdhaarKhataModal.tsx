import React, { useState } from 'react';
import { X, BookOpen, Plus, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveUdhaar: (customerName: string, amount: number, accountSource: string, status: 'Pending' | 'Paid') => void;
}

export const UdhaarKhataModal: React.FC<Props> = ({ isOpen, onClose, onSaveUdhaar }) => {
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [accountSource, setAccountSource] = useState('Shop Cash');

  if (!isOpen) return null;

  const handleSubmit = (status: 'Pending' | 'Paid') => {
    const amt = parseFloat(amount) || 0;
    if (!customerName.trim() || amt <= 0) {
      alert('Please enter Customer Name and valid Amount.');
      return;
    }
    onSaveUdhaar(customerName.trim(), amt, accountSource, status);
    setCustomerName('');
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-purple-400">Udhaar Khata Entry</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Customer ka naam, amount, aur kahan se diye (Account/Cash) darj karein.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Customer Name (Udhaar Lene Wala)</label>
            <input
              type="text"
              required
              placeholder="e.g. Aslam Bhai"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Amount (Rs.)</label>
            <input
              type="number"
              required
              placeholder="e.g. 2000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Source Account / Cash Box</label>
            <input
              type="text"
              required
              placeholder="e.g. Shop Cash / JazzCash / House Rent"
              value={accountSource}
              onChange={e => setAccountSource(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={() => handleSubmit('Pending')}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-extrabold py-3 rounded-xl shadow flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" /> Save Pending Udhaar
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('Paid')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold py-3 rounded-xl shadow flex items-center justify-center gap-1"
          >
            <CheckCircle className="w-4 h-4" /> Save Paid
          </button>
        </div>

      </div>
    </div>
  );
};
