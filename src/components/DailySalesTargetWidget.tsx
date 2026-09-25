import React, { useState } from 'react';
import { Transaction } from '../types';
import { Target, TrendingUp, CheckCircle, Edit2, Check } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

export const DailySalesTargetWidget: React.FC<Props> = ({ transactions }) => {
  const [dailyGoal, setDailyGoal] = useState<number>(50000);
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [tempGoal, setTempGoal] = useState<string>('50000');

  // Calculate today's date in local YYYY-MM-DD format
  const todayStr = new Date().toISOString().slice(0, 10);

  // Sum today's paid transactions
  const todayTotal = transactions
    .filter(t => t.rawDate === todayStr && t.status === 'Paid')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const percentage = Math.min(100, Math.round((todayTotal / dailyGoal) * 100));
  const isGoalReached = todayTotal >= dailyGoal;

  const handleSaveGoal = () => {
    const val = Number(tempGoal);
    if (val && val > 0) {
      setDailyGoal(val);
    }
    setIsEditingGoal(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${isGoalReached ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {isGoalReached ? <CheckCircle className="w-4 h-4" /> : <Target className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-slate-100 uppercase tracking-wider">Daily Revenue Target</h3>
            <p className="text-[10px] text-slate-400">Track daily sales volume</p>
          </div>
        </div>

        <button
          onClick={() => {
            setTempGoal(dailyGoal.toString());
            setIsEditingGoal(!isEditingGoal);
          }}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition"
          title="Edit Target Goal"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Goal Editor Input */}
      {isEditingGoal && (
        <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-300 font-bold text-[11px]">Daily Target (Rs):</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={tempGoal}
              onChange={(e) => setTempGoal(e.target.value)}
              className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-amber-400 outline-none"
            />
            <button
              onClick={handleSaveGoal}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-1 rounded-lg font-bold"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Progress & Numbers */}
      <div className="flex items-center gap-4">
        {/* Radial Progress Circle */}
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="26"
              stroke="currentColor"
              strokeWidth="5"
              className="text-slate-950"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r="26"
              stroke="currentColor"
              strokeWidth="5"
              strokeDasharray={2 * Math.PI * 26}
              strokeDashoffset={2 * Math.PI * 26 - (percentage / 100) * (2 * Math.PI * 26)}
              strokeLinecap="round"
              className={`transition-all duration-700 ${isGoalReached ? 'text-emerald-400' : 'text-amber-400'}`}
              fill="transparent"
            />
          </svg>
          <span className="absolute font-mono font-black text-xs text-slate-100">
            {percentage}%
          </span>
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-slate-400 font-bold">Today's Sales:</span>
            <div className="font-mono font-black text-slate-100 text-xs">
              <span className="text-amber-400">Rs. {todayTotal.toLocaleString()}</span>
              <span className="text-slate-500 text-[10px]"> / {dailyGoal.toLocaleString()}</span>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isGoalReached
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 font-extrabold text-emerald-400">
              <TrendingUp className="w-3 h-3" /> {isGoalReached ? 'Goal Met' : `${percentage}% Reached`}
            </span>
            <span>
              {isGoalReached
                ? '🎉 Achieved!'
                : `Rs. ${(dailyGoal - todayTotal).toLocaleString()} left`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
