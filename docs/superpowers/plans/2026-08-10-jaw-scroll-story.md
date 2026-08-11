# Jaw scroll story implementation plan

## 1. Pure motion contracts — TDD

- Model one 1030vh desktop timeline: grow 0–84, pan 84–380, zoom 380–480,
  blur 442–480, jaw fade 447–480, scrub 480–930, dwell 930–1030.
- Model mobile manual swipe, 40vh auto-snap, 100vh handoff, scrub, and dwell.
- Cover boundaries, clamps, reverse scroll, final-copy timing, and a critically
  damped 180ms scrub response.

## 2. Tracking and seek contracts — TDD

- Map 1920×1080 master coordinates through exact desktop `object-fit: cover`.
- Reproduce mobile encoder transform: crop 1300×1080 at x=620, scale to
  720×598, center inside 720×1280, then apply viewport cover.
- Calibrate target samples every 0.2 seconds and move cards through safe zones.
- Keep only newest pending seek. Register `requestVideoFrameCallback` before
  changing `currentTime`; publish displayed time only after target frame.

## 3. Unified `ClinicStory`

- Replace separate gallery and jaw sections with one sticky 100dvh viewport.
- Keep seven gallery frames, measured frame-07 zoom, late blur, jaw crossfade,
  two-video deck, three callouts, and final dwell inside that viewport.
- Calculate leader start from actual callout-card edge and leader endpoint from
  decoded-frame target.
- Keep native document scroll; never intercept wheel or touch input.

## 4. Responsive and reduced motion

- Preserve native horizontal snapping swipe before mobile auto-snap.
- Generate a separate 900×1200 crop of frame 07 for phone handoff.
- Use 720×1280 jaw assets and bottom safe-zone cards on mobile.
- Render ordinary swipe gallery, static poster, and readable copy when motion
  is reduced.

## 5. Media pipeline

- Encode four desktop and four mobile H.264 High/yuv420p all-intra segments at
  30fps, GOP 1, silent, fast-start.
- Enforce 12 MiB desktop and 5 MiB mobile aggregate budgets in the script.

## 6. Local review gate

- Run tests, lint, TypeScript, build, whitespace, credential, and media checks.
- Inspect 1920×1080, 1440×900, 375×812, and 390×844, including forward and
  reverse coarse jumps, menu, sticky top, and horizontal overflow.
- Leave localhost live. Do not commit, push, or merge before user approval.
