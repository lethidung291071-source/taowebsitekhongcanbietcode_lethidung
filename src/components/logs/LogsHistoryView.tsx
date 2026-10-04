import React, { useState, useMemo } from 'react';
import { useEmulation } from '../../context/EmulationContext';
import {
  History,
  Search,
  Filter,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Calendar,
} from 'lucide-react';
import { CriteriaType } from '../../types';

export const LogsHistoryView: React.FC = () => {
  const { logs, revertLog, currentUser, addToast } = useEmulation();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | CriteriaType>('all');
  const [teamFilter, setTeamFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'reverted'>('all');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchType = typeFilter === 'all' || log.loai === typeFilter;
      const matchTeam = teamFilter === 'all' || log.to === teamFilter;
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? !log.daHuy
          : !!log.daHuy;

      const q = searchQuery.toLowerCase();
      const matchSearch =
        log.tenHocSinh.toLowerCase().includes(q) ||
        log.maHS.toLowerCase().includes(q) ||
        log.tenTieuChi.toLowerCase().includes(q) ||
        log.nguoiCham.toLowerCase().includes(q) ||
        (log.ghiChu && log.ghiChu.toLowerCase().includes(q));

      return matchType && matchTeam && matchStatus && matchSearch;
    });
  }, [logs, typeFilter, teamFilter, statusFilter, searchQuery]);

  const handleExportLogsCSV = () => {
    const header = [
      'Mã Log',
      'Thời Gian',
      'Người Chấm',
      'Mã HS',
      'Tên Học Sinh',
      'Tổ',
      'Nội Dung Tiêu Chí',
      'Loại',
      'Điểm Thay Đổi',
      'Ghi Chú',
      'Đã Hoàn Tác',
    ];
    const rows = logs.map((l) => [
      l.id,
      `"${new Date(l.thoiGian).toLocaleString('vi-VN')}"`,
      `"${l.nguoiCham}"`,
      l.maHS,
      `"${l.tenHocSinh}"`,
      l.to,
      `"${l.tenTieuChi}"`,
      l.loai === 'plus' ? 'Việc tốt' : 'Vi phạm',
      l.diemThayDoi,
      `"${l.ghiChu || ''}"`,
      l.daHuy ? 'Đã hủy' : 'Hiệu lực',
    ]);

    const csvContent = '\uFEFF' + [header.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NHAT_KY_THI_DUA_6B1_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Xuất file thành công', 'Đã tải toàn bộ lịch sử chấm điểm ra file CSV tiếng Việt');
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              NHẬT KÝ CHẤM ĐIỂM HỆ THỐNG ({logs.length})
            </h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Ghi nhận toàn bộ thao tác cộng/trừ điểm minh bạch · Giáo viên có quyền Hoàn tác (Revert)
          </p>
        </div>

        <button
          onClick={handleExportLogsCSV}
          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Xuất Nhật Ký CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo học sinh, nội dung, người chấm..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                typeFilter === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setTypeFilter('plus')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                typeFilter === 'plus' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              🟢 Việc tốt
            </button>
            <button
              onClick={() => setTypeFilter('minus')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                typeFilter === 'minus' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              🔴 Vi phạm
            </button>
          </div>

          {/* Team Filter */}
          <select
            value={teamFilter}
            onChange={(e) =>
              setTeamFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-medium bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-500"
          >
            <option value="all">Tất cả tổ</option>
            <option value={1}>Tổ 1</option>
            <option value={2}>Tổ 2</option>
            <option value={3}>Tổ 3</option>
            <option value={4}>Tổ 4</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'reverted')}
            className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-medium bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hiệu lực</option>
            <option value="reverted">Đã hoàn tác</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-700 font-bold uppercase text-[11px]">
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Người chấm</th>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4">Tổ</th>
                <th className="py-3 px-4">Nội dung thi đua</th>
                <th className="py-3 px-4 text-center">Điểm</th>
                <th className="py-3 px-4 text-right">Hoàn tác (Revert)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const isPlus = log.loai === 'plus';

                return (
                  <tr
                    key={log.id}
                    className={`transition-colors ${
                      log.daHuy ? 'bg-slate-100/50 opacity-60' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-mono text-xs">
                      <div>
                        {new Date(log.thoiGian).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-[10px] text-slate-600">
                        {new Date(log.thoiGian).toLocaleDateString('vi-VN')}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900">{log.nguoiCham}</span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.tenHocSinh}</div>
                      <div className="text-[10px] text-slate-600">{log.maHS}</div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs">
                        Tổ {log.to}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900">{log.tenTieuChi}</div>
                      {log.ghiChu && (
                        <div className="text-xs text-slate-600 mt-0.5">Ghi chú: {log.ghiChu}</div>
                      )}
                      {log.daHuy && (
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                          Đã hủy bởi {log.nguoiHuy || 'GVCN'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`font-black text-xs px-2.5 py-1 rounded-lg ${
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
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {log.daHuy ? (
                        <span className="text-xs text-slate-600 italic">Đã hoàn tác</span>
                      ) : (
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Bạn có chắc muốn HỦY THAO TÁC NÀY?\n\nNội dung: ${log.tenTieuChi}\nHọc sinh: ${log.tenHocSinh}\nĐiểm: ${log.diemThayDoi > 0 ? '+' : ''}${log.diemThayDoi} đ\n\nĐiểm của học sinh và Tổ sẽ được khôi phục nguyên trạng!`
                              )
                            ) {
                              revertLog(log.id);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold transition-all flex items-center gap-1 ml-auto cursor-pointer"
                          title="Hủy bỏ và trả lại điểm"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Hủy bỏ (Revert)</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-700">
                    Không tìm thấy lịch sử chấm điểm phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
