import React, { useState, useEffect } from 'react';
import { 
  X, Download, Smartphone, Laptop, Apple, Monitor, 
  CheckCircle2, Sparkles, ArrowRight, Share2, MoreVertical, PlusSquare, ShieldCheck, Zap,
  Settings2
} from 'lucide-react';
import { AppDownloader, TargetOS, OS_REGISTRY } from '../utils/AppDownloader';
import { VisualStudioSetupModal } from './VisualStudioSetupModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  shopTitle?: string;
}

export const NativeInstallationModal: React.FC<Props> = ({ isOpen, onClose, shopTitle }) => {
  const [selectedOS, setSelectedOS] = useState<TargetOS>(() => AppDownloader.getActiveOS());
  const [installSuccessMsg, setInstallSuccessMsg] = useState<string>('');
  const [showVsSetup, setShowVsSetup] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedOS(AppDownloader.getActiveOS());
      setInstallSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDirectInstall = () => {
    if (selectedOS === 'pc') {
      setShowVsSetup(true);
      return;
    }
    AppDownloader.triggerPrimaryDownload(selectedOS);
    setInstallSuccessMsg('Installation sequence initiated! Check your phone prompt or notification bar.');
  };

  const meta = OS_REGISTRY[selectedOS] || OS_REGISTRY.android;

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-amber-400">
                  Install Native App on Device
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                  PWA Standalone App
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Install {shopTitle || 'DigiDukaan POS'} as a standalone mobile & desktop application
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1 flex-1 text-xs">
          
          {/* OS Selector Tabs */}
          <div className="grid grid-cols-4 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {[
              { id: 'android', name: 'Android', icon: Smartphone },
              { id: 'ios', name: 'iPhone / iPad', icon: Apple },
              { id: 'pc', name: 'Windows PC', icon: Monitor },
              { id: 'mac', name: 'macOS', icon: Laptop }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedOS === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedOS(tab.id as TargetOS)}
                  className={`p-2 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* 1-Tap Quick Install Trigger Card */}
          <div className="p-4 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border-2 border-amber-500/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 1-Click Direct Installation ({meta.name})
              </span>
              <h4 className="font-extrabold text-sm text-slate-100">
                Launch Standalone Native App Installation
              </h4>
              <p className="text-[11px] text-slate-300">
                Adds high-speed icon on your home screen with zero browser bars and offline support.
              </p>
            </div>
            <button
              onClick={handleDirectInstall}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl text-xs shadow-xl transition active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-950" /> Install {meta.shortLabel}
            </button>
          </div>

          {installSuccessMsg && (
            <div className="p-3 bg-emerald-950 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{installSuccessMsg}</span>
            </div>
          )}

          {/* Visual Step-by-Step Installation Guide based on Selected OS */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-black text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              📱 Visual Steps to Install on {meta.name}:
            </h4>

            {selectedOS === 'android' && (
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-100 block">Open in Chrome or Edge Browser</span>
                    <span className="text-[11px] text-slate-400">
                      Top right corner me 3 dots (<MoreVertical className="w-3 h-3 inline text-amber-400" /> Menu) par tap karein.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-100 block">Select "Install app" or "Add to Home screen"</span>
                    <span className="text-[11px] text-slate-400">
                      Menu me se <strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> option par click karein.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-100 block">Tap "Install" / "Add" to Confirm</span>
                    <span className="text-[11px] text-slate-400">
                      App aapke phone ke desktop/apps drawer me native app ki tarah download aur install ho jayegi.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedOS === 'ios' && (
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-100 block">Open in Safari Browser</span>
                    <span className="text-[11px] text-slate-400">
                      iPhone / iPad ke Safari browser me niche diye gaye <strong>Share Button</strong> (<Share2 className="w-3 h-3 inline text-cyan-400" />) par tap karein.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-100 block">Tap "Add to Home Screen"</span>
                    <span className="text-[11px] text-slate-400">
                      Share sheet ko scroll kar ke <strong>"Add to Home Screen" (<PlusSquare className="w-3 h-3 inline text-amber-400" />)</strong> par click karein.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-100 block">Tap "Add" in Top Right</span>
                    <span className="text-[11px] text-slate-400">
                      Aapke iPhone home screen par Bismillah POS icon create ho jayega jo full-screen mode me chalega.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {(selectedOS === 'pc' || selectedOS === 'mac') && (
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-100 block">Look at the Browser URL Address Bar</span>
                    <span className="text-[11px] text-slate-400">
                      Chrome ya Edge address bar ke right side me <strong>Install Icon (⊕ or ⬇)</strong> show ho raha hoga.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-100 block">Click "Install" to create Desktop Shortcut</span>
                    <span className="text-[11px] text-slate-400">
                      Direct desktop shortcut aur taskbar pin option provide ho jayega.
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Benefits List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-extrabold block text-xs">⚡ Fast Zero-Lag</span>
              <span className="text-[10px] text-slate-400">Instant opening without browser loading</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-teal-400 font-extrabold block text-xs">🛡️ Full Hardware Lock</span>
              <span className="text-[10px] text-slate-400">Native fingerprint & Passkey security</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-amber-400 font-extrabold block text-xs">📶 100% Offline Mode</span>
              <span className="text-[10px] text-slate-400">Works smoothly without internet</span>
            </div>
          </div>

          {/* SmartScreen / "Don't run" Resolver Banner */}
          <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Windows SmartScreen "Don't run" ya Mac Gatekeeper Solution:</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Agar Windows PC par setup open karne par <strong>"Don't run"</strong> ka button aaye:
              <br />
              👉 <strong>"More info"</strong> par click karein aur <strong>"Run anyway"</strong> daba dein, ya upar diye gaye <strong>"1-Click Direct Installation"</strong> button se direct install karein.
            </p>
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-slate-800">
            <button
              onClick={() => setShowVsSetup(true)}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" /> Launch Visual Studio Setup Wizard
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
            >
              Close
            </button>
          </div>

        </div>
      </div>

      <VisualStudioSetupModal
        isOpen={showVsSetup}
        onClose={() => setShowVsSetup(false)}
        initialOS={selectedOS}
      />
    </div>
  );
};
