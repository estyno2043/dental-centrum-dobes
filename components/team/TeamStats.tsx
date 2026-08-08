import type { CSSProperties, JSX } from "react";
import { teamStats } from "./teamContent";
import styles from "./team.module.css";

/**
 * The credentials strip.
 *
 * Deliberately not a count-up. Two of these figures are a price and a minimum
 * treatment age, and animating them from zero puts "od 0 r." and a wrong fee
 * on screen for the length of the animation — a clinic page should not state
 * something untrue, however briefly, for an effect. The reveal is a CSS
 * scroll-driven animation instead, so the numbers are correct on first paint
 * and the section needs no JavaScript at all.
 */
export function TeamStats(): JSX.Element {
  return (
    <div className={styles.stats}>
      {teamStats.map((stat, index) => (
        <div
          className={styles.stat}
          key={stat.label}
          style={{ "--stat-index": index } as CSSProperties}
        >
          <span className={styles.statValue}>
            {"prefix" in stat ? stat.prefix : null}
            {stat.value}
            {"suffix" in stat ? stat.suffix : null}
          </span>
          <span className={styles.statLabel}>{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
