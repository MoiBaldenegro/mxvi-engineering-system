import type { IncomingMessage, ServerResponse } from 'node:http';
import type { CreateShortLink } from '../../application/CreateShortLink.ts';
import type { ResolveShortLink } from '../../application/ResolveShortLink.ts';
import {
  InvalidUrl,
  ShortLinkNotFound,
  ShortLinkStoreUnavailable,
} from '../../domain/errors/ShortLinkErrors.ts';

/** The use cases this entry adapter drives. It never sees a repository. */
export interface ShortLinkHttpDependencies {
  createShortLink: CreateShortLink;
  resolveShortLink: ResolveShortLink;
}

/**
 * Input adapter: translates HTTP into use case calls and results (or domain
 * errors) back into HTTP. No business rule lives here.
 *
 *   POST /links   { "url": "https://..." }  -> 201 { code, url }
 *   GET  /:code                             -> 302 Location: <url>
 */
export function createShortLinkHttpHandler(deps: ShortLinkHttpDependencies) {
  return async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    try {
      const path = new URL(request.url ?? '/', 'http://localhost').pathname;

      if (request.method === 'POST' && path === '/links') {
        const body = await readJson(request);
        const link = await deps.createShortLink.execute(String(body.url ?? ''));
        return sendJson(response, 201, { code: link.code, url: link.url });
      }

      if (request.method === 'GET' && path.length > 1) {
        const url = await deps.resolveShortLink.execute(path.slice(1));
        response.writeHead(302, { Location: url });
        response.end();
        return;
      }

      sendJson(response, 404, { error: 'Not found' });
    } catch (error) {
      const [status, message] = toHttpError(error);
      sendJson(response, status, { error: message });
    }
  };
}

/** The only place that knows which HTTP status each domain error means. */
function toHttpError(error: unknown): [number, string] {
  if (error instanceof InvalidUrl || error instanceof SyntaxError) {
    return [400, error.message];
  }
  if (error instanceof ShortLinkNotFound) {
    return [404, error.message];
  }
  if (error instanceof ShortLinkStoreUnavailable) {
    return [503, 'The service is temporarily unavailable.'];
  }
  return [500, 'Unexpected error.'];
}

async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(chunk as Buffer);
  }
  const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}
