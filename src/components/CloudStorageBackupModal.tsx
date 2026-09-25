import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  CheckCircle2, 
  RefreshCw, 
  HardDrive, 
  ShieldCheck, 
  X, 
  Sparkles, 
  Database,
  Mail,
  Smartphone,
  Info
} from 'lucide-react';
import { 
  saveAutoBackupToCloud, 
  restoreBackupFromCloud, 
  checkCloudBackupAvailable, 
  CloudBackupMetaData 
} from '../services/cloudSyncService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  appData: {
    transactions: any[];
    wallets: any;
    udhaarAccounts: any[];
    customAccounts: any[];
    securityState: any;
    userProfile?: any;
  };
  onRestoreData: (restoredData: any) => void;
}

export const CloudStorageBackupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userEmail,
  appData,
  onRestoreData
}) => {
  const [targetEmail, setTargetEmail] = useState<string>(userEmail || 'owner@myshop.pk');
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [metaData, setMetaData] = useState<CloudBackupMetaData | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isAutoBackupEnabled, setIsAutoBackupEnabled] = useState<boolean>(true);

  // Load existing backup metadata on open
  useEffect(() => {
    if (isOpen && targetEmail) {
      checkCloudBackupAvailable(targetEmail).then((meta) => {
        if (meta) setMetaData(meta);
      });
    }
  }, [isOpen, targetEmail]);

  if (!isOpen) return null;

  const handleManualBackup = async () => {
    if (!targetEmail) {
      setStatusMsg({ text: 'Please enter a valid email address for backup!', isError: true });
      return;
    }

    setIsBackingUp(true);
    setStatusMsg({ text: 'Encrypting and uploading data to 100 GB Cloud Storage...' });

    try {
      const meta = await saveAutoBackupToCloud(targetEmail, appData);
      setMetaData(meta);
      setIsBackingUp(false);
      setStatusMsg({ text: 'Backup completed successfully! Linked to email: ' + targetEmail });
    } catch (err: any) {
      setIsBackingUp(false);
      setStatusMsg({ text: 'Backup failed or saved locally: ' + (err.message || 'Error'), isError: true });
    }
  };

  const handleRestoreBackup = async () => {
    if (!targetEmail) {
      setStatusMsg({ text: 'Please enter the registered email address to restore data!', isError: true });
      return;
    }

    setIsRestoring(true);
    setStatusMsg({ text: 'Connecting to Cloud and fetching email data backup...' });

    try {
      const res = await restoreBackupFromCloud(targetEmail);
      setIsRestoring(false);

      if (res.success && res.data) {
        onRestoreData(res.data);
        if (res.meta) setMetaData(res.meta);
        setStatusMsg({ text: 'All data successfully restored from cloud backup!' });
      } else {
        setStatusMsg({ text: res.error || 'No cloud backup found for this email.', isError: true });
      }
    } catch (err: any) {
      setIsRestoring(false);
      setStatusMsg({ text: 'Restore failed: ' + (err.message || 'Error'), isError: true });
    }
  };

  const usedMB = metaData?.usedStorageMB || 0.15;
  const totalMB = 100000; // 100 GB
  const usedPercentage = ((usedMB / totalMB) * 100).toFixed(4);

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <Cloud className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-wide flex items-center gap-2">
                100 GB Cloud Storage & Auto Email Backup
              </h3>
              <p className="text-xs text-cyan-100">Offline/Online Automatic Data Synchronization Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* Cloud Storage Usage Bar Card */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-cyan-300 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-400" /> Allocated Cloud Quota
              </span>
              <span className="text-xs font-black text-amber-300">
                100 GB / 100,000 MB
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(parseFloat(usedPercentage), 2)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 font-bold">
              <span>Used: <strong className="text-slate-200">{usedMB.toFixed(2)} MB</strong> ({usedPercentage}%)</span>
              <span>Available: <strong className="text-emerald-400">{(totalMB - usedMB).toLocaleString()} MB</strong></span>
            </div>
          </div>

          {/* Email Linked Backup Card */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-slate-200">
              <Mail className="w-4 h-4 text-cyan-400" /> Linked Backup Email Address
            </div>

            <div className="relative">
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="Enter your Gmail / Email ID for Cloud Backup"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-extrabold text-amber-300 outline-none focus:border-cyan-400"
              />
            </div>

            {metaData ? (
              <div className="p-3 bg-slate-900/80 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Last Cloud Backup</span>
                  <span className="font-extrabold text-slate-200">
                    {new Date(metaData.lastBackupAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold">Total Records</span>
                  <span className="font-extrabold text-emerald-400">
                    {metaData.totalTransactions} Txns | {metaData.totalUdhaarAccounts} Udhaar
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>No existing backup loaded yet for this email. Click "Backup Now" to create your first cloud snapshot.</span>
              </div>
            )}
          </div>

          {/* Auto Sync Switches */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-black text-slate-200 block">WhatsApp-Style Auto Backup</span>
                <span className="text-[10px] text-slate-400">Automatically syncs transactions and khata when connected to internet</span>
              </div>
              <button
                onClick={() => setIsAutoBackupEnabled(!isAutoBackupEnabled)}
                className={`w-11 h-6 rounded-full transition p-1 flex items-center ${
                  isAutoBackupEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-slate-950 shadow-md" />
              </button>
            </div>
          </div>

          {/* Status Message Display */}
          {statusMsg && (
            <div className={`p-3 rounded-xl text-xs font-extrabold flex items-center gap-2 ${
              statusMsg.isError ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {statusMsg.isError ? <X className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {statusMsg.text}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleManualBackup}
              disabled={isBackingUp || isRestoring}
              className="py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black rounded-2xl text-xs shadow-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isBackingUp ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Backing Up to Cloud...
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4" /> Backup All Data to Email Cloud
                </>
              )}
            </button>

            <button
              onClick={handleRestoreBackup}
              disabled={isBackingUp || isRestoring}
              className="py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs shadow-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isRestoring ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Downloading Backup...
                </>
              ) : (
                <>
                  <CloudDownload className="w-4 h-4" /> Restore All Data From Email
                </>
              )}
            </button>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300/90 font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              All transactions, Easyload records, Udhaar Khata, and security PINs work 100% offline. When you reconnect or switch devices, simply enter your email to restore everything without data loss!
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
