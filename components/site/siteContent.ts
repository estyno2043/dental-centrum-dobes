/**
 * One source of truth for navigation and for the facts the clinic has
 * confirmed.
 *
 * Both menus, the footer and the contact page read from here, so a destination
 * can never be right in one menu and stale in the other.
 *
 * ⚠️ Nothing unconfirmed belongs in this file. The clinic's address, e-mail and
 * opening hours are still missing, and a plausible guess at any of them would
 * be published as fact — so they are absent rather than approximated. When the
 * clinic supplies them, add them here and render them where they belong.
 */

export type NavigationItem = {
  readonly label: string;
  readonly href: string;
};

/**
 * `/problemy` has no index route yet — only `/problemy/[zona]`. The link is
 * pointed at it because that is the agreed destination; the route itself is
 * recorded as a blocker in `COLLAB.md`.
 */
export const navigationItems: readonly NavigationItem[] = [
  { label: "Problémy a riešenia", href: "/problemy" },
  { label: "Cenník", href: "/cennik" },
  { label: "Tím", href: "/tim" },
  { label: "Ambulancia", href: "/#ambulancia" },
  { label: "Kontakt", href: "/kontakt" },
] as const;

export const clinicName = "Dental Centrum Dobeš";

export const clinicPhone = {
  label: "0918 800 002",
  href: "tel:+421918800002",
} as const;

/** The entry examination, and the only price the clinic has approved. */
export const entryExam = {
  label: "Vstupné vyšetrenie",
  price: "100 €",
  cta: "Objednať vstupné vyšetrenie — 100 €",
} as const;

/**
 * Confirmed in the clinic brief. Deliberately short: every line here is
 * something the clinic has stated, not something inferred from context.
 */
export const clinicFacts: readonly string[] = [
  "Parkovanie pre pacientov zdarma",
  "Platba kartou aj v hotovosti",
  "Akútnych pacientov ošetríme prednostne",
] as const;
