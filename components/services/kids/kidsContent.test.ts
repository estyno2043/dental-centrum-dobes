import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { priceGroups } from "@/components/pricing/pricingContent";
import { cost, opening, story, worries } from "./kidsContent";

const published = new Map(
  priceGroups.flatMap((group) =>
    group.entries.map((entry) => [entry.label, entry.price] as const),
  ),
);

describe("children's dentistry", () => {
  /*
   * The children's rows are the clinic's own, under the labels a parent would
   * recognise rather than the ones the list prints. The mapping is stated so a
   * shortened label cannot quietly become a different treatment.
   */
  it("prices from the published list", () => {
    const rows: Record<string, string> = {
      "Kompletná hygiena pre deti": "Odstránenie zubného povlaku alebo kameňa – dieťa",
      "Výplň mliečneho zuba": "Výplň mliečneho zuba – Fuji",
      Pečatenie: "Pečatenie",
      "Fluoridácia lakom": "Fluoridácia lakom",
      "Ťažko ošetriteľné dieťa": "Ťažko ošetriteľné dieťa",
    };

    for (const item of cost.items) {
      const row = rows[item.label];
      expect(row, `${item.label} has no mapped row`).toBeDefined();
      expect(published.get(row!), item.label).toBe(item.price);
    }
  });

  /*
   * The clinic's three answers of 2026-09-07, which are the whole reason a
   * parent reads this page: from three years old, the parent may stay, and
   * nobody is held down. The last one is the promise the page lives on, so it
   * appears in the chapters and again in the questions.
   */
  it("keeps the clinic's own answers", () => {
    const facts = opening.facts.map((f) => f.value);
    expect(facts).toContain("Od 3 rokov");
    expect(facts).toContain("Môže byť v ordinácii");

    const everything = [
      ...story.chapters.map((c) => `${c.child} ${c.parent}`),
      ...worries.items.map((w) => w.answer),
    ].join(" ");

    expect(everything).toMatch(/rozprávame sa/i);
    expect(everything).toMatch(/nedržíme|nasilu/i);
  });

  /*
   * Every chapter is told twice, once to the child and once to the parent.
   * That pairing is the page, and a chapter with only one half is a chapter
   * that has lost the point of it.
   */
  it("tells every chapter to both readers", () => {
    expect(story.chapters).toHaveLength(5);
    for (const chapter of story.chapters) {
      expect(chapter.child.length, chapter.title).toBeGreaterThan(20);
      expect(chapter.parent.length, chapter.title).toBeGreaterThan(20);
    }
  });

  /*
   * `Ťažko ošetriteľné dieťa` is on the clinic's list and is shown rather than
   * hidden, but a parent who meets it without explanation reads a penalty.
   * The note has to say what it actually is.
   */
  it("explains the difficult-child fee instead of burying it", () => {
    const line = cost.items.find((i) => i.label === "Ťažko ošetriteľné dieťa");
    expect(line?.note).toMatch(/nie je to pokuta/i);
    expect(line?.note).toMatch(/čas navyše/i);
  });

  /*
   * No photographs of children: the clinic has none, and stock imagery of a
   * child in a dental chair is exactly the note this page must not hit. The
   * page has to work on type and colour alone, and this fails if anybody adds
   * an image record to it.
   */
  it("carries no child photography", () => {
    const source = readFileSync(
      join(process.cwd(), "components/services/kids/kidsContent.ts"),
      "utf8",
    );
    const prose = source.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(prose).not.toMatch(/\.webp|\.jpg|src:/i);
  });

  /* The habit stays gone on new pages too. */
  it("keeps the copy free of em dashes", () => {
    const source = readFileSync(
      join(process.cwd(), "components/services/kids/kidsContent.ts"),
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
