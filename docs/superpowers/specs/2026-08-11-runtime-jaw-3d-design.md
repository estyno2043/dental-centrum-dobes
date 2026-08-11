# Runtime 3D Jaw Experience Design

Date: 2026-08-11

Status: User-approved design; implementation plan pending

Owner: Codex

Branch: `codex/runtime-jaw-3d-design`

## 1. Objective

Replace the current segmented jaw-video scrub with a realtime, scroll-driven
Three.js scene built from a licensed 3D jaw. The same rendered object must
become an accessible interactive map after its scroll choreography finishes.

The patient flow is:

1. **Where** — choose the area that causes discomfort.
2. **What** — choose a symptom written in patient language.
3. **Solution** — see what it can mean, how the clinic handles it, an official
   starting price when available, and an appointment call to action.

The module is informational navigation, not a diagnostic tool.

## 2. Locked product decisions

- Use model B, `Free Teeth Base Mesh` by ferrumiron6.
- Prepare the model and runtime without an external 3D artist for the first
  production candidate.
- Keep the gallery, photograph-07 zoom, blur, and jaw handoff in one sticky
  viewport. No vertical cut or blank frame is allowed.
- Use native document scroll as the only motion input. Do not intercept wheel,
  touch, keyboard, scrollbar, or trackpad input.
- Use four sequential stages: arrival, opening, zone separation, interaction.
- Do not enable click interaction while the jaw is still changing shape.
- Use four patient-facing categories: front teeth, premolars, molars, and gums.
- Left and right segments share category content, but retain separate hit
  regions and visual highlights.
- Desktop uses a right-side panel. Mobile uses a bottom sheet.
- Clicking a problem transforms the existing panel into the solution view;
  it does not open another modal.
- Appointment submission uses Netlify Forms and carries the selected zone,
  problem, and solution.
- Reduced-motion and WebGL-failure modes retain the complete content and CTA.

## 3. Source asset and license

Source page:
`https://sketchfab.com/3d-models/free-teeth-base-mesh-b66fde0dc3eb44b0908096aa51b96431`

Author: ferrumiron6

Formal license: Creative Commons Attribution 4.0

License URL: `https://creativecommons.org/licenses/by/4.0/`

The page description says attribution is optional, but the formal Sketchfab
license is CC BY 4.0 and controls project use. Production must therefore show
appropriate credit, link the license, and indicate that the model was modified.

Required visible credit:

> “Free Teeth Base Mesh” by ferrumiron6, modified for Dental Centrum Dobeš,
> licensed under CC BY 4.0.

The same attribution, source URL, license URL, downloaded-source hash, and
modification summary must live beside the source asset in the repository.

Audited downloads:

- `free-teeth-base-mesh.zip`
  - SHA-256:
    `f233e4cd8c75b976eae3dc1542694cd23d7a98a7411bcb2d7d6c439ac09b42b8`
- Sketchfab 2K export `free_teeth_base_mesh.glb`
  - SHA-256:
    `0c71d63f6e0ad21e510ca57166d2689cc2a85fdeff22741ff19de7cf1a329f02`

Source archive contents include Blender 4.05, FBX, OBJ, MTL, and GLB files.
The Blender source is the canonical editing input. The public Sketchfab GLB is
an audit reference, not the production runtime asset.

## 4. Audited model structure

The full downloaded scene contains repeated jaw variants and 85,360 rendered
triangles. Only one complete assembly is required.

The selected assembly comprises the source pairs:

- `Cube.001` gum mesh with `Cube.002` teeth,
- `Cube.003` gum mesh with `Cube.004` teeth.

After orientation is normalized, these pairs become upper and lower arches.
The selected assembly contains:

- 32 disconnected tooth components,
- two independently transformable gum meshes,
- 17,056 rendered triangles,
- 10,221 rendered vertices before final optimization,
- no rig, morph targets, animations, or textures,
- two flat source materials,
- clean quad-based source topology.

The lack of rigging is intentional. Runtime animation operates on named mesh
groups and object transforms rather than bones.

## 5. Asset preparation pipeline

### 5.1 Repository inputs and outputs

Keep the smallest reproducible source set:

- `assets/jaw-source/Teeth_Base_Mesh_Modeling.blend`
- `assets/jaw-source/LICENSE.md`
- `scripts/prepare-jaw-model.py`

Generate production files:

- `public/media/jaw/jaw-desktop.glb`
- `public/media/jaw/jaw-mobile.glb`
- `public/media/jaw/jaw-poster.webp`
- `public/media/jaw/jaw-fallback.webp`

Do not commit the redundant OBJ, FBX, nested ZIP, or repeated jaw variants.

### 5.2 Canonical geometry

The preparation script must:

1. Open the canonical Blender source.
2. Retain only the audited complete upper/lower assembly.
3. Apply object transforms and normalize the model to a right-handed,
   Y-up coordinate system centered at the bite midpoint.
4. Separate all disconnected tooth islands into individual objects.
5. Identify upper/lower and left/right orientation visually and geometrically.
6. Assign adult FDI tooth identifiers.
7. Set each tooth origin at its approximate root/gingival pivot.
8. Set gum origins at each arch center.
9. Recalculate normals, remove duplicate vertices, and repair non-manifold
   edges that affect the visible result.
10. Preserve the original tooth silhouette; do not invent medical anatomy.
11. Generate desktop and mobile LOD outputs.
12. Export glTF 2.0 and run deterministic mesh optimization.

### 5.3 Naming contract

Individual teeth use FDI notation:

- upper right: `tooth.18` through `tooth.11`,
- upper left: `tooth.21` through `tooth.28`,
- lower left: `tooth.38` through `tooth.31`,
- lower right: `tooth.41` through `tooth.48`.

Gums use:

- `gum.upper`,
- `gum.lower`.

Runtime group metadata uses these exact FDI sets:

- `zone.front`: 11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43,
- `zone.premolar.right`: 14, 15, 44, 45,
- `zone.premolar.left`: 24, 25, 34, 35,
- `zone.molar.right`: 16, 17, 18, 46, 47, 48,
- `zone.molar.left`: 26, 27, 28, 36, 37, 38,
- `zone.gum.upper` and `zone.gum.lower`.

The UI collapses left/right and upper/lower hit targets into four content
categories while retaining the more precise visual targets.

### 5.4 Optimization targets

- Desktop geometry: no more than 20,000 triangles.
- Mobile geometry: approximately 9,000–12,000 triangles.
- Desktop GLB including material support maps: no more than 3 MiB.
- Mobile GLB including material support maps: no more than 2 MiB.
- Use Meshopt compression. Do not use a runtime image sequence.
- Use KTX2 only for material support maps that materially improve the result.
- Keep model bounds, mesh names, and anchor metadata deterministic across
  rebuilds.

## 6. Visual treatment

The source has no production textures. Visual quality therefore comes from
geometry cleanup, physically based materials, lighting, and restrained
procedural variation.

### 6.1 Teeth

Use an ivory `MeshPhysicalMaterial`, not pure white:

- low metalness,
- medium-low roughness,
- restrained clearcoat,
- subtle transmission and thickness,
- small per-tooth color and roughness variation,
- object-space micro-roughness noise,
- no exaggerated bloom or wet-plastic reflection.

### 6.2 Gums

Use a muted natural pink physical material:

- soft specular response,
- restrained transmission/thickness for a subsurface approximation,
- very subtle object-space normal and roughness variation,
- no saturated red or glossy toy appearance.

### 6.3 Lighting

Use a three-light studio setup compatible with the existing brand:

- warm key light,
- cooler low-intensity rim light,
- soft neutral fill,
- minimal gold accent in labels and leader lines,
- contact shadow or soft shadow catcher beneath the jaw,
- blurred clinic photograph remains the environmental backdrop.

No HDR asset is required for the first candidate. Lighting must be deterministic
and inexpensive on mobile.

## 7. Runtime architecture

Use direct Three.js rather than React Three Fiber. One scene does not justify
another renderer abstraction, and direct control reduces runtime overhead.

Proposed boundaries:

- `ClinicStory` — owns the combined gallery-to-jaw sticky timeline.
- `JawExperience` — lazy client boundary and load/fallback state.
- `JawSceneController` — Three.js scene, camera, lights, model, renderer, and
  lifecycle.
- `jawMotionState` — pure mapping from normalized story progress to transforms,
  opacity, label reveal, and interactivity.
- `jawModelContract` — validates required mesh names, groups, and anchors.
- `JawZoneOverlay` — accessible HTML labels/buttons and SVG leader lines.
- `JawDetailPanel` — problem and solution views.
- `jawContent` — typed zone/problem/solution configuration.
- `JawAppointmentForm` — Netlify form with selected context.

Three.js is dynamically imported only when the experience approaches the
viewport. `IntersectionObserver` begins model loading approximately 1.5
viewports before the handoff.

The renderer uses one canvas inside the existing sticky viewport. The clinic
photograph, blur layer, canvas, HTML labels, and panel share that coordinate
space. No nested overflow wrapper may contain the sticky element.

## 8. Scroll choreography

Desktop retains the established gallery timeline and replaces only the jaw
video part. Distances use section-local `vh` units:

| Range | Stage | Result |
|---|---|---|
| `0–84` | gallery grow | Cards grow `55% → 100%`; horizontal pan remains zero. |
| `84–380` | gallery pan | Full-height cards travel left; photograph 7 enters. |
| `380–480` | photograph 7 zoom | Photograph 7 centers and fills the viewport. |
| `442–480` | blur handoff | Photograph blur rises smoothly. |
| `447–480` | jaw arrival | Canvas fades in; jaw appears small, closed, and slightly turned left. Heading “Kde vás to trápi?” fades up. |
| `480–660` | opening | Root scale grows `0.55 → 1.0`; upper/lower arches separate; camera tilts about 18° toward an occlusal view. |
| `660–840` | zone separation | Front stays centered. Premolar segments move approximately `±0.08` jaw widths. Molar segments move approximately `±0.18` jaw widths. Gums recede slightly. Labels and leaders fade in. |
| `840–1020` | interactive dwell | Geometry and camera remain fixed. Hover, keyboard focus, click, and touch activate. |

After `1020vh`, the sticky viewport unpins and normal document flow continues.

The exact transform values live in pure tested motion constants and are ratios
of canonical jaw bounds, not arbitrary pixels. Scrolling backward reverses all
stages. Crossing backward below `840vh` closes the detail panel, disables
interactive hit targets, and returns to scroll choreography.

Native scroll remains unblocked. A critically damped requestAnimationFrame
smoothing value follows section progress without taking ownership of scrolling.

### 8.1 Mobile

Mobile preserves manual snapping gallery swipe. After photograph 7 auto-snaps:

- `100vh` photograph-to-jaw handoff,
- `180vh` opening,
- `180vh` zone separation,
- `160vh` fixed interactive dwell.

Mobile uses the same choreography constants expressed as jaw-bound ratios, a
closer responsive camera, and the mobile LOD model. It does not use a cropped
video or a second coordinate-tracking system.

## 9. Labels, hit testing, and tracking

Attach named anchor objects to front, left/right premolar, left/right molar,
and upper/lower gum targets. Each animation frame projects anchor world
positions through the active Three.js camera into viewport coordinates.

Leader lines start at the actual nearest edge of each HTML label and end at
the projected 3D anchor. Labels move between predefined safe zones to avoid
the jaw, screen edges, and the detail panel.

Raycasting uses enlarged invisible hit proxies, not only the visible tooth
surfaces. This provides forgiving mouse and touch targets without changing the
rendered geometry.

Accessible HTML buttons mirror the four patient-facing categories. Keyboard
focus highlights the matching 3D group. The canvas alone is never the only
interaction surface.

Pointer and keyboard interaction remain disabled before the interactive dwell.

## 10. Patient content model

Typed internal records use:

```ts
type JawZone = {
  id: "front" | "premolar" | "molar" | "gum";
  label: string;
  problems: JawProblem[];
};

type JawProblem = {
  id: string;
  patientLabel: string;
  shortMeaning: string;
  solutions: JawSolution[];
};

type JawSolution = {
  id: string;
  title: string;
  explanation: string;
  priceFrom?: number;
  duration?: string;
  appointmentLabel: string;
};
```

Initial patient-language problem groups:

- **Front teeth:** chipped tooth, darkened tooth, cold/sweet sensitivity,
  unwanted shape or gap.
- **Premolars:** pain when biting, lost filling, cracked tooth, sensitivity.
- **Molars:** strong or pulsing pain, pain when biting, wisdom-tooth trouble,
  missing tooth.
- **Gums:** bleeding, swelling, bad breath, recession or exposed necks.

Use only official clinic prices that are present in the current price list:

- comprehensive examination: €40,
- filling: from €90,
- dental hygiene: €95,
- endodontic treatment: from €155,
- crown: from €320,
- all-ceramic crown: €430,
- extraction: from €95,
- bruxism splint: €130.

If the clinic does not publish a price or duration for a solution, omit that
field and state that it is determined after examination. Do not invent a price,
duration, diagnosis, or guaranteed result.

Every solution view includes a short non-diagnostic notice and a link to the
full official clinic price list at `https://www.bratislavazubar.sk/cennik/`.

## 11. Panel and appointment flow

### 11.1 Desktop

Selecting a zone opens a branded right-side panel without moving the canvas.
The jaw shifts only through camera framing that is part of the fixed final
layout, not through new scroll animation.

Panel states:

1. Zone overview and three to four problems.
2. Selected problem, explanation, possible solutions, official price, and CTA.
3. Appointment form.

Back navigation morphs the same panel to the previous state. Escape closes the
panel and returns focus to the selected zone button.

### 11.2 Mobile

Use a bottom sheet capped below the jaw-safe area. It supports the same three
states, traps focus only while open, and closes by explicit close control,
Escape, or completed submission. Do not use a swipe gesture that competes with
page scrolling.

### 11.3 Netlify form

Submit only the minimum fields:

- name,
- phone,
- optional email,
- selected zone,
- selected problem,
- selected solution,
- consent checkbox,
- honeypot field.

Do not request open-ended medical history. The consent copy must explain that
the selected symptom context and contact details are sent to the clinic for an
appointment response.

## 12. Loading, errors, and fallbacks

### 12.1 Loading

- Start lazy loading before the handoff.
- Keep photograph 7 visible until the model and shader compile successfully.
- Cross-fade only after the first valid rendered frame.
- Never expose an empty canvas or blank background.

### 12.2 Model or WebGL failure

Show `jaw-fallback.webp` in the same final exploded pose. Keep all four HTML
zone buttons, problem panels, solution content, and form functional. Leader
lines use fixed responsive fallback coordinates.

### 12.3 Reduced motion

Skip the long pinned 3D choreography. Show the static final exploded pose with
four immediately available category buttons. Do not autoplay rotation,
floating, or camera motion.

### 12.4 Form failure

Preserve entered contact data in component state, show a concise retry message,
and expose the clinic phone link. Never report a successful appointment request
until Netlify returns success.

## 13. Performance rules

- Desktop device-pixel ratio cap: `1.5`.
- Mobile device-pixel ratio cap: `1.25`.
- Pause the render loop when the scene is outside the viewport, the tab is
  hidden, and no transition or interaction is active.
- Render on demand during the final static dwell except for brief hover/focus
  transitions.
- Dispose geometry, materials, textures, observers, and renderer listeners on
  unmount.
- Do not load the obsolete jaw video segments when WebGL succeeds.
- After final approval, remove unused jaw-video assets from production paths.
- Target at least 50 fps on a current desktop and 30 fps on a representative
  mid-range mobile device.
- The module must introduce no horizontal page overflow.

## 14. Accessibility

- Use real HTML buttons for zone labels.
- Provide visible focus indication matching the gold brand accent.
- Maintain at least 44×44 CSS-pixel touch targets.
- Announce panel state changes through an appropriate live region without
  announcing continuous scroll progress.
- Trap focus only inside an open modal-like panel or bottom sheet.
- Restore focus on close.
- Support Escape and standard Tab/Shift+Tab navigation.
- Decorative canvas remains hidden from the accessibility tree; accessible
  labels and content describe the experience.
- Meet contrast requirements on the blurred clinic background.

## 15. Verification

### 15.1 Asset tests

- Validate all required FDI tooth names, gum names, groups, and anchor names.
- Validate exactly 32 tooth meshes and two gum meshes.
- Validate triangle and file-size budgets.
- Validate non-empty bounds and finite transforms.
- Validate embedded source attribution metadata.
- Verify desktop and mobile GLBs decode in Three.js.

### 15.2 Motion tests

Test timeline boundaries immediately before, at, and after `447`, `480`, `660`,
`840`, and `1020vh`. Verify clamping, reverse scroll, fast wheel jumps, direction
changes, and resize handling.

Assert:

- photo blur begins before jaw fade,
- opening reaches its final pose before zone separation begins,
- hit targets remain disabled before `840vh`,
- geometry stays fixed throughout interactive dwell,
- reverse crossing below `840vh` closes interaction,
- no transform becomes `NaN` or leaves the safe viewport.

### 15.3 Interaction tests

- Mouse, touch, keyboard, and screen-reader category access.
- Correct left/right segment-to-category mapping.
- Panel problem-to-solution transition and back behavior.
- Focus trap, Escape, and focus restoration.
- Form context fields and Netlify success/error states.
- Fallback and reduced-motion flows retain all content.

### 15.4 Browser review

Review at:

- `1920×1080`,
- `1440×900`,
- `375×812`,
- `390×844`.

Check sticky `top: 0`, no blank frame, no hard handoff cut, no page overflow,
stable labels, acceptable frame rate, correct mobile camera framing, menu
regression, clean console, and natural trackpad/wheel/touch behavior.

Run tests, lint, TypeScript, production build, `git diff --check`, credential
scan, license/attribution scan, asset metadata validation, and browser console
checks before requesting localhost approval.

## 16. Scope exclusions

- No medical diagnosis or treatment guarantee.
- No patient records or medical-history collection.
- No CMS or external clinical API.
- No WebGPU-only implementation.
- No audio.
- No wheel interception or smooth-scroll library.
- No runtime image sequence or scrubbed MP4 fallback.
- No free orbit control during scroll choreography.
- No external 3D artist before the internal production candidate is reviewed.

## 17. Delivery sequence

1. Commit this approved design specification on the Codex design branch.
2. User reviews the written specification.
3. Create a task-level implementation plan.
4. Start implementation from current `origin/main` on a dedicated
   `codex/<topic>` feature branch or isolated worktree.
5. Keep localhost live and review model preparation before integrating the
   full scroll and interaction layer.
6. Do not commit or push implementation to `main` before explicit localhost
   approval.
7. After approval, merge and push `main`, fast-forward `develop`, and verify the
   Netlify deployment.
