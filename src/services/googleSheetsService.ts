import { Student, Criteria, EmulationLog, ClassConfig } from '../types';

export interface GasApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface FullSheetData {
  students: Student[];
  criteria: Criteria[];
  logs: EmulationLog[];
  config: Partial<ClassConfig>;
}

/**
 * Service to communicate with Google Sheets through Google Apps Script Web App
 */
export class GoogleSheetsService {
  /**
   * Complete Google Apps Script template code that runs in Google Sheets
   */
  public static getGoogleAppsScriptTemplate(): string {
    return `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT CHO WEB APP SỔ TAY THI ĐUA LỚP 3/3
 * Tên File Google Sheets: DU_LIEU_THI_DUA_3_3
 * =========================================================================
 * 
 * HƯỚNG DẪN CÀI ĐẶT:
 * 1. Mở Google Sheet: Tạo 1 file mới đặt tên "DU_LIEU_THI_DUA_3_3"
 * 2. Mở Tiện ích mở rộng -> Apps Script (Extensions -> Apps Script)
 * 3. Xoá hết mã cũ, dán toàn bộ đoạn mã này vào.
 * 4. Nhấn "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment)
 * 5. Chọn loại: "Ứng dụng web" (Web app)
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)
 * 6. Nhấn "Triển khai" và Cấp quyền truy cập (Authorize access).
 * 7. Sao chép URL Ứng dụng Web (Web app URL) và dán vào phần "Cài đặt" trên Web App.
 */

const SHEET_NAMES = {
  STUDENTS: 'DANH_SACH_HOC_SINH',
  CRITERIA: 'DANH_MUC_THI_DUA',
  LOGS: 'LICH_SU_CHAM_DIEM',
  CONFIG: 'CAU_HINH'
};

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getAllData';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initializeSheetsIfMissing(ss);

    if (action === 'getAllData') {
      const data = {
        students: getStudentsData(ss),
        criteria: getCriteriaData(ss),
        logs: getLogsData(ss),
        config: getConfigData(ss)
      };
      return createJsonResponse({ success: true, data: data });
    }

    if (action === 'ping') {
      return createJsonResponse({ success: true, message: 'Google Apps Script kết nối thành công!' });
    }

    return createJsonResponse({ success: false, error: 'Hành động không hợp lệ: ' + action });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initializeSheetsIfMissing(ss);
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    const action = payload.action;

    // 1. Chấm điểm học sinh (Ghi log + Cập nhật điểm học sinh)
    if (action === 'addScore') {
      const log = payload.log;
      if (!log || !log.maHS || log.diemThayDoi === undefined) {
        return createJsonResponse({ success: false, error: 'Thiếu thông tin chấm điểm' });
      }
      
      // Ghi vào sheet LOGS
      const logsSheet = ss.getSheetByName(SHEET_NAMES.LOGS);
      logsSheet.appendRow([
        log.id || ('LOG-' + new Date().getTime()),
        log.thoiGian || new Date().toISOString(),
        log.nguoiCham || 'Giáo viên',
        log.maHS,
        log.tenHocSinh || '',
        log.to || 1,
        log.maTieuChi || '',
        log.tenTieuChi || '',
        log.loai || (log.diemThayDoi >= 0 ? 'plus' : 'minus'),
        Number(log.diemThayDoi),
        log.ghiChu || '',
        false // DaHuy
      ]);

      // Cập nhật điểm trong sheet DANH_SACH_HOC_SINH
      const stuSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
      const stuData = stuSheet.getDataRange().getValues();
      let updatedNewScore = null;

      for (let i = 1; i < stuData.length; i++) {
        if (stuData[i][0] == log.maHS) {
          const currentScore = Number(stuData[i][3]) || 0;
          const newScore = currentScore + Number(log.diemThayDoi);
          stuSheet.getRange(i + 1, 4).setValue(newScore);
          updatedNewScore = newScore;
          break;
        }
      }

      return createJsonResponse({ 
        success: true, 
        message: 'Đã lưu điểm thành công trên Google Sheets', 
        updatedScore: updatedNewScore 
      });
    }

    // 2. Hoàn tác (Revert) thao tác chấm điểm
    if (action === 'revertScore') {
      const logId = payload.logId;
      const logsSheet = ss.getSheetByName(SHEET_NAMES.LOGS);
      const logData = logsSheet.getDataRange().getValues();
      let found = false;
      let targetMaHS = null;
      let targetDiem = 0;

      for (let i = 1; i < logData.length; i++) {
        if (logData[i][0] == logId) {
          if (logData[i][11] === true) {
            return createJsonResponse({ success: false, error: 'Thao tác này đã được hoàn tác trước đó!' });
          }
          logsSheet.getRange(i + 1, 12).setValue(true); // Đánh dấu DaHuy = true
          targetMaHS = logData[i][3];
          targetDiem = Number(logData[i][9]);
          found = true;
          break;
        }
      }

      if (!found) {
        return createJsonResponse({ success: false, error: 'Không tìm thấy mã log: ' + logId });
      }

      // Khôi phục điểm học sinh: trừ đi targetDiem (nếu trước đó +5 thì giờ -5, nếu -5 thì +5)
      const stuSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
      const stuData = stuSheet.getDataRange().getValues();
      let restoredScore = null;

      for (let i = 1; i < stuData.length; i++) {
        if (stuData[i][0] == targetMaHS) {
          const currentScore = Number(stuData[i][3]) || 0;
          restoredScore = currentScore - targetDiem;
          stuSheet.getRange(i + 1, 4).setValue(restoredScore);
          break;
        }
      }

      return createJsonResponse({ 
        success: true, 
        message: 'Đã hoàn tác và khôi phục điểm học sinh trên Google Sheets', 
        restoredScore: restoredScore 
      });
    }

    // 3. Khởi tạo toàn bộ dữ liệu ban đầu từ Web lên Google Sheets
    if (action === 'seedAllData') {
      const { students, criteria, logs, config } = payload;
      
      // Ghi sinh viên
      if (students && students.length > 0) {
        const stuSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
        stuSheet.clearContents();
        stuSheet.appendRow(['MaHS', 'HoTen', 'To', 'TongDiem', 'ChucVu', 'GioiTinh']);
        students.forEach(function(s) {
          stuSheet.appendRow([s.maHS, s.hoTen, s.to, s.tongDiem, s.chucVu, s.gioiTinh]);
        });
      }

      // Ghi tiêu chí
      if (criteria && criteria.length > 0) {
        const critSheet = ss.getSheetByName(SHEET_NAMES.CRITERIA);
        critSheet.clearContents();
        critSheet.appendRow(['MaTieuChi', 'TenTieuChi', 'Loai', 'Diem', 'Nhom', 'BieuTuong']);
        criteria.forEach(function(c) {
          critSheet.appendRow([c.maTieuChi, c.tenTieuChi, c.loai, c.diem, c.nhom, c.bieuTuong || '']);
        });
      }

      // Ghi logs
      if (logs && logs.length > 0) {
        const logsSheet = ss.getSheetByName(SHEET_NAMES.LOGS);
        logsSheet.clearContents();
        logsSheet.appendRow(['ID', 'ThoiGian', 'NguoiCham', 'MaHS', 'TenHocSinh', 'To', 'MaTieuChi', 'TenTieuChi', 'Loai', 'DiemThayDoi', 'GhiChu', 'DaHuy']);
        logs.forEach(function(l) {
          logsSheet.appendRow([l.id, l.thoiGian, l.nguoiCham, l.maHS, l.tenHocSinh, l.to, l.maTieuChi, l.tenTieuChi, l.loai, l.diemThayDoi, l.ghiChu || '', l.daHuy || false]);
        });
      }

      // Ghi cấu hình
      if (config) {
        const confSheet = ss.getSheetByName(SHEET_NAMES.CONFIG);
        confSheet.clearContents();
        confSheet.appendRow(['Key', 'Value']);
        for (let k in config) {
          confSheet.appendRow([k, config[k]]);
        }
      }

      return createJsonResponse({ success: true, message: 'Đã đồng bộ toàn bộ dữ liệu ban đầu lên Google Sheets thành công!' });
    }

    // 4. Thêm Tiêu chí mới
    if (action === 'addCriteria') {
      const crit = payload.criteria;
      if (!crit || !crit.tenTieuChi) {
        return createJsonResponse({ success: false, error: 'Thiếu thông tin tiêu chí' });
      }
      const critSheet = ss.getSheetByName(SHEET_NAMES.CRITERIA);
      critSheet.appendRow([
        crit.maTieuChi || ('TC-' + new Date().getTime()),
        crit.tenTieuChi,
        crit.loai || 'plus',
        Number(crit.diem) || 5,
        crit.nhom || 'Nề nếp',
        crit.bieuTuong || '⭐'
      ]);
      return createJsonResponse({ success: true, message: 'Đã thêm tiêu chí mới vào Google Sheets' });
    }

    return createJsonResponse({ success: false, error: 'Hành động POST không hợp lệ: ' + action });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function initializeSheetsIfMissing(ss) {
  // Tạo sheet học sinh
  let stuSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
  if (!stuSheet) {
    stuSheet = ss.insertSheet(SHEET_NAMES.STUDENTS);
    stuSheet.appendRow(['MaHS', 'HoTen', 'To', 'TongDiem', 'ChucVu', 'GioiTinh']);
  }

  // Tạo sheet tiêu chí
  let critSheet = ss.getSheetByName(SHEET_NAMES.CRITERIA);
  if (!critSheet) {
    critSheet = ss.insertSheet(SHEET_NAMES.CRITERIA);
    critSheet.appendRow(['MaTieuChi', 'TenTieuChi', 'Loai', 'Diem', 'Nhom', 'BieuTuong']);
  }

  // Tạo sheet lịch sử chấm điểm
  let logsSheet = ss.getSheetByName(SHEET_NAMES.LOGS);
  if (!logsSheet) {
    logsSheet = ss.insertSheet(SHEET_NAMES.LOGS);
    logsSheet.appendRow(['ID', 'ThoiGian', 'NguoiCham', 'MaHS', 'TenHocSinh', 'To', 'MaTieuChi', 'TenTieuChi', 'Loai', 'DiemThayDoi', 'GhiChu', 'DaHuy']);
  }

  // Tạo sheet cấu hình
  let confSheet = ss.getSheetByName(SHEET_NAMES.CONFIG);
  if (!confSheet) {
    confSheet = ss.insertSheet(SHEET_NAMES.CONFIG);
    confSheet.appendRow(['Key', 'Value']);
  }
}

function getStudentsData(ss) {
  const sheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  const list = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;
    list.push({
      maHS: String(r[0]),
      hoTen: String(r[1]),
      to: Number(r[2]) || 1,
      tongDiem: Number(r[3]) || 0,
      chucVu: String(r[4] || 'Học sinh'),
      gioiTinh: (r[5] === 'nu' ? 'nu' : 'nam')
    });
  }
  return list;
}

function getCriteriaData(ss) {
  const sheet = ss.getSheetByName(SHEET_NAMES.CRITERIA);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  const list = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;
    list.push({
      maTieuChi: String(r[0]),
      tenTieuChi: String(r[1]),
      loai: r[2] === 'minus' ? 'minus' : 'plus',
      diem: Number(r[3]) || 5,
      nhom: String(r[4] || 'Nề nếp'),
      bieuTuong: String(r[5] || '⭐')
    });
  }
  return list;
}

function getLogsData(ss) {
  const sheet = ss.getSheetByName(SHEET_NAMES.LOGS);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  const list = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;
    list.push({
      id: String(r[0]),
      thoiGian: r[1] instanceof Date ? r[1].toISOString() : String(r[1]),
      nguoiCham: String(r[2] || 'Giáo viên'),
      maHS: String(r[3]),
      tenHocSinh: String(r[4] || ''),
      to: Number(r[5]) || 1,
      maTieuChi: String(r[6] || ''),
      tenTieuChi: String(r[7] || ''),
      loai: r[8] === 'minus' ? 'minus' : 'plus',
      diemThayDoi: Number(r[9]) || 0,
      ghiChu: String(r[10] || ''),
      daHuy: Boolean(r[11])
    });
  }
  return list;
}

function getConfigData(ss) {
  const sheet = ss.getSheetByName(SHEET_NAMES.CONFIG);
  if (!sheet) return {};
  const rows = sheet.getDataRange().getValues();
  const config = {};
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0]) {
      config[rows[i][0]] = rows[i][1];
    }
  }
  return config;
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
  }

  /**
   * Fetch all data from Google Apps Script endpoint
   */
  public static async fetchAllData(gasUrl: string): Promise<GasApiResponse<FullSheetData>> {
    if (!gasUrl || !gasUrl.trim()) {
      return { success: false, error: 'Chưa cấu hình URL Google Apps Script.' };
    }

    try {
      const response = await fetch(`${gasUrl.trim()}?action=getAllData`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        return { success: false, error: `Lỗi kết nối HTTP ${response.status}: ${response.statusText}` };
      }

      const json = await response.json();
      return json;
    } catch (err: unknown) {
      console.error('Fetch Google Sheets failed:', err);
      return { success: false, error: (err as Error)?.message || 'Lỗi kết nối mạng tới Google Apps Script' };
    }
  }

  /**
   * Post score update to Google Apps Script
   */
  public static async postScoreUpdate(gasUrl: string, log: EmulationLog): Promise<GasApiResponse> {
    if (!gasUrl || !gasUrl.trim()) {
      return { success: false, error: 'Chưa cấu hình URL Google Apps Script.' };
    }

    try {
      const response = await fetch(gasUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'addScore',
          log: log,
        }),
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const json = await response.json();
      return json;
    } catch (err: unknown) {
      console.error('POST Score to Sheets failed:', err);
      return { success: false, error: (err as Error)?.message || 'Không thể ghi vào Google Sheets' };
    }
  }

  /**
   * Revert score on Google Sheets
   */
  public static async revertScore(gasUrl: string, logId: string): Promise<GasApiResponse> {
    if (!gasUrl || !gasUrl.trim()) {
      return { success: false, error: 'Chưa cấu hình URL Google Apps Script.' };
    }

    try {
      const response = await fetch(gasUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'revertScore',
          logId: logId,
        }),
      });

      const json = await response.json();
      return json;
    } catch (err: unknown) {
      console.error('Revert Score on Sheets failed:', err);
      return { success: false, error: (err as Error)?.message || 'Không thể kết nối Google Sheets' };
    }
  }

  /**
   * Push initial data to Google Sheets to seed the sheets
   */
  public static async seedAllDataToSheets(
    gasUrl: string,
    data: { students: Student[]; criteria: Criteria[]; logs: EmulationLog[]; config: ClassConfig }
  ): Promise<GasApiResponse> {
    if (!gasUrl || !gasUrl.trim()) {
      return { success: false, error: 'Chưa cấu hình URL Google Apps Script.' };
    }

    try {
      const response = await fetch(gasUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'seedAllData',
          ...data,
        }),
      });

      const json = await response.json();
      return json;
    } catch (err: unknown) {
      console.error('Seed Sheets failed:', err);
      return { success: false, error: (err as Error)?.message || 'Lỗi gửi dữ liệu lên Google Sheets' };
    }
  }

  /**
   * Add a new criteria to Google Sheets
   */
  public static async addCriteriaToSheets(gasUrl: string, criteria: Criteria): Promise<GasApiResponse> {
    if (!gasUrl || !gasUrl.trim()) {
      return { success: false, error: 'Chưa cấu hình URL Google Apps Script.' };
    }

    try {
      const response = await fetch(gasUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'addCriteria',
          criteria: criteria,
        }),
      });

      const json = await response.json();
      return json;
    } catch (err: unknown) {
      console.error('Add criteria to Sheets failed:', err);
      return { success: false, error: (err as Error)?.message || 'Lỗi gửi dữ liệu lên Google Sheets' };
    }
  }
}
