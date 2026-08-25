"use client";

/* eslint-disable jsx-a11y/anchor-is-valid -- Destinations stay as approved placeholders until their sections exist. */
/* eslint-disable @next/next/no-img-element -- Preserve the approved logo markup and extracted asset without an image-service rewrite. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type JSX } from "react";
import { BackButton, PREVIOUS_KEY } from "./BackButton";
import { DesktopMenu } from "./DesktopMenu";
import { MobileMenu } from "./MobileMenu";
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

type SiteHeaderProps = Readonly<{
  /**
   * What the page knows about itself before anything has been measured.
   *
   * The mode is normally read off the section under the header, which cannot
   * happen until after the first paint — and on a page that is `quiet` from
   * top to bottom that means one frame of the wrong header. A page that knows
   * says so.
   */
  initialMode?: "none" | "light" | "minimal" | "quiet";
}>;

export function SiteHeader({
  initialMode = "none",
}: SiteHeaderProps = {}): JSX.Element {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mode, setMode] = useState<"none" | "light" | "minimal" | "quiet">(
    initialMode,
  );

  /*
   * Remembers the page the reader was on before this one, so the back control
   * knows whether it has anywhere of ours to return to. Written on every route
   * change; read only by `BackButton`.
   */
  useEffect(() => {
    try {
      const current = window.sessionStorage.getItem("dobes:current-path");
      if (current && current !== pathname) {
        window.sessionStorage.setItem(PREVIOUS_KEY, current);
      }
      window.sessionStorage.setItem("dobes:current-path", pathname ?? "/");
    } catch {
      // Storage can be refused; the back control then falls back to home.
    }
  }, [pathname]);
  const [onHero, setOnHero] = useState(true);

  /*
   * One listener drives the whole header.
   *
   * Sections declare how they want it through `data-header-mode`, so the
   * header never has to know which section is which:
   *
   *   light    a taupe bar with the full link row, for pale sections where
   *            white type would otherwise be unreadable
   *   minimal  no bar and no links — the logo and the tour button alone, the
   *            way the hero carries them
   *   quiet    the mark on its own. For pages that carry their own call to
   *            action, where a second one in the corner competes with it
   *
   * Deliberately not an IntersectionObserver, which would express this more
   * directly: measuring the rect in the scroll handler is a few lines more,
   * but it can be verified, and an observer that silently never fires would
   * leave white type on greige with nothing to show for it.
   */
  useEffect(() => {
    const zones = Array.from(document.querySelectorAll("[data-header-mode]"));

    const update = () => {
      setIsScrolled(window.scrollY > 40);

      const covering = zones.find((zone) => {
        const rect = zone.getBoundingClientRect();
        return rect.top < HEADER_BAND && rect.bottom > 0;
      });
      const declared = covering?.getAttribute("data-header-mode");
      setMode(
        declared === "light" || declared === "minimal" || declared === "quiet"
          ? declared
          : "none",
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
    <>
      <nav
        aria-label="Hlavná navigácia"
        className={[
          styles.navigation,
          isScrolled ? styles.scrolled : "",
          mode === "light" ? styles.onLight : "",
          mode === "minimal" || mode === "quiet" ? styles.onMinimal : "",
          mode === "quiet" ? styles.onQuiet : "",
          onHero ? styles.onHero : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Home, not "#" — the header appears on subpages now, where the mark
            is the only way back. */}
        <Link className={styles.logo} href="/">
          <img
            src="/media/dobes-logo-white.png"
            alt="Dental Centrum Dobeš"
            width="900"
            height="381"
          />
          <span className={styles.tagline}>
            Súkromná zubná klinika pri Kramároch v&nbsp;Bratislave
          </span>
        </Link>

        <div className={styles.navigationRight}>
          <a className={styles.navigationButton} href="#">
            <span className={styles.tourRing} aria-hidden="true" />
            Interaktívna prehliadka klinikou
          </a>
          <MobileMenu />
        </div>
      </nav>
      {/*
        On a service page the menu gives way to the way back. Those pages are
        somewhere the reader arrived *from* something, and returning them to
        the exact spot they left is worth more than a list of four links they
        have already seen.
      */}
      {mode === "quiet" ? (
        <BackButton
          ground={mode === "quiet" ? "light" : "dark"}
          scrolled={isScrolled}
        />
      ) : (
        <DesktopMenu
          ground={mode === "none" && onHero ? "dark" : "light"}
          scrolled={isScrolled}
        />
      )}
    </>
  );
}
