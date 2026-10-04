import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database JSON file for persistent system settings
const dbFilePath = path.join(__dirname, 'db_system.json');

interface SystemDb {
  backgroundAudioUrl?: string | null;
  backgroundAudioName?: string | null;
  youtubeEmbedUrl?: string | null;
  youtubeVideoId?: string | null;
}

function getDb(): SystemDb {
  if (fs.existsSync(dbFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

function saveDb(data: SystemDb) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Lỗi khi ghi file db_system.json:', err);
  }
}

// Multer storage setup for audio upload (Max 5MB, .mp3 / .wav only)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `bg_audio_${Date.now()}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.mp3', '.wav'];
    const isMimeAudio = file.mimetype.includes('audio') || file.mimetype.includes('mpeg') || file.mimetype.includes('wav');

    if (allowedExtensions.includes(ext) || isMimeAudio) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận định dạng âm thanh .mp3 hoặc .wav!'));
    }
  },
});

// Serve uploaded media
app.use('/uploads', express.static(uploadsDir));

// API 1: Get media configuration (Audio & YouTube)
app.get('/api/media-config', (_req, res) => {
  const db = getDb();
  res.json({
    success: true,
    backgroundAudioUrl: db.backgroundAudioUrl || null,
    backgroundAudioName: db.backgroundAudioName || null,
    youtubeEmbedUrl: db.youtubeEmbedUrl || null,
    youtubeVideoId: db.youtubeVideoId || null,
  });
});

// API 2: Upload Audio (Limit 5MB, returns URL and updates DB)
app.post('/api/upload-audio', (req, res) => {
  upload.single('audio')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Dung lượng file vượt quá giới hạn cho phép (Tối đa 5MB)!',
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file âm thanh (.mp3, .wav) để tải lên.',
      });
    }

    const audioUrl = `/uploads/${req.file.filename}`;
    const db = getDb();
    db.backgroundAudioUrl = audioUrl;
    db.backgroundAudioName = req.file.originalname;
    saveDb(db);

    return res.json({
      success: true,
      message: 'Tải lên và lưu nhạc nền thành công!',
      url: audioUrl,
      filename: req.file.originalname,
    });
  });
});

// API 3: Save YouTube Video Config
app.post('/api/youtube-config', (req, res) => {
  const { embedUrl, videoId } = req.body;
  const db = getDb();
  db.youtubeEmbedUrl = embedUrl || null;
  db.youtubeVideoId = videoId || null;
  saveDb(db);

  return res.json({
    success: true,
    message: 'Đã lưu cấu hình video YouTube thành công!',
    embedUrl: db.youtubeEmbedUrl,
    videoId: db.youtubeVideoId,
  });
});

// Setup Vite for Dev or Static files for Production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distDir = path.join(__dirname, 'dist');
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server chạy thành công tại http://0.0.0.0:${PORT}`);
});
