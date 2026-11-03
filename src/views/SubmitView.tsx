/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  FileCheck,
  Lock,
  ArrowRight,
  Upload,
  Video,
  Link as LinkIcon,
  Search,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { normalizeTikTokHandle } from '../utils/submissionValidator';

export const SubmitView: React.FC = () => {
  // Submission Form State
  const [creatorName, setCreatorName] = useState<string>('');
  const [tiktokHandle, setTiktokHandle] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [videoDescription, setVideoDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Dance & Choreography');
  
  // Media Input Mode: 'upload' or 'url'
  const [mediaType, setMediaType] = useState<'upload' | 'url'>('upload');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [uploadedFileMeta, setUploadedFileMeta] = useState<{
    name: string;
    sizeBytes: number;
    mime: string;
  } | null>(null);

  // Upload Progress & State
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mandatory Confirmations
  const [confirmedOwnership, setConfirmedOwnership] = useState<boolean>(false);
  const [confirmedAdult18, setConfirmedAdult18] = useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState<boolean>(false);

  // Errors & UI states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Tracker State
  const [trackCode, setTrackCode] = useState<string>('');
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [trackResult, setTrackResult] = useState<any | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Handle Video File Upload via XMLHttpRequest for progress reporting
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size and type
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    const validMimes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const validExts = ['.mp4', '.webm', '.mov'];

    setUploadError(null);

    if (file.size > MAX_SIZE) {
      setUploadError('File size exceeds maximum limit of 50MB.');
      return;
    }

    if (!validMimes.includes(file.type) && !validExts.includes(ext)) {
      setUploadError('Unsupported format. Please upload MP4, WebM, or MOV video.');
      return;
    }

    // Begin upload
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('video', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status === 200) {
        try {
          const res = JSON.parse(xhr.responseText);
          setMediaUrl(res.mediaUrl);
          setUploadedFileMeta({
            name: file.name,
            sizeBytes: file.size,
            mime: file.type,
          });
          if (errors.mediaUrl) setErrors((prev) => ({ ...prev, mediaUrl: '' }));
        } catch {
          setUploadError('Failed to parse upload response.');
        }
      } else {
        try {
          const res = JSON.parse(xhr.responseText);
          setUploadError(res.error || 'Upload failed.');
        } catch {
          setUploadError(`Upload failed with status code ${xhr.status}`);
        }
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setUploadError('Network error during video upload. Please retry.');
    };

    xhr.send(formData);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!creatorName.trim() || creatorName.trim().length < 2) {
      newErrors.creatorName = 'Creator name must be at least 2 characters.';
    }

    if (!tiktokHandle.trim()) {
      newErrors.tiktokHandle = 'TikTok handle is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      newErrors.email = 'Valid contact email is required.';
    }

    if (!videoTitle.trim() || videoTitle.trim().length < 3) {
      newErrors.videoTitle = 'Video title must be at least 3 characters.';
    }

    if (!mediaUrl.trim()) {
      newErrors.mediaUrl =
        mediaType === 'upload'
          ? 'Please upload a video file (MP4, WebM, MOV).'
          : 'Please enter a valid video link.';
    }

    if (!confirmedOwnership) {
      newErrors.confirmedOwnership = 'You must confirm copyright ownership or submission authority.';
    }

    if (!confirmedAdult18) {
      newErrors.confirmedAdult18 = 'Strict 18+ age certification is required.';
    }

    if (!acceptedTerms || !acceptedPrivacy) {
      newErrors.terms = 'You must consent to promotional syndication and accept terms & privacy.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});

      const payload = {
        creatorName: creatorName.trim(),
        tiktokHandle: normalizeTikTokHandle(tiktokHandle),
        email: email.trim().toLowerCase(),
        videoTitle: videoTitle.trim(),
        videoDescription: videoDescription.trim(),
        mediaType,
        mediaUrl: mediaUrl.trim(),
        originalFileName: uploadedFileMeta?.name || null,
        fileSizeBytes: uploadedFileMeta?.sizeBytes || null,
        category,
        confirmedOwnership: true,
        confirmedAdult18: true,
        acceptedTerms: true,
        acceptedPrivacy: true,
      };

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedRef(data.referenceCode);
      } else {
        setErrors({ form: data.error || 'Failed to submit application. Please review fields.' });
      }
    } catch {
      setErrors({ form: 'Network error submitting application. Please retry.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (submittedRef) {
      navigator.clipboard.writeText(submittedRef).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    setCreatorName('');
    setTiktokHandle('');
    setEmail('');
    setVideoTitle('');
    setVideoDescription('');
    setCategory('Dance & Choreography');
    setMediaType('upload');
    setMediaUrl('');
    setUploadedFileMeta(null);
    setConfirmedOwnership(false);
    setConfirmedAdult18(false);
    setAcceptedTerms(false);
    setAcceptedPrivacy(false);
    setErrors({});
    setSubmittedRef(null);
    setUploadProgress(0);
  };

  const handleTrackSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackCode.trim()) return;

    try {
      setIsTracking(true);
      setTrackError(null);
      setTrackResult(null);

      const res = await fetch(`/api/submissions?referenceCode=${encodeURIComponent(trackCode.trim().toUpperCase())}`);
      const data = await res.json();

      if (res.ok) {
        setTrackResult(data);
      } else {
        setTrackError(data.error || 'Submission reference code not found.');
      }
    } catch {
      setTrackError('Failed to retrieve submission status.');
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      
      {/* Page Header */}
      <div className="max-w-3xl mb-12">
        <div className="text-xs font-bold uppercase tracking-widest text-[#FF2A85] mb-2 font-mono flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Creator Portal & Video Desk</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
          Submit Content to ONLYTOK.
        </h1>
        <p className="text-sm sm:text-base text-[#A1A1AA] mt-3 leading-relaxed">
          Are you a creator with distinctive choreography, styling, original stems, or visual craft? Upload your vertical video to be reviewed for syndication on the official @onlytokgirls channel with full profile credit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Form Stage */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#121217] border border-white/[0.08] shadow-2xl relative overflow-hidden">
            
            {submittedRef ? (
              /* Success State */
              <div className="text-center py-6 animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-[#FF2A85]/10 border border-[#FF2A85]/30 text-[#FF2A85] flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-8 h-8" />
                </div>

                <h3 className="font-display font-bold text-2xl text-white mb-2">
                  Application Logged in Pending Review
                </h3>
                <p className="text-sm text-[#A1A1AA] leading-relaxed mb-6 max-w-md mx-auto">
                  Your video has been securely stored in the moderation queue. Every submission undergoes human editorial review and 18+ verification before any public publication.
                </p>

                <div className="p-5 rounded-2xl bg-[#181822] border border-white/10 text-left mb-6">
                  <div className="text-xs font-mono text-[#8E8EA0] uppercase tracking-wider mb-1">
                    Application Reference Code
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xl font-bold text-[#FF2A85]">
                      {submittedRef}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-xs text-[#8E8EA0] border-t border-white/5 pt-2 flex justify-between">
                    <span>Status: <strong className="text-amber-400 uppercase font-mono">Pending Review</strong></span>
                    <span>Handle: <strong className="text-white">{normalizeTikTokHandle(tiktokHandle)}</strong></span>
                  </div>
                </div>

                <button
                  onClick={resetForm}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#181822] hover:bg-[#222230] border border-white/10 transition-colors"
                >
                  Submit Another Video
                </button>
              </div>
            ) : (
              /* Submission Form */
              <form onSubmit={handleFormSubmit} className="space-y-5">
                
                {errors.form && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.form}</span>
                  </div>
                )}

                {/* Creator Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                      Creator Display Name <span className="text-[#FF2A85]">*</span>
                    </label>
                    <input
                      type="text"
                      value={creatorName}
                      onChange={(e) => {
                        setCreatorName(e.target.value);
                        if (errors.creatorName) setErrors({ ...errors, creatorName: '' });
                      }}
                      placeholder="e.g. Maya Lin"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white placeholder-[#8E8EA0] text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
                    />
                    {errors.creatorName && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.creatorName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                      TikTok Username <span className="text-[#FF2A85]">*</span>
                    </label>
                    <input
                      type="text"
                      value={tiktokHandle}
                      onChange={(e) => {
                        setTiktokHandle(e.target.value);
                        if (errors.tiktokHandle) setErrors({ ...errors, tiktokHandle: '' });
                      }}
                      placeholder="@yourhandle"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white placeholder-[#8E8EA0] text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
                    />
                    {errors.tiktokHandle && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.tiktokHandle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Email & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                      Contact Email <span className="text-[#FF2A85]">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      placeholder="creator@email.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white placeholder-[#8E8EA0] text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                      Content Category <span className="text-[#FF2A85]">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
                    >
                      <option value="Dance & Choreography">Dance & Choreography</option>
                      <option value="Fashion & Style">Fashion & Style</option>
                      <option value="Music & Sounds">Music & Sounds</option>
                      <option value="Comedy & POV">Comedy & POV</option>
                      <option value="Fitness & Active">Fitness & Active</option>
                      <option value="Creative Arts & FX">Creative Arts & FX</option>
                    </select>
                  </div>
                </div>

                {/* Video Title & Description */}
                <div>
                  <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                    Video Title <span className="text-[#FF2A85]">*</span>
                  </label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => {
                      setVideoTitle(e.target.value);
                      if (errors.videoTitle) setErrors({ ...errors, videoTitle: '' });
                    }}
                    placeholder="e.g. Midnight Floorwork & Precision Flow"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white placeholder-[#8E8EA0] text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
                  />
                  {errors.videoTitle && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.videoTitle}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                    Video Description (Optional)
                  </label>
                  <textarea
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    placeholder="Short description of choreography, audio stings, or styling details..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white placeholder-[#8E8EA0] text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
                  />
                </div>

                {/* Media Input Tabs: Video Upload vs Video URL */}
                <div className="p-4 rounded-2xl bg-[#181822] border border-white/10">
                  <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">
                      Video Source <span className="text-[#FF2A85]">*</span>
                    </span>
                    <div className="flex items-center gap-1 bg-[#121217] p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setMediaType('upload')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                          mediaType === 'upload' ? 'bg-[#FF2A85] text-white' : 'text-[#8E8EA0] hover:text-white'
                        }`}
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload File</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaType('url')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                          mediaType === 'url' ? 'bg-[#FF2A85] text-white' : 'text-[#8E8EA0] hover:text-white'
                        }`}
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>Video URL</span>
                      </button>
                    </div>
                  </div>

                  {mediaType === 'upload' ? (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      {uploadedFileMeta ? (
                        <div className="p-3.5 rounded-xl bg-[#121217] border border-emerald-500/30 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                              <Video className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-white truncate max-w-xs">
                                {uploadedFileMeta.name}
                              </div>
                              <div className="text-[10px] text-[#8E8EA0]">
                                {(uploadedFileMeta.sizeBytes / (1024 * 1024)).toFixed(2)} MB • Ready for review
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFileMeta(null);
                              setMediaUrl('');
                              setUploadProgress(0);
                            }}
                            className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                          >
                            Replace
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-white/10 hover:border-[#FF2A85]/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#121217]/50"
                        >
                          <div className="w-10 h-10 rounded-full bg-white/5 text-[#A1A1AA] flex items-center justify-center mx-auto mb-2">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div className="text-xs font-semibold text-white mb-0.5">
                            Click to select vertical video file
                          </div>
                          <p className="text-[11px] text-[#8E8EA0]">
                            Supported formats: MP4, WebM, MOV • Max size: 50MB
                          </p>
                        </div>
                      )}

                      {/* Upload Progress Bar */}
                      {isUploading && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-[#A1A1AA] mb-1">
                            <span>Uploading video to secure storage...</span>
                            <span className="font-mono">{uploadProgress}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#121217] overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#FF2A85] to-[#D90368] transition-all duration-150"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {uploadError && (
                        <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{uploadError}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        value={mediaUrl}
                        onChange={(e) => {
                          setMediaUrl(e.target.value);
                          if (errors.mediaUrl) setErrors({ ...errors, mediaUrl: '' });
                        }}
                        placeholder="https://www.tiktok.com/@yourhandle/video/..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-white/10 text-white placeholder-[#8E8EA0] text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
                      />
                      <p className="text-[11px] text-[#8E8EA0] mt-1.5">
                        Direct public link to the video on your official verified TikTok account.
                      </p>
                    </div>
                  )}

                  {errors.mediaUrl && (
                    <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{errors.mediaUrl}</span>
                    </p>
                  )}
                </div>

                {/* Mandatory Legal & Governance Checkboxes */}
                <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                  <label className="flex items-start gap-3 cursor-pointer p-3.5 rounded-xl bg-[#181822]/80 border border-white/5 hover:border-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={confirmedOwnership}
                      onChange={(e) => {
                        setConfirmedOwnership(e.target.checked);
                        if (errors.confirmedOwnership) setErrors({ ...errors, confirmedOwnership: '' });
                      }}
                      className="mt-0.5 w-4 h-4 rounded text-[#FF2A85] accent-[#FF2A85] focus:ring-0 focus:ring-offset-0 bg-[#09090C]"
                    />
                    <div className="text-xs text-[#A1A1AA] leading-normal">
                      <strong className="text-white">Copyright Ownership & Permission: </strong>
                      I confirm I hold full copyright or explicit author permission to submit this video.
                    </div>
                  </label>
                  {errors.confirmedOwnership && (
                    <p className="text-xs text-rose-400 pl-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.confirmedOwnership}
                    </p>
                  )}

                  <label className="flex items-start gap-3 cursor-pointer p-3.5 rounded-xl bg-[#181822]/80 border border-white/5 hover:border-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={confirmedAdult18}
                      onChange={(e) => {
                        setConfirmedAdult18(e.target.checked);
                        if (errors.confirmedAdult18) setErrors({ ...errors, confirmedAdult18: '' });
                      }}
                      className="mt-0.5 w-4 h-4 rounded text-[#FF2A85] accent-[#FF2A85] focus:ring-0 focus:ring-offset-0 bg-[#09090C]"
                    />
                    <div className="text-xs text-[#A1A1AA] leading-normal">
                      <strong className="text-white">Strict Age Verification (18+ Mandatory): </strong>
                      I certify that the person featured is at least 18 years old and can verify identity prior to syndication.
                    </div>
                  </label>
                  {errors.confirmedAdult18 && (
                    <p className="text-xs text-rose-400 pl-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.confirmedAdult18}
                    </p>
                  )}

                  <label className="flex items-start gap-3 cursor-pointer p-3.5 rounded-xl bg-[#181822]/80 border border-white/5 hover:border-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={acceptedTerms && acceptedPrivacy}
                      onChange={(e) => {
                        setAcceptedTerms(e.target.checked);
                        setAcceptedPrivacy(e.target.checked);
                        if (errors.terms) setErrors({ ...errors, terms: '' });
                      }}
                      className="mt-0.5 w-4 h-4 rounded text-[#FF2A85] accent-[#FF2A85] focus:ring-0 focus:ring-offset-0 bg-[#09090C]"
                    />
                    <div className="text-xs text-[#A1A1AA] leading-normal">
                      <strong className="text-white">Publication Consent & Terms: </strong>
                      I grant ONLYTOK permission for specified promotional syndication on @onlytokgirls with full attribution and accept the Terms & Privacy Notice.
                    </div>
                  </label>
                  {errors.terms && (
                    <p className="text-xs text-rose-400 pl-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.terms}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="w-full py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#FF2A85] to-[#D90368] hover:from-[#ff3d93] hover:to-[#eb0c75] shadow-lg shadow-[#FF2A85]/20 hover:shadow-[#FF2A85]/35 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? 'Submitting to Review Queue...' : 'Submit to Moderation Queue (18+)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-[#8E8EA0] text-center">
                  Protected by automated rate limiting • No uncredited reposting • Review queue takes ~24h
                </p>
              </form>
            )}

          </div>
        </div>

        {/* Right Column: Tracking & Standards */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Tracker Card: Track Existing Application */}
          <div className="p-6 rounded-3xl bg-[#121217] border border-white/[0.08]">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#FF2A85] mb-2">
              <Search className="w-3.5 h-3.5" />
              <span>Submission Status Lookup</span>
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2">
              Track Your Application
            </h3>
            <p className="text-xs text-[#A1A1AA] mb-4">
              Enter your reference code to check whether your video has been reviewed or if corrections are required.
            </p>

            <form onSubmit={handleTrackSubmission} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  placeholder="e.g. OT-CR-2026-B4CB"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white placeholder-[#8E8EA0] text-xs font-mono focus:outline-none focus:border-[#FF2A85] uppercase transition-colors"
                />
                <button
                  type="submit"
                  disabled={isTracking || !trackCode.trim()}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#181822] hover:bg-[#222230] border border-white/10 transition-colors disabled:opacity-50"
                >
                  {isTracking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Check'}
                </button>
              </div>

              {trackError && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{trackError}</span>
                </p>
              )}

              {trackResult && (
                <div className="p-4 rounded-2xl bg-[#181822] border border-white/10 mt-3 animate-in fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-[#FF2A85] font-bold">
                      {trackResult.referenceCode}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        trackResult.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : trackResult.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400'
                          : trackResult.status === 'correction_requested'
                          ? 'bg-sky-500/20 text-sky-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {trackResult.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-white font-medium mb-1 truncate">
                    {trackResult.videoTitle}
                  </div>
                  <div className="text-[11px] text-[#8E8EA0]">
                    Handle: {trackResult.tiktokHandle} • Category: {trackResult.category}
                  </div>

                  {trackResult.moderationNotes && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs">
                      <strong>Editorial Feedback: </strong>
                      {trackResult.moderationNotes}
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Workflow Guide */}
          <div className="p-6 rounded-3xl bg-[#121217] border border-white/[0.08]">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#FF2A85] mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Review Process</span>
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-4">
              What Happens After You Apply?
            </h3>
            
            <ol className="space-y-4 text-xs text-[#A1A1AA]">
              <li className="flex items-start gap-3">
                <span className="font-mono text-[#FF2A85] font-bold">01.</span>
                <div>
                  <strong className="text-white block mb-0.5">Secure File Ingestion</strong>
                  Uploaded video files and metadata enter the encrypted moderation queue.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-mono text-[#FF2A85] font-bold">02.</span>
                <div>
                  <strong className="text-white block mb-0.5">18+ Identity & Audio Clearance</strong>
                  Editors verify applicant adulthood and ensure no unlicensed audio conflicts.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-mono text-[#FF2A85] font-bold">03.</span>
                <div>
                  <strong className="text-white block mb-0.5">Approval & Syndication</strong>
                  Approved videos go live on the Discover feed and official TikTok channel.
                </div>
              </li>
            </ol>
          </div>

          <div className="p-6 rounded-3xl bg-[#121217] border border-white/[0.08]">
            <h4 className="font-display font-bold text-white text-base mb-2">
              Creator Rights Covenant
            </h4>
            <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
              You retain 100% intellectual property ownership of your work. Content can be unpublished at any time through our takedown desk.
            </p>
            <div className="text-[11px] font-mono text-[#8E8EA0] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Trust Governance & Privacy Compliant</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
