import { useState } from 'react';
import { Loader2, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/Logo_moi_35b82.jpg';

export default function Login({ isOpen = true, onClose, onLoginSuccess }) {
  const { loginWithGoogle, isFirebaseReady } = useAuth();
  const [error, setError] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  if (!isOpen) return null;

  // Xử lý đăng nhập bằng tài khoản Google 1-Click
  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoadingGoogle(true);
    try {
      await loginWithGoogle();
      if (onLoginSuccess) onLoginSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Lỗi kết nối mạng khi liên hệ máy chủ Google. Vui lòng kiểm tra lại đường truyền!');
      } else {
        setError(err.message || 'Không thể đăng nhập bằng Google. Vui lòng thử lại!');
      }
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none"></div>

      <div 
        className="bg-white rounded-3xl shadow-2xl p-7 sm:p-9 max-w-[420px] w-full relative z-10 border border-slate-100 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Nút đóng modal nếu có onClose */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-20"
            title="Đóng cửa sổ"
          >
            <X size={20} />
          </button>
        )}

        {/* Header stripe gradient */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 rounded-t-3xl"></div>

        <div className="text-center mb-6">
          <img 
            src={logoImg} 
            alt="Logo THPT Lạng Giang số 1" 
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 object-contain drop-shadow-md hover:scale-105 transition-transform duration-300 rounded-full border-2 border-blue-100" 
          />
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-1">CodeMind 10</h1>
          <div className="w-full flex justify-center">
             <p className="text-[12px] text-gray-500 italic font-medium leading-relaxed">
               Gia sư Tin học AI • THPT Lạng Giang số 1
             </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-xs sm:text-sm text-red-600 bg-red-50 p-3 rounded-xl text-center font-medium border border-red-200 animate-fade-in">
            {error}
          </div>
        )}

        {/* Nút Đăng nhập bằng Google 1-Click */}
        <div className="space-y-4">
          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoadingGoogle || !isFirebaseReady}
            title={!isFirebaseReady ? 'Cần cấu hình Firebase trong .env để bật Google Login' : 'Đăng nhập bằng tài khoản Google'}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isLoadingGoogle ? (
              <Loader2 className="animate-spin text-blue-600" size={20} />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span className="text-sm font-semibold">
              {isLoadingGoogle ? 'Đang kết nối Google...' : 'Đăng nhập với Google / Gmail'}
            </span>
          </button>

          {!isFirebaseReady && (
            <div className="text-center text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
              ⚡ Chưa nạp cấu hình Firebase trong .env. Vui lòng liên hệ quản trị viên.
            </div>
          )}

          <div className="pt-2 px-1 text-center">
            <p className="text-[12px] text-gray-500 leading-relaxed flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
              <span>Đăng nhập an toàn để lưu tiến độ và nhật ký học tập</span>
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-[11px] text-gray-400 font-medium">
          © 2026 - 2027 • Trường THPT Lạng Giang số 1
        </div>
      </div>
    </div>
  );
}

