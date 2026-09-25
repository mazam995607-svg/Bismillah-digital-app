// Comprehensive Language Translation Engine for DigiDukaan POS

export type LanguageCode = 'en' | 'ur' | 'rom';

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Header & Navigation
    shopTitle: 'DigiDukaan Retail POS',
    contact: 'Contact: 0300-1234567',
    easyload: 'Easyload & Recharges',
    bankTransfer: 'Bank & Money Transfer',
    utilityBills: 'Utility Bills & Challan',
    udhaarKhata: 'Udhaar Khata Ledger',
    customAccounts: 'Other Custom Accounts',
    cashRegisters: 'Cash Registers & Drawers',
    commissionBreakdown: 'Commissions & Earnings',
    currencyConverter: 'Currency Rates',
    aiAssistant: '3D AI Parrot Assistant',
    settings: 'Terminal Control Center',
    lockApp: 'Lock POS Terminal',
    
    // Dashboard & Stats
    totalBalance: 'Total Shop Balance',
    todaySales: 'Today\'s Total Sales',
    todayProfit: 'Today\'s Net Commission',
    pendingUdhaar: 'Outstanding Udhaar',
    recentTransactions: 'Recent Shop Transactions',
    searchPlaceholder: 'Search transactions by name, phone, or ID...',
    noTransactions: 'No transactions recorded yet.',
    
    // Actions & Buttons
    addTransaction: 'Record Transaction',
    addBalance: 'Add Wallet Balance',
    clearBalance: 'Clear Balance',
    giveUdhaar: 'Give Udhaar',
    printReceipt: 'Print Receipt',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save Changes',
    confirm: 'Confirm',
    shareApp: 'Share POS App',
    
    // Settings & Control
    accountSecurity: 'Account & Security (Email / Password)',
    storageAnalytics: 'Storage Analytics (100 GB Cloud)',
    themeLanguage: 'Theme & Language Settings',
    backgroundGallery: 'Responsive Background Gallery',
    dailyMicroRent: 'Daily Shop Micro-Rent System',
    lightTheme: 'Light Theme Mode',
    darkTheme: 'Dark Theme Mode',
    changeEmail: 'Change Account Email',
    updatePassword: 'Update Password & 6-Digit PIN',
    deleteAccount: 'Delete Custom Account'
  },
  ur: {
    // Header & Navigation
    shopTitle: 'ڈیجی دکان پوائنٹ آف سیل',
    contact: 'رابطہ: 0300-1234567',
    easyload: 'ایزی لوڈ اور ریچارج',
    bankTransfer: 'بینک اور منی ٹرانسفر',
    utilityBills: 'بلز اور چالان',
    udhaarKhata: 'ادھار کھاتہ رجسٹر',
    customAccounts: 'دیگر ذاتی اکاؤنٹس',
    cashRegisters: 'کیش رجسٹر اور دراز',
    commissionBreakdown: 'کمیشن اور آمدنی',
    currencyConverter: 'کرنسی کے ریٹس',
    aiAssistant: '3D AI طوطا اسسٹنٹ',
    settings: 'ٹرمینل کنٹرول سینٹر',
    lockApp: 'ایپ لاک کریں',
    
    // Dashboard & Stats
    totalBalance: 'کل دکان کا بیلنس',
    todaySales: 'آج کی کل سیلز',
    todayProfit: 'آج کا خالص کمیشن',
    pendingUdhaar: 'بقایا ادھار رقم',
    recentTransactions: 'حالیہ دکان کے لین دین',
    searchPlaceholder: 'نام، فون نمبر یا آئی ڈی سے تلاش کریں...',
    noTransactions: 'ابھی تک کوئی ریکارڈ موجود نہیں ہے۔',
    
    // Actions & Buttons
    addTransaction: 'نیا اینٹری درج کریں',
    addBalance: 'بیلنس شامل کریں',
    clearBalance: 'بیلنس صاف کریں',
    giveUdhaar: 'ادھار دیں',
    printReceipt: 'رسید پرنٹ کریں',
    delete: 'حذف کریں',
    cancel: 'منسوخ کریں',
    save: 'تبدیلیاں محفوظ کریں',
    confirm: 'تصدیق کریں',
    shareApp: 'ایپ شیئر کریں',
    
    // Settings & Control
    accountSecurity: 'اکاؤنٹ اور سیکیورٹی (ای میل / پاس ورڈ)',
    storageAnalytics: 'سٹوریج اینالیٹکس (100 جی بی کلاؤڈ)',
    themeLanguage: 'تھیم اور زبان کی ترتیبات',
    backgroundGallery: 'وال پیپر گیلری',
    dailyMicroRent: 'روزانہ دکان مائیکرو کرایہ سسٹم',
    lightTheme: 'لائٹ تھیم موڈ',
    darkTheme: 'ڈارک تھیم موڈ',
    changeEmail: 'ای میل ایڈریس تبدیل کریں',
    updatePassword: 'پاس ورڈ اور 6 ہندسوں کا پن اپ ڈیٹ کریں',
    deleteAccount: 'کسٹم اکاؤنٹ حذف کریں'
  },
  rom: {
    // Header & Navigation
    shopTitle: 'DigiDukaan Retail POS',
    contact: 'Raabta: 0300-1234567',
    easyload: 'Easyload & Recharges',
    bankTransfer: 'Bank & Money Transfer',
    utilityBills: 'Bills & Challan Payment',
    udhaarKhata: 'Udhaar Khata Ledger',
    customAccounts: 'Gharelu & Personal Accounts',
    cashRegisters: 'Cash Box & Drawers',
    commissionBreakdown: 'Mera Commission & Bachat',
    currencyConverter: 'Zar-e-Mubadla Rates',
    aiAssistant: '3D AI Parrot Helper',
    settings: 'Terminal Control Center',
    lockApp: 'Terminal Lock Karein',
    
    // Dashboard & Stats
    totalBalance: 'Kul Dukan Ka Balance',
    todaySales: 'Aaj Ki Kul Sale',
    todayProfit: 'Aaj Ka Net Commission',
    pendingUdhaar: 'Kul Baqaya Udhaar',
    recentTransactions: 'Halia Dukan Ki Entries',
    searchPlaceholder: 'Naam, phone number se search karein...',
    noTransactions: 'Koi record moujood nahi hai.',
    
    // Actions & Buttons
    addTransaction: 'Nayi Entry Karein',
    addBalance: 'Balance Add Karein',
    clearBalance: 'Balance Saf Karein',
    giveUdhaar: 'Udhaar Dein',
    printReceipt: 'Receipt Print Karein',
    delete: 'Delete Karein',
    cancel: 'Cancel',
    save: 'Save Karein',
    confirm: 'Confirm Karein',
    shareApp: 'App Share Karein',
    
    // Settings & Control
    accountSecurity: 'Account & Security (Email / Password)',
    storageAnalytics: 'Storage Analytics (100 GB Cloud)',
    themeLanguage: 'Theme & Zaban Settings',
    backgroundGallery: 'Background Wallpaper Gallery',
    dailyMicroRent: 'Rozana Dukan Micro-Rent System',
    lightTheme: 'Light Theme Mode',
    darkTheme: 'Dark Theme Mode',
    changeEmail: 'Email Address Badlein',
    updatePassword: 'Password aur 6-Digit PIN Update Karein',
    deleteAccount: 'Account Delete Karein'
  }
};

export const getTranslation = (key: string, lang: LanguageCode = 'en'): string => {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
};
