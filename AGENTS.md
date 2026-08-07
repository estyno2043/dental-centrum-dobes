# Codex entrypoint

Before every task, read `COLLAB.md` first and then read `AI_WORKFLOW.md` in
full. Follow the shared workflow without skipping its fetch, diff review, file
reservation, verification, and handoff steps.

Codex owns only `codex/<topic>` feature branches. New Codex work starts from
current `origin/develop`; pull requests target `develop`. Never treat files in
an open GitHub pull request as locally available until its exact head has been
fetched and inspected.
