# Collaboration

`COLLAB.md` is the shared coordination record for Codex and Claude. Read and
update it before taking or handing off work.

## Current Task

- Status: In progress
- Owner: Claude
- Branch: `claude/hero-video-quality`
- Task: Replace the hero preview video with production encodes from the 4K master

## File Reservations

Reserved by Claude on `claude/hero-video-quality`:

- `components/hero/Hero.tsx`
- `components/hero/Hero.test.tsx`
- `components/hero/useMediaQuery.ts`
- `scripts/extract-hero-assets.mjs`
- `scripts/encode-hero-video.sh`
- `public/media/`
- `README.md`

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

## Open Questions

Both questions below are for the user; they gate the next content task.

1. Which section comes after the hero — the signature tooth map, or a lighter
   services section first?
2. Does the section after the dark cinematic hero go light for contrast, or
   continue the dark line?

Also still pending from the client, and blocking any media-dependent section:
clinic photography, Google Business Profile and DNS access, written consent for
reviews and before/after imagery, and the original full-resolution video files
for production encodes.

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

Before a handoff, commit or stash work and release or revise the relevant file
reservations. After the handoff, update this log. Never store secrets,
credentials, tokens, or local configuration values in repository files,
commits, logs, or examples.
