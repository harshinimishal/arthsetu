import { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  HelpCircle, 
  ChevronRight,
  Camera,
  Save,
  Type,
  Briefcase,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { profile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const isDyslexiaMode = Boolean(profile?.isDyslexiaMode);
  const businessType = profile?.businessType || localStorage.getItem('businessType') || 'contract';

  useEffect(() => {
    if (isDyslexiaMode) {
      document.body.classList.add('dyslexia-mode');
    } else {
      document.body.classList.remove('dyslexia-mode');
    }
  }, [isDyslexiaMode]);

  const settingsTabs = [
    { id: 'profile', label: t('profile_settings'), icon: User },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'security', label: t('security'), icon: Shield },
    { id: 'language', label: t('language'), icon: Globe },
    { id: 'accessibility', label: t('accessibility'), icon: Type },
    { id: 'help', label: t('help'), icon: HelpCircle },
  ];

  const handleLanguageChange = async (lang: string) => {
    await i18n.changeLanguage(lang);
    try {
      await updateProfile({ language: lang });
      setStatusMessage('Language preference saved.');
    } catch (error) {
      console.error('Failed to save language:', error);
      setStatusMessage('Failed to save language preference.');
    }
  };

  const toggleDyslexiaMode = async () => {
    try {
      await updateProfile({ isDyslexiaMode: !isDyslexiaMode });
      setStatusMessage('Accessibility preference saved.');
    } catch (error) {
      console.error('Failed to save accessibility setting:', error);
      setStatusMessage('Failed to save accessibility preference.');
    }
  };

  const handleBusinessTypeChange = async (type: string) => {
    localStorage.setItem('businessType', type);
    try {
      await updateProfile({ businessType: type });
      setStatusMessage('Business model saved.');
    } catch (error) {
      console.error('Failed to save business model:', error);
      setStatusMessage('Failed to save business model.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        businessType,
        isDyslexiaMode,
        language: i18n.language,
      });
      setStatusMessage('Settings saved successfully.');
    } catch (error) {
      console.error('Failed to save settings:', error);
      setStatusMessage('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">{t('settings')}</h2>
          <p className="text-on-surface-variant text-base md:text-lg">{t('manage_preferences')}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary flex items-center gap-2 shadow-xl shadow-primary/20 w-full md:w-auto justify-center disabled:opacity-60"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : t('save_changes')}
        </button>
      </section>

      {statusMessage && (
        <div className="rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface-variant">
          {statusMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Sidebar */}
        <section className="lg:col-span-1 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap lg:whitespace-normal text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 shrink-0 lg:shrink",
                activeTab === tab.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-bold text-sm">{tab.label}</span>
              {activeTab !== tab.id && <ChevronRight className="hidden lg:block w-4 h-4 ml-auto opacity-50" />}
            </button>
          ))}
        </section>

        {/* Settings Content */}
        <section className="lg:col-span-3 space-y-8">
          {activeTab === 'profile' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Profile Header */}
              <div className="organic-card flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl bg-surface-container-highest flex items-center justify-center text-primary overflow-hidden border-2 border-primary/10">
                    <User className="w-16 h-16" />
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 transition-all">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-center md:text-left space-y-2">
                  <h3 className="text-2xl font-bold text-on-surface">{profile?.displayName || 'Profile'}</h3>
                  <p className="text-on-surface-variant font-medium">
                    {businessType === 'contract' ? 'Senior Contractor' : 'Service Provider'} • Mumbai, India
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">Verified Partner</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase">Premium Account</span>
                  </div>
                </div>
              </div>

              {/* Business Type Selection */}
              <div className="organic-card space-y-6">
                <h4 className="text-xl font-bold">Business Model</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleBusinessTypeChange('contract')}
                    className={cn(
                      "p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4",
                      businessType === 'contract' ? "border-primary bg-primary/5" : "border-outline/10 hover:border-primary/50"
                    )}
                  >
                    <div className="p-3 rounded-2xl bg-surface-container-highest text-primary">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Contract Business</p>
                      <p className="text-xs text-on-surface-variant">Manage large scale projects and labor contracts.</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleBusinessTypeChange('service')}
                    className={cn(
                      "p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4",
                      businessType === 'service' ? "border-primary bg-primary/5" : "border-outline/10 hover:border-primary/50"
                    )}
                  >
                    <div className="p-3 rounded-2xl bg-surface-container-highest text-primary">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Service Business</p>
                      <p className="text-xs text-on-surface-variant">Manage individual service requests and team members.</p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'language' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="organic-card space-y-6"
            >
              <h4 className="text-xl font-bold">{t('language')}</h4>
              <div className="space-y-4">
                <button 
                  onClick={() => handleLanguageChange('en')}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                    i18n.language === 'en' ? "bg-primary text-white" : "bg-surface-container-high hover:bg-surface-container-highest"
                  )}
                >
                  <span className="font-bold">English</span>
                  {i18n.language === 'en' && <ChevronRight className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => handleLanguageChange('hi')}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                    i18n.language === 'hi' ? "bg-primary text-white" : "bg-surface-container-high hover:bg-surface-container-highest"
                  )}
                >
                  <span className="font-bold">हिन्दी (Hindi)</span>
                  {i18n.language === 'hi' && <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'accessibility' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="organic-card space-y-6"
            >
              <h4 className="text-xl font-bold">{t('accessibility')}</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-surface-container-highest text-primary">
                      <Type className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">{t('dyslexia_friendly')}</p>
                      <p className="text-xs text-on-surface-variant">Enhance readability with specialized fonts and spacing.</p>
                    </div>
                  </div>
                  <button 
                    onClick={toggleDyslexiaMode}
                    className={cn(
                      "w-12 h-6 rounded-full relative p-1 transition-all",
                      isDyslexiaMode ? "bg-primary" : "bg-outline/30"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 bg-white rounded-full transition-all",
                      isDyslexiaMode ? "ml-auto" : "ml-0"
                    )} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
