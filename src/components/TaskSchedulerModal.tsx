import React, { useState, useEffect, useRef } from 'react';
import { ScheduledTask } from '../types';
import { Clock, Plus, CheckCircle2, XCircle, AlertCircle, Trash2, Bell, BellOff, Volume2, Calendar, Sparkles, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tasks: ScheduledTask[];
  onAddTask: (task: Omit<ScheduledTask, 'id' | 'createdAt'>) => void;
  onUpdateTaskStatus: (id: string, status: 'Successful' | 'Cancelled' | 'Pending') => void;
  onDeleteTask: (id: string) => void;
  soundEnabled?: boolean;
}

export const TaskSchedulerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  tasks,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask,
  soundEnabled = true,
}) => {
  const [title, setTitle] = useState('');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [note, setNote] = useState('');
  const [activeAlarmTask, setActiveAlarmTask] = useState<ScheduledTask | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<any>(null);

  // Sound generator for alarm
  const playAlarmSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  };

  // Alarm Check Loop
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentDateStr = now.toISOString().split('T')[0];
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;

      tasks.forEach(t => {
        if (t.status === 'Scheduled' && t.scheduledDate === currentDateStr && t.scheduledTime === currentTimeStr && !t.alarmTriggered) {
          setActiveAlarmTask(t);
          playAlarmSound();
        }
      });
    };

    const interval = setInterval(checkAlarms, 10000);
    return () => clearInterval(interval);
  }, [tasks, soundEnabled]);

  // Repeating alarm sound when active
  useEffect(() => {
    if (activeAlarmTask) {
      alarmIntervalRef.current = setInterval(() => {
        playAlarmSound();
      }, 1500);
    } else {
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    }
    return () => {
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    };
  }, [activeAlarmTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({
      title,
      scheduledDate,
      scheduledTime,
      status: 'Scheduled',
      note,
    });
    setTitle('');
    setNote('');
  };

  const handleAction = (taskId: string, status: 'Successful' | 'Cancelled' | 'Pending') => {
    onUpdateTaskStatus(taskId, status);
    if (activeAlarmTask && activeAlarmTask.id === taskId) {
      setActiveAlarmTask(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <Clock className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-wide flex items-center gap-1.5">
                Kal Ka Kaam & Task Scheduler <Sparkles className="w-4 h-4 text-amber-300" />
              </h3>
              <p className="text-xs text-blue-100 font-semibold">Schedule Tasks with Auto Alarms & Instant Actions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ACTIVE ALARM BANNER POPUP */}
        {activeAlarmTask && (
          <div className="p-4 bg-rose-600/90 border-b border-rose-400 text-white flex flex-col sm:flex-row items-center justify-between gap-3 animate-bounce">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-amber-300 animate-spin" />
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-200">ALARM TRIGGERED NOW!</span>
                <h4 className="text-base font-black">{activeAlarmTask.title}</h4>
                <p className="text-xs font-medium text-rose-100">Time: {activeAlarmTask.scheduledDate} @ {activeAlarmTask.scheduledTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleAction(activeAlarmTask.id, 'Successful')}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow"
              >
                <CheckCircle2 className="w-4 h-4" /> Successful (Kamyab)
              </button>
              <button
                onClick={() => handleAction(activeAlarmTask.id, 'Pending')}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow"
              >
                <AlertCircle className="w-4 h-4" /> Pending (Baqaya)
              </button>
              <button
                onClick={() => handleAction(activeAlarmTask.id, 'Cancelled')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 border border-slate-700 shadow"
              >
                <XCircle className="w-4 h-4" /> Cancel (Mansookh)
              </button>
            </div>
          </div>
        )}

        <div className="p-4 overflow-y-auto space-y-6 flex-grow">
          {/* ADD TASK FORM */}
          <form onSubmit={handleSubmit} className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add New Scheduled Task
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <input
                  type="text"
                  placeholder="Task Title (e.g., Kal Subah 10 baje Dukan Load Stock Update Karein)"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Alarm Time (HH:MM)</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={e => setScheduledTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Clock className="w-4 h-4" /> Set Alarm & Save
                </button>
              </div>
            </div>
          </form>

          {/* TASK LIST */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex justify-between items-center">
              <span>Your Scheduled Tasks ({tasks.length})</span>
              <span className="text-[11px] text-slate-500 normal-case font-normal">Auto-Alarms Active</span>
            </h4>

            {tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-blue-400" />
                <p className="text-xs font-semibold">No tasks scheduled yet. Add your task for tomorrow above!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.map(t => (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                      t.status === 'Successful'
                        ? 'bg-emerald-950/30 border-emerald-800/50 text-slate-200'
                        : t.status === 'Cancelled'
                        ? 'bg-slate-950/50 border-slate-800 text-slate-400'
                        : t.status === 'Pending'
                        ? 'bg-amber-950/30 border-amber-800/50 text-slate-200'
                        : 'bg-slate-800/60 border-slate-700 text-slate-100'
                    }`}
                  >
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                          t.status === 'Successful'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : t.status === 'Cancelled'
                            ? 'bg-slate-700 text-slate-400'
                            : t.status === 'Pending'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        }`}>
                          {t.status}
                        </span>

                        <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {t.scheduledDate} @ {t.scheduledTime}
                        </span>
                      </div>

                      <h5 className="font-bold text-xs sm:text-sm mt-1">{t.title}</h5>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleAction(t.id, 'Successful')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition ${
                          t.status === 'Successful'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 hover:bg-emerald-600/80 text-emerald-400 border border-slate-700'
                        }`}
                        title="Mark Successful & Stop Alarm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Successful
                      </button>

                      <button
                        onClick={() => handleAction(t.id, 'Pending')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition ${
                          t.status === 'Pending'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-800 hover:bg-amber-600/80 text-amber-400 border border-slate-700'
                        }`}
                        title="Move to Pending & Stop Alarm"
                      >
                        <AlertCircle className="w-3.5 h-3.5" /> Pending
                      </button>

                      <button
                        onClick={() => handleAction(t.id, 'Cancelled')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition ${
                          t.status === 'Cancelled'
                            ? 'bg-rose-900 text-rose-200'
                            : 'bg-slate-800 hover:bg-rose-900/80 text-rose-400 border border-slate-700'
                        }`}
                        title="Cancel Task & Stop Alarm"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel
                      </button>

                      <button
                        onClick={() => onDeleteTask(t.id)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition"
                        title="Delete Task"
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
