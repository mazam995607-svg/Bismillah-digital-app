export type NetworkType = 
  | 'Jazz' | 'Jazz 2' 
  | 'Telenor' | 'Telenor 2' 
  | 'Zong' | 'Zong 2' 
  | 'Ufone' | 'Ufone 2' 
  | 'Udhaar App';

export interface WalletBalances {
  Jazz: number;
  'Jazz 2': number;
  Telenor: number;
  'Telenor 2': number;
  Zong: number;
  'Zong 2': number;
  Ufone: number;
  'Ufone 2': number;
  'Udhaar App': number;
  loadCash: number;  // Physical Dukan Cash Register
  easyCash: number;  // Digital Cash Register (Easypaisa/JazzCash/Banks)
  [key: string]: number;
}

export interface CommissionBreakdown {
  jazzComm: number;
  jazz2Comm: number;
  zongComm: number;
  zong2Comm: number;
  telenorComm: number;
  telenor2Comm: number;
  ufoneComm: number;
  ufone2Comm: number;
  udhaarAppComm: number;
  installmentsComm: number;
  gameTopupComm: number;
  challanComm: number;
  eduComm: number;
  nadraComm: number;
  onlinePayComm: number;
  bankComm: number;
  [key: string]: number;
}

export interface CustomAccount {
  id: string;
  name: string;
  balance: number;
  createdAt: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: string;
  account: string;
  name: string;
  amount: number;
  comm: number;
  status: 'Paid' | 'Pending';
  isAdd?: boolean;
  kind?: 'easyload' | 'loadPurchase' | 'bankTransfer' | 'udhaar' | 'service' | 'onlinePay' | 'customAccount';
  network?: string;
  totalAmount?: number;
  pendingAmount?: number;
  date: string;
  time: string;
  rawDate: string;
  transferType?: 'Cash In' | 'Cash Out';
  customAccountId?: string;
  customAccountName?: string;
  tag?: string;
  note?: string;
}

export interface UdhaarRecord {
  id: string;
  customerName: string;
  amount: number;
  accountSource: string;
  status: 'Pending' | 'Paid';
  date: string;
  time: string;
  customAccountId?: string;
  customAccountName?: string;
}

export interface SavedNote {
  id: string;
  text: string;
  date: string;
}

export interface RecycleItem {
  id: string;
  kind: 'transaction' | 'note' | 'account';
  label: string;
  payload: any;
  date: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  eventType: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  method: string;
  details: string;
  device: string;
}

export interface BiometricAttemptLog {
  id: string;
  timestamp: string;
  type: 'fingerprint' | 'face' | 'fido2' | 'pin';
  profileName?: string;
  status: 'SUCCESS' | 'FAILED';
  method: string;
  reason?: string;
  device: string;
}

export interface EnrolledFingerprintProfile {
  id: string;
  name: string;
  credentialId: string;
  pinToken?: string;
  enrolledAt: string;
}

export interface EnrolledFaceProfile {
  id: string;
  name: string;
  faceHash: string;
  landmarkFeatures: number[];
  thumbnail?: string;
  enrolledAt: string;
}

export interface EnrolledFidoKey {
  id: string;
  name: string;
  keyId: string;
  enrolledAt: string;
}

export interface SecurityState {
  isLocked: boolean;
  isRegistered: boolean;
  rootEmail: string;
  rootName: string;
  salt?: string;
  pinHash: string;
  passwordHash: string;
  passcode?: string;
  appPin?: string;
  enrolledFingerprints: string[];
  enrolledFaces?: string[];
  isFaceEnrolled: boolean;
  fidoKeys: string[];
  intruderAttempts: number;
  lockedUntil: number | null;
  duressActive: boolean;
  highSecurityThreshold: number;
  theme: 'Deep Navy' | 'Obsidian Black';
  auditLogs: AuditLog[];
  webauthnCredentials?: string[];
  isBiometricEnabled?: boolean;
  lastAuditTime?: string;
}

export interface AlarmSetting {
  id: string;
  name: string;
  time: string; // HH:MM
  enabled: boolean;
  soundType: 'Azan' | 'Islamic Chime' | 'Standard';
}

export interface ScheduledTask {
  id: string;
  title: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  status: 'Scheduled' | 'Successful' | 'Cancelled' | 'Pending';
  alarmTriggered?: boolean;
  createdAt: string;
  note?: string;
}

export interface NotificationSoundSettings {
  notificationsEnabled: boolean;
  appSoundsEnabled: boolean;
  notificationSoundsEnabled: boolean;
  marketAlertsEnabled: boolean;
  enabled?: boolean;
  playAzan?: boolean;
}

export interface MarketItem {
  id: string;
  name: string;
  currentPrice?: string;
  price?: number | string;
  symbol?: string;
  type?: 'gainer' | 'loser' | string;
  change?: string | number;
  changePercent?: number;
  isUp?: boolean;
  category?: string;
  updatedAt?: string;
}



export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  mediaUrl?: string;
  isSearchResults?: boolean;
}
