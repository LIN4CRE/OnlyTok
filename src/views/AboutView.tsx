import React from 'react';
import { OnlyTokLogo } from '../components/brand/OnlyTokLogo';
import { BrandSystemSection } from '../components/brand/BrandSystemSection';
import { VisionSection } from '../components/vision/VisionSection';
import { BrandPartnershipSection } from '../components/partners/BrandPartnershipSection';
import { ExternalLink, ShieldCheck, Mail, Sparkles } from 'lucide-react';

interface AboutViewProps {
  onOpenBrandModal: () => void;
  onNavigateSubmit: () => void;
  onOpenCompliance: (tab?: 'age' | 'rights' | 'privacy' | 'takedown') => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onOpenBrandModal,
  onNavigateSubmit,
  onOpenCompliance,
}) => {
  return (
    <div className="space-y-16 pb-20">
      
      {/* Editorial Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-widest text-[#FF2A85] mb-3 font-mono">
            About ONLYTOK Media
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-white tracking-tight leading-tight mb-6">
            Entertainment Built for Modern Attention.
          </h1>
          <p className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed">
            ONLYTOK is a dedicated entertainment and creator-discovery brand operating through the flagship TikTok channel <span className="text-white font-bold">@onlytokgirls</span>. We bridge extraordinary creator charisma with high-production curation, brand partnerships, and viral audio.
          </p>
        </div>

        {/* Quick Identity Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
          <div className="p-5 rounded-2xl bg-[#121217] border border-white/[0.08]">
            <div className="text-xs font-mono text-[#FF2A85] mb-1">PRIMARY CHANNEL</div>
            <div className="font-display font-bold text-white text-lg">TikTok @onlytokgirls</div>
            <p className="text-xs text-[#8E8EA0] mt-1">Direct vertical video distribution network.</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#121217] border border-white/[0.08]">
            <div className="text-xs font-mono text-[#D90368] mb-1">GOVERNANCE & SAFETY</div>
            <div className="font-display font-bold text-white text-lg">18+ Verified Talent</div>
            <p className="text-xs text-[#8E8EA0] mt-1">Zero unverified submissions, documented consent.</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#121217] border border-white/[0.08]">
            <div className="text-xs font-mono text-[#7928CA] mb-1">MONETISATION</div>
            <div className="font-display font-bold text-white text-lg">Strategic Partnerships</div>
            <p className="text-xs text-[#8E8EA0] mt-1">Co-branded drops, audio seeding & campaigns.</p>
          </div>
        </div>
      </section>

      {/* Strategic Pillars */}
      <VisionSection />

      {/* Brand Partnership Tiers */}
      <BrandPartnershipSection onOpenBrandModal={onOpenBrandModal} />

      {/* Complete Brand Identity Standards Guide */}
      <BrandSystemSection />

      {/* Direct Contact Desk */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#121217] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h3 className="font-display font-black text-2xl text-white mb-2">
              Media, Legal & Operations Contact
            </h3>
            <p className="text-sm text-[#A1A1AA] max-w-xl leading-relaxed">
              For general inquiries, creator verification questions, or commercial media kits, our editorial desk can be reached directly via written correspondence.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-[#FF2A85]">
              <a href="mailto:contact@onlytok.com" className="flex items-center gap-1.5 hover:underline">
                <Mail className="w-3.5 h-3.5" />
                <span>contact@onlytok.com</span>
              </a>
              <span className="text-white/20">·</span>
              <button onClick={() => onOpenCompliance('takedown')} className="hover:underline text-[#8E8EA0] hover:text-white">
                Takedown Desk: legal@onlytok.com
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateSubmit}
              className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#FF2A85] to-[#D90368] hover:from-[#ff3d93] hover:to-[#eb0c75] shadow-md shadow-[#FF2A85]/25 transition-all"
            >
              Creator Submissions
            </button>
            <a
              href="https://www.tiktok.com/@onlytokgirls"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
              aria-label="Visit @onlytokgirls on TikTok"
            >
              <ExternalLink className="w-4 h-4 text-[#FF2A85]" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
