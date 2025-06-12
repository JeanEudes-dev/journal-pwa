import { useCallback, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../services/database';
import { type JournalEntry, type AppSettings } from '../types';

export const useEntries = () => {
  const { state, dispatch } = useApp();

  const createEntry = useCallback(
    async (entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        dispatch({ type: 'SET_SAVING', payload: true });
        const newEntry = await db.createEntry(entryData);
        dispatch({ type: 'ADD_ENTRY', payload: newEntry });
        dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
        dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false });
        return newEntry;
      } catch (error) {
        console.error('Failed to create entry:', error);
        throw error;
      } finally {
        dispatch({ type: 'SET_SAVING', payload: false });
      }
    },
    [dispatch]
  );

  const updateEntry = useCallback(
    async (id: string, updates: Partial<JournalEntry>) => {
      try {
        dispatch({ type: 'SET_SAVING', payload: true });
        const updatedEntry = await db.updateEntry(id, updates);
        dispatch({ type: 'UPDATE_ENTRY', payload: updatedEntry });
        dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
        dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false });
        return updatedEntry;
      } catch (error) {
        console.error('Failed to update entry:', error);
        throw error;
      } finally {
        dispatch({ type: 'SET_SAVING', payload: false });
      }
    },
    [dispatch]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        await db.deleteEntry(id);
        dispatch({ type: 'DELETE_ENTRY', payload: id });
      } catch (error) {
        console.error('Failed to delete entry:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const entry = state.entries.find(e => e.id === id);
      if (entry) {
        await updateEntry(id, { isFavorite: !entry.isFavorite });
      }
    },
    [state.entries, updateEntry]
  );

  const searchEntries = useCallback(async (query: string) => {
    try {
      const results = await db.searchEntries(query);
      return results;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }, []);

  return {
    entries: state.entries,
    createEntry,
    updateEntry,
    deleteEntry,
    toggleFavorite,
    searchEntries,
    isSaving: state.isSaving,
    lastSaved: state.lastSaved,
  };
};

export const useAutoSave = (
  entryId: string | null,
  content: string,
  title: string,
  enabled: boolean = true
) => {
  const { state, dispatch } = useApp();
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedContent = useRef<string>('');
  const lastSavedTitle = useRef<string>('');

  const saveAsDraft = useCallback(async () => {
    if (!entryId || !enabled) return;

    try {
      await db.saveDraft(entryId, {
        title,
        content,
        updatedAt: new Date(),
      });

      lastSavedContent.current = content;
      lastSavedTitle.current = title;
      dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [entryId, content, title, enabled, dispatch]);

  useEffect(() => {
    if (!enabled || !entryId || (!content && !title)) return;

    const hasChanges = content !== lastSavedContent.current || title !== lastSavedTitle.current;

    if (hasChanges) {
      dispatch({ type: 'SET_UNSAVED_CHANGES', payload: true });

      // Clear existing timer
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }

      // Set new timer
      autoSaveTimer.current = setTimeout(() => {
        saveAsDraft();
      }, state.settings?.autoSaveInterval || 2000);
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [content, title, saveAsDraft, enabled, entryId, state.settings?.autoSaveInterval, dispatch]);

  const loadDraft = useCallback(async (id: string) => {
    try {
      const draft = await db.getDraft(id);
      return draft;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  }, []);

  const clearDraft = useCallback(async (id: string) => {
    try {
      await db.deleteDraft(id);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, []);

  return {
    saveAsDraft,
    loadDraft,
    clearDraft,
    hasUnsavedChanges: state.hasUnsavedChanges,
  };
};

export const useSettings = () => {
  const { state, dispatch } = useApp();

  const updateSettings = useCallback(
    async (updates: Partial<AppSettings>) => {
      if (!state.settings) return;

      try {
        const updatedSettings = await db.updateSettings(updates);
        dispatch({ type: 'SET_SETTINGS', payload: updatedSettings });
      } catch (error) {
        console.error('Failed to update settings:', error);
        throw error;
      }
    },
    [state.settings, dispatch]
  );

  const toggleTheme = useCallback(async () => {
    if (!state.settings) return;

    const newTheme =
      state.settings.theme === 'light'
        ? 'dark'
        : state.settings.theme === 'dark'
          ? 'system'
          : 'light';

    await updateSettings({ theme: newTheme });
  }, [state.settings, updateSettings]);

  return {
    settings: state.settings,
    updateSettings,
    toggleTheme,
    isDarkMode: state.isDarkMode,
  };
};

export const useKeyboardShortcuts = () => {
  const { dispatch } = useApp();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + N - New entry
      if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault();
        dispatch({ type: 'SET_VIEW', payload: 'editor' });
        dispatch({ type: 'SET_CURRENT_ENTRY', payload: null });
      }

      // Cmd/Ctrl + S - Save entry (handled by auto-save, but we prevent default)
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
      }

      // Cmd/Ctrl + F - Focus search
      if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
        event.preventDefault();
        dispatch({ type: 'SET_VIEW', payload: 'search' });
      }

      // Cmd/Ctrl + D - Toggle dark mode
      if ((event.metaKey || event.ctrlKey) && event.key === 'd') {
        event.preventDefault();
        // This would be handled by the theme toggle in settings
      }

      // Escape - Go back to list view
      if (event.key === 'Escape') {
        dispatch({ type: 'SET_VIEW', payload: 'list' });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);
};

export const useSwipeGestures = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold: number = 50
) => {
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;

      // Check if horizontal swipe is more prominent than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    },
    [onSwipeLeft, onSwipeRight, threshold]
  );

  return { handleTouchStart, handleTouchEnd };
};

export const useOnlineStatus = () => {
  const { state } = useApp();
  return {
    isOnline: !state.isOffline,
    isOffline: state.isOffline,
  };
};
