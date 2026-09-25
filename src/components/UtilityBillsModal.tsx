import React, { useState } from 'react';
import { X, Zap, Flame, Droplet, Search, Calculator, CheckCircle, Copy } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const UtilityBillsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'portals' | 'calculator'>('portals');
  const [customBillQuery, setCustomBillQuery] = useState('');

  // Estimator State
  const [utilityType, setUtilityType] = useState<'Electricity' | 'Gas' | 'Internet'>('Electricity');
  const [units, setUnits] = useState('250');
  const [ratePerUnit, setRatePerUnit] = useState('35');
  const [fixedCharges, setFixedCharges] = useState('400');
  const [taxPercent, setTaxPercent] = useState('18');

  if (!isOpen) return null;

  const handleCustomSearch = () => {
    if (!customBillQuery.trim()) {
      alert('Please enter a bill query e.g. LESCO, MEPCO, PTCL');
      return;
    }
    window.open(`https://www.google.com/search?q=${encodeURIComponent(customBillQuery + ' duplicate bill online check')}`, '_blank');
  };

  // Calculations
  const parsedUnits = parseFloat(units) || 0;
  const parsedRate = parseFloat(ratePerUnit) || 0;
  const parsedFixed = parseFloat(fixedCharges) || 0;
  const parsedTax = parseFloat(taxPercent) || 0;

  const baseCost = parsedUnits * parsedRate;
  const subtotal = baseCost + parsedFixed;
  const taxAmount = (subtotal * parsedTax) / 100;
  const estimatedTotal = Math.round(subtotal + taxAmount);

  const handleCopyEstimate = () => {
    const text = `--- ${utilityType} Bill Estimation ---
Units / Consumption: ${parsedUnits}
Rate per Unit: Rs. ${parsedRate}
Base Cost: Rs. ${baseCost.toLocaleString()}
Fixed Charges / Surcharges: Rs. ${parsedFixed.toLocaleString()}
Tax (${parsedTax}%): Rs. ${taxAmount.toLocaleString()}
ESTIMATED TOTAL BILL: Rs. ${estimatedTotal.toLocaleString()}`;

    navigator.clipboard.writeText(text);
    alert('Bill estimation copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col space-y-4 max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100">Utility Bills & Estimator</h3>
              <p className="text-[10px] text-slate-400">Portals & Local Tax Calculator</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl text-xs font-bold border border-slate-800">
          <button
            onClick={() => setActiveTab('portals')}
            className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'portals' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GlobeIcon className="w-4 h-4" /> Online Portals
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'calculator' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" /> Bill Estimator
          </button>
        </div>

        {/* TAB 1: ONLINE PORTALS */}
        {activeTab === 'portals' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => window.open('https://staging.ke.com.pk:24555/', '_blank')}
                className="p-4 bg-slate-800 hover:bg-slate-700/80 rounded-2xl border border-slate-700 text-center transition flex flex-col items-center gap-2"
              >
                <Zap className="w-8 h-8 text-amber-400" />
                <span className="font-bold text-xs">K-Electric</span>
              </button>

              <button
                onClick={() => window.open('https://www.ssgc.com.pk/web/', '_blank')}
                className="p-4 bg-slate-800 hover:bg-slate-700/80 rounded-2xl border border-slate-700 text-center transition flex flex-col items-center gap-2"
              >
                <Flame className="w-8 h-8 text-rose-500" />
                <span className="font-bold text-xs">SSGC Gas</span>
              </button>

              <button
                onClick={() => window.open('https://www.kwsc.gos.pk/', '_blank')}
                className="col-span-2 p-4 bg-slate-800 hover:bg-slate-700/80 rounded-2xl border border-slate-700 text-center transition flex flex-col items-center gap-2"
              >
                <Droplet className="w-8 h-8 text-cyan-400" />
                <span className="font-bold text-xs">KWSC Water Board</span>
              </button>
            </div>

            {/* Custom Search */}
            <div className="pt-3 border-t border-slate-800">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Custom Duplicate Bill Finder (LESCO, MEPCO, PTCL)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. LESCO, MEPCO, PTCL, Wi-Fi"
                  value={customBillQuery}
                  onChange={e => setCustomBillQuery(e.target.value)}
                  className="flex-grow bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleCustomSearch}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 rounded-xl font-extrabold text-xs shadow flex items-center gap-1"
                >
                  <Search className="w-4 h-4" /> Search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UTILITY BILL ESTIMATOR */}
        {activeTab === 'calculator' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            
            {/* Service Type Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Electricity', icon: Zap, color: 'text-amber-400' },
                { id: 'Gas', icon: Flame, color: 'text-rose-400' },
                { id: 'Internet', icon: Droplet, color: 'text-cyan-400' }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setUtilityType(item.id as any);
                      if (item.id === 'Electricity') {
                        setRatePerUnit('35'); setFixedCharges('400'); setTaxPercent('18');
                      } else if (item.id === 'Gas') {
                        setRatePerUnit('45'); setFixedCharges('200'); setTaxPercent('18');
                      } else {
                        setUnits('1'); setRatePerUnit('3500'); setFixedCharges('0'); setTaxPercent('19.5');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      utilityType === item.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span>{item.id}</span>
                  </button>
                );
              })}
            </div>

            {/* Inputs Form */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {utilityType === 'Internet' ? 'Package Count' : 'Units Consumed'}
                </label>
                <input
                  type="number"
                  value={units}
                  onChange={e => setUnits(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 font-mono text-xs font-bold text-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Base Rate (Rs./Unit)
                </label>
                <input
                  type="number"
                  value={ratePerUnit}
                  onChange={e => setRatePerUnit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 font-mono text-xs font-bold text-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Fixed Surcharge / Meter Rent (Rs.)
                </label>
                <input
                  type="number"
                  value={fixedCharges}
                  onChange={e => setFixedCharges(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 font-mono text-xs font-bold text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Tax / GST (%)
                </label>
                <input
                  type="number"
                  value={taxPercent}
                  onChange={e => setTaxPercent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 font-mono text-xs font-bold text-slate-100 outline-none"
                />
              </div>
            </div>

            {/* Estimated Output Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/40 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Base Consumption Cost:</span>
                <span className="font-mono text-slate-200">Rs. {baseCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Fixed Surcharges & Rent:</span>
                <span className="font-mono text-slate-200">Rs. {parsedFixed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Calculated Tax ({parsedTax}%):</span>
                <span className="font-mono text-amber-400">Rs. {taxAmount.toLocaleString()}</span>
              </div>

              <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
                <span className="font-extrabold text-amber-400 uppercase text-xs">Estimated Total Bill</span>
                <span className="font-mono font-black text-emerald-400 text-lg">
                  Rs. {estimatedTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleCopyEstimate}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl shadow transition flex items-center justify-center gap-2 text-xs"
            >
              <Copy className="w-4 h-4" /> Copy Bill Estimation Summary
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}
