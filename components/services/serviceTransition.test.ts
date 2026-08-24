import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  BACKDROP_ATTRIBUTE,
  BACKDROP_FILTER,
  BACKDROP_SCRIM,
  CARD_PHOTO_ATTRIBUTE,
} from "./serviceTransition";

const pageSource = readFileSync("app/sluzby/[sluzba]/page.tsx", "utf8");
const pageCss = readFileSync("app/sluzby/[sluzba]/service.module.css", "utf8");
const constantsSource = readFileSync(
  "components/services/serviceTransition.ts",
  "utf8",
);

describe("service photo transition", () => {
  /*
   * And the constants must not live in a client module. A value exported from
   * one reaches a server component as a client *reference*, so spreading it as
   * an attribute name produced an attribute named after the proxy's own error
   * message — which React duly tried to render.
   */
  it("keeps the shared names out of a client module", () => {
    // Anchored to a real directive: the file's own comment says the words
    // "use client" while explaining why they are not there.
    const firstStatement = constantsSource
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "")
      .trim();
    expect(firstStatement).not.toMatch(/^["']use client["']/);
    expect(pageSource).toMatch(
      /from "@\/components\/services\/serviceTransition"/,
    );
  });

  /*
   * The morph starts from the card's frame, never from the picture inside it.
   * The image is taller than its box and clipped, so a snapshot of the image
   * begins the animation from a rectangle that was never on screen — the
   * picture appears to jump to full size and only then travel.
   */
  it("morphs from the frame the reader sees, not the clipped image", () => {
    const section = readFileSync(
      "components/services/ServicesSection.tsx",
      "utf8",
    );
    const hook = readFileSync(
      "components/services/useServiceTransition.ts",
      "utf8",
    );

    expect(section).toMatch(/className=\{styles\.frame\} data-service-photo/);
    expect(hook).toContain("CARD_PHOTO_ATTRIBUTE");

    // The image is still read, but only for its `src`. Every measurement has
    // to come off the frame — that is the box the reader actually sees.
    expect(hook).toMatch(/frame\.getBoundingClientRect\(\)/);
    expect(hook).not.toMatch(/source\.getBoundingClientRect\(\)/);
  });

  /*
   * The wait for the incoming page must not be driven by animation frames. A
   * view transition suppresses rendering while its callback runs, so a poll
   * built on `requestAnimationFrame` can sit there never called — the wait
   * times out, the second snapshot catches the old page, and no morph happens.
   */
  it("waits on DOM mutations rather than animation frames", () => {
    const hook = readFileSync(
      "components/services/useServiceTransition.ts",
      "utf8",
    );

    // Comments stripped first: the code's own note explains why it is not
    // using the very API this asserts is absent.
    const code = hook
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

    expect(code).toContain("MutationObserver");
    expect(code).not.toContain("requestAnimationFrame");
  });

  /*
   * The clone flies towards the destination's exact look. If the filter or the
   * scrim were also written in the stylesheet, the two copies would drift the
   * first time either was touched — and the symptom is a flicker at the moment
   * the animation lands, with nothing to point at.
   */
  it("keeps the destination's look in one place", () => {
    expect(pageCss).not.toMatch(/filter:\s*blur\(/);
    expect(pageCss).not.toMatch(/rgb\(250 249 246 \/ 9/);
    expect(pageSource).toMatch(/filter:\s*BACKDROP_FILTER/);
    expect(pageSource).toMatch(/background:\s*BACKDROP_SCRIM/);
    expect(BACKDROP_FILTER).toMatch(/blur\(/);
    expect(BACKDROP_SCRIM).toMatch(/linear-gradient/);
  });

  /*
   * A clone is an opaque thing covering the whole screen. Every reason it
   * might never be told to leave — a paused document clock, a rejected
   * navigation, an animation the browser declines to run — leaves the page
   * unusable behind it, so its removal must not depend on any of them.
   */
  it("cannot strand the flying clone on screen", () => {
    const hook = readFileSync(
      "components/services/useServiceTransition.ts",
      "utf8",
    );

    expect(hook).toMatch(/setTimeout\(cleanup/);
    expect(hook).toMatch(/if \(cleared\) return/);
  });

  it("names the thing the incoming page is recognised by", () => {
    expect(BACKDROP_ATTRIBUTE).toMatch(/^data-/);
    expect(pageSource).toContain("BACKDROP_ATTRIBUTE");
    expect(CARD_PHOTO_ATTRIBUTE).toMatch(/^data-/);
  });
});
