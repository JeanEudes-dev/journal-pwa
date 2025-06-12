import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { JournalEntry, JournalTemplate, AppSettings } from '../types';

interface JournalDB extends DBSchema {
  entries: {
    key: string;
    value: JournalEntry;
    indexes: {
      'by-date': Date;
      'by-title': string;
      'by-tags': string;
      'by-category': string;
      'by-updated': Date;
    };
  };
  templates: {
    key: string;
    value: JournalTemplate;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
  drafts: {
    key: string;
    value: Partial<JournalEntry> & { id: string };
  };
}

class DatabaseService {
  private db: IDBPDatabase<JournalDB> | null = null;
  private dbName = 'JournalPWA';
  private version = 1;

  async init(): Promise<void> {
    try {
      this.db = await openDB<JournalDB>(this.dbName, this.version, {
        upgrade(db) {
          // Entries store
          const entriesStore = db.createObjectStore('entries', {
            keyPath: 'id',
          });
          entriesStore.createIndex('by-date', 'createdAt');
          entriesStore.createIndex('by-title', 'title');
          entriesStore.createIndex('by-tags', 'tags', { multiEntry: true });
          entriesStore.createIndex('by-category', 'category');
          entriesStore.createIndex('by-updated', 'updatedAt');

          // Templates store
          db.createObjectStore('templates', {
            keyPath: 'id',
          });

          // Settings store
          db.createObjectStore('settings', {
            keyPath: 'id',
          });

          // Drafts store for auto-save
          db.createObjectStore('drafts', {
            keyPath: 'id',
          });
        },
      });

      // Initialize default settings if not exists
      await this.initializeDefaults();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async initializeDefaults(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Check if settings exist
    const existingSettings = await this.db.get('settings', 'app-settings');
    if (!existingSettings) {
      const defaultSettings: AppSettings = {
        theme: 'system',
        autoSave: true,
        autoSaveInterval: 2000,
        fontSize: 'medium',
        showWordCount: true,
        showLineNumbers: false,
        exportFormat: 'markdown',
      };
      await this.db.put('settings', { id: 'app-settings', ...defaultSettings });
    }

    // Initialize default templates
    const existingTemplates = await this.db.count('templates');
    if (existingTemplates === 0) {
      const defaultTemplates: JournalTemplate[] = [
        {
          id: 'daily-journal',
          name: 'Daily Journal',
          description: 'A simple daily journal template',
          content: `# ${new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}

## How I'm feeling today
Write about your current mood and emotions...

## What happened today
Describe the events of your day...

## Gratitude
What are you grateful for today?

## Tomorrow's goals
What do you want to accomplish tomorrow?
`,
          tags: ['daily', 'reflection'],
          category: 'Personal',
        },
        {
          id: 'meeting-notes',
          name: 'Meeting Notes',
          description: 'Template for meeting notes',
          content: `# Meeting Notes - ${new Date().toLocaleDateString()}

## Attendees
- 

## Agenda
1. 
2. 
3. 

## Discussion Points
### Topic 1


### Topic 2


## Action Items
- [ ] 
- [ ] 

## Next Steps

`,
          tags: ['work', 'meeting', 'notes'],
          category: 'Work',
        },
        {
          id: 'idea-capture',
          name: 'Idea Capture',
          description: 'Quick template for capturing ideas',
          content: `# New Idea 💡

## The Idea
Describe your idea in detail...

## Why it matters
What problem does this solve?

## Next Steps
What are the immediate actions to explore this?

## Resources Needed
What would you need to make this happen?

## Tags
#idea #innovation
`,
          tags: ['ideas', 'innovation', 'brainstorming'],
          category: 'Ideas',
        },
      ];

      for (const template of defaultTemplates) {
        await this.db.put('templates', template);
      }
    }
  }

  // Entry operations
  async createEntry(
    entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<JournalEntry> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date();
    const newEntry: JournalEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
      wordCount: this.countWords(entry.content),
    };

    await this.db.put('entries', newEntry);
    return newEntry;
  }

  async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    if (!this.db) throw new Error('Database not initialized');

    const existing = await this.db.get('entries', id);
    if (!existing) throw new Error('Entry not found');

    const updatedEntry: JournalEntry = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
      wordCount: updates.content ? this.countWords(updates.content) : existing.wordCount,
    };

    await this.db.put('entries', updatedEntry);
    return updatedEntry;
  }

  async deleteEntry(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.delete('entries', id);
    await this.db.delete('drafts', id); // Also remove any draft
  }

  async getEntry(id: string): Promise<JournalEntry | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.get('entries', id);
  }

  async getAllEntries(): Promise<JournalEntry[]> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getAll('entries');
  }

  async searchEntries(query: string): Promise<JournalEntry[]> {
    if (!this.db) throw new Error('Database not initialized');
    const allEntries = await this.getAllEntries();

    if (!query.trim()) return allEntries;

    const lowercaseQuery = query.toLowerCase();
    return allEntries.filter(
      entry =>
        entry.title.toLowerCase().includes(lowercaseQuery) ||
        entry.content.toLowerCase().includes(lowercaseQuery) ||
        entry.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
        (entry.category && entry.category.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getEntriesByTag(tag: string): Promise<JournalEntry[]> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getAllFromIndex('entries', 'by-tags', tag);
  }

  async getEntriesByCategory(category: string): Promise<JournalEntry[]> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getAllFromIndex('entries', 'by-category', category);
  }

  // Draft operations
  async saveDraft(entryId: string, draft: Partial<JournalEntry>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put('drafts', { ...draft, id: entryId });
  }

  async getDraft(entryId: string): Promise<Partial<JournalEntry> | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.get('drafts', entryId);
  }

  async deleteDraft(entryId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.delete('drafts', entryId);
  }

  // Template operations
  async getTemplates(): Promise<JournalTemplate[]> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getAll('templates');
  }

  async getTemplate(id: string): Promise<JournalTemplate | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.get('templates', id);
  }

  // Settings operations
  async getSettings(): Promise<AppSettings> {
    if (!this.db) throw new Error('Database not initialized');
    const settings = await this.db.get('settings', 'app-settings');
    if (!settings) throw new Error('Settings not found');
    return settings;
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    if (!this.db) throw new Error('Database not initialized');
    const existing = await this.getSettings();
    const updatedSettings = { ...existing, ...updates };
    await this.db.put('settings', { id: 'app-settings', ...updatedSettings });
    return updatedSettings;
  }

  // Utility functions
  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }

  async exportAllData(): Promise<{
    entries: JournalEntry[];
    templates: JournalTemplate[];
    settings: AppSettings;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    return {
      entries: await this.getAllEntries(),
      templates: await this.getTemplates(),
      settings: await this.getSettings(),
    };
  }

  async importData(data: {
    entries?: JournalEntry[];
    templates?: JournalTemplate[];
    settings?: AppSettings;
  }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction(['entries', 'templates', 'settings'], 'readwrite');

    if (data.entries) {
      for (const entry of data.entries) {
        await tx.objectStore('entries').put(entry);
      }
    }

    if (data.templates) {
      for (const template of data.templates) {
        await tx.objectStore('templates').put(template);
      }
    }

    if (data.settings) {
      await tx.objectStore('settings').put({ id: 'app-settings', ...data.settings });
    }

    await tx.done;
  }
}

export const db = new DatabaseService();
