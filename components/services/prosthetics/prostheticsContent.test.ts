import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { priceGroups } from "@/components/pricing/pricingContent";
import {
  featuredCase,
  patientCases,
} from "@/components/patients/patientsContent";
import {
  decision,
  immediate,
  lifespan,
  opening,
  options,
  prostheticsCaseIds,
} from "./prostheticsContent";

const published = new Map(
  priceGroups.flatMap((group) =>
    group.entries.map((entry) => [entry.label, entry.price] as const),
  ),
);

describe("prosthetics", () => {
  it("prices every line from the published list", () => {
    const lines = [
      ...options.items.flatMap((item) => item.prices),
      ...immediate.items,
      lifespan.repair,
    ];
    for (const line of lines) {
      expect(published.get(line.row), line.row).toBe(line.price);
    }
  });

  /* The worked example is three zirconia members, and says it is an example. */
  it("adds the bridge example up from the list", () => {
    const crown = published.get("Celokeramická korunka Zirkón");
    const pontic = published.get("Celokeramický medzičlen Zirkón");
    expect(crown).toBe("455 €");
    expect(pontic).toBe("455 €");
    expect(options.example.total).toBe("1 365 €");
    expect(options.example.label).toMatch(/príklad/i);
  });

  /* Every option answers the same three questions, in the same order. */
  it("compares every option on the same facts", () => {
    const labels = options.items.map((item) => item.facts.map((f) => f.label).join("|"));
    expect(new Set(labels).size).toBe(1);
  });

  /*
   * The clinic's answers of 2026-09-21: the indication is often a medical
   * decision but the budget is always the patient's, a bridge takes as long
   * as a crown, a denture two weeks to a month, and dentures on implants are
   * made where a bridge cannot be.
   */
  it("keeps the clinic's own answers", () => {
    expect(decision.patient.body).toMatch(/schvaľujete vy/i);
    expect(decision.doctor.body).toMatch(/medicínske/i);
    expect(opening.facts.map((f) => f.value).join(" ")).toMatch(/2 týždne až mesiac/);
    const implant = options.items.find((item) => item.id === "implantaty")!;
    expect(implant.kind).toMatch(/mostík spraviť nedá/i);
    expect(lifespan.claim).toMatch(/3 až 5 rokov/);
    expect(lifespan.scale).toEqual({ literatureFrom: 3, literatureTo: 5, withRepairs: 10 });
  });

  /* Not confirmed by the clinic yet: a next-day temporary for a bridge. */
  it("does not promise a next-day temporary for a bridge", () => {
    const bridge = options.items.find((item) => item.id === "mostik")!;
    expect(`${bridge.body} ${bridge.facts.map((f) => f.value).join(" ")}`).not.toMatch(
      /druhý deň|dočasn/i,
    );
  });

  it("shows only published prosthetic cases", () => {
    const all = [featuredCase, ...patientCases];
    for (const id of prostheticsCaseIds) {
      const found = all.find((entry) => entry.id === id);
      expect(found?.treatments, id).toContain("Protetika");
    }
  });

  it("keeps the copy free of em dashes", () => {
    const source = readFileSync(
      join(process.cwd(), "components/services/prosthetics/prostheticsContent.ts"),
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
