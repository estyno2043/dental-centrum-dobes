/**
 * Parodontológia.
 *
 * Every other service page sells a treatment to somebody who came looking for
 * it. This one has to persuade the reader that it concerns them at all —
 * because the clinic's own best sentence about the disease is also this page's
 * whole problem: *"Je zákerná v tom, že príliš nebolí."*
 *
 * So it opens on recognition rather than on the service. The checklist is the
 * conversion device; everything after it explains what the reader has just
 * recognised.
 *
 * Source: the clinic's own written text, supplied by the user 2026-09-06.
 * Every price is from their list valid 1. 3. 2026.
 *
 * ⚠️ One deliberate departure from that text, raised with the user and
 * approved. The clinic wrote that the bacteria have a *"priamu súvislosť"*
 * with Alzheimer's, breast cancer, colorectal cancer and heart attack. The
 * association is real and actively researched — best established for
 * cardiovascular disease — but "direct link" is a stronger word than the
 * evidence carries, it reads as a medical claim rather than a warning, and
 * naming cancers that way reads as fear-selling on a page whose whole tone is
 * restraint. `systemic` below states it as what research associates rather
 * than what is proven, which motivates just as well and can be defended. If
 * the clinic wants their original wording, it is theirs to insist on — but it
 * should be their decision, made knowingly.
 */

/* ------------------------------------------------------------ recognition - */

/**
 * The checklist. Not a diagnosis and it must never read as one — it decides
 * whether somebody books an examination, and that is all it may do.
 *
 * The last line is the point of the whole section: the absence of pain is the
 * symptom people take as reassurance, and it is the one that should worry
 * them.
 */
export const check = {
  heading: "Nebolí. To je na nej to najhoršie.",
  lead:
    "Parodontitída neubližuje tak, aby ste kvôli nej prišli. Ohlási sa " +
    "drobnosťami, ktoré si človek zvykne prehliadať. Kým ich prehliada, " +
    "ubúda kosť, v ktorej zub drží.",
  question: "Poznávate sa v niečom z toho?",
  items: [
    "Pri čistení zubov mi krvácajú ďasná",
    "Z úst cítiť zápach, ktorý po umytí nezmizne",
    "Ďasná mi ustúpili — zuby vyzerajú dlhšie ako kedysi",
    "Medzi zubami sa objavili medzery, ktoré tam neboli",
    "Niektorý zub sa mierne kýve",
  ],
  /* Set apart in the component, because it is the opposite of a symptom. */
  painless: "A nebolí to",
  verdicts: {
    none: "Zatiaľ nič. Ďasná aj tak skontrolujeme pri každej prehliadke.",
    some: "To sú presne tie drobnosti. Stojí za to sa na ne pozrieť.",
    many: "Toto už nebýva náhoda. Objednajte sa na vyšetrenie.",
  },
  painlessNote:
    "Že to nebolí, nie je dobrá správa — je to typické. Bolesť prichádza až " +
    "vtedy, keď je zub uvoľnený, a vtedy už chýba kosť.",
  disclaimer:
    "Toto nie je diagnóza. Je to dôvod prísť sa dať vyšetriť.",
  /*
   * The button belongs here rather than further down the page: the verdict
   * directly above it is what creates the intent, and a reader who has just
   * ticked three boxes should not have to go looking for what to do about it.
   *
   * The line above the button says what the appointment costs them in time
   * rather than in money — at this point they do not yet know they have
   * anything, so half an hour is the objection to answer, not 240 €.
   */
  cta: {
    text: "Vyšetrenie trvá pol hodiny a poviete si s lekárom, na čom ste.",
    label: "Objednať sa na vyšetrenie",
    href: "#booking",
  },
} as const;

/* --------------------------------------------------------------- what it is */

export const disease = {
  heading: "Nie sú to len ďasná",
  body:
    "Parodontitída je zápal ďasien a zároveň kosti, v ktorej je zub uložený. " +
    "Ďasno sa zahojí. Kosť sama nedorastie — a práve tá drží zub na mieste. " +
    "Preto sa ochorenie neohlási bolesťou, ale kývaním: v tej chvíli už časť " +
    "kosti nie je. To je celý dôvod, prečo pri tejto diagnóze rozhoduje, " +
    "kedy prídete.",
} as const;

/**
 * The four factors, from the clinic's text.
 *
 * Kept because they take the blame off the reader — "you brush badly" is what
 * most people assume and it is only one of the four. That matters practically
 * as well as kindly: it is also the reason the swab is worth its price, since
 * it says which of the four is actually driving it.
 */
export const causes = {
  heading: "Prečo práve vy",
  lead:
    "Na parodontitíde sa podieľajú štyri veci naraz. Hygiena je len jedna z " +
    "nich — a u koho rozhodujú tie ostatné, ten si ju nevyčistí, nech robí " +
    "čokoľvek.",
  items: [
    {
      name: "Genetika",
      note: "Nakoľko váš organizmus reaguje na zápal. Nedá sa to ovplyvniť, dá sa to zistiť.",
    },
    {
      name: "Mikróby",
      note: "Ktoré baktérie máte v ústach. Nie každý ich má rovnaké a nie všetky sú rovnako agresívne.",
    },
    {
      name: "Zaťaženie zubov",
      note: "Ako sa vám zuby stretávajú a čo pri žuvaní nesú. Preskúmame aj záhryz.",
    },
    {
      name: "Hygiena",
      note: "Jediná zo štyroch, ktorá je celá vo vašich rukách — a sama o sebe nestačí.",
    },
  ],
} as const;

/* ------------------------------------------------------------- the systemic */

export const systemic = {
  heading: "Nezostáva to v ústach",
  body:
    "Ďasno pri parodontitíde je otvorená zapálená rana a baktérie z nej sa " +
    "dostávajú do krvného obehu. Výskum ich spája so srdcovocievnymi " +
    "ochoreniami, s cukrovkou a s ďalšími ochoreniami, pri ktorých by to " +
    "nikoho nenapadlo hľadať. Preto sa neliečia len ďasná — a preto sa to " +
    "neodkladá.",
} as const;

/* -------------------------------------------------------------- the protocol */

export type Step = {
  readonly name: string;
  readonly note: string;
  /** The step that makes this different from cleaning and hoping. */
  readonly pivotal?: boolean;
};

/**
 * The clinic's own sequence. What makes it worth a page is the first step:
 * most practices clean and hope, and this one finds out which bacteria are
 * there before deciding what to give.
 */
export const protocol = {
  heading: "Najprv zistíme, čo tam vlastne máte",
  lead:
    "Bežný postup pri krvácajúcich ďasnách je vyčistiť a dúfať. My najprv " +
    "urobíme výter a necháme z neho určiť konkrétne baktérie aj vaše " +
    "genetické predpoklady na zápal. Až potom sa rozhoduje, čím sa lieči.",
  steps: [
    {
      name: "Vyšetrenie",
      note: "Prejdeme ďasná, hĺbku vačkov, záhryz a celú ústnu dutinu.",
    },
    {
      name: "DNA analýza z výteru",
      note:
        "Laboratórium z neho určí, ktoré patogény máte a ako váš organizmus " +
        "reaguje na zápal. Toto je bod, v ktorom sa liečba prestáva hádať.",
      pivotal: true,
    },
    {
      name: "Eradikácia",
      note:
        "Dentálna hygiena a antibiotiká cielené na to, čo laboratórium našlo " +
        "— nie na to, čo sa dáva zvyčajne.",
    },
    {
      name: "Osídlenie",
      note: "Probiotiká, aby miesto po patogénoch obsadili správne baktérie.",
    },
    {
      name: "Úprava prostredia",
      note: "Výplachy, ktoré popri tom menia podmienky v ústach.",
    },
    {
      name: "Vlastná krvná plazma",
      note:
        "Záverečný krok, keď je zápal zvládnutý. Umožní hojenie kosti a " +
        "obnovu spojenia ďasna so zubom.",
      pivotal: true,
    },
  ] satisfies readonly Step[],
} as const;

/**
 * PRF, given its own moment.
 *
 * The most striking thing on the page and the one a reader has probably never
 * been offered anywhere else. Written as what it makes possible rather than as
 * a promise — the clinic's own phrasing is *"umožní vyhojenie kostí"*, and
 * that verb is doing honest work.
 */
export const plasma = {
  /*
   * The panel's own photograph, supplied by the user 2026-09-06: blood being
   * drawn in the surgery, tubes on the tray. Held far back — see
   * `.plasmaPhoto` — so it reads as texture behind the type rather than as a
   * picture competing with it, which is also why the panel keeps its dark type
   * on warm sand instead of flipping to a dark card.
   *
   * ⚠️ Provenance not established. It carries no EXIF at all — no camera, no
   * lens, no exposure — and it arrived in the same folder as two images that
   * were definitely generated. That is suggestive, not proof. It matters less
   * here than it did for the before/after pair, because this is a background
   * and claims nothing about a result. Two things follow from it anyway: it is
   * never captioned as this clinic's own room or staff, and it is decorative
   * (`alt=""`) so no screen reader is told what it depicts.
   *
   * It does show a recognisable face. At the opacity it renders at, the face
   * is barely discernible — but if it is a real photograph, the clinic needs
   * that person's consent like any other.
   */
  photo: { src: "paro-plazma", width: 1800 },
  heading: "Z vašej vlastnej krvi",
  claim: "Nič cudzie. Odoberieme vám krv a vrátime vám ju tam, kde sa hojí.",
  body:
    "Poslednou fázou je aplikácia vlastnej krvnej plazmy. Odoberie sa vám " +
    "krv, oddelí sa z nej plazma a tá sa aplikuje k postihnutým zubom. " +
    "Umožní hojenie kosti a obnovu spojenia ďasna so zubom — teda presne to, " +
    "čo pri parodontitíde chýba. Keďže je vaša vlastná, telo ju neodmieta.",
  facts: [
    { label: "Materiál", value: "Vaša vlastná krv" },
    { label: "PRF – krvná plazma", value: "75 €" },
  ],
} as const;

/* ----------------------------------------------------------------- the cost */

/**
 * The first step, priced exactly.
 *
 * The treatment's total genuinely depends on the finding, and saying "podľa
 * rozsahu" and stopping there loses the reader. What can be priced to the euro
 * is finding out — and 240 € to *know* is a decision somebody can make today,
 * where an unknown four-figure total is not.
 *
 * The sum is checked by a test against the clinic's own rows.
 */
export const cost = {
  heading: "Čo stojí zistiť, na čom ste",
  lead:
    "Koľko bude stáť liečba, sa poctivo nedá povedať skôr, než vieme, čo " +
    "liečime. Zistiť to však stojí presnú sumu — a tú vieme povedať hneď.",
  items: [
    {
      label: "Komplexné parodontologické vyšetrenie",
      price: "50 €",
      note: "Ďasná, hĺbka vačkov, záhryz, celá ústna dutina.",
    },
    {
      label: "Odber materiálu Mikro-gen",
      price: "155 €",
      note: "Výter do laboratória: patogény aj genetické predpoklady na zápal.",
    },
    {
      label: "Návrh paro liečby",
      price: "35 €",
      note: "Postup napísaný na váš nález, aj s tým, čo bude stáť.",
    },
  ],
  totalLabel: "Zistiť, na čom ste",
  total: "240 €",
  alternative:
    "Bez genetickej časti (Odber materiálu Mikro, 85 €) je to 170 €. " +
    "Genetiku odporúčame — je to jediný zo štyroch faktorov, ktorý sa nedá " +
    "zmeniť, a preto sa oplatí o ňom vedieť.",
  laterHeading: "Čo prichádza potom",
  laterNote:
    "Rozsah určí nález. Toto sú ceny úkonov, z ktorých sa liečba skladá.",
  later: [
    { label: "Dentálna hygiena", price: "100 €" },
    { label: "FMD – full mouth dezinfekcia", price: "115 €" },
    { label: "Zatvorená kyretáž koreňa", price: "45 €" },
    { label: "Otvorená kyretáž", price: "180 €" },
    { label: "PRF – krvná plazma", price: "75 €" },
    { label: "Probiotiká", price: "18 – 23 €" },
  ],
} as const;

/* ---------------------------------------------------------------- the close */

/**
 * The clinic's own closing sentence, verbatim from their text. It is the
 * strongest thing they wrote and it is a claim only they can make.
 */
export const outcome = {
  claim: "Zuby, ktoré sme v minulosti extrahovali, dnes zachraňujeme.",
  body:
    "Táto liečba je overená na mnohých pacientoch a výsledky sú veľmi dobré. " +
    "Nie každý zub sa však zachrániť dá — a keď je kosti primálo, poctivejšie " +
    "je povedať to hneď než to skúšať za vaše peniaze.",
  linkLabel: "Zubné implantáty",
  linkHref: "/sluzby/zubne-implantaty",
} as const;

/* ---------------------------------------------------------- the comparison */

/**
 * The clinic's own periodontitis case, before and after.
 *
 * History, so it is not re-argued from scratch. These arrived as
 * `google_nano-banana-2_*` files and I twice declined to publish them as a
 * result, because the two files are pixel-aligned — their difference bottoms
 * out at exactly zero offset and runs an even 5.5 to 5.9 of 255 across teeth
 * and gum alike, which two photographs taken months apart do not do.
 *
 * The user then said the case is the clinic's own and that an AI tool was used
 * on light *and angle*. That last word accounts for the alignment: matching
 * one frame's angle to the other is precisely what would produce it. They have
 * instructed publication three times, they were in the room and I was not, and
 * how a clinic presents its own clinical work is their call to make. Published
 * as their case, caption removed at their request.
 *
 * What I could not check and they can: that the "after" is the same patient at
 * a later visit rather than the tool having rebuilt one frame from the other.
 * If it is ever the latter, this comes down.
 */
export const illustration = {
  heading: "Rozdiel, ktorý liečba robí",
  lead:
    "Vľavo ďasno pri zápale — tmavšie, opuchnuté, s ustúpeným okrajom pri " +
    "krčkoch. Vpravo to isté ďasno po zvládnutí zápalu. Potiahnite deliacu " +
    "čiaru.",
  before: {
    src: "paro-pred",
    alt: "Pred liečbou: zapálené ďasno, opuchnuté a začervenané pri krčkoch zubov",
  },
  after: {
    src: "paro-po",
    alt: "Po liečbe: ďasno svetlejšie a priliehajúce k zubom",
  },
  labels: { before: "Pred liečbou", after: "Po liečbe" },
} as const;
