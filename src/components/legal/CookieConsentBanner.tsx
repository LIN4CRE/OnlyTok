import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X, Lock } from 'lucide-react';

export interface CookiePreferences {
  necessary: boolean; // Always true
  functional: boolean;
  analytics: boolean;
  marketing: boolean; // Always false on ONLYTOK
  timestamp: string;
}

const STORAGE_KEY = 'ot_cookie_consent_v1';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
    timestamp: '',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Small delay for smooth entry
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      } else {
        setPreferences(JSON.parse(stored));
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    const updated = { ...prefs, timestamp: new Date().toISOString() };
    setPreferences(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore local storage error
    }
    setIsVisible(false);
    setIsCustomizeOpen(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: false, // We do NOT do marketing tracking
      timestamp: new Date().toISOString(),
    });
  };

  const handleRejectNonEssential = () => {
    saveConsent({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    });
  };

  if (!isVisible && !isCustomizeOpen) return null;

  return (
    <>
      {/* Banner */}
      {isVisible && !isCustomizeOpen && (
        <aside
          role="region"
          aria-label="Cookie consent banner"
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 animate-in slide-in-from-bottom-6 duration-300 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto rounded-2xl bg-[#121217]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-5 sm:p-6 pointer-events-auto flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FF2A85]/10 border border-[#FF2A85]/20 flex items-center justify-center text-[#FF2A85] shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-sm text-white">
                    Privacy & Cookie Compliance (UK GDPR)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Zero Ad Trackers
                  </span>
                </div>
                <p className="text-[#A1A1AA] leading-relaxed max-w-2xl">
                  ONLYTOK respects your digital rights. We use strictly necessary cookies to ensure security, authentication, and form safety. Optional analytics help us understand platform performance. We <strong>never</strong> sell personal data or use third-party behavioural ad tracking cookies.
                </p>
                <div className="pt-0.5">
                  <a
                    href="/?tab=legal&sub=cookies"
                    className="text-[#FF2A85] hover:underline font-medium text-[11px]"
                  >
                    Read our full UK Cookie Policy →
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setIsCustomizeOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#181822] hover:bg-[#222230] border border-white/10 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              >
                Customise
              </button>
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-3.5 py-2 rounded-xl bg-[#181822] hover:bg-[#222230] border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2A85] to-[#D90368] hover:from-[#ff3d93] hover:to-[#eb0c75] text-white font-bold text-xs shadow-md shadow-[#FF2A85]/20 transition-all cursor-pointer"
              >
                Accept All
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Customise Modal */}
      {isCustomizeOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg rounded-3xl bg-[#121217] border border-white/10 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-[#FF2A85]" />
                <h3 id="cookie-settings-title" className="font-display font-bold text-base text-white">
                  Cookie Preferences Manager
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizeOpen(false)}
                className="text-[#8E8EA0] hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                aria-label="Close cookie preferences"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Strictly Necessary */}
              <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Strictly Necessary Cookies</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Always Active
                  </span>
                </div>
                <p className="text-[#8E8EA0] leading-relaxed">
                  Required for essential platform operations, security tokens, upload rate-limit buckets, and remembering your privacy choices. Cannot be disabled.
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Functional Preferences</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) =>
                        setPreferences({ ...preferences, functional: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#181822] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF2A85]"></div>
                  </label>
                </div>
                <p className="text-[#8E8EA0] leading-relaxed">
                  Enables persistent player volume settings, category filters, and user interface preferences across browser sessions.
                </p>
              </div>

              {/* Performance & Analytics */}
              <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Aggregated Performance Analytics</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({ ...preferences, analytics: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#181822] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF2A85]"></div>
                  </label>
                </div>
                <p className="text-[#8E8EA0] leading-relaxed">
                  Measures anonymised page traffic and playback error rates to diagnose technical failures. No identifiable data is linked to your identity.
                </p>
              </div>

              {/* Marketing / Advertising Cookies */}
              <div className="p-4 rounded-2xl bg-[#09090C] border border-white/5 space-y-1.5 opacity-60">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Behavioural & Third-Party Advertising</span>
                  <span className="text-[10px] font-mono text-[#8E8EA0]">Not Used</span>
                </div>
                <p className="text-[#8E8EA0] leading-relaxed">
                  ONLYTOK does not use cross-site tracking, pixel beacons, or advertising cookie networks. We do not sell your data.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="text-xs text-[#8E8EA0] hover:text-white cursor-pointer"
              >
                Reject All Optional
              </button>
              <button
                type="button"
                onClick={() => saveConsent(preferences)}
                className="px-5 py-2 rounded-xl bg-[#FF2A85] hover:bg-[#ff3d93] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#FF2A85]/20"
              >
                <Check className="w-4 h-4" />
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
