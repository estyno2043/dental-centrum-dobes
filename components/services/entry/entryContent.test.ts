import { describe, expect, it } from "vitest";

import { priceGroups } from "@/components/pricing/pricingContent";
import { reviews } from "@/components/reviews/reviewsContent";
import {
  objections,
  offer,
  proofReviewIds,
  reassurances,
} from "./entryContent";

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
  it("answers the doubts the clinic can stand behind", () => {
    expect(objections.length).toBeGreaterThanOrEqual(7);
    for (const item of objections) {
      expect(item.question.length).toBeGreaterThan(10);
      expect(item.answer.length).toBeGreaterThan(30);
    }
  });

  /*
   * The duration was the one blank this page was not allowed to fill in for
   * itself; the clinic gave thirty minutes on 2026-09-04. Guarded in both
   * places it appears, because a duration that drifts between the summary and
   * the answer is the kind of contradiction a reader notices and nobody does.
   *
   * The earlier guard here rejected any answer containing digits followed by
   * "minút". It passed the moment the real figure arrived, because the answer
   * spells the number as a word — so it was checking spelling, not honesty.
   */
  it("states the clinic's duration, and the same one twice", () => {
    const summary = reassurances.find((item) =>
      item.label.includes("vstupná prehliadka"),
    );
    expect(summary?.value).toBe("30 minút");

    const answer = objections.find((item) =>
      item.question.includes("Ako dlho"),
    )?.answer;
    expect(answer).toMatch(/tridsať minút/);
  });

  /*
   * One question about bringing things, not two. Answering the same worry
   * twice made it look as though there were paperwork to organise.
   */
  it("asks once what to bring, and answers nothing", () => {
    const bring = objections.filter((item) =>
      /priniesť|snímky/i.test(item.question),
    );

    expect(bring).toHaveLength(1);
    expect(bring[0]?.answer).toMatch(/^Nič\./);
  });
});
