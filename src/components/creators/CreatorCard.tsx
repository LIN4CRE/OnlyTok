import React from 'react';
import { assetUrl } from '../../utils/assets';
import { ShieldCheck, Video, ExternalLink, ArrowRight } from 'lucide-react';
import { Creator } from '../../data/contentRegistry';

interface CreatorCardProps {
  creator: Creator;
  onOpenProfile: (creatorId: string) => void;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  onOpenProfile,
}) => {
  return (
    <div className="group rounded-2xl bg-[#121217] border border-white/[0.08] hover:border-[#FF2A85]/40 transition-all duration-300 hover:-translate-y-1 p-6 flex flex-col justify-between shadow-lg hover:shadow-xl hover:shadow-[#FF2A85]/5">
      <div>
        {/* Avatar and Verified Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#181822] border-2 border-[#FF2A85]/40 group-hover:border-[#FF2A85] transition-colors shadow-md">
              <img
                src={assetUrl(creator.avatarUrl)}
                alt={`Verified creator avatar: ${creator.displayName} (${creator.username})`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#FF2A85] border-2 border-[#121217] flex items-center justify-center text-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <span className="font-mono text-[11px] text-[#FF2A85] bg-[#FF2A85]/10 px-2.5 py-1 rounded-full border border-[#FF2A85]/20 flex items-center gap-1">
            <Video className="w-3 h-3" />
            <span>{creator.totalSpotlights} {creator.totalSpotlights === 1 ? 'Release' : 'Releases'}</span>
          </span>
        </div>

        {/* Name and Handle */}
        <h3 className="font-display font-bold text-lg text-white group-hover:text-[#FF2A85] transition-colors leading-snug">
          {creator.displayName}
        </h3>
        <p className="font-mono text-xs text-[#8E8EA0] mb-3">
          {creator.username}
        </p>

        {/* Bio */}
        <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-3 mb-4">
          {creator.bio}
        </p>

        {/* Categories (Unboxed text with dots) */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#8E8EA0] mb-5">
          {creator.categories.map((cat, i) => (
            <React.Fragment key={cat}>
              {i > 0 && <span aria-hidden="true">·</span>}
              <span className="text-[#A1A1AA]">{cat}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
        <button
          onClick={() => onOpenProfile(creator.id)}
          className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#181822] hover:bg-gradient-to-r hover:from-[#FF2A85] hover:to-[#D90368] border border-white/10 hover:border-transparent transition-all flex items-center justify-center gap-1.5"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        {creator.socialLinks.tiktok && (
          <a
            href={creator.socialLinks.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl text-[#8E8EA0] hover:text-white bg-[#181822] hover:bg-white/10 border border-white/5 transition-colors"
            aria-label={`Open ${creator.displayName}'s official TikTok`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};
