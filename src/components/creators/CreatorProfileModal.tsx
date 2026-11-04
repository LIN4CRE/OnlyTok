import React from 'react';
import { assetUrl } from '../../utils/assets';
import { X, ShieldCheck, ExternalLink, Video, Sparkles } from 'lucide-react';
import { Creator, getAuthorizedVideos, VideoItem } from '../../data/contentRegistry';
import { VideoCard } from '../video/VideoCard';
import { EmptyState } from '../common/EmptyState';
import { trackTikTokOutboundClick } from '../../utils/analytics';

interface CreatorProfileModalProps {
  creator: Creator | null;
  onClose: () => void;
  onPlayVideo: (video: VideoItem) => void;
  onOpenSubmit: () => void;
}

export const CreatorProfileModal: React.FC<CreatorProfileModalProps> = ({
  creator,
  onClose,
  onPlayVideo,
  onOpenSubmit,
}) => {
  if (!creator) return null;

  const creatorVideos = getAuthorizedVideos({ creatorId: creator.id });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`Profile for ${creator.displayName}`}
    >
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#0F0F14] border border-white/10 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-[#FF2A85] text-white flex items-center justify-center backdrop-blur-md transition-colors"
          aria-label="Close profile modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Top Banner */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-[#181822] via-[#221024] to-[#181822] border-b border-white/10 relative overflow-hidden shrink-0">
          <div className="absolute -top-12 left-1/3 w-72 h-72 bg-[#FF2A85]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-4 left-6 text-[10px] font-mono tracking-widest uppercase text-[#FF2A85]">
            Verified ONLYTOK Talent Profile
          </div>
        </div>

        {/* Profile Info Header Bar */}
        <div className="px-6 sm:px-8 pb-6 border-b border-white/[0.08] relative shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#181822] border-4 border-[#0F0F14] shadow-2xl">
                <img
                  src={assetUrl(creator.avatarUrl)}
                  alt={`Verified profile photo of ${creator.displayName} (${creator.username})`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#FF2A85] border-2 border-[#0F0F14] flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2.5">
              {creator.socialLinks.tiktok && (
                <a
                  href={creator.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackTikTokOutboundClick('creator_profile_modal', creator.socialLinks.tiktok)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-[#FF2A85] transition-all flex items-center gap-1.5"
                >
                  <span>TikTok Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
                {creator.displayName}
              </h2>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                18+ Verified
              </span>
            </div>

            <p className="font-mono text-sm text-[#FF2A85] font-semibold mt-0.5">
              {creator.username}
            </p>

            <p className="text-sm text-[#A1A1AA] leading-relaxed mt-3 max-w-2xl">
              {creator.bio}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#8E8EA0] mt-4">
              <span className="text-white/60">Specialities:</span>
              {creator.categories.map((c, i) => (
                <span key={c} className="text-white/90 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Approved Content Releases */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-[#FF2A85]" />
              <h3 className="font-display font-bold text-lg text-white">
                Approved Content Releases ({creatorVideos.length})
              </h3>
            </div>
            <span className="text-xs font-mono text-[#8E8EA0]">
              Official Authorised Media
            </span>
          </div>

          {creatorVideos.length === 0 ? (
            <EmptyState
              title="New videos are coming soon."
              description="This creator's upcoming media releases are currently in post-production and compliance review."
              actionLabel="Submit Your Content"
              onAction={onOpenSubmit}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {creatorVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPlay={(v) => {
                    onClose();
                    onPlayVideo(v);
                  }}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
