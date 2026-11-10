import React from 'react';
import { Check, Copy } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-2xl border border-white/20 bg-[#121215]/95 px-5 py-3 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="h-3.5 w-3.5" />
      </div>
      <p className="text-xs font-semibold text-white tracking-wide">{message}</p>
    </div>
  );
};
