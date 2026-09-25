import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, Fingerprint, KeyRound, 
  Search, RefreshCw, Trash2, X, CheckCircle2, XCircle, 
  Smartphone, Shield, Filter, Clock, Download, Table, LayoutList
} from 'lucide-react';
import { BiometricAttemptLog } from '../types';
import { SecurityManager } from '../utils/SecurityManager';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BiometricHistoryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<BiometricAttemptLog[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'SUCCESS' | 'FAILED' | 'fingerprint' | 'fido2'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const loadLogs = () => {
    const fetched = SecurityManager.getBiometricAttempts();
    setLogs(fetched);
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    if (filterType === 'SUCCESS' && log.status !== 'SUCCESS') return false;
    if (filterType === 'FAILED' && log.status !== 'FAILED') return false;
    if (filterType === 'fingerprint' && log.type !== 'fingerprint') return false;
    if (filterType === 'fido2' && log.type !== 'fido2') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMethod = log.method.toLowerCase().includes(q);
      const matchProfile = (log.profileName || '').toLowerCase().includes(q);
      const matchDevice = (log.device || '').toLowerCase().includes(q);
      const matchReason = (log.reason || '').toLowerCase().includes(q);
      const matchTime = log.timestamp.toLowerCase().includes(q);
      return matchMethod || matchProfile || matchDevice || matchReason || matchTime;
    }
    return true;
  });

  const totalAttempts = logs.length;
  const successCount = logs.filter(l => l.status === 'SUCCESS').length;
  const failedCount = logs.filter(l => l.status === 'FAILED').length;
  const successRate = totalAttempts > 0 ? Math.round((successCount / totalAttempts) * 100) : 100;

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear biometric verification history?')) {
      SecurityManager.clearBiometricAttempts();
      setLogs([]);
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Status', 'Type', 'Method', 'Profile', 'Device', 'Reason'];
    const rows = logs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.status}"`,
      `"${l.type}"`,
      `"${l.method}"`,
      `"${l.profileName || ''}"`,
      `"${l.device}"`,
      `"${l.reason || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Biometric_Security_Audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Fingerprint className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-100">
                  Biometric & Passkey Access Audit Log
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Live Sensor Oversight
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Detailed tabular log of successful and failed authentication attempts with timestamps & device status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Toggle View Mode"
            >
              {viewMode === 'table' ? <LayoutList className="w-4 h-4" /> : <Table className="w-4 h-4" />}
              <span className="hidden sm:inline">{viewMode === 'table' ? 'Card View' : 'Table View'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-950/60 border-b border-slate-800/80 shrink-0">
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Total Scans</span>
            <span className="text-lg font-black font-mono text-slate-100">{totalAttempts}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide block">Success Rate</span>
            <span className="text-lg font-black font-mono text-emerald-400">{successRate}%</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide block">Granted</span>
            <span className="text-lg font-black font-mono text-emerald-300">{successCount}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide block">Blocked / Failed</span>
            <span className="text-lg font-black font-mono text-rose-400">{failedCount}</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex flex-wrap gap-2 items-center justify-between shrink-0">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by profile, method, device, timestamp..."
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-xl focus:border-amber-500 outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterType('ALL')}
              className={`text-xs px-2.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setFilterType('SUCCESS')}
              className={`text-xs px-2.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                filterType === 'SUCCESS'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Granted
            </button>
            <button
              onClick={() => setFilterType('FAILED')}
              className={`text-xs px-2.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                filterType === 'FAILED'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Denied
            </button>
            <button
              onClick={() => setFilterType('fingerprint')}
              className={`text-xs px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                filterType === 'fingerprint'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" /> Fingerprint
            </button>
            <button
              onClick={() => setFilterType('fido2')}
              className={`text-xs px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                filterType === 'fido2'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" /> Passkey / FIDO2
            </button>
          </div>
        </div>

        {/* Logs List / Tabular Content */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[240px]">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="font-bold text-sm">No biometric authentication attempts match the criteria.</p>
              <p className="text-xs text-slate-500">Live authentication events will be dynamically recorded and rendered here.</p>
            </div>
          ) : viewMode === 'table' ? (
            /* TABULAR VIEW */
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/80">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Auth Method</th>
                      <th className="py-3 px-4">Profile Name</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Device & Host Info</th>
                      <th className="py-3 px-4">Event Outcome / Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredLogs.map(log => {
                      const isSuccess = log.status === 'SUCCESS';
                      return (
                        <tr key={log.id} className="hover:bg-slate-900/60 transition">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 font-black px-2.5 py-1 rounded-lg text-[10px] ${
                                isSuccess
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {isSuccess ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-rose-400" />}
                              {isSuccess ? 'GRANTED' : 'DENIED'}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-100 flex items-center gap-1.5">
                              {log.type === 'fingerprint' && <Fingerprint className="w-4 h-4 text-amber-400" />}
                              {log.type === 'fido2' && <KeyRound className="w-4 h-4 text-cyan-400" />}
                              {log.type === 'pin' && <Shield className="w-4 h-4 text-slate-400" />}
                              <span>{log.method}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-amber-300">
                            {log.profileName || '—'}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                            {log.timestamp}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px] flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{log.device}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-300 text-[11px]">
                            {log.reason ? (
                              <span className="text-rose-400 font-medium">{log.reason}</span>
                            ) : (
                              <span className="text-emerald-400 font-medium">Valid biometric/passkey signature match</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* CARDS VIEW */
            <div className="space-y-2.5">
              {filteredLogs.map(log => {
                const isSuccess = log.status === 'SUCCESS';
                return (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isSuccess
                        ? 'bg-slate-950/70 border-emerald-500/20 hover:border-emerald-500/40'
                        : 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isSuccess
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {log.type === 'fingerprint' && <Fingerprint className="w-5 h-5" />}
                          {log.type === 'fido2' && <KeyRound className="w-5 h-5" />}
                          {log.type === 'pin' && <Shield className="w-5 h-5" />}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-slate-100">
                              {log.method}
                            </span>
                            {log.profileName && (
                              <span className="text-[10px] bg-slate-800 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-slate-700">
                                {log.profileName}
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                isSuccess
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {isSuccess ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-rose-400" />}
                              {isSuccess ? 'GRANTED' : 'DENIED'}
                            </span>
                          </div>

                          {log.reason && (
                            <p className="text-xs text-rose-300 font-medium">
                              Reason: {log.reason}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" /> {log.timestamp}
                            </span>
                            <span className="flex items-center gap-1">
                              <Smartphone className="w-3 h-3 text-slate-500" /> {log.device}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">
                              ID: {log.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={loadLogs}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Refresh
            </button>
            <button
              onClick={handleExportCSV}
              disabled={logs.length === 0}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" /> Export CSV
            </button>
            {logs.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition border border-rose-500/30 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear History
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs hover:from-amber-400 hover:to-yellow-300 transition active:scale-95 shadow-md cursor-pointer"
          >
            Close Audit
          </button>
        </div>

      </div>
    </div>
  );
};
