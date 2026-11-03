import React, { useState } from 'react';
import { OnlyTokLogo } from './OnlyTokLogo';
import { BRAND_COLORS } from '../../utils/submissionValidator';
import { Copy, Check, Sparkles, Layers, Type, Palette, Shield } from 'lucide-react';

export const BrandSystemSection: React.FC = () => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [logoTheme, setLogoTheme] = useState<'dark' | 'elevated' | 'bordered'>('dark');

  const handleCopy = (hex: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(hex).catch(() => {});
    }
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <section id="brand-kit" className="py-20 md:py-28 bg-[#09090C] border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-[#FF2A85] mb-3">
            Design Standards & Guidelines
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight mb-5 text-balance">
            ONLYTOK Master Brand System.
          </h2>
          <p className="text-base text-[#A1A1AA] leading-relaxed">
            A bespoke visual identity engineered for the next generation of vertical video entertainment. 
            High contrast, disciplined color budgeting, and cinematic typography.
          </p>
        </div>

        {/* 1. Logo & Monogram Anatomy */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-4 h-4 text-[#FF2A85]" />
            <h3 className="font-display font-bold text-xl text-white">
              01. Wordmark & Monogram Anatomy
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Interactive Logo Stage */}
            <div className={`lg:col-span-7 rounded-2xl p-8 sm:p-12 flex flex-col justify-between transition-colors ${
              logoTheme === 'dark' ? 'bg-[#09090C] border border-white/10' :
              logoTheme === 'elevated' ? 'bg-[#181822] border border-[#FF2A85]/20' :
              'bg-[#121217] border-2 border-white/20'
            }`}>
              <div className="flex items-center justify-between mb-12">
                <span className="text-xs font-mono text-[#8E8EA0] uppercase tracking-wider">
                  Live Vector Render
                </span>
                
                {/* Surface Switcher */}
                <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/40 border border-white/10">
                  <button
                    onClick={() => setLogoTheme('dark')}
                    className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                      logoTheme === 'dark' ? 'bg-white/15 text-white' : 'text-[#8E8EA0]'
                    }`}
                  >
                    Obsidian
                  </button>
                  <button
                    onClick={() => setLogoTheme('elevated')}
                    className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                      logoTheme === 'elevated' ? 'bg-white/15 text-white' : 'text-[#8E8EA0]'
                    }`}
                  >
                    Elevated
                  </button>
                  <button
                    onClick={() => setLogoTheme('bordered')}
                    className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                      logoTheme === 'bordered' ? 'bg-white/15 text-white' : 'text-[#8E8EA0]'
                    }`}
                  >
                    Bordered
                  </button>
                </div>
              </div>

              {/* Rendered Logo */}
              <div className="py-8 flex flex-col items-center justify-center gap-6 text-center">
                <OnlyTokLogo variant="full" size="xl" />
                <div className="text-xs text-[#8E8EA0] font-mono mt-2">
                  Display Wordmark · Interlocking Geometric OT Monogram
                </div>
              </div>

              {/* Logo Specs Footer */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <div className="text-[#8E8EA0]">Clearance Area</div>
                  <div className="font-mono font-bold text-white mt-0.5">1x Radius</div>
                </div>
                <div>
                  <div className="text-[#8E8EA0]">Primary Font</div>
                  <div className="font-mono font-bold text-white mt-0.5">Outfit 900</div>
                </div>
                <div>
                  <div className="text-[#8E8EA0]">Vector Aspect</div>
                  <div className="font-mono font-bold text-white mt-0.5">1:1 Shield</div>
                </div>
              </div>
            </div>

            {/* Emblem Variations Breakdown */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              <div className="p-6 rounded-2xl bg-[#121217] border border-white/[0.08] flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono uppercase text-[#FF2A85] mb-1">Mark Variation 01</div>
                  <h4 className="font-display font-bold text-white text-base">Full Brand Lockup</h4>
                  <p className="text-xs text-[#A1A1AA] mt-1">For primary headers, footers & stationery</p>
                </div>
                <OnlyTokLogo variant="full" size="sm" />
              </div>

              <div className="p-6 rounded-2xl bg-[#121217] border border-white/[0.08] flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono uppercase text-[#D90368] mb-1">Mark Variation 02</div>
                  <h4 className="font-display font-bold text-white text-base">Standalone Monogram</h4>
                  <p className="text-xs text-[#A1A1AA] mt-1">App icon, avatar, favicon & watermarks</p>
                </div>
                <OnlyTokLogo variant="emblem" size="md" />
              </div>

              <div className="p-6 rounded-2xl bg-[#121217] border border-white/[0.08] flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono uppercase text-[#7928CA] mb-1">Mark Variation 03</div>
                  <h4 className="font-display font-bold text-white text-base">Pure Wordmark</h4>
                  <p className="text-xs text-[#A1A1AA] mt-1">Inline editorial and copy integration</p>
                </div>
                <OnlyTokLogo variant="wordmark" size="md" />
              </div>
            </div>

          </div>
        </div>

        {/* 2. Brand Color Tokens System (60-30-10) */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#FF2A85]" />
              <h3 className="font-display font-bold text-xl text-white">
                02. Color System & 60-30-10 Distribution
              </h3>
            </div>
            <span className="text-xs font-mono text-[#8E8EA0]">Click swatch to copy HEX</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {BRAND_COLORS.map((c) => {
              const isCopied = copiedHex === c.hex;
              return (
                <button
                  key={c.hex}
                  onClick={() => handleCopy(c.hex)}
                  className="group rounded-2xl bg-[#121217] border border-white/[0.08] hover:border-white/20 p-4 text-left transition-all active:scale-[0.98] flex flex-col justify-between h-44"
                >
                  <div
                    className="w-full h-16 rounded-xl border border-white/10 shadow-inner mb-3 transition-transform group-hover:scale-102 flex items-center justify-center"
                    style={{ backgroundColor: c.hex }}
                  >
                    {isCopied && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" /> Copied
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">{c.hex}</span>
                      <Copy className="w-3 h-3 text-[#8E8EA0] group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-xs font-semibold text-white/90 mt-1 truncate">{c.name}</div>
                    <div className="text-[10px] text-[#8E8EA0] mt-0.5 truncate">{c.role}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Typography Scale & Pairings */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Type className="w-4 h-4 text-[#FF2A85]" />
            <h3 className="font-display font-bold text-xl text-white">
              03. Typography System
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Display Face */}
            <div className="p-8 rounded-2xl bg-[#121217] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase text-[#FF2A85]">Display Typeface</span>
                <span className="text-xs font-mono text-[#8E8EA0]">Geometric Sans</span>
              </div>
              <h4 className="font-display font-black text-3xl sm:text-4xl text-white mb-2">
                Outfit
              </h4>
              <p className="text-xs text-[#A1A1AA] mb-6">
                Used for primary hero statements, section headlines, wordmarks, and editorial callouts.
              </p>
              <div className="space-y-2 pt-4 border-t border-white/10 text-sm">
                <div className="font-display font-black text-white text-xl">Black 900 — Bold Statement</div>
                <div className="font-display font-extrabold text-white text-lg">ExtraBold 800 — Section Titles</div>
                <div className="font-display font-bold text-white text-base">Bold 700 — Card Headlines</div>
              </div>
            </div>

            {/* Body Prose Face */}
            <div className="p-8 rounded-2xl bg-[#121217] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase text-[#7928CA]">Body & UI Typeface</span>
                <span className="text-xs font-mono text-[#8E8EA0]">Neo-Grotesque Sans</span>
              </div>
              <h4 className="font-sans font-bold text-3xl sm:text-4xl text-white mb-2">
                Plus Jakarta Sans
              </h4>
              <p className="text-xs text-[#A1A1AA] mb-6">
                Selected for high legibility on mobile screens, editorial narrative, form fields, and captions.
              </p>
              <div className="space-y-2 pt-4 border-t border-white/10 text-sm">
                <div className="font-sans font-semibold text-white">SemiBold 600 — Button Labels & Nav</div>
                <div className="font-sans font-medium text-[#A1A1AA]">Medium 500 — Form Controls</div>
                <div className="font-sans font-normal text-[#8E8EA0]">Regular 400 — Descriptive Prose & Legal</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Social Sharing Card & Favicon Verification */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-4 h-4 text-[#FF2A85]" />
            <h3 className="font-display font-bold text-xl text-white">
              04. OpenGraph Social Share Card & Web Meta
            </h3>
          </div>

          <div className="rounded-2xl bg-[#121217] border border-white/[0.08] p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-7/12 rounded-xl overflow-hidden aspect-video border border-white/10 relative shadow-2xl">
              <img
                src="/images/onlytok_social_share_card_1793722066290.jpg"
                alt="ONLYTOK Official OpenGraph Social Share Card"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090C] via-transparent to-transparent flex items-end p-6">
                <div>
                  <OnlyTokLogo variant="full" size="md" />
                  <p className="text-xs text-[#A1A1AA] mt-2">
                    Official 1200x675 Social Share Card for TikTok, Twitter/X, and OpenGraph syndication.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-5/12 space-y-4">
              <div>
                <h4 className="font-display font-bold text-lg text-white mb-1">
                  Social Sharing Readiness
                </h4>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Configured with full OpenGraph (`og:image`, `og:title`) and Twitter summary_large_image cards.
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono text-[#8E8EA0] bg-[#181822] p-4 rounded-xl border border-white/5">
                <div>Dimensions: 1200 × 675 px (16:9)</div>
                <div>Format: High-Res Progressive JPEG</div>
                <div>Vector Favicon: SVG 64x64 Interlocking OT</div>
                <div className="text-emerald-400">Status: Verified & Live in DOM</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
