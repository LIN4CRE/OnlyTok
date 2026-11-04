/**
 * Resolve a root-absolute public asset path (e.g. "/images/foo.jpg") against
 * Vite's configured base so it works both at a domain root (Vercel / onlytok.uk)
 * and under a subpath (GitHub Pages project site at /OnlyTok/).
 *
 * Registry data and SEO metadata keep root-absolute paths; this helper is applied
 * only where a path becomes an actual browser resource URL (img src, etc.).
 */
export function assetUrl(publicPath: string): string {
  if (!publicPath || !publicPath.startsWith('/')) return publicPath;
  const env = (import.meta as unknown as { env?: { BASE_URL?: string } }).env;
  const base = env?.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${prefix}${publicPath}`;
}
