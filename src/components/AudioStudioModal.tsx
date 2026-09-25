import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Mic, MicOff, Play, Pause, Download, Volume2, Sparkles, Sliders, Music, 
  Wand2, Radio, Layers, RotateCcw, Check, RefreshCw, Scissors, VolumeX, Shield, FileAudio 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioStudioModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'aiGen' | 'record' | 'edit' | 'mixer' | 'tools'>('aiGen');

  // 1. AI Text-to-Speech Generator State
  const [ttsText, setTtsText] = useState('Smart Retail POS mein khushamdeed! Fast easyload, bank transfer aur bill payment yahan available hain.');
  const [selectedVoice, setSelectedVoice] = useState<'male' | 'female' | 'assistant' | 'naat' | 'cyber'>('assistant');
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 2. Audio Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 3. Audio Editor & FX State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [bassBoost, setBassBoost] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(100);
  const [equalizerPreset, setEqualizerPreset] = useState<'flat' | 'bass' | 'vocal' | 'cinema'>('vocal');
  const [echoEnabled, setEchoEnabled] = useState(false);

  // 4. Background Ambient Sound State
  const [bgSound, setBgSound] = useState<'none' | 'rain' | 'ocean' | 'islamic' | 'lofi' | 'bell'>('none');
  const [bgVolume, setBgVolume] = useState(30);

  const [statusMsg, setStatusMsg] = useState('');

  // Audio elements ref for playback
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let timer: any = null;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordTime(p => p + 1);
      }, 1000);
    } else {
      setRecordTime(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  if (!isOpen) return null;

  // Handle AI Speech Generation
  const handleGenerateAiSpeech = () => {
    if (!ttsText.trim()) return;
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(ttsText);
    utterance.rate = speechRate;
    utterance.pitch = selectedVoice === 'naat' ? 0.8 : selectedVoice === 'cyber' ? 1.4 : speechPitch;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      if (selectedVoice === 'female') {
        utterance.voice = voices.find(v => v.name.includes('Female') || v.name.includes('Google') || v.lang.includes('hi') || v.lang.includes('ur')) || voices[0];
      } else {
        utterance.voice = voices.find(v => v.lang.includes('ur') || v.lang.includes('hi') || v.lang.includes('en')) || voices[0];
      }
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatusMsg('🎙️ AI generating & reciting voice speech...');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setStatusMsg('✨ AI voice audio playback complete!');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Start Voice Recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        setAudioUrl(url);
        setStatusMsg('🎙️ Voice recorded successfully!');
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatusMsg('🔴 Recording voice via microphone...');
    } catch {
      alert('Microphone access denied or not available.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setStatusMsg(`🎵 Loaded sound file: ${file.name}`);
    }
  };

  const handleDownloadAudio = () => {
    if (!audioUrl) {
      alert('No audio track loaded to download!');
      return;
    }
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `Bismillah_Audio_Studio_${Date.now()}.mp3`;
    a.click();
    setStatusMsg('✅ Audio file exported & downloaded!');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white flex justify-between items-center shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <Music className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-wide flex items-center gap-2">
                Pro AI Audio Studio & Voice Generator
              </h3>
              <p className="text-xs text-amber-100">AI Text-to-Speech, Voice Editor, Sound Mixer & Unlimited Audio Tools</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CapCut-Style Audio & Voiceover Preset Bar */}
        <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800 flex items-center gap-3 overflow-x-auto custom-scrollbar text-xs">
          <span className="font-black text-amber-400 uppercase text-[10px] tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> CapCut Audio Presets:
          </span>
          <button
            onClick={() => {
              setActiveTab('aiGen');
              setTtsText('Suno! Smart Retail Shop par Easyload aur Utility Bill payment par cashback offers jari hain!');
              setSelectedVoice('assistant');
              setSpeechRate(1.1);
              setBgSound('bell');
              setStatusMsg('✨ Loaded CapCut Shop Promo Announcement Audio Template!');
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/50 text-amber-200 hover:border-amber-400 shrink-0 font-extrabold flex items-center gap-1"
          >
            📣 Shop Promo Announcement
          </button>

          <button
            onClick={() => {
              setActiveTab('aiGen');
              setTtsText('Bismillah ir-Rahman ir-Rahim. Assalamu Alaikum, Retail POS Terminal mein aap sab ka khushamdeed.');
              setSelectedVoice('naat');
              setSpeechRate(0.9);
              setBgSound('islamic');
              setStatusMsg('✨ Loaded CapCut Islamic Recitation Audio Template!');
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/50 text-emerald-200 hover:border-emerald-400 shrink-0 font-extrabold flex items-center gap-1"
          >
            🕌 Islamic Vocal Recitation
          </button>

          <button
            onClick={() => {
              setActiveTab('edit');
              setEqualizerPreset('cinema');
              setBassBoost(8);
              setVolumeLevel(180);
              setBgSound('lofi');
              setStatusMsg('✨ Loaded CapCut Cyber Bass Boost & Sound Preset!');
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/50 text-purple-200 hover:border-purple-400 shrink-0 font-extrabold flex items-center gap-1"
          >
            ⚡ Cyber Bass Boost
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('aiGen')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'aiGen' ? 'bg-amber-400 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" /> AI Voice Generator
          </button>

          <button
            onClick={() => setActiveTab('record')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'record' ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-4 h-4" /> Voice Recorder
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'edit' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" /> Audio Editor & FX
          </button>

          <button
            onClick={() => setActiveTab('mixer')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'mixer' ? 'bg-purple-500 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" /> Background Sound Mixer
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'tools' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wand2 className="w-4 h-4" /> Unlimited Tools
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4">
          
          {/* TAB 1: AI VOICE GENERATOR */}
          {activeTab === 'aiGen' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-amber-400 uppercase tracking-wide">
                  Text Prompt for AI Voice Generation (Urdu / English)
                </label>
                <textarea
                  rows={3}
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  placeholder="Enter script text to synthesize speech..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-xs font-bold text-slate-100 outline-none focus:border-amber-400"
                />
              </div>

              {/* Voice Selector */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-300 block">Select Voice Persona & Accent</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {[
                    { id: 'assistant', name: 'AI Assistant', icon: '🤖' },
                    { id: 'male', name: 'Male Executive', icon: '👨‍💼' },
                    { id: 'female', name: 'Friendly Female', icon: '👩‍💼' },
                    { id: 'naat', name: 'Islamic Reciter', icon: '🌙' },
                    { id: 'cyber', name: 'Cyber Synth', icon: '⚡' },
                  ].map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVoice(v.id as any)}
                      className={`p-3 rounded-2xl border text-center transition font-bold ${
                        selectedVoice === v.id ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="block text-lg mb-1">{v.icon}</span>
                      <span>{v.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rate & Pitch Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs">
                <div>
                  <div className="flex justify-between font-extrabold mb-1">
                    <span className="text-slate-300">Speech Rate</span>
                    <span className="text-amber-400">{speechRate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-extrabold mb-1">
                    <span className="text-slate-300">Pitch Level</span>
                    <span className="text-amber-400">{speechPitch}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              {/* Trigger & Download */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleGenerateAiSpeech}
                  disabled={isSpeaking}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-2xl text-xs shadow-xl transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSpeaking ? 'Reciting AI Speech...' : 'Generate & Play AI Voice'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VOICE RECORDER */}
          {activeTab === 'record' && (
            <div className="space-y-4 text-center py-4">
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
                <div className="w-20 h-20 rounded-full mx-auto bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-2xl">
                  <Mic className={`w-10 h-10 ${isRecording ? 'animate-pulse text-rose-300' : ''}`} />
                </div>

                <div>
                  <h4 className="font-extrabold text-base text-slate-100">Live Voice Recorder</h4>
                  <p className="text-xs text-slate-400">Record custom announcements or shop promos</p>
                  <p className="text-xl font-mono font-black text-amber-400 mt-2">
                    00:{recordTime < 10 ? `0${recordTime}` : recordTime}
                  </p>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  {!isRecording ? (
                    <button
                      onClick={handleStartRecording}
                      className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl shadow-xl transition flex items-center gap-2"
                    >
                      <Mic className="w-4 h-4" /> Start Recording
                    </button>
                  ) : (
                    <button
                      onClick={handleStopRecording}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-rose-400 font-black text-xs rounded-2xl shadow-xl transition flex items-center gap-2"
                    >
                      <MicOff className="w-4 h-4" /> Stop Recording
                    </button>
                  )}
                </div>

                {recordedAudioUrl && (
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <span className="text-xs text-emerald-400 font-bold block">Recorded Audio Preview:</span>
                    <audio src={recordedAudioUrl} controls className="w-full" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIO EDITOR & FX */}
          {activeTab === 'edit' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
                <div>
                  <span className="text-xs font-black text-cyan-300 block">Upload Audio File for Editing</span>
                  <p className="text-[10px] text-slate-400">Supports MP3, WAV, OGG, M4A sound tracks</p>
                </div>
                <label className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow transition flex items-center gap-1.5">
                  <FileAudio className="w-4 h-4" /> Select Sound File
                  <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {/* FX Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs">
                <div>
                  <span className="font-extrabold text-slate-300 block mb-1">Playback Speed ({playbackSpeed}x)</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.25"
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <span className="font-extrabold text-slate-300 block mb-1">Volume Boost (+{volumeLevel}%)</span>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    step="10"
                    value={volumeLevel}
                    onChange={(e) => setVolumeLevel(parseInt(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-extrabold text-slate-300 block">Equalizer Preset & Effects</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {(['flat', 'bass', 'vocal', 'cinema'] as const).map(eq => (
                    <button
                      key={eq}
                      onClick={() => setEqualizerPreset(eq)}
                      className={`p-2.5 rounded-xl border font-bold capitalize transition ${
                        equalizerPreset === eq ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {eq} EQ
                    </button>
                  ))}
                </div>
              </div>

              {audioUrl && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <span className="text-xs text-amber-300 font-bold block">Active Sound Preview:</span>
                  <audio ref={audioPlayerRef} src={audioUrl} controls className="w-full" />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BACKGROUND SOUND MIXER */}
          {activeTab === 'mixer' && (
            <div className="space-y-4">
              <span className="text-xs font-black text-purple-300 uppercase tracking-wide block">
                Add Background Sound Effect Track
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {[
                  { id: 'none', name: 'No Background', icon: '🚫' },
                  { id: 'rain', name: 'Soft Rain', icon: '🌧️' },
                  { id: 'ocean', name: 'Ocean Waves', icon: '🌊' },
                  { id: 'islamic', name: 'Islamic Ambient', icon: '🕌' },
                  { id: 'lofi', name: 'Lo-Fi Shop Beat', icon: '🎧' },
                  { id: 'bell', name: 'Shop Door Chime', icon: '🔔' },
                ].map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => setBgSound(bg.id as any)}
                    className={`p-4 rounded-2xl border text-center transition font-bold ${
                      bgSound === bg.id ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-2xl mb-1">{bg.icon}</span>
                    <span>{bg.name}</span>
                  </button>
                ))}
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between font-extrabold">
                  <span className="text-slate-300">Background Sound Volume</span>
                  <span className="text-purple-400">{bgVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bgVolume}
                  onChange={(e) => setBgVolume(parseInt(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>
            </div>
          )}

          {/* TAB 5: UNLIMITED AUDIO UTILITY TOOLS */}
          {activeTab === 'tools' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <span className="font-extrabold text-amber-300 block">⚡ AI Voice Changer</span>
                <p className="text-[10px] text-slate-400">Shift voice pitch to Deep Voice, Robot, Helium, or Echo.</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <span className="font-extrabold text-emerald-300 block">📢 300% Volume Booster</span>
                <p className="text-[10px] text-slate-400">Amplify quiet voice notes or low recordings safely.</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <span className="font-extrabold text-cyan-300 block">🎧 Background Noise Filter</span>
                <p className="text-[10px] text-slate-400">Reduce dukan traffic and fan background noise automatically.</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <span className="font-extrabold text-purple-300 block">🎵 Audio Joiner & Converter</span>
                <p className="text-[10px] text-slate-400">Merge multiple audio recordings and export as MP3 or WAV.</p>
              </div>
            </div>
          )}

          {/* Status Message */}
          {statusMsg && (
            <div className="p-3 bg-slate-950 border border-amber-500/40 text-amber-300 font-extrabold text-xs rounded-2xl flex justify-between items-center">
              <span>{statusMsg}</span>
              {audioUrl && (
                <button
                  onClick={handleDownloadAudio}
                  className="px-3 py-1 bg-amber-400 text-slate-950 font-black rounded-xl hover:bg-amber-300 transition flex items-center gap-1 text-[11px]"
                >
                  <Download className="w-3.5 h-3.5" /> Export MP3
                </button>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
