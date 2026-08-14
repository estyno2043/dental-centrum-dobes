# Approved Higgsfield jaw motion master

## Approval

- Provider: Higgsfield
- Job ID: `bd346c78-8c4f-4ace-ad25-59d2eb1bbd6c`
- Model: FLUX.3 Video (`flux_3_video`)
- User approval date: 2026-08-14
- User approval: `schvalujem je to fajn`
- Credits spent: 45

## Generation settings

- Mode: first frame + last frame, one continuous generation
- Aspect: 16:9
- Duration requested: 5 seconds
- Resolution requested in Higgsfield: 1920×1080 (1080p)
- Audio requested: off
- Results requested: 1
- Motion strength: the FLUX.3 first/last-frame UI exposed no separate scalar;
  reduced motion, slow easing, and the final hold were specified in the prompt.
- Start media ID: `e6eb0511-693d-42e5-873f-91d4d7879887`
- End media ID: `8ccaa8ea-09dc-4758-82d6-c811953e6ff6`

## Exact prompt

```text
Create one continuous five-second rigid-body dental-jaw motion between the supplied exact first and last frames. Treat both supplied images as immutable endpoint keyframes. Preserve the exact same jaw identity, blurred dental-clinic background, lighting, exposure, color palette, and 16:9 composition throughout.

Every individual tooth must remain an immutable rigid solid object in every intermediate frame. Lock each tooth's exact silhouette, crown and cusp geometry, count, spacing, alignment, enamel texture, color, reflections, and topology. Lock the gingiva's exact texture, gum line, thickness, and topology. Never redraw, interpolate, reshape, bend, stretch, blend, merge, split, wobble, warp, or morph any tooth or gum surface. No per-tooth motion is allowed.

Only the complete upper arch and complete lower arch may translate and rotate as two rigid bodies around one natural hinge. Allow only the minimal uniform whole-jaw scale and framing change needed to reach the supplied end frame. Keep the camera and clinic background locked with no orbit, pan, shake, parallax, or background movement. Reduce overall motion amplitude and speed. Hold the supplied closed start briefly, then use a slow smooth ease-in and ease-out to open the arches and gently approach the mild top-down end orientation. Reach the supplied last frame early enough to hold it completely still for at least the final 1.2 seconds.

Keep the full dental arch and every molar visible at all times. No cuts, camera teleport, tooth interpolation, morphing, wobble, warping, extra teeth, missing teeth, changing gaps, changing enamel, changing gum line, room replacement, lips, tongue, face, hands, instruments, blood, treatment, text, labels, symbols, arrows, glow, particles, lens flare, or motion after the final settle.
```

## Immutable files

- Closed source SHA-256: `b27c7926eca29f270e21b9fda21e2769c73389b22217df2e41a204ed00a8ab22`
- Open source SHA-256: `9101468be1e12ce86cd4ea96c1cc2bfb9e5d835efdb2d17991a1d56871e0d753`
- Master SHA-256: `c91d1185b5948b1a6d457429091674e96d5981dc6ac1882bad8bcf1419371075`

## Export metadata

AVFoundation decoded the downloaded original MP4 as:

- Actual duration: 5.042 seconds
- Actual coded and clean-aperture resolution: 1920×1088
- Actual frame rate: 24 fps
- Actual codec: `avc1` (H.264)
- Actual audio tracks: 0

The Higgsfield setting requested 1920×1080, while the downloaded H.264 stream
contains eight additional coded rows. Task 2 deterministically outputs/crops
the runtime sequences to exact 1280×720 desktop and 720×1280 mobile frames and
replaces both endpoints from the immutable PNG sources. The master stream's
eight extra rows therefore never enter the runtime assets.

## Visual review

Decoded checkpoints at 0%, 10%, 20%, 30%, 40%, 50%, 60%, 70%, 76%, 80%,
82%, 88%, 90%, 94%, and 100% were inspected before approval. The user reviewed
the local replacement candidate and explicitly approved it on 2026-08-14.
