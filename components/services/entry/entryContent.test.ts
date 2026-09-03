import { describe, expect, it } from "vitest";

import { priceGroups } from "@/components/pricing/pricingContent";
import { reviews } from "@/components/reviews/reviewsContent";
import { objections, offer, proofReviewIds } from "./entryContent";

const published = new Map(
  priceGroups
    .flatMap((group) => group.entries)
    .map((entry) => [entry.label, entry.price]),
);

describe("entry examination offer", () => {
  /*
   * The bug this test exists for: the page said the panoramic was worth 20 €
   * and the parts totalled 100 €. The price list valid from 1. 3. 2026 says
   * 25 €. It understated the clinic's own list price *and* the size of the
   * gift — an offer described as smaller than it is.
   */
  it("values every part at the clinic's published price", () => {
    expect(published.get("Komplexné stomatologické vyšetrenie")).toBe("40 €");
    expect(published.get("Panoramatický snímok")).toBe("25 €");
    expect(published.get("RTG snímka intraorálna zubov a ústnych tkanív")).toBe(
      "10 €",
    );

    expect(offer.items.map((item) => item.price)).toEqual([
      "40 €",
      "40 €",
      "25 €",
    ]);
  });

  it("adds up, and gives away exactly what it says", () => {
    const parts = offer.items.map((item) => Number.parseInt(item.price, 10));
    const given = offer.items
      .filter((item) => "free" in item && item.free)
      .reduce((sum, item) => sum + Number.parseInt(item.price, 10), 0);

    expect(parts.reduce((a, b) => a + b, 0)).toBe(
      Number.parseInt(offer.listTotal, 10),
    );
    expect(Number.parseInt(offer.listTotal, 10) - given).toBe(
      Number.parseInt(offer.total, 10),
    );
    expect(offer.saving).toBe(`Ušetríte ${given} €`);
  });

  /*
   * The reviews chosen here are the ones about being frightened, not the ones
   * praising ceramics — somebody reading a first-visit page has usually been
   * putting it off. Ids point into the review list so the words cannot drift
   * from what Google shows.
   */
  it("quotes real reviews, by reference rather than by copy", () => {
    for (const id of proofReviewIds) {
      const review = reviews.find((entry) => entry.id === id);
      expect(review, `${id} is not a published review`).toBeDefined();
      expect(review?.rating).toBe(5);
    }
  });

  /*
   * Every answer restates a position the clinic already holds. A page that
   * invents reassurance is one the clinic then has to keep.
   */
  it("answers the doubts without promising a duration nobody gave us", () => {
    expect(objections.length).toBeGreaterThanOrEqual(5);
    for (const item of objections) {
      expect(item.question.length).toBeGreaterThan(10);
      expect(item.answer.length).toBeGreaterThan(30);
      // Nobody has told us how long a visit takes; a made-up minute count is
      // the kind of promise that is broken in the chair.
      expect(item.answer).not.toMatch(/\b\d+\s*(minút|min|hodin)/i);
    }
  });
});
