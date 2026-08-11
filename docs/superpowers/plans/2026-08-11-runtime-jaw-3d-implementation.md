# Runtime 3D Jaw Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the segmented jaw-video scrub with one licensed realtime Three.js jaw that scrolls through arrival, opening, zone separation, then becomes a four-zone patient problem and appointment interface.

**Architecture:** Keep `ClinicStory` as the single sticky gallery-to-jaw timeline. Move jaw work into focused files: pure timeline mapping, validated model contract, direct Three.js controller, accessible HTML overlay, typed patient content, detail panel, and Netlify form. Load Three.js and the GLB only near the handoff; retain static HTML and poster fallbacks when WebGL or motion is unavailable.

**Tech Stack:** Next.js 16.3 App Router, React 19.2, TypeScript 5.9, Three.js 0.185.1, Vitest 4.1, React Testing Library, CSS Modules, Blender 4.0.5 or newer, glTF Transform 4.4.2, Meshopt.

## Global Constraints

- Start implementation from current `origin/main` on an owned `codex/<topic>` branch or isolated worktree. Read `COLLAB.md`, `AI_WORKFLOW.md`, and `AGENTS.md`; fetch and reserve files before edits.
- Preserve one sticky viewport for gallery, photograph 7, blur handoff, jaw choreography, and interactive dwell. No nested overflow ancestor around sticky.
- Native document scroll remains the only motion input. Never intercept wheel, trackpad, keyboard, scrollbar, or touch.
- Desktop timeline uses `0–84` grow, `84–380` pan, `380–480` photo zoom, `442–480` blur, `447–480` jaw arrival, `480–660` opening, `660–840` zone separation, and `840–1020` fixed interaction.
- Mobile keeps native gallery swipe, then `40vh` auto-snap, `100vh` handoff, `180vh` opening, `180vh` zone separation, and `160vh` fixed interaction.
- Click, touch, raycast, and keyboard zone interaction stay disabled until final geometry is fixed.
- Categories remain exactly `front`, `premolar`, `molar`, and `gum`; left/right hit regions share content.
- Model source is “Free Teeth Base Mesh” by ferrumiron6 under CC BY 4.0. Visible attribution, source URL, license URL, hashes, and modification summary are mandatory.
- Runtime GLB budgets: desktop no more than `20,000` triangles and `3 MiB`; mobile `9,000–12,000` triangles and no more than `2 MiB`.
- Device-pixel-ratio caps: desktop `1.5`, mobile `1.25`.
- Reduced-motion and WebGL-failure paths expose all four zones, all problem/solution content, and appointment CTA without scroll choreography.
- Do not invent diagnosis, treatment guarantee, price, or duration. Use only official prices in the approved design spec.
- Do not load old jaw MP4 clips after successful WebGL initialization. Keep them in repository until localhost approval, then remove them in publication cleanup.
- No application commit reaches `main` before explicit localhost approval. Feature-branch TDD commits are allowed and required.

## File Structure

### Asset and build pipeline

- `assets/jaw-source/Teeth_Base_Mesh_Modeling.blend` — canonical licensed Blender source.
- `assets/jaw-source/LICENSE.md` — CC BY attribution, hashes, source, and modification record.
- `scripts/prepare-jaw-model.py` — selects one jaw, separates teeth, assigns FDI names, creates anchors/hit proxies, creates mobile LOD, exports GLBs and posters.
- `scripts/validate-jaw-model.mjs` — validates names, counts, bounds, attribution metadata, triangle/file budgets, and GLB decoding.
- `public/media/jaw/jaw-desktop.glb` — desktop model.
- `public/media/jaw/jaw-mobile.glb` — mobile LOD.
- `public/media/jaw/jaw-poster.webp` — initial/fallback continuity frame.
- `public/media/jaw/jaw-fallback.webp` — final separated interactive pose.

### Runtime and UI

- `components/home/clinicStoryMotion.ts` — complete gallery and normalized jaw phase mapping.
- `components/home/jaw/jawModelContract.ts` — required FDI/group/anchor names and runtime validation.
- `components/home/jaw/jawPose.ts` — pure jaw transform calculation from normalized phases and canonical bounds.
- `components/home/jaw/JawSceneController.ts` — renderer, scene, model, camera, lighting, raycasting, projection, lifecycle.
- `components/home/jaw/jawContent.ts` — four zones, patient-language problems, possible solutions, official prices.
- `components/home/jaw/JawZoneOverlay.tsx` — accessible zone buttons and projected SVG leaders.
- `components/home/jaw/JawDetailPanel.tsx` — zone → problem → solution states.
- `components/home/jaw/JawAppointmentForm.tsx` — Netlify form and submission state.
- `components/home/jaw/NetlifyJawFormDefinition.tsx` — always-rendered hidden form definition for Netlify build-time detection.
- `components/home/jaw/JawExperience.tsx` — client orchestration, lazy model load, fallback, panel state, scene lifecycle.
- `components/home/jaw/jawExperience.module.css` — canvas, labels, right panel, mobile sheet, fallbacks.
- `components/home/ClinicStory.tsx` — gallery handoff plus lazy `JawExperience`; old video deck removed.
- `components/home/clinicStory.module.css` — story height, layering, handoff, jaw host, reduced motion.

### Tests

- `components/home/clinicStoryMotion.test.ts`
- `components/home/jaw/jawModelContract.test.ts`
- `components/home/jaw/jawPose.test.ts`
- `components/home/jaw/jawContent.test.ts`
- `components/home/jaw/JawDetailPanel.test.tsx`
- `components/home/jaw/JawAppointmentForm.test.tsx`
- `components/home/jaw/JawExperience.test.tsx`
- `components/home/ClinicStory.test.tsx`
- `app/page.test.tsx`

---

### Task 1: Licensed model pipeline and deterministic assets

**Files:**
- Create: `assets/jaw-source/Teeth_Base_Mesh_Modeling.blend`
- Create: `assets/jaw-source/LICENSE.md`
- Create: `scripts/prepare-jaw-model.py`
- Create: `scripts/validate-jaw-model.mjs`
- Create: `public/media/jaw/jaw-desktop.glb`
- Create: `public/media/jaw/jaw-mobile.glb`
- Create: `public/media/jaw/jaw-poster.webp`
- Create: `public/media/jaw/jaw-fallback.webp`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: `/Users/goat/Downloads/free-teeth-base-mesh.zip`, audited SHA-256 `f233e4cd8c75b976eae3dc1542694cd23d7a98a7411bcb2d7d6c439ac09b42b8`.
- Produces: two GLBs containing `tooth.11`–`tooth.48`, `gum.upper`, `gum.lower`, seven `anchor.*` nodes, seven `hit.*` nodes, and root attribution extras; two WebP fallbacks.

- [ ] **Step 1: Verify source and Blender preflight**

Run:

```bash
shasum -a 256 /Users/goat/Downloads/free-teeth-base-mesh.zip
test -x /Applications/Blender.app/Contents/MacOS/Blender
```

Expected: hash equals audited value. Blender check currently fails on this machine; install Blender 4.0.5 or newer from `https://www.blender.org/download/` before continuing. Do not substitute an online converter.

- [ ] **Step 2: Install exact runtime and pipeline dependencies**

Run:

```bash
npm install three@0.185.1
npm install -D @types/three@0.185.4 @gltf-transform/cli@4.4.2 @gltf-transform/core@4.4.2 @gltf-transform/extensions@4.4.2 meshoptimizer@1.2.0
```

Add scripts:

```json
{
  "jaw:prepare": "/Applications/Blender.app/Contents/MacOS/Blender --background assets/jaw-source/Teeth_Base_Mesh_Modeling.blend --python scripts/prepare-jaw-model.py",
  "jaw:validate": "node scripts/validate-jaw-model.mjs"
}
```

- [ ] **Step 3: Import only canonical Blender source and write license record**

Extract nested `source/Teeth_Base_Mesh_Modeling.zip`, then only `Teeth_Base_Mesh_Modeling.blend`, into `assets/jaw-source/`. Write `LICENSE.md` with exact content:

```bash
jaw_import_dir="$(mktemp -d)"
mkdir -p assets/jaw-source
bsdtar -xf /Users/goat/Downloads/free-teeth-base-mesh.zip -C "$jaw_import_dir"
bsdtar -xf "$jaw_import_dir/source/Teeth_Base_Mesh_Modeling.zip" -C "$jaw_import_dir" Teeth_Base_Mesh_Modeling.blend
install -m 0644 "$jaw_import_dir/Teeth_Base_Mesh_Modeling.blend" assets/jaw-source/Teeth_Base_Mesh_Modeling.blend
rm -rf "$jaw_import_dir"
```

```markdown
# Free Teeth Base Mesh

- Author: ferrumiron6
- Source: https://sketchfab.com/3d-models/free-teeth-base-mesh-b66fde0dc3eb44b0908096aa51b96431
- License: CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/
- Downloaded archive SHA-256: f233e4cd8c75b976eae3dc1542694cd23d7a98a7411bcb2d7d6c439ac09b42b8
- Audit GLB SHA-256: 0c71d63f6e0ad21e510ca57166d2689cc2a85fdeff22741ff19de7cf1a329f02

Modified for Dental Centrum Dobeš: repeated jaw variants removed; selected
upper/lower assembly isolated; loose teeth separated and named with adult FDI
notation; pivots, semantic groups, anchors, hit proxies, mobile LOD, materials,
lighting previews, and Meshopt compression added. Anatomy silhouette retained.
```

- [ ] **Step 4: Write failing validator before exporter**

Create `scripts/validate-jaw-model.mjs` using `NodeIO`, `ALL_EXTENSIONS`, and `MeshoptDecoder`. Required contract:

```js
const REQUIRED_TEETH = [
  ...Array.from({ length: 8 }, (_, index) => `tooth.${18 - index}`),
  ...Array.from({ length: 8 }, (_, index) => `tooth.${21 + index}`),
  ...Array.from({ length: 8 }, (_, index) => `tooth.${38 - index}`),
  ...Array.from({ length: 8 }, (_, index) => `tooth.${41 + index}`),
];

const REQUIRED_NODES = [
  "gum.upper", "gum.lower",
  "anchor.front", "anchor.premolar.left", "anchor.premolar.right",
  "anchor.molar.left", "anchor.molar.right", "anchor.gum.upper", "anchor.gum.lower",
  "hit.front", "hit.premolar.left", "hit.premolar.right",
  "hit.molar.left", "hit.molar.right", "hit.gum.upper", "hit.gum.lower",
];
```

Validator exits non-zero unless desktop has exactly 32 tooth meshes, two gum meshes, all nodes, finite non-empty bounds, `asset.extras.license === "CC BY 4.0"`, at most 20,000 triangles and 3 MiB; mobile must meet same naming contract, 9,000–12,000 triangles and 2 MiB.

Run:

```bash
npm run jaw:validate
```

Expected: FAIL because generated GLBs do not exist.

- [ ] **Step 5: Implement Blender preparation script**

Use this top-level contract in `scripts/prepare-jaw-model.py`:

```python
SOURCE_PAIRS = (
    ("Cube.001", "Cube.002"),
    ("Cube.003", "Cube.004"),
)
FDI_UPPER_RIGHT = (18, 17, 16, 15, 14, 13, 12, 11)
FDI_UPPER_LEFT = (21, 22, 23, 24, 25, 26, 27, 28)
FDI_LOWER_LEFT = (38, 37, 36, 35, 34, 33, 32, 31)
FDI_LOWER_RIGHT = (41, 42, 43, 44, 45, 46, 47, 48)
ATTRIBUTION = {
    "title": "Free Teeth Base Mesh",
    "author": "ferrumiron6",
    "source": "https://sketchfab.com/3d-models/free-teeth-base-mesh-b66fde0dc3eb44b0908096aa51b96431",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "modified": True,
}
```

Script must delete repeated variants; normalize to Y-up with bite midpoint at origin; split tooth objects by loose parts; sort by upper/lower, side, and arch order; assign exact FDI names; move origins to gingival pivots; create named Empty anchors; create invisible convex hit proxies; duplicate and decimate mobile geometry to total 9,000–12,000 triangles; create ivory/pink material preview; export uncompressed desktop/mobile GLBs with custom properties; render closed poster and final separated fallback directly to WebP.

Hard assertions in Python:

```python
assert len([obj for obj in bpy.data.objects if obj.name.startswith("tooth.")]) == 32
assert {"gum.upper", "gum.lower"}.issubset(bpy.data.objects.keys())
assert all(name in bpy.data.objects for name in REQUIRED_ANCHORS + REQUIRED_HIT_PROXIES)
```

- [ ] **Step 6: Optimize, validate, and visually audit assets**

Run:

```bash
npm run jaw:prepare
npx gltf-transform optimize public/media/jaw/jaw-desktop.raw.glb public/media/jaw/jaw-desktop.glb --compress meshopt
npx gltf-transform optimize public/media/jaw/jaw-mobile.raw.glb public/media/jaw/jaw-mobile.glb --compress meshopt
npm run jaw:validate
rm public/media/jaw/jaw-desktop.raw.glb public/media/jaw/jaw-mobile.raw.glb
```

Expected: validator prints counts, bounds, triangle totals, byte sizes, attribution, then exits 0. Inspect Blender contact sheet: upper/lower correct, FDI left/right correct from patient perspective, no missing or duplicated tooth, pivots inside gingival region, closed bite plausible, separated pose symmetric.

- [ ] **Step 7: Commit pipeline and assets**

```bash
git add package.json package-lock.json assets/jaw-source scripts/prepare-jaw-model.py scripts/validate-jaw-model.mjs public/media/jaw
git commit -m "feat: prepare licensed realtime jaw assets"
```

---

### Task 2: Pure clinic-story and jaw motion contracts

**Files:**
- Modify: `components/home/clinicStoryMotion.ts`
- Modify: `components/home/clinicStoryMotion.test.ts`
- Create: `components/home/jaw/jawPose.ts`
- Create: `components/home/jaw/jawPose.test.ts`

**Interfaces:**
- Consumes: section-local scroll measured in `vh`, canonical jaw bounds.
- Produces: `mapClinicStoryMotion(scrollVh, profile): ClinicStoryMotionState` and `computeJawPose(state, bounds): JawPose`.

- [ ] **Step 1: Replace video-time assertions with phase assertions**

Define state:

```ts
export type ClinicStoryMotionState = Readonly<{
  grow: number;
  pan: number;
  snap: number;
  zoom: number;
  blur: number;
  jawOpacity: number;
  jawOpen: number;
  jawSeparation: number;
  labelsOpacity: number;
  interactive: boolean;
}>;
```

Add table cases:

```ts
test.each([
  [447, { jawOpacity: 0, jawOpen: 0, jawSeparation: 0, interactive: false }],
  [480, { jawOpacity: 1, jawOpen: 0, jawSeparation: 0, interactive: false }],
  [570, { jawOpacity: 1, jawOpen: 0.5, jawSeparation: 0, interactive: false }],
  [660, { jawOpacity: 1, jawOpen: 1, jawSeparation: 0, interactive: false }],
  [750, { jawOpacity: 1, jawOpen: 1, jawSeparation: 0.5, interactive: false }],
  [840, { jawOpacity: 1, jawOpen: 1, jawSeparation: 1, interactive: true }],
  [1020, { jawOpacity: 1, jawOpen: 1, jawSeparation: 1, interactive: true }],
])("maps desktop %svh", (scrollVh, expected) => {
  expect(mapClinicStoryMotion(scrollVh, "desktop")).toMatchObject(expected);
});
```

Mobile boundaries: `90` snap start, `130` snap end, `230` handoff end, `410` opening end, `590` separation end, `750` dwell end.

- [ ] **Step 2: Run motion tests and confirm video contract fails**

Run:

```bash
npm test -- components/home/clinicStoryMotion.test.ts
```

Expected: FAIL because `jawOpen`, `jawSeparation`, `labelsOpacity`, and `interactive` do not exist.

- [ ] **Step 3: Implement minimal phase mapping**

Set:

```ts
export const DESKTOP_STORY_SCROLL_VH = 1020;
export const MOBILE_STORY_SCROLL_VH = 750;

const desktopJawOpen = phase(value, 480, 660);
const desktopJawSeparation = phase(value, 660, 840);

return {
  grow: round(phase(value, 0, 84)),
  pan: round(phase(value, 84, 380)),
  snap: 1,
  zoom: round(phase(value, 380, 480)),
  blur: round(phase(value, 442, 480)),
  jawOpacity: round(phase(value, 447, 480)),
  jawOpen: round(desktopJawOpen),
  jawSeparation: round(desktopJawSeparation),
  labelsOpacity: round(phase(value, 720, 840)),
  interactive: value >= 840,
};
```

Keep `stepCriticallyDamped`; drive one smoothed section progress, then derive pose from that value. Never smooth DOM scroll itself.

- [ ] **Step 4: Write failing pure-pose tests**

Contract:

```ts
export type JawPose = Readonly<{
  rootScale: number;
  rootYaw: number;
  rootPitch: number;
  upperY: number;
  lowerY: number;
  premolarOffset: number;
  molarOffset: number;
  gumDepth: number;
}>;
```

Test closed pose, open pose, half-separated pose, final symmetric pose, clamping, and reverse determinism. Arrival expects scale `0.55`, yaw `-0.16` radians, pitch `0`, closed arches, and zero segment offset. Final expects scale `1`, pitch `-Math.PI / 10`, premolar `0.08 * bounds.width`, molar `0.18 * bounds.width`, gum depth recession `0.03 * bounds.depth`, and equal/opposite left-right transforms.

- [ ] **Step 5: Implement `computeJawPose` and run tests**

Use only interpolation and easing helpers; no DOM or Three.js objects in this file.

Run:

```bash
npm test -- components/home/clinicStoryMotion.test.ts components/home/jaw/jawPose.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit motion contracts**

```bash
git add components/home/clinicStoryMotion.ts components/home/clinicStoryMotion.test.ts components/home/jaw/jawPose.ts components/home/jaw/jawPose.test.ts
git commit -m "feat: model realtime jaw scroll phases"
```

---

### Task 3: Runtime model contract and Three.js scene controller

**Files:**
- Create: `components/home/jaw/jawModelContract.ts`
- Create: `components/home/jaw/jawModelContract.test.ts`
- Create: `components/home/jaw/JawSceneController.ts`
- Create: `components/home/jaw/JawSceneController.test.ts`

**Interfaces:**
- Consumes: validated GLB root, `ClinicStoryMotionState`, `JawPose`.
- Produces: `validateJawModel(root): JawModelNodes` and `JawSceneController.create(canvas, options): Promise<JawSceneController>`.

- [ ] **Step 1: Write failing model-contract tests**

Define exact interfaces:

```ts
export type JawZoneId = "front" | "premolar" | "molar" | "gum";
export type JawHitId =
  | "front"
  | "premolar.left" | "premolar.right"
  | "molar.left" | "molar.right"
  | "gum.upper" | "gum.lower";

export type JawModelNodes = Readonly<{
  root: THREE.Group;
  teeth: ReadonlyMap<string, THREE.Mesh>;
  gums: Readonly<{ upper: THREE.Mesh; lower: THREE.Mesh }>;
  anchors: ReadonlyMap<JawHitId, THREE.Object3D>;
  hitProxies: ReadonlyMap<JawHitId, THREE.Object3D>;
  bounds: THREE.Box3;
}>;
```

Tests build in-memory `THREE.Group` fixtures. Verify 32 exact teeth succeeds; one missing tooth throws `Jaw model missing node: tooth.11`; duplicate semantic name, missing gum, empty bounds, and missing attribution throw explicit errors.

- [ ] **Step 2: Run contract tests and verify failure**

```bash
npm test -- components/home/jaw/jawModelContract.test.ts
```

Expected: FAIL because module is missing.

- [ ] **Step 3: Implement validator and zone maps**

Export immutable maps:

```ts
export const ZONE_TEETH = {
  front: [11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43],
  "premolar.right": [14, 15, 44, 45],
  "premolar.left": [24, 25, 34, 35],
  "molar.right": [16, 17, 18, 46, 47, 48],
  "molar.left": [26, 27, 28, 36, 37, 38],
} as const;
```

Validator traverses once, rejects missing/duplicate names, verifies root `userData.license`, computes bounds excluding hit proxies, and returns typed maps.

- [ ] **Step 4: Write controller lifecycle tests with injected renderer**

Public contract:

```ts
export type JawProjectedPoint = Readonly<{ x: number; y: number; visible: boolean }>;

export interface JawSceneOptions {
  profile: "desktop" | "mobile";
  modelUrl: string;
  onFirstFrame(): void;
  onFatalError(error: Error): void;
  requestRender(): void;
}

export class JawSceneController {
  static create(canvas: HTMLCanvasElement, options: JawSceneOptions): Promise<JawSceneController>;
  setMotion(state: ClinicStoryMotionState): void;
  setActiveZone(zone: JawZoneId | null): void;
  setPanelOpen(open: boolean): void;
  projectAnchor(hit: JawHitId): JawProjectedPoint;
  hitTest(clientX: number, clientY: number): JawHitId | null;
  resize(width: number, height: number, devicePixelRatio: number): void;
  render(): void;
  dispose(): void;
}
```

Inject renderer/loader factories only in test constructor. Assert DPR caps, first-frame callback once, render-on-demand, visibility pause, active-zone material emphasis, and one-time disposal of geometry/material/renderer.

- [ ] **Step 5: Implement direct Three.js controller**

Use `GLTFLoader` and Three-provided `MeshoptDecoder`. Use `WebGLRenderer({ canvas, alpha: true, antialias: profile === "desktop", powerPreference: "high-performance" })`. Configure `SRGBColorSpace`, ACES tone mapping, deterministic warm key/cool rim/neutral fill, physical ivory/pink materials, perspective camera, soft contact shadow, and raycaster restricted to hit proxies. Do not add `OrbitControls`.

`setMotion` applies `computeJawPose`; never mutates React state per frame. `projectAnchor` calls `Vector3.project(camera)` and converts NDC into canvas CSS pixels. `dispose` removes `ResizeObserver`, visibility listener, context listeners, and all GPU resources.

- [ ] **Step 6: Run controller tests and TypeScript**

```bash
npm test -- components/home/jaw/jawModelContract.test.ts components/home/jaw/JawSceneController.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit model runtime**

```bash
git add components/home/jaw/jawModelContract.ts components/home/jaw/jawModelContract.test.ts components/home/jaw/JawSceneController.ts components/home/jaw/JawSceneController.test.ts
git commit -m "feat: add validated Three.js jaw controller"
```

---

### Task 4: Patient content and non-diagnostic solution mapping

**Files:**
- Create: `components/home/jaw/jawContent.ts`
- Create: `components/home/jaw/jawContent.test.ts`

**Interfaces:**
- Consumes: four locked zone IDs and official price list.
- Produces: `jawZones`, `getJawZone(id)`, `getJawProblem(zoneId, problemId)`, `getJawSolution(zoneId, problemId, solutionId)`.

- [ ] **Step 1: Write failing content integrity tests**

Test exact invariants:

```ts
expect(jawZones.map((zone) => zone.id)).toEqual(["front", "premolar", "molar", "gum"]);
expect(jawZones.every((zone) => zone.problems.length === 4)).toBe(true);
expect(jawZones.flatMap((zone) => zone.problems).every((problem) => problem.solutions.length >= 1)).toBe(true);
expect(allPrices.every((price) => [40, 90, 95, 130, 155, 320, 430].includes(price))).toBe(true);
expect(allCopy.join(" ")).not.toMatch(/garantujeme|vyliečime|určite ide o/i);
```

- [ ] **Step 2: Run test and confirm missing content module**

```bash
npm test -- components/home/jaw/jawContent.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement types and complete content table**

Use approved types plus stable IDs. Exact problem labels:

```ts
export const jawZones: readonly JawZone[] = [
  { id: "front", label: "Predné zuby", problems: [
    problem("chipped", "Odlomil sa mi kúsok zuba", ["filling", "crown"]),
    problem("darkened", "Jeden zub mi stmavol", ["exam", "endo", "allCeramic"]),
    problem("sensitive", "Reaguje na studené alebo sladké", ["exam", "filling"]),
    problem("shape-gap", "Prekáža mi tvar alebo medzera", ["exam", "filling", "allCeramic"]),
  ]},
  { id: "premolar", label: "Črenové zuby", problems: [
    problem("bite-pain", "Bolí ma pri zahryznutí", ["exam", "endo", "crown"]),
    problem("lost-filling", "Vypadla mi plomba", ["filling", "crown"]),
    problem("cracked", "Zub je prasknutý", ["exam", "filling", "crown", "extraction"]),
    problem("sensitive", "Zub je citlivý", ["exam", "filling"]),
  ]},
  { id: "molar", label: "Stoličky", problems: [
    problem("pulsing", "Silno alebo pulzujúco bolí", ["exam", "endo"]),
    problem("bite-pain", "Bolí ma pri zahryznutí", ["exam", "endo", "crown"]),
    problem("wisdom", "Trápi ma zub múdrosti", ["exam", "extraction"]),
    problem("missing", "Zub mi chýba", ["exam", "replacement"]),
  ]},
  { id: "gum", label: "Ďasná", problems: [
    problem("bleeding", "Krvácajú mi ďasná", ["exam", "hygiene"]),
    problem("swelling", "Ďasno je opuchnuté", ["exam", "hygiene"]),
    problem("bad-breath", "Trápi ma zápach z úst", ["exam", "hygiene"]),
    problem("recession", "Ustupujú mi ďasná alebo vidím krčky", ["exam", "hygiene"]),
  ]},
];
```

Solution catalog prices: `exam: 40`, `filling: 90 from`, `hygiene: 95`, `endo: 155 from`, `crown: 320 from`, `allCeramic: 430`, `extraction: 95 from`, `splint: 130`. Each explanation begins “Môže súvisieť…” or “Pri vyšetrení overíme…”. Missing duration uses “Dĺžku určí lekár po vyšetrení.”

`replacement` means “Možnosti náhrady zuba”, carries no invented price, and says price and timing depend on selected treatment after examination. Exact `shortMeaning` copy:

| Problem ID | Copy |
|---|---|
| `front.chipped` | „Rozsah poškodenia ukáže, či stačí zub doplniť alebo potrebuje pevnejšiu ochranu.“ |
| `front.darkened` | „Zmena farby môže byť povrchová alebo môže súvisieť so stavom vo vnútri zuba.“ |
| `front.sensitive` | „Citlivosť môže súvisieť s odkrytým povrchom, výplňou alebo začínajúcim poškodením.“ |
| `front.shape-gap` | „Tvar a medzeru riešime až po kontrole zhryzu a zdravia zubov.“ |
| `premolar.bite-pain` | „Bolesť pri zahryznutí môže mať viac príčin; rozhodne vyšetrenie a snímka.“ |
| `premolar.lost-filling` | „Odkrytý zub treba skontrolovať, aby sa rozsah poškodenia nezväčšil.“ |
| `premolar.cracked` | „Pri praskline rozhoduje jej hĺbka a to, koľko pevného zuba zostalo.“ |
| `premolar.sensitive` | „Citlivosť môže ukazovať na netesnú výplň, odkrytý krčok alebo poškodenie zuba.“ |
| `molar.pulsing` | „Silná alebo pulzujúca bolesť potrebuje skoré vyšetrenie.“ |
| `molar.bite-pain` | „Zub môže byť preťažený alebo poškodený; príčinu overíme vyšetrením.“ |
| `molar.wisdom` | „Pri zube múdrosti kontrolujeme polohu, okolie a priestor na prerezanie.“ |
| `molar.missing` | „Možnosť náhrady závisí od susedných zubov, kosti a zhryzu.“ |
| `gum.bleeding` | „Krvácanie je signál, že ďasná potrebujú kontrolu a profesionálne vyčistenie.“ |
| `gum.swelling` | „Opuch môže mať viac príčin a bez vyšetrenia sa nedá bezpečne určiť.“ |
| `gum.bad-breath` | „Zápach často súvisí s povlakom alebo ďasnami, no príčinu treba overiť.“ |
| `gum.recession` | „Pri ústupe ďasien kontrolujeme hygienu, zaťaženie zuba a stav závesného aparátu.“ |

- [ ] **Step 4: Run content tests**

```bash
npm test -- components/home/jaw/jawContent.test.ts
```

Expected: PASS with four zones, sixteen problems, valid IDs and allowed prices.

- [ ] **Step 5: Commit content**

```bash
git add components/home/jaw/jawContent.ts components/home/jaw/jawContent.test.ts
git commit -m "feat: add patient-language jaw guidance"
```

---

### Task 5: Detail panel and Netlify appointment flow

**Files:**
- Create: `components/home/jaw/JawDetailPanel.tsx`
- Create: `components/home/jaw/JawDetailPanel.test.tsx`
- Create: `components/home/jaw/JawAppointmentForm.tsx`
- Create: `components/home/jaw/JawAppointmentForm.test.tsx`
- Create: `components/home/jaw/NetlifyJawFormDefinition.tsx`
- Create: `components/home/jaw/jawExperience.module.css`

**Interfaces:**
- Consumes: `JawZone`, selected `JawProblem`, selected `JawSolution`.
- Produces: controlled panel state callbacks and Netlify request with hidden zone/problem/solution IDs.

- [ ] **Step 1: Write failing panel navigation tests**

Render front zone. Assert four patient-language problem buttons; selecting one replaces overview with solution choices; Back returns one level; Escape calls `onClose`; close restores focus through caller; panel contains non-diagnostic notice and official price-list link.

Use contract:

```ts
type JawDetailPanelProps = {
  zone: JawZone;
  portalContainer: HTMLElement | null;
  activeProblemId: string | null;
  activeSolutionId: string | null;
  onProblemSelect(id: string): void;
  onSolutionSelect(id: string): void;
  onBack(): void;
  onClose(): void;
};
```

- [ ] **Step 2: Write failing Netlify form tests**

Assert form HTML exists with:

```tsx
<form name="jaw-appointment" method="POST" data-netlify="true" data-netlify-honeypot="bot-field">
  <input type="hidden" name="form-name" value="jaw-appointment" />
  <input type="hidden" name="zone" value={selection.zoneId} />
  <input type="hidden" name="problem" value={selection.problemId} />
  <input type="hidden" name="solution" value={selection.solutionId} />
</form>
```

Test required name, phone, consent; optional email; hidden honeypot; successful POST; failure preserves input and displays phone link; no medical-history textarea.

Render `NetlifyJawFormDefinition` unconditionally from `ClinicStory`, not only after zone selection. Netlify scans generated HTML at build time and cannot discover a form existing only in later client state. Definition contains hidden inputs named `form-name`, `zone`, `problem`, `solution`, `name`, `phone`, `email`, `consent`, and `bot-field`.

- [ ] **Step 3: Run UI tests and verify failure**

```bash
npm test -- components/home/jaw/JawDetailPanel.test.tsx components/home/jaw/JawAppointmentForm.test.tsx
```

Expected: FAIL because components are missing.

- [ ] **Step 4: Implement form encoder and submission states**

Encode without JSON:

```ts
export function encodeNetlifyForm(form: HTMLFormElement): URLSearchParams {
  const encoded = new URLSearchParams();
  for (const [key, value] of new FormData(form).entries()) {
    if (typeof value === "string") encoded.append(key, value);
  }
  return encoded;
}
```

POST to `/` with `Content-Type: application/x-www-form-urlencoded`. Treat only `response.ok` as success. Keep fields controlled so retry retains values.

Required consent copy: “Súhlasím, aby Dental Centrum Dobeš použilo moje kontaktné údaje a vybraný problém na odpoveď k termínu vyšetrenia.”

- [ ] **Step 5: Implement accessible panel and responsive sheet styles**

Reuse installed `@radix-ui/react-dialog`. Render `Dialog.Portal` into `portalContainer` inside the jaw host so panel stays in the shared coordinate space. Desktop: fixed right panel, labelled heading, initial focus on first problem, Radix focus trap, Escape, visible close. Mobile: bottom sheet below jaw-safe region, max height `62dvh`, internal vertical scrolling, no drag/swipe gesture. Use `prefers-reduced-motion` to remove morph transitions.

- [ ] **Step 6: Run tests, accessibility lint, TypeScript**

```bash
npm test -- components/home/jaw/JawDetailPanel.test.tsx components/home/jaw/JawAppointmentForm.test.tsx
npm run lint
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit panel and form**

```bash
git add components/home/jaw/JawDetailPanel.tsx components/home/jaw/JawDetailPanel.test.tsx components/home/jaw/JawAppointmentForm.tsx components/home/jaw/JawAppointmentForm.test.tsx components/home/jaw/NetlifyJawFormDefinition.tsx components/home/jaw/jawExperience.module.css
git commit -m "feat: add jaw guidance and appointment panel"
```

---

### Task 6: Accessible overlay and `JawExperience` orchestration

**Files:**
- Create: `components/home/jaw/JawZoneOverlay.tsx`
- Create: `components/home/jaw/JawExperience.tsx`
- Create: `components/home/jaw/JawExperience.test.tsx`
- Modify: `components/home/jaw/jawExperience.module.css`

**Interfaces:**
- Consumes: imperative `ClinicStoryMotionState` updates, `JawSceneController`, four zone records.
- Produces: canvas/fallback, projected labels, selected panel, and `JawExperienceHandle.setMotion(state)` for `ClinicStory`.

- [ ] **Step 1: Write failing orchestration tests**

Mock `JawSceneController.create`. Assert:

- poster appears before first rendered frame,
- heading “Kde vás to trápi?” appears during jaw arrival,
- canvas is decorative and not sole interaction surface,
- four HTML zone buttons always exist,
- buttons are disabled before `interactive`,
- first valid frame cross-fades canvas without blank frame,
- WebGL rejection leaves fallback image and working zone buttons,
- reduced motion never creates controller and exposes final pose/buttons,
- selecting left/right premolar opens shared “Črenové zuby” content,
- reverse change from `interactive=true` to false closes panel and returns focus.

Component contract:

```ts
export type JawExperienceProps = {
  profile: "desktop" | "mobile";
  prefersReducedMotion: boolean;
};

export type JawExperienceHandle = {
  setMotion(state: ClinicStoryMotionState): void;
};
```

- [ ] **Step 2: Run test and verify failure**

```bash
npm test -- components/home/jaw/JawExperience.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement overlay projection and nearest-edge leaders**

`JawZoneOverlay` accepts projected anchors and safe-zone layout. Use four semantic buttons but seven visual leaders. Pointer raycast maps `premolar.left/right → premolar`, `molar.left/right → molar`, and `gum.upper/lower → gum`.

Leader start helper:

```ts
export function cardEdgeTowardTarget(rect: DOMRect, target: Point): Point {
  const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  const scale = 1 / Math.max(Math.abs(dx) / Math.max(1, rect.width / 2), Math.abs(dy) / Math.max(1, rect.height / 2), 1);
  return { x: center.x + dx * scale, y: center.y + dy * scale };
}
```

- [ ] **Step 4: Implement lazy scene lifecycle**

Inside client component, observe host with `rootMargin: "150% 0px"`. Only after intersection dynamically import controller module:

```ts
const { JawSceneController } = await import("./JawSceneController");
const controller = await JawSceneController.create(canvas, options);
```

This follows local Next.js 16 lazy-loading guidance: browser library imported through static dynamic path inside Client Component. Keep poster until `onFirstFrame`. Pause controller via visibility/intersection. Use `ResizeObserver`; update projected anchors only during active render or resize.

Render the heading in HTML, centered above the jaw-safe area. Fade it from the same `jawOpacity` phase, then reduce its prominence while zone labels appear; never bake text into canvas.

- [ ] **Step 5: Implement panel state and focus handoff**

Store selected zone/problem/solution IDs in React state. Geometry never changes after interaction begins. Opening panel changes camera framing only through a fixed `setPanelOpen(boolean)` composition state. Reverse below interactive closes panel, clears selection, and disables buttons.

Expose `setMotion` with `forwardRef` and `useImperativeHandle`. Send each phase update directly to controller and CSS variables; update React state only when `interactive` changes. This avoids React rerenders on every scroll frame.

Show visible credit below zone controls and in fallback layout: “3D model: Free Teeth Base Mesh — ferrumiron6, upravené, CC BY 4.0.” Link model source and license.

- [ ] **Step 6: Run orchestration suite**

```bash
npm test -- components/home/jaw/JawExperience.test.tsx components/home/jaw/JawDetailPanel.test.tsx components/home/jaw/JawAppointmentForm.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit experience**

```bash
git add components/home/jaw/JawZoneOverlay.tsx components/home/jaw/JawExperience.tsx components/home/jaw/JawExperience.test.tsx components/home/jaw/jawExperience.module.css
git commit -m "feat: orchestrate interactive realtime jaw"
```

---

### Task 7: Integrate realtime jaw into one `ClinicStory` sticky viewport

**Files:**
- Modify: `components/home/ClinicStory.tsx`
- Modify: `components/home/ClinicStory.test.tsx`
- Modify: `components/home/clinicStory.module.css`
- Modify: `app/page.test.tsx`
- Delete: `components/home/jawSeekQueue.ts`
- Delete: `components/home/jawSeekQueue.test.ts`
- Delete: `components/home/jawStoryMotion.ts`
- Delete: `components/home/jawStoryMotion.test.ts`
- Delete: `components/home/jawTracking.ts`
- Delete: `components/home/jawTracking.test.ts`

**Interfaces:**
- Consumes: `mapClinicStoryMotion`, lazy `JawExperience`.
- Produces: one region, one sticky pin, gallery and handoff continuity, no runtime video references.

- [ ] **Step 1: Rewrite integration tests first**

Replace video assertions with:

```ts
expect(screen.getAllByTestId("clinic-story-pin")).toHaveLength(1);
expect(container.querySelectorAll('[data-gallery-frame="true"]')).toHaveLength(7);
expect(screen.getByTestId("clinic-story-handoff")).toHaveAttribute("src", "/media/strip-07-detail.jpg");
expect(screen.getByTestId("jaw-experience-host")).toBeInTheDocument();
expect(screen.getByRole("button", { name: "Predné zuby" })).toBeDisabled();
expect(container.querySelector("video")).not.toBeInTheDocument();
```

Keep desktop physical-scroll grow/pan test. Add scroll at `840vh` and assert zone buttons enabled; reverse to `839vh` and assert disabled/panel closed.

Update `app/page.test.tsx`: retain one-sticky-pin assertion, replace obsolete “Jeden plán” final-copy assertion with `jaw-experience-host`, four zone buttons, and always-rendered `form[name="jaw-appointment"]` definition.

- [ ] **Step 2: Run affected tests and verify failure**

```bash
npm test -- components/home/ClinicStory.test.tsx app/page.test.tsx
```

Expected: FAIL because old video deck and callouts remain.

- [ ] **Step 3: Split React updates from per-frame CSS updates**

Keep gallery geometry and CSS custom properties in rAF. Send normalized motion through `JawExperienceHandle.setMotion()` from that rAF. React state changes only when profile, reduced-motion mode, or boolean interaction boundary changes. Remove seek queue, decoded time, video refs, callout refs, and video imports.

Render:

```tsx
<div className={styles.jawHost}>
  <JawExperience
    ref={jawExperienceRef}
    profile={profile}
    prefersReducedMotion={prefersReducedMotion}
  />
</div>
<NetlifyJawFormDefinition />
```

- [ ] **Step 4: Update story CSS without breaking sticky**

Desktop `.section` height becomes `1120dvh` (`1020dvh` travel plus one viewport). Mobile becomes `850dvh`. Keep `.pin { position: sticky; top: 0; height: 100dvh; overflow: hidden; }`; no ancestor gains `overflow`. Replace `.jawLayer`, video, annotation, and final-copy rules with `.jawHost { position:absolute; z-index:3; inset:0; }`. Handoff photo remains under canvas until first-frame callback.

- [ ] **Step 5: Delete obsolete runtime modules, not media yet**

Delete seek, video motion, and source-pixel tracking files/tests. Confirm no imports:

```bash
rg -n "jawSeekQueue|jawStoryMotion|jawTracking|jawSegments|jaw-video-layer" app components
```

Expected: no matches.

- [ ] **Step 6: Run complete unit suite and static checks**

```bash
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

Expected: all pass; build prerenders `/`; no `window` or WebGL access during SSR.

- [ ] **Step 7: Commit integration**

```bash
git add app/page.test.tsx components/home/ClinicStory.tsx components/home/ClinicStory.test.tsx components/home/clinicStory.module.css components/home/jawSeekQueue.ts components/home/jawSeekQueue.test.ts components/home/jawStoryMotion.ts components/home/jawStoryMotion.test.ts components/home/jawTracking.ts components/home/jawTracking.test.ts
git commit -m "feat: replace jaw video with realtime scene"
```

---

### Task 8: Performance, fallback, accessibility, and regression hardening

**Files:**
- Modify: `components/home/jaw/JawSceneController.ts`
- Modify: `components/home/jaw/JawExperience.tsx`
- Modify: `components/home/jaw/JawExperience.test.tsx`
- Modify: `components/home/jaw/JawZoneOverlay.tsx`
- Modify: `components/home/jaw/JawDetailPanel.tsx`
- Modify: `components/home/jaw/jawExperience.module.css`
- Modify: `components/home/ClinicStory.test.tsx`

**Interfaces:**
- Consumes: completed integrated experience.
- Produces: production-safe performance lifecycle and complete fallback behavior.

- [ ] **Step 1: Add regression tests for lifecycle edges**

Cover: WebGL context lost/restored, model 404, model contract rejection, tab hidden, host outside viewport, resize, DPR 3 clamped, rapid forward/reverse wheel jumps, panel open then reverse scroll, Escape focus return, 44×44 buttons, and reduced motion.

- [ ] **Step 2: Run focused suite and record failures**

```bash
npm test -- components/home/jaw components/home/ClinicStory.test.tsx
```

Expected: new cases fail before hardening.

- [ ] **Step 3: Implement on-demand rendering rules**

Render continuously only while jaw phase changes, hover/focus transition runs, or camera reframes for panel. During fixed dwell call `render()` only on interaction/resize. Stop all rAF work when `document.hidden` or intersection false. Context loss shows fallback without losing HTML state; restored context recreates scene once.

- [ ] **Step 4: Implement final fallback and accessibility rules**

Fallback uses `/media/jaw/jaw-fallback.webp`; canvas `aria-hidden="true"`; HTML zone group has visible label “Vyberte oblasť, ktorá vás trápi”; live region announces only panel-level changes; panel traps focus while open and restores selected zone button; all labels meet contrast and 44×44 minimum.

- [ ] **Step 5: Run full verification commands**

```bash
npm run jaw:validate
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
git grep -nE 'gh[p]_|github[_]pat_|sk[-][A-Za-z0-9_-]{10,}|AKI[A][0-9A-Z]{16}|BEGI[N] (RSA|OPENSSH|EC) PRIVATE KEY' -- . ':!package-lock.json'
```

Expected: asset validation and all code checks pass; credential scan returns no matches.

- [ ] **Step 6: Commit hardening**

```bash
git add components/home/jaw components/home/ClinicStory.test.tsx
git commit -m "fix: harden realtime jaw fallbacks and lifecycle"
```

---

### Task 9: Localhost visual and interaction approval gate

**Files:**
- Modify: `COLLAB.md`

**Interfaces:**
- Consumes: complete feature branch.
- Produces: documented localhost evidence and explicit user approval or a defect list.

- [ ] **Step 1: Start or reuse live dev server**

```bash
npm run dev
```

Expected: `http://localhost:3000/` serves active feature branch with hot reload. Do not start duplicate server if port 3000 already belongs to this checkout.

- [ ] **Step 2: Inspect required desktop viewports**

At `1920×1080` and `1440×900`, verify: one pin stays `top: 0`; photo 7 zoom → blur → small jaw has no cut; jaw grows/opens/tilts; zones separate symmetrically; labels track; clicks activate only after geometry stops; right panel completes zone → problem → solution → form; reverse scroll closes panel; no horizontal overflow; console clean.

- [ ] **Step 3: Inspect required mobile viewports**

At `375×812` and `390×844`, verify: manual snapping gallery swipe; 40vh auto-snap; correct jaw framing; bottom sheet does not fight page scroll; menu works; touch targets at least 44px; no overflow; WebGL and static fallback both usable.

- [ ] **Step 4: Measure performance and network behavior**

Record: desktop jaw GLB ≤3 MiB, mobile ≤2 MiB; old MP4 requests absent after WebGL success; model starts near 1.5 viewports before handoff; DPR caps applied; current desktop ≥50 fps and representative mobile ≥30 fps during motion; render loop sleeps in fixed dwell and offscreen.

- [ ] **Step 5: Verify reduced motion and forced failure**

Emulate `prefers-reduced-motion: reduce` and blocked GLB/WebGL. Both must show final poster, four buttons, panel content, and working form without long pinned choreography or blank canvas.

- [ ] **Step 6: Update handoff and request user approval**

Record exact test totals, viewport results, asset bytes/triangles, console state, open risks, branch/commit, and localhost URL in `COLLAB.md`. Keep localhost running. Do not merge to `main`.

- [ ] **Step 7: Commit verification handoff**

```bash
git add COLLAB.md
git commit -m "docs: hand off realtime jaw for local review"
git push -u origin codex/runtime-jaw-3d
```

---

### Task 10: Approved cleanup and production publication

**Files:**
- Delete: `public/media/jaw-story/jaw-01-1080.mp4`
- Delete: `public/media/jaw-story/jaw-01-720.mp4`
- Delete: `public/media/jaw-story/jaw-02-1080.mp4`
- Delete: `public/media/jaw-story/jaw-02-720.mp4`
- Delete: `public/media/jaw-story/jaw-03-1080.mp4`
- Delete: `public/media/jaw-story/jaw-03-720.mp4`
- Delete: `public/media/jaw-story/jaw-04-1080.mp4`
- Delete: `public/media/jaw-story/jaw-04-720.mp4`
- Delete: `public/media/jaw-story/jaw-poster.jpg`
- Delete: `scripts/encode-jaw-story.sh`
- Modify: `COLLAB.md`

**Interfaces:**
- Consumes: explicit user localhost approval.
- Produces: pushed `main`, fast-forwarded `develop`, verified Netlify deployment.

- [ ] **Step 1: Confirm approval and resolve exact remote state**

```bash
git fetch origin --prune
git status --short --branch
git log --oneline --decorate origin/main..HEAD
```

Expected: clean approved feature branch, no new unreviewed `origin/main` commits. If main advanced, integrate it on owned branch and rerun Task 8–9 checks.

- [ ] **Step 2: Remove obsolete video pipeline and assets**

Delete only listed jaw-story files. Verify no references:

```bash
rg -n "jaw-story|encode-jaw-story|\.mp4" app components scripts package.json
```

Expected: no jaw-story references; unrelated hero MP4 references remain.

- [ ] **Step 3: Run final clean verification**

```bash
npm run jaw:validate
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
git grep -nE 'gh[p]_|github[_]pat_|sk[-][A-Za-z0-9_-]{10,}|AKI[A][0-9A-Z]{16}|BEGI[N] (RSA|OPENSSH|EC) PRIVATE KEY' -- . ':!package-lock.json'
```

Expected: all pass, no credentials.

- [ ] **Step 4: Commit approved cleanup**

```bash
git add COLLAB.md scripts/encode-jaw-story.sh public/media/jaw-story
git commit -m "chore: remove superseded jaw video assets"
git push origin codex/runtime-jaw-3d
```

- [ ] **Step 5: Merge without rewriting shared history**

Create/update PR from `codex/runtime-jaw-3d` to `main`, review exact diff and checks, merge, then confirm:

```bash
git fetch origin --prune
git merge-base --is-ancestor HEAD origin/main
git rev-parse origin/main
```

- [ ] **Step 6: Fast-forward compatibility branch**

```bash
git push origin origin/main:develop
```

Expected: `origin/develop` equals `origin/main`.

- [ ] **Step 7: Verify Netlify production**

Wait for deployment from pushed `main`. Open live URL at desktop and mobile widths; test jaw loading, one zone flow, form UI without submission, menu, console, and asset requests. Record live URL and deployment result in `COLLAB.md`.
