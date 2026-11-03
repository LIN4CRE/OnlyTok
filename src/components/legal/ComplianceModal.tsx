import React, { useState } from 'react';
import { X, ShieldCheck, Lock, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#121217] border border-white/10 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08] bg-[#09090C]/60">
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
            className="text-[#8E8EA0] hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close Compliance Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-2 p-2 px-6 bg-[#09090C]/40 border-b border-white/5 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('age')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'age' ? 'bg-[#FF2A85] text-white' : 'text-[#8E8EA0] hover:text-white'
            }`}
          >
            18+ Age Policy
          </button>
          <button
            onClick={() => setActiveTab('rights')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'rights' ? 'bg-[#FF2A85] text-white' : 'text-[#8E8EA0] hover:text-white'
            }`}
          >
            Content Rights & Consent
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'privacy' ? 'bg-[#FF2A85] text-white' : 'text-[#8E8EA0] hover:text-white'
            }`}
          >
            Privacy & Data
          </button>
          <button
            onClick={() => setActiveTab('takedown')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'takedown' ? 'bg-[#FF2A85] text-white' : 'text-[#8E8EA0] hover:text-white'
            }`}
          >
            Takedown Request
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto space-y-4 text-sm text-[#A1A1AA] leading-relaxed">
          {activeTab === 'age' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-[#FF2A85]" />
                <span>Strict 18+ Eligibility Requirement</span>
              </div>
              <p>
                ONLYTOK maintains an absolute zero-tolerance standard regarding minor participation. Every individual featured on @onlytokgirls or within ONLYTOK branded media must be at least eighteen (18) years old at the time of publication.
              </p>
              <div className="p-4 rounded-xl bg-[#181822] border border-white/5 space-y-2 text-xs">
                <div className="font-bold text-white uppercase tracking-wider">Verification Protocol:</div>
                <ul className="list-disc pl-4 space-y-1 text-[#A1A1AA]">
                  <li>All applicants must confirm adult status in writing under legal penalty of misrepresentation.</li>
                  <li>Our compliance team performs secondary age verification before scheduling any public spotlight.</li>
                  <li>Any application with ambiguous or unverifiable age documentation is immediately rejected and permanently deleted.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'rights' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <FileText className="w-5 h-5 text-[#FF2A85]" />
                <span>Documented Consent & Intellectual Property</span>
              </div>
              <p>
                We believe creators must own their craft. ONLYTOK operates strictly by invitation and authorized creator application:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li><strong className="text-white">Full Attribution:</strong> All featured videos prominently link and tag the creator’s official TikTok username.</li>
                <li><strong className="text-white">Non-Exclusive License:</strong> Creators grant ONLYTOK a non-exclusive promotional license to share the specified work. The creator retains full ownership and commercial rights.</li>
                <li><strong className="text-white">Anti-Scraping Guarantee:</strong> We do not deploy bots or unauthorized scraping tools to aggregate creator media.</li>
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
                Creators have the sovereign right to withdraw consent at any time. If you were featured and would like your video spotlight removed from @onlytokgirls or onlytok.com:
              </p>
              <div className="p-4 rounded-xl bg-[#181822] border border-white/5 text-xs space-y-2">
                <div className="text-white font-semibold">Takedown Process:</div>
                <p>
                  Email our compliance desk with your TikTok handle and submission reference code. All verified removal requests are executed within 24 hours.
                </p>
                <div className="font-mono text-[#FF2A85] pt-1">
                  Email: legal@onlytok.com (Subject: URGENT TAKEDOWN REQUEST)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-white/[0.08] bg-[#09090C]/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#181822] hover:bg-[#222230] border border-white/10 transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
};
