/**
 * Content for the Tím page.
 *
 * ⚠️ EVERY PERSON BELOW IS PLACEHOLDER DATA. The names, roles, focus lines,
 * biographies, languages and years are invented so the page can be designed
 * and reviewed. They are deliberately fictional rather than the clinic's real
 * staff: inventing qualifications for real, named people is not something to
 * ship by accident. Replace this file wholesale once the clinic supplies the
 * real roster, and add `portrait` paths once photography arrives.
 *
 * `portrait` is optional on purpose. Until a photograph exists, the page draws
 * a designed plate (monogram + tooth motif) instead of showing a broken frame,
 * so the layout is complete in both states.
 */

export type TeamMember = {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly role: string;
  readonly focus: string;
  readonly bio: string;
  readonly languages: readonly string[];
  readonly since: number;
  readonly portrait?: string;
};

export type TeamGroup = {
  readonly id: string;
  readonly label: string;
  readonly members: readonly TeamMember[];
};

export const teamIntro = {
  eyebrow: "Tím",
  headline: "Za každým úsmevom stojí človek, ktorý ho vymyslel.",
  lead:
    "Prístroje sa dajú kúpiť. Rozhodnutie, kedy ich nepoužiť, sa kúpiť nedá. " +
    "To je dôvod, prečo je táto stránka o ľuďoch, a nie o technológiách.",
} as const;

export const teamGroups: readonly TeamGroup[] = [
  {
    id: "lekari",
    label: "Lekári",
    members: [
      {
        id: "hlavny-lekar",
        name: "MUDr. Adam Krajči",
        initials: "AK",
        role: "Vedúci lekár",
        focus: "Protetika a komplexné rekonštrukcie",
        bio:
          "Zástupný text. Vedie tím a venuje sa najzložitejším prípadom — tým, " +
          "ktoré sa začínajú vetou, že sa s tým už nedá nič robiť. Pracuje pod " +
          "mikroskopom a na plán ošetrenia si berie toľko času, koľko treba.",
        languages: ["SK", "EN", "DE"],
        since: 2009,
      },
      {
        id: "endodoncia",
        name: "MUDr. Klára Bartošová",
        initials: "KB",
        role: "Lekárka",
        focus: "Endodoncia pod mikroskopom",
        bio:
          "Zástupný text. Zachraňuje zuby, ktoré boli inde odsúdené na extrakciu. " +
          "Ošetrenie koreňových kanálikov robí výhradne pod 25× zväčšením.",
        languages: ["SK", "EN"],
        since: 2014,
      },
      {
        id: "chirurgia",
        name: "MUDr. Tomáš Rehák",
        initials: "TR",
        role: "Lekár, chirurg",
        focus: "Implantológia a orálna chirurgia",
        bio:
          "Zástupný text. Zavádza implantáty a rieši chirurgické zákroky vrátane " +
          "tých, ktoré si vyžadujú CT plánovanie a navigovanú operáciu.",
        languages: ["SK", "EN"],
        since: 2016,
      },
      {
        id: "detska",
        name: "MUDr. Simona Vajdová",
        initials: "SV",
        role: "Lekárka",
        focus: "Detská stomatológia",
        bio:
          "Zástupný text. Ošetruje deti od troch rokov. Prvá návšteva u nej nie je " +
          "o vŕtaní — je o tom, aby dieťa nabudúce prišlo samo od seba.",
        languages: ["SK", "EN"],
        since: 2018,
      },
    ],
  },
  {
    id: "hygiena",
    label: "Hygiena a starostlivosť",
    members: [
      {
        id: "hygienicka",
        name: "Bc. Nina Halásová",
        initials: "NH",
        role: "Dentálna hygienička",
        focus: "GBT protokol, EMS Airflow",
        bio:
          "Zástupný text. Vedie preventívnu starostlivosť podľa protokolu GBT. " +
          "Väčšina pacientov po prvom sedení zistí, že hygiena nebolí.",
        languages: ["SK", "EN"],
        since: 2019,
      },
      {
        id: "sestra",
        name: "Eva Šimková",
        initials: "EŠ",
        role: "Zdravotná sestra",
        focus: "Asistencia pri zákrokoch, sterilizácia",
        bio:
          "Zástupný text. Stará sa o to, aby bolo počas zákroku všetko na svojom " +
          "mieste — vrátane pacienta, ktorý sa práve nemá kde pozerať.",
        languages: ["SK"],
        since: 2015,
      },
      {
        id: "recepcia",
        name: "Lucia Ondrušová",
        initials: "LO",
        role: "Recepcia",
        focus: "Objednávky a koordinácia",
        bio:
          "Zástupný text. Prvý človek, s ktorým hovoríte, a ten istý, ktorý vám " +
          "nájde termín, keď sa ozvete s akútnou bolesťou.",
        languages: ["SK", "EN"],
        since: 2020,
      },
    ],
  },
] as const;

export const teamStats = [
  { value: 25, suffix: "×", label: "zväčšenie mikroskopu" },
  { value: 3, prefix: "od ", suffix: " r.", label: "ošetrujeme aj deti" },
  { value: 7, label: "ľudí v tíme" },
  { value: 100, suffix: " €", label: "vstupné vyšetrenie" },
] as const;

export const teamQuote = {
  text:
    "Nechceme byť klinika, z ktorej si pamätáte prístroje. " +
    "Chceme byť klinika, z ktorej si pamätáte, že vás nikto neponáhľal.",
  attribution: "Filozofia tímu",
} as const;

export const teamCta = {
  headline: "Hľadáme ďalšie ruky.",
  body:
    "Ak vás baví stomatológia robená poriadne a bez kompromisov v čase, " +
    "ozvite sa. Aj keď práve nemáme vypísanú pozíciu.",
  action: { label: "Napíšte nám", href: "#" },
} as const;
