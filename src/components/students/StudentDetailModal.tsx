import React from 'react';
import { useEmulation } from '../../context/EmulationContext';
import {
  X,
  Trophy,
  Award,
  Zap,
  Clock,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { Student } from '../../types';
import { StudentAvatar } from '../common/StudentAvatar';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, onClose }) => {
  const {
    logs,
    students,
    config,
    revertLog,
    currentUser,
    setIsQuickScoringOpen,
    setQuickScoringPreselectedMaHS,
  } = useEmulation();

  if (!student) return null;

  // Calculate student class rank
  const sorted = [...students].sort((a, b) => b.tongDiem - a.tongDiem);
  const rank = sorted.findIndex((s) => s.maHS === student.maHS) + 1;

  // Student specific logs
  const studentLogs = logs.filter((l) => l.maHS === student.maHS);
  const plusCount = studentLogs.filter((l) => l.loai === 'plus' && !l.daHuy).length;
  const minusCount = studentLogs.filter((l) => l.loai === 'minus' && !l.daHuy).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Hero */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-red-600 via-rose-600 to-indigo-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <StudentAvatar student={student} size="lg" allowEdit={true} />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-xs">
                  {student.maHS}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-amber-950">
                  Tổ {student.to}
                </span>
                {student.chucVu !== 'Học sinh' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-800 text-white">
                    {student.chucVu}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">
                {student.hoTen}
              </h2>
              <p className="text-xs text-red-100 mt-0.5">
                Học sinh {config.tenLop} · Trường Chuẩn Quốc Gia
              </p>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 p-4 bg-slate-50 border-b border-slate-200 text-center gap-2">
          <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] text-slate-700 font-semibold uppercase">Điểm Thi Đua</div>
            <div className="text-2xl font-black text-red-600 mt-0.5">{student.tongDiem}</div>
          </div>

          <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] text-slate-700 font-semibold uppercase">Xếp Hạng Lớp</div>
            <div className="text-2xl font-black text-amber-600 mt-0.5">#{rank}</div>
          </div>

          <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] text-slate-700 font-semibold uppercase">Khen / Phạt</div>
            <div className="text-base font-bold text-slate-800 mt-1">
              <span className="text-emerald-600 font-black">+{plusCount}</span> /{' '}
              <span className="text-red-600 font-black">-{minusCount}</span>
            </div>
          </div>
        </div>

        {/* Timeline of Logs */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              LỊCH SỬ CHẤM ĐIỂM CÁ NHÂN ({studentLogs.length})
            </h3>

            <button
              onClick={() => {
                setQuickScoringPreselectedMaHS(student.maHS);
                setIsQuickScoringOpen(true);
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Chấm điểm ngay</span>
            </button>
          </div>

          {studentLogs.length > 0 ? (
            <div className="space-y-2.5">
              {studentLogs.map((log) => {
                const isPlus = log.loai === 'plus';

                return (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      log.daHuy
                        ? 'border-slate-200 bg-slate-100/60 opacity-60'
                        : isPlus
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-red-200 bg-red-50/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {isPlus ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900">
                          {log.tenTieuChi}
                        </div>
                        {log.ghiChu && (
                          <div className="text-xs text-slate-600 mt-0.5">
                            Ghi chú: {log.ghiChu}
                          </div>
                        )}
                        <div className="text-[11px] text-slate-700 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>
                            {new Date(log.thoiGian).toLocaleString('vi-VN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                          <span>·</span>
                          <span>Người chấm: {log.nguoiCham}</span>
                          {log.daHuy && (
                            <span className="text-amber-700 font-bold bg-amber-100 px-1.5 py-0.2 rounded-sm text-[10px]">
                              ĐÃ HOÀN TÁC
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className={`text-xs sm:text-sm font-black px-2 py-0.5 rounded-lg ${
                          log.daHuy
                            ? 'bg-slate-200 text-slate-600 line-through'
                            : isPlus
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isPlus ? '+' : ''}
                        {log.diemThayDoi} đ
                      </span>

                      {!log.daHuy && (
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn hoàn tác và trả lại điểm cho hành vi "${log.tenTieuChi}"?`)) {
                              revertLog(log.id);
                            }
                          }}
                          className="text-[11px] text-slate-700 hover:text-red-600 font-semibold flex items-center gap-1 transition-colors"
                          title="Hủy bỏ thao tác này"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Hủy</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-700 bg-slate-50 rounded-xl">
              Học sinh chưa có ghi nhận điểm thi đua nào trong tuần.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Đóng hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
};
