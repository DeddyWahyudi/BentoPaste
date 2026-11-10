import React, { useState } from 'react';
import { Search, Plus, Keyboard } from 'lucide-react';
import { SlidingToggle } from './SlidingToggle';
import { CustomDropdown } from './CustomDropdown';
import { ViewMode } from '../types';
import { NoteDestination } from './ComposerModal';

interface HeroSectionProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  noteCount: number;
  docCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedFolder: string;
  onFolderChange: (folder: string) => void;
  folders: string[];
  onQuickAdd: (text: string, folder: string, destination: NoteDestination) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  viewMode,
  onViewModeChange,
  noteCount,
  docCount,
  searchQuery,
  onSearchChange,
  selectedFolder,
  onFolderChange,
  folders,
  onQuickAdd,
  searchInputRef,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [quickFolder, setQuickFolder] = useState<string>('Pribadi');
  const [quickDestination, setQuickDestination] = useState<NoteDestination>('quick');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onQuickAdd(quickInput.trim(), quickFolder, quickDestination);
    setQuickInput('');
  };

  return (
    <section className="relative pt-10 pb-6 z-20">
      {/* Ambient background glow isolated to prevent clipping popovers */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[700px] rounded-full bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Top Kicker */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
            <Keyboard className="h-3.5 w-3.5 text-indigo-400" />
            <span>Aplikasi Nota & Salin Instan Tanpa Menyentuh Mouse</span>
          </div>

          {/* Heading with White to Silver Gradient */}
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl text-balance">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Ketik. Tekan. Tersalin.
            </span>
          </h1>

          {/* Interactive Sliding Toggle (Grid Catatan Cepat vs Editor Paragraf Panjang) */}
          <div className="mt-7">
            <SlidingToggle
              mode={viewMode}
              onChange={onViewModeChange}
              noteCount={noteCount}
              docCount={docCount}
            />
          </div>
        </div>

        {/* Quick Note Ingest Bar */}
        <div className="mt-8 mx-auto max-w-4xl">
          <form
            onSubmit={handleQuickSubmit}
            className="group relative z-30 rounded-2xl border border-white/10 bg-[#121215]/90 p-2 shadow-2xl backdrop-blur-md transition-all hover:border-indigo-500/30"
          >
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
              <textarea
                rows={2}
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (quickInput.trim()) {
                      handleQuickSubmit(e);
                    }
                  }
                }}
                placeholder="Tulis kalimat atau paragraf di sini (bisa di-scroll jika panjang, tekan Enter untuk simpan, Shift+Enter baris baru)..."
                className="flex-1 min-h-[48px] max-h-[140px] overflow-y-auto overscroll-contain resize-y bg-transparent px-4 py-2.5 text-sm leading-relaxed text-white placeholder-zinc-500 focus:outline-none"
              />

              <div className="flex flex-wrap items-center gap-1.5 border-t md:border-t-0 md:border-l border-white/10 pt-2 md:pt-0 md:pl-2">
                <CustomDropdown
                  value={quickDestination}
                  onChange={(val) => setQuickDestination(val as NoteDestination)}
                  options={[
                    { value: 'quick', label: 'Ke: Catatan Cepat' },
                    { value: 'paragraph', label: 'Ke: Paragraf' },
                  ]}
                  buttonClassName="border-indigo-500/30 bg-indigo-500/10 text-indigo-200 py-2.5 px-3"
                />

                <CustomDropdown
                  value={quickFolder}
                  onChange={(val) => setQuickFolder(val)}
                  options={folders}
                  buttonClassName="border-white/10 bg-black/50 py-2.5 px-3"
                />

                <button
                  type="submit"
                  disabled={!quickInput.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:opacity-95 disabled:opacity-40 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Simpan Catatan</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Search & Folder Filter Controls (When in grid mode) */}
        {viewMode === 'grid' && (
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6">
            {/* Search Input with shortcut hint [/] */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                ref={searchInputRef as any}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari catatan... (tekan / untuk cari)"
                className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-12 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/50 focus:outline-none"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                /
              </span>
            </div>

            {/* Folder Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {['All', ...folders].map((f) => (
                <button
                  key={f}
                  onClick={() => onFolderChange(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    selectedFolder === f
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                      : 'border border-white/5 bg-[#121215] text-zinc-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  {f === 'All' ? 'Semua Catatan' : f}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
