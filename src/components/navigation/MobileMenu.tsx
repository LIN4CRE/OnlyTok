/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ExternalLink, Sparkles, Home, Compass, Users, FilePlus, Info, ShieldCheck } from 'lucide-react';
import { OnlyTokLogo } from '../brand/OnlyTokLogo';
import { NavTab } from './TopBar';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onOpenCompliance: (tab?: 'age' | 'rights' | 'privacy' | 'takedown') => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  activeTab,
  onNavigate,
  onOpenCompliance,
}) => {
  if (!isOpen) return null;

  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'creators', label: 'Creators', icon: Users },
    { id: 'submit', label: 'Submit Content', icon: FilePlus },
    { id: 'about', label: 'About', icon: Info },
    { id: 'admin', label: 'Moderation Queue', icon: ShieldCheck },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
    >
      <div className="w-full max-w-xs h-full bg-[#0F0F14] border-l border-white/10 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-6">
            <OnlyTokLogo variant="wordmark" size="md" />
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#8E8EA0] hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2 mb-8" aria-label="Mobile Menu Links">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF2A85] to-[#D90368] text-white shadow-md shadow-[#FF2A85]/20'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8E8EA0]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Direct TikTok Channel Action */}
          <a
            href="https://www.tiktok.com/@onlytokgirls"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 rounded-2xl bg-[#181822] border border-white/10 hover:border-[#FF2A85]/40 transition-all flex items-center justify-between text-xs text-white group mb-6"
          >
            <div>
              <div className="font-bold flex items-center gap-1.5">
                <span>Follow on TikTok</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#FF2A85]" />
              </div>
              <div className="text-[11px] text-[#8E8EA0] font-mono mt-0.5">@onlytokgirls</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#FF2A85]/20 flex items-center justify-center text-[#FF2A85] group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </a>
        </div>

        {/* Footer info & 18+ policy */}
        <div className="pt-6 border-t border-white/[0.08] text-xs text-[#8E8EA0] space-y-3">
          <div className="flex items-center gap-2 text-[11px] text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>18+ Verified Talent Only</span>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
            <button
              onClick={() => {
                onClose();
                onOpenCompliance('age');
              }}
              className="hover:text-white underline"
            >
              Age Policy
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenCompliance('rights');
              }}
              className="hover:text-white underline"
            >
              Content Rights
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenCompliance('takedown');
              }}
              className="text-rose-400 hover:text-rose-300 underline"
            >
              Takedowns
            </button>
          </div>

          <div className="text-[10px] text-[#8E8EA0]/80">
            © {new Date().getFullYear()} ONLYTOK. All rights reserved.
          </div>
        </div>

      </div>
    </div>
  );
};
