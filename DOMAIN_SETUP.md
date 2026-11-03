# Connecting onlytok.uk to this repository

## What's already done in the repo
- `CNAME` (root) and `public/CNAME` contain `onlytok.uk` for GitHub Pages custom-domain support.
- Repository homepage set to https://onlytok.uk (`gh repo edit --homepage`).
- `package-lock.json` added; `esbuild` bumped to `^0.28.0`.

## DNS records to add at Fasthosts (admin.fasthosts.co.uk)
Log in to Fasthosts -> Domain Names -> onlytok.uk -> DNS / Advanced DNS, and add:

| Type  | Host / Name | Value / Points to                  | TTL  |
|-------|-------------|------------------------------------|------|
| A     | @           | 185.199.108.153                    | 3600 |
| A     | @           | 185.199.109.153                    | 3600 |
| A     | @           | 185.199.110.153                    | 3600 |
| A     | @           | 185.199.111.153                    | 3600 |
| CNAME | www         | LIN4CRE.github.io                  | 3600 |

These are GitHub Pages' IP addresses. Remove any conflicting A/CNAME records for `@`/`www`.

## Enable GitHub Pages
Because this repo is private, GitHub Pages requires a paid GitHub plan (Pro/Team/Enterprise) OR make the repo public.

Option A (keep private, paid plan):
1. GitHub -> repo Settings -> Pages.
2. Source: "Deploy from a branch" -> branch `main`, folder `/ (root)` (uses the root `CNAME`).
   Or use "GitHub Actions" and the workflow below.
3. Custom domain: `onlytok.uk` (should auto-detect from CNAME).
4. Enforce HTTPS (enable after DNS propagates).

Option B (free, public repo):
1. Settings -> General -> change visibility to Public (only if you're OK with code being public).
2. Then enable Pages as above.

## GitHub Actions deploy (builds Vite first)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Note: GitHub Pages serves only static files. The Express backend (`server.ts`) will NOT run on Pages. If you need the API, deploy the full app to a Node host (Render/Railway/Fly.io) and point onlytok.uk there instead, or use a reverse proxy.

## Verify
- DNS propagation: `nslookup onlytok.uk` should return the GitHub IPs.
- Then https://onlytok.uk should load.

## App URL
Set `APP_URL=https://onlytok.uk` in your runtime env (AI Studio / hosting) for self-referential links, OAuth callbacks.
```