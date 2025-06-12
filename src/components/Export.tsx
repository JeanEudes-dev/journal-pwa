import React, { useState } from 'react';
import {
  Download,
  FileText,
  File,
  Database,
  Settings,
  Calendar,
  Tag,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useEntries } from '../hooks';
import { ExportService } from '../services/export';
import type { ExportOptions } from '../types';

export const Export: React.FC = () => {
  const { entries } = useEntries();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'markdown' | 'json'>('pdf');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeTags: true,
    includeMetadata: true,
  });
  const [exportStatus, setExportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const filteredEntries = selectAll
    ? entries
    : entries.filter(entry => selectedEntries.includes(entry.id));

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(entries.map(entry => entry.id));
    }
  };

  const handleEntryToggle = (entryId: string) => {
    setSelectedEntries(prev =>
      prev.includes(entryId) ? prev.filter(id => id !== entryId) : [...prev, entryId]
    );
    setSelectAll(false);
  };

  const handleExport = async () => {
    if (filteredEntries.length === 0) {
      setExportStatus({
        type: 'error',
        message: 'No entries selected for export',
      });
      return;
    }

    setIsExporting(true);
    setExportStatus({ type: null, message: '' });

    try {
      switch (exportFormat) {
        case 'pdf':
          await ExportService.exportToPDF(filteredEntries, exportOptions);
          break;
        case 'markdown':
          await ExportService.exportToMarkdown(filteredEntries, exportOptions);
          break;
        case 'json':
          await ExportService.exportToJSON(filteredEntries, exportOptions);
          break;
      }

      setExportStatus({
        type: 'success',
        message: `Successfully exported ${filteredEntries.length} entries as ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus({
        type: 'error',
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatDescriptions = {
    pdf: 'A formatted PDF document perfect for printing or sharing. Includes styling and layout.',
    markdown: 'Plain text files with markdown formatting. Great for importing into other apps.',
    json: 'Structured data format that preserves all metadata. Perfect for backups and data migration.',
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-whatsapp-500 to-whatsapp-600 rounded-full flex items-center justify-center">
          <Download size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Export Entries</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Download your journal entries in various formats
        </p>
      </div>

      {/* Export Status */}
      {exportStatus.type && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center space-x-3 ${
            exportStatus.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          }`}
        >
          {exportStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{exportStatus.message}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Format Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-whatsapp-dark-300 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-whatsapp-dark-200">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText size={20} className="mr-2" />
              Export Format
            </h2>

            <div className="space-y-3">
              {(
                [
                  { value: 'pdf', icon: FileText, label: 'PDF Document', color: 'text-red-500' },
                  {
                    value: 'markdown',
                    icon: File,
                    label: 'Markdown Files',
                    color: 'text-blue-500',
                  },
                  { value: 'json', icon: Database, label: 'JSON Data', color: 'text-green-500' },
                ] as const
              ).map(({ value, icon: Icon, label, color }) => (
                <label
                  key={value}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    exportFormat === value
                      ? 'border-whatsapp-500 bg-whatsapp-50 dark:bg-whatsapp-dark-200'
                      : 'border-gray-200 dark:border-whatsapp-dark-200 hover:border-gray-300 dark:hover:border-whatsapp-dark-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={value}
                    checked={exportFormat === value}
                    onChange={e => setExportFormat(e.target.value as 'pdf' | 'markdown' | 'json')}
                    className="sr-only"
                  />
                  <Icon size={24} className={`mr-3 ${color}`} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDescriptions[value]}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white dark:bg-whatsapp-dark-300 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-whatsapp-dark-200">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Settings size={20} className="mr-2" />
              Export Options
            </h2>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeTags}
                  onChange={e =>
                    setExportOptions(prev => ({ ...prev, includeTags: e.target.checked }))
                  }
                  className="rounded border-gray-300 dark:border-whatsapp-dark-200 text-whatsapp-500 focus:ring-whatsapp-500"
                />
                <Tag size={16} className="ml-3 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-200">Include tags</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeMetadata}
                  onChange={e =>
                    setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))
                  }
                  className="rounded border-gray-300 dark:border-whatsapp-dark-200 text-whatsapp-500 focus:ring-whatsapp-500"
                />
                <Calendar size={16} className="ml-3 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-200">
                  Include metadata (dates, word count, etc.)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Entry Selection */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-whatsapp-dark-300 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-whatsapp-dark-200">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Entries ({filteredEntries.length})
            </h2>

            <div className="space-y-3">
              <label className="flex items-center font-medium">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={e => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 dark:border-whatsapp-dark-200 text-whatsapp-500 focus:ring-whatsapp-500"
                />
                <span className="ml-3 text-gray-700 dark:text-gray-200">All entries</span>
              </label>

              {!selectAll && (
                <div className="max-h-64 overflow-y-auto space-y-2 border-t border-gray-200 dark:border-whatsapp-dark-200 pt-3">
                  {entries.map(entry => (
                    <label key={entry.id} className="flex items-start text-sm">
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(entry.id)}
                        onChange={() => handleEntryToggle(entry.id)}
                        className="mt-1 rounded border-gray-300 dark:border-whatsapp-dark-200 text-whatsapp-500 focus:ring-whatsapp-500"
                      />
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {entry.title}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting || filteredEntries.length === 0}
            className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
              isExporting || filteredEntries.length === 0
                ? 'bg-gray-100 dark:bg-whatsapp-dark-200 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-whatsapp-500 hover:bg-whatsapp-600 text-white shadow-sm hover:shadow-md'
            }`}
          >
            {isExporting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download size={20} />
                <span>Export {filteredEntries.length} entries</span>
              </>
            )}
          </button>

          {filteredEntries.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Total: {filteredEntries.reduce((sum, entry) => sum + entry.wordCount, 0)} words
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
