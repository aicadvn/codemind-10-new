import { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Download, 
  Search, 
  Filter, 
  Award, 
  Bug, 
  CheckCircle2, 
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { SCHOOL_CLASSES, isTeacherAccount } from '../config/schoolConfig';
import { fetchClassStudents, exportToNCKH_CSV } from '../services/analyticsService';

export default function TeacherDashboard({ isOpen, onClose }) {
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async (className) => {
    setIsLoading(true);
    const data = await fetchClassStudents(className);
    // Lọc bỏ triệt để tài khoản giáo viên (đảm bảo chỉ có dữ liệu học sinh)
    setStudents((data || []).filter(s => !isTeacherAccount(s)));
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData(selectedClass);
    }
  }, [isOpen, selectedClass]);

  if (!isOpen) return null;

  // Lọc theo từ khóa tìm kiếm tên hoặc email (tuyệt đối không hiển thị tài khoản giáo viên)
  const filteredStudents = students.filter(s => {
    if (isTeacherAccount(s)) return false;
    const term = searchTerm.toLowerCase();
    const name = (s.displayName || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  // Tính toán các chỉ số NCKH tổng hợp
  const totalStudents = filteredStudents.length;
  const totalCompletedLessons = filteredStudents.reduce((acc, s) => acc + (s.completedLessons?.length || 0), 0);
  const avgCompletionRate = totalStudents > 0 
    ? Math.round((totalCompletedLessons / (totalStudents * 17)) * 100) 
    : 0;
  const totalBugsEncountered = filteredStudents.reduce((acc, s) => acc + (s.totalBugs || 0), 0);

  const handleExportCSV = () => {
    const classLabel = selectedClass === 'all' ? 'Toàn_Khối_10' : `Lớp_${selectedClass}`;
    exportToNCKH_CSV(filteredStudents, classLabel);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-gray-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl flex flex-col h-[90vh] overflow-hidden border border-gray-100 animate-scale-up">
        
        {/* Header Bảng điều khiển */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-primary-700 p-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md shadow-inner">
              <Users size={26} className="text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">
                  Bảng điều khiển sư phạm & theo dõi học tập
                </h2>
                <span className="bg-yellow-400 text-yellow-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Dành cho giáo viên
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                THPT Lạng Giang số 1 — Hệ thống giám sát & minh chứng thực nghiệm NCKH
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(selectedClass)}
              title="Làm mới dữ liệu"
              className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white/90"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Thẻ Chỉ số NCKH Định Lượng */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 border-b border-gray-200 shrink-0">
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-400 font-medium">Quy mô học sinh</span>
            <div className="text-2xl font-black text-gray-800 mt-1">{totalStudents} <span className="text-xs font-normal text-gray-400">em</span></div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-400 font-medium">Tỷ lệ hoàn thành khối</span>
            <div className="text-2xl font-black text-primary-600 mt-1">{avgCompletionRate}%</div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-400 font-medium">Tổng số lỗi đã tự gỡ (Bugs)</span>
            <div className="text-2xl font-black text-orange-500 mt-1">{totalBugsEncountered} <span className="text-xs font-normal text-gray-400">lần</span></div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
            <button
              onClick={handleExportCSV}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow text-xs"
            >
              <Download size={15} />
              Xuất Excel NCKH (.CSV)
            </button>
          </div>
        </div>

        {/* Thanh công cụ Bộ Lọc Lớp và Tìm kiếm */}
        <div className="p-4 bg-white border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Lọc theo lớp 10A1 - 10D4 */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-700">Lớp:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-700 text-xs rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="all">Tất cả các lớp (10 lớp: 10A1 - 10D4)</option>
              {SCHOOL_CLASSES.map(cls => (
                <option key={cls} value={cls}>Lớp {cls}</option>
              ))}
            </select>
          </div>

          {/* Ô tìm kiếm tên học sinh */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc email học sinh..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Bảng danh sách học sinh */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              Đang tải danh sách học sinh từ Cloud Firestore...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              Chưa có dữ liệu học sinh nào trong bộ lọc này.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3">Học sinh</th>
                    <th className="p-3">Lớp</th>
                    <th className="p-3">Tiến độ bài học (Chủ đề 5)</th>
                    <th className="p-3 text-center">Số Bug đã gỡ</th>
                    <th className="p-3">Hoạt động gần nhất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((s) => {
                    const completed = (s.completedLessons || []).length;
                    const percent = Math.round((completed / 17) * 100);
                    const lastLogin = s.lastLogin?.toDate 
                      ? s.lastLogin.toDate().toLocaleString('vi-VN') 
                      : (s.lastActive?.toDate ? s.lastActive.toDate().toLocaleString('vi-VN') : 'Mới đăng ký');

                    return (
                      <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            {s.photoURL ? (
                              <img src={s.photoURL} alt="Avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center shrink-0">
                                {(s.displayName || 'H')[0]}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-gray-800 text-sm">{s.displayName || 'Chưa đặt tên'}</div>
                              <div className="text-gray-400 text-[11px]">{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-bold text-primary-700">
                          <span className="bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-200">
                            {s.className || 'Chưa xếp lớp'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="w-48">
                            <div className="flex justify-between text-[11px] font-medium text-gray-600 mb-1">
                              <span>{completed}/17 bài</span>
                              <span>{percent}%</span>
                            </div>
                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-primary-500 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full text-xs">
                            {s.totalBugs || 0}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-gray-400" />
                            {lastLogin}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center shrink-0">
          <div className="text-xs text-gray-500 italic">
            * Dữ liệu được đồng bộ thời gian thực từ Google Cloud Firestore.
          </div>
          <button 
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-xl transition-all text-xs"
          >
            Đóng bảng điều khiển
          </button>
        </div>

      </div>
    </div>
  );
}
