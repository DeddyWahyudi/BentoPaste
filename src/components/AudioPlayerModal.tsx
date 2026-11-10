import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, Play, Pause, RefreshCw, Sparkles } from 'lucide-react';

interface AudioPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  textToRead: string;
  title?: string;
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({
  isOpen,
  onClose,
  textToRead,
  title,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Puck' | 'Fenrir' | 'Zephyr'>('Kore');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen && textToRead) {
      generateVoiceAudio(textToRead, selectedVoice);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isOpen, textToRead, selectedVoice]);

  const generateVoiceAudio = async (text: string, voice: string) => {
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghasilkan audio');

      const url = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
      setAudioUrl(url);

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => setIsPlaying(false);
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);

      await audio.play();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memproses Text-to-Speech');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#121215] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-sm shadow-indigo-500/20">
              <Volume2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Gemini TTS Audio Player</h3>
              <p className="text-xs text-zinc-400">Model: gemini-3.8-flash-tts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Text Snippet Preview */}
        <div className="my-5 rounded-xl border border-white/5 bg-black/40 p-4">
          {title && <h4 className="mb-1 text-xs font-semibold text-indigo-400">{title}</h4>}
          <p className="max-h-36 overflow-y-auto text-sm leading-relaxed text-zinc-300">
            {textToRead}
          </p>
        </div>

        {/* Voice Character Selection */}
        <div className="mb-5">
          <label className="mb-2 block text-xs font-medium text-zinc-400">Karakter Suara:</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'Kore', label: 'Kore', desc: 'Natural' },
              { id: 'Puck', label: 'Puck', desc: 'Bright' },
              { id: 'Fenrir', label: 'Fenrir', desc: 'Deep' },
              { id: 'Zephyr', label: 'Zephyr', desc: 'Warm' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVoice(v.id as any)}
                className={`flex flex-col items-center rounded-xl border p-2.5 text-xs transition-all cursor-pointer ${
                  selectedVoice === v.id
                    ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-sm'
                    : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:border-white/20'
                }`}
              >
                <span className="font-semibold">{v.label}</span>
                <span className="text-[10px] text-zinc-500">{v.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Player Controls & Waveform Simulation */}
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/60 p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              disabled={isLoading || !audioUrl}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </button>
            <div>
              <p className="text-xs font-medium text-white">
                {isLoading ? 'Sedang merender suara...' : isPlaying ? 'Sedang Memutar Audio' : 'Siap Diputar'}
              </p>
              <p className="text-[11px] text-zinc-400">Suara {selectedVoice} (24kHz WAV)</p>
            </div>
          </div>

          {/* Animated audio bars */}
          <div className="flex items-center gap-1">
            {[40, 70, 30, 90, 50, 80, 45, 60].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full bg-indigo-400 transition-all duration-200 ${
                  isPlaying ? 'animate-pulse' : 'opacity-30'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(12, Math.round(h * Math.random()))}px` : '12px',
                }}
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="mt-3 text-xs text-rose-400">{error}</p>
        )}
      </div>
    </div>
  );
};
