import { useState } from 'react';
import { 
  Sparkles, 
  LogIn, 
  BookOpen, 
  Code2, 
  Bot, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Menu, 
  X, 
  Play, 
  Bug, 
  Cloud, 
  ShieldCheck, 
  BarChart3, 
  GraduationCap, 
  Users, 
  ChevronRight,
  School,
  Terminal,
  Cpu,
  Layers
} from 'lucide-react';
import logoImg from '../assets/Logo_moi_35b82.jpg';
import heroBgImg from '../assets/hero-bg.jpg';

export default function LandingPage({ onOpenLogin, onOpenInstruction }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cuộn mượt đến các section
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* 1. THANH ĐIỀU HƯỚNG CỐ ĐỊNH (STICKY NAVBAR) */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo & Tên dự án */}
            <div 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative">
                <img 
                  src={logoImg} 
                  alt="Logo THPT Lạng Giang số 1" 
                  className="w-11 h-11 sm:w-13 sm:h-13 rounded-full object-contain border-2 border-cyan-400/80 shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                    CodeMind 10
                  </span>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    AI Socratic
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium tracking-wide">
                  THPT Lạng Giang số 1 • Tỉnh Bắc Ninh
                </p>
              </div>
            </div>

            {/* Menu Items (Desktop) */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-3.5 py-2 rounded-xl text-xs lg:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-all"
              >
                Trang chủ
              </button>

              <button 
                onClick={() => scrollToSection('about')}
                className="px-3.5 py-2 rounded-xl text-xs lg:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-all"
              >
                Giới thiệu
              </button>

              <button 
                onClick={() => scrollToSection('curriculum')}
                className="px-3.5 py-2 rounded-xl text-xs lg:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-all"
              >
                Lộ trình 17 bài
              </button>

              <button 
                onClick={onOpenInstruction}
                className="px-3.5 py-2 rounded-xl text-xs lg:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-all flex items-center gap-1.5"
              >
                <BookOpen size={16} className="text-cyan-400" />
                Hướng dẫn sử dụng
              </button>

              {/* Nút Đăng nhập Nổi bật */}
              <button 
                onClick={onOpenLogin}
                className="ml-2 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold px-5 py-2.5 rounded-full text-xs lg:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <LogIn size={16} />
                Đăng nhập
              </button>
            </div>

            {/* Hamburger Button (Mobile) */}
            <div className="md:hidden flex items-center gap-2">
              <button 
                onClick={onOpenLogin}
                className="bg-cyan-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
              >
                <LogIn size={14} /> Đăng nhập
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

          </div>
        </div>

        {/* Menu Drawer (Mobile) */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-2 pb-5 space-y-2 animate-fade-in backdrop-blur-xl">
            <button 
              onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-900"
            >
              Trang chủ
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-900"
            >
              Giới thiệu
            </button>
            <button 
              onClick={() => scrollToSection('curriculum')}
              className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-900"
            >
              Lộ trình 17 bài học
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenInstruction(); }}
              className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-900 flex items-center gap-2"
            >
              <BookOpen size={16} className="text-cyan-400" />
              Hướng dẫn sử dụng
            </button>
            <div className="pt-2 border-t border-slate-800">
              <button 
                onClick={() => { setMobileMenuOpen(false); onOpenLogin(); }}
                className="w-full bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <LogIn size={18} /> Đăng nhập / Vào Lớp Học Ngay
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION HOÀNH TRÁNG TRÀN TOÀN MÀN HÌNH (FULL-VIEWPORT HERO) */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
        
        {/* Hình nền Công nghệ Giáo dục Hiện đại */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBgImg} 
            alt="CodeMind 10 Computer Science Lab" 
            className="w-full h-full object-cover object-center scale-105 filter brightness-75 contrast-125"
          />
          {/* Lớp phủ đa tầng Gradient sâu tạo độ tương phản văn bản hoàn hảo */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-transparent"></div>
          {/* Ánh sáng Accent đa sắc */}
          <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-indigo-500/20 rounded-full blur-[140px] pointer-events-none"></div>
        </div>

        {/* Nội dung chính Hero Section */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Cột Trái: Tiêu đề, Tuyên ngôn & Nút Kêu gọi Hành động */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Badge Thương hiệu & Đề tài */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/10 animate-fade-in">
                <Sparkles size={16} className="text-cyan-400 animate-pulse" />
                <span>ĐỀ ÁN NGHIÊN CỨU KHOA HỌC KỸ THUẬT</span>
              </div>

              {/* Tiêu đề Khủng (Headline) */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
                Hệ Thống Gia Sư AI Socratic <br />
                <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  Đột Phá Lập Trình Python 10
                </span>
              </h1>

              {/* Phụ đề mô tả chuyên sâu sư phạm */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Giải pháp chuyển đổi số giáo dục tiên tiến: Gia sư AI phản hồi Socratic gợi mở tư duy (không chép giải), trình biên dịch Python chạy ngay trên Web, tự động lưu vết lỗi vào <b>Sổ tay Săn Bug</b> và đồng bộ dữ liệu đám mây cho <b>9 lớp khối 10</b> trường THPT Lạng Giang số 1.
              </p>

              {/* Nhóm Nút Hành Động (CTA Buttons) */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button 
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-sm sm:text-base px-8 py-4 rounded-2xl shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 group"
                >
                  <LogIn size={20} className="group-hover:translate-x-0.5 transition-transform" />
                  <span>Vào Lớp Học / Đăng Nhập Ngay</span>
                  <ArrowRight size={18} />
                </button>

                <button 
                  onClick={onOpenInstruction}
                  className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm sm:text-base px-6 py-4 rounded-2xl border border-slate-700/80 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2.5 backdrop-blur-sm"
                >
                  <BookOpen size={19} className="text-cyan-400" />
                  <span>Xem Hướng Dẫn Sử Dụng</span>
                </button>
              </div>

              {/* Tác giả & Quyền sở hữu trí tuệ */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                  <GraduationCap size={15} className="text-emerald-400" />
                  <span>Tác giả: <b>Cô Trần Thị Ngà</b> (GV Tin học)</span>
                </div>
              </div>

            </div>

            {/* Cột Phải: Thẻ Mô Phỏng Tương Tác Socratic & Giao Diện Lập Trình */}
            <div className="lg:col-span-5 relative">
              
              {/* Vầng sáng sau thẻ */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-100 transition duration-1000"></div>

              {/* Thẻ Kính (Glassmorphism Mockup Card) */}
              <div className="relative bg-slate-900/90 rounded-3xl border border-slate-700/80 shadow-2xl p-5 sm:p-6 backdrop-blur-xl space-y-4">
                
                {/* Thanh tiêu đề cửa sổ Code */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
                    <span className="ml-2 text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
                      <Terminal size={14} className="text-cyan-400" /> bai18_nhap_xuat.py
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    ● Python 3.10 Web
                  </span>
                </div>

                {/* Đoạn Code minh họa */}
                <div className="bg-slate-950 rounded-xl p-3.5 font-mono text-xs text-slate-300 leading-relaxed border border-slate-800/80 space-y-1">
                  <p className="text-slate-500"># Bài 18: Các lệnh vào ra đơn giản</p>
                  <p><span className="text-purple-400">ten</span> = <span className="text-cyan-400">input</span>(<span className="text-amber-300">"Nhập tên bạn: "</span>)</p>
                  <p><span className="text-purple-400">tuoi</span> = <span className="text-cyan-400">int</span>(<span className="text-cyan-400">input</span>(<span className="text-amber-300">"Nhập tuổi: "</span>))</p>
                  <p className="text-emerald-400"><span className="text-cyan-400">print</span>(<span className="text-amber-300">f"Chào bạn {'{ten}'}, năm sau bạn {'{tuoi + 1}'} tuổi!"</span>)</p>
                </div>

                {/* Bong bóng Hội thoại Socratic AI */}
                <div className="space-y-3 pt-1">
                  
                  {/* Học sinh hỏi */}
                  <div className="flex gap-2.5 items-start">
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                      HS
                    </div>
                    <div className="bg-slate-800/90 rounded-2xl rounded-tl-none p-3 text-xs text-slate-200 border border-slate-700 leading-relaxed">
                      Em bị lỗi: <code className="text-rose-400 font-mono">ValueError: invalid literal for int()</code> thì xử lý thế nào ạ?
                    </div>
                  </div>

                  {/* Gia sư AI phản hồi Socratic */}
                  <div className="flex gap-2.5 items-start">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 shrink-0 shadow-md">
                      <Bot size={15} />
                    </div>
                    <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900 rounded-2xl rounded-tl-none p-3 text-xs text-cyan-200 border border-cyan-500/30 leading-relaxed">
                      <p className="font-semibold text-cyan-300 mb-1 flex items-center gap-1">
                        <Sparkles size={13} /> Gia sư AI Socratic:
                      </p>
                      Em hãy kiểm tra: Hàm <code className="text-amber-300">int()</code> chỉ có thể chuyển đổi chuỗi chứa các <b>chữ số nguyên</b>. Khi nhập thử nghiệm, em đã vô tình nhập chữ cái hay số thập phân chưa?
                    </div>
                  </div>

                </div>

                {/* Huy hiệu tính năng dưới thẻ */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <Cpu size={16} className="text-cyan-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block font-semibold">Gemini 3.5 AI</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <Cloud size={16} className="text-emerald-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block font-semibold">Lưu trữ Mây</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <Bug size={16} className="text-amber-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block font-semibold">Săn Bug 24/7</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* 3. THANH THỐNG SỐ ĐỘT PHÁ (STATS COUNTER BAR) */}
          <div className="mt-14 sm:mt-18 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/40 transition-all text-center group">
              <div className="text-3xl sm:text-4xl font-black text-cyan-400 group-hover:scale-105 transition-transform">17</div>
              <div className="text-xs sm:text-sm font-bold text-white mt-1">Bài Học SGK Chuẩn Hóa</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Chương trình Tin học 10 mới</p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800 hover:border-emerald-500/40 transition-all text-center group">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 group-hover:scale-105 transition-transform">9</div>
              <div className="text-xs sm:text-sm font-bold text-white mt-1">Lớp Khối 10</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Từ 10A1 đến 10A9 thực nghiệm</p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800 hover:border-teal-500/40 transition-all text-center group">
              <div className="text-3xl sm:text-4xl font-black text-teal-400 group-hover:scale-105 transition-transform">100%</div>
              <div className="text-xs sm:text-sm font-bold text-white mt-1">Săn Bug & Phân Loại Lỗi</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Nhận diện Syntax, Indentation,...</p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/40 transition-all text-center group">
              <div className="text-3xl sm:text-4xl font-black text-indigo-400 group-hover:scale-105 transition-transform">24/7</div>
              <div className="text-xs sm:text-sm font-bold text-white mt-1">Học Tập Liền Mạch</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Đồng bộ máy trường & điện thoại</p>
            </div>

          </div>

        </div>

      </section>

      {/* 4. SECTION: GIỚI THIỆU VỀ CODE MIND 10 (#about) */}
      <section id="about" className="py-20 bg-slate-900/50 relative border-t border-slate-800/80">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              Đổi Mới Phương Pháp Sư Phạm
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Giới thiệu về CODE MIND 10
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              CodeMind 10 không chỉ là phần mềm dạy học thông thường, mà là một hệ sinh thái sư phạm số toàn diện được xây dựng nhằm giải quyết triệt để các rào cản khi học sinh lớp 10 tiếp cận môn Lập trình Python.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Trụ cột 1 */}
            <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1.5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
                  <Bot size={28} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">1. Phương Pháp Gợi Mở Socratic</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Trái ngược với các công cụ AI thông thường sinh sẵn toàn bộ mã lời giải khiến học sinh ỷ lại, CodeMind 10 áp dụng phương pháp vấn đáp Socratic: chỉ đặt câu hỏi gợi mở, giúp học sinh tự tư duy để tìm ra nguyên nhân và cách giải quyết bài toán.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
                <CheckCircle2 size={15} /> Kích hoạt tư duy tự học
              </div>
            </div>

            {/* Trụ cột 2 */}
            <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1.5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                  <Bug size={28} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">2. Sổ Tay Săn Bug Cá Nhân</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Khi thực thi code bị lỗi (thụt lề <i>IndentationError</i>, cú pháp <i>SyntaxError</i>, gọi sai biến <i>NameError</i>...), hệ thống tự động lưu vết và phân loại khoa học vào Sổ tay Săn Bug để học sinh có thể xem lại bài học kinh nghiệm bất cứ lúc nào.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 size={15} /> Học sâu qua từng lỗi sai
              </div>
            </div>

            {/* Trụ cột 3 */}
            <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-1.5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-5">
                  <Cloud size={28} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">3. Học Liền Mạch & Offline Fallback</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Lưu trữ tự động toàn bộ code và tiến trình lên Cloud Firestore. Học sinh làm dở trên máy tính phòng máy nhà trường, khi về nhà mở điện thoại lên là tiếp tục làm đúng dòng code đó. Tích hợp bộ đệm IndexedDB bảo đảm không mất bài khi mất kết nối mạng.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-teal-400 font-semibold">
                <CheckCircle2 size={15} /> Xóa nhòa không gian học tập
              </div>
            </div>

            {/* Trụ cột 4 */}
            <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1.5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5">
                  <BarChart3 size={28} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">4. Dashboard & Minh Chứng NCKH</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bảng điều khiển sư phạm chuyên sâu dành cho giáo viên: theo dõi tỷ lệ hoàn thành của 9 lớp (10A1 đến 10A9), số lỗi học sinh gặp phải và trích xuất báo cáo Excel (.CSV) chuẩn hóa 1-Click làm dữ liệu thực nghiệm định lượng phục vụ viết đề tài SKKN.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
                <CheckCircle2 size={15} /> Hỗ trợ quản lý & NCKH
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* 5. SECTION: LỘ TRÌNH 17 BÀI HỌC CHUYÊN ĐỀ PYTHON 10 (#curriculum) */}
      <section id="curriculum" className="py-20 relative">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Chương Trình Chuẩn Hóa
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Lộ Trình 17 Bài Học Bám Sát SGK Tin Học 10
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Thiết kế theo ma trận kiến thức khoa học, đi từ làm quen cơ bản đến vận dụng giải quyết bài toán thuật toán thực tế.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Chuyên đề 1 */}
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 hover:border-cyan-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg">
                  CHỦ ĐỀ I
                </span>
                <span className="text-xs text-slate-500">Bài 1 — 5</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Làm Quen & Khởi Động Với Python</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Cài đặt môi trường, giao diện IDLE, các lệnh in màn hình cơ bản <code>print()</code>, phép toán số học và cú pháp khởi đầu.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-3">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-cyan-400 shrink-0" /> Khái niệm ngôn ngữ lập trình bậc cao</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-cyan-400 shrink-0" /> Các phép toán cộng, trừ, nhân, chia cơ bản</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-cyan-400 shrink-0" /> Chạy thử chương trình đầu tiên</li>
              </ul>
            </div>

            {/* Chuyên đề 2 */}
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                  CHỦ ĐỀ II
                </span>
                <span className="text-xs text-slate-500">Bài 6 — 11</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Biến, Kiểu Dữ Liệu & Rẽ Nhánh</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Lệnh nhập xuất dữ liệu <code>input()</code>, các kiểu số nguyên, số thực, xâu ký tự và cấu trúc điều kiện <code>if - elif - else</code>.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-3">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> Ép kiểu dữ liệu <code>int()</code>, <code>float()</code></li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> Biểu thức logic và phép so sánh</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> Cấu trúc rẽ nhánh giải phương trình bậc nhất</li>
              </ul>
            </div>

            {/* Chuyên đề 3 */}
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 hover:border-teal-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-lg">
                  CHỦ ĐỀ III
                </span>
                <span className="text-xs text-slate-500">Bài 12 — 17</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cấu Trúc Lặp, Hàm & Danh Sách</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Vòng lặp xác định <code>for</code>, vòng lặp không xác định <code>while</code>, định nghĩa hàm <code>def</code> và cấu trúc danh sách mảng <code>list</code>.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-3">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-teal-400 shrink-0" /> Tính tổng dãy số, tìm ước số, số nguyên tố</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-teal-400 shrink-0" /> Xử lý mảng phần tử, tìm Min/Max danh sách</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-teal-400 shrink-0" /> Đóng gói chương trình con với hàm <code>def</code></li>
              </ul>
            </div>

          </div>

          {/* CTA Box cuối lộ trình */}
          <div className="mt-12 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-emerald-950/60 rounded-3xl p-8 border border-cyan-500/30 text-center space-y-4">
            <h3 className="text-xl sm:text-2xl font-black text-white">Sẵn sàng nâng cao năng lực lập trình Tin học 10?</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Đăng nhập ngay hôm nay bằng tài khoản Google để lưu giữ hành trình học tập và sở hữu gia sư AI riêng biệt cho môn Tin học!
            </p>
            <button 
              onClick={onOpenLogin}
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black px-8 py-3.5 rounded-full text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all transform hover:scale-105"
            >
              Bắt Đầu Học Ngay (Miễn Phí 100%)
            </button>
          </div>

        </div>

      </section>

      {/* 6. CHÂN TRANG TRANG TRỌNG & THÔNG TIN BẢN QUYỀN (FOOTER) */}
      <footer className="bg-slate-950 border-t border-slate-800/80 pt-14 pb-10 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800">
            
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src={logoImg} 
                  alt="Logo THPT Lạng Giang số 1" 
                  className="w-12 h-12 rounded-full object-contain border-2 border-cyan-400/80 shadow-md"
                />
                <div>
                  <h4 className="text-base font-black text-white">CodeMind 10 • THPT Lạng Giang số 1</h4>
                  <p className="text-slate-400 text-[11px]">Hệ thống Gia sư AI Socratic Học Lập Trình Python</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Đề án nghiên cứu khoa học kỹ thuật nhằm nâng cao chất lượng dạy và học môn Tin học lớp 10 theo Chương trình GDPT 2018.
              </p>
            </div>

            <div className="md:col-span-4 space-y-2">
              <h5 className="text-sm font-bold text-white mb-2">Đơn vị & Tác giả</h5>
              <p>🏛️ <b>Đơn vị:</b> Trường THPT Lạng Giang số 1 - Tỉnh Bắc Ninh</p>
              <p>👩‍🏫 <b>Tác giả:</b> Giáo viên Trần Thị Ngà (Bộ môn Tin học)</p>
              <p>📍 <b>Địa chỉ:</b> Thôn Ao Luông, Xã Lạng Giang, Tỉnh Bắc Ninh</p>
            </div>

            <div className="md:col-span-3 space-y-2">
              <h5 className="text-sm font-bold text-white mb-2">Liên kết nhanh</h5>
              <ul className="space-y-1.5">
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-cyan-400 transition-colors">Về đầu trang</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-cyan-400 transition-colors">Giới thiệu</button></li>
                <li><button onClick={() => scrollToSection('curriculum')} className="hover:text-cyan-400 transition-colors">Lộ trình 17 bài học</button></li>
                <li><button onClick={onOpenInstruction} className="hover:text-cyan-400 transition-colors">Hướng dẫn sử dụng</button></li>
                <li><button onClick={onOpenLogin} className="hover:text-cyan-400 text-cyan-300 font-bold transition-colors">Đăng nhập tài khoản</button></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-slate-500">
            <div>
              © 2026 - 2027 Bản quyền thuộc về <b>Giáo viên Trần Thị Ngà</b> • Trường THPT Lạng Giang số 1.
            </div>
            <div className="flex items-center gap-4">
              <span>Hỗ trợ: smilers.thp@gmail.com</span>
              <span>•</span>
              <span>nguyentrunghoa@gmail.com</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
