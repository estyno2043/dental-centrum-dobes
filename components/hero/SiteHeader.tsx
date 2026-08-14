"use client";

/* eslint-disable jsx-a11y/anchor-is-valid -- Destinations stay as approved placeholders until their sections exist. */
/* eslint-disable @next/next/no-img-element -- Preserve the approved logo markup and extracted asset without an image-service rewrite. */

import { useEffect, useState, type JSX } from "react";
import { MobileMenu } from "./MobileMenu";
import { navigationItems } from "./heroContent";
import styles from "./hero.module.css";

/**
 * The fixed site header.
 *
 * Deliberately **not** rendered inside the hero. `position: sticky` creates a
 * stacking context whatever its z-index, so a fixed header nested inside the
 * pinned hero layer was confined to that context — its `z-index: 50` ranked
 * only among the hero's own children, and every section further down the page
 * painted straight over it. Rendering it as a sibling of the slide stack puts
 * it back in the root stacking context, where a fixed header belongs.
 */
/** Roughly the header's own height — the band it actually covers. */
const HEADER_BAND = 104;

export function SiteHeader(): JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const [onLight, setOnLight] = useState(false);
  const [onHero, setOnHero] = useState(true);

  /*
   * One listener drives both states.
   *
   * The header takes a background only where it would otherwise be white type
   * on a light section. Sections ask for that themselves through
   * `data-header-light`, so the header never has to know which section is
   * which and the next light one needs no change here.
   *
   * Deliberately not an IntersectionObserver, which would express this more
   * directly: measuring the rect in the scroll handler is a few lines more,
   * but it can be verified, and an observer that silently never fires would
   * leave white type on greige with nothing to show for it.
   */
  useEffect(() => {
    const lightSections = Array.from(
      document.querySelectorAll("[data-header-light]"),
    );

    const update = () => {
      setIsScrolled(window.scrollY > 40);
      setOnLight(
        lightSections.some((section) => {
          const rect = section.getBoundingClientRect();
          return rect.top < HEADER_BAND && rect.bottom > 0;
        }),
      );

      /*
       * Measured against scroll position rather than the hero's own rect: the
       * hero sits in a sticky layer, so its box stays pinned at the top of the
       * screen right through the statement and the clinic story, and asking
       * where it is would keep this true for most of the page.
       */
      setOnHero(window.scrollY < window.innerHeight * 0.8);
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
    <nav
      aria-label="Hlavná navigácia"
      className={[
        styles.navigation,
        isScrolled ? styles.scrolled : "",
        onLight ? styles.onLight : "",
        onHero ? styles.onHero : "",
      ]
        .filter(Boolean)
        .join(" ")}
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
            <a href={item.href} key={item.label}>
              {item.label}
            </a>
          ))}
        </div>
        <a className={styles.navigationButton} href="#">
          <span className={styles.tourRing} aria-hidden="true" />
          Interaktívna prehliadka klinikou
        </a>
        <MobileMenu />
      </div>
    </nav>
  );
}
