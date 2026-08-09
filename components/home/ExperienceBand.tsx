"use client";

import { useEffect, useRef, type JSX } from "react";
import styles from "./experienceBand.module.css";

/** Fraction of the slide already spent before the sentence starts appearing. */
const REVEAL_START = 0.25;

/**
 * The statement band under the hero.
 *
 * Matches the reference recording: the hero stays pinned while this section
 * rises over it, and the sentence fades in *during* that rise, reaching full
 * strength as the section lands exactly full screen. It also drifts upward as
 * it appears, which is what stops the fade reading as a plain opacity ramp.
 *
 * The photograph is blurred in the asset itself, not with a CSS filter. A
 * runtime `blur()` over a full-bleed background repaints on every scroll frame
 * and is one of the most expensive things a phone can be asked to do; baking it
 * also collapses the file, since there is no fine detail left to encode —
 * 1920px wide lands at 95 KB.
 *
 * The reveal is a scroll listener writing one custom property, rather than
 * `motion`'s `useScroll` or a CSS `view()` timeline. Both of those were tried:
 * the CSS timeline needs Chrome 115+/Safari 26+ and simply does nothing where
 * it is missing, and both proved impossible to verify before shipping. This
 * runs in every browser, and its effect can be measured. The stylesheet
 * defaults `--reveal` to 1, so a page that never runs the script shows the
 * sentence outright.
 */
export function ExperienceBand(): JSX.Element {
  const bandRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;

    const reduced = globalThis.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return; // leave --reveal at its visible default

    const update = () => {
      // 0 while the band's top edge is still at the bottom of the screen,
      // 1 once it has risen to cover the hero — the span of the slide.
      const slide = 1 - band.getBoundingClientRect().top / window.innerHeight;
      const progress = Math.min(1, Math.max(0, slide));
      const revealed = (progress - REVEAL_START) / (1 - REVEAL_START);

      band.style.setProperty(
        "--reveal",
        String(Math.min(1, Math.max(0, revealed))),
      );
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
    <section
      className={styles.band}
      ref={bandRef}
      aria-labelledby="experience-heading"
    >
      <div className={styles.media} aria-hidden="true" />
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.inner}>
        <h2 className={styles.headline} id="experience-heading">
          Meníme zážitok u zubára a vraciame vám sebavedomie.
        </h2>
      </div>
    </section>
  );
}
