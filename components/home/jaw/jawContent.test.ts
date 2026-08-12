import { describe, expect, test } from "vitest";
import {
  getJawProblem,
  getJawSolution,
  getJawZone,
  jawSolutionCatalog,
  jawZones,
} from "./jawContent";

const expectedProblems = {
  front: [
    [
      "chipped",
      "Odlomil sa mi kúsok zuba",
      "Rozsah poškodenia ukáže, či stačí zub doplniť alebo potrebuje pevnejšiu ochranu.",
      ["filling", "crown"],
    ],
    [
      "darkened",
      "Jeden zub mi stmavol",
      "Zmena farby môže byť povrchová alebo môže súvisieť so stavom vo vnútri zuba.",
      ["exam", "endo", "allCeramic"],
    ],
    [
      "sensitive",
      "Reaguje na studené alebo sladké",
      "Citlivosť môže súvisieť s odkrytým povrchom, výplňou alebo začínajúcim poškodením.",
      ["exam", "filling"],
    ],
    [
      "shape-gap",
      "Prekáža mi tvar alebo medzera",
      "Tvar a medzeru riešime až po kontrole zhryzu a zdravia zubov.",
      ["exam", "filling", "allCeramic"],
    ],
  ],
  premolar: [
    [
      "bite-pain",
      "Bolí ma pri zahryznutí",
      "Bolesť pri zahryznutí môže mať viac príčin; rozhodne vyšetrenie a snímka.",
      ["exam", "endo", "crown"],
    ],
    [
      "lost-filling",
      "Vypadla mi plomba",
      "Odkrytý zub treba skontrolovať, aby sa rozsah poškodenia nezväčšil.",
      ["filling", "crown"],
    ],
    [
      "cracked",
      "Zub je prasknutý",
      "Pri praskline rozhoduje jej hĺbka a to, koľko pevného zuba zostalo.",
      ["exam", "filling", "crown", "extraction"],
    ],
    [
      "sensitive",
      "Zub je citlivý",
      "Citlivosť môže ukazovať na netesnú výplň, odkrytý krčok alebo poškodenie zuba.",
      ["exam", "filling"],
    ],
  ],
  molar: [
    [
      "pulsing",
      "Silno alebo pulzujúco bolí",
      "Silná alebo pulzujúca bolesť potrebuje skoré vyšetrenie.",
      ["exam", "endo"],
    ],
    [
      "bite-pain",
      "Bolí ma pri zahryznutí",
      "Zub môže byť preťažený alebo poškodený; príčinu overíme vyšetrením.",
      ["exam", "endo", "crown"],
    ],
    [
      "wisdom",
      "Trápi ma zub múdrosti",
      "Pri zube múdrosti kontrolujeme polohu, okolie a priestor na prerezanie.",
      ["exam", "extraction"],
    ],
    [
      "missing",
      "Zub mi chýba",
      "Možnosť náhrady závisí od susedných zubov, kosti a zhryzu.",
      ["exam", "replacement"],
    ],
  ],
  gum: [
    [
      "bleeding",
      "Krvácajú mi ďasná",
      "Krvácanie je signál, že ďasná potrebujú kontrolu a profesionálne vyčistenie.",
      ["exam", "hygiene"],
    ],
    [
      "swelling",
      "Ďasno je opuchnuté",
      "Opuch môže mať viac príčin a bez vyšetrenia sa nedá bezpečne určiť.",
      ["exam", "hygiene"],
    ],
    [
      "bad-breath",
      "Trápi ma zápach z úst",
      "Zápach často súvisí s povlakom alebo ďasnami, no príčinu treba overiť.",
      ["exam", "hygiene"],
    ],
    [
      "recession",
      "Ustupujú mi ďasná alebo vidím krčky",
      "Pri ústupe ďasien kontrolujeme hygienu, zaťaženie zuba a stav závesného aparátu.",
      ["exam", "hygiene"],
    ],
  ],
} as const;

describe("jaw patient content", () => {
  test("keeps the locked four-zone order and four problems per zone", () => {
    expect(jawZones.map((zone) => [zone.id, zone.label])).toEqual([
      ["front", "Predné zuby"],
      ["premolar", "Črenové zuby"],
      ["molar", "Stoličky"],
      ["gum", "Ďasná"],
    ]);
    expect(jawZones.every((zone) => zone.problems.length === 4)).toBe(true);
  });

  test("preserves every approved problem label, meaning, and solution mapping", () => {
    for (const zone of jawZones) {
      expect(
        zone.problems.map((problem) => [
          problem.id,
          problem.label,
          problem.shortMeaning,
          problem.solutions.map((solution) => solution.id),
        ]),
      ).toEqual(expectedProblems[zone.id]);
    }
  });

  test("uses unique stable IDs and only references catalog solutions", () => {
    expect(new Set(jawZones.map((zone) => zone.id)).size).toBe(jawZones.length);
    expect(new Set(jawSolutionCatalog.map((solution) => solution.id)).size).toBe(
      jawSolutionCatalog.length,
    );

    for (const zone of jawZones) {
      expect(new Set(zone.problems.map((problem) => problem.id)).size).toBe(
        zone.problems.length,
      );
      for (const problem of zone.problems) {
        expect(problem.solutions.length).toBeGreaterThanOrEqual(1);
        expect(
          new Set(problem.solutions.map((solution) => solution.id)).size,
        ).toBe(problem.solutions.length);
        for (const solution of problem.solutions) {
          expect(jawSolutionCatalog).toContain(solution);
        }
      }
    }
  });

  test("uses only approved exact prices and omits a price for replacement", () => {
    expect(
      Object.fromEntries(
        jawSolutionCatalog.map((solution) => [solution.id, solution.price]),
      ),
    ).toEqual({
      exam: { amount: 40 },
      filling: { amount: 90, from: true },
      hygiene: { amount: 95 },
      endo: { amount: 155, from: true },
      crown: { amount: 320, from: true },
      allCeramic: { amount: 430 },
      extraction: { amount: 95, from: true },
      splint: { amount: 130 },
      replacement: undefined,
    });

    const allPrices = jawSolutionCatalog.flatMap((solution) =>
      solution.price ? [solution.price.amount] : [],
    );
    expect(
      allPrices.every((price) => [40, 90, 95, 130, 155, 320, 430].includes(price)),
    ).toBe(true);
  });

  test("keeps guidance non-diagnostic and avoids invented durations", () => {
    const explanations = jawSolutionCatalog.map(
      (solution) => solution.explanation,
    );
    expect(
      explanations.every(
        (copy) =>
          copy.startsWith("Môže súvisieť") ||
          copy.startsWith("Pri vyšetrení overíme"),
      ),
    ).toBe(true);
    expect(
      jawSolutionCatalog.every(
        (solution) =>
          solution.duration === "Dĺžku určí lekár po vyšetrení.",
      ),
    ).toBe(true);

    const allCopy = jawZones.flatMap((zone) => [
      zone.label,
      ...zone.problems.flatMap((problem) => [
        problem.label,
        problem.shortMeaning,
        ...problem.solutions.flatMap((solution) => [
          solution.label,
          solution.explanation,
          solution.duration,
        ]),
      ]),
    ]);
    expect(allCopy.join(" ")).not.toMatch(
      /garantujeme|vyliečime|určite ide o|diagnóz[auy]|bezbolestn|navždy/i,
    );
  });

  test("describes replacement without inventing a price or fixed timing", () => {
    const replacement = jawSolutionCatalog.find(
      (solution) => solution.id === "replacement",
    );

    expect(replacement).toMatchObject({
      label: "Možnosti náhrady zuba",
      price: undefined,
      duration: "Dĺžku určí lekár po vyšetrení.",
    });
    expect(replacement?.explanation).toMatch(/cena a dĺžka závisia/i);
  });
});

describe("jaw content lookups", () => {
  test("returns the exact nested objects for valid stable IDs", () => {
    const zone = jawZones[1];
    const problem = zone.problems[2];
    const solution = problem.solutions[1];

    expect(getJawZone("premolar")).toBe(zone);
    expect(getJawProblem("premolar", "cracked")).toBe(problem);
    expect(getJawSolution("premolar", "cracked", "filling")).toBe(solution);
  });

  test("returns undefined for unknown or unrelated IDs", () => {
    expect(getJawZone("unknown")).toBeUndefined();
    expect(getJawProblem("front", "wisdom")).toBeUndefined();
    expect(getJawProblem("unknown", "chipped")).toBeUndefined();
    expect(getJawSolution("front", "chipped", "hygiene")).toBeUndefined();
    expect(getJawSolution("unknown", "chipped", "filling")).toBeUndefined();
  });
});
