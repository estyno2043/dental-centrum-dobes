import type { JSX } from "react";
import { teamQuote } from "./teamContent";
import styles from "./team.module.css";

/**
 * The pause between the roster and the numbers.
 *
 * No JavaScript: the reveal is a CSS scroll-driven animation, and the quote is
 * fully visible without it. A `motion` version would have shipped the server
 * HTML with `opacity: 0`, so a hydration failure would have silently deleted a
 * paragraph of real copy.
 */
export function TeamQuote(): JSX.Element {
  return (
    <figure className={styles.quote}>
      <blockquote className={styles.quoteText}>{teamQuote.text}</blockquote>
      <figcaption className={styles.quoteBy}>{teamQuote.attribution}</figcaption>
    </figure>
  );
}
