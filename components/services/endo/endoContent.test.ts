import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { priceGroups } from "@/components/pricing/pricingContent";
import {
  compare,
  cost,
  crown,
  guarantee,
  limit,
  microscope,
  odds,
  opening,
  visit,
} from "./endoContent";

const published = new Map(
  priceGroups.flatMap((group) =>
    group.entries.map((entry) => [entry.label, entry.price] as const),
  ),
);

/** "80 – 105 €" → 80. A span's lower bound is what an "od" line quotes. */
const euros = (price: string | null | undefined): number =>
  Number(String(price ?? "").split("–")[0]!.replace(/[^\d]/g, ""));

describe("endodontics", () => {
  /*
   * Every line of the worked example is a real row of the clinic's list, at
   * the clinic's own price. The labels are shortened for a reader — "RTG
   * snímka" for "RTG snímka intraorálna zubov a ústnych tkanív" — so the
   * mapping is stated here rather than matched loosely.
   */
  it("prices the example from the published list", () => {
    const rows: Record<string, string> = {
      "Jednorazové endo 4 kk": "Jednorazové endo 4 kk",
      "Injekčná anestézia": "Injekčná anestézia",
      Koferdam: "Koferdam",
      "RTG snímka": "RTG snímka intraorálna zubov a ústnych tkanív",
      "Ošetrenie Reciproc": "Ošetrenie Reciproc",
      "Uzáver vstupnej kavity": "Fotokompozit – jedna plôška",
    };

    for (const line of cost.lines) {
      const row = rows[line.label];
      expect(row, `${line.label} has no mapped row`).toBeDefined();
      expect(euros(published.get(row!)), line.label).toBe(euros(line.price));
    }
  });

  /*
   * The estimate is the sum of the lines above it — but it must never be
   * labelled a total. The doctor was explicit: *"Úplne presná cena vopred
   * neexistuje. Len odhad."* A page that prints "Spolu" over a number he says
   * cannot be known is the surprise this section exists to prevent.
   */
  it("adds up its example, and never calls it a total", () => {
    const sum = cost.lines.reduce((n, line) => n + euros(line.price), 0);
    expect(euros(cost.estimate)).toBe(sum);

    expect(cost.estimateLabel).not.toMatch(/spolu/i);
    expect(cost.estimateLabel).toMatch(/zhruba/i);
    expect(cost.estimateNote).toMatch(/odhad/i);
    expect(cost.heading).toMatch(/presnú cenu/i);
  });

  /*
   * The saving side of the comparison is the example plus a crown, and the
   * replacing side is the implant page's own lower bound. Both are checked
   * against those sources so the two pages cannot drift apart and quietly
   * start contradicting each other.
   */
  it("compares against the implant page's own figure", () => {
    const crownPrice = euros(published.get("Celokeramická korunka Zirkón"));
    const sum = cost.lines.reduce((n, line) => n + euros(line.price), 0);

    expect(euros(compare.keep.value)).toBe(sum + crownPrice);
    expect(euros(compare.replace.value)).toBe(1490);
    expect(compare.replace.href).toBe("/sluzby/zubne-implantaty");
    /* Both sides are estimates and the page has to say so. */
    expect(compare.note).toMatch(/odhad/i);
  });

  /*
   * One number, and it is the clinic's: nearly 100% while the nerve is alive.
   * The worse states carry none, because the doctor gave none — "úspešnosť je
   * rôzna podľa východiskového stavu" — and a ladder of invented percentages
   * would be putting figures in a dentist's mouth on his own subject.
   */
  it("gives the one success figure the clinic gave, and no others", () => {
    expect(odds.claim).toMatch(/takmer vždy/i);
    expect(odds.body).toMatch(/takmer stopercentná/i);
    expect(odds.note).toMatch(/nenájdete jedno percento/i);

    for (const item of odds.lowers) {
      expect(item, `${item} carries a number`).not.toMatch(/\d/);
    }
  });

  /*
   * The strongest thing on the implant page is its guarantee; the strongest
   * thing here is that there is none, and why. It may not be softened into an
   * implied one.
   */
  it("says outright that there is no guarantee", () => {
    expect(guarantee.heading).toMatch(/záruku nedávame/i);
    expect(guarantee.body).toMatch(/organizmus/i);
    expect(guarantee.body).not.toMatch(/garantujeme|ručíme/i);
  });

  /* Free, and said once in its own line — elsewhere it is a surcharge. */
  it("states that the microscope is not charged for", () => {
    expect(microscope.free).toMatch(/nepripláca/i);
    expect(cost.freeNote).toMatch(/nepripláca/i);
  });

  /*
   * The clinic's own numbers for the appointment. "1,5 – 2 hodiny" is the one
   * concrete promise on this page and the reason it does not read as a
   * conveyor belt, so it is pinned.
   */
  it("keeps the time the clinic actually reserves", () => {
    const values = visit.facts.map((fact) => fact.value);
    expect(values).toContain("1,5 – 2 hodiny");
    expect(values).toContain("Samostatný termín");
  });

  /*
   * Asked when a tooth cannot be saved, the doctor answered that no exact
   * answer exists — "je príliš veľa možností". The page may not invent the
   * list he declined to give, and the crown is a recommendation rather than a
   * requirement for the same reason.
   */
  it("invents neither a list of lost causes nor a mandatory crown", () => {
    expect(limit.body).toMatch(/neexistuje/i);
    expect(limit.linkHref).toBe("/sluzby/zubne-implantaty");

    expect(crown.body).toMatch(/povinná nie je/i);
    expect(crown.body).toMatch(/premolároch|stoličkách/i);
  });


  /*
   * The page opens on the sentence the reader arrived with, and ends the
   * argument in a button. Almost nobody searches for endodontics; they search
   * after being told a tooth has to come out, and a page that answers that and
   * then makes them scroll past six sections to act on it has wasted the only
   * moment it had.
   */
  it("names the reader's situation and gives them somewhere to go", () => {
    expect(opening.heading).toMatch(/musí von/i);
    expect(opening.body).toMatch(/nie vždy/i);

    expect(odds.cta.href).toBe("#booking");
    expect(odds.cta.label).toMatch(/objednať/i);
    expect(odds.cta.text).toMatch(/čím skôr/i);
  });

  /*
   * No em dashes. They had become a tic — roughly one every four sentences
   * across the site — and the user asked for them gone. Almost every one was
   * a full stop avoiding itself, and the sentences read better split.
   *
   * Scoped to this page's own copy, since the rest of the site still carries
   * them. Extend it as they are cleared, rather than loosening it here.
   */
  it("keeps the copy free of em dashes", () => {
    const source = readFileSync(
      join(process.cwd(), "components/services/endo/endoContent.ts"),
      "utf8",
    );
    const prose = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "")
      .match(/"(?:[^"\\]|\\.)*"/g)
      ?.join(" ") ?? "";

    expect(prose).not.toContain("\u2014");
  });

  /* Nothing on this page may imply a guarantee the clinic refused to give. */
  it("promises nothing the clinic did not", () => {
    const source = readFileSync(
      join(process.cwd(), "components/services/endo/endoContent.ts"),
      "utf8",
    );
    const prose = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");

    expect(prose).not.toMatch(/zaručujeme|garancia|doživotn/i);
  });
});
