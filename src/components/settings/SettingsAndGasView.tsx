import React, { useState } from 'react';
import { useEmulation } from '../../context/EmulationContext';
import { GoogleSheetsService } from '../../services/googleSheetsService';
import {
  Settings,
  Sheet,
  Copy,
  Check,
  RefreshCw,
  UploadCloud,
  FileCode,
  ExternalLink,
  ShieldCheck,
  Save,
  Info,
  HelpCircle,
} from 'lucide-react';

export const SettingsAndGasView: React.FC = () => {
  const {
    config,
    updateConfig,
    syncWithGoogleSheets,
    pushAllToGoogleSheets,
    isSyncing,
    lastSyncTime,
    syncError,
    addToast,
  } = useEmulation();

  const [gasUrlInput, setGasUrlInput] = useState(config.gasApiUrl || '');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeInstructionTab, setActiveInstructionTab] = useState<'guide' | 'code'>('guide');

  // Class config inputs
  const [formConfig, setFormConfig] = useState({
    tenLop: config.tenLop,
    nienKhoa: config.nienKhoa,
    giaoVienChuNhiem: config.giaoVienChuNhiem,
    lopTruong: config.lopTruong,
    hocKy: config.hocKy,
    tuanHienTai: config.tuanHienTai,
  });

  const scriptCode = GoogleSheetsService.getGoogleAppsScriptTemplate();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(scriptCode);
      setCopiedCode(true);
      addToast('success', 'Đã sao chép mã!', 'Mã Google Apps Script đã được lưu vào bộ nhớ tạm');
      setTimeout(() => setCopiedCode(false), 3000);
    } catch {
      addToast('error', 'Lỗi copy', 'Không thể sao chép tự động, vui lòng chọn và copy thủ công');
    }
  };

  const handleSaveGasUrl = () => {
    updateConfig({ gasApiUrl: gasUrlInput.trim() });
    addToast('success', 'Đã lưu URL', 'URL Google Apps Script đã được cập nhật!');
  };

  const handleSaveClassConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      tenLop: formConfig.tenLop,
      nienKhoa: formConfig.nienKhoa,
      giaoVienChuNhiem: formConfig.giaoVienChuNhiem,
      lopTruong: formConfig.lopTruong,
      hocKy: formConfig.hocKy,
      tuanHienTai: Number(formConfig.tuanHienTai),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Sheet className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              KẾT NỐI GOOGLE SHEETS & CÀI ĐẶT
            </h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Thiết lập đồng bộ đám mây với Google Sheets `DU_LIEU_THI_DUA_3_3` và quản lý thông tin lớp
          </p>
        </div>
      </div>

      {/* GOOGLE SHEETS SYNC CONTROL PANEL */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Cấu Hình Google Apps Script API URL
            </h3>
            <p className="text-xs text-slate-700">
              Cổng kết nối tự động giữa giao diện Web App và bảng tính Google Sheets
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-700">
            Trạng thái:{' '}
            {config.gasApiUrl ? (
              <span className="text-emerald-600 font-bold">● Đã thiết lập URL</span>
            ) : (
              <span className="text-amber-600 font-bold">○ Đang chạy Cục bộ (Local)</span>
            )}
          </div>
        </div>

        {/* Input Web App URL */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-700">
            URL Ứng Dụng Web (Google Apps Script Web App URL):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={gasUrlInput}
              onChange={(e) => setGasUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleSaveGasUrl}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>Lưu URL</span>
            </button>
          </div>
        </div>

        {/* 2 Big Action Buttons: Sync from Sheets / Push to Sheets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            disabled={isSyncing}
            onClick={() => syncWithGoogleSheets(gasUrlInput)}
            className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-700 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>TẢI DỮ LIỆU MỚI TỪ GOOGLE SHEETS (GET)</span>
          </button>

          <button
            type="button"
            disabled={isSyncing}
            onClick={() => pushAllToGoogleSheets(gasUrlInput)}
            className="p-3.5 rounded-xl border border-blue-300 bg-blue-50/80 hover:bg-blue-100 text-blue-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-blue-700" />
            <span>KHỞI TẠO / ĐẨY DỮ LIỆU LÊN SHEETS (SEED)</span>
          </button>
        </div>

        {lastSyncTime && (
          <div className="text-xs text-slate-700 flex items-center gap-1.5 pt-1">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đồng bộ thành công lần cuối lúc: <strong>{lastSyncTime}</strong></span>
          </div>
        )}

        {syncError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
            <strong>Thông báo lỗi:</strong> {syncError}
          </div>
        )}
      </div>

      {/* GOOGLE APPS SCRIPT GUIDE & SOURCE CODE TABS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveInstructionTab('guide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeInstructionTab === 'guide'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📖 Hướng Dẫn 4 Bước Cài Đặt Google Sheets
            </button>
            <button
              onClick={() => setActiveInstructionTab('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeInstructionTab === 'code'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 inline mr-1" />
              Mã Nguồn Code.gs
            </button>
          </div>

          <button
            onClick={handleCopyCode}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Đã Sao Chép!' : 'Sao Chép Mã .GS'}</span>
          </button>
        </div>

        {/* TAB 1: GUIDE */}
        {activeInstructionTab === 'guide' && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <div className="font-bold text-slate-900">Tạo Google Sheet</div>
                <p className="text-slate-600">
                  Mở Google Drive, tạo 1 file Google Sheets mới và đặt tên:{' '}
                  <strong className="text-red-600">DU_LIEU_THI_DUA_3_3</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <div className="font-bold text-slate-900">Mở Apps Script</div>
                <p className="text-slate-600">
                  Trên thanh menu Google Sheets, vào <strong>Tiện ích mở rộng (Extensions)</strong> →{' '}
                  <strong>Apps Script</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <div className="font-bold text-slate-900">Dán Mã & Triển Khai</div>
                <p className="text-slate-600">
                  Xoá mã cũ, dán toàn bộ đoạn mã trong tab "Mã Nguồn Code.gs". Bấm{' '}
                  <strong>Triển khai (Deploy)</strong> → <strong>Ứng dụng web (Web app)</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                  4
                </div>
                <div className="font-bold text-slate-900">Quyền & Dán URL</div>
                <p className="text-slate-600">
                  Chọn: <strong>Execute as: Me</strong> và{' '}
                  <strong>Who has access: Anyone</strong>. Sao chép URL rồi dán vào ô bên trên và bấm "Lưu URL"!
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
              <strong>💡 Dữ liệu lưu 100% trên Google Sheets:</strong> Hệ thống tự động tạo 4 sheet{' '}
              <code>DANH_SACH_HOC_SINH</code>, <code>DANH_MUC_THI_DUA</code>,{' '}
              <code>LICH_SU_CHAM_DIEM</code>, <code>CAU_HINH</code>. Giáo viên có thể mở file trực tiếp trên Google Drive để xem hoặc sửa bất kỳ lúc nào!
            </div>
          </div>
        )}

        {/* TAB 2: CODE PREVIEW */}
        {activeInstructionTab === 'code' && (
          <div className="relative">
            <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-96 scrollbar-thin">
              {scriptCode}
            </pre>
          </div>
        )}
      </div>

      {/* CLASS CONFIGURATION FORM */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-600" />
          Cấu Hình Thông Tin Lớp Học
        </h3>

        <form onSubmit={handleSaveClassConfig} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Tên Lớp:</label>
            <input
              type="text"
              value={formConfig.tenLop}
              onChange={(e) => setFormConfig({ ...formConfig, tenLop: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Niên Khóa:</label>
            <input
              type="text"
              value={formConfig.nienKhoa}
              onChange={(e) => setFormConfig({ ...formConfig, nienKhoa: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Giáo Viên Chủ Nhiệm:</label>
            <input
              type="text"
              value={formConfig.giaoVienChuNhiem}
              onChange={(e) => setFormConfig({ ...formConfig, giaoVienChuNhiem: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Lớp Trưởng:</label>
            <input
              type="text"
              value={formConfig.lopTruong}
              onChange={(e) => setFormConfig({ ...formConfig, lopTruong: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Học Kỳ:</label>
            <input
              type="text"
              value={formConfig.hocKy}
              onChange={(e) => setFormConfig({ ...formConfig, hocKy: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Tuần Hiện Tại:</label>
            <input
              type="number"
              min="1"
              max="40"
              value={formConfig.tuanHienTai}
              onChange={(e) => setFormConfig({ ...formConfig, tuanHienTai: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-200 transition-colors cursor-pointer"
            >
              Lưu Cấu Hình Lớp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
