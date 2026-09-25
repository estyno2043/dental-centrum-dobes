"use client";

import { useId, useState, type JSX } from "react";

import { SurfaceMap } from "./FillingsArt";
import { surfaces } from "./fillingsContent";
import styles from "./fillings.module.css";

/**
 * The page's device: pick one, two or three surfaces and see which part of
 * the tooth that is and what a white filling costs.
 *
 * Native radio buttons in a fieldset. The choice is one of three, arrow keys
 * move between them without a line of script, and a screen reader announces
 * the group and the selection. The price and the sentence under the drawing
 * are `aria-live`, because changing them is the point of choosing.
 */
export function SurfacePicker(): JSX.Element {
  const name = useId();
  const [count, setCount] = useState<1 | 2 | 3>(1);
  const current = surfaces.options.find((o) => o.count === count)!;

  return (
    <div className={styles.picker}>
      <div className={styles.pickerDrawing}>
        <SurfaceMap className={styles.surfaceMap} count={count} />
      </div>

      <div className={styles.pickerControls}>
        <fieldset className={styles.pickerChoices}>
          <legend className={styles.visuallyHidden}>Počet plôšok</legend>
          {surfaces.options.map((option) => (
            <label className={styles.choice} key={option.count}>
              <input
                checked={count === option.count}
                name={name}
                onChange={() => setCount(option.count)}
                type="radio"
                value={option.count}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>

        <div aria-live="polite" className={styles.pickerResult}>
          <p className={styles.pickerPrice}>
            {current.price}
            <span>biela výplň</span>
          </p>
          <p className={styles.pickerWhich}>{current.which}</p>
        </div>
      </div>
    </div>
  );
}
