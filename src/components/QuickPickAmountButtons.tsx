import React from 'react';

interface Props {
  onSelectAmount: (amount: number) => void;
  currentAmount?: string | number;
}

const COMMON_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export const QuickPickAmountButtons: React.FC<Props> = ({ onSelectAmount, currentAmount }) => {
  return (
    <div className="mt-1.5 space-y-1">
      <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
        ⚡ Quick Pick Amount
      </span>
      <div className="flex flex-wrap gap-1.5">
        {COMMON_AMOUNTS.map(amt => {
          const isSelected = String(currentAmount) === String(amt);
          return (
            <button
              key={amt}
              type="button"
              onClick={() => onSelectAmount(amt)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition border ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-amber-500/50'
              }`}
            >
              Rs.{amt.toLocaleString()}
            </button>
          );
        })}
      </div>
    </div>
  );
};
