import { useState } from 'react';
import { Lock, Loader2, Sparkles, KeyRound, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onLoginSuccess }) {
  const { loginWithGoogle, loginWithPasscode, isFirebaseReady } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingPasscode, setIsLoadingPasscode] = useState(false);
  const [showPasscodeOption, setShowPasscodeOption] = useState(!isFirebaseReady);

  // Xử lý đăng nhập bằng tài khoản Google 1-Click
  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoadingGoogle(true);
    try {
      await loginWithGoogle();
      if (onLoginSuccess) onLoginSuccess();
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

  // Xử lý đăng nhập bằng Mật mã lớp học (Passcode dự phòng)
  const handlePasscodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!passcode.trim()) {
      setError('Vui lòng nhập mã truy cập của lớp');
      return;
    }

    setIsLoadingPasscode(true);
    try {
      const success = await loginWithPasscode(passcode);
      if (success) {
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setError('Mã truy cập lớp học không chính xác. Vui lòng thử lại!');
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi kết nối máy chủ xác thực. Vui lòng thử lại sau.');
    } finally {
      setIsLoadingPasscode(false);
    }
  };

  const isLoading = isLoadingGoogle || isLoadingPasscode;

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100/50 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-100/50 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 max-w-[440px] w-full relative z-10 border border-gray-100">
        
        {/* Header stripe */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600"></div>

        <div className="text-center mb-6">
          <img 
            src="/logo.png" 
            alt="Logo THPT Lạng Giang 1" 
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 object-contain drop-shadow-sm hover:scale-105 transition-transform duration-500" 
          />
          <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight mb-1">CodeMind 10</h1>
          <div className="w-full flex justify-center">
             <p className="text-[11px] sm:text-[12px] text-gray-500 italic font-medium leading-relaxed whitespace-nowrap">
               Gia sư Tin học AI - Bản quyền THPT Lạng Giang số 1
             </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 text-sm text-red-600 bg-red-50 p-3 rounded-xl text-center font-medium border border-red-100 animate-fade-in">
            {error}
          </div>
        )}

        {/* Nút Đăng nhập bằng Google 1-Click (Phương thức ưu tiên hàng đầu) */}
        <div className="space-y-4">
          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || !isFirebaseReady}
            title={!isFirebaseReady ? 'Cần cấu hình VITE_FIREBASE_* trong .env để bật Google Login' : 'Đăng nhập bằng tài khoản Google'}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 border border-gray-300 shadow-sm hover:shadow transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isLoadingGoogle ? (
              <Loader2 className="animate-spin text-primary-600" size={20} />
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
            <span className="text-sm">
              {isLoadingGoogle ? 'Đang kết nối Google...' : 'Đăng nhập với Google / Gmail'}
            </span>
          </button>

          {!isFirebaseReady && (
            <div className="text-center text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
              ⚡ Chưa nạp cấu hình Firebase trong <code className="font-mono font-bold">.env</code>. Hệ thống đang sẵn sàng ở chế độ Passcode bên dưới.
            </div>
          )}

          {/* Đường phân cách */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-3 text-gray-400 text-xs uppercase font-medium">Hoặc</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Tùy chọn đăng nhập nhanh bằng Passcode lớp học */}
          <div className="border border-gray-100 rounded-2xl p-3 bg-gray-50/70">
            <button
              type="button"
              onClick={() => setShowPasscodeOption(!showPasscodeOption)}
              className="w-full flex items-center justify-between text-left text-xs font-semibold text-gray-600 hover:text-primary-600 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <KeyRound size={14} className="text-primary-600" />
                Vào nhanh bằng Mật mã lớp học (Dự phòng)
              </span>
              {showPasscodeOption ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showPasscodeOption && (
              <form onSubmit={handlePasscodeSubmit} className="mt-3 space-y-3 animate-fade-in">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <Lock size={16} />
                  </div>
                  <input 
                    type="password" 
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Nhập mã truy cập lớp..."
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all shadow-sm"
                    disabled={isLoading}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-sm hover:shadow active:translate-y-0 disabled:opacity-70 text-sm"
                >
                  {isLoadingPasscode ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    'Vào Phòng Học Bằng Mã'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} Copyright by Giáo viên Trần Thị Ngà
        </div>
      </div>
    </div>
  );
}
