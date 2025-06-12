import React, { useState, useMemo } from 'react';
import {
  Heart,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Download,
  FileText,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Star,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { useApp } from '../contexts/AppContext';
import { useEntries, useSwipeGestures } from '../hooks';
import type { JournalEntry } from '../types';

export const EntryList: React.FC = () => {
  const { state, dispatch } = useApp();
  const { deleteEntry, toggleFavorite } = useEntries();
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'wordCount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'favorites' | 'drafts'>('all');

  const filteredAndSortedEntries = useMemo(() => {
    let entries = [...state.entries];

    // Apply filters
    if (filterBy === 'favorites') {
      entries = entries.filter(entry => entry.isFavorite);
    } else if (filterBy === 'drafts') {
      entries = entries.filter(entry => entry.isDraft);
    }

    // Apply search
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      entries = entries.filter(
        entry =>
          entry.title.toLowerCase().includes(query) ||
          entry.content.toLowerCase().includes(query) ||
          entry.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (state.selectedCategory) {
      entries = entries.filter(entry => entry.category === state.selectedCategory);
    }

    // Apply tag filters
    if (state.selectedTags.length > 0) {
      entries = entries.filter(entry => state.selectedTags.every(tag => entry.tags.includes(tag)));
    }

    // Sort entries
    entries.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'wordCount':
          comparison = a.wordCount - b.wordCount;
          break;
        case 'date':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return entries;
  }, [
    state.entries,
    state.searchQuery,
    state.selectedCategory,
    state.selectedTags,
    sortBy,
    sortOrder,
    filterBy,
  ]);

  const groupedEntries = useMemo(() => {
    const groups: { [key: string]: JournalEntry[] } = {};

    filteredAndSortedEntries.forEach(entry => {
      const date = new Date(entry.createdAt);
      let groupKey: string;

      if (isToday(date)) {
        groupKey = 'Today';
      } else if (isYesterday(date)) {
        groupKey = 'Yesterday';
      } else if (isThisWeek(date)) {
        groupKey = 'This Week';
      } else if (isThisMonth(date)) {
        groupKey = 'This Month';
      } else {
        groupKey = format(date, 'MMMM yyyy');
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(entry);
    });

    return groups;
  }, [filteredAndSortedEntries]);

  const handleEntryClick = (entry: JournalEntry) => {
    dispatch({ type: 'SET_CURRENT_ENTRY', payload: entry });
    dispatch({ type: 'SET_VIEW', payload: 'editor' });
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await deleteEntry(entryId);
      setSelectedEntry(null);
    }
  };

  const handleToggleFavorite = async (entryId: string) => {
    await toggleFavorite(entryId);
    setSelectedEntry(null);
  };

  const handleNewEntry = () => {
    dispatch({ type: 'SET_CURRENT_ENTRY', payload: null });
    dispatch({ type: 'SET_VIEW', payload: 'editor' });
  };

  if (state.isLoading) {
    return <LoadingSkeleton />;
  }

  if (filteredAndSortedEntries.length === 0) {
    return (
      <EmptyState
        hasEntries={state.entries.length > 0}
        hasFilters={
          !!state.searchQuery || state.selectedTags.length > 0 || !!state.selectedCategory
        }
        onNewEntry={handleNewEntry}
        onClearFilters={() => {
          dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
          dispatch({ type: 'SET_SELECTED_TAGS', payload: [] });
          dispatch({ type: 'SET_SELECTED_CATEGORY', payload: null });
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Filters and Sort Controls */}
      <div className="bg-white dark:bg-whatsapp-dark-300 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-whatsapp-dark-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                showFilters
                  ? 'bg-whatsapp-100 dark:bg-whatsapp-dark-200 text-whatsapp-700 dark:text-whatsapp-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-whatsapp-dark-200'
              }`}
            >
              <Filter size={16} />
              <span>Filters</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-whatsapp-dark-200 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
              </button>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'date' | 'title' | 'wordCount')}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-whatsapp-dark-200 bg-white dark:bg-whatsapp-dark-400 text-gray-700 dark:text-gray-200 text-sm focus:ring-2 focus:ring-whatsapp-500 focus:border-transparent"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="wordCount">Word Count</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterBy('all')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                filterBy === 'all'
                  ? 'bg-whatsapp-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-whatsapp-dark-200'
              }`}
            >
              All ({state.entries.length})
            </button>
            <button
              onClick={() => setFilterBy('favorites')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                filterBy === 'favorites'
                  ? 'bg-whatsapp-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-whatsapp-dark-200'
              }`}
            >
              <Heart size={14} className="inline mr-1" />
              Favorites ({state.entries.filter(e => e.isFavorite).length})
            </button>
            <button
              onClick={() => setFilterBy('drafts')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                filterBy === 'drafts'
                  ? 'bg-whatsapp-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-whatsapp-dark-200'
              }`}
            >
              <Edit size={14} className="inline mr-1" />
              Drafts ({state.entries.filter(e => e.isDraft).length})
            </button>
          </div>
        </div>

        {/* Extended Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-whatsapp-dark-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={state.searchQuery}
                      onChange={e =>
                        dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })
                      }
                      placeholder="Search entries..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-whatsapp-dark-200 bg-white dark:bg-whatsapp-dark-400 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-whatsapp-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={state.selectedCategory || ''}
                    onChange={e =>
                      dispatch({ type: 'SET_SELECTED_CATEGORY', payload: e.target.value || null })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-whatsapp-dark-200 bg-white dark:bg-whatsapp-dark-400 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-whatsapp-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {[...new Set(state.entries.map(e => e.category).filter(Boolean))].map(
                      category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {[...new Set(state.entries.flatMap(e => e.tags))].map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          const selected = state.selectedTags.includes(tag)
                            ? state.selectedTags.filter(t => t !== tag)
                            : [...state.selectedTags, tag];
                          dispatch({ type: 'SET_SELECTED_TAGS', payload: selected });
                        }}
                        className={`px-2 py-1 rounded-full text-xs transition-colors ${
                          state.selectedTags.includes(tag)
                            ? 'bg-whatsapp-500 text-white'
                            : 'bg-gray-100 dark:bg-whatsapp-dark-200 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-whatsapp-dark-100'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Entry Groups */}
      <div className="space-y-6">
        {Object.entries(groupedEntries).map(([groupName, entries]) => (
          <div key={groupName} className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white sticky top-20 bg-gray-50 dark:bg-whatsapp-dark-100 py-2 px-4 rounded-lg border border-gray-200 dark:border-whatsapp-dark-200 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
              {groupName}
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({entries.length} {entries.length === 1 ? 'entry' : 'entries'})
              </span>
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {entries.map(entry => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onClick={() => handleEntryClick(entry)}
                  onDelete={() => handleDeleteEntry(entry.id)}
                  onToggleFavorite={() => handleToggleFavorite(entry.id)}
                  isSelected={selectedEntry === entry.id}
                  onSelect={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface EntryCardProps {
  entry: JournalEntry;
  onClick: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  isSelected: boolean;
  onSelect: () => void;
}

const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  onClick,
  onDelete,
  onToggleFavorite,
  isSelected,
  onSelect,
}) => {
  const { handleTouchStart, handleTouchEnd } = useSwipeGestures(
    onDelete, // Swipe left to delete
    onToggleFavorite // Swipe right to favorite
  );

  const previewText = entry.content
    .replace(/[#*`_~]/g, '') // Remove markdown syntax
    .slice(0, 150)
    .trim();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`bg-white dark:bg-whatsapp-dark-300 rounded-xl p-4 shadow-sm border transition-all duration-200 cursor-pointer group hover:shadow-md ${
          isSelected
            ? 'border-whatsapp-500 ring-2 ring-whatsapp-100 dark:ring-whatsapp-dark-200'
            : 'border-gray-200 dark:border-whatsapp-dark-200 hover:border-whatsapp-300 dark:hover:border-whatsapp-dark-100'
        }`}
        onClick={onClick}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-whatsapp-600 dark:group-hover:text-whatsapp-400 transition-colors">
              {entry.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(entry.createdAt), 'MMM d, h:mm a')}
              </span>
              {entry.isDraft && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                  Draft
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 ml-2">
            {entry.isFavorite && <Heart size={14} className="text-red-500 fill-current" />}
            <button
              onClick={e => {
                e.stopPropagation();
                onSelect();
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-whatsapp-dark-200 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical size={14} />
            </button>
          </div>
        </div>

        {/* Preview */}
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3">
          {previewText}
          {entry.content.length > 150 && '...'}
        </p>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center space-x-1">
              <FileText size={12} />
              <span>{entry.wordCount} words</span>
            </span>
            {entry.category && (
              <span className="flex items-center space-x-1">
                <BookOpen size={12} />
                <span>{entry.category}</span>
              </span>
            )}
            {entry.mood && <span className="capitalize">{entry.mood}</span>}
          </div>

          {entry.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              {entry.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-whatsapp-100 dark:bg-whatsapp-dark-200 text-whatsapp-700 dark:text-whatsapp-300"
                >
                  #{tag}
                </span>
              ))}
              {entry.tags.length > 2 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{entry.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Menu */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-whatsapp-dark-300 rounded-lg shadow-lg border border-gray-200 dark:border-whatsapp-dark-200 z-10"
          >
            <div className="p-2 space-y-1">
              <ActionButton
                icon={Edit}
                label="Edit"
                onClick={e => {
                  e.stopPropagation();
                  onClick();
                }}
              />
              <ActionButton
                icon={entry.isFavorite ? Star : Heart}
                label={entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                onClick={e => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                className={
                  entry.isFavorite
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
                }
              />
              <ActionButton
                icon={Copy}
                label="Duplicate"
                onClick={e => {
                  e.stopPropagation();
                  // TODO: Implement duplicate functionality
                }}
              />
              <ActionButton
                icon={Download}
                label="Export"
                onClick={e => {
                  e.stopPropagation();
                  // TODO: Implement single entry export
                }}
              />
              <ActionButton
                icon={Trash2}
                label="Delete"
                onClick={e => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface ActionButtonProps {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  className = '',
}) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-whatsapp-dark-200 ${className}`}
  >
    <Icon size={16} />
    <span>{label}</span>
  </button>
);

const LoadingSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto p-4 space-y-6">
    <div className="bg-white dark:bg-whatsapp-dark-300 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-whatsapp-dark-200">
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-whatsapp-dark-200 rounded w-1/4"></div>
        <div className="h-8 bg-gray-200 dark:bg-whatsapp-dark-200 rounded"></div>
      </div>
    </div>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-whatsapp-dark-300 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-whatsapp-dark-200"
        >
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-whatsapp-dark-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-whatsapp-dark-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-whatsapp-dark-200 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-whatsapp-dark-200 rounded w-5/6"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-3 bg-gray-200 dark:bg-whatsapp-dark-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-whatsapp-dark-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface EmptyStateProps {
  hasEntries: boolean;
  hasFilters: boolean;
  onNewEntry: () => void;
  onClearFilters: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  hasEntries,
  hasFilters,
  onNewEntry,
  onClearFilters,
}) => (
  <div className="max-w-md mx-auto text-center py-12">
    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-whatsapp-100 to-whatsapp-200 dark:from-whatsapp-dark-200 dark:to-whatsapp-dark-300 rounded-full flex items-center justify-center">
      {hasFilters ? (
        <Search size={32} className="text-whatsapp-600 dark:text-whatsapp-400" />
      ) : (
        <BookOpen size={32} className="text-whatsapp-600 dark:text-whatsapp-400" />
      )}
    </div>

    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      {hasFilters
        ? 'No entries found'
        : hasEntries
          ? 'No entries match your filters'
          : 'Start your journal'}
    </h3>

    <p className="text-gray-500 dark:text-gray-400 mb-6">
      {hasFilters
        ? 'Try adjusting your search terms or filters.'
        : hasEntries
          ? 'Clear your filters to see all entries.'
          : 'Create your first entry and begin documenting your thoughts and experiences.'}
    </p>

    <div className="space-y-3">
      {hasFilters ? (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-whatsapp-dark-200 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-whatsapp-dark-200 transition-colors"
        >
          Clear Filters
        </button>
      ) : (
        <button
          onClick={onNewEntry}
          className="inline-flex items-center px-6 py-3 bg-whatsapp-500 text-white rounded-lg hover:bg-whatsapp-600 transition-colors shadow-md hover:shadow-lg"
        >
          <Edit size={20} className="mr-2" />
          Create Your First Entry
        </button>
      )}
    </div>
  </div>
);
