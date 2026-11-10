import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Zap, FileText } from 'lucide-react';
import { NoteItem } from '../types';
import { CustomDropdown } from './CustomDropdown';

export type NoteDestination = 'quick' | 'paragraph';

interface ComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    note: Omit<NoteItem, 'id' | 'copyCount' | 'createdAt' | 'updatedAt'>,
    destination: NoteDestination
  ) => void;
  initialData?: NoteItem | null;
  defaultDestination?: NoteDestination;
}

export const ComposerModal: React.FC<ComposerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultDestination = 'quick',
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [folder, setFolder] = useState<string>(initialData?.folder || 'Pribadi');
  const [tagInput, setTagInput] = useState(initialData?.tags.join(', ') || '');
  const [isPinned, setIsPinned] = useState(initialData?.isPinned || false);
  const [destination, setDestination] = useState<NoteDestination>(defaultDestination);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setContent(initialData?.content || '');
      setFolder(initialData?.folder || 'Pribadi');
      setTagInput(initialData?.tags.join(', ') || '');
      setIsPinned(initialData?.isPinned || false);
      setDestination(initialData ? 'quick' : defaultDestination);
    }
  }, [isOpen, initialData, defaultDestination]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const parsedTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave(
      {
        title: title.trim() || content.slice(0, 32) + '...',
        content: content.trim(),
        folder: folder.trim() || 'Pribadi',
        tags: parsedTags.length > 0 ? parsedTags : ['Catatan'],
        isPinned,
      },
      destination
    );

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-lg max-h-[86vh] rounded-2xl border border-white/10 bg-[#121215] p-4 sm:p-5 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-sm shadow-indigo-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {initialData ? 'Edit Catatan' : 'Tulis Catatan Baru'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Pilih untuk menyimpan tulisan ke Catatan Cepat atau Paragraf Panjang
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Batal / Tutup (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-3.5 flex flex-col flex-1 min-h-0">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain pr-1.5 space-y-3">
            {/* Destination Option Selector (Catatan Cepat vs Paragraf) */}
            {!initialData && (
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-300">
                  Simpan Hasil Tulisan Ke:
                </label>
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/50 p-1">
                  <button
                    type="button"
                    onClick={() => setDestination('quick')}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold transition-all cursor-pointer ${
                      destination === 'quick'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>Catatan Cepat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestination('paragraph')}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold transition-all cursor-pointer ${
                      destination === 'paragraph'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Paragraf Panjang</span>
                  </button>
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                {destination === 'paragraph' ? 'Nama / Judul Paragraf:' : 'Judul / Keterangan Singkat:'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  destination === 'paragraph'
                    ? 'Contoh: Draf Surat Resmi, Notulensi Rapat, Artikel...'
                    : 'Contoh: Alamat Rumah, Template Balasan WhatsApp, Password WiFi...'
                }
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/50 focus:outline-none"
              />
            </div>

            {/* Scrollable Content Area */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">
                  Isi Kalimat atau Paragraf (bisa di-scroll):
                </label>
                <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
                  {content.length} huruf
                </span>
              </div>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tulis atau tempel teks panjang di sini... Anda dapat menggulir (scroll) ke atas dan bawah untuk melihat keseluruhan tulisan."
                required
                className="w-full min-h-[115px] max-h-[240px] overflow-y-auto overscroll-contain resize-y rounded-xl border border-white/10 bg-black/50 p-3 text-xs leading-relaxed text-white placeholder-zinc-500 focus:border-indigo-500/50 focus:outline-none"
              />
            </div>

            {/* Folder & Tags Row */}
            <div className={`grid grid-cols-1 ${destination === 'quick' ? 'md:grid-cols-2' : ''} gap-3`}>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-300">
                  {destination === 'paragraph' ? 'Jenis Paragraf / Kategori:' : 'Kategori / Folder:'}
                </label>
                <CustomDropdown
                  value={folder}
                  onChange={(val) => setFolder(val)}
                  options={[
                    { value: 'Pribadi', label: 'Pribadi' },
                    { value: 'Tugas', label: 'Tugas' },
                    { value: 'Penting', label: 'Penting' },
                    { value: 'Pekerjaan', label: 'Pekerjaan' },
                    { value: 'Password', label: 'Password' },
                  ]}
                  className="w-full"
                  buttonClassName="w-full bg-black/60 py-2 px-3"
                />
              </div>

              {destination === 'quick' && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-300">
                    Tag Kata Kunci (pisahkan koma):
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Alamat, Kontak, Pengingat..."
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/50 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Pin Checkbox (Only for Quick Notes) */}
            {destination === 'quick' && (
              <div className="flex items-center gap-2 pt-0.5 pb-1">
                <input
                  type="checkbox"
                  id="pin-note"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-zinc-700 bg-black/50 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="pin-note" className="text-xs text-zinc-400 cursor-pointer">
                  Sematkan di bagian atas (Pin to Top)
                </label>
              </div>
            )}
          </div>

          {/* Pinned Footer Actions (Always Visible) */}
          <div className="mt-3 flex shrink-0 items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>
                {initialData
                  ? 'Simpan Perubahan'
                  : destination === 'paragraph'
                  ? 'Simpan ke Paragraf'
                  : 'Simpan ke Catatan Cepat'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

