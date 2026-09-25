import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, Coins, Fuel, 
  Sparkles, RefreshCw, X, ArrowUpRight, ArrowDownRight, Minus, Bell, Activity
} from 'lucide-react';

export interface MarketRateItem {
  id: string;
  symbol: string;
  name: string;
  category: 'Currency' | 'Commodity' | 'Stock & Energy';
  currentRate: number;
  previousRate: number;
  unit: string;
  lastUpdated: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items?: MarketRateItem[];
  onRefresh?: () => void;
}

const INITIAL_MARKET_RATES: MarketRateItem[] = [
  {
    id: 'usd-pkr',
    symbol: 'USD / PKR',
    name: 'US Dollar',
    category: 'Currency',
    currentRate: 278.50,
    previousRate: 278.10,
    unit: 'PKR',
    lastUpdated: 'Just now'
  },
  {
    id: 'eur-pkr',
    symbol: 'EUR / PKR',
    name: 'Euro',
    category: 'Currency',
    currentRate: 302.20,
    previousRate: 302.80,
    unit: 'PKR',
    lastUpdated: 'Just now'
  },
  {
    id: 'aed-pkr',
    symbol: 'AED / PKR',
    name: 'UAE Dirham',
    category: 'Currency',
    currentRate: 75.85,
    previousRate: 75.70,
    unit: 'PKR',
    lastUpdated: 'Just now'
  },
  {
    id: 'sar-pkr',
    symbol: 'SAR / PKR',
    name: 'Saudi Riyal',
    category: 'Currency',
    currentRate: 74.25,
    previousRate: 74.30,
    unit: 'PKR',
    lastUpdated: 'Just now'
  },
  {
    id: 'gold-24k',
    symbol: 'GOLD 24K',
    name: 'Gold (24K Tola)',
    category: 'Commodity',
    currentRate: 245800,
    previousRate: 244500,
    unit: 'PKR / Tola',
    lastUpdated: 'Just now'
  },
  {
    id: 'gold-22k',
    symbol: 'GOLD 22K',
    name: 'Gold (22K Tola)',
    category: 'Commodity',
    currentRate: 225300,
    previousRate: 226100,
    unit: 'PKR / Tola',
    lastUpdated: 'Just now'
  },
  {
    id: 'silver-tola',
    symbol: 'SILVER',
    name: 'Silver Tola',
    category: 'Commodity',
    currentRate: 2890,
    previousRate: 2850,
    unit: 'PKR / Tola',
    lastUpdated: 'Just now'
  },
  {
    id: 'crude-oil',
    symbol: 'BRENT OIL',
    name: 'Brent Crude Oil',
    category: 'Stock & Energy',
    currentRate: 81.40,
    previousRate: 82.10,
    unit: 'USD / Barrel',
    lastUpdated: 'Just now'
  },
  {
    id: 'kse-100',
    symbol: 'KSE-100',
    name: 'Pakistan Stock Index',
    category: 'Stock & Energy',
    currentRate: 78450,
    previousRate: 77920,
    unit: 'Points',
    lastUpdated: 'Just now'
  },
  {
    id: 'petrol-pkr',
    symbol: 'PETROL',
    name: 'Super Petrol',
    category: 'Stock & Energy',
    currentRate: 269.43,
    previousRate: 269.43,
    unit: 'PKR / Liter',
    lastUpdated: 'Just now'
  }
];

export const LiveMarketWatchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  items: externalItems,
  onRefresh
}) => {
  const [marketRates, setMarketRates] = useState<MarketRateItem[]>(INITIAL_MARKET_RATES);
  const [isLiveAutoUpdating, setIsLiveAutoUpdating] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'Currency' | 'Commodity' | 'Stock & Energy'>('ALL');

  // Handle external items override if provided
  useEffect(() => {
    if (externalItems && externalItems.length > 0) {
      setMarketRates(externalItems);
    }
  }, [externalItems]);

  // Periodic Auto-refresh to simulate live market fluctuations and demonstrate trend comparisons
  useEffect(() => {
    if (!isOpen || !isLiveAutoUpdating) return;

    const interval = setInterval(() => {
      refreshMarketRates();
    }, 6000);

    return () => clearInterval(interval);
  }, [isOpen, isLiveAutoUpdating]);

  const refreshMarketRates = () => {
    setMarketRates(prevRates =>
      prevRates.map(item => {
        // Random fluctuation between -1.5% and +1.5%
        const percentChange = (Math.random() * 3 - 1.48) / 100;
        const newRateRaw = item.currentRate * (1 + percentChange);
        const newRate = item.category === 'Currency' || item.id === 'crude-oil'
          ? Math.round(newRateRaw * 100) / 100
          : Math.round(newRateRaw);

        return {
          ...item,
          previousRate: item.currentRate,
          currentRate: newRate,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
      })
    );

    if (onRefresh) onRefresh();
  };

  if (!isOpen) return null;

  const filteredItems = marketRates.filter(
    item => selectedFilter === 'ALL' || item.category === selectedFilter
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <BarChart3 className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-wide flex items-center gap-2">
                Live Market Watch & Rates <Sparkles className="w-4 h-4 text-amber-300" />
              </h3>
              <p className="text-xs text-amber-100 font-semibold">
                Real-time Currency Exchange, Gold/Silver Commodities & Energy Trends
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshMarketRates}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow"
              title="Refresh Live Rates"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Refresh Rates</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Auto-Sync Toggle */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800">
            {(['ALL', 'Currency', 'Commodity', 'Stock & Energy'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-3 py-1.5 rounded-xl font-extrabold transition ${
                  selectedFilter === cat
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-2xl border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-300">Live Feed Ticker:</span>
            <button
              onClick={() => setIsLiveAutoUpdating(!isLiveAutoUpdating)}
              className={`px-2.5 py-0.5 rounded-full font-black text-[10px] transition ${
                isLiveAutoUpdating
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isLiveAutoUpdating ? '● ACTIVE (AUTO 6s)' : 'PAUSED'}
            </button>
          </div>
        </div>

        {/* MARKET ITEMS GRID WITH COMPARISON TREND ARROWS */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-grow custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5">
            {filteredItems.map(item => {
              // Rate Comparison Logic
              const diff = item.currentRate - item.previousRate;
              const percentDiff = item.previousRate ? (diff / item.previousRate) * 100 : 0;
              const isUp = diff > 0;
              const isDown = diff < 0;
              const isStable = diff === 0;

              return (
                <div
                  key={item.id}
                  className={`p-4 bg-slate-950 border rounded-2xl flex items-center justify-between shadow-lg transition-all ${
                    isUp
                      ? 'border-emerald-500/40 hover:border-emerald-500/70 shadow-emerald-950/20'
                      : isDown
                      ? 'border-rose-500/40 hover:border-rose-500/70 shadow-rose-950/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Left: Item Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-amber-400">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Updated {item.lastUpdated}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                      {item.symbol} <span className="text-xs text-slate-400 font-medium">({item.name})</span>
                    </h4>

                    {/* Current Rate Display */}
                    <div className="flex items-baseline gap-2 pt-0.5">
                      <span className="text-xl font-black text-white tracking-tight">
                        {item.currentRate.toLocaleString(undefined, { minimumFractionDigits: item.category === 'Currency' ? 2 : 0 })}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{item.unit}</span>
                    </div>

                    {/* Previous Rate Comparison Note */}
                    <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 pt-0.5">
                      <span>Prev:</span>
                      <span className="text-slate-300 font-bold">
                        {item.previousRate.toLocaleString(undefined, { minimumFractionDigits: item.category === 'Currency' ? 2 : 0 })}
                      </span>
                    </div>
                  </div>

                  {/* Right: Colored Trend Arrow & Rate Change Badge */}
                  <div
                    className={`p-3 rounded-2xl flex flex-col items-end justify-center min-w-[110px] transition-all ${
                      isUp
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                        : isDown
                        ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                        : 'bg-slate-800/60 border border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-sm font-black">
                      {isUp && (
                        <>
                          <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
                          <ArrowUpRight className="w-4 h-4 text-emerald-400 -ml-1 shrink-0" />
                        </>
                      )}
                      {isDown && (
                        <>
                          <TrendingDown className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
                          <ArrowDownRight className="w-4 h-4 text-rose-400 -ml-1 shrink-0" />
                        </>
                      )}
                      {isStable && <Minus className="w-4 h-4 text-slate-400" />}

                      <span className="font-extrabold tracking-wide">
                        {isUp ? '+' : ''}{diff.toFixed(item.category === 'Currency' ? 2 : 0)}
                      </span>
                    </div>

                    <span className="text-[11px] font-black mt-1 tracking-tight flex items-center gap-1">
                      {isUp && <span className="text-emerald-400">▲ UP ({percentDiff.toFixed(2)}%)</span>}
                      {isDown && <span className="text-rose-400">▼ DOWN ({percentDiff.toFixed(2)}%)</span>}
                      {isStable && <span className="text-slate-400">━ STABLE</span>}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-3">
            <Bell className="w-5 h-5 shrink-0 text-amber-400 animate-bounce" />
            <p>
              <strong>Live Rate Comparison Active:</strong> Rates are automatically compared against previous market sessions. Green arrows indicate price gainers, while red arrows highlight rate drops.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
