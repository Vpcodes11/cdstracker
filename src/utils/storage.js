import { auth, db } from '../firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';

export const STORAGE_KEYS = {
  PRACTICE: 'practice', // collection names for firebase
  MOCKS: 'mocks',
  VOCAB: 'vocab',
  SETTINGS: 'settings',
  REVISIONS: 'revisions'
};

// Helper to get current user
const getUser = () => auth.currentUser;

export const getStorageData = async (key) => {
  const user = getUser();
  if (user) {
    try {
      const q = query(collection(db, `users/${user.uid}/${key}`));
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      // Sort in-memory to match previous behavior if needed, generally Firestore can sort too
      // For now, simple fetch
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  } else {
    // Fallback to localStorage
    // Map Firestore collection keys to localStorage keys
    const localKey = getLocalKey(key);
    const data = localStorage.getItem(localKey);
    return data ? JSON.parse(data) : [];
  }
};

export const getPendingRevisions = async () => {
  const revisions = await getStorageData(STORAGE_KEYS.REVISIONS);
  return revisions.filter(r => r.status !== 'mastered');
};

export const saveStorageData = async (key, data) => {
  // This function was used to overwrite the whole array in localStorage.
  // In Firestore, we shouldn't really use this unless we are migrating or bulk saving.
  // For compatibility, if user is guest, we use localStorage.
  const user = getUser();
  if (!user) {
    const localKey = `cds_${key}`;
    localStorage.setItem(localKey, JSON.stringify(data));
  } else {
    console.warn("saveStorageData not implemented for Firestore to avoid overwriting entire collections.");
  }
};

export const addEntry = async (key, entry) => {
  const user = getUser();
  const newEntry = { ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() };

  if (user) {
    try {
      await setDoc(doc(db, `users/${user.uid}/${key}`, newEntry.id), newEntry);
      return newEntry;
    } catch (e) {
      console.error("Error adding document: ", e);
      throw e;
    }
  } else {
    const localKey = `cds_${key}`; // maintain backward compatibility with old keys? "cds_practice_sessions" etc
    // Actually, old keys were: cds_practice_sessions, cds_mock_tests...
    // My STORAGE_KEYS above are 'practice', 'mocks'.
    // I should map them correctly.
    const realLocalKey = getLocalKey(key);
    const data = JSON.parse(localStorage.getItem(realLocalKey) || '[]');
    data.unshift(newEntry);
    localStorage.setItem(realLocalKey, JSON.stringify(data));
    return newEntry;
  }
};

export const updateEntry = async (key, id, updates) => {
  const user = getUser();
  if (user) {
    const docRef = doc(db, `users/${user.uid}/${key}`, id);
    await updateDoc(docRef, updates);
  } else {
    const realLocalKey = getLocalKey(key);
    const data = JSON.parse(localStorage.getItem(realLocalKey) || '[]');
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
      localStorage.setItem(realLocalKey, JSON.stringify(data));
    }
  }
};

export const deleteEntry = async (key, id) => {
  const user = getUser();
  if (user) {
    await deleteDoc(doc(db, `users/${user.uid}/${key}`, id));
  } else {
    const realLocalKey = getLocalKey(key);
    const data = JSON.parse(localStorage.getItem(realLocalKey) || '[]');
    const filtered = data.filter(item => item.id !== id);
    localStorage.setItem(realLocalKey, JSON.stringify(filtered));
  }
};

// Helper for legacy keys
function getLocalKey(key) {
  if (key === STORAGE_KEYS.PRACTICE) return 'cds_practice_sessions';
  if (key === STORAGE_KEYS.MOCKS) return 'cds_mock_tests';
  if (key === STORAGE_KEYS.VOCAB) return 'cds_vocabulary';
  if (key === STORAGE_KEYS.SETTINGS) return 'cds_settings';
  if (key === STORAGE_KEYS.REVISIONS) return 'cds_revisions';
  return `cds_${key}`;
}
