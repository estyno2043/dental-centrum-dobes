import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { priceGroups } from "@/components/pricing/pricingContent";
import { cost, opening, photos, story, worries } from "./kidsContent";

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
   * No photographs of children. The clinic has none, and a stock child in a
   * dental chair is the wrong note for this page. Since 2026-09-24 the page
   * does carry the clinic's own photographs, at the user's request, and each
   * one is a file encoded from the clinic's shoot: this pins the list so a
   * stock image cannot slip in unnoticed, and checks that none is described
   * as showing a child.
   */
  it("carries only the clinic's own photographs, none of a child", () => {
    expect(photos.items.map((p) => p.src)).toEqual([
      "deti-kefka",
      "deti-tim",
      "deti-kreslo",
    ]);
    for (const photo of photos.items) {
      expect(photo.alt, photo.src).not.toMatch(/diet|chlap|dievč|detsk/i);
      expect(
        existsSync(
          join(process.cwd(), "public/media/sluzby", `${photo.src}.webp`),
        ),
        photo.src,
      ).toBe(true);
    }
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
