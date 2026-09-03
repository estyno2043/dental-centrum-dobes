import { describe, expect, it } from "vitest";

import { priceGroups } from "@/components/pricing/pricingContent";
import { pricing, protocol, recall } from "./hygieneContent";

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

    for (const entry of [...pricing.base, ...pricing.extras]) {
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
    const all = [...pricing.base, ...pricing.extras];

    for (const entry of all) {
      expect(entry.price).not.toMatch(/^od\b/i);
    }
    expect(all.some((e) => /spolu|celkom|balík/i.test(e.label))).toBe(false);
  });

  /*
   * The split is the point: someone reading must be able to tell what they pay
   * for the visit from what is only charged if they need it. A base list that
   * quietly grew an add-on would put a number in front of them that most
   * people will not be quoted.
   */
  it("keeps the visit's own price apart from what is added to it", () => {
    expect(pricing.base).toHaveLength(2);
    expect(pricing.base[0]?.price).toBe("90 – 100 €");
    expect(pricing.extras.map((e) => e.label)).toContain(
      "Air flow — za jedno zuboradie",
    );
    for (const entry of pricing.base) {
      expect(entry.label).not.toMatch(/air ?flow|fluorid|parodontolog/i);
    }
  });
});
