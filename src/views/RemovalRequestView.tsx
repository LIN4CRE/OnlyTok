/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileWarning,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  Lock,
  Clock,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { useApiAvailability } from '../lib/api';
import { ApiUnavailableNotice } from '../components/common/ApiUnavailableNotice';

export const RemovalRequestView: React.FC = () => {
  const { available: apiAvailable } = useApiAvailability();
  const [reportType, setReportType] = useState<string>('copyright_dmca');
  const [targetTitle, setTargetTitle] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterEmail, setReporterEmail] = useState<string>('');
  const [reporterAffiliation, setReporterAffiliation] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [evidenceUrl, setEvidenceUrl] = useState<string>('');
  const [swornDeclaration, setSwornDeclaration] = useState<boolean>(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [resultCode, setResultCode] = useState<string | null>(null);
  const [resultUrgency, setResultUrgency] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isCritical = ['ncii_report', 'age_verification'].includes(reportType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!reporterName.trim() || !reporterEmail.trim() || !details.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (!swornDeclaration) {
      setErrorMessage('You must certify the statutory declaration of good faith.');
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
          targetId: targetId.trim() || 'unspecified',
          targetTitle: targetTitle.trim() || 'Content Removal Request',
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

      setResultCode(data.referenceCode);
      setResultUrgency(data.urgency || (isCritical ? 'CRITICAL_SAFETY' : 'STANDARD'));
    } catch (err: any) {
      setErrorMessage(err.message || 'Error recording takedown notice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setResultCode(null);
    setResultUrgency(null);
    setTargetTitle('');
    setTargetId('');
    setReporterName('');
    setReporterEmail('');
    setReporterAffiliation('');
    setDetails('');
    setEvidenceUrl('');
    setSwornDeclaration(false);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#14141B] via-[#121217] to-[#14141B] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Expedited Rights & Takedown Desk</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Content Removal Request Portal
          </h1>

          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-2xl">
            ONLYTOK takes copyright infringement, creator consent revocation, and child safety with utmost gravity. Use this official portal to file a formal takedown notice under UK law (CDPA 1988) and international DMCA frameworks.
          </p>
        </div>
      </div>

      {/* Statutory Guidance Notice */}
      <div className="p-4 rounded-2xl bg-[#121217] border border-white/10 flex items-start gap-3 text-xs text-[#8E8EA0]">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-white block font-semibold">UK Legal Notice & Fair Notice Advisory:</strong>
          <p className="text-[11px] leading-relaxed">
            Filing a false or knowingly misleading notice of infringement may expose the claimant to liability for damages under Section 97A of the UK Copyright, Designs and Patents Act 1988 and Section 512(f) of the DMCA. Please ensure your claims are accurate and substantiated.
          </p>
        </div>
      </div>

      {apiAvailable === false ? (
        <ApiUnavailableNotice feature="Removal requests" contactEmail="legal@onlytok.com" />
      ) : resultCode ? (
        <div className="p-8 rounded-3xl bg-[#121217] border border-white/10 shadow-2xl space-y-6 text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {resultUrgency === 'CRITICAL_SAFETY' ? 'Critical Notice Dispatched' : 'Takedown Notice Logged'}
            </span>
            <h2 className="font-display font-extrabold text-2xl text-white">
              Notice Officially Queued for Review
            </h2>
            <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-md mx-auto">
              Your formal request has entered our automated legal moderation queue and an immutable audit record has been generated.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 text-xs space-y-1.5 max-w-md mx-auto">
            <span className="text-[#8E8EA0] block text-[11px]">Official Reference Code:</span>
            <span className="font-mono font-bold text-white text-base bg-black/60 px-3 py-1 rounded border border-white/10 inline-block">
              {resultCode}
            </span>
            <div className="text-[11px] text-[#8E8EA0] pt-1">
              Please quote this reference code in any subsequent correspondence with our legal team.
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#181822] border border-white/5 text-xs text-left space-y-2 max-w-md mx-auto">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#FF2A85]" />
              <span>Response Timelines:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[#A1A1AA] text-[11px]">
              <li>Child Safety & NCII Reports: Expedited review within <strong>6 hours</strong>.</li>
              <li>Copyright / DMCA Notices: Formal action within <strong>24 hours</strong>.</li>
              <li>Creator Consent Withdrawals: Removed within <strong>24 hours</strong>.</li>
            </ul>
          </div>

          <button
            onClick={resetForm}
            className="px-6 py-2.5 rounded-xl bg-[#181822] hover:bg-[#222230] text-white font-semibold text-xs border border-white/10 cursor-pointer"
          >
            Submit Another Notice
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-[#121217] border border-white/10 shadow-2xl space-y-6 text-xs text-[#A1A1AA]">
          <div className="border-b border-white/5 pb-4">
            <h2 className="font-display font-bold text-lg text-white">
              Expedited Removal Form
            </h2>
            <p className="text-xs text-[#8E8EA0] mt-0.5">
              All submissions are timestamped and assigned to a human compliance officer.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              {errorMessage}
            </div>
          )}

          {/* Claim Category */}
          <div className="space-y-1.5">
            <label className="block text-white font-semibold">
              Infringement / Removal Category *
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-[#09090C] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FF2A85] text-xs"
            >
              <option value="copyright_dmca">
                Copyright / DMCA Infringement (UK CDPA 1988)
              </option>
              <option value="rights_dispute">
                Creator Consent Withdrawal / Takedown Request
              </option>
              <option value="age_verification">
                Minor / Under-18 Participation Flag (High-Priority Safety Review)
              </option>
              <option value="ncii_report">
                Non-Consensual Intimate Imagery (NCII) (High-Priority Safety Review)
              </option>
              <option value="unauthorized_repost">
                Unauthorized Repost / Stolen Creator Footage
              </option>
              <option value="inappropriate_content">
                Sexually Explicit / Adult Content Violation
              </option>
              <option value="defamation">
                Defamation / Harassment / Privacy Invasion
              </option>
              <option value="other">
                Other Formal Legal Challenge
              </option>
            </select>
          </div>

          {isCritical && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-white">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Urgent Safety Classification Active</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                This report type triggers an immediate escalation protocol for expedited human review within 6 hours. Content flagged with suspected minors or non-consensual material is quarantined pending verification.
              </p>
            </div>
          )}

          {/* Target Content Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8E8EA0] mb-1 font-medium">
                Video Title or Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Midnight Floorwork & Precision Flow"
                value={targetTitle}
                onChange={(e) => setTargetTitle(e.target.value)}
                className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#FF2A85]"
              />
            </div>

            <div>
              <label className="block text-[#8E8EA0] mb-1 font-medium">
                Video Reference Code or URL (If known)
              </label>
              <input
                type="text"
                placeholder="e.g. OT-CR-2026-C9CC or URL"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#FF2A85]"
              />
            </div>
          </div>

          {/* Claimant Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8E8EA0] mb-1 font-medium">
                Your Full Legal Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Christopher Nolan"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#FF2A85]"
              />
            </div>

            <div>
              <label className="block text-[#8E8EA0] mb-1 font-medium">
                Contact Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. legal@domain.co.uk"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#FF2A85]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#8E8EA0] mb-1 font-medium">
              Legal Capacity or Authority *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Original Copyright Owner, Self (Featured Individual), Authorized Legal Counsel"
              value={reporterAffiliation}
              onChange={(e) => setReporterAffiliation(e.target.value)}
              className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#FF2A85]"
            />
          </div>

          {/* Explanation of Infringement */}
          <div>
            <label className="block text-[#8E8EA0] mb-1 font-medium">
              Detailed Grounds for Removal *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Please provide full details of your ownership, how the video infringes your rights, or why it violates safety guidelines..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-[#09090C] border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-[#FF2A85] resize-none"
            />
          </div>

          {/* Evidence Link */}
          <div>
            <label className="block text-[#8E8EA0] mb-1 font-medium">
              Link to Original Authorised Work or Supporting Evidence
            </label>
            <input
              type="url"
              placeholder="https://tiktok.com/@... or link to registered trademark/copyright"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#FF2A85]"
            />
          </div>

          {/* Sworn Statutory Certification */}
          <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={swornDeclaration}
                onChange={(e) => setSwornDeclaration(e.target.checked)}
                className="accent-[#FF2A85] w-4 h-4 rounded mt-0.5 shrink-0"
              />
              <span className="text-[11px] text-[#A1A1AA] leading-relaxed">
                <strong className="text-white">Statutory Good Faith Declaration:</strong> I state under penalty of perjury under the laws of England and Wales and 17 U.S.C. § 512 that I have a good-faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law, and that the information in this notification is accurate.
              </span>
            </label>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-[#8E8EA0]">
              Direct Email Alternative:{' '}
              <a href="mailto:legal@onlytok.com" className="text-white hover:underline font-mono">
                legal@onlytok.com
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-[#FF2A85] hover:from-rose-600 hover:to-[#ff3d93] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging Notice...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Execute Formal Takedown Notice</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
