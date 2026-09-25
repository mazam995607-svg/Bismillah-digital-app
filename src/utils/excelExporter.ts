import * as XLSX from 'xlsx';
import { Transaction } from '../types';

export const exportTransactionsToXLSX = (
  transactions: Transaction[],
  filenamePrefix = 'Bismillah_Ledger'
) => {
  if (!transactions || transactions.length === 0) {
    alert('No transactions available in the current list to export.');
    return;
  }

  // Format data cleanly for Excel
  const excelData = transactions.map((t, index) => ({
    'Sr No': index + 1,
    'Transaction ID': t.id,
    'Date': t.date,
    'Time': t.time,
    'Service / Type': t.type,
    'Category Tag': t.tag || 'General',
    'Account / Phone': t.account,
    'Customer Name': t.name || 'N/A',
    'Amount (PKR)': t.amount,
    'Commission (PKR)': t.comm,
    'Status': t.status,
    'Transfer Kind': t.transferType || t.kind || 'N/A',
    'Note / Remarks': t.note || ''
  }));

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths for professional formatting
  worksheet['!cols'] = [
    { wch: 6 },  // Sr No
    { wch: 18 }, // Transaction ID
    { wch: 12 }, // Date
    { wch: 10 }, // Time
    { wch: 20 }, // Service / Type
    { wch: 14 }, // Category Tag
    { wch: 18 }, // Account / Phone
    { wch: 18 }, // Customer Name
    { wch: 15 }, // Amount
    { wch: 16 }, // Commission
    { wch: 10 }, // Status
    { wch: 14 }, // Transfer Kind
    { wch: 25 }, // Note / Remarks
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ledger Transactions');

  // Generate file download
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filenamePrefix}_${dateStr}.xlsx`);
};
