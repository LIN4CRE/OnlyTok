import React from 'react';
import { Sparkles, RefreshCw, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'New creators are coming soon.',
  description = 'We only feature authorized creators and verified original content. Check back shortly as new creator drops are vetted and published.',
  onReset,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="rounded-2xl bg-[#121217] border border-white/[0.08] p-10 sm:p-14 text-center max-w-xl mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-[#181822] border border-white/10 flex items-center justify-center mx-auto mb-5 text-[#FF2A85] shadow-inner">
        <Sparkles className="w-6 h-6" />
      </div>

      <h3 className="font-display font-bold text-2xl text-white mb-2 tracking-tight">
        {title}
      </h3>

      <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-md mx-auto mb-8">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#181822] hover:bg-[#222230] border border-white/10 hover:border-white/20 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#FF2A85]" />
            <span>Clear Filters</span>
          </button>
        )}

        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF2A85] to-[#D90368] hover:from-[#ff3d93] hover:to-[#eb0c75] shadow-md shadow-[#FF2A85]/25 transition-all flex items-center gap-1.5"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#8E8EA0] hover:text-white transition-colors"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
