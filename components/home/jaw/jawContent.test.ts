import { describe, expect, it } from "vitest";
import {
  JAW_DISCLAIMER,
  JAW_ZONES,
  JAW_ZONE_BY_SLUG,
  getJawProblem,
  getJawZoneBySlug,
} from "./jawContent";

import { getServiceBySlug } from "@/components/services/servicesContent";

/*
 * Where every choice on the jaw leads since 2026-09-26: straight to the
 * service page that answers it. The reasoning per problem is on the mapping
 * in `jawContent.ts`; this pins the result.
 */
const expectedContent = [
  {
    id: "front",
    slug: "predne-zuby",
    label: "Predné zuby",
    href: "/sluzby/esteticka-stomatologia",
    problems: [
      ["shape-color", "Nepáči sa mi tvar alebo farba", "/sluzby/esteticka-stomatologia"],
      ["chipped", "Odštiepený zub", "/sluzby/esteticka-stomatologia"],
      ["gap", "Medzera", "/sluzby/esteticka-stomatologia"],
    ],
  },
  {
    id: "premolar",
    slug: "crenove-zuby",
    label: "Črenové zuby",
    href: "/sluzby/biele-vyplne",
    problems: [
      ["sensitivity", "Citlivosť na sladké alebo studené", "/sluzby/biele-vyplne"],
      ["lost-filling", "Vypadla plomba", "/sluzby/biele-vyplne"],
    ],
  },
  {
    id: "molar",
    slug: "stolicky",
    label: "Stoličky",
    href: "/sluzby/endodoncia",
    problems: [
      ["bite-pain", "Bolí ma pri hryzení", "/sluzby/endodoncia"],
      ["pulsing", "Pulzujúca bolesť", "/sluzby/endodoncia"],
      ["cracked", "Prasknutý zub", "/sluzby/endodoncia"],
    ],
  },
  {
    id: "gum",
    slug: "dasna",
    label: "Ďasná",
    href: "/sluzby/parodontologia",
    problems: [
      ["bleeding", "Krvácajú pri čistení", "/sluzby/parodontologia"],
      ["receding", "Ustupujú", "/sluzby/parodontologia"],
      ["odor", "Zápach", "/sluzby/dentalna-hygiena"],
    ],
  },
  {
    id: "missing",
    slug: "chybajuci-zub",
    label: "Chýbajúci zub",
    href: "/sluzby/zubne-implantaty",
    problems: [
      ["missing-tooth", "Chýba mi zub", "/sluzby/zubne-implantaty"],
      ["removable-replacement", "Nosím snímateľnú náhradu", "/sluzby/protetika"],
    ],
  },
  {
    id: "unsure",
    slug: "neviem",
    label: "Neviem / bolí to celé",
    href: "/sluzby/vstupna-prehliadka",
    problems: [],
  },
] as const;

describe("jaw content", () => {
  it("keeps the orientation disclaimer", () => {
    expect(JAW_DISCLAIMER).toBe(
      "Orientačná pomôcka. Presnú príčinu určí až vyšetrenie.",
    );
  });

  it("leads every zone and problem to its service page", () => {
    expect(
      JAW_ZONES.map((zone) => ({
        id: zone.id,
        slug: zone.slug,
        label: zone.label,
        href: zone.href,
        problems: zone.problems.map((problem) => [
          problem.id,
          problem.patientLabel,
          problem.href,
        ]),
      })),
    ).toEqual(expectedContent);
  });

  /* Every destination is a real service, and the row names it by its name. */
  it("names each destination by its service page", () => {
    for (const zone of JAW_ZONES) {
      expect(getServiceBySlug(zone.service), zone.id).toBeDefined();
      for (const problem of zone.problems) {
        expect(problem.destination).toBe(getServiceBySlug(problem.service)?.name);
        expect(problem.href).toBe(`/sluzby/${problem.service}`);
      }
    }
  });

  /* Nothing on the jaw points at the retired placeholder pages any more. */
  it("no longer links to /problemy", () => {
    const hrefs = JAW_ZONES.flatMap((zone) => [
      zone.href,
      ...zone.problems.map((problem) => problem.href),
    ]);
    expect(hrefs.some((href) => href.includes("/problemy"))).toBe(false);
  });

  it("uses globally unique controlled ids, slugs and problem ids", () => {
    const problemIds = JAW_ZONES.flatMap((zone) =>
      zone.problems.map((problem) => problem.id),
    );

    for (const values of [
      JAW_ZONES.map((zone) => zone.id),
      JAW_ZONES.map((zone) => zone.slug),
      JAW_ZONES.map((zone) => zone.href),
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
