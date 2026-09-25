import { db } from '../lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

export interface CloudBackupMetaData {
  userEmail: string;
  lastBackupAt: string;
  totalTransactions: number;
  totalUdhaarAccounts: number;
  usedStorageMB: number;
  totalStorageQuotaMB: number; // 100,000 MB (100 GB)
  backupSizeKB: number;
  status: 'synced' | 'pending' | 'syncing' | 'restored' | 'offline';
}

const TOTAL_CLOUD_QUOTA_MB = 100000; // 100 GB Cloud Storage

export const sanitizeEmailForDocId = (email: string): string => {
  return (email || 'default_user@digidukaan.pos').toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
};

/**
 * Real-time listener for Firestore Cloud Database
 * Syncs any data changes live from the user's email backup
 */
export const subscribeToUserCloudBackup = (
  userEmail: string,
  onDataUpdate: (data: any) => void
) => {
  const cleanEmail = sanitizeEmailForDocId(userEmail);
  try {
    const backupDocRef = doc(db, 'backups', cleanEmail);
    return onSnapshot(backupDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.backupDataJson) {
          try {
            const parsed = JSON.parse(data.backupDataJson);
            onDataUpdate(parsed);
          } catch (e) {
            console.warn('Failed to parse realtime cloud snapshot JSON', e);
          }
        }
      }
    }, (error) => {
      console.warn('Firestore subscription offline or waiting for sync:', error);
    });
  } catch {
    return () => {};
  }
};

/**
 * Uploads full application snapshot automatically to Firestore Cloud Backup
 * (WhatsApp-style automatic email linked cloud backup)
 */
export const saveAutoBackupToCloud = async (
  userEmail: string,
  appData: {
    transactions?: any[];
    wallets?: any;
    udhaarAccounts?: any[];
    customAccounts?: any[];
    securityState?: any;
    userProfile?: any;
  }
): Promise<CloudBackupMetaData> => {
  const cleanEmail = sanitizeEmailForDocId(userEmail);
  const jsonStr = JSON.stringify(appData);
  const backupSizeKB = parseFloat((new Blob([jsonStr]).size / 1024).toFixed(2));
  const usedStorageMB = parseFloat((backupSizeKB / 1024).toFixed(4));
  const nowIso = new Date().toISOString();

  const backupPayload = {
    userEmail: userEmail || 'owner@myshop.pk',
    lastBackupAt: nowIso,
    totalTransactions: appData.transactions?.length || 0,
    totalUdhaarAccounts: appData.udhaarAccounts?.length || 0,
    usedStorageMB,
    totalStorageQuotaMB: TOTAL_CLOUD_QUOTA_MB,
    backupSizeKB,
    status: 'synced' as const,
    backupDataJson: jsonStr,
    updatedAt: serverTimestamp(),
  };

  try {
    // 1. Save main backup snapshot document
    const backupDocRef = doc(db, 'backups', cleanEmail);
    await setDoc(backupDocRef, backupPayload, { merge: true });

    // 2. Save user profile metadata document
    const userDocRef = doc(db, 'users', cleanEmail);
    await setDoc(userDocRef, {
      email: userEmail,
      lastBackupAt: nowIso,
      usedStorageMB,
      totalStorageQuotaMB: TOTAL_CLOUD_QUOTA_MB,
      totalTransactions: appData.transactions?.length || 0,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // 3. Keep audit log in collection
    try {
      const historyColRef = collection(db, 'users', cleanEmail, 'backup_logs');
      await addDoc(historyColRef, {
        timestamp: nowIso,
        sizeKB: backupSizeKB,
        totalRecords: (appData.transactions?.length || 0) + (appData.udhaarAccounts?.length || 0)
      });
    } catch {
      // ignore log failure if rules strict
    }

    // Also persist locally in localStorage as fallback cache
    localStorage.setItem(`bismillah_cloud_backup_${cleanEmail}`, JSON.stringify(backupPayload));

    return {
      userEmail,
      lastBackupAt: nowIso,
      totalTransactions: appData.transactions?.length || 0,
      totalUdhaarAccounts: appData.udhaarAccounts?.length || 0,
      usedStorageMB,
      totalStorageQuotaMB: TOTAL_CLOUD_QUOTA_MB,
      backupSizeKB,
      status: 'synced',
    };
  } catch (err) {
    console.warn('Firebase online backup pending, saved to persistent offline cache:', err);
    // Offline / persistent cache save
    localStorage.setItem(`bismillah_cloud_backup_${cleanEmail}`, JSON.stringify(backupPayload));
    return {
      userEmail,
      lastBackupAt: nowIso,
      totalTransactions: appData.transactions?.length || 0,
      totalUdhaarAccounts: appData.udhaarAccounts?.length || 0,
      usedStorageMB,
      totalStorageQuotaMB: TOTAL_CLOUD_QUOTA_MB,
      backupSizeKB,
      status: 'offline',
    };
  }
};

/**
 * Downloads and restores user data from Firestore Cloud Backup
 * using the user's email ID.
 */
export const restoreBackupFromCloud = async (userEmail: string): Promise<{
  success: boolean;
  data?: any;
  meta?: CloudBackupMetaData;
  error?: string;
}> => {
  const cleanEmail = sanitizeEmailForDocId(userEmail);

  try {
    const backupDocRef = doc(db, 'backups', cleanEmail);
    const docSnap = await getDoc(backupDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const parsedData = JSON.parse(data.backupDataJson || '{}');
      return {
        success: true,
        data: parsedData,
        meta: {
          userEmail: data.userEmail || userEmail,
          lastBackupAt: data.lastBackupAt,
          totalTransactions: data.totalTransactions || 0,
          totalUdhaarAccounts: data.totalUdhaarAccounts || 0,
          usedStorageMB: data.usedStorageMB || 0,
          totalStorageQuotaMB: TOTAL_CLOUD_QUOTA_MB,
          backupSizeKB: data.backupSizeKB || 0,
          status: 'restored',
        }
      };
    }

    // Try reading local backup fallback cache if offline
    const localCached = localStorage.getItem(`bismillah_cloud_backup_${cleanEmail}`);
    if (localCached) {
      const data = JSON.parse(localCached);
      const parsedData = JSON.parse(data.backupDataJson || '{}');
      return {
        success: true,
        data: parsedData,
        meta: {
          userEmail: data.userEmail || userEmail,
          lastBackupAt: data.lastBackupAt,
          totalTransactions: data.totalTransactions || 0,
          totalUdhaarAccounts: data.totalUdhaarAccounts || 0,
          usedStorageMB: data.usedStorageMB || 0,
          totalStorageQuotaMB: TOTAL_CLOUD_QUOTA_MB,
          backupSizeKB: data.backupSizeKB || 0,
          status: 'restored',
        }
      };
    }

    return {
      success: false,
      error: `No cloud backup found for email address: ${userEmail}`
    };
  } catch (err: any) {
    // Try offline fallback
    const localCached = localStorage.getItem(`bismillah_cloud_backup_${cleanEmail}`);
    if (localCached) {
      const data = JSON.parse(localCached);
      const parsedData = JSON.parse(data.backupDataJson || '{}');
      return {
        success: true,
        data: parsedData,
        meta: {
          userEmail: data.userEmail || userEmail,
          lastBackupAt: data.lastBackupAt,
          totalTransactions: data.totalTransactions || 0,
          totalUdhaarAccounts: data.totalUdhaarAccounts || 0,
          usedStorageMB: data.usedStorageMB || 0,
          totalStorageQuotaMB: TOTAL_CLOUD_QUOTA_MB,
          backupSizeKB: data.backupSizeKB || 0,
          status: 'restored',
        }
      };
    }

    return {
      success: false,
      error: err.message || 'Failed to fetch backup from cloud.'
    };
  }
};

/**
 * Checks metadata for existing cloud backup
 */
export const checkCloudBackupAvailable = async (userEmail: string): Promise<CloudBackupMetaData | null> => {
  const cleanEmail = sanitizeEmailForDocId(userEmail);
  try {
    const backupDocRef = doc(db, 'backups', cleanEmail);
    const docSnap = await getDoc(backupDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        userEmail: data.userEmail || userEmail,
        lastBackupAt: data.lastBackupAt,
        totalTransactions: data.totalTransactions || 0,
        totalUdhaarAccounts: data.totalUdhaarAccounts || 0,
        usedStorageMB: data.usedStorageMB || 0,
        totalStorageQuotaMB: TOTAL_CLOUD_QUOTA_MB,
        backupSizeKB: data.backupSizeKB || 0,
        status: 'synced',
      };
    }
  } catch {
    // Ignore error
  }

  // Check local fallback
  const localCached = localStorage.getItem(`bismillah_cloud_backup_${cleanEmail}`);
  if (localCached) {
    try {
      const data = JSON.parse(localCached);
      return {
        userEmail: data.userEmail || userEmail,
        lastBackupAt: data.lastBackupAt,
        totalTransactions: data.totalTransactions || 0,
        totalUdhaarAccounts: data.totalUdhaarAccounts || 0,
        usedStorageMB: data.usedStorageMB || 0,
        totalStorageQuotaMB: TOTAL_CLOUD_QUOTA_MB,
        backupSizeKB: data.backupSizeKB || 0,
        status: 'synced',
      };
    } catch {}
  }

  return null;
};
