"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties, type JSX } from "react";

import {
  featuredServices,
  furtherServices,
  servicesIntro,
} from "./servicesContent";
import styles from "./services.module.css";

/**
 * "Služby" — the homepage's catalogue, between the drifting photographs and
 * the team.
 *
 * Five cards carry a photograph and lead; five more are a list underneath. The
 * split is the point: giving all ten the same weight turns the section into a
 * price list, and the clinic is known for a handful of these, not for all of
 * them equally.
 *
 * One value reaches the DOM — `--enter`, the section's approach — and CSS
 * derives the ground's crossing, the intro's arrival and each card's staggered
 * reveal from it plus the card's own index. Same approach as the team section
 * and the drifting scene: a scroll listener, because it can be measured in
 * this project's preview environment where scroll-driven animations could not.
 */
export function ServicesSection(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = globalThis.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return; // the stylesheet's defaults are already the rest state

    const update = () => {
      const rect = section.getBoundingClientRect();
      section.style.setProperty(
        "--enter",
        String(Math.min(1, Math.max(0, 1 - rect.top / window.innerHeight))),
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
    /*
     * `data-header-mode="light"` — the section is pale and the header's only
     * logo asset is white, so it needs its bar here.
     */
    <section
      aria-labelledby="services-heading"
      className={styles.section}
      data-header-mode="light"
      ref={sectionRef}
    >
      <header className={styles.intro}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowRule} aria-hidden="true" />
          {servicesIntro.eyebrow}
        </p>
        <h2 className={styles.headline} id="services-heading">
          {servicesIntro.headline}
        </h2>
        <p className={styles.lead}>{servicesIntro.lead}</p>
      </header>

      <ul className={styles.grid}>
        {featuredServices.map((service, index) => (
          <li
            className={index === 0 ? styles.feature : styles.card}
            key={service.slug}
            style={{ "--index": index } as CSSProperties}
          >
            <Link className={styles.cardLink} href={`/sluzby/${service.slug}`}>
              <span className={styles.frame}>
                {/* eslint-disable-next-line @next/next/no-img-element -- Pre-cropped 4:5 clinic asset; the image service adds nothing here. */}
                <img
                  alt=""
                  className={styles.photo}
                  decoding="async"
                  height="1250"
                  sizes="(max-width: 767px) 100vw, (max-width: 1099px) 46vw, 30vw"
                  src={`/media/sluzby/${service.image}.webp`}
                  srcSet={`/media/sluzby/${service.image}-mobile.webp 500w, /media/sluzby/${service.image}.webp 1000w`}
                  width="1000"
                />
              </span>

              <span aria-hidden="true" className={styles.index}>
                {String(index + 1).padStart(2, "0")}
              </span>

              {/*
                Decorative. The link's own text is the service name below, so
                announcing an arrow here would only repeat it.
              */}
              <span aria-hidden="true" className={styles.arrow}>
                <svg viewBox="0 0 24 24">
                  <path d="M6 18 L18 6 M9 6 h9 v9" />
                </svg>
              </span>

              <span className={styles.cardBody}>
                <span className={styles.name}>{service.name}</span>
                <span className={styles.cardLead}>{service.lead}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/*
        The other five. A list rather than five more cards: they matter, but
        not equally, and photographs the clinic has not shot yet would be
        filler standing in for a decision.

        The wrapper exists to carry the white: the cream ground runs from the
        section's top down to here and stops on the edge of the sixth service,
        so the five with photographs and the five without stand on visibly
        different ground.
      */}
      <div className={styles.furtherWrap}>
        <ul className={styles.further}>
          {furtherServices.map((service, index) => (
            <li key={service.slug} style={{ "--index": index } as CSSProperties}>
              <Link className={styles.row} href={`/sluzby/${service.slug}`}>
                <span aria-hidden="true" className={styles.rowIndex}>
                  {String(featuredServices.length + index + 1).padStart(2, "0")}
                </span>
                <span className={styles.rowName}>{service.name}</span>
                <span className={styles.rowLead}>{service.lead}</span>
                <span aria-hidden="true" className={styles.rowArrow}>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
