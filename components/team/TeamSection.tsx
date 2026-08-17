"use client";

import { useEffect, useRef, type JSX } from "react";
import { TeamGrid } from "./TeamGrid";
import { teamIntro } from "./teamContent";
import styles from "./team.module.css";

/**
 * The team section — the homepage's closing section, and the whole of `/tim`.
 *
 * Two numbers reach the DOM from one listener:
 *
 *   --enter  the approach. 0 while the section's top edge is still a screen
 *            away, 1 once it reaches the top. The ground crosses from the
 *            drifting scene's warm tone to this one over that whole screen of
 *            scrolling, and the intro arrives on the same value — so the join
 *            is a change of temperature rather than an edge.
 *   --p      how far the grid has crossed the viewport, which is what makes
 *            the left column travel past the right one.
 *
 * and one per portrait:
 *
 *   --focus  how near that row is to the band of light in the middle of the
 *            screen. The portraits are held back towards grey and recover
 *            their colour inside that band, so colour follows the reader down
 *            the page rather than waiting to be hovered.
 *
 * Both default to their settled state in CSS, not their starting one. A page
 * whose JavaScript fails should show the team, not eleven invisible people, and
 * the listener's first run happens on mount before a frame is painted.
 */
type TeamSectionProps = Readonly<{
  /**
   * `h2` on the homepage, where the hero already owns the `h1`; `h1` on
   * `/tim`, where this headline is the page's own subject. The level is a
   * property of the page, not of the section, so it has to come from outside.
   */
  headingLevel?: "h1" | "h2";
}>;

export function TeamSection({
  headingLevel = "h2",
}: TeamSectionProps = {}): JSX.Element {
  const Heading = headingLevel;
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = globalThis.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return; // the stylesheet's defaults are already the rest state

    const clamp = (value: number) => Math.min(1, Math.max(0, value));

    const cards = Array.from(section.querySelectorAll<HTMLElement>("li"));

    const update = () => {
      const rect = section.getBoundingClientRect();

      section.style.setProperty(
        "--enter",
        String(clamp(1 - rect.top / window.innerHeight)),
      );

      /*
       * Measured against the section's height plus a viewport — the span over
       * which any part of it is on screen — so a tall grid and a short one
       * drift at the same rate rather than the tall one crawling.
       */
      const span = rect.height + window.innerHeight;
      section.style.setProperty(
        "--p",
        String(clamp((window.innerHeight - rect.top) / span)),
      );

      /*
       * Colour follows the middle of the screen. `REACH` is how far from that
       * middle a row still catches some of it — a little under half a screen,
       * so one row is lit at a time and the rows above and below have gone
       * back to grey.
       *
       * Deliberately measured from `offsetTop` rather than the card's own
       * rect: the rect carries the left column's drift, which would light the
       * two halves of a row by different amounts. The two portraits beside
       * each other should gain and lose colour together — that is the whole
       * effect — so the position used is the one the drift does not touch.
       */
      const middle = window.innerHeight / 2;
      const reach = window.innerHeight * 0.46;
      for (const card of cards) {
        const centre =
          rect.top + card.offsetTop + card.offsetHeight / 2 - middle;
        card.style.setProperty(
          "--focus",
          String(clamp(1 - Math.abs(centre) / reach)),
        );
      }
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
    /*
     * `data-header-mode="light"` for the whole section: it is pale, and the
     * header's only logo asset is white. On `/tim` it is also the only zone on
     * the page, which is what keeps the way back to the site reachable.
     */
    <section
      aria-labelledby="team-heading"
      className={styles.section}
      data-header-mode="light"
      ref={sectionRef}
    >
      {/*
       * The band of light the colour follows. Sticky rather than fixed so it
       * belongs to this section and stops at its edges, and purely decorative —
       * it marks where a row turns colour without being an instruction to
       * anyone reading with a screen reader.
       */}
      <div aria-hidden="true" className={styles.halo} />

      <header className={styles.intro}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowRule} aria-hidden="true" />
          {teamIntro.eyebrow}
        </p>
        <Heading className={styles.headline} id="team-heading">
          {teamIntro.headline}
        </Heading>
        <p className={styles.lead}>{teamIntro.lead}</p>
      </header>

      <TeamGrid nameLevel={headingLevel === "h1" ? "h2" : "h3"} />
    </section>
  );
}
