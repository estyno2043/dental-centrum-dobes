/**
 * Zubné implantáty.
 *
 * The clinic's most expensive service, and the one where a website is most
 * often useless: everybody publishes "implantát od 810 €", nobody publishes
 * what a finished tooth costs, and the patient finds out in the chair. So the
 * spine of this page is the total — itemised, with the crown switchable,
 * because the number is the objection and hiding it does not remove it.
 *
 * ⚠️ The instalment calculator the user asked for is deliberately absent. The
 * clinic answered on 2026-09-05: *"Splátky nemáme s nikým zabezpečené. Čiže
 * neposkytujeme."* A calculator would have priced a service that does not
 * exist. Nothing on this page may imply financing until that changes — and if
 * it ever does, a Slovak instalment calculator carries consumer-credit
 * disclosure obligations (RPMN, total repayable, the provider named), so it is
 * a legal question before it is a design one.
 *
 * Every price is quoted from the clinic's own list valid 1. 3. 2026.
 *
 * Clinic answers, 2026-09-05:
 *
 * - *"Implantačný systém Osstem."*
 * - *"Hojenie bežne trvá 3 mesiace. Záruka štandardne 2 roky. Ak ale implantát
 *   hneď nechytí, druhý pokus robíme zadarmo."*
 * - *"Zvyčajne sú to 4 návštevy."*
 * - *"Sínus lift vieme, doktorka rozhoduje, čo je ochotná a v akom rozsahu.
 *   Augmentácia takisto."*
 *
 * And on 2026-09-05, in answer to the one question this page could not be
 * written without: **the patient wears a temporary tooth through the three
 * months of healing.** That is the difference between a page somebody reads
 * and a page somebody rings from — the fear is not the surgery, it is the gap.
 */

/* ------------------------------------------------------------ the total --- */

export type CostItem = {
  readonly label: string;
  readonly price: string;
  readonly note: string;
};

/** A finished tooth, switchable on the one component that has two answers. */
export type CrownChoice = {
  readonly id: string;
  readonly name: string;
  readonly price: string;
  /** The whole tooth, this crown included. */
  readonly total: string;
  readonly note: string;
};

/*
 * The three items that make one implanted tooth, in the order they are placed.
 * Not a "od" price teased off the cheapest of them — that is the practice this
 * section exists to answer.
 *
 * ⚠️ `Vhojovacia skrutka` (120 €) is deliberately not in the base. It is in
 * the clinic's list and a two-stage protocol normally uses one, but whether it
 * is billed on every case was not asked. It sits below among what can be
 * added, where being wrong costs the reader nothing; putting it in the total
 * and being wrong would understate every quote on the page. Ask the clinic.
 */
export const costBase: readonly CostItem[] = [
  {
    label: "Implantát",
    price: "810 €",
    note: "Titánový koreň Osstem, zavedený podľa 3D plánu.",
  },
  {
    label: "Abutment",
    price: "220 – 335 €",
    note: "Nadstavba, ktorá spája implantát s korunkou. Cena podľa typu.",
  },
];

export const crowns: readonly CrownChoice[] = [
  {
    id: "celokeramicka",
    name: "Celokeramická korunka",
    price: "460 €",
    total: "1 490 – 1 605 €",
    note:
      "Bez kovového jadra, takže cez ňu prechádza svetlo tak ako cez vlastný " +
      "zub a pri ďasne nevzniká tmavý lem. Na predné zuby prakticky vždy toto.",
  },
  {
    id: "kovokeramicka",
    name: "Kovokeramická korunka",
    price: "355 €",
    total: "1 385 – 1 500 €",
    note:
      "Keramika na kovovej konštrukcii. Vzadu, kde na vzhľade tak nezáleží a " +
      "žuvací tlak je najväčší, je to úplne rozumná voľba.",
  },
];

export const cost = {
  heading: "Čo stojí jeden zub, celý",
  lead:
    "Implantát nie je jedna položka. Sú to tri — koreň, nadstavba a korunka — " +
    "a väčšina cenníkov ukáže prvú z nich a zvyšok necháte zistiť v kresle. " +
    "Tu je celá suma, aj s tým, čo ju mení.",
  crownHeading: "Korunka",
  totalLabel: "Spolu za jeden zub",
  /*
   * Case-dependent, and named as such. A membrane or an augmentation is not an
   * upsell hidden in the small print — it is what a 3D scan sometimes shows,
   * and a reader who meets it here is not ambushed by it later.
   */
  addOnsHeading: "Čo sa k tomu môže pridať",
  addOnsNote:
    "Či niečo z toho budete potrebovať, sa vie až z 3D snímku. Neúčtuje sa " +
    "to preto, že to je v cenníku, ale preto, že to bolo treba.",
  addOns: [
    {
      label: "Vhojovacia skrutka",
      price: "120 €",
      note: "Uzatvára implantát počas hojenia.",
    },
    {
      label: "Membrána",
      price: "120 €",
      note: "Kryje doplnenú kosť, kým zrastie.",
    },
    {
      label: "Augmentácia – GTR",
      price: "350 €",
      note: "Doplnenie kosti tam, kde jej na implantát nestačí.",
    },
  ],
} as const;

/* ---------------------------------------------------------- the timeline -- */

export type Phase = {
  readonly name: string;
  readonly when: string;
  readonly body: string;
  /** The phase the whole page is really about. */
  readonly reassures?: boolean;
};

/*
 * Phases, not "1. návšteva … 4. návšteva". The clinic gave the totals — four
 * visits, three months — but not what happens at each one, and inventing an
 * agenda for somebody else's surgery is the kind of detail that reads as
 * authoritative precisely because it was made up.
 */
export const timeline = {
  heading: "Tri mesiace hojenia. Ani jeden deň bez zuba.",
  lead:
    "To, čo ľudí na implantáte desí, nie je zákrok — je to predstava, že " +
    "budú pol roka chodiť s medzerou. Nebudete. Dočasný zub máte po celý čas, " +
    "kým sa implantát hojí.",
  facts: [
    { label: "Návštevy", value: "Zvyčajne 4" },
    { label: "Hojenie", value: "3 mesiace" },
    { label: "Medzitým", value: "Dočasný zub" },
  ],
  phases: [
    {
      name: "Plán z 3D snímku",
      when: "Pred všetkým ostatným",
      body:
        "Kosť sa premeria v troch rozmeroch, nie odhadne z bežného röntgenu. " +
        "Z toho sa vie, či je implantát možný, kam presne patrí a či bude " +
        "treba kosť doplniť — ešte predtým, než sa čokoľvek rozhodne.",
    },
    {
      name: "Zavedenie implantátu",
      when: "Jeden zákrok",
      body:
        "Titánový koreň sa uloží do kosti v lokálnom umŕtvení. Samotné " +
        "zavedenie je kratšie a pokojnejšie, než väčšina ľudí čaká.",
    },
    {
      name: "Hojenie s dočasným zubom",
      when: "Tri mesiace",
      body:
        "Implantát počas nich zrastá s kosťou — to je to, čo mu dáva pevnosť " +
        "vlastného koreňa a čo sa nedá urýchliť. V ústach máte po celý ten " +
        "čas dočasný zub, takže do práce ani medzi ľudí nejdete s medzerou.",
      reassures: true,
    },
    {
      name: "Korunka",
      when: "Na záver",
      body:
        "Keď je implantát zrastený, nasadí sa nadstavba a na ňu korunka " +
        "vyrobená na mieru. Od tej chvíle sa o zub staráte ako o vlastný.",
    },
  ] satisfies readonly Phase[],
} as const;

/* ---------------------------------------------------------- the guarantee - */

/**
 * The clinic's own words, 2026-09-05: *"Záruka štandardne 2 roky. Ak ale
 * implantát hneď nechytí, druhý pokus robíme zadarmo."*
 *
 * Given the strongest position on the page, because it is the only sentence
 * here where the clinic takes the risk instead of the patient — and that is a
 * thing a competitor's page does not say.
 */
export const guarantee = {
  heading: "Kto nesie riziko",
  claim: "Ak implantát nechytí, druhý pokus je zadarmo.",
  body:
    "Na implantát dávame štandardne dvojročnú záruku. A keby sa stalo to, " +
    "čoho sa pri takejto sume bojíte najviac — že sa implantát neujme — " +
    "druhý zavedieme na naše náklady. Nemyslíme si, že za biologické riziko " +
    "má platiť pacient.",
  facts: [
    { label: "Záruka", value: "2 roky" },
    { label: "Ak sa neujme", value: "Druhý pokus zadarmo" },
  ],
} as const;

/* ------------------------------------------------------------- the system - */

/**
 * ⚠️ Written about *why one named system matters*, not about Osstem's market
 * position. Claims of the "one of the world's largest" sort need a source, and
 * a clinic page is the wrong place to repeat a manufacturer's marketing on
 * trust. Everything below is true of any established system and is the part
 * that actually concerns the patient.
 *
 * The clinic mentioned that their old site had good images of the system.
 * Those have not been fetched; the frame below says what belongs there.
 */
export const system = {
  heading: "Osstem, a prečo na tom mene záleží",
  body:
    "Implantát vám zostane v ústach desiatky rokov — dlhšie, než väčšina " +
    "ľudí chodí k jednému lekárovi. Preto nie je jedno, čo je v kosti: keď sa " +
    "o desať rokov treba dorobiť korunka alebo vymeniť nadstavba, pri " +
    "zavedenom systéme sa to jednoducho objedná. Pri bezmennom implantáte " +
    "z akcie sa to niekedy nedá vôbec a rieši sa to novým zákrokom.",
  points: [
    {
      title: "Jeden systém, dôsledne",
      note:
        "Pracujeme na Osstem, nie na tom, čo je práve najlacnejšie. Vaša " +
        "dokumentácia potom hovorí niečo aj lekárovi, ktorý vás nikdy nevidel.",
    },
    {
      title: "Diely dostupné aj o roky",
      note:
        "Nadstavby a komponenty sa dajú doobjednať, takže neskoršia oprava " +
        "je oprava, nie nový implantát.",
    },
    {
      title: "Plánované z 3D, nie od oka",
      note:
        "Poloha implantátu sa určuje zo snímku pred zákrokom. To je rozdiel " +
        "medzi zubom, ktorý sadne do zhryzu, a zubom, ktorý sa tam vtesná.",
    },
  ],
} as const;

/* ------------------------------------------------------------ the caveat -- */

/**
 * Bone grafting and sinus lift.
 *
 * The clinic was careful here — *"doktorka rozhoduje, čo je ochotná a v akom
 * rozsahu"* — and the page is careful in the same way. A website that promises
 * a surgeon's judgement in advance is writing a cheque the surgeon has to
 * honour in front of a patient who read it.
 *
 * ⚠️ No sinus lift price is quoted. The clinic's list has `Augmentácia – GTR`
 * at 350 € and `Membrána` at 120 €, but nothing for a sinus lift. Asked
 * 2026-09-05; not answered. Do not guess one.
 */
export const bone = {
  heading: "Keď kosti nie je dosť",
  body:
    "Po dlhšie chýbajúcom zube kosť ubúda a niekedy jej na implantát " +
    "nestačí. Augmentáciu aj sinus lift robíme — či sa dá vo vašom prípade a " +
    "v akom rozsahu, však rozhoduje lekárka podľa 3D snímku a nálezu, nie " +
    "webová stránka. Preto tu nenájdete sľub, že sa to dá vždy. Nájdete " +
    "termín, na ktorom sa to zistí.",
  linkLabel: "Cenník chirurgických výkonov",
  linkHref: "/cennik",
} as const;
