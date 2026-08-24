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

## Skills to apply on every build task

These are installed (`claude plugin list` / `~/.claude/skills/`), not just
referenced. Pull from them on every task that touches UI, copy, or layout —
not sequentially through a checklist, but by relevance to what the task
actually is:

- `andrej-karpathy-skills:karpathy-guidelines` — think before coding, minimum
  code, surgical changes, verifiable success criteria. Applies to everything,
  every task, no exception.
- `design-taste-frontend` (taste-skill) — the primary anti-slop skill for
  landing pages and redesigns. Read the brief, infer the direction, ship
  something that doesn't look templated.
- `high-end-visual-design` (taste-skill) — the fonts, spacing, shadows, and
  animation restraint that make a site feel expensive rather than generic.
  This is the standard the taupe/charcoal/porcelain identity is held to.
- `redesign-existing-projects` (taste-skill) — DOBES is almost never a blank
  page. Audit what's there, name the generic patterns, upgrade without
  breaking what already works.
- `image-to-code` (taste-skill) — when working from a screenshot, reference
  site, or design image: analyze it properly first, then implement to match.
  No cards-inside-cards, no lazy under-generation, hero stays clean and
  visible on a small laptop.
- `full-output-enforcement` (taste-skill) — no placeholders, no truncated
  output, no "rest stays the same" shortcuts.
- `baseline-ui`, `improve-ui` — fast polish passes and structured audits
  against the site's own design evidence, not a generic template.
- `fixing-accessibility` — every interactive control, form, and dialog.
  Already the site's strong point (focus management, `prefers-reduced-motion`
  throughout) — keep it that way on every addition.
- `fixing-motion-performance` — this site is animation-heavy (scroll-driven
  sections, `motion` throughout). Check compositor properties and scroll-linked
  motion before calling an animation done.
- `fixing-metadata` — every new route needs its own title, description, OG
  tags, and eventually JSON-LD. The technical review found none of this exists
  yet; don't add a page without it going forward.
- `composition-patterns`, `react-best-practices` — component architecture and
  React/Next.js performance, applied through this project's own conventions
  (Server Components by default, CSS Modules, no unnecessary client bundles),
  not blindly.
- `react-view-transitions` — reference for native View Transition patterns
  when a scroll or route animation is being designed; the site already leans
  on `motion` for most of this, so use where it's the better native fit.
- `web-design-guidelines`, `writing-guidelines` — review passes: UI against
  interface-guideline compliance, Slovak copy against clarity and voice
  before shipping a page.
- `create-design-md`, `ui-skills-root` — `create-design-md` if the design
  system ever needs to be written down as a persistent reference;
  `ui-skills-root` to pull only the smallest relevant slice of the above
  rather than all of it on every task.

Not wired in: `brutalist-skill`, `minimalist-skill`, `brandkit`, `gpt-taste`,
`taste-skill-v1`, `imagegen-frontend-*` (installed but not this project's
direction or already superseded — available if the brief ever calls for one
of them), and `deploy-to-vercel`, `vercel-cli-with-tokens`, `vercel-optimize`,
`react-native-skills` (not installed at all — this project ships to Netlify
as a web app, not Vercel or React Native).

`.claude/references/awesome-design-md/` (local, gitignored) holds
`voltagent/awesome-design-md` — DESIGN.md write-ups of real brands' design
systems (Apple, Linear, Stripe, Notion, and ~55 more). Reference for how a
specific pattern is reasoned about elsewhere; never copy a brand's system
wholesale over DOBES's own identity.
