import React, { useState } from 'react';
import { Globe, Music, Video, Code, FileText, Gamepad2, Sparkles, ExternalLink, Search, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const UsefulWebsitesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const tools = [
    // AUDIO TOOLS
    { name: 'ElevenLabs AI Voice', cat: 'audio', url: 'https://elevenlabs.io', desc: 'Ultra-realistic AI voice generator & text to speech' },
    { name: 'Suno AI Music', cat: 'audio', url: 'https://suno.com', desc: 'Create full songs with AI lyrics & vocals' },
    { name: 'LALAL.AI Stem Separator', cat: 'audio', url: 'https://lalal.ai', desc: 'Extract vocals & instruments from music' },
    { name: 'Vocal Remover', cat: 'audio', url: 'https://vocalremover.org', desc: 'Free online vocal and music remover' },

    // VIDEO TOOLS
    { name: 'Runway Gen-2 Video', cat: 'video', url: 'https://runwayml.com', desc: 'Generate high quality AI videos from text/photos' },
    { name: 'CapCut Web Video Editor', cat: 'video', url: 'https://capcut.com', desc: 'Free full video editing suite online' },
    { name: 'Pika Labs AI Video', cat: 'video', url: 'https://pika.art', desc: 'Animate photos and text into 3D videos' },
    { name: 'Veed.io Video Maker', cat: 'video', url: 'https://veed.io', desc: 'Add auto subtitles, transcriptions & edits' },

    // APP & WEBSITE CREATION
    { name: 'Google AI Studio', cat: 'app', url: 'https://ai.studio', desc: 'Build full stack web apps & AI prototypes' },
    { name: 'GitHub Web', cat: 'app', url: 'https://github.com', desc: 'Code repository hosting & collaborative development' },
    { name: 'Vite & React Docs', cat: 'app', url: 'https://vite.dev', desc: 'Next generation frontend tooling framework' },
    { name: 'Tailwind CSS Docs', cat: 'app', url: 'https://tailwindcss.com', desc: 'Utility-first CSS styling reference' },

    // DOCUMENTS & PDF & OCR
    { name: 'iLovePDF Tools', cat: 'docs', url: 'https://ilovepdf.com', desc: 'Merge, split, compress & convert PDFs' },
    { name: 'Canva Design & Docs', cat: 'docs', url: 'https://canva.com', desc: 'Design flyers, receipts, banners & documents' },
    { name: 'Smallpdf Suite', cat: 'docs', url: 'https://smallpdf.com', desc: 'PDF editing, OCR scanning & signatures' },
    { name: 'Google Docs Web', cat: 'docs', url: 'https://docs.google.com', desc: 'Online document editor & real-time collaboration' },

    // AI & GENERAL UTILITIES
    { name: 'Google Gemini AI', cat: 'ai', url: 'https://gemini.google.com', desc: 'Google flagship AI assistant for coding & analysis' },
    { name: 'ChatGPT OpenAI', cat: 'ai', url: 'https://chatgpt.com', desc: 'Conversational AI & task assistant' },
    { name: 'Claude AI Anthropic', cat: 'ai', url: 'https://claude.ai', desc: 'Advanced reasoning & document analysis AI' },
  ];

  if (!isOpen) return null;

  const filtered = tools.filter(t => {
    const matchesCat = filter === 'all' || t.cat === filter;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-slate-100">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <Globe className="w-6 h-6 text-amber-300 animate-spin" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-wide flex items-center gap-1.5">
                Mofeed Useful Websites & AI Tools <Sparkles className="w-4 h-4 text-amber-300" />
              </h3>
              <p className="text-xs text-cyan-100 font-semibold">Audio, Video, Apps, Websites, Documents, Games & AI Services</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTROLS BAR */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search websites by name or category (e.g. video, audio, pdf, ai)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-100 font-semibold outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold no-scrollbar">
            {[
              { id: 'all', label: 'All Tools' },
              { id: 'audio', label: '🎵 Audio & Music' },
              { id: 'video', label: '🎬 Video Editing' },
              { id: 'app', label: '💻 Apps & Web' },
              { id: 'docs', label: '📄 Documents & PDF' },
              { id: 'ai', label: '🤖 AI Assistants' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                  filter === f.id
                    ? 'bg-cyan-500 text-slate-950 font-black shadow'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* TOOLS GRID */}
        <div className="p-4 overflow-y-auto space-y-3 flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((t, idx) => (
              <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-cyan-500/50 transition">
                <div className="pr-2 min-w-0">
                  <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider block">{t.cat}</span>
                  <h4 className="text-sm font-extrabold text-slate-100 truncate">{t.name}</h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5 line-clamp-2">{t.desc}</p>
                </div>

                <a
                  href={t.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow flex items-center gap-1 shrink-0"
                >
                  Open <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
