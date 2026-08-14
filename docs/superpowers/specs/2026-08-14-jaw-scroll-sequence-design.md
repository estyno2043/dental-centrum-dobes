# Higgsfield Jaw Scroll Sequence Design

Date: 2026-08-14

Status: User-approved design; written specification awaiting user review

Owner: Codex

Branch: `codex/jaw-scroll-sequence-design`

## 1. Objective

Replace the current segmented jaw-video scrub with a cinematic,
scroll-controlled image sequence generated in Higgsfield from the two approved
Canva composites:

- closed start: `Untitled design (5).png`,
- open end: `Untitled design (4).png`.

Both approved inputs are verified at 1920×1080.

The gallery must keep its established grow, horizontal pan, and final-frame
expansion. The final clinic photograph then becomes the blurred environment for
the jaw motion. After the jaw reaches the open pose, branded HTML/SVG zones
appear and become an accessible patient-navigation tool.

Patient flow:

1. **Where** — choose the area that causes discomfort.
2. **What** — choose a symptom written in patient language.
3. **Next step** — open the matching demo problem page and book an entry
   examination with the selected context prefilled.

The experience is orientation, not diagnosis.

## 2. Superseding decision

This specification supersedes the earlier runtime Three.js/Blender jaw design
and the current scrubbed MP4 jaw implementation.

Production must not use:

- Blender or a GLB at runtime,
- Three.js, WebGL, WebGPU, raycasting, or orbit controls,
- a scrubbed MP4 as the scroll runtime,
- crossing leader lines or moving arrows,
- scroll interception or a smooth-scroll library.

The final experience uses pre-rendered Higgsfield motion, optimized WebP frame
sequences, one 2D drawing surface, and accessible HTML/SVG controls. The user
cannot freely rotate the jaw. That trade-off is intentional: fixed art
direction, lower mobile cost, predictable lighting, and stable clickable zones
matter more than arbitrary camera control.

## 3. Locked visual direction

### 3.1 Start frame

- Small closed jaw.
- Slight three-quarter angle.
- Centered over the supplied blurred clinic background.
- No labels, arrows, overlays, text, or interface baked into the image.
- Heading `Kde vás to trápi?` is live HTML, not generated pixels.

### 3.2 End frame

- Larger open jaw.
- Mild top-down orientation so tooth surfaces remain readable.
- Same clinic background, exposure, palette, and jaw identity as the start.
- Full arch remains visible at desktop and phone widths.
- No physical splitting or exploding of teeth.
- No labels, arrows, overlays, text, or interface baked into the image.

### 3.3 Higgsfield motion

Create one continuous approximately five-second 16:9 master using the approved
start and end frames. Required motion:

1. Jaw grows from the small closed start pose.
2. Upper and lower arches open with a natural hinge-like movement.
3. Jaw rotates gently toward the approved open view.
4. Final pose settles and holds long enough to extract a stable last frame.

Negative constraints:

- no cut or camera teleport,
- no extra teeth, missing teeth, tooth-count change, or tooth morphing,
- no lips, tongue, face, hands, tools, blood, or treatment action,
- no background replacement or room movement,
- no text, symbols, arrows, glow, particles, or lens flare,
- no zoom beyond the approved final composition,
- no motion after final settle.

Desktop first and last frames must be direct pixel-resized versions of the
approved Canva composites. Mobile first and last frames must be deterministic
portrait compositions derived from those same pixels through the mobile rule
in section 4.3. Higgsfield supplies the in-between motion only. This prevents
generative drift at both transition boundaries.

## 4. Media preparation pipeline

### 4.1 Reproducible source set

Implementation stores:

- `assets/jaw-sequence/source/jaw-closed-start.png`,
- `assets/jaw-sequence/source/jaw-open-end.png`,
- approved Higgsfield master,
- generation prompt and model/settings record,
- `scripts/build-jaw-sequence.sh`,
- generated manifest metadata.

Original Downloads filenames are local inputs only. Repository filenames must
be stable and descriptive.

### 4.2 Desktop sequence

- 72 frames.
- 1280×720.
- WebP with alpha disabled.
- Exact approved start and end composites replace extracted frame 1 and frame
  72 after resizing.
- Total desktop sequence target: no more than 8 MiB.

### 4.3 Mobile sequence

- 60 frames.
- 720×1280 output surface.
- Same approved motion and frame order.
- The complete 16:9 composition is fitted to width over a cover-scaled blurred
  copy of the same frame; top and bottom blending must not create a visible
  rectangle.
- The jaw may not be center-cropped at the molars.
- Total mobile sequence target: no more than 5 MiB.

### 4.4 Manifest and validation

Build output includes one typed manifest per profile containing:

- ordered frame URLs,
- width and height,
- frame count,
- byte size,
- SHA-256 hash per frame,
- exact start/end identifiers,
- build timestamp excluded from deterministic hashes.

Validation fails when frames are missing, dimensions vary, ordering has gaps,
total size exceeds budget, or the first/last frame is not the approved source.

## 5. Runtime architecture

Keep the existing `ClinicStory` as the owner of one combined
gallery-to-jaw timeline. Replace video-specific internals with these bounded
units:

- `ClinicStory` — section geometry, sticky lifecycle, gallery, handoff, and
  interaction boundary.
- `clinicStoryMotion` — pure mapping from section-local scroll distance to
  gallery, handoff, sequence, and final-dwell states.
- `JawFrameSequence` — manifest loading, decoded-frame cache, frame selection,
  canvas drawing, and static fallback.
- `jawSequenceLoader` — priority queue and bounded LRU cache for decoded
  images.
- `JawZoneOverlay` — live HTML heading, SVG hit surfaces, zone controls, and
  desktop/mobile problem presentation.
- `jawContent` — typed route, problem, service, disclaimer, and form context.
- `app/problemy/[zona]/page.tsx` — six statically known demo destinations.
- shared appointment form — Netlify-compatible form with prefilled controlled
  context.

Canvas is decorative and hidden from the accessibility tree. It draws only the
current sequence frame. All meaning and interaction live in server-renderable
HTML and SVG.

No overflow ancestor may wrap the sticky host. The patients section following
`ClinicStory` remains normal document flow.

## 6. Complete scroll choreography

Actual section scroll position is the source of truth for wheel, trackpad,
keyboard, scrollbar, and touch. Native document scrolling remains unblocked.

### 6.1 Desktop

Preserve the established `1030vh` story distance:

| Section-local range | Phase | Result |
|---|---|---|
| `0–84vh` | Gallery grow | Cards grow `55% → 100%`; horizontal pan remains zero. |
| `84–380vh` | Gallery pan | Full-height cards travel left; all current gallery frames remain visible in order. |
| `380–480vh` | Final-frame expansion | Final `detail` frame centers and expands to the viewport. Historical “photo 7” wording never determines the array index. |
| `442–480vh` | Clinic handoff | Final frame progressively blurs and matches the clinic background in the approved start composite. |
| `480–840vh` | Jaw sequence | Frames map closed → open. Heading fades up during arrival. |
| `840vh` onward | Zone reveal | Final frame locks. Four logical zones reveal front → premolars → molars → gums, staggered by 180 ms. |
| `840–1030vh` | Interactive dwell | Jaw pixels remain fixed. Controls activate only after all zone reveals finish. |
| after `1030vh` | Release | Sticky host unpins; normal page flow resumes. |

The gallery never collapses or skips because jaw media is unavailable.
Permanent jaw failure affects only ranges after final-frame expansion.

### 6.2 Mobile

- Gallery remains a native horizontal snapping scroller.
- Final `detail` frame auto-snaps only after the manual gallery range.
- `100vh` handles final-frame expansion and background handoff.
- Approximately `370vh` maps the mobile image sequence closed → open.
- Remaining story distance holds the final frame for zone reveal and taps.
- Mobile total remains `780vh` unless browser review proves a shorter value
  preserves readable control dwell.

Mobile never loads the desktop frame set.

### 6.3 Frame following

A requestAnimationFrame loop follows target scroll progress with an
approximately 180 ms critically damped response. It smooths coarse wheel jumps
without taking ownership of scrolling.

Rules:

- scrolling backward reverses frame order,
- direction changes cancel obsolete decode priority,
- only latest target frame and its nearest neighbors receive high priority,
- canvas keeps the last valid frame until a newer frame is decoded,
- nearest decoded frame may display temporarily; blank canvas may not,
- final interaction cannot activate until the exact open end frame is drawn,
- resize redraws current frame without resetting story progress.

## 7. Sequence loading and memory

Load exact start frame before the jaw phase. Then preload frames in small
ordered windows around the current target rather than fetching every frame at
once.

Decoded cache rules:

- desktop: maximum 12 decoded bitmaps,
- mobile: maximum 8 decoded bitmaps,
- keep current, previous, next, exact start, and exact end frames,
- release evicted `ImageBitmap` objects with `close()`,
- use `HTMLImageElement.decode()` when `createImageBitmap` is unavailable,
- cap canvas DPR at 1.5 desktop and 1.25 mobile,
- pause loading/drawing while document is hidden,
- resume from latest scroll target after visibility returns.

## 8. Zone interaction

### 8.1 Visual form

Do not use arrows or leader lines. Use translucent branded zone surfaces that
make clickability obvious:

- thin gold border,
- low-opacity taupe/gold fill,
- soft local glow on hover/focus,
- restrained lift or brightness transition,
- visible selected state.

Seven visual hit surfaces map to four logical jaw zones:

- one front surface,
- left and right premolar surfaces,
- left and right molar surfaces,
- upper and lower gum surfaces.

All coordinates are normalized against the exact approved open end frame.
Left/right surfaces share content but keep independent geometry.

Two separate high-value entries sit beside, not inside, the jaw:

- `Chýbajúci zub`,
- `Neviem / bolí to celé`.

### 8.2 Desktop behavior

- Hover or keyboard focus highlights the zone and opens a small anchored
  problem card.
- Moving pointer from zone into its card keeps the card open.
- Clicking a zone or pressing Enter pins the card.
- Each problem is a real link to its demo route with a `problem` query value.
- Escape closes a pinned card and restores focus to its zone control.

### 8.3 Mobile behavior

- No hover dependency.
- First tap selects a zone and opens a compact bottom problem panel.
- Problem tap navigates to the demo route.
- Panel has explicit close control; it does not use swipe gestures that compete
  with document scroll.

### 8.4 Interaction boundary

During arrival, opening, and sequence motion:

- all hit surfaces use `pointer-events: none`,
- controls remain out of sequential tab order,
- problem cards remain hidden.

Interaction activates only after exact end frame is drawn and all four reveal
steps finish. Reverse scrolling below the final-frame threshold immediately
closes cards, disables controls, and returns focus to a safe element.

## 9. Content and routes

### 9.1 Route contract

Use one static dynamic route with six allowed slugs:

- `/problemy/predne-zuby`,
- `/problemy/crenove-zuby`,
- `/problemy/stolicky`,
- `/problemy/dasna`,
- `/problemy/chybajuci-zub`,
- `/problemy/neviem`.

Problem selection uses a validated query value, for example:

`/problemy/stolicky?problem=pulzujuca-bolest`

Unknown zone slugs return the normal not-found result. Unknown problem values
show the zone page without claiming a selected problem.

### 9.2 Patient-language mapping

| Zone | Problems | Leads to |
|---|---|---|
| Front teeth | I dislike the shape or color; chipped tooth; gap | Veneers, whitening, composite work |
| Premolars | Sensitivity to sweet/cold; lost filling | Restorative treatment, inlay, crown |
| Molars | Pain when biting; pulsing pain; cracked tooth | Microscope endodontics, crown, extraction |
| Gums | Bleeding during cleaning; recession; odor | GBT hygiene, periodontology |
| Missing tooth | A tooth is missing; I wear a removable replacement | Osstem implant path |
| Unsure / pain everywhere | No symptom choice required | Entry examination |

Production UI uses approved Slovak copy. English appears here only to keep the
design table readable beside route contracts.

### 9.3 Demo destination content

Each route initially contains only:

- zone title,
- `Demo obsahu` marker,
- selected patient-language problem when valid,
- orientation disclaimer,
- appointment form,
- prefilled zone/problem context,
- entry examination price: **100 EUR**.

Do not invent treatment prices, durations, diagnoses, or guaranteed outcomes.
Full clinical copy remains a later content task.

Visible disclaimer:

> Orientačná pomôcka. Presnú príčinu určí až vyšetrenie.

## 10. Typed content contract

```ts
type JawZoneId =
  | "front"
  | "premolar"
  | "molar"
  | "gum"
  | "missing"
  | "unsure";

type JawProblem = Readonly<{
  id: string;
  patientLabel: string;
  destination: string;
}>;

type JawZone = Readonly<{
  id: JawZoneId;
  label: string;
  route: string;
  problems: readonly JawProblem[];
}>;

type JawSequenceMotionState = Readonly<{
  grow: number;
  pan: number;
  zoom: number;
  blur: number;
  sequenceProgress: number;
  exactFrame: number;
  zonesVisible: boolean;
  interactive: boolean;
}>;
```

UI, routes, analytics identifiers, and hidden form context all consume the same
typed content records. No component keeps a second copy of problem labels or
slugs.

## 11. Appointment flow

Demo pages use a Netlify-compatible form with:

- name,
- phone,
- optional email,
- selected zone,
- selected problem,
- `Vstupné vyšetrenie — 100 EUR`,
- consent checkbox,
- text honeypot hidden visually but retained in form data.

Do not request free-text medical history. Submission failure preserves entered
contact values, reports retry state, and exposes clinic phone contact. Success
appears only after a successful server response.

## 12. Analytics

Prepare three controlled events:

- `jaw_zone_click` with zone ID,
- `jaw_problem_click` with zone and problem IDs,
- `jaw_cta_click` with zone and optional problem IDs.

Rules:

- dispatch only after analytics consent,
- send controlled IDs only,
- never send name, phone, email, free text, or inferred medical diagnosis,
- event absence must not block navigation or form use,
- central adapter may remain a no-op until GA4 is configured.

## 13. Failure and fallback behavior

### 13.1 Slow or failed sequence

- Gallery grow and pan always run.
- Final gallery frame always expands.
- Hold approved closed frame while intermediate frames load.
- If sequence permanently fails, cross-fade to approved open end frame and
  reveal zones without motion.
- Never shorten story geometry in a way that skips gallery content.
- Never show blank canvas, broken image icon, or dark empty viewport.

### 13.2 Reduced motion

- Keep native gallery behavior.
- Skip jaw scrubbing and long jaw pin.
- Show approved open end frame immediately after the final-frame handoff.
- Reveal all zones without stagger.
- Keep all routes and appointment actions functional.

### 13.3 No JavaScript

Server output contains:

- approved open static image,
- heading and disclaimer,
- text list of six zone destinations,
- appointment route links.

The experience remains navigable without canvas or client hydration.

## 14. Accessibility

- Zone controls are real buttons or links layered over SVG geometry.
- Problem choices are real links.
- Every control has visible focus treatment and at least 44×44 CSS pixels.
- Hover is never the sole disclosure mechanism.
- SVG hit surfaces receive descriptive accessible names through their HTML
  controls; decorative shapes stay hidden from the accessibility tree.
- Zone reveal does not announce four separate live-region messages.
- Pinned card or mobile panel state changes use one concise status message.
- Escape and focus restoration work on desktop and mobile.
- Canvas and motion do not alter DOM reading order.
- Text and controls meet contrast requirements over every final-frame crop.

## 15. Tests and verification

### 15.1 Pure motion tests

Test immediately before, at, and after desktop boundaries `0`, `84`, `380`,
`442`, `480`, `840`, and `1030vh`, plus corresponding mobile boundaries.

Assert:

- growth finishes before pan begins,
- pan completes before final-frame expansion,
- gallery includes every configured frame,
- exact final gallery item, not numeric index 7, owns handoff,
- sequence progress clamps to `0–1`,
- forward and reverse mapping is deterministic,
- interaction remains false before exact final frame and reveal completion,
- reverse crossing closes interaction immediately.

### 15.2 Loader tests

- Latest target receives priority after fast wheel jumps.
- Direction change cancels stale priority.
- One pending decode per frame.
- Nearest loaded fallback keeps canvas nonblank.
- Cache never exceeds profile limit.
- Evicted bitmaps close exactly once.
- Hidden document pauses work and resumes from latest target.
- Permanent failure selects static open-frame fallback without changing gallery
  geometry.

### 15.3 Interaction and routing tests

- Seven visual surfaces map to four logical jaw zones.
- Missing and unsure entries remain separate.
- Desktop hover, focus, pin, Escape, and focus restoration.
- Mobile tap and bottom-panel behavior.
- Controls unavailable during motion and available after reveal.
- Valid and invalid route/query handling.
- Prefilled form values and exact 100 EUR examination label.
- Netlify success, non-OK response, network error, duplicate-submit guard, and
  honeypot encoding.
- Analytics consent gate and no-PII payload contract.

### 15.4 Media checks

- Frame count, sequence ordering, dimensions, hashes, and byte budgets.
- Desktop start/end match direct resizes of approved sources; mobile start/end
  match deterministic portrait derivatives of the same sources.
- Every frame decodes in Chromium and Safari-compatible image paths.
- Mobile jaw remains fully visible; molars are not cropped.

### 15.5 Browser review

Review localhost at:

- `1920×1080`,
- `1440×900`,
- `375×812`,
- `390×844`.

Check:

- header remains above story,
- gallery grow and right-to-left pan are not skipped,
- all current gallery photographs appear in order,
- final `detail` frame expands without vertical cut,
- closed-to-open motion is smooth under trackpad, wheel, touch, keyboard, and
  scrollbar input,
- no blank frame during fast forward/reverse jumps,
- zones align with the exact open frame,
- no arrows or leader-line clutter,
- mobile jaw and problem panel fit safely,
- patient section below remains reachable,
- zero horizontal page overflow,
- clean browser console.

Run focused tests, full tests, lint, TypeScript, production build,
`git diff --check`, credential scan, media validation, static Netlify-form
detection, and browser console checks before localhost approval.

## 16. Scope exclusions

- No runtime 3D model, WebGL, WebGPU, Three.js, or orbit controls.
- No diagnosis, treatment guarantee, or medical-history collection.
- No full clinical copy for the six demo routes.
- No invented prices beyond the approved 100 EUR entry examination.
- No external CMS or clinical API.
- No audio.
- No scroll interception, Lenis, or wheel listener that prevents default.
- No hover-only mobile interaction.
- No production GA4 connection before consent infrastructure exists.

## 17. Delivery sequence

1. Commit this specification on `codex/jaw-scroll-sequence-design`.
2. User reviews and approves the written specification.
3. Create a task-level implementation plan with the writing-plans workflow.
4. Generate Higgsfield candidate from the two approved frames and obtain user
   approval before encoding production sequences.
5. Implement from current `origin/main` on a fresh `codex/<topic>` worktree.
6. Keep `http://localhost:3000/` live and review desktop/mobile visual batches.
7. Do not merge or push application changes to `main` before explicit
   localhost approval.
8. After approval, merge and push `main`, fast-forward `develop`, and verify
   the Netlify deployment.
