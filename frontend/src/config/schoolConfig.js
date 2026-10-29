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

// 3. Danh sách các lớp học khối 10 của nhà trường (10 lớp: 10A1 đến 10D4)
export const SCHOOL_CLASSES = [
  '10A1',
  '10A4',
  '10A5',
  '10A6',
  '10A7',
  '10A8',
  '10D1',
  '10D2',
  '10D3',
  '10D4'
];

// 4. Danh sách 17 bài học bám sát SGK Tin học 10 (Chủ đề 5 - Lập trình giải quyết vấn đề với Python)
export const LESSONS = [
  { id: 1, title: "Ngôn ngữ lập trình bậc cao và Python", desc: "Làm quen với Python, môi trường lập trình và cách Python hoạt động.", topic: "Mở đầu" },
  { id: 2, title: "Biến và lệnh gán", desc: "Cách lưu trữ dữ liệu trong bộ nhớ bằng biến.", topic: "Mở đầu" },
  { id: 3, title: "Các lệnh vào ra đơn giản", desc: "Sử dụng input() và print() để giao tiếp với người dùng.", topic: "Mở đầu" },
  { id: 4, title: "Câu lệnh rẽ nhánh if", desc: "Dạy máy tính cách ra quyết định điều kiện.", topic: "Cấu trúc rẽ nhánh" },
  { id: 5, title: "Câu lệnh lặp for", desc: "Lặp với số lần biết trước trong Python.", topic: "Cấu trúc lặp" },
  { id: 6, title: "Câu lệnh lặp while", desc: "Lặp theo điều kiện chưa biết trước số lần.", topic: "Cấu trúc lặp" },
  { id: 7, title: "Kiểu dữ liệu danh sách", desc: "Lưu trữ nhiều giá trị trong một biến List.", topic: "Kiểu dữ liệu cấu trúc" },
  { id: 8, title: "Một số lệnh làm việc với dữ liệu danh sách", desc: "Thêm, sửa, xóa, sắp xếp danh sách.", topic: "Kiểu dữ liệu cấu trúc" },
  { id: 9, title: "Xâu ký tự", desc: "Xử lý văn bản và chuỗi (String).", topic: "Kiểu dữ liệu cấu trúc" },
  { id: 10, title: "Một số lệnh làm việc với xâu ký tự", desc: "Các hàm cắt chuỗi, tìm kiếm chuỗi.", topic: "Kiểu dữ liệu cấu trúc" },
  { id: 11, title: "Hàm trong Python", desc: "Đóng gói mã để tái sử dụng (def).", topic: "Chương trình con" },
  { id: 12, title: "Tham số của hàm", desc: "Truyền dữ liệu vào và lấy kết quả ra từ hàm.", topic: "Chương trình con" },
  { id: 13, title: "Phạm vi của biến", desc: "Biến cục bộ và biến toàn cục.", topic: "Chương trình con" },
  { id: 14, title: "Nhận biết lỗi chương trình", desc: "Phân loại lỗi cú pháp, lỗi ngoại lệ, lỗi logic.", topic: "Kiểm thử và gỡ lỗi" },
  { id: 15, title: "Kiểm thử và gỡ lỗi chương trình", desc: "Kỹ năng trace lỗi và debug.", topic: "Kiểm thử và gỡ lỗi" },
  { id: 16, title: "Thực hành viết chương trình đơn giản", desc: "Vận dụng tổng hợp các kiến thức.", topic: "Thực hành" },
  { id: 17, title: "Ôn tập lập trình Python", desc: "Tổng kết lại chủ đề 5.", topic: "Thực hành" }
];

export const TOPIC_SUMMARIES = {
  "Mở đầu": "Làm quen với khái niệm lập trình và cú pháp cơ bản của Python.",
  "Cấu trúc rẽ nhánh": "Điều khiển luồng chương trình bằng các câu lệnh điều kiện.",
  "Cấu trúc lặp": "Tự động hóa các tác vụ lặp đi lặp lại.",
  "Kiểu dữ liệu cấu trúc": "Làm việc với List và String - thao tác nhiều dữ liệu cùng lúc.",
  "Chương trình con": "Đóng gói mã lệnh thành các Hàm (Def) để dễ quản lý.",
  "Kiểm thử và gỡ lỗi": "Nhận diện và sửa các lỗi cú pháp, ngoại lệ và logic.",
  "Thực hành": "Ôn tập và vận dụng tổng hợp để viết ứng dụng thực tế."
};


