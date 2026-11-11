import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { ShortLinkStoreUnavailable } from '../domain/errors/ShortLinkErrors.ts';
import type { ShortLinkRepository } from '../domain/ports/ShortLinkRepository.ts';
import type { ShortLink } from '../domain/ShortLink.ts';
import { JsonFileShortLinkRepository } from './file/JsonFileShortLinkRepository.ts';
import { InMemoryShortLinkRepository } from './memory/InMemoryShortLinkRepository.ts';

const link: ShortLink = {
  code: 'abc123',
  url: 'https://example.com',
  createdAt: new Date('2026-11-11T10:00:00Z'),
  visits: 0,
};

const tempFile = async () => join(await mkdtemp(join(tmpdir(), 'links-')), 'links.json');

// The same contract runs against every adapter of the port: if a new adapter
// passes it, the application works with it unchanged.
const adapters: Array<[string, () => Promise<ShortLinkRepository>]> = [
  ['InMemoryShortLinkRepository', async () => new InMemoryShortLinkRepository()],
  ['JsonFileShortLinkRepository', async () => new JsonFileShortLinkRepository(await tempFile())],
];

for (const [name, create] of adapters) {
  test(`${name}: answers null for an unknown code`, async () => {
    assert.equal(await (await create()).findByCode('nope'), null);
  });

  test(`${name}: returns what was saved`, async () => {
    const repository = await create();
    await repository.save(link);

    assert.deepEqual(await repository.findByCode('abc123'), link);
  });

  test(`${name}: saving the same code replaces the link`, async () => {
    const repository = await create();
    await repository.save(link);
    await repository.save({ ...link, visits: 5 });

    assert.equal((await repository.findByCode('abc123'))?.visits, 5);
  });
}

test('JsonFileShortLinkRepository: translates a corrupt file to a domain error', async () => {
  const file = await tempFile();
  await writeFile(file, 'not json');

  await assert.rejects(
    new JsonFileShortLinkRepository(file).findByCode('abc123'),
    ShortLinkStoreUnavailable,
  );
});
