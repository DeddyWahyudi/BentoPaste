export interface NoteItem {
  id: string;
  title: string;
  content: string;
  folder: string; // e.g. 'Pribadi', 'Tugas', 'Penting', 'Pekerjaan', 'Password'
  tags: string[];
  copyCount: number;
  isPinned: boolean;
  coverImage?: string;
  createdAt: number;
  updatedAt: number;
}

export interface NoteDocument {
  id: string;
  title: string;
  content: string;
  folder: string;
  wordCount: number;
  updatedAt: number;
}

export type ViewMode = 'grid' | 'editor';

