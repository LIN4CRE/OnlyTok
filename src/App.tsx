/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopBar, NavTab } from './components/navigation/TopBar';
import { MobileTabBar } from './components/navigation/MobileTabBar';
import { MobileMenu } from './components/navigation/MobileMenu';
import { Footer } from './components/footer/Footer';

// Views
import { HomeView } from './views/HomeView';
import { DiscoverView } from './views/DiscoverView';
import { CreatorsView } from './views/CreatorsView';
import { SubmitView } from './views/SubmitView';
import { AboutView } from './views/AboutView';
import { AdminModerationView } from './views/AdminModerationView';
import { LegalView, LegalTab } from './views/LegalView';
import { RemovalRequestView } from './views/RemovalRequestView';
import { ContactView } from './views/ContactView';

// Modals & Legal Overlays
import { VideoPlayerModal } from './components/video/VideoPlayerModal';
import { CreatorProfileModal } from './components/creators/CreatorProfileModal';
import { BrandInquiryModal } from './components/partners/BrandInquiryModal';
import { ComplianceModal } from './components/legal/ComplianceModal';
import { CookieConsentBanner } from './components/legal/CookieConsentBanner';
import { ReportContentModal } from './components/legal/ReportContentModal';

// Firebase Connection Tester
import { testFirestoreConnection } from './lib/firebase';

// Registry
import {
  VideoItem,
  Creator,
  getVideoById,
  getCreatorById,
} from './data/contentRegistry';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [legalSubTab, setLegalSubTab] = useState<LegalTab>('privacy');
  
  // Modals state
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [activeCreator, setActiveCreator] = useState<Creator | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportTargetVideo, setReportTargetVideo] = useState<{
    id: string;
    title: string;
    creatorName?: string;
    tiktokHandle?: string;
  } | null>(null);
  const [complianceModal, setComplianceModal] = useState<{
    isOpen: boolean;
    tab?: 'age' | 'rights' | 'privacy' | 'takedown';
  }>({ isOpen: false });

  // Boot connection check to Firestore as required by firebase-integration-rpc
  useEffect(() => {
    testFirestoreConnection().catch(() => {});
  }, []);

  // Handle URL params for direct video, creator, or tab links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('video');
    const creatorId = params.get('creator');
    const tabParam = params.get('tab') as NavTab;
    const subTabParam = params.get('subtab') as LegalTab;

    if (subTabParam && ['privacy', 'terms', 'cookies', 'dmca', 'submission-agreement', 'guidelines'].includes(subTabParam)) {
      setLegalSubTab(subTabParam);
    }

    if (tabParam && ['home', 'discover', 'creators', 'submit', 'about', 'admin', 'legal', 'removal', 'contact'].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    if (videoId) {
      const v = getVideoById(videoId);
      if (v) setActiveVideo(v);
    } else if (creatorId) {
      const c = getCreatorById(creatorId);
      if (c) setActiveCreator(c);
    }
  }, []);

  const handleNavigate = (tab: NavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateLegal = (subTab: LegalTab) => {
    setLegalSubTab(subTab);
    setActiveTab('legal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReportModal = (video?: VideoItem | null) => {
    if (video) {
      setReportTargetVideo({
        id: video.id,
        title: video.title,
        creatorName: video.creatorName,
        tiktokHandle: video.creatorHandle,
      });
    } else {
      setReportTargetVideo(null);
    }
    setIsReportModalOpen(true);
  };

  const handleOpenCreator = (creatorId: string) => {
    const creator = getCreatorById(creatorId);
    if (creator) {
      setActiveCreator(creator);
    }
  };

  const openCompliance = (tab: 'age' | 'rights' | 'privacy' | 'takedown' = 'age') => {
    setComplianceModal({ isOpen: true, tab });
  };

  return (
    <div className="min-h-screen bg-[#09090C] text-[#F4F4F5] selection:bg-[#FF2A85] selection:text-white font-sans flex flex-col justify-between">
      
      {/* Desktop & Tablet Navigation */}
      <TopBar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Main View Outlet */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onPlayVideo={(video) => setActiveVideo(video)}
            onOpenCreator={handleOpenCreator}
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              setActiveTab('discover');
            }}
          />
        )}

        {activeTab === 'discover' && (
          <DiscoverView
            onPlayVideo={(video) => setActiveVideo(video)}
            onOpenCreator={handleOpenCreator}
            onNavigateSubmit={() => handleNavigate('submit')}
            initialCategory={selectedCategory}
          />
        )}

        {activeTab === 'creators' && (
          <CreatorsView
            onOpenCreator={handleOpenCreator}
            onNavigateSubmit={() => handleNavigate('submit')}
          />
        )}

        {activeTab === 'submit' && <SubmitView />}

        {activeTab === 'about' && (
          <AboutView
            onOpenBrandModal={() => setIsBrandModalOpen(true)}
            onNavigateSubmit={() => handleNavigate('submit')}
            onOpenCompliance={openCompliance}
          />
        )}

        {activeTab === 'legal' && (
          <LegalView
            initialSubTab={legalSubTab}
            onNavigateRemoval={() => handleNavigate('removal')}
            onNavigateContact={() => handleNavigate('contact')}
          />
        )}

        {activeTab === 'removal' && <RemovalRequestView />}

        {activeTab === 'contact' && <ContactView />}

        {activeTab === 'admin' && <AdminModerationView />}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onNavigateLegal={handleNavigateLegal}
        onOpenCompliance={openCompliance}
        onOpenBrandModal={() => setIsBrandModalOpen(true)}
      />

      {/* Mobile Ergonomic Bottom Tab Bar (< 768px) */}
      <MobileTabBar
        activeTab={activeTab}
        onNavigate={handleNavigate}
      />

      {/* Mobile Slide-Out Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onOpenCompliance={openCompliance}
      />

      {/* Dedicated Video Player Modal */}
      <VideoPlayerModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
        onSelectVideo={(video) => setActiveVideo(video)}
        onOpenCreator={(creatorId) => {
          setActiveVideo(null);
          handleOpenCreator(creatorId);
        }}
        onReportVideo={handleOpenReportModal}
      />

      {/* Dedicated Creator Profile Modal */}
      <CreatorProfileModal
        creator={activeCreator}
        onClose={() => setActiveCreator(null)}
        onPlayVideo={(video) => {
          setActiveCreator(null);
          setActiveVideo(video);
        }}
        onOpenSubmit={() => {
          setActiveCreator(null);
          handleNavigate('submit');
        }}
      />

      {/* Brand Partnerships Modal */}
      <BrandInquiryModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
      />

      {/* Compliance & Safety Dialog */}
      <ComplianceModal
        isOpen={complianceModal.isOpen}
        initialTab={complianceModal.tab}
        onClose={() => setComplianceModal({ isOpen: false })}
      />

      {/* UK GDPR / PECR Cookie Consent Banner */}
      <CookieConsentBanner />

      {/* Priority Content Report Modal (Minors, NCII, Copyright, Rights) */}
      <ReportContentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetVideo={reportTargetVideo}
      />
    </div>
  );
}
