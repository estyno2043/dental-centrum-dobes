"use client";

/* eslint-disable @next/next/no-img-element -- Preserve the approved logo markup and extracted asset without an image-service rewrite. */

import Link from "next/link";
import { useState, type JSX } from "react";
import { motion } from "motion/react";
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
                Three lines, because the package has three parts — the
                examination, the intraoral images and the panoramic one. Closed
                they are a stack; on hover they fan out, which is the only
                thing the mark is for.
              */}
              <span aria-hidden="true" className={styles.packageMark}>
                <span />
                <span />
                <span />
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
            {trustItems.map((item) => (
              <div className={styles.trustItem} key={item.label}>
                <span className={styles.trustValue}>
                  {item.value}
                  {"accent" in item ? (
                    <i className={styles.trustAccent}>{item.accent}</i>
                  ) : null}
                </span>
                <span className={styles.trustLabel}>{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className={styles.scrollCue}>scrollujte</div>
      </header>
    </>
  );
}
