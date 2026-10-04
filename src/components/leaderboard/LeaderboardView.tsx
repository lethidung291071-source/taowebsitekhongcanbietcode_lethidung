import React, { useState, useMemo } from 'react';
import { useEmulation } from '../../context/EmulationContext';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  ArrowUp,
  ArrowDown,
  Minus,
  Search,
  Filter,
  Zap,
  Sparkles,
  Award,
} from 'lucide-react';
import { Student } from '../../types';
import { StudentAvatar } from '../common/StudentAvatar';

export const LeaderboardView: React.FC = () => {
  const {
    students,
    config,
    setSelectedStudentForDetail,
    setIsQuickScoringOpen,
    setQuickScoringPreselectedMaHS,
  } = useEmulation();

  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'term'>('week');
  const [teamFilter, setTeamFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sort and rank students
  const rankedStudents = useMemo(() => {
    let list = [...students];

    // Filter by team
    if (teamFilter !== 'all') {
      list = list.filter((s) => s.to === teamFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) => s.hoTen.toLowerCase().includes(q) || s.maHS.toLowerCase().includes(q)
      );
    }

    // Sort by points descending
    list.sort((a, b) => b.tongDiem - a.tongDiem);

    return list;
  }, [students, teamFilter, searchQuery]);

  // Overall top 3 for the Podium
  const top1 = rankedStudents[0];
  const top2 = rankedStudents[1];
  const top3 = rankedStudents[2];
  const remainingStudents = rankedStudents.slice(3);

  // Helper to calculate rank change indicator
  const getRankDelta = (student: Student, currentRank: number) => {
    // If student has previous score, compare
    if (!student.diemTuanTruoc) return { delta: 0, text: '-' };
    const diff = student.tongDiem - student.diemTuanTruoc;
    if (diff > 0) return { delta: 1, text: `+${diff}đ` };
    if (diff < 0) return { delta: -1, text: `${diff}đ` };
    return { delta: 0, text: 'Giữ hạng' };
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Trophy className="w-5 h-5 fill-amber-400 text-amber-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              BẢNG XẾP HẠNG THI ĐUA
            </h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Đấu trường thi đua nề nếp & học tập · Tuần {config.tuanHienTai} ({config.hocKy})
          </p>
        </div>

        {/* Time and Team filter segmented buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeFilter === 'week'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tuần {config.tuanHienTai}
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeFilter === 'month'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tháng Này
            </button>
            <button
              onClick={() => setTimeFilter('term')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeFilter === 'term'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Học Kỳ I
            </button>
          </div>

          {/* Team Filter */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setTeamFilter('all')}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                teamFilter === 'all'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            {[1, 2, 3, 4].map((t) => (
              <button
                key={t}
                onClick={() => setTeamFilter(t)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  teamFilter === t
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tổ {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TOP 3 PODIUM - GAMIFICATION DISPLAY */}
      {rankedStudents.length >= 3 && (
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          {/* Background glitter */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center mb-6">
            <span className="px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              🌟 BỤC VINH DANH NGÔI SAO SÁNG {config.tenLop.toUpperCase()} 🌟
            </span>
          </div>

          {/* Podium columns: 2nd (Silver) -> 1st (Gold) -> 3rd (Bronze) */}
          <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-6 items-end max-w-2xl mx-auto pt-4 pb-2">
            {/* 2ND PLACE - SILVER */}
            {top2 && (
              <div
                onClick={() => setSelectedStudentForDetail(top2)}
                className="flex flex-col items-center group cursor-pointer"
              >
                {/* Avatar with Silver Ring */}
                <div className="relative mb-2">
                  <StudentAvatar student={top2} size="lg" allowEdit={true} className="border-4 border-slate-300 shadow-lg shadow-slate-500/30 group-hover:scale-105 transition-transform" />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center border border-white shadow-xs z-20">
                    2
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                    {top2.hoTen}
                  </div>
                  <div className="text-[11px] text-slate-400">Tổ {top2.to}</div>
                  <div className="font-black text-sm sm:text-base text-slate-200 mt-0.5">
                    {top2.tongDiem} <span className="text-[11px] font-normal">điểm</span>
                  </div>
                </div>

                {/* Silver Step Block */}
                <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-slate-700 to-slate-600 rounded-t-2xl mt-3 flex items-center justify-center border-t border-slate-500/50 shadow-inner">
                  <Medal className="w-8 h-8 text-slate-300" />
                </div>
              </div>
            )}

            {/* 1ST PLACE - GOLD (CENTER - TALLEST) */}
            {top1 && (
              <div
                onClick={() => setSelectedStudentForDetail(top1)}
                className="flex flex-col items-center group cursor-pointer -mt-6"
              >
                {/* Golden Crown */}
                <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 fill-amber-300 animate-bounce mb-1" />

                {/* Avatar with Gold Ring & Glow */}
                <div className="relative mb-2">
                  <StudentAvatar student={top1} size="xl" allowEdit={true} className="border-4 border-amber-300 shadow-xl shadow-amber-500/40 ring-4 ring-amber-400/30 group-hover:scale-105 transition-transform" />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center border-2 border-white shadow-md z-20">
                    1
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-extrabold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {top1.hoTen}
                  </div>
                  <div className="text-xs text-amber-300 font-semibold">Tổ {top1.to} · Quán quân 👑</div>
                  <div className="font-black text-base sm:text-lg text-amber-400 mt-0.5">
                    {top1.tongDiem} <span className="text-xs font-normal">điểm</span>
                  </div>
                </div>

                {/* Gold Step Block */}
                <div className="w-full h-32 sm:h-36 bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 rounded-t-2xl mt-3 flex items-center justify-center border-t-2 border-yellow-200 shadow-inner">
                  <Trophy className="w-10 h-10 text-white fill-amber-200" />
                </div>
              </div>
            )}

            {/* 3RD PLACE - BRONZE */}
            {top3 && (
              <div
                onClick={() => setSelectedStudentForDetail(top3)}
                className="flex flex-col items-center group cursor-pointer"
              >
                {/* Avatar with Bronze Ring */}
                <div className="relative mb-2">
                  <StudentAvatar student={top3} size="lg" allowEdit={true} className="border-4 border-amber-600 shadow-lg shadow-orange-900/30 group-hover:scale-105 transition-transform" />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center border border-white shadow-xs z-20">
                    3
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                    {top3.hoTen}
                  </div>
                  <div className="text-[11px] text-slate-400">Tổ {top3.to}</div>
                  <div className="font-black text-sm sm:text-base text-orange-300 mt-0.5">
                    {top3.tongDiem} <span className="text-[11px] font-normal">điểm</span>
                  </div>
                </div>

                {/* Bronze Step Block */}
                <div className="w-full h-20 sm:h-24 bg-gradient-to-t from-amber-900 to-amber-800 rounded-t-2xl mt-3 flex items-center justify-center border-t border-amber-700/50 shadow-inner">
                  <Award className="w-8 h-8 text-amber-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEARCH AND TABLE OF ALL STUDENTS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm học sinh theo tên hoặc mã..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="text-xs text-slate-700 flex items-center gap-1">
            Hiển thị <strong className="text-slate-900">{rankedStudents.length}</strong> học sinh
          </div>
        </div>

        {/* List of remaining ranks */}
        <div className="divide-y divide-slate-100 overflow-x-auto">
          {rankedStudents.map((stu, index) => {
            const rank = index + 1;
            const deltaInfo = getRankDelta(stu, rank);
            const isTop3 = rank <= 3;
            // Progress towards 120 points benchmark
            const targetScore = 120;
            const progressPercent = Math.min(100, Math.max(10, Math.round((stu.tongDiem / targetScore) * 100)));

            return (
              <div
                key={stu.maHS}
                className={`p-3 sm:px-6 sm:py-3.5 flex items-center justify-between gap-3 transition-colors hover:bg-slate-50 ${
                  isTop3 ? 'bg-amber-50/20' : ''
                }`}
              >
                {/* Rank & Student Info */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Badge */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 ${
                      rank === 1
                        ? 'bg-amber-400 text-amber-950 font-black shadow-xs'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-900'
                        : rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {rank}
                  </div>

                  {/* Avatar */}
                  <div className="shrink-0 cursor-pointer" onClick={() => setSelectedStudentForDetail(stu)}>
                    <StudentAvatar student={stu} size="sm" allowEdit={true} />
                  </div>

                  {/* Name and Meta */}
                  <div className="min-w-0">
                    <button
                      onClick={() => setSelectedStudentForDetail(stu)}
                      className="font-bold text-xs sm:text-sm text-slate-900 hover:text-red-600 text-left truncate block cursor-pointer"
                    >
                      {stu.hoTen}
                    </button>
                    <div className="text-[11px] text-slate-700 flex items-center gap-1.5 flex-wrap">
                      <span>Mã: {stu.maHS}</span>
                      <span>·</span>
                      <span className="font-semibold text-slate-700">Tổ {stu.to}</span>
                      {stu.chucVu !== 'Học sinh' && (
                        <>
                          <span>·</span>
                          <span className="font-bold text-red-600">{stu.chucVu}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle: Progress Bar (Desktop only) */}
                <div className="hidden md:flex flex-col items-center w-36 px-2">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        stu.tongDiem >= 110
                          ? 'bg-emerald-500'
                          : stu.tongDiem >= 100
                          ? 'bg-blue-500'
                          : stu.tongDiem >= 90
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-600 mt-1">Mục tiêu 120đ</span>
                </div>

                {/* Score & Quick Action */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Delta indicator */}
                  <div className="text-right">
                    <div className="text-sm sm:text-base font-black text-slate-900">
                      {stu.tongDiem} <span className="text-xs font-normal text-slate-700">đ</span>
                    </div>
                    <div
                      className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
                        deltaInfo.delta > 0
                          ? 'text-emerald-600'
                          : deltaInfo.delta < 0
                          ? 'text-red-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {deltaInfo.delta > 0 && <ArrowUp className="w-3 h-3" />}
                      {deltaInfo.delta < 0 && <ArrowDown className="w-3 h-3" />}
                      {deltaInfo.delta === 0 && <Minus className="w-3 h-3" />}
                      <span>{deltaInfo.text}</span>
                    </div>
                  </div>

                  {/* Fast scoring icon button */}
                  <button
                    onClick={() => {
                      setQuickScoringPreselectedMaHS(stu.maHS);
                      setIsQuickScoringOpen(true);
                    }}
                    title={`Chấm điểm nhanh cho ${stu.hoTen}`}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                  >
                    <Zap className="w-4 h-4 fill-red-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
