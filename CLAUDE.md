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
