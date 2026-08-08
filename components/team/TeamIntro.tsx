import type { CSSProperties, JSX } from "react";
import { teamIntro } from "./teamContent";
import styles from "./team.module.css";

/**
 * The opening statement, revealed a word at a time.
 *
 * Each word sits in its own overflow-hidden box and rises into it, so the
 * headline assembles the way a title card does rather than fading in as one
 * block.
 *
 * Deliberately CSS rather than `motion`: a JS-driven reveal starts the page's
 * own headline at `opacity: 0`, so a background tab — where rAF is throttled —
 * or any failure to hydrate leaves the main heading invisible. A CSS animation
 * settles on its own, needs no client bundle, and matches how the hero already
 * animates. Reduced motion is handled in the stylesheet.
 *
 * Words are wrapped individually, which keeps text selection and screen-reader
 * output intact: the wrappers carry no semantics, so the heading is still read
 * as one string.
 */
export function TeamIntro(): JSX.Element {
  const words = teamIntro.headline.split(" ");

  return (
    <header className={styles.intro}>
      <p className={styles.eyebrow}>
        <span className={styles.eyebrowRule} aria-hidden="true" />
        {teamIntro.eyebrow}
      </p>

      <h1 className={styles.headline}>
        {words.map((word, index) => (
          <span className={styles.wordMask} key={`${word}-${index}`}>
            <span
              className={styles.word}
              style={{ "--word-index": index } as CSSProperties}
            >
              {word}
            </span>
          </span>
        ))}
      </h1>

      <p
        className={styles.lead}
        style={{ "--word-index": words.length } as CSSProperties}
      >
        {teamIntro.lead}
      </p>
    </header>
  );
}
