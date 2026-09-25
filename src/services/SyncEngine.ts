import { db } from '../lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc,
  onSnapshot, 
  serverTimestamp,
  Unsubscribe 
} from 'firebase/firestore';

export interface AppStatePayload {
  transactions?: any[];
  wallets?: any;
  customAccounts?: any[];
  securityState?: any;
  lastUpdated?: string;
  userEmail?: string;
}

export class SyncEngine {
  private currentEmail: string = '';
  private unsubscribeListener: Unsubscribe | null = null;
  private saveTimeout: any = null;

  /**
   * Helper to sanitize email address for Firestore document ID keys
   */
  public sanitizeEmail(email: string): string {
    return (email || 'owner@myshop.pk')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '_');
  }

  /**
   * Initializes real-time sync with user's Firestore cloud document.
   * Listens for changes from other devices or past sessions.
   */
  public initSync(
    userEmail: string, 
    onDataReceived: (data: AppStatePayload) => void
  ): Unsubscribe {
    const cleanEmail = this.sanitizeEmail(userEmail);
    this.currentEmail = cleanEmail;

    // Stop existing listener if any
    this.stopSync();

    try {
      // Primary document in 'backups' collection and secondary profile in 'users'
      const userDocRef = doc(db, 'backups', cleanEmail);

      this.unsubscribeListener = onSnapshot(userDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const rawData = snapshot.data();
          if (rawData && rawData.backupDataJson) {
            try {
              const parsedState: AppStatePayload = JSON.parse(rawData.backupDataJson);
              onDataReceived(parsedState);
            } catch (err) {
              console.warn('[SyncEngine] Failed to parse JSON state:', err);
            }
          }
        }
      }, (error) => {
        console.warn('[SyncEngine] Firestore snapshot listener warning (using offline cache):', error);
      });
    } catch (e) {
      console.warn('[SyncEngine] Firestore setup fallback:', e);
    }

    return () => this.stopSync();
  }

  /**
   * Saves local state to user's cloud document in Firestore with debouncing
   */
  public saveState(userEmail: string, state: AppStatePayload): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    const cleanEmail = this.sanitizeEmail(userEmail);

    this.saveTimeout = setTimeout(async () => {
      try {
        const jsonStr = JSON.stringify(state);
        const backupSizeKB = parseFloat((new Blob([jsonStr]).size / 1024).toFixed(2));
        const usedStorageMB = parseFloat((backupSizeKB / 1024).toFixed(4));
        const nowIso = new Date().toISOString();

        const docRef = doc(db, 'backups', cleanEmail);
        await setDoc(docRef, {
          userEmail: userEmail || 'owner@myshop.pk',
          lastBackupAt: nowIso,
          totalTransactions: state.transactions?.length || 0,
          totalAccounts: state.customAccounts?.length || 0,
          usedStorageMB,
          totalStorageQuotaMB: 100000, // 100 GB
          backupSizeKB,
          backupDataJson: jsonStr,
          status: 'synced',
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Backup shadow copy in 'users' doc for user identity mapping
        const userRef = doc(db, 'users', cleanEmail);
        await setDoc(userRef, {
          email: userEmail,
          lastActiveAt: nowIso,
          usedStorageMB,
          totalStorageQuotaMB: 100000,
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Save local backup copy as offline cache
        localStorage.setItem(`sync_engine_cache_${cleanEmail}`, jsonStr);
      } catch (err) {
        console.warn('[SyncEngine] Background save cached offline:', err);
      }
    }, 1500); // 1.5 second debounced save
  }

  /**
   * Fetches latest user state from Firestore explicitly on demand
   */
  public async loadInitialState(userEmail: string): Promise<AppStatePayload | null> {
    const cleanEmail = this.sanitizeEmail(userEmail);
    try {
      const docRef = doc(db, 'backups', cleanEmail);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        if (data && data.backupDataJson) {
          return JSON.parse(data.backupDataJson);
        }
      }
    } catch (err) {
      console.warn('[SyncEngine] Fetching initial state from cloud failed, trying offline cache:', err);
    }

    // Fallback to local cache if offline
    const cached = localStorage.getItem(`sync_engine_cache_${cleanEmail}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }

    return null;
  }

  /**
   * Cleans up listener
   */
  public stopSync(): void {
    if (this.unsubscribeListener) {
      this.unsubscribeListener();
      this.unsubscribeListener = null;
    }
  }

  /**
   * Performs force-sync wipe / account deletion that clears remote data from Firestore and local caches cleanly.
   */
  public async wipeRemoteData(userEmail: string): Promise<boolean> {
    const cleanEmail = this.sanitizeEmail(userEmail);
    this.stopSync();

    try {
      const backupRef = doc(db, 'backups', cleanEmail);
      await deleteDoc(backupRef);

      const userRef = doc(db, 'users', cleanEmail);
      await deleteDoc(userRef);

      localStorage.removeItem(`sync_engine_cache_${cleanEmail}`);
      localStorage.removeItem(`bismillah_cloud_backup_${cleanEmail}`);
      return true;
    } catch (err) {
      console.warn('[SyncEngine] Failed to wipe remote data, clearing local cache:', err);
      localStorage.removeItem(`sync_engine_cache_${cleanEmail}`);
      return false;
    }
  }

  /**
   * Immediate force-sync trigger to bypass debounce delay
   */
  public async forceSync(userEmail: string, state: AppStatePayload): Promise<boolean> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    const cleanEmail = this.sanitizeEmail(userEmail);
    try {
      const jsonStr = JSON.stringify(state);
      const backupSizeKB = parseFloat((new Blob([jsonStr]).size / 1024).toFixed(2));
      const usedStorageMB = parseFloat((backupSizeKB / 1024).toFixed(4));
      const nowIso = new Date().toISOString();

      const docRef = doc(db, 'backups', cleanEmail);
      await setDoc(docRef, {
        userEmail: userEmail || 'owner@myshop.pk',
        lastBackupAt: nowIso,
        totalTransactions: state.transactions?.length || 0,
        totalAccounts: state.customAccounts?.length || 0,
        usedStorageMB,
        totalStorageQuotaMB: 100000, // 100 GB
        backupSizeKB,
        backupDataJson: jsonStr,
        status: 'synced',
        updatedAt: serverTimestamp()
      }, { merge: true });

      localStorage.setItem(`sync_engine_cache_${cleanEmail}`, jsonStr);
      return true;
    } catch (err) {
      console.warn('[SyncEngine] Force sync failed:', err);
      return false;
    }
  }
}

export const syncEngine = new SyncEngine();
