"use client";

import { useId, useState, type JSX } from "react";

import { check } from "./perioContent";
import styles from "./perio.module.css";

/**
 * The recognition list, and the page's whole conversion device.
 *
 * Somebody who arrives here is usually not looking for periodontal treatment
 * — they do not know they need it, because it does not hurt. Ticking three of
 * these is the moment that changes, and it does more work than any amount of
 * prose about alveolar bone.
 *
 * ⚠️ It must never read as a diagnosis. The verdicts say whether it is worth
 * being examined and nothing else, and the disclaimer is not optional
 * decoration — a checklist on a clinic's site that appears to tell somebody
 * they have a disease is a different kind of document altogether.
 *
 * Native checkboxes: the label is the hit area, the keyboard works, and the
 * state is announced without a line of ARIA. The count is `aria-live` because
 * the verdict changing is the point of ticking a box, and a sighted reader
 * sees it happen.
 */
export function SymptomCheck(): JSX.Element {
  const id = useId();
  const [ticked, setTicked] = useState<readonly boolean[]>(
    () => check.items.map(() => false),
  );
  const [painless, setPainless] = useState(false);

  const count = ticked.filter(Boolean).length;
  const verdict =
    count === 0
      ? check.verdicts.none
      : count < 3
        ? check.verdicts.some
        : check.verdicts.many;

  return (
    <div className={styles.check}>
      <fieldset className={styles.checkFields}>
        <legend className={styles.checkQuestion}>{check.question}</legend>

        {check.items.map((item, index) => (
          <label className={styles.checkItem} key={item}>
            <input
              checked={ticked[index]}
              onChange={() =>
                setTicked((prev) =>
                  prev.map((value, i) => (i === index ? !value : value)),
                )
              }
              type="checkbox"
            />
            <span className={styles.checkBox} aria-hidden="true" />
            <span>{item}</span>
          </label>
        ))}

        {/*
          Set apart from the five, because it is not a symptom — it is the
          reassurance people take from the absence of one, and it is the thing
          that should worry them.
        */}
        <label className={`${styles.checkItem} ${styles.checkPainless}`}>
          <input
            checked={painless}
            onChange={() => setPainless((value) => !value)}
            type="checkbox"
          />
          <span className={styles.checkBox} aria-hidden="true" />
          <span>{check.painless}</span>
        </label>
      </fieldset>

      <div className={styles.checkVerdict}>
        <p aria-live="polite" className={styles.checkVerdictText} id={id}>
          {verdict}
        </p>
        {painless ? (
          <p className={styles.checkPainlessNote}>{check.painlessNote}</p>
        ) : null}
        <p className={styles.checkDisclaimer}>{check.disclaimer}</p>
      </div>
    </div>
  );
}
