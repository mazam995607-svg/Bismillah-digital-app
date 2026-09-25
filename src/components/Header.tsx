import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, Home, Clock, Hourglass, BookOpen, 
  FileText, Calculator, Bot, Bell, Settings, Moon, Sun, Globe, 
  Menu, X, Sparkles, Building2, Cloud, Wifi, WifiOff, Download, Smartphone, Laptop, Apple, Monitor, Zap, Youtube, MapPin, Mic, MicOff
} from 'lucide-react';
import { AppDownloader, TargetOS, OS_REGISTRY } from '../utils/AppDownloader';
import { LiveUpdateService, LiveUpdateState } from '../utils/LiveUpdateService';

interface Props {
  shopTitle: string;
  ownerName?: string;
  userEmail?: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onEmergencyLock: () => void;
  onOpenQuickNotes: () => void;
  onOpenAIAssistant: () => void;
  onOpenIslamicAlarm: () => void;
  onOpenSecurityCenter: () => void;
  onOpenSettings: () => void;
  onOpenStatementPDF: () => void;
  onOpenUdhaarKhata: () => void;
  onTogglePendingView: (view: 'history' | 'pending') => void;
  onOpenLanguageModal: () => void;
  onOpenCashRegisters: () => void;
  onOpenCustomAccounts: () => void;
  onOpenCommissionBreakdown: () => void;
  onOpenAppUpdates?: () => void;
  onOpenYouTube?: () => void;
  onOpenLocationTracer?: () => void;
  onOpenNativeInstall?: () => void;
  onToggleVoiceCommands?: () => void;
  isVoiceListening?: boolean;
}

export const Header: React.FC<Props> = ({
  shopTitle,
  ownerName,
  userEmail,
  isDark,
  onToggleTheme,
  onEmergencyLock,
  onOpenQuickNotes,
  onOpenAIAssistant,
  onOpenIslamicAlarm,
  onOpenSecurityCenter,
  onOpenSettings,
  onOpenStatementPDF,
  onOpenUdhaarKhata,
  onTogglePendingView,
  onOpenLanguageModal,
  onOpenCashRegisters,
  onOpenCustomAccounts,
  onOpenCommissionBreakdown,
  onOpenAppUpdates,
  onOpenYouTube,
  onOpenLocationTracer,
  onOpenNativeInstall,
  onToggleVoiceCommands,
  isVoiceListening
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeOS, setActiveOS] = useState<TargetOS>('pc');
  const [updateState, setUpdateState] = useState<LiveUpdateState>(LiveUpdateService.getState());
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    setActiveOS(AppDownloader.getActiveOS());

    const unsubUpdate = LiveUpdateService.subscribe((s) => {
      setUpdateState(s);
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleDownloadEvent = (e: any) => {
      if (e.detail?.os) {
        setActiveOS(e.detail.os);
      }
    };
    window.addEventListener('bismillah-app-downloaded', handleDownloadEvent);

    return () => {
      unsubUpdate();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('bismillah-app-downloaded', handleDownloadEvent);
    };
  }, []);

  const handlePrimaryDownload = () => {
    if (onOpenNativeInstall) {
      onOpenNativeInstall();
    } else {
      AppDownloader.triggerPrimaryDownload();
    }
  };

  const meta = OS_REGISTRY[activeOS] || OS_REGISTRY.pc;

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl px-2 sm:px-4 py-2 sm:py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand Logo & Title (Responsive & Truncated to avoid line wrap) */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-base font-black text-slate-100 tracking-wide uppercase truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs">
                {shopTitle || 'DigiDukaan Retail POS'}
              </span>
              
              {/* Offline / Online Firebase Sync Status Indicator */}
              <span
                className={`text-[9px] sm:text-[10px] font-extrabold flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all shrink-0 ${
                  isOnline
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm animate-pulse'
                }`}
                title={
                  isOnline
                    ? 'Real-time synchronization with Firebase Cloud DB is ACTIVE'
                    : 'Offline Mode Active: Internet connection is currently offline. All transactions are securely stored locally and will automatically synchronize when back online.'
                }
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 shrink-0" />
                    <span className="hidden sm:inline">Sync:</span>
                    <span className="text-emerald-400 font-black">ONLINE</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
                    <span className="text-amber-300 font-black tracking-wide">Offline Mode Active</span>
                  </>
                )}
              </span>
            </div>

            {/* Subtitle: Owner Name & Cloud / Offline Status (No email shown on Header) */}
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-amber-300/90 font-bold mt-0.5 truncate max-w-[170px] xs:max-w-[240px] sm:max-w-none">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOnline ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'}`}></span>
              <span className="truncate text-slate-200 font-semibold">{ownerName || 'Merchant Admin'}</span>
              <span className="text-slate-500 font-normal">&bull;</span>
              {isOnline ? (
                <span className="text-emerald-400 font-extrabold flex items-center gap-0.5 shrink-0" title="100GB Cloud Sync Active">
                  <Cloud className="w-2.5 h-2.5 text-emerald-400" />
                  <span>100GB Cloud</span>
                </span>
              ) : (
                <span className="text-amber-400 font-extrabold flex items-center gap-0.5 shrink-0" title="Sync delayed until network reconnects">
                  <WifiOff className="w-2.5 h-2.5 text-amber-400" />
                  <span>Sync Paused (Offline)</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Menu Options */}
        <div className="hidden xl:flex items-center space-x-4 text-xs font-bold text-slate-300">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-amber-400 transition flex items-center gap-1">
            <Home className="w-4 h-4" /> Home
          </button>
          
          <button onClick={() => onTogglePendingView('history')} className="hover:text-amber-400 transition flex items-center gap-1">
            <Clock className="w-4 h-4 text-emerald-400" /> History
          </button>
          
          <button onClick={() => onTogglePendingView('pending')} className="text-amber-400 hover:text-amber-300 transition flex items-center gap-1">
            <Hourglass className="w-4 h-4 text-amber-400 animate-pulse" /> Pendings
          </button>

          <button onClick={onOpenCommissionBreakdown} className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> Commissions
          </button>

          <button onClick={onOpenCashRegisters} className="text-blue-400 hover:text-blue-300 transition flex items-center gap-1">
            <Building2 className="w-4 h-4" /> Cash Boxes
          </button>

          <button onClick={onOpenCustomAccounts} className="text-purple-400 hover:text-purple-300 transition flex items-center gap-1">
            <BookOpen className="w-4 h-4" /> Personal Cash
          </button>

          <button onClick={onOpenUdhaarKhata} className="text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1">
            <BookOpen className="w-4 h-4" /> Udhaar Khata
          </button>

          <button onClick={onOpenStatementPDF} className="hover:text-amber-400 transition flex items-center gap-1">
            <FileText className="w-4 h-4 text-cyan-400" /> Statement PDF
          </button>
        </div>

        {/* Quick Icon Tools & Single Primary Download Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {/* THE SINGLE PRIMARY DOWNLOAD APP TRIGGER (Visible across screen sizes) */}
          <button
            onClick={handlePrimaryDownload}
            className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg hover:from-amber-400 hover:to-yellow-300 transition active:scale-95 cursor-pointer"
            title={`Download / Install Bismillah POS for ${meta.name}`}
          >
            <Download className="w-4 h-4 text-slate-950 shrink-0" />
            <span className="hidden sm:inline">Install App</span>
            <span className="text-[10px] bg-slate-950 text-amber-400 px-1.5 py-0.2 rounded font-black hidden md:inline">
              {meta.id.toUpperCase()}
            </span>
          </button>

          {/* Desktop Quick Tools */}
          <div className="hidden md:flex items-center gap-2">
            {/* EMERGENCY DURESS LOCK BUTTON */}
            <button
              onClick={onEmergencyLock}
              className="p-2 rounded-2xl bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 transition shadow cursor-pointer"
              title="Emergency Duress Lock (Instant Session Wipe)"
            >
              <ShieldAlert className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenAIAssistant}
              className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-blue-400 transition relative cursor-pointer"
              title="Gemini AI Assistant"
            >
              <Bot className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-400"></span>
            </button>

            {onOpenLocationTracer && (
              <button
                onClick={onOpenLocationTracer}
                className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-teal-400 transition cursor-pointer"
                title="Phone Number & CNIC Location Tracer"
              >
                <MapPin className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={onOpenIslamicAlarm}
              className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
              title="Namaz & Azan Alarm"
            >
              <Bell className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenSecurityCenter}
              className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition cursor-pointer"
              title="Security & Cloud Center"
            >
              <ShieldCheck className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title="App Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={onToggleTheme}
              className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
              title="Toggle Brightness / Theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Burger Toggle (Visible on Mobile & Tablet) */}
          <div className="flex items-center gap-1.5 xl:hidden shrink-0">
            <button
              onClick={onOpenAIAssistant}
              className="p-2 rounded-2xl bg-slate-800 text-blue-400 relative md:hidden"
              title="AI Assistant"
            >
              <Bot className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Menu Dropdown & Action Tools Drawer (Scrollable & Responsive) */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-900/98 border-t border-slate-800/90 p-3 sm:p-4 space-y-3 sm:space-y-4 text-xs font-bold text-slate-200 mt-2 rounded-3xl shadow-2xl animate-fadeIn w-full max-w-full overflow-y-auto max-h-[82vh] custom-scrollbar">
          
          {/* Unified Mobile Download App Trigger */}
          <button
            onClick={() => { handlePrimaryDownload(); setMobileMenuOpen(false); }}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-between shadow-lg active:scale-98 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-slate-950 text-amber-400 rounded-xl">
                <Download className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-black text-slate-950">Download App ({meta.shortLabel})</div>
                <div className="text-[10px] text-slate-900 font-medium">Offline POS for {meta.name}</div>
              </div>
            </div>
            <span className="text-[10px] bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full font-extrabold">
              {meta.badge}
            </span>
          </button>

          {/* Quick Control Tools Section */}
          <div>
            <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-wider mb-2 px-1">
              Quick Action Tools & Controls
            </h4>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
              {onOpenLocationTracer && (
                <button
                  onClick={() => { onOpenLocationTracer(); setMobileMenuOpen(false); }}
                  className="p-2.5 bg-slate-800/90 hover:bg-slate-700/90 rounded-2xl border border-slate-700/80 flex items-center gap-2.5 text-teal-300 transition text-left min-w-0"
                >
                  <div className="p-1.5 rounded-xl bg-teal-500/20 text-teal-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="truncate">Number & CNIC Location Tracer</span>
                </button>
              )}

              <button
                onClick={() => { onOpenIslamicAlarm(); setMobileMenuOpen(false); }}
                className="p-2.5 bg-slate-800/90 hover:bg-slate-700/90 rounded-2xl border border-slate-700/80 flex items-center gap-2.5 text-amber-300 transition text-left min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="truncate">Namaz & Azan Alarm</span>
              </button>

              <button
                onClick={() => { onToggleTheme(); }}
                className="p-2.5 bg-slate-800/90 hover:bg-slate-700/90 rounded-2xl border border-slate-700/80 flex items-center gap-2.5 text-amber-300 transition text-left min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </div>
                <span className="truncate">{isDark ? 'Light Brightness' : 'Dark Brightness'}</span>
              </button>

              <button
                onClick={() => { onOpenAIAssistant(); setMobileMenuOpen(false); }}
                className="p-2.5 bg-slate-800/90 hover:bg-slate-700/90 rounded-2xl border border-slate-700/80 flex items-center gap-2.5 text-blue-300 transition text-left min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="truncate">AI Robot Assistant</span>
              </button>

              <button
                onClick={() => { onOpenQuickNotes(); setMobileMenuOpen(false); }}
                className="p-2.5 bg-slate-800/90 hover:bg-slate-700/90 rounded-2xl border border-slate-700/80 flex items-center gap-2.5 text-indigo-300 transition text-left min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                <span className="truncate">Calc & Quick Notes</span>
              </button>

              <button
                onClick={() => { onOpenSecurityCenter(); setMobileMenuOpen(false); }}
                className="p-2.5 bg-slate-800/90 hover:bg-slate-700/90 rounded-2xl border border-slate-700/80 flex items-center gap-2.5 text-emerald-300 transition text-left min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="truncate">Security & Cloud Sync</span>
              </button>

              <button
                onClick={() => { onOpenSettings(); setMobileMenuOpen(false); }}
                className="p-2.5 bg-slate-800/90 hover:bg-slate-700/90 rounded-2xl border border-slate-700/80 flex items-center gap-2.5 text-slate-200 transition text-left min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-slate-700/50 text-slate-300 shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <span className="truncate">Settings & Language</span>
              </button>

              <button
                onClick={() => { onEmergencyLock(); setMobileMenuOpen(false); }}
                className="xs:col-span-2 p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl border border-rose-500/30 flex items-center gap-2.5 text-rose-400 transition text-left min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <span className="truncate font-black">Emergency Duress Lock</span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 px-1">
              Shop Navigation & Registers
            </h4>
            <div className="space-y-1">
              <button onClick={() => { onTogglePendingView('history'); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 px-3 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-slate-200">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" /> <span className="truncate">History Logs</span>
              </button>
              <button onClick={() => { onTogglePendingView('pending'); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 px-3 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-amber-400">
                <Hourglass className="w-4 h-4 text-amber-400 shrink-0" /> <span className="truncate">Pending Ledger</span>
              </button>
              <button onClick={() => { onOpenCommissionBreakdown(); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 px-3 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-emerald-400">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" /> <span className="truncate">Separated Commissions</span>
              </button>
              <button onClick={() => { onOpenCashRegisters(); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 px-3 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-blue-400">
                <Building2 className="w-4 h-4 text-blue-400 shrink-0" /> <span className="truncate">Dukan Load & Easy Cash Boxes</span>
              </button>
              <button onClick={() => { onOpenCustomAccounts(); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 px-3 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-purple-400">
                <BookOpen className="w-4 h-4 text-purple-400 shrink-0" /> <span className="truncate">Personal Expense Accounts</span>
              </button>
              <button onClick={() => { onOpenUdhaarKhata(); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 px-3 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-indigo-400">
                <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" /> <span className="truncate">Udhaar Khata Ledger</span>
              </button>
              <button onClick={() => { onOpenStatementPDF(); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 px-3 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-cyan-400">
                <FileText className="w-4 h-4 text-cyan-400 shrink-0" /> <span className="truncate">Statement & Receipt PDF</span>
              </button>
            </div>
          </div>

        </div>
      )}
    </nav>
  );
};

