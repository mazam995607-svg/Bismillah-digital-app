import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { Target, TrendingUp, Edit3, Check, Sparkles, Zap, Calendar, DollarSign } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

export const MonthlyProfitGoalWidget: React.FC<Props> = ({ transactions }) => {
  // Monthly Goal State
  const [monthlyGoal, setMonthlyGoal] = useState<number>(() => {
    const saved = localStorage.getItem('bismillah_monthly_profit_goal');
    return saved ? parseFloat(saved) || 50000 : 50000;
  });

  // Daily Financial Target State
  const [dailyTarget, setDailyTarget] = useState<number>(() => {
    const saved = localStorage.getItem('bismillah_daily_financial_goal');
    return saved ? parseFloat(saved) || 25000 : 25000;
  });

  const [isEditingMonthly, setIsEditingMonthly] = useState(false);
  const [isEditingDaily, setIsEditingDaily] = useState(false);
  const [tempMonthlyInput, setTempMonthlyInput] = useState(monthlyGoal.toString());
  const [tempDailyInput, setTempDailyInput] = useState(dailyTarget.toString());

  // Today's Date String in local format (YYYY-MM-DD)
  const todayDateObj = new Date();
  const todayRaw = `${todayDateObj.getFullYear()}-${String(todayDateObj.getMonth() + 1).padStart(2, '0')}-${String(todayDateObj.getDate()).padStart(2, '0')}`;
  const todayFormatted = todayDateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  const currentMonthName = todayDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Today's total transactions calculation (Total Transaction Volume & Today's Commission)
  const todayStats = useMemo(() => {
    const todayTxList = transactions.filter(t => {
      if (t.status !== 'Paid') return false;
      if (t.rawDate) return t.rawDate === todayRaw;
      try {
        const d = new Date(t.date);
        return (
          d.getFullYear() === todayDateObj.getFullYear() &&
          d.getMonth() === todayDateObj.getMonth() &&
          d.getDate() === todayDateObj.getDate()
        );
      } catch {
        return false;
      }
    });

    const totalVolume = todayTxList.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const totalComm = todayTxList.reduce((acc, t) => acc + (Number(t.comm) || 0), 0);
    const count = todayTxList.length;

    return { totalVolume, totalComm, count };
  }, [transactions, todayRaw]);

  // Current month calculation
  const currentMonthComm = useMemo(() => {
    const currentMonth = todayDateObj.getMonth();
    const currentYear = todayDateObj.getFullYear();

    return transactions
      .filter(t => {
        if (t.status !== 'Paid') return false;
        if (t.rawDate) {
          const [y, m] = t.rawDate.split('-').map(Number);
          return y === currentYear && (m - 1) === currentMonth;
        }
        try {
          const d = new Date(t.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        } catch {
          return false;
        }
      })
      .reduce((acc, t) => acc + (Number(t.comm) || 0), 0);
  }, [transactions]);

  // Daily Progress calculation
  const dailyPercentage = Math.min(100, Math.round((todayStats.totalVolume / (dailyTarget || 1)) * 100));
  const dailyRemaining = Math.max(0, dailyTarget - todayStats.totalVolume);

  // Monthly Progress calculation
  const monthlyPercentage = Math.min(100, Math.round((currentMonthComm / (monthlyGoal || 1)) * 100));
  const monthlyRemaining = Math.max(0, monthlyGoal - currentMonthComm);

  // Progress Ring Math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (dailyPercentage / 100) * circumference;

  const handleSaveMonthly = () => {
    const parsed = parseFloat(tempMonthlyInput);
    if (!isNaN(parsed) && parsed > 0) {
      setMonthlyGoal(parsed);
      localStorage.setItem('bismillah_monthly_profit_goal', parsed.toString());
    }
    setIsEditingMonthly(false);
  };

  const handleSaveDaily = () => {
    const parsed = parseFloat(tempDailyInput);
    if (!isNaN(parsed) && parsed > 0) {
      setDailyTarget(parsed);
      localStorage.setItem('bismillah_daily_financial_goal', parsed.toString());
    }
    setIsEditingDaily(false);
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xl text-slate-100 space-y-4 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Target Selector */}
      <div className="flex flex-wrap justify-between items-center gap-2 pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20">
            <Target className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-amber-400 uppercase tracking-wider">
                Financial Goal & Profit Engine
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-extrabold px-2 py-0.5 rounded-full border border-slate-700">
                {currentMonthName}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live Daily Target Progress Ring & Monthly Profit Target
            </p>
          </div>
        </div>

        {/* Quick Goal Customizers */}
        <div className="flex items-center gap-2">
          {/* Daily Goal Trigger */}
          {isEditingDaily ? (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-amber-500/40">
              <span className="text-[11px] font-mono text-amber-400 pl-1 font-bold">Daily Rs.</span>
              <input
                type="number"
                value={tempDailyInput}
                onChange={e => setTempDailyInput(e.target.value)}
                className="w-20 bg-transparent text-xs font-mono font-bold text-slate-100 outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveDaily}
                className="p-1 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempDailyInput(dailyTarget.toString());
                setIsEditingDaily(true);
              }}
              className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 hover:text-amber-400 bg-slate-950 hover:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-800 transition cursor-pointer"
              title="Set Daily Financial Target"
            >
              <Edit3 className="w-3 h-3 text-amber-400" /> Daily Target
            </button>
          )}

          {/* Monthly Goal Trigger */}
          {isEditingMonthly ? (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-emerald-500/40">
              <span className="text-[11px] font-mono text-emerald-400 pl-1 font-bold">Month Rs.</span>
              <input
                type="number"
                value={tempMonthlyInput}
                onChange={e => setTempMonthlyInput(e.target.value)}
                className="w-20 bg-transparent text-xs font-mono font-bold text-slate-100 outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveMonthly}
                className="p-1 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempMonthlyInput(monthlyGoal.toString());
                setIsEditingMonthly(true);
              }}
              className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 hover:text-emerald-400 bg-slate-950 hover:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-800 transition cursor-pointer"
              title="Set Monthly Profit Target"
            >
              <Edit3 className="w-3 h-3 text-emerald-400" /> Month Target
            </button>
          )}
        </div>
      </div>

      {/* Main Dual Grid: Daily Progress Ring (Left) & Monthly Overview (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* LEFT: Daily Goal Circular Progress Ring (5 Columns on Desktop) */}
        <div className="md:col-span-5 bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3.5 relative overflow-hidden">
          {/* Circular SVG Ring */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background Track Circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-slate-800 stroke-current"
                strokeWidth="9"
                fill="transparent"
              />
              {/* Animated Progress Circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="url(#dailyGradient)"
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="dailyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="60%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Percentage Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-base font-black font-mono text-amber-400 leading-none">
                {dailyPercentage}%
              </span>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-tighter mt-0.5">
                Today
              </span>
            </div>
          </div>

          {/* Daily Numerical Details */}
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-slate-400 uppercase tracking-wide">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Today's Sales Goal
            </div>
            
            <div className="text-base font-black font-mono text-emerald-400 truncate">
              Rs. {todayStats.totalVolume.toLocaleString()}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <span>Target:</span>
              <span className="text-amber-300 font-bold">Rs. {dailyTarget.toLocaleString()}</span>
            </div>

            <div className="pt-0.5">
              {dailyPercentage >= 100 ? (
                <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit border border-emerald-500/20">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Daily Target Met! 🎉
                </span>
              ) : (
                <span className="text-[10px] font-bold text-cyan-300 font-mono bg-cyan-500/10 px-2 py-0.5 rounded-full w-fit border border-cyan-500/20">
                  Rs. {dailyRemaining.toLocaleString()} remaining
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Monthly Target & Key Stats (7 Columns on Desktop) */}
        <div className="md:col-span-7 space-y-3">
          
          {/* Monthly Numbers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            
            <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Monthly Profit</span>
              <div className="text-sm sm:text-base font-black font-mono text-emerald-400 truncate">
                Rs. {currentMonthComm.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Target Goal</span>
              <div className="text-sm sm:text-base font-black font-mono text-amber-400 truncate">
                Rs. {monthlyGoal.toLocaleString()}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Today Txns</span>
              <div className="text-sm sm:text-base font-black font-mono text-cyan-400 flex items-center justify-between">
                <span>{todayStats.count} txns</span>
                <span className="text-[11px] text-emerald-400">+Rs. {todayStats.totalComm}</span>
              </div>
            </div>

          </div>

          {/* Monthly Linear Progress Bar */}
          <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Monthly Achievement ({monthlyPercentage}%)
              </span>
              <span className="font-mono text-emerald-400 font-extrabold text-[11px]">
                {monthlyPercentage >= 100 ? 'Target Completed!' : `Rs. ${monthlyRemaining.toLocaleString()} Left`}
              </span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-3 p-0.5 border border-slate-800 relative overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-md relative"
                style={{ width: `${monthlyPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

