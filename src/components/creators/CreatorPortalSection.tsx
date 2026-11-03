import React from 'react';
import { Sparkles, Shield, Lock, FileCheck, CheckCircle2 } from 'lucide-react';

interface CreatorPortalSectionProps {
  onOpenCreatorModal: () => void;
}

export const CreatorPortalSection: React.FC<CreatorPortalSectionProps> = ({
  onOpenCreatorModal,
}) => {
  const steps = [
    {
      step: '01',
      title: 'Digital Application & Age Verification',
      desc: 'Submit your verified TikTok handle (@handle) and confirm 18+ legal age status through our secure portal.',
      icon: Shield,
    },
    {
      step: '02',
      title: 'Editorial & Quality Vetting',
      desc: 'Our creative team reviews content aesthetic, audio alignment, and original production craftsmanship.',
      icon: FileCheck,
    },
    {
      step: '03',
      title: 'Spotlight Feature & Audience Amplification',
      desc: 'Approved videos are scheduled on @onlytokgirls with prominent creator taglines, bio links, and sound attribution.',
      icon: Sparkles,
    },
  ];

  const creatorRights = [
    'You retain 100% ownership and copyright of your video content.',
    'No paid entry fees or hidden agency commission locks.',
    'Clear documented consent with hassle-free takedown requests.',
    'Direct audience routing to your personal TikTok account.',
  ];

  return (
    <section id="creators" className="py-20 md:py-28 bg-[#09090C] border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-[#FF2A85] mb-3">
            Creator Discovery Engine
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight mb-5">
            Transparent, Ethical & Creator-First.
          </h2>
          <p className="text-base text-[#A1A1AA] leading-relaxed">
            ONLYTOK was built to solve the frustration of stolen video re-uploads without attribution. 
            We operate exclusively through verified submissions with explicit 18+ confirmation and author release.
          </p>
        </div>

        {/* 3 Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="rounded-2xl bg-[#121217] border border-white/[0.08] p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-sm font-bold text-[#FF2A85]">
                      STEP {s.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                      <Icon className="w-5 h-5 text-[#FF2A85]" />
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-lg text-white mb-3">
                    {s.title}
                  </h3>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1.5 text-xs text-[#8E8EA0]">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Secure verified pipeline</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Creator Rights & Action Box */}
        <div className="rounded-2xl bg-gradient-to-br from-[#181822] to-[#121217] border border-white/[0.08] p-8 md:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="text-xs font-mono font-bold text-[#FF2A85] uppercase tracking-wider mb-2">
              The ONLYTOK Creator Covenant
            </div>
            <h4 className="font-display font-black text-2xl text-white mb-4">
              Guaranteed Protections for Every Featured Talent
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {creatorRights.map((right, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#A1A1AA]">
                  <CheckCircle2 className="w-4 h-4 text-[#FF2A85] shrink-0 mt-0.5" />
                  <span>{right}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <button
              onClick={onOpenCreatorModal}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#FF2A85] to-[#D90368] hover:from-[#ff3d93] hover:to-[#eb0c75] shadow-lg shadow-[#FF2A85]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Apply for Spotlight (18+)</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
