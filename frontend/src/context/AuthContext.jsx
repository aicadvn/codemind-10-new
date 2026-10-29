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
import { TEACHER_EMAILS, TEACHER_PIN, VALID_TEACHER_PINS } from '../config/schoolConfig';
import { logLoginSession } from '../services/analyticsService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [userRole, setUserRole] = useState('student'); // 'student' | 'teacher'
  const [userClass, setUserClass] = useState(null); // '10A1', '10A2',...
  const [needsClassSelection, setNeedsClassSelection] = useState(false);

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
      setUserRole('student');
      setUserClass(sessionStorage.getItem('codemind_passcode_class') || '10A1');
      setLoading(false);
      return;
    }

    // 2. Nếu có cấu hình Firebase, lắng nghe trạng thái Firebase Auth
    if (isFirebaseConfigured() && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          sessionStorage.setItem('codemind_auth', 'true');
          sessionStorage.setItem('codemind_auth_type', 'google');

          // Phân quyền Giáo viên tự động qua Danh sách Email Whitelist
          const isEmailTeacher = TEACHER_EMAILS.includes((user.email || '').toLowerCase().trim());
          let initialRole = isEmailTeacher ? 'teacher' : 'student';
          let savedClass = null;

          // Đọc và đồng bộ profile từ Cloud Firestore
          if (db) {
            try {
              const userRef = doc(db, 'users', user.uid);
              const docSnap = await getDoc(userRef);

              if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.role === 'teacher') initialRole = 'teacher';
                if (data.className) savedClass = data.className;
                if (data.completedLessons) setCompletedLessons(data.completedLessons);
              }

              // Nếu là giáo viên, role luôn là 'teacher' và className luôn là 'Ban Giảng Dạy'
              const finalRole = (isEmailTeacher || initialRole === 'teacher') ? 'teacher' : 'student';
              const finalClass = finalRole === 'teacher' ? 'Ban Giảng Dạy' : (savedClass || null);

              // Cập nhật Profile và thời điểm đăng nhập
              await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || (finalRole === 'teacher' ? 'Giáo viên THPT' : 'Học sinh THPT'),
                photoURL: user.photoURL,
                role: finalRole,
                className: finalClass,
                lastLogin: serverTimestamp(),
                lastActive: serverTimestamp()
              }, { merge: true });

              // Chỉ ghi nhận nhật ký phiên đăng nhập (Session Tracking NCKH) đối với HỌC SINH
              if (finalRole !== 'teacher') {
                logLoginSession(user.uid, {
                  displayName: user.displayName,
                  email: user.email,
                  className: finalClass
                });
              }

            } catch (err) {
              console.warn('Lỗi đồng bộ hồ sơ lên Firestore:', err);
            }
          }

          const resolvedRole = (isEmailTeacher || initialRole === 'teacher') ? 'teacher' : 'student';
          const resolvedClass = resolvedRole === 'teacher' ? 'Ban Giảng Dạy' : savedClass;

          setCurrentUser(user);
          setUserRole(resolvedRole);
          setUserClass(resolvedClass);

          // Nếu là học sinh và chưa có lớp -> Bật cửa sổ chọn lớp Onboarding 1 lần đầu
          if (resolvedRole === 'student' && !resolvedClass) {
            setNeedsClassSelection(true);
          } else {
            setNeedsClassSelection(false);
          }

        } else {
          if (!isPasscodeAuth) {
            setCurrentUser(null);
            setUserRole('student');
            setUserClass(null);
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  // Cập nhật lớp học sinh (Chỉ cần chọn 1 lần đầu)
  const updateStudentClass = async (className) => {
    setUserClass(className);
    setNeedsClassSelection(false);

    if (currentUser && !currentUser.isPasscode && db) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, { className }, { merge: true });
      } catch (e) {
        console.warn('Lỗi lưu lớp học:', e);
      }
    } else if (currentUser?.isPasscode) {
      sessionStorage.setItem('codemind_passcode_class', className);
    }
  };

  // Kích hoạt quyền Giáo viên bằng Mã PIN bảo mật dự phòng
  const activateTeacherModeWithPIN = async (pin) => {
    const cleanPin = (pin || '').trim();
    if (VALID_TEACHER_PINS.includes(cleanPin) || cleanPin === TEACHER_PIN) {
      setUserRole('teacher');
      if (currentUser && !currentUser.isPasscode && db) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await setDoc(userRef, { role: 'teacher', className: 'Ban Giảng Dạy' }, { merge: true });
        } catch (e) {
          console.warn('Lỗi cập nhật quyền Giáo viên:', e);
        }
      }
      return true;
    }
    return false;
  };

  // Đăng nhập bằng Google
  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured() || !auth || !googleProvider) {
      throw new Error('Hệ thống Firebase chưa được cấu hình. Vui lòng liên hệ quản trị viên hoặc dùng mã Passcode.');
    }
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  // Đăng nhập bằng Passcode lớp học (Chế độ dự phòng)
  const loginWithPasscode = async (passcode, selectedClass = '10A1') => {
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
      sessionStorage.setItem('codemind_passcode_class', selectedClass);
      
      setCurrentUser({
        uid: 'passcode_student',
        displayName: `Học sinh (${selectedClass})`,
        email: 'Tài khoản Lớp học',
        isPasscode: true,
        photoURL: null
      });
      setUserRole('student');
      setUserClass(selectedClass);
      return true;
    }
    return false;
  };

  // Đăng xuất an toàn
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
      sessionStorage.removeItem('codemind_passcode_class');
      setCurrentUser(null);
      setUserRole('student');
      setUserClass(null);
      setCompletedLessons([]);
      setNeedsClassSelection(false);
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
    userRole,
    userClass,
    isTeacher: userRole === 'teacher',
    needsClassSelection,
    loading,
    completedLessons,
    loginWithGoogle,
    loginWithPasscode,
    logout,
    updateStudentClass,
    activateTeacherModeWithPIN,
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
