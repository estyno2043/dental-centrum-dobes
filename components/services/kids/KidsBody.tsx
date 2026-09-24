import type { JSX } from "react";
import { Fredoka } from "next/font/google";
import { IconArrowNarrowRight } from "@tabler/icons-react";

import {
  BrushAndPaste,
  IconCalm,
  IconChair,
  IconCount,
  IconNext,
  IconQuestion,
  IconTogether,
  StickerHeart,
  StickerSparkle,
  StickerStar,
  ToothBuddy,
} from "./KidsArt";
import { cost, opening, photos, story, worries } from "./kidsContent";
import styles from "./kids.module.css";

/*
 * A rounded display face for the headings only, loaded by this page alone.
 * Self-hosted through `next/font`, so no request leaves for Google, and with
 * `latin-ext` for the Slovak diacritics. Body text stays in the site's own
 * face: the parent is still the one reading it.
 */
const display = Fredoka({
  display: "swap",
  subsets: ["latin", "latin-ext"],
  variable: "--font-kids",
  weight: ["500", "600"],
});

/* One sticker per chapter of the visit, in the order of `story.chapters`. */
const CHAPTER_ICONS = [IconTogether, IconChair, IconCount, IconCalm, IconNext];
const STICKERS = [StickerStar, StickerHeart, StickerSparkle];

/**
 * The body of `/sluzby/osetrenie-deti`.
 *
 * Rebuilt on 2026-09-24 to feel like a page made for children: a cartoon
 * tooth waving with a toothbrush, the clinic's own photographs pinned up like
 * polaroids with stickers, four pastel colours taking turns down the page,
 * and a rounded face for the headings. The words underneath are unchanged and
 * still written for the parent.
 *
 * The chapter list is still the page. It walks a parent through a first visit
 * twice at once, once in the words a child hears (now a speech bubble) and
 * once in the words a parent needs.
 *
 * ⚠️ Every illustration is `aria-hidden` and carries no meaning. The
 * photographs show the clinic, never a child: the clinic has none.
 */
export function KidsBody(): JSX.Element {
  const kids = `${display.variable} ${styles.kids}`;

  return (
    <>
      {/* --- the promise, and the tooth that makes it ------------------- */}
      <section aria-labelledby="opening-heading" className={`${kids} ${styles.opening}`}>
        <span aria-hidden="true" className={styles.blob} />
        <div className={styles.openingText}>
          <h2 className={styles.openingHeading} id="opening-heading">
            {opening.heading}
          </h2>
          <p className={styles.openingBody}>{opening.body}</p>
          <dl className={styles.facts}>
            {opening.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <ToothBuddy className={styles.buddy} sparkleClassName={styles.twinkle} />
      </section>

      {/* --- the clinic, pinned up like polaroids ----------------------- */}
      <section aria-labelledby="photos-heading" className={`${kids} ${styles.photos}`}>
        <h2 className={styles.sectionHeading} id="photos-heading">
          {photos.heading}
        </h2>
        <ul className={styles.polaroids}>
          {photos.items.map((photo, index) => {
            const Sticker = STICKERS[index % STICKERS.length];
            return (
              <li key={photo.src}>
                <figure className={styles.polaroid}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- Pre-cropped clinic asset. */}
                  <img
                    alt={photo.alt}
                    decoding="async"
                    height={photos.height}
                    loading="lazy"
                    sizes="(max-width: 860px) 90vw, 22rem"
                    src={`/media/sluzby/${photo.src}.webp`}
                    srcSet={
                      `/media/sluzby/${photo.src}-mobile.webp ${photos.width / 2}w, ` +
                      `/media/sluzby/${photo.src}.webp ${photos.width}w`
                    }
                    width={photos.width}
                  />
                  <figcaption>{photo.caption}</figcaption>
                  <Sticker className={styles.sticker} />
                </figure>
              </li>
            );
          })}
        </ul>
      </section>

      {/* --- the visit, told twice at once ------------------------------ */}
      <section aria-labelledby="story-heading" className={`${kids} ${styles.story}`}>
        <h2 className={styles.sectionHeading} id="story-heading">
          {story.heading}
        </h2>
        <p className={styles.lead}>{story.lead}</p>

        <ol className={styles.chapters}>
          {story.chapters.map((chapter, index) => {
            const ChapterIcon = CHAPTER_ICONS[index % CHAPTER_ICONS.length];
            return (
              <li key={chapter.title}>
                <span aria-hidden="true" className={styles.step}>
                  {index + 1}
                </span>
                <div className={styles.chapterBody}>
                  <div className={styles.chapterText}>
                    <h3>{chapter.title}</h3>
                    <p className={styles.child}>{chapter.child}</p>
                    <p className={styles.parent}>{chapter.parent}</p>
                  </div>
                  <ChapterIcon className={styles.chapterIcon} />
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* --- said out loud, not buried ---------------------------------- */}
      <section aria-labelledby="worries-heading" className={`${kids} ${styles.worries}`}>
        <h2 className={styles.sectionHeading} id="worries-heading">
          {worries.heading}
        </h2>
        <ul className={styles.worryList}>
          {worries.items.map((item) => (
            <li key={item.question}>
              <IconQuestion className={styles.worryIcon} />
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* --- the money, and the way in ---------------------------------- */}
      <section aria-labelledby="cost-heading" className={`${kids} ${styles.money}`}>
        <div className={styles.moneyInner}>
          <BrushAndPaste className={styles.brush} />
          <h2 className={styles.sectionHeading} id="cost-heading">
            {cost.heading}
          </h2>
          <p className={styles.lead}>{cost.lead}</p>

          <ul className={styles.costItems}>
            {cost.items.map((item) => (
              <li key={item.label}>
                <div className={styles.costRow}>
                  <h3>{item.label}</h3>
                  <span className={styles.costPrice}>{item.price}</span>
                </div>
                {item.note ? <p>{item.note}</p> : null}
              </li>
            ))}
          </ul>

          <p className={styles.ctaText}>{cost.cta.text}</p>
          {/* A plain anchor to the booking form the shell already renders. */}
          <a className={styles.cta} href={cost.cta.href}>
            {cost.cta.label}
            <IconArrowNarrowRight size={18} stroke={1.8} aria-hidden="true" />
          </a>
        </div>
      </section>
    </>
  );
}
