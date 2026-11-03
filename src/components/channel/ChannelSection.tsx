import React, { useState } from 'react';
import { ExternalLink, Volume2, VolumeX, Sparkles, CheckCircle2, Play, Pause } from 'lucide-react';
import { OnlyTokLogo } from '../brand/OnlyTokLogo';

interface ChannelSectionProps {
  onOpenCreatorModal: () => void;
}

export const ChannelSection: React.FC<ChannelSectionProps> = ({ onOpenCreatorModal }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const categories = [
    { title: 'Dance & Choreography', tag: 'High Rhythm', count: 'Spotlight' },
    { title: 'Fashion & Visual Aesthetics', tag: 'Editorial Looks', count: 'Spotlight' },
    { title: 'Music & Trending Sounds', tag: 'Viral Audio', count: 'Spotlight' },
    { title: 'Comedy & Relatable POV', tag: 'Entertainment', count: 'Spotlight' },
    { title: 'Fitness & Active Lifestyle', tag: 'Performance', count: 'Spotlight' },
    { title: 'Cosplay & Creative Arts', tag: 'Visual FX', count: 'Spotlight' },
  ];

  return (
    <section id="channel" className="py-20 md:py-28 bg-[#09090C] border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-widest text-[#FF2A85] mb-3">
              Official Distribution Hub
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
              TikTok Channel: <span className="text-[#FF2A85]">@onlytokgirls</span>
            </h2>
            <p className="text-base text-[#A1A1AA] mt-4 leading-relaxed">
              Our flagship destination for creator spotlights, cultural moments, and collaborative vertical entertainment.
            </p>
          </div>

          <a
            href="https://www.tiktok.com/@onlytokgirls"
            target="_blank"
            rel="noopener noreferrer"
            className="self-start md:self-auto px-5 py-3 rounded-xl font-bold text-xs text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-all flex items-center gap-2 shrink-0 group"
          >
            <span>Open @onlytokgirls on TikTok</span>
            <ExternalLink className="w-4 h-4 text-[#FF2A85] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Dual Column Layout: Left Interactive Channel Mockup, Right Category Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Channel Experience Preview Card */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-[#121217] border border-white/[0.08] p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF2A85]/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Channel Profile Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF2A85] to-[#7928CA] p-0.5 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-[#09090C] flex items-center justify-center">
                      <OnlyTokLogo variant="emblem" size="sm" />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#FF2A85] border-2 border-[#09090C] flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-extrabold text-white text-lg">ONLYTOK</h3>
                  </div>
                  <p className="font-mono text-xs text-[#FF2A85] font-semibold">@onlytokgirls</p>
                  <p className="text-xs text-[#8E8EA0] mt-0.5">Premier Creator Spotlight Channel</p>
                </div>
              </div>

              {/* Bio & Links Box */}
              <div className="p-4 rounded-xl bg-[#181822] border border-white/5 mb-6 text-xs text-[#A1A1AA] leading-relaxed">
                <p className="font-medium text-white mb-1">
                  🔥 The official spotlight for extraordinary TikTok creators.
                </p>
                <p>
                  18+ Verified Talent · Submissions Open · Managed by ONLYTOK Media.
                </p>
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#8E8EA0]">
                  <span>Link in Bio: onlytok.com</span>
                  <span className="text-[#FF2A85]">Official Channel</span>
                </div>
              </div>

              {/* Interactive Sound & Waveform Preview */}
              <div className="rounded-xl bg-[#181822] border border-white/5 p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-8 h-8 rounded-full bg-[#FF2A85] hover:bg-[#ff3d93] text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
                      aria-label={isPlaying ? 'Pause brand sound teaser' : 'Play brand sound teaser'}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                    <div>
                      <div className="text-xs font-bold text-white leading-none">ONLYTOK Audio Identity</div>
                      <div className="text-[11px] text-[#8E8EA0] mt-0.5">Signature Bass Refraction (128 BPM)</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-[#8E8EA0] hover:text-white transition-colors p-1"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Animated Waveform Visualizer */}
                <div className="flex items-end gap-1 h-8 pt-1 px-1">
                  {[24, 45, 78, 60, 90, 40, 65, 85, 30, 70, 95, 55, 80, 45, 60, 85, 40, 75, 90, 50, 70, 85, 35, 60].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-full transition-all duration-300"
                      style={{
                        height: isPlaying ? `${Math.max(15, (height * (1 + (i % 3) * 0.2)) % 100)}%` : '20%',
                        backgroundColor: i % 2 === 0 ? '#FF2A85' : '#7928CA',
                        opacity: isPlaying ? 0.9 : 0.3,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Direct Channel CTA */}
            <a
              href="https://www.tiktok.com/@onlytokgirls"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#FF2A85] to-[#D90368] hover:from-[#ff3d93] hover:to-[#eb0c75] shadow-lg shadow-[#FF2A85]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span>Follow @onlytokgirls</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Right Column: Submission Pathways & Categories */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-xl text-white">
                  Content Pillars Open for Feature
                </h3>
                <span className="text-xs font-mono text-[#8E8EA0]">
                  Vetted Weekly
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-[#121217] border border-white/[0.08] hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#FF2A85]">
                        {cat.tag}
                      </span>
                      <span className="text-[10px] text-[#8E8EA0]">
                        {cat.count}
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-white text-base group-hover:text-[#FF2A85] transition-colors">
                      {cat.title}
                    </h4>
                    <p className="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed">
                      Accepting verified video submissions for channel syndication and artist highlights.
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Kicker Box */}
            <div className="rounded-2xl bg-gradient-to-r from-[#181822] to-[#121217] border border-white/[0.08] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-display font-bold text-white text-base">
                  Are you a creator on TikTok?
                </h4>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  Apply to have your original videos featured on @onlytokgirls with full credit and profile tagging.
                </p>
              </div>
              <button
                onClick={onOpenCreatorModal}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF2A85] hover:bg-[#ff3d93] shadow-md shadow-[#FF2A85]/25 transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply (18+)</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
