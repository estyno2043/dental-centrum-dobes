# Collaboration

`COLLAB.md` is the shared coordination record for Codex and Claude. Read and
update it before taking or handing off work.

## Current Task

- Status: Complete
- Owner: Claude
- Branch: `claude/hero-waiting-room-loop`
- Task: Re-cut the hero loop to a single continuous shot (waiting room, 41.0s-45.7s
  of the 4K master) instead of the multi-shot 15s-37s segment

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

- Hero loop re-cut to a single continuous shot — complete. Tests: 8 passed.
  Lint, TypeScript, and the production build passed; a dev-server check
  confirmed all four assets serve with the right content types and that both
  1080p encodes decode at 1920×1080 / 4.833s.

  A scene scan of the full 145s master showed the shipped 15s–37s segment was
  not one shot: it contained cuts at 17.15, 21.76, 24.06, 26.49, and 34.90s.
  The earlier record did not say so, which is corrected here. The master is a
  promo montage and holds only four continuous shots longer than six seconds
  (26.49–34.90, 39.34–45.75, 122.02–128.53, 135.47–145.00).

  The hero now uses 41.0s–45.7s — the waiting room, slow dolly back. It was
  chosen over the longer reception shot because it is the only framing in the
  master carrying the brand: tooth motif on the wall, sphere lamp, leather
  chairs, and no clinical equipment, masks, or gloves. START is 41.0 rather
  than 39.34 because a burned-in title runs until it clears between 40.6 and
  41.0s. The 4.7s clip is slowed to 85% and closed with a 0.7s crossfade back
  to its own first frame, giving a seamless 4.83s loop. Files dropped from
  6.4/4.9/3.7 MB to 1.8/1.6/1.0 MB.

  Side effect worth noting: open question 4 below is resolved by this re-cut.
  The bright sphere lamp now sits centre-right, so the logo tagline no longer
  overlaps it. The top navigation does now cross the lamp, which is a smaller
  problem but the same kind.

## Open Questions

Both questions below are for the user; they gate the next content task.

1. Which section comes after the hero — the signature tooth map, or a lighter
   services section first?
2. Does the section after the dark cinematic hero go light for contrast, or
   continue the dark line?

Two more, raised by the hero media work:

3. The clinic master was shot in winter and a small Christmas tree is visible
   near the reception. It is still in frame in the re-cut loop, further back
   and behind glass, so it is less prominent than before but not gone. It
   should be reshot rather than worked around.
4. Resolved by the re-cut: the logo tagline no longer overlaps the sphere lamp.
   The top navigation now crosses it instead — a milder version of the same
   problem. Fixing it means strengthening the scrim at the top of the hero,
   which is a design change and so has not been made unilaterally.

5. The hero shot is 4.83s, which is short for a loop. The master simply does
   not contain a longer usable continuous take. A dedicated hero shoot — one
   locked or slow-dolly take of 20–30s, outside winter, with no burned-in
   titles — would remove this constraint along with items 3 and 4. This is the
   real fix and should be priced into the next client conversation.

Also still pending from the client, and blocking any media-dependent section:
clinic photography, Google Business Profile and DNS access, written consent for
reviews and before/after imagery, and a higher-frame-rate master if the
videographer has one — the supplied master is 29.97 fps, so 50/60 fps is not
achievable from it without interpolation artifacts.

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
- 2026-08-06 — Claude re-cut the hero loop to the single continuous waiting
  room shot on `claude/hero-waiting-room-loop`; no files are reserved. Not yet
  merged — awaiting the user's review of the loop. Next task: merge on
  approval, then await the answers to the open questions above.

Before a handoff, commit or stash work and release or revise the relevant file
reservations. After the handoff, update this log. Never store secrets,
credentials, tokens, or local configuration values in repository files,
commits, logs, or examples.
