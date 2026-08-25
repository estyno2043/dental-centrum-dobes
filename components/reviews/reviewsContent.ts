/**
 * Google reviews shown in the bar that rises from the bottom of the hero.
 *
 * ⚠️ EVERY ENTRY BELOW IS A PLACEHOLDER. The text says so out loud, the names
 * are not names, and none of it may reach production. They exist so the bar
 * can be judged with something in it; the user is sending the real reviews.
 *
 * When the real ones arrive, two rules hold:
 *
 *   Verbatim. A review is the reviewer's own writing. Tidying the grammar, or
 *   trimming the half that is less flattering, turns their words into ours and
 *   puts a sentence in a real person's mouth. Copy them exactly; if one is too
 *   long for the bar, let the bar scroll rather than editing the person.
 *
 *   Attributed as Google shows it. The name and the star count are part of the
 *   claim being made — a review with the rating quietly dropped, or with a
 *   surname invented, is no longer the thing Google is vouching for.
 *
 * `googleProfileUrl` is the clinic's own Google listing. Until it is filled in
 * the bar renders without the "read them on Google" link rather than pointing
 * somewhere invented — that link is the reader's only way to check any of
 * this, so a wrong one is worse than none.
 */

export type Review = {
  readonly id: string;
  /** As Google displays it. Never expanded, abbreviated or corrected. */
  readonly author: string;
  /** Whole stars, 1–5, as given. */
  readonly rating: 1 | 2 | 3 | 4 | 5;
  /** Google's own relative wording, e.g. "pred 2 mesiacmi". */
  readonly date: string;
  /** The review, exactly as written. */
  readonly text: string;
};

/** ⚠️ Placeholder — replace wholesale, do not edit into shape. */
export const reviews: readonly Review[] = [
  {
    id: "placeholder-1",
    author: "Meno Priezvisko",
    rating: 5,
    date: "pred 2 mesiacmi",
    text:
      "SEM PRÍDE SKUTOČNÁ GOOGLE RECENZIA. Tento text je iba výplň, aby sa " +
      "dal posúdiť vzhľad lišty — nie je to ničia recenzia a nesmie ísť von.",
  },
  {
    id: "placeholder-2",
    author: "Meno Priezvisko",
    rating: 5,
    date: "pred 4 mesiacmi",
    text:
      "SEM PRÍDE SKUTOČNÁ GOOGLE RECENZIA. Druhá výplň, kratšia, aby bolo " +
      "vidieť, ako lišta reaguje na rôzne dĺžky textu.",
  },
  {
    id: "placeholder-3",
    author: "Meno Priezvisko",
    rating: 4,
    date: "pred rokom",
    text:
      "SEM PRÍDE SKUTOČNÁ GOOGLE RECENZIA. Tretia výplň, tentoraz so štyrmi " +
      "hviezdičkami, aby bolo vidieť aj neúplné hodnotenie.",
  },
];

/**
 * The headline rating, as Google shows it today.
 *
 * ⚠️ `average` matches the hero's trust strip and carries the same problem:
 * nothing in the repository records where 4,5 came from or when. `count` is
 * null until the clinic supplies it — a review count is checkable in one
 * click, so a guessed one is caught immediately.
 */
export const reviewSummary = {
  average: "4,5",
  count: null as number | null,
} as const;

/** ⚠️ The clinic's Google listing. Null until supplied; never guessed. */
export const googleProfileUrl: string | null = null;
