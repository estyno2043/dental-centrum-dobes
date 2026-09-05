import { describe, expect, it } from "vitest";

import { priceGroups } from "@/components/pricing/pricingContent";
import {
  aestheticCaseIds,
  aestheticIntro,
  course,
  longevity,
  mockUp,
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
    for (const step of mockUp.steps) {
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

  /*
   * "Podľa toho, čo pijete" was true and told nobody anything. The clinic gave
   * the real span on 2026-09-04, and the body names what moves it — a range
   * without its cause is as useless as the hand-wave it replaced.
   */
  it("states how long whitening lasts, and what decides it", () => {
    const whitening = solutions.find((s) => s.id === "bielenie")!;

    expect(whitening.facts.at(-1)).toEqual({
      label: "Vydrží",
      value: "6 mesiacov – 2 roky",
    });
    expect(whitening.body).toMatch(/káva|kávy/i);
    expect(whitening.body).toMatch(/zopakovať/);
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


  /*
   * The clinic's 2026-09-05 answer, pinned in both places it is claimed. The
   * fact row and the prose have to agree: three visits and about two weeks.
   * These were "vo viacerých návštevách" — true, and useless to somebody
   * deciding whether they can fit it in before a wedding.
   */
  it("states the real visit count for the laboratory work", () => {
    for (const id of ["keramika", "korunka"]) {
      const option = solutions.find((s) => s.id === id)!;
      const done = option.facts.find((f) => f.label === "Hotové")!;
      expect(done.value, id).toBe("3 návštevy, zhruba dva týždne");
    }
    expect(course.steps).toHaveLength(3);
    expect(course.steps[1]?.when).toBe("Na druhý deň");
    expect(course.lead).toMatch(/dva týždne/);
  });

  /*
   * The mock-up is available but is not what the clinic routinely does, and
   * they were explicit that its cost is why people decline it. The page may
   * offer it; it may not present it as the standard flow, and it may not
   * quote it without saying it adds to the total.
   */
  it("offers the mock-up as an option, with its cost owned", () => {
    expect(mockUp.body).toMatch(/navyšuje to cenu/);
    expect(mockUp.body).toMatch(/nie je to bežná súčasť/i);
    expect(course.heading).not.toMatch(/mock ?up/i);
    expect(course.lead).not.toMatch(/mock ?up/i);
  });

  /*
   * They do not do chairside whitening and said why. A missing option reads
   * as an oversight; a stated one reads as a judgement.
   */
  it("says outright that chairside whitening is not offered", () => {
    const whitening = solutions.find((s) => s.id === "bielenie")!;
    expect(whitening.body).toMatch(/ordinačné bielenie/i);
    expect(whitening.body).toMatch(/nerobíme/);
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
