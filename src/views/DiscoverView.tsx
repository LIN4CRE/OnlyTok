import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  RefreshCw,
  Video,
} from 'lucide-react';
import { VideoCard } from '../components/video/VideoCard';
import { EmptyState } from '../components/common/EmptyState';
import {
  getAuthorizedVideos,
  getAuthorizedCreators,
  CATEGORIES,
  VideoItem,
} from '../data/contentRegistry';

interface DiscoverViewProps {
  onPlayVideo: (video: VideoItem) => void;
  onOpenCreator: (creatorId: string) => void;
  onNavigateSubmit: () => void;
  initialCategory?: string;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  onPlayVideo,
  onOpenCreator,
  onNavigateSubmit,
  initialCategory = 'all',
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'featured'>('latest');

  const creators = getAuthorizedCreators();

  const filteredVideos = useMemo(() => {
    return getAuthorizedVideos({
      category: selectedCategory,
      creatorId: selectedCreatorId === 'all' ? undefined : selectedCreatorId,
      search: searchQuery,
      sort: sortBy,
    });
  }, [selectedCategory, selectedCreatorId, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCreatorId('all');
    setSortBy('latest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      
      {/* Header */}
      <div className="mb-10">
        <div className="text-xs font-bold uppercase tracking-widest text-[#FF2A85] mb-2 font-mono">
          Curated Video Feed
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
          Discover Authorised Releases.
        </h1>
        <p className="text-sm sm:text-base text-[#A1A1AA] mt-2 max-w-2xl">
          Explore genuine, high-production vertical media from verified creators, streaming on the official @onlytokgirls network.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-4 mb-10">
        
        {/* Row 1: Search & Sorting */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8EA0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, creator name, handle (@...), or sound..."
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

          {/* Creator Filter Dropdown */}
          <div className="sm:w-60">
            <select
              value={selectedCreatorId}
              onChange={(e) => setSelectedCreatorId(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl bg-[#121217] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF2A85] transition-colors cursor-pointer"
              aria-label="Filter by creator"
            >
              <option value="all">All Verified Creators</option>
              {creators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName} ({c.username})
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="sm:w-44">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'latest' | 'featured')}
              className="w-full px-3.5 py-3 rounded-xl bg-[#121217] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF2A85] transition-colors cursor-pointer"
              aria-label="Sort videos"
            >
              <option value="latest">Latest Releases</option>
              <option value="featured">Featured First</option>
            </select>
          </div>

        </div>

        {/* Row 2: Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                role="tab"
                aria-selected={isSelected}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#FF2A85] to-[#D90368] text-white shadow-md shadow-[#FF2A85]/20'
                    : 'bg-[#121217] text-[#8E8EA0] hover:text-white hover:bg-[#181822] border border-white/5'
                }`}
              >
                {cat.label} {cat.id !== 'all' && `(${cat.count})`}
              </button>
            );
          })}
        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6 text-xs text-[#8E8EA0] font-mono border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-[#FF2A85]" />
          <span>
            {filteredVideos.length === 1
              ? 'Showing 1 verified release'
              : `Showing ${filteredVideos.length} verified releases`}
          </span>
        </div>

        {(searchQuery || selectedCategory !== 'all' || selectedCreatorId !== 'all') && (
          <button
            onClick={handleResetFilters}
            className="text-xs text-[#FF2A85] hover:text-white flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Videos Grid or Compliant Empty State */}
      {filteredVideos.length === 0 ? (
        <EmptyState
          title="New creators are coming soon."
          description={
            searchQuery
              ? `No authorized releases matched "${searchQuery}". We only publish verified creator content with signed releases.`
              : 'New creators are coming soon. Submissions for this category are actively in editorial review and will be scheduled shortly.'
          }
          onReset={handleResetFilters}
          actionLabel="Submit Content (18+)"
          onAction={onNavigateSubmit}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPlay={onPlayVideo}
              onOpenCreator={onOpenCreator}
            />
          ))}
        </div>
      )}

    </div>
  );
};
