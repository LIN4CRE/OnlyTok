/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VideoItem, Creator } from '../data/contentRegistry';

export interface SeoMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: 'website' | 'video.other' | 'profile' | 'article';
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  twitterCard: 'summary' | 'summary_large_image' | 'player';
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  robots: 'index, follow' | 'noindex, nofollow' | 'noindex, follow';
  structuredData: Record<string, any>[];
}

export const BASE_SITE_NAME = 'ONLYTOK';
export const OFFICIAL_TIKTOK_HANDLE = '@onlytokgirls';
export const OFFICIAL_TIKTOK_URL = 'https://www.tiktok.com/@onlytokgirls';
export const DEFAULT_SHARE_IMAGE = '/src/assets/images/onlytok_social_share_card_1793722066290.jpg';

export interface GetSeoParams {
  baseUrl?: string;
  tab?: string;
  subtab?: string;
  video?: VideoItem | null;
  creator?: Creator | null;
}

/**
 * Returns canonical and social metadata for any route or modal view.
 */
export function getSeoMetadata(params: GetSeoParams): SeoMetadata {
  const baseUrl = (params.baseUrl || 'https://ais-pre-wca3gymqm4667w4fien6h5-183479119885.europe-west2.run.app').replace(/\/+$/, '');
  const { tab = 'home', subtab, video, creator } = params;

  // 1. Admin Control Room -> Strict Noindex
  if (tab === 'admin') {
    return {
      title: 'Control Room & Moderation Console | ONLYTOK',
      description: 'Restricted administrative moderation console for ONLYTOK authorized personnel.',
      canonicalUrl: `${baseUrl}/?tab=admin`,
      ogType: 'website',
      ogTitle: 'Control Room | ONLYTOK',
      ogDescription: 'Restricted administrative console.',
      ogImage: `${baseUrl}${DEFAULT_SHARE_IMAGE}`,
      twitterCard: 'summary',
      twitterTitle: 'Control Room | ONLYTOK',
      twitterDescription: 'Restricted administrative console.',
      twitterImage: `${baseUrl}${DEFAULT_SHARE_IMAGE}`,
      robots: 'noindex, nofollow',
      structuredData: [],
    };
  }

  // 2. Active Video Modal / Video Deep-link
  if (video) {
    const videoUrl = `${baseUrl}/?video=${encodeURIComponent(video.id)}`;
    const thumbUrl = video.thumbnailUrl.startsWith('http') ? video.thumbnailUrl : `${baseUrl}${video.thumbnailUrl}`;
    const title = `${video.title} — ${video.creatorName} | ONLYTOK (@onlytokgirls)`;
    const description = `Watch "${video.title}" by ${video.creatorName} (${video.creatorHandle}) on ONLYTOK. Verified vertical entertainment, original sounds, and breakthrough creator spotlights.`;

    const videoObjectSchema = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      'name': video.title,
      'description': video.description || description,
      'thumbnailUrl': [thumbUrl],
      'uploadDate': `${video.publishedDate}T12:00:00Z`,
      'duration': `PT${video.durationSeconds}S`,
      'contentUrl': videoUrl,
      'embedUrl': videoUrl,
      'author': {
        '@type': 'Person',
        'name': video.creatorName,
        'url': `${baseUrl}/?creator=${encodeURIComponent(video.creatorId)}`,
      },
      'publisher': {
        '@type': 'Organization',
        'name': BASE_SITE_NAME,
        'url': baseUrl,
        'logo': {
          '@type': 'ImageObject',
          'url': `${baseUrl}${DEFAULT_SHARE_IMAGE}`,
        },
      },
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': baseUrl },
        { '@type': 'ListItem', 'position': 2, 'name': 'Discover', 'item': `${baseUrl}/?tab=discover` },
        { '@type': 'ListItem', 'position': 3, 'name': video.title, 'item': videoUrl },
      ],
    };

    return {
      title,
      description,
      canonicalUrl: videoUrl,
      ogType: 'video.other',
      ogTitle: title,
      ogDescription: description,
      ogImage: thumbUrl,
      ogImageWidth: 1200,
      ogImageHeight: 675,
      twitterCard: 'summary_large_image',
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: thumbUrl,
      robots: 'index, follow',
      structuredData: [videoObjectSchema, breadcrumbSchema],
    };
  }

  // 3. Active Creator Profile Modal / Deep-link
  if (creator) {
    const creatorUrl = `${baseUrl}/?creator=${encodeURIComponent(creator.id)}`;
    const avatarUrl = creator.avatarUrl.startsWith('http') ? creator.avatarUrl : `${baseUrl}${creator.avatarUrl}`;
    const title = `${creator.displayName} (${creator.username}) — Verified Creator | ONLYTOK`;
    const description = `Explore ${creator.displayName}'s verified vertical videos, spotlights, and official TikTok showcase on ONLYTOK (@onlytokgirls). ${creator.bio}`;

    const profileSchema = {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      'mainEntity': {
        '@type': 'Person',
        'name': creator.displayName,
        'alternateName': creator.username,
        'description': creator.bio,
        'image': avatarUrl,
        'url': creatorUrl,
        'sameAs': [creator.socialLinks.tiktok, creator.socialLinks.instagram].filter(Boolean),
      },
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': baseUrl },
        { '@type': 'ListItem', 'position': 2, 'name': 'Creators', 'item': `${baseUrl}/?tab=creators` },
        { '@type': 'ListItem', 'position': 3, 'name': creator.displayName, 'item': creatorUrl },
      ],
    };

    return {
      title,
      description,
      canonicalUrl: creatorUrl,
      ogType: 'profile',
      ogTitle: title,
      ogDescription: description,
      ogImage: avatarUrl,
      ogImageWidth: 800,
      ogImageHeight: 800,
      twitterCard: 'summary_large_image',
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: avatarUrl,
      robots: 'index, follow',
      structuredData: [profileSchema, breadcrumbSchema],
    };
  }

  // 4. Tab-specific SEO
  const defaultOrgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': BASE_SITE_NAME,
    'alternateName': OFFICIAL_TIKTOK_HANDLE,
    'url': baseUrl,
    'logo': `${baseUrl}${DEFAULT_SHARE_IMAGE}`,
    'description': 'Premium entertainment and creator discovery brand spotlighting authentic TikTok talent.',
    'sameAs': [OFFICIAL_TIKTOK_URL],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': BASE_SITE_NAME,
    'url': baseUrl,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${baseUrl}/?tab=discover&q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  switch (tab) {
    case 'discover':
      return {
        title: 'Discover Trending Vertical Videos & Creators | ONLYTOK (@onlytokgirls)',
        description: 'Browse authorised vertical video releases, dance choreography, streetwear lookbooks, and original sound stems on ONLYTOK.',
        canonicalUrl: `${baseUrl}/?tab=discover`,
        ogType: 'website',
        ogTitle: 'Discover Trending Vertical Videos & Creators | ONLYTOK',
        ogDescription: 'Browse authorised vertical video releases, dance choreography, and original sound stems.',
        ogImage: `${baseUrl}/src/assets/images/onlytok_studio_atmosphere_1793722067070.jpg`,
        ogImageWidth: 1200,
        ogImageHeight: 675,
        twitterCard: 'summary_large_image',
        twitterTitle: 'Discover Trending Videos & Creators | ONLYTOK',
        twitterDescription: 'Browse authorised vertical video releases, choreography, and original sound stems.',
        twitterImage: `${baseUrl}/src/assets/images/onlytok_studio_atmosphere_1793722067070.jpg`,
        robots: 'index, follow',
        structuredData: [websiteSchema, defaultOrgSchema],
      };

    case 'creators':
      return {
        title: 'Verified Creator Roster & Talent Profiles | ONLYTOK',
        description: 'Meet the verified creators featured on @onlytokgirls. Authentic personalities, choreographers, stylists, and sound designers.',
        canonicalUrl: `${baseUrl}/?tab=creators`,
        ogType: 'website',
        ogTitle: 'Verified Creator Roster & Talent Profiles | ONLYTOK',
        ogDescription: 'Meet the verified creators featured on @onlytokgirls. Authentic personalities, choreographers, stylists, and sound designers.',
        ogImage: `${baseUrl}/src/assets/images/onlytok_brand_hero_backdrop_1793722066801.jpg`,
        ogImageWidth: 1200,
        ogImageHeight: 675,
        twitterCard: 'summary_large_image',
        twitterTitle: 'Verified Creator Roster | ONLYTOK',
        twitterDescription: 'Meet the verified creators featured on @onlytokgirls.',
        twitterImage: `${baseUrl}/src/assets/images/onlytok_brand_hero_backdrop_1793722066801.jpg`,
        robots: 'index, follow',
        structuredData: [websiteSchema, defaultOrgSchema],
      };

    case 'submit':
      return {
        title: 'Creator Submission Portal — Get Featured on @onlytokgirls | ONLYTOK',
        description: 'Submit your original TikTok content for editorial consideration on ONLYTOK. Verified 18+, clear rights, and promotional distribution.',
        canonicalUrl: `${baseUrl}/?tab=submit`,
        ogType: 'website',
        ogTitle: 'Creator Submission Portal | ONLYTOK',
        ogDescription: 'Submit your original TikTok content for editorial spotlight on ONLYTOK (@onlytokgirls).',
        ogImage: `${baseUrl}${DEFAULT_SHARE_IMAGE}`,
        ogImageWidth: 1200,
        ogImageHeight: 675,
        twitterCard: 'summary_large_image',
        twitterTitle: 'Submit Your Content | ONLYTOK Creator Portal',
        twitterDescription: 'Submit your original TikTok content for editorial spotlight on ONLYTOK.',
        twitterImage: `${baseUrl}${DEFAULT_SHARE_IMAGE}`,
        robots: 'index, follow',
        structuredData: [websiteSchema, defaultOrgSchema],
      };

    case 'about':
      return {
        title: 'About ONLYTOK — Dark Luxury Entertainment & Creator Studio',
        description: 'Learn about the ONLYTOK vision: discovering authentic vertical creator talent, verified 18+ safety standards, and high-impact brand collaborations.',
        canonicalUrl: `${baseUrl}/?tab=about`,
        ogType: 'article',
        ogTitle: 'About ONLYTOK — Creator Discovery & Entertainment',
        ogDescription: 'The story behind ONLYTOK (@onlytokgirls): dark luxury entertainment, creator advocacy, and verified vertical storytelling.',
        ogImage: `${baseUrl}/src/assets/images/onlytok_studio_atmosphere_1793722067070.jpg`,
        ogImageWidth: 1200,
        ogImageHeight: 675,
        twitterCard: 'summary_large_image',
        twitterTitle: 'About ONLYTOK — Creator Discovery',
        twitterDescription: 'Discover the story behind ONLYTOK (@onlytokgirls).',
        twitterImage: `${baseUrl}/src/assets/images/onlytok_studio_atmosphere_1793722067070.jpg`,
        robots: 'index, follow',
        structuredData: [websiteSchema, defaultOrgSchema],
      };

    case 'legal': {
      const sub = subtab || 'privacy';
      const subTitles: Record<string, string> = {
        privacy: 'UK GDPR Privacy Policy',
        terms: 'Terms of Service',
        cookies: 'Cookie Policy & PECR Compliance',
        dmca: 'Copyright & CDPA 1988 Takedown Policy',
        'submission-agreement': 'Creator Content Submission Agreement',
        guidelines: 'Community Safety Guidelines',
      };
      const pageTitle = `${subTitles[sub] || 'Legal Information'} | ONLYTOK Legal & Compliance`;
      return {
        title: pageTitle,
        description: 'Official legal documentation, UK GDPR privacy commitments, copyright protection, 18+ safety verification, and terms for ONLYTOK.',
        canonicalUrl: `${baseUrl}/?tab=legal&subtab=${encodeURIComponent(sub)}`,
        ogType: 'article',
        ogTitle: pageTitle,
        ogDescription: 'Official legal documentation, UK GDPR privacy commitments, and safety verification for ONLYTOK.',
        ogImage: `${baseUrl}${DEFAULT_SHARE_IMAGE}`,
        twitterCard: 'summary',
        twitterTitle: pageTitle,
        twitterDescription: 'Official legal documentation for ONLYTOK.',
        twitterImage: `${baseUrl}${DEFAULT_SHARE_IMAGE}`,
        robots: 'index, follow',
        structuredData: [websiteSchema, defaultOrgSchema],
      };
    }

    case 'removal':
      return {
        title: 'Content Removal & Expedited Takedown Request | ONLYTOK',
        description: 'Submit an expedited copyright (CDPA 1988/DMCA) or safety takedown notice. Strict 6-hour response for urgent safety and non-consensual imagery.',
        canonicalUrl: `${baseUrl}/?tab=removal`,
        ogType: 'article',
        ogTitle: 'Content Removal Portal | ONLYTOK',
        ogDescription: 'Expedited copyright and safety takedown portal for ONLYTOK.',
        ogImage: `${baseUrl}${DEFAULT_SHARE_IMAGE}`,
        twitterCard: 'summary',
        twitterTitle: 'Content Removal Portal | ONLYTOK',
        twitterDescription: 'Expedited takedown portal.',
        twitterImage: `${baseUrl}${DEFAULT_SHARE_IMAGE}`,
        robots: 'index, follow',
        structuredData: [websiteSchema, defaultOrgSchema],
      };

    case 'contact':
      return {
        title: 'Contact ONLYTOK Studio — Brand Partnerships, Press & Creator Inquiries',
        description: 'Get in touch with the ONLYTOK team in London, UK. Creator inquiries, commercial brand partnerships, press, and rights management.',
        canonicalUrl: `${baseUrl}/?tab=contact`,
        ogType: 'website',
        ogTitle: 'Contact ONLYTOK Studio',
        ogDescription: 'Get in touch with the ONLYTOK team in London, UK for partnerships, press, and creator inquiries.',
        ogImage: `${baseUrl}${DEFAULT_SHARE_IMAGE}`,
        twitterCard: 'summary',
        twitterTitle: 'Contact ONLYTOK Studio',
        twitterDescription: 'Brand partnerships, press, and creator inquiries.',
        twitterImage: `${baseUrl}${DEFAULT_SHARE_IMAGE}`,
        robots: 'index, follow',
        structuredData: [websiteSchema, defaultOrgSchema],
      };

    case 'home':
    default:
      return {
        title: 'ONLYTOK — Discover Your Next Favourite Creator (@onlytokgirls)',
        description: 'The master brand platform for ONLYTOK (@onlytokgirls). Dark luxury entertainment, verified 18+ vertical creator spotlights, and cultural discovery.',
        canonicalUrl: `${baseUrl}/`,
        ogType: 'website',
        ogTitle: 'ONLYTOK — Discover Your Next Favourite Creator (@onlytokgirls)',
        ogDescription: 'Fresh personalities. Original content. Creators worth discovering. The official platform for @onlytokgirls.',
        ogImage: `${baseUrl}${DEFAULT_SHARE_IMAGE}`,
        ogImageWidth: 1200,
        ogImageHeight: 675,
        twitterCard: 'summary_large_image',
        twitterTitle: 'ONLYTOK — Discover Your Next Favourite Creator',
        twitterDescription: 'Fresh personalities. Original content. Creators worth discovering.',
        twitterImage: `${baseUrl}${DEFAULT_SHARE_IMAGE}`,
        robots: 'index, follow',
        structuredData: [websiteSchema, defaultOrgSchema],
      };
  }
}

/**
 * Generates dynamic, valid XML sitemap based on live authorized content.
 */
export function generateSitemapXml(baseUrl: string, videos: VideoItem[] = [], creators: Creator[] = []): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const now = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: `${cleanBase}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${cleanBase}/?tab=discover`, changefreq: 'daily', priority: '0.9' },
    { loc: `${cleanBase}/?tab=creators`, changefreq: 'daily', priority: '0.9' },
    { loc: `${cleanBase}/?tab=submit`, changefreq: 'monthly', priority: '0.8' },
    { loc: `${cleanBase}/?tab=about`, changefreq: 'monthly', priority: '0.7' },
    { loc: `${cleanBase}/?tab=contact`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${cleanBase}/?tab=removal`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${cleanBase}/?tab=legal&amp;subtab=privacy`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${cleanBase}/?tab=legal&amp;subtab=terms`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${cleanBase}/?tab=legal&amp;subtab=cookies`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${cleanBase}/?tab=legal&amp;subtab=dmca`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${cleanBase}/?tab=legal&amp;subtab=submission-agreement`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${cleanBase}/?tab=legal&amp;subtab=guidelines`, changefreq: 'monthly', priority: '0.5' },
  ];

  const videoUrls = videos
    .filter((v) => v.isAuthorized)
    .map((v) => ({
      loc: `${cleanBase}/?video=${encodeURIComponent(v.id)}`,
      lastmod: v.publishedDate || now,
      changefreq: 'weekly',
      priority: v.isFeatured ? '0.85' : '0.75',
    }));

  const creatorUrls = creators
    .filter((c) => c.isVerified18Plus)
    .map((c) => ({
      loc: `${cleanBase}/?creator=${encodeURIComponent(c.id)}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.8',
    }));

  const allUrls = [...staticUrls, ...creatorUrls, ...videoUrls];

  const urlsXml = allUrls
    .map((item) => {
      const lastmodTag = item.lastmod ? `\n    <lastmod>${item.lastmod}</lastmod>` : `\n    <lastmod>${now}</lastmod>`;
      return `  <url>
    <loc>${item.loc}</loc>${lastmodTag}
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
}

/**
 * Generates strict robots.txt with crawling rules and sitemap pointer.
 */
export function generateRobotsTxt(baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `# ONLYTOK (@onlytokgirls) Search Engine Crawl Directives
# Production Robots.txt — Strict privacy protection for internal administration and user submissions

User-agent: *
Allow: /
Allow: /?tab=discover
Allow: /?tab=creators
Allow: /?tab=about
Allow: /?tab=submit
Allow: /?tab=legal
Allow: /?tab=removal
Allow: /?tab=contact
Allow: /?video=*
Allow: /?creator=*

# Disallow private administration, moderation queues, internal API & data stores
Disallow: /admin
Disallow: /?tab=admin
Disallow: /api/
Disallow: /uploads/
Disallow: /data_store/

# Explicit Bot optimizations
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: TikTokBot
Allow: /

User-agent: ByteDance
Allow: /

# Sitemap Index
Sitemap: ${cleanBase}/sitemap.xml
`;
}
