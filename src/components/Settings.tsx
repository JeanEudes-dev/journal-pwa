import React from 'react';
import { Moon, Sun, Monitor, Save, FileText, Settings as SettingsIcon } from 'lucide-react';
import { useSettings } from '../hooks';
import { motion } from 'framer-motion';

export const Settings: React.FC = () => {
  const { settings, updateSettings, isDarkMode } = useSettings();

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp-500"></div>
      </div>
    );
  }

  const handleAutoSaveIntervalChange = (interval: number) => {
    updateSettings({ autoSaveInterval: interval });
  };

  const handleFontSizeChange = (fontSize: 'small' | 'medium' | 'large') => {
    updateSettings({ fontSize });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-whatsapp-500 to-whatsapp-600 rounded-full flex items-center justify-center">
            <SettingsIcon size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Customize your journal experience</p>
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-whatsapp-dark-300 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-whatsapp-dark-200">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            {isDarkMode ? <Moon size={20} className="mr-2" /> : <Sun size={20} className="mr-2" />}
            Appearance
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['light', 'dark', 'system'] as const).map(theme => (
                  <button
                    key={theme}
                    onClick={() => updateSettings({ theme })}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      settings.theme === theme
                        ? 'border-whatsapp-500 bg-whatsapp-50 dark:bg-whatsapp-dark-200 text-whatsapp-700 dark:text-whatsapp-300'
                        : 'border-gray-200 dark:border-whatsapp-dark-200 hover:border-whatsapp-300 dark:hover:border-whatsapp-dark-100'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {theme === 'light' && <Sun size={18} />}
                      {theme === 'dark' && <Moon size={18} />}
                      {theme === 'system' && <Monitor size={18} />}
                    </div>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Size
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['small', 'medium', 'large'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => handleFontSizeChange(size)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      settings.fontSize === size
                        ? 'border-whatsapp-500 bg-whatsapp-50 dark:bg-whatsapp-dark-200 text-whatsapp-700 dark:text-whatsapp-300'
                        : 'border-gray-200 dark:border-whatsapp-dark-200 hover:border-whatsapp-300 dark:hover:border-whatsapp-dark-100'
                    }`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Editor Settings */}
        <div className="bg-white dark:bg-whatsapp-dark-300 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-whatsapp-dark-200">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FileText size={20} className="mr-2" />
            Editor
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto-save
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically save your entries while typing
                </p>
              </div>
              <button
                onClick={() => updateSettings({ autoSave: !settings.autoSave })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoSave ? 'bg-whatsapp-500' : 'bg-gray-200 dark:bg-whatsapp-dark-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.autoSave && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Auto-save interval
                </label>
                <select
                  value={settings.autoSaveInterval}
                  onChange={e => handleAutoSaveIntervalChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-whatsapp-dark-200 rounded-lg bg-white dark:bg-whatsapp-dark-400 text-gray-900 dark:text-white focus:ring-2 focus:ring-whatsapp-500 focus:border-transparent"
                >
                  <option value={1000}>1 second</option>
                  <option value={2000}>2 seconds</option>
                  <option value={5000}>5 seconds</option>
                  <option value={10000}>10 seconds</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show word count
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Display word count in the editor
                </p>
              </div>
              <button
                onClick={() => updateSettings({ showWordCount: !settings.showWordCount })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showWordCount
                    ? 'bg-whatsapp-500'
                    : 'bg-gray-200 dark:bg-whatsapp-dark-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showWordCount ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show line numbers
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Display line numbers in the editor
                </p>
              </div>
              <button
                onClick={() => updateSettings({ showLineNumbers: !settings.showLineNumbers })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showLineNumbers
                    ? 'bg-whatsapp-500'
                    : 'bg-gray-200 dark:bg-whatsapp-dark-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showLineNumbers ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Export Settings */}
        <div className="bg-white dark:bg-whatsapp-dark-300 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-whatsapp-dark-200">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Save size={20} className="mr-2" />
            Export
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default export format
            </label>
            <select
              value={settings.exportFormat}
              onChange={e =>
                updateSettings({ exportFormat: e.target.value as 'markdown' | 'pdf' | 'both' })
              }
              className="w-full px-3 py-2 border border-gray-200 dark:border-whatsapp-dark-200 rounded-lg bg-white dark:bg-whatsapp-dark-400 text-gray-900 dark:text-white focus:ring-2 focus:ring-whatsapp-500 focus:border-transparent"
            >
              <option value="markdown">Markdown</option>
              <option value="pdf">PDF</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        {/* About */}
        <div className="bg-gradient-to-r from-whatsapp-50 to-whatsapp-100 dark:from-whatsapp-dark-200 dark:to-whatsapp-dark-300 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-whatsapp-700 dark:text-whatsapp-300 mb-2">
            Journal PWA
          </h3>
          <p className="text-sm text-whatsapp-600 dark:text-whatsapp-400 mb-2">
            by Jean-Eudes Assogba
          </p>
          <p className="text-xs text-whatsapp-500 dark:text-whatsapp-500">
            Version 1.0.0 • Built with React + TypeScript + Tailwind CSS
          </p>
          <div className="mt-4">
            <a
              href="https://github.com/jean-eudes/journal-pwa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-whatsapp-600 dark:text-whatsapp-400 hover:text-whatsapp-700 dark:hover:text-whatsapp-300 transition-colors"
            >
              View on GitHub →
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
