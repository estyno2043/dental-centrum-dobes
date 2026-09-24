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

/**
 * The map.
 *
 * OpenStreetMap rather than Google: an embedded Google map sets cookies and
 * calls home before anybody has consented to anything, and this site has no
 * consent banner yet. OSM's export embed sets none and needs no key.
 *
 * The coordinates are a house-level match from Nominatim for Vlárska 13/c,
 * Kramáre, 831 01 — not a guess and not a town-centre fallback. The bbox is
 * the pin plus roughly a block in each direction, which is close enough to
 * recognise the street and wide enough to place it in Kramáre.
 */
export const clinicMap = {
  lat: 48.1712929,
  lon: 17.0912107,
  get embedHref(): string {
    const { lat, lon } = clinicMap;
    const bbox = [lon - 0.004, lat - 0.002, lon + 0.004, lat + 0.002]
      .map((n) => n.toFixed(6))
      .join(",");
    return (
      "https://www.openstreetmap.org/export/embed.html" +
      `?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`
    );
  },
  title: "Mapa: Vlárska 13/c, Bratislava-Kramáre",
} as const;

/**
 * Monday is 1, to match `Date.getDay()` so the footer can mark today without
 * a lookup table. Saturday and Sunday are absent rather than listed as
 * closed: a row that says nothing is a row worth deleting.
 */
export const openingHours = [
  { days: "Pondelok – štvrtok", hours: "8:00 – 19:00", weekdays: [1, 2, 3, 4], opens: 8, closes: 19 },
  { days: "Piatok", hours: "8:00 – 14:00", weekdays: [5], opens: 8, closes: 14 },
] as const;
