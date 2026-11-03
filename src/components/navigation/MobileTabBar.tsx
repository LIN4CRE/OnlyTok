import React from 'react';
import { Home, Compass, Users, Sparkles, Info } from 'lucide-react';
import { NavTab } from './TopBar';

interface MobileTabBarProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  onNavigate,
}) => {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'discover' as const, label: 'Discover', icon: Compass },
    { id: 'submit' as const, label: 'Submit', icon: Sparkles, isHighlight: true },
    { id: 'creators' as const, label: 'Creators', icon: Users },
    { id: 'about' as const, label: 'About', icon: Info },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090C]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-1 safe-area-pb">
      <nav className="grid grid-cols-5 items-center h-14" aria-label="Mobile Bottom Navigation">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isHighlight) {
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] group"
                aria-label="Submit Content 18+"
              >
                <div className="w-10 h-7 rounded-full bg-gradient-to-r from-[#FF2A85] to-[#D90368] flex items-center justify-center text-white shadow-sm shadow-[#FF2A85]/30">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-[#FF2A85] tracking-tight mt-0.5">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
                isActive ? 'text-[#FF2A85]' : 'text-[#8E8EA0] hover:text-white'
              }`}
              aria-label={tab.label}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
