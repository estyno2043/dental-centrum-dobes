/**
 * The facts the clinic is reachable by, in one place.
 *
 * The footer and `/kontakt` both read from here, so an address cannot be right
 * in one and stale in the other. Navigation is deliberately *not* duplicated
 * here: both menus already read `navigationItems` from `heroContent`, and the
 * footer reads the same list, so there is one source for destinations too.
 *
 * ⚠️ The address, both numbers and the opening hours come from the clinic's
 * previous site, `bratislavazubar.sk/kontakt`, recorded in `COLLAB.md` on
 * 2026-08-17. They have not been re-confirmed by the clinic since. A contact
 * page is the single worst place on a site to be out of date, because somebody
 * drives to it, so they should be read back to the clinic once.
 *
 * ⚠️ No e-mail address. The clinic has never supplied one and a plausible
 * guess at it would be published as fact.
 */

export const clinicName = "Dental Centrum Dobeš";

export const clinicPhone = {
  label: "0918 800 002",
  href: "tel:+421918800002",
} as const;

export const clinicLandline = {
  label: "02/434 256 81",
  href: "tel:+421243425681",
} as const;

export const clinicAddress = {
  street: "Vlárska 13/c",
  city: "831 01 Bratislava-Kramáre",
  /*
   * A maps *search* for the written address, not a claimed place id. If the
   * clinic's own listing moves, a search still lands on the right street; a
   * stale place id would send somebody to a pin that no longer exists.
   */
  mapHref:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Vlárska 13/c, 831 01 Bratislava"),
} as const;

export const openingHours = [
  { days: "Pondelok – štvrtok", hours: "8:00 – 19:00" },
  { days: "Piatok", hours: "8:00 – 14:00" },
] as const;
