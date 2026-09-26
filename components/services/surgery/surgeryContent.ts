/**
 * Stomatochirurgia.
 *
 * Built 2026-09-26. The theme is calm: somebody arriving here is usually
 * facing an extraction or a wisdom tooth and is afraid of two things, how bad
 * it will be and how long it will take to heal. The page answers both plainly
 * and early, and puts the price where it can be read at a glance.
 *
 * The clinic's written answer, 2026-09-21, is the whole of the page's claims:
 * *"V chirurgii robíme všetko, čo nevyžaduje hospitalizáciu a celkovú
 * anestézu. Osmičky, resekcie, extrakcie, implantáty aj zákroky na
 * slizniciach. Hojenie štandardne okolo týždňa, kedy sa vyberajú stehy, potom
 * sa rana postupne uzatvára niekoľko týždňov. Podľa potreby dávame recept na
 * analgetiká a ATB. Po zákroku každý niečo cíti. Sedácia jedine pomocou
 * premedikácie tabletkou. Ale žiadny rajský plyn a pod."*
 *
 * ⚠️ "Po zákroku každý niečo cíti" is kept, not softened into "painless". It
 * is the honest sentence and the one a frightened reader believes.
 *
 * The aftercare list is general guidance of the kind every clinic gives, and
 * it says so: the doctor's own instructions after the procedure come first.
 *
 * Every price is the clinic's, from the list valid 1. 3. 2026, named by its
 * row so a test can pin it.
 */

export const opening = {
  heading: "Zákrok, po ktorom idete domov.",
  body:
    "Robíme všetko, čo nevyžaduje hospitalizáciu ani celkovú anestéziu. " +
    "Zuby múdrosti, extrakcie, resekcie, implantáty aj zákroky na sliznici, " +
    "priamo u nás v ambulancii.",
  facts: [
    { label: "Nemocnica", value: "Netreba" },
    { label: "Stehy von", value: "Zhruba po týždni" },
    { label: "Kontrola po zákroku", value: "Zdarma" },
  ],
} as const;

/* ---------------------------------------------------------- what we do */

export type Procedure = {
  readonly id: string;
  readonly name: string;
  readonly note: string;
  readonly link?: { readonly label: string; readonly href: string };
};

export const procedures = {
  heading: "Čo u nás robíme",
  items: [
    {
      id: "osmicky",
      name: "Zuby múdrosti",
      note:
        "Osmičky, ktoré nemajú miesto, rastú nakrivo alebo sa zapaľujú.",
    },
    {
      id: "extrakcie",
      name: "Extrakcie",
      note:
        "Od jednoduchého vytrhnutia po chirurgické, keď zub nejde von celý.",
    },
    {
      id: "resekcie",
      name: "Resekcie koreňového hrotu",
      note:
        "Odstránenie zapáleného hrotu koreňa, keď samotné ošetrenie kanálikov " +
        "nestačí.",
      link: { label: "Endodoncia", href: "/sluzby/endodoncia" },
    },
    {
      id: "implantaty",
      name: "Implantáty",
      note: "Zavedenie implantátu je tiež chirurgický zákrok a robíme ho u nás.",
      link: { label: "Zubné implantáty", href: "/sluzby/zubne-implantaty" },
    },
    {
      id: "sliznice",
      name: "Zákroky na sliznici",
      note:
        "Napríklad úprava uzdičky pery alebo jazyka a iné drobné zákroky v " +
        "ústach.",
    },
  ] satisfies readonly Procedure[],
} as const;

/* ------------------------------------------------------------ honesty */

export const honesty = {
  heading: "Po zákroku každý niečo cíti.",
  body:
    "Nebudeme vám tvrdiť opak. Podľa potreby dostanete recept na lieky proti " +
    "bolesti aj antibiotiká, a keď je zákrok za vami, kontrola je zdarma.",
  sedation: {
    title: "Keď sa bojíte",
    body:
      "Upokojiť vás pomôže tabletka pred zákrokom. Rajský plyn ani celkovú " +
      "anestéziu nepoužívame.",
  },
} as const;

/* ------------------------------------------------------------ healing */

export const healing = {
  heading: "Ako sa to hojí",
  steps: [
    {
      when: "Deň zákroku",
      title: "Idete domov",
      note: "S pokynmi, čo robiť, a podľa potreby s receptom.",
    },
    {
      when: "Zhruba po týždni",
      title: "Stehy von",
      note: "Pri kontrole vyberieme stehy. Kontrola je zdarma.",
    },
    {
      when: "Niekoľko týždňov",
      title: "Rana sa uzatvára",
      note: "Stehy sú už von a rana sa postupne zatvára.",
    },
  ],
} as const;

/* ------------------------------------------------------------ aftercare */

export const aftercare = {
  heading: "Čo pomáha prvé dni",
  note:
    "Všeobecné odporúčania. Presné pokyny k vášmu zákroku dostanete od lekára.",
  items: [
    "Na líce prikladajte studený obklad, cez utierku, s prestávkami.",
    "Prvý deň si ústa prudko nevyplachujte a rany sa nedotýkajte.",
    "Jedzte mäkké a vlažné jedlo, nie na strane zákroku.",
    "Nefajčite, kým sa rana nezačne hojiť.",
    "Ozvite sa nám, ak bolesť po pár dňoch nepoľavuje, ale silnie.",
  ],
} as const;

/* -------------------------------------------------------------- prices */

export type PriceLine = {
  readonly label: string;
  /** The published row this line is priced from. */
  readonly row: string;
  readonly price: string;
};

export const prices = {
  heading: "Koľko to stojí",
  groups: [
    {
      title: "Extrakcie",
      lines: [
        { label: "Trvalý zub alebo koreň", row: "Extrakcia trvalého zuba alebo koreňa", price: "95 €" },
        { label: "Viackoreňový zub", row: "Extrakcia viackoreňového zuba", price: "125 €" },
        { label: "Komplikovaná extrakcia", row: "Komplikovaná extrakcia", price: "160 €" },
        { label: "Chirurgická extrakcia", row: "Chirurgická extrakcia", price: "190 €" },
        { label: "Zub múdrosti, chirurgicky", row: "Chirurgická extrakcia 8.", price: "250 €" },
      ],
    },
    {
      title: "Chirurgické zákroky",
      lines: [
        { label: "Resekcia koreňového hrotu", row: "Resekcia koreňového hrotu", price: "185 €" },
        { label: "Plastika uzdičky a slizničných pruhov", row: "Plastika frenúl, slizničných a väzivových pruhov", price: "120 €" },
        { label: "Cystektómia", row: "Cystektómia", price: "165 €" },
        { label: "Injekčná anestézia", row: "Injekčná anestézia", price: "15 €" },
        { label: "Kontrola po zákroku", row: "Ošetrenie (kontrola) po chirurgickom zákroku", price: "Zdarma" },
      ],
    },
  ] satisfies readonly { readonly title: string; readonly lines: readonly PriceLine[] }[],
  note: "Ďalšie zákroky a presné ceny nájdete v cenníku.",
  linkLabel: "Celý cenník",
  linkHref: "/cennik",
} as const;
