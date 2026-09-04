/**
 * Estetická stomatológia.
 *
 * Shaped around a *decision*, not a procedure. Somebody arriving here does not
 * know whether they want a veneer, a crown or only whitening — and the three
 * routes to a veneer in the clinic's own price list are, to a patient, three
 * unexplained numbers for the same words. So the page's spine is a comparison
 * they can switch between, and every option states what it actually solves,
 * how much tooth it costs them, and how long it lasts.
 *
 * Every price is the clinic's, quoted from the list valid 1. 3. 2026.
 *
 * ⚠️ One reading is mine and needs confirming: the list bills `Fazetovanie
 * zuba` at 190 € and `Fazetovanie zuba Empress Direct` at 220 €. Both are
 * direct composite done chairside; Empress Direct is Ivoclar's premium
 * nano-hybrid, so the difference is described here as the material rather than
 * the method. If the 30 € is in fact extent or something else, this is the
 * line to fix.
 */

/*
 * Every option answers the same three questions, in the same order and under
 * the same labels — that is what makes them comparable. One option asking a
 * different question turns the rail from a comparison into five leaflets, and
 * a test fails if the labels ever drift apart.
 */
export type Solution = {
  readonly id: string;
  readonly name: string;
  /** The one-line answer to "what is this". */
  readonly kind: string;
  readonly price: string;
  /** What it is for — the sentence somebody recognises themselves in. */
  readonly solves: string;
  readonly body: string;
  /** Three facts that make the options comparable at a glance. */
  readonly facts: readonly { readonly label: string; readonly value: string }[];
  /** Marked on the one that touches the tooth least. */
  readonly gentlest?: boolean;
};

export const aestheticIntro = {
  /*
   * Not "tri cesty": the rail below shows five, because a veneer alone comes
   * three ways. A headline that miscounts what is under it is the first thing
   * a reader notices and the last thing they trust.
   */
  headline: "Päť ciest k tomu istému úsmevu. Líšia sa tým, čo za ne dáte.",
  lead:
    "Fazeta, korunka a bielenie riešia iné veci a stoja iné peniaze. Nižšie " +
    "je, čo ktorá z nich naozaj rieši — aby ste sa rozhodovali podľa toho, a " +
    "nie podľa ceny.",
} as const;

export const solutions: readonly Solution[] = [
  {
    /*
     * The range is the clinic's, given on 2026-09-04, and it replaced "podľa
     * toho, čo pijete" — which was true, and told nobody anything. A span with
     * its cause named is what somebody can actually decide against: it is the
     * only option here that has to be repeated, and that belongs in the
     * comparison rather than in the small print.
     */
    id: "bielenie",
    name: "Bielenie Nite White",
    kind: "Domáce bielenie v šablónach",
    price: "260 €",
    solves: "Zuby máte zdravé a rovné, len tmavšie, než by ste chceli.",
    body:
      "Odoberieme odtlačok a vyrobíme šablóny presne na váš chrup. Gél si " +
      "aplikujete doma, cez noc, počas dvoch týždňov. Zub sa nijako nebrúsi " +
      "— zo všetkých riešení je toto jediné úplne vratné. Ako dlho výsledok " +
      "vydrží, rozhoduje káva, čaj, víno a cigarety: pri striedmom pití aj " +
      "dva roky, pri každodennej káve skôr pol roka. Potom sa dá zopakovať.",
    facts: [
      { label: "Zub sa brúsi", value: "Vôbec" },
      { label: "Hotové", value: "Za dva týždne doma" },
      { label: "Vydrží", value: "6 mesiacov – 2 roky" },
    ],
    gentlest: true,
  },
  {
    id: "kompozit",
    name: "Kompozitná fazeta",
    kind: "Priamo v ordinácii, za jednu návštevu",
    price: "190 €",
    solves:
      "Chcete zmeniť tvar alebo odštiepenie jedného-dvoch zubov, a chcete to " +
      "vidieť hneď.",
    body:
      "Kompozit sa nanáša a modeluje priamo na zub, v ten istý deň. Brúsi sa " +
      "minimálne alebo vôbec. Je to najdostupnejší spôsob, ako zmeniť tvar — " +
      "a keď sa časom ošúcha, dá sa opraviť bez toho, aby sa začínalo odznova.",
    facts: [
      { label: "Zub sa brúsi", value: "Minimálne" },
      { label: "Hotové", value: "Za jednu návštevu" },
      { label: "Vydrží", value: "Roky, dá sa doplniť" },
    ],
  },
  {
    id: "empress",
    name: "Kompozitná fazeta Empress Direct",
    kind: "To isté, z prémiového materiálu",
    price: "220 €",
    solves:
      "Rovnaké zadanie ako vyššie, ale chcete, aby to zblízka nebolo vidieť.",
    body:
      "Rovnaký postup za jednu návštevu, iný kompozit. Empress Direct sa " +
      "vrstvi v odtieňoch a drží lesk dlhšie, takže sa lepšie stráca medzi " +
      "vlastnými zubami — čo je pri predných jednotkách celý rozdiel.",
    facts: [
      { label: "Zub sa brúsi", value: "Minimálne" },
      { label: "Hotové", value: "Za jednu návštevu" },
      { label: "Vydrží", value: "Dlhšie drží lesk" },
    ],
  },
  {
    id: "keramika",
    name: "Keramická fazeta",
    kind: "Vyrobená v laboratóriu na mieru",
    price: "455 €",
    solves:
      "Chcete zmeniť viac zubov naraz a chcete, aby to vydržalo najdlhšie.",
    body:
      "Tenká keramická škrupinka, vyrobená podľa odtlačku alebo 3D skenu. " +
      "Keramika sa nezafarbuje od kávy ani vína a odtieň si drží roky. " +
      "Vyžaduje viac návštev, lebo medzi nimi pracuje laboratórium.",
    facts: [
      { label: "Zub sa brúsi", value: "Tenká vrstva skloviny" },
      { label: "Hotové", value: "Vo viacerých návštevách" },
      { label: "Vydrží", value: "Nezafarbuje sa" },
    ],
  },
  {
    id: "korunka",
    name: "Celokeramická korunka Zirkón",
    kind: "Prekryje celý zub, nie iba prednú plochu",
    price: "455 €",
    solves:
      "Zub nie je len škaredý — je oslabený, po endodoncii alebo s veľkou " +
      "výplňou.",
    body:
      "Fazeta rieši vzhľad, korunka aj pevnosť. Keď zo zuba veľa chýba alebo " +
      "je po ošetrení koreňových kanálikov, fazeta ho neudrží — korunka ho " +
      "obopne celý a prevezme naň žuvací tlak.",
    facts: [
      { label: "Zub sa brúsi", value: "Po obvode" },
      { label: "Hotové", value: "Vo viacerých návštevách" },
      { label: "Vydrží", value: "Chráni aj oslabený zub" },
    ],
  },
];

/**
 * The try-before-you-drill section.
 *
 * The clinic confirmed on 2026-09-04 that they do this, and it is the single
 * strongest thing on the page: the fear that stops people is not the price, it
 * is that the tooth does not grow back. Being able to see and wear the result
 * before anything is touched answers exactly that.
 *
 * Prices are the clinic's own preparation rows.
 */
export const preview = {
  heading: "Uvidíte to skôr, než sa čokoľvek dotkne zuba",
  lead:
    "Na predných zuboch sa nedá nič vrátiť späť. Preto sa výsledok najprv " +
    "postaví — a vy sa naň pozriete v zrkadle, kým je ešte všetko len návrh.",
  steps: [
    {
      name: "3D sken",
      price: "120 €",
      note: "Digitálny odtlačok chrupu, bez hmoty v ústach.",
    },
    {
      name: "Wax up",
      price: "20 € / zub",
      note: "Nový tvar sa vymodeluje na modeli, mimo úst.",
    },
    {
      name: "Voskový mock up",
      price: "30 €",
      note: "Ten tvar dostanete nasadený na vlastné zuby. Nič sa nebrúsi.",
    },
  ],
  note:
    "Až keď poviete áno tomu, čo vidíte v zrkadle, začíname pracovať na " +
    "definitívnom riešení.",
} as const;

/**
 * How long it lasts.
 *
 * The clinic's own answer, 2026-09-04: *"ak sa o to starajú (pravidelné
 * čistenie) tak to drží celý život."*
 *
 * ⚠️ Written with the condition in front of the promise, deliberately. "Vydrží
 * celý život" on its own is a guarantee the clinic would have to honour for
 * somebody who never comes back; the same sentence with its condition first is
 * the true version and is also the more useful one — it is what actually makes
 * the difference.
 */
export const longevity = {
  heading: "Ako dlho to vydrží",
  claim: "Kým sa oň staráte, tak dlho, ako vlastný zub.",
  body:
    "Fazety ani korunky sa nekazia — kazí sa zub a ďasno pod nimi. Pri " +
    "pravidelnej dentálnej hygiene vydrží estetická práca podľa našich " +
    "skúseností celý život. Bez nej ju o ňu pripraví to isté, čo pripraví " +
    "človeka o vlastné zuby.",
  linkLabel: "Dentálna hygiena GBT",
  linkHref: "/sluzby/dentalna-hygiena",
} as const;

/** The published cases that are this service's own work. */
export const aestheticCaseIds = [
  "fazety-horny-oblik",
  "stiesnene-rezaky",
  "dostavba-hran",
] as const;
