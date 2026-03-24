import { useState, useEffect, useRef } from 'react';
import {
  User, Bell, Shield, Globe, HelpCircle, ChevronRight,
  Camera, Save, Type, Briefcase, Users, Phone, Mail,
  Building2, BadgeCheck, Lock, Smartphone, MonitorSmartphone,
  Trash2, Eye, EyeOff, Send, MessageSquare, Bug, Lightbulb,
  CheckCircle, XCircle, AlertTriangle, LogOut, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import React from "react";

// ── Firebase ─────────────────────────────────────────────────────
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth, onAuthStateChanged,
  updatePassword, EmailAuthProvider, reauthenticateWithCredential,
  sendPasswordResetEmail, deleteUser, signOut,
  multiFactor, PhoneMultiFactorGenerator, PhoneAuthProvider,
  RecaptchaVerifier,
} from 'firebase/auth';
import {
  getFirestore, doc, getDoc, setDoc,
  collection, addDoc, serverTimestamp, query, orderBy, getDocs, deleteDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAJS3Ab7lq5RkyOTmrkjvyW7RMHCTy39Oo",
  authDomain: "arthsetu-21496.firebaseapp.com",
  projectId: "arthsetu-21496",
  storageBucket: "arthsetu-21496.firebasestorage.app",
  messagingSenderId: "1017304784921",
  appId: "1:1017304784921:web:72eb5155aa294010000a88",
};

const fbApp   = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const fbAuth  = getAuth(fbApp);
const db      = getFirestore(fbApp);

// ── Types ─────────────────────────────────────────────────────────
interface UserProfile {
  uid: string; displayName: string; email: string; phone: string;
  company: string; role: string; businessType: string;
  isDyslexiaMode: boolean; language: string;
  photoURL: string | null; createdAt: string;
}

interface NotificationPrefs {
  invoiceAlerts: boolean;
  paymentUpdates: boolean;
  teamActivity: boolean;
  systemAnnouncements: boolean;
  browserPermissionGranted: boolean;
}

const DEFAULT_NOTIF: NotificationPrefs = {
  invoiceAlerts: false, paymentUpdates: false,
  teamActivity: false, systemAnnouncements: false,
  browserPermissionGranted: false,
};

// ── Small reusable components ─────────────────────────────────────
const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn('w-12 h-6 rounded-full relative p-1 transition-all duration-300 shrink-0',
      on ? 'bg-primary' : 'bg-outline/30')}
  >
    <div className={cn('w-4 h-4 bg-white rounded-full transition-all duration-300', on ? 'ml-auto' : 'ml-0')} />
  </button>
);

const Modal = ({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-on-surface">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container-high text-on-surface-variant">
              <X className="w-5 h-5" />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const StatusBanner = ({ msg }: { msg: { type: 'success' | 'error' | 'info'; text: string } | null }) => (
  <AnimatePresence>
    {msg && (
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
        className={cn('rounded-2xl px-4 py-3 text-sm flex items-center gap-2 font-medium',
          msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          msg.type === 'error'   ? 'bg-red-50 text-red-600 border border-red-200' :
                                   'bg-blue-50 text-blue-700 border border-blue-200')}
      >
        {msg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> :
         msg.type === 'error'   ? <XCircle className="w-4 h-4 shrink-0" /> :
                                  <AlertTriangle className="w-4 h-4 shrink-0" />}
        {msg.text}
      </motion.div>
    )}
  </AnimatePresence>
);

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function Settings() {
  const { t, i18n } = useTranslation();

  let contextProfile: any = null;
  let contextUpdateProfile: ((d: any) => Promise<void>) | null = null;
  try { const a = useAuth(); contextProfile = a.profile; contextUpdateProfile = a.updateProfile; } catch {}

  const [activeTab,       setActiveTab]       = useState('profile');
  const [isSaving,        setIsSaving]        = useState(false);
  const [statusMsg,       setStatusMsg]       = useState<{ type: 'success'|'error'|'info'; text: string } | null>(null);
  const [firestoreProfile,setFirestoreProfile]= useState<UserProfile | null>(null);
  const [loadingProfile,  setLoadingProfile]  = useState(true);

  const profile: UserProfile | null = contextProfile || firestoreProfile;
  const flash = (type: 'success'|'error'|'info', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // ── Load profile ─────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(fbAuth, async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) setFirestoreProfile({ uid: user.uid, ...snap.data() } as UserProfile);
          else setFirestoreProfile({
            uid: user.uid, displayName: user.displayName || '', email: user.email || '',
            phone: user.phoneNumber || '', company: '', role: '',
            businessType: localStorage.getItem('businessType') || 'contract',
            isDyslexiaMode: false, language: i18n.language || 'en',
            photoURL: user.photoURL, createdAt: user.metadata.creationTime || '',
          });
        } catch (e) { console.error(e); }
      }
      setLoadingProfile(false);
    });
    return () => unsub();
  }, []);

  const isDyslexiaMode = Boolean(profile?.isDyslexiaMode);
  const businessType   = profile?.businessType || localStorage.getItem('businessType') || 'contract';
  const memberSince    = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '';

  useEffect(() => {
    document.body.classList.toggle('dyslexia-mode', isDyslexiaMode);
  }, [isDyslexiaMode]);

  const saveToFirestore = async (data: Record<string, any>) => {
    const user = fbAuth.currentUser; if (!user) throw new Error('Not authenticated');
    await setDoc(doc(db, 'users', user.uid), data, { merge: true });
    setFirestoreProfile(prev => prev ? { ...prev, ...data } : null);
  };

  const updateProfile = async (data: Record<string, any>) => {
    if (contextUpdateProfile) await contextUpdateProfile(data);
    await saveToFirestore(data);
  };

  const handleLanguageChange    = async (lang: string) => { await i18n.changeLanguage(lang); try { await updateProfile({ language: lang }); flash('success', 'Language saved.'); } catch { flash('error', 'Failed.'); } };
  const toggleDyslexiaMode      = async () => { try { await updateProfile({ isDyslexiaMode: !isDyslexiaMode }); flash('success', 'Accessibility saved.'); } catch { flash('error', 'Failed.'); } };
  const handleBusinessTypeChange = async (type: string) => { localStorage.setItem('businessType', type); try { await updateProfile({ businessType: type }); flash('success', 'Business model saved.'); } catch { flash('error', 'Failed.'); } };
  const handleSave = async () => { setIsSaving(true); try { await updateProfile({ businessType, isDyslexiaMode, language: i18n.language }); flash('success', 'Settings saved successfully.'); } catch { flash('error', 'Failed to save settings.'); } finally { setIsSaving(false); } };

  const settingsTabs = [
    { id: 'profile',       label: t('profile_settings','Profile Settings'), icon: User },
    { id: 'notifications', label: t('notifications','Notifications'),        icon: Bell },
    { id: 'security',      label: t('security','Security & Privacy'),        icon: Shield },
    { id: 'language',      label: t('language','Language'),                  icon: Globe },
    { id: 'accessibility', label: t('accessibility','Accessibility'),        icon: Type },
    { id: 'help',          label: t('help','Help & Support'),                icon: HelpCircle },
  ];

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-high/50">
      <div className="p-2 rounded-xl bg-surface-container-highest text-primary shrink-0"><Icon className="w-4 h-4" /></div>
      <div className="min-w-0">
        <p className="text-xs text-on-surface-variant font-medium">{label}</p>
        <p className="text-sm font-bold text-on-surface truncate">{value || '—'}</p>
      </div>
    </div>
  );

  if (loadingProfile) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-8">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">{t('settings','Settings')}</h2>
          <p className="text-on-surface-variant text-base md:text-lg">{t('manage_preferences','Manage your preferences and settings.')}</p>
        </div>
        <button onClick={handleSave} disabled={isSaving}
          className="btn-primary flex items-center gap-2 shadow-xl shadow-primary/20 w-full md:w-auto justify-center disabled:opacity-60">
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving…' : t('save_changes','Save Changes')}
        </button>
      </section>

      <StatusBanner msg={statusMsg} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <section className="lg:col-span-1 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {settingsTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn(
                'whitespace-nowrap lg:whitespace-normal text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 shrink-0 lg:shrink',
                activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container-high'
              )}>
              <tab.icon className="w-5 h-5" />
              <span className="font-bold text-sm">{tab.label}</span>
              {activeTab !== tab.id && <ChevronRight className="hidden lg:block w-4 h-4 ml-auto opacity-50" />}
            </button>
          ))}
        </section>

        <section className="lg:col-span-3 space-y-8">

          {/* ── PROFILE ── */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="organic-card flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl bg-surface-container-highest flex items-center justify-center text-primary overflow-hidden border-2 border-primary/10">
                    {profile?.photoURL ? <img src={profile.photoURL} alt="avatar" className="w-full h-full object-cover" /> : <User className="w-16 h-16" />}
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 transition-all"><Camera className="w-4 h-4" /></button>
                </div>
                <div className="text-center md:text-left space-y-2">
                  <h3 className="text-2xl font-bold text-on-surface">{profile?.displayName || 'Profile'}</h3>
                  <p className="text-on-surface-variant font-medium capitalize">
                    {profile?.role || (businessType === 'contract' ? 'Senior Contractor' : 'Service Provider')}
                    {profile?.company ? ` • ${profile.company}` : ' • Mumbai, India'}
                  </p>
                  {memberSince && <p className="text-xs text-on-surface-variant">Member since {memberSince}</p>}
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">Verified Partner</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase">Premium Account</span>
                  </div>
                </div>
              </div>

              <div className="organic-card space-y-4">
                <h4 className="text-xl font-bold flex items-center gap-2"><BadgeCheck className="w-5 h-5 text-primary" /> Account Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoRow icon={User}      label="Full Name" value={profile?.displayName || ''} />
                  <InfoRow icon={Mail}      label="Email"     value={profile?.email || ''} />
                  <InfoRow icon={Phone}     label="Phone"     value={profile?.phone ? `+91 ${profile.phone}` : ''} />
                  <InfoRow icon={Building2} label="Company"   value={profile?.company || ''} />
                  <InfoRow icon={Briefcase} label="Role"      value={profile?.role || ''} />
                  <InfoRow icon={Globe}     label="Language"  value={profile?.language === 'hi' ? 'हिन्दी' : 'English'} />
                </div>
              </div>

              <div className="organic-card space-y-6">
                <h4 className="text-xl font-bold">Business Model</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { type: 'contract', icon: Briefcase, title: 'Contract Business', sub: 'Manage large scale projects and labor contracts.' },
                    { type: 'service',  icon: Users,     title: 'Service Business',  sub: 'Manage individual service requests and team members.' },
                  ].map(({ type, icon: Icon, title, sub }) => (
                    <button key={type} onClick={() => handleBusinessTypeChange(type)}
                      className={cn('p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4',
                        businessType === type ? 'border-primary bg-primary/5' : 'border-outline/10 hover:border-primary/50')}>
                      <div className="p-3 rounded-2xl bg-surface-container-highest text-primary"><Icon className="w-6 h-6" /></div>
                      <div><p className="font-bold text-on-surface">{title}</p><p className="text-xs text-on-surface-variant">{sub}</p></div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === 'notifications' && (
            <NotificationsTab profile={profile} flash={flash} />
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <SecurityTab profile={profile} flash={flash} />
          )}

          {/* ── LANGUAGE ── */}
          {activeTab === 'language' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="organic-card space-y-6">
              <h4 className="text-xl font-bold">{t('language','Language')}</h4>
              <p className="text-sm text-on-surface-variant">Currently set to: <strong>{profile?.language === 'hi' ? 'हिन्दी' : 'English'}</strong></p>
              <div className="space-y-4">
                {[{ code:'en', label:'English' }, { code:'hi', label:'हिन्दी (Hindi)' }, { code:'mr', label:'मराठी (Marathi)' }].map(({ code, label }) => (
                  <button key={code} onClick={() => handleLanguageChange(code)}
                    className={cn('w-full flex items-center justify-between p-4 rounded-2xl transition-all',
                      i18n.language === code ? 'bg-primary text-white' : 'bg-surface-container-high hover:bg-surface-container-highest')}>
                    <span className="font-bold">{label}</span>
                    {i18n.language === code && <ChevronRight className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── ACCESSIBILITY ── */}
          {activeTab === 'accessibility' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="organic-card space-y-6">
              <h4 className="text-xl font-bold">{t('accessibility','Accessibility')}</h4>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-surface-container-highest text-primary"><Type className="w-5 h-5" /></div>
                  <div>
                    <p className="font-bold text-on-surface">{t('dyslexia_friendly','Dyslexia Friendly')}</p>
                    <p className="text-xs text-on-surface-variant">Enhance readability with specialized fonts and spacing.</p>
                    <p className="text-xs text-primary font-medium mt-1">Currently: {isDyslexiaMode ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
                <Toggle on={isDyslexiaMode} onClick={toggleDyslexiaMode} />
              </div>
            </motion.div>
          )}

          {/* ── HELP ── */}
          {activeTab === 'help' && (
            <HelpTab profile={profile} flash={flash} />
          )}

        </section>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// NOTIFICATIONS TAB
// ═══════════════════════════════════════════════════════════════════
function NotificationsTab({ profile, flash }: { profile: UserProfile | null; flash: Function }) {
  const [prefs,    setPrefs]    = useState<NotificationPrefs>(DEFAULT_NOTIF);
  const [loading,  setLoading]  = useState(true);
  const [permBanner, setPermBanner] = useState('');

  const NOTIF_KEYS: { key: keyof NotificationPrefs; label: string; sub: string }[] = [
    { key: 'invoiceAlerts',      label: 'New Invoice Alerts',   sub: 'Get notified when a new invoice is created' },
    { key: 'paymentUpdates',     label: 'Payment Updates',       sub: 'Receive alerts when payments are received' },
    { key: 'teamActivity',       label: 'Team Activity',         sub: 'Stay updated on team actions and changes' },
    { key: 'systemAnnouncements',label: 'System Announcements',  sub: 'Important updates from ArthSetu' },
  ];

  // Load saved prefs from Firestore
  useEffect(() => {
    if (!profile?.uid) return;
    getDoc(doc(db, 'users', profile.uid))
      .then(snap => {
        if (snap.exists() && snap.data().notifications) {
          setPrefs({ ...DEFAULT_NOTIF, ...snap.data().notifications });
        }
      })
      .finally(() => setLoading(false));
  }, [profile?.uid]);

  // Check current browser permission on mount
  useEffect(() => {
    if (!('Notification' in window)) { setPermBanner('Your browser does not support push notifications.'); return; }
    if (Notification.permission === 'denied') setPermBanner('Notifications blocked in browser. Please enable them in site settings.');
    else if (Notification.permission === 'default') setPermBanner('');
    else setPermBanner('');
  }, []);

  const savePrefs = async (next: NotificationPrefs) => {
    if (!profile?.uid) return;
    await setDoc(doc(db, 'users', profile.uid), { notifications: next }, { merge: true });
  };

  const handleToggle = async (key: keyof NotificationPrefs) => {
    if (key === 'browserPermissionGranted') return; // handled separately

    const wasOff = !prefs[key];

    // If turning ON any notification for the first time, request browser permission
    if (wasOff && !prefs.browserPermissionGranted) {
      if (!('Notification' in window)) {
        flash('error', 'Your browser does not support notifications.');
        return;
      }
      if (Notification.permission === 'denied') {
        flash('error', 'Notifications are blocked. Please enable them in your browser site settings.');
        return;
      }
      if (Notification.permission === 'default') {
        const result = await Notification.requestPermission();
        if (result !== 'granted') {
          flash('error', 'Permission denied. Notifications will not be sent.');
          return;
        }
        // Permission granted — record it
        const next = { ...prefs, browserPermissionGranted: true, [key]: true };
        setPrefs(next);
        await savePrefs(next);
        flash('success', 'Permission granted & preference saved.');
        // Fire a test notification
        new Notification('ArthSetu', { body: 'Notifications enabled successfully!', icon: '/favicon.ico' });
        return;
      }
    }

    const next = { ...prefs, [key]: !prefs[key as keyof NotificationPrefs] };
    setPrefs(next);
    try {
      await savePrefs(next);
      flash('success', `"${NOTIF_KEYS.find(n => n.key === key)?.label}" ${next[key] ? 'enabled' : 'disabled'}.`);
    } catch {
      flash('error', 'Failed to save preference.');
      setPrefs(prefs); // rollback
    }
  };

  if (loading) return <div className="organic-card flex items-center justify-center h-40"><div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="organic-card space-y-6">
      <div>
        <h4 className="text-xl font-bold">Notifications</h4>
        <p className="text-sm text-on-surface-variant mt-1">Preferences for <strong>{profile?.email}</strong>. All off by default.</p>
      </div>

      {permBanner && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />{permBanner}
        </div>
      )}

      {/* Browser permission status */}
      <div className="p-4 rounded-2xl bg-surface-container-high/50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-surface-container-highest text-primary"><Bell className="w-4 h-4" /></div>
          <div>
            <p className="font-bold text-sm text-on-surface">Browser Push Permission</p>
            <p className="text-xs text-on-surface-variant">Required to send desktop notifications</p>
          </div>
        </div>
        <span className={cn('text-xs font-bold px-3 py-1 rounded-full',
          Notification.permission === 'granted' ? 'bg-green-100 text-green-700' :
          Notification.permission === 'denied'  ? 'bg-red-100 text-red-600' :
                                                   'bg-amber-100 text-amber-700')}>
          {Notification.permission === 'granted' ? 'Granted' : Notification.permission === 'denied' ? 'Blocked' : 'Not asked'}
        </span>
      </div>

      <div className="space-y-3">
        {NOTIF_KEYS.map(({ key, label, sub }) => (
          <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/50 gap-4">
            <div>
              <p className="font-bold text-on-surface text-sm">{label}</p>
              <p className="text-xs text-on-surface-variant">{sub}</p>
            </div>
            <Toggle on={Boolean(prefs[key])} onClick={() => handleToggle(key)} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SECURITY TAB
// ═══════════════════════════════════════════════════════════════════
function SecurityTab({ profile, flash }: { profile: UserProfile | null; flash: Function }) {
  // Modal states
  const [modal, setModal] = useState<'password' | 'sessions' | 'delete' | null>(null);

  // Change password state
  const [curPass,    setCurPass]    = useState('');
  const [newPass,    setNewPass]    = useState('');
  const [confPass,   setConfPass]   = useState('');
  const [showCur,    setShowCur]    = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Sessions state
  const [sessions,      setSessions]      = useState<any[]>([]);
  const [sessLoading,   setSessLoading]   = useState(false);

  // Delete account state
  const [delPass,    setDelPass]    = useState('');
  const [delLoading, setDelLoading] = useState(false);

  const closeModal = () => {
    setModal(null);
    setCurPass(''); setNewPass(''); setConfPass('');
    setDelPass(''); setSessions([]);
  };

  // ── Change Password ─────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!fbAuth.currentUser || !fbAuth.currentUser.email) { flash('error', 'Not logged in.'); return; }
    if (newPass.length < 6) { flash('error', 'New password must be at least 6 characters.'); return; }
    if (newPass !== confPass) { flash('error', 'Passwords do not match.'); return; }
    setPwdLoading(true);
    try {
      const cred = EmailAuthProvider.credential(fbAuth.currentUser.email, curPass);
      await reauthenticateWithCredential(fbAuth.currentUser, cred);
      await updatePassword(fbAuth.currentUser, newPass);
      // Log the change in Firestore
      await addDoc(collection(db, 'users', fbAuth.currentUser.uid, 'securityLogs'), {
        event: 'password_changed', timestamp: serverTimestamp(),
      });
      flash('success', 'Password changed successfully.');
      closeModal();
    } catch (e: any) {
      const map: Record<string, string> = {
        'auth/wrong-password':       'Current password is incorrect.',
        'auth/invalid-credential':   'Current password is incorrect.',
        'auth/too-many-requests':    'Too many attempts. Try again later.',
        'auth/weak-password':        'New password is too weak.',
      };
      flash('error', map[e.code] || 'Failed to change password.');
    } finally { setPwdLoading(false); }
  };

  // ── Send Reset Email ────────────────────────────────────────
  const handleSendReset = async () => {
    if (!fbAuth.currentUser?.email) return;
    try {
      await sendPasswordResetEmail(fbAuth, fbAuth.currentUser.email);
      flash('success', `Reset link sent to ${fbAuth.currentUser.email}`);
    } catch { flash('error', 'Failed to send reset email.'); }
  };

  // ── Load Sessions ───────────────────────────────────────────
  const loadSessions = async () => {
    if (!profile?.uid) return;
    setSessLoading(true);
    try {
      const q     = query(collection(db, 'users', profile.uid, 'sessions'), orderBy('lastActive', 'desc'));
      const snaps = await getDocs(q);
      if (snaps.empty) {
        // Create a record for current session if none exist
        await addDoc(collection(db, 'users', profile.uid, 'sessions'), {
          device:     navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser',
          browser:    navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Browser',
          os:         navigator.platform || 'Unknown OS',
          lastActive: serverTimestamp(),
          isCurrent:  true,
        });
        const snaps2 = await getDocs(q);
        setSessions(snaps2.docs.map(d => ({ id: d.id, ...d.data() })));
      } else {
        setSessions(snaps.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (e) { console.error(e); flash('error', 'Failed to load sessions.'); }
    finally { setSessLoading(false); }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!profile?.uid) return;
    try {
      await deleteDoc(doc(db, 'users', profile.uid, 'sessions', sessionId));
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      flash('success', 'Session revoked.');
    } catch { flash('error', 'Failed to revoke session.'); }
  };

  // ── Delete Account ──────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (!fbAuth.currentUser || !fbAuth.currentUser.email) return;
    setDelLoading(true);
    try {
      const cred = EmailAuthProvider.credential(fbAuth.currentUser.email, delPass);
      await reauthenticateWithCredential(fbAuth.currentUser, cred);
      // Delete all Firestore data first
      await setDoc(doc(db, 'users', fbAuth.currentUser.uid), { deleted: true, deletedAt: serverTimestamp() }, { merge: true });
      await deleteUser(fbAuth.currentUser);
      flash('success', 'Account deleted.');
      closeModal();
    } catch (e: any) {
      const map: Record<string, string> = {
        'auth/wrong-password':     'Incorrect password.',
        'auth/invalid-credential': 'Incorrect password.',
        'auth/too-many-requests':  'Too many attempts.',
      };
      flash('error', map[e.code] || 'Failed to delete account.');
    } finally { setDelLoading(false); }
  };

  const InputField = ({ label, value, onChange, type='text', show, onToggleShow, placeholder='' }:
    { label:string; value:string; onChange:(v:string)=>void; type?:string; show?:boolean; onToggleShow?:()=>void; placeholder?:string }) => (
    <div>
      <label className="block text-xs font-bold text-on-surface-variant mb-1">{label}</label>
      <div className={cn('flex items-center border-2 rounded-2xl px-4 transition-all', 'border-outline/20 focus-within:border-primary bg-surface-container-high/50')}>
        <input value={value} onChange={e => onChange(e.target.value)}
          type={show !== undefined ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          className="flex-1 h-11 bg-transparent text-sm font-medium text-on-surface outline-none placeholder:text-on-surface-variant/50"
        />
        {onToggleShow && (
          <button onClick={onToggleShow} className="text-on-surface-variant hover:text-on-surface">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="organic-card space-y-6">
      <h4 className="text-xl font-bold">Security & Privacy</h4>

      {/* Logged in as */}
      <div className="p-4 rounded-2xl bg-surface-container-high/50 space-y-1">
        <p className="text-xs text-on-surface-variant font-medium">Logged in as</p>
        <p className="font-bold text-on-surface">{profile?.email}</p>
        <p className="text-xs text-on-surface-variant font-mono">UID: {profile?.uid}</p>
      </div>

      <div className="space-y-3">
        {/* Change Password */}
        <button onClick={() => setModal('password')}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/50 hover:bg-surface-container-highest transition-all text-left">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-surface-container-highest text-primary"><Lock className="w-4 h-4" /></div>
            <div>
              <p className="font-bold text-sm text-on-surface">Change Password</p>
              <p className="text-xs text-on-surface-variant">Update your login credentials securely</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50" />
        </button>

        {/* Send reset email */}
        <button onClick={handleSendReset}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/50 hover:bg-surface-container-highest transition-all text-left">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-surface-container-highest text-primary"><Mail className="w-4 h-4" /></div>
            <div>
              <p className="font-bold text-sm text-on-surface">Send Password Reset Email</p>
              <p className="text-xs text-on-surface-variant">Receive a reset link at {profile?.email}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50" />
        </button>

        {/* Active Sessions */}
        <button onClick={() => { setModal('sessions'); loadSessions(); }}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/50 hover:bg-surface-container-highest transition-all text-left">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-surface-container-highest text-primary"><MonitorSmartphone className="w-4 h-4" /></div>
            <div>
              <p className="font-bold text-sm text-on-surface">Active Sessions</p>
              <p className="text-xs text-on-surface-variant">View and revoke devices logged into your account</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50" />
        </button>

        {/* Sign out everywhere */}
        <button onClick={async () => { await signOut(fbAuth); flash('info', 'Signed out successfully.'); }}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/50 hover:bg-surface-container-highest transition-all text-left">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-surface-container-highest text-primary"><LogOut className="w-4 h-4" /></div>
            <div>
              <p className="font-bold text-sm text-on-surface">Sign Out</p>
              <p className="text-xs text-on-surface-variant">Log out of your current session</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50" />
        </button>

        {/* Delete Account */}
        <button onClick={() => setModal('delete')}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 transition-all text-left">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-red-100 text-red-600"><Trash2 className="w-4 h-4" /></div>
            <div>
              <p className="font-bold text-sm">Delete Account</p>
              <p className="text-xs text-red-400">Permanently remove your ArthSetu account and all data</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50" />
        </button>
      </div>

      {/* ── MODALS ── */}

      {/* Change Password Modal */}
      <Modal open={modal === 'password'} onClose={closeModal} title="Change Password">
        <div className="space-y-4">
          <InputField label="Current Password" value={curPass} onChange={setCurPass} show={showCur} onToggleShow={() => setShowCur(p => !p)} placeholder="Enter current password" />
          <InputField label="New Password"     value={newPass} onChange={setNewPass} show={showNew} onToggleShow={() => setShowNew(p => !p)} placeholder="Min. 6 characters" />
          <InputField label="Confirm New Password" value={confPass} onChange={setConfPass} type="password" placeholder="Re-enter new password" />
          <button onClick={handleChangePassword} disabled={pwdLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
            {pwdLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
            {pwdLoading ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </Modal>

      {/* Sessions Modal */}
      <Modal open={modal === 'sessions'} onClose={closeModal} title="Active Sessions">
        {sessLoading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-6">No sessions found.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/50 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-surface-container-highest text-primary">
                    {s.device?.toLowerCase().includes('mobile') ? <Smartphone className="w-4 h-4" /> : <MonitorSmartphone className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-on-surface">{s.device || 'Unknown device'}</p>
                    <p className="text-xs text-on-surface-variant">{s.browser} · {s.os}</p>
                    {s.isCurrent && <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Current</span>}
                  </div>
                </div>
                {!s.isCurrent && (
                  <button onClick={() => handleRevokeSession(s.id)}
                    className="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-1 rounded-xl bg-red-50 hover:bg-red-100 transition-all">
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete Account Modal */}
      <Modal open={modal === 'delete'} onClose={closeModal} title="Delete Account">
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>This action is <strong>permanent</strong>. All your data, invoices, and history will be erased and cannot be recovered.</span>
          </div>
          <InputField label="Confirm your password to proceed" value={delPass} onChange={setDelPass} type="password" placeholder="Enter your password" />
          <button onClick={handleDeleteAccount} disabled={delLoading}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all disabled:opacity-60">
            {delLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {delLoading ? 'Deleting…' : 'Yes, Delete My Account'}
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HELP & SUPPORT TAB
// ═══════════════════════════════════════════════════════════════════
const FAQS = [
  { q: 'How do I create an invoice?',               a: 'Go to Projects → select a project → click "New Invoice". Fill in client details and line items, then tap Send.' },
  { q: 'Can I add multiple team members?',           a: 'Yes! Go to the Team tab and click "Invite Member". They will receive an email invitation to join your workspace.' },
  { q: 'How do I track payments?',                  a: 'The Transactions tab shows all incoming and outgoing payments with real-time status updates from your linked accounts.' },
  { q: 'Is my financial data secure?',              a: 'Absolutely. All data is encrypted in transit and at rest using Firebase Security Rules and industry-standard TLS.' },
  { q: 'How do I switch between Contract and Service mode?', a: 'Go to Settings → Profile Settings → Business Model and tap the mode you want. Changes take effect immediately.' },
];

function HelpTab({ profile, flash }: { profile: UserProfile | null; flash: Function }) {
  const [section,       setSection]       = useState<'home'|'faq'|'contact'|'bug'|'feature'>('home');
  const [openFaq,       setOpenFaq]       = useState<number | null>(null);

  // Contact support
  const [contactMsg,    setContactMsg]    = useState('');
  const [contactSub,    setContactSub]    = useState('General Inquiry');
  const [contactLoad,   setContactLoad]   = useState(false);

  // Bug report
  const [bugTitle,      setBugTitle]      = useState('');
  const [bugDesc,       setBugDesc]       = useState('');
  const [bugLoad,       setBugLoad]       = useState(false);

  // Feature request
  const [featTitle,     setFeatTitle]     = useState('');
  const [featDesc,      setFeatDesc]      = useState('');
  const [featLoad,      setFeatLoad]      = useState(false);

  const submitToFirestore = async (col: string, data: Record<string, any>) => {
    await addDoc(collection(db, col), {
      ...data,
      userId:      profile?.uid        || 'anonymous',
      userName:    profile?.displayName|| '',
      userEmail:   profile?.email      || '',
      timestamp:   serverTimestamp(),
      status:      'open',
    });
  };

  const handleContact = async () => {
    if (!contactMsg.trim()) { flash('error', 'Please enter a message.'); return; }
    setContactLoad(true);
    try {
      await submitToFirestore('supportTickets', { subject: contactSub, message: contactMsg, type: 'contact' });
      flash('success', 'Support ticket submitted. We\'ll respond within 24 hours.');
      setContactMsg(''); setSection('home');
    } catch { flash('error', 'Failed to submit ticket.'); }
    finally { setContactLoad(false); }
  };

  const handleBug = async () => {
    if (!bugTitle.trim() || !bugDesc.trim()) { flash('error', 'Please fill in all fields.'); return; }
    setBugLoad(true);
    try {
      await submitToFirestore('bugReports', { title: bugTitle, description: bugDesc, type: 'bug', userAgent: navigator.userAgent });
      flash('success', 'Bug reported. Thank you for helping us improve!');
      setBugTitle(''); setBugDesc(''); setSection('home');
    } catch { flash('error', 'Failed to submit bug report.'); }
    finally { setBugLoad(false); }
  };

  const handleFeature = async () => {
    if (!featTitle.trim() || !featDesc.trim()) { flash('error', 'Please fill in all fields.'); return; }
    setFeatLoad(true);
    try {
      await submitToFirestore('featureRequests', { title: featTitle, description: featDesc, type: 'feature' });
      flash('success', 'Feature request submitted. We love your ideas!');
      setFeatTitle(''); setFeatDesc(''); setSection('home');
    } catch { flash('error', 'Failed to submit feature request.'); }
    finally { setFeatLoad(false); }
  };

  const TextArea = ({ label, value, onChange, placeholder }: { label:string; value:string; onChange:(v:string)=>void; placeholder?:string }) => (
    <div>
      <label className="block text-xs font-bold text-on-surface-variant mb-1">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4}
        className="w-full border-2 border-outline/20 focus:border-primary rounded-2xl px-4 py-3 text-sm text-on-surface bg-surface-container-high/50 outline-none resize-none transition-all" />
    </div>
  );

  const TextField = ({ label, value, onChange, placeholder }: { label:string; value:string; onChange:(v:string)=>void; placeholder?:string }) => (
    <div>
      <label className="block text-xs font-bold text-on-surface-variant mb-1">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border-2 border-outline/20 focus:border-primary rounded-2xl px-4 h-11 text-sm text-on-surface bg-surface-container-high/50 outline-none transition-all" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="organic-card space-y-6">

      {/* Back button when in a sub-section */}
      {section !== 'home' && (
        <button onClick={() => setSection('home')} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface font-medium">
          ← Back to Help
        </button>
      )}

      {/* ── HOME ── */}
      {section === 'home' && (
        <>
          <div>
            <h4 className="text-xl font-bold">Help & Support</h4>
            <p className="text-sm text-on-surface-variant mt-1">
              Hi <strong>{profile?.displayName?.split(' ')[0] || 'there'}</strong>, how can we help you today?
            </p>
          </div>
          <div className="space-y-3">
            {[
              { id: 'faq',     icon: HelpCircle,    label: 'FAQs',              sub: 'Browse frequently asked questions' },
              { id: 'contact', icon: MessageSquare,  label: 'Contact Support',   sub: 'Submit a ticket — we reply within 24 hours' },
              { id: 'bug',     icon: Bug,            label: 'Report a Bug',      sub: 'Help us improve ArthSetu' },
              { id: 'feature', icon: Lightbulb,      label: 'Feature Requests',  sub: 'Suggest a new feature you would love' },
            ].map(({ id, icon: Icon, label, sub }) => (
              <button key={id} onClick={() => setSection(id as any)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/50 hover:bg-surface-container-highest transition-all text-left">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-surface-container-highest text-primary"><Icon className="w-4 h-4" /></div>
                  <div>
                    <p className="font-bold text-sm text-on-surface">{label}</p>
                    <p className="text-xs text-on-surface-variant">{sub}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── FAQs ── */}
      {section === 'faq' && (
        <div className="space-y-3">
          <h4 className="text-lg font-bold">Frequently Asked Questions</h4>
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-2xl border border-outline/10 overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 bg-surface-container-high/50 hover:bg-surface-container-highest text-left transition-all">
                <p className="font-bold text-sm text-on-surface pr-4">{faq.q}</p>
                <ChevronRight className={cn('w-4 h-4 shrink-0 transition-transform text-on-surface-variant', openFaq === i && 'rotate-90')} />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <p className="px-4 pb-4 pt-2 text-sm text-on-surface-variant">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* ── CONTACT SUPPORT ── */}
      {section === 'contact' && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold">Contact Support</h4>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Subject</label>
            <select value={contactSub} onChange={e => setContactSub(e.target.value)}
              className="w-full border-2 border-outline/20 focus:border-primary rounded-2xl px-4 h-11 text-sm text-on-surface bg-surface-container-high/50 outline-none">
              {['General Inquiry','Billing Issue','Technical Problem','Account Issue','Other'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <TextArea label="Your Message" value={contactMsg} onChange={setContactMsg} placeholder="Describe your issue in detail…" />
          <div className="p-3 rounded-2xl bg-surface-container-high/50 text-xs text-on-surface-variant">
            📧 Submitting as <strong>{profile?.email}</strong>
          </div>
          <button onClick={handleContact} disabled={contactLoad}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
            {contactLoad ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            {contactLoad ? 'Submitting…' : 'Submit Ticket'}
          </button>
        </div>
      )}

      {/* ── BUG REPORT ── */}
      {section === 'bug' && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold">Report a Bug</h4>
          <TextField label="Bug Title" value={bugTitle} onChange={setBugTitle} placeholder="Short title describing the bug" />
          <TextArea label="Description" value={bugDesc} onChange={setBugDesc} placeholder="Steps to reproduce, what you expected vs what happened…" />
          <div className="p-3 rounded-2xl bg-surface-container-high/50 text-xs text-on-surface-variant font-mono break-all">
            🖥 {navigator.userAgent}
          </div>
          <button onClick={handleBug} disabled={bugLoad}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
            {bugLoad ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Bug className="w-4 h-4" />}
            {bugLoad ? 'Reporting…' : 'Submit Bug Report'}
          </button>
        </div>
      )}

      {/* ── FEATURE REQUEST ── */}
      {section === 'feature' && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold">Feature Request</h4>
          <TextField label="Feature Title" value={featTitle} onChange={setFeatTitle} placeholder="Name your idea in a few words" />
          <TextArea label="Description" value={featDesc} onChange={setFeatDesc} placeholder="Describe the feature and why it would help you…" />
          <button onClick={handleFeature} disabled={featLoad}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
            {featLoad ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lightbulb className="w-4 h-4" />}
            {featLoad ? 'Submitting…' : 'Submit Feature Request'}
          </button>
        </div>
      )}

    </motion.div>
  );
}