import React, { useState } from 'react';
import { X, ShieldCheck, Lock, AlertTriangle, FileText, CheckCircle2, Send, Loader2 } from 'lucide-react';
import { useApiAvailability } from '../../lib/api';
import { ApiUnavailableNotice } from '../common/ApiUnavailableNotice';

interface ComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'age' | 'rights' | 'privacy' | 'takedown';
}

export const ComplianceModal: React.FC<ComplianceModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'age',
}) => {
  const [activeTab, setActiveTab] = useState<'age' | 'rights' | 'privacy' | 'takedown'>(initialTab);

  // Takedown / Copyright form state
  const [showTakedownForm, setShowTakedownForm] = useState<boolean>(false);
  const [reportType, setReportType] = useState<string>('copyright_dmca');
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterEmail, setReporterEmail] = useState<string>('');
  const [reporterAffiliation, setReporterAffiliation] = useState<string>('');
  const [targetTitle, setTargetTitle] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [evidenceUrl, setEvidenceUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccessCode, setSubmitSuccessCode] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { available: apiAvailable } = useApiAvailability();

  if (!isOpen) return null;

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!reporterName.trim() || !reporterEmail.trim() || !details.trim()) {
      setSubmitError('Please complete all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          targetType: 'published_video',
          targetTitle: targetTitle.trim() || 'Urgent Takedown / DMCA Notice',
          reporterName: reporterName.trim(),
          reporterEmail: reporterEmail.trim(),
          reporterAffiliation: reporterAffiliation.trim(),
          details: details.trim(),
          evidenceUrl: evidenceUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit removal notice.');
      }

      setSubmitSuccessCode(data.referenceCode);
    } catch (err: any) {
      setSubmitError(err.message || 'Error recording takedown notice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#121217] border border-white/10 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08] bg-[#09090C]/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF2A85] to-[#7928CA] flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white leading-tight">
                Governance, Legal & Compliance
              </h3>
              <p className="text-xs text-[#8E8EA0] mt-0.5">
                ONLYTOK Operating Standards & Safeguards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#8E8EA0] hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close Compliance Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-2 p-2 px-6 bg-[#09090C]/40 border-b border-white/5 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setActiveTab('age')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'age' ? 'bg-[#FF2A85] text-white' : 'text-[#8E8EA0] hover:text-white'
            }`}
          >
            18+ Age Policy
          </button>
          <button
            onClick={() => setActiveTab('rights')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'rights' ? 'bg-[#FF2A85] text-white' : 'text-[#8E8EA0] hover:text-white'
            }`}
          >
            Rights & Releases
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'privacy' ? 'bg-[#FF2A85] text-white' : 'text-[#8E8EA0] hover:text-white'
            }`}
          >
            Privacy & GDPR
          </button>
          <button
            onClick={() => setActiveTab('takedown')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'takedown' ? 'bg-[#FF2A85] text-white' : 'text-[#8E8EA0] hover:text-white'
            }`}
          >
            Removal & DMCA
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-[#A1A1AA] leading-relaxed flex-1">
          {activeTab === 'age' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-[#FF2A85]" />
                <span>Strict 18+ Creator Eligibility & Verification</span>
              </div>
              <p>
                ONLYTOK operates with zero tolerance for the syndication, distribution, or promotion of minors. Every individual appearing on the platform must be at least 18 years of age at the time of video production.
              </p>
              <div className="p-4 rounded-xl bg-[#181822] border border-white/5 text-xs space-y-2">
                <div className="text-white font-semibold">Verification Protocols:</div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Mandatory self-certification checkbox required on every submission.</li>
                  <li>Administrative cross-checking of verified TikTok accounts and external linked profiles.</li>
                  <li>Immediate removal of any video flagged with questionable age verification pending official identification review.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'rights' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <FileText className="w-5 h-5 text-[#FF2A85]" />
                <span>Copyright Ownership & Syndication Releases</span>
              </div>
              <p>
                ONLYTOK is a curated spotlight platform. We do not claim ownership of creator original works.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li><strong className="text-white">Non-Exclusive License:</strong> Creators grant ONLYTOK a non-exclusive, revocable worldwide license to display, promote, and syndicate their authorized video content.</li>
                <li><strong className="text-white">Attribution Guarantee:</strong> We prominently credit the creator's verified TikTok handle, name, and profile link on every placement.</li>
                <li><strong className="text-white">Commercial Rights:</strong> We will never sell, license, or sub-license creator footage to third-party commercial advertisers without a separate explicit written contract.</li>
              </ul>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Lock className="w-5 h-5 text-[#FF2A85]" />
                <span>Data Protection & Confidentiality</span>
              </div>
              <p>
                In compliance with international data privacy standards and UK GDPR principles:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li>We only collect essential contact information (full name, email, public TikTok handle) strictly necessary to process creator submissions or brand inquiries.</li>
                <li>Private contact details are never published, sold, or shared with third-party advertisers.</li>
                <li>All application records are securely encrypted and retained only for the duration of the feature agreement.</li>
              </ul>
            </div>
          )}

          {activeTab === 'takedown' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-[#FF2A85]" />
                <span>Rapid Creator Takedown & Consent Revocation</span>
              </div>
              <p>
                Creators and copyright owners have the sovereign right to withdraw consent or request content removal at any time.
              </p>

              {apiAvailable === false ? (
                <ApiUnavailableNotice feature="Takedown notices" contactEmail="legal@onlytok.com" compact />
              ) : submitSuccessCode ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Removal Notice Officially Filed</span>
                  </div>
                  <p className="text-xs">
                    Your reference tracking code is: <span className="font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded">{submitSuccessCode}</span>
                  </p>
                  <p className="text-xs text-[#A1A1AA]">
                    Our legal and moderation desk reviews incoming notices immediately. Any verified infringement will be removed within 24 hours.
                  </p>
                </div>
              ) : showTakedownForm ? (
                <form onSubmit={handleSubmitReport} className="p-4 rounded-xl bg-[#181822] border border-white/10 space-y-3 text-xs">
                  <div className="font-bold text-white text-sm">Submit Removal / DMCA Notice</div>

                  {submitError && (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                      {submitError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#8E8EA0] mb-1 font-medium">Claim Type *</label>
                      <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full bg-[#09090C] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#FF2A85]"
                      >
                        <option value="copyright_dmca">Copyright / DMCA Infringement</option>
                        <option value="rights_dispute">Creator Consent Revocation / Takedown</option>
                        <option value="age_verification">Age Verification / Safety Challenge</option>
                        <option value="inappropriate_content">Content Guidelines Concern</option>
                        <option value="other">Other Legal Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#8E8EA0] mb-1 font-medium">Target Video / Creator Reference</label>
                      <input
                        type="text"
                        placeholder="e.g. Video title, link, or reference code"
                        value={targetTitle}
                        onChange={(e) => setTargetTitle(e.target.value)}
                        className="w-full bg-[#09090C] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#FF2A85]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#8E8EA0] mb-1 font-medium">Your Full Legal Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jane Doe"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        className="w-full bg-[#09090C] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#FF2A85]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#8E8EA0] mb-1 font-medium">Your Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. legal@domain.com"
                        value={reporterEmail}
                        onChange={(e) => setReporterEmail(e.target.value)}
                        className="w-full bg-[#09090C] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#FF2A85]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#8E8EA0] mb-1 font-medium">Affiliation or Authority</label>
                    <input
                      type="text"
                      placeholder="e.g. Self / Original Creator, Attorney, Authorized Agent"
                      value={reporterAffiliation}
                      onChange={(e) => setReporterAffiliation(e.target.value)}
                      className="w-full bg-[#09090C] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#FF2A85]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8E8EA0] mb-1 font-medium">Specific Reason & Detailed Description *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Please specify why this video should be removed or explain the ownership dispute..."
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="w-full bg-[#09090C] border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-[#FF2A85] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8E8EA0] mb-1 font-medium">Link to Original Work or Evidence (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      className="w-full bg-[#09090C] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#FF2A85]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setShowTakedownForm(false)}
                      className="text-[#8E8EA0] hover:text-white"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-lg bg-[#FF2A85] hover:bg-[#ff3d93] text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Filing...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Official Notice</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-[#181822] border border-white/5 text-xs space-y-3">
                  <div className="text-white font-semibold">Takedown Desk:</div>
                  <p>
                    All verified removal notices are prioritized and executed within 24 hours by our human compliance officer.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      onClick={() => setShowTakedownForm(true)}
                      className="px-3.5 py-2 rounded-lg bg-[#FF2A85] hover:bg-[#ff3d93] text-white font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>File Online Removal Notice</span>
                    </button>
                    <a
                      href="mailto:legal@onlytok.com?subject=URGENT%20TAKEDOWN%20REQUEST"
                      className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors text-center"
                    >
                      Email: legal@onlytok.com
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-white/[0.08] bg-[#09090C]/60 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#181822] hover:bg-[#222230] border border-white/10 transition-colors cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
};
