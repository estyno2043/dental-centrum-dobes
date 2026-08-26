/**
 * The menu asks to travel; whoever owns the scroll answers.
 *
 * A shared module-level handle on the Lenis instance looked simpler and did
 * not work: the menu read `null` while Lenis was demonstrably running, so the
 * click fell through to a native anchor jump. Rather than chase which client
 * chunk got which copy of that module, the request goes through the DOM, where
 * there is only ever one of anything.
 *
 * The event is cancelable, and that is what carries the answer back:
 * `dispatchEvent` returns false when a listener called `preventDefault`, so
 * "somebody handled this" is known synchronously — in time to decide whether
 * to suppress the browser's own navigation.
 */
export const SCROLL_REQUEST = "dobes:scroll-to";

export type ScrollRequest = CustomEvent<{ id: string }>;

/**
 * Menu links are written as `/#sluzby` so one href covers both cases: from a
 * service page the browser navigates home and lands on the section, and from
 * the homepage this pulls the id back out so the trip can be eased instead.
 */
export function sectionIdFromHref(href: string): string | null {
  const hash = href.indexOf("#");
  if (hash === -1) return null;

  const id = href.slice(hash + 1);
  if (!id) return null;

  // `/#sluzby` from `/tim` is a navigation, not a scroll — there is no such
  // section on this page to travel to.
  const path = href.slice(0, hash);
  if (path && path !== globalThis.location?.pathname) return null;

  return id;
}

/**
 * Ask for an eased trip to a section. Returns whether anyone took it.
 *
 * False means the caller should let the browser do its ordinary thing: no such
 * section here, or eased scrolling is off. Under `prefers-reduced-motion` that
 * is the *correct* outcome rather than a degraded one — someone who has asked
 * not to be moved through twenty thousand pixels of page should just arrive.
 */
export function scrollToSection(id: string): boolean {
  if (!document.getElementById(id)) return false;

  const request = new CustomEvent(SCROLL_REQUEST, {
    cancelable: true,
    detail: { id },
  });
  // `dispatchEvent` is false exactly when a listener cancelled it.
  return !window.dispatchEvent(request);
}
