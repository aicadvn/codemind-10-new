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
  collection,
  query,
  where,
  getDocs,
  serverTimestamp 
} from '../firebase';
import { 
  SUPER_ADMIN_EMAIL, 
  SUPER_ADMIN_NAME, 
  SUPER_ADMIN_TITLE, 
  TEACHER_EMAILS, 
  TEACHER_PROFILES, 
  TEACHER_PIN, 
  VALID_TEACHER_PINS,
  isSuperAdmin as checkIsSuperAdmin 
} from '../config/schoolConfig';
import { checkStudentAccessAllowed } from '../services/adminService';
import { logLoginSession } from '../services/analyticsService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [userRole, setUserRole] = useState('student'); // 'student' | 'teacher' | 'admin'
  const [userClass, setUserClass] = useState(null); // '10A1', '10A4',...
  const [isAdmin, setIsAdmin] = useState(false);
  const [assignedClasses, setAssignedClasses] = useState(['all']);
  const [needsClassSelection, setNeedsClassSelection] = useState(false);
  const [isAccessBlocked, setIsAccessBlocked] = useState(false);
  const [blockedEmail, setBlockedEmail] = useState('');
  const [autoOpenAdmin, setAutoOpenAdmin] = useState(false);

  // Lắng nghe trạng thái đăng nhập Firebase hoặc SessionStorage
  useEffect(() => {
    // 1. Dọn dẹp phiên Passcode cũ (nếu có) để bắt buộc đăng nhập chính danh qua Google
    if (sessionStorage.getItem('codemind_auth_type') === 'passcode') {
      sessionStorage.removeItem('codemind_auth');
      sessionStorage.removeItem('codemind_auth_type');
      sessionStorage.removeItem('codemind_passcode_class');
    }

    // 2. Nếu có cấu hình Firebase, lắng nghe trạng thái Firebase Auth
    if (isFirebaseConfigured() && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          sessionStorage.setItem('codemind_auth', 'true');
          sessionStorage.setItem('codemind_auth_type', 'google');

          const normEmail = (user.email || '').toLowerCase().trim();
          const isSuper = checkIsSuperAdmin(normEmail);

          // Kiểm tra xem có phải giáo viên (trong TEACHER_EMAILS hoặc database)
          let isEmailTeacher = TEACHER_EMAILS.includes(normEmail);
          let teacherAssigned = isSuper ? ['all'] : (TEACHER_PROFILES[normEmail]?.assignedClasses || ['all']);

          // Kiểm tra thêm trong collection teachers trên Firestore nếu chưa có trong danh sách tĩnh
          if (!isSuper && !isEmailTeacher && db) {
            try {
              const teacherDocId = normEmail.replace(/\./g, '_dot_').replace(/@/g, '_at_');
              const tDoc = await getDoc(doc(db, 'teachers', teacherDocId));
              if (tDoc.exists()) {
                isEmailTeacher = true;
                teacherAssigned = tDoc.data().assignedClasses || ['all'];
              }
            } catch (e) {
              console.warn('Lỗi đọc teacher doc:', e);
            }
          }

          let resolvedRole = 'student';
          let resolvedClass = null;

          if (isSuper) {
            // ==========================================
            // VAI TRÒ: QUẢN TRỊ VIÊN HỆ THỐNG TỐI CAO (CÔ TRẦN THỊ NGÀ)
            // ==========================================
            resolvedRole = 'admin';
            resolvedClass = 'Toàn trường (10 lớp)';
            setIsAdmin(true);
            setUserRole('admin');
            setUserClass(resolvedClass);
            setAssignedClasses(['all']);
            setIsAccessBlocked(false);
            setBlockedEmail('');
            setAutoOpenAdmin(true); // Tự động mở Trang Quản Trị Hệ Thống ngay sau khi đăng nhập
            setNeedsClassSelection(false);

          } else if (isEmailTeacher) {
            // ==========================================
            // VAI TRÒ: GIÁO VIÊN BỘ MÔN
            // ==========================================
            resolvedRole = 'teacher';
            resolvedClass = 'Ban Giảng Dạy';
            setIsAdmin(false);
            setUserRole('teacher');
            setUserClass('Ban Giảng Dạy');
            setAssignedClasses(teacherAssigned);
            setIsAccessBlocked(false);
            setBlockedEmail('');
            setAutoOpenAdmin(false);
            setNeedsClassSelection(false);

          } else {
            // ==========================================
            // VAI TRÒ: HỌC SINH (ÁP DỤNG CỔNG BẢO MẬT WHITELIST)
            // ==========================================
            setIsAdmin(false);
            setAutoOpenAdmin(false);

            // Kiểm tra xem học sinh đã được giáo viên nhập vào hệ thống trước đó hay chưa!
            const accessCheck = await checkStudentAccessAllowed(normEmail);

            if (!accessCheck.isAllowed) {
              // HỌC SINH CHƯA ĐƯỢC NHẬP VÀO HỆ THỐNG:
              // Khóa quyền vào học và hiển thị Popup hướng dẫn liên hệ Admin
              setIsAccessBlocked(true);
              setBlockedEmail(normEmail);
              setUserRole('student');
              setUserClass(null);
              setNeedsClassSelection(false);
              setCurrentUser(user);
              setLoading(false);
              return; // Dừng tại đây, không cho vào không gian học tập
            }

            // HỌC SINH ĐÃ ĐƯỢC NHẬP VÀO HỆ THỐNG:
            setIsAccessBlocked(false);
            setBlockedEmail('');
            resolvedRole = 'student';
            resolvedClass = accessCheck.className || '10A1';
            setUserRole('student');
            setUserClass(resolvedClass);
            setNeedsClassSelection(false); // Không cần chọn lớp vì giáo viên đã chỉ định lớp chính xác!
          }

          // Đọc và đồng bộ profile từ Cloud Firestore
          if (db) {
            try {
              const userRef = doc(db, 'users', user.uid);
              const docSnap = await getDoc(userRef);

              if (docSnap.exists() && docSnap.data().completedLessons) {
                setCompletedLessons(docSnap.data().completedLessons);
              }

              const finalDisplayName = isSuper 
                ? (normEmail === 'nguyentrunghoa@gmail.com' 
                    ? 'Thầy Nguyễn Trung Hòa — Quản trị hệ thống' 
                    : 'Cô Trần Thị Ngà — Quản trị hệ thống') 
                : (isEmailTeacher 
                    ? (TEACHER_PROFILES[normEmail]?.name || 'Giáo viên Tin học') 
                    : (user.displayName || 'Học sinh THPT'));

              // Cập nhật Profile và thời điểm đăng nhập
              await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: finalDisplayName,
                photoURL: user.photoURL,
                role: resolvedRole,
                className: resolvedClass,
                assignedClasses: (isSuper || isEmailTeacher) ? teacherAssigned : null,
                lastLogin: serverTimestamp(),
                lastActive: serverTimestamp()
              }, { merge: true });

              // Chỉ ghi nhận nhật ký phiên đăng nhập (Session Tracking NCKH) đối với HỌC SINH
              if (resolvedRole === 'student') {
                logLoginSession(user.uid, {
                  displayName: finalDisplayName,
                  email: user.email,
                  className: resolvedClass
                });
              }

            } catch (err) {
              console.warn('Lỗi đồng bộ hồ sơ lên Firestore:', err);
            }
          }

          setCurrentUser(user);
        } else {
          setCurrentUser(null);
          setUserRole('student');
          setUserClass(null);
          setIsAdmin(false);
          setIsAccessBlocked(false);
          setBlockedEmail('');
          setAutoOpenAdmin(false);
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
      const isSuper = cleanPin === 'NGA_LG1_2026' || cleanPin === '261088' || cleanPin === '1088' || cleanPin === '202610' || cleanPin === 'GV_LG1_2026';
      setUserRole(isSuper ? 'admin' : 'teacher');
      if (isSuper) {
        setIsAdmin(true);
        setAssignedClasses(['all']);
      }
      if (currentUser && !currentUser.isPasscode && db) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await setDoc(userRef, { 
            role: isSuper ? 'admin' : 'teacher', 
            className: 'Ban Giảng Dạy',
            assignedClasses: isSuper ? ['all'] : ['10A1']
          }, { merge: true });
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
      setIsAdmin(false);
      setIsAccessBlocked(false);
      setBlockedEmail('');
      setAssignedClasses(['all']);
      setAutoOpenAdmin(false);
      setCompletedLessons([]);
      setNeedsClassSelection(false);
    }
  };

  // Kiểm tra lại quyền truy cập cho học sinh sau khi liên hệ Admin
  const recheckAccess = async () => {
    if (!currentUser || !currentUser.email) return;
    const normEmail = (currentUser.email || '').toLowerCase().trim();
    const accessCheck = await checkStudentAccessAllowed(normEmail);
    if (accessCheck.isAllowed) {
      setIsAccessBlocked(false);
      setBlockedEmail('');
      const studentClass = accessCheck.className || '10A1';
      setUserClass(studentClass);
      setUserRole('student');
      alert(`Xin chúc mừng! Tài khoản của em đã được kích hoạt vào Lớp ${studentClass}. Bắt đầu học ngay nhé!`);
    } else {
      alert('Tài khoản của em vẫn chưa có trong danh sách được cấp quyền. Vui lòng liên hệ Admin qua số: 0975 702 636.');
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
    isTeacher: userRole === 'teacher' || userRole === 'admin',
    isAdmin,
    isSuperAdmin: isAdmin,
    assignedClasses,
    isAccessBlocked,
    blockedEmail,
    autoOpenAdmin,
    setAutoOpenAdmin,
    recheckAccess,
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
