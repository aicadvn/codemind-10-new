import { useState, useEffect } from 'react';
import { 
  X, 
  Bug, 
  Award, 
  CheckCircle2, 
  Clock, 
  Code, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  MessageSquare, 
  Terminal, 
  Sparkles, 
  Copy, 
  Check, 
  Filter, 
  ArrowRight, 
  BookOpen,
  HelpCircle,
  Lightbulb,
  Search,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchStudentDebugLogs, loadSocraticChat } from '../services/analyticsService';
import { LESSONS } from '../config/schoolConfig';

// Mẹo sư phạm phân tích và hướng dẫn sửa lỗi chuyên sâu của Cô Trần Thị Ngà
function getPedagogicalTip(errorType = '') {
  if (errorType.includes('IndentationError')) {
    return 'Trong Python, các khối lệnh sau dấu hai chấm (:) như if, for, while, def bắt buộc phải thụt lề chuẩn xác (thường là 4 dấu cách). Hãy kiểm tra xem em có vô tình gõ thụt lề lệch dòng không nhé!';
  }
  if (errorType.includes('SyntaxError')) {
    return 'Lỗi cú pháp thường do thiếu dấu hai chấm (:) ở cuối câu lệnh if/for/while/def, hoặc mở ngoặc mà quên đóng ngoặc tròn (), ngoặc vuông [], đóng mở nháy đơn/kép "";';
  }
  if (errorType.includes('NameError')) {
    return 'Tên biến hoặc hàm chưa được định nghĩa trước khi sử dụng, hoặc em đã gõ nhầm chữ hoa/chữ thường (Python phân biệt chính xác chữ hoa và chữ thường).';
  }
  if (errorType.includes('TypeError')) {
    return 'Phép toán không tương thích kiểu dữ liệu (ví dụ: cộng chuỗi xâu với số nguyên). Hãy dùng hàm int(), float() hoặc str() để ép kiểu trước khi tính toán nhé!';
  }
  if (errorType.includes('ZeroDivisionError')) {
    return 'Toán học và Python nghiêm cấm phép chia cho số 0! Hãy kiểm tra biến mẫu số xem có rơi vào trường hợp bằng 0 hay không.';
  }
  if (errorType.includes('IndexError')) {
    return 'Chỉ số truy xuất phần tử vượt quá độ dài danh sách (List). Hãy nhớ trong Python, chỉ số phần tử đầu tiên luôn bắt đầu từ 0 và kết thúc ở len(list) - 1.';
  }
  if (errorType.includes('ValueError')) {
    return 'Hàm chuyển đổi nhận dữ liệu không đúng định dạng. Ví dụ int("abc") sẽ báo lỗi vì chuỗi không phải chữ số nguyên.';
  }
  if (errorType.includes('Chạy thành công') || errorType.includes('tối ưu')) {
    return 'Chương trình của em đã chạy chính xác! Hãy tiếp tục tối ưu thuật toán ngắn gọn hơn hoặc thử các trường hợp dữ liệu thử nghiệm (test cases) đặc biệt nhé.';
  }
  return 'Hãy đọc kỹ thông báo Traceback ở cửa sổ Console, đối chiếu dòng code báo lỗi và tương tác cùng Gia sư AI Socratic để được gợi mở từng bước!';
}

export default function StudentDiaryModal({ isOpen, onClose, onSelectLesson }) {
  const { currentUser, userClass, completedLessons } = useAuth();
  const [activeTab, setActiveTab] = useState('bugs'); // 'bugs' | 'socratic' | 'curriculum'
  
  // Dữ liệu Bug Logs
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [selectedLessonFilter, setSelectedLessonFilter] = useState('all');
  const [selectedErrorFilter, setSelectedErrorFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  // Dữ liệu Socratic History
  const [socraticLessonId, setSocraticLessonId] = useState(1);
  const [socraticMessages, setSocraticMessages] = useState([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Tải danh sách bug logs khi mở modal
  useEffect(() => {
    if (isOpen && currentUser) {
      setIsLoadingLogs(true);
      fetchStudentDebugLogs(currentUser.uid).then(data => {
        setLogs(data || []);
        setIsLoadingLogs(false);
        if (data && data.length > 0) {
          setExpandedLogId(data[0].id); // Mở sẵn log đầu tiên
        }
      });
    }
  }, [isOpen, currentUser]);

  // Tải lịch sử Socrates khi đổi bài học ở Tab 2
  useEffect(() => {
    if (isOpen && currentUser && activeTab === 'socratic') {
      setIsLoadingChat(true);
      loadSocraticChat(currentUser.uid, socraticLessonId).then(msgs => {
        setSocraticMessages(msgs || []);
        setIsLoadingChat(false);
      });
    }
  }, [isOpen, currentUser, activeTab, socraticLessonId]);

  if (!isOpen) return null;

  // Lọc danh sách bug logs theo bộ lọc và tìm kiếm
  const filteredLogs = logs.filter(log => {
    const matchLesson = selectedLessonFilter === 'all' || String(log.lessonId) === String(selectedLessonFilter);
    const matchError = selectedErrorFilter === 'all' || (log.errorType && log.errorType.includes(selectedErrorFilter));
    const query = searchQuery.trim().toLowerCase();
    const matchSearch = !query || 
      (log.errorType && log.errorType.toLowerCase().includes(query)) ||
      (log.errorMsg && log.errorMsg.toLowerCase().includes(query)) ||
      (log.codeSnippet && log.codeSnippet.toLowerCase().includes(query));
    return matchLesson && matchError && matchSearch;
  });

  // Sao chép code lỗi
  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Mở bài học trong editor / workspace
  const handleJumpToLesson = (lessonId, preferredTab = 'editor') => {
    const lesson = LESSONS.find(l => l.id === Number(lessonId)) || LESSONS[0];
    if (onSelectLesson) {
      onSelectLesson(lesson, preferredTab);
    }
    onClose();
  };

  // Chuyển sang Tab Socrates cho bài cụ thể
  const handleViewSocraticForLesson = (lessonId) => {
    setSocraticLessonId(Number(lessonId));
    setActiveTab('socratic');
  };

  const completedCount = (completedLessons || []).length;
  const progressPercent = Math.round((completedCount / 17) * 100);

  // Huy hiệu năng lực
  let badgeTitle = 'Học viên Khởi động 🌱';
  let badgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
  if (completedCount >= 17) {
    badgeTitle = 'Chiến binh Python 10 Xuất Sắc 🏆';
    badgeColor = 'text-purple-700 bg-purple-50 border-purple-200';
  } else if (completedCount >= 12) {
    badgeTitle = 'Chuyên viên Thuật toán 🥇';
    badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (completedCount >= 6) {
    badgeTitle = 'Thợ săn Bug Chăm chỉ 🥈';
    badgeColor = 'text-blue-700 bg-blue-50 border-blue-200';
  }

  // Nhóm 17 bài học theo Chủ đề SGK
  const groupedLessons = LESSONS.reduce((acc, lesson) => {
    if (!acc[lesson.topic]) acc[lesson.topic] = [];
    acc[lesson.topic].push(lesson);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col h-[92vh] max-h-[880px] overflow-hidden border border-slate-100 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 1. HEADER MODAL */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-4 sm:p-5 text-white flex justify-between items-center shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner shrink-0">
              <Award size={24} className="text-yellow-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black flex items-center gap-2 tracking-tight">
                Nhật ký học tập & Sổ tay săn bug
              </h2>
              <p className="text-xs text-white/90 font-medium">
                Học sinh: <b className="text-white underline underline-offset-2">{currentUser?.displayName || 'Học sinh'}</b> • Lớp: <b>{userClass || '10A1'}</b>
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

        {/* 2. THỐNG KÊ TỔNG QUAN & TIẾN ĐỘ */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-slate-50 border-b border-slate-200 shrink-0">
          
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Lớp của em</div>
            <div className="text-base sm:text-xl font-black text-blue-600 mt-0.5">{userClass || '10A1'}</div>
            <div className="text-[10px] text-slate-400">THPT Lạng Giang số 1</div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Tiến độ bài học</div>
            <div className="text-base sm:text-xl font-black text-emerald-600 mt-0.5">
              {completedCount} / 17 <span className="text-xs font-bold text-slate-400">({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Sự cố đã vượt qua</div>
            <div className="text-base sm:text-xl font-black text-orange-600 mt-0.5">
              {logs.length} <span className="text-xs font-bold text-slate-400">lần gỡ lỗi</span>
            </div>
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-0.5 ${badgeColor}`}>
              {badgeTitle}
            </div>
          </div>

        </div>

        {/* 3. THANH TAB ĐIỀU HƯỚNG TƯƠNG TÁC */}
        <div className="flex border-b border-slate-200 bg-white px-4 pt-2 shrink-0 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bugs')}
            className={`pb-2.5 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'bugs'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bug size={16} />
            <span>Sổ tay săn bug ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('socratic')}
            className={`pb-2.5 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'socratic'
                ? 'border-cyan-600 text-cyan-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare size={16} />
            <span>Lịch sử đàm thoại Socrates</span>
          </button>

          <button
            onClick={() => setActiveTab('curriculum')}
            className={`pb-2.5 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'curriculum'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen size={16} />
            <span>Bản đồ 17 bài học ({completedCount}/17)</span>
          </button>
        </div>

        {/* 4. NỘI DUNG TỪNG TAB */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60">

          {/* ===================== TAB 1: SỔ TAY SĂN BUG ===================== */}
          {activeTab === 'bugs' && (
            <div className="space-y-4">
              
              {/* Thanh lọc & tìm kiếm tương tác */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                
                {/* Ô tìm kiếm */}
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo lỗi, code hoặc từ khóa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Lọc theo bài học */}
                  <select
                    value={selectedLessonFilter}
                    onChange={(e) => setSelectedLessonFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="all">Tất cả bài học (1 - 17)</option>
                    {LESSONS.map(l => (
                      <option key={l.id} value={l.id}>Bài {l.id}: {l.title.slice(0, 22)}...</option>
                    ))}
                  </select>

                  {/* Lọc theo loại lỗi */}
                  <select
                    value={selectedErrorFilter}
                    onChange={(e) => setSelectedErrorFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="all">Tất cả loại sự cố</option>
                    <option value="IndentationError">Lỗi thụt lề (IndentationError)</option>
                    <option value="SyntaxError">Lỗi cú pháp (SyntaxError)</option>
                    <option value="NameError">Biến chưa định nghĩa (NameError)</option>
                    <option value="TypeError">Sai kiểu dữ liệu (TypeError)</option>
                    <option value="ValueError">Sai giá trị (ValueError)</option>
                    <option value="ZeroDivisionError">Chia cho số 0 (ZeroDivisionError)</option>
                    <option value="IndexError">Lỗi chỉ số mảng (IndexError)</option>
                    <option value="RuntimeError">Lỗi thực thi (RuntimeError)</option>
                    <option value="thành công">Chạy thành công & Tối ưu</option>
                  </select>
                </div>
              </div>

              {/* Danh sách lỗi */}
              {isLoadingLogs ? (
                <div className="text-center py-16 text-slate-400 text-sm font-medium">
                  Đang tải dữ liệu Sổ tay Săn Bug từ Cloud Firestore...
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                  <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-2.5" />
                  <p className="font-bold text-slate-700 text-base">Chưa có sự cố nào khớp với bộ lọc này!</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Khi em thực thi code gặp lỗi cú pháp hoặc bấm nút "Săn Bug (AI)", hệ thống sẽ tự động bắt mạch và ghi chép chi tiết vào đây để em ôn tập.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    const dateStr = log.timestamp?.toDate
                      ? log.timestamp.toDate().toLocaleString('vi-VN')
                      : 'Vừa xong';
                    
                    const lessonObj = LESSONS.find(l => l.id === Number(log.lessonId));
                    const lessonTitle = lessonObj ? `Bài ${lessonObj.id}: ${lessonObj.title}` : `Bài ${log.lessonId}`;
                    const isSuccessType = (log.errorType || '').includes('thành công') || (log.errorType || '').includes('tối ưu');

                    return (
                      <div 
                        key={log.id} 
                        className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden ${
                          isExpanded 
                            ? isSuccessType ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-orange-300 ring-2 ring-orange-100' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Header của từng thẻ sự cố (Click để đóng/mở) */}
                        <div 
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none bg-slate-50/50 hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className={`p-2 rounded-xl shrink-0 ${
                              isSuccessType ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {isSuccessType ? <Sparkles size={16} /> : <Bug size={16} />}
                            </div>
                            <div className="overflow-hidden">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                                  isSuccessType 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-orange-50 text-orange-700 border-orange-200'
                                }`}>
                                  {log.errorType || 'Sự cố lập trình'}
                                </span>
                                <span className="text-xs font-bold text-slate-800 truncate">
                                  {lessonTitle}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock size={11} /> {dateStr}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
                              {isExpanded ? 'Thu gọn' : 'Xem chi tiết & Code'}
                            </span>
                            <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                          </div>
                        </div>

                        {/* Chi tiết nội dung khi mở rộng */}
                        {isExpanded && (
                          <div className="p-4 sm:p-5 border-t border-slate-100 space-y-4 bg-white animate-fade-in">
                            
                            {/* 1. Đoạn Code học sinh đã gõ */}
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                  <Code size={14} className="text-blue-600" />
                                  Đoạn code Python khi phát sinh sự cố:
                                </span>
                                {log.codeSnippet && (
                                  <button
                                    onClick={() => handleCopyCode(log.codeSnippet, log.id)}
                                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                                  >
                                    {copiedCodeId === log.id ? (
                                      <>
                                        <Check size={12} className="text-emerald-600" />
                                        <span className="text-emerald-600">Đã chép</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={12} />
                                        <span>Sao chép code</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                              <div className="bg-[#1e1e1e] text-slate-200 font-mono text-xs p-3.5 rounded-xl overflow-x-auto max-h-48 border border-slate-800 leading-relaxed">
                                <pre>{log.codeSnippet || '# (Học sinh kích hoạt đàm thoại khi khung soạn thảo trống)'}</pre>
                              </div>
                            </div>

                            {/* 2. Thông báo lỗi Console Traceback */}
                            <div>
                              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                                <Terminal size={14} className="text-orange-600" />
                                Thông báo lỗi từ Console Traceback:
                              </div>
                              <div className="bg-slate-900 text-orange-300 font-mono text-xs p-3 rounded-xl overflow-x-auto max-h-36 border border-slate-800">
                                <pre className="whitespace-pre-wrap">{log.errorMsg || 'Không có chi tiết thông báo lỗi.'}</pre>
                              </div>
                            </div>

                            {/* 3. Mẹo Sư Phạm & Lời Khuyên của Cô Trần Thị Ngà */}
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-3.5">
                              <div className="flex items-start gap-2.5">
                                <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg shrink-0 mt-0.5">
                                  <Lightbulb size={16} />
                                </div>
                                <div className="text-xs text-amber-900 leading-relaxed">
                                  <b className="font-bold text-amber-950 block mb-0.5">
                                    💡 Lời khuyên định hướng từ Cô Trần Thị Ngà:
                                  </b>
                                  {getPedagogicalTip(log.errorType)}
                                </div>
                              </div>
                            </div>

                            {/* 4. Các nút tương tác chuyển nhanh */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                              <button
                                onClick={() => handleViewSocraticForLesson(log.lessonId)}
                                className="text-xs font-bold text-cyan-700 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-cyan-200 transition-colors"
                              >
                                <MessageSquare size={14} />
                                Xem đàm thoại Socrates bài này
                              </button>

                              <button
                                onClick={() => handleJumpToLesson(log.lessonId, 'editor')}
                                className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm hover:shadow transition-all ml-auto"
                              >
                                <span>Mở bài này trong Trình Soạn Thảo</span>
                                <ArrowRight size={14} />
                              </button>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 2: LỊCH SỬ ĐÀM THOẠI SOCRATES ===================== */}
          {activeTab === 'socratic' && (
            <div className="space-y-4">
              
              {/* Chọn bài học để xem đàm thoại */}
              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cyan-100 text-cyan-700 rounded-xl">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Chọn bài học cần xem lại đàm thoại:</div>
                    <div className="text-[11px] text-slate-400">Xem lại từng bước gợi mở của Gia sư AI Socrates</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={socraticLessonId}
                    onChange={(e) => setSocraticLessonId(Number(e.target.value))}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {LESSONS.map(l => (
                      <option key={l.id} value={l.id}>
                        Bài {l.id}: {l.title}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleJumpToLesson(socraticLessonId, 'chat')}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all shrink-0"
                    title="Vào bài này để thực hành tiếp"
                  >
                    <span>Vào bài {socraticLessonId}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Hộp chat đàm thoại */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 min-h-[350px]">
                {isLoadingChat ? (
                  <div className="text-center py-20 text-slate-400 text-sm font-medium">
                    Đang tải cuộc đàm thoại Socrates của Bài {socraticLessonId}...
                  </div>
                ) : socraticMessages.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="w-14 h-14 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto mb-3">
                      <HelpCircle size={28} />
                    </div>
                    <h4 className="font-bold text-slate-700 text-base">
                      Chưa có lịch sử đàm thoại cho Bài {socraticLessonId}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
                      Khi em mở bài học này và tương tác hỏi đáp hoặc bấm "Săn Bug (AI)" tại cửa sổ Gia sư Socrates, toàn bộ quá trình gợi mở tư duy sẽ được lưu trữ tự động tại đây.
                    </p>
                    <button
                      onClick={() => handleJumpToLesson(socraticLessonId)}
                      className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Mở Bài {socraticLessonId} để bắt đầu đàm thoại</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                      <span className="text-xs font-bold text-slate-600">
                        Lịch sử {socraticMessages.length} lượt đàm thoại:
                      </span>
                      <button
                        onClick={() => handleJumpToLesson(socraticLessonId, 'chat')}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        Tiếp tục đàm thoại ở bài này <ArrowRight size={13} />
                      </button>
                    </div>

                    {socraticMessages.map((msg, idx) => {
                      const isUser = msg.role === 'user';
                      return (
                        <div 
                          key={idx} 
                          className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isUser && (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 border border-emerald-300">
                              AI
                            </div>
                          )}

                          <div 
                            className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                              isUser 
                                ? 'bg-cyan-600 text-white rounded-tr-none shadow-sm font-medium' 
                                : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-200'
                            }`}
                          >
                            <div className="font-bold text-[10px] mb-1 opacity-80 uppercase tracking-wider">
                              {isUser ? 'Em (Học sinh)' : 'Gia sư AI Socratic (Cô Trần Thị Ngà)'}
                            </div>
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                          </div>

                          {isUser && (
                            <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center text-xs font-black shrink-0 border border-cyan-300">
                              {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'HS'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ===================== TAB 3: BẢN ĐỒ 17 BÀI HỌC & TIẾN ĐỘ ===================== */}
          {activeTab === 'curriculum' && (
            <div className="space-y-5">
              
              {/* Banner danh hiệu & tiến độ */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 sm:p-5 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-1">
                    Chủ đề F • Tin học 10
                  </span>
                  <h3 className="text-base sm:text-lg font-black">
                    Lập trình giải quyết vấn đề với Python
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5">
                    Đã hoàn thành <b className="text-yellow-300">{completedCount}</b> / 17 bài học ({progressPercent}%)
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center shrink-0">
                  <div className="text-[10px] uppercase font-bold text-white/80">Cấp bậc năng lực</div>
                  <div className="text-sm font-black text-yellow-300 mt-0.5">{badgeTitle}</div>
                </div>
              </div>

              {/* Danh sách 17 bài học phân theo cụm chủ đề */}
              <div className="space-y-4">
                {Object.entries(groupedLessons).map(([topic, lessonsInTopic]) => (
                  <div key={topic} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 font-black text-xs text-slate-700 uppercase tracking-wider">
                      {topic}
                    </div>

                    <div className="divide-y divide-slate-100">
                      {lessonsInTopic.map(lesson => {
                        const isDone = (completedLessons || []).includes(lesson.id);
                        return (
                          <div 
                            key={lesson.id}
                            onClick={() => handleJumpToLesson(lesson.id, 'editor')}
                            className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-emerald-50/50 transition-colors cursor-pointer group"
                            title={`Nhấn để vào học Bài ${lesson.id}: ${lesson.title}`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                isDone 
                                  ? 'bg-emerald-100 text-emerald-600 font-bold' 
                                  : 'bg-slate-100 text-slate-400 font-medium group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors'
                              }`}>
                                {isDone ? <CheckCircle2 size={18} /> : <span className="text-xs">{lesson.id}</span>}
                              </div>

                              <div className="overflow-hidden">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                                    Bài {lesson.id}: {lesson.title}
                                  </span>
                                  {isDone && (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded shrink-0">
                                      Đã hoàn thành
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                  {lesson.desc}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJumpToLesson(lesson.id, 'editor');
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0 ${
                                isDone 
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                              }`}
                            >
                              <span>{isDone ? 'Ôn lại' : 'Vào học'}</span>
                              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* 5. FOOTER */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <Sparkles size={14} className="text-emerald-600" />
            <span>Đồng bộ thời gian thực với Cloud Firestore • Trường THPT Lạng Giang số 1</span>
          </div>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-5 rounded-xl transition-all shadow-sm text-xs"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
