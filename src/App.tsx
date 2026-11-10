import React, { useState, useEffect, useRef } from 'react';
import { NoteItem, NoteDocument, ViewMode } from './types';
import { INITIAL_NOTE_ITEMS, INITIAL_DOCUMENTS } from './data/initialSnippets';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BentoGridShowcase } from './components/BentoGridShowcase';
import { SnippetCard } from './components/SnippetCard';
import { LongNotesView } from './components/LongNotesView';
import { ComposerModal, NoteDestination } from './components/ComposerModal';
import { ImageCoverModal } from './components/ImageCoverModal';
import { FeedbackModal } from './components/FeedbackModal';
import { Toast } from './components/Toast';
import { Plus, Pin, Sparkles, Download, Keyboard, Mail, MessageSquareHeart, Copy, Check, ExternalLink } from 'lucide-react';

export default function App() {
  // 1. Persistent State
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('quickclip_notes_list');
      if (saved) {
        const parsed: NoteItem[] = JSON.parse(saved);
        // Remove default sample Gym notes and migrate any custom legacy folders ('Gym', 'Ide', 'Umum', 'Template')
        const withoutSampleGym = parsed.filter((n) => !n.id.startsWith('note-gym-'));
        const cleaned = withoutSampleGym.map((n) => {
          if (n.folder === 'Gym' || n.folder === 'Ide' || n.folder === 'Template') {
            return { ...n, folder: 'Pekerjaan' };
          }
          if (n.folder === 'Umum') {
            return { ...n, folder: 'Pribadi' };
          }
          return n;
        });

        let updatedList = [...cleaned];
        // Ensure initial Pekerjaan notes are included if none exist yet
        if (!updatedList.some((n) => n.folder === 'Pekerjaan')) {
          const workNotes = INITIAL_NOTE_ITEMS.filter((n) => n.folder === 'Pekerjaan');
          updatedList = [...updatedList, ...workNotes];
        }
        // Ensure initial Password notes are included if none exist yet
        if (!updatedList.some((n) => n.folder === 'Password')) {
          const passNotes = INITIAL_NOTE_ITEMS.filter((n) => n.folder === 'Password');
          updatedList = [...updatedList, ...passNotes];
        }
        return updatedList;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_NOTE_ITEMS;
  });

  const [documents, setDocuments] = useState<NoteDocument[]>(() => {
    try {
      const saved = localStorage.getItem('quickclip_docs_list');
      if (saved) {
        const parsed: NoteDocument[] = JSON.parse(saved);
        const withoutSampleGymDoc = parsed.filter((d) => d.id !== 'doc-gym');
        const cleaned = withoutSampleGymDoc.map((d) => {
          if (d.folder === 'Gym' || d.folder === 'Ide' || d.folder === 'Template') {
            return { ...d, folder: 'Pekerjaan' };
          }
          if (d.folder === 'Umum' || d.folder === 'Perencanaan') {
            return { ...d, folder: 'Pribadi' };
          }
          return d;
        });
        if (!cleaned.some((d) => d.folder === 'Pekerjaan')) {
          const workDocs = INITIAL_DOCUMENTS.filter((d) => d.folder === 'Pekerjaan');
          return [...cleaned, ...workDocs];
        }
        return cleaned;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DOCUMENTS;
  });

  // Bento Grid Customization State (Easily add or remove cards)
  const [bentoNoteIds, setBentoNoteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('quickclip_bento_ids');
      if (saved) {
        const parsedIds: string[] = JSON.parse(saved);
        const migratedIds = parsedIds.map((id) => {
          if (id === 'note-gym-1') return 'note-work-1';
          if (id === 'note-gym-2') return 'note-pass-1';
          if (id === 'note-gym-3') return 'note-work-2';
          return id;
        });
        return Array.from(new Set(migratedIds));
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_NOTE_ITEMS.slice(0, 4).map((n) => n.id);
  });

  // 2. View Mode & Filtering
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [lastCopiedId, setLastCopiedId] = useState<string | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);

  // 3. Modals & Drawers
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [coverTargetNote, setCoverTargetNote] = useState<NoteItem | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // 4. Toast Feedback
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const bentoSectionRef = useRef<HTMLDivElement>(null);
  const librarySectionRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem('quickclip_notes_list', JSON.stringify(notes));
    } catch (e) {
      console.error(e);
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem('quickclip_docs_list', JSON.stringify(documents));
    } catch (e) {
      console.error(e);
    }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem('quickclip_bento_ids', JSON.stringify(bentoNoteIds));
    } catch (e) {
      console.error(e);
    }
  }, [bentoNoteIds]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 2400);
  };

  // Bento Grid Card Controls (Add, Remove, Toggle, Reset)
  const handleRemoveFromBento = (id: string) => {
    setBentoNoteIds((prev) => prev.filter((bId) => bId !== id));
    const targetNote = notes.find((n) => n.id === id);
    triggerToast(`"${targetNote?.title || 'Kartu'}" dilepas dari Bento Grid.`);
  };

  const handleAddToBento = (id: string) => {
    if (!bentoNoteIds.includes(id)) {
      setBentoNoteIds((prev) => [...prev, id]);
      const targetNote = notes.find((n) => n.id === id);
      triggerToast(`"${targetNote?.title || 'Kartu'}" ditambahkan ke Bento Grid! ✓`);
    }
  };

  const handleToggleBento = (id: string) => {
    if (bentoNoteIds.includes(id)) {
      handleRemoveFromBento(id);
    } else {
      handleAddToBento(id);
    }
  };

  const handleResetBento = () => {
    const defaultIds = notes.slice(0, 4).map((n) => n.id);
    setBentoNoteIds(defaultIds);
    triggerToast('Susunan Bento Grid dikembalikan ke default.');
  };

  // Compute active cards inside Bento Grid
  const bentoNotes = bentoNoteIds
    .map((id) => notes.find((n) => n.id === id))
    .filter((n): n is NoteItem => Boolean(n));

  // 1-Click / 1-Key Copy Handler
  const handleCopyNote = (note: NoteItem) => {
    navigator.clipboard.writeText(note.content);
    setLastCopiedId(note.id);
    triggerToast(`"${note.title}" disalin ke papan klip! ✓`);

    // Increment copy count
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, copyCount: n.copyCount + 1 } : n))
    );

    setTimeout(() => {
      setLastCopiedId(null);
    }, 2000);
  };

  const handleCopyRawText = (text: string, title?: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(title ? `"${title}" disalin ke papan klip! ✓` : 'Teks berhasil disalin ke papan klip! ✓');
  };

  // Clean Folder list (Pribadi, Tugas, Penting, Pekerjaan, Password)
  const folders: string[] = ['Pribadi', 'Tugas', 'Penting', 'Pekerjaan', 'Password'];

  // Filtered Notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFolder = selectedFolder === 'All' || n.folder === selectedFolder;

    return matchesSearch && matchesFolder;
  });

  // Global Keyboard Navigation (Zero-Mouse Instant Copy)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);

      // Escape to blur or close modals
      if (e.key === 'Escape') {
        if (isInputActive) {
          (activeEl as HTMLElement).blur();
          return;
        }
        if (isComposerOpen) setIsComposerOpen(false);
        if (coverTargetNote) setCoverTargetNote(null);
        if (isFeedbackOpen) setIsFeedbackOpen(false);
        return;
      }

      if (isInputActive) return;

      // 1. Direct number shortcut [1 - 9] to copy note slot instantly without mouse
      if (/^[1-9]$/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const slotIndex = parseInt(e.key, 10) - 1;
        if (filteredNotes[slotIndex]) {
          e.preventDefault();
          handleCopyNote(filteredNotes[slotIndex]);
          setSelectedCardIndex(slotIndex);
        }
        return;
      }

      // 2. Navigation with Arrow keys or j/k
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        setSelectedCardIndex((prev) => Math.min(prev + 1, filteredNotes.length - 1));
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        setSelectedCardIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      // 3. Enter or 'c' to copy selected note
      if ((e.key === 'Enter' || e.key.toLowerCase() === 'c') && !e.metaKey && !e.ctrlKey) {
        if (filteredNotes[selectedCardIndex]) {
          e.preventDefault();
          handleCopyNote(filteredNotes[selectedCardIndex]);
        }
        return;
      }

      // 4. '/' to focus search input instantly without mouse
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // 5. 'n' or Cmd/Ctrl + N to open composer
      if (
        (e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey) ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n')
      ) {
        e.preventDefault();
        setEditingNote(null);
        setIsComposerOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredNotes, selectedCardIndex, isComposerOpen, coverTargetNote, isFeedbackOpen]);

  // Note CRUD
  const handleSaveNote = (
    noteData: Omit<NoteItem, 'id' | 'copyCount' | 'createdAt' | 'updatedAt'>,
    destination: NoteDestination = 'quick'
  ) => {
    if (editingNote) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNote.id
            ? {
                ...n,
                ...noteData,
                updatedAt: Date.now(),
              }
            : n
        )
      );
      triggerToast('Catatan berhasil diperbarui!');
    } else if (destination === 'paragraph') {
      const newDoc: NoteDocument = {
        id: 'doc-' + Date.now(),
        title: noteData.title,
        folder: noteData.folder,
        content: noteData.content,
        wordCount: noteData.content.split(/\s+/).filter(Boolean).length,
        updatedAt: Date.now(),
      };
      setDocuments((prev) => [newDoc, ...prev]);
      setViewMode('editor');
      triggerToast('Berhasil disimpan ke Editor Paragraf Panjang! ✓');
    } else {
      const newNote: NoteItem = {
        ...noteData,
        id: 'note-' + Date.now(),
        copyCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setNotes((prev) => [newNote, ...prev]);
      setViewMode('grid');
      triggerToast('Catatan baru berhasil ditambahkan ke Catatan Cepat! ✓');
    }
    setEditingNote(null);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setBentoNoteIds((prev) => prev.filter((bId) => bId !== id));
    triggerToast('Catatan telah dihapus.');
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleApplyCover = (noteId: string, imageUrl: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, coverImage: imageUrl } : n))
    );
    triggerToast('Cover visual berhasil diterapkan!');
  };

  // Quick Ingest from Hero Bar
  const handleQuickAdd = (
    text: string,
    folder: string,
    destination: NoteDestination = 'quick'
  ) => {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    const title = lines[0]?.slice(0, 35) || (destination === 'paragraph' ? 'Catatan Paragraf Baru' : 'Catatan Cepat');

    if (destination === 'paragraph') {
      const newDoc: NoteDocument = {
        id: 'doc-' + Date.now(),
        title,
        folder,
        content: text,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        updatedAt: Date.now(),
      };
      setDocuments((prev) => [newDoc, ...prev]);
      navigator.clipboard.writeText(text);
      setViewMode('editor');
      triggerToast('Tersimpan ke Paragraf Panjang & disalin ke clipboard! ✓');
      return;
    }

    const newNote: NoteItem = {
      id: 'note-' + Date.now(),
      title,
      content: text,
      folder,
      tags: ['Quick'],
      copyCount: 1,
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    navigator.clipboard.writeText(text);
    setViewMode('grid');
    triggerToast('Tersimpan ke Catatan Cepat & disalin ke clipboard! ✓');
  };

  // Long Documents CRUD
  const handleSaveDocument = (updatedDoc: NoteDocument) => {
    setDocuments((prev) => {
      const exists = prev.some((d) => d.id === updatedDoc.id);
      if (exists) {
        return prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d));
      }
      return [updatedDoc, ...prev];
    });
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    triggerToast('Dokumen telah dihapus.');
  };

  // Export / Backup JSON
  const handleExportBackup = () => {
    const data = JSON.stringify({ notes, documents, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quickclip-notes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Backup catatan berhasil diunduh!');
  };

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] selection:bg-indigo-500/30">
      {/* 1. Universal Top Bar Contract */}
      <Navbar
        onOpenComposer={() => {
          setEditingNote(null);
          setIsComposerOpen(true);
        }}
        onScrollToBento={() => bentoSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
        onScrollToLibrary={() => librarySectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      {/* Floating Keyboard Shortcut Indicator Bar */}
      <div className="sticky top-[69px] z-30 w-full border-b border-indigo-500/20 bg-indigo-950/40 py-2 px-6 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-indigo-200">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-white">Mode Cepat Tanpa Mouse Aktif:</span>
            <span className="hidden md:inline">
              Tekan angka <kbd className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-white border border-indigo-500/30 font-bold">1</kbd>–<kbd className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-white border border-indigo-500/30 font-bold">9</kbd> untuk salin slot, <kbd className="font-mono bg-black/40 px-1 py-0.5 rounded text-white border border-indigo-500/30">↑</kbd> <kbd className="font-mono bg-black/40 px-1 py-0.5 rounded text-white border border-indigo-500/30">↓</kbd> navigasi, <kbd className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-white border border-indigo-500/30">Enter</kbd> salin, <kbd className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-white border border-indigo-500/30">/</kbd> cari, <kbd className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-white border border-indigo-500/30">N</kbd> tulis baru.
            </span>
          </div>
          <span className="font-mono text-[11px] text-indigo-300">
            {filteredNotes.length} Catatan Siap Salin
          </span>
        </div>
      </div>

      {/* 2. Hero Section with Quick Add and Sliding Mode Switch */}
      <HeroSection
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        noteCount={notes.length}
        docCount={documents.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedFolder={selectedFolder}
        onFolderChange={setSelectedFolder}
        folders={folders}
        onQuickAdd={handleQuickAdd}
        searchInputRef={searchInputRef}
      />

      {/* 3. Conditional Dynamic View (Driven by Sliding Toggle) */}
      {viewMode === 'grid' ? (
        <main className="space-y-10 pb-24">
          {/* Bento Grid Showcase Section with Spotlight Effect */}
          <div ref={bentoSectionRef}>
            <BentoGridShowcase
              bentoNotes={bentoNotes}
              allNotes={notes}
              onCopy={handleCopyRawText}
              onRemoveFromBento={handleRemoveFromBento}
              onAddToBento={handleAddToBento}
              onOpenComposer={() => {
                setEditingNote(null);
                setIsComposerOpen(true);
              }}
              onResetBento={handleResetBento}
            />
          </div>

          {/* Full Notes Collection with Keyboard Badges */}
          <div ref={librarySectionRef} className="mx-auto max-w-7xl px-6">
            <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Koleksi Catatan & Paragraf Siap Salin
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportBackup}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  title="Ekspor seluruh catatan ke file JSON"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Backup JSON</span>
                </button>
              </div>
            </div>

            {/* Pinned Section */}
            {pinnedNotes.length > 0 && (
              <div className="mb-8">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <Pin className="h-3.5 w-3.5 fill-amber-400" />
                  <span>CATATAN DISEMATKAN (PINNED)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pinnedNotes.map((note, idx) => (
                    <SnippetCard
                      key={note.id}
                      snippet={note}
                      index={idx}
                      isSelected={idx === selectedCardIndex}
                      isInBento={bentoNoteIds.includes(note.id)}
                      onCopy={handleCopyNote}
                      onGenerateCover={(n) => setCoverTargetNote(n)}
                      onEdit={(n) => {
                        setEditingNote(n);
                        setIsComposerOpen(true);
                      }}
                      onDelete={handleDeleteNote}
                      onTogglePin={handleTogglePin}
                      onToggleBento={handleToggleBento}
                      isCopied={lastCopiedId === note.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Notes Grid */}
            {otherNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {otherNotes.map((note, idx) => {
                  const globalIdx = pinnedNotes.length + idx;
                  return (
                    <SnippetCard
                      key={note.id}
                      snippet={note}
                      index={globalIdx}
                      isSelected={globalIdx === selectedCardIndex}
                      isInBento={bentoNoteIds.includes(note.id)}
                      onCopy={handleCopyNote}
                      onGenerateCover={(n) => setCoverTargetNote(n)}
                      onEdit={(n) => {
                        setEditingNote(n);
                        setIsComposerOpen(true);
                      }}
                      onDelete={handleDeleteNote}
                      onTogglePin={handleTogglePin}
                      onToggleBento={handleToggleBento}
                      isCopied={lastCopiedId === note.id}
                    />
                  );
                })}
              </div>
            ) : pinnedNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#121215]/50 py-16 text-center">
                <Sparkles className="h-10 w-10 text-zinc-600 mb-3" />
                <h4 className="text-base font-semibold text-white">Tidak ada catatan yang ditemukan</h4>
                <p className="mt-1 text-xs text-zinc-400 max-w-sm">
                  Coba ubah kata kunci pencarian atau buat catatan baru dengan menekan tombol 'N'.
                </p>
                <button
                  onClick={() => {
                    setEditingNote(null);
                    setIsComposerOpen(true);
                  }}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Catatan Baru</span>
                </button>
              </div>
            ) : null}
          </div>
        </main>
      ) : (
        /* 4. Full Long-form Notes Mode */
        <main className="pb-24">
          <LongNotesView
            notes={documents}
            onSaveNote={handleSaveDocument}
            onDeleteNote={handleDeleteDocument}
            onCopy={handleCopyRawText}
          />
        </main>
      )}

      {/* Footer with Kritik & Saran Gmail Section */}
      <footer id="shortcuts" className="border-t border-white/10 bg-[#09090b] pt-10 pb-8 text-xs text-zinc-400">
        <div className="mx-auto max-w-7xl px-6 space-y-8">
          {/* Kritik & Saran Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-black/60 p-6 backdrop-blur-md">
            <div className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
            
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-300">
                  <Mail className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Kritik & Saran Pengguna</span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Punya masukan atau saran pengembangan untuk QuickClip?
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Kami selalu terbuka untuk kritik, laporan bug, maupun saran fitur baru agar pengalaman mencatat dan menyalin instan Anda semakin nyaman. Kirim pesan Anda melalui Gmail:
                </p>
              </div>

              {/* Email Card & Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 shadow-inner">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-zinc-400 font-medium">Alamat Gmail:</span>
                    <span className="font-mono text-xs font-bold text-white select-all">
                      bentojatim@gmail.com
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('bentojatim@gmail.com');
                      triggerToast('Email bentojatim@gmail.com disalin ke papan klip! ✓');
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white transition-all active:scale-95 cursor-pointer"
                    title="Salin email bentojatim@gmail.com"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Salin</span>
                  </button>

                  <a
                    href="mailto:bentojatim@gmail.com?subject=Kritik%20dan%20Saran%20-%20Aplikasi%20QuickClip"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
                    title="Kirim email melalui Gmail"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Kirim Email</span>
                  </a>

                  <button
                    onClick={() => setIsFeedbackOpen(true)}
                    className="hidden md:flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/20 hover:bg-indigo-500/30 px-3.5 py-2.5 text-xs font-semibold text-indigo-200 transition-all active:scale-95 cursor-pointer"
                    title="Buka form kritik dan saran"
                  >
                    <MessageSquareHeart className="h-3.5 w-3.5" />
                    <span>Form Saran</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Shortcut Info */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6 text-zinc-500">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-6 w-6 items-center justify-center">
                  <div className="absolute inset-0 rounded-lg gemini-gradient-glow blur-[4px] opacity-70" />
                  <div className="relative flex h-full w-full items-center justify-center rounded-lg gemini-gradient-bg p-[1px] overflow-hidden">
                    <img
                      src="/assets/aistudio/bento_logo_clean.png"
                      alt="Bento QuickClip Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
                <span className="font-semibold text-zinc-300">QuickClip Note Hub</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span>Gmail Kritik: <strong className="text-zinc-300 font-mono">bentojatim@gmail.com</strong></span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-overs */}
      <ComposerModal
        isOpen={isComposerOpen}
        onClose={() => {
          setIsComposerOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        initialData={editingNote}
        defaultDestination={viewMode === 'editor' ? 'paragraph' : 'quick'}
      />

      <ImageCoverModal
        isOpen={!!coverTargetNote}
        onClose={() => setCoverTargetNote(null)}
        snippet={coverTargetNote}
        onApplyCover={handleApplyCover}
      />

      {/* Kritik & Saran Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onToast={triggerToast}
      />

      {/* Copy-paste Confirmation Toast */}
      <Toast message={toastMessage} isVisible={isToastVisible} />
    </div>
  );
}
