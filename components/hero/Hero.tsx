"use client";

/* eslint-disable @next/next/no-img-element -- Preserve the approved logo markup and extracted asset without an image-service rewrite. */

import Link from "next/link";
import { useState, type JSX } from "react";
import { motion } from "motion/react";
import { ReviewsBar } from "@/components/reviews/ReviewsBar";
import { RotatingHeadline } from "./RotatingHeadline";
import {
  headlineVariants,
  trustItems,
} from "./heroContent";
import { useMediaQuery } from "./useMediaQuery";
import styles from "./hero.module.css";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const wideViewportQuery = "(min-width: 768px)";
const premiumEase = [0.22, 1, 0.36, 1] as const;

/*
 * The tooth on the package button, drawn once and worn twice — filled
 * underneath, outlined on top. Tabler's `dental` path (MIT), taken as data
 * rather than as a component because the icon components render a stroked
 * `<svg>` of their own and this needs two layers inside one.
 */
const TOOTH_OUTLINE =
  "M12 5.5c-1.074 -.586 -2.583 -1.5 -4 -1.5c-2.1 0 -4 1.247 -4 5c0 4.899 " +
  "1.056 8.41 2.671 10.537c.573 .756 1.97 .521 2.567 -.236c.398 -.505 .819 " +
  "-1.439 1.262 -2.801c.292 -.771 .892 -1.504 1.5 -1.5c.602 0 1.21 .737 1.5 " +
  "1.5c.443 1.362 .864 2.295 1.262 2.8c.597 .759 2 .993 2.567 .237c1.615 " +
  "-2.127 2.671 -5.637 2.671 -10.537c0 -3.74 -1.908 -5 -4 -5c-1.423 0 -2.92 " +
  ".911 -4 1.5";
/** The groove across the crown. Outline only — it is a line, not an edge. */
const TOOTH_GROOVE = "M12 5.5l3 1.5";

/**
 * Phones get the 720p encode: it is a third of the desktop file, and the
 * difference is invisible at that size. WebM leads because VP9 is meaningfully
 * smaller than H.264 here; the MP4 covers browsers that cannot play it.
 */
const wideSources = [
  { src: "/media/hero-1080.webm", type: "video/webm" },
  { src: "/media/hero-1080.mp4", type: "video/mp4" },
] as const;

const narrowSources = [
  { src: "/media/hero-720.mp4", type: "video/mp4" },
] as const;

export function Hero(): JSX.Element {
  const prefersReducedMotion = useMediaQuery(reducedMotionQuery, true);

  // Read once rather than subscribed: following the breakpoint would restart
  // the video and pull a second encode over the wire every time a phone is
  // rotated, which costs a visitor more than the sharper frame is worth. The
  // value never reaches the hydrated markup, because the server always renders
  // the poster instead of the video.
  const [isWideViewport] = useState(
    () => globalThis.matchMedia?.(wideViewportQuery).matches ?? false,
  );
  const sources = isWideViewport ? wideSources : narrowSources;

  const [reviewsOpen, setReviewsOpen] = useState(false);

  return (
    <>

      <header className={styles.hero} id="hero">
        {!prefersReducedMotion ? (
          <video
            key={isWideViewport ? "wide" : "narrow"}
            className={styles.backgroundMedia}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/media/hero-poster.jpg"
          >
            {sources.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
            Váš prehliadač nepodporuje video.
          </video>
        ) : (
          <img
            className={styles.backgroundMedia}
            src="/media/hero-poster.jpg"
            alt=""
            aria-hidden="true"
          />
        )}
        <div className={styles.scrim} />

        <div className={styles.content}>
          <motion.h1
            className={styles.heading}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.12, ease: premiumEase }}
          >
            <span className={styles.headingLead}>Sme&nbsp;</span>
            <RotatingHeadline
              variants={headlineVariants}
              intervalMs={2600}
              finalHoldMs={4600}
            />
          </motion.h1>
          <motion.p
            className={styles.subheading}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 0.26, ease: premiumEase }}
          >
            Moderní. Bez bolesti. Bezpeční. S úsmevom na tvári.
          </motion.p>

          <motion.div
            className={styles.ctaRow}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 0.4, ease: premiumEase }}
          >
            {/*
              The site's first call to action, and now it has somewhere to go:
              the entry examination page carries the package it names, itemised
              against the clinic's own price list.
            */}
            <Link className={styles.packageButton} href="/sluzby/vstupna-prehliadka">
              {/*
                The mark, in the same place the tour button keeps its ring and
                doing the job that button cannot: it says what is on the other
                end of the link. At rest it is a hairline tooth. Reach for the
                button and the enamel fills in from the roots up, arriving just
                behind the pill's own sweep.
              */}
              <span aria-hidden="true" className={styles.packageTooth}>
                <svg viewBox="0 0 24 24">
                  <clipPath id="package-tooth-fill">
                    <rect
                      className={styles.toothClip}
                      height="24"
                      width="24"
                      x="0"
                      y="0"
                    />
                  </clipPath>
                  <path
                    className={styles.toothBody}
                    clipPath="url(#package-tooth-fill)"
                    d={TOOTH_OUTLINE}
                  />
                  <path className={styles.toothOutline} d={TOOTH_OUTLINE} />
                  <path className={styles.toothOutline} d={TOOTH_GROOVE} />
                </svg>
              </span>
              <span className={styles.packageLabel}>
                Vstupný balík pre nových pacientov
              </span>
            </Link>
            <a className={styles.phoneButton} href="tel:+421918800002">
              <span className={styles.phoneLabel}>Objednajte sa</span>
              <span className={styles.phoneNumber}>0918 800 002</span>
            </a>
          </motion.div>

          <motion.div
            className={styles.trustStrip}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 0.54, ease: premiumEase }}
          >
            {trustItems.map((item) => {
              const body = (
                <>
                  <span className={styles.trustValue}>
                    {item.value}
                    {"accent" in item ? (
                      <i className={styles.trustAccent}>{item.accent}</i>
                    ) : null}
                  </span>
                  <span className={styles.trustLabel}>{item.label}</span>
                </>
              );

              /*
                Only the Google rating is interactive, and it becomes a real
                button rather than a clickable div — the rest of the strip is
                four facts and should keep reading as four facts.
              */
              return "reviews" in item ? (
                <button
                  aria-expanded={reviewsOpen}
                  className={`${styles.trustItem} ${styles.trustTrigger}`}
                  key={item.label}
                  onClick={() => setReviewsOpen((current) => !current)}
                  type="button"
                >
                  {body}
                  <span className={styles.trustHint} aria-hidden="true">
                    Čítať recenzie
                  </span>
                </button>
              ) : (
                <div className={styles.trustItem} key={item.label}>
                  {body}
                </div>
              );
            })}
          </motion.div>
        </div>

        <div className={styles.scrollCue}>scrollujte</div>
      </header>

      <ReviewsBar onClose={() => setReviewsOpen(false)} open={reviewsOpen} />
    </>
  );
}
