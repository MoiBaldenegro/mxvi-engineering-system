import { randomBytes } from 'node:crypto';
import type { CodeGenerator } from '../../domain/ports/CodeGenerator.ts';

/** Output adapter: 6 random URL-safe characters. */
export class RandomCodeGenerator implements CodeGenerator {
  next(): string {
    return randomBytes(6).toString('base64url').slice(0, 6);
  }
}
