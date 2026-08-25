"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { IconX } from "@tabler/icons-react";

import { GoogleMark } from "./GoogleMark";
import {
  googleProfileUrl,
  reviewSummary,
  reviews,
  type Review,
} from "./reviewsContent";
import styles from "./reviews.module.css";

/**
 * The reviews bar: rises from the bottom when the hero's Google rating is
 * clicked, and can be sent away again at any time.
 *
 * A docked bar rather than a dialog, deliberately. Reviews are something you
 * read alongside the page, not instead of it — so the page underneath keeps
 * scrolling, keeps its focus order, and is never covered. That also settles
 * how it closes: the X and Escape, but *not* a click anywhere else, because
 * "anywhere else" is the page the reader is still meant to be using.
 *
 * Always mounted and pushed off-screen rather than unmounted, so it animates
 * in both directions without a presence library. `inert` while it is down is
 * what keeps it genuinely gone — off-screen alone still leaves it in the tab
 * order and readable to a screen reader.
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
  const active: Review | undefined = reviews[index];

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
   * still somewhere up in the hero, several stops away from the thing that
   * just appeared.
   */
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

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
          <blockquote className={styles.quote}>
            <p className={styles.quoteText}>{active.text}</p>
            <footer className={styles.byline}>
              <cite className={styles.author}>{active.author}</cite>
              <span aria-label={`${active.rating} z 5`} className={styles.stars} role="img">
                <span aria-hidden="true">
                  {"★".repeat(active.rating)}
                  <i>{"★".repeat(5 - active.rating)}</i>
                </span>
              </span>
              <span className={styles.date}>{active.date}</span>
            </footer>
          </blockquote>
        ) : null}

        <div className={styles.side}>
          <div className={styles.dots}>
            {reviews.map((review, position) => (
              <button
                aria-current={position === index}
                aria-label={`Recenzia ${position + 1} z ${reviews.length}`}
                className={styles.dot}
                key={review.id}
                onClick={() => setIndex(position)}
                onKeyDown={(event) => {
                  const delta =
                    event.key === "ArrowRight"
                      ? 1
                      : event.key === "ArrowLeft"
                        ? -1
                        : 0;
                  if (delta === 0) return;
                  event.preventDefault();
                  const next =
                    (position + delta + reviews.length) % reviews.length;
                  setIndex(next);
                  const sibling =
                    event.currentTarget.parentElement?.children[next];
                  if (sibling instanceof HTMLElement) sibling.focus();
                }}
                type="button"
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>

          {/*
            Only when there is a real listing to point at. The link is the
            reader's one way to check that any of this is real, so a wrong one
            is worse than none at all.
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
