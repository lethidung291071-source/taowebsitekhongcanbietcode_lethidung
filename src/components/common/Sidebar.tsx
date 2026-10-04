import React from 'react';
import { useEmulation } from '../../context/EmulationContext';
import {
  LayoutDashboard,
  Trophy,
  Zap,
  Users,
  CheckSquare,
  History,
  FileBarChart,
  Settings,
  Shield,
  Layers,
} from 'lucide-react';

export type TabKey =
  | 'dashboard'
  | 'leaderboard'
  | 'quick-score'
  | 'students'
  | 'teams'
  | 'criteria'
  | 'logs'
  | 'report'
  | 'settings';

interface SidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
}) => {
  const { students, criteria, logs, currentUser, setIsQuickScoringOpen } = useEmulation();

  const navItems = [
    {
      id: 'dashboard' as TabKey,
      label: 'Tổng quan',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'leaderboard' as TabKey,
      label: 'Bảng Xếp Hạng',
      icon: Trophy,
      badge: 'HOT',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'quick-score' as TabKey,
      label: 'Chấm Điểm Nhanh',
      icon: Zap,
      badge: '⚡',
      badgeColor: 'bg-red-100 text-red-700',
    },
    {
      id: 'teams' as TabKey,
      label: 'Thi Đua 4 Tổ',
      icon: Layers,
      badge: '4 Tổ',
    },
    {
      id: 'students' as TabKey,
      label: 'Danh Sách Học Sinh',
      icon: Users,
      badge: students.length.toString(),
    },
    {
      id: 'criteria' as TabKey,
      label: 'Tiêu Chí Thi Đua',
      icon: CheckSquare,
      badge: criteria.length.toString(),
    },
    {
      id: 'logs' as TabKey,
      label: 'Lịch Sử Chấm Điểm',
      icon: History,
      badge: logs.length.toString(),
    },
    {
      id: 'report' as TabKey,
      label: 'Báo Cáo Sinh Hoạt',
      icon: FileBarChart,
      badge: 'Thứ 6',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'settings' as TabKey,
      label: 'Cài Đặt & Sheets',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } border-r border-slate-800 shadow-xl lg:shadow-none`}
      >
        {/* Brand Banner */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 via-rose-600 to-amber-500 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-red-900/40">
              3/3
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                SỔ TAY THI ĐUA
              </div>
              <div className="text-[11px] text-red-400 font-semibold uppercase tracking-wider">
                Lớp 3/3 · 2026-2027
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
          <div className="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
            Quản trị & Thi đua
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'quick-score') {
                    setIsQuickScoringOpen(true);
                  }
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      item.badgeColor || (isActive ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Current User Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-xs ${currentUser?.name.includes('Lê Thị Dung') ? 'text-red-400 font-extrabold' : 'font-bold text-slate-200'} truncate`}>
                {currentUser?.name || 'Chưa đăng nhập'}
              </div>
              <div className="text-[10px] text-amber-400 font-medium truncate">
                {currentUser?.roleTitle || 'Khách truy cập'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
