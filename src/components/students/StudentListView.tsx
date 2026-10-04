import React, { useState, useMemo } from 'react';
import { useEmulation } from '../../context/EmulationContext';
import {
  Users,
  Search,
  UserPlus,
  FileSpreadsheet,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Zap,
  X,
  Check,
} from 'lucide-react';
import { Student } from '../../types';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentAvatar } from '../common/StudentAvatar';

export const StudentListView: React.FC = () => {
  const {
    students,
    config,
    addStudent,
    updateStudent,
    deleteStudent,
    importStudents,
    selectedStudentForDetail,
    setSelectedStudentForDetail,
    setIsQuickScoringOpen,
    setQuickScoringPreselectedMaHS,
    addToast,
  } = useEmulation();

  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState<number | 'all'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    maHS: '',
    hoTen: '',
    to: 1,
    chucVu: 'Học sinh',
    gioiTinh: 'nam' as 'nam' | 'nu',
    tongDiem: 100,
  });

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchTeam = teamFilter === 'all' || s.to === teamFilter;
      const matchQuery =
        s.hoTen.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.maHS.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTeam && matchQuery;
    });
  }, [students, teamFilter, searchQuery]);

  const handleOpenAdd = () => {
    const nextIndex = students.length + 1;
    const autoMaHS = `3/3-${nextIndex < 10 ? '0' + nextIndex : nextIndex}`;
    setFormData({
      maHS: autoMaHS,
      hoTen: '',
      to: 1,
      chucVu: 'Học sinh',
      gioiTinh: 'nam',
      tongDiem: 100,
    });
    setEditingStudent(null);
    setIsAddStudentOpen(true);
  };

  const handleOpenEdit = (stu: Student) => {
    setEditingStudent(stu);
    setFormData({
      maHS: stu.maHS,
      hoTen: stu.hoTen,
      to: stu.to,
      chucVu: stu.chucVu,
      gioiTinh: stu.gioiTinh,
      tongDiem: stu.tongDiem,
    });
    setIsAddStudentOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hoTen.trim() || !formData.maHS.trim()) return;

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        hoTen: formData.hoTen.trim(),
        to: Number(formData.to),
        chucVu: formData.chucVu,
        gioiTinh: formData.gioiTinh,
        tongDiem: Number(formData.tongDiem),
      });
    } else {
      addStudent({
        maHS: formData.maHS.trim(),
        hoTen: formData.hoTen.trim(),
        to: Number(formData.to),
        chucVu: formData.chucVu,
        gioiTinh: formData.gioiTinh,
        tongDiem: Number(formData.tongDiem),
      });
    }

    setIsAddStudentOpen(false);
  };

  // Export to CSV UTF-8
  const handleExportCSV = () => {
    const header = ['Mã HS', 'Họ Và Tên', 'Tổ', 'Chức Vụ', 'Giới Tính', 'Tổng Điểm Thi Đua'];
    const rows = students.map((s) => [
      s.maHS,
      `"${s.hoTen}"`,
      s.to,
      `"${s.chucVu}"`,
      s.gioiTinh === 'nu' ? 'Nữ' : 'Nam',
      s.tongDiem,
    ]);

    const csvContent = '\uFEFF' + [header.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DANH_SACH_THI_DUA_3_3_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Xuất file thành công', 'Đã tải danh sách học sinh file CSV định dạng tiếng Việt UTF-8');
  };

  // Import CSV text parse
  const handleProcessImport = () => {
    if (!importCsvText.trim()) return;
    try {
      const lines = importCsvText.trim().split('\n');
      const imported: Student[] = [];

      lines.forEach((line, index) => {
        // Skip header if line contains 'Mã' or 'MaHS'
        if (index === 0 && (line.includes('Mã') || line.includes('MaHS') || line.includes('HoTen'))) {
          return;
        }
        const parts = line.split(/[,;\t]/).map((p) => p.replace(/^["']|["']$/g, '').trim());
        if (parts.length >= 2 && parts[0] && parts[1]) {
          imported.push({
            maHS: parts[0],
            hoTen: parts[1],
            to: Number(parts[2]) || 1,
            chucVu: parts[3] || 'Học sinh',
            gioiTinh: parts[4] === 'Nữ' || parts[4] === 'nu' ? 'nu' : 'nam',
            tongDiem: Number(parts[5]) || 100,
          });
        }
      });

      if (imported.length > 0) {
        importStudents(imported);
        setIsImportModalOpen(false);
        setImportCsvText('');
      } else {
        addToast('error', 'Lỗi định dạng', 'Không đọc được dữ liệu hợp lệ. Vui lòng kiểm tra định dạng CSV!');
      }
    } catch (e: unknown) {
      addToast('error', 'Lỗi Import', 'Có lỗi khi phân tích dữ liệu: ' + ((e as Error)?.message || ''));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              DANH SÁCH HỌC SINH {config.tenLop.toUpperCase()} ({students.length})
            </h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Quản lý hồ sơ thi đua, thông tin ban cán sự lớp và tổ viên
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất Excel/CSV</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Nhập Excel</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-200 transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Thêm Học Sinh</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học sinh hoặc mã HS..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Team filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setTeamFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              teamFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({students.length})
          </button>
          {[1, 2, 3, 4].map((t) => {
            const count = students.filter((s) => s.to === t).length;
            return (
              <button
                key={t}
                onClick={() => setTeamFilter(t)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  teamFilter === t
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tổ {t} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* STUDENT TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-700 font-bold uppercase text-[11px]">
                <th className="py-3 px-4">Mã HS</th>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-4">Tổ</th>
                <th className="py-3 px-4">Chức vụ</th>
                <th className="py-3 px-4 text-center">Điểm Thi Đua</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((stu) => (
                <tr key={stu.maHS} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-600 text-xs">
                    {stu.maHS}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <StudentAvatar student={stu} size="xs" allowEdit={true} />
                      <span className="font-bold text-slate-900">{stu.hoTen}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs">
                      Tổ {stu.to}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                        stu.chucVu === 'Lớp trưởng'
                          ? 'bg-red-100 text-red-800'
                          : stu.chucVu.includes('Cờ đỏ')
                          ? 'bg-amber-100 text-amber-800'
                          : stu.chucVu.includes('Tổ trưởng')
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-slate-700'
                      }`}
                    >
                      {stu.chucVu}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-black text-sm px-2.5 py-1 rounded-lg ${
                        stu.tongDiem >= 110
                          ? 'bg-emerald-100 text-emerald-800'
                          : stu.tongDiem >= 100
                          ? 'bg-blue-100 text-blue-800'
                          : stu.tongDiem >= 90
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {stu.tongDiem} đ
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedStudentForDetail(stu)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem hồ sơ cá nhân"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setQuickScoringPreselectedMaHS(stu.maHS);
                          setIsQuickScoringOpen(true);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Chấm điểm nhanh"
                      >
                        <Zap className="w-4 h-4 fill-red-600" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(stu)}
                        className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Sửa thông tin"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xoá học sinh ${stu.hoTen} khỏi lớp?`)) {
                            deleteStudent(stu.maHS);
                          }
                        }}
                        className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xoá học sinh"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <StudentDetailModal
        student={selectedStudentForDetail}
        onClose={() => setSelectedStudentForDetail(null)}
      />

      {/* ADD / EDIT STUDENT MODAL */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-red-600 to-rose-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg">
                {editingStudent ? 'SỬA HỌC SINH' : 'THÊM HỌC SINH MỚI'}
              </h3>
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="p-1 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mã Học Sinh:</label>
                  <input
                    type="text"
                    required
                    value={formData.maHS}
                    disabled={!!editingStudent}
                    onChange={(e) => setFormData({ ...formData, maHS: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 disabled:bg-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Giới tính:</label>
                  <select
                    value={formData.gioiTinh}
                    onChange={(e) =>
                      setFormData({ ...formData, gioiTinh: e.target.value as 'nam' | 'nu' })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="nam">Nam</option>
                    <option value="nu">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Họ và Tên:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn An"
                  value={formData.hoTen}
                  onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tổ:</label>
                  <select
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value={1}>Tổ 1</option>
                    <option value={2}>Tổ 2</option>
                    <option value={3}>Tổ 3</option>
                    <option value={4}>Tổ 4</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Chức vụ:</label>
                  <select
                    value={formData.chucVu}
                    onChange={(e) => setFormData({ ...formData, chucVu: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="Học sinh">Học sinh</option>
                    <option value="Lớp trưởng">Lớp trưởng</option>
                    <option value="Tổ trưởng">Tổ trưởng</option>
                    <option value="Cờ đỏ">Cờ đỏ</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Điểm thi đua khởi đầu:</label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={formData.tongDiem}
                  onChange={(e) => setFormData({ ...formData, tongDiem: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-200 transition-colors"
                >
                  {editingStudent ? 'Lưu Thông Tin' : 'Thêm Vào Lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT CSV MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 bg-gradient-to-r from-red-600 to-rose-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">NHẬP DANH SÁCH TỪ FILE EXCEL / CSV</h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                <strong>Định dạng yêu cầu mỗi dòng:</strong>
                <code className="block mt-1 p-2 bg-white rounded-md border font-mono text-[11px] text-slate-800">
                  MaHS, HoTen, To, ChucVu, GioiTinh, TongDiem
                </code>
                <span className="block mt-1 text-[11px] text-slate-500">
                  Ví dụ: 6B1-01, Nguyễn Văn An, 1, Học sinh, nam, 100
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Dán dữ liệu CSV vào đây:</label>
                <textarea
                  rows={6}
                  value={importCsvText}
                  onChange={(e) => setImportCsvText(e.target.value)}
                  placeholder="6B1-01, Nguyễn Văn An, 1, Học sinh, nam, 100&#10;6B1-02, Trần Thị Bích, 1, Tổ trưởng, nu, 100..."
                  className="w-full p-3 border border-slate-300 rounded-xl font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const sample =
                      'MaHS,HoTen,To,ChucVu,GioiTinh,TongDiem\n6B1-01,Nguyễn Văn An,1,Lớp trưởng,nam,105\n6B1-02,Trần Thị Bích,2,Tổ trưởng,nu,108\n6B1-03,Lê Hoàng Nam,3,Học sinh,nam,100';
                    setImportCsvText(sample);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Điền dữ liệu mẫu
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessImport}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-200"
                  >
                    Nạp Dữ Liệu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
