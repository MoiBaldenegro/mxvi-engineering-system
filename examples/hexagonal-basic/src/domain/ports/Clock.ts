/** Output port: the current time, so use cases never call `new Date()` themselves. */
export interface Clock {
  now(): Date;
}
