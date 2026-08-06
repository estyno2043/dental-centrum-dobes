# Collaboration

`COLLAB.md` is the shared coordination record for Codex and Claude. Read and
update it before taking or handing off work.

## Current Task

- Status: Complete
- Owner: Claude
- Branch: `claude/hero-client-cut`
- Task: Replace the hero media with the studio's own 19.2s edit, supplied as a
  ProRes master, instead of a segment selected from the raw 4K master

## File Reservations

No files are reserved.

Claim a task and its files here before editing. Do not edit files reserved by
the other agent unless that agent has handed them off.

## Decisions

- `main` is the stable branch; `develop` is the shared integration and
  development branch.
- Codex uses `codex/<topic>` working branches; Claude uses
  `claude/<topic>` working branches.
- Integrate work through small, descriptive commits.

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
  encodes decode at 1920×1080 / 19.23s, and the hero plays with a clean
  console at 1440px and at phone width.

  The hero is no longer cut from the raw 145s clinic promo. It is a finished
  19.2s edit supplied by the studio as a ProRes 422 HQ master
  (`0724.mov`), used start to end. `scripts/encode-hero-video.sh` now takes
  that master and only encodes — it no longer selects a segment, and the raw
  4K file is not an input to it any more.

  Encoded at 30 fps although the master is 60 fps: ~40% of the master's frames
  are exact duplicates (689 unique of 1153, measured with mpdecimate) because
  the underlying footage is 29.97 fps, so 60 fps would cost bitrate for no
  visible gain.

  Two earlier alternatives were tried and rejected by the user: the shipped
  15s–37s window (five internal cuts) and a 4.83s single-shot waiting room
  loop, which was rejected as too repetitive. The waiting room work is kept on
  `claude/hero-waiting-room-loop`, unmerged, in case it is wanted later.

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

5. Noted, not blocking, and the user's call: the edit runs 10 shots in 19.2s,
   so a hard cut lands behind the headline roughly every two seconds, and two
   shots are clinical — an intraoral macro at 12.3–14.2s and an instrument tray
   at 14.2–16.3s. This was raised before the edit was adopted and the user
   chose it knowingly, so it is recorded rather than reopened. If it is ever
   revisited, the fix is a dedicated hero shoot: one locked or slow-dolly take
   of 20–30s, outside winter, with no burned-in titles.

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
- 2026-08-06 — Claude replaced the hero media with the studio's own 19.2s edit
  on `claude/hero-client-cut`; no files are reserved. Not yet merged — awaiting
  the user's review. A rejected alternative, the single-shot waiting room loop,
  sits unmerged on `claude/hero-waiting-room-loop`. Next task: merge on
  approval, then await the answers to the open questions above.

Before a handoff, commit or stash work and release or revise the relevant file
reservations. After the handoff, update this log. Never store secrets,
credentials, tokens, or local configuration values in repository files,
commits, logs, or examples.
