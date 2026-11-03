import React from 'react';
import { Briefcase, ArrowRight, Music2, Eye, ShieldCheck } from 'lucide-react';

interface BrandPartnershipSectionProps {
  onOpenBrandModal: () => void;
}

export const BrandPartnershipSection: React.FC<BrandPartnershipSectionProps> = ({
  onOpenBrandModal,
}) => {
  const tiers = [
    {
      title: 'Talent Spotlight Sponsorship',
      tag: 'Native Integration',
      description:
        'Co-brand curated creator episodes with seamless visual placement, opening bumper attribution, and verified taglines.',
      highlights: ['Custom video intro lockup', 'Pinned comment & profile tag', 'Performance metric reporting'],
      icon: Eye,
    },
    {
      title: 'Record Label Sound Seeding',
      tag: 'Audio Amplification',
      description:
        'Power upcoming creator drops with your official TikTok audio track or single, catalyzing organic sound virality.',
      highlights: ['Official TikTok audio link', 'Choreography or lip-sync adaptation', 'Audience sound retention'],
      icon: Music2,
    },
    {
      title: 'Custom Brand Takeover',
      tag: 'High-Impact Campaign',
      description:
        'Exclusive multi-video campaign window across @onlytokgirls tailored to your product launch or brand milestone.',
      highlights: ['Exclusive channel theme window', 'Full link-in-bio redirect', 'Commercial talent usage rights'],
      icon: Briefcase,
    },
  ];

  return (
    <section id="partners" className="py-20 md:py-28 bg-[#09090C] border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-widest text-[#FF2A85] mb-3">
              Commercial Collaborations
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
              Partner With ONLYTOK.
            </h2>
            <p className="text-base text-[#A1A1AA] mt-4 leading-relaxed">
              Reach a dynamic, entertainment-first demographic through authentic creator collaborations and high-retention vertical video.
            </p>
          </div>

          <button
            onClick={onOpenBrandModal}
            className="self-start md:self-auto px-6 py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#FF2A85] to-[#7928CA] hover:from-[#ff3d93] hover:to-[#8a35e0] shadow-lg shadow-[#FF2A85]/20 transition-all active:scale-[0.98] flex items-center gap-2 shrink-0"
          >
            <Briefcase className="w-4 h-4" />
            <span>Request Media Kit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {tiers.map((tier, idx) => {
            const Icon = tier.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#121217] border border-white/[0.08] hover:border-[#FF2A85]/30 p-7 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[11px] font-mono text-[#FF2A85] uppercase tracking-wider">
                      {tier.tag}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:border-[#FF2A85]/40 transition-colors">
                      <Icon className="w-5 h-5 text-white group-hover:text-[#FF2A85] transition-colors" />
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-xl text-white mb-3">
                    {tier.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed mb-6">
                    {tier.description}
                  </p>

                  <div className="space-y-2 border-t border-white/5 pt-4">
                    {tier.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#8E8EA0]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF2A85]" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5">
                  <button
                    onClick={onOpenBrandModal}
                    className="w-full py-2.5 rounded-lg text-xs font-semibold text-white/90 bg-[#181822] hover:bg-[#222230] border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Inquire for {tier.title.split(' ')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FF2A85]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Brand Safe Assurance */}
        <div className="rounded-xl bg-[#181822]/60 border border-white/5 p-4 sm:p-5 flex items-center gap-3 text-xs text-[#8E8EA0]">
          <ShieldCheck className="w-5 h-5 text-[#FF2A85] shrink-0" />
          <span>
            Brand Safety Guarantee: All campaigns comply with FTC sponsorship disclosure requirements, age-appropriate rating guidelines, and vetted adult talent (18+).
          </span>
        </div>

      </div>
    </section>
  );
};
