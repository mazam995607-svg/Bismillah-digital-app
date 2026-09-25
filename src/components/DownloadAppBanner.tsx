import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, HelpCircle, Laptop, Apple, CheckCircle2, Bell, Sparkles, Share2, Monitor, ChevronRight, Check } from 'lucide-react';
import { DownloadAppModal } from './DownloadAppModal';
import { AppDownloader, TargetOS, OS_REGISTRY } from '../utils/AppDownloader';

export const DownloadAppBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('download_banner_dismissed') === 'true';
  });
  const [showNotificationToast, setShowNotificationToast] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showDeviceDownloadModal, setShowDeviceDownloadModal] = useState<boolean>(false);
  const [activeOS, setActiveOS] = useState<TargetOS>('pc');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    setIsStandalone(AppDownloader.isStandalone());
    setActiveOS(AppDownloader.getActiveOS());

    // Listen for download completions or modal requests
    const handleGlobalInstallRequest = () => {
      setShowDeviceDownloadModal(true);
    };
    window.addEventListener('trigger-app-install', handleGlobalInstallRequest);

    const handleDownloadEvent = (e: any) => {
      const detail = e.detail;
      if (detail?.os) {
        setActiveOS(detail.os);
        setDownloadNotice(`✓ ${OS_REGISTRY[detail.os as TargetOS]?.name || detail.os} App Installed / Downloaded!`);
        setTimeout(() => setDownloadNotice(null), 5000);
      }
    };
    window.addEventListener('bismillah-app-downloaded', handleDownloadEvent);

    return () => {
      window.removeEventListener('trigger-app-install', handleGlobalInstallRequest);
      window.removeEventListener('bismillah-app-downloaded', handleDownloadEvent);
    };
  }, []);

  const handleDismissBanner = () => {
    setIsDismissed(true);
    localStorage.setItem('download_banner_dismissed', 'true');
  };

  const handlePrimaryDownloadClick = async () => {
    const isPwa = await AppDownloader.triggerPWAInstall();
    if (isPwa) {
      setDownloadNotice('✓ App installed to your device successfully like WhatsApp Desktop!');
      setTimeout(() => setDownloadNotice(null), 6000);
      return;
    }
    const result = await AppDownloader.triggerDownload(activeOS);
    setDownloadNotice(`✓ ${OS_REGISTRY[result.os].name} App package downloaded!`);
    setTimeout(() => setDownloadNotice(null), 6000);
  };

  // If already installed as app, no need to render install prompts
  if (isStandalone) return null;

  const currentMeta = OS_REGISTRY[activeOS] || OS_REGISTRY.pc;

  return (
    <>
      {/* 1. TOP PROMINENT INSTALL BANNER */}
      {!isDismissed && (
        <div className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 px-3.5 sm:px-4 py-3 rounded-2xl sm:rounded-3xl shadow-xl border border-amber-300/50 flex flex-col md:flex-row items-center justify-between gap-3 relative overflow-hidden my-2 animate-fadeIn">
          {/* Background Accent Shimmer */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl sm:rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black shrink-0 shadow-md">
              {activeOS === 'pc' && <Laptop className="w-5 h-5 text-amber-400" />}
              {activeOS === 'android' && <Smartphone className="w-5 h-5 animate-bounce text-emerald-400" />}
              {activeOS === 'ios' && <Apple className="w-5 h-5 text-cyan-400" />}
              {activeOS === 'mac' && <Monitor className="w-5 h-5 text-purple-400" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-extrabold text-xs sm:text-sm tracking-wide uppercase text-slate-950 truncate">
                  Download Bismillah POS App
                </h4>
                <button
                  onClick={() => setShowDeviceDownloadModal(true)}
                  className="bg-slate-950/90 hover:bg-slate-950 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1 transition"
                  title="Click to switch OS (Android / iPhone / PC / Mac)"
                >
                  <span>{currentMeta.badge}</span>
                  <ChevronRight className="w-2.5 h-2.5 opacity-70" />
                </button>
              </div>
              <p className="text-[11px] font-bold text-slate-900/90 leading-tight mt-0.5">
                {currentMeta.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 relative z-10 w-full md:w-auto justify-end">
            <button
              onClick={handlePrimaryDownloadClick}
              className="flex-1 md:flex-initial bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs px-4 py-2 rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 border border-slate-800 active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download {currentMeta.shortLabel}
            </button>
            <button
              onClick={() => setShowDeviceDownloadModal(true)}
              className="p-2 rounded-xl bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 transition font-black text-xs flex items-center gap-1"
              title="Select Device Platform (Android / iOS / PC / Mac)"
            >
              <Laptop className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-xl bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 transition font-black text-xs flex items-center gap-1"
              title="Installation Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={handleDismissBanner}
              className="p-2 rounded-xl bg-black/10 hover:bg-black/20 text-slate-950 transition"
              title="Dismiss Banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Download Success Notification */}
      {downloadNotice && (
        <div className="fixed top-16 right-4 z-[110] bg-emerald-950/95 border-2 border-emerald-400 text-emerald-100 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-slideDown max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-pulse" />
          <div className="min-w-0 text-xs">
            <span className="font-extrabold text-emerald-300 block">{downloadNotice}</span>
            <span className="text-[10px] text-emerald-200/80 block">OS preference captured in AppDownloader storage.</span>
          </div>
          <button onClick={() => setDownloadNotice(null)} className="p-1 hover:bg-emerald-900 rounded-lg text-emerald-300">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. FLOATING BOTTOM NOTIFICATION TOAST (Optional) */}
      {showNotificationToast && (
        <div className="fixed left-4 bottom-20 sm:bottom-6 z-[90] max-w-sm bg-slate-900/95 border-2 border-amber-500/80 rounded-2xl p-3 shadow-2xl backdrop-blur-xl text-slate-100 flex items-center gap-3 animate-slideUp">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-black text-amber-300 block truncate flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Install Bismillah App ({currentMeta.shortLabel})
            </span>
            <span className="text-[10px] text-slate-300 font-semibold block leading-tight">
              Tap to download directly to your device
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrimaryDownloadClick}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] rounded-xl shadow transition flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" /> Install
            </button>
            <button
              onClick={() => setShowNotificationToast(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. STEP-BY-STEP DEVICE INSTALLATION GUIDE MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-amber-300">
                    How to Install Bismillah POS App
                  </h3>
                  <p className="text-[11px] text-slate-400">Easy step-by-step guide for all devices</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1 text-xs">
              
              {/* Android Instructions */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-black text-amber-300 text-xs">
                  <Smartphone className="w-4 h-4 text-emerald-400" /> Android Phone / Tablet (Chrome / Edge / Brave)
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 font-medium text-[11px] leading-relaxed">
                  <li>Tap the <strong>3 Dots Menu (⋮)</strong> at the top-right corner of Chrome.</li>
                  <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>Tap <strong>Install</strong> to add the Bismillah POS icon to your app drawer!</li>
                </ol>
              </div>

              {/* iOS / iPhone Instructions */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-black text-cyan-300 text-xs">
                  <Apple className="w-4 h-4 text-cyan-400" /> iPhone & iPad (Safari Browser)
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 font-medium text-[11px] leading-relaxed">
                  <li>Open this app in <strong>Safari Browser</strong> on your iPhone.</li>
                  <li>Tap the <strong>Share Button (<Share2 className="w-3 h-3 inline text-cyan-300" />)</strong> at the bottom center.</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                  <li>Tap <strong>Add</strong> at top right to complete installation!</li>
                </ol>
              </div>

              {/* Laptop / PC Instructions */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-black text-purple-300 text-xs">
                  <Laptop className="w-4 h-4 text-purple-400" /> Windows / Mac / Laptop (Chrome / Edge)
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 font-medium text-[11px] leading-relaxed">
                  <li>Look at the top URL address bar in Chrome or Microsoft Edge.</li>
                  <li>Click the <strong>Install Icon (<Download className="w-3 h-3 inline text-amber-300" />)</strong> on the right side of the URL bar.</li>
                  <li>Click <strong>Install</strong> to run Bismillah POS as a desktop app!</li>
                </ol>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Once installed, the app works 100% offline without internet and launches directly from your home screen!</span>
              </div>

            </div>

            <div className="pt-3 border-t border-slate-800 mt-3 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                Got It, Close Guide
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. UNIVERSAL MULTI-PLATFORM DOWNLOAD MODAL */}
      <DownloadAppModal
        isOpen={showDeviceDownloadModal}
        onClose={() => setShowDeviceDownloadModal(false)}
      />
    </>
  );
};

