import { CreateShortLink } from './application/CreateShortLink.ts';
import { ResolveShortLink } from './application/ResolveShortLink.ts';
import type { ShortLinkRepository } from './domain/ports/ShortLinkRepository.ts';
import { JsonFileShortLinkRepository } from './infrastructure/file/JsonFileShortLinkRepository.ts';
import { InMemoryShortLinkRepository } from './infrastructure/memory/InMemoryShortLinkRepository.ts';
import { RandomCodeGenerator } from './infrastructure/system/RandomCodeGenerator.ts';
import { SystemClock } from './infrastructure/system/SystemClock.ts';

export interface AppConfig {
  /** Path of the JSON file that stores the links; in memory when it is not set. */
  dataFile?: string;
}

export interface UseCases {
  createShortLink: CreateShortLink;
  resolveShortLink: ResolveShortLink;
}

/**
 * Composition root: the only place that knows which adapter implements each
 * port. Changing storage means changing this function and nothing else.
 */
export function createUseCases(config: AppConfig = {}): UseCases {
  const repository: ShortLinkRepository = config.dataFile
    ? new JsonFileShortLinkRepository(config.dataFile)
    : new InMemoryShortLinkRepository();

  return {
    createShortLink: new CreateShortLink(repository, new RandomCodeGenerator(), new SystemClock()),
    resolveShortLink: new ResolveShortLink(repository),
  };
}
