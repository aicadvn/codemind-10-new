---
title: "BÁO CÁO TỔNG KẾT HIỆN TRẠNG VÀ ĐỀ ÁN NÂNG CẤP DỰ ÁN CODEMIND 10"
subtitle: "Gia sư Lập trình Python AI - Bản quyền THPT Lạng Giang số 1"
author:
  - "Chuyên gia Tư vấn Kiến trúc Hệ thống & Công nghệ Giáo dục"
  - "Phụ trách chuyên môn: Giáo viên Trần Thị Ngà"
date: "15/10/2026"
geometry: "margin=2.5cm"
output:
  word_document:
    toc: true
    toc_depth: 3
    number_sections: true
---

# THÔNG TIN TÀI LIỆU VÀ ĐỐI TƯỢNG ÁP DỤNG

* **Tên sản phẩm:** **CodeMind 10** — Ứng dụng Web AI Gia sư Lập trình Python 10.
* **Đơn vị chủ quản & Bản quyền:** Trường **THPT Lạng Giang số 1** (Tỉnh Bắc Giang).
* **Tác giả / Phụ trách chuyên môn:** **Giáo viên Trần Thị Ngà**.
* **Đối tượng phục vụ:** Học sinh lớp 10 học chương trình Tin học theo bộ sách giáo khoa **Kết nối tri thức với cuộc sống** (Trọng tâm: **Chủ đề 5 - Giải quyết vấn đề với sự trợ giúp của máy tính / Lập trình Python cơ bản**).
* **Kho lưu trữ mã nguồn:** 
  * Đường dẫn cục bộ: `D:\GITHUB\TIN10\CodeMind10`
  * Kho mã nguồn trực tuyến (GitHub): `https://github.com/nguyentrunghoa/codemind-10.git`
* **Mục đích tài liệu:** Lưu trữ nguyên văn toàn bộ kết quả phân tích, đánh giá hiện trạng mã nguồn dự án (Phiên làm việc 1) và Đề án tư vấn kỹ thuật nâng cấp tích hợp Google Firebase (Phiên làm việc 2) nhằm phục vụ công tác theo dõi, nghiệm thu và thực thi nâng cấp.

---

# PHẦN I: BÁO CÁO TỔNG QUAN, LỊCH SỬ PHÁT TRIỂN VÀ HIỆN TRẠNG DỰ ÁN (KẾT QUẢ PHIÊN LÀM VIỆC 1)

## 1. Kiến trúc Hệ thống và Công nghệ đã Triển khai

CodeMind 10 được xây dựng dựa trên mô hình Client-Server phân tách hiện đại, tối ưu hóa triệt để cho điều kiện phòng máy tính của các trường phổ thông tại Việt Nam:

### 1.1. Phân hệ Giao diện Người dùng (Frontend)
* **Khung ứng dụng:** **React 19** (`^19.2.4`) kết hợp công cụ đóng gói siêu tốc **Vite 8** (`^8.0.0`) và hệ thống tiện ích giao diện **TailwindCSS v4** (`^4.2.1`).
* **Trình soạn thảo mã nguồn chuyên nghiệp:** Tích hợp **Monaco Editor** (`@monaco-editor/react` v4.7.0) — lõi soạn thảo tương tự Visual Studio Code, hỗ trợ tô màu cú pháp Python, đóng mở ngoặc tự động, phím tắt chuẩn quốc tế và chuyển đổi giao diện Sáng / Tối (VS Light / VS Dark).
* **Cơ chế lưu trữ tức thời:** Tự động lưu mã nguồn đang gõ của học sinh vào `localStorage` sau mỗi 1000ms (1 giây), đảm bảo không bao giờ bị mất bài khi vô tình tải lại trang.
* **Môi trường thực thi Python trong Trình duyệt (Pyodide WebAssembly):**
  * Tích hợp **Pyodide v0.25.0** nạp qua CDN toàn cầu tại thẻ `<script>` ở `index.html`.
  * Toàn bộ mã nguồn Python được biên dịch và chạy bằng WebAssembly trực tiếp trên CPU của máy tính học sinh mà **không tiêu tốn tài nguyên máy chủ Backend**.
  * Chuyển hướng thành công luồng xuất dữ liệu (`sys.stdout`, `sys.stderr`) về khung Console đen bên dưới màn hình.
  * Tái định nghĩa hàm nhập dữ liệu `builtins.input` bằng hàm `custom_input` thông qua `js.prompt()`, cho phép học sinh tương tác nhập dữ liệu bài toán thực tế.
* **Trợ giảng AI Trực quan (Chatbot Pane):** Hiển thị hội thoại định dạng Markdown với thư viện `react-markdown`, biểu tượng `lucide-react`, thanh cuộn tự động (auto-scroll) và animation phản ánh trạng thái AI đang suy nghĩ.
* **Bố cục giao diện thích ứng (Responsive UI Layout):**
  * *Trên màn hình máy tính (Desktop):* Bố cục 3 cột đồng thời với tỷ lệ: **20% Lộ trình SGK** — **40% Gia sư AI** — **40% Trình soạn thảo & Console**.
  * *Trên màn hình di động / Máy tính bảng:* Hệ thống thanh điều hướng tab thông minh (Lộ trình / Gia sư AI / Code) giúp thao tác thuận tiện.

### 1.2. Phân hệ Máy chủ và Điều phối AI (Backend)
* **Nền tảng:** **Node.js** (chuẩn ES Modules), **Express 5** (`^5.2.1`), `cors`, `dotenv`.
* **Cơ chế gọi Trí tuệ nhân tạo:** Tích hợp SDK chính thức `@google/genai` (`^1.45.0`), sử dụng mô hình trí tuệ nhân tạo thế hệ mới **Gemini 2.5 Flash** cho tốc độ phản hồi cực nhanh.
* **Nguyên tắc Sư phạm Socrates (System Instruction):**
  * Tuyệt đối không cung cấp đoạn code giải sẵn hoàn chỉnh từ A đến Z.
  * Đóng vai "Thám tử", đặt chuỗi câu hỏi gợi mở tư duy logic cho học sinh.
  * Phân rã bài toán thành các chặng nhỏ (Chiến thuật Leo rank).
  * Hướng dẫn học sinh tự tìm và sửa lỗi cú pháp, thụt lề, logic (Bug Hunter).
  * Mở rộng tư duy bằng cách liên hệ bài học với ứng dụng công nghệ thực tiễn.
* **Bảo vệ Hệ thống & Chống Hack Prompt (Anti-Jailbreak Guardrails):**
  * Giới hạn phạm vi giải đáp chỉ nằm trong môn Tin học 10 SGK Kết nối tri thức.
  * Nghiêm cấm tiết lộ prompt hệ thống và từ chối các câu hỏi nằm ngoài phạm vi học tập bằng giọng văn hài hước, thân thiện.
* **Kiểm soát truy cập:** Endpoint `/api/verify-passcode` xác thực mã bảo mật lớp học trước khi cho phép vào phòng học.

---

## 2. Nhật ký Phát triển Toàn diện (Toàn bộ 17 Mốc Commit Git)

Lịch sử phát triển của CodeMind 10 được ghi nhận chi tiết qua 17 bản commit trên nhánh chính (`main`), phản ánh quá trình xây dựng, tối ưu hóa và sửa lỗi nghiêm ngặt:

| STT | Mã Commit | Thời gian (UTC+7) | Người thực hiện | Tóm tắt Nội dung Kỹ thuật | Ý nghĩa Sư phạm & Vận hành |
|:---:|:---:|:---:|:---:|:---|:---|
| **1** | `d6507c2` | 14/03/2026 16:38 | Nguyen | First commit CodeMind 10 | Khởi tạo cấu trúc dự án React + Express |
| **2** | `bfdb31b` | 14/03/2026 17:30 | Nguyen | Fix Gemini API 400 error by ensuring chat history starts with user role | Sửa lỗi 400 của Google Gemini: tự động chèn câu chào mồi của `user` trước phản hồi của `model` |
| **3** | `1baed17` | 14/03/2026 17:40 | Nguyen | Remove .env from repository and add .gitignore | Bảo vệ an toàn bảo mật, loại bỏ biến môi trường chứa API Key khỏi kho lưu trữ |
| **4** | `b2be3e9` | 14/03/2026 19:17 | Nguyen | Implement true Python execution using Pyodide engine | Tích hợp thành công môi trường biên dịch Python WebAssembly trực tiếp trong trình duyệt |
| **5** | `98d7773` | 14/03/2026 19:25 | Nguyen | Downgrade Pyodide to v0.23.4 to fix Vite production build loading error | Kiểm thử sự tương thích của Pyodide với gói đóng gói mã nguồn Vite |
| **6** | `4db0182` | 14/03/2026 19:29 | Nguyen | Fix Pyodide loading issue by injecting script tag directly in index.html | Đưa thẻ nạp Pyodide ra phạm vi toàn cục trong `index.html` để tránh xung đột nén code khi build |
| **7** | `4356588` | 14/03/2026 20:20 | Nguyen | Customize App UI and Content for THPT Lang Giang | Xây dựng lộ trình chuẩn 17 bài học Tin học 10 KNTT và nhận diện trường THPT Lạng Giang 1 |
| **8** | `8a09b9c` | 14/03/2026 20:35 | Nguyen | Fix Chatbot UI layout where the last line of text was obscured | Khắc phục lỗi giao diện: mở rộng khoảng đệm dưới chân chat để không bị khung nhập che chữ |
| **9** | `2383500` | 14/03/2026 21:20 | Nguyen | Add Login screen with passcode verification and School Logo | Bổ sung màn hình đăng nhập bảo vệ bằng mật khẩu lớp học và hiển thị logo trường |
| **10** | `1b9c1c6` | 14/03/2026 21:27 | Nguyen | Fix UI layout: prevent Subtitle text wrapping on Login screen | Khắc phục lỗi rớt dòng văn bản phụ đề thương hiệu trên màn hình đăng nhập |
| **11** | `35d0a51` | 14/03/2026 21:31 | Nguyen | Fix UI constraint: apply whitespace-nowrap and flex container | Đảm bảo tính toàn vẹn của giao diện đăng nhập trên các thiết bị màn hình hẹp |
| **12** | `8df7d35` | 14/03/2026 21:45 | Nguyen | Add instruction modal (User Guide) and trigger button in Sidebar | Xây dựng cửa sổ Modal Hướng dẫn sử dụng chi tiết 3 tính năng học tập cho học sinh |
| **13** | `ac03510` | 14/03/2026 21:49 | Nguyen | Fix blank screen: add missing React hooks import in App.jsx | Bổ sung import các React Hooks (`useState`, `useEffect`) còn thiếu |
| **14** | `8e6971f` | 14/03/2026 21:52 | Nguyen | Fix blank screen: restore deleted Sidebar and Chatbot imports in App | **Khắc phục triệt để lỗi Màn hình trắng (Blank Screen)**, phục hồi chu trình render hoàn chỉnh |
| **15** | `b28e349` | 14/03/2026 23:16 | Nguyen | Enhance Backend System Prompt: Add anti-jailbreak rules | Bổ sung rào chắn bảo mật AI: chống lộ prompt chỉ dẫn và giới hạn phạm vi môn học |
| **16** | `54988e1` | 15/03/2026 09:28 | Nguyen | Update branding: change 'Độc quyền' to 'Bản quyền' | Chuẩn hóa thông điệp: "Bản quyền THPT Lạng Giang số 1 — Giáo viên Trần Thị Ngà" |
| **17** | `d785344` | 16/03/2026 15:30 | Nguyen | Update chatbot prompt: Reorder initial lesson options | Tối ưu sư phạm: xếp ưu tiên **[1] Ôn tập kiến thức cũ**, **[2] Học bài mới**, **[3] Săn Bug** |

---

## 3. Danh mục Tính năng Cốt lõi đã Hoàn thiện 100%

1. **Khâu Kiểm soát Truy cập (Passcode Authentication):**
   * Bảo vệ ứng dụng bằng mật mã chung của lớp học thiết lập tại biến môi trường `APP_PASSCODE`.
   * Giao diện đăng nhập trang trọng với Logo THPT Lạng Giang số 1 và thông tin bản quyền giáo viên.
   * Duy trì phiên học qua `sessionStorage` (tự động giải phóng khi đóng tab trình duyệt).

2. **Lộ trình 17 Bài học Chuẩn SGK Tin học 10 (Sidebar):**
   * Phân chia thành 6 chủ đề kiến trúc rõ ràng:
     * *Chủ đề 1 - Mở đầu:* Bài 1 (Ngôn ngữ bậc cao & Python), Bài 2 (Biến và lệnh gán), Bài 3 (Lệnh vào ra đơn giản).
     * *Chủ đề 2 - Cấu trúc rẽ nhánh:* Bài 4 (Câu lệnh rẽ nhánh if).
     * *Chủ đề 3 - Cấu trúc lặp:* Bài 5 (Lặp for), Bài 6 (Lặp while).
     * *Chủ đề 4 - Kiểu dữ liệu cấu trúc:* Bài 7 & 8 (Kiểu dữ liệu danh sách List), Bài 9 & 10 (Xâu ký tự String).
     * *Chủ đề 5 - Chương trình con:* Bài 11 (Hàm trong Python), Bài 12 (Tham số hàm), Bài 13 (Phạm vi biến).
     * *Chủ đề 6 - Kiểm thử & Thực hành:* Bài 14 & 15 (Nhận biết lỗi & Gỡ lỗi), Bài 16 (Thực hành viết chương trình), Bài 17 (Ôn tập chủ đề 5).
   * Nút bấm tiện ích "Chuyển bài tiếp theo" và nút mở "Hướng dẫn sử dụng".

3. **Gia sư Trực quan AI (Chatbot Pane):**
   * Tương tác hỏi đáp thông minh, phân tích code lỗi, hướng dẫn theo mô hình sư phạm Socrates.
   * Menu tương tác 3 lựa chọn tức thì khi mở bất kỳ bài học nào.

4. **Trình Soạn thảo & Console Thực thi Code (Editor Pane):**
   * Môi trường Monaco Editor tốc độ cao với tính năng tự động lưu mã code.
   * Chạy code Python offline trực tiếp không cần mạng Internet nhờ Pyodide WebAssembly.
   * Nút **"Săn Bug (AI)"**: Tự động đóng gói mã code bị lỗi runtime tại editor chuyển sang cho Gia sư AI kèm câu lệnh phân tích chuyên sâu.

5. **Gói Bản dựng Đóng gói Sản phẩm (Production Build):**
   * Thư mục `frontend/dist/` đã được build và tối ưu hóa hoàn tất, sẵn sàng để deploy trực tiếp lên các nền tảng Web Hosting (Vercel, Cloudflare Pages, Netlify hoặc máy chủ nội bộ trường).

---

# PHẦN II: ĐỀ ÁN & TƯ VẤN KỸ THUẬT NÂNG CẤP TÍCH HỢP GOOGLE FIREBASE (KẾT QUẢ PHIÊN LÀM VIỆC 2)

## 1. Mục tiêu và Định hướng Nâng cấp Chiến lược

Mục tiêu của đợt nâng cấp là chuyển đổi CodeMind 10 từ một công cụ chạy trên từng máy tính đơn lẻ thành một **Nền tảng Học tập Trực tuyến Thông minh (Mini Learning Management System - LMS)**:
* Cho phép học sinh đăng nhập 1-click bằng tài khoản **Google / Gmail cá nhân** hoặc **Google Workspace giáo dục của nhà trường**.
* Lưu trữ tự động toàn bộ tiến trình học tập, danh sách bài học đã hoàn thành và lịch sử mã code của từng bài tập lên cơ sở dữ liệu đám mây **Cloud Firestore**.
* Tạo điều kiện học tập liền mạch: Học sinh làm dở bài tập trên máy tính trường học, khi về nhà mở điện thoại hoặc máy tính cá nhân lên là tiếp tục làm đúng đoạn code đó mà không bị gián đoạn.

---

## 2. Đánh giá Mức độ Phức tạp và Tính Khả thi

* **Độ phức tạp kỹ thuật:** **Mức độ 3/10 (Trung bình - Thấp / Dễ tiếp cận)**.
* **Thời gian hoàn thiện dự kiến:** Khoảng **1 đến 2 buổi làm việc** (tương đương 4 - 8 giờ làm việc tập trung).
* **Lý do khả thi cao:**
  1. **Firebase là mô hình BaaS (Backend-as-a-Service):** Google cung cấp sẵn toàn bộ hạ tầng chứng thực OAuth 2.0 và cơ sở dữ liệu NoSQL phân tán; không đòi hỏi phải thiết kế và quản trị máy chủ CSDL riêng (như MongoDB, PostgreSQL).
  2. **Tương thích hoàn hảo với React 19:** Bộ thư viện Firebase JavaScript SDK v10/v11 hỗ trợ cấu trúc Module gọn nhẹ, kết nối trực tiếp từ Frontend với hiệu năng cao.
  3. **Không làm xáo trộn Backend hiện tại:** Máy chủ Express 5 hiện tại tiếp tục đảm nhận việc gọi Gemini AI một cách độc lập; khâu xác thực tài khoản và lưu bài tập chạy trực tiếp giữa Trình duyệt và Firebase Cloud.
  4. **Chi phí vận hành:** **0 VNĐ (Hoàn toàn miễn phí)** với gói dịch vụ tiêu chuẩn *Firebase Spark Plan*.

---

## 3. Năm Điểm Then chốt Cần Lưu ý Khi Ứng dụng trong Môi trường Trường học

### 3.1. Vấn đề Máy tính Phòng học Dùng chung (Shared Lab Computers) — *Quan trọng hàng đầu*
* **Hiện tượng thực tế:** Các lớp học luân phiên ngồi vào cùng một máy tính (Ví dụ: Tiết 1 lớp 10A1 học, Tiết 2 lớp 10A2 vào ngồi đúng vị trí đó). Nếu học sinh lớp trước quên không đăng xuất, học sinh lớp sau sẽ truy cập thẳng vào tài khoản của bạn.
* **Biện pháp xử lý:**
  * Bố trí nút **"Đăng xuất" (Logout)** rõ ràng, kích thước lớn ở góc giao diện kèm ảnh đại diện và tên học sinh.
  * Tích hợp cơ chế cảnh báo tự động: Khi trình duyệt không có thao tác trong 40 phút, hệ thống tự động khóa phiên làm việc để bảo vệ dữ liệu học sinh.

### 3.2. Kiểm soát Hạn ngạch Miễn phí (Quota Management) bằng Kiến trúc Lưu kết hợp (Hybrid Save)
* **Quy định của Firebase (Gói miễn phí):**
  * Firebase Auth: Miễn phí không giới hạn đối với Google Sign-In.
  * Cloud Firestore: Giới hạn **50.000 lượt đọc (reads)/ngày** và **20.000 lượt ghi (writes)/ngày**.
* **Nguy cơ cạn kiệt Quota:** Hiện tại `EditorPane.jsx` lưu tự động sau mỗi 1 giây gõ phím. Nếu 45 học sinh cùng gõ liên tục trong 45 phút và ghi trực tiếp lên đám mây, 20.000 lượt ghi sẽ bị tiêu hao hết chỉ sau 1 buổi sáng!
* **Giải pháp Kiến trúc Hybrid Save (Tối ưu 95% tài nguyên):**
  * *Tầng 1 (Cục bộ):* Vẫn lưu tức thời (1s) vào `localStorage` của trình duyệt để học sinh không bao giờ bị trễ khi gõ phím.
  * *Tầng 2 (Đám mây):* Chỉ kích hoạt đẩy dữ liệu lên Firestore trong 3 tình huống cụ thể:
    1. Khi học sinh bấm nút **"Chạy thử"** hoặc **"Săn Bug (AI)"**.
    2. Cơ chế Debounce thông minh: Chỉ đồng bộ khi học sinh ngừng gõ phím trong khoảng **15 - 30 giây**.
    3. Khi học sinh bấm **"Chuyển bài tiếp theo"** hoặc trước khi bấm **"Đăng xuất"**.

### 3.3. Thiết lập Luật Phân quyền Bảo vệ Dữ liệu (Firestore Security Rules)
* **Nguyên tắc an toàn:** Tuyệt đối không để cơ sở dữ liệu ở chế độ công khai (`allow read, write: if true;`).
* **Luật chuẩn bảo mật:** Chỉ cho phép học sinh đọc và chỉnh sửa đúng tài liệu mang mã định danh (`request.auth.uid`) của chính mình:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3.4. Quản lý Tên miền Đăng nhập (Domain Restriction)
* **Tùy chọn nâng cao:** Nếu trường THPT Lạng Giang số 1 có cấp email định danh cho học sinh (ví dụ dạng `tenhocsinh@thptlanggiang1.edu.vn`), hệ thống có thể cấu hình để chỉ chấp thuận tài khoản có tên miền của trường đăng nhập.
* **Tùy chọn linh hoạt:** Nếu học sinh dùng email cá nhân, hệ thống cho phép mọi địa chỉ `@gmail.com` hợp lệ đăng nhập vào phòng học.

### 3.5. Cơ chế Dự phòng khi Mất kết nối Internet (Offline Fallback)
* Cloud Firestore có sẵn cơ chế Offline Persistence (lưu bộ đệm cục bộ IndexedDB). Khi phòng máy trường bị rớt mạng tạm thời, học sinh vẫn viết code và chạy thử bình thường bằng Pyodide WebAssembly. Khi mạng khôi phục, bài làm sẽ tự động đồng bộ lên đám mây.
* Đồng thời duy trì một liên kết dự phòng: *"Đăng nhập nhanh bằng Passcode lớp học"* để giáo viên chủ động xử lý trong các tình huống khẩn cấp.

---

## 4. Thiết kế Mô hình Dữ liệu Đám mây (Cloud Firestore Schema)

Hệ thống dữ liệu NoSQL được tổ chức chuẩn hóa theo dạng phân cấp:

```text
📁 users (Collection gốc)
   │
   └── 📄 {student_uid} (Document ID là Google UID của học sinh)
        │
        ├── 👤 profile: {
        │       email: "hocsinh@gmail.com",
        │       displayName: "Nguyễn Văn A",
        │       photoURL: "https://lh3.googleusercontent.com/...",
        │       lastLogin: Timestamp
        │   }
        │
        ├── 🎯 progress: {
        │       currentLessonId: 4,               // Bài học đang mở
        │       completedLessons: [1, 2, 3]       // Danh sách các bài đã hoàn thành
        │   }
        │
        └── 📁 codeSnippets (Sub-collection lưu mã bài tập)
             ├── 📄 lesson_1: { code: "...", updatedAt: Timestamp }
             ├── 📄 lesson_2: { code: "...", updatedAt: Timestamp }
             ├── 📄 lesson_3: { code: "...", updatedAt: Timestamp }
             └── 📄 lesson_4: { code: "...", updatedAt: Timestamp }
```

*Đánh giá thiết kế:* Phân tách mã nguồn từng bài thành từng document riêng biệt giúp giảm tải dung lượng tải trang, học sinh mở bài nào chỉ đọc dữ liệu bài đó, tiết kiệm tối đa hạn ngạch Firestore.

---

## 5. Kế hoạch Hành động và Quy trình Triển khai 4 Bước

```text
+-------------------------------------------------------------------------------+
|  BƯỚC 1: KHỞI TẠO DỊCH VỤ TRÊN GOOGLE FIREBASE CONSOLE (15 phút)              |
|  - Tạo dự án 'codemind-10' trên Firebase Console                              |
|  - Kích hoạt Authentication với nhà cung cấp Google                           |
|  - Kích hoạt Firestore Database tại khu vực 'asia-southeast1' (Singapore)     |
|  - Trích xuất thông tin cấu hình SDK (firebaseConfig)                         |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|  BƯỚC 2: CÀI ĐẶT THƯ VIỆN & CẤU HÌNH TẠI MÃ NGUỒN FRONTEND (15 phút)          |
|  - Chạy lệnh 'npm install firebase' trong thư mục 'frontend'                   |
|  - Tạo file khởi tạo kết nối: 'frontend/src/firebase.js'                      |
|  - Tạo Context quản lý trạng thái đăng nhập: 'frontend/src/context/AuthContext'|
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|  BƯỚC 3: CẬP NHẬT CÁC THÀNH PHẦN GIAO DIỆN (UI COMPONENTS) (60 - 90 phút)      |
|  - Nâng cấp 'Login.jsx': Thêm nút 'Đăng nhập với Google'                      |
|  - Cập nhật 'Sidebar.jsx': Hiển thị Avatar học sinh, tích xanh bài hoàn thành |
|    và nút 'Đăng xuất' an toàn                                                 |
|  - Cập nhật 'EditorPane.jsx': Tích hợp cơ chế tải code theo từng bài từ mây   |
|    và lưu bài thông minh (Hybrid Save)                                        |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|  BƯỚC 4: THIẾT LẬP BẢO MẬT & KIỂM THỬ ĐA THIẾT BỊ (30 phút)                  |
|  - Đưa bộ luật Security Rules vào Firebase Console                            |
|  - Kiểm thử chéo: Đăng nhập máy tính trường học -> Làm bài 3 -> Về nhà mở     |
|    điện thoại kiểm tra tính đồng bộ tức thì của mã nguồn                      |
+-------------------------------------------------------------------------------+
```

---

# PHẦN III: BẢNG KIỂM TRA ĐỐI SOÁT & THỰC THI (ACTION CHECKLIST)

Bảng đối soát giúp Giáo viên và Kỹ sư triển khai kiểm tra từng tiêu chí kỹ thuật:

| Hạng mục kiểm tra | Tiêu chuẩn đánh giá | Trạng thái |
|:---|:---|:---:|
| **Xác thực Google** | Đăng nhập 1-click thành công, lấy đúng tên và ảnh đại diện học sinh | [ ] |
| **Bảo mật phòng máy** | Nút Đăng xuất hoạt động dứt điểm, xóa sạch session khi rời máy | [ ] |
| **Tiết kiệm hạn ngạch** | Áp dụng cơ chế Hybrid Save, không ghi liên tục mỗi giây lên Firestore | [ ] |
| **Phân quyền dữ liệu** | Tài khoản A không thể đọc trộm hay ghi đè bài làm của Tài khoản B | [ ] |
| **Đồng bộ đa thiết bị** | Đổi thiết bị (PC sang Mobile) dữ liệu bài học tự động hiển thị đầy đủ | [ ] |
| **Khả năng dự phòng** | Vẫn cho phép vào phòng học bằng Passcode nếu mạng Google bị gián đoạn | [ ] |

---

# KẾT LUẬN VÀ XÁC NHẬN BÀN GIAO

Tài liệu này ghi nhận nguyên văn toàn bộ hiện trạng kỹ thuật và đề án nâng cấp của dự án **CodeMind 10** tính đến ngày **15/10/2026**. Hệ thống đã sẵn sàng cho bước chuyển mình lên nền tảng đám mây Google Firebase nhằm phục vụ tốt nhất công tác dạy và học môn Tin học 10 tại trường **THPT Lạng Giang số 1**.
