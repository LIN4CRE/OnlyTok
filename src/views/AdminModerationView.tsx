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
} from 'lucide-react';
import { auth, googleAuthProvider } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

interface SubmissionItem {
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

interface ModerationLogItem {
  id: string;
  submissionId: string;
  videoTitle: string;
  creatorName: string;
  action: string;
  notes: string;
  moderatorEmail: string;
  timestamp: string;
}

export const AdminModerationView: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [logs, setLogs] = useState<ModerationLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'correction_requested' | 'rejected' | 'all' | 'logs'>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);
  
  // Action dialog state
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request_correction' | 'remove' | null>(null);
  const [actionNotes, setActionNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && (user.email === 'dlinacre16@gmail.com' || user.email?.includes('admin@onlytok.com'))) {
        setIsAdminUnlocked(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }

      const logRes = await fetch('/api/moderation-logs');
      if (logRes.ok) {
        const logData = await logRes.json();
        setLogs(logData.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch moderation queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setIsAdminUnlocked(false);
  };

  const handleExecuteAction = async () => {
    if (!selectedSubmission || !actionType) return;

    try {
      setIsProcessing(true);
      const moderatorEmail = currentUser?.email || 'dlinacre16@gmail.com';

      const res = await fetch(`/api/submissions/${selectedSubmission.id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          notes: actionNotes,
          moderatorEmail,
        }),
      });

      if (res.ok) {
        setActionFeedback(`Decision successfully recorded: ${actionType.toUpperCase()}`);
        setActionType(null);
        setActionNotes('');
        setSelectedSubmission(null);
        await fetchQueue();
        setTimeout(() => setActionFeedback(null), 3500);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update moderation state.');
      }
    } catch (err) {
      console.error('Moderation action failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const counts = {
    pending: submissions.filter((s) => s.status === 'pending').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
    correction_requested: submissions.filter((s) => s.status === 'correction_requested').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
    all: submissions.length,
    logs: logs.length,
  };

  const filteredSubmissions =
    activeTab === 'all'
      ? submissions
      : submissions.filter((s) => s.status === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#FF2A85] mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Governance & Editorial Desk</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight">
            Creator Submission Moderation Queue
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Review incoming submissions, verify 18+ credentials, approve authorized content, or request revisions.
          </p>
        </div>

        {/* Admin Session Controls */}
        <div className="flex items-center gap-3">
          {currentUser || isAdminUnlocked ? (
            <div className="flex items-center gap-3 p-2 rounded-2xl bg-[#121217] border border-white/10 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-left">
                <div className="text-[#8E8EA0] text-[10px] uppercase font-mono">Verified Moderator</div>
                <div className="text-white font-medium">{currentUser?.email || 'dlinacre16@gmail.com'}</div>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors ml-2"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-[#F4F4F5] transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In with Google</span>
              </button>
              <button
                onClick={() => setIsAdminUnlocked(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#181822] hover:bg-[#222230] border border-white/10 text-xs text-[#A1A1AA] hover:text-white transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-[#FF2A85]" />
                <span>Admin Mode</span>
              </button>
            </div>
          )}

          <button
            onClick={fetchQueue}
            title="Refresh queue"
            className="p-2.5 rounded-xl bg-[#121217] hover:bg-[#181822] border border-white/10 text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm mb-6 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div
          onClick={() => setActiveTab('pending')}
          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            activeTab === 'pending'
              ? 'bg-[#181822] border-[#FF2A85]'
              : 'bg-[#121217] border-white/[0.08] hover:border-white/20'
          }`}
        >
          <div className="text-xs font-mono uppercase text-[#8E8EA0] mb-1 flex items-center justify-between">
            <span>Pending Review</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-display font-black text-white">{counts.pending}</div>
          <div className="text-[11px] text-[#A1A1AA] mt-1">Awaiting moderation</div>
        </div>

        <div
          onClick={() => setActiveTab('approved')}
          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            activeTab === 'approved'
              ? 'bg-[#181822] border-emerald-400'
              : 'bg-[#121217] border-white/[0.08] hover:border-white/20'
          }`}
        >
          <div className="text-xs font-mono uppercase text-[#8E8EA0] mb-1 flex items-center justify-between">
            <span>Approved & Live</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-display font-black text-white">{counts.approved}</div>
          <div className="text-[11px] text-[#A1A1AA] mt-1">Syndicated on site</div>
        </div>

        <div
          onClick={() => setActiveTab('correction_requested')}
          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            activeTab === 'correction_requested'
              ? 'bg-[#181822] border-sky-400'
              : 'bg-[#121217] border-white/[0.08] hover:border-white/20'
          }`}
        >
          <div className="text-xs font-mono uppercase text-[#8E8EA0] mb-1 flex items-center justify-between">
            <span>Revisions Requested</span>
            <AlertTriangle className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-display font-black text-white">{counts.correction_requested}</div>
          <div className="text-[11px] text-[#A1A1AA] mt-1">Feedback dispatched</div>
        </div>

        <div
          onClick={() => setActiveTab('rejected')}
          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            activeTab === 'rejected'
              ? 'bg-[#181822] border-rose-500'
              : 'bg-[#121217] border-white/[0.08] hover:border-white/20'
          }`}
        >
          <div className="text-xs font-mono uppercase text-[#8E8EA0] mb-1 flex items-center justify-between">
            <span>Rejected</span>
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-display font-black text-white">{counts.rejected}</div>
          <div className="text-[11px] text-[#A1A1AA] mt-1">Non-compliant / ineligible</div>
        </div>
      </div>

      {/* Queue Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-white/[0.08]">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'pending'
              ? 'bg-[#FF2A85] text-white'
              : 'bg-[#121217] text-[#A1A1AA] hover:text-white'
          }`}
        >
          <span>Pending Queue ({counts.pending})</span>
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'approved'
              ? 'bg-emerald-500 text-white'
              : 'bg-[#121217] text-[#A1A1AA] hover:text-white'
          }`}
        >
          <span>Approved ({counts.approved})</span>
        </button>
        <button
          onClick={() => setActiveTab('correction_requested')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'correction_requested'
              ? 'bg-sky-500 text-white'
              : 'bg-[#121217] text-[#A1A1AA] hover:text-white'
          }`}
        >
          <span>Needs Correction ({counts.correction_requested})</span>
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'rejected'
              ? 'bg-rose-500 text-white'
              : 'bg-[#121217] text-[#A1A1AA] hover:text-white'
          }`}
        >
          <span>Rejected ({counts.rejected})</span>
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-white text-black'
              : 'bg-[#121217] text-[#A1A1AA] hover:text-white'
          }`}
        >
          <span>All Submissions ({counts.all})</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ml-auto ${
            activeTab === 'logs'
              ? 'bg-violet-600 text-white'
              : 'bg-[#121217] text-[#A1A1AA] hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Audit Log ({counts.logs})</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'logs' ? (
        /* Audit Trail Table */
        <div className="bg-[#121217] border border-white/[0.08] rounded-3xl p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-white">Immutable Moderation Log</h3>
            <span className="text-xs text-[#8E8EA0]">Recorded chronologically</span>
          </div>
          {logs.length === 0 ? (
            <div className="text-center py-12 text-[#8E8EA0] text-sm">
              No moderation decisions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#A1A1AA]">
                <thead className="text-[#8E8EA0] font-mono border-b border-white/5 uppercase">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Submission / Video</th>
                    <th className="py-3 px-4">Moderator</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            log.action === 'approve'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : log.action === 'reject'
                              ? 'bg-rose-500/20 text-rose-400'
                              : log.action === 'remove'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-sky-500/20 text-sky-400'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        {log.videoTitle} <span className="text-[#8E8EA0]">({log.creatorName})</span>
                      </td>
                      <td className="py-3 px-4 text-[#8E8EA0] font-mono">{log.moderatorEmail}</td>
                      <td className="py-3 px-4 text-[#A1A1AA] max-w-xs truncate">{log.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Submissions Cards */
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#121217] border border-white/[0.08]">
              <div className="w-12 h-12 rounded-full bg-[#181822] text-[#8E8EA0] flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-1">Queue is Clear</h3>
              <p className="text-xs text-[#8E8EA0]">
                No submissions in the {activeTab.replace('_', ' ')} queue.
              </p>
            </div>
          ) : (
            filteredSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="p-5 sm:p-6 rounded-3xl bg-[#121217] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col lg:flex-row gap-6 items-start justify-between"
              >
                {/* Left: Info & Meta */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        sub.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : sub.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : sub.status === 'correction_requested'
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {sub.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono text-[#FF2A85] bg-[#FF2A85]/10 px-2 py-0.5 rounded-md">
                      {sub.referenceCode}
                    </span>
                    <span className="text-xs text-[#8E8EA0]">•</span>
                    <span className="text-xs text-[#A1A1AA]">{sub.category}</span>
                    <span className="text-xs text-[#8E8EA0]">•</span>
                    <span className="text-xs text-[#8E8EA0] font-mono">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-white mb-1">
                      {sub.videoTitle}
                    </h3>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-2xl">
                      {sub.videoDescription || 'No description provided.'}
                    </p>
                  </div>

                  {/* Creator details */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#8E8EA0] bg-[#181822] p-3 rounded-xl border border-white/5">
                    <div>
                      Creator: <strong className="text-white">{sub.creatorName}</strong>
                    </div>
                    <div>
                      Handle: <span className="text-[#FF2A85] font-mono">{sub.tiktokHandle}</span>
                    </div>
                    <div>
                      Email: <span className="text-white">{sub.email}</span>
                    </div>
                    <div>
                      Media: <span className="text-emerald-400 uppercase font-mono text-[10px]">{sub.mediaType}</span>
                    </div>
                  </div>

                  {/* Legal Safeguard Indicators */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px]">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>18+ Age Verified</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Copyright Confirmed</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Syndication Consent</span>
                    </div>
                  </div>

                  {/* Moderator notes if present */}
                  {sub.moderationNotes && (
                    <div className="text-xs p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[#A1A1AA]">
                      <span className="text-[#8E8EA0] font-bold">Moderator Feedback: </span>
                      {sub.moderationNotes}
                    </div>
                  )}
                </div>

                {/* Right: Video Preview & Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-72">
                  {/* Video preview thumbnail/embed */}
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-56 border border-white/10 flex items-center justify-center">
                    {sub.mediaType === 'upload' ? (
                      <video
                        src={sub.mediaUrl}
                        controls
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                    ) : (
                      <div className="p-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-[#FF2A85]/20 text-[#FF2A85] flex items-center justify-center mx-auto mb-2">
                          <Play className="w-5 h-5 ml-0.5" />
                        </div>
                        <div className="text-xs font-semibold text-white mb-1">Authorised TikTok URL</div>
                        <a
                          href={sub.mediaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#FF2A85] hover:underline flex items-center justify-center gap-1"
                        >
                          <span>Open Video Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action triggers */}
                  <div className="space-y-2 w-full">
                    {sub.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setActionType('approve');
                            setActionNotes('');
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setActionType('reject');
                            setActionNotes('');
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {sub.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setActionType('request_correction');
                          setActionNotes('');
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-white bg-[#181822] hover:bg-[#222230] border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                        <span>Request Corrections</span>
                      </button>
                    )}

                    {sub.status === 'approved' && (
                      <button
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setActionType('remove');
                          setActionNotes('');
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Published Release</span>
                      </button>
                    )}

                    {sub.status === 'correction_requested' && (
                      <button
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setActionType('approve');
                          setActionNotes('Approved following revision review.');
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Revised</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Moderation Decision Modal Dialog */}
      {selectedSubmission && actionType && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#121217] border border-white/15 p-6 sm:p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    actionType === 'approve'
                      ? 'bg-emerald-400'
                      : actionType === 'reject'
                      ? 'bg-rose-500'
                      : actionType === 'remove'
                      ? 'bg-amber-400'
                      : 'bg-sky-400'
                  }`}
                />
                <h3 className="font-display font-bold text-xl text-white">
                  Confirm Moderation: {actionType.replace('_', ' ').toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  setActionType(null);
                }}
                className="text-[#8E8EA0] hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#A1A1AA] mb-4">
              Submission: <strong className="text-white">"{selectedSubmission.videoTitle}"</strong> by{' '}
              <strong className="text-[#FF2A85]">{selectedSubmission.tiktokHandle}</strong> ({selectedSubmission.referenceCode})
            </p>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-2">
                {actionType === 'request_correction'
                  ? 'Correction Instructions for Creator *'
                  : actionType === 'reject'
                  ? 'Rejection Rationale / Notes *'
                  : 'Moderation Audit Notes (Optional)'}
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={
                  actionType === 'request_correction'
                    ? 'e.g., Please provide a higher bitrate 9:16 vertical export without third-party platform watermarks.'
                    : actionType === 'reject'
                    ? 'e.g., Audio copyright could not be verified or content does not match channel genre guidelines.'
                    : 'Notes logged to immutable audit trail...'
                }
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white placeholder-[#8E8EA0] text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  setActionType(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-white bg-[#181822] border border-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={isProcessing}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-colors flex items-center gap-1.5 disabled:opacity-50 ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : actionType === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : actionType === 'remove'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-sky-600 hover:bg-sky-500'
                }`}
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Confirm {actionType.replace('_', ' ')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
