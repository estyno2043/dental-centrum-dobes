/**
 * Protetika: mostíky a protézy.
 *
 * Built 2026-09-25. The theme is *made to measure*, and the page is shaped
 * around the question somebody arrives with: a tooth is missing, or several,
 * so what replaces them, and who decides.
 *
 * The clinic's written answers, 2026-09-21, and what each one supports:
 *
 * - *"U protetiky je indikácia často medicínske rozhodnutie. Nemôže ísť
 *   hocičo hocikam. Ale rozpočet musí vždy pacient schváliť. Takže niekedy
 *   aj podľa finančných možností."* The page's spine: the doctor decides
 *   what the mouth can carry, the patient decides the budget.
 * - *"Korunky, mostíky sú časovo rovnako."* A bridge takes as long as a
 *   crown, which the aesthetic page already states from the clinic's own
 *   answer: about three visits and a fortnight of laboratory work.
 * - *"Protézy podľa zložitosti môžu trvať od 2 týždňov do mesiaca."*
 * - *"Robíme protézy aj na implantátoch. Ak sa nedá spraviť mostík."*
 * - *"Protézy sú v literatúre odhadované na 3-5 rokov. Zvyčajne je to oveľa
 *   viac. S menšími opravami to môže byť aj 10."*
 *
 * ⚠️ Still open with the clinic: whether a bridge gets a next-day milled
 * temporary the way a crown does. Nothing here says it does.
 *
 * Every price is the clinic's, from the list valid 1. 3. 2026, named by its
 * row so a test can pin it.
 */

export const opening = {
  heading: "Zub, ktorý chýba, sa dá nahradiť. Otázka je čím.",
  body:
    "Mostík, protéza alebo protéza na implantátoch. Čo sa dá, často " +
    "rozhoduje stav zubov a kosti, lebo nie všetko sa dá dať kamkoľvek. " +
    "Rozpočet však vždy schvaľujete vy.",
  facts: [
    { label: "Mostík", value: "Ako korunka, zhruba 2 týždne" },
    { label: "Protéza", value: "2 týždne až mesiac" },
    { label: "Rozpočet", value: "Vždy schvaľujete vy" },
  ],
} as const;

/* ------------------------------------------------------------ the options */

export type PriceLine = {
  readonly label: string;
  /** The published row this line is priced from. */
  readonly row: string;
  readonly price: string;
};

export type Option = {
  readonly id: "mostik" | "proteza" | "implantaty";
  readonly name: string;
  readonly kind: string;
  /** The sentence somebody recognises themselves in. */
  readonly when: string;
  readonly body: string;
  /** The same three questions for every option, so they compare. */
  readonly facts: readonly { readonly label: string; readonly value: string }[];
  readonly prices: readonly PriceLine[];
  readonly link?: { readonly label: string; readonly href: string };
};

export const options = {
  heading: "Tri spôsoby, ako nahradiť chýbajúce zuby",
  items: [
    {
      id: "mostik",
      name: "Mostík",
      kind: "Pevný, nedá sa vybrať",
      when: "Chýba jeden zub alebo dva vedľa seba a zuby okolo sú pevné.",
      body:
        "Susedné zuby sa obrúsia a dostanú korunky, medzi nimi visí nový zub. " +
        "Celé to drží ako jeden kus a nosí sa ako vlastné zuby. Platí sa po " +
        "členoch: každá korunka aj každý zub medzi nimi je jeden člen.",
      facts: [
        { label: "Drží na", value: "Susedných zuboch" },
        { label: "Hotové", value: "Ako korunka, zhruba 2 týždne" },
        { label: "Vyberá sa", value: "Nie" },
      ],
      prices: [
        { label: "Korunka zo zirkónu", row: "Celokeramická korunka Zirkón", price: "455 €" },
        { label: "Medzičlen zo zirkónu", row: "Celokeramický medzičlen Zirkón", price: "455 €" },
        { label: "Kovokeramická korunka", row: "Kovokeramická korunka", price: "345 €" },
        { label: "Kovokeramický člen mostíka", row: "Kovokeramický člen mostíka", price: "330 €" },
      ],
    },
    {
      id: "proteza",
      name: "Snímateľná protéza",
      kind: "Vyberá sa, čistí sa mimo úst",
      when: "Chýba viac zubov, alebo všetky.",
      body:
        "Čiastočná protéza sa drží na zostávajúcich zuboch, celková na ďasne. " +
        "Robí sa na mieru podľa odtlačkov a podľa zložitosti trvá od dvoch " +
        "týždňov do mesiaca.",
      facts: [
        { label: "Drží na", value: "Ďasne a zostávajúcich zuboch" },
        { label: "Hotové", value: "2 týždne až mesiac" },
        { label: "Vyberá sa", value: "Áno" },
      ],
      prices: [
        { label: "Celková snímateľná náhrada", row: "Celková snímateľná náhrada", price: "530 €" },
        { label: "Čiastočná snímateľná náhrada", row: "Čiastočná snímateľná náhrada", price: "630 €" },
        { label: "Skeletová náhrada", row: "Skeletová náhrada", price: "630 €" },
      ],
    },
    {
      id: "implantaty",
      name: "Protéza na implantátoch",
      kind: "Keď sa mostík spraviť nedá",
      when: "Zubov chýba veľa a protéza by na ďasne sama nedržala dosť pevne.",
      body:
        "Protéza sa ukotví na implantátoch v kosti, takže drží pevnejšie než " +
        "protéza na ďasne. Robíme ju tam, kde sa mostík spraviť nedá. Cena závisí " +
        "od počtu implantátov, preto ju zostavujeme až po vyšetrení.",
      facts: [
        { label: "Drží na", value: "Implantátoch" },
        { label: "Hotové", value: "Po vhojení implantátov" },
        { label: "Vyberá sa", value: "Podľa typu" },
      ],
      prices: [],
      link: { label: "Zubné implantáty", href: "/sluzby/zubne-implantaty" },
    },
  ] satisfies readonly Option[],
  /**
   * A worked example, zirconia only, because both rows are unambiguous: two
   * crowns on the neighbours and one tooth between them. Labelled an example.
   */
  example: {
    label: "Príklad: trojčlenný mostík zo zirkónu",
    detail: "Dve korunky a jeden medzičlen, 3 × 455 €",
    total: "1 365 €",
    note: "Presnú sumu povieme po vyšetrení, keď vieme, koľko členov treba.",
  },
} as const;

/* -------------------------------------------------------------- who decides */

export const decision = {
  heading: "Kto rozhoduje",
  doctor: {
    title: "Lekár",
    body:
      "Čo zuby a kosť unesú. Nie všetko sa dá dať kamkoľvek, a to je " +
      "medicínske rozhodnutie.",
  },
  patient: {
    title: "Vy",
    body:
      "Rozpočet. Každý plán aj jeho cenu schvaľujete vy, a keď treba, " +
      "hľadáme riešenie aj podľa finančných možností.",
  },
} as const;

/* ------------------------------------------------------------ how long */

/**
 * The denture lifetime, with the literature's figure first and the clinic's
 * experience after it. The drawing is a ten-year scale: the literature's
 * three to five years shaded, and a dotted run on to ten "with small repairs".
 */
export const lifespan = {
  heading: "Ako dlho protéza vydrží",
  claim: "V literatúre 3 až 5 rokov. Zvyčajne oveľa dlhšie.",
  body:
    "S menšími opravami môže protéza slúžiť aj desať rokov. Keď sa zlomí, " +
    "dá sa opraviť.",
  scale: { literatureFrom: 3, literatureTo: 5, withRepairs: 10 },
  repair: { label: "Oprava zlomenej náhrady", row: "Oprava zlomenej náhrady", price: "80 €" },
} as const;

/* ------------------------------------------------------------ right after */

/** A temporary denture placed straight after an extraction. */
export const immediate = {
  heading: "Keď sa zub práve vytrhol",
  body:
    "Aby ste neodchádzali s medzerou, dá sa pripraviť dočasná náhrada, " +
    "ktorá sa nasadí hneď po vytrhnutí a nosí sa, kým sa rana nezahojí.",
  items: [
    { label: "Do štyroch zubov", row: "Imediátna náhrada do štyroch zubov", price: "260 €" },
    { label: "Nad štyri zuby", row: "Imediátna náhrada nad 4 zuby", price: "365 €" },
  ],
} as const;

/* ------------------------------------------------------------ the cases */

export const prostheticsCaseIds = [
  "obnova-oboch-oblukov",
  "parodont-a-keramika",
] as const;
