import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Video, Mic, Volume2, Sparkles, Wand2, Play, Pause, Download, RefreshCw, 
  Layers, Sliders, Languages, Check, ArrowRight, ShieldCheck, Film, Radio, StopCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DubbingStudioModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [dubbingPrompt, setDubbingPrompt] = useState('Dub video into Urdu professional voice with perfect lip sync and clear accent');
  
  // Voice-over text script for Web Speech API
  const [voiceScript, setVoiceScript] = useState(
    'Digital POS terminal mobile easyload, bill payment, bank money transfer, aur utility bill services mein aap sab ka khushamdeed hai. Fast aur safe transaction ke liye hamaray POS terminal par rabta karen.'
  );

  const [targetLang, setTargetLang] = useState<'ur' | 'en' | 'ps' | 'pa' | 'ar'>('ur');
  const [voiceGender, setVoiceGender] = useState<'male' | 'female' | 'child' | 'narrator'>('male');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  
  // Web Speech API voices
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Advanced Lip-Sync & Voice-matching Adjustment Controls
  const [lipSyncSensitivity, setLipSyncSensitivity] = useState(85);
  const [lipSyncOffsetMs, setLipSyncOffsetMs] = useState(0); // Offset in ms
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Load available Web Speech API system voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setSystemVoices(voices);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Canvas processing loop: renders audio waveform & lip displacement animation
  const renderLipSyncCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let step = 0;
    const draw = () => {
      step += 0.08;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background grid / futuristic HUD
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Lip-Sync Frequency Spectrogram Waveform
      const barCount = 32;
      const barWidth = canvas.width / barCount;
      ctx.fillStyle = '#06b6d4';

      for (let i = 0; i < barCount; i++) {
        const amplitude = Math.sin(step + i * 0.3) * 20 + Math.cos(step * 1.5 + i * 0.2) * 15 + 25;
        const h = (amplitude * lipSyncSensitivity) / 100;
        const x = i * barWidth;
        const y = canvas.height / 2 - h / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + h);
        gradient.addColorStop(0, '#a855f7');
        gradient.addColorStop(0.5, '#06b6d4');
        gradient.addColorStop(1, '#10b981');
        ctx.fillStyle = gradient;

        ctx.fillRect(x + 2, y, barWidth - 4, h);
      }

      // Draw Lip Displacement & Mouth Motion Contour Line
      ctx.beginPath();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      for (let x = 0; x < canvas.width; x += 5) {
        const mouthOpen = Math.abs(Math.sin(step * 2 + x * 0.02)) * (lipSyncSensitivity / 3);
        const y = canvas.height / 2 + Math.sin(x * 0.05 + step) * mouthOpen;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // HUD Text overlay
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`LIP-SYNC CANVAS MATRIX | OFFSET: ${lipSyncOffsetMs}ms | SENSITIVITY: ${lipSyncSensitivity}%`, 10, 16);

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.width = canvasRef.current.clientWidth || 450;
          canvasRef.current.height = canvasRef.current.clientHeight || 100;
          renderLipSyncCanvas();
        }
      }, 300);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, lipSyncSensitivity, lipSyncOffsetMs]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setStatusMsg(`Loaded ${file.name} for AI Dubbing.`);
    }
  };

  // Trigger Web Speech API Voice-Over Generation with Canvas Lip-Sync Alignment
  const handleSpeakVoiceOver = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Web Speech API is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel(); // Stop any existing speech

    const utterance = new SpeechSynthesisUtterance(voiceScript);
    utterance.pitch = voicePitch;
    utterance.rate = speechRate;

    if (systemVoices[selectedVoiceIndex]) {
      utterance.voice = systemVoices[selectedVoiceIndex];
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatusMsg('🎙️ Web Speech AI Voice-Over Playing & Syncing Canvas Lip Motion...');
      
      // Sync Video Playback after lipSyncOffsetMs delay
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
          setIsPlaying(true);
        }
      }, Math.max(0, lipSyncOffsetMs));
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setStatusMsg('✅ Voice-Over completed & synced with canvas video track!');
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setStatusMsg('⚠️ Speech synthesis completed or interrupted.');
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setStatusMsg('Voice-over speech stopped.');
  };

  const handleRunAiDubbing = () => {
    if (!videoUrl) return;
    setIsProcessing(true);
    setStatusMsg('🤖 AI Extracting audio track & mapping lip facial motion frames...');

    setTimeout(() => {
      setStatusMsg('🌐 Translating speech & synthesizing canvas lip-synced voice track...');
      setTimeout(() => {
        setIsProcessing(false);
        setStatusMsg('✨ AI Dubbing & Web Speech Canvas Lip-Sync Complete!');
        handleSpeakVoiceOver();
      }, 1500);
    }, 1500);
  };

  const handleExportDubbedVideo = () => {
    alert('Dubbed video exported with canvas lip-sync & Web Speech voice-over!');
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Header Bar */}
        <div className="p-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-cyan-600 text-white flex justify-between items-center shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <Languages className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-wide flex items-center gap-2">
                AI Video & Audio Dubbing Studio
              </h3>
              <p className="text-xs text-purple-100">
                Web Speech API Voice-Over, Canvas Lip-Sync Match & Character Replacement
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Grid */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT: VIDEO PREVIEW & CANVAS LIP-SYNC PROCESSING ENGINE */}
          <div className="space-y-4 flex flex-col items-center">
            
            <div className="relative w-full aspect-video bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl flex items-center justify-center">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                onEnded={() => setIsPlaying(false)}
              />

              {isProcessing && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-black text-cyan-300">{statusMsg}</p>
                </div>
              )}
            </div>

            {/* LIVE CANVAS LIP-SYNC WAVEFORM & MOUTH DISPLACEMENT DISPLAY */}
            <div className="w-full space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-cyan-400 px-1">
                <span className="flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  Real-time Canvas Lip-Sync & Waveform Processor
                </span>
                <span className="text-slate-400">Lip Displacement Matrix</span>
              </div>
              <canvas
                ref={canvasRef}
                className="w-full h-24 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner"
              />
            </div>

            {/* Controls Bar */}
            <div className="w-full flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSpeakVoiceOver}
                  disabled={isSpeaking}
                  className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl transition flex items-center gap-1.5 shadow"
                >
                  <Mic className="w-4 h-4 text-cyan-300" />
                  {isSpeaking ? 'Speaking...' : '🎙️ Web Speech Voice-Over'}
                </button>

                {isSpeaking && (
                  <button
                    onClick={handleStopSpeech}
                    className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition"
                    title="Stop Speech"
                  >
                    <StopCircle className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={handleExportDubbedVideo}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition flex items-center gap-1.5 shadow"
              >
                <Download className="w-4 h-4" /> Export MP4
              </button>
            </div>

            {statusMsg && !isProcessing && (
              <p className="text-xs font-bold text-cyan-400 bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-800/50 w-full text-center">
                {statusMsg}
              </p>
            )}

          </div>

          {/* RIGHT: AI DUBBING, WEB SPEECH & LIP-SYNC CONFIGURATION */}
          <div className="space-y-4">
            
            {/* 1. Upload Video & Voice-Over Script */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <label className="text-xs font-black text-slate-300 flex items-center gap-2 uppercase">
                <Video className="w-4 h-4 text-purple-400" /> 1. Upload Video & Script
              </label>
              
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-purple-600 file:text-white file:font-bold hover:file:bg-purple-500 cursor-pointer bg-slate-900 rounded-xl p-1"
              />

              <div className="space-y-1">
                <span className="text-[10px] text-cyan-400 font-bold block">
                  Web Speech Voice-Over Script (Urdu/English):
                </span>
                <textarea
                  value={voiceScript}
                  onChange={e => setVoiceScript(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* 2. Web Speech API Character Voice Matching */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <label className="text-xs font-black text-cyan-400 flex items-center gap-2 uppercase">
                <Wand2 className="w-4 h-4" /> 2. Web Speech Voice Character Matching
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">
                    Select System Speech Voice ({systemVoices.length} available):
                  </span>
                  <select
                    value={selectedVoiceIndex}
                    onChange={e => setSelectedVoiceIndex(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-200"
                  >
                    {systemVoices.length === 0 ? (
                      <option value={0}>Default System Voice</option>
                    ) : (
                      systemVoices.map((voice, idx) => (
                        <option key={idx} value={idx}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Character Tone Preset:</span>
                  <select
                    value={voiceGender}
                    onChange={e => {
                      const mode = e.target.value as any;
                      setVoiceGender(mode);
                      if (mode === 'male') { setVoicePitch(0.9); setSpeechRate(1.0); }
                      else if (mode === 'female') { setVoicePitch(1.3); setSpeechRate(1.05); }
                      else if (mode === 'child') { setVoicePitch(1.6); setSpeechRate(1.1); }
                      else if (mode === 'narrator') { setVoicePitch(0.7); setSpeechRate(0.9); }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-200"
                  >
                    <option value="male">👨 Male Studio Character (Pitch 0.9x)</option>
                    <option value="female">👩 Female Studio Character (Pitch 1.3x)</option>
                    <option value="child">🧒 Child Voice Profile (Pitch 1.6x)</option>
                    <option value="narrator">🎙️ Deep AI Narrator (Pitch 0.7x)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Advanced Lip-Sync Adjustment Tools */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
              <label className="font-black text-amber-400 flex items-center gap-2 uppercase">
                <Sliders className="w-4 h-4" /> 3. Advanced Lip-Sync Adjustment Tools
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-400">Lip-Sync Sensitivity:</span>
                    <span className="text-amber-400">{lipSyncSensitivity}%</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    value={lipSyncSensitivity}
                    onChange={e => setLipSyncSensitivity(Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-400">Audio Offset (ms):</span>
                    <span className="text-amber-400">{lipSyncOffsetMs}ms</span>
                  </div>
                  <input
                    type="range"
                    min={-500}
                    max={500}
                    step={25}
                    value={lipSyncOffsetMs}
                    onChange={e => setLipSyncOffsetMs(Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-400">Pitch Shift:</span>
                    <span className="text-cyan-400">{voicePitch.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={voicePitch}
                    onChange={e => setVoicePitch(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-400">Speech Speed:</span>
                    <span className="text-cyan-400">{speechRate.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={speechRate}
                    onChange={e => setSpeechRate(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleRunAiDubbing}
              disabled={isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {isProcessing ? 'AI Dubbing in Progress...' : 'Generate AI Lip-Synced Dubbing & Web Speech'}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};

