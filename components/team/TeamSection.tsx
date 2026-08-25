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

/** Fraction of the viewport, either side of its middle, that is fully lit. */
const HOLD = 0.18;
/** And the ramp from lit to grey beyond that. */
const FADE = 0.2;

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
    /** Each card's centre within the section, measured outside the scroll handler. */
    const centres = new Array<number>(cards.length).fill(0);
    /** The last `--focus` written per card, so an unchanged value is not rewritten. */
    const written = new Array<number>(cards.length).fill(Number.NaN);

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
       * Colour follows the middle of the screen.
       *
       * A plateau, not a peak. A single falloff from the centre reaches full
       * colour at exactly one scroll position, which in practice nobody sees —
       * the row is always on its way in or out and spends the whole time
       * part-grey. `HOLD` is the band where a row is fully lit and stays lit
       * while it crosses; `FADE` is the ramp on either side of it.
       *
       * The two together are just under half the row pitch, which is what
       * makes each row its own event: grey, then lit for a while, then grey
       * again, with no two rows ever lit at once.
       *
       * Deliberately measured from `offsetTop` rather than the card's own
       * rect: the rect carries the left column's drift, which would light the
       * two halves of a row by different amounts. The two portraits beside
       * each other should gain and lose colour together — that is the whole
       * effect — so the position used is the one the drift does not touch.
       */
      const middle = window.innerHeight / 2;
      const hold = window.innerHeight * HOLD;
      const fade = window.innerHeight * FADE;
      for (let index = 0; index < cards.length; index += 1) {
        const value = clamp(
          (hold + fade - Math.abs(rect.top + centres[index] - middle)) / fade,
        );

        /*
         * Written only when it actually changes. Most of the eleven are far
         * outside the band on any given frame and already sit at 0, and a
         * custom property written with the value it already holds still
         * invalidates style for that element.
         */
        if (value !== written[index]) {
          written[index] = value;
          cards[index].style.setProperty("--focus", String(value));
        }
      }
    };

    /*
     * The cards' own offsets are read here and not in `update`.
     *
     * `offsetTop` and `offsetHeight` force layout, and reading them inside the
     * scroll handler meant eleven forced layouts per card per frame — more
     * expensive than anything the frame then painted. They only change when
     * the section is laid out again, so a resize recomputes them and scrolling
     * reads nothing but the section's own rect.
     */
    const measure = () => {
      for (let index = 0; index < cards.length; index += 1) {
        centres[index] = cards[index].offsetTop + cards[index].offsetHeight / 2;
      }
    };

    measure();
    update();

    /*
     * Re-measured whenever the section is laid out again, not only on a window
     * resize.
     *
     * The offsets are not final on mount — the portraits and the web font both
     * settle afterwards, and measuring once before that left row partners with
     * different centres, so the two halves of a row lit separately instead of
     * together. Watching the section catches every one of those reflows.
     *
     * Safe against feedback: the handler writes only custom properties that
     * drive `transform` and `opacity`, neither of which changes layout, so it
     * cannot retrigger itself.
     */
    const observer = new ResizeObserver(() => {
      measure();
      update();
    });
    observer.observe(section);

    window.addEventListener("scroll", update, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
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
