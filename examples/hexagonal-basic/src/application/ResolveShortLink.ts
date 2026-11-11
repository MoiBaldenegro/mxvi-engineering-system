import { ShortLinkNotFound } from '../domain/errors/ShortLinkErrors.ts';
import type { ShortLinkRepository } from '../domain/ports/ShortLinkRepository.ts';

/** Use case: follow a short code to its URL and count the visit. */
export class ResolveShortLink {
  constructor(private readonly repository: ShortLinkRepository) {}

  async execute(code: string): Promise<string> {
    const link = await this.repository.findByCode(code);

    if (link === null) {
      throw new ShortLinkNotFound(code);
    }

    await this.repository.save({ ...link, visits: link.visits + 1 });

    return link.url;
  }
}
