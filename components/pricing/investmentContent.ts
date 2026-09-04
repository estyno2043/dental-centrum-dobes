/**
 * "Investujte do svojho úsmevu" — the homepage's closing section.
 *
 * A showcase rather than a price band: one service at a time, its name on the
 * left, its card in the middle and what you get on the right, over a
 * photograph that cross-fades as you scroll from one to the next.
 *
 * ⚠️ Built for several and populated with one. The background photography for
 * the rest has not been chosen, and a slide with a borrowed background is
 * worse than a section with one slide — so `slides` is the whole of it, and
 * adding the second is an entry here rather than a rebuild.
 *
 * Bullets, not prose, and deliberately mixed: what it includes, what it costs
 * and what it saves you sit in the same list. Somebody scanning this is
 * deciding whether to click, not reading a brochure — and separating "what you
 * get" from "what it costs" makes them hunt for the half that decides it.
 */

export type ShowcaseSlide = {
  /** Matches a service slug, so the card links and morphs like the others. */
  readonly slug: string;
  /** Short. The card underneath carries the service's full name. */
  readonly title: string;
  readonly kicker: string;
  /** File stem under `public/media`. */
  readonly background: string;
  readonly backgroundAlt: string;
  readonly points: readonly string[];
  /** The line that closes the sell, under the bullets. */
  readonly price: { readonly value: string; readonly was?: string; readonly note: string };
};

export const investmentIntro = {
  eyebrow: "Cenník",
  headline: "Investujte do svojho úsmevu.",
  lead:
    "Cenu vám povieme skôr, než začneme — a tu je, čo za ňu dostanete. " +
    "Zvyšok nájdete v cenníku.",
} as const;

export const slides: readonly ShowcaseSlide[] = [
  {
    slug: "vstupna-prehliadka",
    kicker: "Pre nových pacientov",
    title: "Vstupná prehliadka",
    background: "cennik-pozadie-01",
    backgroundAlt: "",
    points: [
      "Komplexné vyšetrenie celej ústnej dutiny",
      "4× intraorálny RTG snímok",
      "Panoramatický snímok celého chrupu — zdarma",
      "Plán ošetrenia: čo je súrne a čo pokojne počká",
      "Trvá zhruba 30 minút",
      "Nič si nemusíte priniesť",
    ],
    price: {
      value: "80 €",
      was: "105 €",
      note: "Panoramatický snímok nedoplácate.",
    },
  },
];
