# Flagship Completion Integration Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` and `superpowers:finishing-a-development-branch`. Execute inline; user prohibited subagents. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge verified Codex and Claude workstreams, add shared shell to problem routes, run release checks, obtain localhost approval, then publish one coherent release to `main` and mirror `develop`.

**Architecture:** Integrate from fresh `origin/main`, merge Claude trust shell first, then Codex patient engine. Resolve only coordination/shared-shell seams, never silently choose one implementation for a functional conflict. Use an `app/problemy/layout.tsx` route-group shell so problem pages receive shared header/footer without duplicating them.

**Tech Stack:** Git, Next.js 16 App Router, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Netlify Forms.

**Spec:** `docs/superpowers/specs/2026-08-24-flagship-completion-release-design.md`

## Global Constraints

- Integration starts only after `codex/patient-problem-engine` and `claude/trust-conversion-shell` are pushed with passing handoffs.
- Do not integrate `origin/claude/tim-page` directly.
- `/problemy` wins over excluded `/sluzby`; no service files, redirects, assets, links, or claims enter release.
- No subagents.
- No new feature work during integration. Any behavioral defect returns to owning branch or gets a focused integration test before fix.
- Preserve all Netlify field names and both static hidden forms.
- No legal links until approved legal content exists; keep launch blocker explicit.
- `main` changes only after user approves integrated localhost.
- `develop` is fast-forwarded from approved `main`; no independent commits.

## File Map

- Create `app/problemy/layout.tsx`: shared `SiteHeader` + problem children + `SiteFooter`.
- Create `app/problemy/layout.test.tsx`: one header/footer around problem routes.
- Modify `COLLAB.md`: merge evidence, conflict decisions, approval, publication, deployment result.
- Modify no other production file unless a failing integration test proves a seam defect.

---

### Task 1: Validate Both Handoffs Before Merge

**Files:**
- Read: `COLLAB.md`
- Read: both branch diffs.

**Interfaces:**
- Consumes: pushed feature branch heads.
- Produces: recorded exact hashes and an approved merge set.

- [ ] **Step 1: Fetch and resolve exact branch heads**

```bash
git fetch origin --prune
git rev-parse origin/main
git rev-parse origin/codex/patient-problem-engine
git rev-parse origin/claude/trust-conversion-shell
```

Record all three hashes before merge.

- [ ] **Step 2: Confirm both branches fork from current main**

```bash
git merge-base --is-ancestor origin/main origin/codex/patient-problem-engine
git merge-base --is-ancestor origin/main origin/claude/trust-conversion-shell
```

Expected: both exit `0`. If `origin/main` advanced, stop and rebase/merge current main into each owning branch with its own tests before integration.

- [ ] **Step 3: Audit branch scope**

```bash
git diff --name-status origin/main...origin/codex/patient-problem-engine
git diff --name-status origin/main...origin/claude/trust-conversion-shell
```

Expected:

- Codex: ClinicStory/motion/jaw, problem routes/components, tests, COLLAB.
- Claude: team/media, hero/navigation, contact/cennik/site shell, homepage/layout tests, COLLAB.
- No overlapping production file except none by design; `COLLAB.md` expected overlap.
- No `app/sluzby`, `components/services`, `public/media/sluzby`, or problem redirects.

- [ ] **Step 4: Review commits and handoff evidence**

```bash
git log --oneline origin/main..origin/codex/patient-problem-engine
git log --oneline origin/main..origin/claude/trust-conversion-shell
```

Require full tests, lint, typecheck, build, browser sizes, scope scan, credential scan, and known audit advisories in each handoff. Missing evidence returns to owner before merge.

---

### Task 2: Create Integration Branch and Merge Claude Then Codex

**Files:**
- Modify: `COLLAB.md`
- Merge: all approved branch-owned files.

**Interfaces:**
- Produces: `codex/flagship-completion-integration` containing both verified workstreams.

- [ ] **Step 1: Create fresh integration branch**

```bash
git switch -c codex/flagship-completion-integration origin/main
```

Update `COLLAB.md` owner/status/reservations before merge and commit coordination change if needed.

- [ ] **Step 2: Merge Claude branch**

```bash
git merge --no-ff origin/claude/trust-conversion-shell -m "merge: add trust conversion shell"
```

If `COLLAB.md` conflicts, preserve current integration task plus both completed handoff records. Do not discard verification or launch blockers.

- [ ] **Step 3: Run Claude integration smoke suite**

```bash
npm test -- app/page.test.tsx app/tim/page.test.tsx app/kontakt/page.test.tsx app/cennik/page.test.tsx components/hero/Hero.test.tsx components/team/TeamSection.test.tsx components/contact/ContactForm.test.tsx components/site/SiteFooter.test.tsx
```

Expected: PASS before Codex merge.

- [ ] **Step 4: Merge Codex branch**

```bash
git merge --no-ff origin/codex/patient-problem-engine -m "merge: add patient problem engine"
```

Resolve `COLLAB.md` as above. There should be no production conflict because ownership is disjoint. Any production conflict means scope drift: stop, inspect both versions, document decision, and rerun owner-focused tests.

- [ ] **Step 5: Run Codex integration smoke suite**

```bash
npm test -- components/home/clinicStoryMotion.test.ts components/home/ClinicStory.test.tsx components/home/jaw/JawZoneOverlay.test.tsx components/problems/ProblemHub.test.tsx app/problemy/page.test.tsx 'app/problemy/[zona]/page.test.tsx'
```

Expected: PASS.

---

### Task 3: Add Shared Header/Footer to Problem Route Group

**Files:**
- Create: `app/problemy/layout.tsx`
- Create: `app/problemy/layout.test.tsx`

**Interfaces:**
- Consumes: Claude `SiteHeader`, Claude `SiteFooter`, Codex problem pages.
- Produces: `ProblemsLayout({ children }: { children: React.ReactNode })`.

- [ ] **Step 1: Write failing layout test**

```tsx
render(
  <ProblemsLayout>
    <main data-testid="problem-child">Problem</main>
  </ProblemsLayout>,
);

expect(screen.getByRole("navigation", { name: "Hlavná navigácia" })).toBeVisible();
expect(screen.getByTestId("problem-child")).toBeVisible();
expect(screen.getByRole("contentinfo")).toBeVisible();
expect(screen.getAllByRole("main")).toHaveLength(1);
```

The layout itself must not add another `<main>`.

- [ ] **Step 2: Run test and observe RED**

Run: `npm test -- app/problemy/layout.test.tsx`

Expected: FAIL because layout does not exist.

- [ ] **Step 3: Implement minimal route layout**

```tsx
import { SiteHeader } from "@/components/hero/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function ProblemsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 4: Run problem route and layout tests**

```bash
npm test -- app/problemy/layout.test.tsx app/problemy/page.test.tsx 'app/problemy/[zona]/page.test.tsx'
```

Expected: PASS; no duplicate landmark.

- [ ] **Step 5: Commit seam**

```bash
git add app/problemy/layout.tsx app/problemy/layout.test.tsx
git commit -m "feat: add shared shell to problem routes"
```

---

### Task 4: Run Cross-Feature Regression Checks

**Files:**
- Modify only after failing test: exact seam file causing failure.
- Test first: nearest existing test file or new focused integration test.

**Interfaces:**
- Produces: coherent navigation, forms, page order, and static route build.

- [ ] **Step 1: Run full automated verification**

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run jaw:validate
git diff --check
```

Expected: all exit `0` with no React hydration warnings or test console noise.

- [ ] **Step 2: Verify generated routes**

Inspect `next build` output. Require static/prerendered routes:

- `/`
- `/problemy`
- all six `/problemy/[zona]` paths from `generateStaticParams`
- `/tim`
- `/kontakt`
- `/cennik`

No `/sluzby` route may appear.

- [ ] **Step 3: Verify route status and metadata on production server**

Run the built server on a free local port, then check `/`, `/problemy`, all six
problem paths, `/tim`, `/kontakt`, and `/cennik` return `200`. Check an invalid
problem slug returns `404`. Parse returned HTML and require one non-empty
`<title>` plus the expected route heading for each valid page.

Example:

```bash
npm run start -- -p 3100
curl -fsS http://localhost:3100/problemy/stolicky | rg '<title>Stoličky — Dental Centrum Dobeš</title>|<h1[^>]*>Stoličky</h1>'
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:3100/problemy/neplatna-zona
```

Expected: first command finds both title and heading; invalid route prints
`404`.

- [ ] **Step 4: Verify Netlify form field parity and built discovery**

Compare interactive and hidden static fields:

```bash
rg -n 'name="(form-name|bot-field|name|phone|email|zone|problem|examination|request-type|consent)"' app/layout.tsx components/contact/ContactForm.tsx components/home/jaw/JawAppointmentForm.tsx
```

Expected:

- `jaw-appointment`: form-name, bot-field, name, phone, email, zone, problem, examination, consent.
- `contact-request`: form-name, bot-field, name, phone, email, request-type, consent.

Also inspect prerendered HTML, not only source:

```bash
find .next/server/app -name '*.html' -print0 | xargs -0 rg -l 'name="jaw-appointment"'
find .next/server/app -name '*.html' -print0 | xargs -0 rg -l 'name="contact-request"'
```

Expected: both forms found in built HTML.

- [ ] **Step 5: Scan public UI and repository safety**

```bash
rg -n -F -e 'href="#"' -e "href='#'" -e 'Demo obsahu' -e 'Vstupné vyšetrenie — 100 EUR' -e '/sluzby' -e 'ServicesSection' app components
git grep -nE 'ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY' -- . ':!package-lock.json'
git ls-files | rg '(^|/)(\.env|\.env\.|credentials|secrets)(/|$)'
npm audit --omit=dev
```

Expected: first three scans empty. Record audit advisories with package/path/impact; do not claim third-party advisories fixed unless verified.

- [ ] **Step 6: Fix only proved seam regressions with TDD**

For any failure: write focused failing test, run RED, apply minimum fix, run focused GREEN, then full relevant suite. Commit each seam separately:

```bash
git add <test-file> <production-file>
git commit -m "fix: resolve <specific integration seam>"
```

---

### Task 5: Integrated Localhost Approval

**Files:**
- Modify: `COLLAB.md` after review.

**Interfaces:**
- Produces: explicit user approval or a concrete fix list. No publication before approval.

- [ ] **Step 1: Start integrated localhost**

```bash
npm run dev
```

Keep server live so local changes appear immediately.

- [ ] **Step 2: Desktop walkthrough at `1440×900` and `1920×1080`**

Verify full journey:

1. menu → `/problemy`, `/cennik`, `/tim`, `/kontakt`;
2. hero → booking and problem hub;
3. gallery → seventh photo fullscreen dwell → jaw cue → final map;
4. all four anatomical zones → patient-language problem route;
5. missing/unsure shortcuts;
6. Patients → Drift → Team → ConversionClose → Footer;
7. problem hub → detail page → form/phone;
8. cennik → controlled contact query;
9. contact success/error behavior using a stubbed/non-production submission path.

Check console, network 404s, focus order, Escape, reverse scroll, and horizontal overflow.

- [ ] **Step 3: Mobile walkthrough at `390×844` and `375×812`**

Verify burger dialog, body lock, focus return, jaw 82–90vw, 48px hits, problem sheet ≤44dvh, active anatomy visible, thumb-friendly CTAs, team portraits, forms, footer, and no cut text.

- [ ] **Step 4: Reduced-motion and no-JS review**

- Reduced motion: static hero poster; final usable jaw map; no delayed/invisible conversion close.
- JavaScript disabled: server content/routes visible; jaw noscript image, six links, disclaimer usable; forms retain HTML submission semantics.

- [ ] **Step 5: Ask user for explicit localhost approval**

Report branch, localhost URL, changed areas, and known blockers. Do not merge/push `main` until user explicitly approves.

If changes requested, remain on integration branch and repeat Task 4/5 with focused tests.

---

### Task 6: Publish Approved Release

**Files:**
- Modify: `COLLAB.md`

**Interfaces:**
- Produces: identical approved commit on `main` and `develop`, Netlify verification record.

- [ ] **Step 1: Record approval and final evidence**

Update `COLLAB.md` with approval date, integration commit, all automated commands, browser sizes, reduced/no-JS results, npm audit state, and legal launch blocker.

```bash
git add COLLAB.md
git commit -m "docs: record flagship release approval"
```

- [ ] **Step 2: Re-run immutable release gate**

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run jaw:validate
git diff --check
git status --short
```

Expected: all pass; status clean.

- [ ] **Step 3: Fast-forward `main` to approved integration head**

```bash
git fetch origin --prune
git merge-base --is-ancestor origin/main HEAD
git push origin HEAD:main
```

If ancestry check fails, stop: `main` changed during review. Recreate integration from new `origin/main`, merge both workstreams, rerun full gate and localhost approval. Never force-push.

- [ ] **Step 4: Fast-forward compatibility `develop`**

```bash
git fetch origin --prune
git merge-base --is-ancestor origin/develop origin/main
git push origin origin/main:develop
```

If `develop` is not ancestor of `main`, stop and report divergence. Never force-push or merge `develop` back into `main`.

- [ ] **Step 5: Verify Netlify production**

Wait for automatic deployment from `main`. Check live homepage and all routes, form discovery, media 200 responses, clean console, and exact deployed commit. Record deployment URL and result in `COLLAB.md` only if another documentation commit is approved; otherwise report it in handoff.

- [ ] **Step 6: Final handoff**

Report:

- final `main` and `develop` hashes;
- Netlify URL/deploy status;
- test/build results;
- known npm audit advisories;
- unresolved legal-content launch blocker;
- confirmation that excluded service work remains outside production.
