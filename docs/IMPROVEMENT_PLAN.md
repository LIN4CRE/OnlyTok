# OnlyTok — Audit & Prioritised Improvement Plan

Audit date: 2026-11-04 · Branch: `arena/dfb49ed1-onlytok` · Baseline commit: `58cfee3`

## Project summary

OnlyTok is the brand / creator-discovery site for **@onlytokgirls**. It is a React 19 +
Vite 8 SPA with an optional Express API (`server.ts`, JSON-file persistence + multer
video uploads). Firebase Auth (Google sign-in) gates the admin console on the client.

**Actual deployment route:** Vercel project `onlytok` (Hobby/free), static Vite build,
production branch `main`, aliases `onlytok.uk`, `onlytok.vercel.app`, etc. A legacy
GitHub Pages (`gh-pages` branch) route also exists; GitHub Actions is billing-locked,
so the Pages Actions workflow always fails.

## Baseline results (before changes)

| Check | Result |
|---|---|
| `npm ci` | PASS |
| `npm run lint` (`tsc --noEmit`) | PASS |
| Unit tests (`tsx --test`, 22 tests) | PASS (no `npm test` script existed) |
| `npm run build` (Vite) | PASS (1.09 MB JS chunk warning) |
| `npm start` (production server) | **FAIL** — `node server.ts` cannot resolve TS imports |
| Admin auth | **FAIL** — spoofable header grants super-admin (verified live) |
| Live Pages build | **FAIL** — absolute `/assets` paths 404 under `/OnlyTok/` subpath |

## Findings & priorities

### P0 — Critical
1. **Admin authentication bypass** (`server.ts resolveAdmin`): trusts `X-Admin-Email`
   header, `Bearer <email>`, and hardcoded tokens (`admin-authenticated-token`,
   `dev-admin-session`). Anyone can read PII and moderate content.
   → Verify Firebase ID tokens server-side (Google JWKS) + optional `ADMIN_API_TOKEN`.
2. **Client-side fake admin unlock** (`AdminModerationView`): dev unlock button,
   localStorage auto-unlock, and unlock-on-network-error fallback.
   → Remove; require real server-verified session; honest state when API absent.
3. **Production server cannot start** (`npm start`). → esbuild server bundle + `node server.js`.
4. **Static deployment mismatch**: all `/api/*` calls fail on Vercel/Pages; forms show
   misleading "network error", admin shows fake console. → API availability probe +
   honest "not available on this deployment" states with working alternatives.
5. **Runtime PII committed to git** (`data_store/*.json`: emails, birth dates,
   signatures; `uploads/*.mp4` stub). → Untrack + gitignore + sanitized seed defaults.
6. **Published static build broken on subpath** (absolute `/assets`). → `base: './'`
   + base-aware asset helper.

### P1 — High
7. **Analytics fires without cookie consent** (PECR/UK GDPR). → Gate on consent + API availability.
8. **Reference codes enumerable** (2 random bytes) + unthrottled lookup. → 6 bytes + rate limit.
9. Rate-limiter map grows unbounded; no `trust proxy`; 10 MB JSON limit; no upload disk
   quota; no security headers; non-atomic store writes; no graceful shutdown.
10. **GDPR erasure incomplete** (only purges submissions). → Purge across stores.
11. Stale Cloud Run URL hardcoded as SEO/analytics fallback. → `https://onlytok.uk`.
12. Unused dependencies (`@google/genai`, `motion`, `autoprefixer`); duplicate `bun.lock`.
13. Eager 1.09 MB bundle incl. Firebase + 2700-line admin view. → Lazy-load admin; drop
    unused boot Firestore probe.

### P2 — Medium
14. No `npm test` script; no server/integration tests; failing/obsolete Pages workflow.
15. Missing README, SECURITY.md, architecture/deployment/operations docs, Dockerfile.
16. `.env.example` references unused Gemini key; missing real server vars.
17. Package metadata (`react-example`), no `engines`.

### P3 — Low
18. Vite config `__dirname` deprecation warning; preview host allowlist; minor HTML cruft.

## Deployment decision

Keep the existing **Vercel static** route as production (authorized, free, already
configured). The Express backend cannot run on Vercel static hosting, and serverless
file storage would lose data — so the backend is hardened for **self-hosted/Docker**
full-stack mode, and the static frontend degrades honestly. Full-stack deployment is
documented (Dockerfile) for when the owner wants live submissions/admin.
