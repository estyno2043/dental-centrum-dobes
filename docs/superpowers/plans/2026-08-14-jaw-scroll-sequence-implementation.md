# Higgsfield Jaw Scroll Sequence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current segmented MP4 jaw scrub with an approved Higgsfield-generated WebP frame sequence, preserve the complete gallery and the new patients section, then add accessible clickable jaw zones and six demo appointment routes.

**Architecture:** `ClinicStory` remains the single sticky gallery-to-jaw owner. Pure motion mapping drives a bounded image loader and one decorative canvas; a separate HTML/SVG overlay owns all interaction and routes. The old MP4/3D runtime is deleted only after the new sequence, static fallback, routes, and tests are green.

**Tech Stack:** Next.js 16.3 App Router, React 19, TypeScript 5.9, Vitest, CSS Modules, Canvas 2D, SVG/HTML controls, WebP, FFmpeg/ImageMagick, Netlify Forms

**Spec:** `docs/superpowers/specs/2026-08-14-jaw-scroll-sequence-design.md`

## Global Constraints

- Start implementation from current `origin/main`; create `codex/higgsfield-jaw-sequence` through `superpowers:using-git-worktrees`.
- Preserve `components/patients/PatientsSection.tsx`, `patients.module.css`, the `data-header-light` behavior, and all incoming header/patients commits through `bf59253`.
- Preserve every `photoFrames` item and identify the gallery handoff with `frame.id === "detail"`, never an array index.
- Keep one native document-scroll source; no `preventDefault`, Lenis, wheel interception, or smooth-scroll library.
- Production runtime uses no Blender, GLB, Three.js, WebGL, WebGPU, orbit controls, scrubbed MP4, arrows, or leader lines.
- Desktop story remains `1030vh`; mobile remains `780vh` unless localhost review explicitly approves a different mobile dwell.
- Desktop sequence: 72 WebP frames, 1280×720, at most 8 MiB total.
- Mobile sequence: 60 WebP frames, 720×1280, at most 5 MiB total; both arches and molars remain visible.
- Exact approved first and last frames replace generated endpoints after deterministic resizing/compositing.
- Canvas DPR caps: 1.5 desktop and 1.25 mobile. Decoded cache caps: 12 desktop and 8 mobile.
- Interaction stays disabled until the exact open end frame is drawn and four zone reveal steps finish.
- Entry examination label and value stay exactly `Vstupné vyšetrenie — 100 EUR`.
- Visible disclaimer stays exactly `Orientačná pomôcka. Presnú príčinu určí až vyšetrenie.`
- No patient name, phone, email, free text, or inferred diagnosis enters analytics.
- No app/media commit reaches `main` before explicit localhost approval. After approval, merge/push `main`, fast-forward `develop`, then verify Netlify.
- Read relevant Next.js 16 guides in `node_modules/next/dist/docs/` before route or form work; `params` and `searchParams` are Promises.

## File Map

### Create

- `assets/jaw-sequence/source/jaw-closed-start.png` — approved closed Canva source.
- `assets/jaw-sequence/source/jaw-open-end.png` — approved open Canva source.
- `assets/jaw-sequence/source/jaw-motion-master.mp4` — user-approved Higgsfield master, build input only.
- `assets/jaw-sequence/source/GENERATION.md` — exact prompt, model/settings, source hashes, approval date.
- `scripts/build-jaw-sequence.sh` — deterministic desktop/mobile WebP extraction and endpoint replacement.
- `scripts/validate-jaw-sequence.mjs` — dimensions, ordering, hashes, endpoint, decode, and byte-budget checks.
- `components/home/jaw/jawSequenceManifest.generated.ts` — generated ordered frame metadata.
- `components/home/jaw/jawSequenceLoader.ts` — priority decode queue and bounded LRU cache.
- `components/home/jaw/jawSequenceLoader.test.ts` — loader lifecycle and failure tests.
- `components/home/jaw/JawFrameSequence.tsx` — decorative Canvas 2D player and image fallback.
- `components/home/jaw/JawFrameSequence.test.tsx` — draw, readiness, reduced-motion, and failure tests.
- `components/home/jaw/jawContent.ts` — single typed zone/problem/route/content source.
- `components/home/jaw/jawContent.test.ts` — copy, route, and immutability tests.
- `components/home/jaw/jawAnalytics.ts` — consent-gated controlled analytics adapter.
- `components/home/jaw/jawAnalytics.test.ts` — consent and no-PII contract tests.
- `components/home/jaw/JawZoneOverlay.tsx` — seven surfaces, four jaw zones, two external entries, cards/panel.
- `components/home/jaw/JawZoneOverlay.test.tsx` — pointer, keyboard, mobile, and reverse-close tests.
- `components/home/jaw/jawExperience.module.css` — canvas, zones, cards, mobile panel, focus, and fallback styling.
- `components/home/jaw/JawAppointmentForm.tsx` — Netlify submission form with controlled hidden context.
- `components/home/jaw/JawAppointmentForm.test.tsx` — success/failure/honeypot/duplicate-submit tests.
- `app/problemy/[zona]/page.tsx` — six validated demo destinations.
- `app/problemy/[zona]/page.test.tsx` — route/query/static-param tests.
- `app/problemy/problemy.module.css` — demo route layout.
- `public/media/jaw-sequence/desktop/frame-001.webp` through `frame-072.webp` — generated desktop sequence.
- `public/media/jaw-sequence/mobile/frame-001.webp` through `frame-060.webp` — generated mobile sequence.

### Modify

- `components/home/clinicStoryMotion.ts` — replace video fields with sequence/reveal fields.
- `components/home/clinicStoryMotion.test.ts` — exact desktop/mobile boundary and reverse tests.
- `components/home/ClinicStory.tsx` — preserve gallery; replace video deck/callouts with sequence and zone overlay.
- `components/home/ClinicStory.test.tsx` — gallery preservation, handoff, fallback, reduced-motion, and patients-flow boundary.
- `components/home/clinicStory.module.css` — preserve gallery/sticky rules; replace video/callout rules with jaw host handoff rules.
- `app/layout.tsx` — add static hidden Netlify form definition only.
- `app/page.test.tsx` — assert gallery plus jaw fallback and following patients section remain server-rendered.
- `package.json` / `package-lock.json` — add `jaw:build`, `jaw:validate`, and direct `sharp@0.35.3` dev tooling; no runtime dependency.
- `COLLAB.md` — reserve files, record each gate, verification, localhost approval, and publication.

### Delete after replacement is green

- `components/home/jawSeekQueue.ts`
- `components/home/jawSeekQueue.test.ts`
- `components/home/jawStoryMotion.ts`
- `components/home/jawStoryMotion.test.ts`
- `components/home/jawTracking.ts`
- `components/home/jawTracking.test.ts`
- `scripts/encode-jaw-story.sh`
- `public/media/jaw-story/jaw-01-1080.mp4`
- `public/media/jaw-story/jaw-01-720.mp4`
- `public/media/jaw-story/jaw-02-1080.mp4`
- `public/media/jaw-story/jaw-02-720.mp4`
- `public/media/jaw-story/jaw-03-1080.mp4`
- `public/media/jaw-story/jaw-03-720.mp4`
- `public/media/jaw-story/jaw-04-1080.mp4`
- `public/media/jaw-story/jaw-04-720.mp4`
- `public/media/jaw-story/jaw-poster.jpg`

The abandoned `codex/runtime-jaw-3d` branch/worktree contributes no code or assets. Do not cherry-pick its commits. Remove its local worktree only during final cleanup, after verifying no unpushed user work exists; branch deletion is not part of this implementation.

---

### Task 1: Establish clean implementation worktree and approve Higgsfield master

**Files:**
- Create: `assets/jaw-sequence/source/jaw-closed-start.png`
- Create: `assets/jaw-sequence/source/jaw-open-end.png`
- Create: `assets/jaw-sequence/source/jaw-motion-master.mp4`
- Create: `assets/jaw-sequence/source/GENERATION.md`
- Modify: `COLLAB.md`

**Interfaces:**
- Consumes: approved local sources `/Users/goat/Downloads/Untitled design (5).png` and `/Users/goat/Downloads/Untitled design (4).png`, both 1920×1080.
- Produces: one visually approved approximately five-second 16:9 MP4 master and immutable source/provenance files for Task 2.

- [ ] **Step 1: Create isolated branch from current production source**

Run from repository root:

```bash
git fetch origin --prune
git worktree add .worktrees/higgsfield-jaw-sequence -b codex/higgsfield-jaw-sequence origin/main
git -C .worktrees/higgsfield-jaw-sequence cherry-pick 188398f
```

Then copy this approved plan from the design branch into the new worktree with `git show codex/jaw-scroll-sequence-design:docs/superpowers/plans/2026-08-14-jaw-scroll-sequence-implementation.md` and commit it. Expected: implementation branch contains current `origin/main`, approved spec, and plan; no app change.

- [ ] **Step 2: Claim exact implementation files before editing**

Add to `COLLAB.md`:

```markdown
## Current Task

- Status: Higgsfield master generation and approval gate
- Owner: Codex
- Branch: `codex/higgsfield-jaw-sequence`
- Base: current `origin/main`
- Task: replace current segmented jaw runtime while preserving gallery and patients section

## File Reservations

- Codex reserves the jaw source/media pipeline, `components/home/ClinicStory*`,
  `components/home/clinicStory*`, `components/home/jaw/**`,
  `app/problemy/**`, `app/layout.tsx`, `app/page.test.tsx`, `package.json`, and
  the listed legacy jaw files until localhost handoff.
```

Commit only ledger change after confirming no conflicting reservation.

- [ ] **Step 3: Store approved source pixels and hashes**

Run:

```bash
mkdir -p assets/jaw-sequence/source
cp '/Users/goat/Downloads/Untitled design (5).png' assets/jaw-sequence/source/jaw-closed-start.png
cp '/Users/goat/Downloads/Untitled design (4).png' assets/jaw-sequence/source/jaw-open-end.png
shasum -a 256 assets/jaw-sequence/source/jaw-closed-start.png assets/jaw-sequence/source/jaw-open-end.png
sips -g pixelWidth -g pixelHeight assets/jaw-sequence/source/jaw-closed-start.png assets/jaw-sequence/source/jaw-open-end.png
```

Expected: both report `pixelWidth: 1920`, `pixelHeight: 1080`; hashes are copied into `GENERATION.md`.

- [ ] **Step 4: Generate Higgsfield candidate with locked prompt**

Use closed frame as first frame and open frame as last frame. Use this exact prompt:

```text
Create one continuous cinematic dental-jaw motion between the supplied first and last frames. Preserve the exact same jaw identity, tooth count, tooth shapes, gums, blurred dental-clinic background, lighting, exposure, color palette, and 16:9 composition. Begin with the small closed jaw at the supplied slight three-quarter angle. Gradually enlarge it, open the upper and lower arches with a natural hinge-like motion, and rotate gently toward the mild top-down open view in the supplied end frame. Keep the full dental arch and all molars visible. End with a smooth ease-out and a stable hold on the supplied last frame. No cuts, camera teleport, background movement, room replacement, tooth morphing, extra teeth, missing teeth, lips, tongue, face, hands, instruments, blood, treatment, text, labels, symbols, arrows, glow, particles, lens flare, or motion after the final settle.
```

Locked settings: 16:9, approximately five seconds, no audio, first/last-frame mode, lowest motion-strength setting that still reaches the open frame. Export original-quality MP4.

- [ ] **Step 5: Visual reject/accept gate before encoding**

Inspect candidate at 0%, 25%, 50%, 75%, and 100%. Reject if tooth count changes, molars crop, room moves, jaw identity morphs, or last 0.4 seconds does not settle. Show candidate on localhost or as local media. Continue only after explicit user approval.

- [ ] **Step 6: Record generation and commit approved master**

Create `GENERATION.md` with exact prompt above and these keys: Provider, Mode, Aspect, Duration, Export resolution/fps/codec, Closed source SHA-256, Open source SHA-256, Master SHA-256, and User approval date. Populate every value from `ffmpeg -i` and `shasum -a 256`; do not transcribe guessed metadata. Commit:

```bash
git add COLLAB.md assets/jaw-sequence/source
git commit -m "assets: add approved jaw motion master"
```

---

### Task 2: Build and validate deterministic WebP sequences

**Files:**
- Create: `scripts/build-jaw-sequence.sh`
- Create: `scripts/validate-jaw-sequence.mjs`
- Create: `components/home/jaw/jawSequenceManifest.generated.ts`
- Create: `public/media/jaw-sequence/desktop/*.webp`
- Create: `public/media/jaw-sequence/mobile/*.webp`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: the three approved source assets from Task 1.
- Produces: `jawSequenceManifests.desktop` and `.mobile`, each containing `profile`, `width`, `height`, `frameCount`, `totalBytes`, `startFrame`, `endFrame`, and ordered `{ index, url, bytes, sha256 }` frames.

- [ ] **Step 1: Write failing media validator fixture tests inside the validator**

Export pure helpers from `scripts/validate-jaw-sequence.mjs`:

```js
export function validateOrderedFrames(frames, expectedCount) {
  const expected = Array.from({ length: expectedCount }, (_, i) => i + 1);
  const actual = frames.map((frame) => frame.index);
  if (actual.join(",") !== expected.join(",")) throw new Error("jaw frame ordering gap");
}

export function validateBudget(totalBytes, maxBytes, profile) {
  if (totalBytes > maxBytes) throw new Error(`${profile} jaw sequence exceeds byte budget`);
}
```

Add a Node self-test mode that passes gapped frames and an oversized total, expecting both exact errors.

- [ ] **Step 2: Run validator self-test and confirm RED**

Run:

```bash
node scripts/validate-jaw-sequence.mjs --self-test
```

Expected before file exists: `ERR_MODULE_NOT_FOUND`. After scaffold without checks: FAIL because bad fixture is accepted.

- [ ] **Step 3: Implement deterministic build script**

`build-jaw-sequence.sh` must:

```bash
#!/usr/bin/env bash
set -euo pipefail

desktop_dir="public/media/jaw-sequence/desktop"
mobile_dir="public/media/jaw-sequence/mobile"
master="assets/jaw-sequence/source/jaw-motion-master.mp4"
closed="assets/jaw-sequence/source/jaw-closed-start.png"
open="assets/jaw-sequence/source/jaw-open-end.png"
FFMPEG="${FFMPEG_BIN:-ffmpeg}"

command -v "$FFMPEG" >/dev/null 2>&1 || {
  echo "ffmpeg is required; set FFMPEG_BIN when it is not on PATH" >&2
  exit 1
}

mkdir -p "$desktop_dir" "$mobile_dir"
find "$desktop_dir" "$mobile_dir" -type f -name 'frame-*.webp' -delete

"$FFMPEG" -v error -i "$master" -vf "tpad=stop_mode=clone:stop_duration=5,fps=72/5,scale=1280:720:flags=lanczos" \
  -frames:v 72 -c:v libwebp -quality 82 -compression_level 6 "$desktop_dir/frame-%03d.webp"

"$FFMPEG" -v error -i "$master" -filter_complex \
  "[0:v]tpad=stop_mode=clone:stop_duration=5,fps=12,split=2[fg][bg];[bg]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,gblur=sigma=28[blur];[fg]scale=720:-2:flags=lanczos[fit];[blur][fit]overlay=(W-w)/2:(H-h)/2" \
  -frames:v 60 -c:v libwebp -quality 80 -compression_level 6 "$mobile_dir/frame-%03d.webp"

"$FFMPEG" -v error -i "$closed" -vf "scale=1280:720:flags=lanczos" -frames:v 1 \
  -c:v libwebp -quality 90 -compression_level 6 -y "$desktop_dir/frame-001.webp"
"$FFMPEG" -v error -i "$open" -vf "scale=1280:720:flags=lanczos" -frames:v 1 \
  -c:v libwebp -quality 90 -compression_level 6 -y "$desktop_dir/frame-072.webp"
```

Add the same blurred-cover + width-fit portrait filter for mobile endpoint frame 001 and 060. Invoke validator at script end.

- [ ] **Step 4: Implement validator and generated manifest**

Use direct `sharp@0.35.3` metadata/decode calls for every frame and Node `crypto.createHash("sha256")`. Rebuild expected endpoints into a temporary directory with the same Sharp operations and compare `stats().channels[].sumSquaredError`; expected difference is `0`. Emit stable TypeScript:

```ts
export type JawSequenceProfile = "desktop" | "mobile";

export type JawSequenceManifest = Readonly<{
  profile: JawSequenceProfile;
  width: number;
  height: number;
  frameCount: number;
  totalBytes: number;
  startFrame: number;
  endFrame: number;
  frames: readonly Readonly<{ index: number; url: string; bytes: number; sha256: string }>[];
}>;

```

The validator serializes the actual sorted arrays with this write step; no hand-authored frame list is allowed:

```js
const source = `${typeDeclarations}\nexport const jawSequenceManifests = ${JSON.stringify(manifests, null, 2)} as const satisfies Readonly<Record<JawSequenceProfile, JawSequenceManifest>>;\n`;
await writeFile("components/home/jaw/jawSequenceManifest.generated.ts", source, "utf8");
```

Budgets use binary bytes: desktop `8 * 1024 * 1024`, mobile `5 * 1024 * 1024`.

- [ ] **Step 5: Run build, tune quality only downward if budget fails, and verify GREEN**

Add direct deterministic build tooling and scripts:

```json
"devDependencies": { "sharp": "0.35.3" },
"jaw:build": "bash scripts/build-jaw-sequence.sh",
"jaw:validate": "node scripts/validate-jaw-sequence.mjs"
```

Follow the existing encoder convention: `FFMPEG_BIN` may point at an external executable when `ffmpeg` is not on `PATH`. The build script must fail before changing output when neither resolves.

Run:

```bash
npm run jaw:build
npm run jaw:validate
```

Expected: 72 desktop and 60 mobile frames; exact fixed dimensions; endpoint AE `0`; desktop ≤ 8 MiB; mobile ≤ 5 MiB; every WebP decodes.

- [ ] **Step 6: Commit media pipeline**

```bash
git add package.json package-lock.json scripts/build-jaw-sequence.sh scripts/validate-jaw-sequence.mjs \
  components/home/jaw/jawSequenceManifest.generated.ts public/media/jaw-sequence
git commit -m "build: generate validated jaw frame sequences"
```

---

### Task 3: Define one typed patient-content and analytics contract

**Files:**
- Create: `components/home/jaw/jawContent.ts`
- Create: `components/home/jaw/jawContent.test.ts`
- Create: `components/home/jaw/jawAnalytics.ts`
- Create: `components/home/jaw/jawAnalytics.test.ts`

**Interfaces:**
- Produces: `JawZoneId`, `JawProblem`, `JawZone`, `JAW_ZONES`, `JAW_ZONE_BY_SLUG`, `getJawZoneBySlug`, `getJawProblem`, `JAW_DISCLAIMER`, `ENTRY_EXAM_LABEL`, and `emitJawAnalytics`.
- Consumed by: zone overlay, demo routes, appointment form, and analytics in Tasks 7–8.

- [ ] **Step 1: Write failing content tests**

```ts
import { describe, expect, it } from "vitest";
import { ENTRY_EXAM_LABEL, JAW_DISCLAIMER, JAW_ZONES, getJawProblem, getJawZoneBySlug } from "./jawContent";

describe("jaw content", () => {
  it("exposes six unique routes and approved price/disclaimer", () => {
    expect(JAW_ZONES.map((zone) => zone.route)).toEqual([
      "/problemy/predne-zuby", "/problemy/crenove-zuby", "/problemy/stolicky",
      "/problemy/dasna", "/problemy/chybajuci-zub", "/problemy/neviem",
    ]);
    expect(new Set(JAW_ZONES.map((zone) => zone.route)).size).toBe(6);
    expect(ENTRY_EXAM_LABEL).toBe("Vstupné vyšetrenie — 100 EUR");
    expect(JAW_DISCLAIMER).toBe("Orientačná pomôcka. Presnú príčinu určí až vyšetrenie.");
  });

  it("rejects unknown slugs and unknown problem ids", () => {
    expect(getJawZoneBySlug("unknown")).toBeUndefined();
    expect(getJawProblem("molar", "unknown")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `npm test -- components/home/jaw/jawContent.test.ts`

Expected: FAIL with `Cannot find module './jawContent'`.

- [ ] **Step 3: Implement immutable content records**

Use exact types:

```ts
export type JawZoneId = "front" | "premolar" | "molar" | "gum" | "missing" | "unsure";
export type JawProblem = Readonly<{ id: string; patientLabel: string; destination: string }>;
export type JawZone = Readonly<{
  id: JawZoneId;
  slug: string;
  label: string;
  route: `/problemy/${string}`;
  problems: readonly JawProblem[];
}>;
```

Populate exact Slovak labels from spec:

```ts
front: ["Nepáči sa mi tvar alebo farba", "Odštiepený zub", "Medzera"]
premolar: ["Citlivosť na sladké alebo studené", "Vypadla plomba"]
molar: ["Bolí ma pri hryzení", "Pulzujúca bolesť", "Prasknutý zub"]
gum: ["Krvácajú pri čistení", "Ustupujú", "Zápach"]
missing: ["Chýba mi zub", "Nosím snímateľnú náhradu"]
unsure: []
```

Destinations remain descriptive service names only; no new prices/durations/diagnoses.

- [ ] **Step 4: Write failing analytics tests**

```ts
it("dispatches controlled ids only after consent", () => {
  const push = vi.fn();
  expect(emitJawAnalytics({ consent: false, event: "jaw_zone_click", zone: "molar" }, push)).toBe(false);
  expect(push).not.toHaveBeenCalled();
  expect(emitJawAnalytics({ consent: true, event: "jaw_problem_click", zone: "molar", problem: "pulsing" }, push)).toBe(true);
  expect(push).toHaveBeenCalledWith({ event: "jaw_problem_click", jaw_zone: "molar", jaw_problem: "pulsing" });
});
```

Also assert payload JSON never contains `name`, `phone`, `email`, `text`, or `diagnosis`.

- [ ] **Step 5: Implement no-op-safe analytics adapter and run GREEN**

```ts
export function emitJawAnalytics(
  input: JawAnalyticsInput,
  push: ((payload: Record<string, string>) => void) | undefined =
    typeof window === "undefined" ? undefined : window.dataLayer?.push.bind(window.dataLayer),
): boolean {
  if (!input.consent || !push) return false;
  const payload = { event: input.event, jaw_zone: input.zone, ...(input.problem ? { jaw_problem: input.problem } : {}) };
  push(payload);
  return true;
}
```

Declare the optional browser adapter in the same module so TypeScript remains strict:

```ts
declare global {
  interface Window {
    dataLayer?: { push: (payload: Record<string, string>) => void };
  }
}
```

Run: `npm test -- components/home/jaw/jawContent.test.ts components/home/jaw/jawAnalytics.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit content contract**

```bash
git add components/home/jaw/jawContent.ts components/home/jaw/jawContent.test.ts \
  components/home/jaw/jawAnalytics.ts components/home/jaw/jawAnalytics.test.ts
git commit -m "feat: define jaw patient navigation content"
```

---

### Task 4: Replace video timeline fields with pure sequence motion

**Files:**
- Modify: `components/home/clinicStoryMotion.ts`
- Modify: `components/home/clinicStoryMotion.test.ts`

**Interfaces:**
- Consumes: section-local progress, profile, frame count, and `exactEndDrawn`/`revealComplete` gates.
- Produces:

```ts
export type JawSequenceMotionState = Readonly<{
  grow: number;
  pan: number;
  zoom: number;
  blur: number;
  sequenceProgress: number;
  targetFrame: number;
  zonesVisible: boolean;
  interactive: boolean;
}>;

export function mapClinicStoryMotion(input: {
  progressVh: number;
  profile: "desktop" | "mobile";
  frameCount: number;
  exactEndDrawn: boolean;
  revealComplete: boolean;
}): JawSequenceMotionState;

export const MOBILE_PHASES = Object.freeze({
  galleryEnd: 90,
  snapEnd: 130,
  handoffEnd: 230,
  sequenceEnd: 600,
  zoneStart: 600,
  storyEnd: 780,
});
```

- [ ] **Step 1: Rewrite boundary tests before production code**

Desktop table:

```ts
it.each([
  [0, 0, 0, 0, 0],
  [84, 1, 0, 0, 0],
  [380, 1, 1, 0, 0],
  [442, 1, 1, 0.62, 0],
  [480, 1, 1, 1, 0],
  [660, 1, 1, 1, 0.5],
  [840, 1, 1, 1, 1],
  [1030, 1, 1, 1, 1],
])("maps desktop %s", (progressVh, grow, pan, zoom, sequenceProgress) => {
  const state = mapClinicStoryMotion({ progressVh, profile: "desktop", frameCount: 72, exactEndDrawn: false, revealComplete: false });
  expect(state.grow).toBeCloseTo(grow, 2);
  expect(state.pan).toBeCloseTo(pan, 2);
  expect(state.zoom).toBeCloseTo(zoom, 2);
  expect(state.sequenceProgress).toBeCloseTo(sequenceProgress, 2);
});
```

Add `boundary - 0.01`, exact boundary, and `boundary + 0.01` for `84`, `380`, `442`, `480`, `840`, and `1030`; reverse inputs must return identical states. Mobile locked boundaries are `0–90` native gallery range, `90–130` auto-snap, `130–230` handoff, `230–600` sequence, and `600–780` zone/dwell. Test `89.99/90/90.01`, `129.99/130/130.01`, `229.99/230/230.01`, `599.99/600/600.01`, and `779.99/780/780.01`.

- [ ] **Step 2: Run tests and confirm RED against old video state**

Run: `npm test -- components/home/clinicStoryMotion.test.ts`

Expected: FAIL because `sequenceProgress`, `targetFrame`, `zonesVisible`, and `interactive` do not exist.

- [ ] **Step 3: Implement pure clamp/segment mapping**

Use:

```ts
const range = (value: number, start: number, end: number) => clamp01((value - start) / (end - start));
const targetFrame = 1 + Math.round(sequenceProgress * (frameCount - 1));
const zonesVisible = profile === "desktop" ? progressVh >= 840 : progressVh >= MOBILE_PHASES.zoneStart;
const interactive = zonesVisible && exactEndDrawn && revealComplete;
```

On reverse below zone threshold, `zonesVisible` and `interactive` become false immediately; damping applies to frame following in `ClinicStory`, not to interaction safety.

- [ ] **Step 4: Verify motion GREEN**

Run: `npm test -- components/home/clinicStoryMotion.test.ts`

Expected: all boundaries, clamp, reverse, and gate tests pass.

- [ ] **Step 5: Commit pure motion**

```bash
git add components/home/clinicStoryMotion.ts components/home/clinicStoryMotion.test.ts
git commit -m "refactor: map clinic story to jaw frames"
```

---

### Task 5: Build bounded direction-aware frame loader

**Files:**
- Create: `components/home/jaw/jawSequenceLoader.ts`
- Create: `components/home/jaw/jawSequenceLoader.test.ts`

**Interfaces:**
- Consumes: `JawSequenceManifest` from Task 2 and browser decode functions.
- Produces:

```ts
export type DecodedJawFrame = Readonly<{
  index: number;
  source: CanvasImageSource;
  close: () => void;
}>;

export type JawSequenceLoader = Readonly<{
  setTarget: (index: number, direction: -1 | 0 | 1) => void;
  getExact: (index: number) => DecodedJawFrame | undefined;
  getNearest: (index: number) => DecodedJawFrame | undefined;
  subscribe: (listener: () => void) => () => void;
  setVisible: (visible: boolean) => void;
  inspect: () => Readonly<{ decoded: number; pending: number; target: number }>;
  dispose: () => void;
}>;

export function createJawSequenceLoader(options: {
  manifest: JawSequenceManifest;
  cacheLimit: number;
  decode: (url: string, signal: AbortSignal) => Promise<DecodedJawFrame>;
}): JawSequenceLoader;
```

- [ ] **Step 1: Write failing queue/cache tests**

Use controllable deferred decode promises. Required assertions:

```ts
loader.setTarget(10, 1); // priority 10, 11, 9
loader.setTarget(40, 1); // stale 10-window loses priority; 40, 41, 39 next
loader.setTarget(20, -1); // priority 20, 19, 21
expect(loader.inspect().pending).toBeLessThanOrEqual(3);
```

Fill beyond 12/8 and assert cache size cap. Assert evicted `close` exactly once. Assert repeated target creates one decode per frame. Assert hidden state launches no new decode and visible state resumes latest target. Assert `getNearest` returns an already-decoded frame rather than `undefined` when exact target is absent.

- [ ] **Step 2: Run focused test and confirm RED**

Run: `npm test -- components/home/jaw/jawSequenceLoader.test.ts`

Expected: FAIL with missing module.

- [ ] **Step 3: Implement loader with three-frame priority window and protected endpoints**

Runtime frame numbers are one-based and match filenames/manifests: `1..frameCount`. Normalize every requested frame into that range. Priority order:

```ts
direction === 1 ? [target, target + 1, target - 1] :
direction === -1 ? [target, target - 1, target + 1] :
[target, target - 1, target + 1]
```

Keep exact start/end, current, previous, and next protected during eviction. Abort pending decodes outside current priority window. Store one pending promise per index. On disposal: abort all, close every cached bitmap once, clear listeners.

- [ ] **Step 4: Implement browser decoder fallback**

Primary path:

```ts
const response = await fetch(url, { signal });
if (!response.ok) throw new Error(`jaw frame ${url} failed: ${response.status}`);
const blob = await response.blob();
if ("createImageBitmap" in window) {
  const bitmap = await createImageBitmap(blob);
  return { index, source: bitmap, close: () => bitmap.close() };
}
```

Fallback creates object URL, awaits `image.decode()`, revokes URL after load, and returns `close` that clears `src` once.

- [ ] **Step 5: Run GREEN and leak checks**

Run: `npm test -- components/home/jaw/jawSequenceLoader.test.ts`

Expected: all priority, cancellation, cache, visibility, fallback, and exact-once disposal tests pass.

- [ ] **Step 6: Commit loader**

```bash
git add components/home/jaw/jawSequenceLoader.ts components/home/jaw/jawSequenceLoader.test.ts
git commit -m "feat: load jaw frames with bounded cache"
```

---

### Task 6: Render nonblank Canvas sequence with static fallbacks

**Files:**
- Create: `components/home/jaw/JawFrameSequence.tsx`
- Create: `components/home/jaw/JawFrameSequence.test.tsx`
- Create: `components/home/jaw/jawExperience.module.css`

**Interfaces:**
- Consumes: loader and generated manifests from Tasks 2/5.
- Produces:

```ts
export type JawFrameSequenceProps = Readonly<{
  profile: "desktop" | "mobile";
  targetFrame: number;
  direction: -1 | 0 | 1;
  reducedMotion: boolean;
  visible: boolean;
  onExactFrameDrawn: (index: number) => void;
  onPermanentFailure: () => void;
}>;
```

- [ ] **Step 1: Write failing component tests**

Mock loader and Canvas context. Assert:

- canvas has `aria-hidden="true"` and no accessible role;
- approved closed `<img>` remains visible until first canvas draw;
- nearest decoded frame draws when exact is unavailable;
- `onExactFrameDrawn` fires only after exact frame `drawImage` succeeds;
- resize caps backing size at CSS size × 1.5 desktop/1.25 mobile;
- hidden document pauses loader/draw; visible resumes latest target;
- three consecutive requested-window failures activate open static fallback once;
- reduced motion creates no loader and renders open static image.

- [ ] **Step 2: Run focused test and confirm RED**

Run: `npm test -- components/home/jaw/JawFrameSequence.test.tsx`

Expected: FAIL with missing component.

- [ ] **Step 3: Implement first-frame continuity and drawing**

Component DOM order:

```tsx
<div className={styles.sequenceStage} data-jaw-sequence-state={state}>
  <img className={styles.staticFrame} src={fallbackSrc} alt="" aria-hidden="true" />
  {!reducedMotion && <canvas ref={canvasRef} className={styles.sequenceCanvas} aria-hidden="true" />}
</div>
```

Draw cover/contain without cropping jaw: use manifest frame aspect, fit to canvas with `scale = Math.min(canvasWidth/frameWidth, canvasHeight/frameHeight)` because mobile frames already include blurred cover. Keep old pixels until a decoded new frame exists. Never clear before successful `drawImage`.

- [ ] **Step 4: Implement visibility, resize, and failure ownership**

One `ResizeObserver` owns CSS/backing dimensions. One `visibilitychange` listener owns loader pause/resume. Error counter resets on successful exact or nearest draw; permanent failure fires once and swaps `fallbackSrc` to approved open endpoint. Dispose observer, listener, loader, and pending rAF exactly once.

- [ ] **Step 5: Run GREEN plus adjacent loader tests**

Run:

```bash
npm test -- components/home/jaw/JawFrameSequence.test.tsx components/home/jaw/jawSequenceLoader.test.ts
npm run typecheck
```

Expected: PASS; no `any`, no state update after unmount.

- [ ] **Step 6: Commit player**

```bash
git add components/home/jaw/JawFrameSequence.tsx components/home/jaw/JawFrameSequence.test.tsx \
  components/home/jaw/jawExperience.module.css
git commit -m "feat: render scroll-driven jaw frame sequence"
```

---

### Task 7: Add accessible branded zone interaction

**Files:**
- Create: `components/home/jaw/JawZoneOverlay.tsx`
- Create: `components/home/jaw/JawZoneOverlay.test.tsx`
- Modify: `components/home/jaw/jawExperience.module.css`

**Interfaces:**
- Consumes: `JAW_ZONES`, `emitJawAnalytics`, `interactive`, `revealStartedAt`, and exact open-frame normalized geometry.
- Produces: `JawZoneOverlay` with seven visual surfaces mapped to four jaw zones plus direct missing/unsure links.

- [ ] **Step 1: Write failing mapping and interaction tests**

Test exact surface map:

```ts
expect(screen.getAllByTestId("jaw-hit-surface")).toHaveLength(7);
expect(screen.getAllByRole("button", { name: /Predné zuby|Črenové zuby|Stoličky|Ďasná/ })).toHaveLength(7);
expect(screen.getByRole("link", { name: "Chýbajúci zub" })).toHaveAttribute("href", "/problemy/chybajuci-zub");
expect(screen.getByRole("link", { name: "Neviem / bolí to celé" })).toHaveAttribute("href", "/problemy/neviem");
```

Assert left/right premolar share `premolar`, left/right molar share `molar`, upper/lower gums share `gum`. Before interactive: `aria-disabled=true`, `tabIndex=-1`, `pointer-events` class. Desktop hover/focus opens card; click pins; pointer entering card keeps it open; Escape closes and restores visible focus. Mobile first tap opens bottom panel; close restores focus. Reverse `interactive true→false` closes immediately and moves focus to heading safe target.

- [ ] **Step 2: Run focused test and confirm RED**

Run: `npm test -- components/home/jaw/JawZoneOverlay.test.tsx`

Expected: FAIL with missing component.

- [ ] **Step 3: Implement normalized SVG geometry and real controls**

Use one 1920×1080 coordinate system with normalized polygons stored as fractions. Required IDs:

```ts
type JawSurfaceId = "front" | "premolar-left" | "premolar-right" | "molar-left" | "molar-right" | "gum-upper" | "gum-lower";
const SURFACES: readonly { id: JawSurfaceId; zone: "front" | "premolar" | "molar" | "gum"; points: string }[] = [
  { id: "front", zone: "front", points: "790,350 1130,350 1150,710 770,710" },
  { id: "premolar-left", zone: "premolar", points: "690,365 805,350 780,720 660,740" },
  { id: "premolar-right", zone: "premolar", points: "1115,350 1230,365 1260,740 1140,720" },
  { id: "molar-left", zone: "molar", points: "620,385 700,365 660,740 605,715" },
  { id: "molar-right", zone: "molar", points: "1220,365 1300,385 1315,715 1260,740" },
  { id: "gum-upper", zone: "gum", points: "620,300 1300,300 1270,405 650,405" },
  { id: "gum-lower", zone: "gum", points: "620,675 1300,675 1260,800 660,800" },
];
```

These are locked first-pass 1920×1080 coordinates. Task 10 may adjust numbers only from overlay measurements against the approved open endpoint; coordinate changes require a focused geometry test and separate commit.

Render decorative SVG polygons with `aria-hidden`, while absolutely positioned HTML buttons cover the same normalized bounding boxes. Minimum control size 44×44. Do not render any line or arrow element.

- [ ] **Step 4: Implement stagger and interaction state machine**

Reveal order uses CSS custom property `--zone-index` with delays `0ms`, `180ms`, `360ms`, `540ms`; paired left/right surfaces share one logical reveal step. Parent activates controls only after `540ms + transition duration`. State values:

```ts
type OverlayState = { openZone: JawZoneId | null; pinned: boolean; mode: "desktop" | "mobile" };
```

Links append validated `?problem=${problem.id}`. Analytics call happens on zone/problem activation only and never blocks navigation.

- [ ] **Step 5: Implement visual contract**

CSS must provide thin gold border, low-opacity taupe/gold fill, hover/focus glow, selected state, `:focus-visible`, desktop anchored card, and `@media (max-width: 767px)` bottom panel. Add `@media (prefers-reduced-motion: reduce)` to remove transforms/delays. Test source CSS for absence of `.leader`, `line`, and arrow assets.

- [ ] **Step 6: Run GREEN and accessibility checks**

Run:

```bash
npm test -- components/home/jaw/JawZoneOverlay.test.tsx components/home/jaw/jawContent.test.ts
npm run lint
npm run typecheck
```

Expected: PASS; no nested interactive elements, seven surfaces/four logical jaw zones, two direct links.

- [ ] **Step 7: Commit overlay**

```bash
git add components/home/jaw/JawZoneOverlay.tsx components/home/jaw/JawZoneOverlay.test.tsx \
  components/home/jaw/jawExperience.module.css
git commit -m "feat: add accessible jaw problem zones"
```

---

### Task 8: Build six demo routes and Netlify appointment flow

**Files:**
- Create: `components/home/jaw/JawAppointmentForm.tsx`
- Create: `components/home/jaw/JawAppointmentForm.test.tsx`
- Create: `app/problemy/[zona]/page.tsx`
- Create: `app/problemy/[zona]/page.test.tsx`
- Create: `app/problemy/problemy.module.css`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `JAW_ZONES`, validated zone/problem records, `ENTRY_EXAM_LABEL`, `JAW_DISCLAIMER`, analytics adapter.
- Produces: static params for six slugs, validated demo pages, and a Netlify-compatible appointment form.

- [ ] **Step 1: Re-read Next.js 16 route contracts**

Run:

```bash
sed -n '1,240p' node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md
find node_modules/next/dist/docs -path '*dynamic*segment*' -o -path '*server-and-client-components*' | sort
```

Use async `params` and `searchParams`; do not use legacy synchronous access.

- [ ] **Step 2: Write failing route tests**

Assert:

```ts
expect(generateStaticParams()).toEqual([
  { zona: "predne-zuby" }, { zona: "crenove-zuby" }, { zona: "stolicky" },
  { zona: "dasna" }, { zona: "chybajuci-zub" }, { zona: "neviem" },
]);
```

Render page with promised params/searchParams. Valid problem displays patient label. Invalid problem displays no selected-problem claim. Unknown slug calls mocked `notFound`. Every valid page includes `Demo obsahu`, disclaimer, and exact price label.

- [ ] **Step 3: Run route test and confirm RED**

Run: `npm test -- 'app/problemy/[zona]/page.test.tsx'`

Expected: FAIL because route does not exist.

- [ ] **Step 4: Implement server route**

```tsx
export function generateStaticParams() {
  return JAW_ZONES.map(({ slug }) => ({ zona: slug }));
}

export default async function ProblemPage({ params, searchParams }: PageProps<"/problemy/[zona]">) {
  const { zona } = await params;
  const query = await searchParams;
  const zone = getJawZoneBySlug(zona);
  if (!zone) notFound();
  const problemValue = Array.isArray(query.problem) ? query.problem[0] : query.problem;
  const problem = problemValue ? getJawProblem(zone.id, problemValue) : undefined;
  return (
    <main className={styles.page}>
      <p className={styles.marker}>Demo obsahu</p>
      <h1>{zone.label}</h1>
      {problem ? <p data-selected-problem>{problem.patientLabel}</p> : null}
      <p>{JAW_DISCLAIMER}</p>
      <p>{ENTRY_EXAM_LABEL}</p>
      <JawAppointmentForm zone={zone} problem={problem} />
    </main>
  );
}
```

Do not invent clinical content. Page includes only zone title, marker, valid selected problem, disclaimer, form, and 100 EUR label.

- [ ] **Step 5: Write failing form tests**

Cover:

- hidden zone/problem and exact examination label;
- enabled visually hidden text honeypot `bot-field` remains blank in `FormData`;
- URL-encoded POST to `/` with `Content-Type: application/x-www-form-urlencoded`;
- duplicate click creates one request;
- non-OK and network error preserve name/phone/email and show retry plus clinic phone;
- success appears only after `response.ok`;
- CTA analytics contains controlled IDs only.

- [ ] **Step 6: Implement form and static Netlify definition**

Interactive form fields:

```tsx
<form name="jaw-appointment" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" onSubmit={handleSubmit}>
  <input type="hidden" name="form-name" value="jaw-appointment" />
  <input className={styles.honeypot} name="bot-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />
  <input name="name" required autoComplete="name" />
  <input name="phone" type="tel" required autoComplete="tel" />
  <input name="email" type="email" autoComplete="email" />
  <input type="hidden" name="zone" value={zone.id} />
  <input type="hidden" name="problem" value={problem?.id ?? ""} />
  <input type="hidden" name="examination" value={ENTRY_EXAM_LABEL} />
  <input name="consent" type="checkbox" required />
  <button type="submit" disabled={submitting}>Objednať vstupné vyšetrenie</button>
</form>
```

Add static hidden form with identical field names in `app/layout.tsx` for Netlify build detection. Honeypot there may be hidden; interactive honeypot must be a real text input hidden by clipping CSS, not `type="hidden"`.

- [ ] **Step 7: Run route/form GREEN**

Run:

```bash
npm test -- 'app/problemy/[zona]/page.test.tsx' components/home/jaw/JawAppointmentForm.test.tsx
npm run lint
npm run typecheck
```

Expected: PASS.

- [ ] **Step 8: Commit demo flow**

```bash
git add app/layout.tsx app/problemy components/home/jaw/JawAppointmentForm.tsx \
  components/home/jaw/JawAppointmentForm.test.tsx
git commit -m "feat: add jaw problem demo booking routes"
```

---

### Task 9: Integrate sequence into ClinicStory and delete old runtime

**Files:**
- Modify: `components/home/ClinicStory.tsx`
- Modify: `components/home/ClinicStory.test.tsx`
- Modify: `components/home/clinicStory.module.css`
- Modify: `app/page.test.tsx`
- Delete: all legacy files listed in File Map.

**Interfaces:**
- Consumes: motion mapper, `JawFrameSequence`, `JawZoneOverlay`, manifest, and content routes.
- Produces: one `ClinicStory` with intact gallery, final-detail handoff, jaw sequence, accessible fallback, and normal-flow `PatientsSection` after release.

- [ ] **Step 1: Rewrite integration tests before deleting old runtime**

Required assertions:

```ts
expect(screen.getAllByTestId("clinic-frame")).toHaveLength(photoFrames.length);
expect(screen.getAllByTestId("clinic-frame").map((node) => node.dataset.frameId)).toEqual(photoFrames.map((frame) => frame.id));
expect(screen.getByTestId("clinic-handoff")).toHaveAttribute("data-frame-id", "detail");
expect(screen.getByTestId("clinic-story")).toHaveAttribute("data-desktop-vh", "1030");
expect(screen.getByTestId("jaw-noscript-fallback")).toHaveTextContent("Kde vás to trápi?");
expect(screen.getAllByRole("link", { name: /Predné zuby|Črenové zuby|Stoličky|Ďasná|Chýbajúci zub|Neviem/ })).toHaveLength(6);
```

Assert no `<video>` or old callout text. Assert reduced motion uses open static endpoint and routes. Assert permanent sequence failure keeps every gallery frame and story geometry unchanged. `app/page.test.tsx` must confirm `PatientsSection` follows `ClinicStory` and its `data-header-light="true"` remains.

- [ ] **Step 2: Run integration tests and confirm RED**

Run:

```bash
npm test -- components/home/ClinicStory.test.tsx app/page.test.tsx
```

Expected: FAIL because old `<video>` deck and callouts remain, sequence/fallback do not exist.

- [ ] **Step 3: Replace video internals without touching gallery markup**

Keep existing gallery cards, strip travel measurement, sticky host, final-detail transform, and native mobile scroller. Replace imports/usages of `jawSeekQueue`, `jawStoryMotion`, and `jawTracking` with:

```tsx
<JawFrameSequence
  profile={profile}
  targetFrame={motion.targetFrame}
  direction={direction}
  reducedMotion={reducedMotion}
  visible={storyVisible}
  onExactFrameDrawn={setExactFrameDrawn}
  onPermanentFailure={setSequenceFailed}
/>
<JawZoneOverlay
  interactive={motion.interactive || sequenceFailed || reducedMotion}
  visible={motion.zonesVisible || sequenceFailed || reducedMotion}
  analyticsConsent={analyticsConsent}
/>
```

Server-render a `<noscript>` block with open image, heading, disclaimer, and six text links. Canvas remains decorative.

- [ ] **Step 4: Add persistent critically damped frame follower**

Keep raw scroll target separate from damped value. One rAF loop continues until error and velocity settle:

```ts
const next = stepCriticallyDamped({ current, velocity, target, dt, settleMs: 180 });
const targetFrame = 1 + Math.round(next.current * (manifest.frameCount - 1));
```

Raw reverse crossing below zone threshold disables interaction in the same scroll event; damped pixels may continue reversing. Never intercept scroll. Pause rAF while hidden; resume latest target.

- [ ] **Step 5: Replace styling, preserve sticky viability, and keep patient flow**

Do not add `overflow: hidden` to any sticky ancestor. Use clipping only inside jaw media layer. Final detail image, blur layer, sequence, overlay, and fallback occupy the same sticky viewport. At story release, `PatientsSection` enters normal flow. Preserve header and before/after-control changes through `bf59253`; do not edit `SiteHeader`, `MobileMenu`, hero styles/tests, or patients files.

- [ ] **Step 6: Delete old MP4/video tracking runtime**

Delete exact legacy list from File Map. Then run:

```bash
rg -n "jawSeekQueue|jawStoryMotion|jawTracking|jaw-0[1-4]|jaw-poster|<video|requestVideoFrameCallback" \
  components app scripts public package.json
find public/media/jaw-story -type f 2>/dev/null
```

Expected: no runtime references and no old media files. Remove empty `public/media/jaw-story` directory.

- [ ] **Step 7: Run integrated GREEN**

```bash
npm test -- components/home/ClinicStory.test.tsx components/home/clinicStoryMotion.test.ts \
  components/home/jaw app/page.test.tsx 'app/problemy/[zona]/page.test.tsx'
npm run jaw:validate
npm run lint
npm run typecheck
```

Expected: PASS; gallery count/order preserved, no old video runtime, patient section still follows.

- [ ] **Step 8: Commit integration and deletion**

```bash
git add -A components/home app scripts public/media package.json
git commit -m "feat: replace jaw video with Higgsfield sequence"
```

---

### Task 10: Full verification, localhost approval, and controlled publication

**Files:**
- Modify: `COLLAB.md`
- No product file changes unless a failing check produces a separately tested fix commit.

**Interfaces:**
- Consumes: complete Task 1–9 branch.
- Produces: evidence-backed localhost handoff; after user approval only, pushed `main`, mirrored `develop`, and checked Netlify deployment.

- [ ] **Step 1: Run complete automated verification**

```bash
npm test
npm run jaw:validate
npm run lint
npm run typecheck
npm run build
git diff --check origin/main...HEAD
git grep -nEI 'ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9_-]{20,}' -- . ':!package-lock.json'
rg -n "three|WebGL|WebGPU|GLB|OrbitControls|jawSeekQueue|jawStoryMotion|jawTracking|requestVideoFrameCallback|preventDefault\(" \
  components/home app scripts package.json
```

Expected: all tests/checks pass; credential scan empty; obsolete-runtime scan empty except prose in approved docs.

- [ ] **Step 2: Verify generated/static form output**

After `npm run build`, inspect built route output or run production server. Assert HTML contains:

```text
name="jaw-appointment"
name="form-name"
name="bot-field"
name="zone"
name="problem"
Vstupné vyšetrenie — 100 EUR
```

Expected: form detector sees exact static names; no medical free-text field.

- [ ] **Step 3: Start one localhost server from implementation worktree**

```bash
npm run dev
```

Use `http://localhost:3000/`. Stop stale server first if it serves another worktree; do not start duplicate ports.

- [ ] **Step 4: Browser-audit desktop and mobile**

At `1920×1080`, `1440×900`, `375×812`, and `390×844`, record screenshots and measurements for:

- header behavior from incoming main unchanged;
- every gallery image appears, right-to-left pan runs before detail expansion;
- `detail` image expands, blurs, and jaw appears in same sticky viewport;
- smooth forward/reverse frame motion via trackpad, wheel, keyboard, scrollbar, and touch;
- no blank frame under coarse jumps;
- exact open frame before zones activate;
- seven surfaces align; no arrows/leaders; hover/focus/tap behavior works;
- all six demo routes and query-prefilled form work;
- reduced motion and permanent-failure fallbacks retain gallery;
- patient section remains reachable and header switches there;
- `document.documentElement.scrollWidth === document.documentElement.clientWidth`;
- console has zero errors.

- [ ] **Step 5: Performance and memory audit**

Use browser instrumentation or test-only loader inspector. During sustained scrub assert decoded cache ≤12 desktop/≤8 mobile, pending decode window ≤3, DPR caps respected, hidden tab pauses new work, evicted bitmaps close, and final dwell makes no continuous render/decode requests.

- [ ] **Step 6: Update collaboration ledger and push feature branch**

Record commits, media byte totals, viewport evidence, test counts, remaining audit advisories, and `localhost approval required`. Release no reservation yet. Commit ledger and push:

```bash
git add COLLAB.md
git commit -m "docs: hand off Higgsfield jaw sequence"
git push -u origin codex/higgsfield-jaw-sequence
```

- [ ] **Step 7: Stop for explicit localhost approval**

Do not merge product changes. Give user localhost URL and concise review checklist. Continue only after explicit approval.

- [ ] **Step 8: Publish approved work to production source**

After approval:

```bash
git fetch origin --prune
git checkout main
git pull --ff-only origin main
git merge --ff-only codex/higgsfield-jaw-sequence
git push origin main
git checkout develop
git merge --ff-only main
git push origin develop
```

If `main` advanced after feature work, do not force or bypass. Merge current `origin/main` into the owned feature branch, rerun full verification and localhost smoke, then fast-forward main.

- [ ] **Step 9: Verify Netlify and close handoff**

Wait for Netlify deployment tied to exact pushed `main` SHA. Check homepage, one jaw zone route, form static definition, assets, console, and mobile viewport. Update `COLLAB.md` with live URL and deployed SHA. Only then release file reservations.

---

## Final self-review checklist

- [ ] Every spec section maps to at least one task.
- [ ] No runtime 3D, video scrub, arrows, or leader lines remain.
- [ ] Gallery and `PatientsSection` regression tests exist before deletion.
- [ ] Higgsfield media has explicit user approval gate before encoding.
- [ ] Desktop/mobile frame counts, dimensions, endpoints, hashes, and budgets are deterministic.
- [ ] Loader/cache/fallback/reverse/visibility behavior has focused tests.
- [ ] Seven surfaces, four jaw zones, and two direct entries are accessible.
- [ ] Six routes, query validation, disclaimer, and 100 EUR form context use one typed content source.
- [ ] No-JS, reduced-motion, slow-load, and permanent-failure paths stay navigable.
- [ ] Analytics is consent-gated and accepts controlled IDs only.
- [ ] Main publication is blocked on localhost approval and current-main recheck.
