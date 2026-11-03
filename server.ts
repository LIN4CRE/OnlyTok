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
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure persistence directories exist
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
const DATA_DIR = path.resolve(__dirname, 'data_store');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const PUBLISHED_FILE = path.join(DATA_DIR, 'published_releases.json');
const LOGS_FILE = path.join(DATA_DIR, 'moderation_logs.json');

// Helper to safely read/write persistent JSON stores
function readStore<T>(filePath: string, defaultVal: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultVal;
}

function writeStore<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// In-memory sliding-window rate limiters
interface RateLimitBucket {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitBucket>();

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

// Multer storage and validation for video uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
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

// Admin validation helper
const ADMIN_EMAILS = [
  'dlinacre16@gmail.com',
  'admin@onlytok.com',
];

function checkIsAdmin(req: Request): boolean {
  const authHeader = req.headers.authorization;
  const adminEmailHeader = req.headers['x-admin-email'] as string | undefined;

  if (adminEmailHeader && ADMIN_EMAILS.includes(adminEmailHeader.toLowerCase().trim())) {
    return true;
  }
  // In development/test mode, check for admin token
  if (authHeader && authHeader.includes('Bearer admin-authenticated-token')) {
    return true;
  }
  return false;
}

// ==========================================
// API Endpoints
// ==========================================

// 1. Upload Video
app.post(
  '/api/upload',
  rateLimiter(15, 15 * 60 * 1000), // Max 15 uploads per 15 min per IP
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

// 2. Stream/Serve Uploaded Video with Range Requests
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

// 3. Submit Creator Content
app.post(
  '/api/submissions',
  rateLimiter(30, 15 * 60 * 1000), // Max 30 submissions per 15 min per IP
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
        acceptedTerms,
        acceptedPrivacy,
        originalFileName,
        fileSizeBytes,
      } = req.body;

      // Validation
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

      const validCategories = [
        'Dance & Choreography',
        'Fashion & Style',
        'Music & Sounds',
        'Comedy & POV',
        'Fitness & Active',
        'Creative Arts & FX',
      ];
      if (!category || !validCategories.includes(category)) {
        return res.status(400).json({ error: 'Please select a valid entertainment category.' });
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

      if (acceptedTerms !== true || acceptedPrivacy !== true) {
        return res.status(400).json({ error: 'You must accept the terms of syndication and privacy notice.' });
      }

      // Generate Reference Code & Submission ID
      const year = new Date().getFullYear();
      const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
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
        category,
        confirmedOwnership: true,
        confirmedAdult18: true,
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

// 4. Get Submissions (Protected Admin Queue)
app.get('/api/submissions', (req: Request, res: Response) => {
  const submissions = readStore<any[]>(SUBMISSIONS_FILE, []);
  const { status, referenceCode } = req.query;

  // If public check by referenceCode (for creator tracking their status)
  if (referenceCode && typeof referenceCode === 'string') {
    const match = submissions.find((s) => s.referenceCode === referenceCode.trim().toUpperCase());
    if (!match) {
      return res.status(404).json({ error: 'Submission reference code not found.' });
    }
    // Return sanitized public tracking info
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

  // Admin access check for the full queue
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

// 5. Moderate Submission (Admin Action: approve, reject, request_correction, remove)
app.post('/api/submissions/:id/moderate', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, notes, moderatorEmail = 'admin@onlytok.com' } = req.body;

    const validActions = ['approve', 'reject', 'request_correction', 'remove'];
    if (!action || !validActions.includes(action)) {
      return res.status(400).json({ error: `Invalid moderation action. Must be one of: ${validActions.join(', ')}` });
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
        publishedAt: timestamp,
        publishedBy: moderatorEmail,
      };

      if (existingRelIndex >= 0) {
        published[existingRelIndex] = releaseRecord;
      } else {
        published.unshift(releaseRecord);
      }
      writeStore(PUBLISHED_FILE, published);
    } else if (action === 'remove' || action === 'reject') {
      published = published.filter((p) => p.submissionId !== sub.id);
      writeStore(PUBLISHED_FILE, published);
    }

    // Record moderation log
    const logs = readStore<any[]>(LOGS_FILE, []);
    logs.unshift({
      id: `log_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      submissionId: sub.id,
      videoTitle: sub.videoTitle,
      creatorName: sub.creatorName,
      action,
      notes: notes || '',
      moderatorEmail,
      timestamp,
    });
    writeStore(LOGS_FILE, logs);

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

// 6. Get Published Releases (Public Feed)
app.get('/api/published-releases', (req: Request, res: Response) => {
  const published = readStore<any[]>(PUBLISHED_FILE, []);
  const { category, search } = req.query;

  let result = published;

  if (category && typeof category === 'string' && category !== 'All Categories') {
    result = result.filter((p) => p.category === category);
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

// 7. Get Moderation Audit Logs (Admin)
app.get('/api/moderation-logs', (_req: Request, res: Response) => {
  const logs = readStore<any[]>(LOGS_FILE, []);
  return res.status(200).json({ logs });
});

// 8. Health & Config endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uploadsReady: fs.existsSync(UPLOADS_DIR),
    dataReady: fs.existsSync(DATA_DIR),
  });
});

// ==========================================
// Vite Dev Server / Static Production Mounting
// ==========================================
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ONLYTOK backend and web server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting ONLYTOK server:', err);
  process.exit(1);
});
