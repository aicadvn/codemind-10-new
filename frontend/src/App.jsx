import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';
import EditorPane from './components/EditorPane';
import Login from './components/Login';
import InstructionModal from './components/InstructionModal';
import { Menu, MessageSquare, Code } from 'lucide-react';

function MainApp() {
  const { currentUser } = useAuth();
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'sidebar', 'chat', 'editor'
  const [errorToAnalyze, setErrorToAnalyze] = useState(null);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  const handleLessonSelect = (lesson) => {
    setActiveLesson(lesson);
    // On mobile, auto-switch to chat after selecting lesson
    if (window.innerWidth < 768) {
      setActiveTab('chat');
    }
  };

  const handleErrorAnalysis = (errorInfo) => {
    setErrorToAnalyze(errorInfo);
    if (window.innerWidth < 768) {
      setActiveTab('chat');
    }
  };

  if (!currentUser) {
    return <Login />;
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
          <Sidebar activeLesson={activeLesson} onSelectLesson={handleLessonSelect} onOpenInstruction={() => setIsInstructionOpen(true)} />
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

      <InstructionModal isOpen={isInstructionOpen} onClose={() => setIsInstructionOpen(false)} />
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
