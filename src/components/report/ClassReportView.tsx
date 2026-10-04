import React, { useState, useMemo } from 'react';
import { useEmulation } from '../../context/EmulationContext';
import {
  FileBarChart,
  Trophy,
  AlertTriangle,
  Crown,
  Printer,
  Calendar,
  Sparkles,
  Award,
  Layers,
  CheckCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';

export const ClassReportView: React.FC = () => {
  const {
    students,
    teamStats,
    logs,
    config,
    closeWeekAndReset,
    setSelectedStudentForDetail,
    currentUser,
  } = useEmulation();

  const [startingScoreInput, setStartingScoreInput] = useState(100);
  const [isConfirmCloseWeekOpen, setIsConfirmCloseWeekOpen] = useState(false);

  // Top 5 Tuyên Dương
  const top5Students = useMemo(() => {
    return [...students].sort((a, b) => b.tongDiem - a.tongDiem).slice(0, 5);
  }, [students]);

  // Top 3 Vi phạm / Cần nhắc nhở (Lowest scores or most minus logs)
  const bottom3Students = useMemo(() => {
    return [...students].sort((a, b) => a.tongDiem - b.tongDiem).slice(0, 3);
  }, [students]);

  // Sorted teams
  const sortedTeams = useMemo(() => {
    return [...teamStats].sort((a, b) => b.tongDiem - a.tongDiem);
  }, [teamStats]);

  const bestTeam = sortedTeams[0];
  const lowestTeam = sortedTeams[sortedTeams.length - 1];

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  const handleExecuteCloseWeek = () => {
    closeWeekAndReset(startingScoreInput);
    setIsConfirmCloseWeekOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <FileBarChart className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              BÁO CÁO SINH HOẠT LỚP (TIẾT SINH HOẠT THỨ 6)
            </h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Tổng hợp thi đua nề nếp tuần {config.tuanHienTai} · Dùng cho giờ sinh hoạt và gửi phụ huynh
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>In Báo Cáo / Xuất PDF</span>
          </button>

          <button
            onClick={() => setIsConfirmCloseWeekOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-red-200 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Chốt Điểm Tuần {config.tuanHienTai}</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE REPORT SHEET CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Printable Header */}
        <div className="text-center border-b border-slate-200 pb-6 space-y-1">
          <div className="text-xs uppercase font-extrabold tracking-widest text-slate-700">
            TRƯỜNG TIỂU HỌC CHUẨN QUỐC GIA · NĂM HỌC {config.nienKhoa}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
            BÁO CÁO THI ĐUA NỀ NẾP LỚP {config.tenLop.toUpperCase()}
          </h1>
          <div className="text-sm font-semibold text-red-600">
            TIẾT SINH HOẠT LỚP TUẦN {config.tuanHienTai} · {config.hocKy}
          </div>
          <div className="text-xs text-slate-700 pt-1">
            GVCN: <strong className="text-red-600 font-bold">{config.giaoVienChuNhiem}</strong> · Lớp trưởng:{' '}
            <strong>{config.lopTruong}</strong> · Ngày lập báo cáo:{' '}
            {new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>

        {/* SECTION 1: XẾP HẠNG THI ĐUA 4 TỔ */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 uppercase flex items-center gap-2 border-l-4 border-red-600 pl-2.5">
            <Layers className="w-4 h-4 text-red-600" />
            1. Bảng Xếp Hạng Nề Nếp Thi Đua 4 Tổ
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {sortedTeams.map((team, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === sortedTeams.length - 1;

              return (
                <div
                  key={team.to}
                  className={`p-4 rounded-2xl border ${
                    isFirst
                      ? 'border-amber-300 bg-amber-50/60 shadow-xs ring-1 ring-amber-300'
                      : isLast
                      ? 'border-red-200 bg-red-50/30'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-slate-900">{team.tenTo}</span>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                        isFirst
                          ? 'bg-amber-400 text-amber-950 font-black'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Hạng {idx + 1}
                    </span>
                  </div>

                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {team.tongDiem} <span className="text-xs font-normal text-slate-700">điểm</span>
                  </div>
                  <div className="text-xs text-slate-700 mt-1">
                    Điểm TB: <strong>{team.diemTrungBinh}đ</strong> · {team.soThanhVien} HS
                  </div>
                  <div className="text-xs text-slate-700 mt-0.5">
                    Tổ trưởng: <strong>{team.toTruong}</strong>
                  </div>

                  {isFirst && (
                    <div className="mt-3 py-1 px-2 rounded-lg bg-amber-200/80 text-amber-950 text-xs font-bold text-center flex items-center justify-center gap-1">
                      <Crown className="w-3.5 h-3.5" />
                      <span>Nhận Cờ Luân Lưu Tuần 🚩</span>
                    </div>
                  )}
                  {isLast && (
                    <div className="mt-3 py-1 px-2 rounded-lg bg-red-100 text-red-900 text-xs font-bold text-center">
                      Cần nỗ lực tuần tới 💪
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: TOP 5 TUYÊN DƯƠNG */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-emerald-800 uppercase flex items-center gap-2 border-l-4 border-emerald-600 pl-2.5">
            <Trophy className="w-4 h-4 text-emerald-600" />
            2. Tuyên Dương Top 5 Học Sinh Xuất Sắc Nhất Tuần
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {top5Students.map((stu, idx) => (
              <div
                key={stu.maHS}
                onClick={() => setSelectedStudentForDetail(stu)}
                className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex flex-col items-center text-center cursor-pointer hover:shadow-xs transition-shadow"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center mb-2 shadow-xs">
                  #{idx + 1}
                </div>
                <div className="font-extrabold text-sm text-slate-900 line-clamp-1">
                  {stu.hoTen}
                </div>
                <div className="text-xs text-slate-700 mt-0.5">Tổ {stu.to}</div>
                <div className="mt-2 text-base font-black text-emerald-700">
                  {stu.tongDiem} điểm
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                  {idx === 0 ? 'Quán quân 🥇' : 'Gương mẫu ⭐'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: NHẮC NHỞ & PHÊ BÌNH */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-red-800 uppercase flex items-center gap-2 border-l-4 border-red-600 pl-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            3. Danh Sách Cần Nhắc Nhở & Chấn Chỉnh Nề Nếp
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {bottom3Students.map((stu, idx) => (
              <div
                key={stu.maHS}
                onClick={() => setSelectedStudentForDetail(stu)}
                className="p-4 rounded-2xl border border-red-200 bg-red-50/40 flex items-start gap-3 cursor-pointer hover:shadow-xs transition-shadow"
              >
                <div className="w-8 h-8 rounded-xl bg-red-200 text-red-800 font-black text-xs flex items-center justify-center shrink-0">
                  !
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{stu.hoTen}</div>
                  <div className="text-xs text-slate-700">
                    Tổ {stu.to} · {stu.maHS}
                  </div>
                  <div className="text-sm font-black text-red-600 mt-1">
                    {stu.tongDiem} điểm thi đua
                  </div>
                  <div className="text-xs text-red-700 mt-1 italic">
                    Biện pháp: Nhắc nhở trước lớp & liên hệ phụ huynh cùng phối hợp.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: KẾ HOẠCH TUẦN TỚI & CHỮ KÝ */}
        <div className="pt-4 border-t border-slate-200 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              4. Phương Hướng Hoạt Động Tuần {config.tuanHienTai + 1}:
            </h3>
            <ul className="text-xs text-slate-700 list-disc list-inside space-y-1">
              <li>Duy trì 100% học sinh đi học đúng giờ, mặc đúng đồng phục và đeo khăn quàng đỏ.</li>
              <li>Tăng cường kiểm tra bài cũ và chuẩn bị bài chu đáo trước khi đến lớp.</li>
              <li>Phát huy phong trào "Đôi bạn cùng tiến", các bạn học tốt hỗ trợ bạn còn hạn chế.</li>
              <li>Tổ trực nhật đảm bảo lớp sạch trước 7h00 sáng mỗi ngày.</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 text-center pt-8 text-xs text-slate-700">
            <div>
              <div className="font-bold uppercase text-slate-900">ĐẠI DIỆN BAN CÁN SỰ LỚP</div>
              <div className="text-[11px] text-slate-700">(Ký và ghi rõ họ tên)</div>
              <div className="h-16 flex items-end justify-center font-bold text-slate-800">
                {config.lopTruong}
              </div>
            </div>

            <div>
              <div className="font-bold uppercase text-slate-900">GIÁO VIÊN CHỦ NHIỆM</div>
              <div className="text-[11px] text-slate-700">(Ký và ghi rõ họ tên)</div>
              <div className="h-16 flex items-end justify-center font-bold text-red-600">
                {config.giaoVienChuNhiem}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM CLOSE WEEK MODAL */}
      {isConfirmCloseWeekOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 bg-gradient-to-r from-red-600 to-rose-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">CHỐT ĐIỂM THI ĐUA TUẦN {config.tuanHienTai}</h3>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Hành động này sẽ:
                <br />
                1. Lưu lại điểm số hiện tại của cả lớp làm cột mốc Tuần {config.tuanHienTai}.
                <br />
                2. Chuyển tuần thi đua sang <strong>Tuần {config.tuanHienTai + 1}</strong>.
                <br />
                3. Đặt lại điểm thi đua khởi đầu của toàn bộ 42 học sinh về mức chuẩn bên dưới:
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Mức điểm khởi đầu cho tuần mới:
                </label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={startingScoreInput}
                  onChange={(e) => setStartingScoreInput(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-center"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsConfirmCloseWeekOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleExecuteCloseWeek}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-200"
                >
                  Xác Nhận Chốt Điểm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
