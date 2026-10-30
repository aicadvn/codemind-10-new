import { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Upload, 
  Download, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Check,
  AlertCircle, 
  Search, 
  Filter, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  BarChart3, 
  RefreshCw, 
  X, 
  Layers, 
  Plus, 
  ArrowRight,
  LogOut,
  ChevronRight,
  Sparkles,
  School,
  FileSpreadsheet
} from 'lucide-react';
import { SCHOOL_CLASSES, SUPER_ADMIN_EMAIL, SUPER_ADMIN_TITLE, isSuperAdmin } from '../config/schoolConfig';
import { useAuth } from '../context/AuthContext';
import { 
  downloadStudentSampleCSV, 
  parseStudentCSV, 
  saveStudentsToFirestore, 
  fetchAllRegisteredStudents, 
  updateStudentClassInSystem, 
  deleteStudentFromSystem, 
  addSingleStudentToSystem,
  fetchAllTeachersList,
  saveTeacherAccount,
  updateTeacherAssignedClasses,
  removeTeacherFromSystem
} from '../services/adminService';
import logoImg from '../assets/Logo_moi_35b82.jpg';

export default function AdminPortal({ 
  isOpen, 
  onClose, 
  onOpenTeacherDashboard, 
  onGoToLearning,
  onLogout 
}) {
  const { currentUser } = useAuth();
  const currentAdminLabel = currentUser?.email === 'nguyentrunghoa@gmail.com'
    ? 'Thầy Nguyễn Trung Hòa'
    : (currentUser?.email === 'smilers.thp@gmail.com' || currentUser?.email === 'tranthingalg1@gmail.com' ? 'Cô Trần Thị Ngà' : (currentUser?.displayName || 'Ban Quản Trị'));

  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'teachers'
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // CSV Import States
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null);
  const [csvErrors, setCsvErrors] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  // Manual Add Student States
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ fullName: '', email: '', className: '10A1', stt: '' });
  const [addStudentError, setAddStudentError] = useState('');

  // Edit Student Class States
  const [editingStudent, setEditingStudent] = useState(null);
  const [newClassForStudent, setNewClassForStudent] = useState('10A1');

  // Teacher Management States
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', assignedClasses: ['all'] });
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [newClassesForTeacher, setNewClassesForTeacher] = useState(['all']);
  const [teacherActionError, setTeacherActionError] = useState('');

  // Helpers tính toán phân nhiều lớp cho modal Phân công lại lớp
  const isAllSelected = (newClassesForTeacher || []).includes('all') || (newClassesForTeacher || []).length === SCHOOL_CLASSES.length;

  const selectedClassesList = isAllSelected 
    ? SCHOOL_CLASSES 
    : SCHOOL_CLASSES.filter(cls => (newClassesForTeacher || []).includes(cls));

  const selectedClassCount = selectedClassesList.length;

  const isClassSelected = (cls) => {
    if ((newClassesForTeacher || []).includes('all')) return true;
    return (newClassesForTeacher || []).includes(cls);
  };

  const toggleTeacherClass = (cls) => {
    if (cls === 'all') {
      if (isAllSelected) {
        setNewClassesForTeacher([]);
      } else {
        setNewClassesForTeacher(['all']);
      }
      return;
    }

    let current = isAllSelected ? [...SCHOOL_CLASSES] : [...(newClassesForTeacher || [])];
    if (current.includes(cls)) {
      current = current.filter(c => c !== cls);
    } else {
      current.push(cls);
    }

    if (current.length === SCHOOL_CLASSES.length) {
      setNewClassesForTeacher(['all']);
    } else {
      setNewClassesForTeacher(current);
    }
  };

  const handleSelectAllClasses = () => {
    setNewClassesForTeacher(['all']);
  };

  const handleDeselectAllClasses = () => {
    setNewClassesForTeacher([]);
  };

  // Helpers cho modal Thêm giáo viên mới
  const isNewTeacherAllSelected = (newTeacher.assignedClasses || []).includes('all') || (newTeacher.assignedClasses || []).length === SCHOOL_CLASSES.length;

  const newTeacherSelectedList = isNewTeacherAllSelected
    ? SCHOOL_CLASSES
    : SCHOOL_CLASSES.filter(cls => (newTeacher.assignedClasses || []).includes(cls));

  const isNewTeacherClassSelected = (cls) => {
    if ((newTeacher.assignedClasses || []).includes('all')) return true;
    return (newTeacher.assignedClasses || []).includes(cls);
  };

  const toggleNewTeacherClass = (cls) => {
    if (cls === 'all') {
      if (isNewTeacherAllSelected) {
        setNewTeacher(prev => ({ ...prev, assignedClasses: [] }));
      } else {
        setNewTeacher(prev => ({ ...prev, assignedClasses: ['all'] }));
      }
      return;
    }

    let current = isNewTeacherAllSelected ? [...SCHOOL_CLASSES] : [...(newTeacher.assignedClasses || [])];
    if (current.includes(cls)) {
      current = current.filter(c => c !== cls);
    } else {
      current.push(cls);
    }

    if (current.length === SCHOOL_CLASSES.length) {
      setNewTeacher(prev => ({ ...prev, assignedClasses: ['all'] }));
    } else {
      setNewTeacher(prev => ({ ...prev, assignedClasses: current }));
    }
  };

  // Tải dữ liệu ban đầu
  const loadAllData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [studentsData, teachersData] = await Promise.all([
        fetchAllRegisteredStudents(),
        fetchAllTeachersList()
      ]);
      setStudents(studentsData);
      setTeachers(teachersData);
    } catch (err) {
      console.error('Lỗi tải dữ liệu Quản trị:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Lọc danh sách học sinh
  const filteredStudents = students.filter(s => {
    const matchClass = selectedClassFilter === 'all' || s.className === selectedClassFilter;
    const term = searchTerm.toLowerCase();
    const matchSearch = !term || 
      (s.fullName || s.displayName || '').toLowerCase().includes(term) || 
      (s.email || '').toLowerCase().includes(term);
    return matchClass && matchSearch;
  });

  // Xử lý khi chọn file CSV
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setCsvErrors([]);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result;
        const result = parseStudentCSV(text);
        setCsvPreview(result.validStudents);
        setCsvErrors(result.errors || []);
      } catch (err) {
        setCsvErrors([err.message]);
        setCsvPreview(null);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Xác nhận lưu dữ liệu CSV vào Firestore
  const handleConfirmImportCSV = async () => {
    if (!csvPreview || csvPreview.length === 0) return;
    setIsImporting(true);
    setImportStatus(null);

    try {
      const result = await saveStudentsToFirestore(csvPreview, SUPER_ADMIN_EMAIL);
      setImportStatus({
        success: true,
        message: `Đã nhập thành công ${result.successCount} học sinh vào hệ thống!`
      });
      await loadAllData();
      setTimeout(() => {
        setIsCsvModalOpen(false);
        setCsvFile(null);
        setCsvPreview(null);
        setImportStatus(null);
      }, 1500);
    } catch (err) {
      setImportStatus({
        success: false,
        message: `Lỗi khi lưu dữ liệu: ${err.message}`
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Thêm học sinh thủ công
  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    setAddStudentError('');

    if (!newStudent.email.trim()) {
      setAddStudentError('Vui lòng nhập Email Gmail của học sinh');
      return;
    }

    try {
      await addSingleStudentToSystem(newStudent, SUPER_ADMIN_EMAIL);
      await loadAllData();
      setIsAddStudentModalOpen(false);
      setNewStudent({ fullName: '', email: '', className: '10A1', stt: '' });
      alert('Đã thêm học sinh vào danh sách thành công!');
    } catch (err) {
      setAddStudentError(err.message);
    }
  };

  // Chuyển lớp cho học sinh
  const handleSaveStudentClassChange = async () => {
    if (!editingStudent) return;
    try {
      await updateStudentClassInSystem(editingStudent.email, newClassForStudent);
      await loadAllData();
      setEditingStudent(null);
      alert(`Đã chuyển học sinh ${editingStudent.fullName || editingStudent.email} sang lớp ${newClassForStudent}!`);
    } catch (err) {
      alert(`Lỗi chuyển lớp: ${err.message}`);
    }
  };

  // Xóa học sinh
  const handleDeleteStudent = async (student) => {
    const confirmMsg = `Bạn có chắc chắn muốn xóa học sinh "${student.fullName || student.email}" (${student.className || 'Chưa xếp lớp'}) khỏi hệ thống?\n\nHọc sinh này sẽ bị loại bỏ hoàn toàn và không thể đăng nhập vào phòng học được nữa.`;
    if (!window.confirm(confirmMsg)) return;

    // 1. Cập nhật state tức thì để UI loại bỏ học sinh ngay lập tức
    const targetEmail = (student.email || '').toLowerCase().trim();
    setStudents(prev => prev.filter(s => (s.email || '').toLowerCase().trim() !== targetEmail));

    try {
      await deleteStudentFromSystem(student.email);
      // 2. Tải lại toàn bộ dữ liệu nền ngầm để giữ UI mượt mà
      await loadAllData(true);
    } catch (err) {
      alert(`Lỗi xóa học sinh: ${err.message}`);
      await loadAllData(false);
    }
  };

  // Thêm giáo viên mới
  const handleAddTeacherSubmit = async (e) => {
    e.preventDefault();
    setTeacherActionError('');

    if (!newTeacher.email.trim()) {
      setTeacherActionError('Vui lòng nhập email giáo viên');
      return;
    }

    if (newTeacherSelectedList.length === 0) {
      setTeacherActionError('Vui lòng chọn ít nhất 1 lớp phụ trách cho giáo viên');
      return;
    }

    const assigned = isNewTeacherAllSelected ? ['all'] : newTeacherSelectedList;

    try {
      await saveTeacherAccount({
        email: newTeacher.email,
        name: newTeacher.name || 'Giáo viên Tin học',
        assignedClasses: assigned,
        role: 'teacher'
      }, SUPER_ADMIN_EMAIL);

      await loadAllData(true);
      setIsAddTeacherModalOpen(false);
      setNewTeacher({ name: '', email: '', assignedClasses: ['all'] });
      alert('Đã thêm giáo viên và phân quyền lớp thành công!');
    } catch (err) {
      setTeacherActionError(err.message);
    }
  };

  // Cập nhật lớp cho giáo viên
  const handleSaveTeacherClassChange = async () => {
    if (!editingTeacher) return;
    if (selectedClassCount === 0) {
      alert('Vui lòng chọn ít nhất 1 lớp phụ trách cho giáo viên!');
      return;
    }

    try {
      const assigned = isAllSelected ? ['all'] : selectedClassesList;
      await updateTeacherAssignedClasses(editingTeacher.email, assigned);
      await loadAllData(true);
      setEditingTeacher(null);
      alert(`Đã cập nhật quyền quản lý ${isAllSelected ? 'Toàn bộ 10 lớp' : `${selectedClassCount} lớp`} cho giáo viên ${editingTeacher.name || editingTeacher.email}!`);
    } catch (err) {
      alert(`Lỗi cập nhật: ${err.message}`);
    }
  };

  // Xóa giáo viên
  const handleDeleteTeacher = async (teacher) => {
    if (isSuperAdmin(teacher.email)) {
      alert('Không thể xóa tài khoản Quản trị viên tối cao của hệ thống!');
      return;
    }

    const confirmMsg = `Bạn có chắc chắn muốn gỡ quyền Giáo viên của tài khoản "${teacher.name || teacher.email}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await removeTeacherFromSystem(teacher.email);
      await loadAllData();
      alert('Đã gỡ quyền giáo viên thành công!');
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[94vh] flex flex-col overflow-hidden border border-slate-200 animate-scale-up">
        
        {/* ======================================================== */}
        {/* HEADER QUẢN TRỊ TỐI CAO                                   */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-3 shrink-0 border-b border-indigo-900/50 shadow-md">
          <div className="flex items-center gap-3">
            <img 
              src={logoImg} 
              alt="Logo THPT Lạng Giang số 1" 
              className="w-11 h-11 rounded-2xl border border-white/20 object-contain bg-white/10 p-0.5 shadow-inner shrink-0" 
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black tracking-tight">
                  Trang Quản Trị Hệ Thống CodeMind 10
                </h1>
                <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <ShieldCheck size={12} />
                  Quản trị viên: {currentAdminLabel}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                <School size={13} className="text-indigo-400" />
                Trường THPT Lạng Giang số 1 — Quản lý tập trung 10 lớp học sinh & Ban Giảng Dạy
              </p>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={onOpenTeacherDashboard}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm hover:shadow cursor-pointer"
              title="Mở Bảng điều khiển sư phạm toàn trường"
            >
              <BarChart3 size={15} className="text-yellow-300" />
              <span>Bảng điều khiển sư phạm (10 lớp)</span>
            </button>

            <button
              onClick={onGoToLearning}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm hover:shadow cursor-pointer"
              title="Chuyển sang giao diện học tập Python"
            >
              <BookOpen size={15} />
              <span>Vào học Python</span>
            </button>

            <button
              onClick={loadAllData}
              title="Làm mới dữ liệu từ Cloud"
              className="p-2 hover:bg-white/15 rounded-xl transition-colors text-white/90 cursor-pointer"
            >
              <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
            </button>

            {onClose && (
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/15 rounded-xl transition-colors text-white/80 hover:text-white cursor-pointer"
                title="Đóng trang quản trị"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* NAVIGATION TABS                                         */}
        {/* ======================================================== */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 overflow-x-auto">
          <div className="flex gap-2 py-2">
            <button
              onClick={() => setActiveTab('students')}
              className={`py-2 px-4 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users size={16} />
              <span>Quản lý danh sách Học sinh</span>
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2 py-0.2 rounded-full">
                {students.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('teachers')}
              className={`py-2 px-4 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'teachers'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UserCheck size={16} />
              <span>Quản lý Giáo viên & Phân quyền Lớp</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.2 rounded-full">
                {teachers.length}
              </span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
            * Dữ liệu phân quyền được đồng bộ thời gian thực với Cloud Firestore
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: QUẢN LÝ HỌC SINH                                  */}
        {/* ======================================================== */}
        {activeTab === 'students' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
            
            {/* Thanh công cụ và thống kê */}
            <div className="p-4 bg-white border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
              
              {/* Bên trái: Nút Import CSV & Thêm thủ công */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsCsvModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm hover:shadow cursor-pointer"
                >
                  <Upload size={15} />
                  <span>Nhập danh sách bằng File CSV</span>
                </button>

                <button
                  onClick={downloadStudentSampleCSV}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-300 cursor-pointer"
                  title="Tải file mẫu CSV có định dạng chuẩn để nhập thông tin học sinh"
                >
                  <Download size={14} className="text-emerald-600" />
                  <span>Tải File mẫu CSV chuẩn</span>
                </button>

                <button
                  onClick={() => setIsAddStudentModalOpen(true)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-emerald-300 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Thêm học sinh thủ công</span>
                </button>
              </div>

              {/* Bên phải: Bộ lọc theo lớp và tìm kiếm */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5">
                  <Filter size={14} className="text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-600">Lớp:</span>
                  <select
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="all">Tất cả ({students.length} học sinh)</option>
                    {SCHOOL_CLASSES.map(cls => (
                      <option key={cls} value={cls}>Lớp {cls}</option>
                    ))}
                    {Array.from(new Set(students.map(s => s.className)))
                      .filter(cls => cls && !SCHOOL_CLASSES.includes(cls))
                      .map(cls => (
                        <option key={cls} value={cls}>Lớp {cls} (Cần chuyển lớp)</option>
                      ))}
                  </select>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo tên hoặc email..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

            </div>

            {/* Bảng danh sách học sinh */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="text-center py-20 text-slate-400 text-sm flex flex-col items-center gap-2">
                  <RefreshCw size={24} className="animate-spin text-indigo-600" />
                  <span>Đang tải danh sách học sinh từ Cloud Firestore...</span>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 max-w-lg mx-auto my-6 shadow-sm">
                  <FileSpreadsheet size={48} className="text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800 mb-1">
                    Chưa có học sinh nào trong bộ lọc này
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                    Hãy bấm nút "Nhập danh sách bằng File CSV" ở trên hoặc chọn file mẫu để thêm học sinh được phép vào học.
                  </p>
                  <button
                    onClick={() => setIsCsvModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Upload size={14} /> Nhập danh sách ngay
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px]">
                        <th className="p-3 w-14 text-center">STT</th>
                        <th className="p-3">Học sinh</th>
                        <th className="p-3">Email (Google Account)</th>
                        <th className="p-3">Lớp chính thức</th>
                        <th className="p-3">Tiến độ bài học (Chủ đề 5)</th>
                        <th className="p-3">Trạng thái</th>
                        <th className="p-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map((s, idx) => {
                        const completedCount = s.completedLessonsCount || (Array.isArray(s.completedLessons) ? s.completedLessons.length : 0);
                        const percent = Math.round((completedCount / 17) * 100);
                        const bugsCount = s.totalBugs || 0;

                        return (
                          <tr key={s.id || s.email} className="hover:bg-indigo-50/40 transition-colors">
                            <td className="p-3 text-center font-bold text-slate-500">
                              {s.stt || (idx + 1)}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                {s.photoURL ? (
                                  <img 
                                    src={s.photoURL} 
                                    alt={s.fullName} 
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" 
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                    {(s.fullName || s.displayName || 'H')[0].toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-slate-900 leading-tight">
                                    {s.fullName || s.displayName || 'Học sinh'}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    ID: {(s.id || '').slice(0, 14)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 font-mono text-slate-600 text-[11px]">
                              {s.email}
                            </td>
                            <td className="p-3">
                              <span className="bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-1 rounded-lg border border-indigo-200 inline-block">
                                Lớp {s.className || 'Chưa xếp lớp'}
                              </span>
                            </td>
                            <td className="p-3 min-w-[170px]">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-semibold text-slate-700">{completedCount}/17 bài</span>
                                  <span className="font-bold text-indigo-600">{percent}%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                                <div className="text-[10px] text-orange-600 font-medium">
                                  {bugsCount > 0 ? `Đã tự gỡ: ${bugsCount} lỗi (Bug)` : 'Chưa gặp lỗi'}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              {s.isActivated ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
                                  <CheckCircle2 size={11} /> Đã vào học
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-blue-200">
                                  Chờ đăng nhập
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingStudent(s);
                                    setNewClassForStudent(s.className || '10A1');
                                  }}
                                  className="p-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 rounded-lg transition-colors cursor-pointer"
                                  title="Điều chỉnh / Chuyển lớp cho học sinh"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(s)}
                                  className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                  title="Xóa học sinh khỏi hệ thống"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer thống kê số lượng */}
            <div className="p-3 bg-white border-t border-slate-200 px-6 flex justify-between items-center text-xs text-slate-500 shrink-0">
              <div>
                Hiển thị <strong>{filteredStudents.length}</strong> / <strong>{students.length}</strong> học sinh trong toàn khối 10.
              </div>
              <div className="italic text-[11px]">
                * Học sinh chỉ có thể vào học khi email Gmail đã được lưu tại danh sách này.
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: QUẢN LÝ GIÁO VIÊN & PHÂN QUYỀN LỚP                 */}
        {/* ======================================================== */}
        {activeTab === 'teachers' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
            
            {/* Header tab giáo viên */}
            <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
              <div>
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                  <ShieldCheck size={18} className="text-indigo-600" />
                  Danh Sách Giáo Viên & Phân Quyền Giám Sát Sư Phạm
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chỉ giáo viên được giao quyền quản lý lớp nào thì mới xem được thông tin và nhật ký học sinh lớp đó.
                </p>
              </div>

              <button
                onClick={() => setIsAddTeacherModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm hover:shadow cursor-pointer"
              >
                <UserPlus size={15} />
                <span>Thêm Giáo Viên Mới</span>
              </button>
            </div>

            {/* Bảng danh sách giáo viên */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px]">
                      <th className="p-3">Giáo viên</th>
                      <th className="p-3">Email đăng nhập Google</th>
                      <th className="p-3">Lớp được giao quản lý</th>
                      <th className="p-3">Vai trò hệ thống</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teachers.map((t) => {
                      const isSuper = isSuperAdmin(t.email);
                      const assignedText = (t.assignedClasses || []).includes('all') 
                        ? 'Toàn bộ 10 lớp khối 10' 
                        : (t.assignedClasses || []).join(', ') || 'Chưa phân lớp';

                      return (
                        <tr key={t.email} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                              {(t.name || 'G')[0]}
                            </div>
                            <div>
                              <div>{t.name || 'Giáo viên Tin học'}</div>
                              <div className="text-[10px] text-slate-400">{t.school || 'THPT Lạng Giang số 1'}</div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-slate-600 text-[11px]">
                            {t.email}
                          </td>
                          <td className="p-3">
                            <span className={`font-bold px-2.5 py-1 rounded-lg border text-xs ${
                              (t.assignedClasses || []).includes('all')
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {assignedText}
                            </span>
                          </td>
                          <td className="p-3">
                            {isSuper ? (
                              <span className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-extrabold px-2.5 py-0.5 rounded-full text-[10px] shadow-xs">
                                Quản trị tối cao (Admin)
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-slate-200">
                                Giáo viên bộ môn
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {isSuper ? (
                              <span className="text-[11px] text-slate-400 italic font-medium">
                                Tài khoản gốc
                              </span>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingTeacher(t);
                                    const currentAssigned = Array.isArray(t.assignedClasses) && t.assignedClasses.length > 0
                                      ? t.assignedClasses
                                      : ['all'];
                                    if (currentAssigned.includes('all')) {
                                      setNewClassesForTeacher(['all']);
                                    } else {
                                      setNewClassesForTeacher([...currentAssigned]);
                                    }
                                  }}
                                  className="p-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 rounded-lg transition-colors cursor-pointer"
                                  title="Điều chỉnh lớp phụ trách cho giáo viên"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTeacher(t)}
                                  className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                  title="Gỡ quyền giáo viên khỏi hệ thống"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 bg-white border-t border-slate-200 px-6 text-xs text-slate-500 shrink-0">
              * Quản trị viên Trần Thị Ngà có toàn quyền thêm, gán lớp và phân bổ quyền sư phạm cho các giáo viên.
            </div>

          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: NHẬP DANH SÁCH BẰNG FILE CSV                    */}
      {/* ======================================================== */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-2xl w-full border border-slate-100 animate-scale-up max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Upload size={20} className="text-indigo-600" />
                <h3 className="font-black text-slate-900 text-base">
                  Nhập danh sách Học sinh bằng File CSV
                </h3>
              </div>
              <button 
                onClick={() => setIsCsvModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              
              {/* Card Hướng dẫn */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3.5 leading-relaxed text-indigo-950">
                <div className="font-bold mb-1 flex items-center justify-between">
                  <span>Quy cách cấu trúc các cột trong File CSV:</span>
                  <button
                    onClick={downloadStudentSampleCSV}
                    className="text-indigo-600 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Download size={13} /> Tải file mẫu CSV
                  </button>
                </div>
                <div className="text-[11px] text-indigo-800 space-y-1">
                  <div>• Cột 1: <strong>Thứ tự</strong> (1, 2, 3,...)</div>
                  <div>• Cột 2: <strong>Họ và tên</strong> (Họ và tên đầy đủ của học sinh)</div>
                  <div>• Cột 3: <strong>Email</strong> (Địa chỉ Gmail học sinh dùng để đăng nhập)</div>
                  <div>• Cột 4: <strong>Lớp</strong> (Chọn 1 trong 10 lớp: 10A1, 10A4, 10A5, 10A6, 10A7, 10A8, 10D1, 10D2, 10D3, 10D4)</div>
                </div>
              </div>

              {/* Khu vực Chọn / Kéo thả File */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
                <input 
                  type="file" 
                  accept=".csv" 
                  id="csvFileInput" 
                  onChange={handleFileChange}
                  className="hidden" 
                />
                <label htmlFor="csvFileInput" className="cursor-pointer block">
                  <FileSpreadsheet size={36} className="text-indigo-500 mx-auto mb-2" />
                  <div className="font-bold text-slate-800 text-sm">
                    {csvFile ? csvFile.name : 'Nhấp để chọn File CSV từ máy tính'}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Hỗ trợ file .CSV chuẩn UTF-8 có dấu tiếng Việt
                  </p>
                </label>
              </div>

              {/* Thông báo lỗi nếu có */}
              {csvErrors.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-rose-800">
                  <div className="font-bold mb-1 flex items-center gap-1">
                    <AlertCircle size={14} /> Có {csvErrors.length} điểm cần lưu ý trong file:
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] max-h-32 overflow-y-auto">
                    {csvErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bảng xem trước dữ liệu hợp lệ */}
              {csvPreview && csvPreview.length > 0 && (
                <div>
                  <div className="font-bold text-slate-800 mb-2 flex items-center justify-between">
                    <span>Xem trước dữ liệu hợp lệ ({csvPreview.length} học sinh):</span>
                    <span className="text-emerald-600 font-extrabold text-[11px]">Sẵn sàng đồng bộ</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 sticky top-0 text-slate-600 font-bold">
                        <tr>
                          <th className="p-2">STT</th>
                          <th className="p-2">Họ tên</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Lớp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {csvPreview.slice(0, 15).map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 text-slate-500">{p.stt}</td>
                            <td className="p-2 font-bold text-slate-800">{p.fullName}</td>
                            <td className="p-2 font-mono text-slate-600">{p.email}</td>
                            <td className="p-2 font-bold text-indigo-700">{p.className}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvPreview.length > 15 && (
                    <div className="text-[10px] text-slate-400 text-center mt-1">
                      ... và {csvPreview.length - 15} học sinh khác
                    </div>
                  )}
                </div>
              )}

              {importStatus && (
                <div className={`p-3 rounded-xl text-center font-bold text-xs ${
                  importStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {importStatus.message}
                </div>
              )}

            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(false)}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!csvPreview || csvPreview.length === 0 || isImporting}
                onClick={handleConfirmImportCSV}
                className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {isImporting ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                <span>Lưu danh sách vào hệ thống ({csvPreview?.length || 0})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: THÊM HỌC SINH THỦ CÔNG                          */}
      {/* ======================================================== */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full border border-slate-100 animate-scale-up">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-emerald-600" />
                <h3 className="font-black text-slate-900 text-sm">
                  Thêm Học Sinh Mới Vào Lớp
                </h3>
              </div>
              <button 
                onClick={() => setIsAddStudentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên học sinh:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Gmail học sinh dùng để đăng nhập:
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ví dụ: an.10a1@gmail.com"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lớp chính thức:
                  </label>
                  <select
                    value={newStudent.className}
                    onChange={(e) => setNewStudent({ ...newStudent, className: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  >
                    {SCHOOL_CLASSES.map(cls => (
                      <option key={cls} value={cls}>Lớp {cls}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số thứ tự (STT):
                  </label>
                  <input
                    type="number"
                    placeholder="1, 2,..."
                    value={newStudent.stt}
                    onChange={(e) => setNewStudent({ ...newStudent, stt: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  />
                </div>
              </div>

              {addStudentError && (
                <div className="text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {addStudentError}
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  Lưu học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ĐIỀU CHỈNH / CHUYỂN LỚP CHO HỌC SINH             */}
      {/* ======================================================== */}
      {editingStudent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full border border-slate-100 animate-scale-up text-xs">
            <h3 className="font-black text-slate-900 text-sm mb-1">
              Chuyển Lớp Cho Học Sinh
            </h3>
            <p className="text-slate-500 mb-3">
              Học sinh: <strong className="text-slate-900">{editingStudent.fullName || editingStudent.email}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chọn lớp mới chuyển sang:
                </label>
                <select
                  value={newClassForStudent}
                  onChange={(e) => setNewClassForStudent(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {SCHOOL_CLASSES.map(cls => (
                    <option key={cls} value={cls}>Lớp {cls}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveStudentClassChange}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  Xác nhận chuyển
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: THÊM GIÁO VIÊN MỚI                              */}
      {/* ======================================================== */}
      {isAddTeacherModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full border border-slate-100 animate-scale-up text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-indigo-600" />
                <h3 className="font-black text-slate-900 text-sm">
                  Thêm Giáo Viên & Giao Quyền Quản Lý Lớp
                </h3>
              </div>
              <button 
                onClick={() => setIsAddTeacherModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTeacherSubmit} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên giáo viên:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thầy Trần Văn Bình"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Google của Giáo viên:
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ví dụ: giaovien.langgiang1@gmail.com"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-700 text-xs">
                    Giao quyền quản lý lớp:
                  </label>
                  <div className="flex gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setNewTeacher(prev => ({ ...prev, assignedClasses: ['all'] }))}
                      className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline cursor-pointer"
                    >
                      Chọn 10 lớp
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setNewTeacher(prev => ({ ...prev, assignedClasses: [] }))}
                      className="text-slate-500 hover:text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>

                {/* Nút nhanh: Toàn bộ 10 lớp */}
                <button
                  type="button"
                  onClick={() => toggleNewTeacherClass('all')}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer mb-2 ${
                    isNewTeacherAllSelected
                      ? 'bg-indigo-50/80 border-indigo-400 text-indigo-950 font-black ring-1 ring-indigo-400'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      isNewTeacherAllSelected 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isNewTeacherAllSelected && <Check size={12} className="stroke-[3]" />}
                    </div>
                    <span className="text-xs">Quản lý Toàn bộ 10 lớp khối 10</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isNewTeacherAllSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    10 Lớp
                  </span>
                </button>

                {/* Grid 10 lớp */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 bg-slate-50 rounded-2xl border border-slate-200">
                  {SCHOOL_CLASSES.map(cls => {
                    const selected = isNewTeacherClassSelected(cls);
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => toggleNewTeacherClass(cls)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between gap-1 transition-all cursor-pointer ${
                          selected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{cls}</span>
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ${
                          selected ? 'bg-white/20 text-white' : 'border border-slate-300 bg-slate-50'
                        }`}>
                          {selected && <Check size={10} className="stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className={newTeacherSelectedList.length > 0 ? 'text-emerald-600 shrink-0' : 'text-slate-400 shrink-0'} />
                  <span>
                    Đang chọn: {isNewTeacherAllSelected ? (
                      <strong className="text-indigo-600 font-bold">Toàn bộ 10 lớp</strong>
                    ) : newTeacherSelectedList.length > 0 ? (
                      <strong className="text-indigo-600 font-bold">{newTeacherSelectedList.join(', ')} ({newTeacherSelectedList.length} lớp)</strong>
                    ) : (
                      <span className="text-rose-500 font-bold italic">Chưa chọn lớp nào</span>
                    )}
                  </span>
                </div>
              </div>

              {teacherActionError && (
                <div className="text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {teacherActionError}
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  Lưu giáo viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: ĐIỀU CHỈNH LỚP QUẢN LÝ CHO GIÁO VIÊN            */}
      {/* ======================================================== */}
      {editingTeacher && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full border border-slate-100 animate-scale-up text-xs">
            {/* Header */}
            <div className="flex items-start justify-between mb-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Layers className="text-indigo-600" size={18} />
                  Phân Công Lớp Quản Lý
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Giáo viên: <strong className="text-indigo-950 font-bold text-sm">{editingTeacher.name || editingTeacher.email}</strong>
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {editingTeacher.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Nút nhanh: Toàn bộ 10 lớp */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5">
                  Chế độ phân công:
                </label>
                <button
                  type="button"
                  onClick={() => toggleTeacherClass('all')}
                  className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isAllSelected
                      ? 'bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border-indigo-400 text-indigo-950 font-black shadow-sm ring-2 ring-indigo-400/40'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                      isAllSelected 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isAllSelected && <Check size={14} className="stroke-[3]" />}
                    </div>
                    <div>
                      <span className="text-xs">Quản lý Toàn bộ 10 lớp khối 10</span>
                      <p className="text-[10px] text-slate-500 font-normal">
                        Theo dõi toàn diện tất cả các lớp từ 10A1 đến 10D4
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isAllSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    10 Lớp
                  </span>
                </button>
              </div>

              {/* Phân công nhiều lớp cụ thể */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                    <span>Hoặc chọn nhiều lớp phụ trách:</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      ({selectedClassCount} / {SCHOOL_CLASSES.length} lớp)
                    </span>
                  </label>
                  <div className="flex gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={handleSelectAllClasses}
                      className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline cursor-pointer"
                    >
                      Chọn tất cả
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllClasses}
                      className="text-slate-500 hover:text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>

                {/* Grid 10 lớp */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {SCHOOL_CLASSES.map(cls => {
                    const selected = isClassSelected(cls);
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => toggleTeacherClass(cls)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-1 transition-all cursor-pointer ${
                          selected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200 scale-[1.02]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span>{cls}</span>
                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                          selected ? 'bg-white/20 text-white' : 'border border-slate-300 bg-slate-50'
                        }`}>
                          {selected && <Check size={12} className="stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tóm tắt danh sách lớp được giao */}
              <div className="p-3 rounded-2xl bg-slate-100/80 border border-slate-200 text-slate-700 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <CheckCircle2 size={14} className={selectedClassCount > 0 ? 'text-emerald-600' : 'text-slate-400'} />
                  <span>Kết quả phân công sẽ lưu:</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  {isAllSelected ? (
                    <strong className="text-indigo-600 font-bold">Toàn bộ 10 lớp khối 10 (10A1, 10A4, 10A5, 10A6, 10A7, 10A8, 10D1, 10D2, 10D3, 10D4)</strong>
                  ) : selectedClassCount > 0 ? (
                    <span>Phụ trách <strong className="text-indigo-600 font-bold">{selectedClassCount} lớp</strong>: <strong className="text-slate-800 font-bold">{selectedClassesList.join(', ')}</strong></span>
                  ) : (
                    <span className="text-rose-500 font-bold italic">Chưa chọn lớp nào. Vui lòng chọn ít nhất 1 lớp!</span>
                  )}
                </p>
              </div>

              {/* Nút hành động */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={selectedClassCount === 0}
                  onClick={handleSaveTeacherClassChange}
                  className={`flex-1 py-2.5 text-white rounded-xl font-bold text-xs cursor-pointer transition-all shadow-md flex items-center justify-center gap-1.5 ${
                    selectedClassCount === 0
                      ? 'bg-slate-300 cursor-not-allowed shadow-none'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200 hover:shadow-lg'
                  }`}
                >
                  <Check size={14} />
                  Xác nhận lưu ({isAllSelected ? 'Toàn bộ 10 lớp' : `${selectedClassCount} lớp`})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
