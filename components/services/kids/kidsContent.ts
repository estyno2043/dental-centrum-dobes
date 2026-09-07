/**
 * Ošetrenie detí.
 *
 * The one page that deliberately leaves the site's taupe and charcoal behind.
 * Everything else here reassures an adult about their own mouth; this
 * reassures a parent that their child will not be frightened, and that is a
 * different job with a different feeling.
 *
 * ⚠️ It is still read by the parent, not the child. That is the line the
 * design walks: soft pink and blue, rounder shapes, more air, but the site's
 * own typography and structure. A page that went full cartoon would tell a
 * parent the clinic does not take this seriously, and with a child the bar for
 * trust is higher than with an adult, not lower.
 *
 * Clinic answers, 2026-09-07: from three years old; the parent may stay in the
 * surgery; when a child will not cooperate they talk to it and try to help it
 * not be afraid; and there are no photographs of children in the surgery.
 *
 * ⚠️ The chapters below describe what a first visit is, warmly. They are not a
 * script the clinic gave, and nothing in them claims a specific game or
 * character. The clinic's own words for the service are "formou rozprávky",
 * which is a manner, not a screenplay, and the page keeps it that way. If they
 * later describe how they actually do it, that is better than anything written
 * here and should replace it.
 */

export const opening = {
  heading: "Prvá návšteva je zoznámenie. Ošetrenie príde až potom.",
  body:
    "Dieťa, ktoré príde k zubárovi prvýkrát až vtedy, keď ho niečo bolí, si " +
    "zubára s bolesťou spojí nadosmrti. Preto prvá návšteva u nás nie je " +
    "zákrok. Je to zoznámenie s miestom, s kreslom a s nami.",
  facts: [
    { label: "Ošetrujeme", value: "Od 3 rokov" },
    { label: "Rodič", value: "Môže byť v ordinácii" },
    { label: "Prvá návšteva", value: "Bez zákroku" },
  ],
} as const;

/* ----------------------------------------------------------- the chapters */

export type Chapter = {
  readonly title: string;
  /** Told to the child, in the words a child follows. */
  readonly child: string;
  /** The same moment, said plainly to the parent. */
  readonly parent: string;
};

export const story = {
  heading: "Ako to u nás vyzerá",
  lead:
    "Nič sa nedeje nasilu a nič bez toho, aby sme to najprv povedali. Vľavo " +
    "je to, čo počuje dieťa. Vpravo to isté pre vás.",
  chapters: [
    {
      title: "Prídete spolu",
      child: "Mamu alebo ocka máš pri sebe celý čas. Nikam nejdú.",
      parent:
        "Môžete zostať v ordinácii. Väčšine detí stačí vedieť, že tam ste.",
    },
    {
      title: "Kreslo si vyskúšame",
      child: "Kreslo sa vie hýbať hore a dole. Môžeš si to vyskúšať.",
      parent:
        "Dieťa si sadne, poobzerá sa a zvykne si. Zatiaľ sa nič nerobí.",
    },
    {
      title: "Spočítame zúbky",
      child: "Pozrieme sa, koľko zúbkov už máš. Budeme ich rátať nahlas.",
      parent:
        "Prvá prehliadka. Zistíme, či je niečo, čo treba riešiť, alebo nie.",
    },
    {
      title: "Keď sa bojí, nikam sa neponáhľame",
      child: "Keď sa ti niečo nepáči, povedz to. Počkáme.",
      parent:
        "Keď dieťa nespolupracuje, rozprávame sa s ním a snažíme sa mu " +
        "pomôcť, aby sa nebálo. Nedržíme ho a nedotláčame.",
    },
    {
      title: "Dohodneme, čo ďalej",
      child: "Ak treba niečo opraviť, povieme si to a prídeš znova.",
      parent:
        "Ak sa niečo našlo, poviete si plán aj cenu. Rozhodujete vy, nie my.",
    },
  ] satisfies readonly Chapter[],
} as const;

/* ------------------------------------------------------------- the worries */

export const worries = {
  heading: "Čo sa rodičia pýtajú najčastejšie",
  items: [
    {
      question: "Od koľkých rokov?",
      answer:
        "Od troch. Vtedy už dieťa rozumie, čo mu hovoríme, a to je pri prvej " +
        "návšteve dôležitejšie než počet zubov.",
    },
    {
      question: "Môžem byť pri tom?",
      answer:
        "Áno. Rodič môže byť v ordinácii a pri malých deťoch to väčšinou " +
        "pomáha.",
    },
    {
      question: "Čo ak nebude spolupracovať?",
      answer:
        "Rozprávame sa s ním a snažíme sa mu pomôcť, aby sa nebálo. Keď to " +
        "nejde dnes, skúsime to inokedy. Nasilu sa u nás neošetruje.",
    },
    {
      question: "Bude to bolieť?",
      answer:
        "Prvá návšteva nie je zákrok, takže nie. Keď neskôr treba niečo " +
        "ošetriť, povieme vám vopred, čo sa bude diať a ako to zvládneme.",
    },
    {
      question: "Musíme prísť, aj keď ho nič nebolí?",
      answer:
        "Práve vtedy. Dieťa, ktoré prvýkrát príde s bolesťou, si zubára " +
        "spojí s bolesťou. Dieťa, ktoré príde, keď je všetko v poriadku, si " +
        "spojí zubára s tým, že sa nič nestalo.",
    },
  ],
} as const;

/* --------------------------------------------------------------- the cost */

/**
 * Children's rows from the clinic's list valid 1. 3. 2026, plus the hygiene
 * figure the clinic confirmed separately on 2026-09-03.
 *
 * `Ťažko ošetriteľné dieťa` is in the list at 40 € and it is included on
 * purpose rather than hidden: a parent who finds it on the bill afterwards
 * reads a penalty, and a parent who reads it here reads extra time set aside.
 * The note says which it is.
 */
export type CostLine = {
  readonly label: string;
  readonly price: string;
  readonly note?: string;
};

export const cost = {
  heading: "Koľko to stojí",
  lead:
    "Ceny detských úkonov z nášho cenníka. Prvá návšteva je prehliadka a tú " +
    "si povieme vopred ako každú inú.",
  items: [
    {
      label: "Kompletná hygiena pre deti",
      price: "75 €",
      note: "Ten istý protokol ako u dospelých, prispôsobený veku.",
    },
    {
      label: "Výplň mliečneho zuba",
      price: "60 €",
      note: "Fuji, sklenoionomer.",
    },
    { label: "Pečatenie", price: "30 €", note: "Prevencia na žuvacích plôškach." },
    { label: "Fluoridácia lakom", price: "30 €" },
    {
      label: "Ťažko ošetriteľné dieťa",
      price: "40 €",
      note:
        "Nie je to pokuta. Je to čas navyše, ktorý si na dieťa vyhradíme, " +
        "keď ho potrebuje.",
    },
  ] satisfies readonly CostLine[],
  cta: {
    text: "Prvý termín je zoznamovací. Nič sa na ňom nerobí nasilu.",
    label: "Objednať dieťa na prehliadku",
    href: "#booking",
  },
} as const;
