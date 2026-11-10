import React, { useState } from 'react';
import { Copy, Check, Plus, Trash2, FileText, AlertTriangle, X } from 'lucide-react';
import { NoteDocument } from '../types';

interface LongNotesViewProps {
  notes: NoteDocument[];
  onSaveNote: (note: NoteDocument) => void;
  onDeleteNote: (id: string) => void;
  onCopy: (text: string, title?: string) => void;
}

export const LongNotesView: React.FC<LongNotesViewProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
  onCopy,
}) => {
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<NoteDocument | null>(null);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateActiveNote = (updates: Partial<NoteDocument>) => {
    if (!activeNote) return;
    const updated: NoteDocument = {
      ...activeNote,
      ...updates,
      wordCount: (updates.content ?? activeNote.content).split(/\s+/).filter(Boolean).length,
      updatedAt: Date.now(),
    };
    onSaveNote(updated);
  };

  const handleCreateNewNote = () => {
    const newNote: NoteDocument = {
      id: 'doc-' + Date.now(),
      title: 'Catatan Paragraf Baru',
      folder: 'Pekerjaan',
      content: 'Tulis paragraf panjang, draf surat, artikel, atau catatan rinci Anda di sini...',
      wordCount: 12,
      updatedAt: Date.now(),
    };
    onSaveNote(newNote);
    setActiveNoteId(newNote.id);
  };

  const handleCopyNote = () => {
    if (!activeNote) return;
    onCopy(activeNote.content, activeNote.title);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const requestDelete = (note: NoteDocument, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setNoteToDelete(note);
  };

  const confirmDelete = () => {
    if (!noteToDelete) return;
    const targetId = noteToDelete.id;
    const remaining = notes.filter((n) => n.id !== targetId);
    if (activeNote?.id === targetId) {
      setActiveNoteId(remaining[0]?.id || '');
    }
    onDeleteNote(targetId);
    setNoteToDelete(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* View Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Editor Paragraf Panjang & Dokumen
            </span>
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Ketik tulisan panjang dan salin seluruh isinya kapan saja dengan satu klik atau pintasan keyboard.
          </p>
        </div>

        <button
          onClick={handleCreateNewNote}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:opacity-95 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Dokumen Baru</span>
        </button>
      </div>

      {/* Two-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-2xl border border-white/10 bg-[#121215]/80 p-6 backdrop-blur-md">
        {/* Left Pane: Document Directory */}
        <div className="lg:col-span-4 flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul catatan..."
            className="mb-4 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/50 focus:outline-none"
          />

          <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveNoteId(note.id);
                  }
                }}
                className={`group flex w-full flex-col rounded-xl p-3 text-left transition-all cursor-pointer ${
                  activeNote?.id === note.id
                    ? 'border border-indigo-500/40 bg-indigo-500/10 shadow-sm'
                    : 'border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-indigo-400">{note.folder || 'Tanpa Kategori'}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-zinc-500 tabular-nums">
                      {note.content.length} huruf
                    </span>
                    <button
                      type="button"
                      onClick={(e) => requestDelete(note, e)}
                      className="rounded-lg p-1 text-zinc-500 hover:bg-rose-500/15 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Hapus dokumen ini"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <h4 className="mt-1 text-sm font-semibold text-white truncate">{note.title}</h4>
                <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{note.content}</p>
              </div>
            ))}

            {filteredNotes.length === 0 && (
              <div className="py-8 text-center text-xs text-zinc-500">
                Tidak ada dokumen yang cocok.
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Document Editor & Reader */}
        {activeNote ? (
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div>
              {/* Header Info */}
              <div className="flex flex-col gap-3.5 border-b border-white/10 pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Clear Bar for Naming Document Title */}
                  <div className="flex-1 min-w-[240px]">
                    <label className="mb-1.5 block text-[11px] font-medium text-zinc-400">
                      Nama / Judul Paragraf:
                    </label>
                    <input
                      type="text"
                      value={activeNote.title}
                      onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                      placeholder="Ketik judul paragraf..."
                      className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2 text-base font-bold text-white placeholder-zinc-500 transition-colors hover:border-white/25 focus:border-indigo-500 focus:bg-black/70 focus:outline-none"
                    />
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center gap-2 sm:pt-5">
                    <button
                      type="button"
                      onClick={handleCopyNote}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-all active:scale-95 cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-500 shadow-emerald-500/20'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-600/30 hover:opacity-95'
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
                          <span>Salin Seluruh Teks</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => requestDelete(activeNote)}
                      className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all active:scale-95 cursor-pointer"
                      title="Hapus Catatan Paragraf Ini"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>

                {/* Clear Bar for Naming Paragraph Type (Jenis Paragraf) & Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <label className="text-xs font-medium text-zinc-400">
                      Jenis Paragraf:
                    </label>
                    <input
                      type="text"
                      value={activeNote.folder}
                      onChange={(e) => handleUpdateActiveNote({ folder: e.target.value })}
                      placeholder="Contoh: Pekerjaan, Pribadi, Tugas..."
                      className="w-48 sm:w-56 rounded-lg border border-indigo-500/35 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 placeholder-indigo-400/40 transition-colors hover:border-indigo-400/50 focus:border-indigo-400 focus:bg-indigo-500/15 focus:text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-zinc-400">
                    <span className="font-mono font-semibold text-zinc-300 tabular-nums">
                      {activeNote.content.length} huruf
                    </span>
                    <span aria-hidden="true" className="text-zinc-600">·</span>
                    <span>
                      Diperbarui {new Date(activeNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Textarea Workspace */}
              <div className="mt-4">
                <textarea
                  rows={16}
                  value={activeNote.content}
                  onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                  placeholder="Ketik isi catatan atau tempel draf panjang di sini..."
                  className="w-full min-h-[300px] max-h-[540px] overflow-y-auto overscroll-contain resize-y rounded-xl border border-white/5 bg-black/30 p-4 font-mono text-sm leading-relaxed text-zinc-200 placeholder-zinc-600 focus:border-indigo-500/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500 border-t border-white/5 pt-3">
              <span>Tips: Anda bisa menyalin seluruh isi catatan ini kapan saja untuk langsung ditempel ke dokumen atau chat lain.</span>
              <span className="font-mono tabular-nums">{activeNote.content.length} huruf</span>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 flex flex-col items-center justify-center p-12 text-center text-zinc-500">
            <FileText className="h-10 w-10 text-zinc-600 mb-3" />
            <p className="text-sm font-medium text-zinc-300">Belum ada dokumen yang dipilih</p>
            <p className="mt-1 text-xs text-zinc-500">Pilih catatan dari panel kiri atau buat dokumen paragraf baru.</p>
            <button
              type="button"
              onClick={handleCreateNewNote}
              className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:opacity-95 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Buat Dokumen Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Popup Modal */}
      {noteToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in-0 duration-150"
          onClick={() => setNoteToDelete(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[#121215] p-6 shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/15 text-rose-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Hapus Dokumen Paragraf?</h3>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Pastikan dokumen ini memang ingin Anda hapus.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNoteToDelete(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Document Preview Box */}
            <div className="mt-4 rounded-xl border border-white/10 bg-black/50 p-3.5">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="font-semibold text-indigo-400">{noteToDelete.folder}</span>
                <span className="font-mono tabular-nums">{noteToDelete.content.length} huruf</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-white truncate">
                {noteToDelete.title}
              </p>
              <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                {noteToDelete.content}
              </p>
            </div>

            <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
              Tindakan ini akan menghapus dokumen secara permanen dan tidak dapat dibatalkan.
            </p>

            {/* Modal Actions */}
            <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setNoteToDelete(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/25 transition-all active:scale-95 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Ya, Hapus Dokumen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

