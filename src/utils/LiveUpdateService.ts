/**
 * LiveUpdateService.ts
 * Real-time Over-The-Air (OTA) App Update & Remote Synchronization Engine for Bismillah POS.
 * 
 * Enables the shop owner/admin to publish updates, new AI features, announcement banners,
 * and remote configurations that automatically propagate to all user devices in real time
 * without requiring end-users to manually download or reinstall APK / app binaries.
 */

import { doc, getDoc, setDoc, onSnapshot, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const CURRENT_APP_VERSION = 'v4.3.0-live';
export const CURRENT_BUILD_TIMESTAMP = '2026-08-16T18:35:00.000Z';

export interface AppReleaseMetadata {
  version: string;
  title: string;
  changelog: string;
  publishedAt: string;
  publishedBy?: string;
  isCritical?: boolean;
  announcement?: string;
  featureFlags?: Record<string, boolean>;
  hotReloadToken?: string;
}

export interface LiveUpdateState {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  latestRelease: AppReleaseMetadata | null;
  isChecking: boolean;
  lastCheckedAt: number;
  activeAnnouncement: string | null;
  featureFlags: Record<string, boolean>;
}

const LOCAL_VERSION_KEY = 'bismillah_installed_app_version';
const LOCAL_LAST_UPDATE_KEY = 'bismillah_last_applied_release';

class LiveUpdateServiceImpl {
  private state: LiveUpdateState = {
    currentVersion: CURRENT_APP_VERSION,
    latestVersion: CURRENT_APP_VERSION,
    updateAvailable: false,
    latestRelease: null,
    isChecking: false,
    lastCheckedAt: Date.now(),
    activeAnnouncement: null,
    featureFlags: {
      enableAi3dRobot: true,
      enableThermalFastPrint: true,
      enableBiometricDirectSensor: true,
      enableImageStudioAi: true,
      enableCloudRealtimeSync: true
    }
  };

  private listeners: ((state: LiveUpdateState) => void)[] = [];
  private unsubscribeFirestore: (() => void) | null = null;
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.initLocalVersion();
    this.initBroadcastChannel();
    this.initFirestoreRealtimeListener();
    this.initServiceWorkerWatcher();
  }

  private initLocalVersion(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(LOCAL_VERSION_KEY);
      if (!stored) {
        localStorage.setItem(LOCAL_VERSION_KEY, CURRENT_APP_VERSION);
      } else {
        this.state.currentVersion = stored;
      }
    } catch {
      // storage fallback
    }
  }

  private initBroadcastChannel(): void {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    try {
      this.broadcastChannel = new BroadcastChannel('bismillah_live_updates_channel');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'FORCE_HOT_RELOAD') {
          this.applyUpdateDirectly(false);
        } else if (event.data?.type === 'NEW_VERSION_ANNOUNCED') {
          this.handleIncomingRelease(event.data.release);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
    }
  }

  /**
   * Listen to real-time updates from Firebase Firestore 'app_updates/latest'
   */
  private initFirestoreRealtimeListener(): void {
    if (!db) return;

    try {
      const latestDocRef = doc(db, 'app_updates', 'latest');
      this.unsubscribeFirestore = onSnapshot(
        latestDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as AppReleaseMetadata;
            this.handleIncomingRelease(data);
          }
        },
        (error) => {
          console.warn('Firestore live update listener offline / retry:', error?.message || error);
        }
      );
    } catch (err) {
      console.warn('Could not establish Firestore live update listener:', err);
    }
  }

  /**
   * Handle an incoming release metadata object
   */
  private handleIncomingRelease(release: AppReleaseMetadata): void {
    if (!release || !release.version) return;

    const isNewer = this.compareVersions(release.version, this.state.currentVersion) > 0;

    this.state.latestVersion = release.version;
    this.state.latestRelease = release;
    this.state.updateAvailable = isNewer;
    this.state.activeAnnouncement = release.announcement || null;

    if (release.featureFlags) {
      this.state.featureFlags = {
        ...this.state.featureFlags,
        ...release.featureFlags
      };
    }

    this.notify();

    // If marked as critical and has hotReloadToken, automatically refresh smoothly
    if (isNewer && release.isCritical) {
      setTimeout(() => {
        this.applyUpdate();
      }, 4000);
    }
  }

  /**
   * Compare semver/version strings (returns 1 if a > b, -1 if a < b, 0 if equal)
   */
  public compareVersions(a: string, b: string): number {
    const cleanA = a.replace(/^v/, '').split('-')[0];
    const cleanB = b.replace(/^v/, '').split('-')[0];
    const partsA = cleanA.split('.').map(Number);
    const partsB = cleanB.split('.').map(Number);

    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const valA = partsA[i] || 0;
      const valB = partsB[i] || 0;
      if (valA > valB) return 1;
      if (valA < valB) return -1;
    }
    return 0;
  }

  /**
   * Subscribe to Live Update state changes
   */
  public subscribe(listener: (state: LiveUpdateState) => void): () => void {
    this.listeners.push(listener);
    listener({ ...this.state });
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    const copy = { ...this.state };
    this.listeners.forEach(fn => {
      try {
        fn(copy);
      } catch (err) {
        console.error('Error notifying update listener:', err);
      }
    });
  }

  /**
   * Manual Check for updates (from Cloud and Service Worker)
   */
  public async checkForUpdates(): Promise<{ updateAvailable: boolean; release: AppReleaseMetadata | null }> {
    this.state.isChecking = true;
    this.notify();

    try {
      if (db) {
        const latestDoc = await getDoc(doc(db, 'app_updates', 'latest'));
        if (latestDoc.exists()) {
          const data = latestDoc.data() as AppReleaseMetadata;
          this.handleIncomingRelease(data);
          this.state.isChecking = false;
          this.state.lastCheckedAt = Date.now();
          this.notify();
          return {
            updateAvailable: this.state.updateAvailable,
            release: this.state.latestRelease
          };
        }
      }

      // Check Service Worker updates if available
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      }
    } catch (err) {
      console.warn('Check for update failed:', err);
    } finally {
      this.state.isChecking = false;
      this.state.lastCheckedAt = Date.now();
      this.notify();
    }

    return {
      updateAvailable: this.state.updateAvailable,
      release: this.state.latestRelease
    };
  }

  /**
   * Apply Update: Purges browser cache, updates local version flag, and executes hot reload
   */
  public async applyUpdate(targetVersion?: string): Promise<void> {
    const nextVer = targetVersion || this.state.latestVersion || CURRENT_APP_VERSION;
    try {
      localStorage.setItem(LOCAL_VERSION_KEY, nextVer);
      if (this.state.latestRelease) {
        localStorage.setItem(LOCAL_LAST_UPDATE_KEY, JSON.stringify(this.state.latestRelease));
      }

      // Clear Service Worker CacheStorage
      if ('caches' in window) {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map(key => window.caches.delete(key)));
      }

      // Notify other open tabs
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'FORCE_HOT_RELOAD' });
      }
    } catch (err) {
      console.warn('Cache purge before update warning:', err);
    }

    this.applyUpdateDirectly(true);
  }

  private applyUpdateDirectly(hardReload: boolean = true): void {
    if (typeof window === 'undefined') return;
    if (hardReload) {
      // Append cache buster to bypass aggressive proxy caching
      const url = new URL(window.location.href);
      url.searchParams.set('_v', Date.now().toString());
      window.location.replace(url.toString());
    } else {
      window.location.reload();
    }
  }

  /**
   * Admin: Publish a new live update to Firestore and broadcast to all users
   */
  public async publishLiveUpdate(releaseData: {
    version: string;
    title: string;
    changelog: string;
    isCritical?: boolean;
    announcement?: string;
    featureFlags?: Record<string, boolean>;
    publishedBy?: string;
  }): Promise<{ success: boolean; message: string }> {
    return this.saveUpdates(releaseData);
  }

  /**
   * Save Updates: Triggers a state merge across the app and remote devices
   */
  public async saveUpdates(releaseData: {
    version: string;
    title: string;
    changelog: string;
    isCritical?: boolean;
    announcement?: string;
    featureFlags?: Record<string, boolean>;
    publishedBy?: string;
  }): Promise<{ success: boolean; message: string }> {
    const payload: AppReleaseMetadata = {
      version: releaseData.version.trim(),
      title: releaseData.title.trim(),
      changelog: releaseData.changelog.trim(),
      publishedAt: new Date().toISOString(),
      publishedBy: releaseData.publishedBy || 'Bismillah POS Admin',
      isCritical: Boolean(releaseData.isCritical),
      announcement: releaseData.announcement?.trim() || '',
      featureFlags: releaseData.featureFlags || this.state.featureFlags,
      hotReloadToken: `rel_${Date.now()}`
    };

    try {
      if (db) {
        // 1. Update the 'latest' document
        await setDoc(doc(db, 'app_updates', 'latest'), payload);

        // 2. Add to history collection for auditing
        await addDoc(collection(db, 'app_updates_history'), payload);
      }

      // Update local state immediately
      this.handleIncomingRelease(payload);

      // Broadcast across tabs
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'NEW_VERSION_ANNOUNCED',
          release: payload
        });
      }

      return {
        success: true,
        message: `✅ Live Update ${payload.version} kamyabi se publish ho gaya! Tamam users ke pass foran update ho jayega.`
      };
    } catch (err: any) {
      console.error('Error publishing live update:', err);
      // Fallback local broadcast
      this.handleIncomingRelease(payload);
      return {
        success: true,
        message: `⚠️ Cloud offline. Update local session & tabs mein broadcast kar di gayi hai.`
      };
    }
  }

  /**
   * Admin: Broadcast force refresh signal to all active clients
   */
  public async broadcastInstantReload(): Promise<void> {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'FORCE_HOT_RELOAD' });
    }
    if (db) {
      try {
        await setDoc(doc(db, 'app_updates', 'latest'), {
          ...this.state.latestRelease,
          hotReloadToken: `force_reload_${Date.now()}`
        }, { merge: true });
      } catch (err) {
        console.warn('Broadcast reload sync warning:', err);
      }
    }
  }

  /**
   * Watch Service Worker for new PWA assets
   */
  private initServiceWorkerWatcher(): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.info('Service Worker updated. Hot reload ready.');
    });
  }

  /**
   * Admin Staging Sandbox Mode:
   * Enables the Admin to test Gemini AI generated updates locally before publishing live to all users.
   */
  public activateAdminStaging(release: AppReleaseMetadata): void {
    try {
      localStorage.setItem('bismillah_admin_staged_release', JSON.stringify(release));
      this.state.latestRelease = release;
      this.state.latestVersion = release.version;
      this.state.activeAnnouncement = `[🧪 ADMIN STAGING TEST] ${release.announcement || release.title}`;
      if (release.featureFlags) {
        this.state.featureFlags = {
          ...this.state.featureFlags,
          ...release.featureFlags
        };
      }
      this.notify();
    } catch (e) {
      console.warn('Failed to activate staging:', e);
    }
  }

  public discardAdminStaging(): void {
    try {
      localStorage.removeItem('bismillah_admin_staged_release');
      this.checkForUpdates();
    } catch (e) {
      console.warn('Failed to discard staging:', e);
    }
  }

  public getStagedRelease(): AppReleaseMetadata | null {
    try {
      const stored = localStorage.getItem('bismillah_admin_staged_release');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  public isStagingActive(): boolean {
    return Boolean(this.getStagedRelease());
  }

  public getState(): LiveUpdateState {
    return { ...this.state };
  }
}

export const LiveUpdateService = new LiveUpdateServiceImpl();
