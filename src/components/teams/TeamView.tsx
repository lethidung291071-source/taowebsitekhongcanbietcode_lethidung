import React, { useState } from 'react';
import { useEmulation } from '../../context/EmulationContext';
import {
  Crown,
  Trophy,
  Users,
  ChevronRight,
  Zap,
  ArrowUpRight,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';
import { TeamStats, Student } from '../../types';
import { StudentAvatar } from '../common/StudentAvatar';

export const TeamView: React.FC = () => {
  const {
    teamStats,
    students,
    config,
    setSelectedStudentForDetail,
    setIsQuickScoringOpen,
    setQuickScoringPreselectedMaHS,
  } = useEmulation();

  const [inspectingTeam, setInspectingTeam] = useState<number | null>(null);

  const teamMembers = inspectingTeam
    ? students
        .filter((s) => s.to === inspectingTeam)
        .sort((a, b) => b.tongDiem - a.tongDiem)
    : [];

  const inspectedTeamStats = inspectingTeam
    ? teamStats.find((t) => t.to === inspectingTeam)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              BẢNG THI ĐUA 4 TỔ {config.tenLop.toUpperCase()}
            </h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Tổng hợp điểm thi đua đồng đội theo tuần · Đoàn kết là sức mạnh!
          </p>
        </div>

        {inspectingTeam !== null && (
          <button
            onClick={() => setInspectingTeam(null)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold self-start sm:self-auto"
          >
            ← Thu gọn chi tiết
          </button>
        )}
      </div>

      {/* 4 LARGE TEAM CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {teamStats.map((team) => {
          const isFirst = team.hang === 1;
          const isSelected = inspectingTeam === team.to;

          return (
            <div
              key={team.to}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isSelected
                  ? 'border-red-500 ring-2 ring-red-400 bg-white shadow-lg'
                  : isFirst
                  ? 'border-amber-300 bg-gradient-to-br from-white via-amber-50/20 to-amber-100/30 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Card Header Banner */}
              <div
                className={`p-4 flex items-center justify-between border-b ${
                  isFirst
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                    : 'bg-slate-50 text-slate-900 border-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-xs ${
                      isFirst
                        ? 'bg-amber-300 text-amber-950 font-black'
                        : 'bg-white text-slate-800 border border-slate-200'
                    }`}
                  >
                    #{team.hang}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base tracking-tight leading-tight">
                      {team.tenTo}
                    </h3>
                    <div
                      className={`text-[11px] font-semibold ${
                        isFirst ? 'text-amber-100' : 'text-slate-700'
                      }`}
                    >
                      {team.danhHieu}
                    </div>
                  </div>
                </div>

                {isFirst && <Crown className="w-6 h-6 fill-amber-300 text-amber-200 animate-pulse" />}
              </div>

              {/* Card Body Stats */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[11px] text-slate-700 font-semibold uppercase">Tổng Điểm</div>
                    <div className="text-xl font-black text-slate-900 mt-0.5">
                      {team.tongDiem}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[11px] text-slate-700 font-semibold uppercase">Điểm TB/HS</div>
                    <div className="text-xl font-black text-red-600 mt-0.5">
                      {team.diemTrungBinh}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[11px] text-slate-700 font-semibold uppercase">Thành Viên</div>
                    <div className="text-xl font-black text-slate-900 mt-0.5">
                      {team.soThanhVien}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-700">
                  <span>
                    Tổ trưởng: <strong className="text-slate-800">{team.toTruong}</strong>
                  </span>
                  <span>Mốc chuẩn: 100đ/HS</span>
                </div>

                {/* Inspect Button */}
                <button
                  onClick={() => setInspectingTeam(isSelected ? null : team.to)}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : 'bg-red-50 hover:bg-red-100 text-red-700'
                  }`}
                >
                  <span>{isSelected ? 'Đóng Danh Sách Thành Viên' : `XEM CHI TIẾT ${team.tenTo.toUpperCase()}`}</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90' : ''}`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* INSPECTED TEAM MEMBERS DETAIL TABLE */}
      {inspectingTeam !== null && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-5 space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                Danh Sách Thành Viên {inspectedTeamStats?.tenTo} ({teamMembers.length} học sinh)
              </h3>
              <p className="text-xs text-slate-700">
                Tổ trưởng phụ trách: <strong>{inspectedTeamStats?.toTruong}</strong> · Tổng điểm tổ:{' '}
                <strong className="text-red-600">{inspectedTeamStats?.tongDiem} điểm</strong>
              </p>
            </div>

            <button
              onClick={() => {
                // Open quick scoring with first student in team
                if (teamMembers.length > 0) {
                  setQuickScoringPreselectedMaHS(teamMembers[0].maHS);
                  setIsQuickScoringOpen(true);
                }
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-red-200 self-start sm:self-auto"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Chấm Điểm Cho Tổ {inspectingTeam}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {teamMembers.map((member, idx) => (
              <div
                key={member.maHS}
                className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition-all flex items-center justify-between gap-2"
              >
                <div
                  onClick={() => setSelectedStudentForDetail(member)}
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                >
                  <StudentAvatar student={member} size="sm" allowEdit={true} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate hover:text-red-600">
                      {member.hoTen}
                    </div>
                    <div className="text-[10px] text-slate-700">
                      {member.maHS} {member.chucVu !== 'Học sinh' ? `· ${member.chucVu}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-black text-xs sm:text-sm text-slate-900">
                    {member.tongDiem}đ
                  </span>
                  <button
                    onClick={() => {
                      setQuickScoringPreselectedMaHS(member.maHS);
                      setIsQuickScoringOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                    title={`Chấm điểm cho ${member.hoTen}`}
                  >
                    <Zap className="w-3 h-3 fill-red-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
