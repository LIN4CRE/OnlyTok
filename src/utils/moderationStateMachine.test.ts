/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyModerationAction,
  validateVideoUploadMeta,
  SubmissionRecord,
} from './moderationStateMachine.ts';

const baseSubmission: SubmissionRecord = {
  id: 'sub_test_123',
  referenceCode: 'OT-CR-2026-TEST',
  creatorName: 'Elena Rostova',
  tiktokHandle: '@elenadance',
  email: 'elena@dance.com',
  videoTitle: 'Urban Syncopation Routine',
  mediaType: 'upload',
  mediaUrl: '/api/media/test.mp4',
  category: 'Dance & Choreography',
  confirmedOwnership: true,
  confirmedAdult18: true,
  acceptedTerms: true,
  acceptedPrivacy: true,
  status: 'pending',
  createdAt: '2026-11-01T12:00:00Z',
  updatedAt: '2026-11-01T12:00:00Z',
};

test('applyModerationAction approves submission and flags as published', () => {
  const { updatedSubmission, isPublished } = applyModerationAction(baseSubmission, {
    submissionId: baseSubmission.id,
    action: 'approve',
    notes: 'Exceptional technique and sound sync.',
    moderatorEmail: 'dlinacre16@gmail.com',
  });

  assert.equal(updatedSubmission.status, 'approved');
  assert.equal(isPublished, true);
  assert.equal(updatedSubmission.moderatorEmail, 'dlinacre16@gmail.com');
  assert.equal(updatedSubmission.moderationNotes, 'Exceptional technique and sound sync.');
});

test('applyModerationAction rejects submission with reason notes', () => {
  const { updatedSubmission, isPublished } = applyModerationAction(baseSubmission, {
    submissionId: baseSubmission.id,
    action: 'reject',
    notes: 'Audio license clearance missing.',
    moderatorEmail: 'admin@onlytok.com',
  });

  assert.equal(updatedSubmission.status, 'rejected');
  assert.equal(isPublished, false);
  assert.equal(updatedSubmission.moderationNotes, 'Audio license clearance missing.');
});

test('applyModerationAction requests corrections', () => {
  const { updatedSubmission, isPublished } = applyModerationAction(baseSubmission, {
    submissionId: baseSubmission.id,
    action: 'request_correction',
    notes: 'Please upload higher bitrate vertical frame 9:16.',
    moderatorEmail: 'admin@onlytok.com',
  });

  assert.equal(updatedSubmission.status, 'correction_requested');
  assert.equal(isPublished, false);
});

test('applyModerationAction removes published content back to pending review', () => {
  const approvedSub: SubmissionRecord = { ...baseSubmission, status: 'approved' };
  const { updatedSubmission, isPublished } = applyModerationAction(approvedSub, {
    submissionId: approvedSub.id,
    action: 'remove',
    notes: 'Revoked on creator request.',
    moderatorEmail: 'admin@onlytok.com',
  });

  assert.equal(updatedSubmission.status, 'pending');
  assert.equal(isPublished, false);
});

test('validateVideoUploadMeta validates sizes, formats, and mimes', () => {
  const validMp4 = { size: 10 * 1024 * 1024, type: 'video/mp4', name: 'routine.mp4' };
  assert.equal(validateVideoUploadMeta(validMp4).valid, true);

  const oversized = { size: 60 * 1024 * 1024, type: 'video/mp4', name: 'big.mp4' };
  const overRes = validateVideoUploadMeta(oversized);
  assert.equal(overRes.valid, false);
  assert.match(overRes.error!, /50MB/);

  const badType = { size: 5 * 1024 * 1024, type: 'image/jpeg', name: 'photo.jpg' };
  const badRes = validateVideoUploadMeta(badType);
  assert.equal(badRes.valid, false);
  assert.match(badRes.error!, /MP4, WebM, and MOV/);
});
