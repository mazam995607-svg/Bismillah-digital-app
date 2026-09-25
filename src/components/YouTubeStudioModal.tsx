import React, { useState } from 'react';
import { 
  Youtube, Search, Play, X, ExternalLink, Sparkles, Film, 
  Tv, Compass, Clock, Check, Volume2, ShieldCheck, Flame, Radio, ArrowRight
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SEARCH_PRESETS = [
  'Pakistani News Live',
  'Cricket Highlights',
  'Tariq Jamil Bayan',
  'Mobile Software Repairing',
  'Pakistani Dramas 2026',
  'Naat Sharif HD',
  'Coke Studio Hits',
  'Easyload POS Tutorial',
  'JazzCash Retailer Guide',
  'Mobile Hardware Fixing'
];

export const YouTubeStudioModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bismillah_yt_searches');
      return saved ? JSON.parse(saved) : ['Pakistani News Live', 'Cricket Highlights', 'Mobile Repairing'];
    } catch {
      return ['Pakistani News Live', 'Cricket Highlights'];
    }
  });

  if (!isOpen) return null;

  const handleLaunchYouTube = (queryToSearch: string) => {
    const raw = queryToSearch.trim();
    if (!raw) return;

    let targetUrl = '';
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      targetUrl = raw;
    } else {
      targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(raw)}`;
    }

    // Save to recents
    const updated = [raw, ...recentSearches.filter(q => q !== raw)].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem('bismillah_yt_searches', JSON.stringify(updated));
    } catch {}

    // Direct open in YouTube app / tab
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleLaunchYouTube(searchQuery.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-red-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center font-black shadow-lg shadow-red-600/20">
              <Youtube className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-red-400">
                  YouTube Direct Search & Launcher
                </h3>
                <span className="bg-red-500/20 text-red-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-500/30">
                  Fast App Launcher
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Search any video, topic, live news, or bayan to open directly in YouTube
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1 flex-1 text-xs">
          
          {/* Main Search Input Form */}
          <form onSubmit={handleFormSubmit} className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <label className="text-[11px] font-bold text-slate-300 block">
              Type video name, channel, or topic to search & open in YouTube:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="e.g. Geo News Live, Mobile Software Repairing, Cricket..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-100 placeholder-slate-500 outline-none focus:border-red-500"
                />
              </div>
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4" /> Open YouTube
              </button>
            </div>
          </form>

          {/* Quick Trending / Popular Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
              🔥 Popular YouTube Search Shortcuts:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SEARCH_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLaunchYouTube(preset)}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/50 text-left font-bold text-slate-200 transition flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate pr-1">{preset}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-red-400 opacity-60 group-hover:opacity-100 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Recent Search History ({recentSearches.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('bismillah_yt_searches');
                  }}
                  className="text-[10px] text-rose-400 hover:underline font-bold"
                >
                  Clear History
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLaunchYouTube(item)}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{item}</span>
                    <ArrowRight className="w-3 h-3 text-red-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
