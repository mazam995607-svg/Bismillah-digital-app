import jsPDF from 'jspdf';
import { Transaction } from '../types';

export const downloadCombinedTransactionsPDF = (
  selectedTransactions: Transaction[],
  shopTitle: string = 'DigiDukaan POS',
  shopContact: string = 'Contact: 0300-1234567'
) => {
  if (!selectedTransactions || selectedTransactions.length === 0) {
    alert('No transactions selected for PDF export.');
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header Background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  // Title
  doc.setTextColor(245, 158, 11); // amber-500
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(shopTitle, 14, 14);

  // Subtitle
  doc.setTextColor(226, 232, 240); // slate-200
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${shopContact} | Combined Transaction Batch Report`, 14, 22);

  // Date Generated
  const nowStr = new Date().toLocaleString();
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated on: ${nowStr}`, 14, 28);

  // Summary Cards
  const totalAmount = selectedTransactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const totalComm = selectedTransactions.reduce((acc, t) => acc + (Number(t.comm) || 0), 0);

  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(14, 36, 58, 16, 2, 2, 'F');
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(76, 36, 58, 16, 2, 2, 'F');
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(138, 36, 58, 16, 2, 2, 'F');

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.text('TOTAL COUNT', 18, 41);
  doc.text('TOTAL VOLUME', 80, 41);
  doc.text('TOTAL COMMISSION', 142, 41);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`${selectedTransactions.length} Items`, 18, 48);
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text(`Rs. ${totalAmount.toLocaleString()}`, 80, 48);
  doc.setTextColor(245, 158, 11); // amber-500
  doc.text(`Rs. ${totalComm.toLocaleString()}`, 142, 48);

  // Table Headers
  let y = 60;
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y - 4, 182, 8, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(245, 158, 11);
  doc.text('Date & Time', 16, y);
  doc.text('Tx ID', 50, y);
  doc.text('Service / Tag', 78, y);
  doc.text('Account / Name', 115, y);
  doc.text('Amount (Rs)', 160, y);
  doc.text('Status', 185, y);

  y += 6;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  selectedTransactions.forEach((tx, idx) => {
    if (y > 270) {
      doc.addPage();
      y = 20;

      // Repeat Table Header
      doc.setFillColor(15, 23, 42);
      doc.rect(14, y - 4, 182, 8, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(245, 158, 11);
      doc.text('Date & Time', 16, y);
      doc.text('Tx ID', 50, y);
      doc.text('Service / Tag', 78, y);
      doc.text('Account / Name', 115, y);
      doc.text('Amount (Rs)', 160, y);
      doc.text('Status', 185, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
    }

    if (idx % 2 === 0) {
      doc.setFillColor(241, 245, 249); // light grey
      doc.rect(14, y - 3.5, 182, 6.5, 'F');
    }

    doc.setTextColor(15, 23, 42);
    doc.text(`${tx.date} ${tx.time}`, 16, y);
    doc.text(`${tx.id.slice(0, 12)}`, 50, y);

    const serviceAndTag = `${tx.type} [${tx.tag || 'General'}]`;
    doc.text(serviceAndTag.length > 20 ? serviceAndTag.slice(0, 20) + '..' : serviceAndTag, 78, y);

    const acctAndName = `${tx.account} (${tx.name || 'N/A'})`;
    doc.text(acctAndName.length > 22 ? acctAndName.slice(0, 22) + '..' : acctAndName, 115, y);

    doc.setFont('helvetica', 'bold');
    doc.text(`${tx.amount.toLocaleString()}`, 160, y);

    if (tx.status === 'Paid') {
      doc.setTextColor(16, 185, 129); // emerald
    } else {
      doc.setTextColor(217, 119, 6); // amber
    }
    doc.text(`${tx.status}`, 185, y);
    doc.setFont('helvetica', 'normal');

    y += 7;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${shopTitle} POS - Page ${i} of ${pageCount} | Confidential Ledger`,
      14,
      290
    );
  }

  doc.save(`Transactions_${shopTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};
