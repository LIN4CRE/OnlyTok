/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  FileText,
  AlertTriangle,
  Scale,
  Cookie,
  Users,
  CheckCircle2,
  Trash2,
  Download,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileWarning,
} from 'lucide-react';
import { GDPRDataRightsModal } from '../components/legal/GDPRDataRightsModal';

export type LegalTab =
  | 'privacy'
  | 'terms'
  | 'cookies'
  | 'dmca'
  | 'submission-agreement'
  | 'guidelines';

interface LegalViewProps {
  initialSubTab?: LegalTab;
  onNavigateRemoval?: () => void;
  onNavigateContact?: () => void;
}

export const LegalView: React.FC<LegalViewProps> = ({
  initialSubTab = 'privacy',
  onNavigateRemoval,
  onNavigateContact,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialSubTab);
  const [isGDPRModalOpen, setIsGDPRModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setActiveTab(initialSubTab);
  }, [initialSubTab]);

  const navItems: Array<{ id: LegalTab; label: string; icon: React.ReactNode; desc: string }> = [
    {
      id: 'privacy',
      label: 'Privacy Policy',
      icon: <Lock className="w-4 h-4" />,
      desc: 'UK GDPR & Data Protection Act 2018 compliance',
    },
    {
      id: 'terms',
      label: 'Terms of Service',
      icon: <Scale className="w-4 h-4" />,
      desc: 'Platform usage agreement & England & Wales jurisdiction',
    },
    {
      id: 'cookies',
      label: 'Cookie Policy',
      icon: <Cookie className="w-4 h-4" />,
      desc: 'UK PECR compliance & transparent cookie classification',
    },
    {
      id: 'dmca',
      label: 'Copyright & Takedown',
      icon: <FileWarning className="w-4 h-4" />,
      desc: 'UK CDPA 1988 & DMCA expedited notice procedures',
    },
    {
      id: 'submission-agreement',
      label: 'Content Submission Agreement',
      icon: <FileText className="w-4 h-4" />,
      desc: 'Creator syndication license & sovereign consent terms',
    },
    {
      id: 'guidelines',
      label: 'Community Guidelines',
      icon: <Users className="w-4 h-4" />,
      desc: '18+ adult standards, zero NCII, mainstream entertainment rules',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#14141B] via-[#121217] to-[#14141B] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#FF2A85]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF2A85]/10 text-[#FF2A85] border border-[#FF2A85]/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>UK Legal Framework & Safety Portal</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Governance, Legal & Content Protection
          </h1>

          <p className="text-sm text-[#A1A1AA] leading-relaxed">
            ONLYTOK operates with rigorous governance standards, strict 18+ adult verification, clear creator licensing, and full compliance with UK GDPR and consumer protection laws in England & Wales.
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              onClick={() => setIsGDPRModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#181822] hover:bg-[#222230] border border-white/10 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#FF2A85]" />
              <span>Exercise UK GDPR Rights (Erasure / SAR)</span>
            </button>

            {onNavigateRemoval && (
              <button
                onClick={onNavigateRemoval}
                className="px-4 py-2 rounded-xl bg-[#181822] hover:bg-[#222230] border border-white/10 text-xs font-semibold text-rose-300 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <FileWarning className="w-3.5 h-3.5 text-rose-400" />
                <span>Submit Content Removal / DMCA Notice</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Navigation + Document Body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-xs font-bold text-[#8E8EA0] uppercase tracking-wider px-3 mb-2">
            Legal & Policy Documents
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-start gap-3 cursor-pointer ${
                  isActive
                    ? 'bg-[#181822] text-white border border-[#FF2A85]/40 shadow-lg shadow-[#FF2A85]/5'
                    : 'text-[#8E8EA0] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    isActive ? 'bg-[#FF2A85] text-white' : 'bg-white/5 text-[#8E8EA0]'
                  }`}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="font-bold text-xs">{item.label}</div>
                  <div className="text-[11px] text-[#8E8EA0] mt-0.5 line-clamp-1">
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Quick Help Card */}
          <div className="p-4 rounded-2xl bg-[#121217] border border-white/5 space-y-2 text-xs text-[#8E8EA0] mt-6">
            <div className="font-bold text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#FF2A85]" />
              <span>Need Direct Legal Guidance?</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Our compliance team reviews rights queries, data subject requests, and creator consent revocations daily.
            </p>
            <div className="pt-1">
              <a
                href="mailto:legal@onlytok.com"
                className="text-white hover:text-[#FF2A85] font-mono text-[11px] underline"
              >
                legal@onlytok.com
              </a>
            </div>
          </div>
        </div>

        {/* Document Content Container */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Statutory UK Legal Advice Flag Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-white block font-bold">
                UK Statutory Governance & Legal Review Advisory
              </strong>
              <p className="text-[#A1A1AA] text-[11px] leading-relaxed">
                Notice to platform stakeholders: This document is a operational compliance charter structured under the laws of England and Wales. Specific legal clauses and contractual terms are flagged as discussion drafts subject to formal review and sign-off by a qualified UK solicitor prior to live commercial syndicate agreements.
              </p>
            </div>
          </div>

          {/* DOCUMENT 1: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <article className="p-8 rounded-3xl bg-[#121217] border border-white/10 space-y-6 text-xs text-[#A1A1AA] leading-relaxed">
              <div className="border-b border-white/5 pb-4">
                <span className="font-mono text-[10px] text-[#FF2A85] uppercase tracking-wider">
                  UK GDPR & Data Protection Act 2018
                </span>
                <h2 className="font-display font-extrabold text-2xl text-white mt-1">
                  Privacy Policy & Transparency Notice
                </h2>
                <div className="text-[11px] text-[#8E8EA0] mt-1">
                  Effective Date: 1 November 2026 · Jurisdiction: England & Wales · Version 2.4
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">1. Data Controller Information</h3>
                <p>
                  ONLYTOK Entertainment ("we", "our", or "the Platform") operates this website and vertical entertainment showcase. For the purposes of the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018, the designated data controller is ONLYTOK Entertainment, based in London, United Kingdom.
                </p>
                <p>
                  Our designated Data Protection Officer (DPO) and compliance desk can be reached at:{' '}
                  <a href="mailto:privacy@onlytok.com" className="text-[#FF2A85] underline">
                    privacy@onlytok.com
                  </a>.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">2. Personal Data We Collect</h3>
                <p>
                  We adhere strictly to the principle of <strong>Data Minimisation</strong> under Article 5(1)(c) of the UK GDPR. We only collect information essential to operate creator spotlights and protect platform safety:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong className="text-white">Creator Submission Data:</strong> Full legal name, public creator display name, verified TikTok handle, contact email address, submitted video media, and category preference.</li>
                  <li><strong className="text-white">18+ Verification & Age Data:</strong> Creator date of birth, identity document type declaration, and timestamped digital signature confirming adult age status.</li>
                  <li><strong className="text-white">Rights & Consent Dossier:</strong> Documented certifications of copyright ownership, syndication releases, and consent history.</li>
                  <li><strong className="text-white">Technical & Security Logs:</strong> IP address and request timestamps strictly utilized for automated sliding-window rate limiting (DoS mitigation) and abuse prevention.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">3. What We NEVER Do With Your Data</h3>
                <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-1 text-white font-medium">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Our Absolute Privacy Commitments:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-[#A1A1AA] pt-1">
                    <li>We <strong>NEVER</strong> sell, rent, or trade creator contact information to third-party data brokers or marketing aggregators.</li>
                    <li>We <strong>NEVER</strong> conduct automated behavioural profiling or micro-targeted third-party advertising tracking.</li>
                    <li>We <strong>NEVER</strong> expose private creator contact emails on public video cards or profile directories.</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">4. Lawful Bases for Processing (UK GDPR Article 6)</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong className="text-white">Performance of Contract (Art 6(1)(b)):</strong> Processing creator submissions, syndicating approved videos, and managing brand collaboration inquiries.</li>
                  <li><strong className="text-white">Legal Obligation (Art 6(1)(c)):</strong> Complying with statutory copyright takedown requests, investigating minor protection alerts, and maintaining records under the UK Online Safety Act framework.</li>
                  <li><strong className="text-white">Explicit Consent (Art 6(1)(a)):</strong> Publicly spotlighting creator media and handles on our digital showcase. Creators may withdraw this consent at any time.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">5. Data Retention Schedule</h3>
                <p>
                  In accordance with UK GDPR storage limitation principles:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong className="text-white">Approved Creator Releases:</strong> Retained for the duration of the feature agreement or until consent is revoked.</li>
                  <li><strong className="text-white">Rejected Submissions:</strong> Automatically purged from active queues after 90 days.</li>
                  <li><strong className="text-white">Compliance & Moderation Logs:</strong> Retained for 6 years to satisfy statutory limitation periods under the UK Limitation Act 1980 for copyright and contractual disputes.</li>
                </ul>
              </section>

              <section className="space-y-3 pt-2">
                <h3 className="font-bold text-sm text-white">6. Your Statutory Rights (UK GDPR Articles 15–22)</h3>
                <p>
                  As an individual in the United Kingdom or EEA, you possess comprehensive statutory rights:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-xl bg-[#09090C] border border-white/5 space-y-1">
                    <strong className="text-white">Right to Erasure (Art 17)</strong>
                    <p className="text-[#8E8EA0]">Request immediate deletion of all submission drafts, email addresses, and personal records ("Right to be Forgotten").</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#09090C] border border-white/5 space-y-1">
                    <strong className="text-white">Subject Access Request (Art 15)</strong>
                    <p className="text-[#8E8EA0]">Obtain a verified export copy of all personal data held concerning you within one calendar month.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#09090C] border border-white/5 space-y-1">
                    <strong className="text-white">Right to Rectification (Art 16)</strong>
                    <p className="text-[#8E8EA0]">Request prompt correction of any inaccurate or outdated information.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#09090C] border border-white/5 space-y-1">
                    <strong className="text-white">Withdrawal of Consent (Art 7(3))</strong>
                    <p className="text-[#8E8EA0]">Revoke promotional syndication rights at any time without penalty.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setIsGDPRModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#FF2A85] hover:bg-[#ff3d93] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#FF2A85]/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Submit Data Erasure / SAR Request Now</span>
                  </button>
                </div>
              </section>

              <section className="space-y-2 pt-2 border-t border-white/5">
                <h3 className="font-bold text-sm text-white">7. Supervisory Authority Complaints</h3>
                <p>
                  You have the legal right to lodge a complaint with the UK supervisory authority, the Information Commissioner’s Office (ICO):{' '}
                  <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-[#FF2A85] underline">
                    https://ico.org.uk
                  </a>.
                </p>
              </section>
            </article>
          )}

          {/* DOCUMENT 2: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <article className="p-8 rounded-3xl bg-[#121217] border border-white/10 space-y-6 text-xs text-[#A1A1AA] leading-relaxed">
              <div className="border-b border-white/5 pb-4">
                <span className="font-mono text-[10px] text-[#FF2A85] uppercase tracking-wider">
                  Contractual Platform Agreement
                </span>
                <h2 className="font-display font-extrabold text-2xl text-white mt-1">
                  Terms of Service & Acceptable Use
                </h2>
                <div className="text-[11px] text-[#8E8EA0] mt-1">
                  Governing Jurisdiction: England & Wales · Last Updated: 1 November 2026
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">1. Introduction & Acceptance</h3>
                <p>
                  These Terms of Service govern your access to and use of ONLYTOK (the "Platform", "onlytok.com", and related syndication channels including @onlytokgirls). By accessing the website or submitting content, you enter into a legally binding contract with ONLYTOK Entertainment governed by the laws of England and Wales.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">2. Strict 18+ Adult Eligibility</h3>
                <p>
                  ONLYTOK is strictly intended for individuals aged eighteen (18) years or older. You represent, warrant, and certify that you are at least 18 years of age. Content featuring, depicting, or created by individuals under the age of 18 is strictly prohibited and subject to immediate removal and reporting.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">3. Non-Exclusive Syndication License</h3>
                <p>
                  When you submit content to ONLYTOK, you retain your underlying copyright. You grant ONLYTOK Entertainment a non-exclusive, worldwide, royalty-free, revocable license to broadcast, display, index, format, and syndicate the video across our website and social channels (@onlytokgirls), with guaranteed prominent attribution to your creator handle.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">4. Absolute Prohibitions (Zero Tolerance)</h3>
                <p>You agree not to submit or attempt to transmit any content that contains:</p>
                <div className="p-4 rounded-2xl bg-[#09090C] border border-rose-500/20 text-rose-300 space-y-1.5">
                  <div className="font-bold text-white text-xs">Strictly Prohibited Material:</div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#A1A1AA]">
                    <li><strong className="text-rose-400">Minors / Under 18:</strong> Any imagery or video featuring or involving anyone under the age of 18.</li>
                    <li><strong className="text-rose-400">Non-Consensual Intimate Imagery (NCII):</strong> Any media recorded or distributed without explicit, written consent.</li>
                    <li><strong className="text-rose-400">Explicit Pornography:</strong> Overt sexual acts, genital depiction, or hardcore adult material. ONLYTOK is a mainstream vertical entertainment platform.</li>
                    <li><strong className="text-rose-400">Unauthorized Reposts & Rips:</strong> Re-uploading or claiming ownership of content created by other TikTok creators.</li>
                    <li><strong className="text-rose-400">Harassment & Hate Speech:</strong> Defamatory, abusive, threatening, or discriminatory material.</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">5. Limitation of Liability & Disclaimers</h3>
                <p>
                  To the maximum extent permitted under the Consumer Rights Act 2015 and applicable UK law, ONLYTOK is provided "as is" and "as available". We do not guarantee continuous uninterrupted broadcasting or specific commercial engagement outcomes.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">6. Dispute Resolution & Governing Law</h3>
                <p>
                  These Terms and any non-contractual obligations arising out of or in connection with them shall be governed by and construed in accordance with the laws of <strong>England and Wales</strong>. The courts of London, England, shall have exclusive jurisdiction to settle any dispute.
                </p>
              </section>
            </article>
          )}

          {/* DOCUMENT 3: COOKIE POLICY */}
          {activeTab === 'cookies' && (
            <article className="p-8 rounded-3xl bg-[#121217] border border-white/10 space-y-6 text-xs text-[#A1A1AA] leading-relaxed">
              <div className="border-b border-white/5 pb-4">
                <span className="font-mono text-[10px] text-[#FF2A85] uppercase tracking-wider">
                  UK PECR & ePrivacy Notice
                </span>
                <h2 className="font-display font-extrabold text-2xl text-white mt-1">
                  Cookie Policy & Consent Charter
                </h2>
                <div className="text-[11px] text-[#8E8EA0] mt-1">
                  Compliance with the Privacy and Electronic Communications Regulations 2003
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">1. What Are Cookies?</h3>
                <p>
                  Cookies are small data files placed on your device by your web browser. Under UK law (PECR and UK GDPR), platforms must clearly disclose cookie usage and obtain explicit user consent before setting non-essential cookies.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="font-bold text-sm text-white">2. Categorisation of Cookies Used</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-white font-bold">
                      <span>Strictly Necessary Cookies (Exempt from Consent)</span>
                      <span className="text-emerald-400 text-[10px] font-mono">Always Active</span>
                    </div>
                    <p className="text-[#8E8EA0]">
                      Includes session validation tokens for administrators, CSRF security verification for submission forms, and local storage keys holding your cookie consent preferences. Without these, the platform cannot function securely.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-white font-bold">
                      <span>Functional Cookies</span>
                      <span className="text-[#FF2A85] text-[10px] font-mono">Optional</span>
                    </div>
                    <p className="text-[#8E8EA0]">
                      Stores video volume preferences, muted states, and active category tab filters so you do not have to reset them on each page load.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-white font-bold">
                      <span>Aggregated Performance Analytics</span>
                      <span className="text-sky-400 text-[10px] font-mono">Opt-in Only</span>
                    </div>
                    <p className="text-[#8E8EA0]">
                      Measures anonymised aggregate traffic metrics to diagnose slow page loads and CDN video streaming performance. No cross-site or personally identifiable tracking is performed.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-1 opacity-70">
                    <div className="flex items-center justify-between text-white font-bold">
                      <span>Third-Party Advertising & Cross-Site Tracking</span>
                      <span className="text-rose-400 text-[10px] font-mono">ZERO (Not Deployed)</span>
                    </div>
                    <p className="text-[#8E8EA0]">
                      ONLYTOK does not deploy tracking pixels, third-party advertising cookie networks, or cross-site tracking scripts.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-2 pt-2">
                <h3 className="font-bold text-sm text-white">3. Managing Your Cookie Choices</h3>
                <p>
                  You may alter your preferences at any time by clearing your browser cache or re-opening our interactive manager.
                </p>
              </section>
            </article>
          )}

          {/* DOCUMENT 4: COPYRIGHT & TAKEDOWN POLICY */}
          {activeTab === 'dmca' && (
            <article className="p-8 rounded-3xl bg-[#121217] border border-white/10 space-y-6 text-xs text-[#A1A1AA] leading-relaxed">
              <div className="border-b border-white/5 pb-4">
                <span className="font-mono text-[10px] text-[#FF2A85] uppercase tracking-wider">
                  UK CDPA 1988 & DMCA Safe Harbor Procedures
                </span>
                <h2 className="font-display font-extrabold text-2xl text-white mt-1">
                  Copyright, DMCA & Expedited Takedown Policy
                </h2>
                <div className="text-[11px] text-[#8E8EA0] mt-1">
                  Designated Rights Agent: legal@onlytok.com · 24-Hour Expedited Action Guarantee
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">1. Statement of Principle</h3>
                <p>
                  ONLYTOK respects the intellectual property rights of creators and copyright owners. We operate an expeditious notice-and-takedown procedure in compliance with the UK Copyright, Designs and Patents Act 1988 (CDPA) and the international standards of the Digital Millennium Copyright Act (17 U.S.C. § 512).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">2. Notice Requirements for Copyright Holders</h3>
                <p>
                  To file a formal notice of infringement, your written communication must include:
                </p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Identification of the copyrighted work claimed to have been infringed, including a direct link to the original work.</li>
                  <li>Identification of the infringing material on ONLYTOK, including title, creator handle, or URL.</li>
                  <li>Your full legal name, email address, physical address, and telephone number.</li>
                  <li>A statement that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
                  <li>A statement, under penalty of perjury, that the information in the notification is accurate and that you are the copyright owner or authorized to act on their behalf.</li>
                  <li>A physical or electronic signature of the authorized copyright owner.</li>
                </ol>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">3. Rapid Takedown Service Level Agreement (SLA)</h3>
                <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-1 text-xs">
                  <div className="font-bold text-white">Response Timelines:</div>
                  <ul className="list-disc pl-4 space-y-1 text-[#8E8EA0]">
                    <li><strong className="text-rose-400">Critical Safety & NCII Reports:</strong> Processed within 6 hours.</li>
                    <li><strong className="text-white">Copyright & DMCA Notices:</strong> Processed within 24 hours.</li>
                    <li><strong className="text-white">Creator Consent Withdrawals:</strong> Executed within 24 hours.</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">4. Counter-Notification Procedure</h3>
                <p>
                  If you are a featured creator and believe your material was removed or disabled by mistake or misidentification, you may file a counter-notification under 17 U.S.C. § 512(g). We will provide a copy to the original claimant. If no legal action is instituted within 14 business days, we may restore the video.
                </p>
              </section>

              <section className="space-y-2 pt-2">
                <h3 className="font-bold text-sm text-white">5. Repeat Infringer Policy</h3>
                <p>
                  In accordance with statutory safe harbor requirements, ONLYTOK maintains a strict repeat infringer policy. Any creator account receiving two or more verified copyright strikes will have their creator profile permanently deactivated and will be barred from future submissions.
                </p>

                {onNavigateRemoval && (
                  <div className="pt-3">
                    <button
                      onClick={onNavigateRemoval}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2A85] to-[#D90368] hover:from-[#ff3d93] hover:to-[#eb0c75] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-[#FF2A85]/20"
                    >
                      <FileWarning className="w-4 h-4" />
                      <span>Open Formal Online Removal Request Desk</span>
                    </button>
                  </div>
                )}
              </section>
            </article>
          )}

          {/* DOCUMENT 5: CONTENT SUBMISSION AGREEMENT */}
          {activeTab === 'submission-agreement' && (
            <article className="p-8 rounded-3xl bg-[#121217] border border-white/10 space-y-6 text-xs text-[#A1A1AA] leading-relaxed">
              <div className="border-b border-white/5 pb-4">
                <span className="font-mono text-[10px] text-[#FF2A85] uppercase tracking-wider">
                  Legally Binding Creator Syndication Contract
                </span>
                <h2 className="font-display font-extrabold text-2xl text-white mt-1">
                  Content Submission & Creator Agreement
                </h2>
                <div className="text-[11px] text-[#8E8EA0] mt-1">
                  Enforceable under the UK Electronic Communications Act 2000
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">1. Parties & Recitals</h3>
                <p>
                  This Content Submission Agreement ("Agreement") is entered into between you (the "Creator") and ONLYTOK Entertainment ("ONLYTOK"). By submitting video footage via our submission portal, you execute this Agreement electronically.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">2. Scope of License Grant</h3>
                <p>
                  The Creator hereby grants ONLYTOK Entertainment a non-exclusive, worldwide, royalty-free, revocable license to:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Display, stream, encode, and transmit the submitted video on onlytok.com and syndication channels (@onlytokgirls).</li>
                  <li>Incorporate the video into curated category playlists, creator directory spotlights, and promotional teasers.</li>
                  <li>Prominently display the Creator's chosen display name and verified TikTok handle.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">3. Creator Representations & Warranties</h3>
                <p>The Creator explicitly represents and warrants under penalty of law that:</p>
                <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-1 text-white">
                  <div className="font-bold text-xs text-[#FF2A85]">Mandatory Creator Warranties:</div>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-[#A1A1AA] pt-1">
                    <li><strong className="text-white">Adult Age (18+):</strong> The Creator and all individuals visually or audibly depicted in the footage are eighteen (18) years of age or older.</li>
                    <li><strong className="text-white">Sole Copyright Ownership:</strong> The Creator is the sole author or possesses all valid clearances and permissions to syndicate the audio and visual stems.</li>
                    <li><strong className="text-white">Zero Non-Consensual Material:</strong> The video contains no non-consensual imagery, hidden camera footage, or content violating third-party privacy rights.</li>
                    <li><strong className="text-white">Mainstream Suitability:</strong> The footage contains zero hardcore pornography, explicit nudity, or severe graphic violence.</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">4. Sovereign Right to Revoke Consent</h3>
                <p>
                  Unlike legacy syndication agencies, ONLYTOK champions creator sovereignty. Creators retain the legal right to revoke this license at any time by filing a takedown request referencing their submission code. Within 24 hours of verified revocation, ONLYTOK will remove the media from our public feeds.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-white">5. Governing Law & Jurisdiction</h3>
                <p>
                  This Agreement shall be governed by and construed in accordance with English law. Any dispute arising out of this Agreement shall be subject to the exclusive jurisdiction of the English courts.
                </p>
              </section>
            </article>
          )}

          {/* DOCUMENT 6: COMMUNITY GUIDELINES */}
          {activeTab === 'guidelines' && (
            <article className="p-8 rounded-3xl bg-[#121217] border border-white/10 space-y-6 text-xs text-[#A1A1AA] leading-relaxed">
              <div className="border-b border-white/5 pb-4">
                <span className="font-mono text-[10px] text-[#FF2A85] uppercase tracking-wider">
                  Brand Safety & Editorial Standards
                </span>
                <h2 className="font-display font-extrabold text-2xl text-white mt-1">
                  Community Guidelines & Safety Standards
                </h2>
                <div className="text-[11px] text-[#8E8EA0] mt-1">
                  Core Standards for the @onlytokgirls Entertainment Brand
                </div>
              </div>

              <section className="space-y-3">
                <p className="text-sm text-white font-medium">
                  ONLYTOK is a curated, high-end vertical entertainment brand spotlighting authentic TikTok talent across dance, style, sound design, and creative motion. To maintain our reputation as a trusted, mainstream partner for creators and global brands, we enforce the following foundational rules:
                </p>

                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <span className="w-6 h-6 rounded-lg bg-[#FF2A85]/20 text-[#FF2A85] flex items-center justify-center text-xs">1</span>
                      <span>Strict 18+ Adult Standard (Zero Minors)</span>
                    </div>
                    <p className="text-[#8E8EA0] pl-8">
                      We operate a strict, absolute bar on minor participation. Every featured creator must be an adult. Any content with questionable age verification is quarantined immediately pending documentary verification.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <span className="w-6 h-6 rounded-lg bg-[#FF2A85]/20 text-[#FF2A85] flex items-center justify-center text-xs">2</span>
                      <span>Zero Tolerance for Non-Consensual Imagery (NCII)</span>
                    </div>
                    <p className="text-[#8E8EA0] pl-8">
                      Every individual featured must have willingly consented to public recording and syndication. Non-consensual recordings, revenge media, or covert footage will result in an immediate permanent ban and referral to relevant UK authorities.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <span className="w-6 h-6 rounded-lg bg-[#FF2A85]/20 text-[#FF2A85] flex items-center justify-center text-xs">3</span>
                      <span>Mainstream Vertical Entertainment (Zero Pornography)</span>
                    </div>
                    <p className="text-[#8E8EA0] pl-8">
                      ONLYTOK spotlights dance, music, fashion, and lifestyle culture. We do not host or distribute pornography, overt sexual acts, or hardcore adult material.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <span className="w-6 h-6 rounded-lg bg-[#FF2A85]/20 text-[#FF2A85] flex items-center justify-center text-xs">4</span>
                      <span>Authenticity & Prohibition of Stolen Media</span>
                    </div>
                    <p className="text-[#8E8EA0] pl-8">
                      Do not rip or repost content created by others. We celebrate original talent. Submitting stolen clips damages the creator ecosystem and will trigger immediate copyright disqualification.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <span className="w-6 h-6 rounded-lg bg-[#FF2A85]/20 text-[#FF2A85] flex items-center justify-center text-xs">5</span>
                      <span>Anti-Harassment & Safe Community</span>
                    </div>
                    <p className="text-[#8E8EA0] pl-8">
                      Bullying, hate speech, body-shaming, and targeted harassment against creators are strictly prohibited.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-2 pt-2 border-t border-white/5">
                <h3 className="font-bold text-sm text-white">Reporting Violations</h3>
                <p>
                  If you see any content on ONLYTOK that violates these Community Guidelines, please report it immediately using the report flag on any video or via our dedicated Removal Request Desk.
                </p>
              </section>
            </article>
          )}

        </div>
      </div>

      {/* GDPR Modal */}
      <GDPRDataRightsModal
        isOpen={isGDPRModalOpen}
        onClose={() => setIsGDPRModalOpen(false)}
      />
    </div>
  );
};
