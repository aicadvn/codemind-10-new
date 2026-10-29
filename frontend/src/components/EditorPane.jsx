import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Bug, Terminal, Cloud, CloudUpload, HardDrive, Paintbrush, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logDebugEvent } from '../services/analyticsService';

// Mẫu code khởi đầu gợi ý theo từng bài học SGK Tin học 10 Kết nối tri thức
const LESSON_STARTER_CODES = {
  1: '# Bài 1: Ngôn ngữ lập trình bậc cao và Python\nprint("Xin chào! Mình đang học lập trình Python 10.")\n',
  2: '# Bài 2: Biến và lệnh gán\nten = "Nguyễn Văn A"\ntuoi = 16\nprint("Họ tên:", ten)\nprint("Tuổi:", tuoi)\n',
  3: '# Bài 3: Các lệnh vào ra đơn giản\nten = input("Nhập tên của bạn: ")\nprint("Chào mừng", ten, "đến với lớp học Tin học 10!")\n',
  4: '# Bài 4: Câu lệnh rẽ nhánh if\ndiem = 8.5\nif diem >= 5.0:\n    print("Chúc mừng, bạn đã Đạt!")\nelse:\n    print("Cần cố gắng thêm nhé!")\n',
  5: '# Bài 5: Câu lệnh lặp for\nprint("Đếm từ 1 đến 5:")\nfor i in range(1, 6):\n    print("Số:", i)\n',
  6: '# Bài 6: Câu lệnh lặp while\ndem = 1\nwhile dem <= 3:\n    print("Lặp lần thứ:", dem)\n    dem = dem + 1\n',
  7: '# Bài 7: Kiểu dữ liệu danh sách (List)\ndanh_sach = ["Toán", "Tin", "Văn", "Anh"]\nprint("Môn học đầu tiên:", danh_sach[0])\nprint("Toàn bộ môn học:", danh_sach)\n',
  8: '# Bài 8: Một số lệnh làm việc với danh sách\na = [10, 5, 8, 20]\na.append(15)\na.sort()\nprint("Danh sách sau khi thêm và sắp xếp:", a)\n',
  9: '# Bài 9: Xâu ký tự\nxau = "THPT Lạng Giang số 1"\nprint("Độ dài của xâu:", len(xau))\nprint("Chữ in hoa:", xau.upper())\n',
  10: '# Bài 10: Một số lệnh làm việc với xâu ký tự\ns = "Học, học nữa, học mãi"\ncac_tu = s.split(", ")\nprint("Tách từ:", cac_tu)\n',
  11: '# Bài 11: Hàm trong Python\ndef xin_chao(ten):\n    print("Xin chào bạn", ten)\n\nxin_chao("Nam")\n',
  12: '# Bài 12: Tham số của hàm\ndef tinh_tong(a, b):\n    return a + b\n\nket_qua = tinh_tong(15, 25)\nprint("Tổng là:", ket_qua)\n',
  13: '# Bài 13: Phạm vi của biến\nx = 100 # Biến toàn cục\ndef ham_test():\n    y = 50 # Biến cục bộ\n    print("Bên trong hàm:", x, y)\n\nham_test()\n',
  14: '# Bài 14: Nhận biết lỗi chương trình\n# Ví dụ lỗi thụt lề hoặc lỗi chia cho 0\nprint("Thử nghiệm phát hiện lỗi:")\na = 10\nb = 2\nprint("Thương số:", a / b)\n',
  15: '# Bài 15: Kiểm thử và gỡ lỗi chương trình\n# Hãy dùng nút "Săn Bug (AI)" khi gặp lỗi nhé!\nprint("Sẵn sàng kiểm thử chương trình.")\n',
  16: '# Bài 16: Thực hành viết chương trình đơn giản\n# Bài toán: Tính diện tích hình chữ nhật\nchieu_dai = float(input("Nhập chiều dài: "))\nchieu_rong = float(input("Nhập chiều rộng: "))\ndien_tich = chieu_dai * chieu_rong\nprint("Diện tích là:", dien_tich)\n',
  17: '# Bài 17: Ôn tập lập trình Python\nprint("Tổng kết kiến thức Chủ đề 5 - Lập trình Python 10.")\n'
};

export default function EditorPane({ activeLesson, onAnalyzeError }) {
  const { currentUser, saveLessonCodeToCloud, loadLessonCodeFromCloud } = useAuth();
  
  const lessonId = activeLesson?.id || 1;
  const storageKey = `code_mind_saved_lesson_${lessonId}`;

  // 1. Khởi tạo mã code
  const [code, setCode] = useState(() => {
    return localStorage.getItem(storageKey) || LESSON_STARTER_CODES[lessonId] || '# Viết code Python của bạn tại đây\nprint("Hello, Tin học 10!")\n';
  });

  const [output, setOutput] = useState('');
  const [isOutputError, setIsOutputError] = useState(false);
  const [theme, setTheme] = useState('vs-dark');
  const [syncStatus, setSyncStatus] = useState('saved'); // 'saved', 'syncing', 'cloud-synced'
  
  const cloudDebounceRef = useRef(null);

  // 2. Chuyển bài học -> Tải code của bài đó (Ưu tiên đám mây, sau đó đến LocalStorage)
  useEffect(() => {
    let isSubscribed = true;

    async function loadCodeForLesson() {
      setSyncStatus('syncing');

      // Thử lấy từ Cloud Firestore nếu đang đăng nhập tài khoản Google
      if (currentUser && !currentUser.isPasscode) {
        try {
          const cloudCode = await loadLessonCodeFromCloud(lessonId);
          if (cloudCode && isSubscribed) {
            setCode(cloudCode);
            localStorage.setItem(storageKey, cloudCode);
            setSyncStatus('cloud-synced');
            return;
          }
        } catch (e) {
          console.warn('Lỗi khi tải code từ Firestore:', e);
        }
      }

      // Nếu không có trên đám mây, lấy từ localStorage hoặc template mẫu
      const localCode = localStorage.getItem(storageKey);
      if (localCode) {
        if (isSubscribed) {
          setCode(localCode);
          setSyncStatus('saved');
        }
      } else {
        const defaultCode = LESSON_STARTER_CODES[lessonId] || '# Viết code Python của bạn tại đây\nprint("Hello, Tin học 10!")\n';
        if (isSubscribed) {
          setCode(defaultCode);
          setSyncStatus('saved');
        }
      }
    }

    loadCodeForLesson();

    return () => {
      isSubscribed = false;
    };
  }, [lessonId, currentUser]);

  // 3. Cơ chế Lưu kết hợp (Hybrid Save):
  // - Lưu ngay lập tức (1 giây) vào localStorage
  // - Debounce 15 giây lưu lên Cloud Firestore để tiết kiệm 95% quota
  useEffect(() => {
    // Lưu cục bộ 1s
    const localTimer = setTimeout(() => {
      localStorage.setItem(storageKey, code);
      setSyncStatus(prev => prev === 'cloud-synced' ? 'saved' : prev);
    }, 1000);

    // Lưu đám mây (Debounce 15 giây)
    if (currentUser && !currentUser.isPasscode) {
      if (cloudDebounceRef.current) clearTimeout(cloudDebounceRef.current);
      
      cloudDebounceRef.current = setTimeout(async () => {
        setSyncStatus('syncing');
        const ok = await saveLessonCodeToCloud(lessonId, code);
        if (ok) {
          setSyncStatus('cloud-synced');
        } else {
          setSyncStatus('saved');
        }
      }, 15000);
    }

    return () => {
      clearTimeout(localTimer);
      if (cloudDebounceRef.current) clearTimeout(cloudDebounceRef.current);
    };
  }, [code, lessonId, currentUser]);

  // Lưu tức thời lên Cloud khi bấm Chạy thử hoặc Săn Bug
  const triggerImmediateCloudSync = async () => {
    if (currentUser && !currentUser.isPasscode) {
      setSyncStatus('syncing');
      const ok = await saveLessonCodeToCloud(lessonId, code);
      if (ok) setSyncStatus('cloud-synced');
    }
  };

  const handleRunCode = async () => {
    triggerImmediateCloudSync();

    if (!code.trim()) {
      setOutput('> Code rỗng. Vui lòng gõ một vài dòng lệnh Python nhé!');
      setIsOutputError(true);
      return;
    }

    setOutput('> Đang khởi tạo môi trường Python (lần đầu có thể mất 3-5 giây)...\n');
    setIsOutputError(false);

    try {
      if (!window.pyodideIsLoaded) {
        window.pyodide = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
        });
        
        await window.pyodide.runPythonAsync(`
import builtins
import js
import sys

class JsOutput:
    def write(self, text):
        js.appendOutput(text)
    def flush(self):
        pass

sys.stdout = JsOutput()
sys.stderr = JsOutput()

def custom_input(prompt_text=""):
    res = js.prompt(prompt_text)
    if res is None: 
        raise EOFError("Người dùng đã hủy nhập lệnh (User canceled input)")
    js.appendOutput(prompt_text + str(res) + "\\n")
    return res

builtins.input = custom_input
        `);
        window.pyodideIsLoaded = true;
      }

      // Chuẩn bị thực thi
      let currentOutput = "> Đang thực thi lệnh...\n\n";
      setOutput(currentOutput);
      
      window.appendOutput = (text) => {
        currentOutput += text;
        setOutput(currentOutput);
      };

      await window.pyodide.runPythonAsync(code);
      
      currentOutput += '\n\n✅ Chương trình chạy thành công (Exit Code 0).';
      setOutput(currentOutput);
      setIsOutputError(false);
    } catch (err) {
      console.error(err);
      let errorMsg = err.message || String(err);
      if (window.appendOutput) {
         window.appendOutput('\n\n❌ Lỗi thực thi:\n' + errorMsg);
      } else {
         setOutput(prev => prev + '\n\n❌ Lỗi thực thi:\n' + errorMsg);
      }
      setIsOutputError(true);
      // Tự động ghi nhật ký gỡ lỗi (Debugging Log NCKH)
      logDebugEvent(currentUser?.uid, lessonId, code, errorMsg);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'vs-dark' ? 'light' : 'vs-dark');
  };

  const handleBugHunt = () => {
    triggerImmediateCloudSync();
    if (!code.trim()) return;
    // Ghi nhật ký học sinh kích hoạt Săn Bug
    logDebugEvent(currentUser?.uid, lessonId, code, output || 'Học sinh kích hoạt tính năng Săn Bug (AI)');
    onAnalyzeError(code);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] relative">
      
      {/* Header thanh công cụ của Editor */}
      <div className="px-4 py-2.5 bg-[#252526] border-b border-[#3c3c3c] flex items-center justify-between z-10 select-none">
        
        <div className="text-gray-300 font-mono text-sm flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 cursor-pointer transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 cursor-pointer transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 cursor-pointer transition-colors"></div>
          </div>
          <span className="bg-[#1e1e1e] py-1 px-3 rounded-t-md border-b-[2px] border-primary-500 text-primary-400 text-xs flex items-center gap-1.5">
            <span>bai_{lessonId}.py</span>
          </span>

          {/* Huy hiệu trạng thái đồng bộ dữ liệu */}
          <div className="ml-2 flex items-center gap-1 text-[11px] text-gray-400 font-sans">
            {syncStatus === 'cloud-synced' && (
              <span className="flex items-center gap-1 text-emerald-400" title="Code đã được đồng bộ lên Google Cloud Firestore an toàn">
                <Cloud size={13} /> Đã lưu đám mây
              </span>
            )}
            {syncStatus === 'syncing' && (
              <span className="flex items-center gap-1 text-amber-400 animate-pulse" title="Đang đồng bộ...">
                <CloudUpload size={13} /> Đang lưu...
              </span>
            )}
            {syncStatus === 'saved' && (
              <span className="flex items-center gap-1 text-gray-400" title="Đã lưu cục bộ vào máy tính">
                <HardDrive size={12} /> Đã lưu máy
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2.5">
          {/* Đổi giao diện Sáng / Tối */}
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded-lg text-gray-300 text-xs font-medium transition-all"
            title="Đổi màu giao diện Editor"
          >
            <Paintbrush size={14} />
          </button>

          {/* Nút Chạy thử */}
          <button 
            onClick={handleRunCode}
            className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 hover:shadow-[0_0_15px_rgba(74,222,128,0.2)] px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold transition-all hover:-translate-y-0.5"
          >
            <Play size={14} className="text-green-400 fill-green-400" />
            <span>Chạy thử</span>
          </button>
          
          {/* Nút Săn Bug (AI) */}
          <button 
            onClick={handleBugHunt}
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold transition-all shadow-md hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:-translate-y-0.5"
            title="Nhờ AI phân tích lỗi trong code hiện tại"
          >
            <Bug size={14} className="animate-pulse" />
            <span>Săn Bug (AI)</span>
          </button>
        </div>
      </div>

      {/* Editor Monaco chính */}
      <div className="flex-1 relative border-b border-[#3c3c3c]">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme={theme}
          value={code}
          onChange={(val) => setCode(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            padding: { top: 16 },
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>

      {/* Console Output thực thi */}
      <div className="h-1/3 min-h-[140px] max-h-[50%] bg-[#1e1e1e] flex flex-col shadow-inner relative">
        <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between border-b border-[#3c3c3c] shadow-sm select-none z-10 w-full shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono tracking-wider uppercase">
            <Terminal size={14} className="text-gray-500" />
            <span>Console Output</span>
          </div>
          
          <button 
            onClick={() => { setOutput(''); setIsOutputError(false); }}
            title="Xóa kết quả Console"
            className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors bg-gray-800 hover:bg-gray-700 px-2 py-0.5 rounded text-xs font-mono"
          >
            <Trash2 size={12} /> Clear
          </button>
        </div>
        <div className="flex-1 p-3.5 font-mono text-xs sm:text-sm overflow-y-auto bg-[#141414] scrollbar-thin scrollbar-thumb-gray-600">
          {!output ? (
            <span className="text-gray-600 italic text-xs">Chưa có kết quả chạy chương trình... Ấn "Chạy thử" để xem console.</span>
          ) : (
            <div className="whitespace-pre-wrap leading-relaxed">
              {output.split('\n').map((line, idx) => {
                let lineColor = 'text-green-400';
                if (line.startsWith('>')) lineColor = 'text-blue-400';
                else if (line.includes('❌') || line.includes('Error:') || isOutputError) lineColor = 'text-red-400';
                else if (line.includes('✅')) lineColor = 'text-emerald-400 font-bold';
                else if (line.match(/^[0-9]+$/)) lineColor = 'text-yellow-400';

                return (
                  <span key={idx} className={`block ${lineColor}`}>
                    {line}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
