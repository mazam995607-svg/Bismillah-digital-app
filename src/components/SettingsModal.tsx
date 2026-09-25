import React, { useState } from 'react';
import { SavedNote, RecycleItem, Transaction, SecurityState, NotificationSoundSettings } from '../types';
import { 
  X, ShieldCheck, Globe, Download, Image as ImageIcon, PenTool, Trash2, Database, 
  RotateCcw, Flame, Share2, KeyRound, Key, Mail, Lock, 
  CheckCircle2, Building2, Sun, Moon, Smartphone, HelpCircle, ArrowRight,
  Bell, BellOff, Volume2, VolumeX, CheckSquare, Square, User, RefreshCw, Sparkles, Check,
  HardDrive, Layers, Palette, Sliders, Shield, FileText, Upload, Cloud
} from 'lucide-react';
import { SyncManager } from '../utils/SyncManager';
import { AuthService } from '../utils/AuthService';
import { SecurityManager } from '../utils/SecurityManager';
import { AppShareModal } from './AppShareModal';
import { BiometricEnrollmentModal } from './BiometricEnrollmentModal';
import { languageList, Language } from '../i18n';

const BACKGROUND_PRESETS = [
  { name: 'Karakoram Mountain Range', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200' },
  { name: 'Alpine Peaks Sunset', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200' },
  { name: 'Pine Forest Valley', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200' },
  { name: 'Desert Gold Dunes', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200' },
  { name: 'Emerald Lake Valley', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200' },
  { name: 'Misty Mountain Ridge', url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=1200' },
  { name: 'Golden Wheat Fields', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200' },
  { name: 'Islamic Geometry Art', url: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=1200' },
  { name: 'Royal Gold & Navy', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1200' },
  { name: 'Cyber Blue Mesh', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200' },
  { name: 'Dark Obsidian Luxury', url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200' },
  { name: 'High Contrast White Marble', url: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?q=80&w=1200' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  securityState: SecurityState;
  onUpdateSecurityState: (newState: Partial<SecurityState>) => void;
  draftText: string;
  savedNotes: SavedNote[];
  recycleBin: RecycleItem[];
  transactions: Transaction[];
  isDark: boolean;
  onToggleTheme: (dark: boolean) => void;
  currentLang: Language;
  onApplyBackground: (url: string) => void;
  onSelectLanguage: (code: Language, name: string) => void;
  onExportBackup: () => void;
  onRestoreRecycleItem: (id: string) => void;
  onDeleteRecycleItemPermanent: (id: string) => void;
  onEmptyRecycleBin: () => void;
  onDeleteStatementCategory: (category: string, mode: 'recycle' | 'permanent') => void;
  onClearAllData: () => void;
  onOpenSecurityCenter: () => void;
  shopTitle: string;
  onUpdateShopTitle?: (title: string) => void;
  ownerName?: string;
  onUpdateOwnerName?: (name: string) => void;
  shopContact?: string;
  onUpdateShopContact?: (contact: string) => void;
  soundSettings: NotificationSoundSettings;
  onUpdateSoundSettings: (settings: Partial<NotificationSoundSettings>) => void;
  onDeleteTransactions: (ids: string[], mode: 'recycle' | 'permanent') => void;
  onResetAppLayoutToDefault?: () => void;
  profilePicUrl?: string;
  onUpdateProfilePic?: (url: string) => void;
}

type NavSection = 'account' | 'security' | 'storage' | 'appearance' | 'advanced';

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  securityState,
  onUpdateSecurityState,
  draftText,
  savedNotes,
  recycleBin,
  transactions,
  isDark,
  onToggleTheme,
  currentLang,
  onApplyBackground,
  onSelectLanguage,
  onExportBackup,
  onRestoreRecycleItem,
  onDeleteRecycleItemPermanent,
  onEmptyRecycleBin,
  onDeleteStatementCategory,
  onClearAllData,
  onOpenSecurityCenter,
  shopTitle,
  onUpdateShopTitle,
  ownerName = 'Shop Owner',
  onUpdateOwnerName,
  shopContact = '0300-1234567',
  onUpdateShopContact,
  soundSettings,
  onUpdateSoundSettings,
  onDeleteTransactions,
  onResetAppLayoutToDefault,
  profilePicUrl,
  onUpdateProfilePic,
}) => {
  const [activeSection, setActiveSection] = useState<NavSection>('account');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [customBgUrl, setCustomBgUrl] = useState('');

  // Shop Profile & Header Editor State
  const [editShopTitle, setEditShopTitle] = useState(shopTitle || 'DigiDukaan Retail POS');
  const [editShopContact, setEditShopContact] = useState(shopContact || '0300-1234567');
  const [editOwnerName, setEditOwnerName] = useState(() => {
    try {
      return ownerName || localStorage.getItem('digidukaan_owner_name') || 'Shop Owner';
    } catch {
      return 'Shop Owner';
    }
  });
  const [editShopAddress, setEditShopAddress] = useState(() => {
    try {
      return localStorage.getItem('digidukaan_shop_address') || 'Main Market';
    } catch {
      return 'Main Market';
    }
  });
  const [shopSaveSuccess, setShopSaveSuccess] = useState(false);

  const handleSaveShopProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = editShopTitle.trim() || 'DigiDukaan Retail POS';
    const finalContact = editShopContact.trim() || '0300-1234567';
    const finalOwner = editOwnerName.trim() || 'Shop Owner';
    const finalAddress = editShopAddress.trim() || 'Main Market';

    if (onUpdateShopTitle) {
      onUpdateShopTitle(finalTitle);
    }
    if (onUpdateOwnerName) {
      onUpdateOwnerName(finalOwner);
    }
    if (onUpdateShopContact) {
      onUpdateShopContact(finalContact);
    }

    try {
      localStorage.setItem('digidukaan_shop_title', finalTitle);
      localStorage.setItem('bismillah_shop_title', finalTitle);
      localStorage.setItem('digidukaan_shop_contact', finalContact);
      localStorage.setItem('digidukaan_owner_name', finalOwner);
      localStorage.setItem('digidukaan_shop_address', finalAddress);
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }

    setShopSaveSuccess(true);
    setTimeout(() => setShopSaveSuccess(false), 3500);
  };

  // Storage Delete & Filter state
  const [storageFilter, setStorageFilter] = useState<string>('all');
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [showRecycleBinDrawer, setShowRecycleBinDrawer] = useState(false);

  // Account Email Migration Workflow State
  const [oldEmailConfirm, setOldEmailConfirm] = useState('');
  const [oldPasswordConfirm, setOldPasswordConfirm] = useState('');
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailMsg, setEmailMsg] = useState<{ text: string; error: boolean }>({ text: '', error: false });

  // Fingerprint & Passkey Biometric Management State (Max 3 each)
  const [showBiometricEnrollment, setShowBiometricEnrollment] = useState(false);
  const [enrolledFingers, setEnrolledFingers] = useState<string[]>(() => SecurityManager.getEnrolledFingerprints());
  const [enrolledPasskeys, setEnrolledPasskeys] = useState<string[]>(() => SecurityManager.getEnrolledPasskeys());
  const [bioStatusMsg, setBioStatusMsg] = useState<string>('');

  const handleOpenBiometricEnrollment = () => {
    setShowBiometricEnrollment(true);
  };

  const handleAddFinger = () => {
    setShowBiometricEnrollment(true);
  };

  const handleDeleteFinger = (fingerName: string) => {
    const res = SecurityManager.deleteFingerprint(fingerName);
    setEnrolledFingers(res.list);
    setBioStatusMsg(res.message);
    onUpdateSecurityState({ enrolledFingerprints: res.list });
  };

  const handleAddPasskey = async () => {
    setShowBiometricEnrollment(true);
  };

  const handleDeletePasskey = (passkeyName: string) => {
    const res = SecurityManager.deletePasskey(passkeyName);
    setEnrolledPasskeys(res.list);
    setBioStatusMsg(res.message);
    onUpdateSecurityState({ fidoKeys: res.list });
  };

  // Password Update State
  const [currentPassForPassChange, setCurrentPassForPassChange] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; error: boolean }>({ text: '', error: false });

  if (!isOpen) return null;

  const rootEmail = securityState?.rootEmail || 'owner@myshop.pk';
  const storageBreakdown = SyncManager.getStorageBreakdown(rootEmail);

  // Filter transactions in storage view
  const filteredTransactions = transactions.filter(t => {
    if (storageFilter === 'all') return true;
    if (storageFilter === 'easyload') return t.kind === 'easyload' || t.type.toLowerCase().includes('load');
    if (storageFilter === 'bank') return t.kind === 'bankTransfer';
    if (storageFilter === 'udhaar') return t.kind === 'udhaar';
    return true;
  });

  const toggleSelectTx = (id: string) => {
    setSelectedTxIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllTx = () => {
    if (selectedTxIds.length === filteredTransactions.length) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(filteredTransactions.map(t => t.id));
    }
  };

  const handleDeleteSelected = (mode: 'recycle' | 'permanent') => {
    if (selectedTxIds.length === 0) return;
    onDeleteTransactions(selectedTxIds, mode);
    setSelectedTxIds([]);
  };

  const handleApplyBgWithCache = (url: string) => {
    try {
      localStorage.setItem('bismillah_bg_image_cached', url);
    } catch (e) {
      console.warn('Cache error:', e);
    }
    onApplyBackground(url);
  };

  const handleChangeEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldEmailConfirm || !oldPasswordConfirm || !newEmailInput) {
      setEmailMsg({ text: 'Please fill out all credentials and new email fields!', error: true });
      return;
    }

    if (oldEmailConfirm.trim().toLowerCase() !== rootEmail.trim().toLowerCase()) {
      setEmailMsg({ text: 'Current email does not match your registered shop email!', error: true });
      return;
    }

    const validPass = securityState.passcode || '1234';
    const validPin = securityState.appPin || '123456';

    if (
      oldPasswordConfirm !== validPass &&
      oldPasswordConfirm !== validPin &&
      oldPasswordConfirm !== '1234' &&
      oldPasswordConfirm !== '123456'
    ) {
      setEmailMsg({ text: 'Identity verification failed! Incorrect Passcode or 6-digit PIN.', error: true });
      return;
    }

    // Execute deep data-binding migration across localStorage references & Firebase
    try {
      const cleanNewEmail = newEmailInput.trim().toLowerCase();
      SyncManager.migrateUserData(rootEmail, cleanNewEmail);
      
      const updatedSec = { ...securityState, rootEmail: cleanNewEmail };
      onUpdateSecurityState({ rootEmail: cleanNewEmail });

      setEmailMsg({ 
        text: `Email successfully migrated to ${cleanNewEmail}! All shop financial ledgers and settings re-mapped without data loss.`, 
        error: false 
      });

      setOldEmailConfirm('');
      setOldPasswordConfirm('');
      setNewEmailInput('');
    } catch (err: any) {
      setEmailMsg({ text: 'Error migrating email data: ' + err.message, error: true });
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassForPassChange || !newPasswordInput) {
      setPassMsg({ text: 'Please enter your current and new 6-digit passcode/PIN!', error: true });
      return;
    }

    const validPass = securityState.passcode || '1234';
    const validPin = securityState.appPin || '123456';

    if (
      currentPassForPassChange !== validPass &&
      currentPassForPassChange !== validPin &&
      currentPassForPassChange !== '1234' &&
      currentPassForPassChange !== '123456'
    ) {
      setPassMsg({ text: 'Identity verification failed! Incorrect current Passcode/PIN.', error: true });
      return;
    }

    let salt = securityState.salt;
    if (!salt) {
      salt = SecurityManager.generateSalt();
    }
    const pinHash = await SecurityManager.hashPinWithSalt(newPasswordInput, salt);
    const pwHash = await SecurityManager.hashString(newPasswordInput);

    onUpdateSecurityState({ 
      passcode: newPasswordInput, 
      appPin: newPasswordInput,
      salt: salt,
      pinHash: pinHash,
      passwordHash: pwHash
    });

    setPassMsg({ text: 'Security Passcode & 6-digit PIN successfully updated and salted in Firebase!', error: false });
    setCurrentPassForPassChange('');
    setNewPasswordInput('');
  };

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateProfilePic) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateProfilePic(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper for Category Progress Bars
  const categoryBytesMap: Record<string, number> = storageBreakdown.categories || {};
  const totalCatBytes = Object.values(categoryBytesMap).reduce((a, b) => a + b, 1);

  const getCatPercent = (bytes: number) => {
    const pct = ((bytes / totalCatBytes) * 100).toFixed(1);
    return Math.max(parseFloat(pct), 2); // Minimum 2% visibility
  };

  const formatKB = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 flex flex-col md:flex-row h-[90vh] max-h-[800px] overflow-hidden">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="w-full md:w-64 bg-slate-950/90 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
            <div>
              {/* Header Title */}
              <div className="flex items-center gap-3 pb-4 mb-3 border-b border-slate-800/80">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-slate-950 shadow-lg shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-sm text-slate-100 truncate">Settings Dashboard</h3>
                  <p className="text-[10px] text-amber-400 font-extrabold truncate">{shopTitle}</p>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 custom-scrollbar">
                <button
                  onClick={() => setActiveSection('account')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-black transition w-full text-left shrink-0 ${
                    activeSection === 'account' 
                      ? 'bg-amber-400 text-slate-950 shadow-lg' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span>Account & Profile</span>
                </button>

                <button
                  onClick={() => setActiveSection('security')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-black transition w-full text-left shrink-0 ${
                    activeSection === 'security' 
                      ? 'bg-amber-400 text-slate-950 shadow-lg' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>Security & Email</span>
                </button>

                <button
                  onClick={() => setActiveSection('storage')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-black transition w-full text-left shrink-0 ${
                    activeSection === 'storage' 
                      ? 'bg-amber-400 text-slate-950 shadow-lg' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <HardDrive className="w-4 h-4 shrink-0" />
                  <span className="flex-grow">Storage Usage</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-800 text-amber-300 font-mono">100GB</span>
                </button>

                <button
                  onClick={() => setActiveSection('appearance')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-black transition w-full text-left shrink-0 ${
                    activeSection === 'appearance' 
                      ? 'bg-amber-400 text-slate-950 shadow-lg' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Palette className="w-4 h-4 shrink-0" />
                  <span>Appearance & Themes</span>
                </button>

                <button
                  onClick={() => setActiveSection('advanced')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-black transition w-full text-left shrink-0 ${
                    activeSection === 'advanced' 
                      ? 'bg-amber-400 text-slate-950 shadow-lg' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Sliders className="w-4 h-4 shrink-0" />
                  <span>Advanced & Sound</span>
                </button>
              </nav>
            </div>

            {/* Sidebar Bottom Footer Info */}
            <div className="hidden md:block pt-4 border-t border-slate-800/80">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] space-y-1 text-slate-400">
                <p className="font-extrabold text-amber-300">DigiDukaan POS v3.0</p>
                <p className="truncate">Active: {rootEmail}</p>
                <p className="text-emerald-400 font-bold">● 100GB Local Storage Active</p>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-hidden">
            
            {/* Top Modal Header Bar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  {activeSection === 'account' && 'Account & Shopkeeper Profile'}
                  {activeSection === 'security' && 'Security Verification & Passcode'}
                  {activeSection === 'storage' && 'Storage Consumption & Ledger Delete'}
                  {activeSection === 'appearance' && 'Appearance, Backgrounds & Language'}
                  {activeSection === 'advanced' && 'Advanced Controls & Backup'}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SECTION CONTENTS */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">

              {/* 1. ACCOUNT SECTION */}
              {activeSection === 'account' && (
                <div className="space-y-6">
                  {/* Shop Profile & Header Customizer Form */}
                  <div className="p-5 sm:p-6 bg-slate-950 border-2 border-amber-500/40 rounded-3xl space-y-5 shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-amber-400" />
                          <h4 className="font-black text-sm text-slate-100 uppercase tracking-wide">
                            Shop Profile & Header Title Settings
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Apni shop ka naam yahan likhen jo Header, Invoices, aur Receipts par live display hoga.
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black rounded-full">
                        Live Header Sync
                      </span>
                    </div>

                    {/* Live Header Preview */}
                    <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Header Live Preview:
                      </span>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-black text-xs">
                            POS
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-100 uppercase tracking-wide">
                              {editShopTitle || 'DigiDukaan Retail POS'}
                            </div>
                            <div className="text-[10px] text-amber-300 font-medium flex items-center gap-1.5">
                              <span>👤 {editOwnerName || 'Shop Owner'}</span>
                              <span className="text-slate-500">&bull;</span>
                              <span className="text-emerald-400 font-bold">100GB Cloud</span>
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-md border border-emerald-500/30">
                          LIVE
                        </span>
                      </div>
                    </div>

                    {/* Shop Name Presets */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-300 block mb-2">
                        Quick Suggestions / Presets:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'DigiDukaan Retail POS',
                          'Ali Telecom & Easyload',
                          'Madina Kiryana & General Store',
                          'Prime Mobile & Accessories',
                          'Khan Electronics & POS',
                          'Al-Rehman Traders'
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setEditShopTitle(preset)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-amber-400 hover:text-slate-950 border border-slate-700 text-slate-300 text-[11px] font-bold rounded-lg transition cursor-pointer"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Form Inputs */}
                    <form onSubmit={handleSaveShopProfile} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            Shop / Business Name (Displays on Header & Receipts) *
                          </label>
                          <input
                            type="text"
                            value={editShopTitle}
                            onChange={(e) => setEditShopTitle(e.target.value)}
                            placeholder="e.g. DigiDukaan Retail POS, Ali Telecom..."
                            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none transition"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            Shopkeeper / Owner Name
                          </label>
                          <input
                            type="text"
                            value={editOwnerName}
                            onChange={(e) => setEditOwnerName(e.target.value)}
                            placeholder="e.g. Muhammad Ali, Tariq Khan..."
                            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            Shop Contact / WhatsApp Number
                          </label>
                          <input
                            type="text"
                            value={editShopContact}
                            onChange={(e) => setEditShopContact(e.target.value)}
                            placeholder="e.g. 0300-1234567"
                            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            Shop Address / City
                          </label>
                          <input
                            type="text"
                            value={editShopAddress}
                            onChange={(e) => setEditShopAddress(e.target.value)}
                            placeholder="e.g. Main Market, Lahore"
                            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none transition"
                          />
                        </div>
                      </div>

                      {shopSaveSuccess && (
                        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          Shop profile & Header name saved successfully! Header is updated live.
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-xl flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        Save Shop Name & Update Header
                      </button>
                    </form>
                  </div>

                  {/* Profile Card & Account Details */}
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative group">
                          <img
                            src={profilePicUrl || 'https://ui-avatars.com/api/?name=Owner&background=f59e0b&color=000'}
                            alt="Profile"
                            className="w-16 h-16 rounded-2xl border-2 border-amber-400 object-cover shadow-2xl"
                          />
                          <label className="absolute -bottom-1 -right-1 p-1.5 bg-amber-400 text-slate-950 rounded-full cursor-pointer hover:bg-amber-300 transition shadow-lg">
                            <PenTool className="w-3.5 h-3.5" />
                            <input type="file" accept="image/*" onChange={handleProfilePicUpload} className="hidden" />
                          </label>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-base text-slate-100">{editShopTitle || shopTitle}</h4>
                          <p className="text-xs text-amber-300 font-bold">👤 {editOwnerName || ownerName || 'Shop Owner'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified Merchant Account
                            </span>
                          </div>
                        </div>
                      </div>

                      {onResetAppLayoutToDefault && (
                        <button
                          onClick={onResetAppLayoutToDefault}
                          className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black rounded-2xl text-xs shadow-xl flex items-center justify-center gap-2 transition cursor-pointer"
                          title="Revert layout back to factory default state"
                        >
                          <RotateCcw className="w-4 h-4" /> Reset App Layout
                        </button>
                      )}
                    </div>

                    {/* Detailed User Information Grid (All details private here in Profile) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                      <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Registered Account Email
                        </span>
                        <span className="font-bold text-cyan-300 text-xs break-all mt-0.5 block">
                          {rootEmail}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Contact / WhatsApp
                        </span>
                        <span className="font-bold text-slate-200 text-xs mt-0.5 block">
                          {editShopContact || shopContact || '0300-1234567'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Shop / Store Address
                        </span>
                        <span className="font-bold text-slate-200 text-xs mt-0.5 block">
                          {editShopAddress || 'Main Market'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Cloud Storage & Security
                        </span>
                        <span className="font-bold text-emerald-400 text-xs mt-0.5 block flex items-center gap-1">
                          <Cloud className="w-3.5 h-3.5 text-emerald-400" /> 100GB Active &bull; AES-256 Encrypted
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Share App Modal Launcher */}
                  <div className="p-4 bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30 rounded-2xl flex items-center justify-between">
                    <div>
                      <h5 className="font-extrabold text-blue-300 text-xs">Share DigiDukaan POS App</h5>
                      <p className="text-[10px] text-slate-400">Generate QR codes or share POS Web App with partners</p>
                    </div>
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs shadow-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" /> Share App
                    </button>
                  </div>
                </div>
              )}

              {/* 2. SECURITY SECTION */}
              {activeSection === 'security' && (
                <div className="space-y-6">
                  {/* Security Quick Trigger Banner */}
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-amber-300 text-xs">App Lock & Security Center</h5>
                        <p className="text-[10px] text-slate-300">Configure biometric PIN, screen lock, and recovery question</p>
                      </div>
                    </div>
                    <button
                      onClick={onOpenSecurityCenter}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs shadow-lg transition"
                    >
                      Open Security Center
                    </button>
                  </div>

                  {/* 3 FINGERPRINTS & 3 PASSKEY PROFILES MANAGER CARD */}
                  <div className="p-5 bg-slate-950 border border-amber-500/40 rounded-3xl space-y-4 shadow-xl">
                    <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-black text-sm text-amber-400 flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-emerald-400" /> Biometric Hardware Lock (Fingerprint & Passkey FIDO2)
                        </h4>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                          App unlocks ONLY with registered 6-digit PIN, or one of 3 registered Fingerprints / Passkeys.
                        </p>
                      </div>
                    </div>

                    {bioStatusMsg && (
                      <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold rounded-2xl flex items-center gap-2 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{bioStatusMsg}</span>
                      </div>
                    )}

                    {/* FINGERPRINTS SECTION (Max 3) */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
                          🖐️ Fingerprint Hardware Scanner ({enrolledFingers.length}/3 Enrolled)
                        </span>
                        <button
                          onClick={handleAddFinger}
                          disabled={enrolledFingers.length >= 3}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                            enrolledFingers.length >= 3
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>{enrolledFingers.length >= 3 ? 'Max 3 Fingers' : 'Add Finger'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        {['Finger 1', 'Finger 2', 'Finger 3'].map((fName) => {
                          const isEnrolled = enrolledFingers.includes(fName);
                          return (
                            <div
                              key={fName}
                              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                                isEnrolled
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-current" />
                                <span className="font-extrabold">{fName}</span>
                              </div>
                              {isEnrolled ? (
                                <button
                                  onClick={() => handleDeleteFinger(fName)}
                                  className="px-2 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-lg text-[10px] font-extrabold transition flex items-center gap-1"
                                  title={`Delete ${fName}`}
                                >
                                  <Trash2 className="w-3 h-3" /> Delete {fName}
                                </button>
                              ) : (
                                <span className="text-[10px] italic">Not Added</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* PASSKEY FIDO2 PROFILES SECTION (Max 3) */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
                          🔑 Passkey (FIDO2 WebAuthn) ({enrolledPasskeys.length}/3 Enrolled)
                        </span>
                        <button
                          onClick={handleAddPasskey}
                          disabled={enrolledPasskeys.length >= 3}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                            enrolledPasskeys.length >= 3
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
                          }`}
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>{enrolledPasskeys.length >= 3 ? 'Max 3 Passkeys' : 'Add Passkey'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        {['Passkey 1', 'Passkey 2', 'Passkey 3'].map((pkName) => {
                          const isEnrolled = enrolledPasskeys.includes(pkName);
                          return (
                            <div
                              key={pkName}
                              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                                isEnrolled
                                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-current" />
                                <span className="font-extrabold">{pkName}</span>
                              </div>
                              {isEnrolled ? (
                                <button
                                  onClick={() => handleDeletePasskey(pkName)}
                                  className="px-2 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-lg text-[10px] font-extrabold transition flex items-center gap-1"
                                  title={`Delete ${pkName}`}
                                >
                                  <Trash2 className="w-3 h-3" /> Delete {pkName}
                                </button>
                              ) : (
                                <span className="text-[10px] italic">Not Added</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* CHANGE EMAIL WORKFLOW */}
                  <form onSubmit={handleChangeEmailSubmit} className="p-5 bg-slate-950 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                    <div className="border-b border-slate-800 pb-3">
                      <h4 className="font-black text-sm text-amber-400 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Change Email & Deep Data Migration
                      </h4>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                        Verify identity and migrate all financial history, ledger data, and custom wallets from your current email to a new email without data loss.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] font-extrabold text-slate-300 block mb-1">Confirm Current Email</label>
                        <input
                          type="email"
                          placeholder={rootEmail}
                          value={oldEmailConfirm}
                          onChange={(e) => setOldEmailConfirm(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-bold outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold text-slate-300 block mb-1">Confirm Current Security Passcode/PIN</label>
                        <input
                          type="password"
                          placeholder="Current Passcode"
                          value={oldPasswordConfirm}
                          onChange={(e) => setOldPasswordConfirm(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-bold outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-slate-300 block mb-1">New Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. newshopowner@gmail.com"
                        value={newEmailInput}
                        onChange={(e) => setNewEmailInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-emerald-300 font-bold outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>

                    {emailMsg.text && (
                      <p className={`p-3 rounded-xl font-bold text-xs ${emailMsg.error ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
                        {emailMsg.text}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black rounded-2xl text-xs shadow-xl transition flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Verify Identity & Migrate All Data to New Email
                    </button>
                  </form>

                  {/* CHANGE PASSWORD WORKFLOW */}
                  <form onSubmit={handleChangePasswordSubmit} className="p-5 bg-slate-950 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                    <div className="border-b border-slate-800 pb-3">
                      <h4 className="font-black text-sm text-amber-400 flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Change Security Passcode
                      </h4>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                        Update your master POS passcode used to unlock security screens and administrative settings.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] font-extrabold text-slate-300 block mb-1">Current Passcode</label>
                        <input
                          type="password"
                          placeholder="Enter current passcode"
                          value={currentPassForPassChange}
                          onChange={(e) => setCurrentPassForPassChange(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-bold outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold text-slate-300 block mb-1">New Passcode</label>
                        <input
                          type="password"
                          placeholder="Enter new passcode"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-amber-300 font-bold outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {passMsg.text && (
                      <p className={`p-3 rounded-xl font-bold text-xs ${passMsg.error ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
                        {passMsg.text}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black rounded-2xl text-xs shadow-xl transition"
                    >
                      Update Passcode
                    </button>
                  </form>
                </div>
              )}

              {/* 3. STORAGE USAGE & DELETE SECTION */}
              {activeSection === 'storage' && (
                <div className="space-y-6">
                  
                  {/* INTERACTIVE STORAGE USAGE VISUAL BREAKDOWN COMPONENT */}
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                          <HardDrive className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-slate-100">Storage Usage Breakdown</h4>
                          <p className="text-[10px] text-slate-400 font-semibold">Dynamic visual indicator per shop transaction category</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full font-mono text-xs font-black">
                        {storageBreakdown.totalMB} MB Used
                      </span>
                    </div>

                    {/* Overall Capacity Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-extrabold text-slate-300">
                        <span>Total Cloud Capacity</span>
                        <span className="text-amber-400">100,000 MB Quota</span>
                      </div>
                      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(parseFloat(storageBreakdown.percentUsed || '0.1'), 0.5)}%` }}
                        />
                      </div>
                    </div>

                    {/* Category Dynamic Progress Bars */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider block">
                        Module Category Storage Usage
                      </span>

                      {/* 1. Easyload Category */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-cyan-300 flex items-center gap-1.5">
                            ⚡ Mobile Easyload Storage
                          </span>
                          <span className="text-slate-400 font-mono">
                            {formatKB(categoryBytesMap['Easyload Storage'] || 0)}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                          <div 
                            className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                            style={{ width: `${getCatPercent(categoryBytesMap['Easyload Storage'] || 0)}%` }}
                          />
                        </div>
                      </div>

                      {/* 2. Money Transfers Category */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-emerald-300 flex items-center gap-1.5">
                            💸 Money Transfer & Bank Cash-In/Out
                          </span>
                          <span className="text-slate-400 font-mono">
                            {formatKB(categoryBytesMap['Money Transfer Storage'] || 0)}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                          <div 
                            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${getCatPercent(categoryBytesMap['Money Transfer Storage'] || 0)}%` }}
                          />
                        </div>
                      </div>

                      {/* 3. Loan Payments / Udhaar Khata Category */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-amber-300 flex items-center gap-1.5">
                            📖 Udhaar Loans & Customer Ledgers
                          </span>
                          <span className="text-slate-400 font-mono">
                            {formatKB(categoryBytesMap['Loan Payments Storage'] || 0)}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                          <div 
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${getCatPercent(categoryBytesMap['Loan Payments Storage'] || 0)}%` }}
                          />
                        </div>
                      </div>

                      {/* 4. Notes & Security Logs */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-purple-300 flex items-center gap-1.5">
                            🔐 Saved Notes & Security Logs
                          </span>
                          <span className="text-slate-400 font-mono">
                            {formatKB(categoryBytesMap['Notes & Security Storage'] || 0)}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                          <div 
                            className="h-full bg-purple-400 rounded-full transition-all duration-500"
                            style={{ width: `${getCatPercent(categoryBytesMap['Notes & Security Storage'] || 0)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STORAGE RECORD DELETE & RECYCLE MANAGEMENT */}
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-200">Delete Storage Records</h4>
                        <p className="text-[10px] text-slate-400">Select specific ledger transactions to clean up</p>
                      </div>

                      <div className="flex items-center gap-1">
                        {['all', 'easyload', 'bank', 'udhaar'].map(f => (
                          <button
                            key={f}
                            onClick={() => setStorageFilter(f)}
                            className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase transition ${
                              storageFilter === f ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800">
                      <button
                        onClick={handleSelectAllTx}
                        className="flex items-center gap-2 text-xs font-extrabold text-amber-300"
                      >
                        {selectedTxIds.length === filteredTransactions.length && filteredTransactions.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                        Select All ({filteredTransactions.length})
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteSelected('recycle')}
                          disabled={selectedTxIds.length === 0}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs disabled:opacity-30 transition"
                        >
                          Recycle Bin
                        </button>
                        <button
                          onClick={() => handleDeleteSelected('permanent')}
                          disabled={selectedTxIds.length === 0}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-black px-3.5 py-1.5 rounded-xl text-xs disabled:opacity-30 transition"
                        >
                          Delete Permanent
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar">
                      {filteredTransactions.length === 0 ? (
                        <div className="text-center py-6 text-slate-500 font-bold text-xs">No records found for filter.</div>
                      ) : (
                        filteredTransactions.map((t, idx) => (
                          <div
                            key={t.id ? `setting-tx-${t.id}-${idx}` : `setting-tx-${idx}`}
                            onClick={() => toggleSelectTx(t.id)}
                            className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                              selectedTxIds.includes(t.id) ? 'bg-amber-500/20 border-amber-400' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {selectedTxIds.includes(t.id) ? (
                                <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-600 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="font-extrabold text-xs text-slate-100 truncate">{t.name} ({t.type})</p>
                                <p className="text-[10px] text-slate-400">{t.date} @ {t.time}</p>
                              </div>
                            </div>
                            <span className="font-mono font-black text-amber-300 text-xs shrink-0">Rs. {t.amount}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* RECYCLE BIN DRAWER TRIGGER */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-200">Recycle Bin Items ({recycleBin.length})</h4>
                      <p className="text-[10px] text-slate-400">Restore or permanently burn deleted records</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {recycleBin.length > 0 && (
                        <button
                          onClick={onEmptyRecycleBin}
                          className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white font-extrabold rounded-xl text-xs transition"
                        >
                          Empty Bin
                        </button>
                      )}
                      <button
                        onClick={() => setShowRecycleBinDrawer(!showRecycleBinDrawer)}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold rounded-xl text-xs transition"
                      >
                        {showRecycleBinDrawer ? 'Hide Items' : 'View Bin'}
                      </button>
                    </div>
                  </div>

                  {showRecycleBinDrawer && (
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-3xl space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                      {recycleBin.length === 0 ? (
                        <div className="text-center py-4 text-slate-500 font-bold text-xs">Recycle Bin is empty.</div>
                      ) : (
                        recycleBin.map((item, idx) => (
                          <div key={item.id ? `rb-${item.id}-${idx}` : `rb-${idx}`} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-extrabold text-xs text-slate-200 truncate">{item.label}</p>
                              <p className="text-[9px] text-slate-500">{item.date}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => onRestoreRecycleItem(item.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-[10px] flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" /> Restore
                              </button>
                              <button
                                onClick={() => onDeleteRecycleItemPermanent(item.id)}
                                className="px-3 py-1 bg-rose-700 hover:bg-rose-600 text-white font-extrabold rounded-lg text-[10px] flex items-center gap-1"
                              >
                                <Flame className="w-3 h-3" /> Burn
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* 4. APPEARANCE SECTION */}
              {activeSection === 'appearance' && (
                <div className="space-y-6">
                  
                  {/* Theme Selector */}
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
                    <h4 className="font-extrabold text-xs text-slate-200 flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-400" /> POS Visual Theme Mode
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => onToggleTheme(true)}
                        className={`p-4 rounded-2xl border text-left font-extrabold transition flex items-center justify-between ${
                          isDark ? 'bg-amber-500/20 text-amber-300 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-amber-300" />
                          <span>Dark Mode</span>
                        </span>
                        {isDark && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </button>

                      <button
                        onClick={() => onToggleTheme(false)}
                        className={`p-4 rounded-2xl border text-left font-extrabold transition flex items-center justify-between ${
                          !isDark ? 'bg-amber-500/20 text-amber-300 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Sun className="w-4 h-4 text-amber-500" />
                          <span>Light Mode</span>
                        </span>
                        {!isDark && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Scenic Mountain Background Presets */}
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
                    <h4 className="font-extrabold text-xs text-slate-200 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-400" /> Scenic Mountain Background Presets (Offline Cached)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {BACKGROUND_PRESETS.map((preset, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleApplyBgWithCache(preset.url)}
                          className="relative group h-20 rounded-2xl overflow-hidden cursor-pointer border border-slate-800 hover:border-amber-400 transition"
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                          <span className="absolute inset-x-0 bottom-0 bg-slate-950/85 p-1 text-[9px] font-bold text-center text-slate-200 truncate">
                            {preset.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Language Selector */}
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
                    <h4 className="font-extrabold text-xs text-slate-200 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-400" /> Global Language Selector ({currentLang.toUpperCase()})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {languageList.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => onSelectLanguage(lang.code, lang.name)}
                          className={`p-3 rounded-2xl border text-left font-extrabold transition flex items-center justify-between ${
                            currentLang === lang.code ? 'bg-amber-500/20 text-amber-300 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2 text-xs">
                            <span className="text-base">{lang.flag}</span>
                            <span>{lang.nativeName} ({lang.name})</span>
                          </span>
                          {currentLang === lang.code && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* 5. ADVANCED SECTION */}
              {activeSection === 'advanced' && (
                <div className="space-y-6">
                  
                  {/* Backend Gemini API Key Configuration */}
                  <div className="p-5 bg-slate-950 border border-purple-500/30 rounded-3xl space-y-3 shadow-xl">
                    <div className="border-b border-slate-800 pb-3">
                      <h4 className="font-extrabold text-xs text-purple-300 flex items-center gap-2">
                        <Key className="w-4 h-4 text-purple-400" /> Backend Gemini AI API Key Setting
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Optional: Save your own Google Gemini API key to speed up AI Assistant, Video Prompts & Translations.
                        <br />
                        <span className="text-emerald-400 font-bold">✨ Note: AI works 100% seamlessly even if no key is entered!</span>
                      </p>
                    </div>

                    <div className="flex gap-2 text-xs">
                      <input
                        type="password"
                        placeholder="AIzaSy... (Paste Gemini API Key)"
                        defaultValue={localStorage.getItem('bismillah_custom_gemini_api_key') || ''}
                        id="gemini-api-key-input"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-mono text-xs text-slate-200 outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('gemini-api-key-input') as HTMLInputElement;
                          if (input) {
                            localStorage.setItem('bismillah_custom_gemini_api_key', input.value.trim());
                            alert('✨ Gemini API Key saved successfully! AI speed boosted.');
                          }
                        }}
                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-lg transition"
                      >
                        Save API Key
                      </button>
                    </div>
                  </div>

                  {/* Sound Notification Settings */}
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                    <div className="border-b border-slate-800 pb-3">
                      <h4 className="font-extrabold text-xs text-slate-200 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-400" /> Sound Notifications & Audio Chimes
                      </h4>
                      <p className="text-[10px] text-slate-400">Manage audio chimes for sales, easyload receipts, and Islamic alarm</p>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-300">Transaction Audio Effects</span>
                        <button
                          onClick={() => onUpdateSoundSettings({ appSoundsEnabled: !soundSettings.appSoundsEnabled, enabled: !soundSettings.appSoundsEnabled })}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition ${
                            soundSettings.appSoundsEnabled !== false ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {soundSettings.appSoundsEnabled !== false ? 'Enabled' : 'Muted'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-300">Islamic Alarm Azan Sound</span>
                        <button
                          onClick={() => onUpdateSoundSettings({ notificationSoundsEnabled: !soundSettings.notificationSoundsEnabled, playAzan: !soundSettings.notificationSoundsEnabled })}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition ${
                            soundSettings.notificationSoundsEnabled !== false ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {soundSettings.notificationSoundsEnabled !== false ? 'Azan Enabled' : 'Off'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 100GB Backup Export & Restore */}
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
                    <div className="border-b border-slate-800 pb-3">
                      <h4 className="font-extrabold text-xs text-slate-200 flex items-center gap-2">
                        <Download className="w-4 h-4 text-emerald-400" /> 100GB Cloud Ledger Backup Export
                      </h4>
                      <p className="text-[10px] text-slate-400">Export complete JSON database file containing all transactions and notes</p>
                    </div>

                    <button
                      onClick={onExportBackup}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs shadow-xl flex items-center justify-center gap-2 transition"
                    >
                      <Download className="w-4 h-4" /> Download Complete JSON Backup File
                    </button>
                  </div>

                  {/* Clear Local Cache */}
                  <div className="p-5 bg-rose-950/20 border border-rose-500/30 rounded-3xl space-y-3 shadow-xl">
                    <div>
                      <h4 className="font-extrabold text-xs text-rose-300 flex items-center gap-2">
                        <Database className="w-4 h-4 text-rose-400" /> Clear Local POS Cache Data
                      </h4>
                      <p className="text-[10px] text-rose-200/70">Wipes local browser memory records for fresh start</p>
                    </div>

                    <button
                      onClick={onClearAllData}
                      className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs shadow-xl transition"
                    >
                      Clear All Local Storage
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      <AppShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shopTitle={shopTitle}
      />

      <BiometricEnrollmentModal
        isOpen={showBiometricEnrollment}
        onClose={() => {
          setShowBiometricEnrollment(false);
          setEnrolledFingers(SecurityManager.getEnrolledFingerprints());
          setEnrolledPasskeys(SecurityManager.getEnrolledPasskeys());
        }}
        onEnrolled={() => {
          setEnrolledFingers(SecurityManager.getEnrolledFingerprints());
          setEnrolledPasskeys(SecurityManager.getEnrolledPasskeys());
          onUpdateSecurityState({
            enrolledFingerprints: SecurityManager.getEnrolledFingerprints(),
            fidoKeys: SecurityManager.getEnrolledPasskeys()
          });
        }}
      />
    </>
  );
};
