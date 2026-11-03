import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Repeat,
  Share2,
  Copy,
  Check,
  Music,
  ShieldCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flag,
} from 'lucide-react';
import { VideoItem, getRelatedVideos } from '../../data/contentRegistry';

interface VideoPlayerModalProps {
  video: VideoItem | null;
  onClose: () => void;
  onSelectVideo: (video: VideoItem) => void;
  onOpenCreator: (creatorId: string) => void;
  onReportVideo?: (video: VideoItem) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  onSelectVideo,
  onOpenCreator,
  onReportVideo,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const duration = video?.durationSeconds || 30;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Playback timer simulation
  useEffect(() => {
    if (!video) return;
    setCurrentTime(0);
    setIsPlaying(true);
  }, [video?.id]);

  useEffect(() => {
    if (isPlaying && video) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            return isLooping ? 0 : duration;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration, isLooping, video]);

  if (!video) return null;

  const related = getRelatedVideos(video.id, 3);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(window.location.origin + `?video=${video.id}`).catch(() => {});
    }
    setCopied(true);
    setShareToast('Video link copied to clipboard!');
    setTimeout(() => {
      setCopied(false);
      setShareToast(null);
    }, 2500);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Watch "${video.title}" by ${video.creatorName} on ONLYTOK (@onlytokgirls):`);
    const url = encodeURIComponent(window.location.origin + `?video=${video.id}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Check out "${video.title}" on ONLYTOK: ${window.location.origin}?video=${video.id}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const progressPercent = (currentTime / duration) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`Video player for ${video.title}`}
    >
      <div className="relative w-full max-w-5xl rounded-3xl bg-[#0F0F14] border border-white/10 shadow-2xl overflow-hidden my-auto flex flex-col lg:flex-row">
        
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-[#FF2A85] text-white flex items-center justify-center backdrop-blur-md transition-colors"
          aria-label="Close video player"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: 9:16 Vertical Video Player Stage */}
        <div className="lg:w-5/12 bg-black flex items-center justify-center relative overflow-hidden group select-none">
          <div className="relative aspect-[9/16] w-full max-h-[75vh] max-w-[380px] mx-auto overflow-hidden">
            {/* Visual Media Poster / Frame */}
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-102' : 'scale-100'
              }`}
            />

            {/* Ambient Lighting Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />

            {/* Click to Pause/Play Area */}
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {!isPlaying && (
                <div className="w-18 h-18 rounded-full bg-[#FF2A85]/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-md transform scale-100 animate-in zoom-in-75 duration-150">
                  <Play className="w-8 h-8 ml-1 fill-white" />
                </div>
              )}
            </div>

            {/* Top Bar inside Player */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs text-white/90 pointer-events-none">
              <span className="font-mono text-[11px] bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                ONLYTOK 4K HDR
              </span>

              <span className="font-mono text-[11px] bg-[#FF2A85]/80 px-2 py-0.5 rounded text-white font-bold">
                VERIFIED 18+
              </span>
            </div>

            {/* Bottom Controls Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 pt-10 bg-gradient-to-t from-black via-black/80 to-transparent">
              
              {/* Progress Bar (Clickable) */}
              <div
                className="w-full h-1.5 bg-white/20 hover:h-2 rounded-full cursor-pointer mb-3 relative overflow-hidden transition-all"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  setCurrentTime(Math.floor(pos * duration));
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#FF2A85] to-[#D90368] rounded-full transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 hover:text-[#FF2A85] transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 hover:text-[#FF2A85] transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
                  </button>

                  <span className="font-mono text-[11px] text-[#A1A1AA]">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`p-1.5 transition-colors ${
                      isLooping ? 'text-[#FF2A85]' : 'text-[#8E8EA0]'
                    }`}
                    aria-label={isLooping ? 'Disable Loop' : 'Enable Loop'}
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Creator Info, Details, Sharing & Related Videos */}
        <div className="lg:w-7/12 p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
          
          <div>
            {/* Category and Date Header */}
            <div className="flex items-center gap-2 text-xs text-[#8E8EA0] uppercase tracking-wider mb-2 font-mono">
              <span className="text-[#FF2A85] font-semibold">{video.category}</span>
              <span>·</span>
              <span>Published {video.publishedDate}</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> 18+ Authorised
              </span>
            </div>

            {/* Video Title */}
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white leading-tight mb-3">
              {video.title}
            </h2>

            {/* Description */}
            <p className="text-sm text-[#A1A1AA] leading-relaxed mb-6">
              {video.description}
            </p>

            {/* Creator Information Card */}
            <div className="p-4 rounded-2xl bg-[#16161E] border border-white/[0.08] mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#222230] border-2 border-[#FF2A85] shrink-0">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.creatorName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-display font-bold text-white text-base flex items-center gap-1.5">
                    <span>{video.creatorName}</span>
                    <ShieldCheck className="w-4 h-4 text-[#FF2A85]" />
                  </div>
                  <div className="font-mono text-xs text-[#8E8EA0]">
                    {video.creatorHandle}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onOpenCreator(video.creatorId)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-[#FF2A85] transition-all"
                >
                  View Profile
                </button>
                <a
                  href={video.directTikTokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-white/80 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                  aria-label="Open on TikTok"
                >
                  <ExternalLink className="w-4 h-4 text-[#FF2A85]" />
                </a>
              </div>
            </div>

            {/* Audio Track Tag */}
            <div className="p-3 rounded-xl bg-[#121217] border border-white/5 flex items-center justify-between text-xs text-[#A1A1AA] mb-6">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-lg bg-[#FF2A85]/10 flex items-center justify-center text-[#FF2A85] shrink-0">
                  <Music className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-white font-medium truncate">{video.audioTrack.name}</div>
                  <div className="text-[#8E8EA0] text-[11px] truncate">{video.audioTrack.artist}</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#8E8EA0] shrink-0">Original Sound</span>
            </div>

            {/* Sharing Bar */}
            <div className="mb-8">
              <div className="text-xs font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#FF2A85]" />
                <span>Share this Video</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#181822] hover:bg-[#222230] border border-white/10 transition-all flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Link' : 'Copy Link'}</span>
                </button>

                <button
                  onClick={handleShareTwitter}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#181822] hover:bg-[#222230] border border-white/10 transition-all"
                >
                  Share on X
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#181822] hover:bg-[#222230] border border-white/10 transition-all"
                >
                  WhatsApp
                </button>

                {onReportVideo && (
                  <button
                    onClick={() => onReportVideo(video)}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-[#8E8EA0] hover:text-rose-400 bg-[#181822] hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 transition-all flex items-center gap-1.5"
                    title="Report content, copyright violation, minor concerns, or inappropriate footage"
                  >
                    <Flag className="w-3.5 h-3.5 text-rose-400" />
                    <span>Report Video</span>
                  </button>
                )}

                <a
                  href={video.directTikTokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#FF2A85] hover:bg-[#ff3d93] shadow-md shadow-[#FF2A85]/20 transition-all flex items-center gap-1.5 ml-auto"
                >
                  <span>Open on TikTok</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {shareToast && (
                <div className="mt-2 text-xs font-medium text-emerald-400 animate-in fade-in">
                  ✓ {shareToast}
                </div>
              )}
            </div>
          </div>

          {/* Related Authorised Videos */}
          <div className="pt-6 border-t border-white/[0.08]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-display font-bold text-sm text-white">
                Related Authorised Releases
              </h4>
              <span className="text-[11px] font-mono text-[#8E8EA0]">
                {related.length} available
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {related.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectVideo(rel)}
                  className="group/rel cursor-pointer rounded-xl overflow-hidden bg-[#181822] border border-white/5 hover:border-[#FF2A85]/40 transition-all"
                >
                  <div className="aspect-[9/16] relative overflow-hidden bg-black">
                    <img
                      src={rel.thumbnailUrl}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover/rel:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <p className="text-[10px] font-bold text-white leading-tight line-clamp-1 group-hover/rel:text-[#FF2A85]">
                        {rel.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
