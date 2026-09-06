/**
 * Content for the "Naši pacienti" section.
 *
 * Six real before/after pairs, cleared for publication by the clinic on
 * 2026-09-04. They are health data about identifiable people, so the clearance
 * is recorded here with its date rather than assumed from the files existing.
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
 * Publication cleared by the clinic on 2026-09-04, relayed by the user:
 * *"fotky zverejnit mozeme, vsetky prace co tam su mozu byt na webe."*
 *
 * That settles consent, which was the blocker on all six pairs.
 *
 * Accuracy is settled too, as of the same day: every `treatments` and `facts`
 * value below started as a reading of the photographs plus the standard
 * protocol for that kind of work, and the clinic confirmed them — *"odhady sú
 * správne, zatiaľ to necháme tak, potom keď tak upravíme."*
 *
 * The reasoning behind each is kept where it was written rather than deleted.
 * These began as estimates, they were checked rather than supplied, and
 * whoever revisits a number should be able to see what it was built on.
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
 * Confirmed by the clinic on 2026-09-04. `problem` is read off the
 * photographs; the rest began as a professional estimate made on 2026-08-25
 * and was checked rather than supplied. The reasoning is kept because that is
 * what it was checked against:
 *
 *   Crowns, not veneers. The "before" shows worn incisal edges and central
 *   incisors distinctly darker than their neighbours — the signature of a
 *   non-vital or heavily restored tooth. Veneers need sound enamel and do not
 *   mask a dark core; crowns cover both problems, and the opacity and full
 *   coverage in the "after" read as crowns.
 *
 *   Seven visits over three months. Standard full-arch ceramic protocol:
 *   examination with radiographs and a plan, endodontic work on the dark
 *   teeth, preparation and temporaries for each arch in turn, a try-in,
 *   seating, and a review. Lab turnaround between stages is what makes the
 *   span months rather than weeks; two arches put it at the upper end.
 *
 * A patient looking at their own photograph should find their own treatment
 * described. That is what the clinic's yes settles, and why it was worth
 * waiting for rather than publishing typical numbers and hoping.
 */
export const featuredCase: PatientCase = {
  id: "obnova-oboch-oblukov",
  treatments: ["Protetika"],
  problem:
    "Rokmi opotrebované a stmavnuté zuby, s prednými výrazne tmavšími než ostatné.",
  facts: [
    { label: "Návštev", value: "7" },
    { label: "Trvanie", value: "3 mesiace" },
    { label: "Riešenie", value: "Keramické korunky" },
  ],
  before: "/media/pacient-03-pred.jpg",
  after: "/media/pacient-03-po.jpg",
};

export const patientCases: readonly PatientCase[] = [
  /*
   * parodontitida — the clinic's periodontitis case.
   *
   * Published on the user's instruction, 2026-09-06, after they confirmed the
   * case is the clinic's own and that an AI tool was used on the light and the
   * angle. The full history of that decision, including what I measured and
   * why I twice held off, is on `illustration` in
   * `components/services/perio/perioContent.ts` — read it there before
   * touching this, rather than re-deriving it.
   *
   * ⚠️ No visit count and no duration, because the clinic has not given either
   * for periodontal treatment. They are two of the three questions still
   * outstanding on that service. The three facts below are all from the
   * doctor's own written description of the protocol, and none of them is a
   * number nobody supplied.
   */
  {
    id: "parodontitida",
    treatments: ["Liečba parodontitídy"],
    problem:
      "Zapálené a ustupujúce ďasná — ochorenie, ktoré takmer nebolí, a preto " +
      "sa naň príde neskoro.",
    facts: [
      { label: "Diagnostika", value: "DNA analýza z výteru" },
      { label: "Liečba", value: "Cielené antibiotiká a probiotiká" },
      { label: "Záver", value: "Vlastná krvná plazma" },
    ],
    before: "/media/sluzby/paro-pred.webp",
    after: "/media/sluzby/paro-po.webp",
  },
  /*
   * hygiena-gbt — the disclosing pair from the GBT protocol.
   *
   * Added on the user's request 2026-09-06, and the one case here that is not
   * a result over time: both frames are from the *same appointment*, step 2
   * against step 7 of the protocol. That is stated in `problem` and in the
   * visit count rather than left for somebody to assume months of work, and it
   * is also why it is worth showing — the whole argument of the hygiene page
   * is that the plaque was there all along and simply could not be seen.
   *
   * The pair is already published on `/sluzby/dentalna-hygiena`, so this adds
   * no exposure it did not already have. Its photographs are the clinic's own,
   * at 1400×939, matching the rest of the gallery.
   *
   * ⚠️ No duration. The clinic has not given one for a hygiene appointment and
   * it is not stated anywhere else on the site, so the third fact is the recall
   * interval — which they did give — rather than a number that would read as
   * theirs without being it.
   */
  {
    id: "hygiena-gbt",
    treatments: ["Dentálna hygiena GBT"],
    problem:
      "Povlak, ktorý pri domácom čistení unikal — a nebolo ho vidieť, kým " +
      "sme ho nezafarbili.",
    facts: [
      { label: "Návštev", value: "1" },
      { label: "Ďalší termín", value: "O 6 mesiacov" },
      { label: "Riešenie", value: "Protokol GBT s AIR FLOW" },
    ],
    before: "/media/hygiena-gbt-pred.webp",
    after: "/media/hygiena-gbt-po.webp",
  },
  /*
   * pacient-02 — worn incisal edges rebuilt.
   *
   * "Before" shows the biting edges of both centrals gone translucent grey and
   * notched, with brown stain along the gum margins. In "after" the edges are
   * solid, level and slightly longer.
   *
   * Composite rather than veneers: the teeth's own vertical striations and a
   * faint band of natural translucency still show through in "after". A
   * ceramic veneer covers the whole labial face and would have replaced that
   * character; here only the edges gained material. Two visits over a
   * fortnight — a planning appointment and one long chairside session.
   */
  {
    id: "dostavba-hran",
    treatments: ["Kompozitné dostavby"],
    problem:
      "Obrúsené, presvitajúce hrany predných zubov a hnedé škvrny pri ďasnách.",
    facts: [
      { label: "Návštev", value: "2" },
      { label: "Trvanie", value: "2 týždne" },
      { label: "Riešenie", value: "Dostavba rezacích hrán" },
    ],
    before: "/media/pacient-02-pred.jpg",
    after: "/media/pacient-02-po.jpg",
  },
  /*
   * pacient-01 — upper arch veneered.
   *
   * The two halves of this pair are not framed alike — "pred" is a natural
   * smile and "po" was shot with a cheek retractor — so the divider slides
   * between two different kinds of photograph rather than between two states
   * of the same one. Kept only as test material; a real pair has to match.
   *
   * The upper arch changed shape, not just shade: the narrow laterals that
   * stepped down from the centrals are broader in "after" and the arch reads
   * as one curve. That is added material. The lower teeth keep their yellow
   * cervical band in both frames, which is what places the work in the upper
   * arch alone.
   *
   * Veneers rather than crowns: the teeth underneath are sound, well aligned
   * and unrestored, and the complaint is shade and width. Three visits over a
   * month is the ordinary span once the lab has the case.
   */
  {
    id: "fazety-horny-oblik",
    treatments: ["Fazety"],
    problem: "Zožltnuté predné zuby a úzke bočné rezáky, ktoré lámali líniu úsmevu.",
    facts: [
      { label: "Návštev", value: "3" },
      { label: "Trvanie", value: "4 týždne" },
      { label: "Riešenie", value: "Keramické fazety, horný oblúk" },
    ],
    before: "/media/pacient-01-pred.jpg",
    after: "/media/pacient-01-po.jpg",
  },
  /*
   * pacient-04 — diastema closed.
   *
   * The clearest case of the six: a gap between the upper centrals in
   * "before", closed in "after" by two teeth that are visibly wider. Nothing
   * else in the mouth changed — same shade, same neighbours, same texture.
   *
   * That rules out both alternatives. Orthodontics moves teeth rather than
   * widening them and takes months; veneers would have brought a new shade and
   * usually more than two teeth. Composite added chairside to the two centrals
   * does exactly this, in one appointment, with nothing to wait for.
   */
  {
    id: "medzera-predne",
    treatments: ["Kompozitné dostavby"],
    problem: "Medzera medzi hornými jednotkami.",
    facts: [
      { label: "Návštev", value: "1" },
      { label: "Trvanie", value: "Jedno sedenie" },
      { label: "Riešenie", value: "Zatvorenie medzery kompozitom" },
    ],
    before: "/media/pacient-04-pred.webp",
    after: "/media/pacient-04-po.webp",
  },
  /*
   * pacient-05 — crowding masked with ceramic.
   *
   * "Before" has a rotated lateral sitting behind its neighbours, centrals at
   * different heights, and brown stain worked into the worn edges. "After" is
   * one even arch at one shade.
   *
   * Read as veneers, not braces: orthodontics would have straightened the
   * teeth while leaving their colour and their stains alone, and the shade in
   * "after" is uniform in a way natural enamel across six teeth is not. Four
   * visits over six weeks — planning, preparation, try-in, seating.
   */
  {
    id: "stiesnene-rezaky",
    treatments: ["Fazety"],
    problem: "Stiesnené a pootáčané horné rezáky s obrúsenými, zafarbenými hranami.",
    facts: [
      { label: "Návštev", value: "4" },
      { label: "Trvanie", value: "6 týždňov" },
      { label: "Riešenie", value: "Keramické fazety, horný oblúk" },
    ],
    before: "/media/pacient-05-pred.webp",
    after: "/media/pacient-05-po.webp",
  },
  /*
   * pacient-06 — the largest case of the six.
   *
   * "Before" carries a dark calculus mass at the lower gumline and exposed
   * yellow root surfaces on the lower incisors: that is receding gum, not
   * staining, and it has to be treated before anything is built on top of it.
   * Above it, a chipped central and rotated laterals at an uneven shade.
   *
   * So the estimate is two courses of treatment in sequence, not one:
   * periodontal therapy, then healing time the gums actually need, then
   * ceramic work. Nine visits across six months — the months are mostly the
   * wait between the two halves.
   */
  {
    id: "parodont-a-keramika",
    treatments: ["Parodontológia", "Protetika"],
    problem: "Zubný kameň, ustupujúce ďasná a odlomený predný zub.",
    facts: [
      { label: "Návštev", value: "9" },
      { label: "Trvanie", value: "6 mesiacov" },
      { label: "Riešenie", value: "Ošetrenie ďasien a keramika" },
    ],
    before: "/media/pacient-06-pred.webp",
    after: "/media/pacient-06-po.webp",
  },
] as const;

export const patientsConsent =
  "Fotografie zverejňujeme iba s písomným súhlasom pacienta.";
