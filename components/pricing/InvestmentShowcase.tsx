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
      const raw = Math.min(1, Math.max(0, -rect.top / travel));

      /*
       * The first slide holds before anything moves.
       *
       * The section takes over the viewport the moment its top reaches the
       * top, and the header is still retracting at that point — so without a
       * hold the reader's first flick both hides the bar and swaps the
       * service, and the thing they arrived at is gone before they have read
       * it. One viewport of the travel is spent standing still; only after
       * that does the run begin.
       */
      const steps = Math.max(0, slides.length - 1);
      const hold = steps > 0 ? 1 / slides.length : 1;

      /*
       * `--intro` is that first viewport, 0 to 1. The headline arrives at full
       * size and shrinks across it while the photograph grows — so the hold is
       * not dead scrolling but the section settling into itself, and by the
       * time the run begins the reader is looking at the work rather than at
       * the title.
       */
      section.style.setProperty(
        "--intro",
        String(Math.min(1, Math.max(0, raw / hold))),
      );

      const position =
        steps > 0 ? Math.max(0, (raw - hold) / (1 - hold)) * steps : 0;
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
          {/*
            The names cross-fade in place. Only the photographs travel — moving
            three things at once turns a transition into a scene change, and
            the reader loses which of them they were reading.
          */}
          <div className={styles.column}>
            {slides.map((slide, index) => (
              <div
                className={styles.name}
                key={slide.slug}
                style={{ "--index": index } as CSSProperties}
              >
                <p className={styles.kicker}>{slide.kicker}</p>
                <h3>{slide.title}</h3>
              </div>
            ))}
          </div>

          {/*
            The filmstrip: one window, a column of cards behind it, translated
            by whole windows. The current photograph rises out of the top as
            the next one comes up from below — the movement is what says the
            run has advanced, which is why nothing else moves.
          */}
          <div className={styles.filmstrip}>
            <div className={styles.track}>
              {slides.map((slide, index) => {
                const service = allServices.find((s) => s.slug === slide.slug);
                const href = `/sluzby/${slide.slug}`;
                /*
                 * A slide is a treatment; a service page can hold several. The
                 * override is what stops a whitening slide carrying the whole
                 * aesthetics page's name and photograph.
                 */
                const card = slide.card ?? {
                  image: service?.image ?? "",
                  name: service?.name ?? "",
                  lead: service?.lead ?? "",
                };

                return (
                  <Link
                    className={styles.card}
                    data-slide
                    href={href}
                    key={slide.slug}
                    onClick={(event) => openService(event, href)}
                  >
                    <span className={styles.frame} data-service-photo>
                      {card.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element -- Pre-cropped 4:5 clinic asset. */
                        <img
                          alt=""
                          decoding="async"
                          height="1250"
                          sizes="(max-width: 1023px) 70vw, 26vw"
                          src={`/media/sluzby/${card.image}.webp`}
                          srcSet={`/media/sluzby/${card.image}-mobile.webp 500w, /media/sluzby/${card.image}.webp 1000w`}
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
                      <span className={styles.cardName}>{card.name}</span>
                      <span className={styles.cardLead}>{card.lead}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className={styles.column}>
            {slides.map((slide, index) => (
              <div
                className={styles.points}
                key={slide.slug}
                style={{ "--index": index } as CSSProperties}
              >
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
            ))}
          </div>
        </div>

        {/*
          Where the reader is in the run. A section that holds the viewport
          owes them that — without it there is no way to tell how much of the
          page is still this one.
        */}
        {slides.length > 1 ? (
          <p aria-hidden="true" className={styles.counter}>
            {slides.map((slide, index) => (
              <span
                className={styles.tick}
                key={slide.slug}
                style={{ "--index": index } as CSSProperties}
              />
            ))}
          </p>
        ) : null}

        <Link className={styles.more} href="/cennik">
          <span>Celý cenník — {entryCount} položiek</span>
          <IconArrowNarrowRight size={18} stroke={1.7} />
        </Link>
      </div>
    </section>
  );
}
