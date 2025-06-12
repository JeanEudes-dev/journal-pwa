import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { JournalEntry, AppSettings, AppView, ConflictResolution } from '../types';
import { db } from '../services/database';
import { seedSampleDataIfEmpty } from '../utils/sampleData';

interface AppState {
  // Data
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  settings: AppSettings | null;

  // UI State
  currentView: AppView;
  isDarkMode: boolean;
  isOffline: boolean;
  isSaving: boolean;
  isLoading: boolean;
  searchQuery: string;
  selectedTags: string[];
  selectedCategory: string | null;

  // Conflicts
  conflicts: ConflictResolution[];

  // Auto-save
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

type AppAction =
  | { type: 'SET_ENTRIES'; payload: JournalEntry[] }
  | { type: 'ADD_ENTRY'; payload: JournalEntry }
  | { type: 'UPDATE_ENTRY'; payload: JournalEntry }
  | { type: 'DELETE_ENTRY'; payload: string }
  | { type: 'SET_CURRENT_ENTRY'; payload: JournalEntry | null }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'SET_VIEW'; payload: AppView }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'SET_OFFLINE'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_TAGS'; payload: string[] }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string | null }
  | { type: 'ADD_CONFLICT'; payload: ConflictResolution }
  | { type: 'REMOVE_CONFLICT'; payload: string }
  | { type: 'SET_LAST_SAVED'; payload: Date | null }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'INITIALIZE'; payload: { entries: JournalEntry[]; settings: AppSettings } };

const initialState: AppState = {
  entries: [],
  currentEntry: null,
  settings: null,
  currentView: 'list',
  isDarkMode: false,
  isOffline: !navigator.onLine,
  isSaving: false,
  isLoading: true,
  searchQuery: '',
  selectedTags: [],
  selectedCategory: null,
  conflicts: [],
  lastSaved: null,
  hasUnsavedChanges: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        entries: action.payload.entries,
        settings: action.payload.settings,
        isDarkMode:
          action.payload.settings.theme === 'dark' ||
          (action.payload.settings.theme === 'system' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches),
        isLoading: false,
      };

    case 'SET_ENTRIES':
      return { ...state, entries: action.payload };

    case 'ADD_ENTRY':
      return {
        ...state,
        entries: [action.payload, ...state.entries],
        currentEntry: action.payload,
      };

    case 'UPDATE_ENTRY':
      return {
        ...state,
        entries: state.entries.map(entry =>
          entry.id === action.payload.id ? action.payload : entry
        ),
        currentEntry:
          state.currentEntry?.id === action.payload.id ? action.payload : state.currentEntry,
      };

    case 'DELETE_ENTRY':
      return {
        ...state,
        entries: state.entries.filter(entry => entry.id !== action.payload),
        currentEntry: state.currentEntry?.id === action.payload ? null : state.currentEntry,
      };

    case 'SET_CURRENT_ENTRY':
      return { ...state, currentEntry: action.payload };

    case 'SET_SETTINGS':
      return {
        ...state,
        settings: action.payload,
        isDarkMode:
          action.payload.theme === 'dark' ||
          (action.payload.theme === 'system' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches),
      };

    case 'SET_VIEW':
      return { ...state, currentView: action.payload };

    case 'SET_DARK_MODE':
      return { ...state, isDarkMode: action.payload };

    case 'SET_OFFLINE':
      return { ...state, isOffline: action.payload };

    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_SELECTED_TAGS':
      return { ...state, selectedTags: action.payload };

    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };

    case 'ADD_CONFLICT':
      return { ...state, conflicts: [...state.conflicts, action.payload] };

    case 'REMOVE_CONFLICT':
      return { ...state, conflicts: state.conflicts.filter(c => c.entryId !== action.payload) };

    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload };

    case 'SET_UNSAVED_CHANGES':
      return { ...state, hasUnsavedChanges: action.payload };

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await db.init();

        // Seed sample data if no entries exist
        await seedSampleDataIfEmpty();

        const entries = await db.getAllEntries();
        const settings = await db.getSettings();

        dispatch({ type: 'INITIALIZE', payload: { entries, settings } });
      } catch (error) {
        console.error('Failed to initialize app:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeApp();
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_OFFLINE', payload: false });
    const handleOffline = () => dispatch({ type: 'SET_OFFLINE', payload: true });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (state.settings?.theme === 'system') {
        dispatch({ type: 'SET_DARK_MODE', payload: mediaQuery.matches });
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [state.settings?.theme]);

  // Apply dark mode class to document
  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode]);

  // Handle tab visibility for conflict detection
  useEffect(() => {
    let tabId: string;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, store current tab data
        tabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('journal-active-tab', tabId);
      } else {
        // Tab is visible, check for conflicts
        const activeTab = localStorage.getItem('journal-active-tab');
        if (activeTab && activeTab !== tabId && state.currentEntry) {
          // Potential conflict detected
          console.log('Potential conflict detected with another tab');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.currentEntry]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};
