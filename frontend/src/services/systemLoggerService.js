import { 
  db, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp, 
  deleteDoc, 
  doc 
} from '../firebase';

const LOCAL_STORAGE_KEY = 'codemind_system_incident_logs';
const MAX_LOCAL_LOGS = 50;

/**
 * Ghi nhận một sự cố / sự kiện hệ thống vào Cloud Firestore và LocalStorage
 * Chạy hoàn toàn bất đồng bộ (Non-blocking), không bao giờ làm gián đoạn hay chậm luồng người dùng
 * 
 * @param {Object} incident
 * @param {string} incident.level - 'INFO' | 'WARNING' | 'ERROR' | 'AUTO_RECOVERED'
 * @param {string} incident.source - 'CLIENT_DIRECT' | 'RENDER_BACKEND' | 'PYODIDE_RUNNER' | 'AUTH' | 'SECURITY'
 * @param {string} incident.errorType - 'AI_RATE_LIMIT_429' | 'AI_TIMEOUT' | 'AI_BUSY' | 'NETWORK_ERROR' | 'DOM_TAMPER'
 * @param {string} incident.message - Mô tả tóm tắt sự kiện
 * @param {string} incident.details - Chi tiết kỹ thuật hoặc nội dung lỗi
 * @param {string} [incident.userEmail] - Email của học sinh/giáo viên
 * @param {string} [incident.userClass] - Lớp của học sinh
 * @param {string} [incident.clientIp] - Địa chỉ IP nhận diện
 * @param {boolean} [incident.isSchoolIp] - True nếu là mạng IP trường THPT Lạng Giang số 1
 * @param {string} [incident.resolution] - 'AUTO_RECOVERED' | 'FALLBACK_SUCCESS' | 'UNRESOLVED'
 */
export async function logSystemIncident(incident = {}) {
  const now = new Date();
  const logItem = {
    id: 'inc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: now.toISOString(),
    displayTime: now.toLocaleString('vi-VN'),
    level: incident.level || 'WARNING',
    source: incident.source || 'CLIENT_DIRECT',
    errorType: incident.errorType || 'SYSTEM_EVENT',
    message: incident.message || 'Sự kiện hệ thống phát sinh',
    details: typeof incident.details === 'object' ? JSON.stringify(incident.details) : String(incident.details || ''),
    userEmail: incident.userEmail || 'Ẩn danh / Khách',
    userClass: incident.userClass || 'Chưa xác định',
    clientIp: incident.clientIp || (incident.isSchoolIp ? '116.97.105.239 (Trường THPT LG1)' : 'IP Khách'),
    isSchoolIp: Boolean(incident.isSchoolIp),
    resolution: incident.resolution || (incident.level === 'AUTO_RECOVERED' ? 'Tự phục hồi qua luồng dự phòng' : 'Đang theo dõi')
  };

  // 1. Luôn ghi ngay vào LocalStorage máy trạm để bảo toàn dữ liệu nếu mạng chập chờn
  try {
    const rawLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
    const localLogs = rawLocal ? JSON.parse(rawLocal) : [];
    localLogs.unshift(logItem);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localLogs.slice(0, MAX_LOCAL_LOGS)));
  } catch (storageErr) {
    console.debug('[SystemLogger] LocalStorage buffer skipped:', storageErr);
  }

  // In log ra Console định dạng có màu để lập trình viên/quản trị viên theo dõi qua DevTools (F12)
  const logPrefix = `[CodeMind Monitor - ${logItem.level}]`;
  if (logItem.level === 'ERROR') {
    console.error(logPrefix, logItem.message, logItem.details);
  } else if (logItem.level === 'WARNING') {
    console.warn(logPrefix, logItem.message, logItem.details);
  } else {
    console.log(logPrefix, logItem.message);
  }

  // 2. Ghi nhật ký tập trung lên Cloud Firestore
  if (db) {
    try {
      const colRef = collection(db, 'system_incident_logs');
      await addDoc(colRef, {
        ...logItem,
        createdAt: serverTimestamp()
      });
    } catch (firestoreErr) {
      console.debug('[SystemLogger] Không thể đẩy log lên Firestore (có thể do offline):', firestoreErr?.message);
    }
  }
}

/**
 * Lấy danh sách các bản ghi sự cố hệ thống phục vụ Giám Sát và Báo Cáo
 * @param {number} maxCount - Số lượng log tối đa lấy về
 * @returns {Promise<Array>}
 */
export async function fetchSystemIncidentLogs(maxCount = 100) {
  let firestoreLogs = [];

  if (db) {
    try {
      const colRef = collection(db, 'system_incident_logs');
      const q = query(colRef, orderBy('createdAt', 'desc'), limit(maxCount));
      const snap = await getDocs(q);

      firestoreLogs = snap.docs.map(doc => {
        const d = doc.data();
        let displayTime = d.displayTime;
        if (d.createdAt && typeof d.createdAt.toDate === 'function') {
          displayTime = d.createdAt.toDate().toLocaleString('vi-VN');
        }
        return {
          id: doc.id,
          ...d,
          displayTime: displayTime || d.timestamp || 'Vừa xong'
        };
      });
    } catch (err) {
      console.warn('[SystemLogger] Truy vấn Firestore lỗi, chuyển sang lấy từ LocalStorage:', err);
    }
  }

  // Nếu Firestore có dữ liệu, trả về
  if (firestoreLogs.length > 0) {
    return firestoreLogs;
  }

  // Fallback: Nếu Firestore trống hoặc offline, lấy từ LocalStorage
  try {
    const rawLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
    return rawLocal ? JSON.parse(rawLocal) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Xóa toàn bộ hoặc dọn dẹp các sự cố cũ trên hệ thống (Dành cho Super Admin)
 */
export async function clearAllIncidentLogs() {
  // Xóa LocalStorage
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {}

  // Xóa Firestore
  if (!db) return true;
  try {
    const colRef = collection(db, 'system_incident_logs');
    const snap = await getDocs(query(colRef, limit(200)));
    const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'system_incident_logs', d.id)));
    await Promise.all(deletePromises);
    return true;
  } catch (err) {
    console.error('[SystemLogger] Lỗi xóa log trên Firestore:', err);
    throw err;
  }
}

/**
 * Xuất dữ liệu nhật ký sự cố hệ thống ra file CSV chuẩn UTF-8 BOM
 * Phục vụ làm Phụ lục minh chứng khoa học (Báo cáo độ tin cậy hệ thống & tỷ lệ tự khắc phục lỗi)
 * @param {Array} logs
 */
export function exportIncidentLogsToCSV(logs = []) {
  if (!logs || logs.length === 0) {
    throw new Error('Chưa có dữ liệu nhật ký sự cố nào để xuất báo cáo.');
  }

  const headers = [
    'Mã sự cố',
    'Thời gian ghi nhận',
    'Mức độ (Level)',
    'Phân loại lỗi',
    'Nguồn phát sinh',
    'Thông điệp',
    'Chi tiết kỹ thuật',
    'Địa chỉ IP',
    'Tài khoản người dùng',
    'Lớp học',
    'Kết quả xử lý'
  ];

  const rows = logs.map(l => [
    l.id || '',
    l.displayTime || l.timestamp || '',
    l.level || '',
    l.errorType || '',
    l.source || '',
    (l.message || '').replace(/"/g, '""'),
    (l.details || '').replace(/"/g, '""'),
    l.clientIp || '',
    l.userEmail || '',
    l.userClass || '',
    (l.resolution || '').replace(/"/g, '""')
  ]);

  const csvContent = '\uFEFF' + [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(r => r.map(c => `"${c}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const fileName = `Minh_Chung_Nhat_Ky_He_Thong_CodeMind10_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
