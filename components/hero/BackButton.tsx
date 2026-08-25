"use client";

import { useRouter } from "next/navigation";
import { useCallback, type JSX } from "react";
import { IconArrowNarrowLeft } from "@tabler/icons-react";

import styles from "./hero.module.css";

/** Where the header last saw the reader, so "back" knows if it has anywhere to go. */
const PREVIOUS_KEY = "dobes:previous-path";

type BackButtonProps = Readonly<{
  scrolled: boolean;
  ground: "dark" | "light";
}>;

/**
 * Takes the place of the menu on pages that are somewhere the reader arrived
 * *from* something — a service page opened out of the catalogue.
 *
 * It goes back through history rather than to a fixed address, so it returns
 * the reader to the exact place in the page they left, scroll position and
 * all. But only when there is somewhere of ours to return to: someone who
 * opened this page from a search result has history, and sending them back
 * into a search result from a button on the clinic's own site would be a
 * small betrayal. `SiteHeader` records the previous internal path; if there is
 * none, this goes to the homepage instead.
 */
export function BackButton({ ground, scrolled }: BackButtonProps): JSX.Element {
  const router = useRouter();

  const goBack = useCallback(() => {
    let cameFromUs = false;
    try {
      cameFromUs = Boolean(window.sessionStorage.getItem(PREVIOUS_KEY));
    } catch {
      // Private browsing can refuse storage; the homepage is the safe answer.
      cameFromUs = false;
    }

    if (cameFromUs) router.back();
    else router.push("/");
  }, [router]);

  return (
    <div
      className={[styles.desktopMenuRoot, scrolled ? styles.scrolled : ""]
        .filter(Boolean)
        .join(" ")}
      data-ground={ground}
    >
      <button
        className={[styles.desktopMenuTrigger, styles.backTrigger].join(" ")}
        onClick={goBack}
        type="button"
      >
        <span aria-hidden="true" className={styles.backArrow}>
          <IconArrowNarrowLeft stroke={1.7} />
        </span>
        <span className={styles.mobileMenuAction}>
          <span>Späť</span>
        </span>
      </button>
    </div>
  );
}

export { PREVIOUS_KEY };
