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
