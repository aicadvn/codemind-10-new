import { ShieldAlert, Phone, Mail, LogOut, RefreshCw, School, AlertCircle } from 'lucide-react';
import { ADMIN_CONTACT } from '../config/schoolConfig';
import logoImg from '../assets/Logo_moi_35b82.jpg';

export default function UnregisteredStudentModal({ 
  isOpen, 
  userEmail, 
  userDisplayName, 
  onLogout,
  onRetry 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-rose-500/15 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none"></div>

      <div 
        className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-[480px] w-full relative z-10 border border-slate-100 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top warning ribbon */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-orange-500 rounded-t-3xl"></div>

        {/* Header Icon & Logo */}
        <div className="text-center mb-5">
          <div className="relative inline-block mb-3">
            <img 
              src={logoImg} 
              alt="Logo THPT Lạng Giang số 1" 
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto object-contain rounded-full border-2 border-slate-200 shadow-sm" 
            />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1.5 rounded-full shadow-md border-2 border-white">
              <ShieldAlert size={18} />
            </div>
          </div>

          <span className="inline-block bg-amber-50 text-amber-800 text-[11px] font-extrabold uppercase px-3 py-1 rounded-full border border-amber-200 mb-2 tracking-wider">
            Yêu cầu kích hoạt tài khoản
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Chưa có trong danh sách lớp
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Hệ thống học tập cá nhân hóa chuẩn SGK Tin học 10
          </p>
        </div>

        {/* Card thông tin email đã đăng nhập */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-4 text-left">
          <div className="text-[11px] font-medium text-gray-500">Tài khoản Google đang kết nối:</div>
          <div className="font-bold text-gray-900 text-sm truncate mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
            <span className="truncate">{userEmail || 'Chưa xác định'}</span>
          </div>
          {userDisplayName && (
            <div className="text-[11px] text-gray-400 mt-0.5 pl-3.5">{userDisplayName}</div>
          )}
        </div>

        {/* Thông báo chi tiết & Hướng dẫn */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 mb-5 text-left text-xs leading-relaxed text-gray-700">
          <p className="font-semibold text-amber-950 mb-2 flex items-center gap-1.5">
            <AlertCircle size={15} className="text-amber-600 shrink-0" />
            Em chưa được giáo viên nhập vào danh sách thực nghiệm:
          </p>
          <p className="text-gray-600 mb-3 text-[11px]">
            Theo quy định, chỉ các học sinh đã được giáo viên quản lý lớp nhập email và phân lớp chính thức mới được phép truy cập không gian học tập.
          </p>
          
          <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
            <div className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">
              Thông tin liên hệ Admin Hệ thống để được cấp quyền:
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
              <Phone size={14} className="text-emerald-600 shrink-0" />
              <span>Số điện thoại / Zalo:</span>
              <a href={`tel:${ADMIN_CONTACT.phone}`} className="text-emerald-600 hover:underline">
                {ADMIN_CONTACT.phone}
              </a>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
              <Mail size={14} className="text-blue-600 shrink-0" />
              <span>Email hỗ trợ:</span>
              <a href={`mailto:${ADMIN_CONTACT.email}`} className="text-blue-600 hover:underline">
                {ADMIN_CONTACT.email}
              </a>
            </div>
            <div className="text-[10px] text-gray-500 italic pt-1 border-t border-gray-100">
              * Quản trị viên phụ trách: {ADMIN_CONTACT.name} (Bộ môn Tin học — THPT Lạng Giang số 1)
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
              Kiểm tra lại
            </button>
          )}
          <button
            onClick={onLogout}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <LogOut size={14} />
            Đăng xuất tài khoản
          </button>
        </div>

        <div className="text-center text-[10px] text-gray-400 mt-4">
          Trường THPT Lạng Giang số 1 • Năm học 2026 - 2027
        </div>
      </div>
    </div>
  );
}
