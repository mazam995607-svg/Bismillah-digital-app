import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, Film, Sparkles, Play, Pause, Download, Share2, Music, 
  Layers, Palette, Clock, Wand2, Plus, Trash2, Check, X, RefreshCcw,
  User, Shirt, Scissors, Sun, Eye, Upload, Sliders
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export interface VideoScene {
  id: string;
  title: string;
  caption: string;
  duration: number; // seconds
  theme: 'gold' | 'neon' | 'emerald' | 'sunset';
  characterSkinFairness?: number; // 0 to 100
  characterBeard?: string; // none, trim, full
  characterHair?: string; // none, executive, fade
  characterOutfit?: string; // none, blazer, kurta
  bgLight?: number; // 50 to 150
  mediaUrl?: string;
}

export const VideoStudioModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('Shop Promo Video for Digital Retail POS');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  const [bgMusic, setBgMusic] = useState<'none' | 'promo' | 'upbeat' | 'islamic' | 'cyber'>('promo');
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);
  const [videoSpeed, setVideoSpeed] = useState(1);

  // Global Character & Background Controls
  const [actorFairness, setActorFairness] = useState(30);
  const [actorHair, setActorHair] = useState('executive');
  const [actorBeard, setActorBeard] = useState('trim');
  const [actorOutfit, setActorOutfit] = useState('blazer');
  const [videoBgLight, setVideoBgLight] = useState(100);

  const [scenes, setScenes] = useState<VideoScene[]>([
    {
      id: '1',
      title: 'Welcome to Smart Retail POS',
      caption: 'Your All-in-One Shop for Easyload, Bank Transfers & Bill Payments!',
      duration: 5,
      theme: 'gold',
      characterSkinFairness: 30,
      characterBeard: 'trim',
      characterHair: 'executive',
      characterOutfit: 'blazer',
      bgLight: 100
    },
    {
      id: '2',
      title: 'Instant Bank Transfers & Top-ups',
      caption: 'Fast, Secure, 100% Guaranteed Transaction Ledger.',
      duration: 5,
      theme: 'emerald',
      characterSkinFairness: 40,
      characterBeard: 'trim',
      characterHair: 'executive',
      characterOutfit: 'blazer',
      bgLight: 110
    },
    {
      id: '3',
      title: 'Visit Us Today!',
      caption: 'Main Shop Market • Open 7 Days a Week.',
      duration: 5,
      theme: 'neon',
      characterSkinFairness: 30,
      characterBeard: 'full',
      characterHair: 'fade',
      characterOutfit: 'kurta',
      bgLight: 95
    }
  ]);

  // Voiceover playback per scene
  useEffect(() => {
    if (isPlaying && voiceoverEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const currentScene = scenes[currentSceneIdx];
      if (currentScene) {
        const u = new SpeechSynthesisUtterance(currentScene.caption);
        u.rate = videoSpeed;
        window.speechSynthesis.speak(u);
      }
    }
  }, [isPlaying, currentSceneIdx, voiceoverEnabled, videoSpeed]);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackTime(prev => {
          const currentScene = scenes[currentSceneIdx];
          if (!currentScene) return 0;
          if (prev >= currentScene.duration) {
            if (currentSceneIdx < scenes.length - 1) {
              setCurrentSceneIdx(c => c + 1);
              return 0;
            } else {
              setIsPlaying(false);
              setCurrentSceneIdx(0);
              return 0;
            }
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentSceneIdx, scenes]);

  if (!isOpen) return null;

  // Add New Video Short / Scene
  const handleAddScene = () => {
    const newScene: VideoScene = {
      id: `scene-${Date.now()}`,
      title: `Short Clip #${scenes.length + 1}`,
      caption: 'Enter promotional script text or narration for this clip.',
      duration: 4,
      theme: 'gold',
      characterSkinFairness: actorFairness,
      characterBeard: actorBeard,
      characterHair: actorHair,
      characterOutfit: actorOutfit,
      bgLight: videoBgLight
    };
    setScenes(prev => [...prev, newScene]);
  };

  // Delete Video Short / Scene
  const handleDeleteScene = (id: string) => {
    if (scenes.length <= 1) return;
    setScenes(prev => prev.filter(s => s.id !== id));
    if (currentSceneIdx >= scenes.length - 1) {
      setCurrentSceneIdx(0);
    }
  };

  // Update Scene Props
  const handleUpdateScene = (idx: number, field: keyof VideoScene, val: any) => {
    setScenes(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  // Custom Media Upload per Scene
  const handleSceneMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      handleUpdateScene(idx, 'mediaUrl', evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const currentScene = scenes[currentSceneIdx] || scenes[0];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-5xl bg-slate-900 border border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-amber-400 flex items-center gap-2">
                Video Studio & Shorts Editor
              </h3>
              <p className="text-xs text-slate-400">
                Actor Face Beautifier • Beard & Hair Styles • Clothes Changer • Add/Delete Shorts
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

        {/* Content Layout Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* LEFT SIDE: SCENE LIST & ACTOR SETTINGS (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* CHARACTER / ACTOR CUSTOMIZATION PANEL */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
              <span className="font-black text-amber-400 block uppercase tracking-wide flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-400" /> Character Face, Hair, Beard & Outfit
              </span>

              {/* Face Fairness */}
              <div>
                <div className="flex justify-between font-bold text-slate-300 mb-1">
                  <span>Character Face Fairness</span>
                  <span className="text-amber-400">+{actorFairness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={actorFairness}
                  onChange={e => setActorFairness(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Background Light */}
              <div>
                <div className="flex justify-between font-bold text-slate-300 mb-1">
                  <span>Video Background Light</span>
                  <span className="text-cyan-400">{videoBgLight}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={videoBgLight}
                  onChange={e => setVideoBgLight(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Hair, Beard & Clothes Selectors */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Haircut</label>
                  <select
                    value={actorHair}
                    onChange={e => setActorHair(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-1.5 text-xs text-slate-100 font-bold outline-none"
                  >
                    <option value="none">Original</option>
                    <option value="executive">Executive</option>
                    <option value="fade">Fade Cut</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Dari / Beard</label>
                  <select
                    value={actorBeard}
                    onChange={e => setActorBeard(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-1.5 text-xs text-slate-100 font-bold outline-none"
                  >
                    <option value="none">Clean</option>
                    <option value="trim">Trimmed</option>
                    <option value="full">Full Royal</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Clothes</label>
                  <select
                    value={actorOutfit}
                    onChange={e => setActorOutfit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-1.5 text-xs text-slate-100 font-bold outline-none"
                  >
                    <option value="blazer">Navy Blazer</option>
                    <option value="kurta">Royal Kurta</option>
                    <option value="casual">Casual</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SCENES / SHORTS LIST & MANAGER */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-black text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-emerald-400" /> Video Clips & Shorts ({scenes.length})
                </span>
                <button
                  onClick={handleAddScene}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Short Clip
                </button>
              </div>

              <div className="space-y-2.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                {scenes.map((scene, idx) => (
                  <div
                    key={scene.id}
                    onClick={() => setCurrentSceneIdx(idx)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col space-y-2 ${
                      currentSceneIdx === idx
                        ? 'bg-amber-500/20 border-amber-400 shadow'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={scene.title}
                          onChange={e => handleUpdateScene(idx, 'title', e.target.value)}
                          className="bg-transparent border-b border-transparent focus:border-amber-400 font-black text-slate-100 text-xs outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold">{scene.duration}s</span>
                        {scenes.length > 1 && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteScene(scene.id);
                            }}
                            className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400"
                            title="Delete Clip"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <textarea
                      value={scene.caption}
                      onChange={e => handleUpdateScene(idx, 'caption', e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-[11px] text-slate-300 outline-none focus:border-amber-400 resize-none font-medium"
                      placeholder="Script or voiceover narration text..."
                    />

                    <div className="flex items-center justify-between pt-1">
                      <label className="text-[10px] text-cyan-400 font-bold cursor-pointer hover:underline flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Upload Scene Media
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={e => handleSceneMediaUpload(e, idx)}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        {scene.mediaUrl ? '✓ Custom Media Active' : 'AI Render Theme'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: LIVE VIDEO PLAYER STAGE (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-between bg-slate-950 border border-slate-800 rounded-3xl p-4 min-h-[380px]">
            
            {/* Live Video Stage Screen */}
            <div 
              className={`w-full rounded-2xl overflow-hidden shadow-2xl relative flex flex-col items-center justify-center p-6 text-center border-2 border-slate-800 transition-all duration-300 ${
                aspectRatio === '9:16' ? 'max-w-xs h-[420px]' : 'w-full h-[320px]'
              }`}
              style={{
                filter: `brightness(${videoBgLight}%)`,
                background: currentScene.theme === 'emerald'
                  ? 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)'
                  : currentScene.theme === 'neon'
                  ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
                  : 'linear-gradient(135deg, #451a03 0%, #78350f 100%)'
              }}
            >
              {currentScene.mediaUrl ? (
                <img
                  src={currentScene.mediaUrl}
                  alt="Scene Media"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                />
              ) : null}

              {/* Character Avatar with Hair, Beard, Clothes & Fairness Filter */}
              <div 
                className="relative mb-3 flex flex-col items-center"
                style={{ filter: `brightness(${1 + actorFairness / 100})` }}
              >
                <div className="w-24 h-24 rounded-full border-4 border-amber-400/80 bg-slate-900 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
                  <User className="w-16 h-16 text-amber-300 mt-2" />
                  {/* Beard indicator */}
                  {actorBeard !== 'none' && (
                    <div className="absolute bottom-2 w-10 h-3 bg-slate-950/90 rounded-full"></div>
                  )}
                </div>
                <span className="text-[10px] bg-slate-950/80 text-amber-300 font-extrabold px-2 py-0.5 rounded-full mt-1 border border-amber-400/40">
                  {actorOutfit === 'blazer' ? '👔 Navy Blazer' : '🥻 Royal Kurta'} • {actorHair} hair
                </span>
              </div>

              {/* Scene Dynamic Captions & Typography */}
              <h2 className="text-lg sm:text-xl font-black text-amber-300 drop-shadow-md z-10">
                {currentScene.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-md drop-shadow font-bold z-10">
                {currentScene.caption}
              </p>

              {/* Time Indicator */}
              <div className="absolute top-3 right-3 bg-slate-950/80 px-2.5 py-1 rounded-full text-[10px] font-black text-amber-400 border border-amber-400/40">
                {playbackTime}s / {currentScene.duration}s
              </div>
            </div>

            {/* Playback Controls */}
            <div className="w-full pt-4 flex items-center justify-between gap-3 border-t border-slate-800 mt-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause Video' : 'Play Live Video'}</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Aspect Ratio:</span>
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    aspectRatio === '16:9' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  16:9 Landscape
                </button>
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    aspectRatio === '9:16' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  9:16 Shorts
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
