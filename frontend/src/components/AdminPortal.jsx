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
    : (currentUser?.email === 'tranthingalg1@gmail.com' ? 'Cô Trần Thị Ngà' : (currentUser?.displayName || 'Ban Quản Trị'));

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
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', assignedClass: '10A1' });
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [newClassForTeacher, setNewClassForTeacher] = useState('10A1');
  const [teacherActionError, setTeacherActionError] = useState('');

  // Tải dữ liệu ban đầu
  const loadAllData = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
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
    const confirmMsg = `Bạn có chắc chắn muốn xóa học sinh "${student.fullName || student.email}" (${student.className || 'Chưa xếp lớp'}) khỏi hệ thống?\n\nHọc sinh này sẽ không thể đăng nhập vào phòng học được nữa.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteStudentFromSystem(student.email);
      await loadAllData();
      alert('Đã xóa học sinh khỏi hệ thống!');
    } catch (err) {
      alert(`Lỗi xóa học sinh: ${err.message}`);
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

    try {
      await saveTeacherAccount({
        email: newTeacher.email,
        name: newTeacher.name || 'Giáo viên Tin học',
        assignedClasses: newTeacher.assignedClass === 'all' ? ['all'] : [newTeacher.assignedClass],
        role: 'teacher'
      }, SUPER_ADMIN_EMAIL);

      await loadAllData();
      setIsAddTeacherModalOpen(false);
      setNewTeacher({ name: '', email: '', assignedClass: '10A1' });
      alert('Đã thêm giáo viên và phân quyền lớp thành công!');
    } catch (err) {
      setTeacherActionError(err.message);
    }
  };

  // Cập nhật lớp cho giáo viên
  const handleSaveTeacherClassChange = async () => {
    if (!editingTeacher) return;
    try {
      const assigned = newClassForTeacher === 'all' ? ['all'] : [newClassForTeacher];
      await updateTeacherAssignedClasses(editingTeacher.email, assigned);
      await loadAllData();
      setEditingTeacher(null);
      alert(`Đã cập nhật quyền quản lý lớp cho giáo viên ${editingTeacher.name || editingTeacher.email}!`);
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
                    <option value="all">Tất cả (10 lớp)</option>
                    {SCHOOL_CLASSES.map(cls => (
                      <option key={cls} value={cls}>Lớp {cls}</option>
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
                        <th className="p-3 w-16 text-center">STT</th>
                        <th className="p-3">Họ và tên</th>
                        <th className="p-3">Email (Tài khoản Google)</th>
                        <th className="p-3">Lớp chính thức</th>
                        <th className="p-3">Trạng thái quyền</th>
                        <th className="p-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map((s, idx) => (
                        <tr key={s.id || s.email} className="hover:bg-indigo-50/40 transition-colors">
                          <td className="p-3 text-center font-bold text-slate-500">
                            {s.stt || (idx + 1)}
                          </td>
                          <td className="p-3 font-bold text-slate-900">
                            {s.fullName || s.displayName || 'Học sinh'}
                          </td>
                          <td className="p-3 font-mono text-slate-600 text-[11px]">
                            {s.email}
                          </td>
                          <td className="p-3">
                            <span className="bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-1 rounded-lg border border-indigo-200">
                              Lớp {s.className || 'Chưa xếp lớp'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
                              <CheckCircle2 size={11} /> Được phép học
                            </span>
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
                      ))}
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
                                    setNewClassForTeacher((t.assignedClasses || [])[0] || '10A1');
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
                <label className="block font-bold text-slate-700 mb-1">
                  Giao quyền quản lý lớp:
                </label>
                <select
                  value={newTeacher.assignedClass}
                  onChange={(e) => setNewTeacher({ ...newTeacher, assignedClass: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Quản lý Toàn bộ 10 lớp</option>
                  {SCHOOL_CLASSES.map(cls => (
                    <option key={cls} value={cls}>Quản lý riêng Lớp {cls}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  * Giáo viên chỉ được xem danh sách và nhật ký học sinh của lớp được giao.
                </p>
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
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full border border-slate-100 animate-scale-up text-xs">
            <h3 className="font-black text-slate-900 text-sm mb-1">
              Phân Công Lại Lớp Quản Lý
            </h3>
            <p className="text-slate-500 mb-3">
              Giáo viên: <strong className="text-slate-900">{editingTeacher.name || editingTeacher.email}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chọn lớp giao phụ trách:
                </label>
                <select
                  value={newClassForTeacher}
                  onChange={(e) => setNewClassForTeacher(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Quản lý Toàn bộ 10 lớp</option>
                  {SCHOOL_CLASSES.map(cls => (
                    <option key={cls} value={cls}>Quản lý riêng Lớp {cls}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveTeacherClassChange}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  Xác nhận lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
