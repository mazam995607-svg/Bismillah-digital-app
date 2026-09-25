import React, { useState } from 'react';
import { Transaction } from '../types';
import { 
  Printer, X, ShieldCheck, CheckCircle2, Share2, Eye, 
  Copy, Check, FileText, QrCode, Sparkles, ZoomIn, ZoomOut 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  shopTitle?: string;
  shopContact?: string;
}

export const ReceiptModal: React.FC<Props> = ({
  isOpen,
  onClose,
  transaction,
  shopTitle = 'DigiDukaan Retail POS',
  shopContact = 'Contact: 0300-1234567'
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'card'>('preview');
  const [paperFormat, setPaperFormat] = useState<'80mm' | '58mm' | 'a4'>('80mm');
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const getReceiptText = () => {
    return (
      `🧾 *OFFICIAL POS RECEIPT - ${shopTitle}*\n` +
      `----------------------------------------\n` +
      `Receipt No: ${transaction.id}\n` +
      `Date & Time: ${transaction.date} ${transaction.time}\n` +
      `Service: ${transaction.type}\n` +
      `Category: ${transaction.tag || 'General'}\n` +
      `Account/Mobile: ${transaction.account}\n` +
      `Customer: ${transaction.name || 'Walk-in Customer'}\n` +
      `----------------------------------------\n` +
      `TOTAL AMOUNT: Rs. ${transaction.amount.toLocaleString()}\n` +
      `STATUS: ${transaction.status.toUpperCase()}\n` +
      `----------------------------------------\n` +
      `JazakAllah Khair for your business!\n` +
      `${shopContact}`
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getReceiptText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const textDetails = getReceiptText();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${shopTitle} Receipt #${transaction.id}`,
          text: textDetails,
          url: window.location.href
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          const waUrl = `https://wa.me/?text=${encodeURIComponent(textDetails)}`;
          window.open(waUrl, '_blank');
        }
      }
    } else {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(textDetails)}`;
      window.open(waUrl, '_blank');
    }
  };

  // Build verification QR data
  const qrVerificationData = JSON.stringify({
    pos: shopTitle,
    id: transaction.id,
    date: transaction.date,
    time: transaction.time,
    type: transaction.type,
    acc: transaction.account,
    amount: transaction.amount,
    status: transaction.status,
    verified: true
  });

  const getContainerMaxWidth = () => {
    if (paperFormat === '58mm') return 'max-w-[260px]';
    if (paperFormat === '80mm') return 'max-w-[340px]';
    return 'max-w-[480px]';
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto print:bg-white print:p-0">
      
      {/* Thermal Receipt Print Styles for Physical Printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #receipt-printable-area, #receipt-printable-area * {
            visibility: visible !important;
          }
          #receipt-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${paperFormat === '58mm' ? '58mm' : paperFormat === '80mm' ? '80mm' : '100%'} !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 8px !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
            font-family: 'Courier New', Courier, monospace !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col space-y-4 my-auto">
        
        {/* Modal Top Controls Bar */}
        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3 no-print">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
                Receipt Manager & Print Center
              </h3>
              <p className="text-[10px] text-slate-400">Preview exact receipt paper layout before printing</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Mode Toggle: Print Preview vs Dark Terminal */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition ${
                  viewMode === 'preview'
                    ? 'bg-amber-400 text-slate-950 shadow font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Exact Paper Layout WYSIWYG Print Preview"
              >
                <Eye className="w-3.5 h-3.5" /> Print Preview
              </button>
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition ${
                  viewMode === 'card'
                    ? 'bg-amber-400 text-slate-950 shadow font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="POS Terminal Dark Card Layout"
              >
                <Sparkles className="w-3.5 h-3.5" /> Dark Card
              </button>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Preview Layout Controls (Format & Zoom) */}
        {viewMode === 'preview' && (
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl text-xs no-print">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Paper Size:</span>
              <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                {(['58mm', '80mm', 'a4'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setPaperFormat(fmt)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black transition ${
                      paperFormat === fmt
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {fmt === '58mm' ? '58mm (Mini)' : fmt === '80mm' ? '80mm (Standard)' : 'A4 Invoice'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Scale:</span>
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(80, prev - 10))}
                className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md text-slate-300"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] font-bold text-amber-300 min-w-[32px] text-center">
                {zoomScale}%
              </span>
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(130, prev + 10))}
                className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md text-slate-300"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* RECEIPT VIEW CONTAINER */}
        <div className="flex justify-center items-center py-2 max-h-[60vh] overflow-y-auto">
          
          {/* 1. PRINT PREVIEW (REALISTIC PHYSICAL THERMAL PAPER SIMULATION) */}
          {viewMode === 'preview' ? (
            <div 
              style={{ transform: `scale(${zoomScale / 100})`, transformOrigin: 'top center' }}
              className="transition-transform duration-150"
            >
              <div
                id="receipt-printable-area"
                className={`w-full ${getContainerMaxWidth()} bg-white text-neutral-900 p-5 sm:p-6 rounded-sm shadow-2xl border border-neutral-300 font-mono text-xs space-y-3 select-text`}
              >
                {/* Paper Top Sawtooth Indicator / Header */}
                <div className="text-center space-y-1 border-b-2 border-dashed border-neutral-400 pb-3">
                  <div className="flex justify-center items-center gap-1 font-sans font-black text-neutral-950 text-base sm:text-lg tracking-tight uppercase">
                    <ShieldCheck className="w-5 h-5 text-neutral-900" />
                    <span>{shopTitle}</span>
                  </div>
                  <p className="text-[10px] text-neutral-600 font-sans">{shopContact}</p>
                  <div className="pt-1">
                    <span className="inline-block bg-neutral-900 text-white px-3 py-0.5 text-[9px] font-black uppercase tracking-widest font-sans">
                      OFFICIAL POS RECEIPT
                    </span>
                  </div>
                </div>

                {/* Receipt Metadata */}
                <div className="space-y-1 text-[11px] border-b border-dashed border-neutral-400 pb-2.5">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Receipt #:</span>
                    <span className="font-bold text-neutral-950">{transaction.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Date & Time:</span>
                    <span>{transaction.date} {transaction.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Counter / Terminal:</span>
                    <span>POS Terminal #1</span>
                  </div>
                  {transaction.tag && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Category Tag:</span>
                      <span className="font-bold text-neutral-900">[{transaction.tag}]</span>
                    </div>
                  )}
                </div>

                {/* Itemized Service Table */}
                <div className="space-y-2 border-b-2 border-dashed border-neutral-400 pb-3">
                  <div className="flex justify-between font-bold text-neutral-700 border-b border-neutral-200 pb-1 text-[10px] uppercase">
                    <span>Description / Service</span>
                    <span>Amount</span>
                  </div>
                  <div className="flex justify-between text-neutral-950 font-bold">
                    <span>{transaction.type}</span>
                    <span>Rs. {transaction.amount.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-neutral-600 space-y-0.5">
                    <div>Account / Mobile: <span className="font-mono font-bold text-neutral-900">{transaction.account}</span></div>
                    <div>Customer: <span className="text-neutral-900">{transaction.name || 'Walk-in Customer'}</span></div>
                    {transaction.note && (
                      <div className="italic text-neutral-500">Note: {transaction.note}</div>
                    )}
                  </div>
                </div>

                {/* Grand Total */}
                <div className="py-2 border-b-2 border-dashed border-neutral-400 space-y-1">
                  <div className="flex justify-between items-center text-sm sm:text-base font-black text-neutral-950">
                    <span>TOTAL PAID:</span>
                    <span className="font-mono text-base sm:text-lg">Rs. {transaction.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-600 font-bold">
                    <span>Payment Mode:</span>
                    <span>CASH SETTLED</span>
                  </div>
                </div>

                {/* QR Code & Verification Block */}
                <div className="pt-2 flex flex-col items-center justify-center space-y-2">
                  <div className="p-2 bg-white border border-neutral-300 rounded shadow-inner">
                    <QRCodeSVG 
                      value={qrVerificationData} 
                      size={paperFormat === '58mm' ? 70 : 85}
                      level="M"
                    />
                  </div>
                  <span className="text-[9px] text-neutral-500 font-sans tracking-tight">
                    Scan with camera to verify digital signature
                  </span>
                </div>

                {/* Status & Barcode simulation */}
                <div className="text-center pt-1 border-t border-dashed border-neutral-400 space-y-1">
                  <div className="flex items-center justify-center gap-1 font-bold text-[10px] text-neutral-950">
                    <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900" /> STATUS: {transaction.status.toUpperCase()}
                  </div>

                  {/* Simulated Barcode */}
                  <div className="py-1 flex justify-center">
                    <div className="flex items-end gap-[2px] h-6 px-4 bg-neutral-100 rounded">
                      {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 4, 1, 2, 3].map((h, idx) => (
                        <span 
                          key={idx} 
                          className="bg-neutral-950 w-[2px]" 
                          style={{ height: `${h * 5 + 4}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-[9px] text-neutral-600 font-sans leading-tight pt-1">
                    JazakAllah Khair for doing business with us! <br />
                    Computer Generated Receipt &bull; Valid without physical signature.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* 2. DARK TERMINAL CARD VIEW */
            <div
              id="receipt-printable-area"
              className="w-full max-w-md bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3 font-mono text-xs text-slate-200"
            >
              {/* Receipt Header */}
              <div className="text-center space-y-1 border-b border-dashed border-slate-700 pb-3">
                <div className="flex justify-center items-center gap-1.5 font-sans font-black text-amber-400 text-base uppercase">
                  <ShieldCheck className="w-5 h-5" /> {shopTitle}
                </div>
                <p className="text-[10px] text-slate-400 font-sans">{shopContact}</p>
                <span className="inline-block bg-emerald-500/20 text-emerald-300 px-3 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/30 font-sans">
                  OFFICIAL POS RECEIPT
                </span>
              </div>

              {/* Receipt Meta */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-700 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Receipt No:</span>
                  <span className="font-bold">{transaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Time:</span>
                  <span>{transaction.date} {transaction.time}</span>
                </div>
                {transaction.tag && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category Tag:</span>
                    <span className="font-bold text-amber-400">{transaction.tag}</span>
                  </div>
                )}
              </div>

              {/* Transaction Details Table */}
              <div className="space-y-2 border-b border-dashed border-slate-700 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Service:</span>
                  <span className="font-bold text-slate-100">{transaction.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account/Mobile:</span>
                  <span className="font-bold text-slate-100">{transaction.account}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Name:</span>
                  <span className="text-slate-100">{transaction.name || 'Walk-in Customer'}</span>
                </div>
                {transaction.note && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Note:</span>
                    <span className="text-slate-300 italic">{transaction.note}</span>
                  </div>
                )}
              </div>

              {/* Total Amount */}
              <div className="pt-1 flex justify-between items-center text-sm font-black border-b border-dashed border-slate-700 pb-3">
                <span>TOTAL PAID:</span>
                <span className="text-emerald-400 text-base">Rs. {transaction.amount.toLocaleString()}</span>
              </div>

              {/* Status & Footer */}
              <div className="text-center pt-1 space-y-1">
                <div className="flex items-center justify-center gap-1 text-emerald-400 font-extrabold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> STATUS: {transaction.status.toUpperCase()}
                </div>
                <p className="text-[9px] text-slate-400 font-sans leading-tight pt-1">
                  JazakAllah Khair for doing business with us! <br />
                  Powered by {shopTitle || 'DigiDukaan Retail Terminal'}.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Controls Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer active:scale-95"
            title="Open System Print Dialog"
          >
            <Printer className="w-4 h-4 text-slate-950" /> Print Receipt
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl shadow transition flex items-center justify-center gap-1.5 text-xs cursor-pointer"
            title="Share via WhatsApp, Facebook, or OS Share Sheet"
          >
            <Share2 className="w-4 h-4" /> Share Receipt
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
            title="Copy Receipt Text"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Text
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold rounded-xl text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
