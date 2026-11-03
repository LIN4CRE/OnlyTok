/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'correction_requested';
export type ModerationAction = 'approve' | 'reject' | 'request_correction' | 'remove';

export interface ModerationDecision {
  submissionId: string;
  action: ModerationAction;
  notes?: string;
  moderatorEmail: string;
}

export interface SubmissionRecord {
  id: string;
  referenceCode: string;
  creatorName: string;
  tiktokHandle: string;
  email: string;
  videoTitle: string;
  videoDescription?: string;
  mediaType: 'upload' | 'url';
  mediaUrl: string;
  category: string;
  confirmedOwnership: boolean;
  confirmedAdult18: boolean;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  status: SubmissionStatus;
  moderationNotes?: string | null;
  moderatorEmail?: string | null;
  moderatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function applyModerationAction(
  submission: SubmissionRecord,
  decision: ModerationDecision
): { updatedSubmission: SubmissionRecord; isPublished: boolean } {
  const timestamp = new Date().toISOString();
  let nextStatus: SubmissionStatus;
  let isPublished = false;

  switch (decision.action) {
    case 'approve':
      nextStatus = 'approved';
      isPublished = true;
      break;
    case 'reject':
      nextStatus = 'rejected';
      isPublished = false;
      break;
    case 'request_correction':
      nextStatus = 'correction_requested';
      isPublished = false;
      break;
    case 'remove':
      nextStatus = 'pending';
      isPublished = false;
      break;
    default:
      throw new Error(`Invalid moderation action: ${decision.action}`);
  }

  const updatedSubmission: SubmissionRecord = {
    ...submission,
    status: nextStatus,
    moderatorEmail: decision.moderatorEmail,
    moderationNotes: decision.notes ? decision.notes.trim() : null,
    moderatedAt: timestamp,
    updatedAt: timestamp,
  };

  return { updatedSubmission, isPublished };
}

export function validateVideoUploadMeta(file: {
  size: number;
  type: string;
  name: string;
}): { valid: boolean; error?: string } {
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_MIME = ['video/mp4', 'video/webm', 'video/quicktime'];
  const ALLOWED_EXT = ['.mp4', '.webm', '.mov'];

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size exceeds maximum allowed limit of 50MB.' };
  }

  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_EXT.includes(ext) || !ALLOWED_MIME.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file format. Only MP4, WebM, and MOV video files are supported.',
    };
  }

  return { valid: true };
}
