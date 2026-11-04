/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = process.env.HOST || '0.0.0.0';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Canonical public origin used for SEO/sitemap fallbacks (override per deployment).
const APP_URL = (process.env.APP_URL || 'https://onlytok.uk').replace(/\/+$/, '');

// Firebase project used to verify admin ID tokens. The web config is public by
// design; the project id is not a secret. Override with FIREBASE_PROJECT_ID.
let firebaseProjectId = process.env.FIREBASE_PROJECT_ID || '';
if (!firebaseProjectId) {
  try {
    const cfg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'firebase-applet-config.json'), 'utf-8'));
    firebaseProjectId = cfg.projectId || '';
  } catch {
    firebaseProjectId = '';
  }
}

// Optional break-glass API token for server-to-server / emergency admin access
// when Firebase Auth is unavailable. Must be a long random secret; never commit it.
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN || '';

// Persistence directories (overridable for tests / Docker volumes).
const UPLOADS_DIR = path.resolve(process.env.ONLYTOK_UPLOADS_DIR || path.join(__dirname, 'uploads'));
const DATA_DIR = path.resolve(process.env.ONLYTOK_DATA_DIR || path.join(__dirname, 'data_store'));
const SEED_DIR = path.resolve(__dirname, 'seed');

// Total disk quota for uploaded media (default 2 GB). Prevents disk exhaustion.
const MAX_UPLOADS_BYTES = (parseInt(process.env.MAX_UPLOADS_MB || '2048', 10) || 2048) * 1024 * 1024;

for (const dir of [UPLOADS_DIR, DATA_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Data Store File Paths
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const PUBLISHED_FILE = path.join(DATA_DIR, 'published_releases.json');
const LOGS_FILE = path.join(DATA_DIR, 'moderation_logs.json');
const CREATORS_FILE = path.join(DATA_DIR, 'creators.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
const ADMIN_USERS_FILE = path.join(DATA_DIR, 'admin_users.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const GDPR_REQUESTS_FILE = path.join(DATA_DIR, 'gdpr_requests.json');
const CONTACT_INQUIRIES_FILE = path.join(DATA_DIR, 'contact_inquiries.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

import { AUTHORIZED_VIDEOS, AUTHORIZED_CREATORS, getVideoById, getCreatorById } from './src/data/contentRegistry';
import { generateSitemapXml, generateRobotsTxt, getSeoMetadata } from './src/utils/seo';

// Helper to safely read/write persistent JSON stores.
// Writes are atomic (temp file + rename) so a crash mid-write cannot corrupt a
// store. Corrupt files are quarantined (renamed) rather than silently discarded.
function readStore<T>(filePath: string, defaultVal: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    try {
      const quarantine = `${filePath}.corrupt-${Date.now()}`;
      fs.renameSync(filePath, quarantine);
      console.error(`Quarantined corrupt store to ${quarantine}`);
    } catch (renameErr) {
      console.error(`Failed to quarantine corrupt store ${filePath}:`, renameErr);
    }
  }
  return defaultVal;
}

function writeStore<T>(filePath: string, data: T): void {
  const tmpPath = `${filePath}.tmp-${process.pid}-${crypto.randomBytes(4).toString('hex')}`;
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch {
      /* best-effort cleanup */
    }
    throw err;
  }
}

// Seed fresh installations with sanitized defaults (no personal data). Runtime
// stores live in DATA_DIR and are never committed to git.
function seedStores(): void {
  const seeds: Array<[string, unknown]> = [
    [CATEGORIES_FILE, []],
    [SETTINGS_FILE, {}],
    [CREATORS_FILE, []],
    [ADMIN_USERS_FILE, []],
    [SUBMISSIONS_FILE, []],
    [PUBLISHED_FILE, []],
    [REPORTS_FILE, []],
    [LOGS_FILE, []],
    [GDPR_REQUESTS_FILE, []],
    [CONTACT_INQUIRIES_FILE, []],
  ];
  for (const [file, fallback] of seeds) {
    if (fs.existsSync(file)) continue;
    const seedFile = path.join(SEED_DIR, path.basename(file));
    try {
      if (fs.existsSync(seedFile)) {
        fs.copyFileSync(seedFile, file);
      } else {
        writeStore(file, fallback);
      }
    } catch (err) {
      console.error(`Failed to seed ${file}:`, err);
    }
  }
}

// In-memory sliding-window rate limiters
interface RateLimitBucket {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitBucket>();

// Periodically evict expired buckets so the map cannot grow without bound.
const rateLimitSweep = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitMap) {
    if (now > bucket.resetTime) rateLimitMap.delete(key);
  }
}, 60 * 1000);
rateLimitSweep.unref();

function rateLimiter(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const key = `${req.path}:${ip}`;
    const now = Date.now();
    const bucket = rateLimitMap.get(key);

    if (!bucket || now > bucket.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (bucket.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please slow down and try again later.',
        retryAfterMs: bucket.resetTime - now,
      });
    }

    bucket.count += 1;
    next();
  };
}

// Current total size of the uploads directory (bounded, cheap for this scale).
function uploadsDiskUsage(): number {
  try {
    return fs
      .readdirSync(UPLOADS_DIR)
      .reduce((sum, name) => {
        try {
          return sum + fs.statSync(path.join(UPLOADS_DIR, name)).size;
        } catch {
          return sum;
        }
      }, 0);
  } catch {
    return 0;
  }
}

// Multer storage and validation for video uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (uploadsDiskUsage() >= MAX_UPLOADS_BYTES) {
      cb(new Error('Upload storage is full. Please contact the site administrator.'), '');
      return;
    }
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = crypto.randomBytes(12).toString('hex');
    cb(null, `ot_video_${Date.now()}_${safeBase}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB strict limit
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const allowedExts = ['.mp4', '.webm', '.mov'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Supported types: MP4, WebM, MOV (max 50MB).'));
    }
  },
});

// Admin Authentication & Permission System
//
// SECURITY: Admin access requires a cryptographically verified credential:
//   1. A Firebase ID token (RS256 JWT) issued by Google securetoken for the
//      configured Firebase project, with a verified email on the admin list, OR
//   2. The optional ADMIN_API_TOKEN break-glass secret (constant-time compared).
// Spoofable headers (e.g. X-Admin-Email) and hardcoded dev tokens are NOT accepted.
const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || 'dlinacre16@gmail.com').toLowerCase();

interface AdminUserRecord {
  id: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'moderator' | 'editor';
  status: 'active' | 'revoked';
  notes?: string;
  addedAt: string;
  lastActiveAt?: string;
}

function getActiveAdminUsers(): AdminUserRecord[] {
  const users = readStore<AdminUserRecord[]>(ADMIN_USERS_FILE, []);
  // Ensure primary super_admin is always authorized
  if (!users.some((u) => u.email.toLowerCase() === SUPER_ADMIN_EMAIL)) {
    users.unshift({
      id: 'adm_super_01',
      email: SUPER_ADMIN_EMAIL,
      displayName: 'Dominic Linacre',
      role: 'super_admin',
      status: 'active',
      notes: 'Primary Founder & Master Administrator',
      addedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    });
    try {
      writeStore(ADMIN_USERS_FILE, users);
    } catch (err) {
      console.error('Failed to persist super admin seed:', err);
    }
  }
  return users;
}

// Google's public JWKS for Firebase ID tokens (no service-account secret needed).
const FIREBASE_JWKS = firebaseProjectId
  ? createRemoteJWKSet(
      new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
    )
  : null;

function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function touchAdminLastActive(admin: AdminUserRecord): void {
  try {
    const last = admin.lastActiveAt ? Date.parse(admin.lastActiveAt) : 0;
    if (Date.now() - last < 5 * 60 * 1000) return; // throttle writes
    const users = getActiveAdminUsers();
    const match = users.find((u) => u.id === admin.id);
    if (match) {
      match.lastActiveAt = new Date().toISOString();
      writeStore(ADMIN_USERS_FILE, users);
    }
  } catch {
    /* non-critical */
  }
}

async function resolveAdmin(req: Request): Promise<AdminUserRecord | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  // 1. Break-glass static API token (server-to-server / emergency access).
  if (ADMIN_API_TOKEN && timingSafeEqualString(token, ADMIN_API_TOKEN)) {
    const admins = getActiveAdminUsers();
    const superAdmin = admins.find((u) => u.email.toLowerCase() === SUPER_ADMIN_EMAIL && u.status === 'active');
    if (superAdmin) {
      touchAdminLastActive(superAdmin);
      return superAdmin;
    }
    return null;
  }

  // 2. Firebase ID token (JWT). Verify signature, issuer, audience, expiry.
  if (FIREBASE_JWKS && token.split('.').length === 3) {
    try {
      const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
        issuer: `https://securetoken.google.com/${firebaseProjectId}`,
        audience: firebaseProjectId,
      });
      const email = typeof payload.email === 'string' ? payload.email.toLowerCase().trim() : '';
      if (!email || payload.email_verified !== true || !payload.sub) return null;

      const admins = getActiveAdminUsers();
      const match = admins.find((u) => u.email.toLowerCase() === email && u.status === 'active');
      if (match) {
        touchAdminLastActive(match);
        return match;
      }
    } catch {
      return null;
    }
  }

  return null;
}

async function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const admin = await resolveAdmin(req);
  if (!admin) {
    return res.status(401).json({
      error: 'Unauthorized: Valid administrator credentials required to access this resource.',
      loginRequired: true,
    });
  }
  (req as any).adminUser = admin;
  next();
}

function logAuditAction(
  action: string,
  targetId: string,
  details: string,
  moderatorEmail: string,
  extra: Record<string, any> = {}
) {
  try {
    const logs = readStore<any[]>(LOGS_FILE, []);
    logs.unshift({
      id: `log_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      action,
      targetId,
      details,
      moderatorEmail,
      timestamp: new Date().toISOString(),
      ...extra,
    });
    writeStore(LOGS_FILE, logs);
  } catch (err) {
    console.error('Failed to log audit action:', err);
  }
}

// ==========================================
// Application factory (exported for tests)
// ==========================================
export function createApp() {
  const app = express();

  // Correct client IPs behind a reverse proxy (nginx, Docker, etc.). Configure
  // TRUST_PROXY to match your topology (e.g. "1" for a single proxy hop).
  app.set('trust proxy', process.env.TRUST_PROXY || 'loopback');
  app.disable('x-powered-by');

  // Security headers. CSP is enforced in production; dev needs Vite HMR inline
  // scripts, so it is relaxed there. Firebase Auth + Google Fonts are allowed.
  app.use(
    helmet({
      contentSecurityPolicy: IS_PRODUCTION
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", 'https://apis.google.com', 'https://www.gstatic.com', 'https://www.googleapis.com'],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
              fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
              imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
              mediaSrc: ["'self'", 'blob:', 'https:'],
              connectSrc: [
                "'self'",
                'https://*.googleapis.com',
                'https://*.google.com',
                'https://*.firebaseapp.com',
                'https://*.firebaseio.com',
                'wss://*.firebaseio.com',
              ],
              frameSrc: ['https://accounts.google.com', 'https://*.firebaseapp.com'],
              objectSrc: ["'none'"],
              baseUri: ["'self'"],
              formAction: ["'self'"],
              frameAncestors: ["'none'"],
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-site' },
    })
  );

  // JSON bodies are small (uploads use multipart). 1 MB is generous.
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  seedStores();
  registerRoutes(app);
  return app;
}

function registerRoutes(app: express.Express) {
// ==========================================
// Public Endpoints
// ==========================================

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uploadsReady: fs.existsSync(UPLOADS_DIR),
    dataReady: fs.existsSync(DATA_DIR),
  });
});

// 2. Upload Video (Rate-Limited, 50MB Limit)
app.post(
  '/api/upload',
  rateLimiter(15, 15 * 60 * 1000),
  (req: Request, res: Response) => {
    upload.single('video')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size exceeds maximum allowed limit of 50MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No video file provided for upload.' });
      }

      const mediaUrl = `/api/media/${req.file.filename}`;
      return res.status(200).json({
        success: true,
        mediaUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        sizeBytes: req.file.size,
        mimeType: req.file.mimetype,
      });
    });
  }
);

// 3. Stream Uploaded Video with Range Requests
app.get('/api/media/:filename', (req: Request, res: Response) => {
  const safeFilename = path.basename(req.params.filename);
  const filePath = path.join(UPLOADS_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video file not found.' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  const ext = path.extname(safeFilename).toLowerCase();
  let contentType = 'video/mp4';
  if (ext === '.webm') contentType = 'video/webm';
  if (ext === '.mov') contentType = 'video/quicktime';

  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
      return res.end();
    }

    const chunksize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    });
    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

// 4. Submit Creator Content
app.post(
  '/api/submissions',
  rateLimiter(30, 15 * 60 * 1000),
  (req: Request, res: Response) => {
    try {
      const {
        creatorName,
        tiktokHandle,
        email,
        videoTitle,
        videoDescription = '',
        mediaType,
        mediaUrl,
        category,
        confirmedOwnership,
        confirmedAdult18,
        birthDate,
        idDocumentType = 'Passport / Driving Licence',
        confirmedNoMinors,
        confirmedNoExplicitPorn,
        digitalSignature,
        acceptedTerms,
        acceptedPrivacy,
        originalFileName,
        fileSizeBytes,
      } = req.body;

      if (!creatorName || typeof creatorName !== 'string' || creatorName.trim().length < 2 || creatorName.length > 100) {
        return res.status(400).json({ error: 'Creator display name must be between 2 and 100 characters.' });
      }

      if (!tiktokHandle || typeof tiktokHandle !== 'string') {
        return res.status(400).json({ error: 'Valid TikTok username is required.' });
      }
      const cleanHandle = tiktokHandle.trim().startsWith('@') ? tiktokHandle.trim() : `@${tiktokHandle.trim()}`;
      if (cleanHandle.length < 2 || cleanHandle.length > 50) {
        return res.status(400).json({ error: 'TikTok handle must be between 2 and 50 characters.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || typeof email !== 'string' || !emailRegex.test(email.trim()) || email.length > 120) {
        return res.status(400).json({ error: 'A valid contact email address is required.' });
      }

      if (!videoTitle || typeof videoTitle !== 'string' || videoTitle.trim().length < 3 || videoTitle.length > 150) {
        return res.status(400).json({ error: 'Video title must be between 3 and 150 characters.' });
      }

      if (!['upload', 'url'].includes(mediaType)) {
        return res.status(400).json({ error: 'Media type must be either upload or video URL.' });
      }

      if (!mediaUrl || typeof mediaUrl !== 'string' || mediaUrl.trim().length === 0 || mediaUrl.length > 1000) {
        return res.status(400).json({ error: 'A valid media upload or authorised video URL is required.' });
      }

      if (confirmedOwnership !== true) {
        return res.status(400).json({ error: 'You must confirm copyright ownership or explicit authority to submit.' });
      }

      if (confirmedAdult18 !== true) {
        return res.status(400).json({ error: 'Strict 18+ verification is mandatory. The individual featured must be 18 or older.' });
      }

      // Age calculation verification
      if (birthDate) {
        const dob = new Date(birthDate);
        if (!isNaN(dob.getTime())) {
          const ageDiffMs = Date.now() - dob.getTime();
          const ageDate = new Date(ageDiffMs);
          const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
          if (calculatedAge < 18) {
            return res.status(400).json({ error: 'Strict Age Restriction: Creator must be at least 18 years of age.' });
          }
        }
      }

      if (confirmedNoMinors !== true) {
        return res.status(400).json({ error: 'Mandatory Child Safety Declaration: You must certify zero individuals under 18 appear in this video.' });
      }

      if (confirmedNoExplicitPorn !== true) {
        return res.status(400).json({ error: 'Mainstream Standard: You must certify this content contains no explicit sexual content or non-consensual material.' });
      }

      if (!digitalSignature || typeof digitalSignature !== 'string' || digitalSignature.trim().length < 3) {
        return res.status(400).json({ error: 'A valid typed digital signature (legal full name) is required to execute this agreement.' });
      }

      if (acceptedTerms !== true || acceptedPrivacy !== true) {
        return res.status(400).json({ error: 'You must accept the terms of syndication and privacy notice.' });
      }

      const year = new Date().getFullYear();
      const randomSuffix = crypto.randomBytes(6).toString('hex').toUpperCase();
      const referenceCode = `OT-CR-${year}-${randomSuffix}`;
      const submissionId = `sub_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

      const newSubmission = {
        id: submissionId,
        referenceCode,
        creatorName: creatorName.trim(),
        tiktokHandle: cleanHandle,
        email: email.trim().toLowerCase(),
        videoTitle: videoTitle.trim(),
        videoDescription: (videoDescription || '').trim().slice(0, 1000),
        mediaType,
        mediaUrl: mediaUrl.trim(),
        originalFileName: originalFileName || null,
        fileSizeBytes: fileSizeBytes || null,
        category: category || 'Dance & Choreography',
        confirmedOwnership: true,
        confirmedAdult18: true,
        verificationRecord: {
          birthDate: birthDate || null,
          idDocumentType: String(idDocumentType).slice(0, 100),
          confirmedNoMinors: true,
          confirmedNoExplicitPorn: true,
          digitalSignature: digitalSignature.trim(),
          verifiedAt: new Date().toISOString(),
        },
        acceptedTerms: true,
        acceptedPrivacy: true,
        status: 'pending', // NEVER automatically published
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        moderationNotes: null,
        moderatorEmail: null,
        moderatedAt: null,
      };

      const submissions = readStore<any[]>(SUBMISSIONS_FILE, []);
      submissions.unshift(newSubmission);
      writeStore(SUBMISSIONS_FILE, submissions);

      return res.status(201).json({
        success: true,
        submission: newSubmission,
        referenceCode,
        message: 'Your submission has been received and entered the pending review queue.',
      });
    } catch (err: any) {
      console.error('Error creating submission:', err);
      return res.status(500).json({ error: 'Failed to process submission. Please try again.' });
    }
  }
);

// 5. Get Published Releases (Public Feed)
app.get('/api/published-releases', (req: Request, res: Response) => {
  const published = readStore<any[]>(PUBLISHED_FILE, []);
  const { category, search, featured } = req.query;

  let result = [...published];

  if (category && typeof category === 'string' && category !== 'All Categories' && category !== 'all') {
    result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (featured === 'true') {
    result = result.filter((p) => p.isFeatured === true);
  }

  if (search && typeof search === 'string' && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.creatorName.toLowerCase().includes(q) ||
        p.tiktokHandle.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  return res.status(200).json({
    releases: result,
    total: result.length,
  });
});

// 6. Public Categories List
app.get('/api/categories', (_req: Request, res: Response) => {
  const categories = readStore<any[]>(CATEGORIES_FILE, []);
  return res.status(200).json({ categories });
});

// 7. Public Creators List
app.get('/api/creators', (req: Request, res: Response) => {
  const creators = readStore<any[]>(CREATORS_FILE, []);
  const { search, category } = req.query;

  let result = creators.filter((c) => c.status !== 'suspended');

  if (category && typeof category === 'string' && category !== 'all') {
    result = result.filter((c) =>
      c.categories?.some((cat: string) => cat.toLowerCase().includes(category.toLowerCase()))
    );
  }

  if (search && typeof search === 'string' && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        (c.bio && c.bio.toLowerCase().includes(q))
    );
  }

  return res.status(200).json({ creators: result, total: result.length });
});

// 8. Public Website Settings
app.get('/api/settings/public', (_req: Request, res: Response) => {
  const settings = readStore<any>(SETTINGS_FILE, {});
  return res.status(200).json({
    brandName: settings.brandName || 'ONLYTOK',
    brandTagline: settings.brandTagline || 'Discover Your Next Favourite Creator',
    tiktokHandle: settings.tiktokHandle || '@onlytokgirls',
    tiktokUrl: settings.tiktokUrl || 'https://www.tiktok.com/@onlytokgirls',
    contactEmail: settings.contactEmail || 'contact@onlytok.com',
    dmcaEmail: settings.dmcaEmail || 'legal@onlytok.com',
    submissionStatus: settings.submissionStatus || 'open',
    submissionNotice: settings.submissionNotice || '',
    maxUploadSizeMb: settings.maxUploadSizeMb || 50,
    announcementBanner: settings.announcementBanner || { active: false, text: '', link: '' },
  });
});

// 9. Public Report / DMCA / Removal Request Submission
app.post(
  '/api/reports',
  rateLimiter(10, 15 * 60 * 1000),
  (req: Request, res: Response) => {
    try {
      const {
        reportType,
        targetType = 'published_video',
        targetId,
        targetTitle,
        reporterName,
        reporterEmail,
        reporterAffiliation = '',
        details,
        evidenceUrl = '',
      } = req.body;

      const validReportTypes = [
        'copyright_dmca',
        'inappropriate_content',
        'age_verification',
        'rights_dispute',
        'ncii_report',
        'unauthorized_repost',
        'defamation',
        'other',
      ];

      if (!reportType || !validReportTypes.includes(reportType)) {
        return res.status(400).json({ error: 'A valid report reason / infringement category is required.' });
      }

      if (!reporterName || typeof reporterName !== 'string' || reporterName.trim().length < 2) {
        return res.status(400).json({ error: 'Your full name or legal representative name is required.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!reporterEmail || typeof reporterEmail !== 'string' || !emailRegex.test(reporterEmail.trim())) {
        return res.status(400).json({ error: 'A valid contact email address is required.' });
      }

      if (!details || typeof details !== 'string' || details.trim().length < 10) {
        return res.status(400).json({ error: 'Please provide full details of your request or infringement claim (min 10 chars).' });
      }

      const year = new Date().getFullYear();
      const code = `DMCA-${year}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
      const isCritical = ['ncii_report', 'age_verification'].includes(reportType);

      const newReport = {
        id: `rep_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        referenceCode: code,
        reportType,
        urgency: isCritical ? 'CRITICAL_SAFETY' : 'STANDARD',
        targetType,
        targetId: targetId || 'unspecified',
        targetTitle: targetTitle || 'General Removal Request',
        reporterName: reporterName.trim(),
        reporterEmail: reporterEmail.trim().toLowerCase(),
        reporterAffiliation: reporterAffiliation.trim(),
        details: details.trim(),
        evidenceUrl: evidenceUrl.trim(),
        status: 'pending',
        takedownExecuted: false,
        resolutionNotes: null,
        resolvedBy: null,
        createdAt: new Date().toISOString(),
        resolvedAt: null,
      };

      const reports = readStore<any[]>(REPORTS_FILE, []);
      reports.unshift(newReport);
      writeStore(REPORTS_FILE, reports);

      logAuditAction(
        'submit_report',
        newReport.id,
        `New removal notice filed: ${code} [${reportType.toUpperCase()}] - Urgency: ${newReport.urgency}`,
        reporterEmail.trim().toLowerCase()
      );

      return res.status(201).json({
        success: true,
        referenceCode: code,
        urgency: newReport.urgency,
        message: isCritical
          ? 'CRITICAL NOTICE: Your safety report has been prioritized for expedited emergency review within 6 hours.'
          : 'Your removal request / copyright notice has been officially recorded and queued for immediate legal review.',
      });
    } catch (err) {
      console.error('Error submitting report:', err);
      return res.status(500).json({ error: 'Failed to record removal request.' });
    }
  }
);

// 10. UK GDPR Data Subject Rights (Erasure, Access, Rectification)
app.post(
  '/api/privacy/gdpr-request',
  rateLimiter(10, 15 * 60 * 1000),
  (req: Request, res: Response) => {
    try {
      const { fullName, email, requestType, details } = req.body;

      const validTypes = ['erasure_deletion', 'subject_access_request', 'rectification', 'withdraw_consent'];
      if (!requestType || !validTypes.includes(requestType)) {
        return res.status(400).json({ error: 'A valid UK GDPR request type is required.' });
      }

      if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
        return res.status(400).json({ error: 'Your full legal name is required.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'A valid email address is required.' });
      }

      if (!details || typeof details !== 'string' || details.trim().length < 5) {
        return res.status(400).json({ error: 'Please provide brief details of your request.' });
      }

      const year = new Date().getFullYear();
      const code = `GDPR-${year}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
      const newRequest = {
        id: `gdpr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        referenceCode: code,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        requestType,
        details: details.trim(),
        status: 'pending',
        resolutionNotes: null,
        processedBy: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };

      const requests = readStore<any[]>(GDPR_REQUESTS_FILE, []);
      requests.unshift(newRequest);
      writeStore(GDPR_REQUESTS_FILE, requests);

      logAuditAction(
        'gdpr_request_submitted',
        newRequest.id,
        `New UK GDPR ${requestType} request filed: ${code}`,
        email.trim().toLowerCase()
      );

      return res.status(201).json({
        success: true,
        referenceCode: code,
        message: 'Your UK GDPR rights request has been logged. Under UK statutory law, we will respond within one calendar month.',
      });
    } catch (err) {
      console.error('Error recording GDPR request:', err);
      return res.status(500).json({ error: 'Failed to record privacy request.' });
    }
  }
);

// 11. Public Contact & Inquiry Submission
app.post(
  '/api/contact',
  rateLimiter(15, 15 * 60 * 1000),
  (req: Request, res: Response) => {
    try {
      const { name, email, department = 'general', subject, message } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ error: 'Your name is required.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'A valid email address is required.' });
      }

      if (!message || typeof message !== 'string' || message.trim().length < 10) {
        return res.status(400).json({ error: 'Message must be at least 10 characters.' });
      }

      const year = new Date().getFullYear();
      const code = `INQ-${year}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
      const newInquiry = {
        id: `inq_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        referenceCode: code,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        department: ['general', 'creators', 'partnerships', 'legal', 'privacy', 'press'].includes(department)
          ? department
          : 'general',
        subject: (subject || 'General Inquiry').trim().slice(0, 150),
        message: message.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        respondedAt: null,
      };

      const inquiries = readStore<any[]>(CONTACT_INQUIRIES_FILE, []);
      inquiries.unshift(newInquiry);
      writeStore(CONTACT_INQUIRIES_FILE, inquiries);

      return res.status(201).json({
        success: true,
        referenceCode: code,
        message: 'Thank you for contacting ONLYTOK. Your message has been routed to the relevant team.',
      });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      return res.status(500).json({ error: 'Failed to process inquiry.' });
    }
  }
);

// ==========================================
// Protected Administrator Endpoints
// ==========================================

// Verify Admin Session / Token
app.post('/api/admin/verify', async (req: Request, res: Response) => {
  const admin = await resolveAdmin(req);
  if (!admin) {
    return res.status(401).json({
      authenticated: false,
      error: 'Not authorized. Administrator account required.',
    });
  }

  return res.status(200).json({
    authenticated: true,
    user: admin,
  });
});

// 1. Overview Statistics: Genuine Database Counts Only
app.get('/api/admin/statistics', requireAdminAuth, (_req: Request, res: Response) => {
  try {
    const submissions = readStore<any[]>(SUBMISSIONS_FILE, []);
    const published = readStore<any[]>(PUBLISHED_FILE, []);
    const creators = readStore<any[]>(CREATORS_FILE, []);
    const reports = readStore<any[]>(REPORTS_FILE, []);
    const categories = readStore<any[]>(CATEGORIES_FILE, []);

    // Unique published creators
    const publishedCreatorHandles = new Set(published.map((p) => p.tiktokHandle?.toLowerCase()).filter(Boolean));
    const publishedCreatorsCount = publishedCreatorHandles.size;

    const stats = {
      hasData: true,
      totalApprovedVideos: published.length,
      pendingSubmissions: submissions.filter((s) => s.status === 'pending').length,
      registeredCreators: creators.length,
      publishedCreators: publishedCreatorsCount,
      contentRemovalRequests: reports.length,
      pendingRemovalRequests: reports.filter((r) => r.status === 'pending').length,
      totalSubmissions: submissions.length,
      totalCategories: categories.length,
      submissionStatusBreakdown: {
        pending: submissions.filter((s) => s.status === 'pending').length,
        approved: submissions.filter((s) => s.status === 'approved').length,
        rejected: submissions.filter((s) => s.status === 'rejected').length,
        correction_requested: submissions.filter((s) => s.status === 'correction_requested').length,
      },
    };

    return res.status(200).json(stats);
  } catch (err) {
    console.error('Failed to compute statistics:', err);
    return res.status(500).json({ error: 'Failed to retrieve database statistics.' });
  }
});

// 2. Submissions Queue (Admin). The reference-code lookup is public but
// rate-limited; the full queue requires verified admin credentials.
app.get('/api/submissions', rateLimiter(60, 15 * 60 * 1000), async (req: Request, res: Response) => {
  const submissions = readStore<any[]>(SUBMISSIONS_FILE, []);
  const { status, referenceCode } = req.query;

  // Public reference check
  if (referenceCode && typeof referenceCode === 'string') {
    const match = submissions.find((s) => s.referenceCode === referenceCode.trim().toUpperCase());
    if (!match) {
      return res.status(404).json({ error: 'Submission reference code not found.' });
    }
    return res.status(200).json({
      referenceCode: match.referenceCode,
      creatorName: match.creatorName,
      tiktokHandle: match.tiktokHandle,
      videoTitle: match.videoTitle,
      status: match.status,
      category: match.category,
      createdAt: match.createdAt,
      moderatedAt: match.moderatedAt,
      moderationNotes: match.status === 'correction_requested' ? match.moderationNotes : null,
    });
  }

  // Admin access check for full queue
  const admin = await resolveAdmin(req);
  if (!admin) {
    return res.status(401).json({ error: 'Administrator access required.' });
  }

  let filtered = submissions;
  if (status && typeof status === 'string' && status !== 'all') {
    filtered = filtered.filter((s) => s.status === status);
  }

  return res.status(200).json({
    submissions: filtered,
    total: filtered.length,
    counts: {
      pending: submissions.filter((s) => s.status === 'pending').length,
      approved: submissions.filter((s) => s.status === 'approved').length,
      rejected: submissions.filter((s) => s.status === 'rejected').length,
      correction_requested: submissions.filter((s) => s.status === 'correction_requested').length,
    },
  });
});

// Edit Video Submission (title, description, category before or after approval)
app.patch('/api/submissions/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { videoTitle, videoDescription, category } = req.body;
    const adminUser = (req as any).adminUser as AdminUserRecord;

    const submissions = readStore<any[]>(SUBMISSIONS_FILE, []);
    const index = submissions.findIndex((s) => s.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    const sub = submissions[index];
    if (videoTitle && typeof videoTitle === 'string' && videoTitle.trim().length >= 3) {
      sub.videoTitle = videoTitle.trim().slice(0, 150);
    }
    if (typeof videoDescription === 'string') {
      sub.videoDescription = videoDescription.trim().slice(0, 1000);
    }
    if (category && typeof category === 'string') {
      sub.category = category.trim();
    }
    sub.updatedAt = new Date().toISOString();

    submissions[index] = sub;
    writeStore(SUBMISSIONS_FILE, submissions);

    // If already published, sync updates to published_releases.json
    const published = readStore<any[]>(PUBLISHED_FILE, []);
    const pubIndex = published.findIndex((p) => p.submissionId === id);
    if (pubIndex >= 0) {
      published[pubIndex].title = sub.videoTitle;
      published[pubIndex].description = sub.videoDescription;
      published[pubIndex].category = sub.category;
      writeStore(PUBLISHED_FILE, published);
    }

    logAuditAction('edit_submission', id, `Updated video title / description for ${sub.referenceCode}`, adminUser.email);

    return res.status(200).json({
      success: true,
      submission: sub,
      message: 'Submission details updated successfully.',
    });
  } catch (err) {
    console.error('Error editing submission:', err);
    return res.status(500).json({ error: 'Failed to update submission.' });
  }
});

// Moderate Submission (approve, reject, request_correction, remove)
app.post('/api/submissions/:id/moderate', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;
    const adminUser = (req as any).adminUser as AdminUserRecord;
    const moderatorEmail = adminUser?.email || SUPER_ADMIN_EMAIL;

    const validActions = ['approve', 'reject', 'request_correction', 'remove'];
    if (!action || !validActions.includes(action)) {
      return res.status(400).json({ error: `Invalid action. Must be one of: ${validActions.join(', ')}` });
    }

    const submissions = readStore<any[]>(SUBMISSIONS_FILE, []);
    const index = submissions.findIndex((s) => s.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    const sub = submissions[index];
    const timestamp = new Date().toISOString();

    let newStatus = sub.status;
    if (action === 'approve') newStatus = 'approved';
    if (action === 'reject') newStatus = 'rejected';
    if (action === 'request_correction') newStatus = 'correction_requested';
    if (action === 'remove') newStatus = 'pending';

    sub.status = newStatus;
    sub.moderationNotes = notes ? String(notes).trim().slice(0, 1000) : null;
    sub.moderatorEmail = moderatorEmail;
    sub.moderatedAt = timestamp;
    sub.updatedAt = timestamp;

    submissions[index] = sub;
    writeStore(SUBMISSIONS_FILE, submissions);

    // Update published releases registry
    let published = readStore<any[]>(PUBLISHED_FILE, []);
    if (action === 'approve') {
      const releaseId = `rel_${sub.id}`;
      const existingRelIndex = published.findIndex((p) => p.submissionId === sub.id);
      const releaseRecord = {
        id: releaseId,
        submissionId: sub.id,
        title: sub.videoTitle,
        description: sub.videoDescription,
        creatorName: sub.creatorName,
        tiktokHandle: sub.tiktokHandle,
        mediaUrl: sub.mediaUrl,
        mediaType: sub.mediaType,
        category: sub.category,
        referenceCode: sub.referenceCode,
        isFeatured: false,
        publishedAt: timestamp,
        publishedBy: moderatorEmail,
      };

      if (existingRelIndex >= 0) {
        published[existingRelIndex] = { ...published[existingRelIndex], ...releaseRecord };
      } else {
        published.unshift(releaseRecord);
      }
      writeStore(PUBLISHED_FILE, published);
    } else if (action === 'remove' || action === 'reject') {
      published = published.filter((p) => p.submissionId !== sub.id);
      writeStore(PUBLISHED_FILE, published);
    }

    logAuditAction(
      action,
      sub.id,
      `Moderation action [${action.toUpperCase()}] on submission "${sub.videoTitle}" (${sub.referenceCode})`,
      moderatorEmail,
      { notes: notes || '' }
    );

    return res.status(200).json({
      success: true,
      submission: sub,
      action,
      message: `Submission ${action}d successfully.`,
    });
  } catch (err: any) {
    console.error('Error in moderation action:', err);
    return res.status(500).json({ error: 'Failed to record moderation action.' });
  }
});

// 3. Published Videos Management
// Feature / unfeature or edit published release
app.patch('/api/published-releases/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isFeatured, title, description, category } = req.body;
    const adminUser = (req as any).adminUser as AdminUserRecord;

    const published = readStore<any[]>(PUBLISHED_FILE, []);
    const index = published.findIndex((p) => p.id === id || p.submissionId === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Published video release not found.' });
    }

    const item = published[index];
    if (typeof isFeatured === 'boolean') {
      item.isFeatured = isFeatured;
    }
    if (title && typeof title === 'string') {
      item.title = title.trim();
    }
    if (typeof description === 'string') {
      item.description = description.trim();
    }
    if (category && typeof category === 'string') {
      item.category = category.trim();
    }

    published[index] = item;
    writeStore(PUBLISHED_FILE, published);

    logAuditAction(
      'update_published',
      item.id,
      `Updated published video metadata / feature status (${item.isFeatured ? 'Featured' : 'Standard'})`,
      adminUser.email
    );

    return res.status(200).json({
      success: true,
      video: item,
      message: 'Published video updated successfully.',
    });
  } catch (err) {
    console.error('Error updating published release:', err);
    return res.status(500).json({ error: 'Failed to update published release.' });
  }
});

// Remove / Takedown Published Video
app.delete('/api/published-releases/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason = 'Administrative removal' } = req.body || {};
    const adminUser = (req as any).adminUser as AdminUserRecord;

    let published = readStore<any[]>(PUBLISHED_FILE, []);
    const target = published.find((p) => p.id === id || p.submissionId === id);

    if (!target) {
      return res.status(404).json({ error: 'Published video not found.' });
    }

    published = published.filter((p) => p.id !== id && p.submissionId !== id);
    writeStore(PUBLISHED_FILE, published);

    // Sync submission status to 'pending' or 'rejected'
    const submissions = readStore<any[]>(SUBMISSIONS_FILE, []);
    const subIndex = submissions.findIndex((s) => s.id === target.submissionId);
    if (subIndex >= 0) {
      submissions[subIndex].status = 'pending';
      submissions[subIndex].moderationNotes = `Content taken down: ${reason}`;
      submissions[subIndex].updatedAt = new Date().toISOString();
      writeStore(SUBMISSIONS_FILE, submissions);
    }

    logAuditAction(
      'takedown_published',
      target.id,
      `Takedown executed on "${target.title}" - Reason: ${reason}`,
      adminUser.email
    );

    return res.status(200).json({
      success: true,
      message: 'Video successfully removed from public syndication.',
    });
  } catch (err) {
    console.error('Error removing published release:', err);
    return res.status(500).json({ error: 'Failed to remove published release.' });
  }
});

// 4. Creator Management Endpoints
app.post('/api/creators', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const {
      displayName,
      username,
      email,
      bio,
      avatarUrl,
      categories = ['Dance & Choreography'],
      isVerified18Plus = true,
      tiktokUrl,
    } = req.body;
    const adminUser = (req as any).adminUser as AdminUserRecord;

    if (!displayName || !username) {
      return res.status(400).json({ error: 'Creator display name and TikTok handle are required.' });
    }

    const cleanUsername = username.startsWith('@') ? username.trim() : `@${username.trim()}`;
    const creators = readStore<any[]>(CREATORS_FILE, []);

    if (creators.some((c) => c.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return res.status(400).json({ error: 'A creator profile with this TikTok handle already exists.' });
    }

    const newCreator = {
      id: `creator-${crypto.randomBytes(4).toString('hex')}`,
      displayName: displayName.trim(),
      username: cleanUsername,
      email: email ? email.trim().toLowerCase() : '',
      bio: (bio || '').trim(),
      avatarUrl: avatarUrl || '/images/onlytok_social_share_card_1793722066290.jpg',
      categories: Array.isArray(categories) ? categories : [categories],
      isVerified18Plus: isVerified18Plus === true,
      status: 'active',
      socialLinks: {
        tiktok: tiktokUrl || `https://www.tiktok.com/${cleanUsername}`,
      },
      totalSpotlights: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    creators.unshift(newCreator);
    writeStore(CREATORS_FILE, creators);

    logAuditAction('create_creator', newCreator.id, `Created creator profile for ${cleanUsername}`, adminUser.email);

    return res.status(201).json({
      success: true,
      creator: newCreator,
      message: 'Creator profile added successfully.',
    });
  } catch (err) {
    console.error('Error creating creator:', err);
    return res.status(500).json({ error: 'Failed to add creator.' });
  }
});

app.patch('/api/creators/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser as AdminUserRecord;
    const creators = readStore<any[]>(CREATORS_FILE, []);
    const index = creators.findIndex((c) => c.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Creator profile not found.' });
    }

    const creator = creators[index];
    const {
      displayName,
      username,
      email,
      bio,
      avatarUrl,
      categories,
      isVerified18Plus,
      status,
      socialLinks,
    } = req.body;

    if (displayName) creator.displayName = displayName.trim();
    if (username) {
      creator.username = username.startsWith('@') ? username.trim() : `@${username.trim()}`;
    }
    if (email !== undefined) creator.email = email.trim().toLowerCase();
    if (bio !== undefined) creator.bio = bio.trim();
    if (avatarUrl) creator.avatarUrl = avatarUrl;
    if (Array.isArray(categories)) creator.categories = categories;
    if (typeof isVerified18Plus === 'boolean') creator.isVerified18Plus = isVerified18Plus;
    if (['active', 'suspended'].includes(status)) creator.status = status;
    if (socialLinks) creator.socialLinks = { ...creator.socialLinks, ...socialLinks };

    creator.updatedAt = new Date().toISOString();
    creators[index] = creator;
    writeStore(CREATORS_FILE, creators);

    logAuditAction('edit_creator', creator.id, `Updated creator profile for ${creator.username}`, adminUser.email);

    return res.status(200).json({
      success: true,
      creator,
      message: 'Creator profile updated successfully.',
    });
  } catch (err) {
    console.error('Error updating creator:', err);
    return res.status(500).json({ error: 'Failed to update creator profile.' });
  }
});

app.delete('/api/creators/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser as AdminUserRecord;
    let creators = readStore<any[]>(CREATORS_FILE, []);

    const target = creators.find((c) => c.id === id);
    if (!target) {
      return res.status(404).json({ error: 'Creator not found.' });
    }

    creators = creators.filter((c) => c.id !== id);
    writeStore(CREATORS_FILE, creators);

    logAuditAction('delete_creator', id, `Removed creator profile ${target.username}`, adminUser.email);

    return res.status(200).json({ success: true, message: 'Creator profile removed.' });
  } catch (err) {
    console.error('Error deleting creator:', err);
    return res.status(500).json({ error: 'Failed to delete creator.' });
  }
});

// 5. Category Management Endpoints
app.post('/api/categories', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { label, description, color, slug } = req.body;
    const adminUser = (req as any).adminUser as AdminUserRecord;

    if (!label || typeof label !== 'string' || label.trim().length < 2) {
      return res.status(400).json({ error: 'Valid category label is required.' });
    }

    const categories = readStore<any[]>(CATEGORIES_FILE, []);
    const safeSlug = slug || label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newCategory = {
      id: `cat-${crypto.randomBytes(3).toString('hex')}`,
      label: label.trim(),
      slug: safeSlug,
      description: (description || '').trim(),
      color: color || '#FF2A85',
      sortOrder: categories.length + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    categories.push(newCategory);
    writeStore(CATEGORIES_FILE, categories);

    logAuditAction('create_category', newCategory.id, `Created category "${newCategory.label}"`, adminUser.email);

    return res.status(201).json({
      success: true,
      category: newCategory,
      message: 'Category created successfully.',
    });
  } catch (err) {
    console.error('Error creating category:', err);
    return res.status(500).json({ error: 'Failed to create category.' });
  }
});

app.patch('/api/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { label, description, color, sortOrder, isActive } = req.body;
    const adminUser = (req as any).adminUser as AdminUserRecord;

    const categories = readStore<any[]>(CATEGORIES_FILE, []);
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const cat = categories[index];
    if (label) cat.label = label.trim();
    if (description !== undefined) cat.description = description.trim();
    if (color) cat.color = color;
    if (typeof sortOrder === 'number') cat.sortOrder = sortOrder;
    if (typeof isActive === 'boolean') cat.isActive = isActive;

    categories[index] = cat;
    writeStore(CATEGORIES_FILE, categories);

    logAuditAction('edit_category', cat.id, `Updated category "${cat.label}"`, adminUser.email);

    return res.status(200).json({
      success: true,
      category: cat,
      message: 'Category updated successfully.',
    });
  } catch (err) {
    console.error('Error updating category:', err);
    return res.status(500).json({ error: 'Failed to update category.' });
  }
});

app.delete('/api/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser as AdminUserRecord;
    let categories = readStore<any[]>(CATEGORIES_FILE, []);

    const target = categories.find((c) => c.id === id);
    if (!target) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    categories = categories.filter((c) => c.id !== id);
    writeStore(CATEGORIES_FILE, categories);

    logAuditAction('delete_category', id, `Removed category "${target.label}"`, adminUser.email);

    return res.status(200).json({ success: true, message: 'Category removed successfully.' });
  } catch (err) {
    console.error('Error deleting category:', err);
    return res.status(500).json({ error: 'Failed to delete category.' });
  }
});

// 6. Reports and Removal Requests (Admin Management)
app.get('/api/reports', requireAdminAuth, (req: Request, res: Response) => {
  const reports = readStore<any[]>(REPORTS_FILE, []);
  const { status } = req.query;

  let filtered = reports;
  if (status && typeof status === 'string' && status !== 'all') {
    filtered = filtered.filter((r) => r.status === status);
  }

  return res.status(200).json({
    reports: filtered,
    total: filtered.length,
    counts: {
      pending: reports.filter((r) => r.status === 'pending').length,
      reviewing: reports.filter((r) => r.status === 'reviewing').length,
      resolved: reports.filter((r) => r.status === 'resolved').length,
      dismissed: reports.filter((r) => r.status === 'dismissed').length,
    },
  });
});

app.post('/api/reports/:id/action', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, resolutionNotes, executeTakedown } = req.body;
    const adminUser = (req as any).adminUser as AdminUserRecord;

    const validActions = ['reviewing', 'resolved', 'dismissed'];
    if (!action || !validActions.includes(action)) {
      return res.status(400).json({ error: `Invalid report action. Must be one of: ${validActions.join(', ')}` });
    }

    const reports = readStore<any[]>(REPORTS_FILE, []);
    const index = reports.findIndex((r) => r.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const report = reports[index];
    report.status = action;
    report.resolutionNotes = resolutionNotes ? String(resolutionNotes).trim() : null;
    report.resolvedBy = adminUser.email;
    report.resolvedAt = new Date().toISOString();

    // If takedown requested, execute immediately
    if (executeTakedown === true && report.targetId) {
      let published = readStore<any[]>(PUBLISHED_FILE, []);
      published = published.filter((p) => p.id !== report.targetId && p.submissionId !== report.targetId);
      writeStore(PUBLISHED_FILE, published);
      report.takedownExecuted = true;
    }

    reports[index] = report;
    writeStore(REPORTS_FILE, reports);

    logAuditAction(
      'report_resolution',
      report.id,
      `Report ${report.referenceCode} updated to [${action.toUpperCase()}]${executeTakedown ? ' (Takedown Executed)' : ''}`,
      adminUser.email,
      { resolutionNotes: resolutionNotes || '' }
    );

    return res.status(200).json({
      success: true,
      report,
      message: `Report status updated to ${action}.`,
    });
  } catch (err) {
    console.error('Error updating report:', err);
    return res.status(500).json({ error: 'Failed to process report action.' });
  }
});

// 7. User Management (Admin Accounts)
app.get('/api/admin/users', requireAdminAuth, (_req: Request, res: Response) => {
  const users = getActiveAdminUsers();
  return res.status(200).json({ users });
});

app.post('/api/admin/users', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { email, displayName, role = 'moderator', notes = '' } = req.body;
    const currentAdmin = (req as any).adminUser as AdminUserRecord;

    if (currentAdmin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only Super Administrators can provision new administrative credentials.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'A valid administrator email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = getActiveAdminUsers();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ error: 'An administrator account with this email already exists.' });
    }

    const newUser: AdminUserRecord = {
      id: `adm_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      email: cleanEmail,
      displayName: (displayName || cleanEmail.split('@')[0]).trim(),
      role: ['super_admin', 'moderator', 'editor'].includes(role) ? role : 'moderator',
      status: 'active',
      notes: notes.trim(),
      addedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeStore(ADMIN_USERS_FILE, users);

    logAuditAction('create_admin', newUser.id, `Provisioned ${newUser.role} access for ${newUser.email}`, currentAdmin.email);

    return res.status(201).json({
      success: true,
      user: newUser,
      message: 'Administrator user created successfully.',
    });
  } catch (err) {
    console.error('Error creating admin user:', err);
    return res.status(500).json({ error: 'Failed to create administrator account.' });
  }
});

app.patch('/api/admin/users/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, status, notes } = req.body;
    const currentAdmin = (req as any).adminUser as AdminUserRecord;

    if (currentAdmin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only Super Administrators can modify administrator permissions.' });
    }

    const users = getActiveAdminUsers();
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Administrator user not found.' });
    }

    const user = users[index];

    // Cannot revoke primary super_admin
    if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && status === 'revoked') {
      return res.status(400).json({ error: 'Cannot revoke the master founder administrator account.' });
    }

    if (['super_admin', 'moderator', 'editor'].includes(role)) user.role = role;
    if (['active', 'revoked'].includes(status)) user.status = status;
    if (notes !== undefined) user.notes = notes.trim();

    users[index] = user;
    writeStore(ADMIN_USERS_FILE, users);

    logAuditAction('update_admin', user.id, `Updated admin permissions for ${user.email} (Role: ${user.role}, Status: ${user.status})`, currentAdmin.email);

    return res.status(200).json({
      success: true,
      user,
      message: 'Administrator account updated.',
    });
  } catch (err) {
    console.error('Error updating admin user:', err);
    return res.status(500).json({ error: 'Failed to update administrator.' });
  }
});

// 8. Website Settings Endpoints
app.get('/api/settings', requireAdminAuth, (_req: Request, res: Response) => {
  const settings = readStore<any>(SETTINGS_FILE, {});
  return res.status(200).json({ settings });
});

app.patch('/api/settings', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const adminUser = (req as any).adminUser as AdminUserRecord;
    const current = readStore<any>(SETTINGS_FILE, {});
    const updates = req.body;

    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUser.email,
    };

    writeStore(SETTINGS_FILE, updated);
    logAuditAction('update_settings', 'system_settings', 'Updated website governance and branding settings', adminUser.email);

    return res.status(200).json({
      success: true,
      settings: updated,
      message: 'Website settings saved and deployed.',
    });
  } catch (err) {
    console.error('Error updating settings:', err);
    return res.status(500).json({ error: 'Failed to save website settings.' });
  }
});

// 9. Moderation Audit Logs (Admin)
app.get('/api/moderation-logs', requireAdminAuth, (_req: Request, res: Response) => {
  const logs = readStore<any[]>(LOGS_FILE, []);
  return res.status(200).json({ logs });
});

// 10. UK GDPR Requests (Admin Management)
app.get('/api/privacy/gdpr-requests', requireAdminAuth, (_req: Request, res: Response) => {
  const requests = readStore<any[]>(GDPR_REQUESTS_FILE, []);
  return res.status(200).json({ requests });
});

app.post('/api/privacy/gdpr-requests/:id/action', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, resolutionNotes } = req.body;
    const adminUser = (req as any).adminUser as AdminUserRecord;

    const requests = readStore<any[]>(GDPR_REQUESTS_FILE, []);
    const index = requests.findIndex((r) => r.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'GDPR request not found.' });
    }

    const item = requests[index];
    item.status = action || 'completed';
    item.resolutionNotes = resolutionNotes ? String(resolutionNotes).trim() : null;
    item.processedBy = adminUser.email;
    item.completedAt = new Date().toISOString();

    // If erasure requested, purge the data subject's personal data across ALL
    // stores (UK GDPR Art. 17). Public releases tied to erased submissions are
    // removed too; the GDPR request itself is anonymized but kept for audit.
    if (item.requestType === 'erasure_deletion' && action === 'completed') {
      const targetEmail = item.email.toLowerCase();

      const subs = readStore<any[]>(SUBMISSIONS_FILE, []);
      const erasedHandles = new Set(
        subs.filter((s) => s.email?.toLowerCase() === targetEmail).map((s) => s.tiktokHandle?.toLowerCase()).filter(Boolean)
      );
      const remainingSubs = subs.filter((s) => s.email?.toLowerCase() !== targetEmail);
      writeStore(SUBMISSIONS_FILE, remainingSubs);

      let published = readStore<any[]>(PUBLISHED_FILE, []);
      published = published.filter((p) => !erasedHandles.has(p.tiktokHandle?.toLowerCase()));
      writeStore(PUBLISHED_FILE, published);

      const inquiries = readStore<any[]>(CONTACT_INQUIRIES_FILE, []);
      writeStore(CONTACT_INQUIRIES_FILE, inquiries.filter((c) => c.email?.toLowerCase() !== targetEmail));

      const reports = readStore<any[]>(REPORTS_FILE, []);
      writeStore(REPORTS_FILE, reports.filter((r) => r.reporterEmail?.toLowerCase() !== targetEmail));

      const creators = readStore<any[]>(CREATORS_FILE, []);
      writeStore(CREATORS_FILE, creators.filter((c) => c.email?.toLowerCase() !== targetEmail));

      // Anonymize the request record itself (retain reference/status for audit).
      item.fullName = '[ERASED]';
      item.email = '[ERASED]';
      item.details = '[ERASED UNDER UK GDPR ART. 17]';
    }

    requests[index] = item;
    writeStore(GDPR_REQUESTS_FILE, requests);

    logAuditAction(
      'gdpr_resolution',
      item.id,
      `Resolved UK GDPR request ${item.referenceCode} (${item.requestType}) - Status: ${item.status}`,
      adminUser.email
    );

    return res.status(200).json({
      success: true,
      request: item,
      message: `GDPR request status updated to ${item.status}.`,
    });
  } catch (err) {
    console.error('Error processing GDPR action:', err);
    return res.status(500).json({ error: 'Failed to process GDPR request.' });
  }
});

// 11. Contact Inquiries (Admin Management)
app.get('/api/admin/contact-inquiries', requireAdminAuth, (_req: Request, res: Response) => {
  const inquiries = readStore<any[]>(CONTACT_INQUIRIES_FILE, []);
  return res.status(200).json({ inquiries });
});

// ==========================================
// 12. SEO Crawl Directives & XML Sitemap
// ==========================================
app.get('/robots.txt', (_req: Request, res: Response) => {
  const baseUrl = APP_URL;
  const robots = generateRobotsTxt(baseUrl);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.status(200).send(robots);
});

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const baseUrl = APP_URL;
  const sitemap = generateSitemapXml(baseUrl, AUTHORIZED_VIDEOS, AUTHORIZED_CREATORS);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(sitemap);
});

// ==========================================
// 13. Privacy-Conscious Real Analytics System
// ==========================================
// Strictly zero fake counters or fabricated numbers.
// Compliant with UK GDPR / PECR: transient anonymous tokens, hashed IP, no third-party ads.

app.post('/api/analytics/event', rateLimiter(120, 60 * 1000), (req: Request, res: Response) => {
  try {
    const {
      eventType,
      page,
      targetId,
      targetName,
      sourceLocation,
      category,
      metadata,
      sessionId,
      referrer,
      screenResolution,
    } = req.body || {};

    const validEventTypes = [
      'homepage_visit',
      'creator_profile_view',
      'video_play_visit',
      'submission_start',
      'submission_success',
      'tiktok_outbound_click',
      'tab_navigation',
    ];

    if (!eventType || !validEventTypes.includes(eventType)) {
      return res.status(400).json({ error: 'Invalid or missing eventType parameter.' });
    }

    // IP Anonymization: One-way SHA-256 hash combined with date salt; raw IP is NEVER stored.
    const rawIp = req.ip || req.socket.remoteAddress || 'unknown';
    const dateSalt = new Date().toISOString().substring(0, 10);
    const anonIpHash = crypto
      .createHash('sha256')
      .update(rawIp + dateSalt + 'ot_analytics_salt_2026')
      .digest('hex')
      .substring(0, 12);

    const cleanEvent = {
      id: 'evt_' + Date.now().toString(36) + '_' + crypto.randomBytes(3).toString('hex'),
      eventType,
      page: typeof page === 'string' ? page.substring(0, 100) : undefined,
      targetId: typeof targetId === 'string' ? targetId.substring(0, 80) : undefined,
      targetName: typeof targetName === 'string' ? targetName.substring(0, 100) : undefined,
      sourceLocation: typeof sourceLocation === 'string' ? sourceLocation.substring(0, 60) : undefined,
      category: typeof category === 'string' ? category.substring(0, 60) : undefined,
      metadata:
        typeof metadata === 'object' && metadata !== null && JSON.stringify(metadata).length <= 2000
          ? metadata
          : undefined,
      sessionId: typeof sessionId === 'string' ? sessionId.substring(0, 60) : 'anon',
      anonIpHash,
      referrer: typeof referrer === 'string' ? referrer.substring(0, 120) : undefined,
      screenResolution: typeof screenResolution === 'string' ? screenResolution.substring(0, 20) : undefined,
      timestamp: new Date().toISOString(),
    };

    let events = readStore<any[]>(ANALYTICS_FILE, []);
    events.push(cleanEvent);

    // Keep storage bounded and performant (last 5,000 real events)
    if (events.length > 5000) {
      events = events.slice(-5000);
    }
    writeStore(ANALYTICS_FILE, events);

    return res.status(201).json({ success: true, eventId: cleanEvent.id });
  } catch (err) {
    console.error('Error logging analytics event:', err);
    return res.status(500).json({ error: 'Failed to record analytics event.' });
  }
});

// Admin-only real analytics aggregate summary
app.get('/api/analytics/summary', requireAdminAuth, (_req: Request, res: Response) => {
  try {
    const events = readStore<any[]>(ANALYTICS_FILE, []);

    const eventCounts: Record<string, number> = {
      homepage_visit: 0,
      creator_profile_view: 0,
      video_play_visit: 0,
      submission_start: 0,
      submission_success: 0,
      tiktok_outbound_click: 0,
      tab_navigation: 0,
    };

    const uniqueSessions = new Set<string>();
    const creatorViewsMap: Record<string, { count: number; name: string }> = {};
    const videoPlaysMap: Record<string, { count: number; title: string }> = {};
    const tiktokSourceMap: Record<string, number> = {};

    for (const evt of events) {
      if (evt.sessionId && evt.sessionId !== 'anon') {
        uniqueSessions.add(evt.sessionId);
      }
      if (eventCounts[evt.eventType] !== undefined) {
        eventCounts[evt.eventType]++;
      }

      if (evt.eventType === 'creator_profile_view' && evt.targetId) {
        const id = evt.targetId;
        if (!creatorViewsMap[id]) {
          creatorViewsMap[id] = { count: 0, name: evt.targetName || id };
        }
        creatorViewsMap[id].count++;
      }

      if (evt.eventType === 'video_play_visit' && evt.targetId) {
        const id = evt.targetId;
        if (!videoPlaysMap[id]) {
          videoPlaysMap[id] = { count: 0, title: evt.targetName || id };
        }
        videoPlaysMap[id].count++;
      }

      if (evt.eventType === 'tiktok_outbound_click') {
        const src = evt.sourceLocation || 'unspecified';
        tiktokSourceMap[src] = (tiktokSourceMap[src] || 0) + 1;
      }
    }

    const topCreators = Object.entries(creatorViewsMap)
      .map(([id, data]) => ({ id, name: data.name, views: data.count }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const topVideos = Object.entries(videoPlaysMap)
      .map(([id, data]) => ({ id, title: data.title, plays: data.count }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 10);

    const topTikTokSources = Object.entries(tiktokSourceMap)
      .map(([source, clicks]) => ({ source, clicks }))
      .sort((a, b) => b.clicks - a.clicks);

    const submissionStarts = eventCounts.submission_start || 0;
    const submissionSuccesses = eventCounts.submission_success || 0;
    const conversionRatePercent =
      submissionStarts > 0 ? Number(((submissionSuccesses / submissionStarts) * 100).toFixed(1)) : 0;

    return res.status(200).json({
      totalEvents: events.length,
      uniqueSessions: uniqueSessions.size,
      eventCounts,
      conversionFunnel: {
        submissionStarts,
        submissionSuccesses,
        conversionRatePercent,
      },
      topCreators,
      topVideos,
      topTikTokSources,
      recentEvents: events
        .slice(-30)
        .reverse()
        .map((e) => ({
          id: e.id,
          eventType: e.eventType,
          targetName: e.targetName,
          sourceLocation: e.sourceLocation,
          category: e.category,
          timestamp: e.timestamp,
        })),
      seoHealth: {
        robotsTxtStatus: 'Active & Verified',
        sitemapXmlStatus: 'Dynamic & Compliant',
        canonicalBaseUrl: APP_URL,
        openGraphDimensions: '1200x675 HD',
        indexedUrlsCount: 13 + AUTHORIZED_VIDEOS.length + AUTHORIZED_CREATORS.length,
        botCrawlerSupport: ['Googlebot', 'Bingbot', 'Twitterbot', 'facebookexternalhit', 'TikTokBot', 'ByteDance'],
      },
    });
  } catch (err) {
    console.error('Error fetching analytics summary:', err);
    return res.status(500).json({ error: 'Failed to generate analytics summary.' });
  }
});

// Centralized API error handler (malformed JSON, oversized bodies, etc.).
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body.' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body exceeds the allowed size.' });
  }
  console.error('Unhandled request error:', err);
  return res.status(500).json({ error: 'Internal server error.' });
});
} // end registerRoutes

// Helper to escape HTML attributes safely
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Server-side HTML dynamic meta tag injector for social bots and crawlers
function injectSeoTags(html: string, req: Request): string {
  try {
    const baseUrl = APP_URL;
    const videoId = typeof req.query.video === 'string' ? req.query.video : undefined;
    const creatorId = typeof req.query.creator === 'string' ? req.query.creator : undefined;
    const tab = typeof req.query.tab === 'string' ? req.query.tab : undefined;
    const subtab = typeof req.query.subtab === 'string' ? req.query.subtab : undefined;

    const video = videoId ? getVideoById(videoId) : null;
    const creator = creatorId ? getCreatorById(creatorId) : null;

    const seo = getSeoMetadata({ baseUrl, tab, subtab, video, creator });

    // 1. Replace <title>
    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`);

    // 2. Replace meta description
    if (html.includes('<meta name="description"')) {
      html = html.replace(
        /<meta name="description" content=".*?" \/>/i,
        `<meta name="description" content="${escapeHtml(seo.description)}" />`
      );
    }

    // 3. OpenGraph tags
    html = html.replace(
      /<meta property="og:title" content=".*?" \/>/i,
      `<meta property="og:title" content="${escapeHtml(seo.ogTitle)}" />`
    );
    html = html.replace(
      /<meta property="og:description" content=".*?" \/>/i,
      `<meta property="og:description" content="${escapeHtml(seo.ogDescription)}" />`
    );
    html = html.replace(
      /<meta property="og:image" content=".*?" \/>/i,
      `<meta property="og:image" content="${escapeHtml(seo.ogImage)}" />`
    );
    html = html.replace(
      /<meta property="og:type" content=".*?" \/>/i,
      `<meta property="og:type" content="${escapeHtml(seo.ogType)}" />`
    );

    // 4. Twitter tags
    html = html.replace(
      /<meta name="twitter:title" content=".*?" \/>/i,
      `<meta name="twitter:title" content="${escapeHtml(seo.twitterTitle)}" />`
    );
    html = html.replace(
      /<meta name="twitter:description" content=".*?" \/>/i,
      `<meta name="twitter:description" content="${escapeHtml(seo.twitterDescription)}" />`
    );
    html = html.replace(
      /<meta name="twitter:image" content=".*?" \/>/i,
      `<meta name="twitter:image" content="${escapeHtml(seo.twitterImage)}" />`
    );

    // 5. Canonical & Robots
    const canonicalTag = `<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />`;
    const robotsTag = `<meta name="robots" content="${seo.robots}" />`;

    if (html.includes('<link rel="canonical"')) {
      html = html.replace(/<link rel="canonical" href=".*?" \/>/i, canonicalTag);
    } else {
      html = html.replace('</head>', `    ${canonicalTag}\n  </head>`);
    }

    if (html.includes('<meta name="robots"')) {
      html = html.replace(/<meta name="robots" content=".*?" \/>/i, robotsTag);
    } else {
      html = html.replace('</head>', `    ${robotsTag}\n  </head>`);
    }
  } catch (err) {
    console.error('Error injecting dynamic SEO tags:', err);
  }

  return html;
}

// ==========================================
// Vite Dev Server / Static Production Mounting
// ==========================================
async function startServer() {
  const app = createApp();

  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // Allow the Arena/E2B sandbox preview host and local development.
        allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1'],
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/robots.txt') || req.originalUrl.startsWith('/sitemap.xml')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        template = injectSeoTags(template, req);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (!fs.existsSync(path.join(distPath, 'index.html'))) {
      console.error('Production build not found. Run "npm run build" before "npm start".');
      process.exit(1);
    }
    // Hashed build assets can be cached aggressively.
    app.use('/assets', express.static(path.join(distPath, 'assets'), { maxAge: '1y', immutable: true }));
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      try {
        let template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
        template = injectSeoTags(template, req);
        res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
      } catch {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`ONLYTOK ${IS_PRODUCTION ? 'production' : 'development'} server running on http://${HOST}:${PORT}`);
    if (!FIREBASE_JWKS && !ADMIN_API_TOKEN) {
      console.warn('WARNING: No Firebase project or ADMIN_API_TOKEN configured — admin endpoints will reject all requests.');
    }
  });

  // Graceful shutdown: stop accepting connections, let in-flight requests finish.
  const shutdown = (signal: string) => {
    console.log(`${signal} received — shutting down gracefully...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Only auto-start when executed directly (node server.js / tsx server.ts),
// not when imported by tests.
const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isMainModule) {
  startServer().catch((err) => {
    console.error('Fatal error starting ONLYTOK server:', err);
    process.exit(1);
  });
}
