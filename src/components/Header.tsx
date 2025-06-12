import React from 'react';
import {
  Search,
  Plus,
  Settings,
  Download,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  Save,
  Menu,
  X,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useSettings, useOnlineStatus } from '../hooks';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ showMobileMenu, setShowMobileMenu }) => {
  const { state, dispatch } = useApp();
  const { toggleTheme, isDarkMode } = useSettings();
  const { isOnline, isOffline } = useOnlineStatus();

  const handleNewEntry = () => {
    dispatch({ type: 'SET_CURRENT_ENTRY', payload: null });
    dispatch({ type: 'SET_VIEW', payload: 'editor' });
    setShowMobileMenu(false);
  };

  const handleSearch = () => {
    dispatch({ type: 'SET_VIEW', payload: 'search' });
    setShowMobileMenu(false);
  };

  const handleSettings = () => {
    dispatch({ type: 'SET_VIEW', payload: 'settings' });
    setShowMobileMenu(false);
  };

  const handleExport = () => {
    dispatch({ type: 'SET_VIEW', payload: 'export' });
    setShowMobileMenu(false);
  };

  const handleLogoClick = () => {
    dispatch({ type: 'SET_VIEW', payload: 'list' });
    dispatch({ type: 'SET_CURRENT_ENTRY', payload: null });
    setShowMobileMenu(false);
  };

  return (
    <header className="bg-white dark:bg-whatsapp-dark-300 border-b border-gray-200 dark:border-whatsapp-dark-200 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-whatsapp-500 to-whatsapp-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5v-2h-5c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8v1.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.63-.56 3.54-1.46.65.89 1.77 1.46 2.96 1.46 1.93 0 3.5-1.57 3.5-3.5V12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Journal PWA</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">by Jean-Eudes Assogba</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <NavButton
              icon={Search}
              label="Search"
              onClick={handleSearch}
              isActive={state.currentView === 'search'}
            />
            <NavButton
              icon={Plus}
              label="New Entry"
              onClick={handleNewEntry}
              isActive={state.currentView === 'editor' && !state.currentEntry}
              variant="primary"
            />
            <NavButton
              icon={Download}
              label="Export"
              onClick={handleExport}
              isActive={state.currentView === 'export'}
            />
            <NavButton
              icon={Settings}
              label="Settings"
              onClick={handleSettings}
              isActive={state.currentView === 'settings'}
            />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-whatsapp-dark-200 transition-colors"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Status Indicators & Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* Online/Offline Status */}
            <div className="flex items-center space-x-2">
              {isOffline && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-1 text-amber-600 dark:text-amber-400"
                  title="You're offline"
                >
                  <WifiOff size={16} />
                  <span className="hidden sm:inline text-sm font-medium">Offline</span>
                </motion.div>
              )}

              {isOnline && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-1 text-whatsapp-600 dark:text-whatsapp-400"
                  title="You're online"
                >
                  <Wifi size={16} />
                  <span className="hidden sm:inline text-sm font-medium">Online</span>
                </motion.div>
              )}

              {/* Saving Indicator */}
              {state.isSaving && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-1 text-blue-600 dark:text-blue-400"
                >
                  <Save size={16} className="animate-pulse" />
                  <span className="hidden sm:inline text-sm font-medium">Saving...</span>
                </motion.div>
              )}

              {/* Unsaved Changes */}
              {state.hasUnsavedChanges && !state.isSaving && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-amber-500 rounded-full"
                  title="You have unsaved changes"
                />
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-whatsapp-dark-200 transition-colors"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-whatsapp-dark-200 bg-white dark:bg-whatsapp-dark-300"
          >
            <div className="px-4 py-3 space-y-2">
              <MobileNavButton
                icon={Search}
                label="Search Entries"
                onClick={handleSearch}
                isActive={state.currentView === 'search'}
              />
              <MobileNavButton
                icon={Plus}
                label="New Entry"
                onClick={handleNewEntry}
                isActive={state.currentView === 'editor' && !state.currentEntry}
                variant="primary"
              />
              <MobileNavButton
                icon={Download}
                label="Export Entries"
                onClick={handleExport}
                isActive={state.currentView === 'export'}
              />
              <MobileNavButton
                icon={Settings}
                label="Settings"
                onClick={handleSettings}
                isActive={state.currentView === 'settings'}
              />
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-whatsapp-dark-200 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                <span>Toggle {isDarkMode ? 'Light' : 'Dark'} Mode</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

interface NavButtonProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  variant?: 'default' | 'primary';
}

const NavButton: React.FC<NavButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  isActive = false,
  variant = 'default',
}) => {
  const baseClasses =
    'flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium';
  const variantClasses = {
    default: isActive
      ? 'bg-whatsapp-100 dark:bg-whatsapp-dark-200 text-whatsapp-700 dark:text-whatsapp-300'
      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-whatsapp-dark-200',
    primary: isActive
      ? 'bg-whatsapp-600 text-white shadow-lg'
      : 'bg-whatsapp-500 text-white hover:bg-whatsapp-600 shadow-md hover:shadow-lg',
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]}`} title={label}>
      <Icon size={18} />
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
};

interface MobileNavButtonProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  variant?: 'default' | 'primary';
}

const MobileNavButton: React.FC<MobileNavButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  isActive = false,
  variant = 'default',
}) => {
  const baseClasses =
    'flex items-center space-x-3 w-full p-3 rounded-lg transition-colors font-medium';
  const variantClasses = {
    default: isActive
      ? 'bg-whatsapp-100 dark:bg-whatsapp-dark-200 text-whatsapp-700 dark:text-whatsapp-300'
      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-whatsapp-dark-200',
    primary: isActive
      ? 'bg-whatsapp-600 text-white'
      : 'bg-whatsapp-500 text-white hover:bg-whatsapp-600',
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]}`}>
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );
};
