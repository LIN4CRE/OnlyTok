import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeTikTokHandle,
  isValidEmail,
  validateCreatorSubmission,
  validateBrandInquiry,
  generateReferenceCode,
  calculateAge,
  validateTwoTierAgeVerification,
  classifyReportPriority,
} from './submissionValidator';

test('normalizeTikTokHandle ensures @ prefix', () => {
  assert.equal(normalizeTikTokHandle('onlytokgirls'), '@onlytokgirls');
  assert.equal(normalizeTikTokHandle('@onlytokgirls'), '@onlytokgirls');
  assert.equal(normalizeTikTokHandle('  creator_one  '), '@creator_one');
  assert.equal(normalizeTikTokHandle(''), '');
});

test('isValidEmail checks email validity correctly', () => {
  assert.equal(isValidEmail('contact@onlytok.com'), true);
  assert.equal(isValidEmail('hello.world@sub.domain.co.uk'), true);
  assert.equal(isValidEmail('invalid-email'), false);
  assert.equal(isValidEmail('user@'), false);
  assert.equal(isValidEmail(''), false);
});

test('validateCreatorSubmission enforces 18+ age verification and consent', () => {
  const invalidResult = validateCreatorSubmission({
    fullName: 'Jane Doe',
    creatorHandle: 'janedoe',
    email: 'jane@example.com',
    primaryCategory: 'Dance & Choreography',
    isConfirmed18Plus: false,
    hasConsentedToFeature: true,
  });

  assert.equal(invalidResult.isValid, false);
  assert.ok(invalidResult.errors.isConfirmed18Plus);

  const missingConsent = validateCreatorSubmission({
    fullName: 'Jane Doe',
    creatorHandle: 'janedoe',
    email: 'jane@example.com',
    primaryCategory: 'Dance & Choreography',
    isConfirmed18Plus: true,
    hasConsentedToFeature: false,
  });

  assert.equal(missingConsent.isValid, false);
  assert.ok(missingConsent.errors.hasConsentedToFeature);

  const validResult = validateCreatorSubmission({
    fullName: 'Jane Doe',
    creatorHandle: 'janedoe',
    email: 'jane@example.com',
    primaryCategory: 'Dance & Choreography',
    isConfirmed18Plus: true,
    hasConsentedToFeature: true,
  });

  assert.equal(validResult.isValid, true);
  assert.deepEqual(validResult.errors, {});
});

test('validateBrandInquiry validates required fields and length', () => {
  const invalidResult = validateBrandInquiry({
    companyName: '',
    contactName: 'A',
    workEmail: 'notanemail',
    campaignType: '',
    budgetRange: '$5k - $10k',
    message: 'Short',
  });

  assert.equal(invalidResult.isValid, false);
  assert.ok(invalidResult.errors.companyName);
  assert.ok(invalidResult.errors.workEmail);
  assert.ok(invalidResult.errors.campaignType);
  assert.ok(invalidResult.errors.message);

  const validResult = validateBrandInquiry({
    companyName: 'Acme Entertainment',
    contactName: 'Sarah Jenkins',
    workEmail: 'sarah@acme.com',
    campaignType: 'Sponsored Spotlight',
    budgetRange: '$10k - $25k',
    message: 'We are looking to sponsor upcoming creator spotlight series in Q4.',
  });

  assert.equal(validResult.isValid, true);
});

test('generateReferenceCode formats reference codes with correct prefix', () => {
  const creatorCode = generateReferenceCode('OT-CR');
  assert.match(creatorCode, /^OT-CR-\d{4}-\d{4}$/);

  const partnerCode = generateReferenceCode('OT-BP');
  assert.match(partnerCode, /^OT-BP-\d{4}-\d{4}$/);

  const repCode = generateReferenceCode('REP');
  assert.match(repCode, /^REP-\d{4}-\d{4}$/);

  const gdprCode = generateReferenceCode('GDPR');
  assert.match(gdprCode, /^GDPR-\d{4}-\d{4}$/);
});

test('calculateAge computes exact age correctly', () => {
  // Mock reference date 2026-11-01
  const refDate = new Date('2026-11-01T12:00:00Z');
  assert.equal(calculateAge('2000-01-01', refDate), 26);
  assert.equal(calculateAge('2008-10-31', refDate), 18);
  assert.equal(calculateAge('2008-11-05', refDate), 17); // Under 18
  assert.equal(calculateAge('', refDate), 0);
});

test('validateTwoTierAgeVerification enforces strict 18+, credentials, and child safety', () => {
  // Under 18
  const minorResult = validateTwoTierAgeVerification(
    '2012-05-15',
    'UK Driving Licence',
    'Jane Doe',
    true,
    true
  );
  assert.equal(minorResult.isValid, false);
  assert.ok(minorResult.errors.birthDate);

  // Missing signature
  const noSigResult = validateTwoTierAgeVerification(
    '2000-05-15',
    'UK Driving Licence',
    '',
    true,
    true
  );
  assert.equal(noSigResult.isValid, false);
  assert.ok(noSigResult.errors.digitalSignature);

  // Missing minor safety declaration
  const minorSafetyFail = validateTwoTierAgeVerification(
    '2000-05-15',
    'UK Driving Licence',
    'Jane Doe',
    false,
    true
  );
  assert.equal(minorSafetyFail.isValid, false);
  assert.ok(minorSafetyFail.errors.confirmedNoMinors);

  // Valid 18+ applicant
  const validResult = validateTwoTierAgeVerification(
    '2002-04-10',
    'UK Driving Licence',
    'Jane Doe',
    true,
    true
  );
  assert.equal(validResult.isValid, true);
});

test('classifyReportPriority classifies NCII and minors as CRITICAL_SAFETY with 6h SLA', () => {
  const ncii = classifyReportPriority('ncii_report');
  assert.equal(ncii.urgency, 'CRITICAL_SAFETY');
  assert.equal(ncii.slaHours, 6);

  const age = classifyReportPriority('age_verification');
  assert.equal(age.urgency, 'CRITICAL_SAFETY');
  assert.equal(age.slaHours, 6);

  const copyright = classifyReportPriority('copyright_dmca');
  assert.equal(copyright.urgency, 'PRIORITY_LEGAL');
  assert.equal(copyright.slaHours, 24);

  const general = classifyReportPriority('other');
  assert.equal(general.urgency, 'STANDARD_MODERATION');
  assert.equal(general.slaHours, 48);
});
