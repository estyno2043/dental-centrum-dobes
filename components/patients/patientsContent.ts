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
 * ⚠️ NONE of these may be published yet.
 *
 * Six pairs are now wired up and every one of them shows an identifiable
 * face. Before/after photographs of identifiable patients are health data;
 * publishing them without documented written consent is not a design decision
 * to make on anyone's behalf.
 *
 * The first three are also test material in a second way: which pair sits on
 * which case is arbitrary, and the treatments, visit counts and durations were
 * written before any photography arrived — they do not describe these
 * patients. The three added on 2026-08-25 carry no treatments or facts at all,
 * for the reason given above them.
 */

/**
 * The case shown large at the top of the section.
 *
 * Rewritten on 2026-08-25 against the photographs, which the previous text
 * contradicted: it claimed implants and a bridge, and both of those need a
 * gap. There is no missing tooth anywhere in the "before" — the two arches are
 * complete, worn and discoloured, and in the "after" both are restored to one
 * shade and one shape.
 *
 * ⚠️ `Protetika` is a reading of that evidence, not a fact from the clinic:
 * the uniform shape, shade and gloss across both arches is prosthetic work,
 * but a photograph cannot say whether it was crowns or veneers. Confirm it.
 *
 * Visits and duration are simply absent. Nothing in a photograph indicates six
 * appointments or four months, and the previous numbers were written before
 * any photography existed. They are two values from the clinic away from
 * being here.
 */
export const featuredCase: PatientCase = {
  id: "obnova-oboch-oblukov",
  treatments: ["Protetika"],
  problem:
    "Rokmi opotrebované a stmavnuté zuby, s prednými výrazne tmavšími než ostatné.",
  facts: [{ label: "Riešenie", value: "Obnova oboch oblúkov" }],
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
  /*
   * The three pairs below arrived on 2026-08-25 and are wired up as supplied.
   *
   * ⚠️ `problem` on each of them describes only what the two photographs show
   * — a gap that is closed, edges that are level, a shade that is lighter. It
   * is not a diagnosis and it does not say what was done, because that cannot
   * be read off a picture: a closed gap may be composite, a veneer or
   * orthodontics, and putting the wrong one on a clinic's website is a false
   * claim about a real person's treatment.
   *
   * `treatments` and `facts` are therefore empty rather than guessed, and the
   * cards render without tags until the clinic says what each case actually
   * was. Filling them in is one line each.
   */
  {
    id: "medzera-predne",
    treatments: [],
    problem: "Medzera medzi hornými prednými zubami je zatvorená.",
    facts: [],
    before: "/media/pacient-04-pred.webp",
    after: "/media/pacient-04-po.webp",
  },
  {
    id: "tvar-hornych-zubov",
    treatments: [],
    problem: "Horné predné zuby majú vyrovnané okraje a svetlejší odtieň.",
    facts: [],
    before: "/media/pacient-05-pred.webp",
    after: "/media/pacient-05-po.webp",
  },
  {
    id: "horny-oblik",
    treatments: [],
    problem:
      "Odštiepený predný zub je doplnený a horný oblúk má rovnomerný tvar.",
    facts: [],
    before: "/media/pacient-06-pred.webp",
    after: "/media/pacient-06-po.webp",
  },
] as const;

export const patientsConsent =
  "Fotografie zverejňujeme iba s písomným súhlasom pacienta.";
