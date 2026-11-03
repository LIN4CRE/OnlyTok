import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, AlertCircle, Copy, Check, Sparkles, ArrowRight } from 'lucide-react';
import {
  CreatorSubmissionInput,
  validateCreatorSubmission,
  generateReferenceCode,
  normalizeTikTokHandle,
} from '../../utils/submissionValidator';

interface CreatorSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatorSubmissionModal: React.FC<CreatorSubmissionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<CreatorSubmissionInput>({
    fullName: '',
    creatorHandle: '',
    email: '',
    primaryCategory: 'Dance & Choreography',
    portfolioUrl: '',
    isConfirmed18Plus: false,
    hasConsentedToFeature: false,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = validateCreatorSubmission(formData);
    if (!result.isValid) {
      setErrors(result.errors);
      setIsSubmitting(false);
      return;
    }

    // Success: Generate reference code and show confirmation receipt
    setTimeout(() => {
      const refCode = generateReferenceCode('OT-CR');
      setSubmittedRef(refCode);
      setIsSubmitting(false);
    }, 400);
  };

  const handleCopyCode = () => {
    if (submittedRef) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(submittedRef).catch(() => {});
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      creatorHandle: '',
      email: '',
      primaryCategory: 'Dance & Choreography',
      portfolioUrl: '',
      isConfirmed18Plus: false,
      hasConsentedToFeature: false,
      notes: '',
    });
    setErrors({});
    setSubmittedRef(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#121217] border border-white/10 shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08] bg-[#09090C]/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF2A85] to-[#D90368] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white leading-tight">
                Creator Feature Application
              </h3>
              <p className="text-xs text-[#8E8EA0] mt-0.5">
                Spotlight on @onlytokgirls · Strictly 18+ Verified
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-[#8E8EA0] hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8">
          {submittedRef ? (
            /* Confirmation State */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#FF2A85]/10 border border-[#FF2A85]/30 text-[#FF2A85] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h4 className="font-display font-bold text-2xl text-white mb-2">
                Application Received
              </h4>
              <p className="text-sm text-[#A1A1AA] max-w-md mx-auto mb-6 leading-relaxed">
                Thank you for applying to ONLYTOK. Our editorial and compliance team will review your TikTok profile and verify 18+ documentation.
              </p>

              {/* Reference Box */}
              <div className="p-4 rounded-xl bg-[#181822] border border-white/10 max-w-md mx-auto mb-6 text-left">
                <div className="text-xs text-[#8E8EA0] uppercase tracking-wider mb-1 font-mono">
                  Application Tracking Reference
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-bold text-[#FF2A85]">
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
                <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-[#8E8EA0]">
                  Applicant: <strong className="text-white">{formData.fullName}</strong> ({normalizeTikTokHandle(formData.creatorHandle)})
                </div>
              </div>

              <button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="w-full py-3 rounded-xl font-bold text-sm text-white bg-[#181822] hover:bg-[#222230] border border-white/10 transition-colors"
              >
                Close & Return to Site
              </button>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Name & Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                    Full Legal Name / Stage Name <span className="text-[#FF2A85]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (errors.fullName) setErrors({ ...errors, fullName: '' });
                    }}
                    placeholder="e.g. Mia Evans"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white placeholder-[#8E8EA0] text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                    TikTok Handle <span className="text-[#FF2A85]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.creatorHandle}
                    onChange={(e) => {
                      setFormData({ ...formData, creatorHandle: e.target.value });
                      if (errors.creatorHandle) setErrors({ ...errors, creatorHandle: '' });
                    }}
                    placeholder="@yourhandle"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white placeholder-[#8E8EA0] text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
                  />
                  {errors.creatorHandle && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.creatorHandle}
                    </p>
                  )}
                </div>
              </div>

              {/* Email & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                    Contact Email <span className="text-[#FF2A85]">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    placeholder="creator@gmail.com"
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
                    value={formData.primaryCategory}
                    onChange={(e) => setFormData({ ...formData, primaryCategory: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
                  >
                    <option value="Dance & Choreography">Dance & Choreography</option>
                    <option value="Fashion & Aesthetics">Fashion & Aesthetics</option>
                    <option value="Music & Vocals">Music & Vocals</option>
                    <option value="Comedy & POV">Comedy & POV</option>
                    <option value="Fitness & Active">Fitness & Active</option>
                    <option value="Cosplay & Creative Arts">Cosplay & Creative Arts</option>
                  </select>
                </div>
              </div>

              {/* Specific Public Video URL */}
              <div>
                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                  Sample Video Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  placeholder="https://www.tiktok.com/@yourhandle/video/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white placeholder-[#8E8EA0] text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
                />
              </div>

              {/* Strict Age & Consent Affirmations */}
              <div className="space-y-3 pt-2 border-t border-white/[0.08]">
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-[#181822]/80 border border-white/5 hover:border-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isConfirmed18Plus}
                    onChange={(e) => {
                      setFormData({ ...formData, isConfirmed18Plus: e.target.checked });
                      if (errors.isConfirmed18Plus) setErrors({ ...errors, isConfirmed18Plus: '' });
                    }}
                    className="mt-0.5 w-4 h-4 rounded text-[#FF2A85] accent-[#FF2A85] focus:ring-0 focus:ring-offset-0 bg-[#09090C]"
                  />
                  <div className="text-xs text-[#A1A1AA] leading-normal">
                    <span className="font-bold text-white">Age Verification (18+ Mandatory): </span>
                    I affirm that I am at least 18 years of age and can produce government identification upon request before any content is syndicated.
                  </div>
                </label>
                {errors.isConfirmed18Plus && (
                  <p className="text-xs text-rose-400 pl-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.isConfirmed18Plus}
                  </p>
                )}

                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-[#181822]/80 border border-white/5 hover:border-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.hasConsentedToFeature}
                    onChange={(e) => {
                      setFormData({ ...formData, hasConsentedToFeature: e.target.checked });
                      if (errors.hasConsentedToFeature) setErrors({ ...errors, hasConsentedToFeature: '' });
                    }}
                    className="mt-0.5 w-4 h-4 rounded text-[#FF2A85] accent-[#FF2A85] focus:ring-0 focus:ring-offset-0 bg-[#09090C]"
                  />
                  <div className="text-xs text-[#A1A1AA] leading-normal">
                    <span className="font-bold text-white">Content Rights & Release Consent: </span>
                    I confirm I own or have legal rights to the submitted material and grant ONLYTOK permission to feature my profile handle and approved video content.
                  </div>
                </label>
                {errors.hasConsentedToFeature && (
                  <p className="text-xs text-rose-400 pl-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.hasConsentedToFeature}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#FF2A85] to-[#D90368] hover:from-[#ff3d93] hover:to-[#eb0c75] shadow-lg shadow-[#FF2A85]/20 hover:shadow-[#FF2A85]/35 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Validating Application...' : 'Submit Verified Application'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-[#8E8EA0] text-center leading-tight">
                No fees required. Submissions are reviewed for editorial fit, production standards, and age compliance.
              </p>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
