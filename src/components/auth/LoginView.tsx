import React, { useState, useRef, useEffect } from 'react';
import { useEmulation } from '../../context/EmulationContext';
import { Role } from '../../types';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Volume2,
  VolumeX,
  UploadCloud,
  Youtube,
  Music,
  Loader2,
} from 'lucide-react';
import { YouTubeModal } from './YouTubeModal';

interface LoginViewProps {
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { login, users, addToast } = useEmulation();
  const [selectedRole, setSelectedRole] = useState<Role>('teacher');
  const [password, setPassword] = useState('6b1');

  // Background Audio State
  const [audioUrl, setAudioUrl] = useState<string | null>(() => {
    return (
      localStorage.getItem('sotay_bg_music_base64') ||
      localStorage.getItem('sotay_bg_audio') ||
      null
    );
  });
  const [audioName, setAudioName] = useState<string | null>(() => {
    return (
      localStorage.getItem('sotay_bg_music_name') ||
      localStorage.getItem('sotay_bg_audio_name') ||
      null
    );
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  // YouTube Modal State
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState<boolean>(false);
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState<string | null>(() => {
    return localStorage.getItem('sotay_youtube_embed') || null;
  });

  // Fetch initial media config from server on load
  useEffect(() => {
    const fetchMediaConfig = async () => {
      try {
        const res = await fetch('/api/media-config');
        if (res.ok) {
          const data = await res.json();
          if (data.backgroundAudioUrl) {
            setAudioUrl(data.backgroundAudioUrl);
            localStorage.setItem('sotay_bg_audio', data.backgroundAudioUrl);
          }
          if (data.backgroundAudioName) {
            setAudioName(data.backgroundAudioName);
            localStorage.setItem('sotay_bg_audio_name', data.backgroundAudioName);
          }
          if (data.youtubeEmbedUrl) {
            setYoutubeEmbedUrl(data.youtubeEmbedUrl);
            localStorage.setItem('sotay_youtube_embed', data.youtubeEmbedUrl);
          }
        }
      } catch (err) {
        // Fallback to localStorage gracefully
        console.warn('Không thể kết nối API media config, dùng dữ liệu local:', err);
      }
    };

    fetchMediaConfig();
  }, []);

  // Update audio source when audioUrl changes
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);

  // Handle first user interaction to satisfy browser autoplay policy
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && audioUrl && !isPlaying) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay blocked until explicit user click on play button
          });
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
    };
  }, [audioUrl, isPlaying]);

  // Audio Play/Pause Toggle
  const togglePlayMusic = () => {
    if (!audioRef.current) return;

    if (!audioUrl) {
      // Prompt user to upload audio if none exists
      if (audioInputRef.current) {
        audioInputRef.current.click();
      }
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          addToast('info', 'Nhạc nền', 'Đang phát nhạc nền...');
        })
        .catch((err) => {
          console.warn('Lỗi phát âm thanh:', err);
          addToast('error', 'Lỗi phát nhạc', 'Không thể phát file nhạc này.');
        });
    }
  };

  // Upload Music File Handler (Limit 5MB, .mp3 / .wav only)
  const handleUploadMusicClick = () => {
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
      audioInputRef.current.click();
    }
  };

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file format: .mp3 or .wav
    const allowedExtensions = ['.mp3', '.wav'];
    const fileName = file.name.toLowerCase();
    const isAudio =
      allowedExtensions.some((ext) => fileName.endsWith(ext)) ||
      file.type.includes('audio') ||
      file.type.includes('mpeg') ||
      file.type.includes('wav');

    if (!isAudio) {
      addToast(
        'error',
        'Định dạng không hợp lệ',
        'Hệ thống chỉ chấp nhận file âm thanh định dạng .mp3 hoặc .wav!'
      );
      return;
    }

    // Validate size limit: Max 5MB
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE_BYTES) {
      addToast(
        'error',
        'File quá dung lượng',
        'Dung lượng file tối đa là 5MB để tránh làm nặng hệ thống. Vui lòng chọn file nhẹ hơn!'
      );
      return;
    }

    setIsUploadingAudio(true);

    try {
      const formData = new FormData();
      formData.append('audio', file);

      const res = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setAudioUrl(data.url);
        setAudioName(data.filename || file.name);
        localStorage.setItem('sotay_bg_audio', data.url);
        localStorage.setItem('sotay_bg_audio_name', data.filename || file.name);

        addToast(
          'success',
          'Tải nhạc nền thành công',
          `Đã lưu file "${data.filename || file.name}" vào máy chủ!`
        );

        // Auto-play newly uploaded track
        if (audioRef.current) {
          audioRef.current.src = data.url;
          audioRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {});
        }
      } else {
        throw new Error(data.message || 'Lỗi lưu file');
      }
    } catch {
      // Local fallback using object URL or Base64
      const fallbackUrl = URL.createObjectURL(file);
      setAudioUrl(fallbackUrl);
      setAudioName(file.name);
      localStorage.setItem('sotay_bg_audio', fallbackUrl);
      localStorage.setItem('sotay_bg_audio_name', file.name);

      addToast(
        'success',
        'Nhạc nền đã nạp',
        `Đã lưu tạm file "${file.name}" trên trình duyệt!`
      );

      if (audioRef.current) {
        audioRef.current.src = fallbackUrl;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    } finally {
      setIsUploadingAudio(false);
    }
  };

  // YouTube Config Save Handler
  const handleSaveYouTubeConfig = async (embedUrl: string | null, videoId: string | null) => {
    setYoutubeEmbedUrl(embedUrl);
    if (embedUrl) {
      localStorage.setItem('sotay_youtube_embed', embedUrl);
    } else {
      localStorage.removeItem('sotay_youtube_embed');
    }

    try {
      await fetch('/api/youtube-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embedUrl, videoId }),
      });
      addToast('success', 'YouTube', 'Đã lưu cấu hình video YouTube vào hệ thống!');
    } catch (err) {
      console.warn('Lỗi lưu cấu hình YouTube lên server:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(selectedRole, password);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  const handleRoleQuickSelect = (role: Role) => {
    setSelectedRole(role);
    if (role === 'teacher') {
      setPassword('6b1');
    } else {
      setPassword('');
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 relative"
      style={{ backgroundImage: `url('https://i.postimg.cc/8zqzKBbr/nen.png')` }}
    >
      {/* HTML5 Audio Element for Background Music */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Hidden File Input for Audio (.mp3, .wav, max 5MB) */}
      <input
        ref={audioInputRef}
        type="file"
        accept=".mp3, .wav, audio/mpeg, audio/wav, audio/mp3"
        onChange={handleAudioFileChange}
        className="hidden"
      />

      {/* Dark frosted overlay */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[3px] pointer-events-none" />

      {/* Decorative ambient background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Corner Media Controls (Góc trên bên phải màn hình) */}
      <div className="fixed top-4 right-4 z-40 bg-slate-900/80 backdrop-blur-md border border-white/20 text-white rounded-2xl px-3 py-2 flex items-center gap-2 shadow-2xl">
        {/* YouTube Button */}
        <button
          type="button"
          onClick={() => setIsYouTubeModalOpen(true)}
          title="Mở xem & cài đặt Video YouTube"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <Youtube className="w-3.5 h-3.5 fill-white" />
          <span className="hidden sm:inline">Video YouTube</span>
        </button>

        {/* Audio Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlayMusic}
          title={
            !audioUrl
              ? 'Chưa có nhạc nền. Bấm để tải nhạc'
              : isPlaying
              ? 'Tắt nhạc nền'
              : 'Bật nhạc nền'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            isPlaying
              ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300 shadow-md animate-pulse'
              : 'bg-white/15 hover:bg-white/25 text-white'
          }`}
        >
          {isPlaying ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-slate-300" />
          )}
          <span>{isPlaying ? 'Đang Bật' : 'Bật Nhạc'}</span>
        </button>

        {/* Upload Audio Button */}
        <button
          type="button"
          onClick={handleUploadMusicClick}
          disabled={isUploadingAudio}
          title="Tải nhạc nền từ máy tính (.mp3, .wav, tối đa 5MB)"
          className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs transition-all cursor-pointer"
        >
          {isUploadingAudio ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
          ) : (
            <UploadCloud className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100/20 overflow-hidden relative z-10 animate-in fade-in zoom-in-95">
        {/* Banner with Top-Right Media Controls */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 text-white text-center relative">
          {/* Top-right corner of the red form: YouTube icon & Audio controls */}
          <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-20">
            {/* 1. YouTube Icon Button */}
            <button
              type="button"
              onClick={() => setIsYouTubeModalOpen(true)}
              title="Cài đặt Video YouTube"
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs border border-white/30 group"
              aria-label="Cài đặt Video YouTube"
            >
              <Youtube className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
            </button>

            {/* 2. Speaker Loa Icon (Play / Pause) */}
            <button
              type="button"
              onClick={togglePlayMusic}
              title={
                !audioUrl
                  ? 'Bấm để nạp file nhạc nền'
                  : isPlaying
                  ? 'Tắt nhạc nền'
                  : 'Bật nhạc nền'
              }
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs border border-white/30 active:scale-95 ${
                isPlaying
                  ? 'bg-amber-400 text-amber-950 font-bold ring-2 ring-amber-300 shadow-md animate-pulse'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              aria-label={isPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
            >
              {isPlaying ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4 opacity-80" />
              )}
            </button>

            {/* 3. Tải nhạc nền Button */}
            <button
              type="button"
              onClick={handleUploadMusicClick}
              disabled={isUploadingAudio}
              title="Tải nhạc nền từ máy tính (.mp3, .wav, tối đa 5MB)"
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs border border-white/30"
              aria-label="Tải nhạc nền"
            >
              {isUploadingAudio ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-xl shadow-inner mb-3">
            3/3
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
            SỔ TAY THI ĐUA LỚP 3/3
          </h1>
          <p className="text-xs text-red-100 font-semibold tracking-wider mt-1">
            SỔ TAY THI ĐUA · V1.0
          </p>

          {/* Music track subtitle indicator */}
          {audioUrl && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/20 text-[10px] text-red-100 backdrop-blur-xs">
              <Music className={`w-3 h-3 ${isPlaying ? 'text-amber-300 animate-bounce' : 'text-slate-300'}`} />
              <span className="truncate max-w-[200px]">{audioName || 'Nhạc nền lớp học'}</span>
              <span className="opacity-75">· {isPlaying ? 'Đang phát ♫' : 'Đang tắt'}</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-red-600" />
              Chọn Vai Trò Đăng Nhập:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleQuickSelect('teacher')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                  selectedRole === 'teacher'
                    ? 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-400'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <span className="text-red-600 font-bold block">Cô Lê Thị Dung</span>
                  <span className="text-[10px] text-slate-600">GVCN</span>
                </div>
                <span className="text-[10px] text-red-700 font-semibold">Toàn quyền</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickSelect('monitor')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                  selectedRole === 'monitor'
                    ? 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-400'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <span className="font-bold text-slate-900 block">Trần Bảo An</span>
                  <span className="text-[10px] text-slate-600">Lớp trưởng</span>
                </div>
                <span className="text-[10px] text-blue-600 font-semibold">Chấm điểm</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickSelect('red_flag')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                  selectedRole === 'red_flag'
                    ? 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-400'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <span className="font-bold text-slate-900 block">Đặng Lê Anh Đức</span>
                  <span className="text-[10px] text-slate-600">Ban Cờ đỏ</span>
                </div>
                <span className="text-[10px] text-amber-600 font-semibold">Nề nếp</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickSelect('team_leader')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                  selectedRole === 'team_leader'
                    ? 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-400'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <span className="font-bold text-slate-900 block">Tổ trưởng</span>
                  <span className="text-[10px] text-slate-600">Tổ 1 - 4</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">Thi đua</span>
              </button>
            </div>
          </div>

          {/* Password Input (Required for teacher) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                Mật Khẩu Truy Cập:
              </label>
              <span className="text-[11px] text-slate-600">
                {selectedRole === 'teacher' ? 'Mặc định: 6b1' : 'Không bắt buộc'}
              </span>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-200 active:scale-98 transition-all cursor-pointer"
          >
            <span>VÀO HỆ THỐNG</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Note info & Media Helper */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
              <button
                type="button"
                onClick={togglePlayMusic}
                className="hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {isPlaying ? <Volume2 className="w-3 h-3 text-amber-600" /> : <VolumeX className="w-3 h-3" />}
                <span>{isPlaying ? 'Tắt nhạc' : 'Bật nhạc nền'}</span>
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={handleUploadMusicClick}
                className="hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <UploadCloud className="w-3 h-3" />
                <span>Tải nhạc (.mp3, .wav ≤ 5MB)</span>
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setIsYouTubeModalOpen(true)}
                className="hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Youtube className="w-3 h-3 text-red-600" />
                <span>Xem Video</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-600">
              Hệ thống Quản lý Nề nếp Thi đua Số hoá Lớp 3/3 · Dữ liệu đồng bộ Google Sheets
            </div>
          </div>
        </form>
      </div>

      {/* YouTube Embed Modal */}
      <YouTubeModal
        isOpen={isYouTubeModalOpen}
        onClose={() => setIsYouTubeModalOpen(false)}
        initialUrl={youtubeEmbedUrl}
        onSave={handleSaveYouTubeConfig}
      />
    </div>
  );
};

