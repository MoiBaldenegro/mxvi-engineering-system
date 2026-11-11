import type { ShortLinkRepository } from '../../domain/ports/ShortLinkRepository.ts';
import type { ShortLink } from '../../domain/ShortLink.ts';

/** Output adapter for tests and local runs: keeps the links in a Map. */
export class InMemoryShortLinkRepository implements ShortLinkRepository {
  private readonly links = new Map<string, ShortLink>();

  async findByCode(code: string): Promise<ShortLink | null> {
    const link = this.links.get(code);
    return link ? { ...link } : null;
  }

  async save(link: ShortLink): Promise<void> {
    this.links.set(link.code, { ...link });
  }
}
