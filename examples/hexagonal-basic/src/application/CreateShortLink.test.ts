import assert from 'node:assert/strict';
import { test } from 'node:test';
import { InvalidUrl } from '../domain/errors/ShortLinkErrors.ts';
import { InMemoryShortLinkRepository } from '../infrastructure/memory/InMemoryShortLinkRepository.ts';
import { FixedClock, SequenceCodeGenerator } from '../test/fakes.ts';
import { CreateShortLink } from './CreateShortLink.ts';

const NOW = new Date('2026-11-11T10:00:00Z');

function setup() {
  const repository = new InMemoryShortLinkRepository();
  const useCase = new CreateShortLink(
    repository,
    new SequenceCodeGenerator(['abc123']),
    new FixedClock(NOW),
  );
  return { repository, useCase };
}

test('creates and stores a short link for a valid URL', async () => {
  const { repository, useCase } = setup();

  const link = await useCase.execute('https://example.com/a/long/path');

  assert.deepEqual(link, {
    code: 'abc123',
    url: 'https://example.com/a/long/path',
    createdAt: NOW,
    visits: 0,
  });
  assert.deepEqual(await repository.findByCode('abc123'), link);
});

test('rejects anything that is not an absolute http(s) URL', async () => {
  const { repository, useCase } = setup();

  for (const url of ['', 'example.com', 'ftp://example.com', 'javascript:alert(1)']) {
    await assert.rejects(useCase.execute(url), InvalidUrl);
  }
  assert.equal(await repository.findByCode('abc123'), null);
});
