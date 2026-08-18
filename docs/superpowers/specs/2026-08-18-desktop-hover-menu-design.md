# Desktop hover menu design

## Goal

Give desktop visitors a navigation that is always reachable and reads as part
of the brand rather than as a generic link row. Replace the flat header link
row with the existing dental capsule trigger, opening a compact panel on hover.

Success: at every scroll position above 960 px viewport width, the trigger is
visible in the top-right corner and reveals Služby, Cenník, Tím, and Kontakt
without a click. Nothing about the phone experience changes.

## Why this changes an earlier decision

`hero.module.css` currently documents the absent header as deliberate: the
navigation is `visibility: hidden` unless a section declares
`data-header-mode`, and only `PatientsSection` (`light`) and `DriftScene`
(`minimal`) declare one. Between the hero and the patients section — roughly
six thousand pixels of scrolling — the page offers no navigation at all.

The user has reviewed that trade-off and chosen persistent access. The trigger
therefore survives where the header hides. It stays quiet: the same small
charcoal capsule, no bar, no link row, no logo alongside it.

## Scope

Removed:

- the flat `.navigationLinks` row in `SiteHeader` and its `.onLight` rules;
- `Ambulancia` as a navigation item — the clinic walkthrough belongs to the
  existing "Interaktívna prehliadka klinikou" button once that experience
  exists.

Unchanged:

- `MobileMenu` and every phone behaviour at 960 px and below;
- the header's light and minimal modes, the logo, the tagline, and the tour
  button;
- placeholder destinations. Links keep `href="#"` until the subpages exist,
  matching the project's current convention and its eslint exemption.

Navigation items become: Služby, Cenník, Tím, Kontakt.

## Trigger

Reuse the approved Dental Menu Mark exactly as the phone renders it — an
86 × 50 charcoal glass capsule with the taupe orbital ring, the Tabler
`Dental` mark, a hairline divider, and the stepped `Menu Deep` lines. Only its
breakpoint changes: it is currently `display: none` above 960 px.

Position is fixed at the top-right corner. It never relocates to the vertical
edge or anywhere else, and it does not change size or shape between sections.
When the header is visible it sits beside the tour button; when the header is
hidden it stands alone. Its only positional change is the small vertical shift
it shares with the header when the page scrolls, described under Component
boundaries.

The capsule is dark with light contents, so it stays legible over the dark
hero, the taupe `light` bar, and the pale drift scene alike. No per-section
recolouring is required.

Hovering brightens the capsule to taupe with ink contents, matching the tour
button's existing hover treatment.

## Panel

A compact card anchored beneath the trigger, not a full-height drawer. A
hover-opened surface that covers a fifth of the screen punishes an accidental
cursor path; this one covers only the corner.

- width 260 px, anchored to the trigger's right edge;
- charcoal at 96% with `backdrop-filter: blur(16px)`, a taupe hairline border,
  and a 14 px radius;
- four links at 19 px, each with its taupe `01`–`04` ordinal;
- a footer rule, then "Objednajte sa" above the clinic number.

Open: opacity 0 → 1 over 380 ms, with `translateY(-10px)` and `scale(0.97)`
resolving over 480 ms from a top-right transform origin. Links follow with a
60 ms stagger, each easing 16 px leftward into place; the footer trails the
last link. Close runs the same transition in reverse.

All motion uses the project's existing `cubic-bezier(0.22, 1, 0.36, 1)`.

## Interaction

Hover intent, because a bare `:hover` is unusable here:

- open after 90 ms, so a cursor crossing the corner does not trip it;
- close after 220 ms, so the cursor can travel from the capsule to the panel
  without the panel vanishing underneath it.

The trigger and panel share one hover region, so the gap between them does not
break the interaction.

Pointer and keyboard support beyond hover:

- clicking the trigger toggles the panel, so the control works for anyone who
  does not hover onto it;
- keyboard focus on the trigger opens the panel, `Escape` closes it and
  returns focus to the trigger, and `Tab` moves through the four links and the
  phone number;
- focus leaving the panel closes it.

The panel is not a modal. It traps nothing, locks no scrolling, and renders no
backdrop — the phone's Radix dialog remains the modal experience.

Below 960 px the desktop menu does not render at all, so touch devices, which
have no hover, keep the click-driven dialog they already have.

Under `prefers-reduced-motion`, translation, scale, and stagger are removed;
the panel and its links resolve through opacity alone.

## Component boundaries

Add `components/hero/DesktopMenu.tsx`, owning the trigger, the panel, the
hover-intent timers, and the open state.

`SiteHeader` renders it as a **sibling** of `<nav>`, not a child. The header
controls its own `visibility` per section, and a trigger nested inside it would
disappear with it during the cinematic sections — which is exactly what this
work exists to prevent. As a sibling, `DesktopMenu` positions itself and stays
independent of that logic.

`SiteHeader` passes one prop, `scrolled`, reusing the scroll listener it
already runs. The header tightens its padding from 26 px to 16 px when
scrolled; the trigger must follow, or it will drift out of line with the tour
button while both are on screen. No second scroll listener is introduced.

The trigger's resting offset must line up with the tour button, which sits at
the header's 26 px padding plus `.navigationRight`'s 8 px. Verify this by
measurement rather than assuming the numbers compose.

`heroContent.ts` stays the single source of navigation items for both phone and
desktop, so the two menus cannot drift apart.

Styling continues through `hero.module.css` and the existing design tokens. No
second styling system, and no new colour values.

## Verification

Tests:

- trigger renders above 960 px and not below it;
- hover opens and unhover closes, honouring both intent delays;
- click toggles; `Escape` closes and restores focus; focus leaving closes;
- all four links and the phone number render with the correct destinations;
- items come from `heroContent.ts`, so the phone and desktop lists match;
- reduced motion removes transforms and stagger;
- `MobileMenu`'s existing tests continue to pass unchanged.

Browser review at 1440 × 900, 1280 × 800, and 1024 × 768:

- trigger visible at the top, over the clinic story, over the patients
  section, and over the drift scene;
- trigger aligned with the tour button both before and after the scrolled
  padding change;
- panel legible against each section behind it, with no horizontal overflow;
- cursor can travel from trigger to panel without it closing;
- 390 × 844 confirms the phone menu is untouched.

Then lint, TypeScript, the production build, `git diff --check`, and a
credential scan over the changed files.

## Delivery

Implement on `claude/desktop-hover-menu`, branched from `origin/main` at
`d2411e3`. Keep the work local for user review at `localhost`. Push and open a
pull request against `main` only after the user approves the local result.

The subpages behind Služby, Cenník, Tím, and Kontakt are the next piece of
work and are out of scope here.
