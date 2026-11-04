import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Trash2, FileText, CheckCircle2, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { useApiAvailability } from '../../lib/api';
import { ApiUnavailableNotice } from '../common/ApiUnavailableNotice';

interface GDPRDataRightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GDPRDataRightsModal: React.FC<GDPRDataRightsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [requestType, setRequestType] = useState<string>('erasure_deletion');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { available: apiAvailable } = useApiAvailability();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !email.trim() || !details.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/privacy/gdpr-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          requestType,
          details: details.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit privacy request.');
      }

      setSuccessCode(data.referenceCode);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error recording data rights request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessCode(null);
    setFullName('');
    setEmail('');
    setDetails('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gdpr-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-[#121217] border border-white/10 shadow-2xl p-6 sm:p-8 space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF2A85] to-[#7928CA] flex items-center justify-center text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 id="gdpr-modal-title" className="font-display font-bold text-base text-white">
                Exercise UK GDPR Data Rights
              </h3>
              <p className="text-[11px] text-[#8E8EA0]">
                Statutory Data Protection Act 2018 Request Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-[#8E8EA0] hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {apiAvailable === false ? (
          <ApiUnavailableNotice feature="GDPR data rights requests" contactEmail="privacy@onlytok.com" compact />
        ) : successCode ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Statutory Request Logged Successfully</span>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed">
                Your request has been officially logged in our compliance register. In accordance with Section 54 of the UK Data Protection Act 2018, we will verify your identity and fulfill your request within one calendar month.
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
              <label htmlFor="gdpr-request-type" className="block text-[#8E8EA0] mb-1 font-medium">Right to Exercise *</label>
              <select
                id="gdpr-request-type"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#FF2A85]"
              >
                <option value="erasure_deletion">Right to Erasure ("Right to be Forgotten" - Art 17)</option>
                <option value="subject_access_request">Subject Access Request (SAR - Copy of personal data - Art 15)</option>
                <option value="withdraw_consent">Withdraw Promotional Syndication Consent</option>
                <option value="rectification">Rectification of Inaccurate Personal Information (Art 16)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="gdpr-full-name" className="block text-[#8E8EA0] mb-1 font-medium">Your Full Legal Name *</label>
                <input
                  id="gdpr-full-name"
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#FF2A85]"
                />
              </div>

              <div>
                <label htmlFor="gdpr-email-address" className="block text-[#8E8EA0] mb-1 font-medium">Account / Contact Email *</label>
                <input
                  id="gdpr-email-address"
                  type="email"
                  required
                  placeholder="e.g. alex@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#FF2A85]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="gdpr-details-field" className="block text-[#8E8EA0] mb-1 font-medium">
                Scope & Details of Request *
              </label>
              <textarea
                id="gdpr-details-field"
                required
                rows={3}
                placeholder="Specify the creator submissions, email records, or specific details you wish erased or exported..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-[#09090C] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#FF2A85] resize-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#09090C] border border-white/5 text-[11px] text-[#8E8EA0] space-y-1">
              <div className="font-semibold text-white">UK Legal Safeguard:</div>
              <p>
                To prevent fraudulent deletion or unlawful disclosure, we may request reasonable proof of identity before executing erasure or data disclosure.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-[#8E8EA0] hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#FF2A85] hover:bg-[#ff3d93] text-white font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-[#FF2A85]/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Formal Request</span>
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
