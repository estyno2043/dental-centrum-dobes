# Flagship completion release

## Status

Direction A approved by the user on 2026-08-24. This written specification is
pending the user's final review before implementation plans are created.

## Release goal

Turn the current cinematic landing page into a complete patient journey
without weakening its premium identity:

1. help a visitor name the problem in their own words;
2. show a relevant next step without presenting a diagnosis;
3. establish trust through the real clinic team;
4. make the confirmed first-step price visible;
5. provide working contact and booking routes at every decision point;
6. close the site with navigation and contact instead of an empty visual end.

The work ships as one user-reviewed release, but implementation is split into
two independent branches with non-overlapping production ownership. Codex owns
the patient-problem engine. Claude owns the trust and conversion shell. Codex
owns final integration and publication after localhost approval.

## Starting state and reviewed incoming work

The design starts from `origin/main` at
`4e4185ec27c9d3c64f9ebfea048f6c1215e9cdd3`. There is no open pull request.

`origin/claude/tim-page` was fetched and inspected at `23b73d2`. It contains:

- a useful team page, homepage team section, eleven approved portraits, and
  clinic-supplied roles;
- two jaw redesign commits that overlap the Codex workstream;
- a merge commit bringing in desktop navigation that already exists on main.

The branch must not be merged wholesale. Claude may port only the team-specific
commits `2be19a5`, `08cf9e6`, `08f6ccc`, `2877914`, and `23b73d2` onto a fresh
branch from current `origin/main`. Commits `d272063`, `3eaac82`, and `709c91b`
are excluded.

## Product principles

### Patient language first

Navigation starts with what a patient feels, not a clinical specialty. The
jaw map and `/problemy` hub use the existing six controlled paths:

- Predné zuby;
- Črenové zuby;
- Stoličky;
- Ďasná;
- Chýbajúci zub;
- Neviem / bolí to celé.

The experience explains possible next services but never claims to diagnose.
The visible disclaimer remains:

> Orientačná pomôcka. Presnú príčinu určí až vyšetrenie.

### One confirmed price

The only treatment price published in this release is:

> Vstupné vyšetrenie — 100 €

No other treatment price, discount, duration, availability, result, warranty,
or insurance claim is added without an approved source.

### Real routes, no dead controls

Every public navigation item, CTA, logo, and tour control has a real URL or
telephone action. No user-facing `href="#"` remains.

### Motion supports decisions

Motion keeps the existing restrained brand language. It may introduce or
explain an interaction, but it must not delay access to booking, contact, or
urgent telephone help. `prefers-reduced-motion` always gets immediate usable
content.

### Simple implementation

- Use existing Next.js 16, React, Motion, Radix, and CSS Modules.
- No CMS, global state library, smooth-scroll interception, WebGL, or new
  animation dependency.
- Public UI libraries are references for patterns, not wholesale design
  systems. Any adapted primitive must be small, locally styled, licensed, and
  compatible with the existing brand.
- Server Components remain the default. Client Components are limited to
  interaction, motion, and forms.
- No subagents are used. Codex works inline; Claude works on his own branch.

## Final information architecture

### Primary navigation

| Label | Destination | Purpose |
| --- | --- | --- |
| Problémy a riešenia | `/problemy` | Patient-language service discovery |
| Cenník | `/cennik` | Confirmed first-step price and pricing process |
| Tím | `/tim` | People and roles |
| Kontakt | `/kontakt` | Phone and appointment form |

Shared controls:

- logo: `/`;
- clinic tour: `/#ambulancia`;
- primary booking CTA: `/kontakt?typ=vstupne-vysetrenie`;
- urgent CTA: `tel:+421918800002`;
- phone display: `0918 800 002`.

Desktop and mobile navigation use the same `navigationItems` source, labels,
order, and destinations.

### New and upgraded routes

#### `/problemy`

Static patient-intent hub. It contains:

- headline: `Čo vás trápi?`;
- supporting copy: `Vyberte oblasť alebo situáciu. Ukážeme vám najčastejšie
  možnosti a ďalší krok.`;
- six linked intent cards sourced from `JAW_ZONES`;
- direct primary CTA to the 100 € examination;
- persistent orientation disclaimer;
- link back to the interactive clinic/jaw story at `/#ambulancia`.

Cards use patient symptoms already stored in `jawContent.ts`. They do not add
diagnostic descriptions.

#### `/problemy/[zona]`

The six existing demo pages become real conversion pages. Remove `Demo obsahu`.
Each page contains:

1. breadcrumb back to `/problemy`;
2. zone heading and optional selected patient problem;
3. existing patient-language problem choices;
4. existing service destination text under `Čo môže nasledovať`;
5. `Ako začneme` block describing the confirmed entry examination;
6. visible orientation disclaimer;
7. existing Netlify appointment form, prefilled only with controlled zone and
   problem identifiers;
8. telephone escape route.

The page must not describe a destination as a confirmed diagnosis. A selected
problem changes emphasis and form context, not medical certainty.

#### `/tim`

Use the reviewed team implementation and eleven local portrait pairs. Team
names, order, and roles come only from the clinic-supplied `teamContent.ts` at
Claude branch commit `23b73d2`. The route reuses the homepage team component
with an `h1` heading level.

#### `/kontakt`

Contains:

- headline: `Objednajte sa. Ozveme sa vám s ďalším krokom.`;
- telephone action `0918 800 002`;
- appointment form following the existing Netlify static-form contract;
- confirmed facts: free patient parking, payment by card or cash, and priority
  handling for acute patients;
- short notice that sending the form is not confirmation of an appointment;
- no invented address, email, opening hours, response time, or availability.

The only accepted `typ` query value is `vstupne-vysetrenie`. Repeated,
inherited, array, or unknown query values are ignored. The interactive form
submits `form-name`, `bot-field`, `name`, `phone`, optional `email`, controlled
`request-type`, and `consent`. Form fields retain entered values after network
failure and prevent duplicate submission. No free-text medical history field
is introduced in this release.

#### `/cennik`

Contains one confirmed price card:

> Vstupné vyšetrenie — 100 €

Supporting content explains the confirmed first step:

- approximately 30 minutes;
- panoramic image;
- intraoral photographs/scans;
- CT only when clinically indicated;
- treatment plan and further price follow the findings;
- card or cash payment.

No empty service-price grid and no fake `od` pricing. CTA routes to
`/kontakt?typ=vstupne-vysetrenie`.

## Homepage composition

Final order:

1. existing SiteHeader;
2. existing Hero;
3. existing ExperienceBand and ClinicStory;
4. existing PatientsSection;
5. existing DriftScene;
6. TeamSection;
7. final ConversionClose;
8. SiteFooter.

The release does not add another decorative mid-page section. New homepage
work exists to establish trust and close the conversion path.

### Hero actions

Keep the approved rotating headline and visual composition. Replace dead
actions only:

- primary: `Objednať vstupné vyšetrenie — 100 €`;
- secondary: `Nájsť riešenie podľa problému`.

The secondary action routes to `/problemy`. No unverified examination detail
is added over the hero video.

### Team teaser

The homepage uses the existing full TeamSection design from the reviewed
Claude branch rather than a second, competing portrait component. Its heading
remains:

> Za každým úsmevom stojí celý tím.

The section links to `/tim`. The complete roster may render on the homepage as
designed; no separate teaser data source is introduced.

### Final conversion close

Copy:

> Viete, čo vás trápi. Poďme nájsť riešenie.

Actions:

- `Objednať vstupné vyšetrenie — 100 €`;
- `Nájsť riešenie podľa problému`;
- `Zavolať 0918 800 002`.

The block resolves the preceding story through a calm dark-to-taupe gradient,
not a new pinned scene. It uses subtle fade-up motion once, remains fully
visible without JavaScript, and has no auto-rotating content.

### Footer

Contains clinic name, phone, primary navigation, and home/tour links. Legal
links are not rendered until the clinic supplies approved privacy/cookie and
company-identification content. Missing legal material is recorded as a launch
blocker; placeholder legal pages are forbidden.

## Codex workstream: patient-problem engine

Branch: `codex/patient-problem-engine`, created from current `origin/main`.

### Jaw-map refinement

Implement the already approved anatomical-map direction from
`docs/superpowers/specs/2026-08-15-jaw-map-refinement-design.md`, with these
composition locks:

- final clinic photograph reaches fullscreen and dwells before any jaw pixel;
- opening timeline is shortened by approximately 25–30%;
- opening shows only `Zóny bolesti` and one restrained loading ring;
- heading appears only after exact final frame;
- desktop uses a fixed 320–360 px guidance rail on the left and gives the jaw
  58–64% of the width on the right;
- rail never overlaps the jaw or hit surfaces;
- idle rail explains `Vyberte zvýraznenú oblasť`;
- hover/focus/tap replaces guidance with patient-language problem choices;
- zones use close anatomical halos, compact labels, and short connectors;
- broad rectangular masks, dense wireframes, and long crossing arrows are
  forbidden;
- mobile uses one shared crop/coordinate mapper for frame, masks, and hits;
- mobile jaw occupies 82–90vw and approximately 36–44dvh;
- touch targets are at least 48×48 CSS px;
- mobile problem sheet is at most 44dvh and keeps the active zone visible;
- direct `Chýbajúci zub` and `Neviem / bolí to celé` entries remain equal,
  visible final-state shortcuts;
- exit uses the established gradient language and no hard cut.

### Problem-page implementation

Codex creates the `/problemy` hub and upgrades all six dynamic pages. Existing
`JAW_ZONES`, route validation, consent gate, analytics identifiers, form field
allowlist, and Netlify encoding remain the single source of truth.

### Codex production ownership

Codex may change:

- `components/home/ClinicStory.tsx`;
- `components/home/ClinicStory.test.tsx`;
- `components/home/clinicStory.module.css`;
- `components/home/clinicStoryMotion.ts`;
- `components/home/clinicStoryMotion.test.ts`;
- `components/home/jaw/**` only where required by the map and problem routes;
- `app/problemy/page.tsx` and its focused styles/tests;
- `app/problemy/[zona]/**`;
- focused new `components/problems/**`;
- `COLLAB.md`.

Codex does not change `app/page.tsx`, hero navigation/content, team, contact,
price, conversion-close, or footer files in this branch.

## Claude workstream: trust and conversion shell

Branch: `claude/trust-conversion-shell`, created from current `origin/main`.

### Selective team recovery

Claude ports only team-specific changes from `origin/claude/tim-page`. Team
assets and content are reviewed inputs, not locally available production code
until they exist on this fresh branch. Jaw and already-shipped desktop-menu
commits remain excluded.

### Trust and conversion implementation

Claude creates:

- `/tim` and homepage TeamSection;
- `/kontakt` with a standalone Netlify-compatible contact form;
- `/cennik` with only the confirmed entry-exam price;
- ConversionClose;
- SiteFooter;
- working shared navigation and hero CTA destinations;
- homepage composition and relevant route/navigation tests.

### Claude production ownership

Claude may change:

- `app/page.tsx` and `app/page.test.tsx`;
- `app/layout.tsx`, only to add the static Netlify form definition that matches
  the interactive contact form;
- `app/tim/**`;
- `app/kontakt/**`;
- `app/cennik/**`;
- `components/team/**`;
- focused new `components/conversion/**`;
- focused new `components/site/**`;
- `components/hero/SiteHeader.tsx`;
- `components/hero/heroContent.ts`;
- hero files only where needed to replace CTA destinations/copy;
- `public/media/tim/**`;
- `COLLAB.md`.

Claude does not change `components/home/ClinicStory*`,
`components/home/clinicStoryMotion*`, `components/home/jaw/**`,
`app/problemy/**`, or jaw media/build scripts.

## Shared interfaces and integration

Parallel branches do not import components that exist only on the other
branch. Each branch must pass its own tests before integration.

Codex creates `id="ambulancia"` on ClinicStory. Claude may point the tour
control to `/#ambulancia` without editing ClinicStory.

Integration branch: `codex/flagship-completion-integration`, created from the
latest `origin/main` after both workstreams are committed and pushed.

Merge order:

1. merge Claude branch into integration;
2. merge Codex branch into integration;
3. preserve both append-only `COLLAB.md` handoffs;
4. add `SiteFooter` to the problem route group only after both components
   exist, using a small route layout or explicit page composition;
5. run all automated and browser gates;
6. serve integration on localhost for user approval;
7. after approval, merge to `main`, push, confirm `origin/main`, fast-forward
   `develop`, and verify Netlify deployment when its URL is available.

No application conflict is expected outside `COLLAB.md`. Any unexpected shared
production-file conflict stops integration for explicit diff review.

## Forms, privacy, and security

- Forms submit only expected scalar fields through `URLSearchParams`.
- Honeypot remains a real text input visually hidden from humans, not
  `type="hidden"`.
- Duplicate submission is locked atomically.
- Abort pending requests on unmount.
- Non-2xx responses are errors; entered values remain available.
- Analytics emits only controlled zone/problem/CTA identifiers after consent.
- No free-text form value, name, telephone, or email enters analytics.
- Query parameters use own-property checks, scalar checks, and allowlists.
- Server-rendered static Netlify form definitions remain discoverable.
- No credential, token, clinic-private data, or user response is committed.
- Medical copy remains orientation, not diagnosis.

Before public launch, clinic must supply and legally approve controller/company
identity, privacy notice, cookie/analytics policy, retention rules, and consent
wording. This release does not fabricate them and must not claim legal
completeness.

## Accessibility and fallback behavior

- Keyboard reaches all navigation, zones, problem choices, forms, and CTAs in
  logical order.
- Visible focus is never hidden under the fixed header or mobile sheet.
- Interactive controls meet 44×44 CSS px; jaw touch zones meet 48×48 CSS px.
- Escape closes desktop/mobile menus and jaw problem panels and restores focus.
- Reduced motion removes scroll-driven jaw playback and delayed stagger while
  keeping the final map and all routes immediately usable.
- Frame failure and no-JavaScript paths show static final jaw, disclaimer, and
  six normal links.
- Form errors use `role="alert"` with assertive announcement; success uses
  `role="status"` with polite announcement.
- Page landmarks, heading levels, labels, and contrast are checked on every new
  route.

## Verification gates

Each workstream independently runs:

- focused TDD tests for every changed behavior;
- full `npm test`;
- `npm run lint`;
- `npm run typecheck`;
- `npm run build`;
- `git diff --check`;
- changed-file credential scan;
- file-ownership/scope audit.

Integration additionally verifies:

- no public `href="#"` remains;
- home, `/problemy`, `/tim`, `/kontakt`, `/cennik`, and all six dynamic problem
  routes return expected status and metadata;
- static Netlify form definitions exist in built HTML;
- no horizontal document overflow;
- clean console;
- navigation parity between desktop and mobile;
- jaw gallery order and fullscreen detail dwell remain intact;
- jaw rail never overlaps anatomy at 1920×1080 and 1440×900;
- mobile jaw, touch zones, sheet, title, disclaimer, and shortcuts remain
  disjoint at 390×844 and 375×812;
- forms work through success, non-2xx, network failure, duplicate click,
  Strict Mode, and unmount;
- keyboard-only and reduced-motion journeys reach booking;
- homepage ends in TeamSection, ConversionClose, and SiteFooter;
- problem pages include the final shared footer after integration.

## Explicit non-goals

- full treatment price list beyond the confirmed 100 € entry exam;
- legal/privacy pages without approved clinic text;
- address, map, email, or opening hours without confirmed source;
- CMS, database, patient portal, live appointment calendar, or payments;
- new 3D jaw, WebGL, MP4 scrub, or regenerated jaw media;
- rewriting existing patient cases, hero video, or clinic gallery;
- GA4 installation or tracking before consent infrastructure is approved;
- merging any feature into `main` before localhost review.

## Acceptance outcome

Release succeeds when a new visitor can, from any major page:

1. understand what the clinic offers;
2. choose a problem in patient language;
3. understand that guidance is orientation, not diagnosis;
4. see the confirmed 100 € first step;
5. meet the real team;
6. call or submit an appointment request without a dead control;
7. use the same journey on desktop, touch, keyboard, reduced-motion, and
   fallback paths.
