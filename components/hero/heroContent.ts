export const headlineVariants = [
  "dôvod, prečo sa už zubárom nemusíte vyhýbať.",
  "vaším partnerom na ceste k sebavedomému úsmevu.",
  "ľudia, ktorí sa starajú o ľudí.",
  "Dental Centrum Dobeš.",
] as const;

export const navigationItems = [
  { label: "Služby", href: "#" },
  { label: "Cenník", href: "#" },
  // The one destination that exists. Everything else stays a placeholder.
  { label: "Tím", href: "/tim" },
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
