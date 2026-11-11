import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, test } from 'node:test';
import { createUseCases } from '../../container.ts';
import { createShortLinkHttpHandler } from './shortLinkHttpHandler.ts';

let server: Server;
let baseUrl: string;

before(async () => {
  server = createServer(createShortLinkHttpHandler(createUseCases()));
  await new Promise<void>((resolve) => server.listen(0, resolve));
  baseUrl = `http://localhost:${(server.address() as AddressInfo).port}`;
});

after(() => server.close());

const post = (body: unknown) =>
  fetch(`${baseUrl}/links`, { method: 'POST', body: JSON.stringify(body) });

test('creates a link and redirects to it', async () => {
  const created = await post({ url: 'https://example.com/docs' });
  assert.equal(created.status, 201);
  const { code, url } = (await created.json()) as { code: string; url: string };
  assert.equal(url, 'https://example.com/docs');

  const resolved = await fetch(`${baseUrl}/${code}`, { redirect: 'manual' });
  assert.equal(resolved.status, 302);
  assert.equal(resolved.headers.get('location'), 'https://example.com/docs');
});

test('maps domain errors to HTTP statuses', async () => {
  assert.equal((await post({ url: 'not-a-url' })).status, 400);
  assert.equal((await fetch(`${baseUrl}/missing`, { redirect: 'manual' })).status, 404);
});
