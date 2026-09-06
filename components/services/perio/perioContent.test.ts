import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { priceGroups } from "@/components/pricing/pricingContent";
import {
  causes,
  check,
  cost,
  illustration,
  outcome,
  plasma,
  protocol,
} from "./perioContent";

const published = new Map(
  priceGroups.flatMap((group) =>
    group.entries.map((entry) => [entry.label, entry.price] as const),
  ),
);

const euros = (price: string | null | undefined): number =>
  Number(String(price ?? "").replace(/[^\d]/g, ""));

describe("periodontology", () => {
  it("quotes the clinic's own rows, at the clinic's own prices", () => {
    for (const item of cost.items) {
      expect(published.get(item.label), item.label).toBe(item.price);
    }
    expect(published.get("Odber materiálu Mikro")).toBe("85 €");
    expect(published.get("PRF – krvná plazma")).toBe("75 €");
  });

  /*
   * The follow-on list quotes figures rather than labels — some are shortened
   * for a reader ("Zatvorená kyretáž koreňa" without its "(root planing)"),
   * one spans three rows ("Probiotiká", 18 – 23 €), and the hygiene figure is
   * the clinic's confirmed flat 100 € rather than the list's 90 – 100 € span.
   * The prices are what must not drift, so those are what is checked.
   */
  it("prices the follow-on work from the published list", () => {
    const prices = new Set(published.values());

    for (const item of cost.later) {
      for (const part of item.price.split("–")) {
        expect(
          [...prices].some((p) => euros(p) === euros(part)),
          `${item.label}: ${part.trim()}`,
        ).toBe(true);
      }
    }
  });

  /*
   * The page's whole pricing argument. The treatment's total genuinely depends
   * on the finding, so what it promises instead is an exact price for finding
   * out — and that number has to be the sum of the three rows printed above
   * it, at both the with-genetics and without-genetics figure named in the
   * prose. A total typed by hand drifts the first time a price moves.
   */
  it("adds up what it charges to find out", () => {
    const listed = cost.items.reduce((sum, item) => sum + euros(item.price), 0);
    expect(euros(cost.total)).toBe(listed);

    const swab = euros(published.get("Odber materiálu Mikro-gen")!);
    const cheaperSwab = euros(published.get("Odber materiálu Mikro")!);
    expect(cost.alternative).toContain(`${listed - swab + cheaperSwab} €`);
    expect(cost.alternative).toContain("85 €");
  });

  /*
   * The checklist decides whether somebody books an examination. It must never
   * appear to tell them they have a disease — no verdict may name the illness
   * or assert it, and the disclaimer is load-bearing rather than decorative.
   */
  it("never lets the checklist read as a diagnosis", () => {
    expect(check.disclaimer).toMatch(/nie je diagnóza/i);

    for (const verdict of Object.values(check.verdicts)) {
      expect(verdict).not.toMatch(/máte parodont|trpíte|diagnóz/i);
    }
  });

  /*
   * The absence of pain is the reassurance people take from this disease, and
   * it is the symptom that should worry them. It is the clinic's own sharpest
   * observation — *"je zákerná v tom, že príliš nebolí"* — so it opens the
   * page and it is set apart from the five actual symptoms rather than listed
   * among them.
   */
  it("keeps painlessness as the point, not as a sixth symptom", () => {
    expect(check.heading).toMatch(/nebolí/i);
    expect(check.items).toHaveLength(5);
    expect(check.items.join(" ")).not.toMatch(/nebolí/i);
    expect(check.painless).toMatch(/nebolí/i);
    expect(check.painlessNote).toMatch(/typické/i);
  });

  /*
   * ⚠️ The clinic wrote that the bacteria have a *direct link* to Alzheimer's,
   * breast cancer, colorectal cancer and heart attack. The association is real
   * and researched — best established for cardiovascular disease — but "direct
   * link" outruns the evidence, and naming cancers that way reads as
   * fear-selling on a clinic's own page. The user approved stating it as what
   * research associates instead.
   *
   * If the clinic later insists on their wording, that is their call to make —
   * but it has to be made deliberately, which is what this test forces.
   */
  it("does not claim proven causation, or name cancers", () => {
    const source = readFileSync(
      join(process.cwd(), "components/services/perio/perioContent.ts"),
      "utf8",
    );
    const prose = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");

    expect(prose).not.toMatch(/rakovin|nádor|Alzheimer/i);
    expect(prose).not.toMatch(/priam(u|a) súvislos/i);
    expect(prose).toMatch(/výskum/i);
  });

  /*
   * What makes this a page rather than a paragraph: the swab that identifies
   * the actual pathogens before anything is prescribed, and the plasma that
   * closes the treatment. Both are marked so the reader scanning six steps
   * lands on the two that are not ordinary cleaning.
   */
  it("marks the two steps that are the difference", () => {
    const pivotal = protocol.steps.filter((step) => step.pivotal);

    expect(protocol.steps).toHaveLength(6);
    expect(pivotal).toHaveLength(2);
    expect(pivotal.map((step) => step.name)).toEqual([
      "DNA analýza z výteru",
      "Vlastná krvná plazma",
    ]);
  });


  /*
   * ⚠️ These two files are one frame, and that is a measurement rather than a
   * suspicion. Their difference is minimised at exactly zero offset — 23.3
   * against 32.9 a single pixel either way — and is uniform across the
   * picture, 5.5 of 255 on the teeth against 5.9 on the gum. Two photographs
   * months apart cannot align to the pixel or differ that evenly.
   *
   * The clinic says the underlying case is theirs, and the claim that it was
   * not was removed. What may not happen is this pair appearing among the
   * patient cases as a treatment result, because the pair does not show one.
   * When the two original frames arrive they replace this — at which point
   * this test goes with them rather than being loosened.
   */
  it("does not present the adjusted pair as a treatment result", () => {
    const claims = [
      illustration.heading,
      illustration.lead,
      illustration.labels.before,
      illustration.labels.after,
      illustration.before.alt,
      illustration.after.alt,
    ].join(" ");

    expect(claims).not.toMatch(/pred ošetrením|po ošetrení|náš pacient/i);
    expect(illustration.note).toMatch(/upraven/i);
  });

  /* Four factors, and hygiene is only one of them — that is the point. */
  it("keeps hygiene as one cause of four", () => {
    expect(causes.items).toHaveLength(4);
    expect(causes.items.map((item) => item.name)).toContain("Genetika");
    expect(causes.lead).toMatch(/len jedna/i);
  });

  /* The clinic's closing sentence, verbatim, and the honest limit beside it. */
  it("keeps the clinic's own claim, and the caveat with it", () => {
    expect(outcome.claim).toBe(
      "Zuby, ktoré sme v minulosti extrahovali, dnes zachraňujeme.",
    );
    expect(outcome.body).toMatch(/nie každý zub/i);
    expect(outcome.linkHref).toBe("/sluzby/zubne-implantaty");
    expect(plasma.body).toMatch(/vlastná/i);
  });
});
