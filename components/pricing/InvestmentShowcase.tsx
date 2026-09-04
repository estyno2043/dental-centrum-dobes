"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties, type JSX } from "react";
import { IconArrowNarrowRight } from "@tabler/icons-react";

import { allServices } from "@/components/services/servicesContent";
import { useServiceTransition } from "@/components/services/useServiceTransition";
import { investmentIntro, slides } from "./investmentContent";
import { priceGroups } from "./pricingContent";
import styles from "./investment.module.css";

const entryCount = priceGroups.reduce(
  (sum, group) => sum + group.entries.length,
  0,
);

/**
 * The homepage's closing section: one service at a time, over a photograph
 * that changes with it.
 *
 * A tall section with a sticky stage inside it. One number reaches the DOM —
 * `--slide`, how far through the run the reader is, in slide units — and CSS
 * derives every background's opacity and every panel's from it. Same approach
 * as the team section and the drifting scene, and for the same reason: a
 * scroll listener can be measured in this project's preview environment, and
 * scroll-driven CSS animations cannot.
 *
 * The card in the middle is the catalogue's card, not a copy of it: same link,
 * same `data-service-photo` frame, same `openService`, so clicking it flies
 * the photograph into the service page exactly as it does in Služby. Two cards
 * that looked alike but behaved differently would be worse than none.
 *
 * With one slide this is a still scene, which is the point — the machinery is
 * here so the second slide is an entry in `investmentContent`, not a rebuild.
 */
export function InvestmentShowcase(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const openService = useServiceTransition();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const update = () => {
      const rect = section.getBoundingClientRect();
      /*
       * How far the sticky stage has travelled, in slides. The section is a
       * viewport taller than its slides, and the last viewport is the stage
       * standing still on the final slide before the page moves on.
       */
      const travel = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      const position = progress * Math.max(0, slides.length - 1);
      section.style.setProperty("--slide", String(position));

      /*
       * Only the slide being read may be clicked. Opacity hides the others but
       * leaves them catching the pointer, so a link nobody can see would still
       * be sitting on top of the one they are looking at. CSS cannot compare
       * `--slide` to an index for `pointer-events`, so the nearest one is
       * marked here instead.
       */
      const nearest = Math.round(position);
      for (const [index, node] of section
        .querySelectorAll<HTMLElement>("[data-slide]")
        .entries()) {
        node.dataset.active = String(index === nearest);
      }
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
    <section
      aria-labelledby="investment-heading"
      className={styles.section}
      data-header-mode="dark"
      id="cennik"
      ref={sectionRef}
      style={{ "--count": slides.length } as CSSProperties}
    >
      {/*
       * Backgrounds stacked and cross-faded. Decorative: everything the
       * photographs say is said in words beside them.
       */}
      <div aria-hidden="true" className={styles.backdrop}>
        {slides.map((slide, index) => (
          <div
            className={styles.backdropLayer}
            key={slide.slug}
            style={{ "--index": index } as CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- Pre-cropped clinic asset. */}
            <img
              alt=""
              decoding="async"
              sizes="100vw"
              src={`/media/${slide.background}.webp`}
              srcSet={
                `/media/${slide.background}-mobile.webp 1100w, ` +
                `/media/${slide.background}.webp 2200w`
              }
            />
          </div>
        ))}
        <span className={styles.scrim} />
      </div>

      <div className={styles.stage}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" className={styles.eyebrowRule} />
            {investmentIntro.eyebrow}
          </p>
          <h2 className={styles.headline} id="investment-heading">
            {investmentIntro.headline}
          </h2>
          <p className={styles.lead}>{investmentIntro.lead}</p>
        </header>

        <div className={styles.slides}>
          {slides.map((slide, index) => {
            const service = allServices.find((s) => s.slug === slide.slug);
            const href = `/sluzby/${slide.slug}`;

            return (
              <article
                className={styles.slide}
                data-slide
                key={slide.slug}
                style={{ "--index": index } as CSSProperties}
              >
                <div className={styles.name}>
                  <p className={styles.kicker}>{slide.kicker}</p>
                  <h3>{slide.title}</h3>
                </div>

                {/* The catalogue's own card, morph and all. */}
                <Link
                  className={styles.card}
                  href={href}
                  onClick={(event) => openService(event, href)}
                >
                  <span className={styles.frame} data-service-photo>
                    {service?.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element -- Pre-cropped 4:5 clinic asset. */
                      <img
                        alt=""
                        decoding="async"
                        height="1250"
                        sizes="(max-width: 1023px) 70vw, 26vw"
                        src={`/media/sluzby/${service.image}.webp`}
                        srcSet={`/media/sluzby/${service.image}-mobile.webp 500w, /media/sluzby/${service.image}.webp 1000w`}
                        width="1000"
                      />
                    ) : null}
                  </span>

                  <span aria-hidden="true" className={styles.cardIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {/* Decorative: the link's text is the service name below. */}
                  <span aria-hidden="true" className={styles.cardArrow}>
                    <svg viewBox="0 0 24 24">
                      <path d="M6 18 L18 6 M9 6 h9 v9" />
                    </svg>
                  </span>

                  <span className={styles.cardBody}>
                    <span className={styles.cardName}>{service?.name}</span>
                    <span className={styles.cardLead}>{service?.lead}</span>
                  </span>
                </Link>

                <div className={styles.points}>
                  <ul>
                    {slide.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>

                  <p className={styles.price}>
                    {slide.price.was ? <s>{slide.price.was}</s> : null}
                    <strong>{slide.price.value}</strong>
                    <span>{slide.price.note}</span>
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <Link className={styles.more} href="/cennik">
          <span>Celý cenník — {entryCount} položiek</span>
          <IconArrowNarrowRight size={18} stroke={1.7} />
        </Link>
      </div>
    </section>
  );
}
