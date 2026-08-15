# Jaw pain-map refinement

## Status

Design approved in principle by the user: selected approach A, anatomical map
reveal. This document is pending explicit user review before implementation.

## Problem

Current story starts the jaw before the semantic `detail` gallery photograph
has reached and held a fullscreen state. The jaw canvas is effectively
full-bleed, its opening caption and direct-entry controls appear before the
user understands the purpose, and the visible rectangular hit areas read as
debug geometry. The abrupt exit to patient results breaks the visual language
used for the gallery transition.

## Goal

Tell one clear story:

1. Explore the clinic gallery completely.
2. Let the final `detail` photograph fill the viewport and hold.
3. Transition through that photograph into a faster jaw-opening sequence.
4. Tease an anatomical pain map.
5. Give the user a clear, attractive way to select a zone and then a
   patient-language problem.
6. Dissolve into the next section without a hard visual cut.

The sequence remains pre-rendered WebP frames. It does not restore Blender,
WebGL, MP4 scrubbing, Lenis, or wheel interception.

## Desktop timeline

The existing `1030dvh` `ClinicStory` remains one native-scroll story. Its
progress is remapped as follows. Percentages name desktop scroll progress
inside that story, not video time.

| Range | Scene | Required result |
| --- | --- | --- |
| `0–37%` | Gallery growth and right-to-left pan | Every clinic photo remains in original order. No jaw element is visible. |
| `37–46%` | Semantic `detail` frame expansion | Only `photoFrames.find((frame) => frame.id === "detail")` grows to fill the viewport. |
| `46–50%` | Detail dwell | The full-viewport photograph holds long enough to register before any blur or jaw pixel appears. |
| `50–53%` | Handoff | The `detail` photograph becomes the blurred scene background through a gold-tinted soft dissolve. No text, control, or zone is visible. |
| `53–67%` | Jaw opening | WebP frames play from closed to open roughly 35–45% faster than current mapping. Caption: `Hľadáme miesto, ktoré vás trápi.` It fades in after the handoff and fades out before the sequence ends. |
| `67–71%` | Pain-map tease | Final jaw frame holds. Four soft anatomical glows pulse in sequence: front teeth, premolars, molars, gums. No clickable label or helper entry is yet visible. |
| `71–75%` | Map reveal | Caption disappears. `Kde vás to trápi?` fades in. Four zone anchors, leader lines, and compact zone labels pop in with staggered 140–180 ms scale/fade motion. |
| `75–90%` | Interactive dwell | Pain map stays stable. Users hover, focus, tap, choose a problem, and navigate to existing demo booking routes. |
| `90–100%` | Exit | Scene, labels, and helper links fade and blur into the same dark-to-light gradient language used before the gallery. Patient results rise naturally underneath. |

Raw reverse progress immediately disables interaction below `75%`; the
critically damped visual follower may continue closing. This prevents a click
on an area that is no longer at its final visual position.

## Mobile timeline

Mobile keeps a native horizontal, snapping gallery. It must not auto-skip the
gallery. The `detail` card is the only handoff candidate and must be the
selected fullscreen snap card before vertical progress can reveal the jaw.

After the same detail dwell, mobile uses the same visual phases but maintains
safe vertical lanes:

- top lane: motion caption or final heading;
- middle lane: contained 16:9 jaw artboard;
- bottom lane: helper links only during final interactive dwell.

The 390 x 844 layout must keep every lane disjoint. Mobile uses touch/click,
keyboard, and focus equivalently; hover is additive desktop feedback, never
the only path to problems.

## Jaw scene composition

The blurred clinic photograph fills the scene background. The jaw itself lives
inside a contained central 16:9 artboard, not edge-to-edge video. Desktop
artboard size targets `min(74vw, 68dvh)`; mobile targets `min(88vw, 50dvh)`.
The exact CSS may vary to preserve safe lanes, but the scene must never crop
the jaw or cover the header, gallery, or next section.

There is no headline, CTA, direct-entry button, zone outline, or problem card
during the opening frames. The only motion-stage copy is:

> Hľadáme miesto, ktoré vás trápi.

It is intentionally transitional: it disappears before zones become visible.

## Anatomical pain map

The final frame has four primary zones:

| Zone | Visual anchor | Label | Patient-language problems |
| --- | --- | --- | --- |
| `front` | Upper/lower incisor area | Predné zuby | Nepáči sa mi tvar/farba; Odštiepený zub; Medzera |
| `premolar` | Left/right middle side teeth | Črenové zuby | Citlivosť na sladké/studené; Vypadla plomba |
| `molar` | Left/right rear teeth | Stoličky | Bolí pri hryzení; Pulzujúca bolesť; Prasknutý zub |
| `gums` | Gingival contour, not a rectangular mouth area | Ďasná | Krvácajú pri čistení; Ustupujú; Zápach |

Zones use soft translucent champagne-to-warm-rose anatomical masks. They do
not show rectangular boxes, debug outlines, or a permanent dense wireframe.
During the tease they pulse one at a time at low opacity. At the interactive
gate each gets:

1. a small anchor point exactly on the anatomy;
2. a thin, short champagne leader line from the anchor to a nearby label;
3. a compact label that pops in with the other zones;
4. a stronger mask, brighter leader, and compact problem card on hover,
   focus, or tap.

The card contains only patient-language problem choices. Selecting a problem
uses existing typed route/query and consent-gated analytics behavior. It is
not a diagnosis.

Existing direct entries stay required for conversion but stop being large,
floating lower-right buttons. After map reveal they appear in one understated
bottom-centre assistance bar:

> Nenašli ste miesto?  Chýba mi zub · Neviem / bolí to celé

Both remain keyboard-accessible and route to their existing demo pages. They
are absent during gallery, handoff, jaw opening, and tease.

The persistent visible disclaimer remains:

> Orientačná pomôcka. Presnú príčinu určí až vyšetrenie.

## Transition to patient results

At story exit the artboard scales down slightly, its background blur increases,
and the scene is covered by the established taupe-to-dark gradient. Labels,
leaders, masks, and assistance bar leave before patient content rises. No
white or blank intermediate frame, hard horizontal cut, or competing sticky
viewport is allowed.

## Fallbacks and accessibility

- `prefers-reduced-motion`: show static final open jaw, heading, all zones,
  assistance links, disclaimer, and route controls immediately. No auto-play
  sequence, tease, or delayed timeout.
- Failed frame decoding: same static final map; never a blurred blank scene.
- No JavaScript: retain static image, heading, disclaimer, and six route
  links in server HTML.
- Keyboard: every zone has visible focus state; Enter/Space opens the same
  problem choices as pointer input; Escape closes a problem card and restores
  focus to its zone.
- A11y and analytics event contracts remain unchanged except final controls
  are emitted only after the `75%` interaction gate.

## Implementation boundary

Likely changed production files:

- `components/home/ClinicStory.tsx`
- `components/home/ClinicStory.test.tsx`
- `components/home/clinicStory.module.css`
- `components/home/clinicStoryMotion.ts`
- `components/home/clinicStoryMotion.test.ts`
- `components/home/jaw/JawZoneOverlay.tsx`
- `components/home/jaw/JawZoneOverlay.test.tsx`
- `components/home/jaw/jawExperience.module.css`

Existing media, player loader, gallery content, typed zone content, analytics,
booking routes, header, patient content, and Netlify form are protected unless
an implementation test proves a minimal compatibility edit is needed.

## Acceptance and regression checks

- At desktop 1440 x 900 and 1920 x 1080, no jaw pixel appears before the
  fullscreen `detail` dwell has completed.
- All original gallery frame IDs/order survive, and only semantic `detail`
  triggers handoff.
- Desktop and mobile have no document horizontal overflow.
- At 390 x 844, title/caption/artboard/assistance lanes never overlap.
- Opening uses a shorter scroll interval than current mapping, but frame
  changes remain damped and reverse-safe.
- No zone controls or assistance links appear before final map gate.
- Tease makes all four zones discoverable without reading a dense label wall.
- Interactive masks, leader endpoints, and labels align to their anatomy
  within approximately 12px at target viewports.
- Zone problem click, direct-entry click, reduced-motion, decode fallback,
  no-JS fallback, mobile swipe/menu, and gradient exit have automated
  regression coverage.
- Run focused tests, full test suite, lint, TypeScript, jaw validator, build,
  whitespace diff, credential scan, and browser checks at 1920 x 1080,
  1440 x 900, 390 x 844, and 375 x 812.
