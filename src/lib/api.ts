/**
 * ONLYTOK — API availability + request helpers.
 *
 * The site runs in two modes:
 *  - Static hosting (Vercel / GitHub Pages): no Express backend is present, so
 *    server-backed features (submissions, contact, reports, GDPR, admin,
 *    analytics) are unavailable. We detect this once and surface honest
 *    "not available on this deployment" states instead of fake success or
 *    misleading network errors.
 *  - Full-stack hosting (Node / Docker): the Express API is present and all
 *    features work end to end.
 *
 * All requests use relative URLs so the same build works on any origin.
 */

import { useEffect, useState } from 'react';

let availabilityPromise: Promise<boolean> | null = null;

/** Probe the backend health endpoint once per page load (cached). */
export function checkApiAvailability(): Promise<boolean> {
  if (!availabilityPromise) {
    availabilityPromise = (async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        const res = await fetch('/api/health', {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        clearTimeout(timer);
        if (!res.ok) return false;
        const data = await res.json();
        return data?.status === 'ok';
      } catch {
        return false;
      }
    })();
  }
  return availabilityPromise;
}

/** React hook: `available` is null while checking, then true/false. */
export function useApiAvailability(): { available: boolean | null; checking: boolean } {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    checkApiAvailability().then((ok) => {
      if (!cancelled) setAvailable(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { available, checking: available === null };
}

/** Reset the cached probe (used by tests). */
export function __resetApiAvailabilityForTests(): void {
  availabilityPromise = null;
}
