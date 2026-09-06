"use client";

import { useId, useState, type CSSProperties, type JSX } from "react";

import { illustration } from "./perioContent";
import styles from "./perio.module.css";

/**
 * The before/after slider for the gum illustration.
 *
 * Its own component rather than `BeforeAfter` from the patients section only
 * because this pair sits inline in the page's closing section rather than in a
 * dot gallery; the same case also appears among the patient cases, through
 * `BeforeAfter`, from one record in `patientsContent.ts`.
 *
 * Mechanically the same native `<input type="range">` the patients section
 * uses: one control that covers mouse, touch, keyboard and screen readers.
 */
export function GumCompare(): JSX.Element {
  const [position, setPosition] = useState(50);
  const labelId = useId();

  return (
    <figure className={styles.compareFigure}>
      <div
        className={styles.compare}
        style={{ "--pos": `${position}%` } as CSSProperties}
      >
        <div className={styles.compareAfter}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Pre-sized asset. */}
          <img
            alt={illustration.after.alt}
            decoding="async"
            sizes="(max-width: 860px) 100vw, 58rem"
            src={`/media/sluzby/${illustration.after.src}.webp`}
            srcSet={
              `/media/sluzby/${illustration.after.src}-mobile.webp 632w, ` +
              `/media/sluzby/${illustration.after.src}.webp 1264w`
            }
          />
          <span className={styles.compareTag} data-side="after">
            {illustration.labels.after}
          </span>
        </div>

        <div className={styles.compareBefore}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Pre-sized asset. */}
          <img
            alt={illustration.before.alt}
            decoding="async"
            sizes="(max-width: 860px) 100vw, 58rem"
            src={`/media/sluzby/${illustration.before.src}.webp`}
            srcSet={
              `/media/sluzby/${illustration.before.src}-mobile.webp 632w, ` +
              `/media/sluzby/${illustration.before.src}.webp 1264w`
            }
          />
          <span className={styles.compareTag} data-side="before">
            {illustration.labels.before}
          </span>
        </div>

        <span aria-hidden="true" className={styles.compareDivider}>
          <span className={styles.compareKnob} />
        </span>

        <span className={styles.visuallyHidden} id={labelId}>
          Porovnanie ďasna pred liečbou a po nej
        </span>
        <input
          aria-labelledby={labelId}
          aria-valuetext={`Zobrazené ${position} % stavu pred liečbou`}
          className={styles.compareRange}
          max={100}
          min={0}
          onChange={(event) => setPosition(Number(event.target.value))}
          step={1}
          type="range"
          value={position}
        />
      </div>
    </figure>
  );
}
