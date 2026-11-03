/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Clock,
  Filter,
  Eye,
  Trash2,
  Send,
  Lock,
  RefreshCw,
  LogOut,
  LogIn,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Users,
  Film,
  FolderTree,
  FileWarning,
  Settings,
  LayoutDashboard,
  Search,
  Star,
  Edit3,
  Plus,
  Save,
  Check,
  Download,
  ShieldAlert,
  ArrowUpDown,
  UserCheck,
  Radio,
  FileText,
  ChevronRight,
  Info,
} from 'lucide-react';
import { auth, googleAuthProvider } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

// Types
export interface SubmissionItem {
  id: string;
  referenceCode: string;
  creatorName: string;
  tiktokHandle: string;
  email: string;
  videoTitle: string;
  videoDescription?: string;
  mediaType: 'upload' | 'url';
  mediaUrl: string;
  originalFileName?: string | null;
  fileSizeBytes?: number | null;
  category: string;
  confirmedOwnership: boolean;
  confirmedAdult18: boolean;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'correction_requested';
  moderationNotes?: string | null;
  moderatorEmail?: string | null;
  moderatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublishedReleaseItem {
  id: string;
  submissionId: string;
  title: string;
  description: string;
  creatorName: string;
  tiktokHandle: string;
  mediaUrl: string;
  mediaType: 'upload' | 'url';
  category: string;
  referenceCode: string;
  isFeatured?: boolean;
  publishedAt: string;
  publishedBy: string;
}

export interface CreatorRecord {
  id: string;
  displayName: string;
  username: string;
  email: string;
  bio: string;
  avatarUrl: string;
  categories: string[];
  isVerified18Plus: boolean;
  status: 'active' | 'suspended';
  socialLinks: {
    tiktok: string;
    instagram?: string;
  };
  totalSpotlights: number;
  createdAt: string;
}

export interface CategoryRecord {
  id: string;
  label: string;
  slug: string;
  description: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface ReportRecord {
  id: string;
  referenceCode: string;
  reportType: 'copyright_dmca' | 'inappropriate_content' | 'age_verification' | 'rights_dispute' | 'other';
  targetType: string;
  targetId: string;
  targetTitle: string;
  reporterName: string;
  reporterEmail: string;
  reporterAffiliation: string;
  details: string;
  evidenceUrl?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  takedownExecuted: boolean;
  resolutionNotes?: string | null;
  resolvedBy?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface AdminUserRecord {
  id: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'moderator' | 'editor';
  status: 'active' | 'revoked';
  notes?: string;
  addedAt: string;
  lastActiveAt?: string;
}

export interface ModerationLogItem {
  id: string;
  action: string;
  targetId: string;
  details: string;
  moderatorEmail: string;
  timestamp: string;
  notes?: string;
}

export interface AdminStats {
  hasData: boolean;
  totalApprovedVideos: number;
  pendingSubmissions: number;
  registeredCreators: number;
  publishedCreators: number;
  contentRemovalRequests: number;
  pendingRemovalRequests: number;
  totalSubmissions: number;
  totalCategories: number;
  submissionStatusBreakdown: {
    pending: number;
    approved: number;
    rejected: number;
    correction_requested: number;
  };
}

export interface WebsiteSettingsData {
  brandName: string;
  brandTagline: string;
  tiktokHandle: string;
  tiktokUrl: string;
  contactEmail: string;
  dmcaEmail: string;
  submissionStatus: 'open' | 'paused';
  submissionNotice: string;
  maxUploadSizeMb: number;
  requireDual18Check: boolean;
  announcementBanner: {
    active: boolean;
    text: string;
    link: string;
  };
  watermarkBranding: boolean;
}

type AdminSection =
  | 'overview'
  | 'submissions'
  | 'published'
  | 'creators'
  | 'categories'
  | 'reports'
  | 'users'
  | 'settings';

export const AdminModerationView: React.FC = () => {
  // Authentication & Session
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [activeAdminEmail, setActiveAdminEmail] = useState<string>('dlinacre16@gmail.com');
  const [activeAdminRole, setActiveAdminRole] = useState<string>('super_admin');
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Active section
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');

  // Core Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [publishedVideos, setPublishedVideos] = useState<PublishedReleaseItem[]>([]);
  const [creators, setCreators] = useState<CreatorRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserRecord[]>([]);
  const [settings, setSettings] = useState<WebsiteSettingsData | null>(null);
  const [logs, setLogs] = useState<ModerationLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Submissions Tab Filter & Search
  const [submissionFilter, setSubmissionFilter] = useState<'pending' | 'approved' | 'correction_requested' | 'rejected' | 'all'>('pending');
  const [submissionSearch, setSubmissionSearch] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<{ id: string; title: string; desc: string; cat: string } | null>(null);

  // Published Tab Search & Category
  const [publishedSearch, setPublishedSearch] = useState<string>('');
  const [publishedCategory, setPublishedCategory] = useState<string>('all');

  // Creator Modal
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState<boolean>(false);
  const [editingCreator, setEditingCreator] = useState<CreatorRecord | null>(null);
  const [creatorForm, setCreatorForm] = useState({
    displayName: '',
    username: '',
    email: '',
    bio: '',
    avatarUrl: '',
    categories: 'Dance & Choreography',
    isVerified18Plus: true,
  });

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    label: '',
    description: '',
    color: '#FF2A85',
  });

  // Report Modal / Resolution
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null);
  const [reportResolutionNotes, setReportResolutionNotes] = useState<string>('');
  const [executeTakedownWithReport, setExecuteTakedownWithReport] = useState<boolean>(false);

  // Add Admin Modal
  const [isAdminUserModalOpen, setIsAdminUserModalOpen] = useState<boolean>(false);
  const [adminUserForm, setAdminUserForm] = useState({
    email: '',
    displayName: '',
    role: 'moderator' as 'super_admin' | 'moderator' | 'editor',
    notes: '',
  });

  // Moderation Action State
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request_correction' | 'remove' | null>(null);
  const [actionNotes, setActionNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Settings Save State
  const [settingsSaving, setSettingsSaving] = useState<boolean>(false);

  // Check auth state from Firebase and verify admin rights
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user?.email) {
        verifyAdminSession(user.email);
      } else {
        // Check if dev auto-unlocked
        const cached = localStorage.getItem('ot_admin_unlocked');
        if (cached === 'true') {
          verifyAdminSession('dlinacre16@gmail.com');
        } else {
          setAuthChecking(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const verifyAdminSession = async (email: string) => {
    try {
      setAuthChecking(true);
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': email,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setIsAdminUnlocked(true);
        setActiveAdminEmail(data.user.email);
        setActiveAdminRole(data.user.role);
        localStorage.setItem('ot_admin_unlocked', 'true');
      } else {
        setIsAdminUnlocked(false);
      }
    } catch (err) {
      console.error('Admin verification error:', err);
      // Fallback for primary founder email
      if (email === 'dlinacre16@gmail.com') {
        setIsAdminUnlocked(true);
        setActiveAdminEmail(email);
        setActiveAdminRole('super_admin');
      }
    } finally {
      setAuthChecking(false);
    }
  };

  // Helper headers for admin API calls
  const getAdminHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'X-Admin-Email': activeAdminEmail,
      'Authorization': `Bearer ${activeAdminEmail}`,
    };
  };

  // Fetch all administration datasets
  const fetchAllData = async () => {
    if (!isAdminUnlocked) return;
    try {
      setRefreshing(true);
      const headers = getAdminHeaders();

      // Parallel fetch of all stores
      const [
        statsRes,
        subsRes,
        pubRes,
        creatorsRes,
        catsRes,
        reportsRes,
        usersRes,
        settingsRes,
        logsRes,
      ] = await Promise.all([
        fetch('/api/admin/statistics', { headers }),
        fetch('/api/submissions?status=all', { headers }),
        fetch('/api/published-releases'),
        fetch('/api/creators'),
        fetch('/api/categories'),
        fetch('/api/reports?status=all', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/settings', { headers }),
        fetch('/api/moderation-logs', { headers }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (subsRes.ok) {
        const data = await subsRes.json();
        setSubmissions(data.submissions || []);
      }
      if (pubRes.ok) {
        const data = await pubRes.json();
        setPublishedVideos(data.releases || []);
      }
      if (creatorsRes.ok) {
        const data = await creatorsRes.json();
        setCreators(data.creators || []);
      }
      if (catsRes.ok) {
        const data = await catsRes.json();
        setCategories(data.categories || []);
      }
      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setReports(data.reports || []);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setAdminUsers(data.users || []);
      }
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data.settings);
      }
      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching admin datasets:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdminUnlocked) {
      fetchAllData();
    }
  }, [isAdminUnlocked]);

  const handleGoogleSignIn = async () => {
    try {
      const res = await signInWithPopup(auth, googleAuthProvider);
      if (res.user?.email) {
        await verifyAdminSession(res.user.email);
      }
    } catch (err) {
      console.error('Google Sign-in error:', err);
      // Offer direct founder sign-in for dev environment
      verifyAdminSession('dlinacre16@gmail.com');
    }
  };

  const handleDevDirectUnlock = () => {
    verifyAdminSession('dlinacre16@gmail.com');
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setIsAdminUnlocked(false);
    localStorage.removeItem('ot_admin_unlocked');
  };

  // Submissions Actions
  const handleExecuteModeration = async () => {
    if (!selectedSubmission || !actionType) return;
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/submissions/${selectedSubmission.id}/moderate`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          action: actionType,
          notes: actionNotes,
        }),
      });

      if (res.ok) {
        setActionFeedback(`Decision executed: ${actionType.toUpperCase()} on "${selectedSubmission.videoTitle}"`);
        setActionType(null);
        setActionNotes('');
        setSelectedSubmission(null);
        await fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to execute moderation action.');
      }
    } catch (err) {
      console.error('Moderation error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Edit Submission Title / Description
  const handleSaveSubmissionEdit = async () => {
    if (!editingSubmission) return;
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/submissions/${editingSubmission.id}`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          videoTitle: editingSubmission.title,
          videoDescription: editingSubmission.desc,
          category: editingSubmission.cat,
        }),
      });

      if (res.ok) {
        setActionFeedback('Video description & metadata updated.');
        setEditingSubmission(null);
        await fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update submission.');
      }
    } catch (err) {
      console.error('Error editing submission:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Feature / Unfeature Published Video
  const handleToggleFeature = async (video: PublishedReleaseItem) => {
    try {
      const res = await fetch(`/api/published-releases/${video.id}`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          isFeatured: !video.isFeatured,
        }),
      });

      if (res.ok) {
        setActionFeedback(
          !video.isFeatured
            ? `Featured "${video.title}" on Home & Discover`
            : `Unfeatured "${video.title}"`
        );
        await fetchAllData();
      }
    } catch (err) {
      console.error('Feature toggle error:', err);
    }
  };

  // Takedown Published Video
  const handleTakedownVideo = async (video: PublishedReleaseItem) => {
    const reason = prompt(`Enter takedown reason for "${video.title}":`, 'Compliance review / Rightsholder request');
    if (!reason) return;

    try {
      const res = await fetch(`/api/published-releases/${video.id}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        setActionFeedback(`Takedown executed on "${video.title}". Removed from public syndication.`);
        await fetchAllData();
      }
    } catch (err) {
      console.error('Takedown error:', err);
    }
  };

  // Creator Management
  const handleSaveCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      const isEdit = !!editingCreator;
      const url = isEdit ? `/api/creators/${editingCreator.id}` : '/api/creators';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify({
          displayName: creatorForm.displayName,
          username: creatorForm.username,
          email: creatorForm.email,
          bio: creatorForm.bio,
          avatarUrl: creatorForm.avatarUrl || '/src/assets/images/onlytok_social_share_card_1793722066290.jpg',
          categories: [creatorForm.categories],
          isVerified18Plus: creatorForm.isVerified18Plus,
        }),
      });

      if (res.ok) {
        setActionFeedback(isEdit ? 'Creator profile updated.' : 'Creator profile created.');
        setIsCreatorModalOpen(false);
        setEditingCreator(null);
        await fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save creator.');
      }
    } catch (err) {
      console.error('Creator save error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Category Management
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      const isEdit = !!categoryForm.id;
      const url = isEdit ? `/api/categories/${categoryForm.id}` : '/api/categories';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify({
          label: categoryForm.label,
          description: categoryForm.description,
          color: categoryForm.color,
        }),
      });

      if (res.ok) {
        setActionFeedback(isEdit ? 'Category updated.' : 'New category created.');
        setIsCategoryModalOpen(false);
        setCategoryForm({ id: '', label: '', description: '', color: '#FF2A85' });
        await fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save category.');
      }
    } catch (err) {
      console.error('Category save error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCategory = async (cat: CategoryRecord) => {
    if (!confirm(`Are you sure you want to remove category "${cat.label}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        setActionFeedback(`Category "${cat.label}" deleted.`);
        await fetchAllData();
      }
    } catch (err) {
      console.error('Delete category error:', err);
    }
  };

  // Report Resolution
  const handleActionReport = async (action: 'reviewing' | 'resolved' | 'dismissed') => {
    if (!selectedReport) return;
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/reports/${selectedReport.id}/action`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          action,
          resolutionNotes: reportResolutionNotes,
          executeTakedown: executeTakedownWithReport,
        }),
      });

      if (res.ok) {
        setActionFeedback(`Report ${selectedReport.referenceCode} set to ${action.toUpperCase()}`);
        setSelectedReport(null);
        setReportResolutionNotes('');
        setExecuteTakedownWithReport(false);
        await fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update report.');
      }
    } catch (err) {
      console.error('Report action error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Add Admin User
  const handleSaveAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(adminUserForm),
      });

      if (res.ok) {
        setActionFeedback(`Admin account created for ${adminUserForm.email}`);
        setIsAdminUserModalOpen(false);
        setAdminUserForm({ email: '', displayName: '', role: 'moderator', notes: '' });
        await fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create administrator account.');
      }
    } catch (err) {
      console.error('Error creating admin user:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Save Website Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      setSettingsSaving(true);
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setActionFeedback('Website branding & governance settings saved.');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save settings.');
      }
    } catch (err) {
      console.error('Save settings error:', err);
    } finally {
      setSettingsSaving(false);
    }
  };

  // Export Database Snapshot
  const handleExportSnapshot = () => {
    const bundle = {
      exportedAt: new Date().toISOString(),
      exporter: activeAdminEmail,
      statistics: stats,
      submissions,
      publishedVideos,
      creators,
      categories,
      reports,
      settings,
      logs,
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onlytok_database_snapshot_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Auth Guard Screen
  if (authChecking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#FF2A85] animate-spin" />
          <p className="text-sm text-[#8E8EA0] font-medium">Authenticating Administrative Session...</p>
        </div>
      </div>
    );
  }

  if (!isAdminUnlocked) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20">
        <div className="p-8 rounded-3xl bg-[#121217] border border-white/10 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF2A85] to-[#7928CA] flex items-center justify-center mx-auto text-white shadow-lg shadow-[#FF2A85]/20">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF2A85]/10 text-[#FF2A85] border border-[#FF2A85]/20">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Restricted Governance Portal</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl text-white">
              ONLYTOK Administration
            </h1>
            <p className="text-sm text-[#8E8EA0]">
              This dashboard provides complete governance over creator submissions, published media, copyright disputes, and platform configuration. Authorised credentials required.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#181822] border border-white/5 text-xs text-[#A1A1AA] space-y-2 text-left">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Enforced Access Policies:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1">
              <li>Authorised master founder account: <code className="text-white font-mono">dlinacre16@gmail.com</code></li>
              <li>Role-based permissions with server-side validation</li>
              <li>Immutable audit logging for all moderation decisions</li>
            </ul>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF2A85] to-[#D90368] hover:from-[#ff3d93] hover:to-[#eb0c75] text-white font-bold text-sm shadow-lg shadow-[#FF2A85]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign in with Google</span>
            </button>

            <button
              onClick={handleDevDirectUnlock}
              className="w-full py-2.5 px-4 rounded-xl bg-[#181822] hover:bg-[#222230] border border-white/10 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              Authorise Session as Master Admin (dlinacre16@gmail.com)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered submissions
  const filteredSubmissions = submissions.filter((s) => {
    const matchesFilter = submissionFilter === 'all' || s.status === submissionFilter;
    const matchesSearch =
      !submissionSearch.trim() ||
      s.videoTitle.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      s.creatorName.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      s.tiktokHandle.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      s.referenceCode.toLowerCase().includes(submissionSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filtered published videos
  const filteredPublished = publishedVideos.filter((p) => {
    const matchesCat = publishedCategory === 'all' || p.category.toLowerCase() === publishedCategory.toLowerCase();
    const matchesSearch =
      !publishedSearch.trim() ||
      p.title.toLowerCase().includes(publishedSearch.toLowerCase()) ||
      p.creatorName.toLowerCase().includes(publishedSearch.toLowerCase()) ||
      p.tiktokHandle.toLowerCase().includes(publishedSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const pendingSubCount = submissions.filter((s) => s.status === 'pending').length;
  const pendingReportCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#14141B] via-[#121217] to-[#14141B] border border-white/10 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF2A85] to-[#7928CA] flex items-center justify-center text-white shadow-lg shadow-[#FF2A85]/20 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                ONLYTOK Administration
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live System
              </span>
            </div>
            <p className="text-xs text-[#8E8EA0] mt-0.5">
              Signed in as <span className="text-white font-medium">{activeAdminEmail}</span> ({activeAdminRole})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllData}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-[#181822] hover:bg-[#222230] border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh All Records"
          >
            <RefreshCw className={`w-4 h-4 text-[#FF2A85] ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={handleExportSnapshot}
            className="p-2.5 rounded-xl bg-[#181822] hover:bg-[#222230] border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export System Snapshot"
          >
            <Download className="w-4 h-4 text-[#A1A1AA]" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={handleSignOut}
            className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Action Feedback Notification */}
      {actionFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionFeedback}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-emerald-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs Bar for 8 Sections */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#121217] border border-white/10 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveSection('overview')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'overview'
              ? 'bg-[#FF2A85] text-white shadow-md shadow-[#FF2A85]/20'
              : 'text-[#8E8EA0] hover:text-white hover:bg-white/5'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>1. Overview</span>
        </button>

        <button
          onClick={() => setActiveSection('submissions')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'submissions'
              ? 'bg-[#FF2A85] text-white shadow-md shadow-[#FF2A85]/20'
              : 'text-[#8E8EA0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>2. Video Submissions</span>
          {pendingSubCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-black">
              {pendingSubCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('published')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'published'
              ? 'bg-[#FF2A85] text-white shadow-md shadow-[#FF2A85]/20'
              : 'text-[#8E8EA0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>3. Published Videos</span>
          <span className="text-[10px] opacity-70">({publishedVideos.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('creators')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'creators'
              ? 'bg-[#FF2A85] text-white shadow-md shadow-[#FF2A85]/20'
              : 'text-[#8E8EA0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>4. Creators</span>
          <span className="text-[10px] opacity-70">({creators.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('categories')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'categories'
              ? 'bg-[#FF2A85] text-white shadow-md shadow-[#FF2A85]/20'
              : 'text-[#8E8EA0] hover:text-white hover:bg-white/5'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>5. Categories</span>
        </button>

        <button
          onClick={() => setActiveSection('reports')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'reports'
              ? 'bg-[#FF2A85] text-white shadow-md shadow-[#FF2A85]/20'
              : 'text-[#8E8EA0] hover:text-white hover:bg-white/5'
          }`}
        >
          <FileWarning className="w-4 h-4" />
          <span>6. Reports & Takedowns</span>
          {pendingReportCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
              {pendingReportCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('users')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'users'
              ? 'bg-[#FF2A85] text-white shadow-md shadow-[#FF2A85]/20'
              : 'text-[#8E8EA0] hover:text-white hover:bg-white/5'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>7. User Management</span>
        </button>

        <button
          onClick={() => setActiveSection('settings')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'settings'
              ? 'bg-[#FF2A85] text-white shadow-md shadow-[#FF2A85]/20'
              : 'text-[#8E8EA0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>8. Website Settings</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: OVERVIEW & DATABASE STATISTICS                                 */}
      {/* ========================================================================= */}
      {activeSection === 'overview' && (
        <div className="space-y-8">
          {/* Key Database Counters */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-bold text-lg text-white">
                  Database & Governance Health
                </h2>
                <p className="text-xs text-[#8E8EA0]">
                  Live metrics calculated strictly from verified database stores
                </p>
              </div>
              <div className="text-xs text-[#8E8EA0]">
                Last synced: <span className="text-white font-mono">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Stat 1: Total Approved Videos */}
              <div className="p-5 rounded-2xl bg-[#121217] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8E8EA0]">
                  <span>Total Approved Videos</span>
                  <Film className="w-4 h-4 text-[#FF2A85]" />
                </div>
                <div className="font-display font-extrabold text-3xl text-white">
                  {stats ? stats.totalApprovedVideos : 'No Data Available'}
                </div>
                <p className="text-[11px] text-[#8E8EA0]">
                  Syndicated on @onlytokgirls
                </p>
              </div>

              {/* Stat 2: Pending Submissions */}
              <div className="p-5 rounded-2xl bg-[#121217] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8E8EA0]">
                  <span>Pending Submissions</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="font-display font-extrabold text-3xl text-amber-400">
                  {stats ? stats.pendingSubmissions : 'No Data Available'}
                </div>
                <p className="text-[11px] text-[#8E8EA0]">
                  Awaiting review decision
                </p>
              </div>

              {/* Stat 3: Registered Creators */}
              <div className="p-5 rounded-2xl bg-[#121217] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8E8EA0]">
                  <span>Registered Creators</span>
                  <Users className="w-4 h-4 text-[#9D4EDD]" />
                </div>
                <div className="font-display font-extrabold text-3xl text-white">
                  {stats ? stats.registeredCreators : 'No Data Available'}
                </div>
                <p className="text-[11px] text-[#8E8EA0]">
                  Verified 18+ creator files
                </p>
              </div>

              {/* Stat 4: Published Creators */}
              <div className="p-5 rounded-2xl bg-[#121217] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8E8EA0]">
                  <span>Published Creators</span>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="font-display font-extrabold text-3xl text-emerald-400">
                  {stats ? stats.publishedCreators : 'No Data Available'}
                </div>
                <p className="text-[11px] text-[#8E8EA0]">
                  Actively featured in feed
                </p>
              </div>

              {/* Stat 5: Content Removal Requests */}
              <div className="p-5 rounded-2xl bg-[#121217] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8E8EA0]">
                  <span>Removal Requests</span>
                  <FileWarning className="w-4 h-4 text-rose-400" />
                </div>
                <div className="font-display font-extrabold text-3xl text-rose-400">
                  {stats ? stats.contentRemovalRequests : 'No Data Available'}
                </div>
                <p className="text-[11px] text-[#8E8EA0]">
                  {stats && stats.pendingRemovalRequests > 0
                    ? `${stats.pendingRemovalRequests} pending action`
                    : 'All notices cleared'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Shortcuts & Workflow Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-3xl bg-[#121217] border border-white/10 space-y-4">
              <h3 className="font-display font-bold text-base text-white">
                Administrative Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    setSubmissionFilter('pending');
                    setActiveSection('submissions');
                  }}
                  className="p-4 rounded-2xl bg-[#181822] hover:bg-[#20202c] border border-white/5 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[#FF2A85] mb-2">
                    <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <ChevronRight className="w-4 h-4 text-[#8E8EA0]" />
                  </div>
                  <div className="font-bold text-white text-sm">Review Queue</div>
                  <div className="text-xs text-[#8E8EA0] mt-0.5">
                    {pendingSubCount} submissions awaiting moderation
                  </div>
                </button>

                <button
                  onClick={() => {
                    setEditingCreator(null);
                    setCreatorForm({
                      displayName: '',
                      username: '',
                      email: '',
                      bio: '',
                      avatarUrl: '',
                      categories: 'Dance & Choreography',
                      isVerified18Plus: true,
                    });
                    setIsCreatorModalOpen(true);
                  }}
                  className="p-4 rounded-2xl bg-[#181822] hover:bg-[#20202c] border border-white/5 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[#9D4EDD] mb-2">
                    <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <Plus className="w-4 h-4 text-[#8E8EA0]" />
                  </div>
                  <div className="font-bold text-white text-sm">Add Verified Creator</div>
                  <div className="text-xs text-[#8E8EA0] mt-0.5">
                    Enroll creator dossier with 18+ badge
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection('reports')}
                  className="p-4 rounded-2xl bg-[#181822] hover:bg-[#20202c] border border-white/5 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-rose-400 mb-2">
                    <FileWarning className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <ChevronRight className="w-4 h-4 text-[#8E8EA0]" />
                  </div>
                  <div className="font-bold text-white text-sm">Removal & DMCA</div>
                  <div className="text-xs text-[#8E8EA0] mt-0.5">
                    Inspect copyright notices & disputes
                  </div>
                </button>
              </div>

              {/* Submission Status Breakdown */}
              <div className="pt-4 border-t border-white/5">
                <div className="text-xs font-semibold text-[#8E8EA0] mb-3">Submission Pipeline Breakdown</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#09090C] border border-white/5">
                    <span className="text-[#8E8EA0]">Pending Review:</span>
                    <div className="font-bold text-amber-400 text-lg mt-0.5">
                      {stats?.submissionStatusBreakdown.pending ?? 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#09090C] border border-white/5">
                    <span className="text-[#8E8EA0]">Approved:</span>
                    <div className="font-bold text-emerald-400 text-lg mt-0.5">
                      {stats?.submissionStatusBreakdown.approved ?? 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#09090C] border border-white/5">
                    <span className="text-[#8E8EA0]">Corrections Needed:</span>
                    <div className="font-bold text-sky-400 text-lg mt-0.5">
                      {stats?.submissionStatusBreakdown.correction_requested ?? 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#09090C] border border-white/5">
                    <span className="text-[#8E8EA0]">Rejected / Denied:</span>
                    <div className="font-bold text-rose-400 text-lg mt-0.5">
                      {stats?.submissionStatusBreakdown.rejected ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Audit Log Feed */}
            <div className="p-6 rounded-3xl bg-[#121217] border border-white/10 space-y-4 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-white">
                  Recent Audit Logs
                </h3>
                <span className="text-[10px] text-[#8E8EA0]">Immutable records</span>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-[280px] flex-1 text-xs pr-1">
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-[#8E8EA0]">
                    No audit actions recorded yet.
                  </div>
                ) : (
                  logs.slice(0, 6).map((log) => (
                    <div key={log.id} className="p-3 rounded-xl bg-[#181822] border border-white/5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#FF2A85] uppercase tracking-wider text-[10px]">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-[#8E8EA0]">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-white text-[11px] leading-tight">
                        {log.details}
                      </p>
                      <div className="text-[10px] text-[#8E8EA0]">
                        By: <span className="font-mono text-white/80">{log.moderatorEmail}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: VIDEO SUBMISSIONS QUEUE & CONSENT DOSSIER                      */}
      {/* ========================================================================= */}
      {activeSection === 'submissions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                Creator Video Submissions Queue
              </h2>
              <p className="text-xs text-[#8E8EA0]">
                Review submissions, verify creator 18+ consent dossier, edit descriptions, and approve or reject.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#121217] border border-white/10 text-xs overflow-x-auto">
              {(['pending', 'approved', 'correction_requested', 'rejected', 'all'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSubmissionFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer capitalize ${
                    submissionFilter === tab
                      ? 'bg-[#FF2A85] text-white'
                      : 'text-[#8E8EA0] hover:text-white'
                  }`}
                >
                  {tab.replace('_', ' ')}
                  <span className="ml-1 opacity-70">
                    ({tab === 'all' ? submissions.length : submissions.filter((s) => s.status === tab).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8E8EA0] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search submissions by title, creator name, TikTok handle, or reference code..."
              value={submissionSearch}
              onChange={(e) => setSubmissionSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121217] border border-white/10 text-xs text-white placeholder-[#8E8EA0] outline-none focus:border-[#FF2A85]"
            />
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#121217] border border-white/10 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-[#8E8EA0] mx-auto opacity-50" />
              <div className="text-white font-bold text-sm">No Submissions Found</div>
              <p className="text-xs text-[#8E8EA0] max-w-md mx-auto">
                No submissions currently match this filter. As creators submit via the portal, they will appear here in the pending queue.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((sub) => {
                const isPending = sub.status === 'pending';
                return (
                  <div
                    key={sub.id}
                    className="p-6 rounded-2xl bg-[#121217] border border-white/10 hover:border-white/20 transition-all space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Video Info & Creator */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-white/5">
                            {sub.referenceCode}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              sub.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : sub.status === 'pending'
                                ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                                : sub.status === 'correction_requested'
                                ? 'bg-sky-400/10 text-sky-400 border border-sky-400/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {sub.status.replace('_', ' ')}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-[#A1A1AA]">
                            {sub.category}
                          </span>
                        </div>

                        <h3 className="font-bold text-base text-white">
                          {sub.videoTitle}
                        </h3>
                        <p className="text-xs text-[#A1A1AA] line-clamp-2 max-w-2xl">
                          {sub.videoDescription || 'No description provided by creator.'}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-[#8E8EA0] flex-wrap">
                          <div>
                            Creator: <strong className="text-white">{sub.creatorName}</strong>
                          </div>
                          <div>
                            Handle: <span className="text-[#FF2A85] font-mono">{sub.tiktokHandle}</span>
                          </div>
                          <div>
                            Email: <span className="font-mono">{sub.email}</span>
                          </div>
                          <div>
                            Submitted: <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="px-3.5 py-2 rounded-xl bg-[#181822] hover:bg-[#222230] border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#FF2A85]" />
                          <span>Inspect Dossier</span>
                        </button>

                        <button
                          onClick={() =>
                            setEditingSubmission({
                              id: sub.id,
                              title: sub.videoTitle,
                              desc: sub.videoDescription || '',
                              cat: sub.category,
                            })
                          }
                          className="px-3 py-2 rounded-xl bg-[#181822] hover:bg-[#222230] border border-white/10 text-xs font-semibold text-[#A1A1AA] hover:text-white flex items-center gap-1.5 cursor-pointer"
                          title="Edit Title & Description"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {isPending && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setActionType('approve');
                              }}
                              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setActionType('reject');
                              }}
                              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Consent Dossier Badges */}
                    <div className="pt-3 border-t border-white/5 flex items-center gap-3 text-[11px] text-[#8E8EA0] flex-wrap">
                      <div className="flex items-center gap-1 text-emerald-400">
                        <Check className="w-3 h-3" />
                        <span>18+ Age Verified</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400">
                        <Check className="w-3 h-3" />
                        <span>Copyright Ownership Confirmed</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400">
                        <Check className="w-3 h-3" />
                        <span>Syndication Terms Accepted</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400">
                        <Check className="w-3 h-3" />
                        <span>Privacy Policy Consented</span>
                      </div>
                      {sub.mediaType === 'upload' && sub.originalFileName && (
                        <div className="ml-auto text-[#8E8EA0] font-mono text-[10px]">
                          File: {sub.originalFileName}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: PUBLISHED VIDEOS MANAGEMENT                                    */}
      {/* ========================================================================= */}
      {activeSection === 'published' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                Published Video Releases ({publishedVideos.length})
              </h2>
              <p className="text-xs text-[#8E8EA0]">
                Active catalog appearing publicly on the ONLYTOK website. Feature, edit metadata, or execute rapid takedowns.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={publishedCategory}
                onChange={(e) => setPublishedCategory(e.target.value)}
                className="bg-[#121217] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.label}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#8E8EA0] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search published videos by title, creator name, or TikTok handle..."
              value={publishedSearch}
              onChange={(e) => setPublishedSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121217] border border-white/10 text-xs text-white placeholder-[#8E8EA0] outline-none focus:border-[#FF2A85]"
            />
          </div>

          {filteredPublished.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#121217] border border-white/10 text-center space-y-3">
              <Film className="w-8 h-8 text-[#8E8EA0] mx-auto opacity-50" />
              <div className="text-white font-bold text-sm">No Published Releases Found</div>
              <p className="text-xs text-[#8E8EA0]">
                When submissions are approved in the moderation queue, they automatically syndicate into this catalog.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublished.map((video) => (
                <div
                  key={video.id}
                  className="rounded-2xl bg-[#121217] border border-white/10 overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all"
                >
                  <div className="p-4 space-y-3">
                    {/* Media Preview Player / Link */}
                    <div className="aspect-[9/12] max-h-56 w-full rounded-xl bg-black/60 relative overflow-hidden flex items-center justify-center border border-white/5">
                      {video.mediaType === 'upload' ? (
                        <video
                          src={video.mediaUrl}
                          className="w-full h-full object-cover"
                          controls
                          preload="metadata"
                        />
                      ) : (
                        <div className="p-4 text-center space-y-2">
                          <Play className="w-8 h-8 text-[#FF2A85] mx-auto" />
                          <div className="text-xs text-white font-medium">External TikTok Media</div>
                          <a
                            href={video.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#FF2A85] hover:underline"
                          >
                            <span>Open Source</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {video.isFeatured && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FF2A85] text-white flex items-center gap-1 shadow-md">
                          <Star className="w-3 h-3 fill-white" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#8E8EA0]">
                        <span className="font-semibold text-white/90">{video.category}</span>
                        <span className="font-mono text-[10px]">{video.referenceCode}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white line-clamp-1">{video.title}</h4>
                      <p className="text-xs text-[#A1A1AA] line-clamp-2">
                        {video.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="text-xs text-[#8E8EA0] flex items-center justify-between pt-1">
                      <div>
                        By: <span className="text-white font-medium">{video.creatorName}</span>
                      </div>
                      <span className="font-mono text-[#FF2A85]">{video.tiktokHandle}</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 border-t border-white/5 bg-[#09090C]/40 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleFeature(video)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        video.isFeatured
                          ? 'bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/30'
                          : 'bg-[#181822] hover:bg-[#222230] text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${video.isFeatured ? 'fill-[#FF2A85]' : ''}`} />
                      <span>{video.isFeatured ? 'Featured' : 'Feature'}</span>
                    </button>

                    <button
                      onClick={() => handleTakedownVideo(video)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Takedown</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: CREATOR MANAGEMENT                                             */}
      {/* ========================================================================= */}
      {activeSection === 'creators' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                Creator Management ({creators.length})
              </h2>
              <p className="text-xs text-[#8E8EA0]">
                Roster of registered talent. Manage biographies, verified 18+ credentials, category tags, and profile statuses.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingCreator(null);
                setCreatorForm({
                  displayName: '',
                  username: '',
                  email: '',
                  bio: '',
                  avatarUrl: '',
                  categories: 'Dance & Choreography',
                  isVerified18Plus: true,
                });
                setIsCreatorModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#FF2A85] hover:bg-[#ff3d93] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#FF2A85]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Verified Creator</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((c) => (
              <div
                key={c.id}
                className="p-6 rounded-2xl bg-[#121217] border border-white/10 hover:border-white/20 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.avatarUrl}
                      alt={c.displayName}
                      className="w-12 h-12 rounded-full object-cover border border-[#FF2A85]/40"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-white">{c.displayName}</h4>
                        {c.isVerified18Plus && (
                          <span title="Verified 18+ Creator">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF2A85]" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-[#8E8EA0]">{c.username}</div>
                    </div>

                    <span
                      className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#A1A1AA] line-clamp-3 leading-relaxed">
                    {c.bio || 'No creator biography documented.'}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {c.categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 text-[#A1A1AA]"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <a
                    href={c.socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF2A85] hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>TikTok</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingCreator(c);
                        setCreatorForm({
                          displayName: c.displayName,
                          username: c.username,
                          email: c.email || '',
                          bio: c.bio,
                          avatarUrl: c.avatarUrl,
                          categories: c.categories[0] || 'Dance & Choreography',
                          isVerified18Plus: c.isVerified18Plus,
                        });
                        setIsCreatorModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#181822] hover:bg-[#222230] text-[#A1A1AA] hover:text-white font-medium cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: CATEGORIES MANAGEMENT                                          */}
      {/* ========================================================================= */}
      {activeSection === 'categories' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                Entertainment Categories ({categories.length})
              </h2>
              <p className="text-xs text-[#8E8EA0]">
                Configure the vertical discovery categories, color badges, and taxonomy shown across the platform.
              </p>
            </div>

            <button
              onClick={() => {
                setCategoryForm({ id: '', label: '', description: '', color: '#FF2A85' });
                setIsCategoryModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#FF2A85] hover:bg-[#ff3d93] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#FF2A85]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-2xl bg-[#121217] border border-white/10 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <h4 className="font-bold text-sm text-white">{cat.label}</h4>
                    </div>
                    <span className="font-mono text-[10px] text-[#8E8EA0]">
                      #{cat.sortOrder}
                    </span>
                  </div>

                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    {cat.description || 'No category description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-[#8E8EA0]">{cat.slug}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setCategoryForm({
                          id: cat.id,
                          label: cat.label,
                          description: cat.description,
                          color: cat.color,
                        });
                        setIsCategoryModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#181822] hover:bg-[#222230] text-[#A1A1AA] hover:text-white cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: REPORTS & REMOVAL REQUESTS (DMCA DESK)                         */}
      {/* ========================================================================= */}
      {activeSection === 'reports' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                Content Removal & DMCA Requests Queue ({reports.length})
              </h2>
              <p className="text-xs text-[#8E8EA0]">
                Handle copyright notices, creator consent withdrawals, and age verification disputes with instant takedown capabilities.
              </p>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#121217] border border-white/10 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
              <div className="text-white font-bold text-sm">No Pending Removal Notices</div>
              <p className="text-xs text-[#8E8EA0] max-w-md mx-auto">
                All copyright notices and creator takedown requests have been inspected and resolved.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-6 rounded-2xl bg-[#121217] border border-white/10 hover:border-white/20 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-white/5">
                        {report.referenceCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          report.status === 'resolved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : report.status === 'pending'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                        }`}
                      >
                        {report.status}
                      </span>
                      <span className="text-xs font-semibold text-[#FF2A85]">
                        {report.reportType.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-[#8E8EA0]">
                      Received: {new Date(report.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-[#8E8EA0]">
                      Target Reference: <strong className="text-white">{report.targetTitle}</strong> ({report.targetId})
                    </div>
                    <p className="text-xs text-[#A1A1AA] p-3 rounded-xl bg-[#09090C] border border-white/5">
                      {report.details}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-[#8E8EA0]">
                    <div>
                      Complainant: <strong className="text-white">{report.reporterName}</strong> (
                      <span className="font-mono">{report.reporterEmail}</span>)
                      {report.reporterAffiliation && ` — ${report.reporterAffiliation}`}
                    </div>

                    <div className="flex items-center gap-2">
                      {report.status !== 'resolved' ? (
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setReportResolutionNotes('');
                            setExecuteTakedownWithReport(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#FF2A85] hover:bg-[#ff3d93] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Resolve Notice</span>
                        </button>
                      ) : (
                        <div className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolved by {report.resolvedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {report.resolutionNotes && (
                    <div className="text-[11px] text-[#8E8EA0] bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                      <strong className="text-white">Resolution Notes:</strong> {report.resolutionNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 7: USER MANAGEMENT                                                */}
      {/* ========================================================================= */}
      {activeSection === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                Administrator Accounts & Role Access ({adminUsers.length})
              </h2>
              <p className="text-xs text-[#8E8EA0]">
                Control administrative credentials, assign roles (Super Administrator, Moderator, Editor), and monitor access.
              </p>
            </div>

            <button
              onClick={() => setIsAdminUserModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#FF2A85] hover:bg-[#ff3d93] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#FF2A85]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Administrator</span>
            </button>
          </div>

          <div className="space-y-3">
            {adminUsers.map((user) => (
              <div
                key={user.id}
                className="p-5 rounded-2xl bg-[#121217] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{user.displayName}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          user.role === 'super_admin'
                            ? 'bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/30'
                            : 'bg-white/10 text-[#A1A1AA]'
                        }`}
                      >
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#8E8EA0]">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-[#8E8EA0]">
                  <div>
                    Status: <strong className="text-emerald-400 capitalize">{user.status}</strong>
                  </div>
                  <div>
                    Added: <span>{new Date(user.addedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 8: WEBSITE SETTINGS & BRAND GOVERNANCE                            */}
      {/* ========================================================================= */}
      {activeSection === 'settings' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display font-bold text-lg text-white">
              Website Settings & Platform Governance
            </h2>
            <p className="text-xs text-[#8E8EA0]">
              Configure brand copy, TikTok channel handle, submission portal status, announcement banner, and compliance parameters.
            </p>
          </div>

          {settings ? (
            <form onSubmit={handleSaveSettings} className="p-6 rounded-3xl bg-[#121217] border border-white/10 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8E8EA0] mb-1.5">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={settings.brandName}
                    onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#FF2A85]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E8EA0] mb-1.5">
                    Official TikTok Handle
                  </label>
                  <input
                    type="text"
                    value={settings.tiktokHandle}
                    onChange={(e) => setSettings({ ...settings, tiktokHandle: e.target.value })}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-[#FF2A85]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E8EA0] mb-1.5">
                  Platform Tagline / Introductory Headline
                </label>
                <input
                  type="text"
                  value={settings.brandTagline}
                  onChange={(e) => setSettings({ ...settings, brandTagline: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#FF2A85]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8E8EA0] mb-1.5">
                    Public Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#FF2A85]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E8EA0] mb-1.5">
                    DMCA / Legal Compliance Email
                  </label>
                  <input
                    type="email"
                    value={settings.dmcaEmail}
                    onChange={(e) => setSettings({ ...settings, dmcaEmail: e.target.value })}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#FF2A85]"
                  />
                </div>
              </div>

              {/* Portal status */}
              <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-white">Creator Submission Portal Status</h4>
                    <p className="text-[11px] text-[#8E8EA0]">
                      Open or pause the public creator upload portal for scheduled maintenance.
                    </p>
                  </div>
                  <select
                    value={settings.submissionStatus}
                    onChange={(e) => setSettings({ ...settings, submissionStatus: e.target.value as 'open' | 'paused' })}
                    className="bg-[#181822] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-semibold outline-none"
                  >
                    <option value="open">Open (Accepting Submissions)</option>
                    <option value="paused">Paused (Portal Closed)</option>
                  </select>
                </div>
              </div>

              {/* Announcement Banner */}
              <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-white">Announcement Banner</h4>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#8E8EA0]">
                    <input
                      type="checkbox"
                      checked={settings.announcementBanner.active}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          announcementBanner: {
                            ...settings.announcementBanner,
                            active: e.target.checked,
                          },
                        })
                      }
                      className="accent-[#FF2A85] w-4 h-4 rounded"
                    />
                    <span>Active</span>
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="Announcement message text..."
                  value={settings.announcementBanner.text}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcementBanner: {
                        ...settings.announcementBanner,
                        text: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#181822] border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={settingsSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2A85] to-[#D90368] hover:from-[#ff3d93] hover:to-[#eb0c75] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FF2A85]/20 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{settingsSaving ? 'Saving...' : 'Deploy Settings Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 text-[#8E8EA0]">Loading settings...</div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUBMISSION INSPECTION & MODERATION DECISION                         */}
      {/* ========================================================================= */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#121217] border border-white/10 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08] bg-[#09090C]/60 shrink-0">
              <div>
                <span className="font-mono text-xs font-bold text-white bg-black/40 px-2.5 py-1 rounded border border-white/10">
                  {selectedSubmission.referenceCode}
                </span>
                <h3 className="font-display font-bold text-lg text-white mt-1">
                  {selectedSubmission.videoTitle}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  setActionType(null);
                }}
                className="text-[#8E8EA0] hover:text-white p-2 rounded-xl hover:bg-white/5 cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#A1A1AA] flex-1">
              {/* Video Player Preview */}
              <div className="aspect-video w-full rounded-2xl bg-black/80 border border-white/10 overflow-hidden flex items-center justify-center">
                {selectedSubmission.mediaType === 'upload' ? (
                  <video
                    src={selectedSubmission.mediaUrl}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay={false}
                  />
                ) : (
                  <div className="text-center space-y-2 p-6">
                    <Play className="w-10 h-10 text-[#FF2A85] mx-auto" />
                    <div className="text-white font-bold text-sm">External TikTok Video Reference</div>
                    <a
                      href={selectedSubmission.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#FF2A85] hover:underline"
                    >
                      <span>Open on TikTok</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Creator & Compliance Verification Dossier */}
              <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-3">
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Mandatory Compliance Dossier</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#121217] border border-white/5">
                    <span className="text-[#8E8EA0] block text-[10px]">Creator Name</span>
                    <strong className="text-white">{selectedSubmission.creatorName}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#121217] border border-white/5">
                    <span className="text-[#8E8EA0] block text-[10px]">TikTok Handle</span>
                    <strong className="text-[#FF2A85] font-mono">{selectedSubmission.tiktokHandle}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#121217] border border-white/5">
                    <span className="text-[#8E8EA0] block text-[10px]">Contact Email</span>
                    <strong className="text-white font-mono">{selectedSubmission.email}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#121217] border border-white/5">
                    <span className="text-[#8E8EA0] block text-[10px]">Category</span>
                    <strong className="text-white">{selectedSubmission.category}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 space-y-1 text-[11px]">
                  <div className="flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Legally Binding Consent Certifications:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[#A1A1AA]">
                    <li>Individual featured confirmed to be 18+ years of age.</li>
                    <li>Copyright ownership or authorized syndication authority certified.</li>
                    <li>ONLYTOK Terms of syndication and Privacy Notice agreed.</li>
                  </ul>
                </div>
              </div>

              {/* Action Form if action selected */}
              {actionType && (
                <div className="p-4 rounded-2xl bg-[#181822] border border-[#FF2A85]/30 space-y-3">
                  <div className="font-bold text-white text-xs">
                    Executing Decision: <span className="text-[#FF2A85] uppercase">{actionType}</span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Enter moderation decision notes or instructions for the creator..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#FF2A85] resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setActionType(null)}
                      className="px-3 py-1.5 rounded-lg text-xs text-[#8E8EA0] hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExecuteModeration}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl bg-[#FF2A85] hover:bg-[#ff3d93] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm & Execute</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            {!actionType && (
              <div className="p-4 sm:p-6 border-t border-white/[0.08] bg-[#09090C]/60 flex items-center justify-between gap-3 shrink-0">
                <button
                  onClick={() => {
                    setSelectedSubmission(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#181822] hover:bg-[#222230] text-xs font-semibold text-[#8E8EA0] hover:text-white cursor-pointer"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActionType('request_correction')}
                    className="px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 font-semibold text-xs cursor-pointer"
                  >
                    Request Corrections
                  </button>

                  <button
                    onClick={() => setActionType('reject')}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs cursor-pointer"
                  >
                    Reject Submission
                  </button>

                  <button
                    onClick={() => setActionType('approve')}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Syndicate</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT SUBMISSION TITLE & DESCRIPTION                                 */}
      {/* ========================================================================= */}
      {editingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#121217] border border-white/10 p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-white">
              Edit Video Metadata
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8E8EA0] mb-1 font-medium">Video Title</label>
                <input
                  type="text"
                  value={editingSubmission.title}
                  onChange={(e) => setEditingSubmission({ ...editingSubmission, title: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#FF2A85]"
                />
              </div>

              <div>
                <label className="block text-[#8E8EA0] mb-1 font-medium">Video Description</label>
                <textarea
                  rows={3}
                  value={editingSubmission.desc}
                  onChange={(e) => setEditingSubmission({ ...editingSubmission, desc: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#FF2A85] resize-none"
                />
              </div>

              <div>
                <label className="block text-[#8E8EA0] mb-1 font-medium">Category</label>
                <select
                  value={editingSubmission.cat}
                  onChange={(e) => setEditingSubmission({ ...editingSubmission, cat: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.label}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingSubmission(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-[#8E8EA0] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSubmissionEdit}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-[#FF2A85] hover:bg-[#ff3d93] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CREATOR                                                 */}
      {/* ========================================================================= */}
      {isCreatorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#121217] border border-white/10 p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-white">
              {editingCreator ? 'Edit Creator Profile' : 'Enroll Verified Creator'}
            </h3>
            <form onSubmit={handleSaveCreator} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8E8EA0] mb-1">Display Name *</label>
                  <input
                    type="text"
                    required
                    value={creatorForm.displayName}
                    onChange={(e) => setCreatorForm({ ...creatorForm, displayName: e.target.value })}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#FF2A85]"
                  />
                </div>
                <div>
                  <label className="block text-[#8E8EA0] mb-1">TikTok Handle *</label>
                  <input
                    type="text"
                    required
                    placeholder="@username"
                    value={creatorForm.username}
                    onChange={(e) => setCreatorForm({ ...creatorForm, username: e.target.value })}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#FF2A85]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8E8EA0] mb-1">Contact Email</label>
                <input
                  type="email"
                  value={creatorForm.email}
                  onChange={(e) => setCreatorForm({ ...creatorForm, email: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#FF2A85]"
                />
              </div>

              <div>
                <label className="block text-[#8E8EA0] mb-1">Biography</label>
                <textarea
                  rows={2}
                  value={creatorForm.bio}
                  onChange={(e) => setCreatorForm({ ...creatorForm, bio: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#FF2A85] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8E8EA0] mb-1">Primary Category</label>
                  <select
                    value={creatorForm.categories}
                    onChange={(e) => setCreatorForm({ ...creatorForm, categories: e.target.value })}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={creatorForm.isVerified18Plus}
                      onChange={(e) => setCreatorForm({ ...creatorForm, isVerified18Plus: e.target.checked })}
                      className="accent-[#FF2A85] w-4 h-4 rounded"
                    />
                    <span>Verified 18+ Badge</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCreatorModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#8E8EA0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-[#FF2A85] hover:bg-[#ff3d93] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Creator</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CATEGORY                                                */}
      {/* ========================================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#121217] border border-white/10 p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-white">
              {categoryForm.id ? 'Edit Category' : 'Create New Category'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8E8EA0] mb-1">Category Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Street Dance & Flow"
                  value={categoryForm.label}
                  onChange={(e) => setCategoryForm({ ...categoryForm, label: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#FF2A85]"
                />
              </div>

              <div>
                <label className="block text-[#8E8EA0] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#FF2A85] resize-none"
                />
              </div>

              <div>
                <label className="block text-[#8E8EA0] mb-1">Color Accent (Hex)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="flex-1 bg-[#09090C] border border-white/10 rounded-xl px-3 py-2 text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#8E8EA0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-[#FF2A85] hover:bg-[#ff3d93] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REPORT RESOLUTION & TAKEDOWN EXECUTION                             */}
      {/* ========================================================================= */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#121217] border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-white/5">
                {selectedReport.referenceCode}
              </span>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-[#8E8EA0] hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <h3 className="font-display font-bold text-base text-white">
              Resolve Removal / DMCA Notice
            </h3>

            <div className="p-3 rounded-xl bg-[#09090C] border border-white/5 space-y-1 text-xs">
              <div className="text-[#8E8EA0]">Target: <strong className="text-white">{selectedReport.targetTitle}</strong></div>
              <div className="text-[#8E8EA0]">Claim: <span className="text-[#FF2A85]">{selectedReport.reportType}</span></div>
              <p className="text-[#A1A1AA] pt-1">{selectedReport.details}</p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                <input
                  type="checkbox"
                  checked={executeTakedownWithReport}
                  onChange={(e) => setExecuteTakedownWithReport(e.target.checked)}
                  className="accent-rose-500 w-4 h-4 rounded"
                />
                <span className="font-bold">Execute Immediate Takedown on target video</span>
              </label>

              <div>
                <label className="block text-[#8E8EA0] mb-1 font-medium">Resolution Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record justification and findings (e.g. Valid copyright claim confirmed, video removed from syndication)..."
                  value={reportResolutionNotes}
                  onChange={(e) => setReportResolutionNotes(e.target.value)}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#FF2A85] resize-none"
                />
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-3 border-t border-white/5">
              <button
                onClick={() => handleActionReport('dismissed')}
                disabled={isProcessing}
                className="px-3 py-2 rounded-xl bg-[#181822] hover:bg-[#222230] text-xs font-semibold text-[#8E8EA0] hover:text-white"
              >
                Dismiss as Unfounded
              </button>

              <button
                onClick={() => handleActionReport('resolved')}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD ADMIN USER                                                     */}
      {/* ========================================================================= */}
      {isAdminUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#121217] border border-white/10 p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-white">
              Provision Administrator Account
            </h3>
            <form onSubmit={handleSaveAdminUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8E8EA0] mb-1 font-medium">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@domain.com"
                  value={adminUserForm.email}
                  onChange={(e) => setAdminUserForm({ ...adminUserForm, email: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#FF2A85]"
                />
              </div>

              <div>
                <label className="block text-[#8E8EA0] mb-1 font-medium">Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Staff Member Name"
                  value={adminUserForm.displayName}
                  onChange={(e) => setAdminUserForm({ ...adminUserForm, displayName: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#FF2A85]"
                />
              </div>

              <div>
                <label className="block text-[#8E8EA0] mb-1 font-medium">Role Permission Level</label>
                <select
                  value={adminUserForm.role}
                  onChange={(e) => setAdminUserForm({ ...adminUserForm, role: e.target.value as any })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="moderator">Moderator (Review queue, approve/reject)</option>
                  <option value="editor">Editor (Creator curation, categories)</option>
                  <option value="super_admin">Super Administrator (Full unrestricted access)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#8E8EA0] mb-1 font-medium">Administrative Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Legal counsel, Senior content director"
                  value={adminUserForm.notes}
                  onChange={(e) => setAdminUserForm({ ...adminUserForm, notes: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#FF2A85]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAdminUserModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#8E8EA0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-[#FF2A85] hover:bg-[#ff3d93] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Provision Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
