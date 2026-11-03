import React from 'react';
import { Target, Shield, Flame, TrendingUp } from 'lucide-react';

export const VisionSection: React.FC = () => {
  const pillars = [
    {
      num: '01',
      title: 'Creator Amplification Engine',
      description:
        'ONLYTOK provides verified TikTok talent with curated editorial spotlights, amplifying breakout creators to a rapidly growing, engaged audience.',
      icon: Flame,
      accent: 'from-[#FF2A85] to-[#D90368]',
    },
    {
      num: '02',
      title: 'TikTok-First Discovery Loop',
      description:
        'Engineered for modern attention patterns. Operating through the official @onlytokgirls channel to identify, feature, and syndicate viral moments.',
      icon: Target,
      accent: 'from-[#D90368] to-[#7928CA]',
    },
    {
      num: '03',
      title: 'Commercial Monetisation Horizon',
      description:
        'Building long-term enterprise value through strategic brand sponsorships, curated creator collaborations, talent management, and co-branded drops.',
      icon: TrendingUp,
      accent: 'from-[#7928CA] to-[#4361EE]',
    },
    {
      num: '04',
      title: 'Strict 18+ & Content Rights Governance',
      description:
        'Every featured creator is strictly verified to be at least 18 years old with documented written consent and ownership clearance before publication.',
      icon: Shield,
      accent: 'from-[#FF2A85] to-[#7928CA]',
    },
  ];

  return (
    <section id="vision" className="py-20 md:py-28 bg-[#09090C] border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-[#FF2A85] mb-3">
            Strategic Foundation
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight mb-5">
            Architected for Entertainment, Recognition & Revenue.
          </h2>
          <p className="text-base text-[#A1A1AA] leading-relaxed">
            ONLYTOK is not a generic repost account. We are constructing an independent entertainment
            institution that bridges creator stardom with premium lifestyle branding.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                className="group relative rounded-2xl bg-[#121217] border border-white/[0.08] hover:border-[#FF2A85]/40 p-7 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-sm font-bold text-[#8E8EA0] group-hover:text-[#FF2A85] transition-colors">
                      {item.num}
                    </span>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.accent} flex items-center justify-center text-white shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-lg text-white mb-3 group-hover:text-white transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-[#A1A1AA] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/[0.05] flex items-center gap-2 text-xs font-semibold text-[#8E8EA0] group-hover:text-[#FF2A85] transition-colors">
                  <span>Core Principle</span>
                  <span aria-hidden="true">→</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Transparency Banner - Authentic and Non-Invented */}
        <div className="mt-12 rounded-2xl bg-[#181822]/80 border border-white/[0.08] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h4 className="font-display font-bold text-white text-base md:text-lg mb-1">
              Authenticity & Standards Commitment
            </h4>
            <p className="text-xs md:text-sm text-[#A1A1AA] leading-relaxed">
              In accordance with ONLYTOK operating standards, all featured creators undergo identity and age validation (18+). We never invent follower metrics, fabricated bios, or unverified creator testimonials.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-xs font-mono text-[#FF2A85] bg-[#FF2A85]/10 px-3.5 py-2 rounded-lg border border-[#FF2A85]/20">
            <Shield className="w-4 h-4" />
            <span>18+ VERIFIED ONLY</span>
          </div>
        </div>

      </div>
    </section>
  );
};
