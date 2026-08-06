# Claude workflow

Follow this sequence for every task:

1. Read `COLLAB.md` before inspecting or editing project files.
2. Record owner, branch, task, and reserved files before editing.
3. Do not edit files reserved by another agent.
4. Run relevant tests and update `COLLAB.md` before handoff.
5. Never write credentials or tokens into repository files, commits, logs, or examples.

Use `main` only for stable work and `develop` for shared integration. Create
Codex work on `codex/<topic>` and Claude work on `claude/<topic>`.
