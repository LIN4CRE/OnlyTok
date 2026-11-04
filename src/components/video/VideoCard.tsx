import React from 'react';
import { assetUrl } from '../../utils/assets';
import { Play, Music, ShieldCheck } from 'lucide-react';
import { VideoItem } from '../../data/contentRegistry';

interface VideoCardProps {
  video: VideoItem;
  onPlay: (video: VideoItem) => void;
  onOpenCreator?: (creatorId: string) => void;
  className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPlay,
  onOpenCreator,
  className = '',
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden bg-[#121217] border border-white/[0.08] hover:border-[#FF2A85]/50 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-[#FF2A85]/10 flex flex-col ${className}`}
    >
      {/* 9:16 Vertical Video Frame */}
      <div
        className="relative aspect-[9/16] w-full overflow-hidden bg-[#181822] cursor-pointer"
        onClick={() => onPlay(video)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onPlay(video);
          }
        }}
        aria-label={`Play video: ${video.title} by ${video.creatorName}`}
      >
        <img
          src={assetUrl(video.thumbnailUrl)}
          alt={`Authorized video thumbnail: ${video.title} by ${video.creatorName}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />

        {/* Top Overlay Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {video.engagementTag ? (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FF2A85] text-white shadow-sm">
              {video.engagementTag}
            </span>
          ) : (
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[#A1A1AA] border border-white/10">
              {video.category}
            </span>
          )}

          <span className="text-[10px] font-mono text-white/90 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10">
            {formatDuration(video.durationSeconds)}
          </span>
        </div>

        {/* Center Hover Play Button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-[#FF2A85] text-white flex items-center justify-center shadow-lg shadow-[#FF2A85]/40 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 ml-1 fill-white" />
          </div>
        </div>

        {/* Bottom Scrim with Title and Sound */}
        <div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
          <h3 className="font-display font-bold text-base text-white leading-snug line-clamp-2 mb-1.5 group-hover:text-[#FF2A85] transition-colors">
            {video.title}
          </h3>

          <div className="flex items-center gap-1.5 text-[11px] text-[#A1A1AA] truncate">
            <Music className="w-3 h-3 text-[#FF2A85] shrink-0 animate-pulse" />
            <span className="truncate">{video.audioTrack.name} · {video.audioTrack.artist}</span>
          </div>
        </div>
      </div>

      {/* Creator Info Footer */}
      <div className="p-3.5 bg-[#121217] border-t border-white/[0.05] flex items-center justify-between gap-3">
        <button
          onClick={() => onOpenCreator ? onOpenCreator(video.creatorId) : onPlay(video)}
          className="flex items-center gap-2.5 text-left group/creator hover:opacity-90 transition-opacity truncate"
          aria-label={`View creator profile for ${video.creatorName}`}
        >
          <div className="w-7 h-7 rounded-full overflow-hidden bg-[#181822] border border-[#FF2A85]/30 shrink-0">
            <img
              src={assetUrl(video.thumbnailUrl)}
              alt={video.creatorName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white group-hover/creator:text-[#FF2A85] transition-colors flex items-center gap-1">
              <span className="truncate">{video.creatorName}</span>
              <ShieldCheck className="w-3 h-3 text-[#FF2A85] shrink-0" />
            </div>
            <div className="text-[10px] text-[#8E8EA0] font-mono leading-none truncate">
              {video.creatorHandle}
            </div>
          </div>
        </button>

        <button
          onClick={() => onPlay(video)}
          className="px-2.5 py-1 text-[11px] font-semibold text-white/90 bg-white/5 hover:bg-[#FF2A85] hover:text-white rounded-lg transition-colors shrink-0"
        >
          Watch
        </button>
      </div>
    </div>
  );
};
