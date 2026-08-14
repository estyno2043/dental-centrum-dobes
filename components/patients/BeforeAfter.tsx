"use client";

import { useId, useState, type CSSProperties, type JSX } from "react";
import type { PatientCase } from "./patientsContent";
import styles from "./patients.module.css";

/**
 * Before/after comparison with a draggable divider.
 *
 * The divider is a native `<input type="range">` stretched across the whole
 * frame at zero opacity. That one decision covers dragging with a mouse,
 * dragging with a finger, arrow keys, Home/End, and a value a screen reader
 * can announce — all of which would otherwise be hand-written pointer maths
 * that works for exactly one input device. The visible line and knob are
 * decoration positioned from the same value.
 *
 * `--pos` drives a `clip-path` on the "before" layer rather than a width, so
 * the image underneath never reflows and the drag stays on the compositor.
 */
export function BeforeAfter({
  patientCase,
}: {
  patientCase: PatientCase;
}): JSX.Element {
  const [position, setPosition] = useState(50);
  const labelId = useId();

  const hasPhotos = Boolean(patientCase.before && patientCase.after);

  return (
    <div
      className={styles.compare}
      style={{ "--pos": `${position}%` } as CSSProperties}
    >
      <div className={styles.layerAfter}>
        {hasPhotos ? (
          // eslint-disable-next-line @next/next/no-img-element -- Pre-cropped case photography; the image service adds nothing here.
          <img src={patientCase.after} alt={`Po ošetrení — ${patientCase.problem}`} />
        ) : (
          <span className={styles.placeholder} data-side="po">
            Po
          </span>
        )}
      </div>

      <div className={styles.layerBefore}>
        {hasPhotos ? (
          // eslint-disable-next-line @next/next/no-img-element -- Pre-cropped case photography; the image service adds nothing here.
          <img src={patientCase.before} alt={`Pred ošetrením — ${patientCase.problem}`} />
        ) : (
          <span className={styles.placeholder} data-side="pred">
            Pred
          </span>
        )}
      </div>

      <span className={styles.divider} aria-hidden="true">
        <span className={styles.knob} />
      </span>

      <span className={styles.visuallyHidden} id={labelId}>
        Porovnanie pred a po ošetrením: {patientCase.problem}
      </span>
      <input
        className={styles.range}
        type="range"
        min={0}
        max={100}
        step={1}
        value={position}
        aria-labelledby={labelId}
        aria-valuetext={`Zobrazené ${position} % stavu pred ošetrením`}
        onChange={(event) => setPosition(Number(event.target.value))}
      />
    </div>
  );
}
