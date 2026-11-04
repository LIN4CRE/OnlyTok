import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2, Send, Loader2, Flag } from 'lucide-react';
import { useApiAvailability } from '../../lib/api';
import { ApiUnavailableNotice } from '../common/ApiUnavailableNotice';

interface ReportContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetVideo?: {
    id: string;
    title: string;
    creatorName?: string;
    tiktokHandle?: string;
    referenceCode?: string;
  } | null;
}

export const ReportContentModal: React.FC<ReportContentModalProps> = ({
  isOpen,
  onClose,
  targetVideo,
}) => {
  const [reportType, setReportType] = useState<string>('age_verification');
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterEmail, setReporterEmail] = useState<string>('');
  const [reporterAffiliation, setReporterAffiliation] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [evidenceUrl, setEvidenceUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { available: apiAvailable } = useApiAvailability();

  if (!isOpen) return null;

  const isCritical = ['ncii_report', 'age_verification'].includes(reportType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!reporterName.trim() || !reporterEmail.trim() || !details.trim()) {
      setErrorMsg('Please complete all required fields.');
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
          targetId: targetVideo?.id || 'unspecified',
          targetTitle: targetVideo?.title || 'Reported Video Placement',
          reporterName: reporterName.trim(),
          reporterEmail: reporterEmail.trim(),
          reporterAffiliation: reporterAffiliation.trim(),
          details: details.trim(),
          evidenceUrl: evidenceUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to file report.');
      }

      setSuccessCode(data.referenceCode);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessCode(null);
    setReporterName('');
    setReporterEmail('');
    setDetails('');
    setEvidenceUrl('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-[#121217] border border-white/10 shadow-2xl p-6 sm:p-8 space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 id="report-modal-title" className="font-display font-bold text-base text-white">
                Report Inappropriate Content / Safety Notice
              </h3>
              <p className="text-[11px] text-[#8E8EA0]">
                Expedited Moderation & Safety Desk
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-[#8E8EA0] hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            aria-label="Close report modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {targetVideo && (
          <div className="p-3 rounded-xl bg-[#09090C] border border-white/5 text-xs text-[#8E8EA0] space-y-0.5">
            <div>Reporting Video: <strong className="text-white">{targetVideo.title}</strong></div>
            {targetVideo.creatorName && (
              <div>Creator: <span className="text-[#FF2A85]">{targetVideo.creatorName} ({targetVideo.tiktokHandle})</span></div>
            )}
          </div>
        )}

        {apiAvailable === false ? (
          <ApiUnavailableNotice feature="Content reports" contactEmail="legal@onlytok.com" compact />
        ) : successCode ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Notice Officially Queued for Immediate Review</span>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed">
                Thank you for helping keep ONLYTOK safe. Your report has been dispatched to our human compliance officers. Critical safety notices (including minor protection and NCII) are prioritized for immediate review.
              </p>
              <div className="pt-2">
                <span className="text-[#8E8EA0] block text-[10px]">Reference Tracking Code:</span>
                <span className="font-mono font-bold text-white text-sm bg-black/40 px-2.5 py-1 rounded inline-block mt-0.5 border border-white/10">
                  {successCode}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-[#181822] hover:bg-[#222230] text-white font-semibold text-xs cursor-pointer border border-white/10"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                {errorMsg}
              </div>
            )}

            <div>
              <label htmlFor="report-reason-select" className="block text-[#8E8EA0] mb-1 font-medium">Primary Reason for Report *</label>
              <select
                id="report-reason-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#FF2A85]"
              >
                <option value="age_verification">Under-18 / Minor Safety Flag (Critical Immediate Review)</option>
                <option value="ncii_report">Non-Consensual Intimate Imagery (NCII) (Critical Immediate Review)</option>
                <option value="unauthorized_repost">Unauthorized Repost / Stolen Creator Content</option>
                <option value="copyright_dmca">Copyright / Intellectual Property Infringement</option>
                <option value="inappropriate_content">Sexually Explicit / Adult Content Violation</option>
                <option value="rights_dispute">Creator Consent Withdrawal / Takedown</option>
                <option value="defamation">Defamation / Harassment / Other Harm</option>
              </select>
            </div>

            {isCritical && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                <span>
                  High Priority: This report triggers an expedited human review within 6 hours.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="report-reporter-name" className="block text-[#8E8EA0] mb-1 font-medium">Your Name *</label>
                <input
                  id="report-reporter-name"
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#FF2A85]"
                />
              </div>

              <div>
                <label htmlFor="report-reporter-email" className="block text-[#8E8EA0] mb-1 font-medium">Your Email *</label>
                <input
                  id="report-reporter-email"
                  type="email"
                  required
                  placeholder="e.g. jane@domain.com"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#FF2A85]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="report-affiliation" className="block text-[#8E8EA0] mb-1 font-medium">Your Relationship to Content (Optional)</label>
              <input
                id="report-affiliation"
                type="text"
                placeholder="e.g. Original Creator, Rightsholder, Viewer"
                value={reporterAffiliation}
                onChange={(e) => setReporterAffiliation(e.target.value)}
                className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#FF2A85]"
              />
            </div>

            <div>
              <label htmlFor="report-description" className="block text-[#8E8EA0] mb-1 font-medium">
                Detailed Explanation *
              </label>
              <textarea
                id="report-description"
                required
                rows={3}
                placeholder="Please describe why this video violates our standards or explain the rights violation..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-[#09090C] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#FF2A85] resize-none"
              />
            </div>

            <div>
              <label htmlFor="report-evidence-link" className="block text-[#8E8EA0] mb-1 font-medium">Link to Original Source / Proof (Optional)</label>
              <input
                id="report-evidence-link"
                type="url"
                placeholder="https://..."
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#FF2A85]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-[#8E8EA0] hover:text-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-rose-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
