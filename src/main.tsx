import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Global silent handler for dev-mode / WebSocket connection retries & HMR status checks
if (typeof window !== 'undefined') {
  // Suppress WebSocket errors from console.error, console.warn, and console.info
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleInfo = console.info;

  const isWsNoise = (args: any[]): boolean => {
    const text = args.map(arg => {
      if (arg instanceof Error) return `${arg.name} ${arg.message} ${arg.stack}`;
      return typeof arg === 'object' ? JSON.stringify(arg) : String(arg || '');
    }).join(' ');

    const lower = text.toLowerCase();
    return (
      lower.includes('websocket') ||
      lower.includes('failed to connect to websocket') ||
      lower.includes('vite:ws') ||
      lower.includes('[vite]') ||
      lower.includes('hmr') ||
      lower.includes('ws://') ||
      lower.includes('wss://') ||
      lower.includes('closed before the connection was established') ||
      lower.includes('connection to ws') ||
      lower.includes('connection to wss') ||
      lower.includes('eventsource') ||
      lower.includes('hot module replacement')
    );
  };

  console.error = (...args: any[]) => {
    if (isWsNoise(args)) return;
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    if (isWsNoise(args)) return;
    originalConsoleWarn.apply(console, args);
  };

  console.info = (...args: any[]) => {
    if (isWsNoise(args)) return;
    originalConsoleInfo.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = String(event.reason?.message || event.reason?.stack || event.reason || '');
    const lower = reason.toLowerCase();
    if (
      lower.includes('websocket') ||
      lower.includes('vite') ||
      lower.includes('hmr') ||
      lower.includes('failed to connect') ||
      lower.includes('closed before the connection') ||
      lower.includes('ws://') ||
      lower.includes('wss://') ||
      lower.includes('/@vite') ||
      lower.includes('__vite_ping')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = String(event.message || event.filename || '');
    const lower = msg.toLowerCase();
    if (
      lower.includes('websocket') ||
      lower.includes('vite') ||
      lower.includes('hmr') ||
      lower.includes('failed to connect') ||
      lower.includes('closed before the connection') ||
      lower.includes('ws://') ||
      lower.includes('wss://') ||
      lower.includes('/@vite') ||
      lower.includes('__vite_ping')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}

// Production-Ready Service Worker Registration for Complete Offline POS Capabilities
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => {
        console.info('[Bismillah POS] Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('[Bismillah POS] Service Worker registration failed:', err);
      });
  });

  // Listen for READY_OFFLINE message to display notification after first successful cache
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'READY_OFFLINE') {
      const toast = document.createElement('div');
      toast.id = 'bismillah-offline-ready-toast';
      toast.className = 'fixed bottom-4 right-4 z-[9999] bg-emerald-900 border border-emerald-500/60 text-emerald-100 text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce';
      toast.innerHTML = `<span>✓</span> <span>Ready to use offline! All assets cached.</span>`;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.transition = 'opacity 0.5s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
      }, 4000);
    }
  });

  // Automatically flush optimistic transaction queue when network connectivity is restored
  window.addEventListener('online', () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'TRIGGER_SYNC_NOW' });
    }
  });
}



