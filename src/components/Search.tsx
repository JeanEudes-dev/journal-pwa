import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search as SearchIcon, 
  Filter, 
  Calendar,
  Tag,
  BookOpen,
  SortAsc,
  SortDesc,
  X,
  Clock,
  Heart,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isAfter, isBefore } from 'date-fns';
import { useApp } from '../contexts/AppContext';
import { useEntries } from '../hooks';
import type { JournalEntry, SearchFilters } from '../types';

export const Search: React.FC = () => {
  const { dispatch } = useApp();
  const { entries } = useEntries();
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    tags: [],
    category: undefined,
    dateRange: undefined,
    mood: undefined,
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<JournalEntry[]>([]);

  // Get unique values for filter options
  const allTags = useMemo(() => 
    [...new Set(entries.flatMap(entry => entry.tags))].sort(),
    [entries]
  );

  const allCategories = useMemo(() => 
    [...new Set(entries.map(entry => entry.category).filter(Boolean))].sort(),
    [entries]
  );

  const allMoods = useMemo(() => 
    [...new Set(entries.map(entry => entry.mood).filter(Boolean))].sort(),
    [entries]
  );

  // Apply filters and search
  useEffect(() => {
    let filtered = [...entries];

    // Text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (entry.category && entry.category.toLowerCase().includes(query)) ||
        (entry.location && entry.location.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(entry =>
        filters.tags.every(tag => entry.tags.includes(tag))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(entry => entry.category === filters.category);
    }

    // Mood filter
    if (filters.mood) {
      filtered = filtered.filter(entry => entry.mood === filters.mood);
    }

    // Date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        const start = filters.dateRange!.start;
        const end = filters.dateRange!.end;
        return (!start || isAfter(entryDate, start) || entryDate.toDateString() === start.toDateString()) &&
               (!end || isBefore(entryDate, end) || entryDate.toDateString() === end.toDateString());
      });
    }

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'wordCount':
          comparison = a.wordCount - b.wordCount;
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'date':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    setSearchResults(filtered);
  }, [entries, filters]);

  const handleEntryClick = (entry: JournalEntry) => {
    dispatch({ type: 'SET_CURRENT_ENTRY', payload: entry });
    dispatch({ type: 'SET_VIEW', payload: 'editor' });
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      tags: [],
      category: undefined,
      dateRange: undefined,
      mood: undefined,
      sortBy: 'date',
      sortOrder: 'desc',
    });
  };

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-whatsapp-500 to-whatsapp-600 rounded-full flex items-center justify-center">
          <SearchIcon size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Search Entries</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find your thoughts and memories across {entries.length} entries
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-whatsapp-dark-300 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-whatsapp-dark-200">
        <div className="relative mb-4">
          <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            placeholder="Search titles, content, tags, categories..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-whatsapp-dark-200 rounded-lg bg-gray-50 dark:bg-whatsapp-dark-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-whatsapp-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              showAdvancedFilters
                ? 'bg-whatsapp-100 dark:bg-whatsapp-dark-200 text-whatsapp-700 dark:text-whatsapp-300'
                : 'bg-gray-100 dark:bg-whatsapp-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-whatsapp-dark-100'
            }`}
          >
            <Filter size={16} />
            <span>Advanced Filters</span>
          </button>

          <div className="flex items-center space-x-2">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as 'date' | 'title' | 'wordCount' | 'updatedAt' }))}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-whatsapp-dark-200 bg-white dark:bg-whatsapp-dark-400 text-gray-700 dark:text-gray-200 text-sm focus:ring-2 focus:ring-whatsapp-500 focus:border-transparent"
            >
              <option value="date">Date Created</option>
              <option value="updatedAt">Date Updated</option>
              <option value="title">Title</option>
              <option value="wordCount">Word Count</option>
            </select>

            <button
              onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
              className="p-2 rounded-lg bg-gray-100 dark:bg-whatsapp-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-whatsapp-dark-100 transition-colors"
              title={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {filters.sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
            </button>
          </div>

          {(filters.query || filters.tags.length > 0 || filters.category || filters.mood || filters.dateRange) && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <X size={14} />
              <span>Clear all</span>
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-whatsapp-dark-200 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Tag size={16} className="inline mr-1" />
                    Tags
                  </label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {allTags.map(tag => (
                      <label key={tag} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.tags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                          className="rounded border-gray-300 dark:border-whatsapp-dark-200 text-whatsapp-500 focus:ring-whatsapp-500"
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">#{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <BookOpen size={16} className="inline mr-1" />
                    Category
                  </label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-whatsapp-dark-200 rounded-lg bg-white dark:bg-whatsapp-dark-400 text-gray-700 dark:text-gray-200 text-sm focus:ring-2 focus:ring-whatsapp-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {allCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Mood */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Heart size={16} className="inline mr-1" />
                    Mood
                  </label>
                  <select
                    value={filters.mood || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, mood: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-whatsapp-dark-200 rounded-lg bg-white dark:bg-whatsapp-dark-400 text-gray-700 dark:text-gray-200 text-sm focus:ring-2 focus:ring-whatsapp-500 focus:border-transparent"
                  >
                    <option value="">All Moods</option>
                    {allMoods.map(mood => (
                      <option key={mood} value={mood}>{mood}</option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Date Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={filters.dateRange?.start ? format(filters.dateRange.start, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: {
                          start: e.target.value ? new Date(e.target.value) : undefined,
                          end: prev.dateRange?.end
                        }
                      }))}
                      className="w-full px-3 py-1 border border-gray-200 dark:border-whatsapp-dark-200 rounded bg-white dark:bg-whatsapp-dark-400 text-gray-700 dark:text-gray-200 text-sm"
                      placeholder="Start date"
                    />
                    <input
                      type="date"
                      value={filters.dateRange?.end ? format(filters.dateRange.end, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: {
                          start: prev.dateRange?.start,
                          end: e.target.value ? new Date(e.target.value) : undefined
                        }
                      }))}
                      className="w-full px-3 py-1 border border-gray-200 dark:border-whatsapp-dark-200 rounded bg-white dark:bg-whatsapp-dark-400 text-gray-700 dark:text-gray-200 text-sm"
                      placeholder="End date"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results */}
      <div className="bg-white dark:bg-whatsapp-dark-300 rounded-xl shadow-sm border border-gray-200 dark:border-whatsapp-dark-200">
        <div className="p-4 border-b border-gray-200 dark:border-whatsapp-dark-200">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Search Results ({searchResults.length})
          </h2>
        </div>

        {searchResults.length === 0 ? (
          <div className="p-8 text-center">
            <SearchIcon size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No entries found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Try adjusting your search terms or filters
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-whatsapp-dark-200">
            {searchResults.map(entry => (
              <SearchResultItem
                key={entry.id}
                entry={entry}
                searchQuery={filters.query}
                onClick={() => handleEntryClick(entry)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface SearchResultItemProps {
  entry: JournalEntry;
  searchQuery: string;
  onClick: () => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ entry, searchQuery, onClick }) => {
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-200 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const preview = entry.content.slice(0, 200);

  return (
    <div
      className="p-4 hover:bg-gray-50 dark:hover:bg-whatsapp-dark-200 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white">
          {highlightText(entry.title, searchQuery)}
        </h3>
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          {entry.isFavorite && <Heart size={12} className="text-red-500 fill-current" />}
          <Clock size={12} />
          <span>{format(new Date(entry.createdAt), 'MMM d, yyyy')}</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
        {highlightText(preview, searchQuery)}
        {entry.content.length > 200 && '...'}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
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
          {entry.mood && (
            <span className="capitalize">{entry.mood}</span>
          )}
        </div>

        {entry.tags.length > 0 && (
          <div className="flex items-center space-x-1">
            {entry.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-whatsapp-100 dark:bg-whatsapp-dark-200 text-whatsapp-700 dark:text-whatsapp-300"
              >
                #{tag}
              </span>
            ))}
            {entry.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{entry.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
