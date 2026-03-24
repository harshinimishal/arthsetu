import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { profile, updateProfile } = useAuth();
  const { i18n } = useTranslation();

  const isDyslexiaMode = Boolean(profile?.isDyslexiaMode);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  useEffect(() => {
    if (isDyslexiaMode) {
      document.body.classList.add('dyslexia-mode');
    } else {
      document.body.classList.remove('dyslexia-mode');
    }
  }, [isDyslexiaMode]);

  useEffect(() => {
    if (profile?.language && i18n.language !== profile.language) {
      i18n.changeLanguage(profile.language);
    }
  }, [profile?.language, i18n]);

  const handleToggleDyslexia = async () => {
    try {
      await updateProfile({ isDyslexiaMode: !isDyslexiaMode });
    } catch (error) {
      console.error('Failed to update dyslexia preference:', error);
    }
  };

  return (
    <div className={`min-h-screen bg-surface flex ${isDyslexiaMode ? 'dyslexia-mode' : ''}`}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar 
          onMenuClick={() => setIsSidebarOpen(true)} 
          isDyslexiaMode={isDyslexiaMode}
          onToggleDyslexia={handleToggleDyslexia}
        />
        <main className="flex-1 pt-20 lg:pl-64 min-h-screen bg-surface-container/30">
          <div className="p-4 md:p-8 lg:p-10 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
