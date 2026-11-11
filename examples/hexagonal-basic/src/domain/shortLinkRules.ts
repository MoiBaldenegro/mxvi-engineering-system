/** Business rules as pure functions: same input, same output, no I/O. */

const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/** Only absolute http(s) URLs can be shortened. */
export function isValidTargetUrl(value: string): boolean {
  try {
    return ALLOWED_PROTOCOLS.includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
