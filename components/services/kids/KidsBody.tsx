import type { JSX } from "react";
import { IconArrowNarrowRight } from "@tabler/icons-react";

import { cost, opening, story, worries } from "./kidsContent";
import styles from "./kids.module.css";

/**
 * The body of `/sluzby/osetrenie-deti`.
 *
 * The one service page that leaves the taupe and charcoal behind. It keeps the
 * site's typography and its structure, so it still reads as the same clinic,
 * and changes the palette and the shapes: soft pink and blue, rounder corners,
 * more air, a dotted trail down the chapters.
 *
 * The chapter list is the page. Every other service page explains a procedure;
 * this one walks a parent through a first visit twice at once, once in the
 * words a child hears and once in the words a parent needs, side by side. That
 * pairing is the whole idea and it is why this page is shaped differently
 * rather than merely coloured differently.
 *
 * ⚠️ Decorative shapes are `aria-hidden` and carry no meaning. There is no
 * photography of children on this page and none is coming: the clinic has
 * none, and a stock child in a dental chair is exactly the note this page must
 * not hit.
 */
export function KidsBody(): JSX.Element {
  return (
    <>
      {/* --- the promise a parent is looking for -------------------------- */}
      <section aria-labelledby="opening-heading" className={styles.opening}>
        <span aria-hidden="true" className={styles.blob} />
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
      </section>

      {/* --- the visit, told twice at once -------------------------------- */}
      <section aria-labelledby="story-heading" className={styles.story}>
        <h2 className={styles.sectionHeading} id="story-heading">
          {story.heading}
        </h2>
        <p className={styles.lead}>{story.lead}</p>

        <ol className={styles.chapters}>
          {story.chapters.map((chapter, index) => (
            <li key={chapter.title}>
              <span aria-hidden="true" className={styles.step}>
                {index + 1}
              </span>
              <div className={styles.chapterBody}>
                <h3>{chapter.title}</h3>
                <p className={styles.child}>{chapter.child}</p>
                <p className={styles.parent}>{chapter.parent}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* --- said out loud, not buried ------------------------------------ */}
      <section aria-labelledby="worries-heading" className={styles.worries}>
        <h2 className={styles.sectionHeading} id="worries-heading">
          {worries.heading}
        </h2>
        <ul className={styles.worryList}>
          {worries.items.map((item) => (
            <li key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* --- the money, and the way in ------------------------------------ */}
      <section aria-labelledby="cost-heading" className={styles.money}>
        <div className={styles.moneyInner}>
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
