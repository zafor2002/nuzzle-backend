/**
 * Hashtags are derived from post captions rather than entered separately.
 * Tags are stored lower-cased and without the leading '#', so "#Corgi" and
 * "#corgi" are the same tag.
 */

// Letters, digits and underscore, 1-50 chars, not purely numeric (so "#1" and
// dates like "#2026" don't become tags). Unicode-aware so non-Latin tags work.
const HASHTAG_RE = /#([\p{L}\p{N}_]{1,50})/gu;

export function extractHashtags(caption: string | null | undefined): string[] {
  if (!caption) return [];
  const found = new Set<string>();
  for (const match of caption.matchAll(HASHTAG_RE)) {
    const raw = match[1];
    if (/^\p{N}+$/u.test(raw)) continue; // skip purely numeric
    found.add(raw.toLowerCase());
  }
  // Cap per post so one caption can't create unbounded rows.
  return [...found].slice(0, 30);
}

export type CaptionToken =
  | { type: "text"; value: string }
  | { type: "hashtag"; value: string; tag: string };

/** Splits a caption into plain text and hashtag tokens for rendering. */
export function tokenizeCaption(caption: string): CaptionToken[] {
  const tokens: CaptionToken[] = [];
  let last = 0;
  for (const match of caption.matchAll(HASHTAG_RE)) {
    const raw = match[1];
    if (/^\p{N}+$/u.test(raw)) continue;
    const start = match.index ?? 0;
    if (start > last) tokens.push({ type: "text", value: caption.slice(last, start) });
    tokens.push({ type: "hashtag", value: match[0], tag: raw.toLowerCase() });
    last = start + match[0].length;
  }
  if (last < caption.length) tokens.push({ type: "text", value: caption.slice(last) });
  return tokens;
}
