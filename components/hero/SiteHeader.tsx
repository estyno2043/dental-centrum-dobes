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
export function SiteHeader(): JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateNavigation = () => setIsScrolled(window.scrollY > 40);

    updateNavigation();
    window.addEventListener("scroll", updateNavigation, { passive: true });

    return () => window.removeEventListener("scroll", updateNavigation);
  }, []);

  return (
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
            <a href={item.href} key={item.label}>
              {item.label}
            </a>
          ))}
        </div>
        <a className={styles.navigationButton} href="#">
          Prehliadka kliniky
        </a>
        <MobileMenu />
      </div>
    </nav>
  );
}
