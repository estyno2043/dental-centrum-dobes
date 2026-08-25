"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from "@tabler/icons-react";

import { GoogleMark } from "./GoogleMark";
import {
  googleProfileUrl,
  reviewSummary,
  reviews,
  type Review,
} from "./reviewsContent";
import styles from "./reviews.module.css";

/*
 * Avatar colours, in the spirit of Google's own initial avatars. Picked by
 * summing the name so a given reviewer always gets the same one — a colour
 * that changed between visits would read as a different person.
 */
const AVATAR_COLOURS = [
  "#1a73e8",
  "#c5221f",
  "#e8710a",
  "#188038",
  "#7b1fa2",
  "#00796b",
] as const;

function avatarColour(name: string): string {
  let sum = 0;
  for (const character of name) sum += character.codePointAt(0) ?? 0;
  return AVATAR_COLOURS[sum % AVATAR_COLOURS.length]!;
}

/**
 * The reviewer's initial, with the Local Guide badge where Google shows one.
 *
 * An initial rather than their photograph. Re-hosting fifteen people's profile
 * pictures on the clinic's server publishes their likeness somewhere they
 * never put it, and the reviews read as real without it — this is Google's own
 * fallback for anyone who has not set a picture.
 */
function Avatar({ review }: { review: Review }): JSX.Element {
  return (
    <span
      aria-hidden="true"
      className={styles.avatar}
      style={{ background: avatarColour(review.author) }}
    >
      {review.author.charAt(0).toUpperCase()}
      {review.localGuide ? (
        <span className={styles.guideBadge}>
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" fill="#f9ab00" r="12" />
            <path
              d="M12 6.2l1.62 3.53 3.88.44-2.88 2.6.79 3.82L12 14.66l-3.41 1.93.79-3.82-2.88-2.6 3.88-.44z"
              fill="#fff"
            />
          </svg>
        </span>
      ) : null}
    </span>
  );
}

/**
 * The reviews bar: rises from the bottom when the hero's Google rating is
 * clicked, and can be sent away again at any time.
 *
 * A docked bar rather than a dialog, deliberately. Reviews are read alongside
 * the page, not instead of it — so the page underneath keeps scrolling, keeps
 * its focus order, and is never covered. That also settles how it closes: the
 * X and Escape, but *not* a click anywhere else, because "anywhere else" is
 * the page the reader is still meant to be using.
 *
 * Always mounted and pushed off-screen rather than unmounted, so it animates
 * in both directions without a presence library. `inert` while it is down is
 * what keeps it genuinely gone — off-screen alone still leaves it in the tab
 * order and readable to a screen reader.
 *
 * Arrows and a counter rather than a dot per review. Fifteen dots is a row of
 * 4-pixel decisions that tells nobody where they are; two arrows and "4 / 15"
 * are honest about the length and stay the same size whatever it becomes.
 */
export function ReviewsBar({
  onClose,
  open,
}: {
  onClose: () => void;
  open: boolean;
}): JSX.Element {
  const [index, setIndex] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLQuoteElement>(null);
  const active = reviews[index];

  const step = (delta: number) =>
    setIndex((current) => (current + delta + reviews.length) % reviews.length);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  /*
   * Focus follows the bar in, so the next Tab lands inside it and Escape has
   * something to return. Without this the bar is visible but a keyboard is
   * still up in the hero, several stops from the thing that just appeared.
   */
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  /*
   * A long review is scrolled, so moving to the next one has to rewind it.
   * Otherwise the reader arrives halfway down someone else's sentence.
   */
  useEffect(() => {
    // `scrollTop` rather than `scrollTo`: it rewinds instantly, which is what
    // is wanted here, and it exists everywhere including jsdom.
    if (textRef.current) textRef.current.scrollTop = 0;
  }, [index]);

  return (
    <aside
      aria-label="Hodnotenia na Google"
      className={styles.bar}
      data-open={open}
      inert={!open}
    >
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.mark}>
            <GoogleMark />
          </span>
          <span className={styles.summary}>
            <strong>{reviewSummary.average}</strong>
            <span className={styles.summaryLabel}>
              {reviewSummary.count === null
                ? "Google hodnotenie"
                : `z ${reviewSummary.count} recenzií`}
            </span>
          </span>
        </div>

        {active ? (
          <figure className={styles.quote}>
            <figcaption className={styles.head}>
              <Avatar review={active} />
              <span className={styles.who}>
                <cite className={styles.author}>{active.author}</cite>
                <span className={styles.meta}>{active.meta}</span>
              </span>
              <span
                aria-label={`${active.rating} z 5`}
                className={styles.stars}
                role="img"
              >
                <span aria-hidden="true">
                  {"★".repeat(active.rating)}
                  <i>{"★".repeat(5 - active.rating)}</i>
                </span>
              </span>
              <span className={styles.date}>{active.date}</span>
            </figcaption>
            <blockquote className={styles.quoteText} ref={textRef}>
              <p>{active.text}</p>
            </blockquote>
          </figure>
        ) : null}

        <div className={styles.side}>
          <div className={styles.pager}>
            <button
              aria-label="Predchádzajúca recenzia"
              className={styles.pagerButton}
              onClick={() => step(-1)}
              type="button"
            >
              <IconChevronLeft size={17} stroke={1.8} />
            </button>
            <span className={styles.counter}>
              <strong>{index + 1}</strong>
              <span aria-hidden="true"> / </span>
              <span className={styles.visuallyHidden}>z</span>
              {reviews.length}
            </span>
            <button
              aria-label="Ďalšia recenzia"
              className={styles.pagerButton}
              onClick={() => step(1)}
              type="button"
            >
              <IconChevronRight size={17} stroke={1.8} />
            </button>
          </div>

          {/*
            Only when there is a real listing to point at. The link is the
            reader's one way to check that any of this is real, so a wrong one
            would be worse than none.
          */}
          {googleProfileUrl ? (
            <a
              className={styles.profileLink}
              href={googleProfileUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Všetky na Google
            </a>
          ) : null}

          <button
            aria-label="Zavrieť hodnotenia"
            className={styles.close}
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            <IconX size={18} stroke={1.6} />
          </button>
        </div>
      </div>

      <p aria-live="polite" className={styles.visuallyHidden}>
        {open && active
          ? `Recenzia ${index + 1} z ${reviews.length}. ${active.author}, ${active.rating} z 5. ${active.text}`
          : ""}
      </p>
    </aside>
  );
}
