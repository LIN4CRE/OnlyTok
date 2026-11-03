import React from 'react';
import { ExternalLink, Sparkles, ShieldCheck, ArrowRight, Play } from 'lucide-react';
import { OnlyTokLogo } from '../brand/OnlyTokLogo';

interface HeroSectionProps {
  onOpenCreatorModal: () => void;
  onOpenBrandModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenCreatorModal,
  onOpenBrandModal,
}) => {
  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-12 pb-20 md:py-24">
      {/* Background Graphic Asset with Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/onlytok_brand_hero_backdrop_1793722066801.jpg"
          alt="ONLYTOK Luxury Dark Atmosphere"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105"
        />
        {/* Measured Scrim Gradient for 4.5:1+ legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090C] via-[#09090C]/85 to-[#09090C]/65" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#09090C]/60 to-[#09090C]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Statement & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Unboxed Metadata Trust Line (Zero-Pill discipline) */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#8E8EA0] mb-5">
              <span className="text-[#FF2A85]">Official Brand Hub</span>
              <span aria-hidden="true" className="text-white/20">·</span>
              <span className="text-white/90">@onlytokgirls</span>
              <span aria-hidden="true" className="text-white/20">·</span>
              <span>18+ Verified Talent</span>
            </div>

            {/* Display Headline with balanced wrap */}
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.08] mb-6 text-balance">
              The Premier Hub for{' '}
              <span className="bg-gradient-to-r from-white via-white to-[#FF2A85] bg-clip-text text-transparent">
                Creator Discovery
              </span>{' '}
              & Entertainment.
            </h1>

            {/* Value Proposition Body */}
            <p className="text-base sm:text-lg text-[#A1A1AA] max-w-xl leading-relaxed mb-8">
              ONLYTOK is building the definitive dark-entertainment brand connecting viral culture, 
              high-impact creator talent, and strategic brand opportunities directly from TikTok.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-10">
              <button
                onClick={onOpenCreatorModal}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#FF2A85] to-[#D90368] hover:from-[#ff3d93] hover:to-[#eb0c75] shadow-lg shadow-[#FF2A85]/25 hover:shadow-[#FF2A85]/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit Creator Application</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <a
                href="https://www.tiktok.com/@onlytokgirls"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-[#181822] hover:bg-[#222230] border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Visit @onlytokgirls</span>
                <ExternalLink className="w-4 h-4 text-[#FF2A85]" />
              </a>
            </div>

            {/* Compliance & Safeguard Notice (Unboxed) */}
            <div className="flex items-center gap-2.5 text-xs text-[#8E8EA0] pt-2 border-t border-white/[0.08] w-full max-w-lg">
              <ShieldCheck className="w-4 h-4 text-[#FF2A85] shrink-0" />
              <span>Strict 18+ policy · Documented talent consent · Real authorized creators only</span>
            </div>
          </div>

          {/* Right Column: Editorial Visual Showcase Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-2xl bg-[#121217]/90 border border-white/10 p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl group">
              {/* Subtle top ambient glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FF2A85]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#7928CA]/20 rounded-full blur-3xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <OnlyTokLogo variant="emblem" size="md" />
                  <div>
                    <h3 className="font-display font-bold text-white text-base leading-none">
                      ONLYTOK ENTERTAINMENT
                    </h3>
                    <p className="text-xs text-[#8E8EA0] mt-1">@onlytokgirls · Verified Media</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono tracking-wider text-[#FF2A85] bg-[#FF2A85]/10 px-2 py-0.5 rounded border border-[#FF2A85]/20">
                  EST. 2026
                </span>
              </div>

              {/* Studio Visual Atmosphere */}
              <div className="relative rounded-xl overflow-hidden aspect-video mb-5 bg-[#181822] border border-white/5">
                <img
                  src="/src/assets/images/onlytok_studio_atmosphere_1793722067070.jpg"
                  alt="ONLYTOK Studio Production Atmosphere"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3.5">
                  <div className="flex items-center justify-between w-full text-xs">
                    <span className="text-white font-medium flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-[#FF2A85] fill-[#FF2A85]" />
                      Studio Production Pipeline
                    </span>
                    <span className="text-white/60 font-mono text-[11px]">4K HDR</span>
                  </div>
                </div>
              </div>

              {/* Brand Pillars Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#181822]/80 border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-[#FF2A85] mt-1.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Creator Spotlights</h4>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">High-production amplification for verified talent.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#181822]/80 border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-[#7928CA] mt-1.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Brand Integrations</h4>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">Connecting leading lifestyle brands with engaged culture.</p>
                  </div>
                </div>
              </div>

              {/* Quick Action in Card */}
              <button
                onClick={onOpenBrandModal}
                className="w-full py-2.5 rounded-lg text-xs font-semibold text-white/90 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Inquire for Commercial Partnerships</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FF2A85]" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
