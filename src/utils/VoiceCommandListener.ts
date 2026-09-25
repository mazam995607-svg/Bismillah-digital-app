/**
 * VoiceCommandListener.ts
 * Global hands-free voice command engine for DigiDukaan POS terminal.
 * Supports Urdu and English phrases to invoke shop features hands-free.
 */

export interface VoiceCommandMatch {
  phrase: string;
  actionId: string;
  description: string;
  confidence: number;
}

export type VoiceCommandHandler = (match: VoiceCommandMatch) => void;

export class VoiceCommandListener {
  private static recognition: any = null;
  private static isListening: boolean = false;
  private static listeners: Set<VoiceCommandHandler> = new Set();
  private static statusListeners: Set<(isListening: boolean, transcript: string, lastCommand?: string) => void> = new Set();
  private static lastTranscript: string = '';

  private static COMMAND_MAP: Array<{
    keywords: string[];
    actionId: string;
    description: string;
  }> = [
    {
      keywords: ['open youtube', 'youtube kholo', 'youtube chalao', 'youtube search', 'youtube'],
      actionId: 'youtubeHub',
      description: 'Opening YouTube Hub & Video Search'
    },
    {
      keywords: ['add udhaar', 'udhaar khata', 'udhar', 'khata kholo', 'udhaar'],
      actionId: 'udhaarKhata',
      description: 'Opening Udhaar Khata Ledger'
    },
    {
      keywords: ['check balance', 'cash balance', 'cash box', 'cash register', 'kitna balance he', 'balance'],
      actionId: 'cashRegisters',
      description: 'Checking Cash Registers & Drawer Balance'
    },
    {
      keywords: ['ai assistant', 'gemini ai', 'robot', 'assistant', 'madadgar', 'ai se pucho'],
      actionId: 'aiAssistant',
      description: 'Activating AI Assistant & Business Advisor'
    },
    {
      keywords: ['location tracer', 'trace number', 'track cnic', 'sim tracker', 'location', 'phone trace'],
      actionId: 'simCnicTracker',
      description: 'Launching SIM & CNIC Location Tracer'
    },
    {
      keywords: ['islamic alarm', 'namaz alarm', 'azan alarm', 'alarm', 'namaz ka time'],
      actionId: 'islamicAlarm',
      description: 'Opening Namaz & Azan Alarm Scheduler'
    },
    {
      keywords: ['install app', 'download app', 'download', 'app install', 'native app'],
      actionId: 'nativeInstall',
      description: 'Opening Native App Download & Installation Guide'
    },
    {
      keywords: ['security dashboard', 'security lock', 'security', 'biometric settings'],
      actionId: 'security',
      description: 'Opening Security & Cloud Control Center'
    },
    {
      keywords: ['statement pdf', 'pdf report', 'print statement', 'statement'],
      actionId: 'statementPDF',
      description: 'Generating Daily Statement PDF Report'
    },
    {
      keywords: ['commission breakdown', 'commission check', 'commissions', 'munafa'],
      actionId: 'commissions',
      description: 'Viewing Commission Breakdown & Profit'
    },
    {
      keywords: ['biometric history', 'fingerprint logs', 'audit logs', 'biometric logs'],
      actionId: 'biometricHistory',
      description: 'Opening Biometric Access & Audit Logs'
    },
    {
      keywords: ['search google', 'google search', 'google kholo', 'search online'],
      actionId: 'googleSearch',
      description: 'Opening Google Search Launcher'
    },
    {
      keywords: ['utility bills', 'bill jama', 'bijli ka bill', 'bills'],
      actionId: 'utilityBills',
      description: 'Opening Utility Bills Payment Portal'
    },
    {
      keywords: ['easyload', 'load bhejo', 'purchase load', 'balance purchase'],
      actionId: 'loadPurchase',
      description: 'Opening Purchase Load Balance'
    },
    {
      keywords: ['settings', 'app setting', 'setting'],
      actionId: 'settings',
      description: 'Opening Settings'
    }
  ];

  public static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public static getIsListening(): boolean {
    return this.isListening;
  }

  public static getLastTranscript(): string {
    return this.lastTranscript;
  }

  public static startListening(onMatch?: VoiceCommandHandler): boolean {
    if (!this.isSupported()) {
      console.warn('SpeechRecognition API is not supported in this browser.');
      return false;
    }

    if (onMatch) {
      this.listeners.add(onMatch);
    }

    if (this.isListening) return true;

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US'; // Also handles romanized Urdu phrases well

      this.recognition.onstart = () => {
        this.isListening = true;
        this.notifyStatus(true, 'Listening for voice commands...');
      };

      this.recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        const textToProcess = (finalTranscript || currentInterim).toLowerCase().trim();
        this.lastTranscript = textToProcess;
        this.notifyStatus(true, textToProcess);

        if (textToProcess) {
          this.evaluateCommand(textToProcess);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          this.stopListening();
          this.notifyStatus(false, 'Microphone access blocked by browser');
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          // Auto-restart continuous listening unless stopped
          try {
            this.recognition.start();
          } catch (e) {
            this.isListening = false;
            this.notifyStatus(false, '');
          }
        } else {
          this.notifyStatus(false, '');
        }
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err) {
      console.warn('Failed to start SpeechRecognition:', err);
      this.isListening = false;
      return false;
    }
  }

  public static stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.notifyStatus(false, '');
  }

  public static toggleListening(onMatch?: VoiceCommandHandler): boolean {
    if (this.isListening) {
      this.stopListening();
      return false;
    } else {
      return this.startListening(onMatch);
    }
  }

  private static evaluateCommand(spokenText: string) {
    for (const entry of this.COMMAND_MAP) {
      for (const keyword of entry.keywords) {
        if (spokenText.includes(keyword)) {
          const match: VoiceCommandMatch = {
            phrase: keyword,
            actionId: entry.actionId,
            description: entry.description,
            confidence: 0.95
          };

          this.notifyStatus(this.isListening, `Recognized: "${keyword}"`, entry.description);

          // Trigger all registered handlers
          this.listeners.forEach((handler) => {
            try {
              handler(match);
            } catch (err) {
              console.error('Error invoking voice command handler:', err);
            }
          });
          return;
        }
      }
    }
  }

  public static subscribeStatus(cb: (isListening: boolean, transcript: string, lastCommand?: string) => void) {
    this.statusListeners.add(cb);
    return () => {
      this.statusListeners.delete(cb);
    };
  }

  private static notifyStatus(listening: boolean, transcript: string, lastCommand?: string) {
    this.statusListeners.forEach((cb) => {
      try {
        cb(listening, transcript, lastCommand);
      } catch (e) {}
    });
  }
}
