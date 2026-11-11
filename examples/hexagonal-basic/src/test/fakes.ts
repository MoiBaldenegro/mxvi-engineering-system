import type { Clock } from '../domain/ports/Clock.ts';
import type { CodeGenerator } from '../domain/ports/CodeGenerator.ts';

/** Clock that always answers the same instant. */
export class FixedClock implements Clock {
  constructor(private readonly instant: Date) {}

  now(): Date {
    return this.instant;
  }
}

/** Code generator that answers the given codes in order. */
export class SequenceCodeGenerator implements CodeGenerator {
  private index = 0;

  constructor(private readonly codes: string[]) {}

  next(): string {
    const code = this.codes[this.index];
    this.index += 1;

    if (code === undefined) {
      throw new Error('SequenceCodeGenerator ran out of codes.');
    }

    return code;
  }
}
