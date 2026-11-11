/** Base class of every error this module can report. */
export class ShortLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** The URL to shorten is not an absolute http(s) URL. */
export class InvalidUrl extends ShortLinkError {
  constructor(readonly url: string) {
    super(`"${url}" is not a valid http(s) URL.`);
  }
}

/** No short link exists for the code. */
export class ShortLinkNotFound extends ShortLinkError {
  constructor(readonly code: string) {
    super(`No short link found for "${code}".`);
  }
}

/** The storage behind the repository could not be reached or is corrupt. */
export class ShortLinkStoreUnavailable extends ShortLinkError {
  constructor(reason: string) {
    super(`Short link storage is unavailable: ${reason}`);
  }
}
