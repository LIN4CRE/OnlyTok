/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Mail,
  MapPin,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Building,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { useApiAvailability } from '../lib/api';
import { ApiUnavailableNotice } from '../components/common/ApiUnavailableNotice';

export const ContactView: React.FC = () => {
  const { available: apiAvailable } = useApiAvailability();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [department, setDepartment] = useState<string>('general');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          department,
          subject: subject.trim() || 'General Inquiry',
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setSuccessRef(data.referenceCode);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sending message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessRef(null);
    setName('');
    setEmail('');
    setDepartment('general');
    setSubject('');
    setMessage('');
    setErrorMsg(null);
  };

  const departments = [
    {
      id: 'general',
      title: 'General Support & Inquiries',
      email: 'contact@onlytok.com',
      desc: 'Platform feedback, viewing queries, and general inquiries.',
    },
    {
      id: 'creators',
      title: 'Creator Relations & Submissions',
      email: 'creators@onlytok.com',
      desc: 'Questions regarding verified features, queue updates, and syndication.',
    },
    {
      id: 'partnerships',
      title: 'Brand Sponsorships & Media Kit',
      email: 'brands@onlytok.com',
      desc: 'Commercial creator campaigns, co-branding, and talent bookings.',
    },
    {
      id: 'legal',
      title: 'Legal Counsel & DMCA Notices',
      email: 'legal@onlytok.com',
      desc: 'Copyright notices, takedown requests, and licensing terms.',
    },
    {
      id: 'privacy',
      title: 'Data Protection Officer (UK GDPR)',
      email: 'privacy@onlytok.com',
      desc: 'Subject Access Requests (SAR) and right to erasure inquiries.',
    },
    {
      id: 'press',
      title: 'Press & Media Relations',
      email: 'press@onlytok.com',
      desc: 'Editorial commentary, interview requests, and brand assets.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#14141B] via-[#121217] to-[#14141B] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF2A85]/10 text-[#FF2A85] border border-[#FF2A85]/20">
            <Mail className="w-3.5 h-3.5" />
            <span>Official Communications Hub</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Contact ONLYTOK Entertainment
          </h1>

          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
            Connect with our London management team for brand partnerships, creator relations, legal inquiries, and UK GDPR data requests.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Interactive Contact Form (or honest unavailable state) */}
        <div className="lg:col-span-2">
          {apiAvailable === false ? (
            <ApiUnavailableNotice feature="Contact inquiries" contactEmail="contact@onlytok.com" />
          ) : successRef ? (
            <div className="p-8 rounded-3xl bg-[#121217] border border-white/10 shadow-2xl space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="font-display font-bold text-xl text-white">
                Message Dispatched Successfully
              </h2>
              <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
                Thank you for contacting ONLYTOK. Your message has been routed to our team in London.
              </p>
              <div className="p-4 rounded-xl bg-[#09090C] border border-white/5 text-xs inline-block">
                <span className="text-[#8E8EA0] block text-[10px]">Tracking Reference:</span>
                <span className="font-mono font-bold text-white text-sm">{successRef}</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl bg-[#181822] hover:bg-[#222230] text-xs font-semibold text-white border border-white/10 cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-[#121217] border border-white/10 shadow-2xl space-y-5 text-xs text-[#A1A1AA]">
              <div className="border-b border-white/5 pb-3">
                <h2 className="font-display font-bold text-lg text-white">
                  Send an Inquiry
                </h2>
                <p className="text-xs text-[#8E8EA0] mt-0.5">
                  Standard response time: within 24 business hours.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8E8EA0] mb-1 font-medium">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Price"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#FF2A85]"
                  />
                </div>

                <div>
                  <label className="block text-[#8E8EA0] mb-1 font-medium">Your Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. jordan@brand.co.uk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#FF2A85]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8E8EA0] mb-1 font-medium">Department Routing *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#FF2A85]"
                  >
                    <option value="general">General Inquiries</option>
                    <option value="creators">Creator Relations & Syndication</option>
                    <option value="partnerships">Brand Partnerships & Collaborations</option>
                    <option value="legal">Legal & Copyright Claims</option>
                    <option value="privacy">Data Protection Officer (UK GDPR)</option>
                    <option value="press">Press & Media Relations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8E8EA0] mb-1 font-medium">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief subject of inquiry"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#FF2A85]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8E8EA0] mb-1 font-medium">Message Body *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Please provide full details of your inquiry or commercial brief..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-[#FF2A85] resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2A85] to-[#D90368] hover:from-[#ff3d93] hover:to-[#eb0c75] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-[#FF2A85]/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right 1 Col: Department Directory & Jurisdiction */}
        <div className="space-y-6">
          
          {/* Operating Jurisdiction Card */}
          <div className="p-6 rounded-3xl bg-[#121217] border border-white/10 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-white font-bold">
              <Building className="w-4 h-4 text-[#FF2A85]" />
              <span>Operating Headquarters</span>
            </div>
            <div className="space-y-1 text-[#8E8EA0]">
              <div className="text-white font-medium">ONLYTOK Entertainment</div>
              <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-[#FF2A85] shrink-0" />
                <span>London, United Kingdom</span>
              </div>
              <div className="text-[11px] pt-1">
                Governing Jurisdiction: England & Wales
              </div>
            </div>
          </div>

          {/* Department Directory List */}
          <div className="p-6 rounded-3xl bg-[#121217] border border-white/10 space-y-4 text-xs">
            <div className="font-bold text-white">Direct Channel Directory</div>
            <div className="space-y-3">
              {departments.map((dept) => (
                <div key={dept.id} className="p-3 rounded-xl bg-[#09090C] border border-white/5 space-y-1">
                  <div className="font-semibold text-white text-[11px]">{dept.title}</div>
                  <div className="text-[10px] text-[#8E8EA0]">{dept.desc}</div>
                  <a
                    href={`mailto:${dept.email}`}
                    className="text-[#FF2A85] hover:underline font-mono text-[10px] inline-block pt-0.5"
                  >
                    {dept.email}
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
