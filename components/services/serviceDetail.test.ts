import { describe, expect, it } from "vitest";

import { getServiceDetail } from "./serviceDetail";
import { allServices } from "./servicesContent";

const euros = (value: string) => Number(value.replace(/[^\d]/g, ""));

describe("service detail", () => {
  it("only describes services that exist in the catalogue", () => {
    for (const service of allServices) {
      const detail = getServiceDetail(service.slug);
      if (detail) expect(detail.slug).toBe(service.slug);
    }
    expect(getServiceDetail("nieco-co-neexistuje")).toBeUndefined();
  });

  /*
   * Three numbers have to agree, and a page that gets this wrong is not
   * showing a typo — it is quoting a clinic's price incorrectly. The parts add
   * up to what is struck through, the parts that are charged add up to what is
   * charged, and the difference is what the page claims you save.
   */
  it("makes the package's three totals agree", () => {
    const bundle = getServiceDetail("vstupna-prehliadka")?.bundle;
    expect(bundle).toBeDefined();

    const everything = bundle!.items.reduce((sum, i) => sum + euros(i.price), 0);
    const charged = bundle!.items
      .filter((i) => !i.free)
      .reduce((sum, i) => sum + euros(i.price), 0);

    expect(everything).toBe(euros(bundle!.listTotal));
    expect(charged).toBe(euros(bundle!.total));
    expect(everything - charged).toBe(euros(bundle!.saving));
  });

  /* Something has to be given away, or the struck-through total is theatre. */
  it("actually gives one of the items away", () => {
    const bundle = getServiceDetail("vstupna-prehliadka")?.bundle;

    expect(bundle!.items.some((item) => item.free)).toBe(true);
    expect(euros(bundle!.total)).toBeLessThan(euros(bundle!.listTotal));
  });

  /*
   * The four inclusions are what the price buys. Conveniences — parking,
   * opening hours, the six-month recall — belong under them, not among them:
   * mixed together they hid the things that matter.
   */
  it("keeps the deliverables apart from the conveniences", () => {
    const detail = getServiceDetail("vstupna-prehliadka");

    expect(detail!.benefits.length).toBeLessThanOrEqual(5);
    expect(detail!.extras.length).toBeGreaterThan(0);

    const inclusions = detail!.benefits.map((b) => b.title).join(" ");
    expect(inclusions).not.toMatch(/parkovan|otvorené|deti/i);
  });
});
