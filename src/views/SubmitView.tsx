import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  FileCheck,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  CreatorSubmissionInput,
  validateCreatorSubmission,
  generateReferenceCode,
  normalizeTikTokHandle,
} from '../utils/submissionValidator';

export const SubmitView: React.FC = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = validateCreatorSubmission(formData);
    if (!result.isValid) {
      setErrors(result.errors);
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      const refCode = generateReferenceCode('OT-CR');
      setSubmittedRef(refCode);
      setIsSubmitting(false);
    }, 400);
  };

  const handleCopyCode = () => {
    if (submittedRef) {
      navigator.clipboard.writeText(submittedRef);
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      
      {/* Page Header */}
      <div className="max-w-3xl mb-12">
        <div className="text-xs font-bold uppercase tracking-widest text-[#FF2A85] mb-2 font-mono flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Talent Submission Desk</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
          Submit Content to ONLYTOK.
        </h1>
        <p className="text-sm sm:text-base text-[#A1A1AA] mt-3 leading-relaxed">
          Are you a TikTok creator with original style, rhythm, or storytelling? Apply to have your video spotlighted on the official @onlytokgirls channel with direct profile attribution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Form Stage */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#121217] border border-white/[0.08] shadow-2xl relative overflow-hidden">
            
            {submittedRef ? (
              /* Success State */
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-[#FF2A85]/10 border border-[#FF2A85]/30 text-[#FF2A85] flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-8 h-8" />
                </div>

                <h3 className="font-display font-bold text-2xl text-white mb-2">
                  Application Successfully Registered
                </h3>
                <p className="text-sm text-[#A1A1AA] leading-relaxed mb-6 max-w-md mx-auto">
                  Your creator submission has been securely logged. Our editorial reviewers will examine your TikTok handle and confirm 18+ eligibility.
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
                  <div className="text-xs text-[#8E8EA0] border-t border-white/5 pt-2">
                    Applicant: <strong className="text-white">{formData.fullName}</strong> ({normalizeTikTokHandle(formData.creatorHandle)})
                  </div>
                </div>

                <button
                  onClick={resetForm}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#181822] hover:bg-[#222230] border border-white/10 transition-colors"
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              /* Submission Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                      Full Legal / Stage Name <span className="text-[#FF2A85]">*</span>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                      Contact Email Address <span className="text-[#FF2A85]">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
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
                      value={formData.primaryCategory}
                      onChange={(e) => setFormData({ ...formData, primaryCategory: e.target.value })}
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

                <div>
                  <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                    Sample TikTok Video URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    placeholder="https://www.tiktok.com/@yourhandle/video/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white placeholder-[#8E8EA0] text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
                  />
                  <p className="text-[11px] text-[#8E8EA0] mt-1">
                    Provide a link to a specific public video you would like considered for feature.
                  </p>
                </div>

                {/* Mandatory Checkboxes */}
                <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                  <label className="flex items-start gap-3 cursor-pointer p-3.5 rounded-xl bg-[#181822]/80 border border-white/5 hover:border-white/10 transition-colors">
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
                      <strong className="text-white">Strict Age Verification (18+ Required): </strong>
                      I certify that I am at least 18 years of age and can verify identity prior to syndication.
                    </div>
                  </label>
                  {errors.isConfirmed18Plus && (
                    <p className="text-xs text-rose-400 pl-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.isConfirmed18Plus}
                    </p>
                  )}

                  <label className="flex items-start gap-3 cursor-pointer p-3.5 rounded-xl bg-[#181822]/80 border border-white/5 hover:border-white/10 transition-colors">
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
                      <strong className="text-white">Content Rights & Release Agreement: </strong>
                      I confirm I own the copyright to the submitted content and grant ONLYTOK permission to syndicate my handle and video with full credit.
                    </div>
                  </label>
                  {errors.hasConsentedToFeature && (
                    <p className="text-xs text-rose-400 pl-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.hasConsentedToFeature}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#FF2A85] to-[#D90368] hover:from-[#ff3d93] hover:to-[#eb0c75] shadow-lg shadow-[#FF2A85]/20 hover:shadow-[#FF2A85]/35 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Validating Application...' : 'Submit Application (18+)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-[#8E8EA0] text-center">
                  100% Free · No Agency Lock-ins · Creator retains all intellectual property rights.
                </p>
              </form>
            )}

          </div>
        </div>

        {/* Right Column: Submission Standards & Rights Covenant */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="p-6 rounded-3xl bg-[#121217] border border-white/[0.08]">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#FF2A85] mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Covenant & Protections</span>
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-4">
              What Happens After You Apply?
            </h3>
            
            <ol className="space-y-4 text-xs text-[#A1A1AA]">
              <li className="flex items-start gap-3">
                <span className="font-mono text-[#FF2A85] font-bold">01.</span>
                <div>
                  <strong className="text-white block mb-0.5">Eligibility Check</strong>
                  Our team confirms TikTok handle ownership and 18+ legal age qualification.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-mono text-[#FF2A85] font-bold">02.</span>
                <div>
                  <strong className="text-white block mb-0.5">Curatorial Selection</strong>
                  Videos meeting production quality and audio synergy are scheduled for upcoming release batches.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-mono text-[#FF2A85] font-bold">03.</span>
                <div>
                  <strong className="text-white block mb-0.5">Syndication with Full Tagging</strong>
                  Your video is published on @onlytokgirls and tagged so new viewers land straight on your profile.
                </div>
              </li>
            </ol>
          </div>

          <div className="p-6 rounded-3xl bg-[#121217] border border-white/[0.08]">
            <h4 className="font-display font-bold text-white text-base mb-2">
              Creator Rights Guarantee
            </h4>
            <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
              You never give up ownership of your content. Takedown requests can be requested at any time by emailing legal@onlytok.com with your application reference code.
            </p>
            <div className="text-[11px] font-mono text-[#8E8EA0] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Compliant with UK GDPR & Digital Rights Guidelines</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
