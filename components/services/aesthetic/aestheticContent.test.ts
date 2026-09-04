import { describe, expect, it } from "vitest";

import { priceGroups } from "@/components/pricing/pricingContent";
import {
  aestheticCaseIds,
  aestheticIntro,
  longevity,
  preview,
  solutions,
} from "./aestheticContent";
import {
  featuredCase,
  patientCases,
} from "@/components/patients/patientsContent";

const published = new Set(
  priceGroups.flatMap((group) => group.entries.map((entry) => entry.price)),
);

describe("aesthetic dentistry", () => {
  it("prices every option from the published list", () => {
    for (const solution of solutions) {
      expect(published.has(solution.price), `${solution.name}`).toBe(true);
    }
    for (const step of preview.steps) {
      const bare = step.price.replace(" / zub", "");
      expect(published.has(bare), `${step.name}: ${step.price}`).toBe(true);
    }
  });

  /*
   * The headline counts what is under it. "Tri cesty" above a rail of five is
   * the first thing a reader notices and the last thing they trust.
   */
  it("counts the options it claims to", () => {
    expect(solutions).toHaveLength(5);
    expect(aestheticIntro.headline).toContain("Päť ciest");
  });

  /*
   * Whitening is the only option that touches nothing, and that changes the
   * decision — so exactly one option carries the mark, and it is that one.
   */
  it("marks the one option that can be undone", () => {
    const gentle = solutions.filter((solution) => solution.gentlest);

    expect(gentle).toHaveLength(1);
    expect(gentle[0]?.id).toBe("bielenie");
    expect(gentle[0]?.facts[0]?.value).toBe("Vôbec");
  });

  it("gives every option the same three facts to be compared on", () => {
    const labels = solutions.map((s) => s.facts.map((f) => f.label).join("|"));
    expect(new Set(labels).size).toBe(1);
    expect(labels[0]).toBe("Zub sa brúsi|Hotové|Vydrží");
  });

  /*
   * The clinic said the work lasts a lifetime *if it is looked after*. Written
   * with the condition in front of the promise: the bare sentence is a
   * guarantee they would owe somebody who never comes back.
   */
  it("puts the condition in front of the lifetime claim", () => {
    expect(longevity.claim).toMatch(/^Kým sa oň staráte/);
    expect(longevity.body).toMatch(/pravidelnej dentálnej hygiene/);
    expect(longevity.linkHref).toBe("/sluzby/dentalna-hygiena");
  });

  it("shows only cases that are this service's own work", () => {
    const all = [featuredCase, ...patientCases];

    for (const id of aestheticCaseIds) {
      const found = all.find((entry) => entry.id === id);
      expect(found, `${id} is not a published case`).toBeDefined();
      expect(found?.treatments.join()).toMatch(/Fazety|Kompozitné dostavby/);
    }
  });
});
