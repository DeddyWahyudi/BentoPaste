import React from 'react';
import { motion } from 'motion/react';
import { LayoutGrid, FileText, Keyboard } from 'lucide-react';
import { ViewMode } from '../types';

interface SlidingToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  noteCount: number;
  docCount: number;
}

export const SlidingToggle: React.FC<SlidingToggleProps> = ({
  mode,
  onChange,
  noteCount,
  docCount,
}) => {
  return (
    <div className="relative inline-flex items-center rounded-xl border border-white/10 bg-[#121215]/90 p-1 backdrop-blur-md">
      {/* Option 1: Quick Notes Grid (Keyboard-first) */}
      <button
        onClick={() => onChange('grid')}
        className={`relative z-10 flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
          mode === 'grid' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        {mode === 'grid' && (
          <motion.div
            layoutId="active-toggle-indicator"
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20"
            transition={{ type: 'spring', stiffness: 450, damping: 35 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" />
          <span>Catatan Cepat</span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded bg-black/40 px-1 py-0.5 text-[10px] font-mono text-indigo-300">
            <Keyboard className="h-3 w-3" /> [1-9]
          </span>
          <span className="font-mono text-[10px] tabular-nums opacity-80">({noteCount})</span>
        </span>
      </button>

      {/* Option 2: Full Notes Editor */}
      <button
        onClick={() => onChange('editor')}
        className={`relative z-10 flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
          mode === 'editor' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        {mode === 'editor' && (
          <motion.div
            layoutId="active-toggle-indicator"
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20"
            transition={{ type: 'spring', stiffness: 450, damping: 35 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Editor Paragraf Panjang</span>
          <span className="font-mono text-[10px] tabular-nums opacity-80">({docCount})</span>
        </span>
      </button>
    </div>
  );
};
