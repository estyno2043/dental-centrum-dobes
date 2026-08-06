# Dental Centrum Dobeš Project Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the approved standalone hero prototype into a tested Next.js project, add a collision-resistant Codex/Claude workflow, and publish stable and development branches to a private GitHub repository.

**Architecture:** A Next.js App Router page renders a focused client-side hero component. Media embedded in the source HTML is extracted into public assets, while source artifacts remain archived for exact comparison. Repository-level collaboration files coordinate task ownership and handoffs between Codex and Claude.

**Tech Stack:** Next.js, React, TypeScript, CSS Modules, Vitest, Testing Library, Git, GitHub CLI

## Global Constraints

- Preserve the approved hero visually, textually, and functionally.
- Do not add a new content section or design content not requested by the user.
- Keep planned Higgsfield jaw animation outside current implementation.
- `main` is stable; `develop` is the shared integration branch.
- Agent branches use `codex/<topic>` or `claude/<topic>`.
- Never commit secrets, tokens, or local credential files.
- Preserve Slovak copy exactly as supplied by the approved prototype.

---

## File Structure

- `app/layout.tsx`: Root metadata, language, and global stylesheet import.
- `app/page.tsx`: Homepage composition; renders only approved hero.
- `app/globals.css`: Reset, global colors, typography, and body rules.
- `components/hero/Hero.tsx`: Navigation, hero video, CTA, trust strip, and scroll state.
- `components/hero/RotatingHeadline.tsx`: Timed headline rotation with reduced-motion fallback.
- `components/hero/hero.module.css`: Hero-specific layout, styling, animations, and responsive rules.
- `components/hero/heroContent.ts`: Typed immutable copy and headline variants.
- `components/hero/RotatingHeadline.test.tsx`: Rotation and reduced-motion behavior tests.
- `components/hero/Hero.test.tsx`: Copy, links, media fallback, and semantic structure tests.
- `scripts/extract-hero-assets.mjs`: One-time deterministic extraction from source HTML.
- `public/media/dobes-logo-white.png`: Extracted approved logo.
- `public/media/hero-poster.jpg`: Extracted approved poster.
- `public/media/hero-video.mp4`: Extracted approved preview video.
- `docs/source/Transcript_Web_Dobes.md`: Original project transcript.
- `docs/source/Hero_v7_Dobes.html`: Original approved hero prototype.
- `COLLAB.md`: Shared live task ownership and handoff ledger.
- `AGENTS.md`: Codex-facing repository rules.
- `CLAUDE.md`: Claude-facing repository rules.
- `README.md`: Setup, scripts, branching, and collaboration workflow.

---

### Task 1: Scaffold project and preserve source artifacts

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `eslint.config.mjs`
- Create: `.gitignore`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `docs/source/Transcript_Web_Dobes.md`
- Create: `docs/source/Hero_v7_Dobes.html`
- Create: `scripts/extract-hero-assets.mjs`
- Create: `public/media/dobes-logo-white.png`
- Create: `public/media/hero-poster.jpg`
- Create: `public/media/hero-video.mp4`

**Interfaces:**
- Consumes: Approved files `/Users/goat/Downloads/Transcript_Web_Dobes.md` and `/Users/goat/Downloads/Hero_v7_Dobes (1).html`.
- Produces: Runnable Next.js application and stable media URLs `/media/dobes-logo-white.png`, `/media/hero-poster.jpg`, `/media/hero-video.mp4`.

- [ ] **Step 1: Initialize the TypeScript site foundation**

Run the approved project initializer in the repository root. Keep App Router and TypeScript. Do not overwrite `docs/` or Git history.

```bash
/Users/goat/.codex/plugins/cache/openai-bundled/sites/0.1.34/scripts/init-site.sh "$PWD"
```

Expected: package manifest, App Router files, lockfile, and `.openai/hosting.json` exist.

- [ ] **Step 2: Archive the approved source inputs**

Copy both source files byte-for-byte into `docs/source/`. Verify checksums match.

```bash
mkdir -p docs/source
cp '/Users/goat/Downloads/Transcript_Web_Dobes.md' docs/source/Transcript_Web_Dobes.md
cp '/Users/goat/Downloads/Hero_v7_Dobes (1).html' docs/source/Hero_v7_Dobes.html
shasum -a 256 '/Users/goat/Downloads/Transcript_Web_Dobes.md' docs/source/Transcript_Web_Dobes.md
shasum -a 256 '/Users/goat/Downloads/Hero_v7_Dobes (1).html' docs/source/Hero_v7_Dobes.html
```

Expected: each source/destination checksum pair is identical.

- [ ] **Step 3: Add deterministic asset extraction script**

Create `scripts/extract-hero-assets.mjs`:

```js
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourcePath = path.resolve("docs/source/Hero_v7_Dobes.html");
const outputDir = path.resolve("public/media");
const html = await readFile(sourcePath, "utf8");

const assets = [
  ["dobes-logo-white.png", /data:image\/png;base64,([^\"]+)/],
  ["hero-poster.jpg", /poster="data:image\/jpeg;base64,([^\"]+)"/],
  ["hero-video.mp4", /data:video\/mp4;base64,([^\"]+)/],
];

await mkdir(outputDir, { recursive: true });

for (const [filename, pattern] of assets) {
  const match = html.match(pattern);
  if (!match) throw new Error(`Missing embedded asset: ${filename}`);
  const buffer = Buffer.from(match[1], "base64");
  if (buffer.length === 0) throw new Error(`Empty embedded asset: ${filename}`);
  await writeFile(path.join(outputDir, filename), buffer);
}
```

- [ ] **Step 4: Run extraction and verify media signatures**

```bash
node scripts/extract-hero-assets.mjs
file public/media/dobes-logo-white.png public/media/hero-poster.jpg public/media/hero-video.mp4
```

Expected: PNG image, JPEG image, and MP4 video signatures. `hero-video.mp4` is non-empty.

- [ ] **Step 5: Replace starter page with a temporary compile-safe shell**

Set `app/page.tsx` to:

```tsx
export default function HomePage() {
  return <main />;
}
```

Set root metadata in `app/layout.tsx` to title `Dental Centrum Dobeš` and description `Súkromná zubná klinika pri Kramároch v Bratislave.` Set `<html lang="sk">`.

- [ ] **Step 6: Verify scaffold**

```bash
npm run build
```

Expected: successful production build.

- [ ] **Step 7: Commit foundation and source archive**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts eslint.config.mjs .gitignore .openai app scripts public/media docs/source
git commit -m "chore: scaffold dental website"
```

---

### Task 2: Implement approved hero with tests

**Files:**
- Create: `components/hero/heroContent.ts`
- Create: `components/hero/RotatingHeadline.tsx`
- Create: `components/hero/Hero.tsx`
- Create: `components/hero/hero.module.css`
- Create: `components/hero/RotatingHeadline.test.tsx`
- Create: `components/hero/Hero.test.tsx`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: Public media URLs produced by Task 1.
- Produces: `Hero(): JSX.Element`, `RotatingHeadline({ variants, intervalMs, finalHoldMs }): JSX.Element`, and `heroContent` constants.

- [ ] **Step 1: Install test dependencies and add test script**

```bash
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Add script:

```json
"test": "vitest run"
```

Configure `vitest.config.ts` with `environment: "jsdom"`, React JSX support, `setupFiles: ["./vitest.setup.ts"]`, and alias `@` to repository root. Import `@testing-library/jest-dom/vitest` in setup.

- [ ] **Step 2: Write failing content and link tests**

Create `components/hero/Hero.test.tsx` asserting:

```tsx
render(<Hero />);
expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
  "Sme dôvod, prečo sa už zubárom nemusíte vyhýbať.",
);
expect(screen.getByRole("link", { name: /0918 800 002/ })).toHaveAttribute(
  "href",
  "tel:+421918800002",
);
expect(screen.getByText("4,5")).toBeInTheDocument();
expect(screen.getByText("Google hodnotenie")).toBeInTheDocument();
expect(screen.getByText("parkovanie pre pacientov")).toBeInTheDocument();
expect(screen.getByText("ošetrujeme aj deti")).toBeInTheDocument();
```

- [ ] **Step 3: Run hero test and verify failure**

```bash
npm test -- components/hero/Hero.test.tsx
```

Expected: FAIL because `Hero` does not exist.

- [ ] **Step 4: Write failing rotation tests**

Create `components/hero/RotatingHeadline.test.tsx` using fake timers. Assert first variant renders, second appears after 3160 ms, and reduced-motion mode never schedules rotation.

```tsx
vi.useFakeTimers();
render(<RotatingHeadline variants={["prvý", "druhý"]} intervalMs={2600} finalHoldMs={4600} />);
expect(screen.getByText("prvý")).toBeInTheDocument();
act(() => vi.advanceTimersByTime(3160));
expect(screen.getByText("druhý")).toBeInTheDocument();
```

- [ ] **Step 5: Run rotation test and verify failure**

```bash
npm test -- components/hero/RotatingHeadline.test.tsx
```

Expected: FAIL because `RotatingHeadline` does not exist.

- [ ] **Step 6: Implement typed hero copy**

Create immutable arrays in `heroContent.ts` for exact headline variants, navigation labels, and trust-strip values from the source prototype. Export `headlineVariants`, `navigationItems`, and `trustItems`.

```ts
export const headlineVariants = [
  "dôvod, prečo sa už zubárom nemusíte vyhýbať.",
  "vaším partnerom na ceste k sebavedomému úsmevu.",
  "ľudia, ktorí sa starajú o ľudí.",
  "Dental Centrum Dobeš.",
] as const;
```

- [ ] **Step 7: Implement headline rotation**

Create a client component that uses `useEffect`, clears both hold and transition timers on cleanup, respects `matchMedia("(prefers-reduced-motion: reduce)")`, and applies `out` then `in` classes around the 560 ms transition.

- [ ] **Step 8: Implement hero component and exact styling**

Port navigation, video, scrim, copy, CTA, trust strip, scroll cue, CSS animations, breakpoints, and reduced-motion rules from archived HTML. Use semantic `<nav>`, `<header>`, `<h1>`, and anchors. Add fallback text inside `<video>` and `poster="/media/hero-poster.jpg"`.

```tsx
<video autoPlay muted loop playsInline preload="auto" poster="/media/hero-poster.jpg">
  <source src="/media/hero-video.mp4" type="video/mp4" />
  Váš prehliadač nepodporuje video.
</video>
```

- [ ] **Step 9: Wire homepage and remove starter preview**

Render `<Hero />` from `app/page.tsx`. Remove `app/_sites-preview` and temporary starter metadata/imports. Remove `react-loading-skeleton` if unused and refresh lockfile.

- [ ] **Step 10: Run focused and full tests**

```bash
npm test -- components/hero/Hero.test.tsx components/hero/RotatingHeadline.test.tsx
npm test
```

Expected: all tests pass.

- [ ] **Step 11: Run production build**

```bash
npm run build
```

Expected: successful build with no TypeScript errors.

- [ ] **Step 12: Commit hero migration**

```bash
git add app components vitest.config.ts vitest.setup.ts package.json package-lock.json public/media
git commit -m "feat: migrate approved homepage hero"
```

---

### Task 3: Add Codex and Claude collaboration protocol

**Files:**
- Create: `COLLAB.md`
- Create: `AGENTS.md`
- Create: `CLAUDE.md`
- Create: `README.md`

**Interfaces:**
- Consumes: Branching rules from approved design.
- Produces: One shared coordination protocol read by both agents.

- [ ] **Step 1: Write collaboration contract**

Create `COLLAB.md` with sections `Current Task`, `File Reservations`, `Decisions`, `Completed`, `Open Questions`, and `Handoff Log`. Initial task state is `Idle`; no files are reserved. Include rule: claim task and files before editing, commit or stash before handoff, update log after handoff, never store secrets.

- [ ] **Step 2: Add agent entry-point rules**

`AGENTS.md` and `CLAUDE.md` must both require this sequence:

```text
1. Read COLLAB.md before inspecting or editing project files.
2. Record owner, branch, task, and reserved files before editing.
3. Do not edit files reserved by another agent.
4. Run relevant tests and update COLLAB.md before handoff.
5. Never write credentials or tokens into repository files, commits, logs, or examples.
```

- [ ] **Step 3: Document local and Git workflow**

Create `README.md` with project purpose, `npm install`, `npm run dev`, `npm test`, `npm run build`, branch roles, agent handoff workflow, and source archive location.

- [ ] **Step 4: Verify documents are mutually consistent**

```bash
rg -n 'COLLAB.md|develop|codex/|claude/|token|secret' README.md COLLAB.md AGENTS.md CLAUDE.md
```

Expected: all three entry documents reference `COLLAB.md`; branch names match; secret prohibition appears.

- [ ] **Step 5: Commit collaboration workflow**

```bash
git add README.md COLLAB.md AGENTS.md CLAUDE.md
git commit -m "docs: add multi-agent collaboration workflow"
```

---

### Task 4: Validate and prepare repository publication

**Files:**
- Modify: `COLLAB.md`

**Interfaces:**
- Consumes: Tested application and repository documentation from Tasks 1–3.
- Produces: Fully validated feature branch and clean collaboration handoff ready for final review and merge.

- [ ] **Step 1: Run full verification**

```bash
npm test
npm run build
git diff --check
git status --short
```

Expected: tests and build pass; no whitespace errors; only intentional `COLLAB.md` status update may remain.

- [ ] **Step 2: Scan tracked content for exposed credentials**

```bash
git grep -nE 'ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]+' -- . ':!package-lock.json'
```

Expected: no matches.

- [ ] **Step 3: Mark foundation task complete in collaboration log**

Update `COLLAB.md`: owner `Codex`, task `Project foundation`, status `Complete`, tests run, final commit, no reserved files, next task `Await user instruction`.

```bash
git add COLLAB.md
git commit -m "docs: hand off project foundation"
```

- [ ] **Step 4: Confirm feature branch is ready for final review**

```bash
git status --short --branch
git log --oneline --decorate -8
```

Expected: clean `codex/project-foundation` branch with all task commits present. Publishing waits until final whole-branch review and fast-forward merge into `main`.

---

## Post-review merge and publication

The controller performs these steps only after the SDD final whole-branch review passes.

- [ ] **Step 1: Fast-forward stable branch and create integration branch**

Run from the primary checkout `/Users/goat/Documents/ChatGPT/DOBES`:

```bash
git checkout main
git merge --ff-only codex/project-foundation
git branch -f develop main
```

Expected: `main` and `develop` point to the validated foundation commit.

- [ ] **Step 2: Authenticate without placing token in repository or command history**

Use an interactive standard-input flow for GitHub CLI. Never place token in command arguments, files, shell history, remote URL, or documentation.

```bash
gh auth login --hostname github.com --git-protocol https --with-token
```

Expected: `gh auth status` reports authenticated account. If token is rejected, stop publishing and request a new narrowly scoped token from user.

- [ ] **Step 3: Create private repository from `main` and push both branches**

```bash
gh repo create dental-centrum-dobes --private --source=. --remote=origin --push
git push -u origin develop
gh repo view --json nameWithOwner,isPrivate,url,defaultBranchRef
```

Expected: repository name ends in `dental-centrum-dobes`, `isPrivate` is `true`, and both branches exist remotely.

- [ ] **Step 4: Return security handoff**

Tell user to revoke exposed token immediately and create a new fine-grained token for future work. Do not repeat token value.
