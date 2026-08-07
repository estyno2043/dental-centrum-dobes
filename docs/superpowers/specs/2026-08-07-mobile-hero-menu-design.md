# Mobile hero and signature menu design

## Goal

Make the hero feel compact, clean, and premium on phones without changing the
approved desktop composition or Claude's hero media. Add a recognizable mobile
navigation that belongs to a dental brand instead of using a generic hamburger.

Success at 400 × 664: logo, headline, supporting sentence, primary CTA, phone,
and four trust facts fit in one viewport without crowding or horizontal
overflow. Menu trigger remains clearly visible in the top-right corner.

## Visual system

- Preserve existing Hanken Grotesk typography and palette: ink `#1c1c1f`,
  charcoal `#26262a`, taupe `#ae9b7e`, deep taupe `#8a7358`, porcelain
  `#faf9f6`.
- On phones, hide the long logo tagline, reduce logo to about 34 px high, use
  16 px page gutters, tighten headline spacing, reduce CTA height, and compact
  the 2 × 2 trust grid. Desktop layout remains unchanged.
- Keep a stable headline area for rotating copy, but remove excess mobile
  vertical space and size text with a phone-specific fluid clamp.
- Fade up selected hero groups in sequence: headline, supporting sentence,
  CTA row, and trust strip. Motion stays restrained and uses the existing
  premium easing curve.

## Closed menu trigger

Use the approved **Dental Menu Mark** in the top-right corner for viewports up
to 960 px:

- a compact charcoal glass capsule with a subtle partial taupe orbital ring;
- Tabler `Dental` icon on the left and `Menu Deep` stepped lines on the right,
  divided by a thin porcelain line;
- a small visible `MENU` label so the control is immediately understood;
- minimum 48 × 48 px interactive target and `aria-label="Otvoriť menu"`;
- on open, the orbital ring rotates, the dental mark settles, and the stepped
  lines contract into the close state.

Icons come from Tabler Icons through `@tabler/icons-react`, not a remote CDN.
Tabler Icons are MIT licensed and support commercial use.

## Open menu

Build a controlled Radix Dialog using `@radix-ui/react-dialog` and animate it
with Motion for React:

- backdrop fades over the hero;
- charcoal panel slides from the right and occupies `min(88vw, 420px)` at full
  dynamic viewport height;
- clipped upper-left corner and taupe orbital rail connect the panel to the
  trigger geometry;
- links appear with 60 ms stagger, combining a small upward fade with a short
  horizontal settle;
- navigation: Služby, Cenník, Tím, Ambulancia, Kontakt;
- separate bordered CTA: Prehliadka kliniky;
- bottom contact block: Objednajte sa / 0918 800 002.

Radix supplies modal semantics, focus trapping, Escape handling, inert
background, and focus return. Every destination closes the panel. Until real
sections exist, links preserve the project's current placeholder behavior.

## Motion and reduced motion

Use `motion` for the panel, backdrop, trigger state, staggered links, and hero
fade-ups. Standard transition: 0.5–0.65 s with `[0.22, 1, 0.36, 1]`; item
stagger: 0.06 s. Exit runs in reverse and finishes before unmount.

When reduced motion is requested, remove translation, rotation, and stagger;
show content through immediate opacity changes. Existing static hero poster
behavior remains unchanged.

## Component boundaries

- Keep `Hero` responsible for hero content, media selection, and navigation
  placement.
- Add a focused `MobileMenu` component responsible for Dialog state, trigger,
  menu links, and menu animation.
- Keep labels and destinations in `heroContent.ts` so desktop and mobile
  navigation cannot drift.
- Continue styling through the existing hero CSS module and design tokens;
  do not introduce a second styling system.

## Verification

- Test trigger semantics and accessible name.
- Test open/close behavior, all menu items, phone link, Escape close, and focus
  return to the trigger.
- Preserve existing hero media, rotating headline, and reduced-motion tests.
- Run tests, lint, typecheck, production build, and credential scan.
- Browser-check closed and open states at 320 × 568, 375 × 667, 400 × 664,
  430 × 932, tablet width, and desktop. Confirm no horizontal overflow,
  readable focus indicators, correct scroll lock, and no console errors.

## Delivery

Implement on `codex/mobile-hero-menu`, stacked on the currently reviewed hero
and workflow branches. Keep the result local for user inspection. Push and open
the GitHub PR only after the user approves the local browser result.
