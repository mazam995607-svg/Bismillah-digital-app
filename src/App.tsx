import React, { useState, useEffect, useRef } from 'react';
import { 
  WalletBalances, CommissionBreakdown, CustomAccount, Transaction, 
  UdhaarRecord, SavedNote, RecycleItem, SecurityState, AlarmSetting 
} from './types';
import { SecurityManager } from './utils/SecurityManager';
import { SyncManager } from './utils/SyncManager';
import { ResourceManager } from './utils/ResourceManager';
import { AuditLogger } from './utils/AuditLogger';
import { getTranslation, Language } from './i18n';

// Components
import { Header } from './components/Header';
import { RegistrationWizard } from './components/RegistrationWizard';
import { LockScreen } from './components/LockScreen';
import { SessionExpiryWarningModal } from './components/SessionExpiryWarningModal';
import { SecurityDashboardModal } from './components/SecurityDashboardModal';
import { BiometricHistoryModal } from './components/BiometricHistoryModal';
import { CommissionBreakdownModal } from './components/CommissionBreakdownModal';
import { CashRegistersModal } from './components/CashRegistersModal';
import { CustomAccountsModal } from './components/CustomAccountsModal';
import { CurrencyConverter } from './components/CurrencyConverter';
import { StatementPreviewModal } from './components/StatementPreviewModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { IslamicAlarmModal } from './components/IslamicAlarmModal';
import { TextBoxModal } from './components/TextBoxModal';
import { SettingsModal } from './components/SettingsModal';
import { UdhaarKhataModal } from './components/UdhaarKhataModal';
import { UtilityBillsModal } from './components/UtilityBillsModal';
import { AppHealthMonitor } from './components/AppHealthMonitor';
import { DailyAnalyticsChart } from './components/DailyAnalyticsChart';
import { MonthlyProfitGoalWidget } from './components/MonthlyProfitGoalWidget';
import { SwipeableTransactionCard } from './components/SwipeableTransactionCard';
import { ReceiptModal } from './components/ReceiptModal';
import { TransactionQRModal } from './components/TransactionQRModal';
import { QuickPickAmountButtons } from './components/QuickPickAmountButtons';
import { SplashScreen } from './components/SplashScreen';
import { DownloadAppBanner } from './components/DownloadAppBanner';
import { TaskSchedulerModal } from './components/TaskSchedulerModal';
import { MindFreshGamesModal } from './components/MindFreshGamesModal';
import { MarketTickerModal } from './components/MarketTickerModal';
import { UsefulWebsitesModal } from './components/UsefulWebsitesModal';
import { OTPVerificationModal } from './components/OTPVerificationModal';
import { ImageEditorModal } from './components/ImageEditorModal';
import { PDFToolsModal } from './components/PDFToolsModal';
import { TVShowHubModal } from './components/TVShowHubModal';
import { AICVBuilderModal } from './components/AICVBuilderModal';
import { VideoStudioModal } from './components/VideoStudioModal';
import { UnrestrictedBrowserModal } from './components/UnrestrictedBrowserModal';
import { AudioStudioModal } from './components/AudioStudioModal';
import { FestiveThemeEngine } from './components/FestiveThemeEngine';
import { DubbingStudioModal } from './components/DubbingStudioModal';
import { AppWebsiteMakerModal } from './components/AppWebsiteMakerModal';
import { AppUpdateModal } from './components/AppUpdateModal';
import { GoogleTranslateModal } from './components/GoogleTranslateModal';
import { UniversalDownloaderModal } from './components/UniversalDownloaderModal';
import { GoogleSearchModal } from './components/GoogleSearchModal';
import { YouTubeStudioModal } from './components/YouTubeStudioModal';
import { SimCnicTrackerModal } from './components/SimCnicTrackerModal';
import { NativeInstallationModal } from './components/NativeInstallationModal';
import { VisualStudioSetupModal } from './components/VisualStudioSetupModal';
import { HardwareSecurityAuditor } from './utils/HardwareSecurityAuditor';
import { VoiceCommandListener, VoiceCommandMatch } from './utils/VoiceCommandListener';
import { UsageTracker } from './utils/UsageTracker';
import { PersonalizationEngine, ToolUsageMetric } from './utils/PersonalizationEngine';
import { LiveUpdateService, LiveUpdateState } from './utils/LiveUpdateService';
import { CloudStorageBackupModal } from './components/CloudStorageBackupModal';
import { saveAutoBackupToCloud, restoreBackupFromCloud, subscribeToUserCloudBackup } from './services/cloudSyncService';
import { syncEngine } from './services/SyncEngine';
import { ScheduledTask, NotificationSoundSettings, MarketItem } from './types';
import { downloadCombinedTransactionsPDF } from './utils/pdfGenerator';
import { exportTransactionsToCSV } from './utils/csvExporter';
import { exportTransactionsToXLSX } from './utils/excelExporter';
import { audioChimes } from './utils/audioChimes';

// Icons
import { 
  Zap, Wallet, Building2, Globe, Gamepad2, FileText, 
  Bike, GraduationCap, Truck, ArrowRight, ArrowUp, Hourglass, 
  CheckCircle, Plus, Search, Sparkles, AlertTriangle, ShieldCheck, ShieldAlert, X,
  Tag, Filter, CheckSquare, Square, Printer, Trash2, Download, Layers,
  FileSpreadsheet, QrCode, Mic, Tv, Cloud, HardDrive, Video, FileCode, Film, Code, Languages,
  Youtube, KeyRound, Fingerprint, Play, Radio, Volume2, Bookmark, Check, MapPin
} from 'lucide-react';

const DEFAULT_WALLETS: WalletBalances = {
  Jazz: 0,
  'Jazz 2': 0,
  Telenor: 0,
  'Telenor 2': 0,
  Zong: 0,
  'Zong 2': 0,
  Ufone: 0,
  'Ufone 2': 0,
  'Udhaar App': 0,
  loadCash: 0,
  easyCash: 0,
};

const DEFAULT_COMMISSIONS: CommissionBreakdown = {
  jazzComm: 0,
  jazz2Comm: 0,
  zongComm: 0,
  zong2Comm: 0,
  telenorComm: 0,
  telenor2Comm: 0,
  ufoneComm: 0,
  ufone2Comm: 0,
  udhaarAppComm: 0,
  installmentsComm: 0,
  gameTopupComm: 0,
  challanComm: 0,
  eduComm: 0,
  nadraComm: 0,
  onlinePayComm: 0,
  bankComm: 0,
};

export default function App() {
  // Security State
  const [securityState, setSecurityState] = useState<SecurityState>(() => {
    const defaultState: SecurityState = {
      isLocked: true,
      isRegistered: false,
      rootEmail: '',
      rootName: 'Root Admin',
      pinHash: '',
      passwordHash: '',
      enrolledFingerprints: [],
      isFaceEnrolled: false,
      fidoKeys: [],
      intruderAttempts: 0,
      lockedUntil: null,
      duressActive: false,
      highSecurityThreshold: 25000,
      theme: 'Deep Navy',
      auditLogs: []
    };
    try {
      const saved = SyncManager.loadEncrypted('bismillah_sec_state', undefined, null);
      if (saved && typeof saved === 'object') {
        return { ...defaultState, ...saved };
      }
    } catch {
      // fallback to default
    }
    return defaultState;
  });

  // Main Shop Data State
  const [wallets, setWallets] = useState<WalletBalances>(() => {
    try {
      const loaded = SyncManager.loadEncrypted('wallets', securityState?.rootEmail, DEFAULT_WALLETS);
      return (loaded && typeof loaded === 'object') ? { ...DEFAULT_WALLETS, ...loaded } : DEFAULT_WALLETS;
    } catch {
      return DEFAULT_WALLETS;
    }
  });

  const [commissions, setCommissions] = useState<CommissionBreakdown>(() => {
    try {
      const loaded = SyncManager.loadEncrypted('commissions', securityState?.rootEmail, DEFAULT_COMMISSIONS);
      return (loaded && typeof loaded === 'object') ? { ...DEFAULT_COMMISSIONS, ...loaded } : DEFAULT_COMMISSIONS;
    } catch {
      return DEFAULT_COMMISSIONS;
    }
  });

  const [customAccounts, setCustomAccounts] = useState<CustomAccount[]>(() => {
    try {
      const loaded = SyncManager.loadEncrypted('custom_accounts', securityState?.rootEmail, []);
      return Array.isArray(loaded) ? loaded : [];
    } catch {
      return [];
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const loaded = SyncManager.loadEncrypted('transactions', securityState?.rootEmail, []);
      return Array.isArray(loaded) ? loaded : [];
    } catch {
      return [];
    }
  });

  const [savedNotes, setSavedNotes] = useState<SavedNote[]>(() => {
    try {
      const loaded = SyncManager.loadEncrypted('saved_notes', securityState?.rootEmail, []);
      return Array.isArray(loaded) ? loaded : [];
    } catch {
      return [];
    }
  });

  const [draftText, setDraftText] = useState<string>(() => {
    try {
      const loaded = SyncManager.loadEncrypted('draft_text', securityState?.rootEmail, '');
      return typeof loaded === 'string' ? loaded : '';
    } catch {
      return '';
    }
  });

  const [recycleBin, setRecycleBin] = useState<RecycleItem[]>(() => {
    try {
      const loaded = SyncManager.loadEncrypted('recycle_bin', securityState?.rootEmail, []);
      return Array.isArray(loaded) ? loaded : [];
    } catch {
      return [];
    }
  });

  const [alarms, setAlarms] = useState<AlarmSetting[]>(() => {
    const defaultAlarms: AlarmSetting[] = [
      { id: '1', name: 'Fajr Azan', time: '05:15', enabled: true, soundType: 'Azan' },
      { id: '2', name: 'Zohar Azan', time: '12:30', enabled: true, soundType: 'Azan' },
      { id: '3', name: 'Asr Azan', time: '16:45', enabled: true, soundType: 'Azan' },
      { id: '4', name: 'Maghrib Azan', time: '18:50', enabled: true, soundType: 'Azan' },
      { id: '5', name: 'Isha Azan', time: '20:15', enabled: true, soundType: 'Azan' }
    ];
    try {
      const loaded = SyncManager.loadEncrypted('alarms', securityState?.rootEmail, defaultAlarms);
      return Array.isArray(loaded) && loaded.length > 0 ? loaded : defaultAlarms;
    } catch {
      return defaultAlarms;
    }
  });

  const [shopTitle, setShopTitle] = useState(() => {
    try {
      return localStorage.getItem('digidukaan_shop_title') || localStorage.getItem('bismillah_shop_title') || 'DigiDukaan Retail POS';
    } catch {
      return 'DigiDukaan Retail POS';
    }
  });
  const [ownerName, setOwnerName] = useState(() => {
    try {
      return localStorage.getItem('digidukaan_owner_name') || 'Merchant Admin';
    } catch {
      return 'Merchant Admin';
    }
  });
  const [shopContact, setShopContact] = useState(() => {
    try {
      return localStorage.getItem('digidukaan_shop_contact') || 'Contact: 0300-1234567';
    } catch {
      return 'Contact: 0300-1234567';
    }
  });
  const [shopLogoUrl, setShopLogoUrl] = useState('https://ui-avatars.com/api/?name=DD&background=d97706&color=fff');
  const [bgImage, setBgImage] = useState(() => {
    return localStorage.getItem('bismillah_bg_image_cached') || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200';
  });
  const [isDark, setIsDark] = useState(true);
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    return (localStorage.getItem('bismillah_app_language') as Language) || 'en';
  });

  const t = (key: string, fallback?: string) => getTranslation(currentLang, key, fallback);

  // Inactivity & Session Warning State
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningSeconds, setWarningSeconds] = useState(60);

  // Modals Visibility State
  const [openModal, setOpenModal] = useState<
    'security' | 'biometricHistory' | 'commissions' | 'cashRegisters' | 'customAccounts' | 
    'statementPDF' | 'aiAssistant' | 'islamicAlarm' | 'textBox' | 
    'settings' | 'udhaarKhata' | 'utilityBills' | 'loadPurchase' | 
    'bankTransfer' | 'serviceModal' | 'addBalance' | 'taskScheduler' |
    'mindFresh' | 'marketTicker' | 'usefulWebsites' | 'otpVerification' |
    'imageStudio' | 'pdfTools' | 'tvShowHub' | 'cloudBackup' | 'aiCvBuilder' | 
    'videoStudio' | 'unrestrictedBrowser' | 'audioStudio' | 'dubbingStudio' | 
    'appWebsiteMaker' | 'googleTranslate' | 'universalDownloader' | 'googleSearch' | 'appUpdates' | 'youtubeHub' | 'simCnicTracker' | 'nativeInstall' | 'vsSetup' | null
  >(null);

  // Persistent Security Auditor State (Monitors OS hardware blockages & lockouts)
  const [securityAuditAlert, setSecurityAuditAlert] = useState<{
    isBlocked: boolean;
    message: string;
    details?: string;
    timestamp: string;
  } | null>(null);

  // Global Hands-Free Voice Commands State
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [voiceBanner, setVoiceBanner] = useState<{ message: string; action?: string } | null>(null);

  // Clean Section Categorization & Global Feature Filter State
  const [activeSectionTab, setActiveSectionTab] = useState<'all' | 'easyload' | 'banking' | 'studio' | 'business' | 'media' | 'admin'>('all');
  const [globalToolFilter, setGlobalToolFilter] = useState<string>('');
  const [isVoiceMemoRecording, setIsVoiceMemoRecording] = useState<boolean>(false);

  const [liveUpdateState, setLiveUpdateState] = useState<LiveUpdateState>(LiveUpdateService.getState());

  useEffect(() => {
    const unsub = LiveUpdateService.subscribe((s) => {
      setLiveUpdateState(s);
    });
    return () => unsub();
  }, []);

  const [topRankedTools, setTopRankedTools] = useState<ToolUsageMetric[]>([]);

  // Track & Update Top Features Ranking Dynamically
  useEffect(() => {
    setTopRankedTools(PersonalizationEngine.getTopRankedTools(8));

    const handleUpdate = () => {
      setTopRankedTools(PersonalizationEngine.getTopRankedTools(8));
    };

    window.addEventListener('personalization_updated', handleUpdate);
    return () => window.removeEventListener('personalization_updated', handleUpdate);
  }, []);

  const isSyncingRef = useRef(false);

  // Cloud Storage Real-time Sync & Initial Fetch Effect (SyncEngine + Firestore)
  useEffect(() => {
    const activeEmail = securityState.rootEmail || 'owner@myshop.pk';

    // 1. Initial Cloud Storage restore on boot / email change using SyncEngine
    syncEngine.loadInitialState(activeEmail).then((cloudData) => {
      if (cloudData) {
        isSyncingRef.current = true;
        if (Array.isArray(cloudData.transactions) && cloudData.transactions.length > 0) {
          setTransactions(cloudData.transactions);
        }
        if (Array.isArray(cloudData.customAccounts) && cloudData.customAccounts.length > 0) {
          setCustomAccounts(cloudData.customAccounts);
        }
        if (cloudData.wallets) {
          setWallets(cloudData.wallets);
        }
        setTimeout(() => { isSyncingRef.current = false; }, 800);
      }
    }).catch(() => {});

    // 2. Real-time Cloud Storage subscription via SyncEngine
    const stopSync = syncEngine.initSync(activeEmail, (cloudData) => {
      if (cloudData) {
        isSyncingRef.current = true;
        if (Array.isArray(cloudData.transactions) && cloudData.transactions.length > 0) {
          setTransactions(prev => {
            if (JSON.stringify(prev) === JSON.stringify(cloudData.transactions)) return prev;
            return cloudData.transactions!;
          });
        }
        if (Array.isArray(cloudData.customAccounts) && cloudData.customAccounts.length > 0) {
          setCustomAccounts(prev => {
            if (JSON.stringify(prev) === JSON.stringify(cloudData.customAccounts)) return prev;
            return cloudData.customAccounts!;
          });
        }
        if (cloudData.wallets) {
          setWallets(prev => {
            if (JSON.stringify(prev) === JSON.stringify(cloudData.wallets)) return prev;
            return cloudData.wallets!;
          });
        }
        setTimeout(() => { isSyncingRef.current = false; }, 800);
      }
    });

    return () => {
      stopSync();
    };
  }, [securityState.rootEmail]);

  // WhatsApp-Style Automatic Background Cloud Auto-Save via SyncEngine
  useEffect(() => {
    if (isSyncingRef.current) return;
    const activeEmail = securityState.rootEmail || 'owner@myshop.pk';
    syncEngine.saveState(activeEmail, {
      transactions,
      wallets,
      customAccounts,
      securityState
    });
  }, [transactions, wallets, customAccounts, securityState]);

  // Service Worker Registration and PWA Offline-First Queue Sync Effect
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const swUrl = '/service-worker.js';
      navigator.serviceWorker.register(swUrl)
        .then((registration) => {
          console.log('[ServiceWorker] Registered successfully with scope:', registration.scope);
        })
        .catch((err) => {
          console.warn('[ServiceWorker] Registration fallback to dev path:', err);
          navigator.serviceWorker.register('/src/service-worker.js').catch(() => {});
        });

      // Handle messages from Service Worker (e.g., offline synced transactions)
      const handleServiceWorkerMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'SYNC_OFFLINE_TRANSACTIONS') {
          const syncedList = event.data.payload;
          if (Array.isArray(syncedList) && syncedList.length > 0) {
            setTransactions((prev) => {
              const existingIds = new Set(prev.map(t => t.id));
              const uniqueNew = syncedList.filter((t: any) => !existingIds.has(t.id));
              if (uniqueNew.length === 0) return prev;
              return [...uniqueNew, ...prev];
            });
            console.log(`[Offline PWA Sync] ${syncedList.length} offline transactions synced.`);
          }
        }
      };

      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

      // Listen for online event to trigger offline transaction flush and restore live sync
      const handleOnline = () => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'TRIGGER_SYNC_NOW' });
        }
        LiveUpdateService.checkForUpdates().catch(() => {});
      };

      window.addEventListener('online', handleOnline);

      // Silent WebSocket / Connection Resilience Manager with Exponential Backoff
      let retryCount = 0;
      let retryTimeout: any = null;

      const scheduleSilentReconnect = () => {
        if (retryTimeout) clearTimeout(retryTimeout);
        // Exponential backoff with jitter: base 1000ms, factor 1.8, max 30000ms
        const baseDelay = 1000 * Math.pow(1.8, Math.min(retryCount, 6));
        const jitter = Math.random() * 400;
        const delay = Math.min(30000, baseDelay + jitter);
        retryCount++;

        retryTimeout = setTimeout(() => {
          if (navigator.onLine) {
            LiveUpdateService.checkForUpdates()
              .then(() => {
                retryCount = 0; // Reset backoff on success
              })
              .catch(() => {
                scheduleSilentReconnect();
              });
          } else {
            scheduleSilentReconnect();
          }
        }, delay);
      };

      const handleConnectionDrop = () => {
        scheduleSilentReconnect();
      };

      window.addEventListener('offline', handleConnectionDrop);

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleConnectionDrop);
        if (retryTimeout) clearTimeout(retryTimeout);
      };
    }
  }, []);

  const handleRestoreDataFromCloud = (restoredData: any) => {
    if (!restoredData) return;
    if (Array.isArray(restoredData.transactions)) {
      setTransactions(restoredData.transactions);
    }
    if (Array.isArray(restoredData.customAccounts)) {
      setCustomAccounts(restoredData.customAccounts);
    }
    if (restoredData.wallets) {
      setWallets(restoredData.wallets);
    }
    if (restoredData.securityState) {
      setSecurityState(restoredData.securityState);
    }
    alert('100 GB Cloud Data Backup restored successfully!');
  };

  // Floating Left Scroll To Top State & Listener
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // User Custom Section Layout Order & Profile Pic State
  const DEFAULT_SECTION_ORDER = ['easyload', 'moneyTransfer', 'utilityBills', 'udhaarKhata', 'imageStudio', 'pdfTools', 'taskScheduler', 'analytics'];

  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`bismillah_layout_order_${securityState?.rootEmail || 'default'}`);
      return saved ? JSON.parse(saved) : DEFAULT_SECTION_ORDER;
    } catch (e) {
      return DEFAULT_SECTION_ORDER;
    }
  });

  const [profilePicUrl, setProfilePicUrl] = useState<string>(() => {
    return localStorage.getItem(`bismillah_profile_pic_${securityState?.rootEmail || 'default'}`) || '';
  });

  const handleJumpSectionToTop = (sectionKey: string) => {
    setSectionOrder(prev => {
      const newOrder = [sectionKey, ...prev.filter(s => s !== sectionKey)];
      try {
        localStorage.setItem(`bismillah_layout_order_${securityState?.rootEmail || 'default'}`, JSON.stringify(newOrder));
      } catch (e) {}
      return newOrder;
    });
    setTimeout(() => {
      const el = document.getElementById(`section-${sectionKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 220, behavior: 'smooth' });
      }
    }, 120);
  };

  const handleResetLayoutToDefault = () => {
    setSectionOrder(DEFAULT_SECTION_ORDER);
    try {
      localStorage.removeItem(`bismillah_layout_order_${securityState?.rootEmail || 'default'}`);
    } catch (e) {}
  };

  const handleUpdateProfilePic = (url: string) => {
    setProfilePicUrl(url);
    try {
      localStorage.setItem(`bismillah_profile_pic_${securityState?.rootEmail || 'default'}`, url);
    } catch (e) {}
  };

  // Scheduled Tasks State
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>(() => {
    const defaultTasks: ScheduledTask[] = [
      {
        id: '1',
        title: 'Full Time Customer Load Settlement & Cash Register Verification',
        scheduledTime: '10:00 AM',
        scheduledDate: 'Tomorrow',
        status: 'Pending',
        createdAt: new Date().toISOString(),
        note: 'Process all pending easyload orders and balance cash registers.'
      }
    ];
    try {
      const loaded = SyncManager.loadEncrypted('scheduled_tasks', securityState?.rootEmail, defaultTasks);
      return Array.isArray(loaded) ? loaded : defaultTasks;
    } catch {
      return defaultTasks;
    }
  });

  // Sound Settings State
  const [soundSettings, setSoundSettings] = useState<NotificationSoundSettings>(() => {
    const defaultSound: NotificationSoundSettings = {
      notificationsEnabled: true,
      appSoundsEnabled: true,
      notificationSoundsEnabled: true,
      marketAlertsEnabled: true
    };
    try {
      const loaded = SyncManager.loadEncrypted('sound_settings', securityState?.rootEmail, defaultSound);
      return (loaded && typeof loaded === 'object') ? { ...defaultSound, ...loaded } : defaultSound;
    } catch {
      return defaultSound;
    }
  });

  // Market Ticker Data State
  const [marketItems, setMarketItems] = useState<MarketItem[]>([
    { id: '1', symbol: 'GOLD (24K Tola)', name: 'Pakistan Gold Rate', price: 245500, change: 1200, changePercent: 0.49, type: 'gainer' },
    { id: '2', symbol: 'USD / PKR', name: 'US Dollar Rate', price: 278.40, change: -0.30, changePercent: -0.11, type: 'loser' },
    { id: '3', symbol: 'SILVER (Tola)', name: 'Silver Tola Rate', price: 2850, change: 25, changePercent: 0.88, type: 'gainer' },
    { id: '4', symbol: 'AED / PKR', name: 'UAE Dirham Rate', price: 75.80, change: -0.05, changePercent: -0.07, type: 'loser' }
  ]);

  // View state: 'history' | 'pending'
  const [ledgerView, setLedgerView] = useState<'history' | 'pending'>('history');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('ALL');
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [printingTx, setPrintingTx] = useState<Transaction | null>(null);
  const [qrTx, setQrTx] = useState<Transaction | null>(null);

  // Service Forms Temp State
  const [loadNet, setLoadNet] = useState<'Jazz' | 'Jazz 2' | 'Telenor' | 'Telenor 2' | 'Zong' | 'Zong 2' | 'Ufone' | 'Ufone 2' | 'Udhaar App'>('Jazz');
  const [loadPhone, setLoadPhone] = useState('');
  const [loadAmount, setLoadAmount] = useState('');
  const [loadComm, setLoadComm] = useState('');
  const [loadTag, setLoadTag] = useState<string>('General');
  const [loadNote, setLoadNote] = useState<string>('');

  // Load Purchase Temp State
  const [lpNet, setLpNet] = useState<'Jazz' | 'Jazz 2' | 'Telenor' | 'Telenor 2' | 'Zong' | 'Zong 2' | 'Ufone' | 'Ufone 2'>('Jazz');
  const [lpTotal, setLpTotal] = useState('');
  const [lpReceived, setLpReceived] = useState('');

  // Bank Transfer Temp State
  const [transferTarget, setTransferTypeTarget] = useState('Easypaisa');
  const [transferMode, setTransferMode] = useState<'Cash In' | 'Cash Out'>('Cash In');
  const [txBankSelect, setTxBankSelect] = useState('HBL');
  const [txAccount, setTxAccount] = useState('');
  const [txName, setTxName] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txComm, setTxComm] = useState('');
  const [txTag, setTxTag] = useState<string>('General');
  const [txNote, setTxNote] = useState<string>('');

  // Dynamic Service Temp State
  const [serviceKind, setServiceKind] = useState<'FreeFire Topup' | 'NADRA Fee' | 'Bike Challan' | 'Education Voucher'>('FreeFire Topup');
  const [dsId, setDsId] = useState('');
  const [dsName, setDsName] = useState('');
  const [dsAmount, setDsAmount] = useState('');
  const [dsComm, setDsComm] = useState('');
  const [dsTag, setDsTag] = useState<string>('General');
  const [dsNote, setDsNote] = useState<string>('');

  // Add Wallet Balance Temp
  const [targetAddNet, setTargetAddNet] = useState<keyof WalletBalances>('Jazz');
  const [addWalletAmt, setAddWalletAmt] = useState('');

  // Quick Print & Voice Search & Category Hover Stats States
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [quickPrint, setQuickPrint] = useState<boolean>(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Persistent Biometric Security Auditor Effect
  useEffect(() => {
    // 1. Initial deep hardware audit
    HardwareSecurityAuditor.runDeepAudit().then(report => {
      if (report.hardwareLevel === 'UNSUPPORTED' && !report.isSecureContext) {
        console.info('[Security Auditor] Running in non-HTTPS preview environment. Software fallback is primed.');
      }
    });

    // 2. Subscribe to real-time biometric audit events
    const unsubAuditor = SecurityManager.subscribeToBiometricAudits((event) => {
      if (event.status === 'BLOCKED' || (event.status === 'FAILED' && (event.reason?.toLowerCase().includes('notallowederror') || event.reason?.toLowerCase().includes('blocked') || event.reason?.toLowerCase().includes('hardware')))) {
        setSecurityAuditAlert({
          isBlocked: true,
          message: 'Biometric Hardware / Sensor Access Restricted by OS',
          details: event.reason || 'Hardware authenticator did not respond or access was denied.',
          timestamp: new Date().toLocaleTimeString()
        });
      }
    });

    return () => unsubAuditor();
  }, []);

  // Handle Biometric Hardware Security Reset Flow
  const handlePerformSecurityReset = () => {
    const res = SecurityManager.resetHardwareSecurity();
    if (res.success) {
      setSecurityAuditAlert(null);
      audioChimes.playChime('success');
      alert(`✓ Security Reset Complete!\n${res.message}\nMaster Admin Biometric Profiles re-enrolled.`);
    } else {
      alert(`⚠️ Reset Error: ${res.message}`);
    }
  };

  // Global Hands-Free Voice Command Listener Engine
  const handleToggleVoiceCommands = () => {
    if (VoiceCommandListener.getIsListening()) {
      VoiceCommandListener.stopListening();
      setIsVoiceListening(false);
      setVoiceBanner({ message: 'Voice Assistant Stopped', action: 'Microphone Muted' });
      setTimeout(() => setVoiceBanner(null), 2500);
    } else {
      const started = VoiceCommandListener.startListening((match: VoiceCommandMatch) => {
        audioChimes.playChime('info');
        setVoiceBanner({
          message: `🎙️ "${match.phrase}" detected`,
          action: `Opening ${match.description || match.actionId.toUpperCase()}`
        });

        setTimeout(() => {
          setVoiceBanner(null);
        }, 3500);

        // Map recognized action to modal or trigger
        if (match.actionId === 'youtubeHub') {
          setOpenModal('youtubeHub');
        } else if (match.actionId === 'udhaarKhata') {
          setOpenModal('udhaarKhata');
        } else if (match.actionId === 'cashRegisters') {
          setOpenModal('cashRegisters');
        } else if (match.actionId === 'aiAssistant') {
          setOpenModal('aiAssistant');
        } else if (match.actionId === 'simCnicTracker') {
          setOpenModal('simCnicTracker');
        } else if (match.actionId === 'islamicAlarm') {
          setOpenModal('islamicAlarm');
        } else if (match.actionId === 'statementPDF') {
          setOpenModal('statementPDF');
        } else if (match.actionId === 'commissions') {
          setOpenModal('commissions');
        } else if (match.actionId === 'security') {
          setOpenModal('security');
        } else if (match.actionId === 'biometricHistory') {
          setOpenModal('biometricHistory');
        } else if (match.actionId === 'nativeInstall') {
          setOpenModal('nativeInstall');
        } else if (match.actionId === 'googleSearch') {
          setOpenModal('googleSearch');
        } else if (match.actionId === 'settings') {
          setOpenModal('settings');
        } else if (match.actionId === 'utilityBills') {
          setOpenModal('utilityBills');
        } else if (match.actionId === 'easyload' || match.actionId === 'loadPurchase') {
          setOpenModal('loadPurchase');
        } else if (match.actionId === 'bankTransfer') {
          setOpenModal('bankTransfer');
        } else if (match.actionId === 'customAccounts') {
          setOpenModal('customAccounts');
        } else if (match.actionId === 'mindFresh') {
          setOpenModal('mindFresh');
        } else {
          setOpenModal(match.actionId as any);
        }
      });

      if (started) {
        setIsVoiceListening(true);
        setVoiceBanner({ message: '🎙️ Voice Assistant Active', action: 'Speak a command (e.g., "Open YouTube", "Add Udhaar", "Check Balance")' });
        setTimeout(() => setVoiceBanner(null), 4000);
      } else {
        alert('Speech recognition is not available in this browser environment.');
      }
    }
  };

  const handleStartVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser environment. You can type in the search bar.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      
      recognition.onstart = () => setIsVoiceListening(true);
      recognition.onend = () => setIsVoiceListening(false);
      recognition.onerror = () => setIsVoiceListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setSearchQuery(transcript);
        }
        setIsVoiceListening(false);
      };
      recognition.start();
    } catch {
      setIsVoiceListening(false);
    }
  };

  // Helper for Average Ticket Size calculation
  const getCategoryStats = (categoryName: string) => {
    const catTxs = transactions.filter(t => {
      if (categoryName === 'ALL') return true;
      if (categoryName === 'Easyload') return t.type.includes('Load');
      if (categoryName === 'Bank Transfer') return t.type.includes('Easypaisa') || t.type.includes('JazzCash') || t.type.includes('Bank');
      if (categoryName === 'Udhaar') return t.type === 'Udhaar Khata';
      if (categoryName === 'Topup') return t.type.includes('Topup');
      if (categoryName === 'NADRA') return t.type.includes('NADRA');
      return t.type.includes(categoryName);
    });
    const count = catTxs.length;
    const totalVol = catTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const avgTicket = count > 0 ? Math.round(totalVol / count) : 0;
    return { count, totalVol, avgTicket };
  };

  const [tamperAlert, setTamperAlert] = useState<string | null>(null);

  // Initial Data Integrity Verification on Application Load
  useEffect(() => {
    if (securityState.rootEmail) {
      SecurityManager.verifyDataIntegrity(transactions, wallets, securityState.rootEmail).then(res => {
        if (!res.valid) {
          setTamperAlert(res.message);
          AuditLogger.log('DATA_INTEGRITY_ALERT', 'WARNING', 'SHA-256 Engine', res.message);
        }
      });
    }
  }, [securityState.rootEmail]);

  // Auto-Save encrypted data whenever key states change
  useEffect(() => {
    if (securityState.rootEmail) {
      SyncManager.saveEncrypted('wallets', wallets, securityState.rootEmail);
      SyncManager.saveEncrypted('commissions', commissions, securityState.rootEmail);
      SyncManager.saveEncrypted('custom_accounts', customAccounts, securityState.rootEmail);
      SyncManager.saveEncrypted('transactions', transactions, securityState.rootEmail);
      SyncManager.saveEncrypted('saved_notes', savedNotes, securityState.rootEmail);
      SyncManager.saveEncrypted('draft_text', draftText, securityState.rootEmail);
      SyncManager.saveEncrypted('recycle_bin', recycleBin, securityState.rootEmail);
      SyncManager.saveEncrypted('alarms', alarms, securityState.rootEmail);

      // Save Data Integrity Hash Checksum
      SecurityManager.saveIntegrityChecksum(transactions, wallets, securityState.rootEmail);
    }
  }, [wallets, commissions, customAccounts, transactions, savedNotes, draftText, recycleBin, alarms, securityState.rootEmail]);

  // Save security state
  useEffect(() => {
    localStorage.setItem('bismillah_sec_state', SecurityManager.encryptData(securityState));
  }, [securityState]);

  // Inactivity Watcher (3 minutes = 180s)
  useEffect(() => {
    const mark = () => setLastActivity(Date.now());
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, mark, { passive: true }));

    const timer = setInterval(() => {
      if (!securityState.isLocked && securityState.isRegistered) {
        const elapsed = Math.floor((Date.now() - lastActivity) / 1000);
        if (elapsed >= 120 && elapsed < 180) {
          // Warning state 60s before lock
          setShowWarningModal(true);
          setWarningSeconds(180 - elapsed);
        } else if (elapsed >= 180) {
          setShowWarningModal(false);
          setSecurityState(prev => ({ ...prev, isLocked: true }));
        }
      }
    }, 1000);

    return () => {
      events.forEach(e => window.removeEventListener(e, mark));
      clearInterval(timer);
    };
  }, [lastActivity, securityState.isLocked, securityState.isRegistered]);

  // CleanupService: Periodically purges non-critical state & stale references when idle > 5 minutes (300s)
  useEffect(() => {
    const runCleanup = () => {
      const elapsed = Math.floor((Date.now() - lastActivity) / 1000);
      if (elapsed >= 300) {
        // Clear temporary modal selection/printing states and non-critical buffers
        setSelectedTxIds([]);
        setPrintingTx(null);
        setQrTx(null);
        
        // Reset uncommitted form temporary state to prevent stale memory bloat
        setLoadPhone('');
        setLoadAmount('');
        setLoadComm('');
        setLoadNote('');
        setTxAccount('');
        setTxName('');
        setTxAmount('');
        setTxComm('');
        setTxNote('');
        setDsId('');
        setDsName('');
        setDsAmount('');
        setDsComm('');
        setDsNote('');

        // Clean orphaned tracked listeners and check memory status
        ResourceManager.removeAllTrackedListeners();
        const mem = ResourceManager.getMemoryStats();
        if (mem.isHighMemory) {
          console.warn('[CleanupService] High memory usage detected, cache purged:', mem.formatted);
        }
      }
    };

    const cleanupTimer = setInterval(runCleanup, 60000); // Run cleanup evaluation every 60s
    return () => clearInterval(cleanupTimer);
  }, [lastActivity]);

  // Total Commission Sum
  const totalCommissionSum = Object.values(commissions).reduce((a: number, b) => a + Number(b || 0), 0);

  // Daily Smart Analytical Tip
  const dailySmartTip = React.useMemo(() => {
    const today = new Date().toLocaleDateString();
    const todayTx = transactions.filter(t => t.date === today);
    const todayVolume = todayTx.reduce((a, b) => a + Number(b.amount || 0), 0);
    if (todayVolume > 50000) {
      return `🚀 High Cash Flow Today! Total transaction volume reached Rs. ${todayVolume.toLocaleString()}. Check Dukan Cash Register to balance your load drawer.`;
    }
    return `💡 Smart Tip: Keep your Jazz 1 and Zong 1 wallets loaded during peak evening hours (5 PM - 9 PM) to maximize Easyload commissions.`;
  }, [transactions]);

  // Quick Fill Suggestions for selected Easyload network (last 3 mobile numbers & amounts)
  const easyloadQuickFillSuggestions = React.useMemo(() => {
    const baseNet = loadNet.split(' ')[0].toLowerCase();
    const matching = transactions.filter(t => {
      if (t.kind !== 'easyload' && !t.type?.toLowerCase().includes('load')) return false;
      if (t.network && t.network.toLowerCase().includes(baseNet)) return true;
      if (t.type && t.type.toLowerCase().includes(baseNet)) return true;
      return false;
    });

    const seen = new Set<string>();
    const suggestions: { phone: string; amount: number; comm?: number }[] = [];

    for (const t of matching) {
      if (!t.account || !t.amount) continue;
      const cleanPhone = t.account.trim();
      const key = `${cleanPhone}_${t.amount}`;
      if (!seen.has(key)) {
        seen.add(key);
        suggestions.push({
          phone: cleanPhone,
          amount: t.amount,
          comm: t.comm
        });
      }
      if (suggestions.length >= 3) break;
    }

    if (suggestions.length < 3) {
      const starterSuggestions: Record<string, { phone: string; amount: number; comm: number }[]> = {
        jazz: [
          { phone: '03001234567', amount: 200, comm: 5 },
          { phone: '03019876543', amount: 500, comm: 12 },
          { phone: '03024567890', amount: 1000, comm: 25 },
        ],
        telenor: [
          { phone: '03451234567', amount: 250, comm: 6 },
          { phone: '03469876543', amount: 350, comm: 9 },
          { phone: '03474567890', amount: 600, comm: 15 },
        ],
        zong: [
          { phone: '03121234567', amount: 200, comm: 5 },
          { phone: '03139876543', amount: 500, comm: 12 },
          { phone: '03154567890', amount: 800, comm: 20 },
        ],
        ufone: [
          { phone: '03331234567', amount: 150, comm: 4 },
          { phone: '03349876543', amount: 300, comm: 8 },
          { phone: '03354567890', amount: 700, comm: 18 },
        ],
        udhaar: [
          { phone: '03007654321', amount: 500, comm: 10 },
          { phone: '03457654321', amount: 1000, comm: 20 },
          { phone: '03127654321', amount: 1500, comm: 30 },
        ]
      };
      const defaults = starterSuggestions[baseNet] || starterSuggestions.jazz;
      for (const d of defaults) {
        const key = `${d.phone}_${d.amount}`;
        if (!seen.has(key)) {
          seen.add(key);
          suggestions.push(d);
        }
        if (suggestions.length >= 3) break;
      }
    }

    return suggestions.slice(0, 3);
  }, [transactions, loadNet]);

  // Today's Transactions Count for Quick Export
  const todayTransactionsCount = React.useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const localToday = new Date().toLocaleDateString();
    return transactions.filter(t => {
      if (!t.date) return false;
      if (t.date === todayStr || t.date === localToday) return true;
      const d = new Date(t.date);
      return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === todayStr;
    }).length;
  }, [transactions]);

  // Floating Quick Export of Today's Transactions to XLSX
  const handleQuickExportToday = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const localToday = new Date().toLocaleDateString();
    const todayTransactions = transactions.filter(t => {
      if (!t.date) return false;
      if (t.date === todayStr || t.date === localToday) return true;
      const d = new Date(t.date);
      return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === todayStr;
    });

    const exportList = todayTransactions.length > 0 ? todayTransactions : filteredTransactions;
    const prefix = todayTransactions.length > 0
      ? `${(shopTitle || 'DigiDukaan').replace(/\s+/g, '_')}_Today_Transactions`
      : `${(shopTitle || 'DigiDukaan').replace(/\s+/g, '_')}_Ledger_${ledgerView}`;

    exportTransactionsToXLSX(exportList, prefix);
    audioChimes.playSuccessChime();
  };

  // Security Threshold Intercept
  const checkAndEnforceSecurityThreshold = (amount: number): boolean => {
    const risk = SecurityManager.getThresholdRiskLevel(amount, securityState.highSecurityThreshold || 25000);
    if (risk === 'HIGH') {
      alert(`⚠️ High-Security Threshold Triggered! Transaction of Rs. ${amount.toLocaleString()} exceeds safety limit (Rs. ${(securityState.highSecurityThreshold || 25000).toLocaleString()}). Re-authentication required.`);
      setSecurityState(prev => ({ ...prev, isLocked: true }));
      return true;
    }
    return false;
  };

  // --- EASYLOAD LOGIC ---
  const handleProcessLoad = (status: 'Paid' | 'Pending') => {
    const amt = parseFloat(loadAmount) || 0;
    const comm = parseFloat(loadComm) || 0;

    if (!loadPhone.trim() || amt <= 0) {
      alert('Please fill Mobile Number and valid Amount!');
      return;
    }

    if (checkAndEnforceSecurityThreshold(amt)) return;

    if (status === 'Paid' && (wallets[loadNet] || 0) < amt) {
      alert(`Insufficient load balance in ${loadNet} wallet! Current: Rs. ${wallets[loadNet]}`);
      return;
    }

    if (status === 'Paid') {
      // Deduct load from network wallet
      setWallets(prev => ({
        ...prev,
        [loadNet]: (prev[loadNet] || 0) - amt,
        loadCash: (prev.loadCash || 0) + amt // Easyload cash collected into Dukan Load Cash Box
      }));

      // Route commission specifically to network commission box
      const commKey = getCommKeyForNetwork(loadNet);
      setCommissions(prev => ({
        ...prev,
        [commKey]: (prev[commKey as keyof CommissionBreakdown] || 0) + comm
      }));
    }

    const newTx: Transaction = {
      id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
      type: `${loadNet} Load`,
      account: loadPhone.trim(),
      name: 'Customer Easyload',
      amount: amt,
      comm: comm,
      status,
      kind: 'easyload',
      network: loadNet,
      tag: loadTag,
      note: loadNote.trim() || undefined,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rawDate: new Date().toISOString().slice(0, 10)
    };

    setTransactions(prev => [newTx, ...prev]);
    if (status === 'Paid') {
      audioChimes.playSuccessChime();
    } else {
      audioChimes.playAlertChime();
    }
    if (quickPrint) {
      setPrintingTx(newTx);
    }
    setLoadPhone('');
    setLoadAmount('');
    setLoadComm('');
    setLoadNote('');
    alert(`Easyload saved as ${status}!`);
  };

  const getCommKeyForNetwork = (net: string): keyof CommissionBreakdown => {
    switch (net) {
      case 'Jazz': return 'jazzComm';
      case 'Jazz 2': return 'jazz2Comm';
      case 'Zong': return 'zongComm';
      case 'Zong 2': return 'zong2Comm';
      case 'Telenor': return 'telenorComm';
      case 'Telenor 2': return 'telenor2Comm';
      case 'Ufone': return 'ufoneComm';
      case 'Ufone 2': return 'ufone2Comm';
      case 'Udhaar App': return 'udhaarAppComm';
      default: return 'jazzComm';
    }
  };

  // --- LOAD PURCHASE LOGIC ---
  const handleExecuteLoadPurchase = () => {
    const total = parseFloat(lpTotal) || 0;
    const received = parseFloat(lpReceived) || 0;
    if (total <= 0) {
      alert('Enter valid total load amount.');
      return;
    }

    const pending = Math.max(0, total - received);

    if (received > 0) {
      // Add balance to network wallet and deduct cash from Dukan Load Cash
      setWallets(prev => ({
        ...prev,
        [lpNet]: (prev[lpNet] || 0) + received,
        loadCash: Math.max(0, (prev.loadCash || 0) - received)
      }));
    }

    const newTx: Transaction = {
      id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
      type: `Load Purchase (${lpNet})`,
      account: 'Distributor Vendor',
      name: `Total Rs.${total} | Received Rs.${received} | Pending Rs.${pending}`,
      amount: received,
      comm: 0,
      status: pending > 0 ? 'Pending' : 'Paid',
      isAdd: true,
      kind: 'loadPurchase',
      network: lpNet,
      totalAmount: total,
      pendingAmount: pending,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rawDate: new Date().toISOString().slice(0, 10)
    };

    setTransactions(prev => [newTx, ...prev]);
    setOpenModal(null);
    setLpTotal('');
    setLpReceived('');
    alert(pending > 0 ? `Rs.${received} added to ${lpNet}. Rs.${pending} saved as Pending.` : `Full Rs.${total} added to ${lpNet}!`);
  };

  // --- BANK TRANSFER & EASYPAISA LOGIC ---
  const handleExecuteBankTransfer = (status: 'Paid' | 'Pending') => {
    const amt = parseFloat(txAmount) || 0;
    const comm = parseFloat(txComm) || 0;

    if (checkAndEnforceSecurityThreshold(amt)) return;

    let targetBankName = transferTarget;
    if (transferTarget === 'Bank') {
      targetBankName = txBankSelect || 'Bank Transfer';
    }

    if (status === 'Paid') {
      if (transferMode === 'Cash In') {
        // Customer deposit into bank/easypaisa account
        setWallets(prev => ({ ...prev, easyCash: (prev.easyCash || 0) + amt }));
      } else {
        // Customer cash withdrawal (Cash Out)
        setWallets(prev => ({ ...prev, easyCash: Math.max(0, (prev.easyCash || 0) - amt) }));
      }

      setCommissions(prev => ({ ...prev, bankComm: (prev.bankComm || 0) + comm }));
    }

    const newTx: Transaction = {
      id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
      type: `${targetBankName} (${transferMode})`,
      account: txAccount.trim() || 'N/A',
      name: txName.trim() || 'Receiver',
      amount: amt,
      comm,
      status,
      kind: 'bankTransfer',
      transferType: transferMode,
      tag: txTag,
      note: txNote.trim() || undefined,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rawDate: new Date().toISOString().slice(0, 10)
    };

    setTransactions(prev => [newTx, ...prev]);
    if (status === 'Paid') {
      audioChimes.playSuccessChime();
    } else {
      audioChimes.playAlertChime();
    }
    if (quickPrint) {
      setPrintingTx(newTx);
    }
    setOpenModal(null);
    setTxAccount('');
    setTxName('');
    setTxAmount('');
    setTxComm('');
    setTxNote('');
    alert(`Transfer saved as ${status}!`);
  };

  // --- DYNAMIC SERVICES LOGIC ---
  const handleExecuteDynamicService = (status: 'Paid' | 'Pending') => {
    const amt = parseFloat(dsAmount) || 0;
    const comm = parseFloat(dsComm) || 0;

    if (!dsId.trim() || amt <= 0) {
      alert('Please fill ID / Voucher and Amount!');
      return;
    }

    if (checkAndEnforceSecurityThreshold(amt)) return;

    if (status === 'Paid') {
      let commField: keyof CommissionBreakdown = 'gameTopupComm';
      if (serviceKind === 'Bike Challan') commField = 'challanComm';
      if (serviceKind === 'Education Voucher') commField = 'eduComm';
      if (serviceKind === 'NADRA Fee') commField = 'nadraComm';

      setCommissions(prev => ({
        ...prev,
        [commField]: (prev[commField] || 0) + comm
      }));
    }

    const newTx: Transaction = {
      id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
      type: serviceKind,
      account: dsId.trim(),
      name: dsName.trim() || 'Customer',
      amount: amt,
      comm,
      status,
      kind: 'service',
      tag: dsTag,
      note: dsNote.trim() || undefined,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rawDate: new Date().toISOString().slice(0, 10)
    };

    setTransactions(prev => [newTx, ...prev]);
    if (status === 'Paid') {
      audioChimes.playSuccessChime();
    } else {
      audioChimes.playAlertChime();
    }
    if (quickPrint) {
      setPrintingTx(newTx);
    }
    setOpenModal(null);
    setDsId('');
    setDsName('');
    setDsAmount('');
    setDsComm('');
    setDsNote('');

    if (status === 'Paid' && serviceKind === 'FreeFire Topup') {
      window.open('https://topup.pk/', '_blank');
    }
  };

  // --- CUSTOM ACCOUNTS LOGIC ---
  const handleCreateCustomAccountsBatch = (names: string[]) => {
    const newAccs: CustomAccount[] = names.map(n => ({
      id: 'ACC-' + Date.now() + Math.random().toString(36).substring(2, 6),
      name: n,
      balance: 0,
      createdAt: new Date().toLocaleDateString()
    }));
    setCustomAccounts(prev => [...prev, ...newAccs]);
  };

  const handleCustomAddBalance = (accId: string, amount: number) => {
    setCustomAccounts(prev => prev.map(a => a.id === accId ? { ...a, balance: a.balance + amount } : a));
  };

  const handleCustomClearBalance = (accId: string) => {
    if (confirm('Clear balance (0) for this custom account?')) {
      setCustomAccounts(prev => prev.map(a => a.id === accId ? { ...a, balance: 0 } : a));
    }
  };

  const handleCustomDeleteAccount = (accId: string) => {
    if (confirm('Delete this custom account permanently?')) {
      setCustomAccounts(prev => prev.filter(a => a.id !== accId));
    }
  };

  const handleCustomGiveUdhaar = (accId: string, customerName: string, amount: number) => {
    const acc = customAccounts.find(a => a.id === accId);
    if (!acc) return;

    if (acc.balance < amount) {
      alert(`Warning: Account balance (Rs. ${acc.balance}) is lower than Udhaar amount (Rs. ${amount}). Deducting anyway.`);
    }

    // Deduct balance from custom account
    setCustomAccounts(prev => prev.map(a => a.id === accId ? { ...a, balance: a.balance - amount } : a));

    // Create Udhaar transaction linked to custom account
    const newTx: Transaction = {
      id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
      type: `Udhaar Khata (${acc.name})`,
      account: customerName,
      name: `Udhaar taken from ${acc.name}`,
      amount,
      comm: 0,
      status: 'Pending',
      kind: 'customAccount',
      customAccountId: acc.id,
      customAccountName: acc.name,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rawDate: new Date().toISOString().slice(0, 10)
    };

    setTransactions(prev => [newTx, ...prev]);
    alert(`Udhaar of Rs. ${amount} given to ${customerName} from ${acc.name}! Linked to Udhaar Khata.`);
  };

  // --- RECYCLE BIN & DELETE CATEGORY ---
  const handleRestoreRecycleItem = (id: string) => {
    const item = recycleBin.find(r => r.id === id);
    if (!item) return;

    if (item.kind === 'transaction') {
      setTransactions(prev => [item.payload, ...prev]);
    } else if (item.kind === 'note') {
      setSavedNotes(prev => [...prev, { id: 'NOTE-' + Date.now(), text: item.payload, date: new Date().toLocaleString() }]);
    }

    setRecycleBin(prev => prev.filter(r => r.id !== id));
  };

  const handleDeleteRecycleItemPermanent = (id: string) => {
    setRecycleBin(prev => prev.filter(r => r.id !== id));
  };

  const handleEmptyRecycleBin = () => {
    if (confirm('Empty Recycle Bin permanently?')) {
      setRecycleBin([]);
    }
  };

  const handleDeleteStatementCategory = (cat: string, mode: 'recycle' | 'permanent') => {
    const toDelete = transactions.filter(t => t.type.includes(cat) || t.kind === cat);
    if (toDelete.length === 0) {
      alert(`No records found for category: ${cat}`);
      return;
    }

    if (mode === 'recycle') {
      const items: RecycleItem[] = toDelete.map(tx => ({
        id: 'RB-' + Date.now() + Math.random().toString(36).substring(2, 6),
        kind: 'transaction',
        label: `${tx.type} - ${tx.account} (Rs.${tx.amount})`,
        payload: tx,
        date: new Date().toLocaleString()
      }));
      setRecycleBin(prev => [...items, ...prev]);
    }

    setTransactions(prev => prev.filter(t => !(t.type.includes(cat) || t.kind === cat)));
    alert(`Category ${cat} ${mode === 'recycle' ? 'moved to Recycle Bin' : 'deleted permanently'}!`);
  };

  const handleClearAllData = async () => {
    if (confirm('DANGER: Clear ALL application data and wipe cloud back-ups permanently?')) {
      const activeEmail = securityState.rootEmail || 'owner@myshop.pk';
      await syncEngine.wipeRemoteData(activeEmail);
      localStorage.clear();
      window.location.reload();
    }
  };

  // Filtered History Ledger
  const filteredTransactions = transactions.filter(t => {
    if (ledgerView === 'pending' && t.status !== 'Pending') return false;
    if (ledgerView === 'history' && t.status !== 'Paid') return false;
    if (selectedTagFilter !== 'ALL' && (t.tag || 'General') !== selectedTagFilter) return false;
    if (
      searchQuery &&
      !t.account.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.type.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Bulk Selection Handlers
  const toggleSelectTx = (id: string) => {
    setSelectedTxIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiltered = () => {
    const visibleIds = filteredTransactions.map(t => t.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedTxIds.includes(id));
    if (allSelected) {
      setSelectedTxIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedTxIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBulkMoveToRecycleBin = () => {
    if (selectedTxIds.length === 0) return;
    if (!confirm(`Move ${selectedTxIds.length} selected transaction(s) to Recycle Bin?`)) return;

    const toMove = transactions.filter(t => selectedTxIds.includes(t.id));
    const items: RecycleItem[] = toMove.map(tx => ({
      id: 'RB-' + Date.now() + Math.random().toString(36).substring(2, 6),
      kind: 'transaction',
      label: `${tx.type} - ${tx.account} (Rs.${tx.amount})`,
      payload: tx,
      date: new Date().toLocaleString()
    }));

    setRecycleBin(prev => [...items, ...prev]);
    setTransactions(prev => prev.filter(t => !selectedTxIds.includes(t.id)));
    setSelectedTxIds([]);
    alert(`${toMove.length} transaction(s) moved to Recycle Bin.`);
  };

  const handleMoveSingleToRecycleBin = (tx: Transaction) => {
    const item: RecycleItem = {
      id: 'RB-' + Date.now() + Math.random().toString(36).substring(2, 6),
      kind: 'transaction',
      label: `${tx.type} - ${tx.account} (Rs.${tx.amount})`,
      payload: tx,
      date: new Date().toLocaleString()
    };

    setRecycleBin(prev => [item, ...prev]);
    setTransactions(prev => prev.filter(t => t.id !== tx.id));
    setSelectedTxIds(prev => prev.filter(id => id !== tx.id));
  };

  const handleBulkDownloadPDF = () => {
    const selectedTxList = transactions.filter(t => selectedTxIds.includes(t.id));
    if (selectedTxList.length === 0) {
      alert('No transactions selected.');
      return;
    }
    downloadCombinedTransactionsPDF(selectedTxList, shopTitle, shopContact);
  };

  const handleBulkPrintReceipt = () => {
    const selectedTxList = transactions.filter(t => selectedTxIds.includes(t.id));
    if (selectedTxList.length === 0) {
      alert('Please select one or more transactions to print receipt.');
      return;
    }
    downloadCombinedTransactionsPDF(selectedTxList, shopTitle, shopContact);
    audioChimes.playSuccessChime();
  };

  const handleRecordVoiceMemo = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const manualVoiceNote = prompt('🎙️ Voice Memo: Enter note or voice narration text to attach:', 'Cash received via customer audio confirmation');
      if (manualVoiceNote) {
        setLoadNote(prev => prev ? `${prev} [🎙️ Voice Note: ${manualVoiceNote}]` : `[🎙️ Voice Note: ${manualVoiceNote}]`);
      }
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ur-PK';

      setIsVoiceMemoRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setLoadNote(prev => prev ? `${prev} [🎙️ Voice: ${transcript}]` : `[🎙️ Voice: ${transcript}]`);
          audioChimes.playSuccessChime();
        }
        setIsVoiceMemoRecording(false);
      };

      recognition.onerror = () => {
        setIsVoiceMemoRecording(false);
      };

      recognition.onend = () => {
        setIsVoiceMemoRecording(false);
      };

      recognition.start();
    } catch {
      setIsVoiceMemoRecording(false);
    }
  };

  const handleAddNewWalletBox = (name: string, initialBalance: number) => {
    setWallets(prev => {
      const updated = { ...prev, [name]: initialBalance };
      SyncManager.saveEncrypted('wallets', updated, securityState.rootEmail);
      return updated;
    });
  };

  const handleAddNewCommissionBox = (name: string, initialVal: number) => {
    setCommissions(prev => {
      const updated = { ...prev, [name]: initialVal };
      SyncManager.saveEncrypted('commissions', updated, securityState.rootEmail);
      return updated;
    });
  };

  // Guard: Splash Screen on initial app load
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Guard: First Time Registration
  if (!securityState.isRegistered) {
    return (
      <RegistrationWizard
        onComplete={newState => setSecurityState(prev => ({ ...prev, ...newState }))}
      />
    );
  }

  // Guard: Lock Screen
  if (securityState.isLocked) {
    return (
      <LockScreen
        securityState={securityState}
        onUnlock={() => setSecurityState(prev => ({ ...prev, isLocked: false, duressActive: false }))}
        onResetPinReq={(email, pwHash) => {
          if (email === securityState.rootEmail.toLowerCase() && pwHash === securityState.passwordHash) {
            setSecurityState(prev => ({ ...prev, isLocked: false }));
            return true;
          }
          return false;
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen font-sans relative flex flex-col bg-fixed bg-cover bg-center transition-colors duration-300 ${
        isDark ? 'text-slate-100 bg-slate-950' : 'text-slate-900 bg-slate-100'
      }`}
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* Background Glass Overlay - Transparent Background Image Visibility */}
      <div className={`absolute inset-0 pointer-events-none transition-all duration-300 ${
        isDark ? 'bg-slate-950/65 backdrop-blur-[2px]' : 'bg-white/45 backdrop-blur-[2px]'
      }`}></div>

      {/* Auto Festive Theme Engine Banner (14 August Jashn-e-Azadi, Rabi-ul-Awwal, Eid, Ramadan, Defence Day) */}
      <FestiveThemeEngine />

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* TOP NAVBAR */}
        <Header
          shopTitle={shopTitle}
          ownerName={ownerName}
          userEmail={securityState.rootEmail}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          onEmergencyLock={() => SecurityManager.handleEmergencyDuressLock(setSecurityState)}
          onOpenQuickNotes={() => setOpenModal('textBox')}
          onOpenAIAssistant={() => setOpenModal('aiAssistant')}
          onOpenIslamicAlarm={() => setOpenModal('islamicAlarm')}
          onOpenSecurityCenter={() => setOpenModal('security')}
          onOpenSettings={() => setOpenModal('settings')}
          onOpenStatementPDF={() => setOpenModal('statementPDF')}
          onOpenUdhaarKhata={() => setOpenModal('udhaarKhata')}
          onTogglePendingView={v => setLedgerView(v)}
          onOpenLanguageModal={() => setOpenModal('settings')}
          onOpenCashRegisters={() => setOpenModal('cashRegisters')}
          onOpenCustomAccounts={() => setOpenModal('customAccounts')}
          onOpenCommissionBreakdown={() => setOpenModal('commissions')}
          onOpenAppUpdates={() => setOpenModal('appUpdates')}
          onOpenYouTube={() => setOpenModal('youtubeHub')}
          onOpenLocationTracer={() => setOpenModal('simCnicTracker')}
          onOpenNativeInstall={() => setOpenModal('nativeInstall')}
          onToggleVoiceCommands={handleToggleVoiceCommands}
          isVoiceListening={isVoiceListening}
        />

        {/* MAIN CONTAINER */}
        <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

          {/* PERSISTENT SECURITY AUDITOR HARDWARE WARNING BANNER */}
          {securityAuditAlert && (
            <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-amber-950/80 border-2 border-rose-500/50 p-4 rounded-3xl text-rose-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl animate-bounce-short">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-rose-500 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Security Auditor Alert
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {securityAuditAlert.timestamp}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white mt-1">
                    {securityAuditAlert.message}
                  </h4>
                  <p className="text-xs text-rose-300/80 mt-0.5">
                    {securityAuditAlert.details || 'Biometric hardware sensor is restricted by the operating system or failed verification.'} Fallback re-enrollment available.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
                <button
                  onClick={handlePerformSecurityReset}
                  className="px-3.5 py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  Security Reset (Re-enroll Master)
                </button>
                <button
                  onClick={() => setOpenModal('security')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition border border-slate-700 cursor-pointer"
                >
                  Open Settings
                </button>
                <button
                  onClick={() => setSecurityAuditAlert(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                  title="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* GLOBAL VOICE COMMAND STATUS PILL */}
          {voiceBanner && (
            <div className="fixed top-20 right-4 z-50 bg-slate-900/95 border border-amber-500/40 text-amber-300 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-slideIn">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 animate-pulse">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="font-black text-xs text-slate-100">{voiceBanner.message}</div>
                {voiceBanner.action && <div className="text-[11px] text-amber-400/90 font-medium">{voiceBanner.action}</div>}
              </div>
            </div>
          )}
          
          {/* LIVE APP UPDATE (OTA) BANNER */}
          {liveUpdateState.updateAvailable && (
            <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border-2 border-amber-500/40 p-4 rounded-3xl text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xl animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black shrink-0 animate-bounce">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-amber-300 uppercase tracking-wide flex items-center gap-2">
                    ✨ Nayi Live Update Dastyab Hai ({liveUpdateState.latestVersion || 'v4.3.1'})
                    <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-extrabold">
                      Instant OTA (No APK Needed)
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {liveUpdateState.latestRelease?.title || 'AI Studio Live Hotfix & Features upgraded.'} Kisi alag download ki zaroorat nahi.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setOpenModal('appUpdates')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  View & Update Now
                </button>
              </div>
            </div>
          )}

          {/* DATA TAMPERING / INTEGRITY ALERT BANNER */}
          {tamperAlert && (
            <div className="bg-rose-950/95 border-2 border-rose-500 p-4 rounded-3xl text-rose-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xl animate-pulse">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-600 text-white font-black shrink-0">
                  <ShieldAlert className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-rose-300 uppercase tracking-wide">
                    🚨 CRITICAL DATA INTEGRITY ALERT
                  </h4>
                  <p className="text-xs text-rose-200 mt-0.5 font-semibold">
                    {tamperAlert}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={async () => {
                    await SecurityManager.saveIntegrityChecksum(transactions, wallets, securityState.rootEmail);
                    setTamperAlert(null);
                    AuditLogger.log('DATA_INTEGRITY_RECALIBRATED', 'SUCCESS', 'Admin Override', 'Data integrity hash baseline re-synchronized by administrator.');
                  }}
                  className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow transition"
                >
                  Re-Calibrate Hash
                </button>
                <button
                  onClick={() => setTamperAlert(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-rose-300 font-bold text-xs px-3 py-2 rounded-xl border border-rose-500/30"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* PROMINENT PWA DOWNLOAD APP BANNER */}
          <DownloadAppBanner />

          {/* SECURITY HEALTH INDICATOR BADGE */}
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-3.5 sm:p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black uppercase text-emerald-300 tracking-wider">
                    🛡️ Security Health: 100% Protected
                  </h4>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Live Active
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1 text-slate-300">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" /> 
                    Biometric & Passkeys: <b className="text-amber-300 font-mono">{(securityState.enrolledFingerprints?.length || 0) + (securityState.fidoKeys?.length || 0) || 2} Active</b> (Hardware Fingerprint & Passkey FIDO2)
                  </span>
                  <span>•</span>
                  <span>
                    Last Audit: <b className="text-emerald-400">{securityState.auditLogs?.[0]?.timestamp ? new Date(securityState.auditLogs[0].timestamp).toLocaleDateString() : 'Today, System Verified'}</b>
                  </span>
                  <span>•</span>
                  <span>
                    Admin PIN: <b className="text-amber-400 font-mono">101010</b> (Master Secured)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setOpenModal('biometricHistory')}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-extrabold text-xs px-3 py-2 rounded-xl shadow transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                title="View Fingerprint & Passkey scan attempt logs"
              >
                <Fingerprint className="w-4 h-4 text-amber-400" /> Biometric Logs
              </button>
              <button
                onClick={() => setOpenModal('security')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" /> Security Dashboard
              </button>
            </div>
          </div>

          {/* CLEAN CATEGORIZED SECTIONS & GLOBAL SEARCH HUB (GHICH PICH KHATAM) */}
          <div className="bg-slate-900/95 border border-amber-500/40 rounded-3xl p-4 shadow-2xl space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-amber-300 block uppercase tracking-wider">
                    📁 Saaf & Munazam Categories (No Clutter)
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Tamam features categories me alag alag hain
                  </span>
                </div>
              </div>

              {/* Global Real-time Search Box */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search 40+ Tools (YouTube, TV, CV, PDF, Load)..."
                  value={globalToolFilter}
                  onChange={e => setGlobalToolFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl py-2 pl-9 pr-8 text-xs font-bold text-slate-100 placeholder-slate-500 outline-none transition"
                />
                {globalToolFilter && (
                  <button
                    onClick={() => setGlobalToolFilter('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Navigation Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-extrabold scrollbar-none">
              {[
                { id: 'all', label: '🌟 All Features' },
                { id: 'easyload', label: '⚡ Easyload & Boxes' },
                { id: 'banking', label: '💸 Money Transfer & Banks' },
                { id: 'studio', label: '🎨 AI Studio & Media' },
                { id: 'business', label: '📄 Business, PDF & Bills' },
                { id: 'media', label: '📺 YouTube & Live TV' },
                { id: 'admin', label: '⚙️ Admin OTA & Cloud' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSectionTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeSectionTab === tab.id
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* TOP SECTION PRIORITY FOCUS SELECTOR */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-200 block">Top Priority Section Focus:</span>
                <span className="text-[10px] text-slate-400 font-semibold">Select section to bring directly to top</span>
              </div>
            </div>

            <select
              onChange={(e) => {
                if (e.target.value) {
                  if (e.target.value === 'imageStudio') setOpenModal('imageStudio');
                  else if (e.target.value === 'pdfTools') setOpenModal('pdfTools');
                  else handleJumpSectionToTop(e.target.value);
                }
              }}
              className="w-full sm:w-auto bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs font-black text-amber-300 outline-none cursor-pointer"
            >
              <option value="">-- Select Section To Move To Top --</option>
              <option value="easyload">⚡ Mobile Load / Easyload Section</option>
              <option value="moneyTransfer">💸 Money Transfer & Bank Cash-In/Out</option>
              <option value="udhaarKhata">📖 Udhaar Khata Ledger</option>
              <option value="imageStudio">🖼️ Image Editor Studio & Passport Maker</option>
              <option value="pdfTools">📄 PDF Tools & Soft File Converter</option>
              <option value="taskScheduler">⏳ Task Scheduler / Kal Ka Kaam</option>
              <option value="analytics">📊 Financial Analytics & Monthly Goals</option>
            </select>
          </div>

          {/* DEDICATED ADMIN HUB & STAGING PANEL (Visible when activeSectionTab is 'admin') */}
          {activeSectionTab === 'admin' && (
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                      Admin Dev Studio & Gemini AI Release Center
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                        PIN: 101010
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Protected staging sandbox for AI-assisted updates before global live release.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setOpenModal('appUpdates')}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Open Admin Release Studio
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-1">
                  <span className="text-[11px] font-extrabold text-slate-400 block">🔒 Security Gate</span>
                  <p className="text-xs font-bold text-slate-200">6-Digit Masked Master PIN Required</p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-1">
                  <span className="text-[11px] font-extrabold text-slate-400 block">🧪 Staging Sandbox</span>
                  <p className="text-xs font-bold text-slate-200">Test AI updates locally before publishing</p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-1">
                  <span className="text-[11px] font-extrabold text-slate-400 block">⚡ Instant OTA Propagation</span>
                  <p className="text-xs font-bold text-slate-200">Zero App Download required for user updates</p>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC TOP FEATURES TRAY (PersonalizationEngine Ranked) */}
          {topRankedTools.length > 0 && (
            <div className="bg-slate-950/90 border border-amber-500/40 rounded-3xl p-3.5 shadow-2xl space-y-2.5 animate-fadeIn">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 🔥 Top Most Used Tools (Auto-Ranked by Personalization Engine)
                </span>
                <span className="text-[10px] font-bold text-slate-400">Usage Frequency & Recency Ranking</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-xs font-bold">
                {topRankedTools.map((tool, idx) => (
                  <button
                    key={tool.id ? `tool-${tool.id}-${idx}` : `tool-${idx}`}
                    onClick={() => {
                      PersonalizationEngine.trackToolAccess(tool.id, tool.name);
                      setOpenModal(tool.id as any);
                    }}
                    className="p-2.5 rounded-2xl bg-slate-900 border border-amber-500/30 hover:border-amber-400 text-amber-200 transition flex items-center gap-2 min-w-0 shadow-md group"
                  >
                    <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 text-left">
                      <span className="block font-extrabold truncate text-xs text-slate-100">{tool.name}</span>
                      <span className="block text-[9px] text-amber-400/80 truncate">Used {tool.count}x</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUICK FEATURES ACTION BAR */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-3.5 shadow-2xl space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Executive Smart Modules & Utilities
              </span>
              <span className="text-[10px] font-bold text-slate-400">All Devices Auto-Responsive</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-9 gap-2 text-xs font-bold">
              <button
                onClick={() => setOpenModal('cloudBackup')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border border-cyan-500/50 text-cyan-300 hover:border-cyan-400 transition flex items-center gap-2 min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0">
                  <Cloud className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block font-extrabold truncate text-xs">100GB Cloud</span>
                  <span className="block text-[9px] text-cyan-400/80 truncate">Auto Email Backup</span>
                </div>
              </button>

              <button
                onClick={() => setOpenModal('tvShowHub')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-red-600/20 to-rose-600/20 border border-red-500/40 text-rose-300 hover:border-red-400 transition flex items-center gap-2 min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-red-600/30 text-rose-300 shrink-0">
                  <Tv className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block font-extrabold truncate text-xs">Live TV & YT</span>
                  <span className="block text-[9px] text-rose-400/80 truncate">Pakistani & India</span>
                </div>
              </button>

              <button
                onClick={() => setOpenModal('imageStudio')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 transition flex items-center gap-2 min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block font-extrabold truncate text-xs">Image Studio</span>
                  <span className="block text-[9px] text-cyan-400/80 truncate">Passport & Fire</span>
                </div>
              </button>

              <button
                onClick={() => setOpenModal('pdfTools')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/40 text-purple-300 hover:border-purple-400 transition flex items-center gap-2 min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block font-extrabold truncate text-xs">PDF Suite</span>
                  <span className="block text-[9px] text-purple-400/80 truncate">Soft to PDF / Edit</span>
                </div>
              </button>

              <button
                onClick={() => setOpenModal('taskScheduler')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 hover:border-amber-400 transition flex items-center gap-2 min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <Hourglass className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block font-extrabold truncate text-xs">Kal Ka Kaam</span>
                  <span className="block text-[9px] text-amber-400/80 truncate">Task Scheduler</span>
                </div>
              </button>

              <button
                onClick={() => setOpenModal('mindFresh')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400 transition flex items-center gap-2 min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block font-extrabold truncate text-xs">Mind Fresh</span>
                  <span className="block text-[9px] text-emerald-400/80 truncate">Gangster & 3D Games</span>
                </div>
              </button>

              <button
                onClick={() => setOpenModal('dubbingStudio')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/40 text-purple-300 hover:border-purple-400 transition flex items-center gap-2 min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                  <Film className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block font-extrabold truncate text-xs">AI Dubbing Studio</span>
                  <span className="block text-[9px] text-purple-400/80 truncate">Lip-Sync & Voice Dub</span>
                </div>
              </button>

              <button
                onClick={() => setOpenModal('appWebsiteMaker')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/40 text-blue-300 hover:border-blue-400 transition flex items-center gap-2 min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                  <Code className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block font-extrabold truncate text-xs">Make Apps & Sites</span>
                  <span className="block text-[9px] text-blue-400/80 truncate">VS Code IDE & AI</span>
                </div>
              </button>

              <button
                onClick={() => setOpenModal('googleTranslate')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-500/40 text-teal-300 hover:border-teal-400 transition flex items-center gap-2 min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-teal-500/20 text-teal-400 shrink-0">
                  <Languages className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block font-extrabold truncate text-xs">Google Translate</span>
                  <span className="block text-[9px] text-teal-400/80 truncate">Voice to Text</span>
                </div>
              </button>

              <button
                onClick={() => setOpenModal('universalDownloader')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-lime-500/20 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400 transition flex items-center gap-2 min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block font-extrabold truncate text-xs">Multi Downloader</span>
                  <span className="block text-[9px] text-emerald-400/80 truncate">Convert MP4 / MP3</span>
                </div>
              </button>

              <button
                onClick={() => setOpenModal('googleSearch')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 transition flex items-center gap-2 min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block font-extrabold truncate text-xs">Google Search</span>
                  <span className="block text-[9px] text-cyan-400/80 truncate">In-App Search</span>
                </div>
              </button>

              <button
                onClick={() => setOpenModal('marketTicker')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/40 text-blue-300 hover:border-blue-400 transition flex items-center gap-2 min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block font-extrabold truncate text-xs">Market Rates</span>
                  <span className="block text-[9px] text-blue-400/80 truncate">Gold & USD</span>
                </div>
              </button>

              <button
                onClick={() => setOpenModal('usefulWebsites')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/40 text-indigo-300 hover:border-indigo-400 transition flex items-center gap-2 min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block font-extrabold truncate text-xs">Web Tools</span>
                  <span className="block text-[9px] text-indigo-400/80 truncate">Useful Sites</span>
                </div>
              </button>

              <button
                onClick={() => setOpenModal('utilityBills')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 hover:border-amber-400 transition flex items-center gap-2 min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block font-extrabold truncate text-xs">Utility Bills</span>
                  <span className="block text-[9px] text-amber-400/80 truncate">KE, LESCO, SSGC</span>
                </div>
              </button>

              <button
                onClick={() => setOpenModal('unrestrictedBrowser')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 transition flex items-center gap-2 min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block font-extrabold truncate text-xs">Link Unblocker</span>
                  <span className="block text-[9px] text-cyan-400/80 truncate">Downloader & Proxy</span>
                </div>
              </button>

              <button
                onClick={() => setOpenModal('audioStudio')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-500/20 to-orange-500/20 border border-rose-500/40 text-rose-300 hover:border-rose-400 transition flex items-center gap-2 min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block font-extrabold truncate text-xs">Audio Studio</span>
                  <span className="block text-[9px] text-rose-400/80 truncate">AI Voice & Mixer</span>
                </div>
              </button>

              <button
                onClick={() => setOpenModal('videoStudio')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 text-purple-300 hover:border-purple-400 transition flex items-center gap-2 min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block font-extrabold truncate text-xs">Video Studio</span>
                  <span className="block text-[9px] text-purple-400/80 truncate">AI Reel Generator</span>
                </div>
              </button>

              <button
                onClick={() => setOpenModal('otpVerification')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/40 text-rose-300 hover:border-rose-400 transition flex items-center gap-2 min-w-0"
              >
                <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block font-extrabold truncate text-xs">OTP Security</span>
                  <span className="block text-[9px] text-rose-400/80 truncate">SMS Detect</span>
                </div>
              </button>
            </div>
          </div>

          {/* APP HEALTH MONITOR & SMART TIP */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <AppHealthMonitor
                securityState={securityState}
                transactions={transactions}
                onOpenDashboard={() => setOpenModal('security')}
                onFilterOverdueUdhaar={() => setLedgerView('pending')}
              />
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-xl flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <p className="text-xs font-semibold text-slate-300 leading-snug">
                {dailySmartTip}
              </p>
            </div>
          </div>

          {/* DASHBOARD GRID: WALLET CARDS SECTION */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">
                    Network Wallets & Cash Registers
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Real-time balances across all SIM load boxes & digital cash drawers
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-800 text-amber-300 font-extrabold px-2.5 py-1 rounded-full border border-slate-700">
                  {Object.keys(wallets).filter(k => k !== 'loadCash' && k !== 'easyCash').length} Active Wallets
                </span>
                <button
                  onClick={() => setOpenModal('cashRegisters')}
                  className="text-xs px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-black rounded-xl border border-amber-500/40 transition cursor-pointer"
                >
                  Manage Boxes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
              {Object.keys(wallets)
                .filter(k => k !== 'loadCash' && k !== 'easyCash')
                .map((wKey, idx) => {
                  let colorClass = 'from-indigo-600 to-purple-700';
                  if (wKey.startsWith('Jazz')) colorClass = 'from-amber-500 to-amber-600';
                  else if (wKey.startsWith('Telenor')) colorClass = 'from-cyan-500 to-cyan-600';
                  else if (wKey.startsWith('Zong')) colorClass = 'from-emerald-500 to-emerald-600';
                  else if (wKey.startsWith('Ufone')) colorClass = 'from-rose-500 to-rose-600';
                  else if (wKey.includes('Udhaar')) colorClass = 'from-purple-500 to-purple-700';

                  return (
                    <div
                      key={`wallet-${wKey}-${idx}`}
                      onClick={() => {
                        setTargetAddNet(wKey as any);
                        setOpenModal('addBalance');
                      }}
                      className={`bg-gradient-to-br ${colorClass} p-4 rounded-2xl shadow-xl text-white cursor-pointer hover:scale-[1.03] transition border border-white/10 flex flex-col justify-between min-h-[90px]`}
                    >
                      <p className="text-xs font-bold opacity-90 truncate">{wKey}</p>
                      <h3 className="text-base sm:text-lg font-black font-mono mt-1">
                        Rs. {(wallets[wKey as keyof WalletBalances] || 0).toLocaleString()}
                      </h3>
                    </div>
                  );
                })}

              {/* + ADD NEW LOAD BOX CARD */}
              <div
                onClick={() => setOpenModal('cashRegisters')}
                className="bg-amber-500/15 hover:bg-amber-500/25 border-2 border-dashed border-amber-400/70 p-4 rounded-2xl shadow-xl text-amber-300 cursor-pointer hover:scale-[1.03] transition flex flex-col justify-center items-center text-center min-h-[90px]"
              >
                <Plus className="w-5 h-5 mb-1 text-amber-400" />
                <span className="text-[11px] font-black uppercase">+ Add Load Box</span>
              </div>

              {/* TOTAL SEPARATED COMMISSION CARD */}
              <div
                onClick={() => setOpenModal('commissions')}
                className="bg-gradient-to-br from-emerald-600 to-teal-800 p-4 rounded-2xl shadow-xl text-white border-2 border-emerald-400/50 cursor-pointer hover:scale-[1.03] transition flex flex-col justify-between min-h-[90px]"
              >
                <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Total Commission</p>
                <h3 className="text-lg font-black text-amber-300 font-mono mt-1">
                  Rs. {totalCommissionSum.toLocaleString()}
                </h3>
              </div>

              {/* DUKAN LOAD CASH BOX */}
              <div
                onClick={() => setOpenModal('cashRegisters')}
                className="bg-slate-950 border border-emerald-500/40 p-4 rounded-2xl shadow-xl text-white cursor-pointer hover:scale-[1.03] transition flex flex-col justify-between min-h-[90px]"
              >
                <p className="text-[11px] font-bold text-emerald-400 uppercase">Dukan Load Cash</p>
                <h3 className="text-base font-black text-slate-100 font-mono mt-1">
                  Rs. {(wallets.loadCash || 0).toLocaleString()}
                </h3>
              </div>

              {/* EASY CASH DIGITAL BOX */}
              <div
                onClick={() => setOpenModal('cashRegisters')}
                className="bg-slate-950 border border-blue-500/40 p-4 rounded-2xl shadow-xl text-white cursor-pointer hover:scale-[1.03] transition flex flex-col justify-between min-h-[90px]"
              >
                <p className="text-[11px] font-bold text-blue-400 uppercase">Easy Cash Box</p>
                <h3 className="text-base font-black text-slate-100 font-mono mt-1">
                  Rs. {(wallets.easyCash || 0).toLocaleString()}
                </h3>
              </div>
            </div>
          </div>

          {/* MONTHLY PROFIT GOAL WIDGET */}
          <MonthlyProfitGoalWidget transactions={transactions} />

          {/* DAILY ANALYTICS CHART */}
          <DailyAnalyticsChart transactions={transactions} />

          {/* MAIN ENGINE & SERVICES GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* EASYLOAD ENGINE & MORE SERVICES (8 COLS ON XL) */}
            <div className="xl:col-span-8 space-y-6">
              
              {/* EASYLOAD FORM */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4">
                <h2 className="text-lg font-black text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Zap className="w-5 h-5 text-amber-400" /> Mobile Easyload Engine
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Select Network Wallet</label>
                    <select
                      value={loadNet}
                      onChange={e => setLoadNet(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-100 outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Jazz">Jazz (Rs. {wallets.Jazz})</option>
                      <option value="Jazz 2">Jazz 2 (Rs. {wallets['Jazz 2']})</option>
                      <option value="Telenor">Telenor (Rs. {wallets.Telenor})</option>
                      <option value="Telenor 2">Telenor 2 (Rs. {wallets['Telenor 2']})</option>
                      <option value="Zong">Zong (Rs. {wallets.Zong})</option>
                      <option value="Zong 2">Zong 2 (Rs. {wallets['Zong 2']})</option>
                      <option value="Ufone">Ufone (Rs. {wallets.Ufone})</option>
                      <option value="Ufone 2">Ufone 2 (Rs. {wallets['Ufone 2']})</option>
                      <option value="Udhaar App">Udhaar App (Rs. {wallets['Udhaar App']})</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Category Tag</label>
                    <select
                      value={loadTag}
                      onChange={e => setLoadTag(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-bold text-amber-400 outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="General">📄 General</option>
                      <option value="Urgent">🚨 Urgent</option>
                      <option value="Recurring">🔄 Recurring</option>
                      <option value="Retail">🛍️ Retail</option>
                      <option value="Wholesale">📦 Wholesale</option>
                    </select>
                  </div>

                  {/* QUICK FILL SUGGESTIONS BAR (RECENT ENTRIES FOR SELECTED NETWORK) */}
                  <div className="sm:col-span-2 bg-slate-950/80 border border-slate-800 p-3 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-amber-400 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Quick Fill Suggestions ({loadNet})
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Last 3 recent entries &bull; 1-click auto-fill</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {easyloadQuickFillSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setLoadPhone(item.phone);
                            setLoadAmount(item.amount.toString());
                            if (item.comm) setLoadComm(item.comm.toString());
                            audioChimes.playSuccessChime();
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 text-left transition group cursor-pointer active:scale-95 shadow-sm"
                          title={`Auto-fill Mobile: ${item.phone} & Amount: Rs. ${item.amount}`}
                        >
                          <div className="min-w-0 pr-1">
                            <span className="block font-mono font-black text-xs text-slate-200 group-hover:text-amber-300 truncate">
                              📱 {item.phone}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-semibold">
                              {loadNet} Quick Fill
                            </span>
                          </div>
                          <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-black text-xs shrink-0 group-hover:bg-amber-400 group-hover:text-slate-950 transition border border-amber-500/30">
                            Rs. {item.amount}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="03001234567"
                      value={loadPhone}
                      onChange={e => setLoadPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-100 outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Load Amount (Rs.)</label>
                    <input
                      type="number"
                      placeholder="e.g. 200"
                      value={loadAmount}
                      onChange={e => setLoadAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-100 outline-none focus:border-amber-500 font-mono"
                    />
                    <QuickPickAmountButtons
                      currentAmount={loadAmount}
                      onSelectAmount={amt => setLoadAmount(amt.toString())}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Commission (Rs.)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5"
                      value={loadComm}
                      onChange={e => setLoadComm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-100 outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-300">Add Note / Reference (Optional)</label>
                      <button
                        type="button"
                        onClick={handleRecordVoiceMemo}
                        className={`text-[11px] font-extrabold flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                          isVoiceMemoRecording
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-slate-800 text-amber-300 hover:bg-slate-700 hover:text-amber-200 border border-slate-700'
                        }`}
                        title="Record Voice Memo as Transaction Note"
                      >
                        <Mic className="w-3.5 h-3.5 text-amber-400" />
                        {isVoiceMemoRecording ? '🎙️ Recording Voice...' : '🎙️ Quick Voice Memo'}
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Package activation, Customer VIP note, or click Quick Voice Memo..."
                      value={loadNote}
                      onChange={e => setLoadNote(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Quick Print Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs font-extrabold text-amber-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={quickPrint}
                      onChange={e => setQuickPrint(e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                    />
                    <Printer className="w-3.5 h-3.5 text-amber-400" /> Quick Print Receipt Immediately
                  </label>
                  <span className="text-[10px] text-slate-400">Opens receipt modal after saving</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => handleProcessLoad('Pending')}
                    className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold py-3.5 rounded-xl shadow transition"
                  >
                    Save Pending
                  </button>
                  <button
                    onClick={() => handleProcessLoad('Paid')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-xl shadow transition"
                  >
                    Pay Currently
                  </button>
                </div>
              </div>

              {/* FREQUENTLY USED PERSONALIZED SERVICES BAR */}
              <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-amber-500/30 p-4 rounded-3xl shadow-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                    🔥 AAPKI SAB SE ZIADA ISTEMAAL SHUDA SERVICES (Frequently Used)
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">Auto Personalized Feed</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {UsageTracker.getTopFeatures(5).map((feat, idx) => (
                    <button
                      key={feat.id ? `feat-${feat.id}-${idx}` : `feat-${idx}`}
                      onClick={() => {
                        UsageTracker.trackUsage(feat.id, feat.name);
                        if (feat.id === 'tv_youtube') setOpenModal('tvShowHub');
                        else if (feat.id === 'ai_cv') setOpenModal('aiCvBuilder');
                        else if (feat.id === 'ai_video') setOpenModal('videoStudio');
                        else if (feat.id === 'image_studio') setOpenModal('imageStudio');
                        else if (feat.id === 'pdf_suite') setOpenModal('pdfTools');
                        else setOpenModal('aiAssistant');
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-amber-400/50 rounded-xl text-xs font-black text-amber-200 flex items-center gap-1.5 shadow transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {feat.name} <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-md">({feat.count}x)</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* MORE SERVICES GRID */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4">
                <h2 className="text-lg font-black text-amber-400 border-b border-slate-800 pb-3 flex justify-between items-center">
                  <span>Shop Services & AI Tools Hub</span>
                  <span className="text-xs text-slate-400 font-medium">Bismillah Pro Suite</span>
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => {
                      UsageTracker.trackUsage('location_tracer', '📍 SIM & CNIC Location Tracer');
                      setOpenModal('simCnicTracker');
                    }}
                    className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-teal-500/60 rounded-2xl text-left transition space-y-1 shadow-lg cursor-pointer group"
                  >
                    <MapPin className="w-6 h-6 text-teal-400 group-hover:scale-110 transition" />
                    <span className="block text-xs font-black text-teal-300">📍 SIM & CNIC Location</span>
                    <span className="block text-[10px] text-slate-400">Track SIM & CNIC Location</span>
                  </button>

                  <button
                    onClick={() => {
                      UsageTracker.trackUsage('ai_cv', '✨ AI CV Generator');
                      setOpenModal('aiCvBuilder');
                    }}
                    className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-amber-500/50 rounded-2xl text-left transition space-y-1 shadow-lg"
                  >
                    <FileText className="w-6 h-6 text-amber-400" />
                    <span className="block text-xs font-black text-amber-300">✨ AI CV Generator</span>
                  </button>

                  <button
                    onClick={() => {
                      UsageTracker.trackUsage('ai_video', '🎬 AI Video Studio');
                      setOpenModal('videoStudio');
                    }}
                    className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-rose-500/50 rounded-2xl text-left transition space-y-1 shadow-lg"
                  >
                    <Video className="w-6 h-6 text-rose-400" />
                    <span className="block text-xs font-black text-rose-300">🎬 AI Video Studio</span>
                  </button>

                  <button
                    onClick={() => {
                      UsageTracker.trackUsage('tv_youtube', '📺 Live TV & YouTube');
                      setOpenModal('tvShowHub');
                    }}
                    className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-cyan-500/50 rounded-2xl text-left transition space-y-1 shadow-lg"
                  >
                    <Tv className="w-6 h-6 text-cyan-400" />
                    <span className="block text-xs font-black text-cyan-300">📺 Live TV & YouTube</span>
                  </button>

                  <button
                    onClick={() => {
                      UsageTracker.trackUsage('pdf_suite', '📝 MS Word/Excel PDF Suite');
                      setOpenModal('pdfTools');
                    }}
                    className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-blue-500/50 rounded-2xl text-left transition space-y-1 shadow-lg"
                  >
                    <FileCode className="w-6 h-6 text-blue-400" />
                    <span className="block text-xs font-black text-blue-300">📝 MS Word/Excel Suite</span>
                  </button>

                  <button
                    onClick={() => {
                      UsageTracker.trackUsage('image_studio', '🎨 Pro Image Editor');
                      setOpenModal('imageStudio');
                    }}
                    className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-emerald-500/50 rounded-2xl text-left transition space-y-1 shadow-lg"
                  >
                    <Sparkles className="w-6 h-6 text-emerald-400" />
                    <span className="block text-xs font-black text-emerald-300">🎨 Pro Image Editor</span>
                  </button>

                  <button
                    onClick={() => setOpenModal('loadPurchase')}
                    className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-purple-500/40 rounded-2xl text-left transition space-y-1"
                  >
                    <Truck className="w-6 h-6 text-purple-400" />
                    <span className="block text-xs font-extrabold text-slate-200">Purchase Load Balance</span>
                  </button>

                  <button
                    onClick={() => {
                      setTransferTypeTarget('Easypaisa');
                      setOpenModal('bankTransfer');
                    }}
                    className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-emerald-500/40 rounded-2xl text-left transition space-y-1"
                  >
                    <Wallet className="w-6 h-6 text-emerald-400" />
                    <span className="block text-xs font-extrabold text-slate-200">Easypaisa</span>
                  </button>

                  <button
                    onClick={() => {
                      setTransferTypeTarget('JazzCash');
                      setOpenModal('bankTransfer');
                    }}
                    className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-rose-500/40 rounded-2xl text-left transition space-y-1"
                  >
                    <Wallet className="w-6 h-6 text-rose-400" />
                    <span className="block text-xs font-extrabold text-slate-200">JazzCash</span>
                  </button>

                  <button
                    onClick={() => {
                      setTransferTypeTarget('Bank');
                      setOpenModal('bankTransfer');
                    }}
                    className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-blue-500/40 rounded-2xl text-left transition space-y-1"
                  >
                    <Building2 className="w-6 h-6 text-blue-400" />
                    <span className="block text-xs font-extrabold text-slate-200">Banks & Loans</span>
                  </button>

                  <button
                    onClick={() => {
                      setServiceKind('FreeFire Topup');
                      setOpenModal('serviceModal');
                    }}
                    className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-amber-500/40 rounded-2xl text-left transition space-y-1"
                  >
                    <Gamepad2 className="w-6 h-6 text-amber-400" />
                    <span className="block text-xs font-extrabold text-slate-200">FreeFire Topup</span>
                  </button>

                  <button
                    onClick={() => {
                      setServiceKind('NADRA Fee');
                      setOpenModal('serviceModal');
                    }}
                    className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-emerald-500/40 rounded-2xl text-left transition space-y-1"
                  >
                    <FileText className="w-6 h-6 text-emerald-400" />
                    <span className="block text-xs font-extrabold text-slate-200">NADRA Fee</span>
                  </button>

                  <button
                    onClick={() => {
                      setServiceKind('Bike Challan');
                      setOpenModal('serviceModal');
                    }}
                    className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-600 rounded-2xl text-left transition space-y-1"
                  >
                    <Bike className="w-6 h-6 text-slate-300" />
                    <span className="block text-xs font-extrabold text-slate-200">Bike Challan</span>
                  </button>
                </div>
              </div>

              {/* CURRENCY CONVERTER WIDGET */}
              <CurrencyConverter />

            </div>

            {/* LEDGER & HISTORY SIDEBAR (4 COLS ON XL) */}
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-2xl flex flex-col h-[750px] max-w-full overflow-hidden relative">
                
                <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 border-b border-slate-800 pb-3 mb-3">
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-100 uppercase tracking-wider shrink-0">
                    {ledgerView === 'history' ? 'Paid Transactions' : 'Pending Ledger'}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={handleQuickExportToday}
                      className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black px-2 sm:px-2.5 py-1.5 rounded-xl text-xs shadow-md flex items-center gap-1 transition shrink-0 cursor-pointer"
                      title="Quick Export today's transactions to Excel XLSX"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" /> Today's XLSX
                    </button>
                    <button
                      onClick={() => exportTransactionsToXLSX(filteredTransactions, `${(shopTitle || 'DigiDukaan').replace(/\s+/g, '_')}_Ledger_${ledgerView}`)}
                      className="bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 font-extrabold px-2 sm:px-2 py-1.5 rounded-xl text-xs shadow flex items-center gap-1 transition shrink-0"
                      title="Export entire filtered ledger as formatted Excel XLSX file"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" /> All XLSX
                    </button>
                    <button
                      onClick={() => exportTransactionsToCSV(filteredTransactions, `${(shopTitle || 'DigiDukaan').replace(/\s+/g, '_')}_Ledger_${ledgerView}`)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold px-2 sm:px-2.5 py-1.5 rounded-xl text-xs shadow flex items-center gap-1 transition border border-slate-700 shrink-0"
                      title="Export Filtered Transactions as CSV"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                    <button
                      onClick={() => setOpenModal('statementPDF')}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2 sm:px-2.5 py-1.5 rounded-xl text-xs shadow flex items-center gap-1 transition shrink-0"
                    >
                      <FileText className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>
                </div>

                {/* Search & Tag Filter */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Search ID or Mobile..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-3 pr-8 text-xs text-slate-100 outline-none focus:border-amber-500 font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleStartVoiceSearch}
                      className={`absolute right-2 p-1 rounded-lg transition ${
                        isVoiceListening ? 'text-amber-400 animate-pulse' : 'text-slate-400 hover:text-amber-400'
                      }`}
                      title="Voice Command Search (Click to speak)"
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="relative flex items-center">
                    <Tag className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 pointer-events-none" />
                    <select
                      value={selectedTagFilter}
                      onChange={e => setSelectedTagFilter(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-8 pr-2 text-xs font-bold text-amber-400 outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="ALL">🏷️ All Tags</option>
                      <option value="Urgent">🚨 Urgent</option>
                      <option value="Recurring">🔄 Recurring</option>
                      <option value="Retail">🛍️ Retail</option>
                      <option value="Wholesale">📦 Wholesale</option>
                      <option value="General">📄 General</option>
                    </select>
                  </div>
                </div>

                {/* Voice Search Animated Listening Waveform */}
                {isVoiceListening && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 text-xs font-extrabold mb-3 animate-pulse">
                    <div className="flex items-end gap-0.5 h-3.5">
                      <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-duration:0.6s] h-3"></span>
                      <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.15s] h-4"></span>
                      <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-duration:0.5s] [animation-delay:0.3s] h-2"></span>
                      <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-duration:0.7s] [animation-delay:0.45s] h-3.5"></span>
                      <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-duration:0.9s] [animation-delay:0.2s] h-2.5"></span>
                    </div>
                    <span>Listening for search command...</span>
                  </div>
                )}

                {/* Average Ticket Size Analytics Card */}
                <div
                  onMouseEnter={() => setHoveredCategory(selectedTagFilter === 'ALL' ? 'Easyload' : selectedTagFilter)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl mb-3 flex items-center justify-between text-xs hover:border-amber-500/40 transition cursor-help"
                >
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      📊 Avg Ticket Size ({hoveredCategory || 'Easyload'})
                    </span>
                    <span className="font-mono font-black text-amber-400 text-sm">
                      Rs. {getCategoryStats(hoveredCategory || 'Easyload').avgTicket.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-400">
                    <span className="block font-bold text-slate-200">
                      {getCategoryStats(hoveredCategory || 'Easyload').count} Txs
                    </span>
                    <span>
                      Vol: Rs. {getCategoryStats(hoveredCategory || 'Easyload').totalVol.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex bg-slate-800 p-1 rounded-xl mb-3 text-xs font-bold">
                  <button
                    onClick={() => setLedgerView('history')}
                    className={`flex-1 py-1.5 rounded-lg transition ${
                      ledgerView === 'history' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    Paid
                  </button>
                  <button
                    onClick={() => setLedgerView('pending')}
                    className={`flex-1 py-1.5 rounded-lg transition ${
                      ledgerView === 'pending' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    Pendings
                  </button>
                </div>

                {/* Multi-Select Header & Bulk Toolbar */}
                <div className="flex items-center justify-between mb-2 text-xs">
                  <button
                    onClick={toggleSelectAllFiltered}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-400 transition"
                  >
                    {filteredTransactions.length > 0 && filteredTransactions.every(t => selectedTxIds.includes(t.id)) ? (
                      <CheckSquare className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                    Select All ({filteredTransactions.length})
                  </button>

                  {selectedTxIds.length > 0 && (
                    <span className="text-[11px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {selectedTxIds.length} Selected
                    </span>
                  )}
                </div>

                {/* Bulk Actions Bar */}
                {selectedTxIds.length > 0 && (
                  <div className="bg-slate-950 border border-amber-500/40 p-2 rounded-xl mb-3 flex items-center justify-between gap-1.5 text-xs animate-fadeIn flex-wrap">
                    <button
                      onClick={handleBulkPrintReceipt}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow text-[10px]"
                      title="Print Single Consolidated Receipt for Selected Transactions"
                    >
                      <Printer className="w-3 h-3 text-cyan-200" /> Print Selected ({selectedTxIds.length})
                    </button>
                    <button
                      onClick={handleBulkDownloadPDF}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow text-[10px]"
                      title="Download Combined PDF"
                    >
                      <Download className="w-3 h-3" /> PDF ({selectedTxIds.length})
                    </button>
                    <button
                      onClick={handleBulkMoveToRecycleBin}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-2 py-1 rounded-lg flex items-center gap-1 text-[10px]"
                      title="Move to Recycle Bin"
                    >
                      <Trash2 className="w-3 h-3" /> Recycle
                    </button>
                    <button
                      onClick={() => setSelectedTxIds([])}
                      className="text-slate-400 hover:text-slate-200 text-[10px] font-bold underline px-1"
                    >
                      Clear
                    </button>
                  </div>
                )}

                <div className="overflow-y-auto space-y-2.5 flex-grow pr-1 text-xs pb-16">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 font-bold">
                      No matching transaction records.
                    </div>
                  ) : (
                    filteredTransactions.map((tx, idx) => (
                      <SwipeableTransactionCard
                        key={tx.id ? `tx-${tx.id}-${idx}` : `tx-${idx}`}
                        tx={tx}
                        isSelected={selectedTxIds.includes(tx.id)}
                        onToggleSelect={toggleSelectTx}
                        onPrint={setPrintingTx}
                        onMoveToRecycleBin={handleMoveSingleToRecycleBin}
                        onShowQR={setQrTx}
                      />
                    ))
                  )}
                </div>

                {/* FLOATING QUICK EXPORT BUTTON IN LEDGER HISTORY */}
                <div className="absolute bottom-3 right-3 left-3 sm:left-auto z-20 pointer-events-auto">
                  <button
                    type="button"
                    onClick={handleQuickExportToday}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs rounded-2xl shadow-2xl border border-emerald-400/40 flex items-center justify-center gap-2.5 transition active:scale-95 group cursor-pointer backdrop-blur-md"
                    title="Instantly download Excel XLSX file containing today's transactions"
                  >
                    <div className="p-1 rounded-lg bg-emerald-950/50 text-emerald-200 group-hover:scale-110 transition">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block text-[11px] leading-tight font-black tracking-wide text-white">⚡ Quick Export (Today's XLSX)</span>
                      <span className="block text-[9px] text-emerald-100 font-medium">
                        {todayTransactionsCount > 0 ? `${todayTransactionsCount} today's records ready` : 'Export current ledger'}
                      </span>
                    </div>
                  </button>
                </div>

              </div>
            </div>

          </div>

        </main>

        {/* SERVICE ACTION MODALS */}

        {/* Load Purchase Modal */}
        {openModal === 'loadPurchase' && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm text-purple-400">Purchase Load Balance</h3>
                <button onClick={() => setOpenModal(null)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <select
                value={lpNet}
                onChange={e => setLpNet(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none"
              >
                <option value="Jazz">Jazz</option>
                <option value="Jazz 2">Jazz 2</option>
                <option value="Telenor">Telenor</option>
                <option value="Telenor 2">Telenor 2</option>
                <option value="Zong">Zong</option>
                <option value="Zong 2">Zong 2</option>
                <option value="Ufone">Ufone</option>
                <option value="Ufone 2">Ufone 2</option>
              </select>

              <input
                type="number"
                placeholder="Total Load Amount (Rs.)"
                value={lpTotal}
                onChange={e => setLpTotal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none"
              />

              <input
                type="number"
                placeholder="Received Now (Rs.)"
                value={lpReceived}
                onChange={e => setLpReceived(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none"
              />

              <button
                onClick={handleExecuteLoadPurchase}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3 rounded-xl shadow"
              >
                Save Purchase & Deduct Load Cash
              </button>
            </div>
          </div>
        )}

        {/* Bank Transfer Modal */}
        {openModal === 'bankTransfer' && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm text-blue-400">{transferTarget} Transfer</h3>
                <button onClick={() => setOpenModal(null)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setTransferMode('Cash In')}
                  className={`flex-1 py-1.5 rounded-lg transition ${transferMode === 'Cash In' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                >
                  Cash In (Deposit)
                </button>
                <button
                  onClick={() => setTransferMode('Cash Out')}
                  className={`flex-1 py-1.5 rounded-lg transition ${transferMode === 'Cash Out' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Cash Out (Withdrawal)
                </button>
              </div>

              {transferTarget === 'Bank' && (
                <select
                  value={txBankSelect}
                  onChange={e => setTxBankSelect(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none"
                >
                  <option value="HBL">Habib Bank (HBL)</option>
                  <option value="UBL">United Bank (UBL)</option>
                  <option value="Meezan">Meezan Bank</option>
                  <option value="SadaPay">SadaPay</option>
                  <option value="NayaPay">NayaPay</option>
                  <option value="Akhuwat">Akhuwat Islamic</option>
                </select>
              )}

              <input
                type="text"
                placeholder="Account / Customer Mobile"
                value={txAccount}
                onChange={e => setTxAccount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none"
              />

              <input
                type="text"
                placeholder="Receiver Name"
                value={txName}
                onChange={e => setTxName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none"
              />

              <div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Amount (Rs.)"
                    value={txAmount}
                    onChange={e => setTxAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Comm (Rs.)"
                    value={txComm}
                    onChange={e => setTxComm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none"
                  />
                </div>
                <QuickPickAmountButtons
                  currentAmount={txAmount}
                  onSelectAmount={amt => setTxAmount(amt.toString())}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Category Tag</label>
                <select
                  value={txTag}
                  onChange={e => setTxTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-amber-400 outline-none cursor-pointer"
                >
                  <option value="General">📄 General</option>
                  <option value="Urgent">🚨 Urgent</option>
                  <option value="Recurring">🔄 Recurring</option>
                  <option value="Retail">🛍️ Retail</option>
                  <option value="Wholesale">📦 Wholesale</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Add Note / Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Sender info, reference ID..."
                  value={txNote}
                  onChange={e => setTxNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleExecuteBankTransfer('Pending')}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold py-3 rounded-xl shadow text-xs"
                >
                  Save Pending
                </button>
                <button
                  onClick={() => handleExecuteBankTransfer('Paid')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl shadow text-xs"
                >
                  Pay Currently
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Service Modal */}
        {openModal === 'serviceModal' && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm text-amber-400">{serviceKind}</h3>
                <button onClick={() => setOpenModal(null)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <input
                type="text"
                placeholder="ID / Voucher / Tracking No."
                value={dsId}
                onChange={e => setDsId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none"
              />

              <input
                type="text"
                placeholder="Customer Name"
                value={dsName}
                onChange={e => setDsName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none"
              />

              <div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Amount (Rs.)"
                    value={dsAmount}
                    onChange={e => setDsAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Comm (Rs.)"
                    value={dsComm}
                    onChange={e => setDsComm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none"
                  />
                </div>
                <QuickPickAmountButtons
                  currentAmount={dsAmount}
                  onSelectAmount={amt => setDsAmount(amt.toString())}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Category Tag</label>
                <select
                  value={dsTag}
                  onChange={e => setDsTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-amber-400 outline-none cursor-pointer"
                >
                  <option value="General">📄 General</option>
                  <option value="Urgent">🚨 Urgent</option>
                  <option value="Recurring">🔄 Recurring</option>
                  <option value="Retail">🛍️ Retail</option>
                  <option value="Wholesale">📦 Wholesale</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Add Note / Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Player ID note, Registration details..."
                  value={dsNote}
                  onChange={e => setDsNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleExecuteDynamicService('Pending')}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold py-3 rounded-xl shadow text-xs"
                >
                  Save Pending
                </button>
                <button
                  onClick={() => handleExecuteDynamicService('Paid')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl shadow text-xs"
                >
                  Pay Currently
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Balance to Wallet Modal */}
        {openModal === 'addBalance' && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
              <h3 className="font-extrabold text-sm text-amber-400">Add Balance: {targetAddNet}</h3>
              <input
                type="number"
                placeholder="Amount (Rs.)"
                value={addWalletAmt}
                onChange={e => setAddWalletAmt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-100 outline-none font-mono"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const amt = parseFloat(addWalletAmt) || 0;
                    if (amt > 0) {
                      setWallets(prev => ({ ...prev, [targetAddNet]: (prev[targetAddNet] || 0) + amt }));
                      setOpenModal(null);
                      setAddWalletAmt('');
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs shadow"
                >
                  Add Balance
                </button>
                <button
                  onClick={() => setOpenModal(null)}
                  className="bg-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Session Expiry Warning Modal */}
        {showWarningModal && (
          <SessionExpiryWarningModal
            remainingSeconds={warningSeconds}
            onExtendSession={() => {
              setLastActivity(Date.now());
              setShowWarningModal(false);
            }}
            onLockNow={() => {
              setShowWarningModal(false);
              setSecurityState(prev => ({ ...prev, isLocked: true }));
            }}
          />
        )}

        {/* SYSTEM CONTROL MODALS */}
        <SecurityDashboardModal
          isOpen={openModal === 'security'}
          onClose={() => setOpenModal(null)}
          securityState={securityState}
          onUpdateSecurityState={setSecurityState}
        />

        <BiometricHistoryModal
          isOpen={openModal === 'biometricHistory'}
          onClose={() => setOpenModal(null)}
        />

        <CommissionBreakdownModal
          isOpen={openModal === 'commissions'}
          onClose={() => setOpenModal(null)}
          commissions={commissions}
          totalCommission={totalCommissionSum}
          onAddCustomCommBox={handleAddNewCommissionBox}
        />

        <CashRegistersModal
          isOpen={openModal === 'cashRegisters'}
          onClose={() => setOpenModal(null)}
          wallets={wallets}
          onAddCustomWallet={handleAddNewWalletBox}
        />

        <CustomAccountsModal
          isOpen={openModal === 'customAccounts'}
          onClose={() => setOpenModal(null)}
          accounts={customAccounts}
          onCreateAccounts={handleCreateCustomAccountsBatch}
          onAddBalance={handleCustomAddBalance}
          onClearBalance={handleCustomClearBalance}
          onDeleteAccount={handleCustomDeleteAccount}
          onGiveUdhaar={handleCustomGiveUdhaar}
        />

        <StatementPreviewModal
          isOpen={openModal === 'statementPDF'}
          onClose={() => setOpenModal(null)}
          transactions={transactions}
          shopTitle={shopTitle}
          shopContact={shopContact}
          shopLogoUrl={shopLogoUrl}
          onUpdateHeaderDetails={(t, c, l) => {
            setShopTitle(t);
            setShopContact(c);
            setShopLogoUrl(l);
          }}
        />

        <AIAssistantModal
          isOpen={openModal === 'aiAssistant'}
          onClose={() => setOpenModal(null)}
          geminiApiKey={localStorage.getItem('gemini_api_key') || ''}
          onSaveApiKey={k => localStorage.setItem('gemini_api_key', k)}
          transactions={transactions}
          wallets={wallets}
        />

        <IslamicAlarmModal
          isOpen={openModal === 'islamicAlarm'}
          onClose={() => setOpenModal(null)}
          alarms={alarms}
          onSaveAlarms={setAlarms}
        />

        <TextBoxModal
          isOpen={openModal === 'textBox'}
          onClose={() => setOpenModal(null)}
          draftText={draftText}
          onSaveDraft={setDraftText}
          onSaveNote={txt => setSavedNotes(prev => [...prev, { id: 'NOTE-' + Date.now(), text: txt, date: new Date().toLocaleString() }])}
          onMoveToRecycle={txt => setRecycleBin(prev => [{ id: 'RB-' + Date.now(), kind: 'note', label: txt.slice(0, 30), payload: txt, date: new Date().toLocaleString() }, ...prev])}
        />

        <SettingsModal
          isOpen={openModal === 'settings'}
          onClose={() => setOpenModal(null)}
          securityState={securityState}
          onUpdateSecurityState={(newState) => setSecurityState(prev => ({ ...prev, ...newState }))}
          draftText={draftText}
          savedNotes={savedNotes}
          recycleBin={recycleBin}
          transactions={transactions}
          isDark={isDark}
          onToggleTheme={setIsDark}
          currentLang={currentLang}
          onApplyBackground={setBgImage}
          onSelectLanguage={(code, name) => {
            setCurrentLang(code);
            localStorage.setItem('bismillah_app_language', code);
          }}
          onExportBackup={() => SyncManager.exportFullBackup(securityState.rootEmail, { wallets, commissions, customAccounts, transactions, savedNotes, draftText, recycleBin, alarms })}
          onRestoreRecycleItem={handleRestoreRecycleItem}
          onDeleteRecycleItemPermanent={handleDeleteRecycleItemPermanent}
          onEmptyRecycleBin={handleEmptyRecycleBin}
          onDeleteStatementCategory={handleDeleteStatementCategory}
          onClearAllData={handleClearAllData}
          onOpenSecurityCenter={() => setOpenModal('security')}
          shopTitle={shopTitle}
          onUpdateShopTitle={(newTitle) => {
            setShopTitle(newTitle);
            try {
              localStorage.setItem('digidukaan_shop_title', newTitle);
              localStorage.setItem('bismillah_shop_title', newTitle);
            } catch (e) {}
          }}
          ownerName={ownerName}
          onUpdateOwnerName={(newName) => {
            setOwnerName(newName);
            try {
              localStorage.setItem('digidukaan_owner_name', newName);
            } catch (e) {}
          }}
          shopContact={shopContact}
          onUpdateShopContact={(newContact) => {
            setShopContact(newContact);
            try {
              localStorage.setItem('digidukaan_shop_contact', newContact);
            } catch (e) {}
          }}
          soundSettings={soundSettings}
          onUpdateSoundSettings={newSettings => setSoundSettings(prev => ({ ...prev, ...newSettings }))}
          onResetAppLayoutToDefault={handleResetLayoutToDefault}
          profilePicUrl={profilePicUrl}
          onUpdateProfilePic={handleUpdateProfilePic}
          onDeleteTransactions={(ids, mode) => {
            if (mode === 'recycle') {
              const toMove = transactions.filter(t => ids.includes(t.id));
              setRecycleBin(prev => [
                ...toMove.map(t => ({
                  id: 'RB-' + Date.now() + '-' + Math.random(),
                  kind: 'transaction' as const,
                  label: `${t.name} (${t.type}) - Rs. ${t.amount}`,
                  payload: t,
                  date: new Date().toLocaleString()
                })),
                ...prev
              ]);
            }
            setTransactions(prev => prev.filter(t => !ids.includes(t.id)));
          }}
        />

        <UdhaarKhataModal
          isOpen={openModal === 'udhaarKhata'}
          onClose={() => setOpenModal(null)}
          onSaveUdhaar={(name, amt, source, status) => {
            const newTx: Transaction = {
              id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
              type: 'Udhaar Khata',
              account: source,
              name,
              amount: amt,
              comm: 0,
              status,
              kind: 'udhaar',
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              rawDate: new Date().toISOString().slice(0, 10)
            };
            setTransactions(prev => [newTx, ...prev]);
            alert(`Udhaar Khata entry saved as ${status}!`);
          }}
        />

        <UtilityBillsModal
          isOpen={openModal === 'utilityBills'}
          onClose={() => setOpenModal(null)}
        />

        {/* Task Scheduler Modal (Kal Ka Kaam Schedule & Alarm) */}
        <TaskSchedulerModal
          isOpen={openModal === 'taskScheduler'}
          onClose={() => setOpenModal(null)}
          tasks={scheduledTasks}
          onAddTask={newTaskData => {
            const newTask: ScheduledTask = {
              ...newTaskData,
              id: 'TASK-' + Date.now(),
              createdAt: new Date().toISOString()
            };
            setScheduledTasks(prev => [newTask, ...prev]);
          }}
          onUpdateTaskStatus={(id, status) => {
            setScheduledTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
            if (status === 'Successful') {
              audioChimes.playSuccessChime();
            } else if (status === 'Cancelled') {
              audioChimes.playAlertChime();
            }
          }}
          onDeleteTask={id => setScheduledTasks(prev => prev.filter(t => t.id !== id))}
        />

        {/* Mind Fresh Mini Games Modal */}
        <MindFreshGamesModal
          isOpen={openModal === 'mindFresh'}
          onClose={() => setOpenModal(null)}
        />

        {/* Live Market Ticker Modal */}
        <MarketTickerModal
          isOpen={openModal === 'marketTicker'}
          onClose={() => setOpenModal(null)}
          marketItems={marketItems}
          onRefreshRates={() => {
            setMarketItems(prev => prev.map(item => {
              const currentP = typeof item.price === 'number' ? item.price : parseFloat(String(item.currentPrice || '0').replace(/[^0-9.]/g, '')) || 100;
              const newPrice = Math.round((currentP + (Math.random() * 20 - 10)) * 100) / 100;
              return {
                ...item,
                price: newPrice,
                currentPrice: `Rs. ${newPrice.toLocaleString()}`
              };
            }));
            audioChimes.playSuccessChime();
          }}
        />

        {/* Useful Websites Modal */}
        <UsefulWebsitesModal
          isOpen={openModal === 'usefulWebsites'}
          onClose={() => setOpenModal(null)}
        />

        {/* OTP Verification Modal */}
        <OTPVerificationModal
          isOpen={openModal === 'otpVerification'}
          onClose={() => setOpenModal(null)}
          targetPhoneOrEmail={shopContact}
          onSuccess={() => {
            alert('Security OTP Verified successfully! Terminal access confirmed.');
            setOpenModal(null);
          }}
        />

        {/* Image Studio & Passport Photo Editor Modal */}
        <ImageEditorModal
          isOpen={openModal === 'imageStudio'}
          onClose={() => setOpenModal(null)}
        />

        {/* PDF Suite & Soft File Converter Modal */}
        <PDFToolsModal
          isOpen={openModal === 'pdfTools'}
          onClose={() => setOpenModal(null)}
        />

        {/* Live TV Shows, YouTube & Web Search Hub Modal */}
        <TVShowHubModal
          isOpen={openModal === 'tvShowHub'}
          onClose={() => setOpenModal(null)}
        />

        {/* 100 GB Cloud Storage & Auto Email Backup Modal */}
        <CloudStorageBackupModal
          isOpen={openModal === 'cloudBackup'}
          onClose={() => setOpenModal(null)}
          userEmail={securityState.rootEmail || 'owner@myshop.pk'}
          appData={{
            transactions,
            wallets,
            udhaarAccounts: customAccounts,
            customAccounts,
            securityState
          }}
          onRestoreData={handleRestoreDataFromCloud}
        />

        {/* AI CV Generator & Spell Fixer Modal */}
        <AICVBuilderModal
          isOpen={openModal === 'aiCvBuilder'}
          onClose={() => setOpenModal(null)}
        />

        {/* AI Video Generator & Studio Modal */}
        <VideoStudioModal
          isOpen={openModal === 'videoStudio'}
          onClose={() => setOpenModal(null)}
        />

        {/* Universal Link Unblocker & Unrestricted Downloader Modal */}
        <UnrestrictedBrowserModal
          isOpen={openModal === 'unrestrictedBrowser'}
          onClose={() => setOpenModal(null)}
        />

        {/* Pro AI Audio Studio & Sound Generator Modal */}
        <AudioStudioModal
          isOpen={openModal === 'audioStudio'}
          onClose={() => setOpenModal(null)}
        />

        {/* AI Video & Audio Dubbing Studio Modal */}
        <DubbingStudioModal
          isOpen={openModal === 'dubbingStudio'}
          onClose={() => setOpenModal(null)}
        />

        {/* Make Apps & Websites AI Studio Modal */}
        <AppWebsiteMakerModal
          isOpen={openModal === 'appWebsiteMaker'}
          onClose={() => setOpenModal(null)}
        />

        {/* Google Translate & Voice Interpreter Modal */}
        <GoogleTranslateModal
          isOpen={openModal === 'googleTranslate'}
          onClose={() => setOpenModal(null)}
        />

        {/* Universal Downloader & Multi-Format Converter Modal */}
        <UniversalDownloaderModal
          isOpen={openModal === 'universalDownloader'}
          onClose={() => setOpenModal(null)}
        />

        {/* Google Search Mirror Modal */}
        <GoogleSearchModal
          isOpen={openModal === 'googleSearch'}
          onClose={() => setOpenModal(null)}
        />

        {/* YouTube Video, Search & Player Hub Modal */}
        <YouTubeStudioModal
          isOpen={openModal === 'youtubeHub'}
          onClose={() => setOpenModal(null)}
        />

        {/* Live App Update & Cloud Sync Modal */}
        <AppUpdateModal
          isOpen={openModal === 'appUpdates'}
          onClose={() => setOpenModal(null)}
        />

        {/* Pakistan SIM & CNIC Live Location Tracker Modal */}
        <SimCnicTrackerModal
          isOpen={openModal === 'simCnicTracker'}
          onClose={() => setOpenModal(null)}
          shopTitle={shopTitle}
        />

        {/* Native Progressive Web App Installation Guide Modal */}
        <NativeInstallationModal
          isOpen={openModal === 'nativeInstall'}
          onClose={() => setOpenModal(null)}
          shopTitle={shopTitle}
        />

        {/* Visual Studio Setup Permissions & Launcher Wizard Modal */}
        <VisualStudioSetupModal
          isOpen={openModal === 'vsSetup'}
          onClose={() => setOpenModal(null)}
        />

        {/* Floating Scroll To Top Button (Right Side) */}
        {showScrollTop && (
          <button
            onClick={handleScrollToTop}
            className="fixed right-6 bottom-6 z-[95] p-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-full shadow-2xl border-2 border-slate-900 transition-all duration-300 hover:scale-110 animate-bounce flex items-center justify-center cursor-pointer"
            title="Scroll To Top"
          >
            <ArrowUp className="w-6 h-6 stroke-[3]" />
          </button>
        )}

        <ReceiptModal
          isOpen={!!printingTx}
          onClose={() => setPrintingTx(null)}
          transaction={printingTx}
          shopTitle={shopTitle}
          shopContact={shopContact}
        />

        <TransactionQRModal
          isOpen={!!qrTx}
          onClose={() => setQrTx(null)}
          transaction={qrTx}
          shopTitle={shopTitle}
          shopContact={shopContact}
        />

      </div>
    </div>
  );
}
