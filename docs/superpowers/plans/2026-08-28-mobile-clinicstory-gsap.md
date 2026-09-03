# Mobile ClinicStory GSAP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the mobile clinic gallery visibly and smoothly traverse frames 1 through 7 before the existing detail-photo and jaw handoff.

**Architecture:** Keep the proven CSS sticky viewport. Replace the component's document `scroll` listener and custom story damping loop with one GSAP `ScrollTrigger` timeline. The timeline drives the existing pure motion mapper; GSAP writes the gallery track transform directly so mobile scrolling stays compositor-only.

**Tech Stack:** Next.js 16 Client Component, React 19, TypeScript, GSAP, ScrollTrigger, `@gsap/react`, Vitest, Playwright browser verification.

**Spec:** User-approved mobile gallery repair in the 2026-08-28 task conversation.

## Global Constraints

- Native document scroll remains the only motion input; no wheel or touch interception.
- Mobile gallery crosses all seven cards before detail zoom starts.
- One animation system owns ClinicStory scroll progress.
- Animate gallery with `transform`; do not animate layout.
- Mobile keeps blur disabled.
- `prefers-reduced-motion` uses a static native horizontal snapping gallery.
- No merge or push to `main` before localhost and real-phone approval.

---

### Task 1: Mobile gallery progress contract

**Files:**
- Modify: `components/home/clinicStoryMotion.test.ts`
- Modify: `components/home/clinicStoryMotion.ts`

**Interfaces:**
- Produces: `ClinicStoryMotionState.pan` as `0 -> 1` across the mobile gallery phase.
- Produces: mobile boundaries `240/300/340/370/530/570/610/680/780` vh.

- [ ] Add a failing table test for mobile pan checkpoints `0, 60, 120, 180, 240` vh with expected values `0, .25, .5, .75, 1`.
- [ ] Assert detail stays `0` through `240vh` and starts only after gallery pan completes.
- [ ] Run `npm test -- components/home/clinicStoryMotion.test.ts` and confirm failure because mobile pan is still always zero.
- [ ] Update mobile phase constants and mobile pan mapping.
- [ ] Re-run the focused test and confirm green.

### Task 2: Single GSAP scroll owner

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `components/home/ClinicStory.tsx`

**Interfaces:**
- Consumes: `mapClinicStoryMotion(progressVh, profile, ...)`.
- Produces: one `ScrollTrigger` from section `top top` to `bottom top` with numeric mobile scrub.

- [ ] Install `gsap` and `@gsap/react` from npm.
- [ ] Replace custom document scroll listener, mobile scrollLeft snap, and story damping loop with `useGSAP()` plus `ScrollTrigger`.
- [ ] Keep the CSS sticky element; ScrollTrigger controls only nested visual state.
- [ ] Use one linear timeline proxy from `0` to profile story-end vh.
- [ ] Write gallery `x` directly with `gsap.set(track, { x })`; update jaw frame only when integer target changes.
- [ ] Measure track/final-frame geometry only during setup and resize refresh.
- [ ] Let `useGSAP` revert timeline and ScrollTrigger on profile changes/unmount.

### Task 3: Mobile ownership and regression coverage

**Files:**
- Modify: `components/home/clinicStory.module.css`
- Modify: `components/home/ClinicStory.test.tsx`

**Interfaces:**
- Mobile motion mode: vertical document scroll owns gallery transform.
- Reduced-motion mode: native horizontal swipe owns gallery position.

- [ ] Remove mobile `--snap-shift` and `data-snap-active` rules.
- [ ] Set the active mobile viewport to `overflow: hidden` and `touch-action: pan-y`.
- [ ] Keep native horizontal overflow and scroll snapping only under `.reduced`.
- [ ] Replace the old snap interpolation test with assertions that the mobile contract exposes progressive pan and no programmatic `scrollLeft` writes.
- [ ] Run `npm test -- components/home/ClinicStory.test.tsx components/home/clinicStoryMotion.test.ts`.

### Task 4: Verification and localhost review

**Files:**
- Modify: `COLLAB.md`

**Interfaces:**
- Produces: recorded evidence and a localhost review point.

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Run `git diff --check` and a changed-file credential scan.
- [ ] Start `npm run dev` at `http://localhost:3000/`.
- [ ] Browser-check `390x844`, `375x812`, and desktop `1440x900`.
- [ ] Verify frames 1 through 7 cross the viewport monotonically forward and reverse, detail begins after frame 7, sticky remains at `top: 0`, page has no horizontal overflow, menu works, and console stays clean.
- [ ] Record results in `COLLAB.md`; leave localhost running for user review.
