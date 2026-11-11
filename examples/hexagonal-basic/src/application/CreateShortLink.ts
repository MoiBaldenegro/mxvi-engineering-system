import { InvalidUrl } from '../domain/errors/ShortLinkErrors.ts';
import type { Clock } from '../domain/ports/Clock.ts';
import type { CodeGenerator } from '../domain/ports/CodeGenerator.ts';
import type { ShortLinkRepository } from '../domain/ports/ShortLinkRepository.ts';
import type { ShortLink } from '../domain/ShortLink.ts';
import { isValidTargetUrl } from '../domain/shortLinkRules.ts';

/** Use case: shorten a URL. One class, one public method, one reason to change. */
export class CreateShortLink {
  constructor(
    private readonly repository: ShortLinkRepository,
    private readonly codes: CodeGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(url: string): Promise<ShortLink> {
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
}
