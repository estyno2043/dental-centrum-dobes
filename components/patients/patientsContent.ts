/**
 * Content for the "Naši pacienti" section.
 *
 * ⚠️ No real patient photography is wired up, and none should be until the
 * clinic supplies **written consent** for each case. Before/after images of
 * identifiable patients are health data; publishing them without documented
 * consent is not a design decision to make on anyone's behalf. Until then
 * every case renders a labelled placeholder, and `before`/`after` are the only
 * fields that need filling in.
 *
 * `treatments` are the tags shown on a case. Keep them to what was actually
 * done — they double as the filter labels if filtering is added later.
 */

export type PatientCase = {
  readonly id: string;
  readonly treatments: readonly string[];
  /** What the patient came in with, in their own terms rather than clinical ones. */
  readonly problem: string;
  /** Plain facts that make the result legible: visits, span, what was made. */
  readonly facts: readonly { readonly label: string; readonly value: string }[];
  readonly before?: string;
  readonly after?: string;
};

export const patientsIntro = {
  eyebrow: "Naši pacienti",
  headline: "Výsledok si posúďte sami.",
  lead:
    "Každý z týchto úsmevov má za sebou plán, niekoľko návštev a rozhodnutia, " +
    "ktoré sme robili spolu s pacientom. Posuňte deliacu čiaru a pozrite sa, " +
    "odkiaľ sme začínali.",
} as const;

/**
 * ⚠️ The three wired photo pairs are **test material**. Which pair sits on
 * which case is arbitrary — the treatments, visit counts and durations below
 * were written before any photography arrived and do not describe these
 * patients. Every one of them has to be replaced with the real case and its
 * documented consent before this section is published.
 */

/** The case shown large at the top of the section. */
export const featuredCase: PatientCase = {
  id: "celkova-rekonstrukcia",
  treatments: ["Protetika", "Implantáty"],
  problem: "Opotrebovaný chrup a nedoliečené zuby po rokoch odkladania.",
  facts: [
    { label: "Návštev", value: "6" },
    { label: "Trvanie", value: "4 mesiace" },
    { label: "Riešenie", value: "Korunky a mostík" },
  ],
  before: "/media/pacient-03-pred.jpg",
  after: "/media/pacient-03-po.jpg",
};

export const patientCases: readonly PatientCase[] = [
  {
    id: "fazety-predne",
    treatments: ["Fazety"],
    problem: "Tmavé a nerovné predné zuby.",
    facts: [
      { label: "Návštev", value: "3" },
      { label: "Trvanie", value: "6 týždňov" },
    ],
    before: "/media/pacient-02-pred.jpg",
    after: "/media/pacient-02-po.jpg",
  },
  /*
   * The two halves of this pair are not framed alike — "pred" is a natural
   * smile and "po" was shot with a cheek retractor — so the divider slides
   * between two different kinds of photograph rather than between two states
   * of the same one. Kept only as test material; a real pair has to match.
   */
  {
    id: "endodoncia",
    treatments: ["Endodoncia"],
    problem: "Zub odsúdený na vytrhnutie na inej klinike.",
    facts: [
      { label: "Návštev", value: "2" },
      { label: "Zub", value: "Zachránený" },
    ],
    before: "/media/pacient-01-pred.jpg",
    after: "/media/pacient-01-po.jpg",
  },
  {
    id: "implantat",
    treatments: ["Implantát", "Korunka"],
    problem: "Chýbajúci zub po úraze.",
    facts: [
      { label: "Návštev", value: "4" },
      { label: "Trvanie", value: "5 mesiacov" },
    ],
  },
  {
    id: "hygiena",
    treatments: ["Dentálna hygiena"],
    problem: "Zafarbenia a zubný kameň po rokoch bez hygieny.",
    facts: [
      { label: "Návštev", value: "1" },
      { label: "Trvanie", value: "60 minút" },
    ],
  },
] as const;

export const patientsConsent =
  "Fotografie zverejňujeme iba s písomným súhlasom pacienta.";
