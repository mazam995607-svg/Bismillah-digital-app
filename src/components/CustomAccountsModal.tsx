import React, { useState } from 'react';
import { CustomAccount } from '../types';
import { X, Plus, Trash2, FolderPlus, ArrowUpRight, ArrowDownLeft, BookOpen, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accounts: CustomAccount[];
  onCreateAccounts: (names: string[]) => void;
  onAddBalance: (accountId: string, amount: number) => void;
  onClearBalance: (accountId: string) => void;
  onDeleteAccount: (accountId: string) => void;
  onGiveUdhaar: (accountId: string, customerName: string, amount: number) => void;
}

export const CustomAccountsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  accounts,
  onCreateAccounts,
  onAddBalance,
  onClearBalance,
  onDeleteAccount,
  onGiveUdhaar
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [accountCount, setAccountCount] = useState(1);
  const [accountNames, setAccountNames] = useState<string[]>(['Shop Rent']);

  // Add Balance Dialog state
  const [activeAddBalId, setActiveAddBalId] = useState<string | null>(null);
  const [addBalAmount, setAddBalAmount] = useState('');

  // Give Udhaar Dialog state
  const [activeUdhaarId, setActiveUdhaarId] = useState<string | null>(null);
  const [udhaarCustomerName, setUdhaarCustomerName] = useState('');
  const [udhaarAmount, setUdhaarAmount] = useState('');

  // Delete Confirmation State
  const [accountToDelete, setAccountToDelete] = useState<CustomAccount | null>(null);

  if (!isOpen) return null;

  const handleCountChange = (count: number) => {
    const num = Math.max(1, Math.min(10, count));
    setAccountCount(num);
    const newNames = Array(num).fill('').map((_, i) => accountNames[i] || `Account ${i + 1}`);
    setAccountNames(newNames);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validNames = accountNames.map(n => n.trim()).filter(Boolean);
    if (validNames.length === 0) return;
    onCreateAccounts(validNames);
    setShowCreateDialog(false);
  };

  const submitAddBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(addBalAmount) || 0;
    if (activeAddBalId && amt > 0) {
      onAddBalance(activeAddBalId, amt);
      setActiveAddBalId(null);
      setAddBalAmount('');
    }
  };

  const submitGiveUdhaar = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(udhaarAmount) || 0;
    if (activeUdhaarId && udhaarCustomerName.trim() && amt > 0) {
      onGiveUdhaar(activeUdhaarId, udhaarCustomerName.trim(), amt);
      setActiveUdhaarId(null);
      setUdhaarCustomerName('');
      setUdhaarAmount('');
    }
  };

  const confirmDeleteAccount = () => {
    if (accountToDelete) {
      onDeleteAccount(accountToDelete.id);
      setAccountToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400">
              <FolderPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-400 uppercase tracking-wide">
                Custom Expense & Personal Accounts
              </h3>
              <p className="text-xs text-slate-400">
                Non-shop funds: House Rent, Shop Rent, Electric Bills, Education, Ration, etc.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAccountCount(1);
                setAccountNames(['Personal Expense']);
                setShowCreateDialog(true);
              }}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Add Accounts
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Create Batch Accounts Modal */}
        {showCreateDialog && (
          <div className="mb-6 p-4 bg-slate-800/90 border border-purple-500/40 rounded-2xl shadow-xl">
            <h4 className="text-sm font-extrabold text-purple-400 mb-3 flex items-center gap-2">
              <FolderPlus className="w-4 h-4" /> Batch Create Custom Accounts
            </h4>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  How many accounts do you want to create? (e.g. 1, 2, or 3)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={accountCount}
                  onChange={e => handleCountChange(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm font-bold text-slate-100 outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {accountNames.map((name, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 w-6">#{i + 1}</span>
                    <input
                      type="text"
                      required
                      placeholder={`e.g. House Rent, Gas Bill, Children Fee`}
                      value={name}
                      onChange={e => {
                        const updated = [...accountNames];
                        updated[i] = e.target.value;
                        setAccountNames(updated);
                      }}
                      className="flex-grow bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none focus:border-purple-500"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDialog(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white text-xs font-extrabold rounded-xl hover:bg-purple-500 shadow"
                >
                  Create {accountCount} Account(s)
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List of Custom Accounts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pr-1 flex-grow">
          {accounts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-bold">No Custom Accounts created yet.</p>
              <p className="text-xs">Click "Add Accounts" above to create House Rent, Bills, or Education accounts.</p>
            </div>
          ) : (
            accounts.map(acc => (
              <div
                key={acc.id}
                className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex flex-col justify-between hover:border-purple-500/50 transition shadow"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black text-amber-400 truncate max-w-[130px] uppercase">
                      {acc.name}
                    </span>
                    <button
                      onClick={() => setAccountToDelete(acc)}
                      className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 text-[10px] font-bold rounded-lg border border-rose-500/30 transition flex items-center gap-1"
                      title="Delete Account"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                  <h3 className="text-xl font-black text-emerald-400">
                    Rs. {acc.balance.toLocaleString()}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Created: {acc.createdAt}</p>
                </div>

                <div className="space-y-1.5 mt-4 pt-3 border-t border-slate-700/80">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        setActiveAddBalId(acc.id);
                        setAddBalAmount('');
                      }}
                      className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-bold py-1.5 rounded-xl shadow flex items-center justify-center gap-1"
                    >
                      <ArrowDownLeft className="w-3 h-3" /> Add Bal
                    </button>
                    <button
                      onClick={() => onClearBalance(acc.id)}
                      className="bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-bold py-1.5 rounded-xl shadow flex items-center justify-center gap-1"
                    >
                      <ArrowUpRight className="w-3 h-3" /> Clear Bal
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setActiveUdhaarId(acc.id);
                      setUdhaarCustomerName('');
                      setUdhaarAmount('');
                    }}
                    className="w-full bg-purple-600/80 hover:bg-purple-600 text-white text-[11px] font-extrabold py-1.5 rounded-xl shadow flex items-center justify-center gap-1"
                  >
                    <BookOpen className="w-3 h-3" /> Give Udhaar from {acc.name}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {accountToDelete && (
          <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-sm bg-slate-900 border border-rose-500/50 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-2.5 text-rose-400">
                <Trash2 className="w-6 h-6" />
                <h4 className="text-sm font-black uppercase">Delete Custom Account?</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to delete the account <span className="font-extrabold text-amber-400">"{accountToDelete.name}"</span>?
                Its remaining balance of <span className="font-bold text-emerald-400">Rs. {accountToDelete.balance.toLocaleString()}</span> will be removed.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setAccountToDelete(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAccount}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black py-2.5 rounded-xl shadow"
                >
                  Yes, Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Balance Sub-Dialog */}
        {activeAddBalId && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl">
              <h4 className="text-sm font-bold text-amber-400 mb-3">Add Balance to Account</h4>
              <form onSubmit={submitAddBalance} className="space-y-3">
                <input
                  type="number"
                  required
                  placeholder="Amount (Rs.)"
                  value={addBalAmount}
                  onChange={e => setAddBalAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm font-bold text-slate-100 outline-none focus:border-amber-500"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveAddBalId(null)}
                    className="flex-1 bg-slate-800 text-slate-400 text-xs font-bold py-2 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 text-white text-xs font-extrabold py-2 rounded-xl shadow"
                  >
                    Add Balance
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Give Udhaar Sub-Dialog */}
        {activeUdhaarId && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl">
              <h4 className="text-sm font-bold text-purple-400 mb-2">Give Udhaar from Account</h4>
              <p className="text-[11px] text-slate-400 mb-3">
                Amount will deduct from this account & link to Udhaar Khata ledger.
              </p>
              <form onSubmit={submitGiveUdhaar} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Customer Name (e.g. Hammad)"
                  value={udhaarCustomerName}
                  onChange={e => setUdhaarCustomerName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none focus:border-purple-500"
                />
                <input
                  type="number"
                  required
                  placeholder="Amount (Rs.)"
                  value={udhaarAmount}
                  onChange={e => setUdhaarAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none focus:border-purple-500"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveUdhaarId(null)}
                    className="flex-1 bg-slate-800 text-slate-400 text-xs font-bold py-2 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white text-xs font-extrabold py-2 rounded-xl shadow"
                  >
                    Record Udhaar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
