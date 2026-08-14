"use client";

import { useEffect, useRef, type CSSProperties, type JSX } from "react";
import { driftCards, driftIntro } from "./driftContent";
import styles from "./drift.module.css";

/**
 * A pinned scene the clinic's photographs drift through.
 *
 * The sentence holds in the middle of the frame while cards enter from the
 * edges, cross behind it and leave — each on its own stretch of the section's
 * scroll, so there are always two or three in the air.
 *
 * One number reaches the DOM: `--p`, progress through the pinned stretch.
 * Every card's fade and travel is CSS arithmetic on that and the constants it
 * carries, so a scroll frame costs a single custom-property write no matter
 * how many cards there are.
 *
 * A scroll listener rather than a scroll-driven animation or an observer:
 * both were tried elsewhere in this project and neither could be verified in
 * the preview environment. This can be measured.
 */
export function DriftScene(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = globalThis.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return; // stylesheet leaves every card at rest and visible

    const update = () => {
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
      aria-labelledby="drift-heading"
    >
      <div className={styles.pin}>
        <div className={styles.field} aria-hidden="true">
          {driftCards.map((card) => (
            <figure
              className={styles.card}
              key={card.src}
              style={
                {
                  "--in": card.in,
                  "--span": card.span,
                  "--from-x": card.from[0],
                  "--from-y": card.from[1],
                  "--to-x": card.to[0],
                  "--to-y": card.to[1],
                  "--at-x": `${card.at[0]}%`,
                  "--at-y": `${card.at[1]}%`,
                  "--w": `${card.width}%`,
                } as CSSProperties
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- Pre-cropped clinic asset; the image service adds nothing here. */}
              <img src={card.src} alt={card.alt} decoding="async" />
            </figure>
          ))}
        </div>

        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowRule} aria-hidden="true" />
            {driftIntro.eyebrow}
          </p>
          <h2 className={styles.headline} id="drift-heading">
            {driftIntro.headline}
          </h2>
        </div>
      </div>
    </section>
  );
}
