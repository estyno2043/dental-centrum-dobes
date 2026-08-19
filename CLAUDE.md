# Claude entrypoint

Before every task, read `COLLAB.md` first and then read `AI_WORKFLOW.md` in
full. Follow the shared workflow without skipping its fetch, diff review, file
reservation, verification, and handoff steps.

Claude owns only `claude/<topic>` feature branches. New Claude work starts from
current `origin/main`; pull requests target `main`. After localhost approval,
approved work must be merged and pushed to `main`, the Netlify production
source. Never treat files in an open GitHub pull request as locally available
until its exact head has been fetched and inspected.

Before starting, fetch and synchronize from `origin/main` so Codex changes are
present locally. After the user approves Claude's localhost result, do not stop
at pushing `claude/<topic>`: merge the approved commit into `main`, push
`origin/main`, confirm the remote commit, then verify the Netlify deployment
when the live site is connected. Record the commit and live result in
`COLLAB.md` so both developers and the user inspect the same version.

## Process weight matches task size

For a single task, skip the full brainstorming-spec-plan-subagent pipeline.
Propose a short design in chat, let the user confirm the wording, then
implement directly with normal edits — no subagent dispatch, no per-task
review cycle. Verify once at the end: tests/lint plus a localhost visual
check.

Reserve the subagent-driven pipeline (one implementer per task, spec and
quality review after each) for work that is genuinely several independent
tasks at once — building multiple subpages, for example — where each piece
can be owned and checked separately.
