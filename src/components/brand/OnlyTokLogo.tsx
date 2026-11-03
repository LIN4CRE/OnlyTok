import React from 'react';

interface LogoProps {
  variant?: 'full' | 'emblem' | 'wordmark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

/**
 * ONLYTOK Original Brand Mark & Monogram
 * A premium, modern dark entertainment aesthetic.
 * Features an interlocking geometric "OT" emblem with high-precision hot-pink gradient.
 */
export const OnlyTokLogo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showSubtitle = false,
}) => {
  const sizeMap = {
    sm: { icon: 24, text: 'text-lg', dot: 4 },
    md: { icon: 32, text: 'text-xl', dot: 6 },
    lg: { icon: 44, text: 'text-2xl md:text-3xl', dot: 7 },
    xl: { icon: 60, text: 'text-3xl md:text-4xl', dot: 9 },
  };

  const { icon: iconSize, text: textSize } = sizeMap[size];

  // SVG Emblem: Interlocking O-T geometric monogram
  const EmblemSvg = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 hover:scale-105"
      aria-label="ONLYTOK Emblem"
    >
      <defs>
        <linearGradient id="ot-grad-pink" x1="8" y1="10" x2="56" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF2A85" />
          <stop offset="0.5" stopColor="#D90368" />
          <stop offset="1" stopColor="#7928CA" />
        </linearGradient>
        <linearGradient id="ot-grad-border" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF2A85" stopOpacity="0.4" />
          <stop offset="1" stopColor="#7928CA" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Dark shield background */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill="#121217" stroke="url(#ot-grad-border)" strokeWidth="1.5" />

      {/* Geometric 'O' loop */}
      <path
        d="M20 18C14.4772 18 10 22.4772 10 28V36C10 41.5228 14.4772 46 20 46H24V38H20C18.8954 38 18 37.1046 18 36V28C18 26.8954 18.8954 26 20 26H24V18H20Z"
        fill="#FFFFFF"
      />

      {/* Dynamic 'T' cross & vertical bar that intertwines */}
      <path
        d="M22 18H50V25H39V46H31V25H22V18Z"
        fill="url(#ot-grad-pink)"
      />

      {/* Modern K-slash angle / Play dynamic arrow */}
      <path
        d="M41 33L51 46H42L35 37L41 33Z"
        fill="#FFFFFF"
        fillOpacity="0.9"
      />

      {/* Hot pink focal pulse point */}
      <circle cx="49" cy="22" r="3.5" fill="#FF2A85" />
    </svg>
  );

  if (variant === 'emblem') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {EmblemSvg}
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex items-baseline font-display font-extrabold tracking-tight ${textSize} ${className}`}>
        <span className="text-white">ONLY</span>
        <span className="bg-gradient-to-r from-[#FF2A85] via-[#D90368] to-[#9D4EDD] bg-clip-text text-transparent">
          TOK
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {EmblemSvg}
      <div className="flex flex-col">
        <div className={`font-display font-black tracking-tight leading-none ${textSize}`}>
          <span className="text-white">ONLY</span>
          <span className="bg-gradient-to-r from-[#FF2A85] to-[#E0218A] bg-clip-text text-transparent">
            TOK
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8E8EA0] font-medium mt-1">
            Official @onlytokgirls
          </span>
        )}
      </div>
    </div>
  );
};
