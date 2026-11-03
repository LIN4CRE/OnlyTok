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

## Current state (already configured)
- Repo is now **public**.
- GitHub Pages is enabled with **legacy** build type, source = `gh-pages` branch, root folder.
- Custom domain set to `onlytok.uk` (CNAME present in the `gh-pages` branch).
- Site is already live at https://lin4cre.github.io/OnlyTok/
- HTTPS will be auto-provisioned by GitHub after DNS points to GitHub (not yet, because DNS still points to Fasthosts).

## Re-deploying after code changes
Since GitHub Actions is unavailable on this account (billing lock), rebuild locally and push to `gh-pages`:

```sh
npm ci
npm run build
git checkout gh-pages
# replace root files with dist contents
rm -rf assets index.html
cp -r dist/* .
echo onlytok.uk > CNAME
git add -A && git commit -m "deploy" && git push origin gh-pages
git checkout main
```

## DNS records to add at Fasthosts (admin.fasthosts.co.uk)
Log in to Fasthosts -> Domain Names -> onlytok.uk -> DNS / Advanced DNS, and add:

| Type  | Host / Name | Value / Points to                  | TTL  |
|-------|-------------|------------------------------------|------|
| A     | @           | 185.199.108.153                    | 3600 |
| A     | @           | 185.199.109.153                    | 3600 |
| A     | @           | 185.199.110.153                    | 3600 |
| A     | @           | 185.199.111.153                    | 3600 |
| CNAME | www         | LIN4CRE.github.io                  | 3600 |

Remove any conflicting A/CNAME records for `@`/`www`. DNS propagation can take up to 24h.

After propagation, GitHub will issue the HTTPS cert; then enable "Enforce HTTPS" in Settings -> Pages.

Note: GitHub Pages serves only static files. The Express backend (`server.ts`) will NOT run on Pages. If you need the API, deploy the full app to a Node host (Render/Railway/Fly.io) and point onlytok.uk there instead, or use a reverse proxy.

## Verify
- DNS propagation: `nslookup onlytok.uk` should return the GitHub IPs.
- Then https://onlytok.uk should load.

## App URL
Set `APP_URL=https://onlytok.uk` in your runtime env (AI Studio / hosting) for self-referential links, OAuth callbacks.
```