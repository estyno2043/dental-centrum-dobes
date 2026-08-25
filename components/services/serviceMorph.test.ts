import { afterEach, describe, expect, it } from "vitest";

import { rememberMorph, takeMorph } from "./serviceMorph";

const card = {
  src: "/media/sluzby/hygiena.webp",
  left: 572,
  top: 290,
  width: 337,
  height: 320,
  radius: "4px",
} as const;

afterEach(() => window.sessionStorage.clear());

describe("remembered morph", () => {
  it("hands the card back to whoever closes the page", () => {
    rememberMorph({ ...card, viewport: [window.innerWidth, window.innerHeight] });

    expect(takeMorph()).toMatchObject({ left: 572, top: 290, width: 337 });
  });

  /*
   * Read once. The reverse animation plays once, and a record left behind
   * would fire it again on a later page that never opened out of a card.
   */
  it("is consumed by reading it", () => {
    rememberMorph({ ...card, viewport: [window.innerWidth, window.innerHeight] });

    expect(takeMorph()).not.toBeNull();
    expect(takeMorph()).toBeNull();
  });

  /*
   * The rectangle is in viewport coordinates. They survive the return trip
   * because the router restores the scroll — but not a resize, and a card
   * animated back to where it used to be in a window that has since changed
   * shape lands somewhere arbitrary. No animation beats one ending in the
   * wrong place.
   */
  it("refuses a rectangle measured in a different window", () => {
    rememberMorph({ ...card, viewport: [999, 999] });

    expect(takeMorph()).toBeNull();
  });

  it("survives storage being unavailable", () => {
    const original = window.sessionStorage.getItem;
    Object.defineProperty(window.sessionStorage, "getItem", {
      configurable: true,
      value: () => {
        throw new Error("denied");
      },
    });

    expect(takeMorph()).toBeNull();

    Object.defineProperty(window.sessionStorage, "getItem", {
      configurable: true,
      value: original,
    });
  });

  /* Both halves must read the same clock, or the reverse feels like a different
     animation than the one it is reversing. */
  it("keeps one set of timings for both directions", async () => {
    const morph = await import("./serviceMorph");
    const transition = await import("./serviceTransition");

    expect(transition.MORPH_MS).toBe(morph.MORPH_MS);
    expect(transition.MORPH_EASING).toBe(morph.MORPH_EASING);
    expect(transition.BACKDROP_SCRIM).toBe(morph.BACKDROP_SCRIM);
  });
});
