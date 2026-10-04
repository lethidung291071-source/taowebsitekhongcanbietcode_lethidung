import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Student,
  Criteria,
  EmulationLog,
  ClassConfig,
  User,
  TeamStats,
  ToastMessage,
  Role,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_CRITERIA,
  INITIAL_LOGS,
  INITIAL_CONFIG,
  INITIAL_USERS,
} from '../data/initialData';
import { soundService } from '../services/soundService';
import { GoogleSheetsService } from '../services/googleSheetsService';

interface EmulationContextType {
  // Auth
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (role: Role, password?: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  users: User[];

  // Data
  students: Student[];
  criteria: Criteria[];
  logs: EmulationLog[];
  config: ClassConfig;
  teamStats: TeamStats[];

  // Actions
  addScore: (maHS: string, maTieuChi: string, ghiChu?: string) => Promise<{ success: boolean; message: string }>;
  revertLog: (logId: string) => Promise<{ success: boolean; message: string }>;
  addCriteria: (criteria: Omit<Criteria, 'maTieuChi'>) => Promise<boolean>;
  updateCriteria: (criteria: Criteria) => void;
  deleteCriteria: (maTieuChi: string) => void;
  addStudent: (student: Omit<Student, 'tongDiem'> & { tongDiem?: number }) => void;
  updateStudent: (student: Student) => void;
  updateStudentAvatar: (maHS: string, avatarBase64: string) => void;
  deleteStudent: (maHS: string) => void;
  importStudents: (newStudents: Student[]) => void;
  updateConfig: (newConfig: Partial<ClassConfig>) => void;
  updateAppLogo: (logoBase64: string) => void;
  closeWeekAndReset: (newStartingScore: number) => void;

  // Google Sheets Sync
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncError: string | null;
  syncWithGoogleSheets: (explicitUrl?: string) => Promise<{ success: boolean; message: string }>;
  pushAllToGoogleSheets: (explicitUrl?: string) => Promise<{ success: boolean; message: string }>;

  // Toasts & UI
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  triggerConfetti: () => void;
  isMuted: boolean;
  toggleMute: () => void;

  // Selected state for Modals
  selectedStudentForDetail: Student | null;
  setSelectedStudentForDetail: (student: Student | null) => void;
  isQuickScoringOpen: boolean;
  setIsQuickScoringOpen: (open: boolean) => void;
  quickScoringPreselectedMaHS: string | null;
  setQuickScoringPreselectedMaHS: (maHS: string | null) => void;
}

const EmulationContext = createContext<EmulationContextType | undefined>(undefined);

const STORAGE_KEYS = {
  STUDENTS: 'sotay3_3_students_v2',
  CRITERIA: 'sotay3_3_criteria_v1',
  LOGS: 'sotay3_3_logs_v2',
  CONFIG: 'sotay3_3_config_v2',
  AUTH_USER: 'sotay3_3_auth_user_v2',
  LAST_SYNC: 'sotay3_3_last_sync_v1',
};

export const EmulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State from LocalStorage or Defaults
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 35 && parsed[0]?.hoTen === 'Trần Bảo An') {
          return parsed;
        }
      }
      return INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [criteria, setCriteria] = useState<Criteria[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CRITERIA);
      return saved ? JSON.parse(saved) : INITIAL_CRITERIA;
    } catch {
      return INITIAL_CRITERIA;
    }
  });

  const [logs, setLogs] = useState<EmulationLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  const [config, setConfig] = useState<ClassConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_CONFIG,
          ...parsed,
          tenLop: 'Lớp 3/3',
          tuanHienTai: parsed.tuanHienTai || 4,
          lopTruong: 'Trần Bảo An',
          giaoVienChuNhiem: 'Cô Lê Thị Dung',
        };
      }
      return INITIAL_CONFIG;
    } catch {
      return INITIAL_CONFIG;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (saved) return JSON.parse(saved);
      // Default auto-login as GVCN for instant frictionless usage
      return INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => currentUser !== null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  });
  const [syncError, setSyncError] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundService.getIsMuted());

  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [isQuickScoringOpen, setIsQuickScoringOpen] = useState<boolean>(false);
  const [quickScoringPreselectedMaHS, setQuickScoringPreselectedMaHS] = useState<string | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(criteria));
  }, [criteria]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(currentUser));
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      setIsLoggedIn(false);
    }
  }, [currentUser]);

  // Toast helper
  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, type, title, message, duration: 4000 }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#DC2626', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
      });
    } catch (e) {
      console.warn('Confetti error', e);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const next = soundService.toggleMute();
    setIsMuted(next);
    addToast('info', 'Âm thanh', next ? 'Đã tắt âm thanh' : 'Đã bật âm thanh hiệu ứng');
  }, [addToast]);

  // Calculate Team stats dynamically
  const teamStats: TeamStats[] = useMemo(() => {
    const teams = [1, 2, 3, 4].map((toNum) => {
      const teamStudents = students.filter((s) => s.to === toNum);
      const totalScore = teamStudents.reduce((sum, s) => sum + s.tongDiem, 0);
      const count = teamStudents.length || 1;
      const avgScore = Math.round((totalScore / count) * 10) / 10;
      const leader = teamStudents.find((s) => s.chucVu.includes('Tổ trưởng'))?.hoTen || 'Chưa phân công';

      return {
        to: toNum,
        tenTo: `Tổ ${toNum}`,
        tongDiem: totalScore,
        diemTrungBinh: avgScore,
        soThanhVien: teamStudents.length,
        toTruong: leader,
        hang: 1, // calculated below
        danhHieu: '',
      };
    });

    // Rank teams by total score descending
    const sorted = [...teams].sort((a, b) => b.tongDiem - a.tongDiem);
    sorted.forEach((team, idx) => {
      team.hang = idx + 1;
      if (idx === 0) team.danhHieu = 'Tổ Xuất Sắc Nhất 👑';
      else if (idx === 1) team.danhHieu = 'Bám Đuổi Quyết Liệt 🥈';
      else if (idx === 2) team.danhHieu = 'Cần Bứt Phá 🥉';
      else team.danhHieu = 'Cần Cố Gắng Hơn 💪';
    });

    // Return in order 1, 2, 3, 4
    return teams;
  }, [students]);

  // Auth functions
  const login = useCallback((role: Role, password?: string): boolean => {
    // In demo / production class setting, allow quick teacher / monitor / red flag / team leader login
    // Teacher default password is '6b1' or 'gvcn123', others can login with role
    const matchedUser = INITIAL_USERS.find((u) => u.role === role);
    if (!matchedUser) {
      addToast('error', 'Lỗi đăng nhập', 'Không tìm thấy vai trò phù hợp');
      return false;
    }

    if (role === 'teacher' && password && password !== '6b1' && password !== 'gvcn' && password !== '123456') {
      addToast('error', 'Sai mật khẩu', 'Mật khẩu Giáo viên không chính xác (Thử: 6b1)');
      return false;
    }

    setCurrentUser(matchedUser);
    setIsLoggedIn(true);
    soundService.playClick();
    addToast('success', 'Đăng nhập thành công', `Chào mừng ${matchedUser.roleTitle} - ${matchedUser.name}`);
    return true;
  }, [addToast]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    addToast('info', 'Đăng xuất', 'Đã rời khỏi phiên làm việc');
  }, [addToast]);

  const switchUser = useCallback((userId: string) => {
    const user = INITIAL_USERS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      soundService.playClick();
      addToast('info', 'Chuyển vai trò', `Đang thao tác với quyền: ${user.roleTitle} (${user.name})`);
    }
  }, [addToast]);

  // Chấm điểm nhanh (Core scoring function)
  const addScore = useCallback(
    async (maHS: string, maTieuChi: string, ghiChu?: string): Promise<{ success: boolean; message: string }> => {
      const student = students.find((s) => s.maHS === maHS);
      const crit = criteria.find((c) => c.maTieuChi === maTieuChi);

      if (!student) {
        addToast('error', 'Lỗi chấm điểm', 'Không tìm thấy học sinh');
        return { success: false, message: 'Không tìm thấy học sinh' };
      }
      if (!crit) {
        addToast('error', 'Lỗi chấm điểm', 'Không tìm thấy tiêu chí');
        return { success: false, message: 'Không tìm thấy tiêu chí' };
      }

      const scoreChange = crit.loai === 'plus' ? crit.diem : -crit.diem;
      const previousScore = student.tongDiem;
      const newScore = previousScore + scoreChange;

      // Create new Log
      const newLog: EmulationLog = {
        id: 'LOG-' + Date.now(),
        thoiGian: new Date().toISOString(),
        nguoiCham: currentUser ? `${currentUser.name} (${currentUser.roleTitle})` : 'Giáo viên',
        maHS: student.maHS,
        tenHocSinh: student.hoTen,
        to: student.to,
        maTieuChi: crit.maTieuChi,
        tenTieuChi: crit.tenTieuChi,
        loai: crit.loai,
        diemThayDoi: scoreChange,
        ghiChu: ghiChu || '',
        daHuy: false,
      };

      // 1. Update State immediately for instant snappy UI
      setStudents((prev) =>
        prev.map((s) => (s.maHS === maHS ? { ...s, tongDiem: newScore } : s))
      );
      setLogs((prev) => [newLog, ...prev]);

      // 2. Play sound effects
      if (crit.loai === 'plus') {
        soundService.playPositive();
        if (newScore >= 120 || (newScore >= 100 && previousScore < 100)) {
          triggerConfetti();
          soundService.playFanfare();
        }
      } else {
        soundService.playPenalty();
      }

      const toastMessage =
        crit.loai === 'plus'
          ? `Đã cộng ${crit.diem} điểm cho học sinh ${student.hoTen} (${crit.tenTieuChi})`
          : `Đã trừ ${crit.diem} điểm của học sinh ${student.hoTen} (${crit.tenTieuChi})`;

      addToast(crit.loai === 'plus' ? 'success' : 'warning', 'Chấm điểm thành công', toastMessage);

      // 3. Post to Google Sheets if configured
      if (config.gasApiUrl && config.gasApiUrl.trim()) {
        setIsSyncing(true);
        try {
          const res = await GoogleSheetsService.postScoreUpdate(config.gasApiUrl, newLog);
          if (res.success) {
            setLastSyncTime(new Date().toLocaleTimeString('vi-VN'));
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toLocaleTimeString('vi-VN'));
          } else {
            setSyncError(res.error || 'Lỗi ghi Sheets');
            addToast('warning', 'Google Sheets', 'Đã lưu cục bộ. Đồng bộ Sheets gặp trục trặc: ' + (res.error || ''));
          }
        } catch (e: unknown) {
          console.warn('GAS POST error', e);
        } finally {
          setIsSyncing(false);
        }
      }

      return { success: true, message: toastMessage };
    },
    [students, criteria, currentUser, config.gasApiUrl, addToast, triggerConfetti]
  );

  // Hoàn tác (Revert log)
  const revertLog = useCallback(
    async (logId: string): Promise<{ success: boolean; message: string }> => {
      const targetLog = logs.find((l) => l.id === logId);
      if (!targetLog) {
        addToast('error', 'Lỗi hoàn tác', 'Không tìm thấy nhật ký chấm điểm');
        return { success: false, message: 'Không tìm thấy nhật ký' };
      }
      if (targetLog.daHuy) {
        addToast('warning', 'Lưu ý', 'Thao tác này đã được hoàn tác trước đó');
        return { success: false, message: 'Đã hoàn tác trước đó' };
      }

      // Restore student score
      const diffToRestore = -targetLog.diemThayDoi; // if was +5, now subtract 5. If was -5, add 5.
      setStudents((prev) =>
        prev.map((s) => (s.maHS === targetLog.maHS ? { ...s, tongDiem: s.tongDiem + diffToRestore } : s))
      );

      // Mark log as cancelled
      setLogs((prev) =>
        prev.map((l) =>
          l.id === logId
            ? {
                ...l,
                daHuy: true,
                ngayHuy: new Date().toISOString(),
                nguoiHuy: currentUser ? `${currentUser.name} (${currentUser.roleTitle})` : 'Giáo viên',
              }
            : l
        )
      );

      soundService.playClick();
      const msg = `Đã hoàn tác thao tác "${targetLog.tenTieuChi}" (${targetLog.diemThayDoi > 0 ? '+' : ''}${targetLog.diemThayDoi} đ) của học sinh ${targetLog.tenHocSinh}`;
      addToast('success', 'Hoàn tác thành công', msg);

      // Sync revert with Google Sheets if configured
      if (config.gasApiUrl && config.gasApiUrl.trim()) {
        setIsSyncing(true);
        try {
          const res = await GoogleSheetsService.revertScore(config.gasApiUrl, logId);
          if (res.success) {
            setLastSyncTime(new Date().toLocaleTimeString('vi-VN'));
          }
        } catch (e: unknown) {
          console.warn('Revert Sheets error', e);
        } finally {
          setIsSyncing(false);
        }
      }

      return { success: true, message: msg };
    },
    [logs, currentUser, config.gasApiUrl, addToast]
  );

  // Criteria Management
  const addCriteria = useCallback(
    async (critData: Omit<Criteria, 'maTieuChi'>): Promise<boolean> => {
      const newMa = 'TC-' + (critData.loai === 'plus' ? 'PLUS-' : 'MINUS-') + Date.now().toString().slice(-4);
      const newCrit: Criteria = {
        ...critData,
        maTieuChi: newMa,
      };

      setCriteria((prev) => [...prev, newCrit]);
      soundService.playPositive();
      addToast('success', 'Đã thêm tiêu chí mới', `"${newCrit.tenTieuChi}" (${newCrit.loai === 'plus' ? '+' : '-'}${newCrit.diem} điểm)`);

      // Sync to Google Sheets if configured
      if (config.gasApiUrl && config.gasApiUrl.trim()) {
        GoogleSheetsService.addCriteriaToSheets(config.gasApiUrl, newCrit).catch(console.warn);
      }
      return true;
    },
    [config.gasApiUrl, addToast]
  );

  const updateCriteria = useCallback((crit: Criteria) => {
    setCriteria((prev) => prev.map((c) => (c.maTieuChi === crit.maTieuChi ? crit : c)));
    addToast('success', 'Cập nhật tiêu chí', `Đã cập nhật: ${crit.tenTieuChi}`);
  }, [addToast]);

  const deleteCriteria = useCallback((maTieuChi: string) => {
    setCriteria((prev) => prev.filter((c) => c.maTieuChi !== maTieuChi));
    addToast('info', 'Xóa tiêu chí', 'Đã xóa tiêu chí khỏi danh mục');
  }, [addToast]);

  // Student Management
  const addStudent = useCallback((data: Omit<Student, 'tongDiem'> & { tongDiem?: number }) => {
    const newStu: Student = {
      ...data,
      tongDiem: data.tongDiem !== undefined ? data.tongDiem : 100,
      diemTuanTruoc: 100,
    };
    setStudents((prev) => [...prev, newStu]);
    addToast('success', 'Thêm học sinh', `Đã thêm học sinh ${newStu.hoTen} vào Tổ ${newStu.to}`);
  }, [addToast]);

  const updateStudent = useCallback((stu: Student) => {
    setStudents((prev) => prev.map((s) => (s.maHS === stu.maHS ? stu : s)));
    addToast('success', 'Cập nhật', `Đã cập nhật thông tin học sinh ${stu.hoTen}`);
  }, [addToast]);

  const updateStudentAvatar = useCallback((maHS: string, avatarBase64: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.maHS === maHS ? { ...s, avatar: avatarBase64 } : s))
    );
    setSelectedStudentForDetail((prev) =>
      prev && prev.maHS === maHS ? { ...prev, avatar: avatarBase64 } : prev
    );
    addToast('success', 'Đổi ảnh đại diện', 'Đã cập nhật ảnh đại diện học sinh thành công!');
  }, [addToast]);

  const deleteStudent = useCallback((maHS: string) => {
    setStudents((prev) => prev.filter((s) => s.maHS !== maHS));
    addToast('info', 'Xóa học sinh', `Đã xóa học sinh khỏi danh sách lớp`);
  }, [addToast]);

  const importStudents = useCallback((newStudents: Student[]) => {
    if (!newStudents || newStudents.length === 0) return;
    setStudents(newStudents);
    addToast('success', 'Import danh sách', `Đã nạp thành công ${newStudents.length} học sinh vào hệ thống`);
  }, [addToast]);

  // Class config & week closure
  const updateConfig = useCallback((newConf: Partial<ClassConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConf }));
    addToast('success', 'Cài đặt', 'Đã lưu cấu hình lớp học');
  }, [addToast]);

  const updateAppLogo = useCallback((logoBase64: string) => {
    setConfig((prev) => ({ ...prev, appLogo: logoBase64 }));
    addToast('success', 'Đổi Logo ứng dụng', 'Đã cập nhật logo chính của ứng dụng!');
  }, [addToast]);

  const closeWeekAndReset = useCallback((newStartingScore: number) => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        diemTuanTruoc: s.tongDiem,
        tongDiem: newStartingScore,
      }))
    );
    setConfig((prev) => ({
      ...prev,
      tuanHienTai: prev.tuanHienTai + 1,
      diemKhoiDauTuan: newStartingScore,
    }));
    soundService.playFanfare();
    triggerConfetti();
    addToast(
      'success',
      'Chốt điểm thành công!',
      `Đã chuyển sang Tuần ${config.tuanHienTai + 1}. Điểm thi đua của cả lớp đã được khởi tạo về ${newStartingScore} điểm.`
    );
  }, [config.tuanHienTai, addToast, triggerConfetti]);

  // Sync from Google Sheets (GET)
  const syncWithGoogleSheets = useCallback(
    async (explicitUrl?: string): Promise<{ success: boolean; message: string }> => {
      const urlToUse = explicitUrl || config.gasApiUrl;
      if (!urlToUse || !urlToUse.trim()) {
        const msg = 'Chưa thiết lập URL Google Apps Script. Vui lòng vào Cài đặt để nhập URL!';
        addToast('warning', 'Chưa kết nối Sheets', msg);
        return { success: false, message: msg };
      }

      setIsSyncing(true);
      setSyncError(null);
      try {
        const res = await GoogleSheetsService.fetchAllData(urlToUse);
        if (res.success && res.data) {
          const { students: sData, criteria: cData, logs: lData, config: confData } = res.data;
          if (sData && sData.length > 0) setStudents(sData);
          if (cData && cData.length > 0) setCriteria(cData);
          if (lData && lData.length > 0) setLogs(lData);
          if (confData) setConfig((prev) => ({ ...prev, ...confData }));

          const nowStr = new Date().toLocaleTimeString('vi-VN');
          setLastSyncTime(nowStr);
          localStorage.setItem(STORAGE_KEYS.LAST_SYNC, nowStr);
          addToast('success', 'Đồng bộ Sheets', 'Đã tải dữ liệu mới nhất từ Google Sheets thành công!');
          return { success: true, message: 'Đồng bộ thành công!' };
        } else {
          const errMsg = res.error || 'Dữ liệu không đúng định dạng';
          setSyncError(errMsg);
          addToast('error', 'Lỗi đồng bộ', errMsg);
          return { success: false, message: errMsg };
        }
      } catch (err: unknown) {
        const errMsg = (err as Error)?.message || 'Lỗi mạng khi tải từ Sheets';
        setSyncError(errMsg);
        addToast('error', 'Lỗi kết nối', errMsg);
        return { success: false, message: errMsg };
      } finally {
        setIsSyncing(false);
      }
    },
    [config.gasApiUrl, addToast]
  );

  // Push current Web data to seed Google Sheets (POST seedAllData)
  const pushAllToGoogleSheets = useCallback(
    async (explicitUrl?: string): Promise<{ success: boolean; message: string }> => {
      const urlToUse = explicitUrl || config.gasApiUrl;
      if (!urlToUse || !urlToUse.trim()) {
        const msg = 'Vui lòng nhập URL Google Apps Script trước khi khởi tạo!';
        addToast('warning', 'Chưa có URL', msg);
        return { success: false, message: msg };
      }

      setIsSyncing(true);
      setSyncError(null);
      try {
        const res = await GoogleSheetsService.seedAllDataToSheets(urlToUse, {
          students,
          criteria,
          logs,
          config,
        });

        if (res.success) {
          const nowStr = new Date().toLocaleTimeString('vi-VN');
          setLastSyncTime(nowStr);
          localStorage.setItem(STORAGE_KEYS.LAST_SYNC, nowStr);
          addToast('success', 'Đẩy dữ liệu thành công', 'Toàn bộ danh sách 42 học sinh và tiêu chí đã được lưu lên Google Sheets!');
          return { success: true, message: 'Khởi tạo Google Sheets thành công!' };
        } else {
          setSyncError(res.error || 'Lỗi gửi dữ liệu');
          addToast('error', 'Lỗi khởi tạo Sheets', res.error || 'Không thể ghi vào Google Sheets');
          return { success: false, message: res.error || 'Lỗi gửi dữ liệu' };
        }
      } catch (err: unknown) {
        const errMsg = (err as Error)?.message || 'Lỗi mạng';
        setSyncError(errMsg);
        addToast('error', 'Lỗi mạng', errMsg);
        return { success: false, message: errMsg };
      } finally {
        setIsSyncing(false);
      }
    },
    [config, students, criteria, logs, addToast]
  );

  const value = {
    currentUser,
    isLoggedIn,
    login,
    logout,
    switchUser,
    users: INITIAL_USERS,
    students,
    criteria,
    logs,
    config,
    teamStats,
    addScore,
    revertLog,
    addCriteria,
    updateCriteria,
    deleteCriteria,
    addStudent,
    updateStudent,
    updateStudentAvatar,
    deleteStudent,
    importStudents,
    updateConfig,
    updateAppLogo,
    closeWeekAndReset,
    isSyncing,
    lastSyncTime,
    syncError,
    syncWithGoogleSheets,
    pushAllToGoogleSheets,
    toasts,
    addToast,
    removeToast,
    triggerConfetti,
    isMuted,
    toggleMute,
    selectedStudentForDetail,
    setSelectedStudentForDetail,
    isQuickScoringOpen,
    setIsQuickScoringOpen,
    quickScoringPreselectedMaHS,
    setQuickScoringPreselectedMaHS,
  };

  return <EmulationContext.Provider value={value}>{children}</EmulationContext.Provider>;
};

export const useEmulation = () => {
  const context = useContext(EmulationContext);
  if (!context) {
    throw new Error('useEmulation must be used within an EmulationProvider');
  }
  return context;
};
