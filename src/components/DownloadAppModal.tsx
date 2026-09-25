import React, { useState, useEffect } from 'react';
import { 
  Laptop, Smartphone, Apple, Monitor, Download, CheckCircle2, 
  X, Sparkles, ShieldCheck, ArrowDownToLine, Zap, FileCode, Check,
  Play, Settings2
} from 'lucide-react';
import { AppDownloader, TargetOS, OS_REGISTRY } from '../utils/AppDownloader';
import { VisualStudioSetupModal } from './VisualStudioSetupModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedDevice, setSelectedDevice] = useState<TargetOS>('pc');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [showVsSetup, setShowVsSetup] = useState(false);

  useEffect(() => {
    setSelectedDevice(AppDownloader.getActiveOS());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDeviceDownload = async (device: TargetOS) => {
    setSelectedDevice(device);
    if (device === 'pc') {
      setShowVsSetup(true);
      return;
    }
    const result = await AppDownloader.triggerDownload(device, { savePreference: true, promptPwa: true });
    const meta = OS_REGISTRY[device];
    setDownloadSuccess(`✓ ${meta.name} Package (${result.fileName}) Downloaded & Preference Saved!`);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              <Download className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-amber-300">
                Download Bismillah POS App
              </h3>
              <p className="text-xs text-slate-400">
                Choose your device — PC, Android, iPhone, or Mac to capture preference & download
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

        {/* Content Body */}
        <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1 flex-1">
          
          <p className="text-xs font-bold text-slate-300">
            Aap kis device par Bismillah POS app download karna chahte hain? Click any platform to download directly:
          </p>

          {/* 4 PLATFORM TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* 1. WINDOWS PC */}
            <div
              onClick={() => handleDeviceDownload('pc')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                selectedDevice === 'pc'
                  ? 'bg-amber-500/20 border-amber-400 shadow-xl'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                <Laptop className="w-7 h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-slate-100">Windows PC / Laptop</h4>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full">
                    PC 1920x1080
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Desktop widescreen layout, keyboard shortcuts & thermal printer ready.
                </p>
                <button
                  type="button"
                  className="mt-3 w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" /> Download PC App
                </button>
              </div>
            </div>

            {/* 2. ANDROID MOBILE */}
            <div
              onClick={() => handleDeviceDownload('android')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                selectedDevice === 'android'
                  ? 'bg-amber-500/20 border-amber-400 shadow-xl'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                <Smartphone className="w-7 h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-slate-100">Android Mobile / Tablet</h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                    APK / PWA 412x915
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Touchscreen mobile layout, offline local storage & biometric sensor lock.
                </p>
                <button
                  type="button"
                  className="mt-3 w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" /> Download Android App
                </button>
              </div>
            </div>

            {/* 3. APPLE IPHONE / IOS */}
            <div
              onClick={() => handleDeviceDownload('ios')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                selectedDevice === 'ios'
                  ? 'bg-amber-500/20 border-amber-400 shadow-xl'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                <Apple className="w-7 h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-slate-100">Apple iPhone & iPad</h4>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-full">
                    iOS 390x844
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Optimized for Safari WebClip & iOS fullscreen home screen icon.
                </p>
                <button
                  type="button"
                  className="mt-3 w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" /> Download iPhone App
                </button>
              </div>
            </div>

            {/* 4. APPLE MAC / MACOS */}
            <div
              onClick={() => handleDeviceDownload('mac')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                selectedDevice === 'mac'
                  ? 'bg-amber-500/20 border-amber-400 shadow-xl'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Monitor className="w-7 h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-slate-100">Apple Mac / macOS</h4>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                    Mac 1440x900
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Full Retina resolution standalone runner for MacBook Air, Pro and iMac.
                </p>
                <button
                  type="button"
                  className="mt-3 w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" /> Download Mac App
                </button>
              </div>
            </div>

          </div>

          {/* Success Banner */}
          {downloadSuccess && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* 1-Click Direct Native Installation Banner (No SmartScreen / Zero Errors) */}
          <div className="p-4 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-2 border-amber-500/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Recommended Direct 1-Click Install
              </span>
              <h4 className="font-extrabold text-sm text-slate-100">
                Install as Solid Native App (Zero "Don't Run" Warnings)
              </h4>
              <p className="text-[11px] text-slate-300">
                Directly installs into Windows Apps, Android Drawer, or Mac Dock just like EasyPaisa / Play Store.
              </p>
            </div>
            <button
              onClick={async () => {
                const isPwa = await AppDownloader.triggerPWAInstall();
                if (!isPwa) {
                  // If browser doesn't have prompt ready, fallback to OS package download + VS setup
                  handleDeviceDownload(selectedDevice);
                } else {
                  setDownloadSuccess('✓ App successfully installed to your device!');
                }
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl text-xs shadow-xl transition active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-950" /> 1-Click Direct Install
            </button>
          </div>

          {/* SmartScreen / Don't Run Resolver Alert Guide */}
          <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-amber-400">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Windows Defender "Don't run" ya Mac Warning Fix Guide</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Agar Windows PC par setup run karne par <strong>"Windows protected your PC / Don't run"</strong> ka message aaye:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-300 block">Tarika 1: Windows SmartScreen</span>
                1. <u>More info</u> par click karein<br />
                2. <u>Run anyway</u> par click karein
              </div>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                <span className="font-bold text-emerald-300 block">Tarika 2: 1-Click Browser App</span>
                Browser address bar me <strong>Install Icon (⊕ / ⬇)</strong> par click karein jo baghair warning ke app install kar deta hai.
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 mt-3 flex justify-between items-center">
          <button
            onClick={() => setShowVsSetup(true)}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" /> Visual Studio Setup Permissions Wizard
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>

      <VisualStudioSetupModal
        isOpen={showVsSetup}
        onClose={() => setShowVsSetup(false)}
        initialOS={selectedDevice}
      />
    </div>
  );
};
