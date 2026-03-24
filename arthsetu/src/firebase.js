import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAJS3Ab7lq5RkyOTmrkjvyW7RMHCTy39Oo",
  authDomain: "arthsetu-21496.firebaseapp.com",
  projectId: "arthsetu-21496",
  storageBucket: "arthsetu-21496.firebasestorage.app",
  messagingSenderId: "1017304784921",
  appId: "1:1017304784921:web:72eb5155aa294010000a88",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();