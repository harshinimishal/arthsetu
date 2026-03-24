import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase.js';

interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  businessType: string;
  phone?: string;
  company?: string;
  role?: string;
  isDyslexiaMode: boolean;
  language: string;
  createdAt: string;
}

interface SignupInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  company: string;
  role: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (input: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getAuthErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String((error as { code?: string }).code ?? '');
    if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
    if (code === 'auth/invalid-credential') return 'Invalid email or password.';
    if (code === 'auth/user-not-found') return 'Account not found.';
    if (code === 'auth/wrong-password') return 'Invalid email or password.';
    if (code === 'auth/email-already-in-use') return 'Email is already registered.';
    if (code === 'auth/weak-password') return 'Password must be at least 6 characters.';
    if (code === 'auth/popup-closed-by-user') return 'Google sign-in popup was closed.';
    if (code === 'permission-denied') return 'Signed in, but Firestore denied access to users profile. Please update Firestore rules.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Authentication failed. Please try again.';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const buildProfile = (firebaseUser: FirebaseUser, overrides?: Partial<UserProfile>): UserProfile => ({
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName,
    email: firebaseUser.email,
    photoURL: firebaseUser.photoURL,
    businessType: localStorage.getItem('businessType') || 'contract',
    isDyslexiaMode: document.body.classList.contains('dyslexia-mode'),
    language: 'en',
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  const ensureProfile = async (firebaseUser: FirebaseUser, overrides?: Partial<UserProfile>) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const current = userDoc.data() as UserProfile;
      const merged = { ...current, ...overrides };
      if (overrides && Object.keys(overrides).length > 0) {
        await setDoc(userDocRef, merged, { merge: true });
      }
      setProfile(merged);
      return;
    }

    const newProfile = buildProfile(firebaseUser, overrides);
    await setDoc(userDocRef, newProfile);
    setProfile(newProfile);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      try {
        if (firebaseUser) {
          await ensureProfile(firebaseUser);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Profile sync failed:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email login failed:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const signupWithEmail = async ({
    name,
    email,
    password,
    phone,
    company,
    role,
  }: SignupInput) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      await updateFirebaseProfile(credential.user, {
        displayName: name,
      });

      const businessType = role === 'service-partner' ? 'service' : 'contract';
      localStorage.setItem('businessType', businessType);

      await ensureProfile(credential.user, {
        displayName: name,
        email,
        phone,
        company,
        role,
        businessType,
      });
    } catch (error) {
      console.error('Signup failed:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { ...profile, ...updates }, { merge: true });
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        loginWithEmail,
        signupWithEmail,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
