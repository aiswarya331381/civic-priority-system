const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── Allowed MIME types ───────────────────────────────────────────────────────
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG and WEBP images are allowed'), false);
  }
};

// ── Local disk storage ───────────────────────────────────────────────────────
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const MAX_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '2', 10);

const upload = multer({
  storage: diskStorage,
  fileFilter,
  limits: { fileSize: MAX_MB * 1024 * 1024, files: 5 },
});

module.exports = upload;
