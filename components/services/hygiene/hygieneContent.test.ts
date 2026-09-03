import { describe, expect, it } from "vitest";

import { priceGroups } from "@/components/pricing/pricingContent";
import { hygienePrices, protocol, recall } from "./hygieneContent";

describe("hygiene content", () => {
  it("keeps the eight GBT steps in their published order", () => {
    expect(protocol.map((step) => step.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(protocol.map((step) => step.name)).toEqual([
      "Vyšetrenie",
      "Zafarbenie",
      "Motivácia",
      "AIRFLOW",
      "PERIOFLOW",
      "PIEZON",
      "Kontrola",
      "Ďalší termín",
    ]);
  });

  /*
   * The clinic's own answer: they do PERIOFLOW, but only for periodontal
   * patients. Dropping the step would misdescribe the protocol; presenting it
   * as routine would promise everyone a treatment most will not get.
   */
  it("marks PERIOFLOW as the one conditional step, and says why", () => {
    const optional = protocol.filter((step) => step.optional);

    expect(optional).toHaveLength(1);
    expect(optional[0]?.name).toBe("PERIOFLOW");
    expect(optional[0]?.optionalNote).toMatch(/parodontóz/i);
  });

  it("carries the intervals the clinic confirmed", () => {
    expect(recall.standard.value).toContain("6 mesiacov");
    expect(recall.perio.value).toContain("3 – 4 mesiace");
  });

  /*
   * The page quotes rows from the price list; it must not drift from it. Every
   * figure shown here has to be a figure the clinic actually publishes.
   */
  it("quotes only prices that exist in the published list", () => {
    const published = new Set(
      priceGroups.flatMap((group) => group.entries.map((e) => e.price)),
    );

    for (const entry of hygienePrices) {
      expect(published.has(entry.price), `${entry.label}: ${entry.price}`).toBe(
        true,
      );
    }
  });

  /*
   * The rule this page must not break. The list bills hygiene's parts
   * separately and nowhere states which combination an appointment is, so a
   * headline total would be a number nobody at the clinic has agreed to.
   */
  it("states no total and no teased minimum", () => {
    for (const entry of hygienePrices) {
      expect(entry.price).not.toMatch(/^od\b/i);
    }
    expect(hygienePrices.some((e) => /spolu|celkom|balík/i.test(e.label))).toBe(
      false,
    );
  });
});
