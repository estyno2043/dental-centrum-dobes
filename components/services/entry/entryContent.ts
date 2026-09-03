/**
 * The entry examination — the page the clinic wins patients on.
 *
 * Everything here is built to answer one question in order: *is this worth
 * ringing about, and what happens if I do?* That is why the offer is stated
 * before the detail, why the reviews are the ones about being afraid rather
 * than the ones about ceramics, and why the objections are answered on the
 * page instead of on the telephone.
 *
 * Nothing is invented to make it convert better. Every figure comes from the
 * clinic's price list, every quote from their Google reviews verbatim, and the
 * two things nobody has told us — how long a visit takes, and whether to bring
 * anything — are simply absent rather than guessed. A first-visit page that
 * promises a duration the clinic cannot keep loses the patient in the chair
 * instead of before it.
 */

export type Objection = {
  readonly question: string;
  readonly answer: string;
};

/**
 * The offer.
 *
 * ⚠️ The three item prices are the clinic's own, and the panoramic is 25 € —
 * the price list valid from 1. 3. 2026 says so. The page previously said 20 €
 * and totalled 100 €, which understated both the list price and the size of
 * the gift. Corrected on 2026-09-03.
 *
 * ⚠️ Giving the panoramic away is still a marketing decision the clinic has to
 * agree, exactly as before. A headline price on a clinic's website is a
 * commitment, not a draft.
 */
export const offer = {
  items: [
    { label: "Komplexné stomatologické vyšetrenie", price: "40 €" },
    { label: "4× intraorálny RTG snímok", price: "40 €" },
    { label: "Panoramatický snímok celého chrupu", price: "25 €", free: true },
  ],
  listTotal: "105 €",
  total: "80 €",
  saving: "Ušetríte 25 €",
  caption: "Panoramatický snímok k vstupnej prehliadke nedoplácate.",
} as const;

/** Read straight off the price list and the clinic's own published details. */
export const reassurances: readonly { label: string; value: string }[] = [
  { value: "4,5 ★", label: "hodnotenie na Google" },
  { value: "od 3 rokov", label: "ošetrujeme aj deti" },
  { value: "Po–Št do 19:00", label: "otvorené aj po práci" },
  { value: "Zdarma", label: "parkovanie pri klinike" },
];

/**
 * The reviews chosen for *this* page.
 *
 * Not the most flattering ones — the ones about being frightened. Somebody
 * reading a first-visit page has usually been putting it off, and the review
 * that moves them is the one from a person who was in the same position, not
 * the one praising a ceramic crown.
 *
 * Ids point into `reviewsContent`, so the words stay in one place and cannot
 * drift from what Google shows.
 */
export const proofReviewIds = [
  "vendula-brockova",
  "martin-mancik",
  "helena-danielova",
] as const;

/**
 * The things that stop people ringing.
 *
 * Every answer is the clinic's own existing position, restated — the pain-free
 * claim, "we tell you what is urgent and what can wait", their own records,
 * children from three. Nothing here is a new promise, because a page that
 * invents reassurance is one the clinic then has to keep.
 */
export const objections: readonly Objection[] = [
  {
    question: "Bojím sa zubára. Roky som nebol.",
    answer:
      "Vstupná prehliadka je vyšetrenie, nie zákrok. Nič sa nevŕta a nič " +
      "nerozhodujete na mieste — pozrieme sa, čo je, a povieme vám to nahlas.",
  },
  {
    question: "Budem musieť hneď niečo riešiť?",
    answer:
      "Nie. Na konci dostanete plán, v ktorom je napísané, čo je súrne a čo " +
      "pokojne počká. Čo z toho a kedy urobíte, je vaše rozhodnutie.",
  },
  {
    question: "Priplácam si niečo k tým 80 eurám?",
    answer:
      "Za vyšetrenie ani za snímky nie. Ak sa počas prehliadky ukáže niečo, " +
      "čo treba ošetriť, cenu poviete vopred — nie po zákroku.",
  },
  {
    question: "Beriete deti?",
    answer:
      "Áno, od troch rokov. Prvá návšteva býva krátka a hlavne o tom, aby si " +
      "dieťa na ambulanciu zvyklo.",
  },
  {
    question: "Mám staré snímky od iného zubára.",
    answer:
      "Pokojne ich prineste, pozrieme sa na ne. Vlastný záznam si však robíme " +
      "od začiatku, aby sme vychádzali z toho, čo sme videli sami.",
  },
];

export const entrySteps: readonly { title: string; note: string }[] = [
  {
    title: "Objednáte sa",
    note: "Telefonicky alebo formulárom nižšie. Ozveme sa a dohodneme termín.",
  },
  {
    title: "Prezrieme celú ústnu dutinu",
    note: "Ďasná, jazyk, čeľustné kĺby aj sliznicu — nie iba zub, ktorý bolí.",
  },
  {
    title: "Doplníme snímky",
    note: "Štyri intraorálne a jeden panoramatický, aby sme videli aj to, kam oko nedovidí.",
  },
  {
    title: "Prejdeme si nález",
    note: "Povieme, čo sme našli, čo je súrne a čo počká. A dohodneme, čo ďalej.",
  },
];
