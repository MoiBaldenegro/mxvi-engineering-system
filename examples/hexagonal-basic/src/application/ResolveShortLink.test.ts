import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ShortLinkNotFound } from '../domain/errors/ShortLinkErrors.ts';
import { InMemoryShortLinkRepository } from '../infrastructure/memory/InMemoryShortLinkRepository.ts';
import { ResolveShortLink } from './ResolveShortLink.ts';

test('answers the URL and counts the visit', async () => {
  const repository = new InMemoryShortLinkRepository();
  await repository.save({
    code: 'abc123',
    url: 'https://example.com',
    createdAt: new Date('2026-11-11T10:00:00Z'),
    visits: 2,
  });
  const useCase = new ResolveShortLink(repository);

  assert.equal(await useCase.execute('abc123'), 'https://example.com');
  assert.equal((await repository.findByCode('abc123'))?.visits, 3);
});

test('reports an unknown code as not found', async () => {
  const useCase = new ResolveShortLink(new InMemoryShortLinkRepository());

  await assert.rejects(useCase.execute('nope'), ShortLinkNotFound);
});
