/**
 * The viewport height a mobile browser bar cannot move.
 *
 * `window.innerHeight` reports the height right now, so it changes the moment
 * an iOS address bar retracts — which happens during the first flick of a
 * scroll. Every scroll progress divided by it therefore steps at that moment,
 * and it steps while the document is resizing for the same reason. Together
 * that reads as the page jumping under the finger.
 *
 * `100lvh` is the largest viewport height and is constant for the life of an
 * orientation, which is what progress should be measured against. CSS knows
 * the value and JavaScript has no property for it, so it is read once from a
 * probe and cached per width. A width change means a rotation, which is the
 * one event that genuinely changes it.
 *
 * Falls back to `window.innerHeight` where `lvh` is not supported, which is
 * the behaviour every caller had before.
 */
let cachedHeight = 0;
let cachedWidth = -1;

export function stableViewportHeight(): number {
  if (typeof window === "undefined") return 1;
  if (cachedHeight > 0 && cachedWidth === window.innerWidth) return cachedHeight;

  const probe = document.createElement("div");
  probe.style.cssText =
    "position:absolute;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none";
  document.body.appendChild(probe);
  const measured = probe.offsetHeight;
  probe.remove();

  cachedHeight = measured > 0 ? measured : Math.max(1, window.innerHeight);
  cachedWidth = window.innerWidth;
  return cachedHeight;
}

/** Test seam: drops the cache so the next read measures again. */
export function resetStableViewportHeight(): void {
  cachedHeight = 0;
  cachedWidth = -1;
}
