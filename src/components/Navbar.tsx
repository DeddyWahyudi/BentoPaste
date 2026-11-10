import React from 'react';
import { Plus, Keyboard, Mail } from 'lucide-react';

interface NavbarProps {
  onOpenComposer: () => void;
  onScrollToBento: () => void;
  onScrollToLibrary: () => void;
  onOpenFeedback: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenComposer,
  onScrollToBento,
  onScrollToLibrary,
  onOpenFeedback,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Brand Wordmark with Animated Gemini Gradient Logo Background */}
        <a
          href="#"
          className="flex items-center gap-3 text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 group"
        >
          <div className="relative flex h-9 w-9 items-center justify-center">
            {/* Outer animated nebula aura */}
            <div className="absolute inset-0 rounded-xl gemini-gradient-glow blur-[6px] opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Animated Gemini Gradient Background Tile */}
            <div className="relative flex h-full w-full items-center justify-center rounded-xl gemini-gradient-bg p-1 shadow-lg shadow-indigo-500/25 transition-transform duration-200 group-hover:scale-105 overflow-hidden">
              <img
                src="/assets/aistudio/bento_logo_clean.png"
                alt="Bento QuickClip Logo"
                className="relative z-10 h-full w-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>
          <span className="bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent font-bold">
            QuickClip
          </span>
        </a>

        {/* Zone 2: Clean nav links with whitespace-nowrap */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
          <button
            onClick={onScrollToBento}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Spotlight Bento
          </button>
          <button
            onClick={onScrollToLibrary}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Koleksi Catatan
          </button>
          <a
            href="#shortcuts"
            className="flex items-center gap-1 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Keyboard className="h-3.5 w-3.5 text-indigo-400" />
            <span>Shortcut [1-9]</span>
          </a>
          <button
            onClick={onOpenFeedback}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-indigo-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Kirim kritik dan saran via Gmail"
          >
            <Mail className="h-3.5 w-3.5 text-indigo-400" />
            <span>Kritik & Saran</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenComposer}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:opacity-95 hover:shadow-indigo-600/30 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tulis Catatan</span>
            <kbd className="hidden sm:inline rounded bg-black/30 px-1 py-0.5 text-[10px] font-mono text-indigo-200">
              N
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
