# Homepage Scroll Transitions — Design

**Date:** 2026-08-09
**Status:** Approved by user
**Branch:** `codex/scroll-sections-v2`

## Goal

Replace hard cuts between hero, statement photograph, and clinic photo strip
with one controlled scroll story while preserving the stable sticky gallery.

## Approved direction

### Hero → statement

- Statement scene overlaps the pinned hero from the start of the homepage
  scroll sequence.
- Statement photograph opens smoothly from the exact viewport centre.
- Opening shape is rectangular with square corners, not oval:
  `inset(50% 50%) → inset(0)`.
- Photograph settles from `scale(1.18)` to `scale(1.02)` while the rectangle
  expands.
- No statement text appears until the photograph is substantially open.
- Headline then fades upward into the visual centre and holds fully readable.
- Reduced motion shows ordinary sequential full-screen sections with no clip,
  scale, or scroll-linked text movement.

### Statement → photo strip

- Gradient veil belongs to the statement scene and therefore covers the
  statement photograph, never the hero.
- Statement photograph remains fully opaque while its inner media settles to
  `scale(0.98)` under the veil. The hero must not reappear.
- Veil ends in `var(--ink)`, matching the photo strip background. The strip can
  then enter naturally without a hard colour edge or clipping wrapper.
- `PhotoStrip` stays a direct sibling of `ExperienceBand`. No ancestor around
  the strip may use `overflow: hidden`, `clip`, or a transform that changes its
  sticky containing block.

## Photo strip corrections

- Intro receives a real top safe area. `AMBULANCIA` cannot touch or clip at the
  viewport edge.
- Sticky pin uses a two-row grid: intro plus remaining gallery area.
- Track height derives from the safe remaining viewport, so fully grown cards
  stay vertically centred and cannot be cut off at the bottom.
- Progress is sequential:
  - `0–22%`: card height grows `55% → 100%`; horizontal pan stays `0`.
  - `22–100%`: height stays `100%`; horizontal pan runs `0 → 1`.
- Mobile below `768px` and `prefers-reduced-motion` use native horizontal
  snapping. No automatic growth or pan.
- All seven frames remain. `/media/strip-07-detail.jpg` remains attached to
  the seventh frame.

## Implementation

- Existing `motion@13.0.0` supplies `useScroll`, `useTransform`, and
  `useReducedMotion` for the statement scene.
- Pure functions in `components/home/scrollMotion.ts` own progress mapping.
  Motion transforms and photo-strip DOM updates consume those functions so
  regression tests exercise production behavior.
- `ExperienceBand` uses a tall outer section and one `position: sticky` inner
  scene. Only the inner statement surface is clipped.
- `PhotoStrip` keeps its existing measured `--travel`, but publishes separate
  `--grow` and `--pan` variables.
- CSS Modules remain the styling boundary. No new dependency.

## Accessibility and performance

- Semantic regions and headings stay unchanged.
- Motion affects `clip-path`, `transform`, and `opacity`; no runtime blur.
- Baked blurred statement assets remain unchanged.
- Reduced-motion layout is fully readable and manually navigable.
- Scroll listeners remain passive. Resize recalculates gallery travel.

## Acceptance criteria

- Square opening is continuous from centre to fullscreen.
- Photograph appears before centered headline fade-up.
- Exit gradient visibly originates on statement photograph.
- Hero never flashes through during statement exit.
- Gallery sticky pin holds at `top: 0`.
- Growth finishes before horizontal pan starts.
- Gallery intro and card bottoms remain inside viewport at `1440×900`.
- No horizontal page overflow.
- Mobile `375×812` keeps menu behavior and native snapping.
- Reduced-motion fallback works.
- Tests, lint, TypeScript, production build, `git diff --check`, credential
  scan, localhost HTTP, image HTTP, and browser console checks pass.
