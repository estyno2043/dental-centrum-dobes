"use client";

/* eslint-disable jsx-a11y/anchor-is-valid -- The approved hero uses placeholder anchors until the corresponding sections exist. */
/* eslint-disable @next/next/no-img-element -- Preserve the approved logo markup and extracted asset without an image-service rewrite. */

import { useEffect, useState, type JSX } from "react";
import { RotatingHeadline } from "./RotatingHeadline";
import {
  headlineVariants,
  navigationItems,
  trustItems,
} from "./heroContent";
import { useMediaQuery } from "./useMediaQuery";
import styles from "./hero.module.css";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const wideViewportQuery = "(min-width: 768px)";

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
  const [isScrolled, setIsScrolled] = useState(false);
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

  useEffect(() => {
    const updateNavigation = () => setIsScrolled(window.scrollY > 40);

    updateNavigation();
    window.addEventListener("scroll", updateNavigation, { passive: true });

    return () => window.removeEventListener("scroll", updateNavigation);
  }, []);

  return (
    <>
      <nav
        aria-label="Hlavná navigácia"
        className={`${styles.navigation} ${isScrolled ? styles.scrolled : ""}`}
      >
        <a className={styles.logo} href="#">
          <img
            src="/media/dobes-logo-white.png"
            alt="Dental Centrum Dobeš"
            width="900"
            height="381"
          />
          <span className={styles.tagline}>
            Súkromná zubná klinika pri Kramároch v&nbsp;Bratislave
          </span>
        </a>

        <div className={styles.navigationRight}>
          <div className={styles.navigationLinks}>
            {navigationItems.map((item) => (
              <a href="#" key={item}>
                {item}
              </a>
            ))}
          </div>
          <a className={styles.navigationButton} href="#">
            Prehliadka kliniky
          </a>
        </div>
      </nav>

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
          <h1 className={styles.heading}>
            <span className={styles.headingLead}>Sme&nbsp;</span>
            <RotatingHeadline
              variants={headlineVariants}
              intervalMs={2600}
              finalHoldMs={4600}
            />
          </h1>
          <p className={styles.subheading}>
            Moderní. Bez bolesti. Bezpeční. S úsmevom na tvári.
          </p>

          <div className={styles.ctaRow}>
            <a className={styles.packageButton} href="#">
              Vstupný balík pre nových pacientov
            </a>
            <a className={styles.phoneButton} href="tel:+421918800002">
              <span className={styles.phoneLabel}>Objednajte sa</span>
              <span className={styles.phoneNumber}>0918 800 002</span>
            </a>
          </div>

          <div className={styles.trustStrip}>
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
          </div>
        </div>

        <div className={styles.scrollCue}>scrollujte</div>
      </header>
    </>
  );
}
