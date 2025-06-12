import React from 'react';
import { Heart, Github, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-whatsapp-dark-300 border-t border-gray-200 dark:border-whatsapp-dark-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-0 sm:flex-row sm:justify-between">
          {/* Left side - Built with love */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Built with</span>
            <Heart size={14} className="text-red-500 fill-current" />
            <span>by</span>
            <a
              href="https://github.com/JeanEudes-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-whatsapp-600 dark:text-whatsapp-400 hover:text-whatsapp-700 dark:hover:text-whatsapp-300 transition-colors"
            >
              Jean-Eudes ASSOGBA
            </a>
            <span>on</span>
            <span className="text-blue-600 dark:text-blue-400">🌍 Earth</span>
          </div>

          {/* Right side - GitHub link */}
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/JeanEudes-dev/journal-pwa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-whatsapp-600 dark:hover:text-whatsapp-400 transition-colors group"
            >
              <Github size={16} className="group-hover:scale-110 transition-transform" />
              <span>Source Code</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-whatsapp-dark-200">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Jean-Eudes ASSOGBA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
