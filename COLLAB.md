# Collaboration

`COLLAB.md` is the shared coordination record for Codex and Claude. Read and
update it before taking or handing off work.

## Current Task

- Status: Complete, awaiting user review
- Owner: Claude
- Branch: `claude/section-restart`
- Task: Statement band under the hero, rebuilt to match the reference
  recording the user supplied

> **Everything built on 2026-08-08 below the hero was discarded at the user's
> request** — the statement band and the Tím page both. They live on
> `claude/experience-band` and `claude/team-page`; neither is approved and
> neither should be merged or used as a starting point. This branch is
> `claude/netlify-migration` (Next.js, hero only) with nothing added.
>
> One thing to know before building anything that pins or sticks: `globals.css`
> here still has `overflow-x: hidden` on `html, body`. That makes the root a
> scroll container and silently disables `position: sticky` across the whole
> site, with no error to explain it.

## File Reservations

No files are reserved.

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

Before a handoff, commit or stash work and release or revise the relevant file
reservations. After the handoff, update this log. Never store secrets,
credentials, tokens, or local configuration values in repository files,
commits, logs, or examples.
