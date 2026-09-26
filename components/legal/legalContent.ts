/**
 * The operator's identification and the privacy notice.
 *
 * Drafted 2026-09-26 from what the site actually does, audited the same day:
 *
 * - One form, the booking form on every service page (`ServiceBooking`):
 *   name, phone, e-mail, the service it was sent from, and a consent tick.
 *   It posts to Netlify Forms.
 * - Hosting on Netlify.
 * - A map in the footer embedded from OpenStreetMap, which sets no cookies
 *   but, like any embedded map, is fetched by the visitor's browser.
 * - `sessionStorage` only, for the back button and the photograph morph
 *   between the catalogue and a service page. No cookies, no analytics, no
 *   third-party request on load (the font is self-hosted since the same day).
 * - Fifteen public Google reviews reproduced under their authors' names.
 *
 * ⚠️ What the public registers give and what they do not. The regional health
 * register (e-VÚC, Bratislavský samosprávny kraj) lists two operators at
 * Vlárska 13C: Dental Centrum Dobeš, s.r.o., IČO 36768626 (the dental
 * surgery), and Dental Centrum Dobeš Vlárska s.r.o., IČO 54966281 (the
 * dental hygiene surgery). Neither entry gives the registered seat or the
 * commercial-register entry, and nothing anywhere gives an e-mail for
 * privacy requests. Every field below that is `null` is one the clinic has
 * to supply, and until all of them are filled the notice is not published:
 * `privacyReady` is false, the route answers 404 and the footer shows no
 * legal row. A privacy notice with a guessed seat or a blank contact would be
 * worse than none.
 */

export type Operator = {
  readonly name: string;
  /** What this company runs at the clinic, as the health register lists it. */
  readonly role: string;
  readonly ico: string;
  /** Sídlo as registered, e.g. "Vlárska 13/C, 831 01 Bratislava". */
  readonly seat: string | null;
  /** E.g. "Obchodný register Mestského súdu Bratislava III, oddiel Sro, vložka č. …". */
  readonly register: string | null;
};

/*
 * Both companies, at the user's instruction of 2026-09-26. Seat and register
 * entry quoted from the Obchodný register (orsr.sk) the same day: the second
 * from the extract the user supplied, the first looked up by IČO. "Svébska"
 * is the register's own spelling, a street in Rusovce (851 10).
 */
export const operators: readonly Operator[] = [
  {
    name: "Dental Centrum Dobeš, s.r.o.",
    role: "zubná ambulancia",
    ico: "36768626",
    seat: "Svébska 20, 851 10 Bratislava",
    register:
      "Obchodný register Mestského súdu Bratislava III, oddiel Sro, vložka č. 45625/B",
  },
  {
    name: "Dental Centrum Dobeš Vlárska s.r.o.",
    role: "ambulancia dentálnej hygieny",
    ico: "54966281",
    seat: "Vlárska 13762/13C, 831 01 Bratislava - mestská časť Nové Mesto",
    register:
      "Obchodný register Mestského súdu Bratislava III, oddiel Sro, vložka č. 164776/B",
  },
];

/** Where a visitor sends a privacy request. Supplied by the user 2026-09-26. */
export const privacyContact: { readonly email: string | null; readonly phone: string } = {
  email: "dobesdentalcentrum@gmail.com",
  phone: "0918 800 002",
};

/** How long a booking request is kept: "do vybavenia objednávky" (user, 2026-09-26). */
export const bookingRetention: string | null =
  "Údaje z objednávkového formulára uchovávame len do vybavenia vašej " +
  "objednávky. Potom ich vymažeme.";

/** The date the notice takes effect: the day it was published. */
export const privacyEffective: string | null = "26. 9. 2026";

export const privacyReady =
  operators.every((o) => o.seat !== null && o.register !== null) &&
  privacyContact.email !== null &&
  bookingRetention !== null &&
  privacyEffective !== null;

export const privacyPath = "/ochrana-osobnych-udajov";

/* ----------------------------------------------------------- the notice */

export type PrivacySection = {
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly list?: readonly string[];
};

/**
 * The notice itself, in the order article 13 GDPR asks for. Written for a
 * patient, not a lawyer; every claim in it describes something the code does.
 * Fields that depend on the clinic's answers are filled in by the page from
 * the constants above.
 */
export const privacySections = (retention: string): readonly PrivacySection[] => [
  {
    heading: "Aké údaje od vás získavame a prečo",
    paragraphs: [
      "Keď sa objednáte cez formulár na našom webe, dostaneme vaše meno, " +
        "telefónne číslo, e-mail a informáciu, z ktorej služby ste formulár " +
        "odoslali. Používame ich iba na to, aby sme vás kontaktovali a " +
        "dohodli termín.",
      "Právnym základom je vykonanie krokov pred uzavretím zmluvy na vašu " +
        "žiadosť (čl. 6 ods. 1 písm. b) GDPR). Formulár odošlete až po " +
        "potvrdení súhlasu so spracovaním údajov na tento účel.",
      "Údaje, ktoré vznikajú pri samotnom ošetrení, vedieme v zdravotnej " +
        "dokumentácii podľa zákona č. 576/2004 Z. z. o zdravotnej " +
        "starostlivosti. Tie web nespracúva.",
    ],
  },
  {
    heading: "Ako dlho údaje uchovávame",
    paragraphs: [retention],
  },
  {
    heading: "Kto sa k údajom dostane",
    paragraphs: [
      "Web a formulár prevádzkujeme u spoločnosti Netlify, Inc. (USA), ktorá " +
        "pre nás údaje z formulára prijíma a uchováva ako sprostredkovateľ. " +
        "Prenos do USA prebieha na základe štandardných zmluvných doložiek " +
        "podľa čl. 46 GDPR.",
      "Vaše údaje nepredávame ani neposkytujeme na marketing.",
    ],
  },
  {
    heading: "Mapa v pätičke",
    paragraphs: [
      "Mapa, kde nás nájdete, sa načítava zo serverov OpenStreetMap " +
        "Foundation. Pri jej zobrazení váš prehliadač odošle na ich servery " +
        "svoju IP adresu, tak ako pri každej vloženej mape. Mapa nepoužíva " +
        "cookies.",
    ],
  },
  {
    heading: "Cookies",
    paragraphs: [
      "Náš web nepoužíva analytické, reklamné ani iné sledovacie cookies. " +
        "Pre tlačidlo späť a plynulý prechod medzi stránkami si prehliadač " +
        "počas návštevy pamätá, z ktorej stránky ste prišli. Tento údaj " +
        "zostáva len vo vašom prehliadači a zmizne, keď zatvoríte kartu.",
    ],
  },
  {
    heading: "Recenzie",
    paragraphs: [
      "Na webe zobrazujeme verejné recenzie z nášho profilu na Google, pod " +
        "menom, ktoré pri nich zobrazuje Google, a v znení, v akom boli " +
        "napísané. Ak ste autorom a nechcete, aby tu bola vaša recenzia, " +
        "ozvite sa nám a odstránime ju.",
    ],
  },
  {
    heading: "Vaše práva",
    paragraphs: [
      "Máte právo na prístup k svojim údajom, ich opravu, vymazanie, " +
        "obmedzenie spracúvania a prenosnosť, právo namietať a právo kedykoľvek " +
        "odvolať súhlas. Odvolanie súhlasu nemá vplyv na spracúvanie pred ním.",
      "Ak si myslíte, že s vašimi údajmi zaobchádzame nesprávne, môžete " +
        "podať sťažnosť Úradu na ochranu osobných údajov Slovenskej " +
        "republiky, Hraničná 12, 820 07 Bratislava 27, " +
        "www.dataprotection.gov.sk.",
      "Nerozhodujeme o vás automatizovane ani vás neprofilujeme.",
    ],
  },
];
