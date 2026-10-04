import React, { useState } from 'react';
import { X, Youtube, Save, ExternalLink, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface YouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string | null;
  onSave: (embedUrl: string | null, videoId: string | null) => void;
}

// Helper to extract YouTube video ID from various link formats
export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Pattern 1: standard watch url: youtube.com/watch?v=ID
  const watchMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  // Pattern 2: youtube.com/shorts/ID
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([^"&?\/\s]{11})/i);
  if (shortsMatch && shortsMatch[1]) {
    return shortsMatch[1];
  }

  // Pattern 3: direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export const YouTubeModal: React.FC<YouTubeModalProps> = ({
  isOpen,
  onClose,
  initialUrl,
  onSave,
}) => {
  const [inputUrl, setInputUrl] = useState<string>(initialUrl || '');
  const [currentEmbedUrl, setCurrentEmbedUrl] = useState<string | null>(initialUrl || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveAndDisplay = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!inputUrl.trim()) {
      setErrorMsg('Vui lòng nhập hoặc dán đường link video YouTube.');
      return;
    }

    const videoId = extractYouTubeId(inputUrl);
    if (!videoId) {
      setErrorMsg('Đường link YouTube không hợp lệ! Vui lòng dán link dạng: https://www.youtube.com/watch?v=... hoặc https://youtu.be/...');
      return;
    }

    const embed = `https://www.youtube.com/embed/${videoId}`;
    setCurrentEmbedUrl(embed);
    onSave(embed, videoId);
    setSuccessMsg('Đã lưu và nhúng video YouTube thành công!');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleRemoveVideo = () => {
    setInputUrl('');
    setCurrentEmbedUrl(null);
    onSave(null, null);
    setSuccessMsg('Đã gỡ video YouTube.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleApplySample = (sampleUrl: string) => {
    setInputUrl(sampleUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Dark frosted overlay */}
      <div
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-xs">
              <Youtube className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">Cài đặt Video YouTube</h3>
              <p className="text-[11px] text-red-100">
                Nhúng video lớp học, bài hát thiếu nhi hoặc bài giảng vào màn hình đăng nhập
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 active:scale-95 text-white/90 hover:text-white transition-all cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Input field & Actions */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase flex items-center justify-between">
              <span>Đường dẫn (URL) Video YouTube:</span>
              <span className="text-[11px] font-normal text-slate-700">
                (Hỗ trợ watch?v=, youtu.be, shorts...)
              </span>
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveAndDisplay();
                    }
                  }}
                  placeholder="Dán link: https://www.youtube.com/watch?v=..."
                  className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                />
                {inputUrl && (
                  <button
                    type="button"
                    onClick={() => setInputUrl('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveAndDisplay}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-red-500/20 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu & Hiển thị</span>
                </button>

                {currentEmbedUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    title="Gỡ bỏ video này"
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick sample suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-700">Gợi ý mẫu:</span>
              <button
                type="button"
                onClick={() => handleApplySample('https://www.youtube.com/watch?v=kYJybw_Vj1M')}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-medium transition-colors"
              >
                Bài ca Thiếu nhi
              </button>
              <button
                type="button"
                onClick={() => handleApplySample('https://www.youtube.com/watch?v=kJQP7kiw5Fk')}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-medium transition-colors"
              >
                Nhạc Nhẹ Lớp Học
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Video Player Frame */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 aspect-video shadow-inner flex items-center justify-center relative">
            {currentEmbedUrl ? (
              <iframe
                src={currentEmbedUrl}
                title="YouTube Video Player"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="text-center p-6 text-slate-400 space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                  <Youtube className="w-6 h-6" />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-300">
                  Chưa có video nào được chọn
                </div>
                <p className="text-[11px] text-slate-700 max-w-sm mx-auto">
                  Dán đường link YouTube vào ô phía trên rồi bấm &ldquo;Lưu &amp; Hiển thị&rdquo; để xem video trực tiếp tại đây.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700">
          <span>Dữ liệu video được lưu vĩnh viễn và sẵn sàng phát lại.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
