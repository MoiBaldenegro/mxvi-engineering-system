import type { ShortLink } from '../ShortLink.ts';

/**
 * Output port: what the application needs from storage, in domain terms.
 * Implementations live in infrastructure and translate their own failures to
 * `ShortLinkStoreUnavailable`.
 */
export interface ShortLinkRepository {
  /** Returns `null` when the code does not exist; the use case decides what that means. */
  findByCode(code: string): Promise<ShortLink | null>;
  /** Creates the link or replaces the one with the same code. */
  save(link: ShortLink): Promise<void>;
}
