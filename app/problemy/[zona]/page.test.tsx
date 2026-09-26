import { beforeEach, describe, expect, it, vi } from "vitest";

const { notFound, permanentRedirect } = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  permanentRedirect: vi.fn((href: string) => {
    throw new Error(`REDIRECT ${href}`);
  }),
}));

vi.mock("next/navigation", () => ({ notFound, permanentRedirect }));

import ProblemRedirect, { generateStaticParams } from "./page";

type Search = Record<string, string | string[] | undefined>;

function visit(zona: string, searchParams: Search = {}) {
  return ProblemRedirect({
    params: Promise.resolve({ zona }),
    searchParams: Promise.resolve(searchParams),
  });
}

/*
 * The problem pages were retired on 2026-09-26. The route survives only to
 * send an old link to the service page that now answers the same problem.
 */
describe("retired jaw problem route", () => {
  beforeEach(() => {
    notFound.mockClear();
    permanentRedirect.mockClear();
  });

  it("still knows the six old zone slugs", () => {
    expect(generateStaticParams()).toEqual([
      { zona: "predne-zuby" },
      { zona: "crenove-zuby" },
      { zona: "stolicky" },
      { zona: "dasna" },
      { zona: "chybajuci-zub" },
      { zona: "neviem" },
    ]);
  });

  it("sends a named problem to its own service page", async () => {
    await expect(visit("stolicky", { problem: "bite-pain" })).rejects.toThrow(
      "REDIRECT /sluzby/endodoncia",
    );
    await expect(visit("dasna", { problem: "odor" })).rejects.toThrow(
      "REDIRECT /sluzby/dentalna-hygiena",
    );
    await expect(
      visit("chybajuci-zub", { problem: "removable-replacement" }),
    ).rejects.toThrow("REDIRECT /sluzby/protetika");
  });

  it("sends a bare or unknown problem to the zone's page", async () => {
    await expect(visit("neviem")).rejects.toThrow("REDIRECT /sluzby/vstupna-prehliadka");
    await expect(visit("stolicky", { problem: "__proto__" })).rejects.toThrow(
      "REDIRECT /sluzby/endodoncia",
    );
    await expect(visit("crenove-zuby", { problem: ["a", "b"] })).rejects.toThrow(
      "REDIRECT /sluzby/biele-vyplne",
    );
  });

  it("returns 404 for a slug that never existed", async () => {
    await expect(visit("unknown")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(permanentRedirect).not.toHaveBeenCalled();
  });
});
