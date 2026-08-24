/**
 * The long form of a service page.
 *
 * ⚠️ Every sentence here traces to something the clinic has already published
 * — the prose on bratislavazubar.sk and their own price list — or to a fact
 * already used elsewhere on this site. Nothing about what a treatment achieves,
 * how long it takes or what it costs is invented, because on a clinic's page
 * an invented detail is not filler, it is a false claim.
 *
 * Where a source is time-limited or uncertain, it is marked `unconfirmed` and
 * the page renders it as something to ask about rather than as a promise.
 */

export type ServiceFact = {
  readonly label: string;
  readonly value: string;
};

export type ServiceBenefit = {
  readonly title: string;
  readonly body: string;
};

export type ServiceStep = {
  readonly title: string;
  readonly body: string;
};

export type ServicePackageItem = {
  readonly label: string;
  readonly price: string;
};

export type ServiceDetail = {
  readonly slug: string;
  readonly kicker: string;
  readonly lead: string;
  readonly facts: readonly ServiceFact[];
  readonly benefitsHeading: string;
  readonly benefits: readonly ServiceBenefit[];
  readonly bundle?: {
    readonly heading: string;
    readonly intro: string;
    readonly items: readonly ServicePackageItem[];
    readonly total: string;
    /** Rendered as a question to ask, not as a standing offer. */
    readonly unconfirmed?: string;
  };
  readonly stepsHeading: string;
  readonly steps: readonly ServiceStep[];
  readonly closing: string;
};

const vstupnaPrehliadka: ServiceDetail = {
  slug: "vstupna-prehliadka",
  kicker: "Pre nových pacientov",
  lead:
    "Prvé stretnutie, na ktorom si o vašich zuboch spravíme vlastný obraz. " +
    "Nie kontrola jedného zuba, ktorý práve bolí — prezrieme celú ústnu dutinu " +
    "a doplníme ju snímkami, ktoré ukážu aj to, na čo oko nedovidí.",

  // Prices are the clinic's own published figures (Cenník zdravotníckych výkonov).
  facts: [
    { label: "Komplexné vyšetrenie", value: "40 €" },
    { label: "Otvorené", value: "Po–Št do 19:00" },
    { label: "Ošetrujeme deti", value: "od 3 rokov" },
    { label: "Parkovanie", value: "zdarma" },
  ],

  benefitsHeading: "Čo vstupná prehliadka zahŕňa",
  benefits: [
    {
      title: "Celá ústna dutina, nie jeden zub",
      body:
        "Prvé ošetrenie celej ústnej dutiny vyšetrovacími inštrumentmi. " +
        "Zub, ktorý vás priviedol, je začiatok prehliadky, nie jej koniec.",
    },
    {
      title: "Ďasná, jazyk, kĺby a sliznica",
      body:
        "Prehliadka nekončí na zuboch. Kontrolujeme aj ďasná, jazyk, čeľustné " +
        "kĺby a sliznicu — miesta, kde sa problém ohlási skôr než bolesťou.",
    },
    {
      title: "Vlastný záznam od nuly",
      body:
        "Váš starý zubný záznam pre nás nie je dôležitý, urobíme si vlastný. " +
        "Nepreberáme cudzie závery ani cudzie chyby.",
    },
    {
      title: "Skryté kazy pod starými výplňami",
      body:
        "Preventívne RTG snímky z nášho prístroja ukážu medzizubné priestory " +
        "a priestor pod starými výplňami — teda presne tam, kde kaz vidieť nie je.",
    },
    {
      title: "Panoramatický snímok celého chrupu",
      body:
        "Jeden záber, na ktorom je celý chrup aj okolozubné štruktúry. " +
        "Slúži ako východiskový bod pre všetko, čo bude nasledovať.",
    },
    {
      title: "CT 3D, keď je to potrebné",
      body:
        "Pri implantátoch a zložitejších nálezoch doplníme trojrozmerný snímok. " +
        "Nerobíme ho automaticky — len keď z neho niečo vyplýva.",
    },
    {
      title: "Bezbolestne, a to aj samotná anestézia",
      body:
        "S klasickou injekciou sa u nás stretnete veľmi ojedinele. Používame " +
        "stomatologické aplikátory s veľmi tenkými ihlami a periodontálnu " +
        "anestéziu, ktorá nastupuje takmer okamžite.",
    },
    {
      title: "Vieme, kedy sa uvidíme znova",
      body:
        "Preventívna prehliadka sa robí každých šesť mesiacov. Vďaka tomu " +
        "zachytíme kaz v štádiu, keď zub ešte nedevastuje.",
    },
  ],

  bundle: {
    heading: "Vstupný balík pre nových pacientov",
    intro:
      "Vyšetrenie a snímky, ktoré k nemu patria. Ceny sú z nášho cenníka " +
      "zdravotníckych výkonov — nič skryté, nič navyše.",
    items: [
      { label: "Komplexné stomatologické vyšetrenie", price: "40 €" },
      { label: "4× intraorálny RTG snímok", price: "40 €" },
      { label: "Panoramatický snímok", price: "20 €" },
    ],
    total: "100 €",
    unconfirmed:
      "Klinika v minulosti ponúkala RTG snímky k vstupnému vyšetreniu zdarma. " +
      "Overte si prosím telefonicky, či ponuka práve platí.",
  },

  stepsHeading: "Ako to prebieha",
  steps: [
    {
      title: "Objednáte sa",
      body:
        "Telefonicky alebo formulárom nižšie. Povedzte nám, či vás niečo bolí — " +
        "podľa toho vieme prehliadku načasovať.",
    },
    {
      title: "Prezrieme celú ústnu dutinu",
      body:
        "Zuby, ďasná, jazyk, kĺby a sliznicu. Zapíšeme si stav každého zuba " +
        "do vlastného záznamu.",
    },
    {
      title: "Doplníme snímky",
      body:
        "Intraorálne snímky na skryté kazy a panoramatický snímok na celkový " +
        "obraz. Pri potrebe CT 3D.",
    },
    {
      title: "Prejdeme si nález",
      body:
        "Ukážeme vám, čo sme našli, a povieme, čo z toho je súrne a čo počká. " +
        "Rozhodnutie je vaše.",
    },
  ],

  closing:
    "Ak ste u zubára dlho neboli, je to ten najlepší dôvod prísť — " +
    "nie dôvod odkladať to ďalej.",
};

const DETAILS: readonly ServiceDetail[] = [vstupnaPrehliadka];

export function getServiceDetail(slug: string): ServiceDetail | undefined {
  return DETAILS.find((detail) => detail.slug === slug);
}
