export const headlineVariants = [
  "dôvod, prečo sa už zubárom nemusíte vyhýbať.",
  "vaším partnerom na ceste k sebavedomému úsmevu.",
  "ľudia, ktorí sa starajú o ľudí.",
  "Dental Centrum Dobeš.",
] as const;

/*
 * Written as `/#id` rather than `#id` so one href covers both cases: from a
 * service page the browser navigates home and lands on the section, and from
 * the homepage the menu intercepts it and eases the whole way down instead.
 *
 * `/tim` still exists as a page and is still built — it is simply no longer
 * where the menu points, because the section reads better in the run of the
 * homepage than as a stop of its own.
 */
export const navigationItems = [
  { label: "Služby", href: "/#sluzby" },
  { label: "Cenník", href: "#" },
  { label: "Tím", href: "/#tim" },
  { label: "Kontakt", href: "#" },
] as const;

/*
 * `reviews: true` marks the one item that does something when clicked — it
 * raises the reviews bar. Kept here rather than matched on the label in the
 * component, so renaming the label cannot silently unhook the button.
 */
export const trustItems = [
  { value: "4,5", accent: "★", label: "Google hodnotenie", reviews: true },
  { value: "do 19:00", label: "otvorené Po–Št" },
  { value: "Zdarma", label: "parkovanie pre pacientov" },
  { value: "od 3 r.", label: "ošetrujeme aj deti" },
] as const;
