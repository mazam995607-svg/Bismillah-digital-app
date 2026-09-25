import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare, Mail, QrCode, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  shopTitle: string;
}

export const AppShareModal: React.FC<Props> = ({ isOpen, onClose, shopTitle }) => {
  const [copied, setCopied] = useState(false);
  const appUrl = window.location.href;
  const shareText = `🌟 *${shopTitle} - Professional POS & Financial Management System*\n\nManage Easyload, Udhaar Khata, Bank Money Transfers, Utility Bills, and 100GB Cloud Sync securely!\n\nOpen & Install App: ${appUrl}`;

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleEmailShare = () => {
    const url = `mailto:?subject=${encodeURIComponent(`${shopTitle} POS Application Link`)}&body=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-slate-100 relative overflow-hidden space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-amber-400 uppercase tracking-wide">
                Share Bismillah POS App
              </h3>
              <p className="text-[10px] text-slate-400">Invite Friends, Dealers & Staff</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Preview Card */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Sparkles className="w-4 h-4" />
            <span>Invitation Message Preview:</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 whitespace-pre-wrap">
            {shareText}
          </p>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleWhatsAppShare}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-extrabold text-xs shadow flex items-center justify-center gap-2 transition"
          >
            <MessageSquare className="w-4 h-4" /> Share via WhatsApp
          </button>

          <button
            onClick={handleEmailShare}
            className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-extrabold text-xs shadow flex items-center justify-center gap-2 transition"
          >
            <Mail className="w-4 h-4" /> Share via Email
          </button>
        </div>

        {/* Copy Link Input */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Direct Application URL:</label>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-2xl">
            <input
              type="text"
              readOnly
              value={appUrl}
              className="flex-grow bg-transparent text-xs text-slate-300 font-mono outline-none px-2 truncate"
            />
            <button
              onClick={handleCopyLink}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* QR Code Graphic Representation */}
        <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl text-slate-950">
            <QrCode className="w-10 h-10" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">Instant QR Code Scanner</span>
            <span className="text-[10px] text-slate-400">Scan this code with any mobile camera to open app on phone</span>
          </div>
        </div>

      </div>
    </div>
  );
};
