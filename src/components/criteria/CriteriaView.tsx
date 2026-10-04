import React, { useState } from 'react';
import { useEmulation } from '../../context/EmulationContext';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Search,
  Sparkles,
  X,
  Save,
} from 'lucide-react';
import { Criteria, CriteriaType } from '../../types';

export const CriteriaView: React.FC = () => {
  const { criteria, addCriteria, updateCriteria, deleteCriteria, currentUser } = useEmulation();

  const [activeTab, setActiveTab] = useState<CriteriaType>('minus');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<Criteria | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    tenTieuChi: string;
    loai: CriteriaType;
    diem: number;
    nhom: Criteria['nhom'];
    bieuTuong: string;
  }>({
    tenTieuChi: '',
    loai: 'minus',
    diem: 5,
    nhom: 'Nề nếp',
    bieuTuong: '⚠️',
  });

  const isTeacher = currentUser?.role === 'teacher';

  const filteredCriteria = criteria.filter((c) => {
    const matchTab = c.loai === activeTab;
    const matchSearch =
      c.tenTieuChi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nhom.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleOpenAdd = (type?: CriteriaType) => {
    setFormData({
      tenTieuChi: '',
      loai: type || activeTab,
      diem: 5,
      nhom: 'Nề nếp',
      bieuTuong: (type || activeTab) === 'plus' ? '⭐' : '⚠️',
    });
    setEditingCriteria(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (crit: Criteria) => {
    setEditingCriteria(crit);
    setFormData({
      tenTieuChi: crit.tenTieuChi,
      loai: crit.loai,
      diem: crit.diem,
      nhom: crit.nhom,
      bieuTuong: crit.bieuTuong || '⭐',
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenTieuChi.trim()) return;

    if (editingCriteria) {
      updateCriteria({
        ...editingCriteria,
        tenTieuChi: formData.tenTieuChi.trim(),
        loai: formData.loai,
        diem: Number(formData.diem),
        nhom: formData.nhom,
        bieuTuong: formData.bieuTuong,
      });
    } else {
      addCriteria({
        tenTieuChi: formData.tenTieuChi.trim(),
        loai: formData.loai,
        diem: Number(formData.diem),
        nhom: formData.nhom,
        bieuTuong: formData.bieuTuong,
      });
    }

    setIsAddModalOpen(false);
  };

  // Quick preset helper for test scenario
  const handleQuickAddUniformTest = () => {
    setFormData({
      tenTieuChi: 'Mặc sai đồng phục / Không đúng quy định',
      loai: 'minus',
      diem: 5,
      nhom: 'Nề nếp',
      bieuTuong: '👔',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              QUẢN LÝ TIÊU CHÍ THI ĐUA
            </h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Quy định các khung điểm thưởng (việc tốt) và phạt (vi phạm) theo chuẩn nề nếp nhà trường
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd()}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-red-200 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Tiêu Chí Mới</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Two Main Tabs: ĐIỂM CỘNG / ĐIỂM TRỪ */}
        <div className="grid grid-cols-2 p-1 bg-slate-200/70 rounded-xl max-w-md w-full">
          <button
            onClick={() => setActiveTab('plus')}
            className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'plus'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>🟢 ĐIỂM CỘNG (VIỆC TỐT)</span>
          </button>

          <button
            onClick={() => setActiveTab('minus')}
            className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'minus'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>🔴 ĐIỂM TRỪ (VI PHẠM)</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tiêu chí..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 bg-white"
          />
        </div>
      </div>

      {/* Criteria List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredCriteria.map((c) => {
          const isPlus = c.loai === 'plus';

          return (
            <div
              key={c.maTieuChi}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 bg-white ${
                isPlus
                  ? 'border-emerald-200 hover:border-emerald-300 hover:shadow-xs'
                  : 'border-red-200 hover:border-red-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-2xl select-none shrink-0 p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                  {c.bieuTuong || (isPlus ? '⭐' : '⚠️')}
                </span>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-900 leading-snug">
                    {c.tenTieuChi}
                  </div>
                  <div className="text-xs text-slate-700 mt-1 flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-[11px]">
                      {c.nhom}
                    </span>
                    <span>Mã: {c.maTieuChi}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={`text-sm font-black px-2.5 py-1 rounded-xl ${
                    isPlus ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isPlus ? '+' : '-'}
                  {c.diem} điểm
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xoá tiêu chí "${c.tenTieuChi}"?`)) {
                        deleteCriteria(c.maTieuChi);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xoá tiêu chí"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCriteria.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-slate-700 bg-white rounded-2xl border border-slate-200">
            Không tìm thấy tiêu chí nào phù hợp. Bấm "Thêm Tiêu Chí Mới" để tạo!
          </div>
        )}
      </div>

      {/* MODAL THÊM / SỬA TIÊU CHÍ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-red-600 to-rose-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg">
                {editingCriteria ? 'CHỈNH SỬA TIÊU CHÍ' : 'THÊM TIÊU CHÍ THI ĐUA MỚI'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Quick suggestion helper banner for TEST 3 ("Mặc sai đồng phục", -5 điểm) */}
              {!editingCriteria && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-2">
                  <div className="text-xs text-red-900">
                    <strong>Gợi ý Test 3:</strong> "Mặc sai đồng phục" (-5đ)
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickAddUniformTest}
                    className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                  >
                    Điền nhanh
                  </button>
                </div>
              )}

              {/* Tên tiêu chí */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tên tiêu chí / Hành vi:</label>
                <input
                  type="text"
                  required
                  value={formData.tenTieuChi}
                  onChange={(e) => setFormData({ ...formData, tenTieuChi: e.target.value })}
                  placeholder="VD: Mặc sai đồng phục, Không thuộc bài, Nhặt được của rơi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Loại & Điểm */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Loại hành vi:</label>
                  <select
                    value={formData.loai}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        loai: e.target.value as CriteriaType,
                        bieuTuong: e.target.value === 'plus' ? '⭐' : '⚠️',
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="plus">🟢 Việc tốt (+ Điểm)</option>
                    <option value="minus">🔴 Vi phạm (- Điểm)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mức điểm:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.diem}
                    onChange={(e) => setFormData({ ...formData, diem: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Nhóm & Biểu tượng */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nhóm tiêu chí:</label>
                  <select
                    value={formData.nhom}
                    onChange={(e) =>
                      setFormData({ ...formData, nhom: e.target.value as Criteria['nhom'] })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="Học tập">Học tập</option>
                    <option value="Nề nếp">Nề nếp</option>
                    <option value="Kỷ luật">Kỷ luật</option>
                    <option value="Vệ sinh">Vệ sinh</option>
                    <option value="Hoạt động phong trào">Hoạt động phong trào</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Biểu tượng (Icon):</label>
                  <input
                    type="text"
                    value={formData.bieuTuong}
                    onChange={(e) => setFormData({ ...formData, bieuTuong: e.target.value })}
                    placeholder="VD: ⭐, ⏰, 👔, 🧹..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-200 transition-colors"
                >
                  {editingCriteria ? 'Lưu Thay Đổi' : 'Tạo Tiêu Chí'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
