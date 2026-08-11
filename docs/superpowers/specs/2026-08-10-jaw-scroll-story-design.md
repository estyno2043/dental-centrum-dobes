# Jaw scroll story design

## Goal

Continue the approved clinic gallery into the Higgsfield jaw animation without
a section cut, blank frame, or second vertical entrance. Native document
scroll must work identically for trackpad, wheel, keyboard, scrollbar, and
touch.

## Approved visual direction

- Final sharp clinic photograph grows from frame 07 to full viewport.
- Blur begins late in that growth; jaw fades over the same blurred scene.
- Gallery, handoff, jaw, annotations, and final dwell share one sticky viewport.
- Only one annotation appears at once. Cards and leaders use the clinic gold,
  porcelain, and ink palette.

## Story and annotations

1. **Prirodzený zhryz** — “Korunky a mostíky navrhnuté ako jeden funkčný
   celok.” Target: contact line between upper and lower front teeth.
2. **Zachovať vlastný zub** — “Mikroskopická endodoncia pre detail, ktorý
   voľným okom nevidno.” Target: visible premolar.
3. **Zdravý základ** — “GBT hygiena chráni zuby, ďasná aj implantáty.” Target:
   gingival margin.
4. Final statement: **Jeden plán. Každý zub v súvislostiach.**

No implant arrow: render exposes neither implant nor bone.

## Timeline

Desktop pinned motion is 1030vh: grow 0–84, pan 84–380, frame-07 zoom
380–480, blur 442–480, jaw fade 447–480, scrub 480–930, dwell 930–1030.

Mobile keeps 90vh native swipe, 40vh auto-snap to frame 07, 100vh handoff,
450vh scrub, and 100vh dwell. Absolute section position reconstructs every
state, so backward scroll reverses all phases.

## Media and decode architecture

Approved 8.04-second source becomes four desktop and four mobile H.264
all-intra segments. All clips are silent, constant 30fps, GOP 1, fast-start,
and overlap around logical two-second boundaries.

- Desktop: 1920×1080, aggregate limit 12 MiB.
- Mobile: 720×1280; master crop 1300×1080 at x=620 becomes 720×598 centered
  over a blurred 720×1280 background, aggregate limit 5 MiB.
- Runtime: two stacked videos; only active and target segment stay mounted.

Seek queue retains one newest target. `requestVideoFrameCallback` is registered
before `currentTime` changes, so paused-video compositor frames cannot be
missed. Layer swap and callouts use decoded callback `mediaTime`; `seeked` is
compatibility fallback only when frame callback API is absent.

## Tracking

Targets originate as 1920×1080 master pixels sampled every 0.2 seconds.
Desktop uses exact `object-fit: cover`. Mobile reproduces encoder crop, scale,
foreground placement, then viewport cover. Cards move through safe zones.
Each SVG leader begins on actual card edge and ends on mapped tracked target.

## Responsive and accessibility

- Mobile gallery remains native snapping horizontal scroller before auto-snap.
- Frame 07 uses a separate 900×1200 phone crop during fullscreen handoff.
- Reduced motion renders swipe gallery, static jaw poster, all callout copy,
  and final statement without scrub.
- No Lenis, wheel interception, image sequence, or WebCodecs runtime.

## Verification gates

- Tests cover timeline boundaries, reverse motion, mobile snap, cover/crop
  mapping, segment selection, latest-only queueing, and frame-callback order.
- Browser checks: 1920×1080, 1440×900, 375×812, 390×844; sticky top, no page
  overflow, menu, forward/reverse coarse jumps, decoded-time overlay.
- Tests, lint, TypeScript, build, whitespace, credential scan, and media
  metadata must pass before localhost handoff.
