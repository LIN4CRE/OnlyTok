import React, { useState } from 'react';
import { X, CheckCircle2, Briefcase, AlertCircle, Copy, Check, ArrowRight } from 'lucide-react';
import {
  BrandInquiryInput,
  validateBrandInquiry,
  generateReferenceCode,
} from '../../utils/submissionValidator';

interface BrandInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandInquiryModal: React.FC<BrandInquiryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<BrandInquiryInput>({
    companyName: '',
    contactName: '',
    workEmail: '',
    campaignType: 'Sponsored Talent Series',
    budgetRange: '$5,000 – $15,000',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = validateBrandInquiry(formData);
    if (!result.isValid) {
      setErrors(result.errors);
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      const refCode = generateReferenceCode('OT-BP');
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
      companyName: '',
      contactName: '',
      workEmail: '',
      campaignType: 'Sponsored Talent Series',
      budgetRange: '$5,000 – $15,000',
      message: '',
    });
    setErrors({});
    setSubmittedRef(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#121217] border border-white/10 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08] bg-[#09090C]/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7928CA] to-[#FF2A85] flex items-center justify-center text-white">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white leading-tight">
                Brand Partnership Inquiry
              </h3>
              <p className="text-xs text-[#8E8EA0] mt-0.5">
                Commercial Sponsorships & Media Kit Access
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

        {/* Content */}
        <div className="p-6 sm:p-8">
          {submittedRef ? (
            /* Confirmation Receipt */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#7928CA]/20 border border-[#7928CA]/40 text-[#FF2A85] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h4 className="font-display font-bold text-2xl text-white mb-2">
                Inquiry Logged
              </h4>
              <p className="text-sm text-[#A1A1AA] max-w-md mx-auto mb-6 leading-relaxed">
                Thank you. The ONLYTOK commercial partnerships team will review your campaign criteria and provide our rate card and demographic media deck within 24-48 business hours.
              </p>

              <div className="p-4 rounded-xl bg-[#181822] border border-white/10 max-w-md mx-auto mb-6 text-left">
                <div className="text-xs text-[#8E8EA0] uppercase tracking-wider mb-1 font-mono">
                  Partnership Dossier ID
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
                  Company: <strong className="text-white">{formData.companyName}</strong> · Lead: {formData.contactName}
                </div>
              </div>

              <button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="w-full py-3 rounded-xl font-bold text-sm text-white bg-[#181822] hover:bg-[#222230] border border-white/10 transition-colors"
              >
                Close & Return
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                    Company / Brand Name <span className="text-[#FF2A85]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => {
                      setFormData({ ...formData, companyName: e.target.value });
                      if (errors.companyName) setErrors({ ...errors, companyName: '' });
                    }}
                    placeholder="e.g. Aura Lifestyle"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white placeholder-[#8E8EA0] text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
                  />
                  {errors.companyName && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.companyName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                    Contact Lead Name <span className="text-[#FF2A85]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => {
                      setFormData({ ...formData, contactName: e.target.value });
                      if (errors.contactName) setErrors({ ...errors, contactName: '' });
                    }}
                    placeholder="e.g. Alex Mercer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white placeholder-[#8E8EA0] text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
                  />
                  {errors.contactName && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.contactName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                    Work Email Address <span className="text-[#FF2A85]">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.workEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, workEmail: e.target.value });
                      if (errors.workEmail) setErrors({ ...errors, workEmail: '' });
                    }}
                    placeholder="alex@auralifestyle.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white placeholder-[#8E8EA0] text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
                  />
                  {errors.workEmail && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.workEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                    Collaboration Type <span className="text-[#FF2A85]">*</span>
                  </label>
                  <select
                    value={formData.campaignType}
                    onChange={(e) => setFormData({ ...formData, campaignType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
                  >
                    <option value="Sponsored Talent Series">Sponsored Talent Series</option>
                    <option value="Audio / Sound Placement">Audio / Sound Placement</option>
                    <option value="Product Showcase Integration">Product Showcase Integration</option>
                    <option value="Custom Event / Launch Activation">Custom Event / Launch Activation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                  Target Budget Scope
                </label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF2A85] transition-colors"
                >
                  <option value="$2,500 – $5,000">$2,500 – $5,000 (Starter Spotlight)</option>
                  <option value="$5,000 – $15,000">$5,000 – $15,000 (Multi-Video Campaign)</option>
                  <option value="$15,000 – $50,000">$15,000 – $50,000 (Exclusive Month Takeover)</option>
                  <option value="$50,000+">$50,000+ (Enterprise Long-Term Partner)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                  Campaign Brief & Target Timeline <span className="text-[#FF2A85]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (errors.message) setErrors({ ...errors, message: '' });
                  }}
                  placeholder="Outline your campaign objective, product category, and intended launch window..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181822] border border-white/10 text-white placeholder-[#8E8EA0] text-sm focus:outline-none focus:border-[#FF2A85] transition-colors resize-none"
                />
                {errors.message && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#FF2A85] to-[#7928CA] hover:from-[#ff3d93] hover:to-[#8a35e0] shadow-lg shadow-[#FF2A85]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Briefcase className="w-4 h-4" />
                <span>{isSubmitting ? 'Transmitting Proposal...' : 'Request Media Kit & Rate Card'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-[#8E8EA0] text-center">
                Strict confidentiality. Direct communication with ONLYTOK commercial representation.
              </p>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
