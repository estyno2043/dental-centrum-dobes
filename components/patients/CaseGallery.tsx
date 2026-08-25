"use client";

import { useId, useState, type JSX } from "react";
import { BeforeAfter } from "./BeforeAfter";
import type { PatientCase } from "./patientsContent";
import styles from "./caseGallery.module.css";

/**
 * Every published case in one frame, with a row of dots underneath.
 *
 * The comparison itself is unchanged — `BeforeAfter` still owns the divider —
 * and this only decides which case it is handed. Deliberately *not* keyed on
 * the case: the divider keeps whatever position the reader dragged it to as
 * they move down the row, so comparing six cases at the same point is one
 * gesture rather than six.
 *
 * Plain buttons rather than a carousel pattern. There is no auto-advance and
 * nothing scrolls, so `aria-current` on six buttons says everything a
 * `tablist` would while staying operable the moment JavaScript has loaded.
 * Arrow keys work on top of Tab, and the count is announced politely so a
 * screen reader hears the case change rather than only the alt text swapping
 * underneath it.
 */
export function CaseGallery({
  cases,
}: {
  cases: readonly PatientCase[];
}): JSX.Element {
  const [index, setIndex] = useState(0);
  const statusId = useId();
  const active = cases[index];

  if (!active) throw new Error("CaseGallery needs at least one case.");

  return (
    <div className={styles.gallery}>
      <BeforeAfter patientCase={active} />

      <div className={styles.meta}>
        {active.treatments.length > 0 ? (
          <p className={styles.treatments}>{active.treatments.join(" · ")}</p>
        ) : null}
        <p className={styles.problem}>{active.problem}</p>
        {active.facts.length > 0 ? (
          <dl className={styles.facts}>
            {active.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>

      <div className={styles.dots}>
        {cases.map((item, position) => (
          <button
            aria-current={position === index}
            aria-label={`Práca ${position + 1} z ${cases.length}`}
            className={styles.dot}
            key={item.id}
            onClick={() => setIndex(position)}
            /*
              Arrow keys on the buttons themselves rather than on the row: the
              event fires on whichever dot has focus either way, and a native
              button is already keyboard-operable, so nothing has to be
              re-implemented for a plain div to behave like one.

              Focus follows the case it selects. Leaving the ring on the dot
              that was pressed while a different one is current shows two
              answers to "where am I" at once.
            */
            onKeyDown={(event) => {
              const delta =
                event.key === "ArrowRight"
                  ? 1
                  : event.key === "ArrowLeft"
                    ? -1
                    : 0;
              if (delta === 0) return;
              event.preventDefault();

              const next = (position + delta + cases.length) % cases.length;
              setIndex(next);
              const sibling = event.currentTarget.parentElement?.children[next];
              if (sibling instanceof HTMLElement) sibling.focus();
            }}
            type="button"
          >
            <span aria-hidden="true" />
          </button>
        ))}
      </div>

      <p aria-live="polite" className={styles.visuallyHidden} id={statusId}>
        Práca {index + 1} z {cases.length}. {active.problem}
      </p>
    </div>
  );
}
