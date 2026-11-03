import React, { useState, useMemo } from 'react';
import { Search, Users, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { CreatorCard } from '../components/creators/CreatorCard';
import { EmptyState } from '../components/common/EmptyState';
import { getAuthorizedCreators } from '../data/contentRegistry';

interface CreatorsViewProps {
  onOpenCreator: (creatorId: string) => void;
  onNavigateSubmit: () => void;
}

export const CreatorsView: React.FC<CreatorsViewProps> = ({
  onOpenCreator,
  onNavigateSubmit,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredCreators = useMemo(() => {
    return getAuthorizedCreators({
      search: searchQuery,
      category: selectedFilter === 'all' ? undefined : selectedFilter,
    });
  }, [searchQuery, selectedFilter]);

  const categories = [
    'all',
    'Dance & Choreography',
    'Fashion & Style',
    'Music & Sounds',
    'Performance',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      
      {/* Header */}
      <div className="mb-10">
        <div className="text-xs font-bold uppercase tracking-widest text-[#FF2A85] mb-2 font-mono">
          Creator Roster
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
          Verified Creator Directory.
        </h1>
        <p className="text-sm sm:text-base text-[#A1A1AA] mt-2 max-w-2xl">
          Browse authentic talent featured on @onlytokgirls. Every individual is 18+ verified with confirmed intellectual property release.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
        
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8EA0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified creators by name, handle, or style..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#121217] border border-white/10 text-white placeholder-[#8E8EA0] text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8E8EA0] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                selectedFilter === cat
                  ? 'bg-gradient-to-r from-[#FF2A85] to-[#D90368] text-white shadow-sm'
                  : 'bg-[#121217] text-[#8E8EA0] hover:text-white border border-white/5'
              }`}
            >
              {cat === 'all' ? 'All Specialities' : cat}
            </button>
          ))}
        </div>

      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between mb-6 text-xs text-[#8E8EA0] font-mono border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#FF2A85]" />
          <span>
            {filteredCreators.length === 1
              ? '1 verified creator'
              : `${filteredCreators.length} verified creators`}
          </span>
        </div>

        {(searchQuery || selectedFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedFilter('all');
            }}
            className="text-xs text-[#FF2A85] hover:text-white flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Directory Grid or Compliant Empty State */}
      {filteredCreators.length === 0 ? (
        <EmptyState
          title="New creators are coming soon."
          description={
            searchQuery
              ? `No verified creators matched "${searchQuery}". Never filling empty sections with invented profiles.`
              : 'New creators are coming soon. Submissions are actively being vetted by our editorial and compliance team.'
          }
          onReset={() => {
            setSearchQuery('');
            setSelectedFilter('all');
          }}
          actionLabel="Apply to Join Directory (18+)"
          onAction={onNavigateSubmit}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              onOpenProfile={onOpenCreator}
            />
          ))}
        </div>
      )}

      {/* Bottom Covenant Notice */}
      <div className="mt-16 p-6 rounded-2xl bg-[#121217] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#FF2A85] shrink-0" />
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            ONLYTOK Directory Policy: We never manufacture follower statistics, fake user bios, or unverified creator entries. All profiles represent genuine individuals with explicit written consent.
          </p>
        </div>
        <button
          onClick={onNavigateSubmit}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-[#FF2A85] transition-colors whitespace-nowrap shrink-0"
        >
          Submit Application
        </button>
      </div>

    </div>
  );
};
