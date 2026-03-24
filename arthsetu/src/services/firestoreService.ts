import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  setDoc,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db, auth } from '../firebase.js';

type OperationType = 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('Firestore Error', {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    userId: auth.currentUser?.uid,
  });
}

// Generic CRUD operations with error handling

export async function getDocument<T>(path: string, id: string): Promise<T | null> {
  try {
    const docRef = doc(db, path, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, 'get', `${path}/${id}`);
    return null;
  }
}

export async function getDocuments<T>(path: string, constraints: QueryConstraint[] = []): Promise<T[]> {
  try {
    const colRef = collection(db, path);
    const q = query(colRef, ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    handleFirestoreError(error, 'list', path);
    return [];
  }
}

export async function createDocument<T extends DocumentData>(path: string, data: T, id?: string): Promise<string> {
  try {
    const dataWithOwner = {
      ...data,
      ownerUid: auth.currentUser?.uid,
      createdAt: new Date().toISOString(),
    };

    if (id) {
      await setDoc(doc(db, path, id), dataWithOwner);
      return id;
    } else {
      const docRef = await addDoc(collection(db, path), dataWithOwner);
      return docRef.id;
    }
  } catch (error) {
    handleFirestoreError(error, 'create', path);
    return '';
  }
}

export async function updateDocument(path: string, id: string, data: Partial<DocumentData>): Promise<void> {
  try {
    const docRef = doc(db, path, id);
    await updateDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, 'update', `${path}/${id}`);
  }
}

export async function removeDocument(path: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, path, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete', `${path}/${id}`);
  }
}

// Real-time listener helper
export function subscribeToDocuments<T>(
  path: string, 
  constraints: QueryConstraint[], 
  callback: (data: T[]) => void
) {
  const colRef = collection(db, path);
  const q = query(colRef, ...constraints);
  
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    callback(data);
  }, (error) => {
    handleFirestoreError(error, 'list', path);
  });
}
