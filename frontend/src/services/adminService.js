import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from '../firebase';
import { 
  SCHOOL_CLASSES, 
  SUPER_ADMIN_EMAIL, 
  SUPER_ADMIN_EMAILS,
  isSuperAdmin,
  isTeacherAccount,
  TEACHER_PROFILES, 
  TEACHER_EMAILS 
} from '../config/schoolConfig';

// Chuẩn hóa email
export const normalizeEmail = (email) => (email || '').toLowerCase().trim();

// Tên document an toàn trong Firestore (thay thế ký tự đặc biệt)
export const getStudentDocId = (email) => normalizeEmail(email).replace(/\./g, '_dot_').replace(/@/g, '_at_');

// 1. TẢI FILE MẪU CSV CHUẨN ĐỂ GIÁO VIÊN NHẬP LIỆU
export function downloadStudentSampleCSV() {
  const headers = ['Thứ tự', 'Họ và tên', 'Email', 'Lớp'];
  const sampleRows = [
    ['1', 'Nguyễn Văn An', 'nguyenvanan.10a1@gmail.com', '10A1'],
    ['2', 'Trần Thị Bình', 'tranthibinh.10a4@gmail.com', '10A4'],
    ['3', 'Lê Hoàng Cường', 'lehoangcuong.10a5@gmail.com', '10A5'],
    ['4', 'Phạm Minh Đức', 'phamminhduc.10a6@gmail.com', '10A6'],
    ['5', 'Hoàng Thu Giang', 'hoangthugiang.10a7@gmail.com', '10A7'],
    ['6', 'Vũ Hải Nam', 'vuhainam.10a8@gmail.com', '10A8'],
    ['7', 'Đỗ Quỳnh Nga', 'doquynhnga.10d1@gmail.com', '10D1'],
    ['8', 'Bùi Tiến Phát', 'buitienphat.10d2@gmail.com', '10D2'],
    ['9', 'Đặng Thảo Quyên', 'dangthaoquyen.10d3@gmail.com', '10D3'],
    ['10', 'Ngô Tuấn Kiệt', 'ngotuankiet.10d4@gmail.com', '10D4']
  ];

  // Hướng dẫn ghi chú ở cuối file để giáo viên nắm vững quy tắc
  const instructions = [
    ['# LƯU Ý KHI NHẬP FILE DANH SÁCH HỌC SINH:'],
    ['# 1. Cột Email bắt buộc phải là địa chỉ Gmail học sinh dùng để đăng nhập vào CodeMind 10.'],
    ['# 2. Cột Lớp phải thuộc 1 trong 10 lớp chính thức: 10A1, 10A4, 10A5, 10A6, 10A7, 10A8, 10D1, 10D2, 10D3, 10D4.'],
    ['# 3. File được mã hóa UTF-8 có dấu tiếng Việt chuẩn. Khi chỉnh sửa trên Excel hãy lưu ở định dạng CSV UTF-8.']
  ];

  const content = '\uFEFF' + [
    headers.join(','),
    ...sampleRows.map(r => r.map(c => `"${c}"`).join(',')),
    '',
    ...instructions.map(r => r.join(','))
  ].join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Mau_Danh_Sach_Hoc_Sinh_CodeMind10_THPT_LangGiang1.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 2. PARSE VÀ VALIDATE NỘI DUNG FILE CSV
export function parseStudentCSV(csvText) {
  if (!csvText || typeof csvText !== 'string') {
    throw new Error('Nội dung file CSV không hợp lệ hoặc rỗng.');
  }

  // Tách dòng
  const lines = csvText.split(/\r\n|\n|\r/).filter(line => line.trim() && !line.trim().startsWith('#'));
  if (lines.length < 2) {
    throw new Error('File CSV phải có ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu học sinh.');
  }

  // Xác định ký tự phân cách (phẩy , hoặc chấm phẩy ;)
  const headerLine = lines[0];
  const delimiter = headerLine.includes(';') ? ';' : ',';

  const parseRow = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  };

  const rawHeaders = parseRow(headerLine).map(h => h.toLowerCase().trim());

  // Tìm chỉ mục các cột
  const sttIdx = rawHeaders.findIndex(h => h.includes('thứ tự') || h.includes('stt') || h.includes('order'));
  const nameIdx = rawHeaders.findIndex(h => h.includes('họ') || h.includes('tên') || h.includes('name'));
  const emailIdx = rawHeaders.findIndex(h => h.includes('email') || h.includes('mail') || h.includes('gmail'));
  const classIdx = rawHeaders.findIndex(h => h.includes('lớp') || h.includes('class'));

  if (emailIdx === -1 || classIdx === -1) {
    throw new Error('File CSV thiếu cột bắt buộc: Cần có cột "Email" và cột "Lớp". Vui lòng tải file mẫu để kiểm tra.');
  }

  const validStudents = [];
  const errors = [];
  const seenEmails = new Set();

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    if (!row || row.length === 0 || row.every(cell => !cell.trim())) continue;

    const lineNum = i + 1;
    const stt = sttIdx !== -1 ? row[sttIdx] : String(i);
    const fullName = nameIdx !== -1 ? row[nameIdx] : 'Học sinh';
    const email = normalizeEmail(row[emailIdx] || '');
    let className = (row[classIdx] || '').toUpperCase().trim();

    // Chuẩn hóa tên lớp
    if (!className.startsWith('10') && (className.startsWith('A') || className.startsWith('D'))) {
      className = '10' + className;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.push(`Dòng ${lineNum}: Email "${email || '(trống)'}" không hợp lệ.`);
      continue;
    }

    if (seenEmails.has(email)) {
      errors.push(`Dòng ${lineNum}: Email "${email}" bị trùng lặp trong file.`);
      continue;
    }
    seenEmails.add(email);

    // Validate lớp
    if (!SCHOOL_CLASSES.includes(className)) {
      errors.push(`Dòng ${lineNum}: Lớp "${className}" không nằm trong danh mục 10 lớp khối 10 (${SCHOOL_CLASSES.join(', ')}).`);
      continue;
    }

    validStudents.push({
      stt: stt || String(validStudents.length + 1),
      fullName: fullName || 'Học sinh',
      email,
      className,
      status: 'active'
    });
  }

  return {
    validStudents,
    errors,
    totalRows: lines.length - 1
  };
}

// 3. LƯU DANH SÁCH HỌC SINH CSV VÀO CLOUD FIRESTORE
export async function saveStudentsToFirestore(studentsList, importedBy = SUPER_ADMIN_EMAIL) {
  if (!db) {
    throw new Error('Firebase Firestore chưa được kết nối.');
  }

  let successCount = 0;
  const errors = [];

  for (const s of studentsList) {
    try {
      const docId = getStudentDocId(s.email);
      const studentRef = doc(db, 'registered_students', docId);

      await setDoc(studentRef, {
        stt: s.stt,
        fullName: s.fullName,
        displayName: s.fullName,
        email: normalizeEmail(s.email),
        className: s.className,
        status: s.status || 'active',
        importedBy: normalizeEmail(importedBy),
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Nếu học sinh đã có document trong `users`, tự động cập nhật đồng bộ lớp
      try {
        const usersCol = collection(db, 'users');
        const q = query(usersCol, where('email', '==', normalizeEmail(s.email)));
        const snap = await getDocs(q);
        snap.forEach(userDoc => {
          setDoc(userDoc.ref, { 
            className: s.className,
            displayName: s.fullName 
          }, { merge: true });
        });
      } catch (syncErr) {
        console.warn('Lỗi đồng bộ users profile:', syncErr);
      }

      successCount++;
    } catch (err) {
      console.error(`Lỗi lưu học sinh ${s.email}:`, err);
      errors.push(`${s.email}: ${err.message}`);
    }
  }

  return { successCount, errors };
}

// 4. KIỂM TRA XEM HỌC SINH ĐÃ ĐƯỢC NHẬP VÀO HỆ THỐNG HAY CHƯA
export async function checkStudentAccessAllowed(email) {
  const normEmail = normalizeEmail(email);
  if (!normEmail) return { isAllowed: false, reason: 'no_email' };

  // 1. Nếu là tài khoản Super Admin hoặc Giáo viên -> Luôn được phép
  if (isSuperAdmin(normEmail) || TEACHER_EMAILS.includes(normEmail)) {
    return { isAllowed: true, isTeacher: true, className: 'Ban Giảng Dạy' };
  }

  // 2. Kiểm tra trong cơ sở dữ liệu Cloud Firestore
  if (db) {
    try {
      const docId = getStudentDocId(normEmail);
      const studentDocRef = doc(db, 'registered_students', docId);
      const docSnap = await getDoc(studentDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status !== 'suspended') {
          return { 
            isAllowed: true, 
            isTeacher: false, 
            studentData: data,
            className: data.className || '10A1',
            fullName: data.fullName || data.displayName || 'Học sinh'
          };
        } else {
          return { isAllowed: false, reason: 'suspended', email: normEmail };
        }
      }

      // Query phụ trong registered_students phòng trường hợp docId cấu trúc khác
      const q = query(collection(db, 'registered_students'), where('email', '==', normEmail));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const data = querySnap.docs[0].data();
        if (data.status !== 'suspended') {
          return {
            isAllowed: true,
            isTeacher: false,
            studentData: data,
            className: data.className || '10A1',
            fullName: data.fullName || data.displayName || 'Học sinh'
          };
        } else {
          return { isAllowed: false, reason: 'suspended', email: normEmail };
        }
      }

      // 3. Kiểm tra xem học sinh đã có tài khoản thực tế hợp lệ trong `users` hay không
      // (Đối với các học sinh đã từng đăng nhập trước đó)
      const uQ = query(collection(db, 'users'), where('email', '==', normEmail));
      const uSnap = await getDocs(uQ);
      if (!uSnap.empty) {
        const uDoc = uSnap.docs[0];
        const uData = uDoc.data();
        if (uData.status !== 'suspended' && uData.role !== 'unregistered_student') {
          // Tự động đồng bộ ngược vào registered_students để đảm bảo nhất quán
          const studentPayload = {
            email: normEmail,
            fullName: uData.displayName || 'Học sinh THPT',
            className: uData.className || '10A1',
            status: 'active',
            autoSynced: true,
            updatedAt: serverTimestamp()
          };
          setDoc(studentDocRef, studentPayload, { merge: true }).catch(() => {});

          return {
            isAllowed: true,
            isTeacher: false,
            studentData: studentPayload,
            className: uData.className || '10A1',
            fullName: uData.displayName || 'Học sinh THPT'
          };
        }
      }

    } catch (err) {
      console.warn('Lỗi kiểm tra whitelist học sinh trên Firestore:', err);
    }
  }

  // Nếu chưa có trên Cloud Firestore, chưa được cấp quyền
  return { 
    isAllowed: false, 
    reason: 'not_whitelisted', 
    email: normEmail 
  };
}

// 5. LẤY TOÀN BỘ DANH SÁCH HỌC SINH TÍCH HỢP ĐỒNG BỘ (REGISTERED + ACTIVE USERS)
export async function fetchAllRegisteredStudents() {
  if (!db) return [];
  try {
    const studentsMap = new Map();

    // NGUỒN 1: Đọc từ collection `registered_students` (danh sách học sinh đã nhập bằng CSV / thủ công)
    const colRef = collection(db, 'registered_students');
    const snap = await getDocs(colRef);
    snap.forEach(d => {
      const data = d.data();
      const normEmail = normalizeEmail(data.email || d.id);
      studentsMap.set(normEmail, {
        id: d.id,
        ...data,
        email: normEmail,
        stt: data.stt || '',
        fullName: data.fullName || data.displayName || 'Học sinh',
        className: data.className || '10A1',
        status: data.status || 'active',
        isRegisteredFromCsv: true,
        completedLessonsCount: 0,
        totalBugs: 0,
        isActivated: false
      });
    });

    // NGUỒN 2: Đọc từ collection `users` (những tài khoản học sinh đã đăng nhập và đang học)
    // Đảm bảo không bị chênh lệch so với Bảng điều khiển sư phạm!
    const usersCol = collection(db, 'users');
    const usersSnap = await getDocs(usersCol);

    usersSnap.forEach(d => {
      const uData = d.data();
      // Bỏ qua tài khoản giáo viên và tài khoản admin
      if (isTeacherAccount(uData) || isSuperAdmin(uData.email)) {
        return;
      }

      const normEmail = normalizeEmail(uData.email);
      if (!normEmail) return;

      const completedCount = Array.isArray(uData.completedLessons) ? uData.completedLessons.length : 0;
      const bugsCount = uData.totalBugs || 0;
      const lastActive = uData.lastActive || uData.lastLogin || null;

      if (studentsMap.has(normEmail)) {
        // Đã có trong registered_students -> Bổ sung dữ liệu học tập thực tế
        const existing = studentsMap.get(normEmail);
        studentsMap.set(normEmail, {
          ...existing,
          uid: d.id,
          completedLessonsCount: completedCount,
          completedLessons: uData.completedLessons || [],
          totalBugs: bugsCount,
          lastActive: lastActive,
          photoURL: uData.photoURL || existing.photoURL,
          isActivated: true, // Đã đăng nhập vào học
          fullName: existing.fullName || uData.displayName || 'Học sinh'
        });
      } else {
        // Chưa có trong registered_students nhưng ĐÃ CÓ trong users (như 4 học sinh hiện tại)
        // -> Tự động đưa vào danh sách học sinh và đồng bộ ngược vào registered_students
        const newStudentEntry = {
          id: getStudentDocId(normEmail),
          uid: d.id,
          email: normEmail,
          fullName: uData.displayName || 'Học sinh',
          className: uData.className || '10A1',
          status: uData.status === 'suspended' ? 'suspended' : 'active',
          isActivated: true,
          completedLessonsCount: completedCount,
          completedLessons: uData.completedLessons || [],
          totalBugs: bugsCount,
          lastActive: lastActive,
          photoURL: uData.photoURL,
          autoSyncedFromUser: true
        };
        studentsMap.set(normEmail, newStudentEntry);

        // Tự động đồng bộ lưu vào registered_students để đảm bảo tính liên tục
        if (newStudentEntry.status === 'active') {
          const docId = getStudentDocId(normEmail);
          setDoc(doc(db, 'registered_students', docId), {
            email: normEmail,
            fullName: newStudentEntry.fullName,
            className: newStudentEntry.className,
            status: 'active',
            autoSynced: true,
            updatedAt: serverTimestamp()
          }, { merge: true }).catch(err => console.warn('Lỗi auto-sync vào registered_students:', err));
        }
      }
    });

    const studentList = Array.from(studentsMap.values());

    // Sắp xếp theo lớp rồi theo STT / Tên
    return studentList.sort((a, b) => {
      if (a.className !== b.className) return (a.className || '').localeCompare(b.className || '');
      const sttA = parseInt(a.stt, 10) || 999;
      const sttB = parseInt(b.stt, 10) || 999;
      if (sttA !== sttB) return sttA - sttB;
      return (a.fullName || '').localeCompare(b.fullName || '');
    });

  } catch (err) {
    console.warn('Lỗi tải danh sách học sinh tích hợp:', err);
    return [];
  }
}

// 6. ĐIỀU CHỈNH / CHUYỂN LỚP CHO HỌC SINH
export async function updateStudentClassInSystem(email, newClassName) {
  if (!db) throw new Error('Không có kết nối Firestore.');
  const normEmail = normalizeEmail(email);
  const docId = getStudentDocId(normEmail);

  // 1. Cập nhật trong registered_students
  const studentRef = doc(db, 'registered_students', docId);
  await setDoc(studentRef, { className: newClassName, updatedAt: serverTimestamp() }, { merge: true });

  // 2. Cập nhật trong users nếu học sinh đã từng đăng nhập
  try {
    const q = query(collection(db, 'users'), where('email', '==', normEmail));
    const snap = await getDocs(q);
    snap.forEach(userDoc => {
      setDoc(userDoc.ref, { className: newClassName }, { merge: true });
    });
  } catch (e) {
    console.warn('Lỗi cập nhật users profile khi đổi lớp:', e);
  }

  return true;
}

// 7. XÓA / LOẠI BỎ HỌC SINH RA KHỎI HỆ THỐNG
export async function deleteStudentFromSystem(email) {
  if (!db) throw new Error('Không có kết nối Firestore.');
  const normEmail = normalizeEmail(email);
  const docId = getStudentDocId(normEmail);

  // 1. Xóa khỏi collection `registered_students`
  const studentRef = doc(db, 'registered_students', docId);
  await deleteDoc(studentRef);

  // 2. Cập nhật trong `users` để đánh dấu suspended
  try {
    const q = query(collection(db, 'users'), where('email', '==', normEmail));
    const snap = await getDocs(q);
    snap.forEach(userDoc => {
      setDoc(userDoc.ref, { 
        status: 'suspended', 
        role: 'unregistered_student' 
      }, { merge: true });
    });
  } catch (e) {
    console.warn('Lỗi cập nhật users khi xóa học sinh:', e);
  }

  return true;
}

// 8. THÊM THỦ CÔNG 1 HỌC SINH VÀO HỆ THỐNG
export async function addSingleStudentToSystem(studentData, importedBy = SUPER_ADMIN_EMAIL) {
  if (!db) throw new Error('Không có kết nối Firestore.');
  const normEmail = normalizeEmail(studentData.email);
  if (!normEmail) throw new Error('Email học sinh không được rỗng.');

  const docId = getStudentDocId(normEmail);
  const studentRef = doc(db, 'registered_students', docId);

  await setDoc(studentRef, {
    stt: studentData.stt || '1',
    fullName: studentData.fullName || 'Học sinh',
    displayName: studentData.fullName || 'Học sinh',
    email: normEmail,
    className: studentData.className || '10A1',
    status: 'active',
    importedBy: normalizeEmail(importedBy),
    updatedAt: serverTimestamp()
  }, { merge: true });

  return true;
}

// ==========================================
// QUẢN LÝ DANH SÁCH GIÁO VIÊN & PHÂN QUYỀN LỚP
// ==========================================

// 9. LẤY DANH SÁCH TẤT CẢ GIÁO VIÊN
export async function fetchAllTeachersList() {
  const teachersMap = new Map();

  // Khởi tạo trước từ TEACHER_PROFILES mặc định
  Object.entries(TEACHER_PROFILES).forEach(([email, profile]) => {
    teachersMap.set(normalizeEmail(email), {
      email: normalizeEmail(email),
      name: profile.name,
      role: profile.role.includes('Quản trị') ? 'admin' : 'teacher',
      assignedClasses: profile.assignedClasses || ['all'],
      school: profile.school || 'THPT Lạng Giang số 1',
      isDefault: true
    });
  });

  // Lấy dữ liệu động từ Firestore collection `teachers`
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'teachers'));
      snap.forEach(d => {
        const data = d.data();
        const norm = normalizeEmail(data.email || d.id);
        teachersMap.set(norm, {
          id: d.id,
          ...data,
          email: norm,
          isDefault: isSuperAdmin(norm)
        });
      });
    } catch (err) {
      console.warn('Lỗi đọc collection teachers từ Firestore:', err);
    }
  }

  return Array.from(teachersMap.values());
}

// 10. THÊM HOẶC CẬP NHẬT GIÁO VIÊN MỚI
export async function saveTeacherAccount(teacherData, createdBy = SUPER_ADMIN_EMAIL) {
  if (!db) throw new Error('Không có kết nối Firestore.');
  const normEmail = normalizeEmail(teacherData.email);
  if (!normEmail) throw new Error('Email giáo viên không được để trống.');

  const docId = normEmail.replace(/\./g, '_dot_').replace(/@/g, '_at_');
  const teacherRef = doc(db, 'teachers', docId);

  const payload = {
    email: normEmail,
    name: teacherData.name || 'Giáo viên Tin học',
    role: teacherData.role || 'teacher',
    assignedClasses: Array.isArray(teacherData.assignedClasses) 
      ? teacherData.assignedClasses 
      : [teacherData.assignedClass || '10A1'],
    createdBy: normalizeEmail(createdBy),
    updatedAt: serverTimestamp()
  };

  await setDoc(teacherRef, payload, { merge: true });

  // Cập nhật profile nếu giáo viên đã có tài khoản user
  try {
    const q = query(collection(db, 'users'), where('email', '==', normEmail));
    const snap = await getDocs(q);
    snap.forEach(userDoc => {
      setDoc(userDoc.ref, { 
        role: 'teacher', 
        className: 'Ban Giảng Dạy',
        assignedClasses: payload.assignedClasses 
      }, { merge: true });
    });
  } catch (e) {
    console.warn('Lỗi cập nhật users role khi gán giáo viên:', e);
  }

  return true;
}

// 11. ĐIỀU CHỈNH LỚP QUẢN LÝ CHO GIÁO VIÊN
export async function updateTeacherAssignedClasses(email, newAssignedClasses) {
  if (!db) throw new Error('Không có kết nối Firestore.');
  const normEmail = normalizeEmail(email);
  const docId = normEmail.replace(/\./g, '_dot_').replace(/@/g, '_at_');

  const teacherRef = doc(db, 'teachers', docId);
  await setDoc(teacherRef, {
    assignedClasses: Array.isArray(newAssignedClasses) ? newAssignedClasses : [newAssignedClasses],
    updatedAt: serverTimestamp()
  }, { merge: true });

  // Đồng bộ users
  try {
    const q = query(collection(db, 'users'), where('email', '==', normEmail));
    const snap = await getDocs(q);
    snap.forEach(userDoc => {
      setDoc(userDoc.ref, { assignedClasses: newAssignedClasses }, { merge: true });
    });
  } catch (e) {
    console.warn('Lỗi cập nhật users assignedClasses:', e);
  }

  return true;
}

// 12. XÓA / LOẠI BỎ GIÁO VIÊN KHỎI HỆ THỐNG
export async function removeTeacherFromSystem(email) {
  if (!db) throw new Error('Không có kết nối Firestore.');
  const normEmail = normalizeEmail(email);

  if (isSuperAdmin(normEmail)) {
    throw new Error('Không thể xóa tài khoản Quản trị viên tối cao của hệ thống!');
  }

  const docId = normEmail.replace(/\./g, '_dot_').replace(/@/g, '_at_');
  const teacherRef = doc(db, 'teachers', docId);
  await deleteDoc(teacherRef);

  // Gỡ quyền teacher trong users
  try {
    const q = query(collection(db, 'users'), where('email', '==', normEmail));
    const snap = await getDocs(q);
    snap.forEach(userDoc => {
      setDoc(userDoc.ref, { role: 'student', className: null }, { merge: true });
    });
  } catch (e) {
    console.warn('Lỗi hạ quyền trong users:', e);
  }

  return true;
}
