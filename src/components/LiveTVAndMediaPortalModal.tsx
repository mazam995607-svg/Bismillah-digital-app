import React, { useState } from 'react';
import { 
  Tv, Play, Search, Globe, Youtube, X, Radio, Sparkles, 
  ExternalLink, RefreshCw, Layers, ArrowLeft, ArrowRight, 
  ShieldCheck, Film, MonitorPlay, Zap 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface Channel {
  id: string;
  name: string;
  country: 'Pakistan' | 'India' | 'Global';
  category: 'News' | 'Sports' | 'Entertainment' | 'Tamasha';
  embedUrl: string;
  thumbnail: string;
  sourceType?: 'youtube' | 'tamasha' | 'web';
}

const TV_CHANNELS: Channel[] = [
  {
    id: 'tamasha-live',
    name: '🔴 Tamasha App Live TV (Pakistan Official)',
    country: 'Pakistan',
    category: 'Tamasha',
    embedUrl: 'https://tamashaweb.com',
    thumbnail: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=400',
    sourceType: 'tamasha'
  },
  {
    id: 'geo-news',
    name: 'Geo News Live',
    country: 'Pakistan',
    category: 'News',
    embedUrl: 'https://www.youtube-nocookie.com/embed/live_stream?channel=UC4P2Msp_9_vIfl16cIeR0-A',
    thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=400',
    sourceType: 'youtube'
  },
  {
    id: 'ary-news',
    name: 'ARY News Live',
    country: 'Pakistan',
    category: 'News',
    embedUrl: 'https://www.youtube-nocookie.com/embed/live_stream?channel=UC4FCwj86L_b_6f2E4e31Jfg',
    thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=400',
    sourceType: 'youtube'
  },
  {
    id: 'makkah-live',
    name: '🇸🇦 Makkah Live 24/7 (Kaaba Live)',
    country: 'Global',
    category: 'Entertainment',
    embedUrl: 'https://www.youtube-nocookie.com/embed/live_stream?channel=UCV33oA_U0yA-M9A2uOQW_mQ',
    thumbnail: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=400',
    sourceType: 'youtube'
  },
  {
    id: 'madinah-live',
    name: '🇸🇦 Madinah Live 24/7 (Masjid Nabawi)',
    country: 'Global',
    category: 'Entertainment',
    embedUrl: 'https://www.youtube-nocookie.com/embed/live_stream?channel=UC1vA0vP3y-Wp3YxX8rS4Nfg',
    thumbnail: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=400',
    sourceType: 'youtube'
  },
  {
    id: 'ptv-sports',
    name: 'PTV Sports Live (Cricket & Leagues)',
    country: 'Pakistan',
    category: 'Sports',
    embedUrl: 'https://www.youtube-nocookie.com/embed/live_stream?channel=UCpP8TvhX6l_eJ_S07J_rRWA',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400',
    sourceType: 'youtube'
  },
  {
    id: 'express-news',
    name: 'Express News HD',
    country: 'Pakistan',
    category: 'News',
    embedUrl: 'https://www.youtube-nocookie.com/embed/live_stream?channel=UCGACxJjV6S235wV12L_j02A',
    thumbnail: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=400',
    sourceType: 'youtube'
  }
];

export const LiveTVAndMediaPortalModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'tamasha' | 'pakistan' | 'youtube' | 'google'>('tamasha');
  const [activeChannel, setActiveChannel] = useState<Channel>(TV_CHANNELS[0]);
  
  // YouTube In-App Interactive State
  const [ytQuery, setYtQuery] = useState('Pakistani News Live');
  const [ytEmbedUrl, setYtEmbedUrl] = useState('https://www.youtube-nocookie.com/embed?listType=search&list=Pakistani+News+Live');
  
  // Google / Web Search In-App Interactive Bridge State
  const [searchQuery, setSearchQuery] = useState('Digital POS Easyload Pakistan');
  const [searchBridgeUrl, setSearchBridgeUrl] = useState('https://html.duckduckgo.com/html/?q=Digital+POS+Easyload+Pakistan');
  const [iframeKey, setIframeKey] = useState(1);

  if (!isOpen) return null;

  const pakChannels = TV_CHANNELS.filter(c => c.country === 'Pakistan');

  const handleYtSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytQuery.trim()) return;
    const q = ytQuery.trim();
    if (q.includes('watch?v=')) {
      const vid = q.split('watch?v=')[1]?.split('&')[0];
      setYtEmbedUrl(`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1`);
    } else if (q.includes('youtu.be/')) {
      const vid = q.split('youtu.be/')[1]?.split('?')[0];
      setYtEmbedUrl(`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1`);
    } else {
      setYtEmbedUrl(`https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(q)}`);
    }
  };

  const handleGoogleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim();
    setSearchBridgeUrl(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`);
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-5xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Header Bar */}
        <div className="p-4 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white flex justify-between items-center shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <Tv className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-wide flex items-center gap-2">
                Live TV & Media Portal
              </h3>
              <p className="text-xs text-rose-100">
                Tamasha App Live Streaming • YouTube Video Bridge • Live News & Sports Channels
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap gap-2 justify-between items-center text-xs font-bold">
          <div className="flex flex-wrap gap-2">
            {/* TAMASHA APP TAB */}
            <button
              onClick={() => setActiveTab('tamasha')}
              className={`px-3.5 py-2 rounded-xl font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'tamasha' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <MonitorPlay className="w-4 h-4 text-slate-950" /> Tamasha App Live TV
            </button>

            {/* PAKISTANI LIVE TV TAB */}
            <button
              onClick={() => setActiveTab('pakistan')}
              className={`px-3.5 py-2 rounded-xl font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'pakistan' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-4 h-4" /> Live Channels
            </button>

            {/* YOUTUBE TAB */}
            <button
              onClick={() => setActiveTab('youtube')}
              className={`px-3.5 py-2 rounded-xl font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'youtube' ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Youtube className="w-4 h-4 text-red-300" /> YouTube Studio
            </button>

            {/* WEB SEARCH TAB */}
            <button
              onClick={() => setActiveTab('google')}
              className={`px-3.5 py-2 rounded-xl font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'google' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-4 h-4" /> Web Search
            </button>
          </div>

          <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Live Stream Ready
          </span>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4">
          
          {/* TAB 1: TAMASHA APP OFFICIAL INTEGRATION */}
          {activeTab === 'tamasha' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl font-black">
                    <MonitorPlay className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-amber-300">
                      Tamasha App Live Sports & Pakistani Channels
                    </h4>
                    <p className="text-xs text-slate-300">
                      Watch Live Cricket, PSL, ICC Tournaments, ARY, GEO, and Pakistani Dramas in HD.
                    </p>
                  </div>
                </div>

                <a
                  href="https://tamashaweb.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 shrink-0 hover:scale-105 transition"
                >
                  <ExternalLink className="w-4 h-4" /> Open Tamasha Fullscreen
                </a>
              </div>

              {/* Embedded Tamasha Portal Frame */}
              <div className="relative w-full h-[460px] bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                <iframe
                  src="https://tamashaweb.com"
                  title="Tamasha Live TV"
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* TAB 2: PAKISTANI & GLOBAL LIVE CHANNELS */}
          {activeTab === 'pakistan' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-3">
                <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                  <iframe
                    src={activeChannel.embedUrl}
                    title={activeChannel.name}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                  <span className="font-black text-sm text-amber-400">{activeChannel.name}</span>
                  <span className="text-xs text-emerald-400 font-bold">● Streaming Live HD</span>
                </div>
              </div>

              {/* Channels Selector */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
                {pakChannels.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setActiveChannel(c)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                      activeChannel.id === c.id
                        ? 'bg-amber-500/20 border-amber-400 shadow'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-800 text-amber-400 shrink-0">
                      <Play className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-extrabold text-xs text-slate-100 truncate">{c.name}</h5>
                      <span className="text-[10px] text-slate-400 font-semibold">{c.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: YOUTUBE DIRECT IN-APP PORTAL */}
          {activeTab === 'youtube' && (
            <div className="space-y-4">
              <form onSubmit={handleYtSearch} className="flex gap-2">
                <input
                  type="text"
                  value={ytQuery}
                  onChange={e => setYtQuery(e.target.value)}
                  placeholder="Search YouTube videos, live news, or paste YouTube link..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-100 outline-none focus:border-red-500 font-bold"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-2xl shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-4 h-4" /> Search YouTube
                </button>
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" /> Open YouTube
                </a>
              </form>

              {/* Embedded YouTube Player */}
              <div className="relative w-full h-[460px] bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                <iframe
                  src={ytEmbedUrl}
                  title="YouTube Player"
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE & WEB SEARCH */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <form onSubmit={handleGoogleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search web, mobile packages, exchange rates..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500 font-bold"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-2xl shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-4 h-4" /> Web Search
                </button>
              </form>

              <div className="relative w-full h-[460px] bg-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                <iframe
                  key={iframeKey}
                  src={searchBridgeUrl}
                  title="Web Search"
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
