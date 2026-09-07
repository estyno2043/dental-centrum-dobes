/**
 * Endodoncia pod mikroskopom.
 *
 * Source: the clinic's written answers, 2026-09-06. Every price is from their
 * list valid 1. 3. 2026.
 *
 * The page's spine is *time*, not money, and that is the doctor's own answer:
 * "u zubov, kde sa robí endo na ešte živom nerve, je úspešnosť skoro 100 %.
 * Čím je stav horší… úspešnosť klesá." A reader with a sore tooth is deciding
 * whether to ring today or in a month, and that sentence is the only thing on
 * the page that answers it.
 *
 * ⚠️ The pricing device from the implant and periodontology pages does not
 * work here and must not be copied onto it. Those pages can total a procedure;
 * this one cannot, and the doctor said so outright: *"Úplne presná cena vopred
 * neexistuje. Len odhad."* What replaces it is a worked example with every
 * component named, marked as an estimate — which is more useful than the "od
 * 170 €" every competitor publishes and then surprises people with.
 */

/* ---------------------------------------------------------- the opening --- */

/**
 * The sentence the reader arrived with.
 *
 * Almost nobody searches for endodontics. They search after somebody has told
 * them a tooth has to come out, and the page's first job is to say that this
 * is not always true. The odds underneath then say why waiting makes it less
 * true by the month.
 */
export const opening = {
  heading: "Povedali vám, že zub musí von?",
  body:
    "Nie vždy musí. Pod mikroskopom vidno kanáliky, ktoré voľným okom vidieť " +
    "nie je, a prerobiť sa dá aj ošetrenie, ktoré sa niekomu inému " +
    "nepodarilo. Vytrhnutie má zmysel až vtedy, keď sa zub naozaj zachrániť " +
    "nedá.",
} as const;

/* ------------------------------------------------------------- the odds --- */

/**
 * The reason to come now.
 *
 * ⚠️ One number only, and it is the clinic's: nearly 100% while the nerve is
 * alive. The worse states carry no percentage because the doctor gave none —
 * "úspešnosť je rôzna podľa východiskového stavu" — and inventing a ladder of
 * figures would be putting numbers in a dentist's mouth on his own subject.
 */
export const odds = {
  heading: "Šanca je najvyššia dnes",
  claim: "Kým nerv v zube ešte žije, ošetrenie sa darí takmer vždy.",
  body:
    "Úspešnosť koreňového ošetrenia nie je jedno číslo. Závisí od toho, v " +
    "akom stave zub prinesiete. Pri živom nerve je takmer stopercentná. S " +
    "každou vecou, ktorá sa medzitým pridá, klesá.",
  lowersHeading: "Čo ju znižuje",
  lowers: [
    "Odumretý nerv",
    "Zápal v okolí koreňového hrotu",
    "Zle ošetrené kanáliky z minulosti",
    "Perforácia koreňa",
  ],
  note:
    "Preto tu nenájdete jedno percento úspešnosti. Nájdete dôvod neodkladať " +
    "to o mesiac.",
  /*
   * The button goes here rather than at the foot of the page. This section is
   * the whole argument, and its argument is about time: a reader who has just
   * been told that every month lowers the odds should not have to scroll past
   * six more sections to act on it.
   */
  cta: {
    text: "Čím skôr zub uvidíme, tým viac sa s ním ešte dá urobiť.",
    label: "Objednať sa na vyšetrenie",
    href: "#booking",
  },
} as const;

/**
 * Where the promises stop, in the doctor's own terms: *"Nedá sa na to dať
 * záruka, lebo hojenie závisí od stavu a schopnosti organizmu."*
 *
 * On the implant page the guarantee is the strongest thing the clinic says.
 * Here the strongest thing is that there isn't one, and why — which is the
 * same quality of answer pointing the other way.
 */
export const guarantee = {
  heading: "Na endodonciu záruku nedávame",
  body:
    "Hojenie po koreňovom ošetrení závisí od stavu zuba a od toho, ako sa s " +
    "ním vyrovná váš organizmus. To nie je vec, ktorú vieme sľúbiť, a preto " +
    "ju nesľubujeme. Sľúbiť vieme, ako to urobíme.",
} as const;

/* -------------------------------------------------------- the microscope --- */

export const microscope = {
  heading: "Pri 25-násobnom zväčšení",
  body:
    "Koreňový kanálik je užší než vlas a býva ich v zube viac, než je vidieť " +
    "voľným okom. Mikroskop je rozdiel medzi ošetrením podľa citu a ošetrením " +
    "podľa toho, čo je naozaj vidieť. Rozhoduje aj o tom, čo sa ešte dá " +
    "zachrániť.",
  /* Stated as a fact of its own, because elsewhere it is a surcharge. */
  free: "Mikroskop sa nepripláca. Je súčasťou ošetrenia.",
  points: [
    {
      title: "Prerobíme zle ošetrené kanáliky",
      note:
        "Pacientov, ktorým koreňové ošetrenie robil niekto iný a nepodarilo " +
        "sa, bežne prijímame.",
    },
    {
      title: "Vyberieme zalomený nástroj",
      note:
        "Väčšinou sa to podarí, pokiaľ je v mieste, kam pod mikroskopom " +
        "vidíme. Presne na tom tu záleží.",
    },
    {
      title: "Nájdeme kanálik, ktorý sa prehliadol",
      note:
        "Neošetrený kanálik je najčastejší dôvod, prečo zub bolí aj po " +
        "„hotovom“ ošetrení.",
    },
  ],
} as const;

/* ------------------------------------------------------------- the visit --- */

export const visit = {
  heading: "Koľko to trvá",
  lead:
    "Podľa toho, aký zložitý zub je. Niekedy sú štyri kanáliky hotové za " +
    "hodinu, inokedy trvajú tri. Odhadneme to z RTG snímky ešte pred " +
    "začiatkom.",
  facts: [
    { label: "Vyhradený čas", value: "1,5 – 2 hodiny" },
    { label: "Ošetrenie kanálikov", value: "Spravidla naraz" },
    { label: "Korunka", value: "Samostatný termín" },
  ],
  body:
    "Vyhradiť si na jeden zub dve hodiny je rozhodnutie, nie prísľub. " +
    "Koreňové kanáliky sa nedajú robiť v dvadsaťminútových oknách medzi " +
    "inými pacientmi. Práve tie ošetrenia sa potom o dva roky prerábajú.",
} as const;

/* -------------------------------------------------------------- the cost --- */

export type CostLine = {
  readonly label: string;
  readonly price: string;
  readonly note?: string;
};

/**
 * A worked example, not a price.
 *
 * ⚠️ Do not turn this into a single total the way the implant page does. The
 * doctor was explicit that no exact price exists in advance, and every line
 * below is conditional on the tooth: the X-ray if one is taken, the
 * reciprocating instrument if it is used, the closing filling depending on
 * how much of the tooth is left. The figure is honest only while it is
 * labelled an estimate.
 */
export const cost = {
  heading: "Prečo vám presnú cenu nikto nepovie vopred",
  lead:
    "Koreňové ošetrenie nie je jedna položka a jeho cena sa nedá poskladať " +
    "dopredu. Nižšie je skutočný príklad so všetkým, čo doňho vstupuje, aby " +
    "ste vedeli, z čoho sa suma skladá, aj keď ju presne poznáme až pri " +
    "snímke.",
  exampleHeading: "Stolička so štyrmi kanálikmi, na jedno sedenie",
  lines: [
    { label: "Jednorazové endo 4 kk", price: "270 €", note: "Celé ošetrenie kanálikov od začiatku do konca." },
    { label: "Injekčná anestézia", price: "15 €" },
    { label: "Koferdam", price: "15 €", note: "Izolácia zuba. Bez nej sa kanáliky ošetriť nedajú načisto." },
    { label: "RTG snímka", price: "10 €", note: "Ak sa robí." },
    { label: "Ošetrenie Reciproc", price: "25 €", note: "Ak sa použije." },
    { label: "Uzáver vstupnej kavity", price: "od 80 €", note: "Výplň, ktorou sa zub na konci zavrie." },
  ] satisfies readonly CostLine[],
  estimateLabel: "Zhruba",
  estimate: "415 €",
  estimateNote:
    "Odhad, nie cenník. Presnú sumu vám povieme pred zákrokom, keď vidíme " +
    "snímku. Nie po ňom.",
  freeNote: "Mikroskop v tom je. Nepripláca sa zaň.",
  twoVisitsHeading: "Keď sa to robí na dvakrát",
  twoVisits:
    "Niektorý zub treba najprv upokojiť. Vtedy sa pri prvej návšteve platí " +
    "paliatívne ošetrenie kanálikov a pri druhej definitívna koreňová výplň, " +
    "70 € za každý kanálik. Anestézia a koferdam sa rátajú pri oboch.",
} as const;

/* ------------------------------------------------------- save or replace --- */

/**
 * The comparison the rest of the site makes possible.
 *
 * ⚠️ Both sides are estimates and both are marked as such. The left is the
 * example above plus a `Celokeramická korunka Zirkón` (455 €); the right is
 * the implant page's own lower bound, which is itself a whole tooth — implant,
 * abutment and crown — and not an "od" teased off the cheapest part.
 */
export const compare = {
  heading: "Zachrániť, alebo nahradiť",
  lead:
    "Zub, ktorý sa nezachráni, sa skôr či neskôr nahrádza. Preto sa cena " +
    "koreňového ošetrenia porovnáva s cenou implantátu, nie s nulou.",
  keep: {
    label: "Zachrániť vlastný zub",
    value: "≈ 870 €",
    note: "Príklad vyššie plus celokeramická korunka (455 €).",
  },
  replace: {
    label: "Nahradiť ho implantátom",
    value: "od 1 490 €",
    note: "Implantát, nadstavba aj korunka.",
    href: "/sluzby/zubne-implantaty",
  },
  note:
    "Obe sumy sú odhady. Rozdiel však nie je len v peniazoch. Vlastný koreň " +
    "drží v kosti inak než titán a nič sa nemusí tri mesiace hojiť.",
} as const;

/* -------------------------------------------------------------- the crown */

export const crown = {
  heading: "Potrebuje zub potom korunku?",
  body:
    "Odporúčame ju, povinná nie je. Najmä pri premolároch a stoličkách, kde " +
    "je žuvací tlak najväčší a zub po ošetrení krehne. Predné zuby sa " +
    "korunkujú menej často, spravidla vtedy, keď to vyžaduje vzhľad.",
  linkLabel: "Estetická stomatológia",
  linkHref: "/sluzby/esteticka-stomatologia",
} as const;

/* -------------------------------------------------------------- the limit */

/**
 * Deliberately not a list. Asked when a tooth cannot be saved, the doctor
 * answered: *"na to neexistuje presná odpoveď. Je príliš veľa možností."* A
 * page that enumerates conditions anyway would be inventing a rule he declined
 * to give.
 */
export const limit = {
  heading: "Keď sa zachrániť nedá",
  body:
    "Zoznam podmienok, za ktorých je zub stratený, neexistuje. Možností je " +
    "príliš veľa a rozhoduje konkrétny nález. Keď to tak je, povieme vám to " +
    "rovno a nebudeme to skúšať za vaše peniaze. Vtedy má zmysel baviť sa o " +
    "náhrade.",
  linkLabel: "Zubné implantáty",
  linkHref: "/sluzby/zubne-implantaty",
} as const;
