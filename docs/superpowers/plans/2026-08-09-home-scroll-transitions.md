# Homepage Scroll Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved square hero reveal, centered statement fade-up, statement-owned gradient exit, and corrected sequential clinic photo strip.

**Architecture:** Keep `app/page.tsx` a Server Component composing two focused Client Components. `ExperienceBand` uses Motion scroll values against its own tall sticky section. Shared pure mapping functions drive both Motion styles and photo-strip CSS properties, giving deterministic regression tests without mocking browser scroll.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, Motion 13, Vitest, Testing Library

## Global Constraints

- Start from current `origin/main`; preserve rollback as ordinary commits.
- Keep `ExperienceBand` and `PhotoStrip` as direct siblings.
- Never put `overflow: hidden`, `clip`, or transform on an ancestor of the sticky photo strip.
- Square reveal must be `inset(50% 50%) → inset(0)`; no ellipse.
- Statement photo appears before copy; hero never shows during statement exit.
- Photo growth ends at `22%`; pan begins only after `22%`.
- Below `768px` and with reduced motion, gallery uses native snapping only.
- Keep all seven frames and `/media/strip-07-detail.jpg`.
- No new dependency.

---

### Task 1: Deterministic motion mapping

**Files:**
- Create: `components/home/scrollMotion.ts`
- Create: `components/home/scrollMotion.test.ts`

**Interfaces:**
- Produces: `mapExperienceMotion(progress: number): ExperienceMotionState`
- Produces: `mapPhotoStripMotion(progress: number): PhotoStripMotionState`
- `ExperienceBand` consumes `clipPath`, `mediaScale`, `copyOpacity`, `copyY`, `storyScale`, `veilOpacity`, and `edgeOpacity`.
- `PhotoStrip` consumes `grow` and `pan`.

- [ ] **Step 1: Write failing mapping tests**

```ts
import { describe, expect, test } from "vitest";
import { mapExperienceMotion, mapPhotoStripMotion } from "./scrollMotion";

describe("mapExperienceMotion", () => {
  test("opens a square photograph before revealing copy", () => {
    expect(mapExperienceMotion(0)).toMatchObject({
      clipPath: "inset(50% 50% 50% 50% round 0px)",
      copyOpacity: 0,
    });
    expect(mapExperienceMotion(0.3)).toMatchObject({
      clipPath: "inset(0% 0% 0% 0% round 0px)",
      copyOpacity: 0,
    });
    expect(mapExperienceMotion(0.46).copyOpacity).toBe(1);
  });

  test("covers the statement photograph with its own exit veil", () => {
    expect(mapExperienceMotion(0.72).veilOpacity).toBe(0);
    expect(mapExperienceMotion(0.9)).toMatchObject({
      veilOpacity: 1,
      storyScale: 0.98,
      copyOpacity: 0,
    });
  });
});

describe("mapPhotoStripMotion", () => {
  test.each([
    [0, 0, 0],
    [0.22, 1, 0],
    [0.61, 1, 0.5],
    [1, 1, 1],
  ])("maps progress %s to grow %s and pan %s", (progress, grow, pan) => {
    expect(mapPhotoStripMotion(progress)).toEqual({ grow, pan });
  });
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- components/home/scrollMotion.test.ts`

Expected: FAIL because `./scrollMotion` does not exist.

- [ ] **Step 3: Implement minimal pure mapping**

```ts
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const phase = (value: number, start: number, end: number) =>
  clamp01((value - start) / (end - start));

export function mapPhotoStripMotion(progress: number) {
  const value = clamp01(progress);
  return {
    grow: phase(value, 0, 0.22),
    pan: phase(value, 0.22, 1),
  };
}
```

Implement experience phases exactly as specified by tests: square open
`0–0.30`, copy fade `0.34–0.46`, copy hold through `0.72`, copy fade-out
`0.72–0.80`, exit veil `0.72–0.90`, and story scale `1 → 0.98` over
`0.72–0.90`.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- components/home/scrollMotion.test.ts`

Expected: 8 mapping assertions pass with no warnings.

- [ ] **Step 5: Commit**

```bash
git add components/home/scrollMotion.ts components/home/scrollMotion.test.ts
git commit -m "test: define homepage scroll motion phases"
```

---

### Task 2: Square statement scene and gradient exit

**Files:**
- Modify: `components/home/ExperienceBand.tsx`
- Modify: `components/home/experienceBand.module.css`
- Modify: `components/home/home.module.css`
- Modify: `app/page.test.tsx`

**Interfaces:**
- Consumes: `mapExperienceMotion(progress)` from Task 1.
- Preserves: statement region label `Meníme zážitok u zubára a vraciame vám sebavedomie.`
- Preserves: `ExperienceBand` and `PhotoStrip` direct-sibling contract.

- [ ] **Step 1: Add failing composition tests**

Extend `app/page.test.tsx`:

```ts
test("keeps the statement motion surface inside its own region", () => {
  render(<HomePage />);
  const statementBand = screen.getByRole("region", {
    name: "Meníme zážitok u zubára a vraciame vám sebavedomie.",
  });

  expect(within(statementBand).getByTestId("statement-motion-surface"))
    .toBeInTheDocument();
  expect(within(statementBand).getByTestId("statement-gradient-veil"))
    .toBeInTheDocument();
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- app/page.test.tsx`

Expected: FAIL because both statement test IDs are absent.

- [ ] **Step 3: Implement Motion-driven sticky statement scene**

In `ExperienceBand.tsx`:

- use `useScroll({ target: bandRef, offset: ["start start", "end end"] })`;
- derive each style using `useTransform(scrollYProgress, value =>
  mapExperienceMotion(value).field)`;
- wrap media, scrim, copy, and veil in `motion.div` elements;
- apply `data-testid="statement-motion-surface"` to clipped statement surface;
- apply `data-testid="statement-gradient-veil"` to veil inside that surface;
- use `useReducedMotion()` to supply static visible values without clip, scale,
  opacity, or translation.

In `experienceBand.module.css`:

- make `.band` `380dvh` tall and transparent;
- add `.pin { position: sticky; top: 0; height: 100dvh; overflow: hidden; }`;
- make `.story` absolute, full viewport, and `background: var(--ink)`;
- centre `.inner` and keep existing baked responsive images;
- put the dark-to-ink exit gradient in `.exitVeil` inside `.story`;
- add a temporary gold `.revealEdge` driven by the same inset values.

In `home.module.css`:

- set `.overlay { margin-top: -100dvh; }` so statement reveal begins over hero;
- leave `.overlay` free of overflow and transforms;
- under reduced motion reset `margin-top: 0`.

- [ ] **Step 4: Run focused and full tests**

Run: `npm test -- app/page.test.tsx components/home/scrollMotion.test.ts`

Expected: both files pass.

Run: `npm test`

Expected: all test files pass.

- [ ] **Step 5: Commit**

```bash
git add app/page.test.tsx components/home/ExperienceBand.tsx components/home/experienceBand.module.css components/home/home.module.css
git commit -m "feat: reveal statement scene from page centre"
```

---

### Task 3: Sequential and viewport-safe photo strip

**Files:**
- Modify: `components/home/PhotoStrip.tsx`
- Modify: `components/home/photoStrip.module.css`

**Interfaces:**
- Consumes: `mapPhotoStripMotion(progress)` from Task 1.
- Publishes CSS properties: `--grow`, `--pan`, and `--travel`.

- [ ] **Step 1: Replace shared progress with tested phase outputs**

Inside existing passive `update()` listener:

```ts
const { grow, pan } = mapPhotoStripMotion(progress);
section.style.setProperty("--grow", String(grow));
section.style.setProperty("--pan", String(pan));
```

For reduced motion set `--grow: 1` and `--pan: 0`.

- [ ] **Step 2: Make sticky viewport layout safe**

In `photoStrip.module.css`:

- remove `--p` and `--grow-phase`;
- drive track transform with `--pan`;
- drive frame height with `--grow`;
- change `.pin` to a grid with `grid-template-rows: auto minmax(0, 1fr)`;
- add top padding `clamp(56px, 7dvh, 88px)` and bottom padding
  `clamp(24px, 3dvh, 40px)`;
- use `--frame-h: clamp(280px, 62dvh, 620px)`;
- keep `.track` vertically centred within its row;
- preserve mobile and reduced-motion native snapping.

- [ ] **Step 3: Run tests and static checks**

Run: `npm test`

Expected: all tests pass, including mapping points `0`, `22%`, mid-pan, `100%`.

Run: `npm run lint && npm run typecheck`

Expected: both exit 0 with no errors.

- [ ] **Step 4: Commit**

```bash
git add components/home/PhotoStrip.tsx components/home/photoStrip.module.css
git commit -m "fix: separate photo strip growth from horizontal pan"
```

---

### Task 4: Localhost and release-quality verification

**Files:**
- Modify: `COLLAB.md`

**Interfaces:**
- Produces: live review at `http://localhost:3000/` from this worktree.
- Does not merge or push `main` before user approval.

- [ ] **Step 1: Run full verification**

```bash
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

Scan tracked changes for credential patterns and verify the homepage plus
`/media/strip-07-detail.jpg` return successful HTTP responses with correct
content type.

- [ ] **Step 2: Start or repoint localhost**

Keep one Next.js dev server on port `3000`, running from
`/Users/goat/Documents/ChatGPT/DOBES/.worktrees/scroll-sections-v2`.

- [ ] **Step 3: Browser verification**

Inspect `1440×900`, wide desktop, and `375×812`:

- continuous square centre reveal;
- photo arrives before copy;
- centered fade-up copy;
- gradient covers statement photo, never hero;
- gallery intro safe inset;
- card bottoms visible;
- sticky top stays `0`;
- no horizontal page overflow;
- mobile native swipe and menu work;
- reduced-motion layout remains readable;
- console clean.

- [ ] **Step 4: Record handoff and commit**

Update `COLLAB.md` with exact verification results, keep reservations active,
and state that merge/push to `main` awaits user localhost approval.

```bash
git add COLLAB.md docs/superpowers/specs/2026-08-09-home-scroll-transitions-design.md docs/superpowers/plans/2026-08-09-home-scroll-transitions.md
git commit -m "docs: hand off homepage scroll transitions"
```
