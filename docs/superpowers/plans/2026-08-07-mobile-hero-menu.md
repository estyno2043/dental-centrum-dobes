# Mobile Hero Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make mobile hero compact and add approved Dental Menu Mark with accessible animated right-side navigation.

**Architecture:** Keep `Hero` responsible for media and page composition. Add controlled `MobileMenu` built with Radix Dialog and Motion. Share navigation destinations from `heroContent.ts`; keep all visual rules in existing CSS module.

**Tech Stack:** React 19, TypeScript, CSS Modules, Radix Dialog, Motion for React, Tabler Icons, Vitest, Testing Library.

## Global Constraints

- Keep desktop hero composition and all supplied media unchanged.
- Work only on `codex/mobile-hero-menu`; keep result local until user approves.
- Use project palette and typography. No second styling system.
- Placeholder links stay `#` until page sections exist.
- Respect `prefers-reduced-motion` and keyboard navigation.
- Never store credentials in project files or commits.

---

### Task 1: Add pinned UI dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [x] Check current published versions and React peer ranges for `@radix-ui/react-dialog`, `motion`, and `@tabler/icons-react`.
- [x] Install exact compatible versions with npm.
- [x] Run `npm test` and confirm baseline remains 8 passing tests.

### Task 2: Specify mobile menu behavior with failing tests

**Files:**
- Create: `components/hero/MobileMenu.test.tsx`

- [x] Add test that renders visible `MENU` trigger with accessible name `Otvoriť menu`.
- [x] Add test that opens a dialog named `Hlavná navigácia` and exposes all five destinations, clinic-tour CTA, and telephone link.
- [x] Add test that destination activation closes dialog.
- [x] Add test that Escape closes dialog and returns focus to trigger.
- [x] Run `npm test -- components/hero/MobileMenu.test.tsx`; confirm failure because component does not exist.

### Task 3: Build Dental Menu Mark and dialog

**Files:**
- Create: `components/hero/MobileMenu.tsx`
- Modify: `components/hero/heroContent.ts`
- Modify: `components/hero/hero.module.css`

- [x] Change navigation data to typed label/href entries shared by desktop and mobile menus.
- [x] Build controlled Radix Dialog with portal, overlay, accessible title, close control, links, CTA, and contact block.
- [x] Use Tabler `IconDental` and `IconMenuDeep`; keep decorative SVGs hidden from assistive technology.
- [x] Animate overlay, panel, trigger, and staggered links through Motion with approved easing.
- [x] Use `useReducedMotion` to remove translation, rotation, and stagger when requested.
- [x] Style closed trigger as 78 × 48 charcoal glass capsule with visible `MENU` label, divider, focus ring, and taupe orbital rail.
- [x] Style panel as `min(88vw, 420px)` full-height charcoal sheet with clipped upper-left corner and taupe rail.
- [x] Run focused menu tests and confirm all pass.

### Task 4: Integrate menu and compact mobile hero

**Files:**
- Modify: `components/hero/Hero.tsx`
- Modify: `components/hero/Hero.test.tsx`
- Modify: `components/hero/hero.module.css`

- [x] Add failing Hero test proving Dental Menu Mark is rendered beside preserved desktop navigation.
- [x] Render `MobileMenu` inside main navigation and update desktop link mapping to shared entries.
- [x] Hide desktop links and tour CTA at `<=960px`; show Dental Menu Mark only in that range.
- [x] At `<=520px`, hide tagline, set 16px gutters, reduce logo/headline/CTA/trust spacing, and keep content inside `100svh` at 400 × 664.
- [x] Replace selected CSS entrance animations with Motion fade-up variants while keeping static first paint safe.
- [x] Run full unit suite and confirm all prior hero/media behavior remains green.

### Task 5: Verify quality and local browser result

**Files:**
- Modify: `COLLAB.md`

- [x] Run `npm test`.
- [x] Run `npm run lint`.
- [x] Run `npm run typecheck`.
- [x] Run `npm run build`.
- [x] Run `git diff --check` and scan tracked changes for token/key patterns.
- [x] Browser-check closed/open states at 320 × 568, 375 × 667, 400 × 664, 430 × 932, tablet, and desktop.
- [x] Confirm no horizontal overflow, correct focus return, Escape close, scroll lock, reduced-motion behavior, or console errors.
- [x] Update `COLLAB.md` with verification and `Awaiting user visual review`; keep branch unpushed.
