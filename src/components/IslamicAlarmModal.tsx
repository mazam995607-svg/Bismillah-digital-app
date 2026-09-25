import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlarmSetting } from '../types';
import { X, Bell, Plus, Trash2, Volume2, Sparkles, Check, Play, Square, Clock, ShieldCheck, SunMedium, Moon, Sunset } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  alarms: AlarmSetting[];
  onSaveAlarms: (newAlarms: AlarmSetting[]) => void;
}

// 5 Standard Pakistani Islamic Prayer Times
const DEFAULT_5_PRAYERS: Array<{ name: string; time: string; soundType: 'Azan' | 'Islamic Chime' | 'Standard' }> = [
  { name: 'Fajr Azan (فجر)', time: '05:15', soundType: 'Azan' },
  { name: 'Dhuhr Azan (ظہر)', time: '13:15', soundType: 'Azan' },
  { name: 'Asr Azan (عصر)', time: '16:45', soundType: 'Azan' },
  { name: 'Maghrib Azan (مغرب)', time: '18:35', soundType: 'Azan' },
  { name: 'Isha Azan (عشاء)', time: '20:15', soundType: 'Azan' }
];

let globalAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!globalAudioCtx || globalAudioCtx.state === 'closed') {
      globalAudioCtx = new AudioCtx();
    }
    if (globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume();
    }
    return globalAudioCtx;
  } catch {
    return null;
  }
};

export const playIslamicAlarmTone = (type: 'Azan' | 'Islamic Chime' | 'Standard') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (type === 'Azan') {
      // Harmonic Islamic Melodic Call Chimes (A4 -> D5 -> E5 -> A5)
      const now = ctx.currentTime;
      const notes = [
        { freq: 440.0, time: 0, dur: 1.2 },    // A4
        { freq: 587.33, time: 1.1, dur: 1.4 }, // D5
        { freq: 659.25, time: 2.3, dur: 1.6 }, // E5
        { freq: 880.0, time: 3.8, dur: 2.2 }   // A5 (Long sustain)
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);
        
        gain.gain.setValueAtTime(0, now + time);
        gain.gain.linearRampToValueAtTime(0.35, now + time + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.1);
      });
    } else if (type === 'Islamic Chime') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.8); // E5
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.5);
    } else {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    }
  } catch (err) {
    console.warn('Audio tone play error:', err);
  }
};

export const IslamicAlarmModal: React.FC<Props> = ({
  isOpen,
  onClose,
  alarms,
  onSaveAlarms
}) => {
  const [alarmList, setAlarmList] = useState<AlarmSetting[]>(() => {
    if (alarms && alarms.length > 0) return alarms;
    try {
      const saved = localStorage.getItem('bismillah_islamic_alarms');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_5_PRAYERS.map((p, idx) => ({
      id: `ALARM-DEFAULT-${idx}`,
      name: p.name,
      time: p.time,
      enabled: true,
      soundType: p.soundType
    }));
  });

  const [name, setName] = useState('Fajr Azan');
  const [time, setTime] = useState('05:15');
  const [soundType, setSoundType] = useState<'Azan' | 'Islamic Chime' | 'Standard'>('Azan');
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [activeTriggeredAlarm, setActiveTriggeredAlarm] = useState<AlarmSetting | null>(null);

  // Sync alarms
  useEffect(() => {
    if (alarms && alarms.length > 0) {
      setAlarmList(alarms);
    }
  }, [alarms]);

  // Save changes to localStorage & parent
  const persistAlarms = (list: AlarmSetting[]) => {
    setAlarmList(list);
    onSaveAlarms(list);
    try {
      localStorage.setItem('bismillah_islamic_alarms', JSON.stringify(list));
    } catch {}
  };

  // High precision time check loop (every 3 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const currentFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      alarmList.forEach(al => {
        if (al.enabled && al.time === currentFormatted) {
          if (!activeTriggeredAlarm || activeTriggeredAlarm.id !== al.id) {
            playIslamicAlarmTone(al.soundType);
            setActiveTriggeredAlarm(al);
          }
        }
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [alarmList, activeTriggeredAlarm]);

  const handleTestSound = (type: 'Azan' | 'Islamic Chime' | 'Standard') => {
    setIsPlayingTest(true);
    playIslamicAlarmTone(type);
    setTimeout(() => setIsPlayingTest(false), 3500);
  };

  const handleAddAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    const newAl: AlarmSetting = {
      id: 'ALARM-' + Date.now(),
      name,
      time,
      enabled: true,
      soundType
    };
    const updated = [...alarmList, newAl];
    persistAlarms(updated);
    setName('');
  };

  const handleLoadDefault5Prayers = () => {
    const defaults: AlarmSetting[] = DEFAULT_5_PRAYERS.map((p, idx) => ({
      id: `ALARM-PRAYER-${idx}-${Date.now()}`,
      name: p.name,
      time: p.time,
      enabled: true,
      soundType: p.soundType
    }));
    persistAlarms(defaults);
  };

  const toggleAlarm = (id: string) => {
    const updated = alarmList.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a);
    persistAlarms(updated);
  };

  const deleteAlarm = (id: string) => {
    const updated = alarmList.filter(a => a.id !== id);
    persistAlarms(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Bell className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-emerald-400">
                  Namaz & Azan Alarm Manager
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Live Audio Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">Automatic Prayer Time Azan Chimes & Shop Reminders</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Triggered Alarm Live Banner */}
        {activeTriggeredAlarm && (
          <div className="mb-3 p-3 bg-emerald-950 border-2 border-emerald-400 rounded-2xl flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 text-emerald-300 animate-spin" />
              <div>
                <span className="font-extrabold text-xs text-emerald-200">
                  🕌 Azan Time Reached: {activeTriggeredAlarm.name}
                </span>
                <span className="text-[10px] text-emerald-300 block">Time: {activeTriggeredAlarm.time}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveTriggeredAlarm(null)}
              className="px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-black rounded-xl"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1 flex-1 text-xs">
          
          {/* Quick 5 Daily Prayers Setup Button */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <span className="font-extrabold text-slate-200 block text-xs">5 Daily Prayer Times (فجر، ظہر، عصر، مغرب، عشاء)</span>
              <span className="text-[10px] text-slate-400">1-Click load official Pakistan prayer time schedule</span>
            </div>
            <button
              type="button"
              onClick={handleLoadDefault5Prayers}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition cursor-pointer shrink-0 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> Auto-Load 5 Azans
            </button>
          </div>

          {/* Add Alarm Form */}
          <form onSubmit={handleAddAlarm} className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-400" /> Set Custom Prayer or Shop Alarm:
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Alarm Name / Label</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Asr Prayer, Shop Close..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Time (24h Format)</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-slate-400">Tone:</label>
                <select
                  value={soundType}
                  onChange={e => setSoundType(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-200 outline-none"
                >
                  <option value="Azan">🕌 Azan Melody</option>
                  <option value="Islamic Chime">🔔 Islamic Chime</option>
                  <option value="Standard">⏰ Standard Alarm</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleTestSound(soundType)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                  title="Test Sound"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-lg transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Alarm
              </button>
            </div>
          </form>

          {/* Active Alarms List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Configured Alarms ({alarmList.length})
              </span>
              <button
                type="button"
                onClick={() => handleTestSound('Azan')}
                className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Volume2 className="w-3 h-3" /> {isPlayingTest ? 'Playing Test...' : 'Test Azan Audio'}
              </button>
            </div>

            {alarmList.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No alarms set. Click 'Auto-Load 5 Azans' above.</p>
            ) : (
              <div className="space-y-2">
                {alarmList.map((al) => (
                  <div
                    key={al.id}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                      al.enabled
                        ? 'bg-slate-950 border-emerald-500/40 text-slate-100'
                        : 'bg-slate-950/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleAlarm(al.id)}
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition border ${
                          al.enabled
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {al.enabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-100">{al.name}</span>
                          <span className="text-[9px] bg-slate-800 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                            {al.soundType}
                          </span>
                        </div>
                        <span className="font-mono font-black text-amber-400 text-sm">{al.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTestSound(al.soundType)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="Test sound"
                      >
                        <Play className="w-3 h-3 text-emerald-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAlarm(al.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition"
                        title="Delete alarm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
