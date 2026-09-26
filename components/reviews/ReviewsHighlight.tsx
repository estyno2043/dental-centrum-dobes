import type { JSX } from "react";
import { IconArrowNarrowRight, IconStarFilled } from "@tabler/icons-react";

import { GoogleMark } from "./GoogleMark";
import { ReviewsTrigger } from "./ReviewsTrigger";
import {
  googleProfileUrl,
  highlightedReviewIds,
  reviewSummary,
  reviews,
} from "./reviewsContent";
import styles from "./reviewsHighlight.module.css";

const highlighted = highlightedReviewIds
  .map((id) => reviews.find((review) => review.id === id))
  .filter((review) => review !== undefined);

function Stars({ count }: { readonly count: number }): JSX.Element {
  return (
    <span aria-label={`${count} z 5 hviezdičiek`} className={styles.stars} role="img">
      {Array.from({ length: 5 }, (_, i) => (
        <IconStarFilled aria-hidden="true" data-on={i < count} key={i} size={15} />
      ))}
    </span>
  );
}

/**
 * "Čo hovoria pacienti": three Google reviews in full on the homepage.
 *
 * Sits directly after the before/after cases, on the same ground so the two
 * read as one argument: the photographs, then the people in them talking.
 * The fifteen reviews were all behind the hero's rating until 2026-09-26;
 * three now show without a click, and the button opens the rest in the same
 * bar the rating opens.
 *
 * Every review is shown whole and verbatim, attributed as Google prints it,
 * with the initial for an avatar; see `reviewsContent.ts` for why.
 */
export function ReviewsHighlight(): JSX.Element {
  return (
    <section
      aria-labelledby="reviews-heading"
      className={styles.section}
      data-header-mode="light"
    >
      <div className={styles.inner}>
        <header className={styles.head}>
          <div>
            <p className={styles.eyebrow}>
              <span aria-hidden="true" className={styles.eyebrowRule} />
              Recenzie
            </p>
            <h2 className={styles.headline} id="reviews-heading">
              Čo hovoria pacienti
            </h2>
          </div>

          <div className={styles.score}>
            <span className={styles.google}>
              <GoogleMark />
            </span>
            <span className={styles.scoreValue}>{reviewSummary.average}</span>
            <span className={styles.scoreMeta}>
              <Stars count={5} />
              <span>{reviewSummary.countLabel} na Google</span>
            </span>
          </div>
        </header>

        <ul className={styles.cards}>
          {highlighted.map((review) => (
            <li className={styles.card} key={review.id}>
              <span aria-hidden="true" className={styles.quote}>
                „
              </span>
              <Stars count={review.rating} />
              <blockquote className={styles.text}>
                <p>{review.text}</p>
              </blockquote>
              <footer className={styles.author}>
                <span aria-hidden="true" className={styles.avatar}>
                  {review.author.trim().charAt(0).toUpperCase()}
                </span>
                <span>
                  <strong>{review.author}</strong>
                  <small>
                    {review.meta} · {review.date}
                  </small>
                </span>
              </footer>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <ReviewsTrigger className={styles.more}>
            Prečítať všetkých {reviews.length} recenzií
            <IconArrowNarrowRight aria-hidden="true" size={18} stroke={1.7} />
          </ReviewsTrigger>
          {googleProfileUrl ? (
            <a
              className={styles.googleLink}
              href={googleProfileUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Všetky recenzie na Google
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
