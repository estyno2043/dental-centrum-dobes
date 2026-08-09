import type { JSX } from "react";
import styles from "./experienceBand.module.css";

/**
 * The statement band under the hero.
 *
 * The sentence appears while the band rises over the pinned hero and is fully
 * there by the time it lands full screen. It needs no script of its own:
 * `HomeStack` already measures the rise and publishes it as `--band-in`, and
 * the reveal is arithmetic on that in the stylesheet.
 *
 * The photograph is blurred in the asset itself, not with a CSS filter. A
 * runtime `blur()` over a full-bleed background repaints on every scroll frame
 * and is one of the most expensive things a phone can be asked to do; baking it
 * also collapses the file, since there is no fine detail left to encode —
 * 1920px wide lands at 95 KB.
 *
 * `background-attachment` is deliberately not `fixed`: it janks badly on iOS
 * and is ignored outright in several mobile browsers.
 */
export function ExperienceBand(): JSX.Element {
  return (
    <section className={styles.band} aria-labelledby="experience-heading">
      <div className={styles.media} aria-hidden="true" />
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.inner}>
        <h2 className={styles.headline} id="experience-heading">
          Meníme zážitok u zubára a vraciame vám sebavedomie.
        </h2>
      </div>
    </section>
  );
}
