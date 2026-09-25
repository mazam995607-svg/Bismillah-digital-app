import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Transaction } from '../types';
import { QrCode, X, Copy, Check, Download, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  shopTitle?: string;
  shopContact?: string;
}

export const TransactionQRModal: React.FC<Props> = ({
  isOpen,
  onClose,
  transaction,
  shopTitle = 'BISMILLAH TELECOM',
  shopContact = '0300-1234567'
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !transaction) return null;

  // JSON summary payload stringified for scanning
  const qrPayload = JSON.stringify({
    shop: shopTitle,
    contact: shopContact,
    txId: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    account: transaction.account,
    name: transaction.name,
    date: `${transaction.date} ${transaction.time}`,
    status: transaction.status,
    note: transaction.note || ''
  }, null, 2);

  const handleCopyText = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svgElement = document.getElementById('tx-qr-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `QR_${transaction.id}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4 relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-amber-400">Transaction QR Code</h3>
              <p className="text-[10px] text-slate-400">Scan for instant verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Canvas Frame */}
        <div className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center shadow-inner border border-slate-200">
          <QRCodeSVG
            id="tx-qr-svg"
            value={qrPayload}
            size={180}
            level="H"
            includeMargin={true}
            fgColor="#0f172a"
          />
          <span className="mt-2 text-[10px] font-mono font-bold text-slate-600 tracking-wider">
            ID: {transaction.id}
          </span>
        </div>

        {/* Transaction Brief Details */}
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
          <div className="flex justify-between text-slate-300">
            <span className="font-bold">{transaction.type}</span>
            <span className="font-mono font-black text-amber-400">Rs. {transaction.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{transaction.account} &bull; {transaction.name}</span>
            <span className={transaction.status === 'Paid' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {transaction.status}
            </span>
          </div>
          {transaction.note && (
            <div className="text-[10px] text-amber-300/90 pt-1 border-t border-slate-800/80 italic flex items-center gap-1">
              <Info className="w-3 h-3 text-amber-400 shrink-0" /> "{transaction.note}"
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleDownloadQR}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
          >
            <Download className="w-3.5 h-3.5" /> Download QR
          </button>
          <button
            onClick={handleCopyText}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Payload' : 'Copy Payload'}
          </button>
        </div>
      </div>
    </div>
  );
};
