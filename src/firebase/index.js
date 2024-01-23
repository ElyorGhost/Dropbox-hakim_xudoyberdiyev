import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getFirestore, serverTimestamp, collection } from 'firebase/firestore';

const firebaseApp = initializeApp({
  apiKey: "AIzaSyC2YFA-tC_hO1KW3qGWTRxTXAsuRtxkRP4",
  authDomain: "dropbox-e0021.firebaseapp.com",
  projectId: "dropbox-e0021",
  storageBucket: "dropbox-e0021.appspot.com",
  messagingSenderId: "335003443348",
  appId: "1:335003443348:web:888af66797f2f748619481",
  measurementId: "G-XK9K0BMS5P"
});

const fs = getFirestore(firebaseApp);

export const db = {
  folders: collection(fs, 'folders'),
  files: collection(fs, 'files'),
  createdAt: serverTimestamp,
  formatDoc: doc => {
    return {
      id: doc.id,
      ...doc.data()
    }
  }
}

export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);
export { firebaseApp };