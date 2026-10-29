import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';
import EditorPane from './components/EditorPane';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import InstructionModal from './components/InstructionModal';
import ClassSelectModal from './components/ClassSelectModal';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDiaryModal from './components/StudentDiaryModal';
import { Menu, MessageSquare, Code } from 'lucide-react';

function MainApp() {
  const { currentUser, needsClassSelection } = useAuth();
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'sidebar', 'chat', 'editor'
  const [errorToAnalyze, setErrorToAnalyze] = useState(null);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLessonSelect = (lesson, preferredTab = null) => {
    setActiveLesson(lesson);
    // Trên mobile, tự động chuyển sang tab tương ứng (mặc định là chat)
    if (window.innerWidth < 768) {
      setActiveTab(preferredTab || 'chat');
    }
  };

  const handleErrorAnalysis = (errorInfo) => {
    setErrorToAnalyze(errorInfo);
    if (window.innerWidth < 768) {
      setActiveTab('chat');
    }
  };

  // Nếu chưa đăng nhập: Hiển thị Trang chủ Landing Page hoành tráng toàn màn hình
  if (!currentUser) {
    return (
      <>
        <LandingPage
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenInstruction={() => setIsInstructionOpen(true)}
        />
        <Login
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
        <InstructionModal
          isOpen={isInstructionOpen}
          onClose={() => setIsInstructionOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-gray-50 text-gray-800">

      {/* Mobile Header / Tab Navigation */}
      <div className="md:hidden flex bg-white border-b border-gray-200">
        <button
          onClick={() => setActiveTab('sidebar')}
          className={`flex-1 py-3 flex justify-center items-center gap-2 border-b-2 ${activeTab === 'sidebar' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}
        >
          <Menu size={20} /> Lộ trình
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 flex justify-center items-center gap-2 border-b-2 ${activeTab === 'chat' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}
        >
          <MessageSquare size={20} /> Gia sư AI
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex-1 py-3 flex justify-center items-center gap-2 border-b-2 ${activeTab === 'editor' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}
        >
          <Code size={20} /> Code
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden w-full relative">

        {/* Sidebar Pane (20% Desktop) */}
        <div className={`${activeTab === 'sidebar' ? 'block' : 'hidden'} md:block w-full md:w-1/5 h-full border-r border-gray-200 bg-white shadow-sm z-10`}>
          <Sidebar
            activeLesson={activeLesson}
            onSelectLesson={handleLessonSelect}
            onOpenInstruction={() => setIsInstructionOpen(true)}
            onOpenDiary={() => setIsDiaryOpen(true)}
            onOpenDashboard={() => setIsDashboardOpen(true)}
          />
        </div>

        {/* Chatbot Pane (40% Desktop) */}
        <div className={`${activeTab === 'chat' ? 'block' : 'hidden'} md:block w-full md:w-2/5 h-full border-r border-gray-200 bg-gray-50 flex flex-col z-10`}>
          <Chatbot activeLesson={activeLesson} errorToAnalyze={errorToAnalyze} />
        </div>

        {/* Editor Pane (40% Desktop) */}
        <div className={`${activeTab === 'editor' ? 'block' : 'hidden'} md:block w-full md:w-2/5 h-full bg-white z-10`}>
          <EditorPane activeLesson={activeLesson} onAnalyzeError={handleErrorAnalysis} />
        </div>
      </div>

      {/* Modal Hướng Dẫn Sử Dụng */}
      <InstructionModal isOpen={isInstructionOpen} onClose={() => setIsInstructionOpen(false)} />

      {/* Modal Onboarding Chọn Lớp 10A1 - 10D4 cho Học sinh mới */}
      <ClassSelectModal isOpen={needsClassSelection} />

      {/* Modal Sổ Tay Săn Bug Cá Nhân cho Học Sinh */}
      <StudentDiaryModal 
        isOpen={isDiaryOpen} 
        onClose={() => setIsDiaryOpen(false)} 
        onSelectLesson={handleLessonSelect}
      />

      {/* Bảng Điều Khiển Sư Phạm & Xuất Dữ Liệu NCKH cho Giáo Viên */}
      <TeacherDashboard isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} />

    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
