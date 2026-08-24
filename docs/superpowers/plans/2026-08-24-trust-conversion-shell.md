# Trust and Conversion Shell Implementation Plan

> **For Claude:** Execute inline on your own branch. Do not create subagents. Follow TDD: test, confirm RED, add minimum code, confirm GREEN, commit. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real team trust, working navigation, confirmed price, contact form, homepage close, and footer without adding unreviewed service pages or medical claims.

**Architecture:** Recover only reviewed team files from Claude history, then build small Server Components for static pages and shared shell pieces. Keep one client component for Netlify contact-form state. Centralize navigation/contact constants so desktop menu, mobile menu, header, footer, and CTAs cannot drift.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, existing Motion/Radix packages, Vitest, Testing Library, Netlify Forms.

**Spec:** `docs/superpowers/specs/2026-08-24-flagship-completion-release-design.md`

## Global Constraints

- Create `claude/trust-conversion-shell` from fresh current `origin/main`.
- Read `COLLAB.md`, `AI_WORKFLOW.md`, `CLAUDE.md`, and relevant `node_modules/next/dist/docs/` guides before editing.
- Reserve only Claude-owned files in `COLLAB.md` before production edits.
- Do not merge `origin/claude/tim-page` wholesale.
- Recover team output represented by `2be19a5`, `08cf9e6`, `08f6ccc`, `2877914`, and `23b73d2` only.
- Exclude jaw commits `d272063`, `3eaac82`, `709c91b` and service commits `cbbada2`, `c8502a4`, `3d4bd9d`.
- Do not create, redirect, delete, or reference `/sluzby` routes. `/problemy` remains primary patient-language architecture.
- Do not edit `components/home/ClinicStory.tsx`, its motion/CSS/tests, `components/home/jaw/**`, `components/problems/**`, or `app/problemy/**`.
- Only visible price: `Vstupné vyšetrenie — 100 €`.
- Do not invent address, email, opening hours, response time, treatment price, warranty, result, availability, or insurance claim.
- Use existing packages. No new dependency, CMS, global state, or extra pinned animation.
- No user-facing `href="#"` remains in owned files.
- No commit or push to `main` before integrated localhost approval.

## File Map

- Create/restore `components/team/teamContent.ts`: clinic-supplied eleven-person roster and roles.
- Create/restore `components/team/TeamGrid.tsx`, `TeamGrid.test.tsx`: portrait grid.
- Create/restore `components/team/TeamSection.tsx`, `TeamSection.test.tsx`: shared homepage/team section.
- Create/restore `components/team/team.module.css`: team motion and layout.
- Create/restore `public/media/tim/*`: eleven desktop/mobile portrait pairs.
- Create `app/tim/page.tsx`, `app/tim/page.test.tsx`: team route.
- Modify `components/hero/heroContent.ts`: single navigation source.
- Modify `components/hero/SiteHeader.tsx`, `DesktopMenu.tsx`, `MobileMenu.tsx`, tests, and `hero.module.css`: real URLs.
- Modify `components/hero/Hero.tsx`, `Hero.test.tsx`, and `hero.module.css`: two real hero CTAs.
- Create `components/site/siteContent.ts`: approved phone/navigation/booking constants.
- Create `components/site/SiteFooter.tsx`, `SiteFooter.test.tsx`, `siteFooter.module.css`.
- Create `components/site/ConversionClose.tsx`, `ConversionClose.test.tsx`, `conversionClose.module.css`.
- Create `components/contact/contactContent.ts`: strict query allowlist and confirmed facts.
- Create `components/contact/ContactForm.tsx`, `ContactForm.test.tsx`, `contact.module.css`.
- Create `app/kontakt/page.tsx`, `app/kontakt/page.test.tsx`.
- Create `app/cennik/page.tsx`, `app/cennik/page.test.tsx`, `app/cennik/cennik.module.css`.
- Modify `app/layout.tsx`, `app/layout.test.tsx`: static Netlify contact-form detection contract.
- Modify `app/page.tsx`, `app/page.test.tsx`: final homepage order.
- Modify `COLLAB.md`: reservation and handoff.

---

### Task 1: Recover Only Reviewed Team Work

**Files:**
- Create from reviewed commit: `app/tim/page.tsx`
- Create from reviewed commit: `components/team/**`
- Create from reviewed commit: `public/media/tim/**`
- Create: `app/tim/page.test.tsx`
- Modify: `COLLAB.md`

**Interfaces:**
- Consumes: exact file state at `origin/claude/tim-page` commit `23b73d2` for team code/assets.
- Produces: `TeamSection({ headingLevel?: "h1" | "h2" })`, `TeamGrid({ nameLevel?: "h2" | "h3" })`, `teamMembers`, `teamIntro`.

- [ ] **Step 1: Start clean branch and reserve files**

```bash
git fetch origin --prune
git switch -c claude/trust-conversion-shell origin/main
```

Confirm:

```bash
git status --short
git rev-parse HEAD
git rev-parse origin/main
```

Expected: clean tree; hashes match. Update `COLLAB.md` with branch and exact Claude ownership before restoring files.

- [ ] **Step 2: Restore exact reviewed team files, not later branch state**

```bash
git restore --source=23b73d2 -- \
  app/tim/page.tsx \
  components/team \
  public/media/tim
```

Do not restore `app/page.tsx`, `SiteHeader.tsx`, `heroContent.ts`, `COLLAB.md`, `package-lock.json`, jaw files, or service files from that branch.

- [ ] **Step 3: Add route test before adapting shell**

```tsx
render(<TeamPage />);
expect(screen.getByRole("heading", { level: 1, name: teamIntro.headline })).toBeVisible();
expect(screen.getAllByRole("listitem")).toHaveLength(11);
for (const member of teamMembers) {
  expect(screen.getByRole("heading", { name: member.name })).toBeVisible();
}
```

- [ ] **Step 4: Run team tests**

```bash
npm test -- components/team/TeamGrid.test.tsx components/team/TeamSection.test.tsx app/tim/page.test.tsx
```

Expected: PASS after test harness includes `matchMedia`; no missing portrait asset.

- [ ] **Step 5: Audit restored diff and commit**

```bash
git diff --name-only origin/main...HEAD
find public/media/tim -type f | sort | wc -l
```

Expected: 22 WebP files, team code, `/tim`, tests, and `COLLAB.md`; zero `/sluzby`, jaw, hero, package-lock, or homepage changes.

```bash
git add COLLAB.md app/tim components/team public/media/tim
git commit -m "feat: restore reviewed clinic team"
```

---

### Task 2: Centralize Working Navigation and Hero Actions

**Files:**
- Create: `components/site/siteContent.ts`
- Modify: `components/hero/heroContent.ts`
- Modify: `components/hero/SiteHeader.tsx`
- Modify: `components/hero/DesktopMenu.tsx`
- Modify: `components/hero/MobileMenu.tsx`
- Modify: `components/hero/Hero.tsx`
- Modify: `components/hero/Hero.test.tsx`
- Modify: `components/hero/DesktopMenu.test.tsx`
- Modify: `components/hero/MobileMenu.test.tsx`
- Modify: `components/hero/hero.module.css`

**Interfaces:**
- Produces: `PRIMARY_NAVIGATION`, `BOOKING_HREF`, `PROBLEMS_HREF`, `TOUR_HREF`, `PHONE_HREF`, `PHONE_LABEL`, `ENTRY_EXAM_LABEL`, `ENTRY_EXAM_FACTS`.
- Consumed later by: `SiteFooter`, `ConversionClose`, `/kontakt`, `/cennik`.

- [ ] **Step 1: Write failing shared-route tests**

Add:

```ts
expect(navigationItems).toEqual([
  { label: "Problémy a riešenia", href: "/problemy" },
  { label: "Cenník", href: "/cennik" },
  { label: "Tím", href: "/tim" },
  { label: "Kontakt", href: "/kontakt" },
]);
```

Render `SiteHeader` and assert logo `/`, tour `/#ambulancia`, and both menu renderings use identical four destinations.

Render `Hero` and assert:

```tsx
expect(screen.getByRole("link", { name: "Objednať vstupné vyšetrenie — 100 €" }))
  .toHaveAttribute("href", "/kontakt?typ=vstupne-vysetrenie");
expect(screen.getByRole("link", { name: "Nájsť riešenie podľa problému" }))
  .toHaveAttribute("href", "/problemy");
```

- [ ] **Step 2: Run tests and observe RED**

```bash
npm test -- components/hero/Hero.test.tsx components/hero/DesktopMenu.test.tsx components/hero/MobileMenu.test.tsx
```

Expected: FAIL because current navigation and CTAs use `#`.

- [ ] **Step 3: Add immutable site constants**

```ts
export const BOOKING_HREF = "/kontakt?typ=vstupne-vysetrenie" as const;
export const PROBLEMS_HREF = "/problemy" as const;
export const TOUR_HREF = "/#ambulancia" as const;
export const PHONE_HREF = "tel:+421918800002" as const;
export const PHONE_LABEL = "0918 800 002" as const;
export const ENTRY_EXAM_LABEL = "Vstupné vyšetrenie — 100 €" as const;
export const ENTRY_EXAM_FACTS = Object.freeze([
  "Približne 30 minút",
  "Panoramatická snímka",
  "Intraorálne fotografie a skeny",
  "CT iba vtedy, keď je klinicky indikované",
  "Liečebný plán a ďalšia cena podľa nálezu",
] as const);

export const PRIMARY_NAVIGATION = Object.freeze([
  { label: "Problémy a riešenia", href: PROBLEMS_HREF },
  { label: "Cenník", href: "/cennik" },
  { label: "Tím", href: "/tim" },
  { label: "Kontakt", href: "/kontakt" },
] as const);
```

Re-export or assign `navigationItems = PRIMARY_NAVIGATION` from `heroContent.ts` so existing menus keep one source.

- [ ] **Step 4: Replace all owned dead anchors**

- `SiteHeader` logo → `/`
- desktop tour and mobile tour → `/#ambulancia`
- Hero primary → `/kontakt?typ=vstupne-vysetrenie`
- Hero secondary → `/problemy`
- menu labels/order → shared constant

Replace the old Hero test assertion that expects the telephone as the second
hero CTA. Telephone remains available in both menus and the final conversion
close; the hero row now has exactly the two approved actions.

Remove obsolete `jsx-a11y/anchor-is-valid` disables from changed files.

- [ ] **Step 5: Run tests, dead-link scan, and commit**

```bash
npm test -- components/hero/Hero.test.tsx components/hero/DesktopMenu.test.tsx components/hero/MobileMenu.test.tsx
rg -n -F -e 'href="#"' -e "href='#'" components/hero components/site
```

Expected: tests PASS; scan empty.

```bash
git add components/hero components/site/siteContent.ts
git commit -m "fix: connect navigation and hero actions"
```

---

### Task 3: Build Strict Netlify Contact Form

**Files:**
- Create: `components/contact/contactContent.ts`
- Create: `components/contact/ContactForm.tsx`
- Create: `components/contact/ContactForm.test.tsx`
- Create: `components/contact/contact.module.css`
- Create: `app/kontakt/page.tsx`
- Create: `app/kontakt/page.test.tsx`
- Modify: `app/layout.tsx`
- Create: `app/layout.test.tsx`

**Interfaces:**
- Produces: `parseRequestType(query): "vstupne-vysetrenie" | ""`; `ContactForm({ requestType })`.
- Netlify fields: `form-name`, `bot-field`, `name`, `phone`, optional `email`, `request-type`, `consent`.

- [ ] **Step 1: Write failing allowlist tests**

```ts
expect(parseRequestType({ typ: "vstupne-vysetrenie" })).toBe("vstupne-vysetrenie");
expect(parseRequestType({ typ: "implantat" })).toBe("");
expect(parseRequestType({ typ: ["vstupne-vysetrenie"] })).toBe("");
expect(parseRequestType(Object.create({ typ: "vstupne-vysetrenie" }))).toBe("");
```

Implementation must use `Object.prototype.hasOwnProperty.call(query, "typ")` and require exact string equality.

- [ ] **Step 2: Write failing form tests**

Test exact encoded fields, duplicate-submit prevention, retained values on
non-OK response and rejected network promise, abort on unmount, Strict Mode
single submission, honeypot silent return, required consent, accessible error
focus, and success message. Example core assertion:

```tsx
await user.type(screen.getByLabelText("Meno a priezvisko"), "Jana Nováková");
await user.type(screen.getByLabelText("Telefón"), "0900123456");
await user.click(screen.getByLabelText(/Súhlasím/));
await user.click(screen.getByRole("button", { name: "Odoslať žiadosť" }));

expect(fetchMock).toHaveBeenCalledWith("/", expect.objectContaining({ method: "POST" }));
const body = fetchMock.mock.calls[0][1]?.body as URLSearchParams;
expect([...body.keys()].sort()).toEqual([
  "bot-field", "consent", "email", "form-name", "name", "phone", "request-type",
].sort());
```

- [ ] **Step 3: Run tests and observe RED**

Run: `npm test -- components/contact/ContactForm.test.tsx app/kontakt/page.test.tsx app/layout.test.tsx`

Expected: FAIL because files and static Netlify form do not exist.

- [ ] **Step 4: Implement client form using existing jaw-form pattern**

Use `URLSearchParams`, `AbortController`, `submittingRef`, retained controlled values, and `response.ok` check. Do not add free-text medical history. Render:

```tsx
<form name="contact-request" method="POST" action="/" data-netlify="true" data-netlify-honeypot="bot-field">
  <input name="form-name" type="hidden" value="contact-request" />
  <input name="request-type" type="hidden" value={requestType} />
  {/* honeypot, name, phone, optional email, required consent */}
</form>
```

Visible notice after form heading: `Odoslanie formulára nie je potvrdením termínu.`

- [ ] **Step 5: Implement contact page using confirmed facts only**

Page props:

```ts
type ContactPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;
```

Content:

- h1 `Objednajte sa. Ozveme sa vám s ďalším krokom.`
- telephone `0918 800 002`
- free patient parking
- card or cash payment
- acute patients handled with priority
- no address, email, hours, response-time promise, or availability claim

- [ ] **Step 6: Add hidden static Netlify form to root layout**

Beside existing `jaw-appointment`, add hidden `contact-request` form with exact same field names as interactive form. Test both static contracts independently.

- [ ] **Step 7: Run tests and commit**

```bash
npm test -- components/contact/ContactForm.test.tsx app/kontakt/page.test.tsx app/layout.test.tsx
git add components/contact app/kontakt app/layout.tsx app/layout.test.tsx
git commit -m "feat: add secure contact request flow"
```

---

### Task 4: Add Honest `/cennik` Page

**Files:**
- Create: `app/cennik/page.tsx`
- Create: `app/cennik/page.test.tsx`
- Create: `app/cennik/cennik.module.css`

**Interfaces:**
- Consumes: `BOOKING_HREF`, confirmed entry-exam facts.
- Produces: static Server Component route and metadata.

- [ ] **Step 1: Write failing route test**

```tsx
render(<PricePage />);
expect(screen.getByRole("heading", { level: 1, name: "Cenník" })).toBeVisible();
expect(screen.getByText("Vstupné vyšetrenie — 100 €")).toBeVisible();
expect(screen.getByText("Približne 30 minút")).toBeVisible();
expect(screen.getByText("Panoramatická snímka")).toBeVisible();
expect(screen.getByText("Intraorálne fotografie a skeny")).toBeVisible();
expect(screen.getByText("CT iba vtedy, keď je klinicky indikované")).toBeVisible();
expect(screen.getByText(/Liečebný plán a ďalšia cena/)).toBeVisible();
expect(screen.getByText("Platba kartou alebo v hotovosti")).toBeVisible();
expect(screen.getByRole("link", { name: /Objednať vstupné vyšetrenie/ }))
  .toHaveAttribute("href", "/kontakt?typ=vstupne-vysetrenie");
```

Also assert rendered text contains no `od ` price grid and no other euro amount.

- [ ] **Step 2: Run test and observe RED**

Run: `npm test -- app/cennik/page.test.tsx`

Expected: FAIL because route does not exist.

- [ ] **Step 3: Implement static page and metadata**

Use one price card, one process list, and one CTA. Do not import service branch content. Export:

```ts
export const metadata: Metadata = {
  title: "Cenník — Dental Centrum Dobeš",
  description: "Potvrdená cena vstupného vyšetrenia a čo zahŕňa prvý krok.",
};
```

- [ ] **Step 4: Run test and commit**

```bash
npm test -- app/cennik/page.test.tsx
git add app/cennik
git commit -m "feat: publish confirmed entry exam price"
```

---

### Task 5: Add Team Link, Conversion Close, and Footer

**Files:**
- Modify: `components/team/TeamSection.tsx`
- Modify: `components/team/TeamSection.test.tsx`
- Modify: `components/team/team.module.css`
- Create: `components/site/ConversionClose.tsx`
- Create: `components/site/ConversionClose.test.tsx`
- Create: `components/site/conversionClose.module.css`
- Create: `components/site/SiteFooter.tsx`
- Create: `components/site/SiteFooter.test.tsx`
- Create: `components/site/siteFooter.module.css`

**Interfaces:**
- Consumes: site constants from Task 2.
- Produces: `ConversionClose()` and `SiteFooter()` Server/Client components as needed.

- [ ] **Step 1: Write failing TeamSection link test**

```tsx
const { unmount } = render(<TeamSection />);
expect(screen.getByRole("link", { name: "Spoznať celý tím" })).toHaveAttribute("href", "/tim");
unmount();

render(<TeamSection headingLevel="h1" />);
expect(screen.queryByRole("link", { name: "Spoznať celý tím" })).not.toBeInTheDocument();
```

Add link near intro, not over portraits. Render it only when
`headingLevel === "h2"`, so `/tim` does not link to itself.

- [ ] **Step 2: Write failing conversion-close test**

```tsx
render(<ConversionClose />);
expect(screen.getByRole("heading", { level: 2, name: "Viete, čo vás trápi. Poďme nájsť riešenie." })).toBeVisible();
expect(screen.getByRole("link", { name: "Objednať vstupné vyšetrenie — 100 €" })).toHaveAttribute("href", BOOKING_HREF);
expect(screen.getByRole("link", { name: "Nájsť riešenie podľa problému" })).toHaveAttribute("href", "/problemy");
expect(screen.getByRole("link", { name: "Zavolať 0918 800 002" })).toHaveAttribute("href", PHONE_HREF);
```

CSS test must prove settled opacity is default and reduced-motion removes animation. No pinned/sticky rule.

- [ ] **Step 3: Write failing footer test**

```tsx
render(<SiteFooter />);
expect(screen.getByText("Dental Centrum Dobeš")).toBeVisible();
expect(screen.getByRole("link", { name: "0918 800 002" })).toHaveAttribute("href", PHONE_HREF);
expect(screen.getByRole("navigation", { name: "Päta stránky" })).toBeVisible();
expect(screen.getByRole("link", { name: "Domov" })).toHaveAttribute("href", "/");
expect(screen.getByRole("link", { name: "Prehliadka kliniky" })).toHaveAttribute("href", "/#ambulancia");
expect(screen.queryByText(/Ochrana osobných údajov|Cookies/)).not.toBeInTheDocument();
```

- [ ] **Step 4: Run tests and observe RED**

```bash
npm test -- components/team/TeamSection.test.tsx components/site/ConversionClose.test.tsx components/site/SiteFooter.test.tsx
```

Expected: FAIL on missing components/link.

- [ ] **Step 5: Implement restrained components**

`ConversionClose` may use existing `motion/react` for one viewport fade-up, but server HTML must contain all copy at visible default state. Respect `prefers-reduced-motion`. `SiteFooter` remains static. Do not render placeholder legal links; note legal documents as launch blocker only in `COLLAB.md`.

- [ ] **Step 6: Run tests and commit**

```bash
npm test -- components/team/TeamSection.test.tsx components/site/ConversionClose.test.tsx components/site/SiteFooter.test.tsx
git add components/team components/site
git commit -m "feat: close patient conversion journey"
```

---

### Task 6: Compose Homepage and Shared Public Routes

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/page.test.tsx`
- Modify: `app/tim/page.tsx`
- Modify: `app/tim/page.test.tsx`
- Modify: `app/kontakt/page.tsx`
- Modify: `app/kontakt/page.test.tsx`
- Modify: `app/cennik/page.tsx`
- Modify: `app/cennik/page.test.tsx`

**Interfaces:**
- Consumes: `TeamSection`, `ConversionClose`, `SiteFooter`, `SiteHeader`.
- Produces: final Claude-owned page composition. Problem-route footer integration waits for Codex integration plan.

- [ ] **Step 1: Write failing homepage order test**

Render `HomePage`; compare document positions:

```tsx
expect(drift.compareDocumentPosition(team) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
expect(team.compareDocumentPosition(close) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
expect(close.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
expect(screen.queryByRole("region", { name: /Služby/ })).not.toBeInTheDocument();
```

Expected final order: existing story → Patients → Drift → Team → ConversionClose → SiteFooter.

- [ ] **Step 2: Run page tests and observe RED**

Run: `npm test -- app/page.test.tsx app/tim/page.test.tsx app/kontakt/page.test.tsx app/cennik/page.test.tsx`

Expected: FAIL because final composition/shell is incomplete.

- [ ] **Step 3: Update homepage without touching ClinicStory internals**

Add imports and render:

```tsx
<PatientsSection />
<DriftScene />
<TeamSection />
<ConversionClose />
<SiteFooter />
```

Do not add `ServicesSection`. Do not modify story wrapper, sticky hierarchy, or pointer-event contracts.

- [ ] **Step 4: Add SiteHeader and SiteFooter to Claude-owned static routes**

Each `/tim`, `/kontakt`, `/cennik` page gets one header and one footer with one `<main>`. Do not add footer to `app/problemy` files; integration owner does that after merge.

- [ ] **Step 5: Run page tests and commit**

```bash
npm test -- app/page.test.tsx app/tim/page.test.tsx app/kontakt/page.test.tsx app/cennik/page.test.tsx
git add app/page.tsx app/page.test.tsx app/tim app/kontakt app/cennik
git commit -m "feat: compose complete trust and conversion shell"
```

---

### Task 7: Verify and Hand Off Claude Branch

**Files:**
- Modify: `COLLAB.md`
- Review: all Claude-owned files.

**Interfaces:**
- Produces: pushed `claude/trust-conversion-shell`; no merge to `main`.

- [ ] **Step 1: Run full verification**

```bash
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

- [ ] **Step 2: Scan scope, secrets, dead links, and unapproved claims**

```bash
git diff --name-only origin/main...HEAD
git grep -nE 'ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY' -- . ':!package-lock.json'
rg -n -F -e 'href="#"' -e "href='#'" -e '/sluzby' -e 'ServicesSection' app components
rg -ni 'od [0-9]+ ?€|garant|bezbolest|do [0-9]+ hod|adresa|otváracie hodiny' app components
```

Expected: no Codex-owned jaw/problem file in diff; no service file; no secret; no dead hash anchor; only approved claims.

- [ ] **Step 3: Browser-check desktop and mobile**

Run `npm run dev`. Check homepage, `/tim`, `/kontakt?typ=vstupne-vysetrenie`, `/kontakt?typ=unknown`, and `/cennik` at `1440×900`, `390×844`, `375×812`:

- header/menu routes work and close correctly;
- hero CTAs do not reload into dead anchors;
- team portraits/roles render with no invented role;
- contact form retains values after forced failure and blocks duplicate submit;
- unknown query does not enter hidden field;
- cennik shows one price only;
- conversion close and footer have no hard visual cut or legal placeholders;
- console clean and no horizontal overflow.

- [ ] **Step 4: Update handoff and push branch**

Record exact branch, commit hashes, test/build/browser evidence, known npm audit advisories, and legal-content launch blocker in `COLLAB.md`. Release reservations.

```bash
git add COLLAB.md
git commit -m "docs: hand off trust conversion shell"
git push -u origin claude/trust-conversion-shell
```

Stop. Do not merge or push `main`.

---

## Copy-Paste Prompt For Claude

```text
Pracuj v /Users/goat/Documents/ChatGPT/DOBES. Najprv v plnom znení prečítaj COLLAB.md, AI_WORKFLOW.md, CLAUDE.md, potom docs/superpowers/specs/2026-08-24-flagship-completion-release-design.md a docs/superpowers/plans/2026-08-24-trust-conversion-shell.md. Použi presne tento implementačný plán task-by-task, inline bez subagentov. Pred každou produkčnou úpravou sprav test, over RED, potom minimum kódu a GREEN. Vytvor čerstvý branch claude/trust-conversion-shell z aktuálneho origin/main a rezervuj iba Claude-owned súbory v COLLAB.md.

Z origin/claude/tim-page obnov iba presný tímový stav z commitov 2be19a5, 08cf9e6, 08f6ccc, 2877914 a 23b73d2, ideálne cez git restore --source=23b73d2 pre app/tim, components/team a public/media/tim. Nesmieš merge-nuť branch celý. Úplne vynechaj jaw commity d272063, 3eaac82, 709c91b a service commity cbbada2, c8502a4, 3d4bd9d. Nevytváraj /sluzby, redirecty ani ServicesSection. Neupravuj ClinicStory, jaw, components/problems ani app/problemy.

Dodaj: Tím + /tim, funkčnú navigáciu bez href="#", dva hero CTA, /kontakt so strict allowlist Netlify formulárom, /cennik iba s Vstupné vyšetrenie — 100 €, ConversionClose, SiteFooter a finálne poradie homepage bez ServicesSection. Nevymýšľaj adresu, email, otváracie hodiny, response time, ceny ani medicínske tvrdenia. Nepoužívaj nové dependency. Po každom tasku malý commit. Na konci npm test, lint, typecheck, build, diff check, credential/dead-link/scope scan a localhost desktop+mobile kontrola. Pushni iba claude/trust-conversion-shell a zastav; main integruje Codex až po spoločnom localhost schválení.
```
