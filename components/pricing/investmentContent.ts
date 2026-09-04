/**
 * "Investujte do svojho úsmevu" — the homepage's closing section.
 *
 * A showcase rather than a price band: one service at a time, its name on the
 * left, its card in the middle and what you get on the right, over a
 * photograph that cross-fades as you scroll from one to the next.
 *
 * ⚠️ Every figure is the clinic's, from the price list valid 1. 3. 2026.
 *
 * ⚠️ The whitening card's photograph is ceramic work, not whitening — there is
 * no photograph of whitening in the library. It reads as white and as careful
 * craft, which is why it stands in, and it is captioned by the card's own text
 * rather than passed off as something it is not. A real one should replace it.
 *
 * Bullets, not prose, and deliberately mixed: what it includes, what it costs
 * and what it saves you sit in the same list. Somebody scanning this is
 * deciding whether to click, not reading a brochure — and separating "what you
 * get" from "what it costs" makes them hunt for the half that decides it.
 */

export type ShowcaseSlide = {
  /** Matches a service slug, so the card links and morphs like the others. */
  readonly slug: string;
  /**
   * Overrides what the card shows.
   *
   * A slide is a *treatment*, and a service page can hold several — whitening
   * is one of five options on the aesthetics page. Without this the card would
   * carry that page's own name and photograph, and promise a reader who came
   * for whitening something broader than they asked about. The link still goes
   * to the service page, where whitening is the first thing open.
   */
  readonly card?: {
    readonly image: string;
    readonly name: string;
    readonly lead: string;
  };
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
  {
    slug: "esteticka-stomatologia",
    kicker: "Estetická stomatológia",
    title: "Bielenie Nite White",
    background: "cennik-pozadie-02",
    backgroundAlt: "",
    card: {
      image: "bielenie-karta",
      name: "Bielenie Nite White",
      lead: "Šablóny na mieru, gél doma cez noc. Zub sa nijako nebrúsi.",
    },
    points: [
      "Šablóny vyrobené presne na váš chrup",
      "Bielite doma, cez noc, počas dvoch týždňov",
      "Zub sa nebrúsi — jediné riešenie, ktoré sa dá vziať späť",
      "Výsledok vydrží 6 mesiacov až 2 roky",
      "Keď vyprchá, dá sa jednoducho zopakovať",
    ],
    price: {
      value: "260 €",
      note: "Za celý chrup, vrátane šablón.",
    },
  },
];
