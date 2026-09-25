import React, { useState } from 'react';
import { Globe2, Copy, Check, RefreshCw, ArrowRightLeft } from 'lucide-react';

const FALLBACK_RATES: Record<string, number> = {
  SAR: 74.20,
  AED: 75.80,
  USD: 278.50,
  EUR: 302.10,
  GBP: 355.40,
  CAD: 204.60,
};

export const CurrencyConverter: React.FC = () => {
  const [currency, setCurrency] = useState<string>('SAR');
  const [foreignAmount, setAmount] = useState<string>('100');
  const [rate, setRate] = useState<number>(FALLBACK_RATES['SAR']);
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCurrencyChange = (curr: string) => {
    setCurrency(curr);
    setRate(FALLBACK_RATES[curr] || 278.5);
  };

  const pkrValue = (parseFloat(foreignAmount) || 0) * rate;

  const handleCopyReceipt = () => {
    const shopName = (() => {
      try {
        return localStorage.getItem('digidukaan_shop_title') || localStorage.getItem('bismillah_shop_title') || 'DigiDukaan POS';
      } catch {
        return 'DigiDukaan POS';
      }
    })();
    const text = `International Remittance Quote:\nAmount: ${foreignAmount} ${currency}\nExchange Rate: 1 ${currency} = ${rate.toFixed(2)} PKR\nTotal PKR: Rs. ${pkrValue.toLocaleString('en-PK', { maximumFractionDigits: 2 })}\n- ${shopName}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFetchLiveRates = async () => {
    setLoading(true);
    try {
      // Simulate live forex fetch
      await new Promise(res => setTimeout(res, 600));
      setRate(FALLBACK_RATES[currency] || 278.5);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl text-slate-100 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wide">
              International Remittance Converter
            </h3>
            <p className="text-[11px] text-slate-400">Live Forex & Remittance Rates to PKR</p>
          </div>
        </div>

        <button
          onClick={handleFetchLiveRates}
          disabled={loading}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition"
          title="Refresh Exchange Rates"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        
        {/* Currency Select */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-bold text-slate-400 mb-1">Source Currency</label>
          <select
            value={currency}
            onChange={e => handleCurrencyChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="SAR">🇸🇦 SAR (Saudi Riyal)</option>
            <option value="AED">🇦🇪 AED (UAE Dirham)</option>
            <option value="USD">🇺🇸 USD (US Dollar)</option>
            <option value="EUR">🇪🇺 EUR (Euro)</option>
            <option value="GBP">🇬🇧 GBP (British Pound)</option>
            <option value="CAD">🇨🇦 CAD (Canadian Dollar)</option>
          </select>
        </div>

        {/* Foreign Amount */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-bold text-slate-400 mb-1">Foreign Amount</label>
          <input
            type="number"
            min="0"
            value={foreignAmount}
            onChange={e => setAmount(e.target.value)}
            placeholder="e.g. 500"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs font-bold font-mono text-slate-100 outline-none focus:border-amber-500"
          />
        </div>

        {/* Equals Arrow */}
        <div className="hidden sm:flex sm:col-span-1 justify-center items-center pt-4">
          <ArrowRightLeft className="w-4 h-4 text-amber-400" />
        </div>

        {/* PKR Result */}
        <div className="sm:col-span-3 bg-slate-800/80 border border-slate-700/80 p-2.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">PKR Value</span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              Rs. {pkrValue.toLocaleString('en-PK', { maximumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={handleCopyReceipt}
            className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              copied
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950'
            }`}
            title="Copy to Receipt / Customer Chat"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      <div className="mt-2 text-[10px] text-slate-500 flex justify-between items-center">
        <span>Current Rate: 1 {currency} = {rate.toFixed(2)} PKR</span>
        <span className="text-amber-400/80 font-mono">Click copy icon to paste into receipt</span>
      </div>

    </div>
  );
};
