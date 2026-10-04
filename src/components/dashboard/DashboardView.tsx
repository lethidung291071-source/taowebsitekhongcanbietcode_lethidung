import React, { useMemo, useState } from 'react';
import { useEmulation } from '../../context/EmulationContext';
import {
  Trophy,
  Crown,
  AlertTriangle,
  Flame,
  Zap,
  TrendingUp,
  Award,
  Users,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  Pencil,
} from 'lucide-react';
import { TabKey } from '../common/Sidebar';
import { StudentAvatar } from '../common/StudentAvatar';

interface DashboardViewProps {
  onNavigateTab: (tab: TabKey) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const {
    students,
    teamStats,
    logs,
    config,
    setIsQuickScoringOpen,
    setQuickScoringPreselectedMaHS,
    setSelectedStudentForDetail,
  } = useEmulation();

  // State to focus on specific team, defaulting to Tổ 4 as requested
  const [focusedTeam, setFocusedTeam] = useState<number>(4);

  // Students belonging to focused team sorted by score descending
  const focusedTeamStudents = useMemo(() => {
    return students
      .filter((s) => s.to === focusedTeam)
      .sort((a, b) => b.tongDiem - a.tongDiem);
  }, [students, focusedTeam]);

  const focusedTeamInfo = useMemo(() => {
    return teamStats.find((t) => t.to === focusedTeam) || teamStats[3];
  }, [teamStats, focusedTeam]);

  // 1. Calculations for Stat Cards
  const totalClassScore = useMemo(() => {
    return students.reduce((sum, s) => sum + s.tongDiem, 0);
  }, [students]);

  const leadingTeam = useMemo(() => {
    return [...teamStats].sort((a, b) => b.tongDiem - a.tongDiem)[0];
  }, [teamStats]);

  const topStudent = useMemo(() => {
    return [...students].sort((a, b) => b.tongDiem - a.tongDiem)[0];
  }, [students]);

  const lowestStudent = useMemo(() => {
    return [...students].sort((a, b) => a.tongDiem - b.tongDiem)[0];
  }, [students]);

  // 2. Violation distribution (Pie / Donut breakdown)
  const violationStats = useMemo(() => {
    const counts: Record<string, { name: string; count: number; points: number }> = {};
    const minusLogs = logs.filter((l) => l.loai === 'minus' && !l.daHuy);

    minusLogs.forEach((l) => {
      const key = l.tenTieuChi;
      if (!counts[key]) {
        counts[key] = { name: key, count: 0, points: 0 };
      }
      counts[key].count += 1;
      counts[key].points += Math.abs(l.diemThayDoi);
    });

    const list = Object.values(counts).sort((a, b) => b.count - a.count);
    const totalViolations = list.reduce((sum, item) => sum + item.count, 0) || 1;

    const colors = ['#EF4444', '#F97316', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

    return {
      list: list.slice(0, 5),
      totalViolations,
      colors,
    };
  }, [logs]);

  // Max score for team bar chart scale
  const maxTeamScore = useMemo(() => {
    const max = Math.max(...teamStats.map((t) => t.tongDiem), 100);
    return max * 1.1;
  }, [teamStats]);

  // Recent 6 logs
  const recentLogs = useMemo(() => {
    return logs.slice(0, 6);
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-5 sm:p-7 text-white shadow-lg shadow-red-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs">
                Tuần {config.tuanHienTai} Thi Đua Sôi Nổi
              </span>
              <span className="text-xs text-white/90 font-bold">{config.tenLop}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Bảng Tổng Quan Nề Nếp & Thi Đua Lớp
            </h2>
            <p className="text-xs sm:text-sm text-red-100 max-w-xl">
              Tổ dẫn đầu tuần này là{' '}
              <span className="font-bold underline text-amber-200">{leadingTeam?.tenTo}</span> với{' '}
              {leadingTeam?.tongDiem} điểm. Tiếp tục rèn luyện nề nếp và gặt hái điểm tốt!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsQuickScoringOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white text-red-700 font-extrabold text-xs sm:text-sm shadow-md hover:bg-red-50 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-red-600 text-red-600" />
              <span>Chấm Điểm Nhanh</span>
            </button>
            <button
              onClick={() => onNavigateTab('leaderboard')}
              className="px-4 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Bảng Xếp Hạng</span>
            </button>
          </div>
        </div>

        {/* Ambient background decorative circles */}
        <div className="absolute -right-8 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-32 h-32 rounded-full bg-amber-400/20 blur-lg pointer-events-none" />
      </div>

      {/* 4 STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng điểm cả lớp */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Tổng Điểm Cả Lớp
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {totalClassScore.toLocaleString('vi-VN')}
              <span className="text-xs font-bold text-slate-700 ml-1">điểm</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>TB {Math.round(totalClassScore / (students.length || 1))} điểm / học sinh</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Tổ dẫn đầu */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/40 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              Tổ Dẫn Đầu Tuần
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-1">
              {leadingTeam?.tenTo || 'Tổ 1'}
            </div>
            <div className="text-xs text-amber-700 font-semibold mt-2">
              {leadingTeam?.tongDiem} điểm · TB {leadingTeam?.diemTrungBinh}đ
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-xs shadow-amber-200">
            <Crown className="w-6 h-6 fill-amber-500" />
          </div>
        </div>

        {/* Card 3: Học sinh Xuất sắc nhất */}
        <div
          onClick={() => topStudent && setSelectedStudentForDetail(topStudent)}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/40 shadow-xs flex items-start justify-between cursor-pointer hover:shadow-md transition-shadow"
        >
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-emerald-600" />
              Top 1 Xuất Sắc
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-1 line-clamp-1">
              {topStudent?.hoTen || 'Chưa cập nhật'}
            </div>
            <div className="text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1">
              <span>{topStudent?.tongDiem} điểm</span>
              <span>·</span>
              <span>Tổ {topStudent?.to}</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Học sinh cần nhắc nhở */}
        <div
          onClick={() => lowestStudent && setSelectedStudentForDetail(lowestStudent)}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-red-200/80 bg-gradient-to-br from-white to-red-50/40 shadow-xs flex items-start justify-between cursor-pointer hover:shadow-md transition-shadow"
        >
          <div>
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              Cần Nhắc Nhở
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-1 line-clamp-1">
              {lowestStudent?.hoTen || 'Chưa cập nhật'}
            </div>
            <div className="text-xs text-red-700 font-semibold mt-2 flex items-center gap-1">
              <span>{lowestStudent?.tongDiem} điểm</span>
              <span>·</span>
              <span>Tổ {lowestStudent?.to}</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: SO SÁNH 4 TỔ (BAR CHART) & THỐNG KÊ LỖI VI PHẠM (DONUT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cục Diện Thi Đua Giữa 4 Tổ - Chi tiết danh sách từng học sinh với ảnh tròn & nút sửa cá nhân */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-600" />
                Cục Diện Thi Đua Giữa 4 Tổ
              </h3>
              <p className="text-xs text-slate-700 mt-0.5">
                Danh sách chi tiết thi đua các tổ tuần này (Số học sinh, điểm tổng & xếp hạng huy chương)
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('teams')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
            >
              Xem tất cả 4 tổ <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Team Selector Cards (Retaining Tổ 1-4, số học sinh, điểm tổng, và huy chương) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {teamStats.map((team) => {
              const isSelected = focusedTeam === team.to;
              const medalColor =
                team.hang === 1
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : team.hang === 2
                  ? 'text-slate-700 bg-slate-50 border-slate-200'
                  : team.hang === 3
                  ? 'text-amber-800 bg-amber-50/50 border-amber-200'
                  : 'text-indigo-700 bg-indigo-50 border-indigo-200';

              return (
                <button
                  key={team.to}
                  type="button"
                  onClick={() => setFocusedTeam(team.to)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-red-500 bg-red-50/50 shadow-xs ring-2 ring-red-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">{team.tenTo}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${medalColor}`}>
                      {team.hang === 1 ? '🥇 Hạng 1' : team.hang === 2 ? '🥈 Hạng 2' : team.hang === 3 ? '🥉 Hạng 3' : '🏅 Hạng 4'}
                    </span>
                  </div>
                  <div className="text-xs font-black text-slate-800">
                    {team.tongDiem} <span className="font-normal text-[11px] text-slate-600">điểm</span>
                  </div>
                  <div className="text-[10px] text-slate-600 truncate mt-0.5">
                    {team.soThanhVien} học sinh · TB {team.diemTrungBinh}đ
                  </div>
                </button>
              );
            })}
          </div>

          {/* Focused Team Header Banner */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                T{focusedTeam}
              </span>
              <div>
                <div className="text-xs font-bold text-slate-900 flex flex-wrap items-center gap-1.5">
                  <span>Bảng Chi Tiết: {focusedTeamInfo?.tenTo}</span>
                  <span className="text-[11px] font-normal text-slate-600">
                    ({focusedTeamInfo?.soThanhVien} học sinh · Tổng {focusedTeamInfo?.tongDiem} điểm)
                  </span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-white border border-slate-200 text-slate-700">
                    {focusedTeamInfo?.danhHieu}
                  </span>
                </div>
                <p className="text-[10px] text-slate-700">
                  ✏️ Bấm vào biểu tượng cây bút trên ảnh tròn để chỉnh sửa hoặc thay thế ảnh từng học sinh
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-[11px] font-bold text-slate-700">Tổ trưởng: </span>
              <span className="text-xs font-bold text-red-600">{focusedTeamInfo?.toTruong}</span>
            </div>
          </div>

          {/* Detailed Student List with Circular Avatar & Subtle Edit Pencil */}
          <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-[380px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100 shadow-2xs">
                <tr className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3 w-16 text-center">Ảnh Đại Diện</th>
                  <th className="py-2.5 px-3">Họ và Tên</th>
                  <th className="py-2.5 px-3 text-center">Mã HS / Chức Vụ</th>
                  <th className="py-2.5 px-3 text-center">Điểm Tổng</th>
                  <th className="py-2.5 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {focusedTeamStudents.map((stu, index) => {
                  const isAboveStandard = stu.tongDiem >= 100;

                  return (
                    <tr
                      key={stu.maHS}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Rank in Team */}
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                        {index === 0 ? (
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black inline-flex items-center justify-center">
                            1
                          </span>
                        ) : (
                          <span className="text-slate-600">{index + 1}</span>
                        )}
                      </td>

                      {/* Circular Avatar with Subtle Pencil Edit Button */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex justify-center">
                          <StudentAvatar
                            student={stu}
                            size="md"
                            shape="circle"
                            allowEdit={true}
                          />
                        </div>
                      </td>

                      {/* Name & Highlight */}
                      <td className="py-2.5 px-3">
                        <div
                          onClick={() => setSelectedStudentForDetail(stu)}
                          className="cursor-pointer group-hover:text-red-600 transition-colors"
                        >
                          <span className="font-bold text-slate-900 block">{stu.hoTen}</span>
                          <span className="text-[11px] text-slate-600">
                            {stu.gioiTinh === 'nu' ? 'Nữ' : 'Nam'}
                          </span>
                        </div>
                      </td>

                      {/* Code & Role */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="text-[11px] font-mono text-slate-600">{stu.maHS}</div>
                        {stu.chucVu && stu.chucVu !== 'Học sinh' ? (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                            {stu.chucVu}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-600">Học sinh</span>
                        )}
                      </td>

                      {/* Total Score */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg font-black text-xs ${
                            stu.tongDiem >= 110
                              ? 'bg-emerald-100 text-emerald-800'
                              : isAboveStandard
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {stu.tongDiem} đ
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setQuickScoringPreselectedMaHS(stu.maHS);
                              setIsQuickScoringOpen(true);
                            }}
                            title={`Chấm điểm thi đua cho ${stu.hoTen}`}
                            className="px-2 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold transition-all cursor-pointer active:scale-95"
                          >
                            Chấm điểm
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForDetail(stu)}
                            title="Xem hồ sơ chi tiết"
                            className="p-1 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-xs text-slate-700 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span>💡 Toàn bộ ảnh đại diện và logo được lưu trữ vĩnh viễn trong localStorage.</span>
            <span className="font-semibold text-red-600">Mốc thi đua chuẩn: 100đ / học sinh</span>
          </div>
        </div>

        {/* THỐNG KÊ LỖI VI PHẠM (DONUT / BREAKDOWN) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Lỗi Vi Phạm Phổ Biến
            </h3>
            <p className="text-xs text-slate-700 mt-0.5">
              Phân tích các hành vi cần chấn chỉnh trong tuần
            </p>
          </div>

          {violationStats.list.length > 0 ? (
            <div className="space-y-3 my-2">
              {violationStats.list.map((item, idx) => {
                const percent = Math.round((item.count / violationStats.totalViolations) * 100);
                const color = violationStats.colors[idx % violationStats.colors.length];
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 truncate pr-2 flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        {item.name}
                      </span>
                      <span className="font-bold text-slate-700 shrink-0">
                        {item.count} lần ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${percent}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-700">
              Chưa có ghi nhận vi phạm nề nếp nào trong tuần! Lớp rất xuất sắc! 🎉
            </div>
          )}

          <div className="p-3 bg-red-50/70 border border-red-100 rounded-xl text-xs text-red-800">
            <strong>Nhắc nhở GVCN:</strong> Cần chấn chỉnh{' '}
            <span className="font-bold text-red-900">
              {violationStats.list[0]?.name || 'các lỗi đi muộn'}
            </span>{' '}
            vào giờ 15 phút đầu giờ.
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: NHẬT KÝ CHẤM ĐIỂM GẦN ĐÂY NHẤT */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-600" />
              Hoạt Động Chấm Điểm Mới Nhất
            </h3>
            <p className="text-xs text-slate-700 mt-0.5">
              Cập nhật tức thì các lần cộng và trừ điểm thi đua gần đây
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('logs')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Xem tất cả nhật ký <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-700 uppercase font-semibold">
                <th className="pb-2.5">Thời gian</th>
                <th className="pb-2.5">Học sinh</th>
                <th className="pb-2.5">Tổ</th>
                <th className="pb-2.5">Nội dung thi đua</th>
                <th className="pb-2.5">Điểm</th>
                <th className="pb-2.5">Người chấm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLogs.map((log) => {
                const isPlus = log.loai === 'plus';
                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 text-slate-700 whitespace-nowrap">
                      {new Date(log.thoiGian).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 font-bold text-slate-900 whitespace-nowrap">
                      {log.tenHocSinh}
                    </td>
                    <td className="py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        Tổ {log.to}
                      </span>
                    </td>
                    <td className="py-2.5 max-w-xs truncate text-slate-700">
                      {log.tenTieuChi}
                      {log.ghiChu && <span className="text-slate-600 ml-1">({log.ghiChu})</span>}
                    </td>
                    <td className="py-2.5 whitespace-nowrap">
                      <span
                        className={`font-black px-2 py-0.5 rounded-md text-xs ${
                          isPlus ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isPlus ? '+' : ''}
                        {log.diemThayDoi} đ
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-700 whitespace-nowrap">{log.nguoiCham}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
