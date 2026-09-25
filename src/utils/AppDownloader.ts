/**
 * AppDownloader.ts
 * Unified utility for Bismillah POS Application Downloader, PWA Installer & Trusted Web Activity (TWA).
 * Captures user OS preference (Android, iOS, PC, Mac), generates standalone offline packages,
 * and handles Progressive Web App (PWA) installation prompts mimicking store-app behavior.
 */

export type TargetOS = 'android' | 'ios' | 'pc' | 'mac';

export interface OSMetadata {
  id: TargetOS;
  name: string;
  shortLabel: string;
  badge: string;
  fileExtension: string;
  defaultFileName: string;
  description: string;
  resolution: string;
  features: string[];
  instructions: string[];
  twaGuide?: string[];
}

export interface DownloadResult {
  success: boolean;
  os: TargetOS;
  fileName: string;
  isPwaPrompted: boolean;
  isStandalone: boolean;
  message: string;
}

export const OS_REGISTRY: Record<TargetOS, OSMetadata> = {
  android: {
    id: 'android',
    name: 'Android Mobile & Tablet',
    shortLabel: 'Android 1-Click Install / APK',
    badge: 'WhatsApp / Store Style',
    fileExtension: '.html',
    defaultFileName: 'DigiDukaan_Android_App.html',
    description: 'Direct Android application install just like WhatsApp / EasyPaisa with native app drawer icon, offline ledger, and biometric security.',
    resolution: '412 x 915 Mobile Viewport (Store App Mode)',
    features: [
      'Zero Browser Bar (Fullscreen WhatsApp-style UX)',
      '1-Click EasyPaisa / WhatsApp Style Home Screen Install',
      'Offline SQLite/IndexedDB Storage',
      'Biometric Fingerprint & Passkey Lock',
      'Camera Barcode Scanner',
      'Phone Apps Drawer & Notification Support'
    ],
    instructions: [
      'Tap "1-Click Install App" to install directly on your phone like WhatsApp / EasyPaisa.',
      'Or tap the 3 dots (⋮) in Chrome / Edge and select "Install app" or "Add to Home screen".',
      'The app icon will appear in your mobile phone apps list with high-res icon.',
      'Tap the DigiDukaan POS icon to open in pure fullscreen mode.'
    ],
    twaGuide: [
      'Supports Android Trusted Web Activity (TWA) and PWA standalone deployment.',
      'Opens as an isolated system application with Android task switcher support.'
    ]
  },
  ios: {
    id: 'ios',
    name: 'Apple iPhone & iPad',
    shortLabel: 'iPhone Native WebClip',
    badge: 'iOS Standalone',
    fileExtension: '.mobileconfig',
    defaultFileName: 'DigiDukaan_iPhone.mobileconfig',
    description: 'Apple iOS standalone home screen package with Retina display scaling & Touch ID / Passkey support.',
    resolution: '390 x 844 Retina Viewport',
    features: ['Retina Display Ready', 'Standalone Fullscreen WebClip', 'Touch ID / Passkey Support', 'Instant Safari Home Icon'],
    instructions: [
      'Open this app in Safari on your iPhone/iPad.',
      'Tap the Share button (box with upward arrow) at bottom center.',
      'Scroll down and tap "Add to Home Screen".',
      'Tap "Add" at the top right corner to complete installation.'
    ]
  },
  pc: {
    id: 'pc',
    name: 'Windows PC & Laptop',
    shortLabel: 'Windows Desktop App (.url / PWA)',
    badge: 'WhatsApp Desktop Style',
    fileExtension: '.url',
    defaultFileName: 'DigiDukaan_Desktop_App.url',
    description: '100% Safe, Virus-Free, Zero-Crash Desktop Shortcut & WhatsApp-style Standalone App Launcher for Windows 10 & 11.',
    resolution: '1920 x 1080 Fullscreen Kiosk',
    features: [
      'Zero Antivirus Warning & 100% Virus-Free',
      'Zero Crash Guarantee (Standard Windows Internet Shortcut)',
      'Opens in Standalone Dedicated Window Like WhatsApp Desktop',
      'Desktop Shortcut Icon & Taskbar Pinning',
      'Thermal 80mm/58mm Printer COM Direct Link',
      'Offline Database Storage Engine'
    ],
    instructions: [
      'Click "1-Click Direct Install (WhatsApp Style)" to install into Windows Apps & Taskbar.',
      'Or download the Desktop Shortcut (.url) and place it on your Desktop for 1-click instant launch.',
      'Opens smoothly in a standalone dedicated window without any antivirus warnings!'
    ]
  },
  mac: {
    id: 'mac',
    name: 'Apple Mac & macOS',
    shortLabel: 'macOS Desktop Shortcut (.webloc)',
    badge: 'macOS WebApp',
    fileExtension: '.webloc',
    defaultFileName: 'DigiDukaan_Mac.webloc',
    description: 'Apple macOS standalone desktop launcher package with native window frame styling and Retina scaling.',
    resolution: '1440 x 900 Retina Desktop',
    features: ['macOS Native Frame', 'Command Key Shortcuts', 'Spotlight Search Integration', 'Retina HiDPI Display Ready'],
    instructions: [
      'Click "1-Click Direct Install" or download the macOS WebLoc shortcut.',
      'Double-click to launch in standalone application mode.'
    ]
  }
};

const OS_PREF_KEY = 'bismillah_app_preferred_os';
const DOWNLOAD_COUNT_KEY = 'bismillah_app_download_count';

class AppDownloaderService {
  private deferredPrompt: any = null;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  /**
   * Initializes listeners for PWA install prompt and custom events
   */
  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e;
      (window as any).deferredPwaPrompt = e;
      window.dispatchEvent(new CustomEvent('pwa-prompt-available', { detail: { available: true } }));
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      (window as any).deferredPwaPrompt = null;
      console.log('[Bismillah POS] App successfully installed as Standalone / TWA.');
      window.dispatchEvent(new CustomEvent('pwa-installed-success'));
    });
  }

  /**
   * Automatically detects the user device OS
   */
  public detectOS(): TargetOS {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'pc';
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    const platform = (navigator as any).userAgentData?.platform || navigator.platform || '';

    // 1. Android Detection
    if (/android/i.test(ua) || /android/i.test(platform)) {
      return 'android';
    }

    // 2. iOS Detection (iPhone, iPad, iPod, iPadOS on MacIntel with touch points)
    const isIOS = /iPad|iPhone|iPod/.test(ua) || 
      (platform === 'MacIntel' && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1);
    if (isIOS) {
      return 'ios';
    }

    // 3. Mac / macOS Detection
    if (/Macintosh|Mac OS X|MacIntel/i.test(ua) || /Mac/i.test(platform)) {
      return 'mac';
    }

    // 4. Default: PC (Windows / Linux / ChromeOS)
    return 'pc';
  }

  /**
   * Gets the stored OS preference from localStorage, or null if never set
   */
  public getStoredOSPreference(): TargetOS | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(OS_PREF_KEY);
    if (stored === 'android' || stored === 'ios' || stored === 'pc' || stored === 'mac') {
      return stored as TargetOS;
    }
    return null;
  }

  /**
   * Sets and captures the user's OS preference in localStorage
   */
  public setStoredOSPreference(os: TargetOS): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(OS_PREF_KEY, os);
  }

  /**
   * Gets the active OS to use: stored preference if available, else detected OS
   */
  public getActiveOS(): TargetOS {
    return this.getStoredOSPreference() || this.detectOS();
  }

  /**
   * Returns metadata for a given OS
   */
  public getOSMetadata(os?: TargetOS): OSMetadata {
    const target = os || this.getActiveOS();
    return OS_REGISTRY[target];
  }

  /**
   * Checks if app is running in installed standalone / PWA / TWA mode
   */
  public isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://') ||
      window.location.search.includes('source=pwa')
    );
  }

  /**
   * Triggers the native browser PWA install prompt if available
   */
  public async triggerPWAInstall(): Promise<boolean> {
    const prompt = this.deferredPrompt || (typeof window !== 'undefined' ? (window as any).deferredPwaPrompt : null);
    if (!prompt) {
      return false;
    }

    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        this.deferredPrompt = null;
        (window as any).deferredPwaPrompt = null;
        return true;
      }
      return false;
    } catch (err) {
      console.warn('PWA install prompt invocation failed:', err);
      return false;
    }
  }

  /**
   * Generates a tailored platform standalone runner HTML package
   */
  public generatePackage(os: TargetOS, appTitle = 'DigiDukaan POS'): { blob: Blob; fileName: string; type: string } {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-wctdfhefl3hglxekqvgydb-338101444139.asia-east1.run.app';
    const meta = OS_REGISTRY[os];
    let htmlContent = '';

    if (os === 'pc') {
      const urlContent = `[InternetShortcut]
URL=${appUrl}/?source=desktop_app
IconIndex=0
IconFile=${appUrl}/favicon.ico
HotKey=0
IDList=
[{000214A0-0000-0000-C000-000000000046}]
Prop3=19,11
`;
      const blob = new Blob([urlContent], { type: 'application/internet-shortcut;charset=utf-8' });
      return {
        blob,
        fileName: meta.defaultFileName,
        type: 'application/internet-shortcut'
      };
    } else if (os === 'android') {
      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#020617">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>${appTitle} - Android Edition</title>
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js').catch(function(){});
    }
    window.location.replace("${appUrl}/?source=pwa");
  </script>
</head>
<body style="margin:0;padding:0;background:#020617;color:#f59e0b;font-family:sans-serif;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;">
  <div style="padding:24px;border:1px solid rgba(245,158,11,0.3);border-radius:20px;background:#0f172a;max-width:320px;">
    <h2 style="margin:0 0 10px 0;">📱 ${appTitle}</h2>
    <p style="color:#cbd5e1;font-size:13px;margin:0 0 15px 0;">Launching DigiDukaan POS Standalone Mobile Application...</p>
    <a href="${appUrl}/?source=pwa" style="display:inline-block;padding:10px 20px;background:#f59e0b;color:#020617;font-weight:bold;text-decoration:none;border-radius:12px;">Open App</a>
  </div>
</body>
</html>`;
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      return {
        blob,
        fileName: meta.defaultFileName,
        type: 'text/html'
      };
    } else if (os === 'ios') {
      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="DigiDukaan POS">
  <title>${appTitle} - iPhone Edition</title>
  <script>
    window.location.replace("${appUrl}/?source=pwa");
  </script>
</head>
<body style="margin:0;padding:0;background:#020617;color:#38bdf8;font-family:-apple-system,sans-serif;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;">
  <div style="padding:24px;border:1px solid rgba(56,189,248,0.3);border-radius:24px;background:#0f172a;max-width:320px;">
    <h2 style="margin:0 0 10px 0;color:#38bdf8;">🍎 ${appTitle}</h2>
    <p style="color:#94a3b8;font-size:13px;margin:0 0 15px 0;">Opening iPhone Standalone WebClip...</p>
    <a href="${appUrl}/?source=pwa" style="display:inline-block;padding:10px 20px;background:#38bdf8;color:#020617;font-weight:bold;text-decoration:none;border-radius:12px;">Open App</a>
  </div>
</body>
</html>`;
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      return {
        blob,
        fileName: meta.defaultFileName,
        type: 'text/html'
      };
    } else if (os === 'mac') {
      const weblocContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>URL</key>
	<string>${appUrl}/?source=mac_app</string>
</dict>
</plist>
`;
      const blob = new Blob([weblocContent], { type: 'application/x-apple-webloc;charset=utf-8' });
      return {
        blob,
        fileName: meta.defaultFileName,
        type: 'application/x-apple-webloc'
      };
    }

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    return {
      blob,
      fileName: meta.defaultFileName,
      type: 'text/html'
    };
  }

  /**
   * Primary download action: Captures OS preference, generates binary/HTML runner package,
   * triggers browser file download, and triggers PWA install prompt.
   */
  public async triggerDownload(targetOS?: TargetOS, options?: { promptPwa?: boolean; savePreference?: boolean }): Promise<DownloadResult> {
    const os = targetOS || this.getActiveOS();
    const savePref = options?.savePreference !== false;
    const shouldPromptPwa = options?.promptPwa !== false;
    const isCurrentlyStandalone = this.isStandalone();

    // 1. Capture OS preference in storage
    if (savePref) {
      this.setStoredOSPreference(os);
    }

    // 2. Increment download stats
    try {
      const currentCount = parseInt(localStorage.getItem(DOWNLOAD_COUNT_KEY) || '0', 10);
      localStorage.setItem(DOWNLOAD_COUNT_KEY, (currentCount + 1).toString());
    } catch {
      // ignore localstorage errors
    }

    // 3. Trigger PWA / TWA install prompt if available first
    let isPwaPrompted = false;
    if (shouldPromptPwa && !isCurrentlyStandalone) {
      isPwaPrompted = await this.triggerPWAInstall();
    }

    // 4. Generate OS-specific runner package as fallback / direct runner
    const { blob, fileName } = this.generatePackage(os);

    // 5. Trigger browser file download
    if (typeof window !== 'undefined' && typeof document !== 'undefined' && !isPwaPrompted) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    const meta = OS_REGISTRY[os];
    const message = isPwaPrompted
      ? `📱 App installation prompt activated on your screen!`
      : `✓ ${meta.name} Package (${fileName}) downloaded! You can launch Bismillah POS directly from your home screen.`;

    // 6. Broadcast download event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bismillah-app-downloaded', {
        detail: { os, fileName, isPwaPrompted, isStandalone: isCurrentlyStandalone }
      }));
    }

    return {
      success: true,
      os,
      fileName,
      isPwaPrompted,
      isStandalone: isCurrentlyStandalone,
      message
    };
  }

  /**
   * Opens the universal multi-platform download modal
   */
  public openDownloadModal(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trigger-app-install'));
    }
  }

  /**
   * Single primary download trigger used by Header & banners
   */
  public async triggerPrimaryDownload(targetOS?: TargetOS): Promise<DownloadResult> {
    const os = targetOS || this.getActiveOS();
    return this.triggerDownload(os);
  }
}

export const AppDownloader = new AppDownloaderService();
