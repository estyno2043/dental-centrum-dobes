import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { priceGroups } from "@/components/pricing/pricingContent";
import {
  bone,
  cost,
  costBase,
  crossSection,
  crowns,
  guarantee,
  system,
  systemPhoto,
  timeline,
} from "./implantContent";

const published = new Set(
  priceGroups.flatMap((group) => group.entries.map((entry) => entry.price)),
);

/** € 1 490 → 1490. Slovak thousands are separated by a non-breaking space. */
const toNumber = (price: string): number =>
  Number(price.replace(/[^\d]/g, ""));

/** "1 490 – 1 605 €" → [1490, 1605]; a single figure yields one entry. */
const bounds = (price: string): readonly number[] =>
  price.split("–").map((part) => toNumber(part));

describe("dental implants", () => {
  it("quotes every component from the published price list", () => {
    for (const item of [...costBase, ...cost.addOns]) {
      expect(published.has(item.price), item.label).toBe(true);
    }
    for (const crown of crowns) {
      expect(published.has(crown.price), crown.name).toBe(true);
    }
  });

  /*
   * The reason this page exists. Every clinic publishes the 810 € root; the
   * total is the number the patient is actually deciding on, so it has to be
   * the sum of the parts shown above it and not a figure typed in by hand.
   * Both ends of the range are checked — a total that is right at the bottom
   * and wrong at the top is the quote somebody arrives holding.
   */
  it("totals what it itemises, at both ends of the range", () => {
    for (const crown of crowns) {
      const parts = [...costBase.map((item) => item.price), crown.price];
      const low = parts.reduce((sum, p) => sum + bounds(p)[0]!, 0);
      const high = parts.reduce((sum, p) => sum + bounds(p).at(-1)!, 0);

      expect(bounds(crown.total), crown.name).toEqual([low, high]);
    }
  });

  /*
   * The clinic does not offer instalments — "splátky nemáme s nikým
   * zabezpečené" — so the calculator this page was to carry would have priced
   * a service that does not exist. Nothing here may imply financing, and the
   * guard covers the whole module rather than the strings it happens to
   * export today.
   */
  it("promises no financing anywhere", () => {
    const source = readFileSync(
      join(process.cwd(), "components/services/implants/implantContent.ts"),
      "utf8",
    );
    const prose = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");

    expect(prose).not.toMatch(/splátk|mesačne|financovan|úver|RPMN/i);
  });

  /*
   * The clinic's own numbers, 2026-09-05. The healing time is the objection;
   * the temporary tooth is the answer, and it has to appear both as a fact
   * somebody scanning will see and in the prose somebody reading will.
   */
  it("states the healing time and the tooth worn through it", () => {
    const values = timeline.facts.map((fact) => fact.value);
    expect(values).toContain("Zvyčajne 4");
    expect(values).toContain("3 mesiace");
    expect(values).toContain("Dočasný zub");

    const key = timeline.phases.filter((phase) => phase.reassures);
    expect(key).toHaveLength(1);
    expect(key[0]?.body).toMatch(/dočasný zub/i);
    expect(timeline.heading).toMatch(/bez zuba/i);
  });

  /*
   * Verbatim from the clinic: two years, and a free second attempt if the
   * implant does not take. The free retry is the only sentence on the site
   * where the clinic carries the risk, so it is pinned rather than left to
   * survive a rewrite by luck.
   */
  it("keeps the guarantee the clinic actually gave", () => {
    expect(guarantee.claim).toMatch(/druhý pokus je zadarmo/i);
    const values = guarantee.facts.map((fact) => fact.value);
    expect(values).toContain("2 roky");
  });

  /*
   * Augmentation and sinus lift are the surgeon's call — "doktorka rozhoduje,
   * čo je ochotná a v akom rozsahu". The page may say the clinic does them; it
   * may not promise the outcome in advance, and it may not invent the sinus
   * lift price the list does not carry.
   */
  it("does not promise bone surgery, or price a sinus lift", () => {
    expect(bone.body).toMatch(/rozhoduje lekárka/i);
    expect(bone.body).not.toMatch(/\d+\s*€/);
    expect(cost.addOns.map((item) => item.label)).not.toContain("Sinus lift");
  });

  /*
   * Osstem is the clinic's system, but its market position is a manufacturer's
   * claim with no source here. The section may explain why a named system
   * matters; it may not rank one.
   */

  /*
   * The files, and their stated dimensions.
   *
   * A misspelt stem is a broken image in production and nothing at all in
   * development, because Next serves `public/` straight through and a 404 on
   * an `<img>` is silent. The declared width also has to be the real one: a
   * srcset that misdescribes its own candidates has the browser pick a file
   * too small for the slot, and the only symptom is a soft picture.
   *
   * Encoded 2026-09-05 from the material the user supplied.
   */
  it("ships the images it references, at the sizes it claims", async () => {
    const sharp = (await import("sharp")).default;
    const dir = join(process.cwd(), "public/media/sluzby");

    const expected = [
      [`${crossSection.src}.webp`, crossSection.width, crossSection.height],
      [`${crossSection.src}-mobile.webp`, 390, 260],
      [`${systemPhoto.src}.webp`, systemPhoto.width, systemPhoto.height],
    ] as const;

    for (const [file, width, height] of expected) {
      const meta = await sharp(join(dir, file)).metadata();
      expect(meta.width, file).toBe(width);
      expect(meta.height, file).toBe(height);
    }
  });

  /*
   * The Osstem render has no `-mobile` half, on purpose: the source is 393px
   * wide and the frame caps at 300px, so a half-size file would be smaller
   * than the slot it was meant to fill. If somebody adds one later, the page
   * has to gain a srcset in the same change — this fails if the file appears
   * on its own.
   */
  it("keeps the single-file rule for the product render", () => {
    const half = join(
      process.cwd(),
      `public/media/sluzby/${systemPhoto.src}-mobile.webp`,
    );
    expect(existsSync(half)).toBe(false);
  });

  it("explains the system without ranking its maker", () => {
    const text = [system.body, ...system.points.map((p) => p.note)].join(" ");
    expect(system.heading).toMatch(/Osstem/);
    expect(text).not.toMatch(/najväčš|najlepš|svetov[áé]\s+jednotk|číslo jeden/i);
  });
});
