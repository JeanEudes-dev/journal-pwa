import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  Type,
  Bold,
  Italic,
  List,
  Quote,
  Link,
  Image,
  Heart,
  Tag,
  MapPin,
  Cloud,
  Smile,
  FileText,
  Settings,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useApp } from '../contexts/AppContext';
import { useEntries, useAutoSave, useKeyboardShortcuts } from '../hooks';
import type { JournalEntry, JournalTemplate } from '../types';
import { db } from '../services/database';

export const MarkdownEditor: React.FC = () => {
  const { state, dispatch } = useApp();
  const { createEntry, updateEntry } = useEntries();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [mood, setMood] = useState<JournalEntry['mood'] | undefined>(undefined);
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<JournalTemplate[]>([]);
  const [newTag, setNewTag] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const entryId = state.currentEntry?.id || `new-${Date.now()}`;
  const isNewEntry = !state.currentEntry;

  useAutoSave(entryId, content, title, state.settings?.autoSave);
  useKeyboardShortcuts();

  // Load entry data when currentEntry changes
  useEffect(() => {
    if (state.currentEntry) {
      setTitle(state.currentEntry.title);
      setContent(state.currentEntry.content);
      setTags(state.currentEntry.tags);
      setCategory(state.currentEntry.category || '');
      setMood(state.currentEntry.mood || undefined);
      setLocation(state.currentEntry.location || '');
      setWeather(state.currentEntry.weather || '');
      setIsFavorite(state.currentEntry.isFavorite);
    } else {
      // New entry - reset form
      setTitle('');
      setContent('');
      setTags([]);
      setCategory('');
      setMood(undefined);
      setLocation('');
      setWeather('');
      setIsFavorite(false);
    }
  }, [state.currentEntry]);

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const loadedTemplates = await db.getTemplates();
        setTemplates(loadedTemplates);
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
    };
    loadTemplates();
  }, []);

  // Update word count
  useEffect(() => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    setWordCount(content.trim() ? words : 0);
  }, [content]);

  // Focus title input for new entries
  useEffect(() => {
    if (isNewEntry && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isNewEntry]);

  const handleSave = useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please add a title and content before saving.');
      return;
    }

    try {
      const entryData = {
        title: title.trim(),
        content: content.trim(),
        tags,
        category: category.trim() || undefined,
        mood: mood || undefined,
        location: location.trim() || undefined,
        weather: weather.trim() || undefined,
        isFavorite,
        isDraft: false,
        wordCount,
      };

      if (isNewEntry) {
        const newEntry = await createEntry(entryData);
        dispatch({ type: 'SET_CURRENT_ENTRY', payload: newEntry });
        dispatch({ type: 'SET_VIEW', payload: 'list' });
      } else {
        await updateEntry(state.currentEntry!.id, entryData);
        dispatch({ type: 'SET_VIEW', payload: 'list' });
      }
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert('Failed to save entry. Please try again.');
    }
  }, [
    title,
    content,
    tags,
    category,
    mood,
    location,
    weather,
    isFavorite,
    wordCount,
    isNewEntry,
    createEntry,
    updateEntry,
    state.currentEntry,
    dispatch,
  ]);

  const handleBack = () => {
    dispatch({ type: 'SET_VIEW', payload: 'list' });
  };

  const handleTemplateSelect = (template: JournalTemplate) => {
    setContent(template.content);
    setTags([...new Set([...tags, ...template.tags])]);
    setCategory(template.category);
    setShowTemplates(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const insertMarkdown = (syntax: string, placeholder = '') => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let insertText = '';
    let cursorOffset = 0;

    switch (syntax) {
      case 'bold':
        insertText = `**${selectedText || placeholder || 'bold text'}**`;
        cursorOffset = selectedText ? insertText.length : 2;
        break;
      case 'italic':
        insertText = `*${selectedText || placeholder || 'italic text'}*`;
        cursorOffset = selectedText ? insertText.length : 1;
        break;
      case 'link':
        insertText = `[${selectedText || 'link text'}](url)`;
        cursorOffset = selectedText ? insertText.length - 4 : insertText.length - 4;
        break;
      case 'list':
        insertText = `\n- ${selectedText || 'list item'}`;
        cursorOffset = insertText.length;
        break;
      case 'quote':
        insertText = `\n> ${selectedText || 'quote'}`;
        cursorOffset = insertText.length;
        break;
      case 'heading':
        insertText = `\n## ${selectedText || 'heading'}`;
        cursorOffset = insertText.length;
        break;
      case 'image':
        insertText = `![${selectedText || 'alt text'}](image-url)`;
        cursorOffset = selectedText ? insertText.length - 12 : insertText.length - 12;
        break;
    }

    const newContent = content.substring(0, start) + insertText + content.substring(end);
    setContent(newContent);

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
  };

  const moodEmojis = {
    happy: '😊',
    sad: '😢',
    neutral: '😐',
    excited: '🤩',
    anxious: '😰',
    grateful: '🙏',
  };

  return (
    <div
      className={`flex flex-col h-screen bg-gray-50 dark:bg-whatsapp-dark-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* Header */}
      <div className="bg-white dark:bg-whatsapp-dark-300 border-b border-gray-200 dark:border-whatsapp-dark-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-whatsapp-dark-200 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isNewEntry ? 'New Entry' : 'Edit Entry'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Word Count */}
            <div className="hidden sm:flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
              <FileText size={16} />
              <span>{wordCount} words</span>
            </div>

            {/* Preview Toggle */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`p-2 rounded-lg transition-colors ${
                showPreview
                  ? 'bg-whatsapp-100 dark:bg-whatsapp-dark-200 text-whatsapp-700 dark:text-whatsapp-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-whatsapp-dark-200'
              }`}
              title="Toggle preview"
            >
              {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>

            {/* Mobile View Toggle */}
            <button
              onClick={() => setShowMobile(!showMobile)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                showMobile
                  ? 'bg-whatsapp-100 dark:bg-whatsapp-dark-200 text-whatsapp-700 dark:text-whatsapp-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-whatsapp-dark-200'
              }`}
              title="Toggle mobile view"
            >
              <Settings size={20} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:block p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-whatsapp-dark-200 transition-colors"
              title="Toggle fullscreen"
            >
              <Sparkles size={20} />
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={!title.trim() || !content.trim() || state.isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-whatsapp-500 text-white rounded-lg hover:bg-whatsapp-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
            >
              <Save size={18} />
              <span className="hidden sm:inline">{state.isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div
          className={`flex flex-col ${showPreview ? 'w-1/2' : 'w-full'} ${showMobile && showPreview ? 'hidden md:flex' : ''}`}
        >
          {/* Title Input */}
          <div className="bg-white dark:bg-whatsapp-dark-300 border-b border-gray-200 dark:border-whatsapp-dark-200 p-4">
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Entry title..."
              className="w-full text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Toolbar */}
          <div className="bg-white dark:bg-whatsapp-dark-300 border-b border-gray-200 dark:border-whatsapp-dark-200 p-2">
            <div className="flex items-center space-x-1 overflow-x-auto">
              <ToolbarButton icon={Bold} label="Bold" onClick={() => insertMarkdown('bold')} />
              <ToolbarButton
                icon={Italic}
                label="Italic"
                onClick={() => insertMarkdown('italic')}
              />
              <ToolbarButton
                icon={Type}
                label="Heading"
                onClick={() => insertMarkdown('heading')}
              />
              <ToolbarButton icon={List} label="List" onClick={() => insertMarkdown('list')} />
              <ToolbarButton icon={Quote} label="Quote" onClick={() => insertMarkdown('quote')} />
              <ToolbarButton icon={Link} label="Link" onClick={() => insertMarkdown('link')} />
              <ToolbarButton icon={Image} label="Image" onClick={() => insertMarkdown('image')} />
              <div className="h-6 w-px bg-gray-200 dark:bg-whatsapp-dark-200 mx-2" />
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-whatsapp-dark-200 rounded transition-colors"
                title="Templates"
              >
                <BookOpen size={16} />
                <span className="hidden sm:inline">Templates</span>
              </button>
            </div>
          </div>

          {/* Templates Panel */}
          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="bg-whatsapp-50 dark:bg-whatsapp-dark-200 border-b border-gray-200 dark:border-whatsapp-dark-200 overflow-hidden"
              >
                <div className="p-3 max-h-32 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {templates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="text-left p-2 rounded-lg bg-white dark:bg-whatsapp-dark-300 hover:bg-gray-50 dark:hover:bg-whatsapp-dark-400 transition-colors border border-gray-200 dark:border-whatsapp-dark-200"
                      >
                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                          {template.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {template.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content Editor */}
          <div className="flex-1 bg-white dark:bg-whatsapp-dark-300">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Start writing your thoughts..."
              className="w-full h-full p-4 bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 leading-relaxed"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            />
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div
            className={`w-1/2 bg-white dark:bg-whatsapp-dark-300 border-l border-gray-200 dark:border-whatsapp-dark-200 ${showMobile ? 'w-full md:w-1/2' : ''}`}
          >
            <div className="h-full overflow-y-auto">
              <div className="p-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {title || 'Untitled Entry'}
                </h1>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content || 'Start writing to see the preview...'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metadata Panel */}
      <div className="bg-white dark:bg-whatsapp-dark-300 border-t border-gray-200 dark:border-whatsapp-dark-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag size={16} className="inline mr-1" />
              Tags
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-whatsapp-100 dark:bg-whatsapp-dark-200 text-whatsapp-700 dark:text-whatsapp-300"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-whatsapp-500 hover:text-whatsapp-700 dark:hover:text-whatsapp-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag..."
                className="flex-1 px-3 py-1 text-sm border border-gray-200 dark:border-whatsapp-dark-200 rounded-l-lg bg-gray-50 dark:bg-whatsapp-dark-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-whatsapp-500 focus:border-transparent"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-1 bg-whatsapp-500 text-white rounded-r-lg hover:bg-whatsapp-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <BookOpen size={16} className="inline mr-1" />
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="Personal, Work, Ideas..."
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-whatsapp-dark-200 rounded-lg bg-gray-50 dark:bg-whatsapp-dark-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-whatsapp-500 focus:border-transparent"
            />
          </div>

          {/* Mood & Location */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Smile size={16} className="inline mr-1" />
                Mood
              </label>
              <select
                value={mood || ''}
                onChange={e => setMood((e.target.value as JournalEntry['mood']) || undefined)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-whatsapp-dark-200 rounded-lg bg-gray-50 dark:bg-whatsapp-dark-400 text-gray-900 dark:text-white focus:ring-2 focus:ring-whatsapp-500 focus:border-transparent"
              >
                <option value="">Select mood</option>
                {Object.entries(moodEmojis).map(([key, emoji]) => (
                  <option key={key} value={key}>
                    {emoji} {key.charAt(0).toUpperCase() + key.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin size={16} className="inline mr-1" />
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Where are you?"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-whatsapp-dark-200 rounded-lg bg-gray-50 dark:bg-whatsapp-dark-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-whatsapp-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Weather & Favorite */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Cloud size={16} className="inline mr-1" />
                Weather
              </label>
              <input
                type="text"
                value={weather}
                onChange={e => setWeather(e.target.value)}
                placeholder="Sunny, Rainy..."
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-whatsapp-dark-200 rounded-lg bg-gray-50 dark:bg-whatsapp-dark-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-whatsapp-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={e => setIsFavorite(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-6 h-6 rounded transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
                >
                  <Heart size={24} className={isFavorite ? 'fill-current' : ''} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Favorite
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToolbarButtonProps {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-whatsapp-dark-200 transition-colors"
    title={label}
  >
    <Icon size={16} />
  </button>
);
