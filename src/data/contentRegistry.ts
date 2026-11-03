/**
 * ONLYTOK - Official Authorized Content & Creator Registry
 * Strict compliance: Genuine content only, verified 18+, documented creator releases.
 */

export interface Creator {
  id: string;
  displayName: string;
  username: string; // e.g. @onlytokgirls or creator handle
  avatarUrl: string;
  bio: string;
  categories: string[];
  isVerified18Plus: boolean;
  socialLinks: {
    tiktok: string;
    instagram?: string;
    youtube?: string;
  };
  totalSpotlights: number;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  thumbnailUrl: string;
  category: string;
  durationSeconds: number;
  publishedDate: string;
  audioTrack: {
    name: string;
    artist: string;
  };
  isAuthorized: boolean;
  isFeatured: boolean;
  engagementTag?: string;
  directTikTokUrl: string;
}

export interface CategoryInfo {
  id: string;
  label: string;
  description: string;
  count: number;
}

/**
 * Official Authorized Creators Registry
 * Only creators with documented verification and 18+ releases are cataloged.
 */
export const AUTHORIZED_CREATORS: Creator[] = [
  {
    id: 'creator-official-onlytok',
    displayName: 'ONLYTOK Studio',
    username: '@onlytokgirls',
    avatarUrl: '/images/onlytok_social_share_card_1793722066290.jpg',
    bio: 'The official creative collective and vertical entertainment studio behind @onlytokgirls. Spotlighting verified breakthrough talent and viral audio.',
    categories: ['Editorial', 'Dance & Choreography', 'Fashion & Style', 'Music & Sounds'],
    isVerified18Plus: true,
    socialLinks: {
      tiktok: 'https://www.tiktok.com/@onlytokgirls',
    },
    totalSpotlights: 3,
  },
  {
    id: 'creator-maya-lin',
    displayName: 'Maya Lin',
    username: '@mayamotion',
    avatarUrl: '/images/onlytok_video_dance_cover_1793722898857.jpg',
    bio: 'Contemporary movement artist and rhythmic choreographer. Specialising in high-intensity urban flow and syncopated floorwork.',
    categories: ['Dance & Choreography', 'Performance'],
    isVerified18Plus: true,
    socialLinks: {
      tiktok: 'https://www.tiktok.com/@onlytokgirls',
    },
    totalSpotlights: 1,
  },
  {
    id: 'creator-kofi-vance',
    displayName: 'Kofi Vance',
    username: '@kofivance',
    avatarUrl: '/images/onlytok_video_fashion_cover_1793722898133.jpg',
    bio: 'Streetwear architect and dark-palette visual storyteller. Curating high-contrast utilitarian silhouettes and modern tailoring.',
    categories: ['Fashion & Style', 'Visual Aesthetics'],
    isVerified18Plus: true,
    socialLinks: {
      tiktok: 'https://www.tiktok.com/@onlytokgirls',
    },
    totalSpotlights: 1,
  },
  {
    id: 'creator-zara-beats',
    displayName: 'Zara Silva',
    username: '@zaravocals',
    avatarUrl: '/images/onlytok_video_music_cover_1793722899627.jpg',
    bio: 'Vocalist, sound designer, and neo-soul producer craft-mastering hypnotic audio hooks for TikTok creators.',
    categories: ['Music & Sounds', 'Viral Audio'],
    isVerified18Plus: true,
    socialLinks: {
      tiktok: 'https://www.tiktok.com/@onlytokgirls',
    },
    totalSpotlights: 1,
  },
];

/**
 * Official Authorized Video Releases
 * Fully licensed, verified 18+, authorised for publication on ONLYTOK.
 */
export const AUTHORIZED_VIDEOS: VideoItem[] = [
  {
    id: 'ot-video-001',
    title: 'Midnight Floorwork & Precision Flow',
    description: 'A dynamic studio showcase exploring syncopated movement and architectural neon lighting in the ONLYTOK production space.',
    creatorId: 'creator-maya-lin',
    creatorName: 'Maya Lin',
    creatorHandle: '@mayamotion',
    thumbnailUrl: '/images/onlytok_video_dance_cover_1793722898857.jpg',
    category: 'Dance & Choreography',
    durationSeconds: 28,
    publishedDate: '2026-11-01',
    audioTrack: {
      name: 'Electric Pulse (ONLYTOK Edit)',
      artist: 'Zara Silva',
    },
    isAuthorized: true,
    isFeatured: true,
    engagementTag: 'Trending',
    directTikTokUrl: 'https://www.tiktok.com/@onlytokgirls',
  },
  {
    id: 'ot-video-002',
    title: 'Monochrome Noir Streetwear Lookbook',
    description: 'Exploring utilitarian textures, custom military straps, and oversized silhouette layering under ambient magenta wash.',
    creatorId: 'creator-kofi-vance',
    creatorName: 'Kofi Vance',
    creatorHandle: '@kofivance',
    thumbnailUrl: '/images/onlytok_video_fashion_cover_1793722898133.jpg',
    category: 'Fashion & Style',
    durationSeconds: 34,
    publishedDate: '2026-10-28',
    audioTrack: {
      name: 'Sub-Zero Resonance',
      artist: 'ONLYTOK Sound Lab',
    },
    isAuthorized: true,
    isFeatured: true,
    engagementTag: 'Editor Pick',
    directTikTokUrl: 'https://www.tiktok.com/@onlytokgirls',
  },
  {
    id: 'ot-video-003',
    title: 'Live Vocal Loop & Harmonic Layering',
    description: 'Behind the soundboard: building a four-part harmony hook from scratch using analogue compression and warm spatial reverb.',
    creatorId: 'creator-zara-beats',
    creatorName: 'Zara Silva',
    creatorHandle: '@zaravocals',
    thumbnailUrl: '/images/onlytok_video_music_cover_1793722899627.jpg',
    category: 'Music & Sounds',
    durationSeconds: 42,
    publishedDate: '2026-10-25',
    audioTrack: {
      name: 'Velvet Echo (Studio Session)',
      artist: 'Zara Silva',
    },
    isAuthorized: true,
    isFeatured: true,
    engagementTag: 'Original Sound',
    directTikTokUrl: 'https://www.tiktok.com/@onlytokgirls',
  },
];

export const CATEGORIES: CategoryInfo[] = [
  { id: 'all', label: 'All Categories', description: 'Complete roster of authorized vertical entertainment', count: AUTHORIZED_VIDEOS.length },
  { id: 'Dance & Choreography', label: 'Dance & Choreography', description: 'Syncopated rhythm, movement, and studio choreography', count: 1 },
  { id: 'Fashion & Style', label: 'Fashion & Style', description: 'Modern aesthetics, streetwear, and editorial styling', count: 1 },
  { id: 'Music & Sounds', label: 'Music & Sounds', description: 'Original stems, live loops, and viral sound design', count: 1 },
  { id: 'Comedy & Entertainment', label: 'Comedy & Entertainment', description: 'Relatable commentary and narrative POV sketches', count: 0 },
  { id: 'Fitness & Motion', label: 'Fitness & Motion', description: 'High-energy athleticism and body mechanics', count: 0 },
  { id: 'Creative Arts & FX', label: 'Creative Arts & FX', description: 'Visual transformations and cinematic editing', count: 0 },
];

/**
 * Filter and search authorized videos.
 */
export function getAuthorizedVideos(options?: {
  category?: string;
  creatorId?: string;
  search?: string;
  sort?: 'latest' | 'featured' | 'engaging';
}): VideoItem[] {
  let list = AUTHORIZED_VIDEOS.filter((v) => v.isAuthorized);

  if (options?.category && options.category !== 'all') {
    list = list.filter((v) => v.category.toLowerCase() === options.category!.toLowerCase());
  }

  if (options?.creatorId) {
    list = list.filter((v) => v.creatorId === options.creatorId);
  }

  if (options?.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.creatorName.toLowerCase().includes(q) ||
        v.creatorHandle.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.audioTrack.name.toLowerCase().includes(q)
    );
  }

  if (options?.sort === 'featured') {
    list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  } else {
    // Default latest
    list.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  }

  return list;
}

/**
 * Filter and search authorized creators.
 */
export function getAuthorizedCreators(options?: {
  search?: string;
  category?: string;
}): Creator[] {
  let list = [...AUTHORIZED_CREATORS];

  if (options?.category && options.category !== 'all') {
    list = list.filter((c) =>
      c.categories.some((cat) => cat.toLowerCase().includes(options.category!.toLowerCase()))
    );
  }

  if (options?.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q)
    );
  }

  return list;
}

export function getVideoById(id: string): VideoItem | undefined {
  return AUTHORIZED_VIDEOS.find((v) => v.id === id);
}

export function getCreatorById(id: string): Creator | undefined {
  return AUTHORIZED_CREATORS.find((c) => c.id === id);
}

export function getRelatedVideos(videoId: string, limit: number = 3): VideoItem[] {
  const current = getVideoById(videoId);
  if (!current) return AUTHORIZED_VIDEOS.slice(0, limit);

  return AUTHORIZED_VIDEOS.filter((v) => v.id !== videoId && v.isAuthorized)
    .sort((a, b) => {
      // Prioritize same category or same creator
      const scoreA = (a.category === current.category ? 2 : 0) + (a.creatorId === current.creatorId ? 3 : 0);
      const scoreB = (b.category === current.category ? 2 : 0) + (b.creatorId === current.creatorId ? 3 : 0);
      return scoreB - scoreA;
    })
    .slice(0, limit);
}
