import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';
import { TrendingUp, BarChart3, Calendar, Sparkles } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

export const DailyAnalyticsChart: React.FC<Props> = ({ transactions }) => {
  const [viewMode, setViewMode] = useState<'commission' | 'volume' | 'combined'>('commission');

  // Compute last 7 days metrics
  const chartData = useMemo(() => {
    const days: { dateStr: string; label: string; rawDate: string; commission: number; volume: number; count: number }[] = [];

    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      
      const rawDate = d.toISOString().slice(0, 10);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullLocaleDate = d.toLocaleDateString();

      // Find transactions matching rawDate or dateStr
      const dayTx = transactions.filter(t => {
        if (t.rawDate) return t.rawDate === rawDate;
        if (t.date) return t.date === fullLocaleDate || t.date.includes(dateStr);
        return false;
      });

      const commission = dayTx.reduce((acc, t) => acc + (Number(t.comm) || 0), 0);
      const volume = dayTx.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

      days.push({
        dateStr,
        label: dateStr,
        rawDate,
        commission,
        volume,
        count: dayTx.length
      });
    }

    return days;
  }, [transactions]);

  // Overall 7-day metrics
  const total7DayComm = useMemo(() => chartData.reduce((a, b) => a + b.commission, 0), [chartData]);
  const total7DayVol = useMemo(() => chartData.reduce((a, b) => a + b.volume, 0), [chartData]);
  const avgDailyComm = Math.round(total7DayComm / 7);

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-amber-400">7-Day Business Analytics</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time daily earnings & volume tracking over the last week
          </p>
        </div>

        {/* View Mode Selector */}
        <div className="flex bg-slate-950 p-1 rounded-xl text-xs font-bold border border-slate-800">
          <button
            onClick={() => setViewMode('commission')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === 'commission'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Commission
          </button>
          <button
            onClick={() => setViewMode('volume')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === 'volume'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Volume
          </button>
          <button
            onClick={() => setViewMode('combined')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === 'combined'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Combined
          </button>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase block">7-Day Total Commission</span>
          <span className="text-sm sm:text-base font-black text-amber-400 font-mono">
            Rs. {total7DayComm.toLocaleString()}
          </span>
        </div>
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase block">7-Day Total Volume</span>
          <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
            Rs. {total7DayVol.toLocaleString()}
          </span>
        </div>
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Avg Daily Earnings</span>
          <span className="text-sm sm:text-base font-black text-cyan-400 font-mono">
            Rs. {avgDailyComm.toLocaleString()}/day
          </span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'commission' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="dateStr" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Commission']}
              />
              <Area type="monotone" dataKey="commission" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#commGrad)" />
            </AreaChart>
          ) : viewMode === 'volume' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="dateStr" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Volume']}
              />
              <Bar dataKey="volume" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="dateStr" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="commission" name="Commission (Rs.)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="volume" name="Volume (Rs.)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

    </div>
  );
};
