/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { getSeoMetadata, GetSeoParams } from './seo';

/**
 * Custom React hook to dynamically maintain page title, meta description,
 * canonical link, OpenGraph tags, Twitter cards, and Schema.org JSON-LD scripts.
 */
export function useSEO(params: GetSeoParams) {
  useEffect(() => {
    // Current origin as baseUrl if in browser
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
    const meta = getSeoMetadata({ ...params, baseUrl });

    // 1. Document Title
    document.title = meta.title;

    // Helper to safely set or create a <meta> tag
    const setMetaTag = (attribute: string, key: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', meta.description);
    setMetaTag('name', 'robots', meta.robots);

    // 3. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', meta.canonicalUrl);

    // 4. OpenGraph Tags
    setMetaTag('property', 'og:type', meta.ogType);
    setMetaTag('property', 'og:title', meta.ogTitle);
    setMetaTag('property', 'og:description', meta.ogDescription);
    setMetaTag('property', 'og:url', meta.canonicalUrl);
    setMetaTag('property', 'og:image', meta.ogImage);
    setMetaTag('property', 'og:site_name', 'ONLYTOK');

    if (meta.ogImageWidth) {
      setMetaTag('property', 'og:image:width', meta.ogImageWidth.toString());
    }
    if (meta.ogImageHeight) {
      setMetaTag('property', 'og:image:height', meta.ogImageHeight.toString());
    }

    // 5. Twitter / X Cards
    setMetaTag('name', 'twitter:card', meta.twitterCard);
    setMetaTag('name', 'twitter:title', meta.twitterTitle);
    setMetaTag('name', 'twitter:description', meta.twitterDescription);
    setMetaTag('name', 'twitter:image', meta.twitterImage);

    // 6. Schema.org JSON-LD structured data script
    const SCRIPT_ID = 'onlytok-schema-jsonld';
    let scriptEl = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (meta.structuredData.length > 0) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = SCRIPT_ID;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      const jsonContent =
        meta.structuredData.length === 1
          ? JSON.stringify(meta.structuredData[0])
          : JSON.stringify(meta.structuredData);
      scriptEl.textContent = jsonContent;
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [params.tab, params.subtab, params.video?.id, params.creator?.id]);
}
