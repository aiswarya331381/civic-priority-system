const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const path     = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes      = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const userRoutes      = require('./routes/users');

const app = express();

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow image serving
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, max: 200,
  message: { success: false, message: 'Too many requests. Try again later.' },
}));
app.use('/api/auth/', rateLimit({
  windowMs: 15 * 60 * 1000, max: 15,
  message: { success: false, message: 'Too many auth attempts. Try again in 15 minutes.' },
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ── Static uploads ────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Database ──────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users',      userRoutes);

app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'Civic Issue API v2.0 running', env: process.env.NODE_ENV })
);

// ── Multer error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: `File too large. Max ${process.env.MAX_FILE_SIZE_MB || 2}MB per image.` });
  }
  if (err.message?.includes('Only JPG')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
});
