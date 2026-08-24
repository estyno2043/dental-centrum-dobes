"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { JSX } from "react";

import { teamMembers } from "./teamContent";
import styles from "./teamPreview.module.css";

const premiumEase = [0.22, 1, 0.36, 1] as const;

/**
 * Four faces on the homepage, with the whole roster a click away on `/tim`.
 *
 * Deliberately not `TeamSection`. That one is the full eleven with its own
 * scroll-driven colour and drift — the right thing when the team is the
 * subject of the page, too much when it is one section of a homepage that
 * already asks a lot of the reader.
 *
 * The four are picked by slug from the clinic's own roster and carry only
 * their names. No role is shown here even where one exists: the four in this
 * preview are the ones the clinic publishes with a degree and no stated role,
 * and a homepage is the last place to start guessing at job titles.
 */
const PREVIEW_SLUGS = ["dobes", "dobesova", "kunova", "novotnakova"] as const;

const preview = PREVIEW_SLUGS.map((slug) => {
  const member = teamMembers.find((candidate) => candidate.slug === slug);
  if (!member) throw new Error(`Unknown team slug in preview: ${slug}`);
  return member;
});

export function TeamPreview(): JSX.Element {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const rise = prefersReducedMotion ? 0 : 26;

  return (
    <section
      aria-labelledby="team-preview-heading"
      className={styles.section}
      data-header-mode="light"
    >
      {/*
       * Motion renders the hidden half of these variants server-side, so a
       * page whose script never runs would ship a section at `opacity: 0`.
       * The team grid solves the same problem by defaulting to its settled
       * state in CSS; this reveal cannot, because the inline style wins — so
       * the no-script case overrides it explicitly rather than shipping an
       * invisible section.
       */}
      <noscript>
        <style>{`.${styles.section} [style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style>
      </noscript>
      <motion.div
        className={styles.inner}
        initial="hidden"
        viewport={{ once: true, amount: 0.25 }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              delayChildren: prefersReducedMotion ? 0 : 0.05,
              staggerChildren: prefersReducedMotion ? 0 : 0.08,
            },
          },
        }}
        whileInView="visible"
      >
        <motion.header
          className={styles.intro}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: premiumEase }}
          variants={{
            hidden: { opacity: 0, y: rise },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <p className={styles.eyebrow}>
            <span aria-hidden="true" className={styles.eyebrowRule} />
            Tím
          </p>
          <h2 className={styles.headline} id="team-preview-heading">
            Ľudia, ktorým môžete dôverovať.
          </h2>
          <p className={styles.lead}>
            U nás viete, kto sa o vás postará. Jedenásť ľudí, ktorých spoznáte
            po mene ešte predtým, než si sadnete do kresla.
          </p>
        </motion.header>

        <ul className={styles.grid}>
          {preview.map((member) => (
            <motion.li
              className={styles.member}
              key={member.slug}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: premiumEase }}
              variants={{
                hidden: { opacity: 0, y: rise },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className={styles.frame}>
                {/* eslint-disable-next-line @next/next/no-img-element -- Pre-cropped 4:5 portrait; the image service adds nothing here. */}
                <img
                  alt={member.name}
                  className={styles.portrait}
                  decoding="async"
                  height="1700"
                  loading="lazy"
                  sizes="(max-width: 767px) 44vw, 22vw"
                  src={`/media/tim/${member.slug}.webp`}
                  srcSet={`/media/tim/${member.slug}-mobile.webp 680w, /media/tim/${member.slug}.webp 1360w`}
                  width="1360"
                />
              </div>
              <p className={styles.name}>{member.name}</p>
            </motion.li>
          ))}
        </ul>

        <motion.div
          className={styles.ctaRow}
          transition={{ duration: prefersReducedMotion ? 0 : 0.55, ease: premiumEase }}
          variants={{
            hidden: { opacity: 0, y: rise },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <Link className={styles.cta} href="/tim">
            Spoznajte celý tím
            <span aria-hidden="true">→</span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
