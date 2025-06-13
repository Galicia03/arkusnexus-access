// lib/userData.ts
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export const getUserData = async (uid: string) => {
  const docRef = doc(db, 'users', uid);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return snap.data();
  } else {
    return null;
  }
};
