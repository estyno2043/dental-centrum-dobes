# Shared AI workflow

This is the canonical workflow for every AI agent working in this repository.
`COLLAB.md` is the live coordination record; it is not a substitute for these
rules. The user's current instruction always has highest priority.

## Start every task

1. Read `COLLAB.md`, this file, and the model-specific entrypoint
   (`AGENTS.md` or `CLAUDE.md`) before inspecting or editing project files.
2. Run `git status --short --branch`. Preserve all existing user and agent
   changes. If the tree is dirty, do not switch branches, pull, rebase, merge,
   or overwrite files until ownership of those changes is known.
3. Run `git fetch origin --prune`. Do not assume an open pull request is
   present in the local folders merely because it exists on GitHub.
4. Inspect incoming work before using it: read commit messages, changed files,
   the relevant diff, PR notes, and the handoff in `COLLAB.md`.
5. For new work, start from current `origin/main`. Use `codex/<topic>` for
   Codex and `claude/<topic>` for Claude when isolation helps. Never start new
   work from stale local branches.
6. Before editing, record status, owner, branch, task, and exact reserved files
   in `COLLAB.md`. Do not edit files reserved by another active agent.

## Branch and pull-request rules

- `main` is the single source of truth and the Netlify production branch.
  Approved work must end on `main` and be pushed there.
- Feature pull requests target `main`. `develop` is retained only as a
  compatibility mirror and must be fast-forwarded from `main`; it is not a
  base for new work.
- One agent owns one feature branch. Codex does not commit on a `claude/*`
  branch, and Claude does not commit on a `codex/*` branch.
- If needed work exists in an open PR, fetch and inspect the exact PR head.
  Check it out for review or merge it into a dedicated integration branch.
  Never copy its files manually, silently recreate its changes, or assume an
  open PR has already been merged.
- Never merge an unreviewed PR into `main`. Never force-push, reset shared
  branches, or rewrite another agent's history.
- Never force-push or rewrite `main`. Use fast-forward-only pulls and resolve
  divergence on an owned feature branch before integrating approved work.

## Editing and handoff

1. Make the smallest reviewable change. Keep unrelated user changes intact.
2. Run relevant tests, lint, type checks, build, and `git diff --check` in
   proportion to the change. Scan tracked changes for credentials before any
   commit.
3. Update `COLLAB.md` with decisions, completed work, tests, open risks, next
   step, and released reservations.
4. Commit with a descriptive message and push the owned feature branch. A task
   is not shared until the remote push is confirmed. If authentication blocks
   the push, report that the work is local-only; never claim it is on GitHub.
5. After user approval, open or update a pull request targeting `main`, merge
   it, and confirm `origin/main` contains the approved commit. Netlify deploys
   only this pushed `main` state.
6. Fast-forward `develop` from `main` when `develop` is retained, so another
   AI agent never mistakes it for a newer source.

## Local preview and visual approval

For every frontend or visual task, both Codex and Claude must use this loop:

1. Keep the development server running from the active working branch. Reuse
   the existing server when it already serves this checkout; do not start a
   duplicate process on another port without need.
2. Make saved changes immediately visible at `http://localhost:3000/` through
   the development server's hot reload. If the browser looks stale, reload it
   before treating the result as a code failure.
3. After each meaningful visual batch, inspect localhost in a browser at the
   relevant desktop and mobile sizes. Check layout, interaction, overflow,
   focus behavior, and console errors.
4. Give the user a local visual review point before merging design-sensitive
   changes into `main`. A feature branch may be pushed for backup or review,
   but production `main` changes only after user approval unless the user asks
   to skip review.
5. Record the tested viewport sizes and visual result in `COLLAB.md` before
   handoff or publication.

## Security

- Never store credentials, personal access tokens, API keys, or secrets in
  repository files, commits, examples, issue text, PR text, or command logs.
- Do not reuse a token exposed in chat or screenshots. Revoke it and
  authenticate through GitHub CLI's interactive login, Git Credential Manager,
  or SSH keys.
