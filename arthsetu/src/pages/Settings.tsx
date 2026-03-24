import { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  HelpCircle, 
  ChevronRight,
  Camera,
  Mail,
  Phone,
  MapPin,
  Save
} from 'lucide-react';
import { motion } from 'motion/react';

const settingsTabs = [
  { id: 'profile', label: 'Profile Settings', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security & Privacy', icon: Shield },
  { id: 'language', label: 'Language & Region', icon: Globe },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex items-end justify-between">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight text-on-surface">Settings & Profile</h2>
          <p className="text-on-surface-variant text-lg">Manage your account preferences and personal information.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 shadow-xl shadow-primary/20">
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Sidebar */}
        <section className="lg:col-span-1 space-y-2">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4",
                activeTab === tab.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-bold text-sm">{tab.label}</span>
              {activeTab !== tab.id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
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
                  <h3 className="text-2xl font-bold text-on-surface">Rajesh Kumar</h3>
                  <p className="text-on-surface-variant font-medium">Senior Contractor • Mumbai, India</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">Verified Partner</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase">Premium Account</span>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="organic-card space-y-8">
                <h4 className="text-xl font-bold">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                      <input 
                        type="text" 
                        defaultValue="Rajesh Kumar"
                        className="w-full pl-12 pr-6 py-4 bg-surface-container-high rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                      <input 
                        type="email" 
                        defaultValue="rajesh@kumarconstructions.com"
                        className="w-full pl-12 pr-6 py-4 bg-surface-container-high rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                      <input 
                        type="tel" 
                        defaultValue="+91 98765 43210"
                        className="w-full pl-12 pr-6 py-4 bg-surface-container-high rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface ml-1">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                      <input 
                        type="text" 
                        defaultValue="Mumbai, Maharashtra"
                        className="w-full pl-12 pr-6 py-4 bg-surface-container-high rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="organic-card space-y-6">
                <h4 className="text-xl font-bold">Preferences</h4>
                <div className="space-y-4">
                  {[
                    { label: 'Dark Mode', description: 'Switch between light and dark themes.', icon: Moon, toggle: true },
                    { label: 'Push Notifications', description: 'Receive real-time updates on your phone.', icon: Bell, toggle: true },
                    { label: 'Language', description: 'Set your preferred language for the interface.', icon: Globe, value: 'English' },
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/50">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-surface-container-highest text-primary">
                          <pref.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{pref.label}</p>
                          <p className="text-xs text-on-surface-variant">{pref.description}</p>
                        </div>
                      </div>
                      {pref.toggle ? (
                        <button className="w-12 h-6 bg-primary rounded-full relative p-1 transition-all">
                          <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                        </button>
                      ) : (
                        <button className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                          {pref.value} <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
