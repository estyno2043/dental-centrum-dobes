"use client";

import type { JSX, ReactNode } from "react";

import { useReviews } from "./ReviewsProvider";

/**
 * Whatever shows the rating, made to open the reviews bar.
 *
 * Takes its own classes so it can look like the hero's trust strip in one
 * place and the entry page's reassurance list in another — the behaviour is
 * shared, the appearance is not.
 *
 * Falls back to a plain `<span>` when there is no provider above it. The
 * rating is worth showing either way, and a rating that cannot be opened is a
 * smaller failure than a page that will not render.
 */
export function ReviewsTrigger({
  children,
  className,
  hint,
  hintClassName,
}: {
  readonly children: ReactNode;
  readonly className?: string;
  /** Small print that appears on hover; omitted where there is no room. */
  readonly hint?: string;
  readonly hintClassName?: string;
}): JSX.Element {
  const reviews = useReviews();

  if (!reviews) return <span className={className}>{children}</span>;

  return (
    <button
      aria-expanded={reviews.isOpen}
      className={className}
      onClick={reviews.toggle}
      type="button"
    >
      {children}
      {hint ? (
        <span aria-hidden="true" className={hintClassName}>
          {hint}
        </span>
      ) : null}
    </button>
  );
}
