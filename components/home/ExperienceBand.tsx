import type { JSX } from "react";
import styles from "./experienceBand.module.css";

/**
 * The statement band under the hero.
 *
 * A full-bleed blurred photograph of the surgery carries a single sentence,
 * following the reference the studio supplied — but on our own footage and
 * palette rather than a flat colour field. The band slides up over the pinned
 * hero; see `home.module.css` for that half.
 *
 * The photograph is blurred in the asset itself, not with a CSS filter. A
 * runtime `blur()` over a full-bleed background repaints on every scroll frame
 * and is one of the most expensive things a phone can be asked to do; baking it
 * also means the file compresses to a fraction of the size, since there is no
 * fine detail left to encode. 1920px wide lands at 95 KB.
 *
 * No JavaScript. The reveal is a CSS scroll-driven animation declared in the
 * stylesheet, which costs nothing per frame and — the deciding factor — leaves
 * the sentence visible if it never runs. A `motion`/`useScroll` version was
 * written and thrown away: it fails the other way round, holding the text at
 * `opacity: 0` when the script does not drive it.
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
