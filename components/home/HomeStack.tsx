"use client";

import { useEffect, useRef, type JSX, type ReactNode } from "react";
import styles from "./home.module.css";

/**
 * The homepage's stacked slides.
 *
 * Each slide pins at the top and the next rides up over it, the way the
 * reference recording behaves. One scroll listener drives the whole stack and
 * publishes two numbers as custom properties, so the sections themselves stay
 * declarative and nothing is measured twice:
 *
 *   --band-in   0 → 1 while the statement band rises over the hero
 *   --strip-in  0 → 1 while the photo strip rises over the band
 *
 * The band's slot is deliberately two viewports tall. Its pinned child is one
 * viewport, so after the band lands it stays exactly full screen for a further
 * viewport of scrolling before the strip begins to cover it. Without that
 * dwell the band is only ever full screen at a single scroll position, which
 * the reader has to hit exactly — and the moment it arrives, the next section
 * is already pushing it off.
 */
export function HomeStack({
  hero,
  band,
  strip,
}: {
  hero: ReactNode;
  band: ReactNode;
  strip: ReactNode;
}): JSX.Element {
  const stackRef = useRef<HTMLDivElement>(null);
  const bandSlotRef = useRef<HTMLDivElement>(null);
  const stripSlotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stack = stackRef.current;
    const bandSlot = bandSlotRef.current;
    const stripSlot = stripSlotRef.current;
    if (!stack || !bandSlot || !stripSlot) return;

    const reduced = globalThis.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return; // stylesheet defaults leave everything arrived

    // A slot's top travels from the bottom of the screen to the top as it
    // rises, so this is simply how far through that rise it is.
    const arrival = (slot: HTMLElement) => {
      const raw = 1 - slot.getBoundingClientRect().top / window.innerHeight;
      return Math.min(1, Math.max(0, raw));
    };

    const update = () => {
      stack.style.setProperty("--band-in", String(arrival(bandSlot)));
      stack.style.setProperty("--strip-in", String(arrival(stripSlot)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className={styles.stack} ref={stackRef}>
      <div className={styles.heroSlot}>
        {hero}
        {/* Lets the hero recede as it is covered, instead of being cut off. */}
        <div className={styles.heroDim} aria-hidden="true" />
      </div>

      <div className={styles.bandSlot} ref={bandSlotRef}>
        <div className={styles.bandPin}>
          {band}
          {/* Same idea again: the band recedes as the strip covers it. */}
          <div className={styles.bandDim} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.stripSlot} ref={stripSlotRef}>
        {strip}
      </div>
    </div>
  );
}
