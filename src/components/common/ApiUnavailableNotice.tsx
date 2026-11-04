import React from 'react';
import { ServerOff, MessageCircle, Mail } from 'lucide-react';
import { OFFICIAL_TIKTOK_HANDLE, OFFICIAL_TIKTOK_URL } from '../../utils/seo';

interface ApiUnavailableNoticeProps {
  /** Human-readable feature name, e.g. "Creator submissions". */
  feature: string;
  /** Best contact address for this feature (brand-configured). */
  contactEmail?: string;
  /** Compact layout for use inside modals. */
  compact?: boolean;
}

/**
 * Honest "unavailable on this deployment" state.
 *
 * Shown when the Express backend is not present (static Vercel / GitHub Pages
 * hosting). It never pretends the feature worked — it explains the limitation
 * and offers genuine alternative contact routes.
 */
export const ApiUnavailableNotice: React.FC<ApiUnavailableNoticeProps> = ({
  feature,
  contactEmail = 'contact@onlytok.com',
  compact = false,
}) => {
  return (
    <div
      role="status"
      className={`rounded-2xl bg-[#121217] border border-amber-400/20 ${
        compact ? 'p-5' : 'p-8 sm:p-10'
      } text-center max-w-xl mx-auto my-6`}
    >
      <div
        className={`${
          compact ? 'w-11 h-11 mb-4' : 'w-14 h-14 mb-5'
        } rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto text-amber-300`}
      >
        <ServerOff className={compact ? 'w-5 h-5' : 'w-6 h-6'} />
      </div>

      <h3 className={`font-display font-bold text-white tracking-tight mb-2 ${compact ? 'text-lg' : 'text-2xl'}`}>
        {feature} — not available on this deployment
      </h3>

      <p className={`text-[#A1A1AA] leading-relaxed mx-auto mb-6 ${compact ? 'text-xs max-w-sm' : 'text-sm max-w-md'}`}>
        This static edition of the site does not include the ONLYTOK API server, so{' '}
        {feature.toLowerCase()} cannot be processed here. Nothing has been submitted or saved.
        Please use one of the official channels below instead — they are monitored by the team.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={OFFICIAL_TIKTOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF2A85] to-[#D90368] hover:from-[#ff3d93] hover:to-[#eb0c75] shadow-md shadow-[#FF2A85]/25 transition-all flex items-center gap-1.5"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Message {OFFICIAL_TIKTOK_HANDLE} on TikTok</span>
        </a>
        <a
          href={`mailto:${contactEmail}`}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#181822] hover:bg-[#222230] border border-white/10 hover:border-white/20 transition-all flex items-center gap-1.5"
        >
          <Mail className="w-3.5 h-3.5 text-[#FF2A85]" />
          <span>{contactEmail}</span>
        </a>
      </div>
    </div>
  );
};
