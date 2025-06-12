export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category?: string;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
  isDraft: boolean;
  isFavorite: boolean;
  mood?: 'happy' | 'sad' | 'neutral' | 'excited' | 'anxious' | 'grateful';
  weather?: string;
  location?: string;
}

export interface JournalTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  tags: string[];
  category: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  autoSave: boolean;
  autoSaveInterval: number; // in milliseconds
  fontSize: 'small' | 'medium' | 'large';
  showWordCount: boolean;
  showLineNumbers: boolean;
  defaultTemplate?: string;
  exportFormat: 'markdown' | 'pdf' | 'both';
  id?: string;
}

export interface SearchFilters {
  query: string;
  tags: string[];
  category?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  mood?: string;
  sortBy: 'date' | 'title' | 'wordCount' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

export interface ExportOptions {
  includeTags: boolean;
  includeMetadata: boolean;
}

export interface ConflictResolution {
  entryId: string;
  localVersion: JournalEntry;
  conflictingVersion: JournalEntry;
  timestamp: Date;
}

export type AppView = 'list' | 'editor' | 'search' | 'settings' | 'export';
