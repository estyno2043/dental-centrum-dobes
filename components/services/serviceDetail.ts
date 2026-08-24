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
  /** Struck through and given away. The `price` stays, as what it is worth. */
  readonly free?: boolean;
};

export type ServiceInclusion = {
  readonly title: string;
  /** One short line. If it needs two, it is not one inclusion. */
  readonly note: string;
};

export type ServiceDetail = {
  readonly slug: string;
  readonly kicker: string;
  readonly lead: string;
  readonly hero: ServicePhoto;
  readonly facts: readonly ServiceFact[];
  readonly benefitsHeading: string;
  /**
   * What the price actually buys — the deliverables, and only those. A dozen
   * mixed-together lines read as a wall and hide the four things that matter.
   */
  readonly benefits: readonly ServiceInclusion[];
  readonly extrasHeading: string;
  /** Conditions and conveniences. Not what is being bought. */
  readonly extras: readonly string[];
  readonly gallery: readonly ServicePhoto[];
  readonly bundle?: {
    readonly heading: string;
    readonly items: readonly ServicePackageItem[];
    /** What the parts add up to before anything is given away. */
    readonly listTotal: string;
    /** What is actually charged. */
    readonly total: string;
    readonly saving: string;
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
    {
      title: "Komplexné vyšetrenie celej ústnej dutiny",
      note: "Ďasná, jazyk, čeľustné kĺby aj sliznica — nie iba zub, ktorý bolí.",
    },
    {
      title: "4× intraorálny RTG snímok",
      note: "Kazy medzi zubami a pod starými výplňami, kam oko nedovidí.",
    },
    {
      title: "Panoramatický snímok celého chrupu",
      note: "Jeden záber na celý chrup aj okolozubné štruktúry.",
    },
    {
      title: "Plán ošetrenia",
      note: "Povieme vám, čo je súrne a čo pokojne počká. Rozhodnutie je vaše.",
    },
  ],

  extrasHeading: "Čo k tomu patrí",
  extras: [
    "3D CBCT, ak je diagnosticky potrebné",
    "Bez bolesti",
    "Vlastný zubný záznam, cudzí nepreberáme",
    "Ošetrujeme aj deti, od troch rokov",
    "Parkovanie zdarma priamo pri klinike",
    "Ďalšia prehliadka o šesť mesiacov",
  ],

  gallery: [
    { src: "vstupna-01", alt: "Vstupná prehliadka v ordinácii", width: 900 },
    { src: "vstupna-02", alt: "RTG snímok zubov", width: 900 },
    { src: "vstupna-03", alt: "Lupové okuliare pripravené na vyšetrenie", width: 900 },
  ],

  /*
   * ⚠️ PROVISIONAL. The three item prices are the clinic's own published
   * figures. Giving the panoramic away is not — it is a marketing decision
   * asked for on 2026-08-24, and it echoes an offer the clinic has run before
   * ("Počas leta ponúkame ku každému vstupnému vyšetreniu Rtg vyšetrenie
   * bezplatne"). The clinic has to agree the 80 € before this page is
   * published: a headline price on a clinic's website is a commitment, not a
   * draft.
   */
  bundle: {
    heading: "Vstupný balík",
    items: [
      { label: "Komplexné stomatologické vyšetrenie", price: "40 €" },
      { label: "4× intraorálny RTG snímok", price: "40 €" },
      { label: "Panoramatický snímok", price: "20 €", free: true },
    ],
    listTotal: "100 €",
    total: "80 €",
    saving: "Ušetríte 20 €",
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
