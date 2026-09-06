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
    "drobnosťami, ktoré si človek zvykne prehliadať — a kým ich prehliada, " +
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
