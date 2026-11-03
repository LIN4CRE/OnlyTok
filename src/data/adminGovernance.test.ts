import test from 'node:test';
import assert from 'node:assert/strict';

// Pure logic for admin governance and validation
export interface TestSubmission {
  id: string;
  referenceCode: string;
  creatorName: string;
  tiktokHandle: string;
  email: string;
  videoTitle: string;
  category: string;
  confirmedOwnership: boolean;
  confirmedAdult18: boolean;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'correction_requested';
}

export function computeAdminStats(
  submissions: TestSubmission[],
  publishedCount: number,
  registeredCreatorsCount: number,
  reportsCount: number
) {
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const rejectedCount = submissions.filter((s) => s.status === 'rejected').length;
  const correctionCount = submissions.filter((s) => s.status === 'correction_requested').length;

  return {
    totalApprovedVideos: publishedCount,
    pendingSubmissions: pendingCount,
    registeredCreators: registeredCreatorsCount,
    contentRemovalRequests: reportsCount,
    breakdown: {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      correction_requested: correctionCount,
    },
    hasData: publishedCount > 0 || submissions.length > 0 || registeredCreatorsCount > 0,
  };
}

export function validateConsentDossier(submission: TestSubmission): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!submission.confirmedAdult18) {
    errors.push('18+ age verification is mandatory');
  }
  if (!submission.confirmedOwnership) {
    errors.push('Copyright ownership confirmation is required');
  }
  if (!submission.acceptedTerms) {
    errors.push('Terms of syndication must be accepted');
  }
  if (!submission.acceptedPrivacy) {
    errors.push('Privacy notice must be accepted');
  }
  return { valid: errors.length === 0, errors };
}

export function checkAdminAccess(email: string, activeAdmins: Array<{ email: string; status: string; role: string }>) {
  if (!email) return { authorized: false, role: null };
  const clean = email.toLowerCase().trim();
  const match = activeAdmins.find((a) => a.email.toLowerCase() === clean && a.status === 'active');
  if (match) {
    return { authorized: true, role: match.role };
  }
  return { authorized: false, role: null };
}

test('computeAdminStats correctly aggregates database metrics', () => {
  const mockSubmissions: TestSubmission[] = [
    {
      id: 'sub-1',
      referenceCode: 'OT-CR-2026-A1',
      creatorName: 'Creator 1',
      tiktokHandle: '@creator1',
      email: 'c1@test.com',
      videoTitle: 'Test Video 1',
      category: 'Dance & Choreography',
      confirmedOwnership: true,
      confirmedAdult18: true,
      acceptedTerms: true,
      acceptedPrivacy: true,
      status: 'pending',
    },
    {
      id: 'sub-2',
      referenceCode: 'OT-CR-2026-A2',
      creatorName: 'Creator 2',
      tiktokHandle: '@creator2',
      email: 'c2@test.com',
      videoTitle: 'Test Video 2',
      category: 'Fashion & Style',
      confirmedOwnership: true,
      confirmedAdult18: true,
      acceptedTerms: true,
      acceptedPrivacy: true,
      status: 'approved',
    },
  ];

  const stats = computeAdminStats(mockSubmissions, 2, 4, 1);
  assert.equal(stats.totalApprovedVideos, 2);
  assert.equal(stats.pendingSubmissions, 1);
  assert.equal(stats.registeredCreators, 4);
  assert.equal(stats.contentRemovalRequests, 1);
  assert.equal(stats.breakdown.pending, 1);
  assert.equal(stats.breakdown.approved, 1);
  assert.equal(stats.hasData, true);
});

test('validateConsentDossier enforces strict 18+ and copyright certifications', () => {
  const validSubmission: TestSubmission = {
    id: 'sub-valid',
    referenceCode: 'OT-CR-2026-OK',
    creatorName: 'Valid Creator',
    tiktokHandle: '@validcreator',
    email: 'v@test.com',
    videoTitle: 'Approved Showcase',
    category: 'Music & Sounds',
    confirmedOwnership: true,
    confirmedAdult18: true,
    acceptedTerms: true,
    acceptedPrivacy: true,
    status: 'pending',
  };

  const validResult = validateConsentDossier(validSubmission);
  assert.equal(validResult.valid, true);
  assert.equal(validResult.errors.length, 0);

  const nonAdultSubmission: TestSubmission = {
    ...validSubmission,
    confirmedAdult18: false,
  };
  const invalidResult = validateConsentDossier(nonAdultSubmission);
  assert.equal(invalidResult.valid, false);
  assert.ok(invalidResult.errors.includes('18+ age verification is mandatory'));
});

test('checkAdminAccess authenticates dlinacre16@gmail.com as super_admin', () => {
  const admins = [
    { email: 'dlinacre16@gmail.com', status: 'active', role: 'super_admin' },
    { email: 'staff@onlytok.com', status: 'active', role: 'moderator' },
    { email: 'former@onlytok.com', status: 'revoked', role: 'moderator' },
  ];

  const superAdmin = checkAdminAccess('dlinacre16@gmail.com', admins);
  assert.equal(superAdmin.authorized, true);
  assert.equal(superAdmin.role, 'super_admin');

  const moderator = checkAdminAccess('staff@onlytok.com', admins);
  assert.equal(moderator.authorized, true);
  assert.equal(moderator.role, 'moderator');

  const revoked = checkAdminAccess('former@onlytok.com', admins);
  assert.equal(revoked.authorized, false);

  const unauthorized = checkAdminAccess('hacker@random.com', admins);
  assert.equal(unauthorized.authorized, false);
});
