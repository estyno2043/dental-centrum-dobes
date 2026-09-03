import { describe, expect, it } from "vitest";

import {
  anchorPrices,
  priceGroups,
  priceValidFrom,
} from "./pricingContent";

describe("price list", () => {
  it("carries the whole published list", () => {
    const entries = priceGroups.flatMap((group) => group.entries);
    expect(priceGroups).toHaveLength(28);
    expect(entries).toHaveLength(248);
    expect(priceValidFrom).toBe("1. 3. 2026");
  });

  /*
   * The transcription's one real risk. The source lists some procedures under
   * several billing codes at several prices; a patient cannot choose a code,
   * so each survives as a single row showing the span. Two rows with the same
   * words and different numbers would read as a mistake.
   */
  it("says one thing per procedure inside a group", () => {
    for (const group of priceGroups) {
      const labels = group.entries.map((entry) => entry.label);
      expect(new Set(labels).size, `duplicate in ${group.name}`).toBe(
        labels.length,
      );
    }
  });

  it("keeps the six collapsed spans as spans", () => {
    const spans = priceGroups
      .flatMap((group) => group.entries)
      .filter((entry) => entry.price?.includes("–"));

    expect(spans.length).toBeGreaterThanOrEqual(6);
    expect(
      spans.find((entry) => entry.label === "Fotokompozit – jedna plôška")
        ?.price,
    ).toBe("80 – 105 €");
  });

  it("writes every price as money, a span, or a stated absence", () => {
    for (const { label, price } of priceGroups.flatMap((g) => g.entries)) {
      if (price === null) continue;
      expect(
        /^\d+( – \d+)? €$|^Zdarma$|^Podľa (rozsahu|výrobku)$/.test(price),
        `${label}: ${price}`,
      ).toBe(true);
    }
  });

  /* Billing codes are for the practice software, not for this page. */
  it("carries no billing codes into the labels", () => {
    for (const { label } of priceGroups.flatMap((g) => g.entries)) {
      expect(label).not.toMatch(/^\d+\s*\//);
    }
  });

  /*
   * The rule that matters most commercially: an anchor is a whole procedure.
   * `Air flow – 1 zuboradie` is 50 €, and "hygiena od 50 €" would be true of
   * one arch and wrong about the visit anybody books.
   */
  it("anchors the homepage on prices that exist in the list", () => {
    const entries = priceGroups.flatMap((group) => group.entries);

    for (const anchor of anchorPrices) {
      const source = entries.find((entry) => entry.label === anchor.label);
      expect(source, `${anchor.label} is not in the price list`).toBeDefined();
      expect(source?.price).toBe(anchor.price);
    }
    expect(anchorPrices.some((a) => a.price?.startsWith("od"))).toBe(false);
  });
});
