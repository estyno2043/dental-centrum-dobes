# Patient Problem Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. The user explicitly prohibited subagents for this release. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the gallery-to-jaw story into a clear, responsive pain-zone selector and turn `/problemy` into a complete patient-language conversion path.

**Architecture:** Keep `ClinicStory` as one native-scroll sticky viewport and keep its prerendered frame sequence. Make the pure motion mapper own all phase gates, make `JawZoneOverlay` own only final-frame interaction, and keep `JAW_ZONES` as the single content/routing allowlist for hub and detail pages.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, existing Motion/Radix packages, Vitest, Testing Library, Netlify Forms.

**Spec:** `docs/superpowers/specs/2026-08-24-flagship-completion-release-design.md`

## Global Constraints

- Start `codex/patient-problem-engine` from current `origin/main`; never start from `develop` or the design branch.
- Read `COLLAB.md`, `AI_WORKFLOW.md`, and relevant local Next.js 16 docs before editing.
- Reserve only Codex-owned files in `COLLAB.md`; do not edit `app/page.tsx`, hero, team, contact, cennik, conversion-close, or footer files.
- Use native document scroll. No Lenis, wheel interception, WebGL, image-sequence replacement, CMS, global state, or new dependency.
- Keep all six controlled `JAW_ZONES`; do not add `/sluzby` routes or redirects.
- Only visible price: `Vstupné vyšetrenie — 100 €`.
- Keep disclaimer exactly: `Orientačná pomôcka. Presnú príčinu určí až vyšetrenie.`
- Write every behavior test first, run it to observe expected failure, then add minimum production code.
- Keep no-JS and `prefers-reduced-motion` paths immediately usable.
- No commit or push to `main` before localhost approval.

## File Map

- Modify `components/home/clinicStoryMotion.ts`: pure phase boundaries and presentation gates.
- Modify `components/home/clinicStoryMotion.test.ts`: boundary, reverse-scroll, and shortened-opening tests.
- Modify `components/home/ClinicStory.tsx`: motion wiring, exact-end gate, shared sticky composition, and fallback.
- Modify `components/home/ClinicStory.test.tsx`: gallery handoff, cue, final map, and fallback contracts.
- Modify `components/home/clinicStory.module.css`: desktop rail/jaw split, mobile crop, exit gradient, cue layout.
- Modify `components/home/jaw/JawZoneOverlay.tsx`: compact anatomical halos, guidance rail, problem choices, mobile sheet.
- Modify `components/home/jaw/JawZoneOverlay.test.tsx`: interaction, responsive, keyboard, and non-overlap contracts.
- Modify `components/home/jaw/jawExperience.module.css`: final map presentation and touch target layout.
- Modify `components/home/jaw/jawContent.ts`: display price symbol only; retain IDs, routes, labels, and destinations.
- Modify `components/home/jaw/jawContent.test.ts`: controlled content and unsafe lookup coverage.
- Create `components/problems/ProblemHub.tsx`: server-renderable six-card intent hub.
- Create `components/problems/ProblemHub.test.tsx`: hub content and route tests.
- Create `components/problems/problemContent.ts`: confirmed entry-exam copy shared by hub and detail routes.
- Create `app/problemy/page.tsx`: static hub route and metadata.
- Create `app/problemy/page.test.tsx`: route-level semantics and CTA tests.
- Modify `app/problemy/[zona]/page.tsx`: real patient conversion page and dynamic metadata.
- Modify `app/problemy/[zona]/page.test.tsx`: valid/invalid query, content, metadata, and form context tests.
- Modify `app/problemy/problemy.module.css`: shared route layout, cards, and form styles.
- Modify `components/home/jaw/JawAppointmentForm.tsx` only if accessible context copy or `100 €` hidden value requires it.
- Modify `components/home/jaw/JawAppointmentForm.test.tsx` before any form behavior change.
- Modify `COLLAB.md`: reservation, verification, commit hash, and handoff.

---

### Task 1: Shorten Jaw Timeline Without Breaking Gallery Handoff

**Files:**
- Modify: `components/home/clinicStoryMotion.ts`
- Modify: `components/home/clinicStoryMotion.test.ts`

**Interfaces:**
- Consumes: `mapClinicStoryMotion(input: ClinicStoryMotionInput): ClinicStoryMotionState`.
- Produces: same public types and fields; new locked phase values only. No caller signature change.

- [ ] **Step 1: Write failing boundary tests**

Replace locked boundary expectations with a 25–30% shorter opening while preserving gallery/detail dwell. Use:

```ts
expect(DESKTOP_PHASES).toEqual({
  galleryEnd: 370,
  detailEnd: 460,
  detailDwellEnd: 500,
  handoffEnd: 530,
  openingEnd: 630,
  teaseEnd: 660,
  mapEnd: 700,
  interactiveEnd: 860,
  storyEnd: 990,
});

expect(MOBILE_PHASES).toEqual({
  galleryEnd: 90,
  snapEnd: 130,
  detailDwellEnd: 170,
  handoffEnd: 200,
  openingEnd: 345,
  teaseEnd: 385,
  mapEnd: 430,
  interactiveEnd: 610,
  storyEnd: 710,
});
```

Add assertions proving:

```ts
expect(mapDesktop(529.99).sequenceProgress).toBe(0);
expect(mapDesktop(580).sequenceProgress).toBeCloseTo(0.5, 4);
expect(mapDesktop(630).targetFrame).toBe(72);
expect(mapDesktop(659.99).interactive).toBe(false);
expect(mapDesktop(700, { exactEndDrawn: true, revealComplete: true }).interactive).toBe(true);
```

- [ ] **Step 2: Run focused tests and observe RED**

Run: `npm test -- components/home/clinicStoryMotion.test.ts`

Expected: FAIL because current boundaries remain `670/710/750/900/1030` desktop and `400/455/510/680/780` mobile.

- [ ] **Step 3: Change only constants and derived cue window**

Update `DESKTOP_STORY_SCROLL_VH`, `MOBILE_STORY_SCROLL_VH`, `DESKTOP_PHASES`, and `MOBILE_PHASES`. Keep `range`, clamping, one-based frame mapping, and critical damping unchanged. Keep cue visible only inside opening:

```ts
const cueOpacity =
  range(progressVh, handoffEnd + 5, handoffEnd + 20) *
  (1 - range(progressVh, openingEnd - 18, openingEnd));
```

- [ ] **Step 4: Run focused tests and reverse-scroll checks**

Run: `npm test -- components/home/clinicStoryMotion.test.ts`

Expected: PASS; forward and reversed positions produce identical states; gallery ends only after `pan === 1`; interaction opens only after exact final frame plus reveal completion.

- [ ] **Step 5: Commit timeline contract**

```bash
git add components/home/clinicStoryMotion.ts components/home/clinicStoryMotion.test.ts
git commit -m "fix: tighten jaw story timeline"
```

---

### Task 2: Replace Crossing Markers With Compact Anatomical Map

**Files:**
- Modify: `components/home/jaw/JawZoneOverlay.tsx`
- Modify: `components/home/jaw/JawZoneOverlay.test.tsx`
- Modify: `components/home/jaw/jawExperience.module.css`

**Interfaces:**
- Consumes: unchanged `JawZoneOverlayProps` and `JAW_ZONES`.
- Produces: unchanged component export; adds stable `data-zone`, `data-zone-label`, `data-zone-guidance`, and `data-problem-panel` test hooks.

- [ ] **Step 1: Write failing structural tests for final composition**

Delete tests that require long arrowheads and bottom assistance pill. Add tests asserting:

```tsx
expect(screen.getByTestId("jaw-zone-guidance")).toHaveTextContent(
  "Vyberte zvýraznenú oblasť",
);
expect(screen.getAllByTestId(/jaw-zone-label-/)).toHaveLength(4);
expect(screen.queryByTestId("jaw-assistance")).not.toBeInTheDocument();
expect(screen.getByRole("link", { name: "Chýba mi zub" })).toBeVisible();
expect(screen.getByRole("link", { name: "Neviem / bolí to celé" })).toBeVisible();
```

Assert no SVG `<marker>` and no leader path longer than its local zone label connector:

```tsx
expect(container.querySelector("marker")).not.toBeInTheDocument();
expect(screen.getAllByTestId(/jaw-connector-/)).toHaveLength(4);
```

- [ ] **Step 2: Write failing desktop behavior test**

```tsx
fireEvent.pointerEnter(screen.getByTestId("jaw-hit-molar-left"));
const rail = screen.getByTestId("jaw-problem-panel");
expect(rail).toHaveTextContent("Stoličky");
expect(within(rail).getByRole("link", { name: "Bolí ma pri hryzení" }))
  .toHaveAttribute("href", "/problemy/stolicky?problem=bite-pain");
expect(screen.getByTestId("jaw-zone-overlay")).toHaveAttribute("data-active-zone", "molar");
```

Add pointer-leave, focus, click-to-pin, Escape, and exact trigger focus restoration assertions.

- [ ] **Step 3: Write failing mobile sheet test**

After `changeViewport(true)`, click a hit surface and assert:

```tsx
const sheet = screen.getByRole("dialog", { name: "Ďasná" });
expect(sheet).toHaveAttribute("data-problem-panel", "mobile");
expect(screen.getByTestId("jaw-hit-gum-upper")).toHaveAttribute("aria-pressed", "true");
expect(cssText).toMatch(/\.zonePanel[\s\S]*max-height:\s*min\(44dvh,\s*24rem\)/);
expect(cssText).toMatch(/\.zoneHit[\s\S]*stroke-width:\s*48/);
expect(cssText).toMatch(/\.zoneHit[\s\S]*vector-effect:\s*non-scaling-stroke/);
```

- [ ] **Step 4: Run overlay tests and observe RED**

Run: `npm test -- components/home/jaw/JawZoneOverlay.test.tsx`

Expected: FAIL because current UI has arrow marker, bottom assistance bar, floating overlapping card, 58dvh mobile sheet, and no idle rail hook.

- [ ] **Step 5: Replace marker model with local label model**

Replace `ZoneMarker` with:

```ts
type ZoneLabel = Readonly<{
  zone: InteractiveZoneId;
  anchor: readonly [number, number];
  label: readonly [number, number];
  connector: string;
  revealIndex: number;
}>;
```

Use four short connector paths adjacent to anatomy. Remove `<marker id="jaw-arrowhead">`. Keep seven hit surfaces and four patient zones. Use translucent halo fill with close outline; selected zone increases opacity and glow.

- [ ] **Step 6: Move guidance and problems into one rail/sheet**

Render one stable panel:

```tsx
<aside
  className={classNames(styles.guidanceRail, state.mode === "mobile" && styles.zonePanel)}
  data-problem-panel={state.mode}
  data-testid={activeZone ? "jaw-problem-panel" : "jaw-zone-guidance"}
  role={state.mode === "mobile" && activeZone ? "dialog" : "region"}
  aria-label={activeZone?.label ?? "Výber zóny bolesti"}
>
  {activeZone ? <ProblemChoices zone={activeZone} /> : <IdleGuidance />}
</aside>
```

`IdleGuidance` visible only in final interactive state:

```tsx
<>
  <p className={styles.cardKicker}>Zóny bolesti</p>
  <h2>Vyberte zvýraznenú oblasť</h2>
  <p>Kliknite na miesto, kde problém cítite.</p>
  <nav aria-label="Iná situácia" className={styles.directEntries}>{directLinks}</nav>
</>
```

Do not render heading, choices, or direct shortcuts during `tease` or `reveal`.

- [ ] **Step 7: Implement CSS layout contract**

Desktop CSS:

```css
.zoneOverlay { display: grid; grid-template-columns: 340px minmax(0, 1fr); }
.guidanceRail { grid-column: 1; width: 340px; margin: auto 0 auto clamp(24px, 4vw, 64px); }
.zoneArtboard { grid-column: 2; width: min(64vw, calc(88dvh * 16 / 9)); }
.zoneConnector { stroke-width: 2; vector-effect: non-scaling-stroke; }
.zoneHit { stroke: transparent; stroke-width: 48; vector-effect: non-scaling-stroke; }
```

Mobile CSS:

```css
@media (max-width: 767px) {
  .zoneOverlay { display: block; }
  .zoneArtboard { top: 43%; width: min(90vw, calc(44dvh * 16 / 9)); }
  .zonePanel { max-height: min(44dvh, 24rem); overflow-y: auto; }
  .directEntries { grid-template-columns: 1fr 1fr; }
}
```

Do not use broad rectangular masks, wireframes, or labels over central teeth.

- [ ] **Step 8: Run overlay tests, lint focused files, and commit**

Run:

```bash
npm test -- components/home/jaw/JawZoneOverlay.test.tsx
npx eslint components/home/jaw/JawZoneOverlay.tsx components/home/jaw/JawZoneOverlay.test.tsx
```

Expected: PASS, no accessibility warnings.

```bash
git add components/home/jaw/JawZoneOverlay.tsx components/home/jaw/JawZoneOverlay.test.tsx components/home/jaw/jawExperience.module.css
git commit -m "feat: clarify interactive jaw zones"
```

---

### Task 3: Wire Final-Frame Rail Into Unified Clinic Story

**Files:**
- Modify: `components/home/ClinicStory.tsx`
- Modify: `components/home/ClinicStory.test.tsx`
- Modify: `components/home/clinicStory.module.css`

**Interfaces:**
- Consumes: Task 1 motion state and Task 2 unchanged `JawZoneOverlayProps`.
- Produces: one sticky `ClinicStory`, `id="ambulancia"`, no second vertical section, final map layout variables.

- [ ] **Step 1: Write failing story tests**

Add assertions:

```tsx
expect(screen.getByTestId("clinic-story")).toHaveAttribute("id", "ambulancia");
expect(screen.getAllByTestId("clinic-story-pin")).toHaveLength(1);
expect(screen.getByTestId("clinic-story")).toHaveAttribute("data-desktop-vh", "990");
expect(screen.getByTestId("clinic-story")).toHaveAttribute("data-mobile-vh", "710");
```

Mock final-frame callbacks. Assert `Zóny bolesti` appears during opening, disappears before map interaction, and `Kde vás to trápi?` is absent before exact end frame.

Add reduced-motion assertion: final frame, six routes, disclaimer visible without scroll sequence.

- [ ] **Step 2: Run focused story tests and observe RED**

Run: `npm test -- components/home/ClinicStory.test.tsx`

Expected: FAIL on new height, anchor, rail timing, or reduced-motion final state.

- [ ] **Step 3: Add anchor and keep one composition**

Set `id="ambulancia"` on the existing `<section>`. Do not create another jaw section. Keep `handoffPicture`, `jawLayer`, `JawFrameSequence`, `JawZoneOverlay`, and `exitGradient` inside the existing `.pin`.

Presentation gate remains:

```ts
const mapPresentation: JawMapPresentation = prefersReducedMotion || zoneInteractive
  ? "interactive"
  : renderMotion.state.phase === "tease"
    ? "tease"
    : renderMotion.state.mapReveal > 0 || renderMotion.state.zonesVisible
      ? "reveal"
      : "hidden";
```

Do not show any zone UI when `exactEndDrawn === false`, except non-interactive tease halos after sequence endpoint is decoded.

- [ ] **Step 4: Align viewport and exit styling**

Keep the 16:9 sequence inside a bounded premium viewport during motion. At final map state, expose desktop grid without moving the jaw beneath the rail. Use CSS variables driven by existing state only; no new scroll listener.

Required CSS contracts:

```css
.section { height: 990vh; height: 990dvh; }
.jawViewport { width: min(calc(100% - clamp(2rem, 6vw, 6rem)), 1440px); }
.exitGradient { opacity: var(--exit); background: linear-gradient(180deg, transparent, var(--ink)); }

@media (max-width: 767px) {
  .section { height: 710vh; height: 710dvh; }
  .jawViewport { width: calc(100% - 1rem); max-height: 94dvh; }
}
```

- [ ] **Step 5: Verify focused tests and commit**

Run:

```bash
npm test -- components/home/ClinicStory.test.tsx components/home/clinicStoryMotion.test.ts components/home/jaw/JawZoneOverlay.test.tsx
npx eslint components/home/ClinicStory.tsx components/home/ClinicStory.test.tsx
```

Expected: PASS.

```bash
git add components/home/ClinicStory.tsx components/home/ClinicStory.test.tsx components/home/clinicStory.module.css
git commit -m "feat: complete gallery to jaw handoff"
```

---

### Task 4: Make Jaw Content Contract Route-Ready

**Files:**
- Modify: `components/home/jaw/jawContent.ts`
- Modify: `components/home/jaw/jawContent.test.ts`
- Create: `components/problems/problemContent.ts`

**Interfaces:**
- Consumes: existing `JawZone`, `JawProblem`, `getJawZoneBySlug`, `getJawProblem`.
- Produces: `ENTRY_EXAM_LABEL = "Vstupné vyšetrenie — 100 €"`; `ENTRY_EXAM_FACTS`; `problemHref(zone, problem?)`.

- [ ] **Step 1: Write failing content tests**

```ts
expect(ENTRY_EXAM_LABEL).toBe("Vstupné vyšetrenie — 100 €");
expect(JAW_ZONES).toHaveLength(6);
expect(JAW_ZONES.map((zone) => zone.route)).toEqual([
  "/problemy/predne-zuby",
  "/problemy/crenove-zuby",
  "/problemy/stolicky",
  "/problemy/dasna",
  "/problemy/chybajuci-zub",
  "/problemy/neviem",
]);
expect(getJawZoneBySlug("__proto__")).toBeUndefined();
```

For helper:

```ts
expect(problemHref(JAW_ZONES[0], JAW_ZONES[0].problems[1]))
  .toBe("/problemy/predne-zuby?problem=chipped");
expect(problemHref(JAW_ZONES[5])).toBe("/problemy/neviem");
```

- [ ] **Step 2: Run content tests and observe RED**

Run: `npm test -- components/home/jaw/jawContent.test.ts`

Expected: FAIL on euro symbol and missing shared helper/facts.

- [ ] **Step 3: Add confirmed shared content only**

Create:

```ts
import type { JawProblem, JawZone } from "@/components/home/jaw/jawContent";

export const ENTRY_EXAM_FACTS = Object.freeze([
  "Približne 30 minút",
  "Panoramatická snímka",
  "Intraorálne fotografie a skeny",
  "CT iba vtedy, keď je klinicky indikované",
  "Liečebný plán a ďalšia cena podľa nálezu",
] as const);

export function problemHref(zone: JawZone, problem?: JawProblem): string {
  return problem ? `${zone.route}?problem=${encodeURIComponent(problem.id)}` : zone.route;
}
```

Do not add diagnosis, outcome, availability, or other price copy.

- [ ] **Step 4: Run tests and commit**

```bash
npm test -- components/home/jaw/jawContent.test.ts
git add components/home/jaw/jawContent.ts components/home/jaw/jawContent.test.ts components/problems/problemContent.ts
git commit -m "refactor: centralize patient problem content"
```

---

### Task 5: Build Static `/problemy` Hub

**Files:**
- Create: `components/problems/ProblemHub.tsx`
- Create: `components/problems/ProblemHub.test.tsx`
- Create: `app/problemy/page.tsx`
- Create: `app/problemy/page.test.tsx`
- Modify: `app/problemy/problemy.module.css`

**Interfaces:**
- Consumes: `JAW_ZONES`, `JAW_DISCLAIMER`, `ENTRY_EXAM_LABEL`.
- Produces: `ProblemHub(): JSX.Element`; static `/problemy` page with metadata.

- [ ] **Step 1: Write failing component test**

```tsx
render(<ProblemHub />);
expect(screen.getByRole("heading", { level: 1, name: "Čo vás trápi?" })).toBeVisible();
expect(screen.getAllByRole("link", { name: /Predné zuby|Črenové zuby|Stoličky|Ďasná|Chýbajúci zub|Neviem/ })).toHaveLength(6);
expect(screen.getByText(JAW_DISCLAIMER)).toBeVisible();
expect(screen.getByRole("link", { name: /Objednať vstupné vyšetrenie — 100 €/ }))
  .toHaveAttribute("href", "/kontakt?typ=vstupne-vysetrenie");
```

Assert each card lists only its existing `patientLabel` strings and links to `zone.route`.

- [ ] **Step 2: Run component test and observe RED**

Run: `npm test -- components/problems/ProblemHub.test.tsx`

Expected: FAIL because component does not exist.

- [ ] **Step 3: Implement server-renderable hub**

Use `next/link` for internal routes:

```tsx
export function ProblemHub() {
  return (
    <main className={styles.problemHub}>
      <header className={styles.problemHero}>
        <p className={styles.eyebrow}>Problémy a riešenia</p>
        <h1>Čo vás trápi?</h1>
        <p>Vyberte oblasť alebo situáciu. Ukážeme vám najčastejšie možnosti a ďalší krok.</p>
      </header>
      <ul className={styles.zoneGrid}>
        {JAW_ZONES.map((zone) => (
          <li key={zone.id}>
            <Link href={zone.route}>
              <h2>{zone.label}</h2>
              {zone.problems.length ? <p>{zone.problems.map((problem) => problem.patientLabel).join(" · ")}</p> : <p>Začneme vstupným vyšetrením.</p>}
            </Link>
          </li>
        ))}
      </ul>
      <p className={styles.disclaimer}>{JAW_DISCLAIMER}</p>
      <div className={styles.hubActions}>
        <Link href="/kontakt?typ=vstupne-vysetrenie">Objednať vstupné vyšetrenie — 100 €</Link>
        <Link href="/#ambulancia">Pozrieť interaktívnu mapu</Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Write failing route test and metadata assertion**

```tsx
render(<ProblemsPage />);
expect(screen.getByRole("main")).toBeVisible();
expect(metadata).toMatchObject({
  title: "Čo vás trápi? — Dental Centrum Dobeš",
});
```

- [ ] **Step 5: Implement route wrapper**

```tsx
export const metadata: Metadata = {
  title: "Čo vás trápi? — Dental Centrum Dobeš",
  description: "Vyberte oblasť alebo situáciu a nájdite ďalší krok bez samodiagnostiky.",
};

export default function ProblemsPage() {
  return <ProblemHub />;
}
```

Do not add `SiteHeader` or footer here; integration plan adds shared shell after Claude branch exists.

- [ ] **Step 6: Run tests and commit**

```bash
npm test -- components/problems/ProblemHub.test.tsx app/problemy/page.test.tsx
git add components/problems app/problemy/page.tsx app/problemy/page.test.tsx app/problemy/problemy.module.css
git commit -m "feat: add patient problem hub"
```

---

### Task 6: Upgrade Six Problem Pages Into Conversion Pages

**Files:**
- Modify: `app/problemy/[zona]/page.tsx`
- Modify: `app/problemy/[zona]/page.test.tsx`
- Modify: `app/problemy/problemy.module.css`
- Modify only if test requires: `components/home/jaw/JawAppointmentForm.tsx`
- Modify only if form changes: `components/home/jaw/JawAppointmentForm.test.tsx`

**Interfaces:**
- Consumes: `params: Promise<{ zona: string }>` and `searchParams: Promise<Record<string, string | string[] | undefined>>` per Next.js 16; content from Task 4.
- Produces: `generateStaticParams()`, `generateMetadata({ params }): Promise<Metadata>`, allowlisted problem emphasis, existing form.

- [ ] **Step 1: Write failing route content tests**

For `/problemy/stolicky?problem=bite-pain` assert:

```tsx
expect(screen.queryByText("Demo obsahu")).not.toBeInTheDocument();
expect(screen.getByRole("link", { name: "Problémy a riešenia" })).toHaveAttribute("href", "/problemy");
expect(screen.getByRole("heading", { level: 1, name: "Stoličky" })).toBeVisible();
expect(screen.getByTestId("selected-problem")).toHaveTextContent("Bolí ma pri hryzení");
expect(screen.getByRole("heading", { level: 2, name: "Čo môže nasledovať" })).toBeVisible();
expect(screen.getByText("Endodoncia pod mikroskopom, korunka, extrakcia")).toBeVisible();
expect(screen.getByRole("heading", { level: 2, name: "Ako začneme" })).toBeVisible();
expect(screen.getByText(JAW_DISCLAIMER)).toBeVisible();
expect(screen.getByTestId("jaw-appointment-form")).toBeVisible();
expect(screen.getByRole("link", { name: "0918 800 002" })).toHaveAttribute("href", "tel:+421918800002");
```

Add separate test proving unknown, repeated, inherited, and array `problem` values produce no selected problem and never flow into hidden form fields.

- [ ] **Step 2: Run route tests and observe RED**

Run: `npm test -- 'app/problemy/[zona]/page.test.tsx'`

Expected: FAIL because page is still demo and lacks breadcrumb, sections, choices, and phone escape.

- [ ] **Step 3: Add dynamic metadata test**

```ts
await expect(generateMetadata({ params: Promise.resolve({ zona: "dasna" }) }))
  .resolves.toMatchObject({ title: "Ďasná — Dental Centrum Dobeš" });
await expect(generateMetadata({ params: Promise.resolve({ zona: "invalid" }) }))
  .resolves.toMatchObject({ title: "Problémy a riešenia — Dental Centrum Dobeš" });
```

- [ ] **Step 4: Implement page sections from controlled data**

Use `Link` and only existing destination strings:

```tsx
<nav aria-label="Omrvinková navigácia">
  <Link href="/problemy">Problémy a riešenia</Link>
  <span aria-hidden="true">/</span>
  <span>{zone.label}</span>
</nav>
<h1>{zone.label}</h1>
{problem ? <p data-testid="selected-problem">{problem.patientLabel}</p> : null}
<section aria-labelledby="problem-options">
  <h2 id="problem-options">Čo cítite?</h2>
  {zone.problems.map((item) => (
    <Link aria-current={problem?.id === item.id ? "page" : undefined} href={problemHref(zone, item)} key={item.id}>
      {item.patientLabel}
    </Link>
  ))}
</section>
<section>
  <h2>Čo môže nasledovať</h2>
  <ul>{[...new Set(zone.problems.map((item) => item.destination))].map((destination) => <li key={destination}>{destination}</li>)}</ul>
</section>
<section>
  <h2>Ako začneme</h2>
  <p>{ENTRY_EXAM_LABEL}</p>
  <ul>{ENTRY_EXAM_FACTS.map((fact) => <li key={fact}>{fact}</li>)}</ul>
</section>
```

For `unsure`, render no empty problem-choice list; route directly explains entry examination.

- [ ] **Step 5: Preserve Netlify form guarantees**

Keep existing `JawAppointmentForm` fields and network behavior. If only `ENTRY_EXAM_LABEL` changed, existing component requires no production edit. Run form tests to prove duplicate-submit prevention, retained values on failure, abort on unmount, honeypot, and consent gate remain intact.

- [ ] **Step 6: Run page and form tests, then commit**

```bash
npm test -- 'app/problemy/[zona]/page.test.tsx' components/home/jaw/JawAppointmentForm.test.tsx
git add 'app/problemy/[zona]/page.tsx' 'app/problemy/[zona]/page.test.tsx' app/problemy/problemy.module.css
git commit -m "feat: complete patient problem pages"
```

---

### Task 7: Full Verification and Handoff

**Files:**
- Modify: `COLLAB.md`
- Review: all files changed by Tasks 1–6.

**Interfaces:**
- Consumes: complete Codex workstream.
- Produces: pushed `codex/patient-problem-engine` branch with verified commit hash; no merge to `main`.

- [ ] **Step 1: Run automated suite**

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run jaw:validate
git diff --check
```

Expected: all commands exit `0`; current pre-existing npm audit advisories are recorded, not silently claimed fixed.

- [ ] **Step 2: Run credential and dead-link scans**

```bash
git grep -nE 'ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY' -- . ':!package-lock.json'
rg -n -F -e 'href="#"' -e "href='#'" -e 'Demo obsahu' -e 'Vstupné vyšetrenie — 100 EUR' -e '/sluzby' app/problemy components/problems components/home/jaw components/home/ClinicStory.tsx
```

Expected: credential scan empty; no demo copy, hash-only links, old currency text, or `/sluzby` route in owned files.

- [ ] **Step 3: Start localhost and browser-check required sizes**

Run: `npm run dev`

Check `1920×1080`, `1440×900`, `390×844`, and `375×812`:

- seventh clinic photo reaches fullscreen and dwells before any jaw pixel;
- opening cue only says `Zóny bolesti` and disappears before final map;
- final heading appears only after exact final frame;
- desktop guidance rail never overlaps jaw or hit targets;
- hover, focus, tap, Escape, and direct shortcuts work;
- mobile jaw occupies roughly 82–90vw and sheet stays at or below 44dvh;
- reverse scroll closes interaction immediately and replays phases cleanly;
- reduced motion shows usable final image, routes, and disclaimer;
- no horizontal page overflow, blank frame, hard cut, or console error.

- [ ] **Step 4: Update collaboration handoff**

Record exact branch, commit hashes, changed files, commands, browser sizes, known pre-existing audit advisories, and integration ownership. Release Codex file reservations.

- [ ] **Step 5: Commit docs and push feature branch**

```bash
git add COLLAB.md
git commit -m "docs: hand off patient problem engine"
git push -u origin codex/patient-problem-engine
```

Stop. Do not merge or push `main`; integration plan owns that after both branches and localhost approval.
