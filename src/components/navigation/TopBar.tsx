/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OnlyTokLogo } from '../brand/OnlyTokLogo';
import { ExternalLink, Sparkles, Menu, ShieldCheck } from 'lucide-react';
import { trackTikTokOutboundClick } from '../../utils/analytics';

export type NavTab =
  | 'home'
  | 'discover'
  | 'creators'
  | 'submit'
  | 'about'
  | 'admin'
  | 'legal'
  | 'removal'
  | 'contact';

interface TopBarProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onOpenMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onNavigate,
  onOpenMobileMenu,
}) => {
  const navLinks: Array<{ id: NavTab; label: string }> = [
    { id: 'home', label: 'Home' },
    { id: 'discover', label: 'Discover' },
    { id: 'creators', label: 'Creators' },
    { id: 'submit', label: 'Submit Content' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#09090C]/90 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-white hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 text-left cursor-pointer"
          aria-label="ONLYTOK Home"
        >
          <OnlyTokLogo variant="full" size="md" />
        </button>

        {/* Zone 2: 5 Main Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A1A1AA]" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
                  isActive
                    ? 'text-white font-bold border-b-2 border-[#FF2A85]'
                    : 'hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Mobile Hamburger */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Legal & Safety Button */}
          <button
            onClick={() => onNavigate('legal')}
            className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              activeTab === 'legal' || activeTab === 'removal'
                ? 'bg-[#FF2A85]/20 text-[#FF2A85] border-[#FF2A85]/40'
                : 'bg-[#181822] text-[#A1A1AA] hover:text-white border-white/10'
            }`}
            title="Legal, Privacy, Content Safety & UK Compliance"
          >
            <span>Legal & Safety</span>
          </button>

          {/* Admin Moderation Button */}
          <button
            onClick={() => onNavigate('admin')}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              activeTab === 'admin'
                ? 'bg-[#FF2A85]/20 text-[#FF2A85] border-[#FF2A85]/40'
                : 'bg-[#181822] text-[#A1A1AA] hover:text-white border-white/10'
            }`}
            title="Content Governance & Moderation Desk"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF2A85]" />
            <span>Moderation</span>
          </button>

          {/* TikTok Follow Link */}
          <a
            href="https://www.tiktok.com/@onlytokgirls"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackTikTokOutboundClick('topbar_header')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white/90 bg-[#181822] hover:bg-[#222230] border border-white/10 rounded-lg transition-colors whitespace-nowrap"
            aria-label="Follow @onlytokgirls on TikTok"
          >
            <span>Follow</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#FF2A85]" />
          </a>

          {/* Primary CTA */}
          <button
            onClick={() => onNavigate('submit')}
            className="hidden sm:flex px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#FF2A85] to-[#D90368] hover:from-[#ff3d93] hover:to-[#eb0c75] rounded-lg shadow-md shadow-[#FF2A85]/20 hover:shadow-[#FF2A85]/40 transition-all active:scale-[0.98] whitespace-nowrap shrink-0 items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Submit (18+)</span>
          </button>

          {/* Mobile Menu Trigger */}
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

      </div>
    </header>
  );
};
