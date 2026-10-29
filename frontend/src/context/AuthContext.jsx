import { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  db, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  isFirebaseConfigured,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState([]);

  // Lắng nghe trạng thái đăng nhập Firebase hoặc SessionStorage
  useEffect(() => {
    // 1. Kiểm tra nếu đã đăng nhập bằng Passcode trước đó
    const isPasscodeAuth = sessionStorage.getItem('codemind_auth') === 'true';
    const isPasscodeMode = sessionStorage.getItem('codemind_auth_type') === 'passcode';

    if (isPasscodeAuth && isPasscodeMode) {
      setCurrentUser({
        uid: 'passcode_student',
        displayName: 'Học sinh lớp 10',
        email: 'Phòng máy trường',
        isPasscode: true,
        photoURL: null
      });
      setLoading(false);
      return;
    }

    // 2. Nếu có cấu hình Firebase, lắng nghe trạng thái Firebase Auth
    if (isFirebaseConfigured() && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setCurrentUser(user);
          sessionStorage.setItem('codemind_auth', 'true');
          sessionStorage.setItem('codemind_auth_type', 'google');
          
          // Tự động lưu / cập nhật profile người dùng lên Firestore
          if (db) {
            try {
              const userRef = doc(db, 'users', user.uid);
              await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'Học sinh THPT',
                photoURL: user.photoURL,
                lastLogin: serverTimestamp()
              }, { merge: true });

              // Tải danh sách bài đã hoàn thành
              const docSnap = await getDoc(userRef);
              if (docSnap.exists() && docSnap.data().completedLessons) {
                setCompletedLessons(docSnap.data().completedLessons);
              }
            } catch (err) {
              console.warn('Lỗi đồng bộ hồ sơ lên Firestore:', err);
            }
          }
        } else {
          // Chưa đăng nhập Google
          if (!isPasscodeAuth) {
            setCurrentUser(null);
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  // Đăng nhập bằng Google
  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured() || !auth || !googleProvider) {
      throw new Error('Hệ thống Firebase chưa được cấu hình các biến môi trường VITE_FIREBASE_*. Vui lòng liên hệ quản trị viên hoặc dùng mã Passcode.');
    }

    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  // Đăng nhập bằng Passcode lớp học (Chế độ dự phòng)
  const loginWithPasscode = async (passcode) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const res = await fetch(`${backendUrl}/api/verify-passcode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: passcode.trim() })
    });
    const data = await res.json();
    
    if (data.success) {
      sessionStorage.setItem('codemind_auth', 'true');
      sessionStorage.setItem('codemind_auth_type', 'passcode');
      setCurrentUser({
        uid: 'passcode_student',
        displayName: 'Học sinh lớp 10',
        email: 'Tài khoản Lớp học',
        isPasscode: true,
        photoURL: null
      });
      return true;
    }
    return false;
  };

  // Đăng xuất an toàn (dùng chung máy phòng thực hành)
  const logout = async () => {
    try {
      if (auth && isFirebaseConfigured()) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('Lỗi khi đăng xuất Firebase:', err);
    } finally {
      sessionStorage.removeItem('codemind_auth');
      sessionStorage.removeItem('codemind_auth_type');
      setCurrentUser(null);
      setCompletedLessons([]);
    }
  };

  // Đánh dấu hoàn thành bài học
  const toggleCompleteLesson = async (lessonId) => {
    let updated;
    if (completedLessons.includes(lessonId)) {
      updated = completedLessons.filter(id => id !== lessonId);
    } else {
      updated = [...completedLessons, lessonId];
    }
    setCompletedLessons(updated);

    // Lưu lên Firestore nếu đang dùng Google Account
    if (currentUser && !currentUser.isPasscode && db) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, { completedLessons: updated }, { merge: true });
      } catch (e) {
        console.warn('Không thể lưu tiến trình lên mây:', e);
      }
    }
  };

  // Lưu mã code bài học lên Firestore
  const saveLessonCodeToCloud = async (lessonId, code) => {
    if (!currentUser || currentUser.isPasscode || !db) return false;
    try {
      const codeRef = doc(db, 'users', currentUser.uid, 'codeSnippets', `lesson_${lessonId}`);
      await setDoc(codeRef, {
        lessonId,
        code,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (e) {
      console.warn('Lỗi lưu code lên mây:', e);
      return false;
    }
  };

  // Tải mã code bài học từ Firestore
  const loadLessonCodeFromCloud = async (lessonId) => {
    if (!currentUser || currentUser.isPasscode || !db) return null;
    try {
      const codeRef = doc(db, 'users', currentUser.uid, 'codeSnippets', `lesson_${lessonId}`);
      const snap = await getDoc(codeRef);
      if (snap.exists() && snap.data()?.code) {
        return snap.data().code;
      }
      return null;
    } catch (e) {
      console.warn('Lỗi tải code từ mây:', e);
      return null;
    }
  };

  const value = {
    currentUser,
    loading,
    completedLessons,
    loginWithGoogle,
    loginWithPasscode,
    logout,
    toggleCompleteLesson,
    saveLessonCodeToCloud,
    loadLessonCodeFromCloud,
    isFirebaseReady: isFirebaseConfigured()
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}
