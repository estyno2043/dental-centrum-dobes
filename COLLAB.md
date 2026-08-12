# Collaboration

`COLLAB.md` is the shared coordination record for Codex and Claude. Read and
update it before taking or handing off work.

## Current Task

- Status: Tasks 1–7 approved; Task 8 in progress
- Owner: Codex
- Branch: `codex/runtime-jaw-3d`
- Task: Harden realtime jaw lifecycle, fallback, accessibility, performance,
  and motion-contract cleanup before localhost visual approval.

> On 2026-08-11 the user approved model B, `Free Teeth Base Mesh` by
> ferrumiron6, as the production source and approved proceeding without an
> external 3D artist. Technical inspection confirmed that one clean source
> assembly contains 32 disconnected tooth components, two independently
> transformable gum meshes, and 17,056 rendered triangles. The formal
> Sketchfab license is CC BY 4.0 and therefore requires attribution even though
> the author's description says attribution is optional. The visual direction
> is four sequential phases: clinic-photo handoff and small closed jaw,
> opening/tilting, symmetric zone separation, then a fixed interactive dwell.
> Click interaction begins only after geometry stops changing.

> Design-spec handoff on 2026-08-11: the approved design is written at
> `docs/superpowers/specs/2026-08-11-runtime-jaw-3d-design.md`. Self-review
> found and fixed ambiguous FDI zone ranges and an imprecise motion assertion.
> Placeholder scan, `git diff --check`, changed-document credential scan, and
> full diff review passed. No application code, model asset, dependency, or
> production branch changed. User review of the written spec remains the gate
> before `writing-plans` and implementation.

> The user approved the written spec on 2026-08-11. Codex is now creating the
> task-level implementation plan. No application code or model asset may be
> changed during this planning pass.

> Planning handoff on 2026-08-11: detailed TDD plan is at
> `docs/superpowers/plans/2026-08-11-runtime-jaw-3d-implementation.md`. It has
> ten reviewable tasks covering licensed source preparation, Blender export,
> asset validation, pure motion contracts, direct Three.js runtime, patient
> content, Netlify form detection/submission, accessible overlay/panel,
> single-sticky integration, fallbacks/performance, localhost approval, and
> production cleanup/publication. Self-review confirmed spec coverage, 32
> teeth/two gums/seven anchors/seven hit proxies, consistent imperative motion
> interfaces, no placeholders, balanced code fences, clean credential scan,
> and no application edits. Current machine lacks Blender; execution Task 1
> requires Blender 4.0.5 or newer before model generation.

> Execution setup on 2026-08-11: user selected subagent-driven development.
> Isolated worktree is
> `/Users/goat/Documents/ChatGPT/DOBES/.worktrees/runtime-jaw-3d` on branch
> `codex/runtime-jaw-3d`, created from `origin/main` at `d82ef41`. Design and
> plan docs were cherry-picked as `dae34c4` and `1672850`. `npm install`
> completed and baseline `npm test` passed 74/74 tests. Task 1 has not started
> because `/Applications/Blender.app/Contents/MacOS/Blender` is absent.

> Blender preflight on 2026-08-11: Blender 5.2.0 LTS is available at
> `/Applications/Blender.app/Contents/MacOS/Blender`. The approved source
> archive is `/Users/goat/Downloads/free-teeth-base-mesh.zip`; its SHA-256 is
> `f233e4cd8c75b976eae3dc1542694cd23d7a98a7411bcb2d7d6c439ac09b42b8`,
> matching the recorded audit. Task 1 may now generate and validate licensed
> source, desktop/mobile GLBs, and poster/fallback assets.

> Task 1 handoff on 2026-08-11: licensed deterministic asset pipeline is in
> commits `d59f53d` and `88690bb`. Independent review passed spec compliance
> and approved code quality after the front zone was corrected to include FDI
> canines 13/23/33/43. Final assets contain 32 separate teeth, two gums, seven
> anchors, and seven hit proxies. Desktop is 17,113 triangles / 136,788 bytes;
> mobile is 10,110 triangles / 116,532 bytes. Exact semantic membership,
> proxy coverage, attribution, bounds, budgets, and deterministic hashes are
> validated. `jaw:build`, 74/74 tests, lint, typecheck, Next build, glTF
> validation, whitespace scan, and credential scan passed. Poster/fallback
> visual audit passed. Non-blocking Sharp/libvips and Blender deprecation
> warnings remain; npm audit reports one low and five high transitive findings.

> Task 2 handoff on 2026-08-11: pure motion contracts are in commits
> `31501ea` and `0a57fc3`. Independent review passed spec compliance and
> approved code quality after deprecated `globalTime`/`finalOpacity` mappings
> were restored as a temporary bridge for the existing video consumer. New
> canonical fields are `jawOpen`, `jawSeparation`, `labelsOpacity`, and
> `interactive`; desktop ends at 1020vh and mobile at 750vh. Jaw pose is pure,
> clamped, reversible, and Three/DOM-free. Symmetric arch travel is ±12% of
> model height; premolar/molar/gum offsets are 8% width, 18% width, and 3%
> depth. 103/103 tests, lint, typecheck, production build, whitespace scan,
> and credential scan passed. Task 7 must remove the deprecated bridge with
> the old video consumer.

> Task 3 handoff on 2026-08-12: validated direct Three.js runtime is in
> commits `1e5205f` and `9ceb63a`. Independent review passed spec compliance
> and approved code quality after correcting production patient-side X signs,
> adding aspect-aware maximum-envelope framing for 390×844 portrait and
> 1440×900 landscape, and making partial construction cleanup exactly-once.
> Runtime validates 32 teeth, two gums, seven anchors, seven proxies, and CC
> BY 4.0 attribution; renders on demand; projects anchors; raycasts only
> proxies after interaction; and cleans renderer, observer, listeners, and GPU
> resources. 136/136 tests, lint, typecheck, production build, jaw validation,
> whitespace scan, and credential scan passed. Browser visual audit remains
> deferred until React integration.

> Task 4 handoff on 2026-08-12: immutable patient guidance is in commits
> `032498d` and `b253cd3`. Independent review passed spec compliance and
> approved code quality after consolidating `JawZoneId`, deep-freezing the
> shared graph, binding €40 to `Komplexné vyšetrenie`, binding €130 to `Dlaha
> pri bruxizme`, and omitting the replacement price property. Four zones each
> contain four exact patient-language problems with non-diagnostic solution
> mappings, official price-list values only, conditional timing, and stable
> nested lookups. 147/147 tests, lint, typecheck, production build, whitespace
> scan, and credential scan passed.

> Task 5 handoff on 2026-08-12: accessible detail navigation and Netlify
> appointment flow are in commits `7ba7a3f` and `0fdedd9`. Independent review
> passed spec compliance and approved code quality after replacing the live
> `type="hidden"` honeypot with a visually hidden enabled text control and
> aligning the mobile bottom-sheet breakpoint with the canonical `<768px`
> runtime profile. The static build-time form definition and interactive
> URL-encoded submission contain the same fields; keyboard focus restoration,
> loading/success/error states, and the 62dvh mobile sheet are covered. 161/161
> tests, lint, typecheck, production build, whitespace scan, and credential
> scan passed.

> Task 6 handoff on 2026-08-12: realtime jaw orchestration is in commits
> `de1c103`, `01f9c6c`, `e9c721d`, `17edce9`, and `b807120`. Five independent
> review rounds ended with spec PASS and code-quality APPROVED. The experience
> lazily starts the direct Three.js controller after intersection, retains a
> motion-gated poster until the first valid frame, exposes four semantic HTML
> controls and seven projected leaders, preserves live anchor coordinates,
> restores visible focus on reverse scroll, and falls back to fully usable
> static/reduced-motion controls. Pre-dwell canvas, controls, attribution, and
> hidden links are pointer- and keyboard-transparent so the native gallery
> swipe remains unobstructed. Controller cleanup is exactly once across fatal,
> unmount, and profile changes. 188/188 tests, jaw validation, lint, typecheck,
> production build, whitespace scan, and credential scan passed.

> Task 7 handoff on 2026-08-12: single-sticky realtime integration is in
> commits `d4b0d28` and `fb2e343`. Independent review passed spec compliance
> and approved code quality after restoring a persistent approximately 180ms
> critically damped progress follower and making the full-viewport jaw host
> pointer-transparent to native mobile gallery swipes. One sticky pin now owns
> seven gallery frames, the sharp frame-07 handoff, realtime jaw, controls,
> panel, and static Netlify form. Raw reverse below the canonical 840vh desktop
> boundary disables interaction and closes the panel immediately; forward
> interaction waits until the damped final geometry settles. Six obsolete
> video seek/motion/tracking modules and tests were deleted. 165/165 tests,
> jaw validation, lint, typecheck, production build, SSR form inspection,
> whitespace scan, obsolete-runtime scan, and credential scan passed.

> Implementation approval on 2026-08-11 locks one reversible 1030vh desktop
> timeline: grow 0–84, pan 84–380, frame-07 zoom 380–480, blur 442–480,
> jaw fade 447–480, eight-second scrub 480–930, dwell 930–1030. Mobile keeps
> native gallery swipe, then 40vh auto-snap, 100vh handoff, scrub, and dwell.
> One sticky viewport must remain at `top: 0`; no section cut, blank frame,
> wheel interception, image sequence, or WebCodecs runtime is allowed.
>
> Local verification on 2026-08-11: 74 tests passed; lint, TypeScript,
> production build, `git diff --check`, and repository credential-pattern scan
> passed. All eight clips are H.264 High/yuv420p, 30fps, silent, fast-start,
> and all-intra: desktop 11,003,664 bytes total; mobile 4,407,945 bytes total.
> Browser checks passed at 1920×1080, 1440×900, 375×812, and 390×844 with
> sticky `top: 0`, zero horizontal page overflow, mobile swipe/auto-snap,
> responsive frame-07 crop, and working mobile menu. Coarse forward and reverse
> jumps reached the correct segment and decoded time. A runtime regression
> revealed that frame callbacks registered after `seeked` could miss a paused
> compositor frame; queue now registers before changing `currentTime`, ignores
> stale frames, and swaps only on the target decoded frame. Localhost remains
> `http://localhost:3000/`. Nothing is committed, pushed, or merged.

> Quality revision on 2026-08-11: user found jaw detail too soft. Root cause is
> conservative all-intra CRF 30 desktop / 28 mobile while generated assets use
> only 4.27 MiB of the 12 MiB desktop budget and 2.42 MiB of the 5 MiB mobile
> budget. Final encode uses CRF 21 desktop / 22 mobile, retaining GOP 1, 30fps,
> fast-start, original dimensions, segmentation, and existing tracking. First
> desktop segment SSIM improved from 0.991979 / 20.96 dB to 0.995827 / 23.80 dB.
> All 74 tests, lint, TypeScript, production build, `git diff --check`, media
> decode/all-intra checks, credential scan, localhost HTTP range response, and
> 1440×900 browser check passed. Browser loaded the new asset, sticky remained
> at `top: 0`, horizontal overflow stayed zero, and console errors stayed zero.

> The user approved transition direction B on 2026-08-10: the sharp final
> clinic photograph grows to full screen; blur begins during the late zoom;
> the jaw appears subtly over the blurred clinic background. No square reveal,
> hard cut, one-file MP4 scrub, or image-sequence runtime is allowed.
>
> The user delegated annotation selection. Locked content: (1) natural bite —
> crowns and bridges as one functional whole; (2) preserve the natural tooth —
> microscope-assisted endodontics; (3) healthy foundation — GBT care for
> teeth, gums, restorations, and implants. Implant placement does not receive
> an arrow because no implant or bone is visible in the render.
>
> Input handling is locked: actual section scroll position is the source of
> truth for trackpad, wheel, keyboard, scrollbar, and touch. A requestAnimationFrame
> smoothing layer drives the media timeline. Native scrolling remains unblocked.
> The active and adjacent short clips are buffered in a two-video deck; segment
> swaps wait for a decoded compositor frame.
>
> Demo verification on 2026-08-10: 48 tests passed; lint, TypeScript,
> production build, `git diff --check`, changed-text credential scan, and all
> nine generated-media checks passed. Eight H.264 High/yuv420p clips are
> independently seekable at 30 fps with no audio: desktop 1920×1080 and phone
> 720×1280, four approximately two-second segments each, plus a 1920×1080
> poster. Browser checks passed at 1440×900 and 375×812. Gallery handoff grows
> the sharp final photograph to full screen, adds late blur, then reveals the
> jaw without a hard cut. All four segments swap forward and backward under
> coarse-wheel jumps; native document scroll remains active. Three branded
> SVG leaders track the rendered bite, tooth, and gum targets. Phone loads the
> portrait assets, keeps manual snapping gallery swipe and mobile menu, and
> has zero horizontal page overflow. Console had no runtime errors; only
> expected development Fast Refresh warnings appeared while source files were
> being edited. Localhost remains `http://localhost:3000/`. Nothing from this
> demo has been pushed or merged; user review is the gate.

> The user approved the combined motion direction on 2026-08-09: square
> center reveal for hero → statement, then gradient veil for statement → photo
> strip. The statement photograph must appear before its copy; the hero must
> never reappear under the second transition. Work started from current
> `origin/main` at `e0a50cd`; stable rollback commit `ffb6ecc` will be applied
> without rewriting shared history.
>
> The user rejected the new nested slide stack because its overflow wrapper
> disables the photo strip's sticky positioning. Phase 1 restores the proven
> homepage composition without rewriting history. That stable composition is
> the baseline for this approved transition work.
>
> Phase 1 verification: 14 tests passed; lint, TypeScript, `next build`,
> `git diff --check`, tracked credential-pattern scan, homepage HTTP, and the
> retained photograph's HTTP/content-type check passed. The dev server at
> `http://localhost:3000/` ran from the Phase 1 worktree. Automated Browser
> inspection remained blocked by Browser URL policy, so user visual review is
> the merge gate.
>
> Phase 2 verification: 26 tests passed; lint, TypeScript, production build,
> `git diff --check`, tracked credential-pattern scan, homepage HTTP, and all
> three affected JPEG asset checks passed. Browser measurements passed at
> 1440×900 and 375×812 with no console errors or warnings and no horizontal
> page overflow. Desktop square reveal measured `50% → 25% → 0%`; copy stayed
> hidden until the photograph opened; statement veil reached opacity `1` over
> the statement photograph while the hero remained absent. Gallery pin held at
> `top: 0`; frames ended 71px above the viewport bottom; grow ended before pan.
> Mobile menu, Escape focus return, and native gallery swipe all passed.
> Localhost runs from this branch at `http://localhost:3000/`. The user
> approved the result on 2026-08-09 and explicitly requested publication to
> `main` before work begins on the jaw-animation section.

## File Reservations

- Codex reserves `COLLAB.md` for Task 8 coordination.
- Task 8 implementer reserves `components/home/jaw/JawSceneController.ts`,
  `JawExperience.tsx` and its test, `JawZoneOverlay.tsx`,
  `JawDetailPanel.tsx`, `jawExperience.module.css`,
  `components/home/ClinicStory.test.tsx`, plus
  `components/home/clinicStoryMotion.ts` and its test for removal of the now
  dead `globalTime`/`finalOpacity` video-compatibility bridge.

> **Read this before touching the build.** The framework changed. The project
> no longer runs on `vinext` or Cloudflare Workers — it is now standard
> **Next.js 16**, and `npm run dev` is `next dev`, not `vinext dev`. Anything
> you remember about `wrangler`, `worker/index.ts`, D1 bindings, or
> `vite.config.ts` no longer applies.

Claim a task and its files here before editing. Do not edit files reserved by
the other agent unless that agent has handed them off.

## Decisions

- `main` is the single source of truth and Netlify production branch. Approved
  changes must be merged and pushed there after localhost review.
- `develop` is retained only as a compatibility mirror and must be
  fast-forwarded from `main`; new work does not start there.
- Codex uses `codex/<topic>` working branches; Claude uses
  `claude/<topic>` working branches.
- Integrate work through small, descriptive commits.
- `AI_WORKFLOW.md` is the canonical rulebook shared by Codex and Claude.
  `AGENTS.md` and `CLAUDE.md` are model entrypoints; this file records current
  state, decisions, reservations, and handoffs.
- Every frontend change stays live on the active branch's localhost server.
  Codex and Claude browser-check meaningful visual batches and request local
  user approval before merging design-sensitive work into `main`, unless the
  user asks to skip that review.
- Claude and Codex must pull from `origin/main` before starting and must put
  user-approved work back on pushed `main`. A completed feature cannot remain
  only on an agent branch. When Netlify is connected, both developers verify
  the resulting live deployment and share its URL so everyone reviews the same
  version.

## Completed

- Collaboration protocol established.
- Project foundation — complete. Tests run: `npm test` (4 passed),
  `npm run build` (passed), `git diff --check` (passed), and tracked-content
  credential scan (no matches). Final commit: `docs: hand off project foundation`.
- Final review fix wave — complete. Tests: 5 passed. Lint, standalone
  TypeScript, production build, runtime audit, tracked-content credential scan,
  and whitespace validation passed. The full development audit retains 16
  tooling advisories, reported separately in the final fix report.
- Second-machine environment onboarding — complete. The repository is checked
  out on the controller's working machine and the toolchain is verified there:
  `npm install`, `npm test` (5 passed), `npm run build` (passed),
  `npm run lint` (clean), `npm run typecheck` (clean), and a dev-server runtime
  check of `/` (hero renders as approved, no console errors). `.claude/` is now
  ignored so local agent configuration stays out of the repository.

- Hero media encoded from the 4K master — complete. Tests: 8 passed. Lint,
  TypeScript, production build, and a dev-server check at 375px and desktop all
  passed; the browser resolves `hero-720.mp4` on phones and `hero-1080.webm` on
  desktop. The segment is 15s–37s of the master and the reasons it cannot be
  widened are recorded in `scripts/encode-hero-video.sh`.

- Hero media replaced with the studio's own edit — complete. Tests: 8 passed.
  Lint, TypeScript, and the production build passed; a dev-server check
  confirmed all four assets serve with the right content types, both 1080p
  encodes decode at 1920×1080 / 79.03s, and the hero plays with a clean
  console at 1440px and at phone width.

  The hero is no longer cut from the raw 145s clinic promo. It is a finished
  edit supplied by the studio as a ProRes 422 HQ master, used start to end.
  `scripts/encode-hero-video.sh` now takes that master and only encodes — it no
  longer selects a segment, and the raw 4K file is not an input to it any more.
  Current master: `0724(1).mov`, 1920×1080, 30 fps, 79.03s, ~2.0 GB.

  History, so the same ground is not covered twice by accident. Four sources
  were tried; the user declined the last three:
  1. the shipped 15s–37s window — turned out to contain five internal cuts;
  2. a 4.83s single-shot waiting room loop — too repetitive;
  3. the studio's 19.2s edit — 10 shots, too fast behind the headline;
  4. a 15.2s cut proposed from the calm shots of the current master.
  The user then asked for the supplied edit, whole and unmodified, which is
  what shipped. If he asks for something different later, that supersedes this
  — it is a record of what happened, not a standing constraint. The waiting
  room work is kept on `claude/hero-waiting-room-loop`, unmerged.

  Encoded at 30 fps. An earlier master was exported at 60 fps, but ~40% of its
  frames were exact duplicates (689 unique of 1153, measured with mpdecimate)
  because the footage under it is 29.97 fps, so 60 fps cost bitrate for no
  visible gain.

  CRF was raised from 25/34/24 to 29/38/28 because 79s is long for a background
  loop. At the old settings the 1080p H.264 came out at 25.18 MiB — over
  Cloudflare's 25 MiB per-asset limit, so it would not have deployed — and
  phones were pulling 14.37 MiB. Now 15.80 / 15.52 / 9.04 MiB. The loss is not
  visible under the hero scrim, but 9 MiB on a phone is still heavy and is the
  strongest practical argument for a shorter edit later.

- PR #1 synchronized into the shared local workspace — complete. The working
  branch `codex/sync-claude-pr` contains Claude's full hero client cut, media,
  encoder changes, and handoff history. Added `AI_WORKFLOW.md` as the canonical
  workflow and pointed both model entrypoints at it. Tests: 8 passed. Lint,
  TypeScript, production build, `git diff --check`, media metadata checks, and
  tracked-content credential scan passed. PR #1 now targets `develop` instead
  of stable `main`. Workflow commit `d82b256` is pushed; draft PR #2 targets
  `develop` and is stacked on PR #1.

- Mobile hero and Dental Menu Mark — implemented locally. The phone hero is
  compact, the branded Radix/Motion menu replaces generic hamburger behavior
  up to 960px, and desktop navigation remains unchanged above that breakpoint.
  Tests: 13 passed. Lint, TypeScript, production build, `git diff --check`,
  credential-pattern scan, and Browser checks at 320, 375, 400, 430, 768, 960,
  961, and 1440px passed. Escape closes the dialog, focus returns to trigger,
  body scroll locks while open, and Browser console has no page errors. Branch
  was kept local until user approval and is now published in draft PR #3.

- Production branch consolidation — complete. PR #3 promoted the full approved
  website to `main`; PR #1 and PR #2 are also recorded as merged after
  `develop` was fast-forwarded to the same commit. `main` is now the Netlify
  source of truth and `develop` only mirrors it. The rejected waiting-room loop
  remains excluded. Post-merge verification on `main`: 13 tests passed, lint,
  TypeScript, production build, localhost HTTP check, and Browser interaction
  check at 400 × 664 passed with no console errors.

- Migration off vinext to standard Next.js — complete, pending user review.
  Tests: 13 passed. Lint, TypeScript, and `next build` passed; a fresh-tab
  localhost check at 1440px and 375px had a clean console, the hero resolves
  `hero-1080.webm` (79.03s) on desktop, and Codex's mobile menu still opens,
  locks body scroll, lists all five links plus the CTA and phone, closes on
  Escape, and returns focus to its trigger.

  **Why this was necessary.** Netlify cannot host a Cloudflare Worker. Under
  `vinext` the build produced `dist/client/` with zero HTML files and
  `dist/server/wrangler.json` declaring a workerd worker with `nodejs_compat`;
  Netlify Functions run on AWS Lambda and Deno Edge, and no vinext→Netlify
  adapter exists. The recorded decision that `main` is the Netlify production
  branch was therefore not achievable as the project stood. The user was shown
  the evidence, was offered Cloudflare Workers as the alternative that would
  have worked with no code change, and chose to migrate to Netlify instead.

  **What changed.** Added `next@16` and `@netlify/plugin-nextjs` plus
  `netlify.toml`. Removed `vinext`, `@cloudflare/vite-plugin`,
  `@cloudflare/workers-types`, `wrangler`, `vite`, `@vitejs/plugin-rsc`, and
  `react-server-dom-webpack`. Deleted `vite.config.ts`, `worker/`, `build/`,
  and `.openai/`. Scripts are now `next dev` / `next build` / `next start`.
  Package renamed from `site-creator-vinext-starter` to `dental-centrum-dobes`.

  **What was deleted as dead scaffolding**, after confirming nothing in `app/`
  or `components/` imported it: `db/`, `drizzle/`, `drizzle.config.ts`,
  `drizzle-orm`, `drizzle-kit`, and `examples/`. The D1 database was never
  wired to anything — `getDb()` had no callers. If a database is needed later
  it has to be chosen fresh; Netlify has no D1 equivalent. `app/chatgpt-auth.ts`
  is also unused but was left in place as it costs nothing and is outside this
  change.

  **Result.** `/` prerenders as static content, so Netlify serves it from CDN
  with no function invocation. `vitest.config.ts` needed no change — it always
  had its own React plugin and never read `vite.config.ts`.

- Statement band, rebuilt — complete, pending user review. Tests: 13 passed.
  Lint, TypeScript and `next build` passed; localhost measured at 1400×860 and
  375×812 with a clean console.

  Built against a screen recording of lavadental.lv the user supplied. Frame
  analysis of that recording: the hero does **not** scroll away — it stays put
  and is progressively cut off from the bottom as the next section rises over
  it (at 2.1s the hero headline reads only "Dentistry that will"). The
  sentence fades in *during* that rise and drifts upward, reaching full
  strength exactly as the section lands full screen.

  Measured behaviour here, matching that:

  | scroll | band top | hero pinned | text opacity | text offset |
  |--------|----------|-------------|--------------|-------------|
  | 0      | 678      | yes         | 0.00         | 40px        |
  | 339    | 339      | yes         | 0.33         | 27px        |
  | 509    | 169      | yes         | 0.67         | 13px        |
  | 678    | 0        | yes         | 1.00         | 0px         |

  **The reveal is a scroll listener writing one custom property**, not
  `motion`'s `useScroll` and not a CSS `view()` timeline. Both of those were
  built first and discarded. The CSS timeline needs Chrome 115+/Safari 26+ and
  does nothing at all where it is missing; more importantly neither could be
  measured before shipping, and shipping an unverified reveal once already
  wasted a review round. The stylesheet defaults `--reveal: 1`, so a page that
  never runs the script shows the sentence outright — verified, the server HTML
  contains no `opacity:0`.

  `overflow-x: hidden` is gone from `html, body`. It makes the root a scroll
  container and silently disables `position: sticky` site-wide, which the
  pinned hero depends on. Nothing overflows horizontally at either width.

  Both the pinned layer and the band are sized in `dvh`, not `svh`: `svh` is
  the small viewport height and is shorter than what is on screen whenever
  browser UI is collapsed, which previously left a strip of the band showing
  under the hero on the first screen.

- Horizontal photo strip — complete, pending user review and photography.
  Tests: 13 passed. Lint, TypeScript and `next build` passed; measured at
  1400×860 and 375×812 with a clean console and no horizontal overflow.

  From the same recording: a row of frames rises as a narrow band, grows to
  near full height, then pans sideways while the page scrolls down, with the
  section pinned for the length of the pan. Measured here — the pin holds at 0,
  `--p` runs 0→1, frames grow 359→654px through the first fifth and then hold,
  and frame widths stay varied (1046/490/1162/523/980/654/1046) so it reads as
  a filmstrip rather than a table.

  **Photography is not in yet.** Every frame renders a numbered placeholder
  naming the shot that belongs there. Filling one in means adding `src` to that
  entry in `photoStripContent.ts` and nothing else.

  **Frame widths are fixed and heights animate**, not the reverse. Sizing each
  frame by aspect ratio against an animated height made every frame widen as
  the strip grew, so the track's total width — and therefore the distance left
  to pan — moved during the animation. `--travel` came out 4688px against a
  true 2048px. Width now derives from a constant, so travel measured once stays
  correct.

  **Phones swipe instead of being pinned.** A landscape frame at any useful
  height is wider than a phone screen, and capping every frame to fit flattened
  them all to one width and killed the rhythm. Below 768px the section drops
  the pin, the growth and the pan, and becomes a snapping horizontal scroller —
  which is also what a phone does natively, and most of this site's traffic is
  mobile.

  Pan speed is one number: `height` on `.section` in `photoStrip.module.css`.
  The surplus over one viewport is the scroll the pan consumes. 480svh gives
  1.43:1 on desktop; 320svh gave 2.5:1 and felt slippery.

## Open Questions

Both questions below are for the user; they gate the next content task.

1. Which section comes after the hero — the signature tooth map, or a lighter
   services section first?
2. Does the section after the dark cinematic hero go light for contrast, or
   continue the dark line?

Two more, raised by the hero media work:

3. The clinic footage was shot in winter and a small Christmas tree is visible
   at the reception in the opening shot of the edit. Acceptable for now, but it
   should be reshot rather than worked around.
4. The logo tagline sits over bright areas of some shots and reads poorly, most
   noticeably on phones. Fixing it means strengthening the scrim at the top of
   the hero, which is a design change and so has not been made unilaterally.

5. Context on the hero edit, so it is not re-cut on a hunch: it runs 29 shots
   in 79s (2.73s average), so a hard cut lands behind the headline every few
   seconds, and a good part of it is procedural footage — including four
   intraoral macro shots at roughly 43.8s, 60.4s, 62.7s and 69.0s. This is what
   the user chose after declining three alternatives. If he asks for a change,
   just make it; this note exists to save re-deriving the analysis, not to
   argue against him.

   Two loose ends, not blocking: phones download 9.04 MiB for the background
   loop, and the Lighthouse ≥90 target has not been re-measured since the file
   grew. Worth raising if the metrics matter. If the footage is ever revisited,
   this master has already been scanned shot by shot and holds no longer calm
   take — the fix would be a dedicated hero shoot: one locked or slow-dolly
   take of 20–30s, outside winter, with no burned-in titles.

Also still pending from the client, and blocking any media-dependent section:
clinic photography, Google Business Profile and DNS access, written consent for
reviews and before/after imagery. A higher-frame-rate master would also help —
everything supplied so far traces back to 29.97 fps footage, so 50/60 fps is
not achievable without interpolation artifacts, whatever the export is tagged.

## Handoff Log

- 2026-08-06 — Collaboration protocol created; task state set to Idle.
- 2026-08-06 — Codex completed Project foundation on
  `codex/project-foundation`; no files are reserved. Next task: Await user
  instruction.
- 2026-08-06 — Codex completed the final review fix wave on
  `codex/project-foundation`; no files are reserved. Next task: controller
  review and integration.
- 2026-08-06 — Claude completed environment onboarding and integration
  verification on `claude/environment-onboarding`, merged into `develop`; no
  files are reserved. Next task: await the user's answers to the two open
  questions, then design and build the section that follows the hero.
- 2026-08-06 — Claude completed the hero media encode on
  `claude/hero-video-quality`, merged into `develop`; no files are reserved.
  Next task: await the user's answers to the open questions, then build the
  section that follows the hero.
- 2026-08-06 — Claude replaced the hero media with the studio's own 79s edit on
  `claude/hero-client-cut`, pushed to origin; no files are reserved. Not yet
  merged — awaiting the user's review. A rejected alternative, the single-shot
  waiting room loop, sits unmerged on `claude/hero-waiting-room-loop`, also
  pushed so the other machine can see it. Next task: merge on approval, then
  await the answers to the open questions above.
- 2026-08-07 — Codex fetched PR #1 and checked it out through
  `codex/sync-claude-pr`, making Claude's changes live in the shared local
  workspace. Added one canonical workflow for both models, pushed commit
  `d82b256`, retargeted PR #1 to `develop`, and opened stacked draft PR #2 for
  the workflow. No files are reserved. Next task: merge PR #1 after review;
  then PR #2 will contain only the shared workflow change.
- 2026-08-07 — Codex completed the approved mobile hero and Dental Menu Mark
  design on `codex/mobile-hero-menu`. The design spec is reserved pending user
  review; production hero files have not been edited. Next task: after spec
  approval, write the implementation plan and build through TDD.
- 2026-08-07 — Codex implemented the approved compact mobile hero and Dental
  Menu Mark on `codex/mobile-hero-menu`. Full verification and responsive
  Browser audit passed. Files remain reserved while the user reviews localhost;
  branch has not been pushed. Next task: apply visual feedback, or push and open
  a PR against `develop` after approval.
- 2026-08-07 — User approved the localhost result. Codex pushed
  `codex/mobile-hero-menu` and opened draft PR #3 against `develop`:
  https://github.com/estyno2043/dental-centrum-dobes/pull/3. Added the mandatory
  localhost hot-reload and Browser review loop to `AI_WORKFLOW.md` for Codex and
  Claude. No files are reserved. Next task: await user instruction; future
  frontend batches must be reviewed locally before push.
- 2026-08-07 — User selected `main` as the Netlify deployment and single source
  branch. Codex retargeted and merged PR #3 into `main`, fast-forwarded
  `develop` to match it, and confirmed PR #1 and PR #2 as merged. Updated
  `AI_WORKFLOW.md`, `AGENTS.md`, and `CLAUDE.md`: new work starts from
  `origin/main`, localhost review precedes production merge, and approved work
  ends pushed on `main`. No files are reserved. Next task: await user
  instruction.
- 2026-08-07 — User clarified cross-device review expectations for Claude.
  Added an explicit rule to `AI_WORKFLOW.md`, `CLAUDE.md`, and this record:
  Claude and Codex fetch `origin/main` before work, approved changes must reach
  pushed `main`, and the Netlify live URL is verified and shared after deploy.
  No files are reserved. Next task: await user instruction.

- 2026-08-07 — Claude migrated the app off vinext/Cloudflare Workers to
  standard Next.js 16 on `claude/netlify-migration`, pushed to origin; no files
  are reserved. Not merged — awaiting user review, and the Netlify site is not
  connected yet. Connecting it needs a Netlify account and GitHub authorization
  in Netlify's own UI, which only the user can do. Next task: user connects
  Netlify to this branch or to `main` after merge, then whoever is on shift
  verifies the deployed URL and records it here.

- 2026-08-09 — Codex fetched `claude/section-restart` at `f09a090`, inspected
  its two new commits, integrated them with current `main`, and verified 13
  tests, lint, TypeScript, production build, whitespace, tracked credential
  patterns, homepage HTTP, and the new clinic photograph asset. The change adds
  a full-screen dwell between stacked homepage slides and fills frame 7 with
  the first clinic photograph. No files are reserved. Automated Browser
  inspection was blocked by Browser URL policy; user review continues at
  `http://localhost:3000/`.

- 2026-08-09 — Codex completed Phase 1 of the approved scroll-animation
  recovery on `codex/restore-photo-strip-baseline`. The behavioral changes from
  `f09a090` are reverted without rewriting history; the photograph from
  `0832b5a` remains. A regression test proves the statement band and photo
  strip again share the stable overlay instead of separate clipping wrappers.
  Verification passed: 14 tests, lint, TypeScript, production build,
  whitespace, tracked credential patterns, homepage HTTP, and photograph HTTP.
  Files remain reserved while the user reviews localhost. Next task: merge
  Phase 1 into `main` after approval, then begin the isolated Phase 2 dwell and
  sequential grow-pan implementation.

- 2026-08-09 — Codex implemented the user-approved square center reveal and
  gradient statement exit on `codex/scroll-sections-v2`, starting from current
  `origin/main` and carrying forward the stable rollback without rewriting
  history. Motion 13 drives the statement timeline through tested pure progress
  mapping. The photo strip now grows during `0–22%`, pans during `22–100%`,
  keeps its intro and full-grown cards inside the viewport, and becomes a real
  width-constrained native scroller on phones. Browser testing also caught and
  fixed the transparent overlay blocking the hero menu. Full verification is
  recorded under Current Task. Files remain reserved while the user reviews
  localhost; nothing has been merged or pushed to `main`.

- 2026-08-09 — User approved the homepage transition result and explicitly
  requested publication before the jaw-animation section begins. Fresh
  pre-publication verification passed: 26 tests, lint, TypeScript, production
  build, `git diff --check`, and changed-file credential-pattern scan. Next
  step: publish this branch through a pull request to `main`, confirm
  `origin/main`, then fast-forward `develop`.

- 2026-08-11 — Codex completed the unified gallery-to-jaw scroll story on
  `codex/jaw-scroll-demo`. User approved the final localhost result and the
  higher-quality CRF 21/22 jaw encode for publication. Verification passed:
  74 tests, lint, TypeScript, production build, `git diff --check`, credential
  scan, all-intra media checks, four desktop/mobile browser sizes, sticky and
  overflow checks, forward/reverse segment jumps, and clean console. No active
  reservations. Publication target: `main`; `develop` then fast-forwards to
  match it.

Before a handoff, commit or stash work and release or revise the relevant file
reservations. After the handoff, update this log. Never store secrets,
credentials, tokens, or local configuration values in repository files,
commits, logs, or examples.
