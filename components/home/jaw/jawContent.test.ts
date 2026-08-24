import { describe, expect, it } from "vitest";
import {
  ENTRY_EXAM_LABEL,
  JAW_DISCLAIMER,
  JAW_ZONES,
  JAW_ZONE_BY_SLUG,
  getJawProblem,
  getJawZoneBySlug,
} from "./jawContent";
import { ENTRY_EXAM_FACTS, problemHref } from "../../problems/problemContent";

const expectedContent = [
  {
    id: "front",
    slug: "predne-zuby",
    label: "Predné zuby",
    route: "/problemy/predne-zuby",
    problems: [
      ["shape-color", "Nepáči sa mi tvar alebo farba", "Fazety, bielenie, kompozit"],
      ["chipped", "Odštiepený zub", "Fazety, bielenie, kompozit"],
      ["gap", "Medzera", "Fazety, bielenie, kompozit"],
    ],
  },
  {
    id: "premolar",
    slug: "crenove-zuby",
    label: "Črenové zuby",
    route: "/problemy/crenove-zuby",
    problems: [
      [
        "sensitivity",
        "Citlivosť na sladké alebo studené",
        "Záchovná starostlivosť, inlay, korunka",
      ],
      ["lost-filling", "Vypadla plomba", "Záchovná starostlivosť, inlay, korunka"],
    ],
  },
  {
    id: "molar",
    slug: "stolicky",
    label: "Stoličky",
    route: "/problemy/stolicky",
    problems: [
      [
        "bite-pain",
        "Bolí ma pri hryzení",
        "Endodoncia pod mikroskopom, korunka, extrakcia",
      ],
      [
        "pulsing",
        "Pulzujúca bolesť",
        "Endodoncia pod mikroskopom, korunka, extrakcia",
      ],
      [
        "cracked",
        "Prasknutý zub",
        "Endodoncia pod mikroskopom, korunka, extrakcia",
      ],
    ],
  },
  {
    id: "gum",
    slug: "dasna",
    label: "Ďasná",
    route: "/problemy/dasna",
    problems: [
      ["bleeding", "Krvácajú pri čistení", "Dentálna hygiena GBT, parodontológia"],
      ["receding", "Ustupujú", "Dentálna hygiena GBT, parodontológia"],
      ["odor", "Zápach", "Dentálna hygiena GBT, parodontológia"],
    ],
  },
  {
    id: "missing",
    slug: "chybajuci-zub",
    label: "Chýbajúci zub",
    route: "/problemy/chybajuci-zub",
    problems: [
      ["missing-tooth", "Chýba mi zub", "Implantát Osstem"],
      ["removable-replacement", "Nosím snímateľnú náhradu", "Implantát Osstem"],
    ],
  },
  {
    id: "unsure",
    slug: "neviem",
    label: "Neviem / bolí to celé",
    route: "/problemy/neviem",
    problems: [],
  },
] as const;

describe("jaw content", () => {
  it("exposes the six approved routes, price, and orientation disclaimer", () => {
    expect(JAW_ZONES).toHaveLength(6);
    expect(JAW_ZONES.map((zone) => zone.route)).toEqual([
      "/problemy/predne-zuby",
      "/problemy/crenove-zuby",
      "/problemy/stolicky",
      "/problemy/dasna",
      "/problemy/chybajuci-zub",
      "/problemy/neviem",
    ]);
    expect(ENTRY_EXAM_LABEL).toBe("Vstupné vyšetrenie — 100 €");
    expect(JAW_DISCLAIMER).toBe(
      "Orientačná pomôcka. Presnú príčinu určí až vyšetrenie.",
    );
  });

  it("builds controlled problem routes and shares confirmed examination facts", () => {
    expect(problemHref(JAW_ZONES[0], JAW_ZONES[0].problems[1])).toBe(
      "/problemy/predne-zuby?problem=chipped",
    );
    expect(problemHref(JAW_ZONES[5])).toBe("/problemy/neviem");
    expect(ENTRY_EXAM_FACTS).toEqual([
      "Približne 30 minút",
      "Panoramatická snímka",
      "Intraorálne fotografie a skeny",
      "CT iba vtedy, keď je klinicky indikované",
      "Liečebný plán a ďalšia cena podľa nálezu",
    ]);
    expect(Object.isFrozen(ENTRY_EXAM_FACTS)).toBe(true);
  });

  it("keeps exact Slovak patient labels and descriptive service destinations", () => {
    expect(
      JAW_ZONES.map((zone) => ({
        id: zone.id,
        slug: zone.slug,
        label: zone.label,
        route: zone.route,
        problems: zone.problems.map((problem) => [
          problem.id,
          problem.patientLabel,
          problem.destination,
        ]),
      })),
    ).toEqual(expectedContent);
  });

  it("uses globally unique controlled ids, slugs, routes, and problem ids", () => {
    const problemIds = JAW_ZONES.flatMap((zone) =>
      zone.problems.map((problem) => problem.id),
    );

    for (const values of [
      JAW_ZONES.map((zone) => zone.id),
      JAW_ZONES.map((zone) => zone.slug),
      JAW_ZONES.map((zone) => zone.route),
      problemIds,
    ]) {
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it("returns known records and rejects unknown or prototype lookup keys", () => {
    expect(getJawZoneBySlug("stolicky")?.id).toBe("molar");
    expect(getJawProblem("molar", "pulsing")?.patientLabel).toBe(
      "Pulzujúca bolesť",
    );

    for (const key of ["unknown", "__proto__", "constructor", "toString"]) {
      expect(getJawZoneBySlug(key)).toBeUndefined();
      expect(getJawProblem(key, "pulsing")).toBeUndefined();
      expect(getJawProblem("molar", key)).toBeUndefined();
    }
    expect(Object.getPrototypeOf(JAW_ZONE_BY_SLUG)).toBeNull();
  });

  it("deeply freezes exported content at runtime", () => {
    expect(Object.isFrozen(JAW_ZONES)).toBe(true);
    expect(Object.isFrozen(JAW_ZONE_BY_SLUG)).toBe(true);

    for (const zone of JAW_ZONES) {
      expect(Object.isFrozen(zone)).toBe(true);
      expect(Object.isFrozen(zone.problems)).toBe(true);
      for (const problem of zone.problems) {
        expect(Object.isFrozen(problem)).toBe(true);
      }
    }

    expect(() => {
      (JAW_ZONES as unknown as { label: string }[])[0].label = "Zmenené";
    }).toThrow(TypeError);
    expect(JAW_ZONES[0].label).toBe("Predné zuby");
  });
});
