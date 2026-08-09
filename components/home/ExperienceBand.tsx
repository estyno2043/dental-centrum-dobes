"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef, type JSX } from "react";
import { mapExperienceMotion } from "./scrollMotion";
import styles from "./experienceBand.module.css";

/**
 * Scroll-led statement scene between the hero and the clinic photo strip.
 *
 * Only this component clips its own statement surface. The section remains a
 * direct sibling of `PhotoStrip`, so the gallery's sticky positioning never
 * inherits an overflow or transformed containing block.
 */
export function ExperienceBand(): JSX.Element {
  const bandRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: bandRef,
    offset: ["start start", "end end"],
  });

  const clipPath = useTransform(
    scrollYProgress,
    (value) => mapExperienceMotion(value).clipPath,
  );
  const edgeInset = useTransform(
    scrollYProgress,
    (value) => mapExperienceMotion(value).edgeInset,
  );
  const edgeOpacity = useTransform(
    scrollYProgress,
    (value) => mapExperienceMotion(value).edgeOpacity,
  );
  const mediaScale = useTransform(
    scrollYProgress,
    (value) => mapExperienceMotion(value).mediaScale,
  );
  const copyOpacity = useTransform(
    scrollYProgress,
    (value) => mapExperienceMotion(value).copyOpacity,
  );
  const copyY = useTransform(
    scrollYProgress,
    (value) => mapExperienceMotion(value).copyY,
  );
  const storyScale = useTransform(
    scrollYProgress,
    (value) => mapExperienceMotion(value).storyScale,
  );
  const veilOpacity = useTransform(
    scrollYProgress,
    (value) => mapExperienceMotion(value).veilOpacity,
  );

  return (
    <section
      className={styles.band}
      ref={bandRef}
      aria-labelledby="experience-heading"
      style={{ pointerEvents: "none" }}
    >
      <div className={styles.pin}>
        <motion.div
          className={styles.storySurface}
          data-testid="statement-motion-surface"
          style={{
            clipPath: prefersReducedMotion
              ? "inset(0% 0% 0% 0% round 0px)"
              : clipPath,
          }}
        >
          <motion.div
            className={styles.storyContent}
            style={{ scale: prefersReducedMotion ? 1 : storyScale }}
          >
            <motion.div
              className={styles.media}
              aria-hidden="true"
              style={{ scale: prefersReducedMotion ? 1 : mediaScale }}
            />
            <div className={styles.scrim} aria-hidden="true" />

            <motion.div
              className={styles.inner}
              style={{
                opacity: prefersReducedMotion ? 1 : copyOpacity,
                y: prefersReducedMotion ? 0 : copyY,
              }}
            >
              <p className={styles.kicker}>Nový zážitok</p>
              <h2 className={styles.headline} id="experience-heading">
                Meníme zážitok u zubára a vraciame vám sebavedomie.
              </h2>
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.exitVeil}
            data-testid="statement-gradient-veil"
            aria-hidden="true"
            style={{ opacity: prefersReducedMotion ? 0 : veilOpacity }}
          />
        </motion.div>

        <motion.div
          className={styles.revealEdge}
          aria-hidden="true"
          style={
            prefersReducedMotion
              ? { opacity: 0 }
              : {
                  inset: edgeInset,
                  opacity: edgeOpacity,
                }
          }
        />
      </div>
    </section>
  );
}
