import React from 'react';
import { OnlyTokLogo } from '../brand/OnlyTokLogo';
import { ExternalLink, ShieldCheck, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'home' | 'discover' | 'creators' | 'submit' | 'about') => void;
  onOpenCompliance: (tab?: 'age' | 'rights' | 'privacy' | 'takedown') => void;
  onOpenBrandModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenCompliance,
  onOpenBrandModal,
}) => {
  return (
    <footer className="bg-[#08080A] border-t border-white/[0.08] pt-16 pb-24 md:pb-16 text-xs text-[#8E8EA0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/[0.08]">
          
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <button
              onClick={() => onNavigate('home')}
              className="text-left mb-4 cursor-pointer"
              aria-label="ONLYTOK Home"
            >
              <OnlyTokLogo variant="full" size="md" />
            </button>
            <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-sm mb-5">
              The premier dark-entertainment and creator-discovery brand connecting viral culture with authentic TikTok talent (@onlytokgirls).
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181822] border border-white/5 text-[11px] font-mono text-[#FF2A85]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF2A85]" />
              <span>18+ VERIFIED ADULT TALENT ONLY</span>
            </div>
          </div>

          {/* Column 1: Platform & Channel */}
          <div>
            <div className="font-display font-bold text-white text-xs uppercase tracking-wider mb-4">
              Explore & Watch
            </div>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('discover')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Discover Releases
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('creators')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Creator Directory
                </button>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@onlytokgirls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>TikTok (@onlytokgirls)</span>
                  <ExternalLink className="w-3 h-3 text-[#FF2A85]" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Creator & Media */}
          <div>
            <div className="font-display font-bold text-white text-xs uppercase tracking-wider mb-4">
              Creators & Inquiries
            </div>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onNavigate('submit')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Submit Content (18+)
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenBrandModal}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Brand Collaborations
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  About the Brand
                </button>
              </li>
              <li>
                <a
                  href="mailto:contact@onlytok.com"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  <span>contact@onlytok.com</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Standards */}
          <div>
            <div className="font-display font-bold text-white text-xs uppercase tracking-wider mb-4">
              Safety & Governance
            </div>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onOpenCompliance('age')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Strict 18+ Age Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenCompliance('rights')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Content Rights & Release
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenCompliance('privacy')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Privacy Guidelines
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenCompliance('takedown')}
                  className="text-rose-400/90 hover:text-rose-300 transition-colors text-left cursor-pointer"
                >
                  Takedown Request Desk
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            © {new Date().getFullYear()} ONLYTOK Entertainment. All rights reserved. Official hub for @onlytokgirls.
          </div>
          <div className="flex items-center gap-4">
            <span>Independent Platform</span>
            <span aria-hidden="true">·</span>
            <span>Zero Unverified Media</span>
            <span aria-hidden="true">·</span>
            <span>Non-affiliated with ByteDance</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
