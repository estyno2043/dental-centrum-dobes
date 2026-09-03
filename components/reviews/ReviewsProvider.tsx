"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type JSX,
  type ReactNode,
} from "react";

import { ReviewsBar } from "./ReviewsBar";

/**
 * One reviews bar for the whole site, opened from wherever the rating appears.
 *
 * The bar used to belong to the hero, which was fine while the hero was the
 * only place showing `4,5 ★`. The entry examination now shows it too, and two
 * bars — or a second copy of the state — is how the two get out of step.
 *
 * A context rather than the DOM-event trick used for scrolling: here the
 * trigger genuinely needs to *know* the state, because `aria-expanded` is a
 * claim about what the button did, and a button that says "expanded" while
 * nothing opened is worse than one that says nothing at all.
 *
 * Sits in the root layout wrapping `children`, so everything below it stays a
 * Server Component — only this file and its triggers cross to the client.
 */
type ReviewsContextValue = {
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly toggle: () => void;
};

const ReviewsContext = createContext<ReviewsContextValue | null>(null);

export function ReviewsProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<ReviewsContextValue>(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      toggle: () => setIsOpen((current) => !current),
    }),
    [isOpen],
  );

  return (
    <ReviewsContext.Provider value={value}>
      {children}
      <ReviewsBar onClose={() => setIsOpen(false)} open={isOpen} />
    </ReviewsContext.Provider>
  );
}

/**
 * Returns null outside the provider rather than throwing.
 *
 * A rating is worth showing whether or not it can be opened — on a page that
 * has not been wrapped, the trigger renders as plain text instead of taking
 * the whole page down with it.
 */
export function useReviews(): ReviewsContextValue | null {
  return useContext(ReviewsContext);
}
