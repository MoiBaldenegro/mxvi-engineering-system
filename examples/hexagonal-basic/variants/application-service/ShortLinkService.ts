import { InvalidUrl, ShortLinkNotFound } from '../../src/domain/errors/ShortLinkErrors.ts';
import type { Clock } from '../../src/domain/ports/Clock.ts';
import type { CodeGenerator } from '../../src/domain/ports/CodeGenerator.ts';
import type { ShortLinkRepository } from '../../src/domain/ports/ShortLinkRepository.ts';
import type { ShortLink } from '../../src/domain/ShortLink.ts';
import { isValidTargetUrl } from '../../src/domain/shortLinkRules.ts';

/**
 * Application service: the same operations as the use case classes, grouped in
 * one class per area. Same ports, same domain, same errors.
 */
export class ShortLinkService {
  constructor(
    private readonly repository: ShortLinkRepository,
    private readonly codes: CodeGenerator,
    private readonly clock: Clock,
  ) {}

  async create(url: string): Promise<ShortLink> {
    if (!isValidTargetUrl(url)) {
      throw new InvalidUrl(url);
    }

    const link: ShortLink = {
      code: this.codes.next(),
      url,
      createdAt: this.clock.now(),
      visits: 0,
    };
    await this.repository.save(link);

    return link;
  }

  async resolve(code: string): Promise<string> {
    const link = await this.repository.findByCode(code);

    if (link === null) {
      throw new ShortLinkNotFound(code);
    }

    await this.repository.save({ ...link, visits: link.visits + 1 });

    return link.url;
  }
}
