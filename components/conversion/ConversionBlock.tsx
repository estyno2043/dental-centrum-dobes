"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { JSX } from "react";

import { clinicPhone, entryExam } from "@/components/site/siteContent";
import styles from "./conversion.module.css";

const premiumEase = [0.22, 1, 0.36, 1] as const;

/**
 * The homepage's closing ask.
 *
 * A client component only because the reveal has to wait for the reader — this
 * sits at the foot of a long page, so an animation that ran on load would be
 * over before anyone reached it. `whileInView` with `once` is the whole reason
 * for the bundle; nothing else here needs state.
 *
 * Two routes out and a phone number, because the three ways people arrive at a
 * decision are different: some are ready to book, some still want to know what
 * is wrong with them, and some would rather just call.
 */
export function ConversionBlock(): JSX.Element {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const rise = prefersReducedMotion ? 0 : 22;

  return (
    <section
      aria-labelledby="conversion-heading"
      className={styles.section}
      data-header-mode="none"
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
        viewport={{ once: true, amount: 0.4 }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              delayChildren: prefersReducedMotion ? 0 : 0.05,
              staggerChildren: prefersReducedMotion ? 0 : 0.09,
            },
          },
        }}
        whileInView="visible"
      >
        <motion.p
          className={styles.eyebrow}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: premiumEase }}
          variants={{
            hidden: { opacity: 0, y: rise },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <span aria-hidden="true" className={styles.eyebrowRule} />
          Prvý krok
        </motion.p>

        <motion.h2
          className={styles.headline}
          id="conversion-heading"
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: premiumEase }}
          variants={{
            hidden: { opacity: 0, y: rise },
            visible: { opacity: 1, y: 0 },
          }}
        >
          Začnime tým, čo vás trápi.
        </motion.h2>

        <motion.div
          className={styles.actions}
          transition={{ duration: prefersReducedMotion ? 0 : 0.55, ease: premiumEase }}
          variants={{
            hidden: { opacity: 0, y: rise },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <Link className={styles.primary} href="/kontakt">
            {entryExam.cta}
          </Link>
          <Link className={styles.secondary} href="/problemy">
            Nájsť riešenie podľa problému
          </Link>
        </motion.div>

        <motion.div
          className={styles.phoneRow}
          transition={{ duration: prefersReducedMotion ? 0 : 0.55, ease: premiumEase }}
          variants={{
            hidden: { opacity: 0, y: rise },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <span className={styles.phoneLabel}>Alebo nám jednoducho zavolajte</span>
          <a className={styles.phoneNumber} href={clinicPhone.href}>
            {clinicPhone.label}
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
