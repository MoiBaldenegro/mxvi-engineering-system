import type { Clock } from '../../domain/ports/Clock.ts';

/** Output adapter: the machine clock. */
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
