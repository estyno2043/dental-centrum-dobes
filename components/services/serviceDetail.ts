/**
 * The long form of a service page.
 *
 * Short by design. A service page is read standing up, on a phone, by someone
 * deciding whether to ring — so the benefits are single lines rather than
 * paragraphs, and the photographs carry what prose would otherwise have to.
 *
 * ⚠️ Every line traces to something the clinic already publishes — the prose
 * on bratislavazubar.sk and their own Cenník zdravotníckych výkonov. Nothing
 * about what a treatment achieves, how long it takes or what it costs is
 * invented, because on a clinic's page an invented detail is not filler, it is
 * a false claim.
 *
 * Where a source is seasonal or uncertain it is marked `unconfirmed`, and the
 * page renders it as something to ask about rather than as a promise.
 */

export type ServiceFact = {
  readonly label: string;
  readonly value: string;
};

export type ServicePhoto = {
  /** File stem under `public/media/sluzby`. */
  readonly src: string;
  readonly alt: string;
  /**
   * The encoded width of `<src>.webp`; `<src>-mobile.webp` is half of it.
   * Stated rather than assumed — a srcset that misdescribes its own files has
   * the browser choose a candidate too small for the slot, and the only
   * symptom is a soft picture.
   */
  readonly width: number;
};

export type ServicePackageItem = {
  readonly label: string;
  readonly price: string;
};

export type ServiceDetail = {
  readonly slug: string;
  readonly kicker: string;
  readonly lead: string;
  readonly hero: ServicePhoto;
  readonly facts: readonly ServiceFact[];
  readonly benefitsHeading: string;
  /** One line each. If a benefit needs a paragraph, it is two benefits. */
  readonly benefits: readonly string[];
  readonly gallery: readonly ServicePhoto[];
  readonly bundle?: {
    readonly heading: string;
    readonly items: readonly ServicePackageItem[];
    readonly total: string;
    /** Rendered as a question to ask, never as a standing offer. */
    readonly unconfirmed?: string;
  };
  readonly stepsHeading: string;
  readonly steps: readonly string[];
};

const vstupnaPrehliadka: ServiceDetail = {
  slug: "vstupna-prehliadka",
  kicker: "Pre nových pacientov",
  lead: "Prvé stretnutie, na ktorom si o vašich zuboch spravíme vlastný obraz.",

  hero: {
    src: "vstupna-hero",
    alt: "Pacientka pri panoramatickom RTG prístroji",
    width: 1800,
  },

  // The clinic's own published figures.
  facts: [
    { label: "Komplexné vyšetrenie", value: "40 €" },
    { label: "Otvorené", value: "Po–Št do 19:00" },
    { label: "Deti", value: "od 3 rokov" },
    { label: "Parkovanie", value: "zdarma" },
  ],

  benefitsHeading: "Čo to zahŕňa",
  benefits: [
    "Prezrieme celú ústnu dutinu, nie iba zub, ktorý bolí",
    "Kontrola ďasien, jazyka, čeľustných kĺbov a sliznice",
    "Vlastný zubný záznam — cudzí nepreberáme",
    "RTG odhalí kazy medzi zubami a pod starými výplňami",
    "Panoramatický snímok celého chrupu",
    "CT 3D vtedy, keď z neho niečo vyplýva",
    "Bez bolesti — vrátane samotnej anestézie",
    "Klasickú injekciu u nás uvidíte len ojedinele",
    "Povieme vám, čo je súrne a čo pokojne počká",
    "Ošetrujeme aj deti, od troch rokov",
    "Parkovanie zdarma priamo pri klinike",
    "Ďalšia prehliadka o šesť mesiacov",
  ],

  gallery: [
    { src: "vstupna-01", alt: "Vstupná prehliadka v ordinácii", width: 900 },
    { src: "vstupna-02", alt: "RTG snímok zubov", width: 900 },
    { src: "vstupna-03", alt: "Lupové okuliare pripravené na vyšetrenie", width: 900 },
  ],

  bundle: {
    heading: "Vstupný balík",
    items: [
      { label: "Komplexné stomatologické vyšetrenie", price: "40 €" },
      { label: "4× intraorálny RTG snímok", price: "40 €" },
      { label: "Panoramatický snímok", price: "20 €" },
    ],
    total: "100 €",
    unconfirmed:
      "RTG snímky sme k vstupnému vyšetreniu ponúkali zdarma. Overte si " +
      "telefonicky, či ponuka práve platí.",
  },

  stepsHeading: "Ako to prebieha",
  steps: [
    "Objednáte sa telefonicky alebo formulárom nižšie",
    "Prezrieme celú ústnu dutinu",
    "Doplníme RTG snímky",
    "Prejdeme si nález a poviete, ako ďalej",
  ],
};

const DETAILS: readonly ServiceDetail[] = [vstupnaPrehliadka];

export function getServiceDetail(slug: string): ServiceDetail | undefined {
  return DETAILS.find((detail) => detail.slug === slug);
}
