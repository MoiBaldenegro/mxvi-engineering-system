import assert from 'node:assert/strict';
import { test } from 'node:test';
import { InvalidUrl, ShortLinkNotFound } from '../../src/domain/errors/ShortLinkErrors.ts';
import { InMemoryShortLinkRepository } from '../../src/infrastructure/memory/InMemoryShortLinkRepository.ts';
import { FixedClock, SequenceCodeGenerator } from '../../src/test/fakes.ts';
import { ShortLinkService } from './ShortLinkService.ts';

const setup = () =>
  new ShortLinkService(
    new InMemoryShortLinkRepository(),
    new SequenceCodeGenerator(['abc123']),
    new FixedClock(new Date('2026-11-11T10:00:00Z')),
  );

test('creates a link and resolves it, counting the visit', async () => {
  const service = setup();

  const link = await service.create('https://example.com');

  assert.equal(link.code, 'abc123');
  assert.equal(await service.resolve('abc123'), 'https://example.com');
});

test('reports the same domain errors as the use cases', async () => {
  const service = setup();

  await assert.rejects(service.create('nope'), InvalidUrl);
  await assert.rejects(service.resolve('missing'), ShortLinkNotFound);
});
