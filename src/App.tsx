import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './contexts/AppContext';
import { Header } from './components/Header';
import { EntryList } from './components/EntryList';
import { MarkdownEditor } from './components/MarkdownEditor';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Settings } from './components/Settings';
import { Search } from './components/Search';
import { Export } from './components/Export';
import { Footer } from './components/Footer';

function AppContent() {
  const { state } = useApp();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  if (state.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-whatsapp-dark-100 flex flex-col">
      <Header showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} />

      <main className="relative flex-1">
        <AnimatePresence mode="wait">
          {state.currentView === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <EntryList />
            </motion.div>
          )}

          {state.currentView === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <MarkdownEditor />
            </motion.div>
          )}

          {state.currentView === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Search />
            </motion.div>
          )}

          {state.currentView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Settings />
            </motion.div>
          )}

          {state.currentView === 'export' && (
            <motion.div
              key="export"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Export />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
