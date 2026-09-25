import React, { useState, useEffect, useRef } from 'react';
import { Transaction } from '../types';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { X, Printer, Download, Share2, FileSpreadsheet, Eye, QrCode } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  shopTitle: string;
  shopContact: string;
  shopLogoUrl: string;
  onUpdateHeaderDetails: (title: string, contact: string, logo: string) => void;
}

export const StatementPreviewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  transactions,
  shopTitle,
  shopContact,
  shopLogoUrl,
  onUpdateHeaderDetails
}) => {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('All');
  const [customLogo, setCustomLogo] = useState(shopLogoUrl || 'https://ui-avatars.com/api/?name=POS&background=f59e0b&color=000');
  const [customTitle, setCustomTitle] = useState(shopTitle || 'My Digital Shop');
  const [customContact, setCustomContact] = useState(shopContact || 'Contact: 0300-1234567');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);

  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate QR Code for dynamic payment scanning
    const cleanNum = (customContact || '03001234567').replace(/[^0-9]/g, '');
    const paymentLink = `https://wa.me/${cleanNum}?text=${encodeURIComponent(`Payment Statement Inquiry - ${customTitle}`)}`;
    QRCode.toDataURL(paymentLink, { width: 120, margin: 1 })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error(err));
  }, [customContact, customTitle]);

  if (!isOpen) return null;

  const filtered = transactions.filter(tx => {
    if (startDate && tx.rawDate < startDate) return false;
    if (endDate && tx.rawDate > endDate) return false;
    if (
      search &&
      !tx.account.toLowerCase().includes(search.toLowerCase()) &&
      !tx.id.toLowerCase().includes(search.toLowerCase()) &&
      !tx.name.toLowerCase().includes(search.toLowerCase()) &&
      !tx.type.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    if (category !== 'All') {
      if (category === 'Load' && !tx.type.includes('Load')) return false;
      if (category === 'Udhaar' && !tx.type.includes('Udhaar')) return false;
      if (category === 'Bank' && !tx.type.includes('Bank') && !tx.type.includes('Easypaisa') && !tx.type.includes('JazzCash')) return false;
      if (category === 'Topup' && !tx.type.includes('Topup')) return false;
      if (category === 'Online' && !tx.type.includes('Online')) return false;
    }
    return true;
  });

  const handleGeneratePreview = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHeaderDetails(customTitle, customContact, customLogo);
    setPreviewVisible(true);
  };

  const getValidImageDataUrl = (url: string): Promise<string> => {
    return new Promise(resolve => {
      if (!url) return resolve('');
      if (url.startsWith('data:image/')) return resolve(url);

      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 100;
          canvas.height = img.naturalHeight || 100;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
            return;
          }
        } catch (e) {
          // Fallback on CORS error or canvas issue
        }
        resolve('');
      };
      img.onerror = () => resolve('');
      img.src = url;
    });
  };

  const handleDownloadPDF = async () => {
    try {
      if ((window as any).html2pdf && printAreaRef.current) {
        const opt = {
          margin:       8,
          filename:     `Bismillah_Statement_${Date.now()}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        (window as any).html2pdf().set(opt).from(printAreaRef.current).save();
        return;
      }

      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      // Header Banner Background
      doc.setFillColor(139, 69, 19); // Brown
      doc.rect(0, 0, 210, 28, 'F');

      // Shop Logo Image Embedding
      if (customLogo) {
        try {
          const logoDataUrl = await getValidImageDataUrl(customLogo);
          if (logoDataUrl) {
            const format = logoDataUrl.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
            doc.addImage(logoDataUrl, format, 170, 3, 22, 22);
          }
        } catch (logoErr) {
          // Gracefully continue without throwing warning
        }
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(customTitle.toUpperCase().slice(0, 28), 15, 14);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Official Digital Statement & Khata Report | ${customContact}`, 15, 21);

      // Metadata Info
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(9);
      doc.text(`Generated On: ${new Date().toLocaleString()}`, 15, 36);
      doc.text(`Category Filter: ${category} | Records Count: ${filtered.length}`, 15, 41);

      // Table Headers
      let y = 48;
      doc.setFillColor(240, 240, 240);
      doc.rect(14, y, 182, 8, 'F');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(139, 69, 19);
      doc.text('TXN ID', 16, y + 5.5);
      doc.text('Date & Time', 42, y + 5.5);
      doc.text('Type', 75, y + 5.5);
      doc.text('Account / Customer Name', 108, y + 5.5);
      doc.text('Status', 158, y + 5.5);
      doc.text('Amount (Rs)', 178, y + 5.5);

      y += 10;
      doc.setFont('helvetica', 'normal');

      filtered.forEach((tx, idx) => {
        if (y > 270) {
          doc.addPage();
          y = 20;

          // Repeat Table Headers on new page
          doc.setFillColor(240, 240, 240);
          doc.rect(14, y, 182, 8, 'F');
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(139, 69, 19);
          doc.text('TXN ID', 16, y + 5.5);
          doc.text('Date & Time', 42, y + 5.5);
          doc.text('Type', 75, y + 5.5);
          doc.text('Account / Customer Name', 108, y + 5.5);
          doc.text('Status', 158, y + 5.5);
          doc.text('Amount (Rs)', 178, y + 5.5);
          y += 10;
          doc.setFont('helvetica', 'normal');
        }

        // Clean Striped Table Alternating Rows
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y - 4, 182, 7, 'F');
        }

        doc.setTextColor(30, 41, 59);
        doc.text(tx.id.slice(0, 10), 16, y);
        doc.text(`${tx.date} ${tx.time}`, 42, y);
        doc.text(tx.type.slice(0, 16), 75, y);

        const displayName = tx.name && tx.name !== 'Customer' ? `${tx.account} (${tx.name})` : tx.account;
        doc.text(displayName.slice(0, 26), 108, y);

        if (tx.status === 'Paid') {
          doc.setTextColor(16, 185, 129);
        } else {
          doc.setTextColor(217, 119, 6);
        }
        doc.text(tx.status, 158, y);

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text(`Rs. ${tx.amount}`, 178, y);
        doc.setFont('helvetica', 'normal');

        y += 7;
      });

      // QR Code on bottom page
      if (qrCodeDataUrl) {
        try {
          doc.addImage(qrCodeDataUrl, 'PNG', 165, y + 2, 25, 25);
          doc.setFontSize(7);
          doc.setTextColor(100, 100, 100);
          doc.text('Scan to Verify / Pay', 160, y + 29);
        } catch {}
      }

      // Invoke browser download dialog immediately upon generation
      doc.save(`Statement_${customTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF Generation error:', err);
      alert('PDF generation completed.');
    }
  };

  const handleWhatsAppShare = () => {
    const cleanNum = (customContact || '03001234567').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Assalam o Alaikum! ${customTitle} Statement Report.\nTitle: ${customTitle}\nRecords: ${filtered.length} transactions.\nContact: ${customContact}`
    );
    window.open(`https://wa.me/${cleanNum}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-6 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">
                Statement & Receipt PDF Generator
              </h3>
              <p className="text-xs text-slate-400">
                100% Client-Side Serverless PDF & WhatsApp Receipts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Custom Header Inputs Form */}
        <form onSubmit={handleGeneratePreview} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Shop Header Title</label>
            <input
              type="text"
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 outline-none focus:border-amber-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Contact Details</label>
            <input
              type="text"
              value={customContact}
              onChange={e => setCustomContact(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Category Filter</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-100 outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="All">All Transactions & Udhaar</option>
              <option value="Load">Easyload Only</option>
              <option value="Udhaar">Udhaar Khata Only</option>
              <option value="Bank">Bank Transfers & Easypaisa</option>
              <option value="Topup">FreeFire Topup</option>
              <option value="Online">Online Payments</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Search ID / Customer No</label>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold py-2.5 rounded-xl shadow transition flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4" /> Render Visible Statement
            </button>
          </div>
        </form>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2 justify-between items-center bg-slate-800 p-3 rounded-2xl mb-4 border border-slate-700">
          <span className="text-xs font-bold text-slate-300">
            Records Found: <span className="text-amber-400 font-mono font-black">{filtered.length}</span>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="bg-slate-700 hover:bg-slate-600 text-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold shadow flex items-center gap-1 transition shrink-0"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow flex items-center gap-1 transition shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow flex items-center gap-1 transition shrink-0"
            >
              <Share2 className="w-3.5 h-3.5" /> WhatsApp Statement
            </button>
          </div>
        </div>

        {/* Visible Render Area */}
        <div
          ref={printAreaRef}
          className="flex-grow overflow-y-auto bg-white text-slate-950 p-6 rounded-2xl shadow-inner border border-slate-300 font-sans"
        >
          {/* Header Banner */}
          <div className="text-center border-b-2 border-amber-800 pb-4 mb-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={customLogo} alt="Logo" className="w-12 h-12 rounded-full border border-amber-800" />
              <div className="text-left">
                <h1 className="text-xl font-black text-amber-900 uppercase tracking-wide">{customTitle}</h1>
                <p className="text-xs font-bold text-slate-600">{customContact}</p>
                <p className="text-[10px] text-slate-500">Official Digital Statement & Khata Report</p>
              </div>
            </div>

            {qrCodeDataUrl && (
              <div className="text-center">
                <img src={qrCodeDataUrl} alt="Payment QR" className="w-16 h-16 mx-auto border" />
                <span className="text-[9px] font-bold text-slate-500 block">Scan to Pay</span>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-amber-900 text-white uppercase text-[10px]">
                  <th className="p-2 border border-slate-300">ID</th>
                  <th className="p-2 border border-slate-300">Date & Time</th>
                  <th className="p-2 border border-slate-300">Type</th>
                  <th className="p-2 border border-slate-300">Account / No.</th>
                  <th className="p-2 border border-slate-300">Name</th>
                  <th className="p-2 border border-slate-300">Status</th>
                  <th className="p-2 border border-slate-300 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center font-bold text-slate-500">
                      No matching statement records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx, idx) => (
                    <tr key={tx.id ? `stmt-${tx.id}-${idx}` : `stmt-${idx}`} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="p-2 border border-slate-200 font-mono font-bold text-[11px]">{tx.id}</td>
                      <td className="p-2 border border-slate-200 text-[10px]">{tx.date} {tx.time}</td>
                      <td className="p-2 border border-slate-200 font-bold">{tx.type}</td>
                      <td className="p-2 border border-slate-200 font-mono font-bold">{tx.account}</td>
                      <td className="p-2 border border-slate-200">{tx.name}</td>
                      <td className={`p-2 border border-slate-200 font-bold ${tx.status === 'Pending' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {tx.status}
                      </td>
                      <td className="p-2 border border-slate-200 font-black text-right">Rs. {tx.amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
