export type Role = 'teacher' | 'monitor' | 'red_flag' | 'team_leader';

export interface User {
  id: string;
  name: string;
  role: Role;
  roleTitle: string;
  teamId?: number;
}

export interface Student {
  maHS: string;
  hoTen: string;
  to: number; // 1, 2, 3, 4
  tongDiem: number;
  diemTuanTruoc?: number;
  chucVu: string; // "Lớp trưởng", "Tổ trưởng", "Cờ đỏ", "Học sinh"
  avatar?: string;
  gioiTinh: 'nam' | 'nu';
}

export type CriteriaType = 'plus' | 'minus';

export interface Criteria {
  maTieuChi: string;
  tenTieuChi: string;
  loai: CriteriaType; // 'plus' | 'minus'
  diem: number; // Positive number (e.g. 5, 10)
  nhom: 'Học tập' | 'Nề nếp' | 'Kỷ luật' | 'Vệ sinh' | 'Hoạt động phong trào';
  bieuTuong?: string;
}

export interface EmulationLog {
  id: string;
  thoiGian: string; // ISO string
  nguoiCham: string;
  maHS: string;
  tenHocSinh: string;
  to: number;
  maTieuChi: string;
  tenTieuChi: string;
  loai: CriteriaType;
  diemThayDoi: number; // Signed number: +5, -10, etc.
  ghiChu?: string;
  daHuy?: boolean; // For revert
  ngayHuy?: string;
  nguoiHuy?: string;
}

export interface TeamStats {
  to: number;
  tenTo: string;
  tongDiem: number;
  diemTrungBinh: number;
  soThanhVien: number;
  toTruong: string;
  hang: number;
  danhHieu: string;
}

export interface ClassConfig {
  tenLop: string;
  nienKhoa: string;
  giaoVienChuNhiem: string;
  lopTruong: string;
  hocKy: string;
  tuanHienTai: number;
  diemKhoiDauTuan: number;
  gasApiUrl: string; // Google Apps Script Web App URL
  sheetId: string;
  autoSync: boolean;
  appLogo?: string; // Base64 or image URL
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}
