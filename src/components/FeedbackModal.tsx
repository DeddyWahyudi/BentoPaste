import React, { useState } from 'react';
import { X, Mail, Copy, Check, ExternalLink, Send, Sparkles, MessageSquareHeart } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const emailAddress = 'bentojatim@gmail.com';

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    onToast(`Email ${emailAddress} berhasil disalin ke papan klip! ✓`);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleOpenMailClient = (e: React.FormEvent) => {
    e.preventDefault();
    const mailSubject = encodeURIComponent(
      subject.trim() || 'Kritik dan Saran - Aplikasi QuickClip'
    );
    const mailBody = encodeURIComponent(
      message.trim()
        ? `${message.trim()}\n\n---\nDikirim dari QuickClip Note App`
        : 'Halo Tim QuickClip,\n\nBerikut kritik dan saran saya:\n\n'
    );
    const mailtoUrl = `mailto:${emailAddress}?subject=${mailSubject}&body=${mailBody}`;
    window.location.href = mailtoUrl;
    onToast('Membuka aplikasi email Gmail...');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#121215] p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 shadow-md shadow-indigo-500/20">
              <MessageSquareHeart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Kritik & Saran</h3>
              <p className="text-xs text-zinc-400">Masukan Anda sangat berarti bagi pengembangan aplikasi ini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Gmail Highlight Card */}
        <div className="mt-5 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-black/40 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-zinc-400">Kirim langsung via Gmail:</span>
                <p className="font-mono text-sm font-semibold text-white selection:bg-indigo-500/40">
                  {emailAddress}
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyEmail}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin Email</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Compose Form */}
        <form onSubmit={handleOpenMailClient} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
              Subjek Pesan:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Contoh: Saran fitur baru, kendala copy-paste..."
              className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
              Isi Kritik & Saran:
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan pengalaman, kendala, atau saran perbaikan Anda di sini..."
              className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-xs leading-relaxed text-white placeholder-zinc-500 focus:border-indigo-500/50 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-[11px] text-zinc-500">
              Akan dibuka di aplikasi email / Gmail
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:opacity-95 active:scale-95 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Kirim via Gmail</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
