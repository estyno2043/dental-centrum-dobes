/**
 * Biele výplne.
 *
 * Built 2026-09-25. The theme is the promise in the service's own lead: a
 * filling you cannot tell from the tooth. The page's device is the price,
 * shown on a drawn tooth: the list prices a composite by the number of
 * surfaces it covers, which means nothing to a patient until they can see
 * which surfaces those are.
 *
 * Sources, and what each one supports:
 *
 * - The clinic's written answers, 2026-09-21: *"Výplne sa robia hlavne z
 *   kompozitu, ale niekedy používame aj skloionomér a kombináciu. Mliečne
 *   zuby hlavne skloionomér. Amalgám meníme, keď to treba, alebo keď to
 *   pacient chce. Biele výplne vydržia roky. Kým sa nezoderú. Vždy podľa
 *   starostlivosti. Inlay onlay na požiadanie. Častejšie na mŕtve zuby
 *   dávame korunky. Viac chránia. Anestézu ponúkame každému. Niekto nechce."*
 * - The user, 2026-09-21: a filling is finished in one visit and takes about
 *   an hour.
 * - What decides where a price lands inside its range was left to us by the
 *   user, to be answered from published sources. General dental references
 *   agree on the same three things: how large and deep the cavity is, where
 *   the tooth sits (between teeth and at the back is slower work), and how
 *   much layering the composite needs. That is what the page says, and it
 *   says it as the general rule, not as the clinic's own pricing formula.
 *
 * Every price is the clinic's, from the list valid 1. 3. 2026, and a test
 * pins each one to that list.
 */

export const opening = {
  heading: "Plomba, ktorú od zuba nerozoznáte.",
  body:
    "Biele výplne robíme hlavne z kompozitu. Nanáša sa vo vrstvách priamo " +
    "na zub, v jeho vlastnom odtieni, takže po vyleštení splynie so zubom " +
    "okolo seba. Niekedy použijeme aj skloionomér alebo ich kombináciu.",
  facts: [
    { label: "Hotové", value: "Za jednu návštevu" },
    { label: "Trvá", value: "Zhruba hodinu" },
    { label: "Anestézia", value: "Ponúkame každému" },
  ],
} as const;

/* ---------------------------------------------------------- the surfaces */

export type SurfaceOption = {
  readonly count: 1 | 2 | 3;
  readonly label: string;
  /** The published row this option is priced from. */
  readonly row: string;
  readonly price: string;
  /** Which surfaces, in words a patient follows. */
  readonly which: string;
};

/**
 * One, two and three surfaces, as the list prices them. The drawing shows a
 * molar from above: the chewing surface in the middle and the two sides that
 * touch the neighbouring teeth. A two-surface filling is the chewing surface
 * and one of those sides, a three-surface one both; that is the ordinary
 * shape of a cavity that has reached between the teeth.
 */
export const surfaces = {
  heading: "Cena podľa toho, koľko plôšok zuba výplň pokryje",
  lead:
    "Zub má viac plôšok a kaz ich môže zasiahnuť jednu aj viac. Vyberte si a " +
    "uvidíte, ktoré to sú a koľko stojí biela výplň.",
  options: [
    {
      count: 1,
      label: "1 plôška",
      row: "Fotokompozit – jedna plôška",
      price: "80 – 105 €",
      which: "Len žuvacia plôška, najčastejšie malý kaz v ryhe zuba.",
    },
    {
      count: 2,
      label: "2 plôšky",
      row: "Fotokompozit – dve plôšky",
      price: "100 – 120 €",
      which:
        "Žuvacia plôška a jedna bočná, keď kaz zasiahol aj miesto, kde sa zub " +
        "dotýka suseda.",
    },
    {
      count: 3,
      label: "3 plôšky",
      row: "Fotokompozit – tri plôšky",
      price: "125 – 145 €",
      which: "Žuvacia plôška a obe bočné, kaz z oboch strán zuba.",
    },
  ] satisfies readonly SurfaceOption[],
  rangeHeading: "Od čoho závisí, kde v rozpätí cena skončí",
  factors: [
    {
      title: "Veľkosť a hĺbka kazu",
      note: "Väčší a hlbší kaz znamená viac práce aj viac materiálu.",
    },
    {
      title: "Kde zub je",
      note:
        "Medzi zubmi a vzadu v ústach sa pracuje ťažšie než na prednej " +
        "strane zuba.",
    },
    {
      title: "Koľko vrstiev treba",
      note:
        "Kompozit sa nanáša v tenkých vrstvách a každá sa vytvrdí svetlom. " +
        "Čím väčšia výplň, tým viac vrstiev.",
    },
  ],
  deepNote:
    "Ak je kaz hlboko pri nerve, dáva sa pod výplň ochranná podložka. Tá je v " +
    "cenníku ako samostatná položka.",
} as const;

/* -------------------------------------------------------------- the visit */

/**
 * One visit, about an hour. The steps are the ordinary sequence of a direct
 * composite filling; nothing here claims an instrument or protocol the
 * clinic has not described.
 */
export const visit = {
  heading: "Jedna návšteva, zhruba hodina",
  steps: [
    {
      title: "Anestézia, ak ju chcete",
      note: "Ponúkame ju každému. Niekto ju nechce a to je v poriadku.",
    },
    {
      title: "Odstránenie kazu",
      note: "Zo zuba sa odstráni časť napadnutá kazom.",
    },
    {
      title: "Výplň po vrstvách",
      note:
        "Kompozit v odtieni vášho zuba sa nanáša v tenkých vrstvách a každá " +
        "sa vytvrdí svetlom.",
    },
    {
      title: "Tvar, zhryz a leštenie",
      note:
        "Výplň dostane tvar zuba, skontrolujeme, či vám nič neprekáža pri " +
        "zahryznutí, a vyleští sa do lesku.",
    },
  ],
} as const;

/* ------------------------------------------------------------- amalgam */

export const amalgam = {
  heading: "Máte staré tmavé plomby?",
  body:
    "Amalgám meníme, keď je to potrebné, alebo keď si to prajete. Tmavú " +
    "plombu nahradí biela, ktorá sa na zube stratí.",
  cta: { label: "Objednať sa na výmenu", href: "#booking" },
} as const;

/* ------------------------------------------------------------ materials */

export const materials = {
  heading: "Z čoho výplne robíme",
  items: [
    {
      name: "Kompozit",
      use: "Najčastejšie",
      note:
        "Biela výplň v odtieni zuba, nanášaná a tvarovaná priamo na zube.",
    },
    {
      name: "Skloionomér",
      use: "Niekedy, pri mliečnych zuboch hlavne",
      note:
        "Materiál, ktorý sa na zub viaže sám. Pri mliečnych zuboch je to " +
        "naša prvá voľba.",
    },
    {
      name: "Kombinácia",
      use: "Keď to zub potrebuje",
      note: "Skloionomér pod výplňou, kompozit navrchu.",
    },
  ],
} as const;

/* ------------------------------------------------------------ longevity */

export const longevity = {
  heading: "Ako dlho vydrží",
  claim: "Roky. Kým sa nezoderie.",
  body:
    "Ako dlho, rozhoduje starostlivosť. Výplň sa nekazí, kazí sa zub okolo " +
    "nej, a v ústach, o ktoré sa nikto nestará, nevydrží dlho nič.",
  linkLabel: "Dentálna hygiena GBT",
  linkHref: "/sluzby/dentalna-hygiena",
} as const;

/* ------------------------------------------------------------ bigger work */

/**
 * When a filling is not enough. Inlay and onlay are made on request; for a
 * root-treated tooth the clinic more often recommends a crown, because it
 * protects more.
 */
export const beyond = {
  heading: "Keď na výplň zostalo zuba málo",
  items: [
    {
      title: "Kompozitná rekonštrukcia korunky",
      price: "135 – 175 €",
      row: "Kompozitná rekonštrukcia korunky zuba",
      note: "Keď treba dostavať väčšiu časť zuba, stále za jednu návštevu.",
    },
    {
      title: "Inlay",
      price: "350 €",
      row: "Inlay kompozitná",
      note: "Výplň vyrobená mimo úst a vlepená do zuba. Robíme ju na požiadanie.",
    },
  ],
  crownNote:
    "Pri mŕtvom zube, napríklad po ošetrení koreňových kanálikov, častejšie " +
    "odporúčame korunku. Zub chráni viac.",
  crownLinkLabel: "Estetická stomatológia",
  crownLinkHref: "/sluzby/esteticka-stomatologia",
} as const;

/* --------------------------------------------------------------- the cases */

/**
 * The two published cases done in composite. They are bonding on front teeth,
 * not fillings of caries, and the caption says so: they are here to show the
 * material, which is the same one.
 */
export const fillingsCaseIds = ["medzera-predne", "dostavba-hran"] as const;

export const casesIntro = {
  heading: "Ten istý materiál, na predných zuboch",
  note:
    "Nejde o plomby, ale o dostavbu zubov kompozitom. Ukazujú, ako sa " +
    "materiál stratí na zube, ktorý je vidieť najviac.",
} as const;
