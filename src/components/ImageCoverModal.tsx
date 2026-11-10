import React, { useState } from 'react';
import { X, Image as ImageIcon, Sparkles, RefreshCw, Check } from 'lucide-react';
import { NoteItem } from '../types';

interface ImageCoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  snippet: NoteItem | null;
  onApplyCover: (noteId: string, imageUrl: string) => void;
}

export const ImageCoverModal: React.FC<ImageCoverModalProps> = ({
  isOpen,
  onClose,
  snippet,
  onApplyCover,
}) => {
  const [prompt, setPrompt] = useState(
    snippet ? `Minimalist dark modern illustration for ${snippet.title}` : 'Modern dark obsidian bento abstract'
  );
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(snippet?.coverImage || null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !snippet) return null;

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          size: imageSize,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghasilkan cover ilustrasi');

      setGeneratedImage(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal generate gambar');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedImage) {
      onApplyCover(snippet.id, generatedImage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#121215] p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-sm shadow-indigo-500/20">
              <ImageIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Generate Cover Kartu Catatan</h3>
              <p className="text-xs text-zinc-400">Model: gemini-3-pro-image-preview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Note Context */}
        <div className="my-4 rounded-xl border border-white/5 bg-black/40 p-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Catatan Sasaran:</span>
          <p className="text-xs font-medium text-white truncate">{snippet.title}</p>
        </div>

        {/* Prompt Input */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-zinc-300">Prompt Visual Cover:</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Deskripsikan konsep gambar cover..."
            className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/50 focus:outline-none"
          />
        </div>

        {/* Image Size Affordance (1K, 2K, 4K) */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-zinc-300">Resolusi Gambar:</label>
            <span className="text-[11px] font-mono text-indigo-400">{imageSize === '1K' ? '1024×1024' : imageSize === '2K' ? '2048×2048' : '4096×4096'}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['1K', '2K', '4K'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setImageSize(size)}
                className={`rounded-xl border py-2 text-xs font-semibold transition-all cursor-pointer ${
                  imageSize === size
                    ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-sm shadow-indigo-500/10'
                    : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:border-white/10'
                }`}
              >
                {size} Resolution
              </button>
            ))}
          </div>
        </div>

        {/* Preview Frame */}
        <div className="relative mb-5 flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/60">
          {generatedImage ? (
            <img
              src={generatedImage}
              alt="Generated Cover"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-500">
              <Sparkles className="h-8 w-8 text-zinc-600" />
              <p className="text-xs">Klik "Generate Cover" untuk merender visual dengan Gemini</p>
            </div>
          )}

          {isGenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-xs text-zinc-300">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-400 mb-2" />
              <span>Memproses karya visual Gemini 3 Pro ({imageSize})...</span>
            </div>
          )}
        </div>

        {error && <p className="mb-4 text-xs text-rose-400">{error}</p>}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-40 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Generate Cover</span>
          </button>

          {generatedImage && (
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Terapkan pada Kartu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
