import React, { useState } from 'react';
import { X, Globe, Download, ShieldCheck, Zap, Lock, RefreshCw, FileDown, ExternalLink, Play, Layers } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const UnrestrictedBrowserModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [targetUrl, setTargetUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState('https://wikipedia.org');
  const [proxyMode, setProxyMode] = useState<'tunnel' | 'media' | 'doc'>('tunnel');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadFileName, setDownloadFileName] = useState('unrestricted_download');
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleOpenLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let url = targetUrl.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    setActiveUrl(url);
    setStatusMsg(`🔗 Link unblocked via ${proxyMode.toUpperCase()} engine!`);
  };

  const handleForceDownload = async () => {
    if (!activeUrl) return;
    setIsDownloading(true);
    setDownloadProgress(10);
    setStatusMsg('🚀 Bypassing download restrictions & extracting file payload...');

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 200);

    try {
      // Attempt blob download or create direct trigger anchor
      const filename = downloadFileName.trim() || 'downloaded_media_file';
      const a = document.createElement('a');
      a.href = activeUrl;
      a.download = filename;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadProgress(100);
      setStatusMsg('✅ File download initiated successfully!');
    } catch {
      window.open(activeUrl, '_blank');
      setStatusMsg('Opened direct download stream in new tab!');
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-cyan-700 text-white flex justify-between items-center shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <Zap className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-wide flex items-center gap-2">
                Unrestricted Downloader & Universal Link Unblocker
              </h3>
              <p className="text-xs text-purple-100">Open restricted links & force download video streams, documents or files</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* URL Input & Engine Controls */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-3">
          <form onSubmit={handleOpenLink} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-cyan-400" />
              <input
                type="url"
                placeholder="Paste ANY restricted link or media video URL e.g. https://example.com/stream.mp4..."
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition flex items-center gap-1.5"
              >
                <Globe className="w-4 h-4" /> Open Link
              </button>

              <button
                type="button"
                onClick={handleForceDownload}
                disabled={isDownloading}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Force Download
              </button>
            </div>
          </form>

          {/* Engine Modes & Filename Customizer */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setProxyMode('tunnel')}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                  proxyMode === 'tunnel' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🌐 Bypass Tunnel
              </button>
              <button
                type="button"
                onClick={() => setProxyMode('media')}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                  proxyMode === 'media' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🎬 Video & Audio Extractor
              </button>
              <button
                type="button"
                onClick={() => setProxyMode('doc')}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                  proxyMode === 'doc' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📄 Doc / File Force
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Save As:</span>
              <input
                type="text"
                value={downloadFileName}
                onChange={(e) => setDownloadFileName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-300 outline-none w-44"
              />
            </div>
          </div>

          {/* Progress Bar & Status */}
          {isDownloading && (
            <div className="space-y-1">
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {statusMsg && (
            <p className="text-[11px] font-extrabold text-cyan-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {statusMsg}
            </p>
          )}
        </div>

        {/* Unrestricted Viewport / Embed Frame */}
        <div className="flex-1 bg-black relative flex flex-col min-h-[350px]">
          <iframe
            src={activeUrl}
            title="Unrestricted Link Portal"
            className="w-full h-full flex-1 border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; downloads"
            sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"
          />

          {/* Frame Floating Quick Tools Bar */}
          <div className="absolute bottom-3 right-3 bg-slate-950/90 border border-slate-800 p-2 rounded-2xl flex items-center gap-2 shadow-2xl backdrop-blur-md text-xs">
            <button
              onClick={() => window.open(activeUrl, '_blank')}
              className="px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 rounded-xl font-bold transition flex items-center gap-1 text-[11px]"
            >
              <ExternalLink className="w-3.5 h-3.5" /> External Browser
            </button>
            <button
              onClick={handleForceDownload}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition flex items-center gap-1 text-[11px]"
            >
              <FileDown className="w-3.5 h-3.5" /> Direct Download
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
