import { useState } from 'react';
import { 
  Book, 
  ChevronRight, 
  PlayCircle, 
  LogOut, 
  CheckCircle2, 
  Circle, 
  User, 
  ShieldCheck, 
  BarChart3, 
  Award,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/Logo_moi_35b82.jpg';

const LESSONS = [
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

// Group summaries
const TOPIC_SUMMARIES = {
  "Mở đầu": "Làm quen với khái niệm lập trình và cú pháp cơ bản của Python.",
  "Cấu trúc rẽ nhánh": "Điều khiển luồng chương trình bằng các câu lệnh điều kiện.",
  "Cấu trúc lặp": "Tự động hóa các tác vụ lặp đi lặp lại.",
  "Kiểu dữ liệu cấu trúc": "Làm việc với List và String - thao tác nhiều dữ liệu cùng lúc.",
  "Chương trình con": "Đóng gói mã lệnh thành các Hàm (Def) để dễ quản lý.",
  "Thực hành": "Ôn tập và vận dụng tổng hợp để viết ứng dụng thực tế."
};

export default function Sidebar({ 
  activeLesson, 
  onSelectLesson, 
  onOpenInstruction, 
  onOpenDiary, 
  onOpenDashboard 
}) {
  const { 
    currentUser, 
    userRole, 
    userClass, 
    isTeacher, 
    logout, 
    completedLessons, 
    toggleCompleteLesson,
    activateTeacherModeWithPIN 
  } = useAuth();

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Group lessons by generic topic
  const groupedLessons = LESSONS.reduce((acc, lesson) => {
    if (!acc[lesson.topic]) acc[lesson.topic] = [];
    acc[lesson.topic].push(lesson);
    return acc;
  }, {});

  const handleContinue = () => {
    if (!activeLesson) {
      onSelectLesson(LESSONS[0]);
    } else {
      const currentIndex = LESSONS.findIndex(l => l.id === activeLesson.id);
      if (currentIndex < LESSONS.length - 1) {
        onSelectLesson(LESSONS[currentIndex + 1]);
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất? Hãy đảm bảo đã lưu bài trước khi rời máy tính!')) {
      logout();
    }
  };

  const handleVerifyPin = async (e) => {
    e.preventDefault();
    setPinError('');
    const ok = await activateTeacherModeWithPIN(pinInput);
    if (ok) {
      setIsPinModalOpen(false);
      setPinInput('');
      alert('Đã kích hoạt Chế độ Giáo viên thành công!');
    } else {
      setPinError('Mã PIN không đúng. Vui lòng kiểm tra lại!');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header thương hiệu */}
      <div className="p-3.5 border-b border-gray-200 bg-primary-50 px-4 flex items-center gap-2.5">
        <img 
          src={logoImg} 
          alt="Logo THPT Lạng Giang số 1" 
          className="w-10 h-10 rounded-full border-2 border-primary-300 shadow-sm object-contain shrink-0" 
        />
        <div className="overflow-hidden">
          <h1 className="text-lg font-black text-primary-800 tracking-tight leading-tight">
            CodeMind 10
          </h1>
          <p className="text-[10px] text-primary-700/80 truncate font-medium">
            THPT Lạng Giang số 1
          </p>
        </div>
      </div>

      {/* Thẻ thông tin học sinh / Giáo viên */}
      {currentUser && (
        <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {currentUser.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt="Avatar" 
                className="w-9 h-9 rounded-full border border-primary-200 object-cover shrink-0 shadow-sm" 
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                <User size={18} />
              </div>
            )}
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="block text-xs font-black text-gray-800 truncate leading-tight">
                  {currentUser.displayName || 'Người dùng'}
                </span>
                {isTeacher ? (
                  <span className="bg-yellow-100 text-yellow-800 font-extrabold text-[9px] px-1.5 py-0.2 rounded border border-yellow-300 shrink-0">
                    GV
                  </span>
                ) : (
                  <span className="bg-primary-100 text-primary-800 font-extrabold text-[9px] px-1.5 py-0.2 rounded border border-primary-200 shrink-0">
                    {userClass || '10A1'}
                  </span>
                )}
              </div>
              <span className="block text-[10px] text-gray-400 truncate leading-tight mt-0.5">
                {currentUser.email || 'Phiên làm việc'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleLogout}
              title="Đăng xuất an toàn"
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Nút Chức năng Đặc biệt: Dashboard (Giáo viên) HOẶC Sổ tay Săn Bug (Học sinh) */}
      <div className="p-3 bg-white border-b border-gray-100 space-y-2">
        {isTeacher ? (
          <button
            onClick={onOpenDashboard}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow text-xs"
          >
            <BarChart3 size={15} />
            Bảng Điều Khiển Sư Phạm (9 Lớp)
          </button>
        ) : (
          <button
            onClick={onOpenDiary}
            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-emerald-200 text-xs"
          >
            <Award size={15} className="text-emerald-600" />
            Sổ tay Săn Bug & Nhật ký của em
          </button>
        )}
      </div>
      
      {/* Danh sách lộ trình 17 bài học */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
        <div className="space-y-7">
          {Object.entries(groupedLessons).map(([topic, lessonsInTopic]) => (
            <div key={topic} className="space-y-2.5">
              <div className="ml-2 mb-1">
                <h3 className="text-[11px] font-extrabold text-primary-600 uppercase tracking-widest">{topic}</h3>
                <p className="text-xs text-gray-400 mt-0.5 max-w-[90%] leading-relaxed">{TOPIC_SUMMARIES[topic]}</p>
              </div>
              <ul className="space-y-1.5">
                {lessonsInTopic.map((lesson) => {
                  const isCompleted = completedLessons?.includes(lesson.id);
                  const isActive = activeLesson?.id === lesson.id;

                  return (
                    <li key={lesson.id} className="relative group">
                      <div className="flex items-center gap-1 w-full">
                        <button
                          onClick={() => onSelectLesson(lesson)}
                          className={`flex-1 text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-300 flex items-start gap-2.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 relative z-10
                            ${isActive 
                              ? 'bg-gradient-to-r from-primary-100 to-white text-primary-700 border-l-4 border-primary-500 font-medium' 
                              : 'bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-white text-gray-700 border border-transparent hover:border-gray-200'
                            }
                          `}
                        >
                          <span className={`min-w-[40px] font-semibold mt-0.5 text-xs ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                            Bài {lesson.id}
                          </span>
                          <div className="flex-1 pr-1">
                            <span className={`block font-medium leading-tight ${isActive ? 'text-primary-700' : 'text-gray-700'}`}>
                              {lesson.title}
                            </span>
                            <span className={`block text-[11px] mt-0.5 line-clamp-1 leading-relaxed ${isActive ? 'text-primary-600/80' : 'text-gray-400'}`}>
                              {lesson.desc}
                            </span>
                          </div>
                          <ChevronRight size={14} className={`mt-1 shrink-0 transition-transform ${isActive ? 'text-primary-500 translate-x-1' : 'text-gray-300 group-hover:text-gray-400'}`} />
                        </button>

                        {/* Nút tích hoàn thành bài học */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCompleteLesson(lesson.id);
                          }}
                          title={isCompleted ? 'Đã hoàn thành (Bấm để hủy)' : 'Đánh dấu đã hoàn thành'}
                          className="p-1.5 text-gray-300 hover:text-primary-500 transition-colors shrink-0"
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={18} className="text-green-500 fill-green-50" />
                          ) : (
                            <Circle size={18} className="hover:scale-110 transition-transform" />
                          )}
                        </button>
                      </div>

                      {/* Tooltip mục tiêu bài học */}
                      <div className="absolute left-[105%] top-1/2 -translate-y-1/2 w-64 bg-gray-800 text-white text-xs p-3 rounded-lg opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 shadow-xl hidden md:block">
                        <div className="font-bold mb-1">Mục tiêu bài học:</div>
                        <div className="text-gray-200 leading-relaxed">{lesson.desc}</div>
                        <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-t-8 border-t-transparent border-r-8 border-r-gray-800 border-b-8 border-b-transparent w-0 h-0"></div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      {/* Nút Học tiếp & Hướng dẫn cố định ở dưới cùng */}
      <div className="p-3.5 border-t border-gray-200 bg-white flex flex-col gap-2">
        <button 
          onClick={onOpenInstruction}
          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-3 rounded-xl flex justify-center items-center gap-2 transition-all border border-blue-200 text-xs"
        >
          <Book className="w-3.5 h-3.5" />
          Hướng dẫn sử dụng
        </button>

        <button 
          onClick={handleContinue}
          className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 px-3 rounded-xl flex justify-center items-center gap-2 transition-all shadow-md hover:shadow-lg active:translate-y-0 text-xs"
        >
          <PlayCircle size={16} />
          {activeLesson ? 'Chuyển bài tiếp theo' : 'Bắt đầu học ngay'}
        </button>

        {!isTeacher && (
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="text-[10px] text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 mt-1 transition-colors"
          >
            <KeyRound size={10} /> Chế độ Giáo viên (Mã PIN)
          </button>
        )}

        <div className="text-center text-[10px] text-gray-400 font-medium">
          © Copyright by Giáo viên Trần Thị Ngà
        </div>
      </div>

      {/* Modal Nhập Mã PIN Giáo viên */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-gray-200 text-center animate-scale-up">
            <ShieldCheck size={36} className="text-primary-600 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800 text-base mb-1">Kích hoạt Quyền Giáo viên</h3>
            <p className="text-xs text-gray-500 mb-4">Nhập mã PIN bảo mật do Ban Giảng Dạy cấp:</p>

            <form onSubmit={handleVerifyPin} className="space-y-3">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Nhập mã PIN Giáo viên..."
                className="w-full p-2.5 border border-gray-300 rounded-xl text-center font-mono text-sm tracking-widest focus:ring-2 focus:ring-primary-500 outline-none"
              />

              {pinError && (
                <div className="text-xs text-red-500 font-medium">{pinError}</div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
