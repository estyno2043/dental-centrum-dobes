import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { priceGroups } from "@/components/pricing/pricingContent";
import {
  aftercare,
  healing,
  honesty,
  opening,
  prices,
  procedures,
} from "./surgeryContent";

const published = new Map(
  priceGroups.flatMap((group) =>
    group.entries.map((entry) => [entry.label, entry.price] as const),
  ),
);

describe("oral surgery", () => {
  it("prices every line from the published list", () => {
    for (const line of prices.groups.flatMap((group) => group.lines)) {
      expect(published.get(line.row), line.row).toBe(line.price);
    }
  });

  /*
   * The clinic's answer of 2026-09-21: everything that needs neither a
   * hospital nor general anaesthesia; wisdom teeth, resections, extractions,
   * implants and mucosa; stitches out at about a week; prescriptions as
   * needed; sedation by tablet only, no nitrous oxide.
   */
  it("keeps the clinic's own answers", () => {
    expect(opening.body).toMatch(/hospitalizáciu ani celkovú anestéziu/);
    expect(procedures.items.map((p) => p.id)).toEqual([
      "osmicky",
      "extrakcie",
      "resekcie",
      "implantaty",
      "sliznice",
    ]);
    expect(healing.steps[1]?.when).toMatch(/týždni/);
    expect(honesty.body).toMatch(/recept/);
    expect(honesty.sedation.body).toMatch(/tabletka/);
    expect(honesty.sedation.body).toMatch(/Rajský plyn/);
  });

  /* The honest sentence stays; a painless promise never appears. */
  it("does not promise a painless procedure", () => {
    expect(honesty.heading).toBe("Po zákroku každý niečo cíti.");
    const source = readFileSync(
      join(process.cwd(), "components/services/surgery/surgeryContent.ts"),
      "utf8",
    ).replace(/\/\*[\s\S]*?\*\//g, "");
    expect(source).not.toMatch(/bezbolest/i);
  });

  it("marks the aftercare list as general guidance", () => {
    expect(aftercare.note).toMatch(/všeobecné/i);
    expect(aftercare.note).toMatch(/od lekára/i);
  });

  it("keeps the copy free of em dashes", () => {
    const source = readFileSync(
      join(process.cwd(), "components/services/surgery/surgeryContent.ts"),
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
