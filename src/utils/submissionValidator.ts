/**
 * ONLYTOK - Validation & Logic Utilities
 * Handles creator submission validation, age confirmation, brand partnership vetting,
 * and deterministic reference code generation.
 */

export interface CreatorSubmissionInput {
  fullName: string;
  creatorHandle: string;
  email: string;
  primaryCategory: string;
  portfolioUrl?: string;
  isConfirmed18Plus: boolean;
  hasConsentedToFeature: boolean;
  notes?: string;
}

export interface BrandInquiryInput {
  companyName: string;
  contactName: string;
  workEmail: string;
  campaignType: string;
  budgetRange: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Normalizes a TikTok handle to ensure standard @handle format.
 */
export function normalizeTikTokHandle(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

/**
 * Validates email format with standard RFC regex.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validates Creator Feature Application with strict 18+ and consent enforcement.
 */
export function validateCreatorSubmission(input: CreatorSubmissionInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.fullName = 'Full legal name or stage name is required (min 2 characters).';
  }

  const handle = normalizeTikTokHandle(input.creatorHandle || '');
  if (!handle || handle.length < 3) {
    errors.creatorHandle = 'Valid TikTok handle is required (e.g., @creator).';
  }

  if (!input.email || !isValidEmail(input.email)) {
    errors.email = 'A valid contact email address is required.';
  }

  if (!input.primaryCategory || input.primaryCategory === '') {
    errors.primaryCategory = 'Please select your primary content category.';
  }

  // Strict 18+ enforcement
  if (!input.isConfirmed18Plus) {
    errors.isConfirmed18Plus = 'You must explicitly verify you are at least 18 years of age.';
  }

  // Strict Consent enforcement
  if (!input.hasConsentedToFeature) {
    errors.hasConsentedToFeature = 'You must accept the ONLYTOK content rights and feature release terms.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates Brand Partnership & Media Inquiry.
 */
export function validateBrandInquiry(input: BrandInquiryInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.companyName || input.companyName.trim().length < 2) {
    errors.companyName = 'Company or agency name is required.';
  }

  if (!input.contactName || input.contactName.trim().length < 2) {
    errors.contactName = 'Contact name is required.';
  }

  if (!input.workEmail || !isValidEmail(input.workEmail)) {
    errors.workEmail = 'A valid corporate or work email address is required.';
  }

  if (!input.campaignType || input.campaignType === '') {
    errors.campaignType = 'Please select a campaign collaboration type.';
  }

  if (!input.message || input.message.trim().length < 10) {
    errors.message = 'Please provide details on your campaign objectives (min 10 characters).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generates an auditable tracking reference code.
 */
export function generateReferenceCode(prefix: 'OT-CR' | 'OT-BP' | 'REP' | 'GDPR' | 'INQ'): string {
  const randomSegment = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${randomSegment}`;
}

/**
 * Calculates current age from ISO birth date string.
 */
export function calculateAge(dobString: string, referenceDate: Date = new Date()): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 0;
  const ageDiffMs = referenceDate.getTime() - dob.getTime();
  const ageDate = new Date(ageDiffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

/**
 * Validates Two-Tier 18+ Statutory Verification Model.
 */
export function validateTwoTierAgeVerification(
  dobString: string,
  idDocumentType: string,
  digitalSignature: string,
  confirmedNoMinors: boolean,
  confirmedNoExplicitPorn: boolean
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!dobString) {
    errors.birthDate = 'Date of birth is required for 18+ age verification.';
  } else {
    const age = calculateAge(dobString);
    if (age < 18) {
      errors.birthDate = `Strict 18+ Policy: Applicant age (${age}) is below legal threshold.`;
    }
  }

  const validIdTypes = [
    'UK Driving Licence',
    'Passport (UK or International)',
    'National Identity Card',
    'Verified TikTok Creator Portal Account',
  ];
  if (!idDocumentType || !validIdTypes.includes(idDocumentType)) {
    errors.idDocumentType = 'Valid government or creator portal credential type is required.';
  }

  if (!digitalSignature || digitalSignature.trim().length < 3) {
    errors.digitalSignature = 'Typed legal full name is required as a legally binding digital signature.';
  }

  if (!confirmedNoMinors) {
    errors.confirmedNoMinors = 'Mandatory Child Safety Declaration: You must certify zero minors appear.';
  }

  if (!confirmedNoExplicitPorn) {
    errors.confirmedNoExplicitPorn = 'Mainstream Standard: You must certify zero explicit pornography or NCII appears.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Classifies content report urgency into SLA tiers under UK safety guidelines.
 */
export function classifyReportPriority(reportType: string): {
  urgency: 'CRITICAL_SAFETY' | 'PRIORITY_LEGAL' | 'STANDARD_MODERATION';
  slaHours: number;
} {
  switch (reportType) {
    case 'ncii_report':
    case 'age_verification':
      return { urgency: 'CRITICAL_SAFETY', slaHours: 6 };
    case 'copyright_dmca':
    case 'rights_dispute':
      return { urgency: 'PRIORITY_LEGAL', slaHours: 24 };
    default:
      return { urgency: 'STANDARD_MODERATION', slaHours: 48 };
  }
}

/**
 * Brand color tokens definition.
 */
export const BRAND_COLORS = [
  {
    name: 'Obsidian Black',
    hex: '#09090C',
    role: 'Primary Canvas (60%)',
    description: 'Deep architectural black, zero blue wash, high contrast base.',
  },
  {
    name: 'Charcoal Noir',
    hex: '#121217',
    role: 'Structural Cards (30%)',
    description: 'Elevated surfaces, card backdrops, subtle hairline borders.',
  },
  {
    name: 'Electric Hot Pink',
    hex: '#FF2A85',
    role: 'Primary Accent (10%)',
    description: 'Core brand signature, primary CTA, active states.',
  },
  {
    name: 'Vivid Magenta',
    hex: '#D90368',
    role: 'Secondary Accent',
    description: 'Gradient transitions, secondary focal highlights.',
  },
  {
    name: 'Deep Violet',
    hex: '#7928CA',
    role: 'Tertiary Shade',
    description: 'Subtle shadows, depth gradients, ambient refractions.',
  },
  {
    name: 'Crisp White',
    hex: '#F4F4F5',
    role: 'Typography',
    description: 'Clean readable editorial type, 4.5:1+ WCAG AA contrast.',
  },
];
