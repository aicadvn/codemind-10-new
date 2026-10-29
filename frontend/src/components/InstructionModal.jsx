import { useState } from 'react';
import { 
  X, 
  BookOpen, 
  MessageSquare, 
  Code, 
  Play, 
  Bug, 
  Sparkles, 
  Award, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  Terminal, 
  ShieldCheck, 
  GraduationCap,
  Layers,
  Search
} from 'lucide-react';

export default function InstructionModal({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'student' | 'diary' | 'teacher'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col h-[90vh] max-h-[820px] overflow-hidden border border-slate-100 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 p-5 flex justify-between items-center text-white shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
              <BookOpen size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                Cẩm Nang Hướng Dẫn Sử Dụng CodeMind 10
              </h2>
              <p className="text-xs text-white/90">
                Chương trình Tin học 10 • Trường THPT Lạng Giang số 1 • Tác giả: Cô Trần Thị Ngà
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
            title="Đóng cửa sổ (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Thanh chuyển danh mục hướng dẫn nhanh */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 py-2 gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Tất cả hướng dẫn (7 mục)
          </button>
          <button
            onClick={() => setActiveCategory('diary')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeCategory === 'diary'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            ⭐ Sổ Tay Săn Bug & Lịch Sử Đàm Thoại (Mới)
          </button>
          <button
            onClick={() => setActiveCategory('student')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeCategory === 'student'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Học tập & Soạn thảo Code
          </button>
          <button
            onClick={() => setActiveCategory('teacher')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeCategory === 'teacher'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Dành cho Giáo viên (Dashboard 9 Lớp)
          </button>
        </div>

        {/* Danh sách các hướng dẫn chi tiết */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-slate-700 bg-white">
          
          {/* MỤC 1: HỌC CÙNG GIA SƯ AI SOCRATES */}
          {(activeCategory === 'all' || activeCategory === 'student') && (
            <div className="flex gap-3.5 sm:gap-4 items-start p-4 rounded-2xl bg-cyan-50/60 border border-cyan-100">
              <div className="bg-cyan-600 text-white p-2.5 rounded-xl shrink-0 mt-0.5 shadow-sm">
                <MessageSquare size={20} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900">1. Học Cùng Gia Sư AI Socrates</h3>
                  <span className="text-[10px] bg-cyan-100 text-cyan-800 font-extrabold px-2 py-0.5 rounded-full">Phương pháp cốt lõi</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Tại khung chat ở giữa, bạn trò chuyện trực tiếp cùng <b>Gia sư CodeMind</b>. Thay vì giải hộ hoặc đưa ngay code mẫu làm bạn mất khả năng suy nghĩ, AI sẽ áp dụng <b>phương pháp Socratic</b>: liên tục đặt các câu hỏi định hướng, gợi mở từng bước để bạn tự tìm ra thuật toán.
                </p>
                <div className="text-xs text-cyan-800 font-semibold bg-white/80 p-2 rounded-lg border border-cyan-200">
                  💡 <i>Mẹo:</i> Hãy chọn bài học tương ứng trên thanh danh mục bên trái trước khi bắt đầu chat để AI bám sát đúng chuẩn kiến thức bài đó!
                </div>
              </div>
            </div>
          )}

          {/* MỤC 2: VIẾT CODE & CHẠY THỬ */}
          {(activeCategory === 'all' || activeCategory === 'student') && (
            <div className="flex gap-3.5 sm:gap-4 items-start p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <div className="bg-emerald-600 text-white p-2.5 rounded-xl shrink-0 mt-0.5 shadow-sm">
                <Code size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-base text-slate-900">2. Trình Soạn Thảo Python & Chạy Thử Trực Tuyến</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Khu vực bên phải là <b>Trình soạn thảo Python chuẩn công nghiệp</b> (chạy trực tiếp trên trình duyệt bằng công nghệ WebAssembly Pyodide).
                </p>
                <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 pl-1">
                  <li className="flex items-center gap-2">
                    <Play size={14} className="text-emerald-600 fill-emerald-600 shrink-0" />
                    <span>Bấm nút <b>"Chạy Thử"</b> để thực thi chương trình và xem kết quả tại khung Console màu đen.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span><b>Hỗ trợ hàm input():</b> Khi code có lệnh <code>input()</code>, hệ thống sẽ mở pop-up trực quan hỏi dữ liệu nhập từ bàn phím.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span><b>Tự động lưu đám mây:</b> Code được tự động lưu sau mỗi thay đổi, chuyển đổi máy tính hay điện thoại không bao giờ mất bài.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* MỤC 3: TÍNH NĂNG SĂN BUG (GỠ LỖI NHANH) */}
          {(activeCategory === 'all' || activeCategory === 'student') && (
            <div className="flex gap-3.5 sm:gap-4 items-start p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <div className="bg-amber-600 text-white p-2.5 rounded-xl shrink-0 mt-0.5 shadow-sm">
                <Bug size={20} />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-base text-slate-900">3. Nút Săn Bug (AI) — Trợ Thủ Bắt Mạch Sự Cố</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Khi chương trình chạy báo lỗi đỏ tại Console, bạn không cần chép lỗi thủ công:
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  👉 Chỉ cần nhấn nút <b>"Săn Bug (AI)"</b> màu cam trên thanh công cụ soạn thảo. Hệ thống sẽ tự động chuyển đoạn code vi phạm và thông báo lỗi sang cho Gia sư AI để bắt mạch chỉ dẫn. Đồng thời, toàn bộ sự cố này sẽ được tự động ghi chép vào <b>Sổ tay Săn Bug</b> của riêng bạn!
                </p>
              </div>
            </div>
          )}

          {/* MỤC 4: SỔ TAY SĂN BUG & XEM LẠI CODE LỖI (TÍNH NĂNG MỚI ĐẶC BIỆT) */}
          {(activeCategory === 'all' || activeCategory === 'diary') && (
            <div className="flex gap-3.5 sm:gap-4 items-start p-4 rounded-2xl bg-orange-50/80 border-2 border-orange-200 shadow-sm">
              <div className="bg-orange-600 text-white p-2.5 rounded-xl shrink-0 mt-0.5 shadow-sm">
                <Award size={20} />
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base text-slate-900">
                    4. Sổ Tay Săn Bug Tương Tác & Ôn Tập Đoạn Code Lỗi
                  </h3>
                  <span className="text-[10px] bg-orange-500 text-white font-black px-2 py-0.5 rounded-full uppercase">Tính năng mới</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Để mở Sổ tay, hãy click nút <b>"Sổ tay Săn Bug & Nhật ký của em"</b> tại thanh menu bên trái. Tại đây bạn có thể tương tác đầy đủ:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="bg-white p-2.5 rounded-xl border border-orange-200">
                    <b>🔍 Xem chi tiết Code & Lỗi:</b> Bấm vào từng thẻ sự cố để mở rộng xem lại chính xác đoạn mã Python lúc đó cùng thông báo lỗi Console. Có nút <i>"Sao chép code"</i> nhanh.
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-orange-200">
                    <b>💡 Mẹo Sư Phạm Cô Trần Thị Ngà:</b> Hệ thống tự động giải thích bản chất lỗi (SyntaxError, IndentationError, NameError...) và chỉ bạn cách tư duy sửa bài.
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-orange-200">
                    <b>🚀 Mở bài trong Trình Soạn Thảo:</b> Bấm nút này để hệ thống tự động nhảy thẳng vào bài học đó trong Editor để bạn sửa bài lập tức.
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-orange-200">
                    <b>🎯 Bộ lọc & Tìm kiếm thông minh:</b> Lọc theo từng bài từ Bài 1 đến Bài 17, lọc theo nhóm loại lỗi hoặc gõ từ khóa tìm kiếm.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MỤC 5: XEM LẠI LỊCH SỬ ĐÀM THOẠI SOCRATES (TÍNH NĂNG MỚI ĐẶC BIỆT) */}
          {(activeCategory === 'all' || activeCategory === 'diary') && (
            <div className="flex gap-3.5 sm:gap-4 items-start p-4 rounded-2xl bg-cyan-50/80 border-2 border-cyan-200 shadow-sm">
              <div className="bg-cyan-600 text-white p-2.5 rounded-xl shrink-0 mt-0.5 shadow-sm">
                <Sparkles size={20} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base text-slate-900">
                    5. Tra Cứu Lịch Sử Đàm Thoại Socrates Theo 17 Bài Học
                  </h3>
                  <span className="text-[10px] bg-cyan-600 text-white font-black px-2 py-0.5 rounded-full uppercase">Tính năng mới</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Trong cửa sổ Sổ tay, chuyển sang <b>Tab 2: "Lịch Sử Đàm Thoại Socrates"</b>:
                </p>
                <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 pl-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-cyan-600 mt-0.5 shrink-0" />
                    <span><b>Chọn bài học cần xem lại:</b> Dễ dàng chọn bất kỳ bài nào từ Bài 1 đến Bài 17 để xem lại toàn bộ câu hỏi và gợi ý từng bước mà Gia sư AI đã hướng dẫn bạn.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-cyan-600 mt-0.5 shrink-0" />
                    <span><b>Tiếp tục đàm thoại:</b> Nhấn nút <i>"Tiếp tục đàm thoại ở bài này"</i> để mở bài đó ra và trò chuyện tiếp với AI mà không bị đứt đoạn tư duy.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* MỤC 6: BẢN ĐỒ 17 BÀI HỌC & THĂNG HẠNG NĂNG LỰC */}
          {(activeCategory === 'all' || activeCategory === 'diary') && (
            <div className="flex gap-3.5 sm:gap-4 items-start p-4 rounded-2xl bg-teal-50/80 border-2 border-teal-200 shadow-sm">
              <div className="bg-teal-600 text-white p-2.5 rounded-xl shrink-0 mt-0.5 shadow-sm">
                <Layers size={20} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base text-slate-900">
                    6. Bản Đồ 17 Bài Học & Hệ Thống Huy Hiệu Năng Lực (Gamification)
                  </h3>
                  <span className="text-[10px] bg-teal-600 text-white font-black px-2 py-0.5 rounded-full uppercase">Chủ đề F SGK</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Chuyển sang <b>Tab 3: "Bản Đồ 17 Bài Học"</b> trong Sổ tay:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-xl border border-amber-200 text-amber-800 font-bold">
                    Học viên Khởi động 🌱
                    <span className="block text-[10px] font-normal text-slate-400">0 — 5 bài</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-blue-200 text-blue-800 font-bold">
                    Thợ săn Bug Chăm chỉ 🥈
                    <span className="block text-[10px] font-normal text-slate-400">6 — 11 bài</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-emerald-200 text-emerald-800 font-bold">
                    Chuyên viên Thuật toán 🥇
                    <span className="block text-[10px] font-normal text-slate-400">12 — 16 bài</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-purple-200 text-purple-800 font-bold">
                    Chiến binh Python 🏆
                    <span className="block text-[10px] font-normal text-slate-400">17 bài xuất sắc</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 italic mt-1">
                  * Mỗi bài hoàn thành đều có tích xanh ✅ và nút "Vào học" / "Ôn lại" để học sinh chủ động lộ trình.
                </p>
              </div>
            </div>
          )}

          {/* MỤC 7: DÀNH CHO GIÁO VIÊN */}
          {(activeCategory === 'all' || activeCategory === 'teacher') && (
            <div className="flex gap-3.5 sm:gap-4 items-start p-4 rounded-2xl bg-indigo-50/80 border-2 border-indigo-200 shadow-sm">
              <div className="bg-indigo-600 text-white p-2.5 rounded-xl shrink-0 mt-0.5 shadow-sm">
                <BarChart3 size={20} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base text-slate-900">
                    7. Dành Cho Giáo Viên — Bảng Điều Khiển Sư Phạm & Dữ Liệu NCKH
                  </h3>
                  <span className="text-[10px] bg-indigo-600 text-white font-black px-2 py-0.5 rounded-full uppercase">Quản trị sư phạm</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Khi đăng nhập bằng tài khoản Giáo viên được cấp quyền (hoặc nhập mã PIN bảo mật), giao diện sẽ hiển thị nút <b>"Bảng Điều Khiển Sư Phạm (9 Lớp)"</b>:
                </p>
                <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 pl-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-indigo-600 mt-0.5 shrink-0" />
                    <span><b>Giám sát thời gian thực:</b> Theo dõi quy mô học sinh, tỷ lệ hoàn thành bài học và số lượng lỗi lập trình học sinh đã tự khắc phục phân theo từng lớp từ 10A1 đến 10A9.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-indigo-600 mt-0.5 shrink-0" />
                    <span><b>Xuất dữ liệu Excel (.CSV) 1-Click:</b> Xuất toàn bộ tiến trình và số liệu thực nghiệm định lượng phục vụ trực tiếp cho việc viết Đề án Nghiên cứu khoa học và Sáng kiến kinh nghiệm (SKKN).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-indigo-600 mt-0.5 shrink-0" />
                    <span><b>Xem thử Sổ tay Bug học sinh:</b> Giáo viên cũng có nút truy cập nhanh Sổ tay Săn Bug cá nhân để kiểm thử trải nghiệm như một học sinh.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            © 2026 CodeMind 10 • THPT Lạng Giang số 1 • Tỉnh Bắc Ninh
          </span>
          <button 
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-sm text-xs sm:text-sm ml-auto"
          >
            Đã hiểu, quay lại học!
          </button>
        </div>

      </div>
    </div>
  );
}
