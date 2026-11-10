import React, { useState } from 'react';
import { Copy, Check, Pin, Image as ImageIcon, MoreVertical, Edit2, Trash2, Keyboard, LayoutGrid } from 'lucide-react';
import { NoteItem } from '../types';
import { SpotlightCard } from './SpotlightCard';

interface SnippetCardProps {
  snippet: NoteItem;
  index: number;
  isSelected?: boolean;
  isInBento?: boolean;
  onCopy: (snippet: NoteItem) => void;
  onGenerateCover: (snippet: NoteItem) => void;
  onEdit: (snippet: NoteItem) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleBento?: (id: string) => void;
  isCopied?: boolean;
}

export const SnippetCard: React.FC<SnippetCardProps> = ({
  snippet,
  index,
  isSelected,
  isInBento,
  onCopy,
  onGenerateCover,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleBento,
  isCopied,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const shortcutNum = index < 9 ? index + 1 : null;

  return (
    <SpotlightCard
      className={`h-full flex flex-col justify-between transition-all duration-200 ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-500/[0.05] shadow-lg shadow-indigo-500/20'
          : ''
      }`}
    >
      {/* Optional Cover Image */}
      {snippet.coverImage && (
        <div className="relative -mx-6 -mt-6 mb-4 h-32 overflow-hidden border-b border-white/10 bg-black/40">
          <img
            src={snippet.coverImage}
            alt={snippet.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Top Header: Metadata and keyboard shortcut indicator */}
      <div>
        <div className="flex items-center justify-between gap-2 text-xs text-zinc-400">
          {/* Zero-Pill Metadata */}
          <div className="flex items-center gap-1.5 truncate">
            {shortcutNum && (
              <span
                className="flex items-center gap-1 rounded border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-indigo-300 shadow-sm"
                title={`Pintasan Cepat: Tekan tombol angka ${shortcutNum} pada keyboard untuk menyalin seketika`}
              >
                <Keyboard className="h-3 w-3" />
                <span>[{shortcutNum}]</span>
              </span>
            )}
            <span className="font-semibold text-zinc-300">{snippet.folder || 'Pribadi'}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="font-mono tabular-nums text-zinc-500">{snippet.copyCount}x salin</span>
            {isInBento && (
              <>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span className="flex items-center gap-0.5 text-indigo-400 font-semibold text-[10px]">
                  <LayoutGrid className="h-3 w-3" />
                  <span>Bento</span>
                </span>
              </>
            )}
            {snippet.isPinned && (
              <>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span className="flex items-center gap-0.5 text-amber-400">
                  <Pin className="h-3 w-3 fill-amber-400" />
                  <span>Pinned</span>
                </span>
              </>
            )}
          </div>

          {/* Context Options Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-lg p-1 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-7 z-30 w-44 rounded-xl border border-white/10 bg-[#121215] p-1 shadow-2xl backdrop-blur-md"
                onMouseLeave={() => setShowMenu(false)}
              >
                {onToggleBento && (
                  <button
                    onClick={() => {
                      onToggleBento(snippet.id);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200 cursor-pointer"
                  >
                    <LayoutGrid className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{isInBento ? 'Lepas dari Bento' : '+ Pasang di Bento'}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onTogglePin(snippet.id);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-white cursor-pointer"
                >
                  <Pin className="h-3.5 w-3.5" />
                  <span>{snippet.isPinned ? 'Lepas Pin' : 'Sematkan'}</span>
                </button>
                <button
                  onClick={() => {
                    onGenerateCover(snippet);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-white cursor-pointer"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Buat Cover AI</span>
                </button>
                <button
                  onClick={() => {
                    onEdit(snippet);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-white cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Edit Catatan</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(snippet.id);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Note Title */}
        <h4 className="mt-2 text-base font-semibold text-white tracking-tight line-clamp-1">
          {snippet.title}
        </h4>

        {/* Note Content Box */}
        <div
          onClick={() => onCopy(snippet)}
          className="mt-3 cursor-pointer rounded-xl border border-white/5 bg-black/40 p-3.5 transition-colors hover:border-indigo-500/30 hover:bg-black/60"
          title="Klik di sini untuk langsung menyalin teks"
        >
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-300 line-clamp-4">
            {snippet.content}
          </p>
        </div>

        {/* Tags unboxed text */}
        {snippet.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500">
            {snippet.tags.map((tag, idx) => (
              <React.Fragment key={tag}>
                <span>#{tag}</span>
                {idx < snippet.tags.length - 1 && <span aria-hidden="true">·</span>}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Bar: 1-Click Copy */}
      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3">
        <span className="text-[11px] text-zinc-500">Klik kartu atau tombol untuk salin</span>

        <button
          onClick={() => onCopy(snippet)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
            isCopied
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-white/10 text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg hover:shadow-indigo-600/20'
          }`}
        >
          {isCopied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>{shortcutNum ? `Salin [${shortcutNum}]` : 'Salin Teks'}</span>
            </>
          )}
        </button>
      </div>
    </SpotlightCard>
  );
};
