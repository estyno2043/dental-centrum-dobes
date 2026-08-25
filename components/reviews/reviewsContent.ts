/**
 * Google reviews shown in the bar that rises from the hero's rating.
 *
 * ⚠️ These are real reviews written by real people, copied from the clinic's
 * Google listing on 2026-08-25. Three rules follow from that, and none of them
 * are style preferences:
 *
 *   Verbatim, including the mistakes. Several of these are typed without
 *   diacritics, one has a stray space before a comma, one ends without a full
 *   stop. All of it stays. Tidying someone's grammar puts words in their mouth
 *   that they did not write, and the review stops being theirs.
 *
 *   Whole, or not at all. No trimming to fit — the bar scrolls instead. The
 *   longest review here argues *against* the clinic's critics on its way to
 *   praising them; cutting it to the flattering half would be the clearest
 *   possible way to misrepresent someone.
 *
 *   Attributed as Google attributes it. `meta` is stored as one literal string
 *   rather than assembled from numbers, so what appears under the name is what
 *   Google prints under the name — Slovak plurals, thousands separators and
 *   all. `date` likewise keeps Google's own "Upravené pred…" where the review
 *   was edited.
 *
 * No profile photographs. Every avatar is drawn from the reviewer's initial,
 * which is Google's own fallback. Re-hosting fifteen people's photographs on
 * the clinic's server is republishing their likeness somewhere they never put
 * it, and it is not needed for the reviews to read as real.
 */

export type Review = {
  readonly id: string;
  /** As Google displays it — including lowercase, initials, missing surnames. */
  readonly author: string;
  /**
   * The line Google prints under the name, stored whole rather than assembled:
   * "Miestny sprievodca · 24 recenzií · 41 fotiek", "1 recenzia", "8 recenzií".
   */
  readonly meta: string;
  /** Drives the badge on the avatar. True when `meta` opens with the title. */
  readonly localGuide: boolean;
  readonly rating: 1 | 2 | 3 | 4 | 5;
  /** Google's own wording, "pred rokom" or "Upravené pred 2 mesiacmi". */
  readonly date: string;
  /** The review, exactly as written. */
  readonly text: string;
};

export const reviews: readonly Review[] = [
  {
    id: "eva-dvorackova",
    author: "Eva Dvorackova",
    meta: "Miestny sprievodca · 24 recenzií · 41 fotiek",
    localGuide: true,
    rating: 5,
    date: "pred 11 mesiacmi",
    text:
      "K pani dr. Dobesovej chodim aj s celou rodinou uz mnoho rokov. Dala mi " +
      "zuby komplet doporiadku. Moje deti sa vdaka jej pristupu neboja zubara, " +
      "prave naopak, vzdy sa tam tesia. Pani Dobesova ma skvely pristup k " +
      "pacientom, vzdy je usmiata a prijemna. Vzdy mam pocit, ze jej na " +
      "paciantoch naozaj zalezi. Cely zazitok na klinike je vzdy spickovy. Od " +
      "velmi prijemnej pani na recepcii, cez milu zubnu technicku na dentalnej " +
      "hygiene - naucila ma ako sa o zuby starat tak, ze som uz davno nemala " +
      "kaz. Mam tak isto skusenost s ich chirurgiou, meno pani doktorky som " +
      "zabudla, a spravila spickovu robotu. Nesuhlasim s negativnymi " +
      "recenziami, ktore tvrdia, ze si “vzdy nieco najde”. Je pochopitelne, ze " +
      "o zuby sa streba starat (nie len umyvanim) a o to viac, ak uz clovek ma " +
      "daku plombu. Nie su navzdy, treba ich opravovat, menit. Za mna skvela " +
      "klinika a som vdacna kamaratke, ktora mi ich odporucila.",
  },
  {
    id: "vendula-brockova",
    author: "Vendula Brockova",
    meta: "1 recenzia",
    localGuide: false,
    rating: 5,
    date: "pred rokom",
    text:
      "Bežne recenzie nepíšem, ale v tomto prípade jednoducho musím, pretože " +
      "si ju naozaj zaslúžite. Prístup pani doktorky Kunovej a jej sestričky " +
      "je mimoriadne príjemný, pokojný a zároveň profesionálny. Pani doktorka " +
      "je veľmi trpezlivá, ľudská a počas celého zákroku podáva jasné a " +
      "zrozumiteľné informácie o tom, čo sa bude diať. Vďaka tomu sa pacient " +
      "cíti pokojne a v dobrých rukách. Nikdy by som nepovedala, že sa dá na " +
      "návštevu zubára tešiť – ale u vás to naozaj možné je. Ďakujem za váš " +
      "prístup, odbornosť a starostlivosť.",
  },
  {
    id: "martin-mancik",
    author: "Martin Mancik",
    meta: "8 recenzií",
    localGuide: false,
    rating: 5,
    date: "pred rokom",
    text:
      "Dental Centrum Dobeš navštevujeme pravidelne s celou mojou rodinou. Sme " +
      "maximálne spokojní s prístupom a odbornou starostlivosťou. Od " +
      "prevencie, cez dentálnu hygienu, až po prípadné zákroky, všetko " +
      "prebieha v krásnom prostredí a v príjemnej a priateľskej atmosfére. " +
      "Naše deti sa už od prvých návštev zbavili strachu z ošetrenia a za tie " +
      "roky, čo chodíme do DCD, sa stala návšteva zubára príjemnou udalosťou. " +
      "K spokojnosti prispieva aj vyhradené parkovanie pre klientov. Dental " +
      "Centrum Dobeš radím do TOP 3 v Bratislave.",
  },
  {
    id: "pavel-horvath",
    author: "Pavel Horváth",
    meta: "Miestny sprievodca · 223 recenzií · 1 313 fotiek",
    localGuide: true,
    rating: 5,
    date: "Upravené pred rokom",
    text:
      "No proste je to úplne iná návšteva u zubára. Úsmev, dobrá nálada, " +
      "profesionalita a kvalitná práca. Po dlhých rokoch som začal chodiť na " +
      "vyšetrenie, či zákroky s radosťou a úsmevom.",
  },
  {
    id: "helena-danielova",
    author: "Helena Danielová",
    meta: "Miestny sprievodca · 57 recenzií · 22 fotiek",
    localGuide: true,
    rating: 5,
    date: "pred 3 rokmi",
    text:
      "Celý život sa trápim so zubami a moje návštevy u zubára boli vždy s " +
      "bolestivými zubami a niekoľkokrát ročne. Odkedy chodím k Dr. " +
      "Novotňákovej, nepamätám, čo sú bolesti zubov, medzičasom sme pacientmi " +
      "celá rodina, prístup vždy skvelý profesionálny, úkony bezbolestné a " +
      "hlavne, nemusia sa opakovať 😊. Od mojej prvej návštevy tohto " +
      "pracoviska si tam chodím oddýchnuť.",
  },
  {
    id: "silvia-kovacikova",
    author: "Silvia Kováčiková",
    meta: "9 recenzií",
    localGuide: false,
    rating: 5,
    date: "pred 4 rokmi",
    text:
      "Touto cestou by som sa chcela poďakovať pani doktorke Danielke " +
      "Novotnakovej. Je vzácnosťou stretnúť špecialistu, ktorý má tak " +
      "neskutočné nasadenie a cit pre krásu. Naviac má maximálne profesionálny " +
      "pristup a pritom je ľudská, milá a spolu so sestričkou na 100% zohrána " +
      "a priateľská. Celková starostlivosť, ale aj snaha o vysvetlenie " +
      "zakroku, možnostiach riešenia, vyhradenie dostatočného času naozaj top. " +
      "Napriek tomu, že zákrok trval viac hodín obdivovala som výdrž, " +
      "trpezlivosťou, pedantnosť a erudovanosť jej práce. Keď som videla " +
      "finálny výsledok neverila som vlastným očiam. Srdečná vďaka, ze " +
      "existujú ľudia ako ste Vy, čo dokážu tak zázračne vyčariť ľudom " +
      "nádherný úsmev:)",
  },
  {
    id: "marek-popy",
    author: "marek popy",
    meta: "5 recenzií · 4 fotky",
    localGuide: false,
    rating: 5,
    date: "pred rokom",
    text:
      "Som veľmi spokojný so službami , všetko je na jednom mieste , systém " +
      "objednávania ako aj pripomínania, že mám prísť. Vysoká profesionalita " +
      "doktorov a milý prístup asistentiek a sestričiek.",
  },
  {
    id: "marek-solovic",
    author: "Marek Solovič",
    meta: "2 recenzie",
    localGuide: false,
    rating: 5,
    date: "pred 8 rokmi",
    text:
      "Toto zariadenie navštevujem cca 1/2 roka a zatiaľ môžem len odporučiť. " +
      "Okrem bežnej opravy kazu, mám za sebou i trhanie zubu, čistenie " +
      "kanálikov a najnovšie aj vyberanie implantátu, či dentálnu hygienu. " +
      "Fakt super. Všetko na veľmi vysokej profesionálnej úrovni, priateľský a " +
      "milý personál. Po každej návšteve mám naozaj pocit, že urobia maximum, " +
      "aj keď to samozrejme niečo stojí. Platí však pravidlo, ktoré mám z " +
      "vlastnej skúsenosti, že na zubároch sa neoplatí šetriť, lebo v " +
      "konečnom dôsledku keď nastanú komplikácie z dôvodu neodbornosti alebo " +
      "laxného prístupu , potom to stojí oveľa oveľa viac",
  },
  {
    id: "tatiana-sapieha-kodenska",
    author: "Tatiana Sapieha Kodenska",
    meta: "7 recenzií",
    localGuide: false,
    rating: 5,
    date: "pred 8 rokmi",
    text:
      "U MUDr. Dobeša som si práve dala urobiť rekonštrukciu zubov a môžem " +
      "skonštatovať, že svojou bravúrnou prácou naozaj dokázal naplniť moje " +
      "dlhoročné sny a predstavy. Vďaka:-) Navyše mi v tomto centre perfektne " +
      "poradili aj ohľadne ďalšej starostlivosti, aby moje zuby vyzerali stále " +
      "tak nádherne, ako keď som vyšla z tohoto centra. A čo sa týka cien, " +
      "vôbec nie sú nijako prehnané, vzhľadom na špičkovú úroveň práce a " +
      "služieb, ktorú centrum poskytuje. Vrelo odporúčam.",
  },
  {
    id: "lubos-jokl",
    author: "Lubos Jokl",
    meta: "Miestny sprievodca · 54 recenzií · 106 fotiek",
    localGuide: true,
    rating: 5,
    date: "pred rokom",
    text:
      "moderne vybavene centrum s dostatkom miest na parkovanie.Priatelsky a " +
      "vysoko odborny personal - chodim tam uz dlho a vzdy som bol spokojny",
  },
  {
    id: "katarina-dostalova",
    author: "Katarina Dostalova",
    meta: "Miestny sprievodca · 23 recenzií · 6 fotiek",
    localGuide: true,
    rating: 5,
    date: "pred 6 rokmi",
    text:
      "Veľmi pekné centrum s parkoviskom, skvelý, ochotný personál a " +
      "vynikajúce a bezbolestné ošetrenie u Dr.Dobešovej. Veľmi pekne ďakujem " +
      "a odporúčam.",
  },
  {
    id: "vlado-bratislava",
    author: "Vlado Bratislava",
    meta: "Miestny sprievodca · 124 recenzií · 290 fotiek",
    localGuide: true,
    rating: 5,
    date: "pred 5 rokmi",
    text:
      "Zohraty tim a vysoka kvalita, prijemne prostredie, dobry pristup MHD aj " +
      "autom, bezproblemove parkovanie. Sme u Dobesovcov uz roky cela rodina.",
  },
  {
    id: "erik-h",
    author: "Erik H",
    meta: "Miestny sprievodca · 41 recenzií · 12 fotiek",
    localGuide: true,
    rating: 5,
    date: "pred 6 rokmi",
    text:
      "Dlhorocna spokojnost, vzdy bezbolestne, kvalita (po zubaroch co som mal " +
      "pred dr.Dobesom mi vzdy vypadavali blomby),tu sa mi to nestalo " +
      "(vypadnutie blomby) pocas 12 rokov ani raz.",
  },
  {
    id: "alojz-tesar",
    author: "Alojz Tesár",
    meta: "Miestny sprievodca · 88 recenzií · 112 fotiek",
    localGuide: true,
    rating: 5,
    date: "pred 4 rokmi",
    text:
      "Maximalna spokojnost. Velmi prijemne prostredie, na moju pani zubarku " +
      "nedam dopustit.",
  },
  {
    id: "peter-p",
    author: "Peter P",
    meta: "Miestny sprievodca · 299 recenzií · 699 fotiek",
    localGuide: true,
    rating: 5,
    date: "Upravené pred 2 mesiacmi",
    text:
      "Dlhorocny zakaznik, vzdy spokojny... O zuby sa v prvom rade ma starat " +
      "kazdy sam, potom stacia planovane kontroly a navstevy 👍",
  },
];

/**
 * The headline rating.
 *
 * ⚠️ `average` matches the hero's trust strip and carries the same open
 * question: nothing in the repository records where 4,5 came from or when.
 * `count` stays null until the clinic supplies it — a review count is
 * checkable in one click, so a guessed one is caught immediately.
 */
export const reviewSummary = {
  average: "4,5",
  count: null as number | null,
} as const;

/** ⚠️ The clinic's Google listing. Null until supplied; never guessed. */
export const googleProfileUrl: string | null = null;
