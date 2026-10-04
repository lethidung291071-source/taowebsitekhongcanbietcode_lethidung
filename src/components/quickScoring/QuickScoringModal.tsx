import React, { useState, useMemo, useEffect } from 'react';
import { useEmulation } from '../../context/EmulationContext';
import {
  X,
  Search,
  CheckCircle,
  AlertCircle,
  Zap,
  Sparkles,
  ChevronRight,
  User,
  Filter,
} from 'lucide-react';
import { CriteriaType } from '../../types';
import { StudentAvatar } from '../common/StudentAvatar';

export const QuickScoringModal: React.FC = () => {
  const {
    students,
    criteria,
    addScore,
    isQuickScoringOpen,
    setIsQuickScoringOpen,
    quickScoringPreselectedMaHS,
    setQuickScoringPreselectedMaHS,
  } = useEmulation();

  // Search & Filter state for students
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<number | 'all'>('all');
  const [selectedMaHS, setSelectedMaHS] = useState<string>('');

  // Step 2: Behavior Type (plus / minus)
  const [behaviorType, setBehaviorType] = useState<CriteriaType>('plus');

  // Step 3: Selected Criteria
  const [selectedMaTieuChi, setSelectedMaTieuChi] = useState<string>('');
  const [criteriaSearch, setCriteriaSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Optional Note
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync preselected student when opened from a card
  useEffect(() => {
    if (quickScoringPreselectedMaHS) {
      setSelectedMaHS(quickScoringPreselectedMaHS);
      // find student team to preselect
      const stu = students.find((s) => s.maHS === quickScoringPreselectedMaHS);
      if (stu) {
        setSelectedTeamFilter(stu.to);
      }
    } else if (students.length > 0 && !selectedMaHS) {
      setSelectedMaHS(students[0].maHS);
    }
  }, [quickScoringPreselectedMaHS, students]);

  // Reset or preset default criteria when behaviorType changes
  useEffect(() => {
    const available = criteria.filter((c) => c.loai === behaviorType);
    if (available.length > 0) {
      // Pick first matching criteria
      setSelectedMaTieuChi(available[0].maTieuChi);
    } else {
      setSelectedMaTieuChi('');
    }
  }, [behaviorType, criteria]);

  // Filtered Students list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchTeam = selectedTeamFilter === 'all' || s.to === selectedTeamFilter;
      const matchQuery =
        s.hoTen.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.maHS.toLowerCase().includes(studentSearch.toLowerCase());
      return matchTeam && matchQuery;
    });
  }, [students, selectedTeamFilter, studentSearch]);

  // Filtered Criteria list
  const filteredCriteria = useMemo(() => {
    return criteria.filter((c) => {
      const matchType = c.loai === behaviorType;
      const matchCat = selectedCategory === 'all' || c.nhom === selectedCategory;
      const matchSearch = c.tenTieuChi.toLowerCase().includes(criteriaSearch.toLowerCase());
      return matchType && matchCat && matchSearch;
    });
  }, [criteria, behaviorType, selectedCategory, criteriaSearch]);

  const selectedStudentObj = useMemo(
    () => students.find((s) => s.maHS === selectedMaHS),
    [students, selectedMaHS]
  );

  const selectedCriteriaObj = useMemo(
    () => criteria.find((c) => c.maTieuChi === selectedMaTieuChi),
    [criteria, selectedMaTieuChi]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaHS || !selectedMaTieuChi) return;

    setIsSubmitting(true);
    await addScore(selectedMaHS, selectedMaTieuChi, note);
    setIsSubmitting(false);

    // Keep student selected or reset note
    setNote('');
    // Close modal
    setIsQuickScoringOpen(false);
    setQuickScoringPreselectedMaHS(null);
  };

  if (!isQuickScoringOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
              <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight">CHẤM ĐIỂM NHANH THI ĐUA</h2>
              <p className="text-xs text-red-100">Ghi nhận việc tốt & nhắc nhở vi phạm nề nếp</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsQuickScoringOpen(false);
              setQuickScoringPreselectedMaHS(null);
            }}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* STEP 1: CHỌN HỌC SINH */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                  1
                </span>
                Chọn Học Sinh
              </label>

              {selectedStudentObj && (
                <span className="text-xs font-semibold text-slate-700">
                  Đã chọn: <strong className="text-red-600">{selectedStudentObj.hoTen}</strong> (Tổ {selectedStudentObj.to})
                </span>
              )}
            </div>

            {/* Team filter chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedTeamFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-colors ${
                  selectedTeamFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Cả lớp (42)
              </button>
              {[1, 2, 3, 4].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTeamFilter(t)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-colors ${
                    selectedTeamFilter === t
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tổ {t}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Gõ tên hoặc mã học sinh (VD: Minh Anh, 6B1-01)..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50/50"
              />
              {studentSearch && (
                <button
                  type="button"
                  onClick={() => setStudentSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Student selection scroll area */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/40">
              {filteredStudents.map((stu) => {
                const isSelected = selectedMaHS === stu.maHS;
                return (
                  <button
                    key={stu.maHS}
                    type="button"
                    onClick={() => setSelectedMaHS(stu.maHS)}
                    className={`p-2 rounded-xl text-left border transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'border-red-500 bg-red-50/80 text-red-950 font-bold shadow-xs ring-1 ring-red-400'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <StudentAvatar student={stu} size="xs" allowEdit={false} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate">{stu.hoTen}</div>
                      <div className="text-[10px] text-slate-600">
                        Tổ {stu.to} · <span className="font-semibold text-red-700">{stu.tongDiem}đ</span>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredStudents.length === 0 && (
                <div className="col-span-full py-4 text-center text-xs text-slate-700">
                  Không tìm thấy học sinh phù hợp.
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: CHỌN LOẠI HÀNH VI (NÚT XANH / ĐỎ) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                2
              </span>
              Loại Hành Vi
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBehaviorType('plus')}
                className={`py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-extrabold transition-all cursor-pointer ${
                  behaviorType === 'plus'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-md shadow-emerald-100 ring-2 ring-emerald-400'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
                }`}
              >
                <CheckCircle className={`w-5 h-5 ${behaviorType === 'plus' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>🟢 VIỆC TỐT (+ Điểm)</span>
              </button>

              <button
                type="button"
                onClick={() => setBehaviorType('minus')}
                className={`py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-extrabold transition-all cursor-pointer ${
                  behaviorType === 'minus'
                    ? 'border-red-500 bg-red-50 text-red-800 shadow-md shadow-red-100 ring-2 ring-red-400'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-red-300'
                }`}
              >
                <AlertCircle className={`w-5 h-5 ${behaviorType === 'minus' ? 'text-red-600' : 'text-slate-400'}`} />
                <span>🔴 VI PHẠM (- Điểm)</span>
              </button>
            </div>
          </div>

          {/* STEP 3: CHỌN TIÊU CHÍ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                  3
                </span>
                Chọn Tiêu Chí Thi Đua ({filteredCriteria.length})
              </label>
              {selectedCriteriaObj && (
                <span className="text-xs font-bold text-slate-700">
                  Mức điểm:{' '}
                  <span
                    className={
                      selectedCriteriaObj.loai === 'plus' ? 'text-emerald-600' : 'text-red-600'
                    }
                  >
                    {selectedCriteriaObj.loai === 'plus' ? '+' : '-'}
                    {selectedCriteriaObj.diem} điểm
                  </span>
                </span>
              )}
            </div>

            {/* Criteria Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/40">
              {filteredCriteria.map((c) => {
                const isSelected = selectedMaTieuChi === c.maTieuChi;
                const isPlus = c.loai === 'plus';
                return (
                  <button
                    key={c.maTieuChi}
                    type="button"
                    onClick={() => setSelectedMaTieuChi(c.maTieuChi)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? isPlus
                          ? 'border-emerald-500 bg-emerald-50/90 shadow-xs ring-1 ring-emerald-400'
                          : 'border-red-500 bg-red-50/90 shadow-xs ring-1 ring-red-400'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="text-base select-none shrink-0">{c.bieuTuong || '⭐'}</span>
                      <div>
                        <div className="text-xs font-semibold text-slate-800 leading-tight">
                          {c.tenTieuChi}
                        </div>
                        <div className="text-[10px] text-slate-600 mt-0.5">{c.nhom}</div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-lg shrink-0 ${
                        isPlus ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isPlus ? '+' : '-'}
                      {c.diem}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ghi chú chi tiết (Tùy chọn) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Ghi chú bổ sung (tuỳ chọn):</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Tiết 2 môn Toán, trả lại ví tiền cho bạn Dũng, đi muộn 15p..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setIsQuickScoringOpen(false);
              setQuickScoringPreselectedMaHS(null);
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedMaHS || !selectedMaTieuChi || isSubmitting}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all cursor-pointer ${
              !selectedMaHS || !selectedMaTieuChi || isSubmitting
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : behaviorType === 'plus'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-200 active:scale-98'
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-200 active:scale-98'
            }`}
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>
              {isSubmitting
                ? 'Đang lưu...'
                : selectedCriteriaObj && selectedStudentObj
                ? `LƯU ĐIỂM (${selectedCriteriaObj.loai === 'plus' ? '+' : '-'}${selectedCriteriaObj.diem}Đ CHO ${selectedStudentObj.hoTen.toUpperCase()})`
                : 'LƯU ĐIỂM NGAY'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
