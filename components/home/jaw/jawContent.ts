export type JawZoneId = "front" | "premolar" | "molar" | "gum";

export type JawProblemId =
  | "chipped"
  | "darkened"
  | "sensitive"
  | "shape-gap"
  | "bite-pain"
  | "lost-filling"
  | "cracked"
  | "pulsing"
  | "wisdom"
  | "missing"
  | "bleeding"
  | "swelling"
  | "bad-breath"
  | "recession";

export type JawSolutionId =
  | "exam"
  | "filling"
  | "hygiene"
  | "endo"
  | "crown"
  | "allCeramic"
  | "extraction"
  | "splint"
  | "replacement";

export type JawPrice = Readonly<{
  amount: 40 | 90 | 95 | 130 | 155 | 320 | 430;
  from?: true;
}>;

export type JawSolution = Readonly<{
  id: JawSolutionId;
  label: string;
  explanation: string;
  price?: JawPrice;
  duration: string;
}>;

export type JawProblem = Readonly<{
  id: JawProblemId;
  label: string;
  shortMeaning: string;
  solutions: readonly JawSolution[];
}>;

export type JawZone = Readonly<{
  id: JawZoneId;
  label: string;
  problems: readonly JawProblem[];
}>;

const UNKNOWN_DURATION = "Dĺžku určí lekár po vyšetrení.";

function solution(
  id: JawSolutionId,
  label: string,
  explanation: string,
  price?: JawPrice,
): JawSolution {
  return Object.freeze({ id, label, explanation, price, duration: UNKNOWN_DURATION });
}

const solutionCatalogById = Object.freeze({
  exam: solution(
    "exam",
    "Vyšetrenie",
    "Pri vyšetrení overíme stav zuba a jeho okolia a navrhneme ďalší postup.",
    { amount: 40 },
  ),
  filling: solution(
    "filling",
    "Výplň",
    "Pri vyšetrení overíme, či možno poškodenú časť zuba doplniť výplňou.",
    { amount: 90, from: true },
  ),
  hygiene: solution(
    "hygiene",
    "Dentálna hygiena",
    "Môže súvisieť s povlakom alebo stavom ďasien; vhodný postup určí kontrola a profesionálne vyčistenie.",
    { amount: 95 },
  ),
  endo: solution(
    "endo",
    "Ošetrenie koreňových kanálikov",
    "Pri vyšetrení overíme stav vo vnútri zuba a či prichádza do úvahy ošetrenie koreňových kanálikov.",
    { amount: 155, from: true },
  ),
  crown: solution(
    "crown",
    "Korunka",
    "Pri vyšetrení overíme, či zostávajúca časť zuba potrebuje ochranu korunkou.",
    { amount: 320, from: true },
  ),
  allCeramic: solution(
    "allCeramic",
    "Celokeramická korunka",
    "Pri vyšetrení overíme zdravie zuba, zhryz a vhodnosť celokeramickej korunky.",
    { amount: 430 },
  ),
  extraction: solution(
    "extraction",
    "Vybratie zuba",
    "Pri vyšetrení overíme, či sa zub dá zachovať alebo prichádza do úvahy jeho vybratie.",
    { amount: 95, from: true },
  ),
  splint: solution(
    "splint",
    "Dlaha",
    "Pri vyšetrení overíme zhryz a či je dlaha vhodnou súčasťou ďalšieho postupu.",
    { amount: 130 },
  ),
  replacement: solution(
    "replacement",
    "Možnosti náhrady zuba",
    "Pri vyšetrení overíme možnosti náhrady zuba; cena a dĺžka závisia od zvoleného postupu po vyšetrení.",
  ),
} satisfies Readonly<Record<JawSolutionId, JawSolution>>);

export const jawSolutionCatalog: readonly JawSolution[] = Object.freeze([
  solutionCatalogById.exam,
  solutionCatalogById.filling,
  solutionCatalogById.hygiene,
  solutionCatalogById.endo,
  solutionCatalogById.crown,
  solutionCatalogById.allCeramic,
  solutionCatalogById.extraction,
  solutionCatalogById.splint,
  solutionCatalogById.replacement,
]);

function problem(
  id: JawProblemId,
  label: string,
  shortMeaning: string,
  solutionIds: readonly JawSolutionId[],
): JawProblem {
  return Object.freeze({
    id,
    label,
    shortMeaning,
    solutions: Object.freeze(
      solutionIds.map((solutionId) => solutionCatalogById[solutionId]),
    ),
  });
}

export const jawZones: readonly JawZone[] = Object.freeze([
  Object.freeze({
    id: "front",
    label: "Predné zuby",
    problems: Object.freeze([
      problem(
        "chipped",
        "Odlomil sa mi kúsok zuba",
        "Rozsah poškodenia ukáže, či stačí zub doplniť alebo potrebuje pevnejšiu ochranu.",
        ["filling", "crown"],
      ),
      problem(
        "darkened",
        "Jeden zub mi stmavol",
        "Zmena farby môže byť povrchová alebo môže súvisieť so stavom vo vnútri zuba.",
        ["exam", "endo", "allCeramic"],
      ),
      problem(
        "sensitive",
        "Reaguje na studené alebo sladké",
        "Citlivosť môže súvisieť s odkrytým povrchom, výplňou alebo začínajúcim poškodením.",
        ["exam", "filling"],
      ),
      problem(
        "shape-gap",
        "Prekáža mi tvar alebo medzera",
        "Tvar a medzeru riešime až po kontrole zhryzu a zdravia zubov.",
        ["exam", "filling", "allCeramic"],
      ),
    ]),
  }),
  Object.freeze({
    id: "premolar",
    label: "Črenové zuby",
    problems: Object.freeze([
      problem(
        "bite-pain",
        "Bolí ma pri zahryznutí",
        "Bolesť pri zahryznutí môže mať viac príčin; rozhodne vyšetrenie a snímka.",
        ["exam", "endo", "crown"],
      ),
      problem(
        "lost-filling",
        "Vypadla mi plomba",
        "Odkrytý zub treba skontrolovať, aby sa rozsah poškodenia nezväčšil.",
        ["filling", "crown"],
      ),
      problem(
        "cracked",
        "Zub je prasknutý",
        "Pri praskline rozhoduje jej hĺbka a to, koľko pevného zuba zostalo.",
        ["exam", "filling", "crown", "extraction"],
      ),
      problem(
        "sensitive",
        "Zub je citlivý",
        "Citlivosť môže ukazovať na netesnú výplň, odkrytý krčok alebo poškodenie zuba.",
        ["exam", "filling"],
      ),
    ]),
  }),
  Object.freeze({
    id: "molar",
    label: "Stoličky",
    problems: Object.freeze([
      problem(
        "pulsing",
        "Silno alebo pulzujúco bolí",
        "Silná alebo pulzujúca bolesť potrebuje skoré vyšetrenie.",
        ["exam", "endo"],
      ),
      problem(
        "bite-pain",
        "Bolí ma pri zahryznutí",
        "Zub môže byť preťažený alebo poškodený; príčinu overíme vyšetrením.",
        ["exam", "endo", "crown"],
      ),
      problem(
        "wisdom",
        "Trápi ma zub múdrosti",
        "Pri zube múdrosti kontrolujeme polohu, okolie a priestor na prerezanie.",
        ["exam", "extraction"],
      ),
      problem(
        "missing",
        "Zub mi chýba",
        "Možnosť náhrady závisí od susedných zubov, kosti a zhryzu.",
        ["exam", "replacement"],
      ),
    ]),
  }),
  Object.freeze({
    id: "gum",
    label: "Ďasná",
    problems: Object.freeze([
      problem(
        "bleeding",
        "Krvácajú mi ďasná",
        "Krvácanie je signál, že ďasná potrebujú kontrolu a profesionálne vyčistenie.",
        ["exam", "hygiene"],
      ),
      problem(
        "swelling",
        "Ďasno je opuchnuté",
        "Opuch môže mať viac príčin a bez vyšetrenia sa nedá bezpečne určiť.",
        ["exam", "hygiene"],
      ),
      problem(
        "bad-breath",
        "Trápi ma zápach z úst",
        "Zápach často súvisí s povlakom alebo ďasnami, no príčinu treba overiť.",
        ["exam", "hygiene"],
      ),
      problem(
        "recession",
        "Ustupujú mi ďasná alebo vidím krčky",
        "Pri ústupe ďasien kontrolujeme hygienu, zaťaženie zuba a stav závesného aparátu.",
        ["exam", "hygiene"],
      ),
    ]),
  }),
]);

export function getJawZone(id: string): JawZone | undefined {
  return jawZones.find((zone) => zone.id === id);
}

export function getJawProblem(
  zoneId: string,
  problemId: string,
): JawProblem | undefined {
  return getJawZone(zoneId)?.problems.find(
    (problemEntry) => problemEntry.id === problemId,
  );
}

export function getJawSolution(
  zoneId: string,
  problemId: string,
  solutionId: string,
): JawSolution | undefined {
  return getJawProblem(zoneId, problemId)?.solutions.find(
    (solutionEntry) => solutionEntry.id === solutionId,
  );
}
