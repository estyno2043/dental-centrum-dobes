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

## User-approved prompt exception and rejection chain

The Task 1 brief originally locked this prompt:

```text
Create one continuous cinematic dental-jaw motion between the supplied first and last frames. Preserve the exact same jaw identity, tooth count, tooth shapes, gums, blurred dental-clinic background, lighting, exposure, color palette, and 16:9 composition. Begin with the small closed jaw at the supplied slight three-quarter angle. Gradually enlarge it, open the upper and lower arches with a natural hinge-like motion, and rotate gently toward the mild top-down open view in the supplied end frame. Keep the full dental arch and all molars visible. End with a smooth ease-out and a stable hold on the supplied last frame. No cuts, camera teleport, background movement, room replacement, tooth morphing, extra teeth, missing teeth, lips, tongue, face, hands, instruments, blood, treatment, text, labels, symbols, arrows, glow, particles, lens flare, or motion after the final settle.
```

That exact prompt produced Seedance 2.0 Mini job
`8b4ebf89-01c8-4bf0-9840-c895d119f0a2` (first + last frame, 16:9,
5 seconds, 720p, high bitrate, audio off, 12.5 credits). The user rejected it
because the teeth deform slightly during the transition and required smoother
motion with exact tooth geometry preservation.

The user's subsequent instruction explicitly superseded the original locked
prompt: keep the exact same endpoint frames, but lock each tooth as a rigid
solid and reduce camera/motion amplitude with slower easing and a longer final
hold. The user authorized one new Higgsfield generation under that instruction,
then explicitly approved the resulting FLUX.3 video on 2026-08-14. The prompt
below is therefore a documented, user-directed and user-approved exception to
the brief's original locked prompt, not an undocumented substitution.

The rejected Seedance export is retained only as git-ignored SDD evidence at
`.superpowers/sdd/2026-08-14-jaw-scroll-sequence-implementation/rejected/jaw-motion-rejected-tooth-deformation-seedance-2-mini.mp4`,
SHA-256 `d1b61408aef17fe8c9027ed353ffe379c45b8d8659f8f4b08621947f995c1026`.

## Exact approved exception prompt

```text
Create one continuous five-second rigid-body dental-jaw motion between the supplied exact first and last frames. Treat both supplied images as immutable endpoint keyframes. Preserve the exact same jaw identity, blurred dental-clinic background, lighting, exposure, color palette, and 16:9 composition throughout.

Every individual tooth must remain an immutable rigid solid object in every intermediate frame. Lock each tooth's exact silhouette, crown and cusp geometry, count, spacing, alignment, enamel texture, color, reflections, and topology. Lock the gingiva's exact texture, gum line, thickness, and topology. Never redraw, interpolate, reshape, bend, stretch, blend, merge, split, wobble, warp, or morph any tooth or gum surface. No per-tooth motion is allowed.

Only the complete upper arch and complete lower arch may translate and rotate as two rigid bodies around one natural hinge. Allow only the minimal uniform whole-jaw scale and framing change needed to reach the supplied end frame. Keep the camera and clinic background locked with no orbit, pan, shake, parallax, or background movement. Reduce overall motion amplitude and speed. Hold the supplied closed start briefly, then use a slow smooth ease-in and ease-out to open the arches and gently approach the mild top-down end orientation. Reach the supplied last frame early enough to hold it completely still for at least the final 1.2 seconds.

Keep the full dental arch and every molar visible at all times. No cuts, camera teleport, tooth interpolation, morphing, wobble, warping, extra teeth, missing teeth, changing gaps, changing enamel, changing gum line, room replacement, lips, tongue, face, hands, instruments, blood, treatment, text, labels, symbols, arrows, glow, particles, lens flare, or motion after the final settle.
```

## Immutable files

- Closed source SHA-256: `b27c7926eca29f270e21b9fda21e2769c73389b22217df2e41a204ed00a8ab22`
- Open source SHA-256: `9101468be1e12ce86cd4ea96c1cc2bfb9e5d835efdb2d17991a1d56871e0d753`
- Raw approved Higgsfield download SHA-256: `c91d1185b5948b1a6d457429091674e96d5981dc6ac1882bad8bcf1419371075`
- Derived 1920×1080 master SHA-256: `85eb577f04d18a8ca3e386056df6277b29e7c17d3eb277688b35f8a2d5717ab9`

## Raw export metadata

Higgsfield was configured for 1920×1080, but AVFoundation decoded the
downloaded original MP4 as:

- Actual duration: 5.042 seconds
- Actual coded and clean-aperture resolution: 1920×1088
- Actual frame rate: 24 fps
- Actual codec: `avc1` (H.264)
- Actual audio tracks: 0

The byte-identical raw download is preserved recoverably outside Git at
`.superpowers/sdd/2026-08-14-jaw-scroll-sequence-implementation/evidence/jaw-motion-master-approved-flux3-raw-1920x1088.mp4`.

## Exact 16:9 normalization

The tracked master is derived from the preserved raw download with
`scripts/crop-jaw-master.swift`. The helper decodes all 121 source frames,
copies source rows 4 through 1083 inclusive, removes exactly four rows from the
top and four from the bottom, preserves every presentation timestamp and the
1000-unit movie timescale, and writes a silent H.264 High stream at 8 Mbps with
a 24-frame keyframe interval and no frame reordering.

Exact command run from the repository root:

```bash
xcrun swift scripts/crop-jaw-master.swift .superpowers/sdd/2026-08-14-jaw-scroll-sequence-implementation/evidence/jaw-motion-master-approved-flux3-raw-1920x1088.mp4 /tmp/jaw-motion-master-derived-final-fix1.mp4
mv /tmp/jaw-motion-master-derived-final-fix1.mp4 assets/jaw-sequence/source/jaw-motion-master.mp4
```

AVFoundation decoded the derived tracked master as:

- Actual duration: 5.042 seconds
- Actual coded and clean-aperture resolution: 1920×1080
- Actual frame rate: 24 fps
- Actual codec: `avc1` (H.264)
- Actual audio tracks: 0

This normalization helper is a one-time, reviewable Task 1 provenance tool;
Task 2 consumes the already-compliant tracked master and does not invoke it.
Task 2 deterministically emits exact 1280×720 desktop and 720×1280 mobile
frames, replaces each sequence's first and last frame from the immutable PNGs,
and holds the exact final replacement frame during the runtime dwell. Thus the
raw stream's eight extra rows, its generative endpoint differences, and its
late residual motion never enter the static runtime endpoints.

## Visual review

Decoded checkpoints at 0%, 10%, 20%, 30%, 40%, 50%, 60%, 70%, 76%, 80%,
82%, 88%, 90%, 94%, and 100% were inspected before approval. The user reviewed
the local replacement candidate and explicitly approved it on 2026-08-14.

After normalization, the 0%, 25%, 50%, 75%, and 100% derived checkpoints were
compared with the same raw checkpoints cropped by four rows on each vertical
edge. All were 1920×1080 and passed the verification threshold (MAE below 2;
PSNR above 38 dB): MAE 1.1711/0.9368/0.8633/0.7910/0.6065 and PSNR
43.15/44.46/45.14/45.90/47.48 dB respectively. Direct visual inspection of
the derived start, midpoint, and final checkpoint confirmed no framing or
content change beyond the specified crop and H.264 re-encode.
