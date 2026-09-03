import type { JSX } from "react";
import { teamMembers } from "./teamContent";
import styles from "./team.module.css";

type TeamGridProps = Readonly<{
  /** One level below the section's own headline. See `TeamSection`. */
  nameLevel?: "h2" | "h3";
}>;

/**
 * The eleven portraits.
 *
 * A plain server component: everything that moves here is CSS reading `--p`,
 * which `TeamSection` writes on the ancestor. Custom properties inherit, so
 * the grid needs no state, no effect and no client bundle of its own.
 *
 * The left column travels while the right stays put, so the two slide past
 * each other as the reader scrolls — the reference site's move, and it gives a
 * list of headshots a current without asking anyone to interact with it.
 */
export function TeamGrid({ nameLevel = "h3" }: TeamGridProps = {}): JSX.Element {
  const Name = nameLevel;

  return (
    <ul className={styles.grid}>
      {teamMembers.map((member, index) => (
        <li className={styles.member} key={member.slug}>
          {/*
           * The portrait is rendered twice, held-back and full colour, and the
           * scroll position cross-fades between them.
           *
           * It used to be one image with `filter: grayscale()` interpolated
           * per scroll frame. That repainted a full-width photograph on every
           * frame for all eleven cards. Two layers cost one decode — the `src`
           * and `srcSet` are identical, so the browser reuses the same
           * bitmap — each layer's filter is constant and therefore painted
           * once and cached, and the only thing scrolling changes is the top
           * layer's `opacity`, which the compositor handles without repainting
           * either.
           */}
          <div className={styles.frame}>
            {/* eslint-disable-next-line @next/next/no-img-element -- Pre-cropped 4:5 portrait; the image service adds nothing here. */}
            <img
              alt={member.name}
              className={styles.portraitHeld}
              decoding="async"
              height="1700"
              sizes="(max-width: 767px) 100vw, 46vw"
              src={`/media/tim/${member.slug}.webp`}
              srcSet={`/media/tim/${member.slug}-mobile.webp 680w, /media/tim/${member.slug}.webp 1360w`}
              width="1360"
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- The same bitmap as above; see the note on this pair. */}
            <img
              alt=""
              aria-hidden="true"
              className={styles.portraitLit}
              decoding="async"
              height="1700"
              sizes="(max-width: 767px) 100vw, 46vw"
              src={`/media/tim/${member.slug}.webp`}
              srcSet={`/media/tim/${member.slug}-mobile.webp 680w, /media/tim/${member.slug}.webp 1360w`}
              width="1360"
            />
          </div>

          <div className={styles.info}>
            <div className={styles.nameRow}>
              <Name className={styles.name}>{member.name}</Name>
              {/*
               * Decorative, and marked as such: the count is already carried
               * by the list itself, so reading "zero one" before every name
               * would only add noise.
               */}
              <span aria-hidden="true" className={styles.index}>
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
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
