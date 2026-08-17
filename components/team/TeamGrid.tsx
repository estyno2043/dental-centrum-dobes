"use client";

import { useEffect, useRef, type JSX } from "react";
import { teamMembers } from "./teamContent";
import styles from "./team.module.css";

/**
 * The team grid.
 *
 * Two columns of portraits where only the left one travels: as the reader
 * scrolls, it rises past the right column so the two never line up for long.
 * The reference site does the same thing, and it works because it gives a
 * plain list of headshots a current without asking anyone to interact with it.
 *
 * One number reaches the DOM — `--p`, how far the grid has crossed the
 * viewport — and CSS does the rest, so the cost per scroll frame is a single
 * custom-property write no matter how many people are on the page. Same
 * approach as the drifting-photograph scene, and for the same reason: a scroll
 * listener can be measured in this project's preview environment, while
 * scroll-driven animations and IntersectionObserver could not be.
 */
export function TeamGrid(): JSX.Element {
  const gridRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const reduced = globalThis.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return; // the stylesheet leaves both columns at rest

    const update = () => {
      const rect = grid.getBoundingClientRect();

      /*
       * 0 when the grid's top edge is still at the bottom of the screen, 1
       * once its bottom edge has risen to the top — the span over which any
       * part of it is visible. Measured against that rather than the grid's
       * own height so a tall grid and a short one drift at the same rate.
       */
      const span = rect.height + window.innerHeight;
      const travelled = window.innerHeight - rect.top;
      grid.style.setProperty(
        "--p",
        String(Math.min(1, Math.max(0, travelled / span))),
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
    <ul className={styles.grid} ref={gridRef}>
      {teamMembers.map((member) => (
        <li className={styles.member} key={member.slug}>
          <div className={styles.frame}>
            {/* eslint-disable-next-line @next/next/no-img-element -- Pre-cropped 4:5 portrait; the image service adds nothing here. */}
            <img
              alt={member.name}
              className={styles.portrait}
              decoding="async"
              height="1700"
              sizes="(max-width: 767px) 100vw, 46vw"
              src={`/media/tim/${member.slug}.webp`}
              srcSet={`/media/tim/${member.slug}-mobile.webp 680w, /media/tim/${member.slug}.webp 1360w`}
              width="1360"
            />
          </div>
          <div className={styles.info}>
            <h2 className={styles.name}>{member.name}</h2>
            {/*
             * Rendered only where the clinic states a role. Seven of the
             * eleven are published by the clinic with a degree and nothing
             * else, and a guessed job title on a real medical professional is
             * not a placeholder — it is a false claim.
             */}
            {member.role ? <p className={styles.role}>{member.role}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
