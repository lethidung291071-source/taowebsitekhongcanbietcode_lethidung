import React, { useState, useRef } from 'react';
import { useEmulation } from '../../context/EmulationContext';
import { BackgroundMusicPlayer } from './BackgroundMusicPlayer';
import {
  Zap,
  Volume2,
  VolumeX,
  RefreshCw,
  Menu,
  X,
  UserCheck,
  ChevronDown,
  ShieldCheck,
  LogOut,
  Sparkles,
  Pencil,
  Shield,
  Star,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  isMobileSidebarOpen,
  onOpenLoginModal,
}) => {
  const {
    currentUser,
    config,
    setIsQuickScoringOpen,
    isSyncing,
    lastSyncTime,
    syncWithGoogleSheets,
    isMuted,
    toggleMute,
    users,
    switchUser,
    logout,
    updateAppLogo,
    addToast,
  } = useEmulation();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoClick = () => {
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
      logoInputRef.current.click();
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('error', 'Định dạng không hợp lệ', 'Vui lòng chọn file hình ảnh (.jpg, .jpeg, .png, .webp)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 360;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/png');
          updateAppLogo(base64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs px-3 sm:px-6 py-2.5 flex items-center justify-between">
      {/* Left: Mobile hamburger & Class Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-red-500"
          aria-label="Menu"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2.5">
          {/* Main App Logo Container */}
          <div
            onClick={handleLogoClick}
            title="Nhấn để đổi logo chính của ứng dụng"
            className="relative group cursor-pointer shrink-0"
          >
            {config.appLogo ? (
              <img
                src={config.appLogo}
                alt="Logo Ứng dụng"
                className="w-10 h-10 rounded-xl object-cover border-2 border-amber-400 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-red-600 to-rose-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-red-500/20 ring-2 ring-amber-300/60 relative group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-amber-100 fill-amber-300/40" />
                <Star className="w-2.5 h-2.5 text-yellow-200 fill-yellow-300 absolute top-1 right-1" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border border-slate-300 shadow-xs flex items-center justify-center text-slate-700 group-hover:text-red-600">
              <Pencil className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          </div>

          {/* Sửa Logo Button */}
          <button
            type="button"
            onClick={handleLogoClick}
            title="Thay đổi logo chính của ứng dụng"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
          >
            <Pencil className="w-3.5 h-3.5 text-amber-700 stroke-[2.5]" />
            <span className="hidden sm:inline">Sửa Logo</span>
          </button>

          {/* Hidden File Input for Logo */}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleLogoChange}
            className="hidden"
          />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-sm sm:text-base leading-tight tracking-tight">
                {config.tenLop} - SỔ TAY THI ĐUA
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800">
                Tuần {config.tuanHienTai}
              </span>
            </div>
            <p className="text-[11px] text-slate-700 hidden sm:block">
              GVCN: <span className="text-red-600 font-bold">{config.giaoVienChuNhiem}</span> · {config.hocKy} ({config.nienKhoa})
            </p>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Background Music Player (Tải nhạc nền, Play/Pause, Âm lượng) */}
        <BackgroundMusicPlayer />

        {/* Quick Scoring Button - Prominent CTA */}
        <button
          onClick={() => setIsQuickScoringOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-95 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-red-200 transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span className="hidden xs:inline">Chấm Điểm</span>
          <span className="xs:hidden">Chấm</span>
        </button>

        {/* Sync Google Sheets button */}
        <button
          onClick={() => syncWithGoogleSheets()}
          disabled={isSyncing}
          title={
            config.gasApiUrl
              ? `Đồng bộ Google Sheets (Lần cuối: ${lastSyncTime || 'Chưa sync'})`
              : 'Chưa cấu hình Google Apps Script URL (Bấm để xem hướng dẫn)'
          }
          className={`flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium border transition-colors ${
            config.gasApiUrl
              ? 'border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
          <span className="hidden md:inline">
            {isSyncing ? 'Đang sync...' : config.gasApiUrl ? 'Đồng bộ Sheets' : 'Kết nối Sheets'}
          </span>
          {config.gasApiUrl && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
          )}
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleMute}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
        </button>

        {/* User Account / Role Dropdown */}
        <div className="relative">
          {currentUser ? (
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block leading-tight pr-1">
                <div className={`text-xs ${currentUser.name.includes('Lê Thị Dung') ? 'text-red-600 font-bold' : 'font-semibold text-slate-800'} line-clamp-1`}>
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-700">{currentUser.roleTitle}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold"
            >
              Đăng nhập
            </button>
          )}

          {/* User Menu Dropdown */}
          {isUserMenuOpen && currentUser && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <div className={`text-xs ${currentUser.name.includes('Lê Thị Dung') ? 'text-red-600 font-bold' : 'font-semibold text-slate-900'}`}>
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  {currentUser.roleTitle}
                </div>
              </div>

              <div className="text-[11px] font-semibold text-slate-700 px-3 py-1 uppercase tracking-wider">
                Chuyển vai trò nhanh
              </div>
              <div className="space-y-0.5">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setIsUserMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors text-left ${
                      currentUser.id === u.id
                        ? 'bg-red-50 text-red-700 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{u.name}</span>
                    <span className="text-[10px] text-slate-600">{u.roleTitle}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 mt-2 pt-1">
                <button
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
