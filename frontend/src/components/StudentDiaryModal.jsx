import { useState, useEffect } from 'react';
import { X, BookOpen, Bug, Award, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchStudentDebugLogs } from '../services/analyticsService';

export default function StudentDiaryModal({ isOpen, onClose }) {
  const { currentUser, userClass, completedLessons } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && currentUser) {
      setIsLoading(true);
      fetchStudentDebugLogs(currentUser.uid).then(data => {
        setLogs(data);
        setIsLoading(false);
      });
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden border border-gray-100 animate-scale-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-primary-600 p-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Award size={22} className="text-yellow-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                Nhật Ký Học Tập & Sổ Tay Săn Bug
              </h2>
              <p className="text-xs text-white/80">
                Học sinh: {currentUser?.displayName} | Lớp: {userClass || '10A1'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 border-b border-gray-200 shrink-0 text-center">
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500 font-medium">Lớp của bạn</div>
            <div className="text-lg font-black text-primary-600 mt-0.5">{userClass || '10A1'}</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500 font-medium">Bài đã hoàn thành</div>
            <div className="text-lg font-black text-emerald-600 mt-0.5">
              {(completedLessons || []).length} / 17
            </div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500 font-medium">Số Bug đã vượt qua</div>
            <div className="text-lg font-black text-orange-500 mt-0.5">
              {logs.length} lỗi
            </div>
          </div>
        </div>

        {/* Nội dung danh sách nhật ký săn bug */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
            <Bug size={16} className="text-orange-500" />
            Lịch sử các lỗi lập trình đã gặp & gỡ thành công:
          </h3>

          {isLoading ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              Đang tải nhật ký học tập của bạn...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-700 text-sm">Chưa có bản ghi lỗi nào!</p>
              <p className="text-xs text-gray-400 mt-1">Khi bạn gõ code và gặp lỗi cú pháp hay bấm "Săn Bug", hệ thống sẽ lưu lại làm chiến tích tại đây.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const dateStr = log.timestamp?.toDate 
                  ? log.timestamp.toDate().toLocaleString('vi-VN') 
                  : 'Gần đây';

                return (
                  <div key={log.id} className="p-3.5 bg-gray-50 hover:bg-orange-50/50 rounded-2xl border border-gray-200 transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-lg">
                        Bài {log.lessonId}: {log.errorType}
                      </span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock size={12} /> {dateStr}
                      </span>
                    </div>
                    <div className="text-xs text-gray-700 font-mono bg-white p-2 rounded-xl border border-gray-200 overflow-x-auto whitespace-pre-wrap">
                      {log.errorMsg}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-6 rounded-xl transition-all shadow-sm text-sm"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
