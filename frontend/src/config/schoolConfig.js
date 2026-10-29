// Cấu hình danh mục Nhà trường, Phân quyền Giáo viên và Danh sách Lớp học
// Trường THPT Lạng Giang số 1 (Năm học 2026 - 2027)

// 1. Danh sách Email Giáo viên được Whitelist (Tự động cấp quyền Teacher khi đăng nhập Google)
export const TEACHER_EMAILS = [
  'smilers.thp@gmail.com',    // Cô Trần Thị Ngà - GV Tin học THPT Lạng Giang số 1
  'nguyentrunghoa@gmail.com'  // Thầy Nguyễn Trung Hòa
].map(email => email.toLowerCase().trim());

// 2. Chi tiết cấu hình Giáo viên và Mã PIN Bảo mật riêng
export const TEACHER_PROFILES = {
  'smilers.thp@gmail.com': {
    name: 'Cô Trần Thị Ngà',
    role: 'Giáo viên phụ trách môn Tin học 10',
    school: 'THPT Lạng Giang số 1',
    pins: ['NGA_LG1_2026', '261088', '1088']
  },
  'nguyentrunghoa@gmail.com': {
    name: 'Thầy Nguyễn Trung Hòa',
    role: 'Giáo viên cố vấn Tin học',
    school: 'THPT Lạng Giang số 1',
    pins: ['HOA_LG1_2026', '261099', '1099']
  }
};

// Mã PIN Master chung của Ban Giảng Dạy
export const TEACHER_PIN = 'GV_LG1_2026';

// Danh sách tất cả mã PIN hợp lệ chấp nhận mở quyền Giáo viên dự phòng
export const VALID_TEACHER_PINS = [
  'GV_LG1_2026',  // Mã PIN Master
  'NGA_LG1_2026', // Mã riêng Cô Ngà
  '261088',       // Mã số nhanh Cô Ngà
  'HOA_LG1_2026', // Mã riêng Thầy Hòa
  '261099'        // Mã số nhanh Thầy Hòa
];

// 3. Danh sách các lớp học khối 10 của nhà trường (10A1 đến 10A9)
export const SCHOOL_CLASSES = [
  '10A1',
  '10A2',
  '10A3',
  '10A4',
  '10A5',
  '10A6',
  '10A7',
  '10A8',
  '10A9'
];

