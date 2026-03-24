import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "dashboard": "Dashboard",
      "projects": "Projects",
      "team": "Team",
      "attendance": "Attendance",
      "analytics": "Analytics",
      "transactions": "Transactions",
      "reports": "Reports",
      "settings": "Settings",
      "logout": "Logout",
      "search_placeholder": "Search anything...",
      "dyslexia_mode": "Dyslexia Friendly",
      "voice_search": "Voice Search",
      "create_new": "Create New",
      "register_new": "Register New",
      "active_projects": "Active Projects",
      "total_revenue": "Total Revenue",
      "total_team": "Total Team",
      "pending_payouts": "Pending Payouts",
      "service_business": "Service Business",
      "contract_business": "Contract Business",
      "save_changes": "Save Changes",
      "manage_preferences": "Manage your preferences and settings.",
      "language": "Language",
      "english": "English",
      "hindi": "Hindi",
      "profile_settings": "Profile Settings",
      "notifications": "Notifications",
      "security": "Security & Privacy",
      "accessibility": "Accessibility",
      "help": "Help & Support",
      "dyslexia_friendly": "Dyslexia Friendly",
      "active_services": "Active Services",
      "active_staff": "Active Staff",
      "completion_rate": "Completion Rate",
      "manage_services": "Manage Services",
      "add_staff": "Add Staff"
    }
  },
  hi: {
    translation: {
      "dashboard": "डैशबोर्ड",
      "projects": "परियोजनाएं",
      "team": "टीम",
      "attendance": "उपस्थिति",
      "analytics": "एनालिटिक्स",
      "transactions": "लेन-देन",
      "reports": "रिपोर्ट",
      "settings": "सेटिंग्स",
      "logout": "लॉगआउट",
      "search_placeholder": "कुछ भी खोजें...",
      "dyslexia_mode": "डिस्लेक्सिया फ्रेंडली",
      "voice_search": "वॉयस सर्च",
      "create_new": "नया बनाएं",
      "register_new": "नया पंजीकरण",
      "active_projects": "सक्रिय परियोजनाएं",
      "total_revenue": "कुल राजस्व",
      "total_team": "कुल टीम",
      "pending_payouts": "लंबित भुगतान",
      "service_business": "सेवा व्यवसाय",
      "contract_business": "अनुबंध व्यवसाय",
      "save_changes": "परिवर्तन सहेजें",
      "manage_preferences": "अपनी प्राथमिकताओं और सेटिंग्स को प्रबंधित करें।",
      "language": "भाषा",
      "english": "अंग्रेजी",
      "hindi": "हिंदी",
      "profile_settings": "प्रोफ़ाइल सेटिंग्स",
      "notifications": "सूचनाएं",
      "security": "सुरक्षा और गोपनीयता",
      "accessibility": "सुगम्यता",
      "help": "सहायता और समर्थन",
      "dyslexia_friendly": "डिस्लेक्सिया अनुकूल",
      "active_services": "सक्रिय सेवाएं",
      "active_staff": "सक्रिय स्टाफ",
      "completion_rate": "पूर्णता दर",
      "manage_services": "सेवाएं प्रबंधित करें",
      "add_staff": "स्टाफ जोड़ें"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
