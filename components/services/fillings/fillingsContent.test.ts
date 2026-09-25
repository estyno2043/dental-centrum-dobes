import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { priceGroups } from "@/components/pricing/pricingContent";
import {
  featuredCase,
  patientCases,
} from "@/components/patients/patientsContent";
import {
  amalgam,
  beyond,
  fillingsCaseIds,
  longevity,
  opening,
  surfaces,
} from "./fillingsContent";

const published = new Map(
  priceGroups.flatMap((group) =>
    group.entries.map((entry) => [entry.label, entry.price] as const),
  ),
);

describe("white fillings", () => {
  /* Every price is the clinic's own row, named so it cannot drift. */
  it("prices every option from the published list", () => {
    for (const option of [...surfaces.options, ...beyond.items]) {
      expect(published.get(option.row), option.row).toBe(option.price);
    }
  });

  it("offers one, two and three surfaces, in order", () => {
    expect(surfaces.options.map((o) => o.count)).toEqual([1, 2, 3]);
  });

  /*
   * The clinic's answers of 2026-09-21 and the user's: one visit of about an
   * hour, anaesthesia offered to everybody, amalgam replaced when needed or
   * wanted, and a lifetime that depends on care.
   */
  it("keeps the clinic's own answers", () => {
    const facts = opening.facts.map((f) => f.value).join(" ");
    expect(facts).toMatch(/jednu návštevu/i);
    expect(facts).toMatch(/hodinu/i);
    expect(facts).toMatch(/každému/i);
    expect(amalgam.body).toMatch(/keď je to potrebné|keď si to prajete/i);
    expect(`${longevity.claim} ${longevity.body}`).toMatch(/starostlivosť/i);
  });

  /*
   * The range is explained as the general rule, not as the clinic's own
   * formula, and the deep-cavity liner is named as a separate line rather
   * than folded silently into the range.
   */
  it("explains the range and names the separate liner", () => {
    expect(surfaces.factors).toHaveLength(3);
    expect(surfaces.deepNote).toMatch(/samostatná položka/i);
  });

  it("shows only published composite cases", () => {
    const all = [featuredCase, ...patientCases];
    for (const id of fillingsCaseIds) {
      const found = all.find((entry) => entry.id === id);
      expect(found, id).toBeDefined();
      expect(found?.treatments.join()).toMatch(/Kompozitné dostavby/);
    }
  });

  it("keeps the copy free of em dashes", () => {
    const source = readFileSync(
      join(process.cwd(), "components/services/fillings/fillingsContent.ts"),
      "utf8",
    );
    const prose =
      source
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .match(/"(?:[^"\\]|\\.)*"/g)
        ?.join(" ") ?? "";
    expect(prose).not.toContain("—");
  });
});
