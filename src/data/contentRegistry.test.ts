import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAuthorizedVideos,
  getAuthorizedCreators,
  getVideoById,
  getCreatorById,
  getRelatedVideos,
} from './contentRegistry';

test('getAuthorizedVideos returns only authorized videos', () => {
  const videos = getAuthorizedVideos();
  assert.ok(videos.length > 0);
  assert.ok(videos.every((v) => v.isAuthorized === true));
});

test('getAuthorizedVideos filters by category correctly', () => {
  const danceVideos = getAuthorizedVideos({ category: 'Dance & Choreography' });
  assert.equal(danceVideos.length, 1);
  assert.equal(danceVideos[0].category, 'Dance & Choreography');

  const emptyCategory = getAuthorizedVideos({ category: 'Comedy & Entertainment' });
  assert.equal(emptyCategory.length, 0);
});

test('getAuthorizedVideos search works across title, creator and handle', () => {
  const searchMaya = getAuthorizedVideos({ search: 'maya' });
  assert.equal(searchMaya.length, 1);
  assert.equal(searchMaya[0].creatorName, 'Maya Lin');

  const searchHandle = getAuthorizedVideos({ search: '@kofi' });
  assert.equal(searchHandle.length, 1);
  assert.equal(searchHandle[0].creatorHandle, '@kofivance');

  const searchMissing = getAuthorizedVideos({ search: 'nonexistenttermxyz' });
  assert.equal(searchMissing.length, 0);
});

test('getAuthorizedCreators finds creators by name or handle', () => {
  const creators = getAuthorizedCreators();
  assert.ok(creators.length >= 3);
  assert.ok(creators.every((c) => c.isVerified18Plus));

  const foundZara = getAuthorizedCreators({ search: 'Zara' });
  assert.equal(foundZara.length, 1);
  assert.equal(foundZara[0].displayName, 'Zara Silva');
});

test('getVideoById and getCreatorById look up entities correctly', () => {
  const video = getVideoById('ot-video-001');
  assert.ok(video);
  assert.equal(video?.title, 'Midnight Floorwork & Precision Flow');

  const creator = getCreatorById('creator-maya-lin');
  assert.ok(creator);
  assert.equal(creator?.displayName, 'Maya Lin');
});

test('getRelatedVideos excludes the current video', () => {
  const related = getRelatedVideos('ot-video-001', 2);
  assert.ok(related.every((v) => v.id !== 'ot-video-001'));
});
