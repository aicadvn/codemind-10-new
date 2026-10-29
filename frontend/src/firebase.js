import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  serverTimestamp 
} from 'firebase/firestore';

// Đọc cấu hình từ biến môi trường Vite (.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Kiểm tra xem Firebase đã được điền đủ thông tin cấu hình hay chưa
export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey !== '' && 
    firebaseConfig.projectId && 
    firebaseConfig.projectId !== ''
  );
};

// Khởi tạo Firebase App an toàn (Singleton pattern)
let app = null;
let auth = null;
let googleProvider = null;
let db = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    db = getFirestore(app);
  } catch (err) {
    console.warn('Cảnh báo: Không thể khởi tạo Firebase SDK:', err);
  }
} else {
  console.info('ℹ️ CodeMind 10: Chưa cấu hình VITE_FIREBASE_API_KEY trong .env. Ứng dụng sẽ hoạt động ở chế độ dự phòng.');
}

export { 
  app, 
  auth, 
  googleProvider, 
  db, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  collection,
  serverTimestamp
};
