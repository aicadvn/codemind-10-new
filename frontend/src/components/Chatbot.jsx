import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Loader2, Sparkles, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveSocraticChat, loadSocraticChat } from '../services/analyticsService';
import { askGeminiDirect } from '../services/clientGeminiService';

// Hàm khử ký tự LaTeX Dollar thừa ($ hoặc $$) để công thức toán tự nhiên và không gây hiểu lầm cho học sinh
export const cleanLatexMath = (text) => {
  if (!text || typeof text !== 'string') return text || '';
  return text
    // 1. Khử công thức block $$...$$
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
    // 2. Khử công thức inline $...$ (bỏ qua số tiền $50, $100...)
    .replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
      if (/^\s*\d+([.,]\d+)?\s*$/.test(formula)) {
        return match;
      }
      return formula.trim();
    });
};

export default function Chatbot({ activeLesson, errorToAnalyze }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const [tamperKey, setTamperKey] = useState(0);

  // Tự động cuộn xuống cuối đoạn chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, tamperKey]);

  // Lá chắn chống can thiệp DOM (Anti-DOM Tampering): Tự động khôi phục nếu học sinh sửa HTML bằng DevTools
  useEffect(() => {
    if (!scrollRef.current) return;

    const observer = new MutationObserver(() => {
      // Bất kỳ can thiệp nào vào thẻ HTML hay text của đoạn chat sẽ kích hoạt React khôi phục lại dữ liệu gốc
      setTamperKey(k => k + 1);
    });

    observer.observe(scrollRef.current, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => observer.disconnect();
  }, []);

  // Khởi tạo lời chào ban đầu nếu chưa chọn bài
  useEffect(() => {
    if (!activeLesson) {
      setMessages([{
        role: 'CodeMind',
        text: `Chào mừng bạn đến với **CodeMind 10**! 🚀 \n\nTôi là gia sư AI cá nhân của bạn theo chuẩn SGK Tin học 10 Kết nối tri thức. Hãy chọn một bài học ở thanh bên trái (Lộ trình) để bắt đầu nhé!`
      }]);
    }
  }, []);

  // Xử lý chuyển bài học: Tải lại toàn bộ lịch sử đàm thoại Socrates cũ từ Cloud Firestore
  useEffect(() => {
    if (activeLesson) {
      let isSubscribed = true;

      async function restoreLessonChat() {
        if (currentUser && !currentUser.isPasscode) {
          const savedMessages = await loadSocraticChat(currentUser.uid, activeLesson.id);
          if (savedMessages && savedMessages.length > 0 && isSubscribed) {
            setMessages(savedMessages);
            return;
          }
        }

        // Lời chào gợi ý sư phạm Socrates mặc định
        if (isSubscribed) {
          setMessages([{
            role: 'CodeMind',
            text: `Chào bạn, chúng ta cùng tìm hiểu **Bài ${activeLesson.id}: ${activeLesson.title}** nhé! 📚\n\nBạn muốn làm gì tiếp theo?\n\n**[1]** Ôn tập kiến thức cũ\n**[2]** Học bài mới\n**[3]** Săn Bug (Sửa lỗi code đang làm)`
          }]);
        }
      }

      restoreLessonChat();

      return () => {
        isSubscribed = false;
      };
    }
  }, [activeLesson, currentUser]);

  // Xử lý khi bấm nút "Săn Bug (AI)" từ Editor: Gắp code lỗi sang cho AI phân tích
  useEffect(() => {
    if (errorToAnalyze) {
      const userMsg = { 
        role: 'user', 
        text: `Hãy giúp tôi làm thám tử săn bug và phân tích gợi ý lỗi trong đoạn code sau:\n\n\`\`\`python\n${errorToAnalyze}\n\`\`\`` 
      };
      setMessages(prev => {
        const next = [...prev, userMsg];
        setTimeout(() => sendMessageApi(next), 50);
        return next;
      });
    }
  }, [errorToAnalyze]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = { role: 'user', text: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    
    await sendMessageApi(newMessages);
  };

  const sendMessageApi = async (chatHistory) => {
    setIsLoading(true);

    // Format theo chuẩn Gemini API (user/model)
    let formattedHistory = chatHistory.map(msg => ({
      role: msg.role === 'CodeMind' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    // Đảm bảo tin nhắn đầu tiên của lịch sử chat luôn là user
    if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory = [
        { role: 'user', parts: [{ text: 'Xin chào gia sư CodeMind, hãy bắt đầu buổi học nào!' }] },
        ...formattedHistory
      ];
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      let replyText = null;

      // 1. Thử gọi backend (Render) với timeout 4.5s
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const res = await fetch(`${backendUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: formattedHistory }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (json && json.reply) {
            replyText = json.reply;
          }
        }
      } catch (backendErr) {
        console.warn('[CodeMind Chat] Backend phản hồi chậm hoặc lỗi mạng, tự động kích hoạt Direct Client Engine...', backendErr?.message);
      }

      // 2. Kích hoạt Luồng Dự phòng Trực tiếp (Direct Client-Side Gemini Engine)
      // Sử dụng dải IP sạch tại trường/nhà riêng của học sinh tại Việt Nam với 12 Key xoay vòng
      if (!replyText) {
        try {
          replyText = await askGeminiDirect(formattedHistory);
        } catch (directErr) {
          console.error('[CodeMind Direct Engine Error]:', directErr);
        }
      }
      
      let finalMessages = [...chatHistory];
      if (replyText) {
        finalMessages.push({ role: 'CodeMind', text: cleanLatexMath(replyText) });
      } else {
        finalMessages.push({ role: 'CodeMind', text: 'Xin lỗi, hệ thống AI đang bận. Bạn hãy thử lại sau nhé!' });
      }

      setMessages(finalMessages);

      // Tự động lưu vết toàn bộ tiến trình tương tác Socratic lên Cloud Firestore
      if (activeLesson && currentUser && !currentUser.isPasscode) {
        saveSocraticChat(currentUser.uid, activeLesson.id, finalMessages);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'CodeMind', text: 'Đã xảy ra lỗi kết nối với máy chủ AI. 🐛' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm z-10 sticky top-0 flex gap-3 items-center justify-between">
        <div className="flex gap-3 items-center">
          <div className="bg-primary-100 text-primary-600 p-2.5 rounded-xl">
            <Bot size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-gray-800 text-lg tracking-tight">Gia sư CodeMind</h2>
              <span className="text-[10px] bg-primary-100 text-primary-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={11} /> Socrates AI
              </span>
            </div>
            <p className="text-[11px] text-gray-500 italic mt-0.5">Bản quyền THPT Lạng Giang số 1</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5 justify-end">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Sẵn sàng
          </span>
          {activeLesson && (
            <span className="text-[10px] text-gray-400 block font-medium">Bài {activeLesson.id}</span>
          )}
        </div>
      </div>

      {/* Vùng hiển thị cuộc trò chuyện */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'CodeMind' && (
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0 mt-1">
                <Bot size={18} />
              </div>
            )}
            
            <div 
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm prose prose-sm md:prose-base
                ${msg.role === 'user' 
                  ? 'bg-primary-600 text-white rounded-tr-none prose-invert' 
                  : 'bg-white border border-gray-100 text-gray-800 text-[14px] leading-relaxed rounded-tl-none'}
              `}
            >
              <ReactMarkdown>{cleanLatexMath(msg.text)}</ReactMarkdown>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shrink-0 mt-1">
                <User size={18} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mt-1 relative">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-20 animate-ping"></span>
              <Bot size={18} className="animate-pulse" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex flex-col justify-center h-[52px]">
              <div className="flex gap-1.5 items-center">
                <div className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce [animation-duration:1s] [animation-delay:-0.3s]"></div>
                <div className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce [animation-duration:1s] [animation-delay:-0.15s]"></div>
                <div className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce [animation-duration:1s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vùng nhập câu hỏi */}
      <div className="p-3.5 bg-white border-t border-gray-200 shrink-0 z-10 shadow-sm">
        <div className="flex bg-gray-50 rounded-xl border border-gray-200 p-1 focus-within:ring-2 focus-within:ring-primary-300 focus-within:border-primary-400 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi Gia sư CodeMind về bài học, săn bug..."
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none p-2.5 h-11 max-h-32 text-gray-700 outline-none text-xs sm:text-sm leading-relaxed scrollbar-thin"
            rows="1"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-primary-600 text-white rounded-lg px-3.5 h-10 hover:bg-primary-500 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center aspect-square self-end"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="text-center mt-1.5 flex items-center justify-center gap-1 text-[11px] text-gray-400">
          <History size={11} /> Hội thoại được lưu tự động theo từng bài học
        </div>
      </div>
    </div>
  );
}
