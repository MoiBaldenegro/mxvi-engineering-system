/** Output port: source of new short codes. */
export interface CodeGenerator {
  next(): string;
}
