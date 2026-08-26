import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SCROLL_REQUEST,
  scrollToSection,
  sectionIdFromHref,
} from "./scrollToSection";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("sectionIdFromHref", () => {
  it("reads the id out of a link written for both cases", () => {
    expect(sectionIdFromHref("/#sluzby")).toBe("sluzby");
    expect(sectionIdFromHref("#tim")).toBe("tim");
  });

  it("ignores links that are not going to a section here", () => {
    expect(sectionIdFromHref("/tim")).toBeNull();
    expect(sectionIdFromHref("#")).toBeNull();
    expect(sectionIdFromHref("tel:+421918800002")).toBeNull();
  });

  /*
   * `/#sluzby` clicked on `/tim` is a navigation, not a scroll: that section
   * is on another page, and intercepting the click would strand the reader.
   */
  it("declines a section that lives on a different page", () => {
    // jsdom's `location.pathname` is not redefinable, so move the page rather
    // than the spy — `pushState` is what a route change does anyway.
    const original = globalThis.location.pathname;
    globalThis.history.pushState({}, "", "/tim");

    expect(sectionIdFromHref("/#sluzby")).toBeNull();
    expect(sectionIdFromHref("/tim#tim")).toBe("tim");

    globalThis.history.pushState({}, "", original);
  });
});

describe("scrollToSection", () => {
  it("declines when the section is not on this page", () => {
    expect(scrollToSection("sluzby")).toBe(false);
  });

  /*
   * Nobody listening means eased scrolling is off — under reduced motion, or
   * before the loop has started. The caller must let the browser jump, so a
   * false here is what keeps the link working at all.
   */
  it("declines when no scroller answers", () => {
    document.body.innerHTML = '<section id="sluzby"></section>';

    expect(scrollToSection("sluzby")).toBe(false);
  });

  it("reports handled when a scroller cancels the request", () => {
    document.body.innerHTML = '<section id="sluzby"></section>';
    const listener = (event: Event) => event.preventDefault();
    window.addEventListener(SCROLL_REQUEST, listener);

    expect(scrollToSection("sluzby")).toBe(true);

    window.removeEventListener(SCROLL_REQUEST, listener);
  });

  it("names the section it wants in the request", () => {
    document.body.innerHTML = '<section id="tim"></section>';
    const seen = vi.fn();
    const listener = (event: Event) => {
      seen((event as CustomEvent<{ id: string }>).detail.id);
    };
    window.addEventListener(SCROLL_REQUEST, listener);

    scrollToSection("tim");
    expect(seen).toHaveBeenCalledWith("tim");

    window.removeEventListener(SCROLL_REQUEST, listener);
  });
});
