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
   * Corrected on the clinic's own answer: hygiene is 100 €, nothing added, and
   * 75 € for children. The page used to show `90 – 100 €` with AIRFLOW listed
   * beneath it as an extra — wrong in the direction that costs trust, since it
   * implied a starting figure and a surcharge for the protocol's own step.
   */
  it("states one price for the whole protocol, and one for children", () => {
    expect(pricing.main.map((entry) => entry.price)).toEqual(["100 €", "75 €"]);
    for (const entry of pricing.main) {
      expect(entry.price).not.toMatch(/–|od\b/i);
    }
    expect(pricing.main[0]?.note).toMatch(/AIRFLOW/);
  });

  /*
   * AIRFLOW is the protocol's fourth step. Listing it as something charged on
   * top of the visit is the exact mistake this replaced.
   */
  it("never bills a step of the protocol as an addition", () => {
    expect(pricing.partialHeading).toMatch(/nerobíme celú/i);
    expect(pricing.partialNote).toMatch(/nie ako príplatok/i);
    expect(pricing.main.some((e) => /air ?flow/i.test(e.label))).toBe(false);
  });

  /* Every figure still has to be one the clinic publishes. */
  it("quotes only prices that exist in the published list", () => {
    const published = new Set(
      priceGroups.flatMap((group) => group.entries.map((e) => e.price)),
    );

    for (const entry of pricing.partial) {
      expect(published.has(entry.price), `${entry.label}: ${entry.price}`).toBe(
        true,
      );
    }
  });
});
