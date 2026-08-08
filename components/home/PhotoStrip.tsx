"use client";

import { useEffect, useRef, type CSSProperties, type JSX } from "react";
import { photoFrames, photoStripIntro } from "./photoStripContent";
import styles from "./photoStrip.module.css";

/** Fraction of the scroll spent growing the strip before it starts panning. */
const GROW_PHASE = 0.22;

/**
 * The horizontal filmstrip of clinic photography.
 *
 * Taken from the reference recording: a row of frames rises as a narrow band,
 * grows to nearly full height, then pans sideways while the page scrolls down.
 * The section is pinned for the length of that pan, so vertical scrolling is
 * what drives the horizontal movement.
 *
 * Two values are written to the DOM and everything else is CSS arithmetic:
 * `--p` is progress through the pinned stretch, and `--travel` is how far the
 * track has to move, which can only be known once the frames have laid out.
 * Writing custom properties rather than transforms keeps this to one style
 * write per scroll event, and keeps the motion legible in the stylesheet.
 *
 * Not a scroll-driven CSS animation: those need Chrome 115+/Safari 26+ and do
 * nothing where they are missing. This runs everywhere, and its effect can be
 * measured.
 */
export function PhotoStrip(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const reduced = globalThis.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const update = () => {
      // How far the track overflows the screen is the distance it must pan.
      const travel = Math.max(0, track.scrollWidth - window.innerWidth);
      section.style.setProperty("--travel", `${travel}px`);

      if (reduced) {
        section.style.setProperty("--p", "0");
        return;
      }

      // The section is taller than the viewport; the surplus is the pinned
      // stretch, and progress through it drives both growth and pan.
      const pinned = section.offsetHeight - window.innerHeight;
      const scrolled = -section.getBoundingClientRect().top;
      const progress = pinned > 0 ? scrolled / pinned : 0;

      section.style.setProperty(
        "--p",
        String(Math.min(1, Math.max(0, progress))),
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
      className={styles.section}
      ref={sectionRef}
      aria-labelledby="strip-heading"
      style={{ "--grow-phase": GROW_PHASE } as CSSProperties}
    >
      <div className={styles.pin}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowRule} aria-hidden="true" />
            {photoStripIntro.eyebrow}
          </p>
          <h2 className={styles.headline} id="strip-heading">
            {photoStripIntro.headline}
          </h2>
        </header>

        <ul className={styles.track} ref={trackRef}>
          {photoFrames.map((frame, index) => (
            <li
              className={styles.frame}
              key={frame.id}
              style={{ "--ratio": frame.ratio } as CSSProperties}
            >
              {frame.src ? (
                // eslint-disable-next-line @next/next/no-img-element -- Pre-cropped static assets; the image service adds nothing here.
                <img
                  className={styles.photo}
                  src={frame.src}
                  alt={`${frame.label} — Dental Centrum Dobeš`}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className={styles.placeholder}>
                  <span className={styles.placeholderIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.placeholderLabel}>{frame.label}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
