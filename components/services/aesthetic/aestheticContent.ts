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
 * ⚠️ One reading is mine and still needs confirming: the list bills
 * `Fazetovanie zuba` at 190 € and `Fazetovanie zuba Empress Direct` at 220 €.
 * Both are direct composite done chairside; Empress Direct is Ivoclar's
 * premium nano-hybrid, so the difference is described here as the material
 * rather than the method. If the 30 € is in fact extent or something else,
 * this is the line to fix. Asked on 2026-09-04; not answered.
 *
 * Clinic answers, 2026-09-05, and what each one changed here:
 *
 * - *"Vieme urobiť aj mock up pred začatím práce, ale moc to ľudia
 *   nevyžadujú. V sumáre to navíši cenu, tak sa do toho nehrnú."* — the page
 *   had made the try-before-you-drill preview its spine and described it as
 *   what always happens. It is not. It is now an option the reader can ask
 *   for, with the cost named, and the section that carried it was rebuilt
 *   around what does happen.
 * - *"Máme skener 3shape. To je náhrada silikónových odtlačkov."* — so the
 *   scan is a comfort, not a preview device.
 * - *"Výroba koruniek trvá 2 týždne. Na druhý deň po obrúsení dostane pacient
 *   frézované dočasné korunky z laboratória... cca 3 návštevy sú štandard."*
 *   — this is the stronger answer to the fear the page is built against, and
 *   unlike the mock-up it is what the clinic actually does every time.
 * - *"Ordinačné bielenie nerobíme. Neosvedčilo sa."* — stated on the
 *   whitening option rather than left as a hole for the reader to notice.
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
    "je, čo ktorá z nich naozaj rieši, aby ste sa rozhodovali podľa toho, a " +
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
    /*
     * "Bieliace dlahy" is the clinic's term and it is used everywhere the
     * whitening is described — except here, where "bielenie v bieliacich
     * dlahách" stutters on its own root directly under the word "Bielenie".
     * The noun is what was asked for; the adjective is redundant when the
     * heading above already says it, and the full term is in the body below.
     */
    kind: "Domáce bielenie v dlahách na mieru",
    price: "260 €",
    solves: "Zuby máte zdravé a rovné, len tmavšie, než by ste chceli.",
    body:
      "Odoberieme odtlačok a vyrobíme bieliace dlahy presne na váš chrup. " +
      "Gél si " +
      "aplikujete doma, cez noc, počas dvoch týždňov. Zub sa nijako nebrúsi. " +
      "Zo všetkých riešení je toto jediné úplne vratné. Ako dlho výsledok " +
      "vydrží, rozhoduje káva, čaj, víno a cigarety: pri striedmom pití aj " +
      "dva roky, pri každodennej káve skôr pol roka. Potom sa dá zopakovať. " +
      "Jednorazové ordinačné bielenie v kresle nerobíme. Nemá podľa nás " +
      "dostatočne dobré výsledky na to, aby sme ho ponúkali.",
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
      "minimálne alebo vôbec. Je to najdostupnejší spôsob, ako zmeniť tvar. " +
      "A keď sa časom ošúcha, dá sa opraviť bez toho, aby sa začínalo odznova.",
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
      "vlastnými zubami, čo je pri predných jednotkách celý rozdiel.",
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
      "Vyžaduje tri návštevy, lebo medzi nimi pracuje laboratórium. " +
      "Medzitým nosíte dočasné korunky, nie obrúsené zuby.",
    facts: [
      { label: "Zub sa brúsi", value: "Tenká vrstva skloviny" },
      { label: "Hotové", value: "3 návštevy, zhruba dva týždne" },
      { label: "Vydrží", value: "Nezafarbuje sa" },
    ],
  },
  {
    id: "korunka",
    name: "Celokeramická korunka Zirkón",
    kind: "Prekryje celý zub, nie iba prednú plochu",
    price: "455 €",
    solves:
      "Zub nie je len škaredý. Je oslabený, po endodoncii alebo s veľkou " +
      "výplňou.",
    body:
      "Fazeta rieši vzhľad, korunka aj pevnosť. Keď zo zuba veľa chýba alebo " +
      "je po ošetrení koreňových kanálikov, fazeta ho neudrží. Korunka ho " +
      "obopne celý a prevezme naň žuvací tlak.",
    facts: [
      { label: "Zub sa brúsi", value: "Po obvode" },
      { label: "Hotové", value: "3 návštevy, zhruba dva týždne" },
      { label: "Vydrží", value: "Chráni aj oslabený zub" },
    ],
  },
];

/**
 * What actually happens, visit by visit.
 *
 * This section used to be the mock-up. The clinic corrected that on
 * 2026-09-05: the mock-up is technically available but is not routine, most
 * people decline it once it is priced, and building the page's spine on
 * something most patients never see would have been a promise the clinic did
 * not make.
 *
 * What replaced it is stronger, because it is what happens every time. The
 * fear behind "na predných zuboch sa nedá nič vrátiť" is not really the
 * drilling — it is the fortnight afterwards, walking around ground down while
 * a laboratory works. That fortnight does not exist here: milled temporaries
 * arrive from the laboratory the next day and already resemble the finished
 * porcelain.
 *
 * ⚠️ Not asked, and deliberately not implied either way: whether the 120 €
 * `3D sken 3SHAPE` is billed on top of the 455 € crown or is part of it. The
 * step below names the scanner as the method and quotes no price for it.
 */
export const course = {
  heading: "Tri návštevy a ani jeden deň s obrúsenými zubami",
  lead:
    "Keramická fazeta aj korunka sa vyrábajú v laboratóriu a to trvá zhruba " +
    "dva týždne. Nečakáte ich však s obrúsenými zubami: hneď na druhý deň " +
    "dostávate dočasné korunky, ktoré sa už podobajú tým budúcim.",
  steps: [
    {
      name: "Obrúsenie a 3D sken",
      when: "1. návšteva",
      note:
        "Odtlačok robíme skenerom 3Shape namiesto silikónu. Nič stuhnuté " +
        "v ústach a laboratórium dostáva podklad rovno.",
    },
    {
      name: "Dočasné korunky z laboratória",
      when: "Na druhý deň",
      note:
        "Frézované, nie narýchlo dolepené v kresle. Sú urobené tak, aby sa " +
        "čo najviac podobali budúcim porcelánovým, a nosia sa pohodlne.",
    },
    {
      name: "Nasadenie definitívnej práce",
      when: "Zhruba o dva týždne",
      note:
        "Toľko trvá výroba. Ak potrebujete byť hotový skôr, napríklad na svadbu alebo " +
        "fotenie, termín sa dá dohodnúť individuálne.",
    },
  ],
  note:
    "Tri návštevy sú štandard. Koľko ich bude presne u vás, viete po prvom " +
    "vyšetrení, nie skôr.",
} as const;

/**
 * The mock-up, told the way the clinic actually offers it.
 *
 * Left on the page rather than deleted, because for the one reader in ten who
 * cannot commit without seeing it first this is the thing that decides — but
 * demoted, and with the reason people skip it stated rather than hidden. A
 * page that sells an add-on as standard practice is the kind of page this one
 * is trying not to be.
 */
export const mockUp = {
  heading: "Ak si chcete tvar vyskúšať ešte pred brúsením",
  body:
    "Dá sa to. Nový tvar sa vymodeluje mimo úst a potom sa vám nasadí na " +
    "vlastné zuby, takže sa naň pozriete v zrkadle, kým sme sa ničoho " +
    "nedotkli. Nie je to bežná súčasť práce. Navyšuje to cenu a väčšina " +
    "ľudí to nevyžaduje. Keď to chcete, povedzte nám to hneď na začiatku.",
  steps: [
    {
      name: "Wax up",
      price: "20 € / zub",
      note: "Nový tvar sa vymodeluje na modeli.",
    },
    {
      name: "Voskový mock up",
      price: "30 €",
      note: "Ten tvar dostanete nasadený na vlastné zuby. Nič sa nebrúsi.",
    },
  ],
} as const;

/**
 * The photograph for the course section, supplied by the user 2026-09-07.
 *
 * It is the one image on this page that carries its promise about comfort: the
 * 3Shape wand actually in a patient's mouth, where the silicone tray used to
 * go. The frame's placeholder had asked for exactly this shot.
 *
 * Cropped 4:5 from the source's 1536x2752, 180px down, which keeps the loupes,
 * both hands, the wand and the mouth and drops only the chair below them.
 *
 * ⚠️ A real patient's face, and the clinic's own. Their consent applies here
 * the same as for any case photograph on this site.
 */
export const coursePhoto = {
  src: "estetika-skener",
  width: 900,
  height: 1125,
  alt:
    "Lekár s lupovými okuliarmi sníma chrup pacientky intraorálnym skenerom " +
    "3Shape",
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
    "Fazety ani korunky sa nekazia. Kazí sa zub a ďasno pod nimi. Pri " +
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
