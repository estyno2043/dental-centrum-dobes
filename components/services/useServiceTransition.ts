"use client";

import { useRouter } from "next/navigation";
import { useCallback, type MouseEvent } from "react";

import { BACKDROP_ATTRIBUTE, SERVICE_PHOTO } from "./serviceTransition";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => {
    finished: Promise<void>;
  };
};

/**
 * Waits for the incoming page's backdrop to exist.
 *
 * `router.push` resolves before React has necessarily committed the new tree,
 * and a view transition captures the "after" state the moment its callback
 * settles — settle too early and it snapshots the old page twice, which shows
 * as no transition at all. Polling for the element the new page is known to
 * render is cruder than an official hook and it is honest about what it is
 * waiting for.
 *
 * The timeout matters as much as the wait: if the navigation fails or the page
 * has no backdrop, the transition must still finish rather than hold the whole
 * document frozen behind a pending snapshot.
 */
function waitForBackdrop(timeout = 900): Promise<void> {
  return new Promise((resolve) => {
    const started = performance.now();
    const look = () => {
      if (
        document.querySelector(`[${BACKDROP_ATTRIBUTE}]`) ||
        performance.now() - started > timeout
      ) {
        resolve();
        return;
      }
      requestAnimationFrame(look);
    };
    look();
  });
}

/**
 * Opens a service page by growing its photograph out of the card that was
 * clicked and into the page's own background.
 *
 * Returns a click handler; where the API or the appetite for motion is
 * missing it does nothing and the `Link` it sits on navigates normally.
 */
export function useServiceTransition() {
  const router = useRouter();

  return useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      // Let the browser have modified clicks: new tab, new window, download.
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }

      const doc = document as ViewTransitionDocument;
      const reduced = globalThis.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (!doc.startViewTransition || reduced) return;

      const photo = event.currentTarget.querySelector("img");
      if (!photo) return;

      event.preventDefault();

      // The name is put on at the last moment and taken off again after: two
      // elements sharing one `view-transition-name` is invalid, and every card
      // on this page holds a candidate.
      photo.style.viewTransitionName = SERVICE_PHOTO;

      const transition = doc.startViewTransition(async () => {
        router.push(href);
        await waitForBackdrop();

        /*
         * Cleared here, inside the callback, and not afterwards.
         *
         * The router keeps the outgoing page mounted while the incoming one
         * renders, so for a moment the card and the new page's backdrop both
         * carry this name — and two elements sharing one
         * `view-transition-name` when the second snapshot is taken aborts the
         * whole transition with "invalid state". The first snapshot was
         * already captured before this callback ran, so the card keeps its
         * name exactly as long as it needs it.
         */
        photo.style.viewTransitionName = "";
      });

      // A net for the cases the callback never reaches: a failed navigation,
      // a transition skipped by another starting on top of it.
      transition.finished
        .catch(() => undefined)
        .finally(() => {
          photo.style.viewTransitionName = "";
        });
    },
    [router],
  );
}
