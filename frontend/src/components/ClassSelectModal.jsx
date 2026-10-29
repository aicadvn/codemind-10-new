import { useState } from 'react';
import { SCHOOL_CLASSES } from '../config/schoolConfig';
import { School, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ClassSelectModal({ isOpen }) {
  const { currentUser, updateStudentClass } = useAuth();
  const [selectedClass, setSelectedClass] = useState('10A1');

  if (!isOpen) return null;

  const handleSave = () => {
    updateStudentClass(selectedClass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 text-center relative overflow-hidden border border-gray-100 animate-scale-up">
        {/* Thanh màu thương hiệu */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600"></div>

        <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <School size={32} />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight mb-1">
          Chọn Lớp của bạn
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
          Chào <b className="text-gray-700">{currentUser?.displayName || 'bạn'}</b>! Để Gia sư AI và Thầy/Cô đồng hành hỗ trợ bạn học tập tốt nhất, hãy chọn đúng lớp của bạn nhé:
        </p>

        {/* Lưới chọn 9 lớp từ 10A1 đến 10A9 */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {SCHOOL_CLASSES.map((cls) => (
            <button
              key={cls}
              type="button"
              onClick={() => setSelectedClass(cls)}
              className={`py-3 px-2 rounded-xl text-sm font-bold transition-all border
                ${selectedClass === cls
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md scale-105'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }
              `}
            >
              Lớp {cls}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 px-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-md hover:shadow-lg active:translate-y-0"
        >
          <CheckCircle2 size={18} />
          Xác nhận và Vào Học
        </button>

        <p className="mt-4 text-[11px] text-gray-400 italic">
          * Bạn chỉ cần chọn lớp 1 lần duy nhất trong suốt năm học.
        </p>
      </div>
    </div>
  );
}
