import { readFile, writeFile } from 'node:fs/promises';
import { ShortLinkStoreUnavailable } from '../../domain/errors/ShortLinkErrors.ts';
import type { ShortLinkRepository } from '../../domain/ports/ShortLinkRepository.ts';
import type { ShortLink } from '../../domain/ShortLink.ts';

/** How a link is stored on disk. It belongs to this adapter, not to the domain. */
interface ShortLinkRecord {
  code: string;
  url: string;
  created_at: string;
  visits: number;
}

const toRecord = (link: ShortLink): ShortLinkRecord => ({
  code: link.code,
  url: link.url,
  created_at: link.createdAt.toISOString(),
  visits: link.visits,
});

const toDomain = (record: ShortLinkRecord): ShortLink => ({
  code: record.code,
  url: record.url,
  createdAt: new Date(record.created_at),
  visits: record.visits,
});

/** Output adapter: stores the links in a JSON file. */
export class JsonFileShortLinkRepository implements ShortLinkRepository {
  constructor(private readonly filePath: string) {}

  async findByCode(code: string): Promise<ShortLink | null> {
    const record = (await this.readAll()).find((item) => item.code === code);
    return record ? toDomain(record) : null;
  }

  async save(link: ShortLink): Promise<void> {
    const records = (await this.readAll()).filter((item) => item.code !== link.code);
    records.push(toRecord(link));

    try {
      await writeFile(this.filePath, JSON.stringify(records, null, 2));
    } catch (error) {
      throw new ShortLinkStoreUnavailable(describe(error));
    }
  }

  private async readAll(): Promise<ShortLinkRecord[]> {
    let content: string;

    try {
      content = await readFile(this.filePath, 'utf8');
    } catch (error) {
      // A missing file is an empty store, not a failure.
      if (isMissingFile(error)) {
        return [];
      }
      throw new ShortLinkStoreUnavailable(describe(error));
    }

    try {
      return JSON.parse(content) as ShortLinkRecord[];
    } catch {
      throw new ShortLinkStoreUnavailable('the file is not valid JSON');
    }
  }
}

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
