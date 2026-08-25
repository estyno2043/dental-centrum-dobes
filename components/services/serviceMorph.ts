/**
 * What the two halves of the service morph share.
 *
 * Opening a service grows its photograph out of the card; closing one shrinks
 * it back into the same card. The second half cannot measure that card — the
 * catalogue is not on screen when the reader presses back — so the first half
 * writes down where it was, and the second reads it.
 *
 * No `"use client"` here on purpose: the constants are read by a server
 * component too, and a value exported from a client module reaches the server
 * as a client reference rather than as itself.
 */

/** The card marks the box the morph starts from — the frame, not the picture. */
export const CARD_PHOTO_ATTRIBUTE = "data-service-photo";

/** The incoming page marks its backdrop, so the hook knows when it has landed. */
export const BACKDROP_ATTRIBUTE = "data-service-backdrop";

/** How long the photograph takes to grow into the page, or shrink out of it. */
export const MORPH_MS = 680;

/** And how long it then takes to settle into being a background. */
export const SETTLE_MS = 260;

export const MORPH_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

/**
 * What the photograph looks like once it is the page's background.
 *
 * ⚠️ Never animate towards this. A full-screen `blur()` is re-rendered from
 * scratch every frame, and that alone is what made the morph stutter — the
 * clone travels sharp, and the blur arrives afterwards as a settle.
 */
export const BACKDROP_FILTER =
  "blur(9px) saturate(0.5) brightness(1.18) contrast(0.86)";

/**
 * The cream laid over it, so ink reads on any photograph. The clinic's own
 * warm tone rather than porcelain: white washed the pictures out until there
 * was little point in having them.
 */
export const BACKDROP_CREAM = "244 240 232";

export const BACKDROP_SCRIM =
  "linear-gradient(to bottom, " +
  `rgb(${BACKDROP_CREAM} / 88%) 0%, ` +
  `rgb(${BACKDROP_CREAM} / 72%) 30%, ` +
  `rgb(${BACKDROP_CREAM} / 76%) 66%, ` +
  `rgb(${BACKDROP_CREAM} / 92%) 100%)`;

/** Where the photograph came from, so it knows where to go back to. */
export type RememberedMorph = {
  readonly src: string;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly radius: string;
  /** The viewport it was measured in. A different one invalidates the rect. */
  readonly viewport: readonly [number, number];
};

const KEY = "dobes:service-morph";

export function rememberMorph(morph: RememberedMorph): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(morph));
  } catch {
    // Storage can be refused; the reverse simply does not play.
  }
}

/**
 * Reads it back once, and only if it still describes this window.
 *
 * The stored rectangle is in viewport coordinates, which survive the return
 * trip because the router restores the scroll position — but not a resize. A
 * card animated back to where it used to be in a window that has since
 * changed shape lands somewhere arbitrary, and no animation is better than one
 * that ends in the wrong place.
 */
export function takeMorph(): RememberedMorph | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    window.sessionStorage.removeItem(KEY);
    if (!raw) return null;

    const morph = JSON.parse(raw) as RememberedMorph;
    const [width, height] = morph.viewport;
    if (width !== window.innerWidth || height !== window.innerHeight) {
      return null;
    }
    return morph;
  } catch {
    return null;
  }
}
