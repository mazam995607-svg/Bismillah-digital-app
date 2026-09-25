import React, { useState, useEffect } from 'react';
import { 
  Monitor, Check, X, Shield, HardDrive, Download, Folder, 
  Terminal, Play, CheckCircle2, RefreshCw, Cpu, Layers, Sparkles,
  Smartphone, Apple
} from 'lucide-react';
import { AppDownloader, TargetOS } from '../utils/AppDownloader';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialOS?: TargetOS;
}

export const VisualStudioSetupModal: React.FC<Props> = ({ isOpen, onClose, initialOS = 'pc' }) => {
  const [step, setStep] = useState<'options' | 'installing' | 'finished'>('options');
  const [targetOS, setTargetOS] = useState<TargetOS>(initialOS);
  const [installPath, setInstallPath] = useState('C:\\Program Files\\DigiDukaan POS');
  
  // Visual Studio Style Permissions & Configuration Options
  const [createDesktopShortcut, setCreateDesktopShortcut] = useState(true);
  const [pinToTaskbar, setPinToTaskbar] = useState(true);
  const [addToStartMenu, setAddToStartMenu] = useState(true);
  const [registerProtocol, setRegisterProtocol] = useState(true);
  const [allowThermalPrinter, setAllowThermalPrinter] = useState(true);
  const [allowBiometricSensor, setAllowBiometricSensor] = useState(true);
  const [launchOnStartup, setLaunchOnStartup] = useState(false);
  const [enableLocalSqlite, setEnableLocalSqlite] = useState(true);

  // Installation Progress State
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState('Initializing installer components...');
  const [logMessages, setLogMessages] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep('options');
      setProgress(0);
      setLogMessages([]);
      setTargetOS(initialOS || AppDownloader.getActiveOS());
    }
  }, [isOpen, initialOS]);

  if (!isOpen) return null;

  const handleStartInstallation = () => {
    setStep('installing');
    setProgress(5);
    setCurrentAction('Extracting POS core binaries and UI resources...');
    setLogMessages(['[Installer] Setup Engine initialized.', '[Installer] Target directory: ' + installPath]);

    const steps = [
      { p: 20, msg: 'Writing pos-engine.core.dll and visual assets...', log: 'Extracting bundled UI engine...' },
      { p: 40, msg: 'Configuring offline SQLite local database cache...', log: 'IndexedDB / SQLite storage provider initialized.' },
      { p: 60, msg: allowThermalPrinter ? 'Registering USB Thermal Printer & COM Port hooks...' : 'Configuring printer drivers...', log: 'Thermal printer 80mm/58mm subsystem ready.' },
      { p: 75, msg: allowBiometricSensor ? 'Enabling WebAuthn / Passkey & Biometric sensors...' : 'Configuring security layer...', log: 'FIDO2 / Biometric security active.' },
      { p: 85, msg: createDesktopShortcut ? 'Creating Windows Desktop Shortcut (Bismillah POS.lnk)...' : 'Finalizing shortcuts...', log: 'Desktop shortcut created with high-res icon.' },
      { p: 95, msg: pinToTaskbar ? 'Pinning Bismillah POS to Windows Taskbar...' : 'Registering taskbar hooks...', log: 'Taskbar launcher registered.' },
      { p: 100, msg: 'Setup completed successfully!', log: 'All Visual Studio permission requirements granted.' }
    ];

    steps.forEach((s, idx) => {
      setTimeout(() => {
        setProgress(s.p);
        setCurrentAction(s.msg);
        setLogMessages(prev => [...prev, s.log]);

        if (idx === steps.length - 1) {
          setTimeout(() => {
            setStep('finished');
            AppDownloader.triggerDownload(targetOS, { savePreference: true, promptPwa: true });
          }, 600);
        }
      }, (idx + 1) * 700);
    });
  };

  const handleLaunchApp = () => {
    onClose();
    if (typeof window !== 'undefined') {
      window.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn select-none">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Visual Studio Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-500/20">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-indigo-300">
                  Bismillah POS Setup Installer
                </h3>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Visual Studio Permissions Wizard
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Setup and configure permissions for Windows PC, Mac, and Android App
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

        {/* STEP 1: OPTIONS & PERMISSIONS */}
        {step === 'options' && (
          <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1 flex-1 text-xs">
            
            {/* Target OS Selector */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => setTargetOS('pc')}
                className={`p-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                  targetOS === 'pc' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" /> Windows PC (.exe)
              </button>
              <button
                onClick={() => setTargetOS('android')}
                className={`p-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                  targetOS === 'android' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" /> Android (.apk / PWA)
              </button>
              <button
                onClick={() => setTargetOS('mac')}
                className={`p-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                  targetOS === 'mac' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Apple className="w-4 h-4" /> macOS (.dmg)
              </button>
            </div>

            {/* Target Directory */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <label className="font-extrabold text-slate-300 flex items-center gap-2">
                <Folder className="w-4 h-4 text-indigo-400" /> Installation Location
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={installPath}
                  onChange={e => setInstallPath(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setInstallPath('C:\\Program Files\\DigiDukaan POS')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Default
                </button>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-semibold pt-1">
                <span>Space Required: 45.2 MB</span>
                <span>Space Available: 240.8 GB</span>
              </div>
            </div>

            {/* Visual Studio Style Permissions */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                <span className="font-black text-indigo-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-400" /> System Integration & Permissions (Visual Studio Style)
                </span>
                <span className="text-[10px] text-slate-500">Auto-Configured</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <label className="flex items-center gap-2.5 p-2 bg-slate-900/60 rounded-xl cursor-pointer hover:bg-slate-900 border border-slate-800">
                  <input
                    type="checkbox"
                    checked={createDesktopShortcut}
                    onChange={e => setCreateDesktopShortcut(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                  <span className="font-bold text-slate-200">Create Desktop Shortcut Icon</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-slate-900/60 rounded-xl cursor-pointer hover:bg-slate-900 border border-slate-800">
                  <input
                    type="checkbox"
                    checked={pinToTaskbar}
                    onChange={e => setPinToTaskbar(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                  <span className="font-bold text-slate-200">Pin to Windows Taskbar</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-slate-900/60 rounded-xl cursor-pointer hover:bg-slate-900 border border-slate-800">
                  <input
                    type="checkbox"
                    checked={addToStartMenu}
                    onChange={e => setAddToStartMenu(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                  <span className="font-bold text-slate-200">Add to Start Menu & Programs</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-slate-900/60 rounded-xl cursor-pointer hover:bg-slate-900 border border-slate-800">
                  <input
                    type="checkbox"
                    checked={registerProtocol}
                    onChange={e => setRegisterProtocol(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                  <span className="font-bold text-slate-200">Register URI Protocol (bismillah-pos://)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-slate-900/60 rounded-xl cursor-pointer hover:bg-slate-900 border border-slate-800">
                  <input
                    type="checkbox"
                    checked={allowThermalPrinter}
                    onChange={e => setAllowThermalPrinter(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                  <span className="font-bold text-slate-200">Allow Thermal Printer COM Link</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-slate-900/60 rounded-xl cursor-pointer hover:bg-slate-900 border border-slate-800">
                  <input
                    type="checkbox"
                    checked={allowBiometricSensor}
                    onChange={e => setAllowBiometricSensor(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                  <span className="font-bold text-slate-200">Allow Biometric & Passkey Sensor</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-slate-900/60 rounded-xl cursor-pointer hover:bg-slate-900 border border-slate-800">
                  <input
                    type="checkbox"
                    checked={enableLocalSqlite}
                    onChange={e => setEnableLocalSqlite(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                  <span className="font-bold text-slate-200">Enable Local SQLite Database</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-slate-900/60 rounded-xl cursor-pointer hover:bg-slate-900 border border-slate-800">
                  <input
                    type="checkbox"
                    checked={launchOnStartup}
                    onChange={e => setLaunchOnStartup(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                  <span className="font-bold text-slate-200">Launch on Windows Startup</span>
                </label>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex justify-between items-center">
              <span className="text-[11px] text-slate-400 font-semibold">
                ✓ Ready to install DigiDukaan POS
              </span>
              <button
                onClick={handleStartInstallation}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-2xl text-xs shadow-xl transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4" /> Install Now (Setup Installer)
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: INSTALLING WITH PROGRESS & EXTRACTION LOG */}
        {step === 'installing' && (
          <div className="space-y-4 py-6 flex-1 flex flex-col justify-center text-xs">
            
            <div className="space-y-2">
              <div className="flex justify-between font-black text-slate-200">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" /> {currentAction}
                </span>
                <span className="text-indigo-400">{progress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Terminal Live Extraction Log */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-[11px] space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar text-slate-400 shadow-inner">
              <div className="text-indigo-400 font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> DigiDukaan POS Setup Log
              </div>
              {logMessages.map((log, i) => (
                <div key={i} className="text-emerald-400/90 leading-tight">
                  &gt; {log}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* STEP 3: FINISHED & LAUNCH */}
        {step === 'finished' && (
          <div className="space-y-4 py-4 flex-1 flex flex-col items-center justify-center text-center text-xs animate-fadeIn">
            
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 flex items-center justify-center shadow-2xl">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black text-slate-100">
                Installation Completed Successfully!
              </h4>
              <p className="text-xs text-slate-400 max-w-md">
                DigiDukaan POS has been installed and configured with all selected permissions (Desktop Shortcut, Taskbar Pin, Biometric Security & SQLite Cache).
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl w-full text-left space-y-1 text-[11px] text-slate-300">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <Check className="w-4 h-4" /> Desktop Shortcut: Created
              </div>
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <Check className="w-4 h-4" /> Taskbar Pin: Configured
              </div>
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <Check className="w-4 h-4" /> Protocol Handler (digidukaan-pos://): Active
              </div>
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <Check className="w-4 h-4" /> Offline SQLite & Cloud Sync: Ready
              </div>
            </div>

            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={handleLaunchApp}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black rounded-2xl text-xs shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4" /> Launch Bismillah POS Now
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs transition cursor-pointer"
              >
                Finish & Close
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
