import React from 'react';
import { assetUrl } from '../utils/assets';
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Flame,
  Users,
  Compass,
} from 'lucide-react';
import { OnlyTokLogo } from '../components/brand/OnlyTokLogo';
import { VideoCard } from '../components/video/VideoCard';
import { CreatorCard } from '../components/creators/CreatorCard';
import {
  getAuthorizedVideos,
  getAuthorizedCreators,
  CATEGORIES,
  VideoItem,
} from '../data/contentRegistry';

interface HomeViewProps {
  onNavigate: (tab: 'home' | 'discover' | 'creators' | 'submit' | 'about') => void;
  onPlayVideo: (video: VideoItem) => void;
  onOpenCreator: (creatorId: string) => void;
  onSelectCategory: (categoryId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onPlayVideo,
  onOpenCreator,
  onSelectCategory,
}) => {
  const featuredVideos = getAuthorizedVideos({ sort: 'featured' }).slice(0, 3);
  const featuredCreators = getAuthorizedCreators().slice(0, 3);

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. Large Brand Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-8 pb-20 md:py-24 border-b border-white/[0.06]">
        {/* Background Graphic Asset with Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={assetUrl("/images/onlytok_brand_hero_backdrop_1793722066801.jpg")}
            alt="ONLYTOK Luxury Dark Studio Backdrop"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090C] via-[#09090C]/85 to-[#09090C]/65" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#09090C]/60 to-[#09090C]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            
            {/* Large Iconic ONLYTOK Brand Monogram */}
            <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
              <OnlyTokLogo variant="full" size="xl" />
            </div>

            {/* Unboxed Metadata Trust Badge */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#8E8EA0] mb-6">
              <span className="text-[#FF2A85]">Official Platform</span>
              <span aria-hidden="true" className="text-white/20">·</span>
              <span className="text-white/90">@onlytokgirls on TikTok</span>
              <span aria-hidden="true" className="text-white/20">·</span>
              <span>18+ Verified Talent Only</span>
            </div>

            {/* Required Hero Headline */}
            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-[1.05] mb-6 text-balance">
              Discover Your Next{' '}
              <span className="bg-gradient-to-r from-white via-white to-[#FF2A85] bg-clip-text text-transparent">
                Favourite Creator.
              </span>
            </h1>

            {/* Required Subheading */}
            <p className="text-lg sm:text-xl text-[#A1A1AA] max-w-2xl leading-relaxed mb-10 text-balance font-medium">
              Fresh personalities. Original content. Creators worth discovering.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto mb-10">
              <button
                onClick={() => onNavigate('discover')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#FF2A85] to-[#D90368] hover:from-[#ff3d93] hover:to-[#eb0c75] shadow-xl shadow-[#FF2A85]/25 hover:shadow-[#FF2A85]/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Video Feed</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <a
                href="https://www.tiktok.com/@onlytokgirls"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-sm text-white bg-[#181822] hover:bg-[#222230] border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Follow @onlytokgirls</span>
                <ExternalLink className="w-4 h-4 text-[#FF2A85]" />
              </a>

              <button
                onClick={() => onNavigate('submit')}
                className="w-full sm:w-auto px-6 py-4 rounded-xl font-semibold text-sm text-[#A1A1AA] hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-[#FF2A85]" />
                <span>Submit Content (18+)</span>
              </button>
            </div>

            {/* Compliance Guarantee */}
            <div className="inline-flex items-center gap-2 text-xs text-[#8E8EA0] pt-4 border-t border-white/[0.08]">
              <ShieldCheck className="w-4 h-4 text-[#FF2A85]" />
              <span>Strictly 18+ verified creators · Documented author permissions · Authentic media only</span>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Latest Authorised Videos Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#FF2A85] mb-2 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              <span>Official Spotlight Drops</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
              Latest Authorised Releases
            </h2>
            <p className="text-sm text-[#A1A1AA] mt-1">
              Curated original videos syndicated with full creator attribution.
            </p>
          </div>

          <button
            onClick={() => onNavigate('discover')}
            className="self-start sm:self-auto text-xs font-bold text-[#FF2A85] hover:text-white transition-colors flex items-center gap-1.5 py-1"
          >
            <span>View All Videos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPlay={onPlayVideo}
              onOpenCreator={onOpenCreator}
            />
          ))}
        </div>
      </section>

      {/* 3. Featured Creator Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#FF2A85] mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Talent Spotlight</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
              Featured Verified Creators
            </h2>
            <p className="text-sm text-[#A1A1AA] mt-1">
              Breakout artists and digital performers making waves on TikTok.
            </p>
          </div>

          <button
            onClick={() => onNavigate('creators')}
            className="self-start sm:self-auto text-xs font-bold text-[#FF2A85] hover:text-white transition-colors flex items-center gap-1.5 py-1"
          >
            <span>Browse Full Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCreators.map((creator) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              onOpenProfile={onOpenCreator}
            />
          ))}
        </div>
      </section>

      {/* 4. Trending Categories Based on Genuine Data */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#121217] border border-white/[0.08] relative overflow-hidden">
          <div className="max-w-2xl mb-8">
            <div className="text-xs font-bold uppercase tracking-widest text-[#FF2A85] mb-2 font-mono">
              Category Exploration
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight mb-2">
              Trending Entertainment Spheres
            </h2>
            <p className="text-sm text-[#A1A1AA]">
              Explore genuine verified releases categorized by artistic craft and vertical format.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onNavigate('discover');
                }}
                className="group p-5 rounded-2xl bg-[#181822] border border-white/5 hover:border-[#FF2A85]/50 text-left transition-all hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display font-bold text-base text-white group-hover:text-[#FF2A85] transition-colors">
                      {cat.label}
                    </span>
                    <span className="text-[11px] font-mono text-[#8E8EA0] bg-white/5 px-2 py-0.5 rounded">
                      {cat.count} {cat.count === 1 ? 'Release' : 'Releases'}
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#8E8EA0] group-hover:text-[#FF2A85] transition-colors">
                  <span>View Releases</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Creator Discovery & Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#1A1A24] via-[#121217] to-[#09090C] border border-white/[0.08] p-8 sm:p-14 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF2A85] mb-2">
              Join The Channel Spotlight
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight mb-4">
              Ready to Spotlight Your Talent on @onlytokgirls?
            </h2>
            <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed mb-6">
              We provide free, transparent amplification for verified creators. You retain 100% ownership and copyright of your work.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('submit')}
                className="px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#FF2A85] to-[#D90368] hover:from-[#ff3d93] hover:to-[#eb0c75] shadow-lg shadow-[#FF2A85]/25 transition-all active:scale-[0.98] flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Apply to Feature (18+)</span>
              </button>

              <a
                href="https://www.tiktok.com/@onlytokgirls"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors flex items-center gap-2"
              >
                <span>Follow on TikTok</span>
                <ExternalLink className="w-4 h-4 text-[#FF2A85]" />
              </a>
            </div>
          </div>

          <div className="w-full lg:w-auto shrink-0 flex justify-center">
            <div className="p-6 rounded-2xl bg-[#09090C]/80 border border-white/10 backdrop-blur-md max-w-sm text-center">
              <OnlyTokLogo variant="emblem" size="lg" className="mx-auto mb-3" />
              <div className="font-display font-bold text-white text-lg">Verified Ecosystem</div>
              <p className="text-xs text-[#8E8EA0] mt-1 mb-4">
                100% legal adult talent release, zero uncredited reposting.
              </p>
              <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block">
                ✓ Active Vetting Open
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
