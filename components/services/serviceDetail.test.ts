import { describe, expect, it } from "vitest";

import { getServiceDetail } from "./serviceDetail";
import { allServices } from "./servicesContent";

describe("service detail", () => {
  it("only describes services that exist in the catalogue", () => {
    for (const service of allServices) {
      const detail = getServiceDetail(service.slug);
      if (detail) expect(detail.slug).toBe(service.slug);
    }
    expect(getServiceDetail("nieco-co-neexistuje")).toBeUndefined();
  });

  /*
   * Every price on this page is the clinic's own published figure, and the
   * bundle is the sum of its parts. A total that has drifted from its items is
   * worse than no total — it is a wrong price on a clinic's website.
   */
  it("adds the entry package up to the total it prints", () => {
    const detail = getServiceDetail("vstupna-prehliadka");
    expect(detail?.bundle).toBeDefined();

    const euros = (value: string) => Number(value.replace(/[^\d]/g, ""));
    const sum = detail!.bundle!.items.reduce(
      (total, item) => total + euros(item.price),
      0,
    );

    expect(sum).toBe(euros(detail!.bundle!.total));
  });

  /*
   * The clinic's free-X-ray wording was seasonal. It may render as something
   * to ask about, never as a standing offer, until someone confirms it still
   * runs.
   */
  it("keeps the seasonal offer marked unconfirmed", () => {
    const bundle = getServiceDetail("vstupna-prehliadka")?.bundle;

    expect(bundle?.unconfirmed).toMatch(/overte|opýtajte|zavolajte/i);
    for (const item of bundle?.items ?? []) {
      expect(item.label).not.toMatch(/zdarma|bezplatne/i);
    }
  });
});
