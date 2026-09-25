import React, { useState, useEffect } from 'react';
import { Sparkles, Flag, Moon, Heart, Sun, Settings, Check, X, Volume2, VolumeX } from 'lucide-react';

export type FestiveEvent = 'none' | 'august14' | 'rabiulawwal' | 'eid' | 'ramadan' | 'defenceday';

interface FestiveEventInfo {
  id: FestiveEvent;
  title: string;
  subtitle: string;
  bgGradient: string;
  accentColor: string;
  flagIcon: string;
  decorType: 'pakistan_flags' | 'green_lanterns' | 'crescent_lights' | 'ramadan_fanoos' | 'military_stars';
  description: string;
  soundTrack?: string;
}

export const FESTIVE_EVENTS: FestiveEventInfo[] = [
  {
    id: 'august14',
    title: '🇵🇰 Jashn-e-Azadi Mubarak (14th August)',
    subtitle: '79th Pakistan Independence Day Celebration',
    bgGradient: 'from-emerald-700 via-green-800 to-slate-950',
    accentColor: 'text-emerald-300 border-emerald-400',
    flagIcon: '🇵🇰',
    decorType: 'pakistan_flags',
    description: 'Green & White Pakistani Flag Theme, Crescent & Star Lighting, Patriotic Ambience'
  },
  {
    id: 'rabiulawwal',
    title: '💚 12 Rabi-ul-Awwal - Eid Milad-un-Nabi ﷺ',
    subtitle: 'Jashn-e-Amad-e-Rasool ﷺ Mubarak',
    bgGradient: 'from-emerald-800 via-teal-900 to-slate-950',
    accentColor: 'text-amber-300 border-amber-400',
    flagIcon: '🕌',
    decorType: 'green_lanterns',
    description: 'Illuminated Green Lanterns, Rabi-ul-Awwal Banners, Soft Naat Ambience'
  },
  {
    id: 'eid',
    title: '🌙 Eid Mubarak (Eid-ul-Fitr & Eid-ul-Adha)',
    subtitle: 'Taqabbal Allahu Minna Wa Minkum',
    bgGradient: 'from-amber-700 via-teal-900 to-slate-950',
    accentColor: 'text-amber-300 border-amber-400',
    flagIcon: '🌙',
    decorType: 'crescent_lights',
    description: 'Chand Raat Golden Crescent, Festive Fairylights & Sparkling Stars'
  },
  {
    id: 'ramadan',
    title: '🕌 Ramadan Mubarak (رمضان مبارك)',
    subtitle: 'Month of Blessings, Quran & Forgiveness',
    bgGradient: 'from-teal-800 via-emerald-900 to-slate-950',
    accentColor: 'text-teal-200 border-teal-300',
    flagIcon: '✨',
    decorType: 'ramadan_fanoos',
    description: 'Traditional Fanoos Lanterns, Suhoor & Iftar Glow, Deep Emerald Ambiance'
  },
  {
    id: 'defenceday',
    title: '🎖️ Pakistan Defence Day (6th September)',
    subtitle: 'Youm-e-Difa - Saluting Armed Forces of Pakistan',
    bgGradient: 'from-green-800 via-slate-900 to-slate-950',
    accentColor: 'text-emerald-400 border-emerald-500',
    flagIcon: '🇵🇰',
    decorType: 'military_stars',
    description: 'National Military Star Badges, Patriotic Pride Header'
  }
];

export const FestiveThemeEngine: React.FC = () => {
  const [activeEvent, setActiveEvent] = useState<FestiveEvent>(() => {
    return (localStorage.getItem('bismillah_festive_event') as FestiveEvent) || 'august14';
  });

  const [showSelector, setShowSelector] = useState(false);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  useEffect(() => {
    localStorage.setItem('bismillah_festive_event', activeEvent);
  }, [activeEvent]);

  if (activeEvent === 'none') return null;

  const currentInfo = FESTIVE_EVENTS.find(e => e.id === activeEvent) || FESTIVE_EVENTS[0];

  return (
    <>
      {/* Festive Banner Overlay on Top of App */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${currentInfo.bgGradient} text-white shadow-xl border-b border-white/20 transition-all duration-500`}>
        {/* Animated Background Lights & Confetti Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20 flex justify-between items-center px-6">
          <span className="text-3xl animate-bounce">✨</span>
          <span className="text-4xl animate-pulse">🌙</span>
          <span className="text-3xl animate-spin" style={{ animationDuration: '10s' }}>⭐</span>
          <span className="text-3xl animate-bounce">🇵🇰</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap justify-between items-center gap-3 relative z-10 text-xs">
          
          <div className="flex items-center gap-3">
            <span className="text-2xl drop-shadow-md animate-pulse">{currentInfo.flagIcon}</span>
            <div>
              <div className="font-black text-sm tracking-wide flex items-center gap-2 drop-shadow">
                {currentInfo.title}
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase border border-white/30">
                  Festive Mode Active
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 font-semibold">{currentInfo.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSelector(true)}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 font-extrabold text-xs flex items-center gap-1.5 backdrop-blur-md transition shadow"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Switch Event Theme
            </button>
            
            <button
              onClick={() => setActiveEvent('none')}
              className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-white transition"
              title="Close Festive Banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Event Theme Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-5 text-slate-100 space-y-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-100">Pakistani & Islamic Festive Themes</h3>
                  <p className="text-xs text-slate-400">Select national or Islamic occasion theme decor</p>
                </div>
              </div>
              <button onClick={() => setShowSelector(false)} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              {FESTIVE_EVENTS.map(evt => (
                <div
                  key={evt.id}
                  onClick={() => {
                    setActiveEvent(evt.id);
                    setShowSelector(false);
                  }}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    activeEvent === evt.id ? 'bg-emerald-950/50 border-emerald-400 shadow-lg' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{evt.flagIcon}</span>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-200">{evt.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{evt.description}</p>
                    </div>
                  </div>

                  {activeEvent === evt.id && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-black">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={() => {
                  setActiveEvent('none');
                  setShowSelector(false);
                }}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-slate-200 font-bold text-xs transition"
              >
                Disable Festive Theme (Default Theme)
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
