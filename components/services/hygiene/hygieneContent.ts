/**
 * Dentálna hygiena GBT.
 *
 * The protocol below is EMS's published Guided Biofilm Therapy — eight named
 * steps in a fixed order — described as the method works, not as a promise
 * this clinic makes. Where something is specific to Dental Centrum Dobeš it
 * came from them and is marked:
 *
 *   • PERIOFLOW is `optional`. The clinic's own answer, 2026-08-29: they do
 *     perform it, but only for periodontal patients — on healthy gums the step
 *     is skipped. That is why the protocol renders it as conditional rather
 *     than quietly dropping it or implying everyone gets it.
 *   • The recall intervals are confirmed by the clinic as standard practice.
 *
 * ⚠️ Prices are the clinic's own published rows, quoted individually. There is
 * deliberately no "a GBT visit costs X": the price list bills the components
 * separately and nothing in it states which combination a hygiene appointment
 * actually is. Inventing that total would be inventing a price.
 */

export type ProtocolStep = {
  readonly number: number;
  readonly name: string;
  readonly title: string;
  readonly body: string;
  /** True for the step that only some patients need. */
  readonly optional?: boolean;
  /** Why it is optional, in the patient's terms. */
  readonly optionalNote?: string;
};

export const hygieneIntro = {
  kicker: "Dentálna hygiena",
  headline: "Najprv uvidíte, čo sa má odstrániť.",
  claim:
    "Guided Biofilm Therapy je protokol o ôsmich krokoch. Povlak sa najprv " +
    "zafarbí, takže presne vidíte, čo vám doma uniká a čo ideme odstrániť — " +
    "a až potom sa začne pracovať.",
} as const;

/**
 * The comparison that does the persuading.
 *
 * Written as differences in method, not as "we are better". Every line on the
 * left describes what conventional scaling actually involves; a patient who
 * has had one will recognise it, and one who has not is not being frightened.
 */
export const comparison = {
  heading: "Prečo nie obyčajné čistenie",
  classic: {
    title: "Klasické odstránenie kameňa",
    points: [
      "Povlak nie je vidieť, takže sa postupuje odhadom.",
      "Kovový nástroj prejde aj tam, kde tvrdý kameň nie je.",
      "Na záver leštiaca pasta a gumička.",
      "Po ošetrení bývajú zuby a krčky citlivé.",
    ],
  },
  gbt: {
    title: "Guided Biofilm Therapy",
    points: [
      "Povlak sa zafarbí — vidíte ho vy aj my, nič sa nehádame.",
      "Teplá voda a jemný prášok zmyjú povlak aj pigmentácie.",
      "Ultrazvuk sa dotkne len toho, čo je naozaj tvrdé.",
      "Bezpečné na implantátoch, korunkách, fazetách aj strojčeku.",
    ],
  },
} as const;

export const protocol: readonly ProtocolStep[] = [
  {
    number: 1,
    name: "Vyšetrenie",
    title: "Pozrieme sa, ako na tom ste",
    body:
      "Zuby, ďasná a hĺbka vačkov. Bez toho sa nedá povedať, čo vaše ďasná " +
      "potrebujú — a či bude treba piaty krok.",
  },
  {
    number: 2,
    name: "Zafarbenie",
    title: "Povlak dostane farbu",
    body:
      "Biofilm je za normálnych okolností priehľadný. Farbivo ho zviditeľní, " +
      "takže sa dá odstrániť cielene namiesto plošne.",
  },
  {
    number: 3,
    name: "Motivácia",
    title: "Ukážeme vám, čo farba odhalila",
    body:
      "Zafarbené miesta sú presne tie, kam sa doma nedostanete. Prejdeme si " +
      "techniku a pomôcky na mieste, ktoré tie miesta riešia.",
  },
  {
    number: 4,
    name: "AIRFLOW",
    title: "Povlak a pigmentácie zmyje prúd",
    body:
      "Teplá voda s jemným erytritolovým práškom. Zvládne aj zafarbenia od " +
      "kávy, čaju, vína a cigariet, a nepoškriabe sklovinu ani keramiku.",
  },
  {
    number: 5,
    name: "PERIOFLOW",
    title: "Hlbšie vačky, ak ich máte",
    body:
      "Tenká tryska sa dostane pod ďasno tam, kam bežný nástroj nesiaha, a " +
      "vyčistí vačok bez škrabania koreňa.",
    optional: true,
    optionalNote:
      "Len pri parodontóze. Pri zdravých ďasnách sa tento krok nerobí — " +
      "poznáme to už z prvého kroku.",
  },
  {
    number: 6,
    name: "PIEZON",
    title: "Zvyšný tvrdý kameň",
    body:
      "Jemný ultrazvukový hrot len tam, kde po štvrtom kroku naozaj niečo " +
      "tvrdé zostalo. Nie na celý chrup, ako pri klasickom čistení.",
  },
  {
    number: 7,
    name: "Kontrola",
    title: "Prejdeme to ešte raz",
    body:
      "Skontrolujeme celý chrup, či nič nezostalo, a ošetríme citlivé krčky, " +
      "ak ich máte.",
  },
  {
    number: 8,
    name: "Ďalší termín",
    title: "Dohodneme interval",
    body:
      "Podľa toho, čo sme videli — nie podľa kalendára. Termín dostanete ešte " +
      "než odídete.",
  },
];

/** Who has the most to gain. Conditions, not promises. */
export const suitedFor: readonly string[] = [
  "Implantáty a korunky",
  "Fazety",
  "Strojček a alignery",
  "Citlivé zuby a krčky",
  "Káva, čaj, červené víno",
  "Fajčiari",
  "Parodontóza",
  "Tehotenstvo",
];

/**
 * Intervals, confirmed by the clinic on 2026-08-29 as their standard practice.
 */
export const recall = {
  heading: "Ako často chodiť",
  standard: {
    label: "Zdravé ďasná",
    value: "Každých 6 mesiacov",
  },
  perio: {
    label: "Pri parodontóze",
    value: "Každé 3 – 4 mesiace",
  },
  note:
    "Interval nie je pravidlo, ale odpoveď na to, čo vidíme v ústach. " +
    "Dostanete ho na konci návštevy spolu s termínom.",
} as const;

/**
 * What a visit costs, split into what everybody pays and what is added on.
 *
 * ⚠️ The split is a reading of the price list, not a quote from the clinic.
 * The list bills these as separate rows and nowhere states which combination
 * a hygiene appointment is; `base` is the row that is the cleaning itself and
 * `extras` are the rows charged alongside it. Every figure is verbatim.
 *
 * `Air flow` sits in `extras` because the price list bills it separately and
 * per arch — but GBT *is* an AIRFLOW protocol, so if it is in fact always part
 * of the visit it belongs in `base` and the clinic should say so. That is the
 * one line on this page most likely to be wrong.
 */
export const pricing = {
  baseHeading: "Za samotnú hygienu zaplatíte",
  base: [
    { label: "Odstránenie zubného povlaku alebo kameňa", price: "90 – 100 €" },
    { label: "To isté pre dieťa", price: "75 €" },
  ],
  extrasHeading: "Účtuje sa navyše, ak je potrebné",
  extras: [
    { label: "Air flow — za jedno zuboradie", price: "50 €" },
    { label: "Inštruktáž a nácvik ústnej hygieny", price: "20 €" },
    { label: "Fluoridácia lakom", price: "30 €" },
    { label: "Komplexné parodontologické vyšetrenie", price: "50 €" },
  ],
  note:
    "Čo z toho budete potrebovať, vieme povedať až po prvom kroku — a cenu " +
    "poviete vopred, nie po ošetrení.",
} as const;

/**
 * The disclosing step, shown rather than described.
 *
 * The single most persuasive image the page can carry: the purple is the
 * biofilm that was there the whole time and could not be seen. It is the
 * argument of the whole protocol in one picture.
 *
 * ⚠️ Consent is outstanding, as it is for every patient photograph on this
 * site. See the header of `patientsContent.ts`.
 */
export const disclosingCase = {
  before: "/media/hygiena-gbt-pred.webp",
  after: "/media/hygiena-gbt-po.webp",
  caption:
    "Krok 2 a krok 7. Fialové je povlak, ktorý tam bol celý čas — len ho " +
    "nebolo vidieť. Posuňte deliacu čiaru.",
} as const;

/** The clinic's own AIRFLOW unit, for step 4. */
export const airflowPhoto = {
  src: "hygiena-airflow",
  alt: "Prístroj EMS AIRFLOW Prophylaxis Master na ambulancii",
  width: 900,
} as const;
