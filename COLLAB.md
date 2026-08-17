# Collaboration

`COLLAB.md` is the shared coordination record for Codex and Claude. Read and
update it before taking or handing off work.

## Current Task

- Status: Jaw map refinement approved on localhost — publication to `main` authorized
- Owner: Codex
- Branch: `codex/higgsfield-jaw-sequence`
- Base: `1da74bc`
- Task: delay jaw handoff until fullscreen `detail` gallery frame, compress the
  jaw reveal, replace debug-like zone rectangles and premature CTA with a
  progressive anatomical pain-map reveal, and add a gradient exit to patient
  results.

## File Reservations

- No active write reservations. The user approved the completed jaw-map
  refinement on localhost and explicitly requested publication to `main`.

- Task 8 released its exact files. `ClinicStory.tsx` remains on its temporary
  legacy call shape until Task 9; completed loader, Canvas sequence, gallery,
  drift, header, patients, media pipeline, and other app files remain protected
  and out of scope.

- Task 9 released `components/home/ClinicStory.tsx`, `ClinicStory.test.tsx`,
  `clinicStory.module.css`, `clinicStoryMotion.ts`, `clinicStoryMotion.test.ts`,
  `app/page.test.tsx`, plus the exact legacy deletes: `jawSeekQueue.ts`,
  `jawSeekQueue.test.ts`, `jawStoryMotion.ts`, `jawStoryMotion.test.ts`,
  `jawTracking.ts`, `jawTracking.test.ts`, `scripts/encode-jaw-story.sh`, and
  every file under `public/media/jaw-story/`. The gallery content, jaw sequence
  player/overlay, routes, header, patients, and drift files remain protected.
  The integration locates its handoff only with
  `photoFrames.find((frame) => frame.id === "detail")`.

- Task 9 mobile layout follow-up released `components/home/clinicStory.module.css`
  and `components/home/ClinicStory.test.tsx`. It fixes the 390×844 jaw-title
  collision without touching the jaw player/overlay, gallery data, header,
  routes, patients, or drift.

> Task 1 approval gate passed on 2026-08-14. The user rejected the original
> locked-prompt Seedance candidate for tooth deformation, explicitly directed
> the stronger rigid-tooth prompt, and approved the resulting FLUX.3 job
> (`bd346c78-8c4f-4ace-ad25-59d2eb1bbd6c`). `GENERATION.md` records this
> user-approved prompt exception and the complete rejection chain. The raw
> 1920×1088 download is retained as git-ignored SDD evidence; the tracked
> master is a reproducible centered crop to exact 1920×1080, with raw/derived
> hashes and command recorded. Rejected evidence is excluded from Git.
> Reservations remain active for Task 2, which replaces and freezes the exact
> PNG endpoints in the 1280×720 and 720×1280 sequences.
> Fix verification: 79 tests, lint, TypeScript, production build, Swift
> typecheck, raw/derived metadata and hashes, five checkpoint crop-equivalence
> comparisons, `git diff --check`, and credential scan passed.

> Task 2 extractor ruling (review fix round 1, 2026-08-14):
> `scripts/extract-jaw-sequence.swift` through macOS AVFoundation is the sole
> canonical source-frame extractor. The approved environment has no working
> ffmpeg, and ffmpeg sampling was proven to select different intermediate
> frames. `FFMPEG_BIN` is therefore rejected before output mutation instead of
> silently changing the artifact set. This deliberate deviation is safe for
> Netlify because the validated WebPs and manifest are committed; production
> never runs the macOS-only source build.

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

- Clinic gallery photography and the patients section — published to `main` on
  2026-08-14. Tests: 79 passed. Lint, TypeScript, production build,
  `git diff --check` and a credential scan passed; every asset served 200 from
  the dev server and both halves of each before/after pair decoded.

  Seven of the thirty-seven supplied clinic photographs fill the gallery,
  ordered as an arrival: brand wall, corridor, microscope treatment, the
  microscope itself, an operatory, the diagnostic room, the team. The
  instrument detail stays last because `ClinicStory` hands that frame off into
  the jaw sequence. Every frame's ratio matches its own photograph, so nothing
  is cropped, and because the shoot alternates portrait and landscape the strip
  gets its uneven rhythm without contrivance.

  New "Naši pacienti" section: light greige against the dark page above it,
  with a before/after divider built on a native `<input type="range">` — one
  decision that covers mouse, touch, keyboard and screen readers at once. Each
  case shows visits and duration beside the pictures, because a before/after on
  its own is a claim and the numbers are what make it checkable.

  **Three things are deliberately unfinished and must not be treated as
  approved content.** The wired before/after pairs are test material: which
  pair sits on which case is arbitrary and the visit counts describe nobody.
  Pair 01's halves are framed differently — a natural smile against a
  retractor shot — so the divider slides between two kinds of photograph. And
  the clinic's **written consent for patient imagery is still outstanding**;
  none of this may be published until it exists.

  Not merged: `claude/nav-hover-menu` carries a half-finished collapsing
  navigation whose links stay at `opacity: 0`. It is parked on its own branch
  and stays out of `main` until it works.

## Staff roster

Supplied by the user on 2026-08-14, verbatim. Nothing here is invented — when a
team section is built, use these exactly, and do not fill in a role that is not
listed. Portrait originals are in `~/Downloads/dobes-media-raw/portrety/<slug>/`,
one folder per person, 1–6 frames each.

| Slug | Name | Role as given |
| --- | --- | --- |
| `dobes` | MUDr. Ján Dobeš | — |
| `dobesova` | MUDr. Mária Dobešová | — |
| `kunova` | MDDr. Alexandra Kunová | — |
| `novotnakova` | MUDr. Daniela Novotňáková, PhD., MPH, MBA, LL.M. | — |
| `petschuchova` | Tamara Petschuchová, Dipl. DH. | — |
| `vankova` | Bc. Janka Vaňková | — |
| `volny` | Ing. Babula Voľný | — |
| `lattova` | Zuzana Lattová | zdravotná sestra |
| `makaiova` | Lucia Makaiová | zdravotná sestra |
| `ozvaldova` | Mgr. Jana Ožvaldová | zdravotná sestra |
| `izova` | Svetlana Ižová | zdravotná sestra |

Seven of the eleven came without a stated role. Ask rather than infer one from
the title — `Dipl. DH.` suggests a dental hygienist and `MUDr.`/`MDDr.` a
dentist, but which of them lead, and what each specialises in, is not something
to guess on a clinic's behalf.

2026-08-17: cross-checked against the team page of the clinic's previous site,
`bratislavazubar.sk/nas-team`. It carries the same eleven names in the same
order and states a role for the same four nurses and nobody else, so the seven
missing roles are still outstanding — the old site is not a source for them.
Its order does pair the columns, dentists and the hygienist on the left against
the nurses on the right, and `components/team/teamContent.ts` keeps that order.
The old site also yields contact facts the new one still lacks: Vlárska 13/c,
Bratislava-Kramáre 831 01, telefón 02/434 256 81, mobil 0918 800 002, ordinačné
hodiny Po–Št 8:00–19:00 and Pi 8:00–14:00.

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

- 2026-08-14 — Claude published the clinic gallery photography and the new
  "Naši pacienti" section to `main`; `develop` fast-forwarded to match. No
  files are reserved. Outstanding before this section can go live: written
  patient consent, real case text, and a matching before/after pair to replace
  the mismatched one. Seven of the eleven staff members still have no stated
  role, which blocks the team section. `claude/nav-hover-menu` remains unmerged
  and unfinished. Next task: await user instruction.

- 2026-08-14 — Claude smoothed the join between "Naši pacienti" and the
  drifting-photograph scene at the user's request. The ground now crosses on a
  second progress value written by `DriftScene.tsx` (`--enter`, 0 while the
  section's top edge is a screen away, 1 when it reaches the top), so the
  colour handoff spends the whole approach easing instead of changing after the
  section pins. In the header the link row leaves first and the taupe bar
  follows after a 0.1s hold, and the logo, tagline and tour button now carry
  their own colour transitions so the minimal-mode flip eases rather than
  snapping. Verified by measurement at the boundary: `--enter` ramps 0→1 across
  one viewport, the mixed background moves continuously between the two tones,
  and the header's classes and computed colours flip once at the section edge.
  79 tests, lint, TypeScript and the production build all pass. Published to
  `main`; `develop` fast-forwarded. No files reserved. The patient section's
  outstanding blockers are unchanged: written consent, real case text, and a
  matching before/after pair.

- 2026-08-15 — Codex completed Task 8 on
  `codex/higgsfield-jaw-sequence`: six validated demo jaw-problem destinations,
  controlled Netlify booking form, static form detection, clipped honeypot,
  abort-safe request handling, no-PII controlled-ID CTA analytics, and mobile
  44px controls. Full verification: 183 tests, lint, TypeScript, production
  build, whitespace diff, credential scan, and desktop/375×812 localhost
  review passed with clean console. Task 8 exact files released; Task 9 may now
  use routes from the existing jaw overlay.

- 2026-08-15 — Codex completed Task 9 on
  `codex/higgsfield-jaw-sequence`: `ClinicStory` now preserves the complete
  semantic gallery, finds the `detail` handoff by id, and runs the approved
  WebP jaw sequence with native scroll, an approximately 180 ms critically
  damped frame target, reverse-safe zone release, visibility pausing, reduced
  static fallback, and six no-JS routes. The legacy segmented MP4 runtime,
  seek queue, tracking/callout modules, encoder, and `jaw-story` media are
  deleted. `overflow: clip` contains the deliberately wide gallery without
  creating a sticky-breaking scroll ancestor. Full verification: 158 tests,
  lint, TypeScript, jaw validator, production build, whitespace diff,
  credential scan, and desktop/390×844 localhost smoke with clean console.
  Task 9 exact files are released; user localhost approval is required before
  merge or push.

- 2026-08-15 — Codex fixed the Task 9 mobile 390×844 visual regression on
  `codex/higgsfield-jaw-sequence`: the jaw title now has a full-width title
  lane and the prompt begins below it, so neither overlaps the centered 16:9
  artboard or direct entries. The fix changes only `ClinicStory` CSS and its
  regression test. Browser measurement at scrollY ~8750 confirms title,
  prompt, artboard, and direct-entry lanes are disjoint with no page overflow;
  the mobile menu still opens and the console is clean. Full verification: 159
  tests, lint, TypeScript, jaw validator, production build, whitespace diff,
  and credential scan passed. Localhost approval remains required before merge
  or push.

- 2026-08-15 — Codex completed the approved gallery-first pain-map refinement
  on `codex/higgsfield-jaw-sequence`. The seventh clinic photograph now reaches
  fullscreen and dwells before a contained rounded jaw card appears. The faster
  sequence shows only a transient “Zóny bolesti” loading cue, then a subtle
  anatomical tease, four short labelled leaders, seven precise accessible hit
  surfaces, patient-language problem cards, and a bottom-centred assistance
  bar. A light gradient dissolves into the patient-results section. Desktop
  1440×900 and mobile 390×844 localhost checks confirm no premature jaw or
  controls, clean geometry, working interaction, no horizontal overflow, and
  no console errors. Verification passed: 128 tests, lint, TypeScript, jaw
  media validation, production build, and whitespace check. No files remain
  reserved. The user approved localhost and authorized merge/push to `main`.

- 2026-08-17 — Claude built the Tím page on `claude/tim-page`, at the user's
  request in the style of the reference site's team section. Worth recording
  about that reference: it has no team subpage at all — `#team` is a section on
  its one-page site — so only its layout and motion were taken, and the page
  lives on its own route `/tim` as the user asked. Its mechanism is a
  two-column grid where the left column travels ±drift while the right stays
  put, driven by one custom property; ours reproduces that with the same
  scroll-listener approach as the drifting-photograph scene.

  Eleven portraits were encoded from `~/Downloads/dobes-media-raw/portrety` to
  `public/media/tim/<slug>.webp` plus `-mobile`, 4:5 at 1360×1700 and 680×850,
  1.0 MiB for all 22 files. Portrait-orientation sources are cropped from the
  top; the three that exist only in landscape are cropped by salience.
  Novotňáková uses frame 5871 because the others place her off-centre.

  `role` in `teamContent.ts` is optional and renders as absent when missing —
  seven of the eleven still have no stated role and a guessed job title on a
  named medical professional would be a false claim, not a placeholder. A test
  fails if anyone adds a fallback string. Verified: 131 tests, lint,
  TypeScript, production build, and measured at 1440×900 and 390×844 — two
  539px columns with the left one travelling 104px→−86px, single column and no
  drift on the phone, all eleven portraits loading the right srcset candidate,
  no horizontal overflow. `SiteHeader`'s logo and any nav item with a real
  path now route through `next/link`; the "Tím" item points at `/tim`.

  Then, at the user's request, the same section was added to the homepage below
  the drifting-photograph scene and the design pushed further. `TeamSection`
  now owns the scroll listener and both pages share it — the homepage as its
  closing section with an `h2`, `/tim` as the whole page with an `h1`, and
  `TeamGrid` went back to being a plain server component reading the inherited
  `--p`. Keeping one component rather than two copies is what stops the roster
  from diverging.

  The join reuses the pattern from the patients→drift boundary: the ground
  starts on the drifting scene's own `#e2d7c3` and cools to `#f7f4ee` across a
  full screen of approach on `--enter`, and the intro fades and rises on the
  same value a little behind it. Measured at the boundary — at one viewport out
  both grounds read oklab L 0.8826/0.8827, indistinguishable, then 0.9167 →
  0.9423 → 0.9661 → 0.9678 settled, with the intro at 0 → 0.5 → 1 and the
  header flipping to taupe exactly on the edge.

  Modernisation, all of it measured at 1440×900 and 390×844: unequal columns
  (560.7px against 497.3px), portraits held at `grayscale(0.72)` so eleven
  separate sittings read as one set and return to colour on hover, a numbered
  index on the name's last baseline, and a hairline over each name plate that
  draws from the left on hover. Both `--enter` and `--p` default to their
  settled values in CSS, so a page whose script fails shows the team rather
  than eleven invisible people.

  Verified: 136 tests, lint, TypeScript, production build, no horizontal
  overflow at either size, all eleven portraits loading the right srcset
  candidate.

  Third pass, on the user's notes: smaller portraits set further apart, colour
  driven by scroll rather than only by hover, and a lighter ground.

  Cards went from 560px to 392px and are held back inside their own tracks —
  odd `justify-self: start`, even `justify-self: end` — which opens a 252px
  gutter between the columns where there was 38px, with a 130px row gap.

  Colour now follows a band of light in the middle of the screen. `TeamSection`
  writes a `--focus` per card from that card's `offsetTop`, deliberately not
  its rect: the rect carries the left column's drift, which would light the two
  halves of a row unevenly, and the pair has to gain and lose colour together.
  Measured by centring rows 1, 5 and 9 in turn — the centred pair reads
  `grayscale(0.001)` on both cards while the row below reads `grayscale(0.88)`.
  Hover still works and is combined with `max()` rather than overriding, since
  an inline custom property always beats a stylesheet rule; `--hover` is
  registered with `@property` so that half of it can ease.

  The band is a real element, not an effect laid over one: a sticky, screen-tall
  radial of warm white with `margin-bottom: calc(-1 * var(--halo-height))` so it
  adds no height, at `z-index: -1` inside an isolated section so it paints over
  the ground and under the cards. The same middle-of-screen measurement drives
  both it and the colour. `--to-tone` also lightened from `#f7f4ee` to
  `#fbfaf7`.

  The join still measures clean after all of it: at one viewport out both
  grounds read oklab L 0.8826/0.8827, then 0.9339 → 0.9830 → 0.9850 settled.
  136 tests, lint, TypeScript, build; no horizontal overflow.

  Fourth pass: the user could not see the colour effect at all. The cause was
  not a bug — it measured correctly — it was that a single falloff from the
  screen's middle reaches full colour at exactly one scroll position, so a row
  is always on its way in or out and spends the whole time part-grey. The band
  now has a plateau: fully lit while the row centre is within 0.18 of the
  viewport either side of the middle, ramping to nothing over another 0.20. That
  is 324px of full colour per row against a 695px row pitch, so each row is its
  own event with nothing lit between them.

  Desaturation alone was also too quiet, so a lit row now does four things at
  once: takes its colour back (grayscale 1 → 0), brightens, gains a little
  contrast, and rises 8px out of the page with a `0 22px 48px rgb(38 38 42 /
  20%)` shadow that was not there before. Unlit rows are dimmed to 0.74 opacity
  — the pale state is what makes the lit one read as lit — and the name greys
  back with its portrait. Measured: the centred pair reads grayscale 0, opacity
  1, full shadow; every other row reads grayscale 1, opacity 0.74, no shadow;
  150px off centre the pair is still fully lit.

  Not verified: the ground's appearance. The preview pane renders this project's
  colours far darker than they compute and will not advance CSS transitions, so
  every colour claim above is a measurement, not something seen. The user asked
  for a lighter background off the back of what they saw on their own machine,
  and only they can confirm the result.

  Files reserved: `components/team/**`, `app/tim/**`, `public/media/tim/**`,
  and `app/page.tsx`. Awaiting the user's localhost approval before this
  reaches `main`. Still outstanding: the seven missing roles.

Before a handoff, commit or stash work and release or revise the relevant file
reservations. After the handoff, update this log. Never store secrets,
credentials, tokens, or local configuration values in repository files,
commits, logs, or examples.
