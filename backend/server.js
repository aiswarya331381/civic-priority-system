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
// Allowed origins come from three places, merged together:
//   1. Hard-coded local dev origins (localhost:5173 AND 5174 — Vite's default
//      port and its common fallback when 5173 is already in use).
//   2. CLIENT_URL — the existing env var this project already used. Kept for
//      backward compatibility; comma-separated list supported.
//   3. FRONTEND_URL — new, optional env var for the deployed frontend origin
//      (e.g. your Vercel/Netlify URL). Comma-separated list supported.
const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:5174'];

const envOrigins = [
  ...(process.env.CLIENT_URL || '').split(','),
  ...(process.env.FRONTEND_URL || '').split(','),
]
  .map(s => s.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...DEV_ORIGINS, ...envOrigins])];

const corsOptions = {
  origin: (origin, cb) => {
    // No `origin` header = server-to-server / curl / same-origin request —
    // always allow. Otherwise only allow origins in the list.
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      // IMPORTANT: pass `false`, not an Error. Passing an Error here makes
      // Express fall through to the error handler, which returns a 500
      // response with NO CORS headers at all — that's what was causing the
      // preflight (OPTIONS) request to be blocked by the browser instead of
      // cleanly rejected. `cb(null, false)` lets the `cors` package respond
      // normally (without the Access-Control-Allow-Origin header) so the
      // browser reports a standard, non-crashing CORS rejection.
      cb(null, false);
    }
  },
  credentials: true, // required — the frontend sends the JWT via
                      // `Authorization: Bearer <token>` and axios is
                      // configured with credentials-aware requests.
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Explicitly answer preflight (OPTIONS) requests for every route with the
// same CORS options. The `cors` middleware above already does this
// automatically for matched routes, but this is a safety net so preflight
// requests are always answered correctly, including for routes not yet
// mounted at this point in the file.
app.options('*', cors(corsOptions));

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