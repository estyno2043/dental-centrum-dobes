import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  bookingRetention,
  operators,
  privacyContact,
  privacyEffective,
  privacyReady,
  privacySections,
} from "./legalContent";

describe("privacy notice", () => {
  /* From the Obchodný register, 2026-09-26. Both companies, as the user asked. */
  it("names both operators as the commercial register does", () => {
    expect(operators).toEqual([
      expect.objectContaining({
        name: "Dental Centrum Dobeš, s.r.o.",
        ico: "36768626",
        seat: "Svébska 20, 851 10 Bratislava",
        register: expect.stringContaining("vložka č. 45625/B"),
      }),
      expect.objectContaining({
        name: "Dental Centrum Dobeš Vlárska s.r.o.",
        ico: "54966281",
        seat: expect.stringContaining("Vlárska 13762/13C"),
        register: expect.stringContaining("vložka č. 164776/B"),
      }),
    ]);
  });

  /*
   * Published only when every fact the clinic must supply is in. This fails
   * the moment somebody flips it to ready with a field still missing.
   */
  it("is ready exactly when nothing is missing", () => {
    const missing =
      operators.some((o) => o.seat === null || o.register === null) ||
      privacyContact.email === null ||
      bookingRetention === null ||
      privacyEffective === null;
    expect(privacyReady).toBe(!missing);
  });

  /*
   * Every claim describes what the code does: no cookies, no analytics, one
   * form, Netlify, OpenStreetMap. If analytics or a tracking cookie is ever
   * added, this notice and the consent it needs have to change with it.
   */
  it("describes the site as built", () => {
    const text = privacySections("x")
      .flatMap((s) => [s.heading, ...s.paragraphs])
      .join(" ");
    expect(text).toMatch(/nepoužíva analytické, reklamné ani iné sledovacie cookies/);
    expect(text).toMatch(/Netlify/);
    expect(text).toMatch(/OpenStreetMap/);
    expect(text).toMatch(/Úradu na ochranu osobných údajov/);

    const layout = readFileSync(join(process.cwd(), "app/layout.tsx"), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "");
    expect(layout).not.toMatch(/googletagmanager|gtag\(|fonts\.googleapis/);
  });

  it("keeps the copy free of em dashes", () => {
    const text = privacySections("x")
      .flatMap((s) => [s.heading, ...s.paragraphs])
      .join(" ");
    expect(text).not.toContain("—");
  });
});
