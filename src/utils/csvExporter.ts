import { Transaction } from '../types';

export const exportTransactionsToCSV = (
  transactions: Transaction[],
  filenamePrefix = 'Bismillah_Ledger'
) => {
  if (!transactions || transactions.length === 0) {
    alert('No transactions available in the current list to export.');
    return;
  }

  // Header row
  const headers = [
    'Transaction ID',
    'Date',
    'Time',
    'Type/Service',
    'Category Tag',
    'Account / Phone Number',
    'Customer Name',
    'Amount (PKR)',
    'Commission (PKR)',
    'Status',
    'Network / Kind'
  ];

  // Map transactions to CSV rows, escaping double quotes properly
  const rows = transactions.map(t => [
    `"${t.id}"`,
    `"${t.date}"`,
    `"${t.time}"`,
    `"${t.type.replace(/"/g, '""')}"`,
    `"${(t.tag || 'General').replace(/"/g, '""')}"`,
    `"${t.account.replace(/"/g, '""')}"`,
    `"${(t.name || '').replace(/"/g, '""')}"`,
    t.amount || 0,
    t.comm || 0,
    `"${t.status}"`,
    `"${(t.network || t.kind || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
