import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Upload,
  Sparkles,
  Disc3,
  X,
} from 'lucide-react';
import { useEmulation } from '../../context/EmulationContext';

const STORAGE_KEYS = {
  AUDIO_BASE64: 'sotay_bg_music_base64',
  AUDIO_NAME: 'sotay_bg_music_name',
  AUDIO_VOLUME: 'sotay_bg_music_volume',
};

export const BackgroundMusicPlayer: React.FC = () => {
  const { addToast } = useEmulation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [audioBase64, setAudioBase64] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUDIO_BASE64);
    } catch {
      return null;
    }
  });

  const [audioName, setAudioName] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUDIO_NAME);
    } catch {
      return null;
    }
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIO_VOLUME);
      return saved ? parseFloat(saved) : 0.6;
    } catch {
      return 0.6;
    }
  });

  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Load Base64 source into audio element on mount or change
  useEffect(() => {
    if (audioRef.current && audioBase64) {
      audioRef.current.src = audioBase64;
      audioRef.current.load();
    }
  }, [audioBase64]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioBase64) {
      // If no music is uploaded yet, prompt file upload
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Lỗi khi phát nhạc:', err);
          addToast('warning', 'Phát nhạc', 'Vui lòng nhấn chuột vào trang để cho phép trình duyệt phát âm thanh.');
        });
    }
  };

  // Trigger file dialog
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Process uploaded audio file and convert to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format: only .mp3 and .wav
    const lowerName = file.name.toLowerCase();
    const isMp3OrWav =
      lowerName.endsWith('.mp3') ||
      lowerName.endsWith('.wav') ||
      file.type === 'audio/mpeg' ||
      file.type === 'audio/wav' ||
      file.type === 'audio/mp3';

    if (!isMp3OrWav) {
      addToast(
        'error',
        'Định dạng không hỗ trợ',
        'Vui lòng chọn file âm thanh chuẩn định dạng .mp3 hoặc .wav!'
      );
      return;
    }

    // Safety check for localStorage capacity (recommended <= 4MB for Base64)
    if (file.size > 5 * 1024 * 1024) {
      addToast(
        'warning',
        'File khá lớn (>5MB)',
        'Dung lượng bộ nhớ trình duyệt có giới hạn. Vui lòng chọn bản nhạc nhẹ hơn để lưu trữ ổn định!'
      );
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (!base64Data) {
        addToast('error', 'Lỗi đọc file', 'Không thể chuyển đổi file âm thanh sang Base64.');
        return;
      }

      try {
        // Save to localStorage permanently
        localStorage.setItem(STORAGE_KEYS.AUDIO_BASE64, base64Data);
        localStorage.setItem(STORAGE_KEYS.AUDIO_NAME, file.name);

        setAudioBase64(base64Data);
        setAudioName(file.name);

        // Auto-play the new track
        if (audioRef.current) {
          audioRef.current.src = base64Data;
          audioRef.current.load();
          audioRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        }

        addToast(
          'success',
          'Đã tải nhạc nền',
          `Bài hát "${file.name}" đã được lưu vào hệ thống và sẵn sàng phát lặp lại!`
        );
      } catch (err) {
        console.error('Lỗi khi lưu vào localStorage:', err);
        addToast(
          'error',
          'Bộ nhớ đầy',
          'Trình duyệt không đủ dung lượng lưu file này. Vui lòng chọn bài nhạc dung lượng nhỏ hơn (dưới 3MB).'
        );
      }
    };

    reader.onerror = () => {
      addToast('error', 'Lỗi', 'Đã xảy ra lỗi trong quá trình đọc file.');
    };

    reader.readAsDataURL(file);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIO_VOLUME, newVol.toString());
    } catch {}
  };

  const removeTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setAudioBase64(null);
    setAudioName(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUDIO_BASE64);
      localStorage.removeItem(STORAGE_KEYS.AUDIO_NAME);
    } catch {}
    addToast('info', 'Nhạc nền', 'Đã gỡ bỏ bản nhạc nền.');
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* HTML5 Audio element with loop */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Hidden file input strictly allowing .mp3 and .wav */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3, .wav, audio/mpeg, audio/wav, audio/mp3"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Primary School-Friendly Playful Music Controller */}
      <div className="flex items-center gap-1 bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200/80 rounded-xl p-1 shadow-2xs">
        {/* Nút "Tải nhạc nền" kèm icon nốt nhạc */}
        <button
          type="button"
          onClick={handleUploadClick}
          title="Tải nhạc nền từ máy tính (.mp3, .wav - Tự động lặp lại)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Music className={`w-3.5 h-3.5 ${isPlaying ? 'animate-bounce text-yellow-300' : 'text-white'}`} />
          <span className="hidden sm:inline">Tải nhạc nền</span>
        </button>

        {/* Nút Play / Pause */}
        <button
          type="button"
          onClick={togglePlay}
          title={
            !audioBase64
              ? 'Chưa có bài hát. Bấm để chọn file .mp3 hoặc .wav'
              : isPlaying
              ? 'Tạm dừng nhạc nền'
              : 'Bật phát nhạc nền'
          }
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 ${
            isPlaying
              ? 'bg-amber-400 text-amber-950 shadow-xs ring-2 ring-amber-300 animate-pulse'
              : 'bg-white hover:bg-slate-100 text-violet-700 border border-violet-200'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-amber-950" />
              <span className="hidden md:inline">Tắt</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-violet-700" />
              <span className="hidden md:inline">Bật</span>
            </>
          )}
        </button>

        {/* Thanh chỉnh âm lượng (Volume Control) */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            title={`Âm lượng: ${Math.round(volume * 100)}%`}
            className="p-1.5 rounded-lg hover:bg-white text-violet-700 transition-colors cursor-pointer"
          >
            {volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-3.5 h-3.5 text-violet-600" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-violet-600" />
            )}
          </button>

          {/* Inline / Popover Volume Slider */}
          {showVolumeSlider && (
            <div className="absolute right-0 top-full mt-2 z-40 bg-white border border-violet-200 rounded-xl p-2.5 shadow-xl flex items-center gap-2 min-w-[150px] animate-in fade-in zoom-in-95">
              <span className="text-[10px] font-bold text-violet-700 whitespace-nowrap">
                {Math.round(volume * 100)}%
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-1.5 bg-violet-100 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
              <button
                type="button"
                onClick={() => setShowVolumeSlider(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Compact Song Badge when a track is uploaded */}
        {audioName && (
          <div
            className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/80 border border-violet-200/60 text-[11px] text-violet-800 max-w-[130px]"
            title={`Bài hát đang phát lặp: ${audioName}`}
          >
            <Disc3 className={`w-3 h-3 text-fuchsia-600 shrink-0 ${isPlaying ? 'animate-spin' : ''}`} />
            <span className="truncate">{audioName}</span>
            <button
              type="button"
              onClick={removeTrack}
              title="Gỡ bài hát này"
              className="hover:text-red-600 ml-0.5 shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
