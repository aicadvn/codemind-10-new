import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc, 
  serverTimestamp 
} from '../firebase';
import { isTeacherAccount } from '../config/schoolConfig';

// Phân loại lỗi lập trình Python thông minh
export function parsePythonErrorType(errorMsg) {
  if (!errorMsg || typeof errorMsg !== 'string') return 'Tư vấn đàm thoại Socrates';
  if (errorMsg.includes('Chương trình chạy thành công') || errorMsg.includes('Exit Code 0')) {
    return 'Chạy thành công (Tư vấn tối ưu)';
  }
  if (errorMsg.includes('tối ưu thuật toán') || errorMsg.includes('Học sinh kích hoạt')) {
    return 'Tư vấn gỡ lỗi (Săn Bug AI)';
  }
  if (errorMsg.includes('IndentationError')) return 'IndentationError (Lỗi thụt lề)';
  if (errorMsg.includes('SyntaxError')) return 'SyntaxError (Lỗi cú pháp)';
  if (errorMsg.includes('NameError')) return 'NameError (Biến chưa định nghĩa)';
  if (errorMsg.includes('TypeError')) return 'TypeError (Sai kiểu dữ liệu)';
  if (errorMsg.includes('ZeroDivisionError')) return 'ZeroDivisionError (Chia cho số 0)';
  if (errorMsg.includes('IndexError')) return 'IndexError (Vượt quá độ dài danh sách)';
  if (errorMsg.includes('ValueError')) return 'ValueError (Sai giá trị chuyển đổi)';
  if (errorMsg.includes('EOFError')) return 'EOFError (Hủy nhập dữ liệu)';
  if (errorMsg.includes('Error') || errorMsg.includes('Exception') || errorMsg.includes('Traceback')) {
    return 'RuntimeError (Lỗi thực thi)';
  }
  return 'Tư vấn đàm thoại Socrates';
}

// 1. Ghi nhật ký lỗi thực thi (Debugging Log) vào Firestore & LocalStorage
export async function logDebugEvent(uid, lessonId, code, errorMsg) {
  if (!uid) return;
  try {
    const errorType = parsePythonErrorType(errorMsg);
    const newLogItem = {
      id: 'log_' + Date.now(),
      lessonId: lessonId || 1,
      errorType,
      errorMsg: String(errorMsg).slice(0, 500),
      codeSnippet: String(code).slice(0, 600),
      timestamp: { toDate: () => new Date() }
    };

    // 1.1 Luôn lưu vào LocalStorage để học sinh xem lại tức thì ngay cả khi dùng Passcode hoặc mất mạng
    try {
      const storageKey = `codemind_debug_logs_${uid}`;
      const localLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localLogs.unshift(newLogItem);
      localStorage.setItem(storageKey, JSON.stringify(localLogs.slice(0, 40)));
    } catch (localErr) {
      console.warn('Lỗi lưu log cục bộ:', localErr);
    }

    // 1.2 Nếu là tài khoản Google chính thức, đồng bộ lên Cloud Firestore
    if (uid !== 'passcode_student' && db) {
      const debugCollection = collection(db, 'users', uid, 'debugLogs');
      await addDoc(debugCollection, {
        lessonId: lessonId || 1,
        errorType,
        errorMsg: String(errorMsg).slice(0, 500),
        codeSnippet: String(code).slice(0, 600),
        timestamp: serverTimestamp()
      });

      // Cập nhật tổng số bug đã gặp vào tài liệu profile học sinh
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      const currentCount = snap.exists() ? (snap.data().totalBugs || 0) : 0;
      await setDoc(userRef, { 
        totalBugs: currentCount + 1,
        lastActive: serverTimestamp()
      }, { merge: true });
    }

  } catch (err) {
    console.warn('Lỗi ghi nhật ký Debugging:', err);
  }
}

// 2. Lưu toàn bộ lịch sử đàm thoại Socrates với Gia sư AI theo từng bài
export async function saveSocraticChat(uid, lessonId, messages) {
  if (!uid || !messages || messages.length === 0) return;
  try {
    const sanitizedMessages = messages.slice(-50).map(m => ({
      role: m.role,
      text: m.text
    }));

    // 2.1 Luôn lưu vào LocalStorage
    try {
      const storageKey = `codemind_socratic_${uid}_lesson_${lessonId}`;
      localStorage.setItem(storageKey, JSON.stringify(sanitizedMessages));
    } catch (localErr) {
      console.warn('Lỗi lưu chat Socrates cục bộ:', localErr);
    }

    // 2.2 Đồng bộ lên Cloud Firestore
    if (uid !== 'passcode_student' && db) {
      const chatDoc = doc(db, 'users', uid, 'socraticChats', `lesson_${lessonId}`);
      await setDoc(chatDoc, {
        lessonId,
        messages: sanitizedMessages,
        totalMessages: messages.length,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

  } catch (err) {
    console.warn('Lỗi lưu hội thoại Socrates:', err);
  }
}

// 3. Tải lịch sử đàm thoại Socrates cũ của bài học khi học sinh mở lại
export async function loadSocraticChat(uid, lessonId) {
  if (!uid) return null;
  
  // 3.1 Nếu dùng Passcode, đọc trực tiếp từ LocalStorage
  if (uid === 'passcode_student') {
    try {
      const storageKey = `codemind_socratic_${uid}_lesson_${lessonId}`;
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  // 3.2 Nếu dùng tài khoản Google, đọc từ Firestore, fallback LocalStorage
  try {
    if (db) {
      const chatDoc = doc(db, 'users', uid, 'socraticChats', `lesson_${lessonId}`);
      const snap = await getDoc(chatDoc);
      if (snap.exists() && snap.data()?.messages) {
        return snap.data().messages;
      }
    }
  } catch (err) {
    console.warn('Lỗi tải hội thoại Socrates từ Cloud, dùng bộ nhớ cục bộ:', err);
  }

  try {
    const storageKey = `codemind_socratic_${uid}_lesson_${lessonId}`;
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// 4. Ghi nhận nhật ký phiên đăng nhập (Session Tracking)
export async function logLoginSession(uid, userProfile) {
  if (!uid || uid === 'passcode_student' || !db) return;
  try {
    const sessionCollection = collection(db, 'users', uid, 'sessions');
    await addDoc(sessionCollection, {
      loginAt: serverTimestamp(),
      displayName: userProfile?.displayName || 'Học sinh',
      email: userProfile?.email || '',
      className: userProfile?.className || 'Chưa phân lớp',
      deviceType: window.innerWidth < 768 ? 'Điện thoại di động' : 'Máy tính',
      userAgent: navigator.userAgent
    });
  } catch (err) {
    console.warn('Lỗi ghi nhận phiên đăng nhập:', err);
  }
}

// 5. Tải danh sách nhật ký gỡ lỗi cá nhân (dành cho Sổ tay Săn Bug của học sinh)
export async function fetchStudentDebugLogs(uid) {
  if (!uid) return [];

  // 5.1 Nếu dùng Passcode, đọc trực tiếp từ LocalStorage
  if (uid === 'passcode_student') {
    try {
      const storageKey = `codemind_debug_logs_${uid}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(log => ({
          ...log,
          timestamp: { toDate: () => new Date() }
        }));
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  }

  // 5.2 Nếu dùng tài khoản Google, lấy từ Firestore
  try {
    if (db) {
      const debugCollection = collection(db, 'users', uid, 'debugLogs');
      const q = query(debugCollection, orderBy('timestamp', 'desc'), limit(30));
      const snap = await getDocs(q);
      const cloudLogs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (cloudLogs.length > 0) {
        return cloudLogs;
      }
    }
  } catch (err) {
    console.warn('Lỗi tải sổ tay săn bug từ Firestore, fallback cục bộ:', err);
  }

  // 5.3 Fallback bộ nhớ máy
  try {
    const storageKey = `codemind_debug_logs_${uid}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map(log => ({
        ...log,
        timestamp: { toDate: () => new Date() }
      }));
    }
  } catch (e) {
    console.warn(e);
  }

  return [];
}

// 6. Dành cho Bảng điều khiển Sư phạm Giáo viên (Teacher Dashboard Analytics)
export async function fetchClassStudents(classNameFilter = 'all') {
  if (!db) return [];
  try {
    const usersCollection = collection(db, 'users');
    let q;
    if (classNameFilter && classNameFilter !== 'all') {
      q = query(usersCollection, where('className', '==', classNameFilter));
    } else {
      q = query(usersCollection, limit(200));
    }

    const snap = await getDocs(q);
    const students = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      // Loại trừ tuyệt đối mọi tài khoản giáo viên khỏi danh sách và thống kê học sinh
      if (isTeacherAccount(data)) {
        return;
      }
      students.push({
        id: docSnap.id,
        ...data
      });
    });

    return students;
  } catch (err) {
    console.warn('Lỗi tải danh sách học sinh theo lớp:', err);
    return [];
  }
}

// 7. Xuất dữ liệu minh chứng thực nghiệm định lượng phục vụ Nghiên cứu Khoa học (NCKH / SKKN)
export function exportToNCKH_CSV(students, className = 'Toàn khối 10') {
  // Đảm bảo chỉ có dữ liệu học sinh trong báo cáo NCKH, loại bỏ mọi tài khoản giáo viên
  const validStudents = (students || []).filter(s => !isTeacherAccount(s));
  if (validStudents.length === 0) {
    alert('Chưa có dữ liệu học sinh để xuất!');
    return;
  }

  // Tiêu đề các cột dữ liệu NCKH
  const headers = [
    'STT',
    'Mã định danh (UID)',
    'Họ và Tên',
    'Email Học sinh',
    'Lớp',
    'Số bài đã hoàn thành',
    'Tỷ lệ hoàn thành (%)',
    'Tổng số lỗi lập trình đã gặp (Bugs)',
    'Danh sách bài học hoàn thành',
    'Lần đăng nhập gần nhất'
  ];

  const rows = validStudents.map((s, idx) => {
    const completedCount = (s.completedLessons || []).length;
    const progressPercent = Math.round((completedCount / 17) * 100);
    const lastLoginStr = s.lastLogin?.toDate 
      ? s.lastLogin.toDate().toLocaleString('vi-VN') 
      : (s.lastActive?.toDate ? s.lastActive.toDate().toLocaleString('vi-VN') : 'Chưa ghi nhận');

    return [
      idx + 1,
      `"${s.id || ''}"`,
      `"${s.displayName || 'Học sinh'}"`,
      `"${s.email || ''}"`,
      `"${s.className || 'Chưa xếp lớp'}"`,
      completedCount,
      `${progressPercent}%`,
      s.totalBugs || 0,
      `"${(s.completedLessons || []).join(', ')}"`,
      `"${lastLoginStr}"`
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bao_Cao_NCKH_CodeMind10_${className}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
