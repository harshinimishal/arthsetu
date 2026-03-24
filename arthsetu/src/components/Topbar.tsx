import { Search, Bell, Globe, User, Menu, Mic, Accessibility } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useVoiceToText } from '../hooks/useVoiceToText';
import { useAuth } from '../contexts/AuthContext';

interface TopbarProps {
  onMenuClick: () => void;
  isDyslexiaMode: boolean;
  onToggleDyslexia: () => void;
}

export function Topbar({ onMenuClick, isDyslexiaMode, onToggleDyslexia }: TopbarProps) {
  const { t, i18n } = useTranslation();
  const { updateProfile } = useAuth();
  const [searchValue, setSearchValue] = useState('');

  const { listening, supported, error, start, clearError } = useVoiceToText({
    language: i18n.language === 'hi' ? 'hi-IN' : 'en-US',
    onResult: (text) => setSearchValue(text),
  });

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    await i18n.changeLanguage(newLang);
    try {
      await updateProfile({ language: newLang });
    } catch (profileError) {
      console.error('Failed to persist language preference:', profileError);
    }
  };

  return (
    <header className="h-20 glass border-b border-outline/10 flex items-center justify-between px-4 md:px-10 fixed top-0 right-0 left-0 lg:left-64 z-40">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-surface-container-high rounded-xl lg:hidden"
        >
          <Menu className="w-6 h-6 text-on-surface-variant" />
        </button>
        
        <div className="relative group flex-1 hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t('search_placeholder')} 
            className="w-full pl-12 pr-12 py-3 bg-surface-container-high rounded-full border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
          />
          {supported && (
            <button
              onClick={() => {
                clearError();
                start();
              }}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${listening ? 'bg-primary text-white animate-pulse' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
              title={t('voice_search')}
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <span className="hidden md:block text-xs text-red-600 mr-3">{error}</span>
      )}

      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={onToggleDyslexia}
          className={`p-2 md:p-3 rounded-full transition-all ${isDyslexiaMode ? 'bg-primary text-white' : 'hover:bg-surface-container-high text-on-surface-variant'}`}
          title={t('dyslexia_mode')}
        >
          <Accessibility className="w-5 h-5" />
        </button>

        <button 
          onClick={toggleLanguage}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full hover:bg-surface-container-high transition-all"
        >
          <Globe className="w-5 h-5 text-on-surface-variant" />
          <span className="text-sm font-medium">{i18n.language === 'en' ? t('english') : t('hindi')}</span>
        </button>

        <div className="relative">
          <button className="p-2 md:p-3 rounded-full hover:bg-surface-container-high transition-all relative">
            <Bell className="w-5 h-5 text-on-surface-variant" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-secondary-container rounded-full border-2 border-surface" />
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4 pl-2 md:pl-6 border-l border-outline/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-on-surface">Rajesh Kumar</p>
            <p className="text-xs text-on-surface-variant">Senior Manager</p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary overflow-hidden border border-outline/10">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
