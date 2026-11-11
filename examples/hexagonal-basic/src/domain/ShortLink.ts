/** A short code that redirects to a longer URL. Plain data: no behavior, no framework. */
export interface ShortLink {
  code: string;
  url: string;
  createdAt: Date;
  visits: number;
}
