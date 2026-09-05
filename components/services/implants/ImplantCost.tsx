"use client";

import { useState, type JSX } from "react";

import { cost, costBase, crowns } from "./implantContent";
import styles from "./implants.module.css";

/**
 * What one implanted tooth costs, itemised, with the crown switchable.
 *
 * The page's spine. Every clinic publishes the 810 € root and lets the patient
 * discover the rest in the chair; this states the three components and adds
 * them up, and the one component with two real answers is a choice the reader
 * makes rather than a range they have to interpret.
 *
 * Native radios rather than a hand-built tablist. Two mutually exclusive
 * choices are exactly what a radio group is, and the native control brings
 * arrow keys, the roving tab stop, the grouped label and the announcement with
 * it — the same reasoning that put a native `<input type="range">` under the
 * before/after divider. The visible control is the label; the input itself is
 * hidden from sight but not from the accessibility tree, so focus is real.
 */
export function ImplantCost(): JSX.Element {
  const [crownId, setCrownId] = useState(crowns[0]!.id);
  const crown = crowns.find((entry) => entry.id === crownId) ?? crowns[0]!;

  return (
    <div className={styles.cost}>
      <ol className={styles.costItems}>
        {costBase.map((item) => (
          <li key={item.label}>
            <div className={styles.costRow}>
              <h3>{item.label}</h3>
              <span className={styles.costPrice}>{item.price}</span>
            </div>
            <p>{item.note}</p>
          </li>
        ))}

        <li>
          <div className={styles.costRow}>
            <h3>{cost.crownHeading}</h3>
            <span className={styles.costPrice}>{crown.price}</span>
          </div>

          <fieldset className={styles.crownChoice}>
            <legend className={styles.hidden}>{cost.crownHeading}</legend>
            {crowns.map((entry) => (
              <label className={styles.crownOption} key={entry.id}>
                <input
                  checked={entry.id === crownId}
                  className={styles.hidden}
                  name="korunka"
                  onChange={() => setCrownId(entry.id)}
                  type="radio"
                  value={entry.id}
                />
                <span>{entry.name}</span>
              </label>
            ))}
          </fieldset>

          <p>{crown.note}</p>
        </li>
      </ol>

      {/*
        Announced when the crown changes, because the number is the reason the
        control exists — a sighted reader watches it move and everybody else
        should be told it did.
      */}
      <p aria-live="polite" className={styles.costTotal}>
        <span className={styles.costTotalLabel}>{cost.totalLabel}</span>
        <strong>{crown.total}</strong>
      </p>
    </div>
  );
}
