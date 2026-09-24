"use client";

import { useState, type JSX } from "react";
import {
  IconBrush,
  IconCrown,
  IconDiamond,
  IconSparkles,
  IconStack2,
  type Icon,
} from "@tabler/icons-react";

import { solutions } from "./aestheticContent";
import styles from "./aesthetic.module.css";

/* One glyph per option, so the rail can be scanned by shape as well as name. */
const ICONS: Readonly<Record<string, Icon>> = {
  bielenie: IconSparkles,
  kompozit: IconBrush,
  empress: IconStack2,
  keramika: IconDiamond,
  korunka: IconCrown,
};

const GRIND_STEPS = 4;

/**
 * The page's spine: five options, one on screen at a time.
 *
 * Switchable rather than laid out side by side, because five columns of
 * comparable prose is a table nobody reads — and the decision is not "which of
 * these five is best" but "which of these is *me*". Each panel opens with the
 * sentence somebody recognises themselves in, and the price is stated in the
 * same breath rather than saved for the end.
 *
 * A real tablist: these are panels of one region, arrow keys move between them,
 * and only the selected tab is in the tab order — which is what a screen reader
 * user expects the moment they meet `role="tab"`.
 */
export function SolutionSwitcher(): JSX.Element {
  const [active, setActive] = useState(0);
  const current = solutions[active]!;

  const move = (delta: number) => {
    const next = (active + delta + solutions.length) % solutions.length;
    setActive(next);
    document.getElementById(`solution-tab-${solutions[next]!.id}`)?.focus();
  };

  return (
    <div className={styles.switcher}>
      {/*
        The tablist itself is not focusable — in the ARIA tabs pattern the tabs
        carry a roving tabindex and the list does not. The arrow handling lives
        on the buttons for the same reason it does elsewhere in this project:
        the event lands on whichever tab has focus either way, and a native
        button is already keyboard-operable.
      */}
      <div aria-label="Riešenia" className={styles.tabs} role="tablist">
        {solutions.map((solution, index) => {
          const Glyph = ICONS[solution.id] ?? IconSparkles;
          return (
            <button
              aria-controls={`solution-panel-${solution.id}`}
              aria-selected={index === active}
              className={styles.tab}
              id={`solution-tab-${solution.id}`}
              key={solution.id}
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") move(1);
                else if (event.key === "ArrowLeft") move(-1);
                else return;
                event.preventDefault();
              }}
              role="tab"
              tabIndex={index === active ? 0 : -1}
              type="button"
            >
              <span aria-hidden="true" className={styles.tabIcon}>
                <Glyph size={18} stroke={1.6} />
              </span>
              <span className={styles.tabText}>
                <span className={styles.tabName}>{solution.name}</span>
                <span className={styles.tabPrice}>{solution.price}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        aria-labelledby={`solution-tab-${current.id}`}
        className={styles.panel}
        id={`solution-panel-${current.id}`}
        role="tabpanel"
        tabIndex={0}
      >
        <div className={styles.panelHead}>
          <div>
            <p className={styles.panelKind}>{current.kind}</p>
            <h3 className={styles.panelName}>{current.name}</h3>
          </div>
          <p className={styles.panelPrice}>
            {current.price}
            {/*
              Per tooth, and said out loud. A four-figure smile quoted as a
              three-figure number is the surprise that ends the appointment.
            */}
            <span>{current.id === "bielenie" ? "celý chrup" : "za zub"}</span>
          </p>
        </div>

        {/* The sentence somebody recognises themselves in, given its own weight. */}
        <p className={styles.panelSolves}>{current.solves}</p>
        <p className={styles.panelBody}>{current.body}</p>

        {/*
          The "Zub sa brúsi" fact as a picture, so the five can be compared at
          a glance. The fact itself stays in the list below and is what a
          screen reader hears; the meter is hidden from it.
        */}
        <div aria-hidden="true" className={styles.grind}>
          <span className={styles.grindLabel}>Koľko zuba sa obrúsi</span>
          <span className={styles.grindMeter}>
            {Array.from({ length: GRIND_STEPS }, (_, i) => (
              <span data-on={i < current.grind} key={i} />
            ))}
          </span>
        </div>

        <dl className={styles.panelFacts}>
          {current.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>

        {current.gentlest ? (
          <p className={styles.gentlest}>
            <span>Nič sa nebrúsi</span>
            Jediné z riešení, ktoré sa dá vziať späť.
          </p>
        ) : null}
      </div>
    </div>
  );
}
