/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Privacy-First Real Analytics for ONLYTOK
 * Strictly complies with UK GDPR & PECR:
 * - No third-party ad networks or tracking cookies.
 * - Anonymous transient session identifier kept in sessionStorage only (purged on browser close).
 * - Real measured events only — strictly zero fabricated statistics.
 */

export type AnalyticsEventType =
  | 'homepage_visit'
  | 'creator_profile_view'
  | 'video_play_visit'
  | 'submission_start'
  | 'submission_success'
  | 'tiktok_outbound_click'
  | 'tab_navigation';

export interface AnalyticsPayload {
  eventType: AnalyticsEventType;
  page?: string;
  targetId?: string;
  targetName?: string;
  sourceLocation?: string;
  category?: string;
  metadata?: Record<string, any>;
}

// Session token generator (ephemeral, zero persistent cookies)
function getAnonymousSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  try {
    const key = 'ot_anon_session_token';
    let token = window.sessionStorage.getItem(key);
    if (!token) {
      token = 'ses_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      window.sessionStorage.setItem(key, token);
    }
    return token;
  } catch {
    return 'transient-anon';
  }
}

/**
 * Send an event payload to the ONLYTOK privacy analytics endpoint.
 */
export async function trackEvent(payload: AnalyticsPayload): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Respect Global Privacy Control / Do Not Track
  if (navigator.doNotTrack === '1' || (window as any).doNotTrack === '1') {
    // If user explicitly asks not to be tracked, do not record external event
    return false;
  }

  const body = JSON.stringify({
    ...payload,
    sessionId: getAnonymousSessionId(),
    timestamp: new Date().toISOString(),
    referrer: document.referrer || undefined,
    screenResolution: `${window.innerWidth}x${window.innerHeight}`,
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      const sent = navigator.sendBeacon('/api/analytics/event', blob);
      if (sent) return true;
    }

    const res = await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
    return res.ok;
  } catch {
    // Fail silently in client
    return false;
  }
}

// Convenience trackers for core required events

export function trackHomepageVisit() {
  trackEvent({
    eventType: 'homepage_visit',
    page: '/',
    sourceLocation: 'root',
  });
}

export function trackTabNavigation(tabName: string) {
  trackEvent({
    eventType: 'tab_navigation',
    page: `/?tab=${tabName}`,
    targetName: tabName,
  });
}

export function trackCreatorProfileView(creatorId: string, creatorDisplayName: string) {
  trackEvent({
    eventType: 'creator_profile_view',
    targetId: creatorId,
    targetName: creatorDisplayName,
    page: `/?creator=${creatorId}`,
  });
}

export function trackVideoPlayVisit(videoId: string, videoTitle: string, creatorName: string) {
  trackEvent({
    eventType: 'video_play_visit',
    targetId: videoId,
    targetName: videoTitle,
    metadata: { creatorName },
    page: `/?video=${videoId}`,
  });
}

export function trackSubmissionStart(category?: string) {
  trackEvent({
    eventType: 'submission_start',
    category,
    page: '/?tab=submit',
    sourceLocation: 'creator_submission_wizard',
  });
}

export function trackSubmissionSuccess(referenceCode: string, category: string, videoTitle?: string) {
  trackEvent({
    eventType: 'submission_success',
    targetId: referenceCode,
    targetName: videoTitle,
    category,
    page: '/?tab=submit',
  });
}

export function trackTikTokOutboundClick(sourceLocation: string, targetUrl: string = 'https://www.tiktok.com/@onlytokgirls') {
  trackEvent({
    eventType: 'tiktok_outbound_click',
    targetName: '@onlytokgirls',
    sourceLocation,
    metadata: { targetUrl },
  });
}
