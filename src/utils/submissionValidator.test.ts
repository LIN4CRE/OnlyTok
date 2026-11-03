import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeTikTokHandle,
  isValidEmail,
  validateCreatorSubmission,
  validateBrandInquiry,
  generateReferenceCode,
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
});
