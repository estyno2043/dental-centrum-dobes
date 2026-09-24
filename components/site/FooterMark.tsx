"use client";

import { useEffect, useRef, type CSSProperties, type JSX } from "react";

import { clinicName } from "./siteContent";
import styles from "./footer.module.css";

/**
 * The wordmark that fills as the footer arrives.
 *
 * The same idea as the tooth on the entry package's button, which fills from
 * the roots up on hover: here the letters start as an outline and take their
 * taupe from the bottom as the footer comes into view. It is the one ornament
 * in this footer and it is ours rather than borrowed.
 *
 * A scroll listener writing one custom property, which is this project's
 * settled pattern for scroll-driven work: CSS does the arithmetic, and the
 * stylesheet defaults `--fill` to 1, so a page whose script never runs shows
 * the wordmark filled rather than as an empty outline.
 */
export function FooterMark(): JSX.Element {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = () => {
      const rect = node.getBoundingClientRect();
      /*
       * Zero when the wordmark's top is still a screen away, one once it has
       * risen a third of the way up the viewport. Ending early matters: the
       * fill should be finished while the reader is still looking at it, not
       * completing as it leaves.
       */
      const start = window.innerHeight;
      const end = window.innerHeight * 0.34;
      const progress = (start - rect.top) / Math.max(1, start - end);
      node.style.setProperty(
        "--fill",
        String(Math.min(1, Math.max(0, progress))),
      );
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <p
      aria-label={clinicName}
      className={styles.mark}
      ref={ref}
      style={{ "--fill": 1 } as CSSProperties}
    >
      {/* Split so the three words can break and track independently. */}
      <span aria-hidden="true">Dental</span>
      <span aria-hidden="true">Centrum</span>
      <span aria-hidden="true">Dobeš</span>
    </p>
  );
}
