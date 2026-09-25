import { AuditLog } from '../types';
import { SecurityManager } from './SecurityManager';

const AUDIT_LOGS_STORAGE_KEY = 'bismillah_audit_logs_v2';
const MAX_BUFFER_LOGS = 500;

export class AuditLogger {
  // Capture & persist an audit event into encrypted local buffer
  static log(
    eventType: string,
    status: 'SUCCESS' | 'FAILED' | 'WARNING',
    method: string,
    details: string
  ): AuditLog {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Device';
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    const deviceName = isMobile ? 'Android / Mobile Terminal' : 'Desktop Workstation';

    const newLog: AuditLog = {
      id: 'LOG-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      timestamp: new Date().toLocaleString(),
      eventType,
      status,
      method,
      details,
      device: deviceName
    };

    try {
      const existingLogs = this.getLogs();
      const updatedLogs = [newLog, ...existingLogs].slice(0, MAX_BUFFER_LOGS);
      const encrypted = SecurityManager.encryptData(updatedLogs);
      localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, encrypted);
    } catch (err) {
      console.error('[AuditLogger] Failed to persist log:', err);
    }

    return newLog;
  }

  // Retrieve decrypted audit logs
  static getLogs(): AuditLog[] {
    try {
      const raw = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
      if (!raw) return [];
      const decrypted = SecurityManager.decryptData(raw);
      return Array.isArray(decrypted) ? decrypted : [];
    } catch {
      return [];
    }
  }

  // Clear audit log buffer (Admin authorized)
  static clearLogs(): void {
    localStorage.removeItem(AUDIT_LOGS_STORAGE_KEY);
    this.log('AUDIT_LOGS_CLEARED', 'WARNING', 'Admin Console', 'Security audit log buffer was reset by administrator.');
  }

  // Export audit logs as formatted JSON file
  static exportLogs(): void {
    const logs = this.getLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bismillah_Audit_Security_Logs_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
