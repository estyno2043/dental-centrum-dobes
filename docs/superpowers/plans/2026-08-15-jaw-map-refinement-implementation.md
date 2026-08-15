# Jaw pain-map refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Make gallery → jaw → pain-map → patient-results read as one fast, clear story: detail photo first, contained jaw animation second, interactive anatomical map last.

**Architecture:** Keep native document scroll and current WebP frame player. Extend pure motion mapper with explicit gallery/detail/handoff/opening/tease/map/exit phases. ClinicStory consumes phases to control visual layers. JawZoneOverlay consumes presentation phase to render anatomical masks, short leaders, labels, and patient-language cards.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library, pre-rendered WebP jaw frames.

**Spec:** docs/superpowers/specs/2026-08-15-jaw-map-refinement-design.md

## Global Constraints

- Preserve every photoFrames ID and order. Locate handoff only with photoFrames.find((frame) => frame.id === "detail").
- Keep native scroll and mobile native horizontal snap. No wheel listener, scroll interception, Lenis, WebGL, MP4, or new runtime dependency.
- Reveal no jaw pixel before fullscreen detail dwell completes.
- Use overflow: clip where needed. Never put overflow: hidden, auto, or scroll on sticky ancestor.
- Exact motion copy: Zóny bolesti with restrained loading ring. Both disappear before Kde vás to trápi? and map reveal.
- Primary zones: front, premolar, molar, gum. Direct missing and unsure routes appear only in bottom-centre assistance bar during interactive dwell.
- Preserve typed content, routes, analytics, booking form, media pipeline, header, patients, and gallery data.
- Reduced motion, frame failure, and no-JS expose nonblank final map, disclaimer, and six routes without delayed timers.
- No merge or push to main before localhost review and explicit user approval.

## File Map

| File | Responsibility |
| --- | --- |
| components/home/clinicStoryMotion.ts | Pure phase/timeline mapper and interaction gates |
| components/home/clinicStoryMotion.test.ts | Boundary, reverse, clamp, and speed tests |
| components/home/jaw/JawZoneOverlay.tsx | Anatomical masks, anchors, leaders, labels, cards, assistance bar |
| components/home/jaw/JawZoneOverlay.test.tsx | Phase, geometry, focus, route, and analytics tests |
| components/home/jaw/jawExperience.module.css | Map appearance, pop motion, cards, responsive states |
| components/home/ClinicStory.tsx | Gallery handoff, cue/ring, player, map gate, exit |
| components/home/ClinicStory.test.tsx | Gallery preservation, DOM phases, fallback tests |
| components/home/clinicStory.module.css | Contained artboard, safe lanes, handoff and exit gradients |

---

### Task 1: Encode gallery-first motion contract

**Files:**
- Modify: components/home/clinicStoryMotion.ts
- Test: components/home/clinicStoryMotion.test.ts

**Interfaces:**

Consumes current ClinicStoryMotionInput. Produces:

    type ClinicStoryPhase =
      | "gallery"
      | "detail"
      | "handoff"
      | "opening"
      | "tease"
      | "map"
      | "interactive"
      | "exit";

    type ClinicStoryMotionState = Readonly<{
      phase: ClinicStoryPhase;
      grow: number;
      pan: number;
      detail: number;
      handoff: number;
      sequenceProgress: number;
      cueOpacity: number;
      teaseProgress: number;
      mapReveal: number;
      exit: number;
      targetFrame: number;
      zonesVisible: boolean;
      interactive: boolean;
    }>;

Test helper used below:

    const at = (
      progressVh: number,
      exactEndDrawn = false,
      revealComplete = false,
    ) =>
      mapClinicStoryMotion({
        progressVh,
        profile: "desktop",
        frameCount: 72,
        exactEndDrawn,
        revealComplete,
      });

Desktop boundaries: gallery/pan ends 370; detail expands 370–460; dwell 460–500; handoff 500–530; opening 530–670; tease 670–710; map reveal 710–750; interaction 750–900; exit 900–1030.

- [ ] **Step 1: Write failing boundary tests**

    it("holds detail fullscreen before jaw frames", () => {
      expect(at(499).phase).toBe("detail");
      expect(at(499).detail).toBe(1);
      expect(at(499).sequenceProgress).toBe(0);
      expect(at(530).phase).toBe("opening");
    });

    it("shows cue only during opening", () => {
      expect(at(540).cueOpacity).toBeGreaterThan(0);
      expect(at(669).cueOpacity).toBeGreaterThan(0);
      expect(at(670).cueOpacity).toBe(0);
    });

    it("gates interaction on map, endpoint, and reveal", () => {
      expect(at(749, true, true).interactive).toBe(false);
      expect(at(750, false, true).interactive).toBe(false);
      expect(at(750, true, true).interactive).toBe(true);
      expect(at(900, true, true).interactive).toBe(false);
    });

- [ ] **Step 2: Run focused RED**

Run: npm test -- components/home/clinicStoryMotion.test.ts

Expected: FAIL. Current state lacks phase/detail/handoff/cue/tease/map/exit fields and starts sequence too early.

- [ ] **Step 3: Implement minimal pure mapper**

    const DESKTOP_PHASES = Object.freeze({
      galleryEnd: 370,
      detailEnd: 460,
      detailDwellEnd: 500,
      handoffEnd: 530,
      openingEnd: 670,
      teaseEnd: 710,
      mapEnd: 750,
      interactiveEnd: 900,
      storyEnd: 1030,
    });

    const cueOpacity =
      range(progressVh, 535, 552) *
      (1 - range(progressVh, 650, 670));

    const interactive =
      progressVh >= DESKTOP_PHASES.mapEnd &&
      progressVh < DESKTOP_PHASES.interactiveEnd &&
      input.exactEndDrawn &&
      input.revealComplete;

Keep current normalization, one-based target frames, and stepCriticallyDamped. Map frame sequence only through 530–670. Define equivalent mobile semantic phases while preserving native swipe.

- [ ] **Step 4: Run focused GREEN**

Run: npm test -- components/home/clinicStoryMotion.test.ts

Expected: PASS for desktop/mobile boundaries, invalid input, target-frame bounds, cue fade, reverse closure, and faster opening.

- [ ] **Step 5: Commit**

    git add components/home/clinicStoryMotion.ts components/home/clinicStoryMotion.test.ts
    git commit -m "feat: map gallery-first jaw phases"

### Task 2: Build anatomical map reveal

**Files:**
- Modify: components/home/jaw/JawZoneOverlay.tsx
- Modify: components/home/jaw/JawZoneOverlay.test.tsx
- Modify: components/home/jaw/jawExperience.module.css

**Interfaces:**

    type JawMapPresentation =
      | "hidden"
      | "tease"
      | "reveal"
      | "interactive";

    type JawZoneOverlayProps = Readonly<{
      analyticsConsent: boolean;
      exactEndDrawn: boolean;
      presentation: JawMapPresentation;
      reducedMotion: boolean;
      visible: boolean;
    }>;

- [ ] **Step 1: Write failing overlay tests**

    it("hides map controls until reveal", () => {
      renderOverlay({ presentation: "tease" });
      expect(screen.queryByRole("heading", {
        name: "Kde vás to trápi?",
      })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", {
        name: "Predné zuby",
      })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", {
        name: "Chýba mi zub",
      })).not.toBeInTheDocument();
    });

    it("uses masks, anchors, and leaders without debug rectangles", () => {
      renderOverlay({ presentation: "interactive" });
      expect(screen.getAllByTestId(/jaw-mask-/)).toHaveLength(7);
      expect(screen.getAllByTestId(/jaw-anchor-/)).toHaveLength(7);
      expect(screen.getAllByTestId(/jaw-leader-/)).toHaveLength(7);
      expect(screen.getAllByTestId(/jaw-leader-/).every(
        (leader) => leader.hasAttribute("marker-end"),
      )).toBe(true);
      expect(screen.queryAllByTestId(/jaw-debug-rect/)).toHaveLength(0);
    });

    it("opens patient-language problems from hover, focus, and tap", async () => {
      renderOverlay({ presentation: "interactive" });
      const molar = screen.getByRole("button", { name: "Stoličky" });
      fireEvent.pointerEnter(molar);
      expect(screen.getByRole("link", {
        name: "Bolí pri hryzení",
      })).toBeVisible();
    });

- [ ] **Step 2: Run focused RED**

Run: npm test -- components/home/jaw/JawZoneOverlay.test.tsx

Expected: FAIL. Current overlay has no presentation state, permanent rectangular strokes, no anchor/leader contract, and lower-right direct buttons.

- [ ] **Step 3: Implement map visuals and interactions**

Use SVG paths following anatomy, not rectangular polygons. Preserve seven hit surfaces: front, paired premolars, paired molars, upper/lower gums. Keep four semantic zone labels.

    const mapVisible =
      presentation === "reveal" ||
      presentation === "interactive";
    const mapInteractive =
      presentation === "interactive" ||
      reducedMotion;

    <path
      data-testid={"jaw-mask-" + surface.id}
      className={styles.zoneMask}
      d={surface.path}
    />
    <circle
      data-testid={"jaw-anchor-" + surface.id}
      className={styles.zoneAnchor}
    />
    <path
      data-testid={"jaw-leader-" + surface.id}
      className={styles.zoneLeader}
      d={surface.leaderPath}
    />

Tease: low-opacity champagne/rose masks pulse in sequence. Reveal: anchor, short leader with restrained arrowhead, compact label pop with 140–180 ms stagger. Arrow tip terminates on exact painful site, never through tooth text. Hover/focus/tap strengthens mask and opens existing typed problem card. Escape restores zone focus.

Replace lower-right buttons with bottom-centre assistance bar:

    Nenašli ste miesto?  Chýba mi zub · Neviem / bolí to celé

Keep semantic zone buttons, direct links, and problem links absent from the accessibility tree before their phase. During reveal, labels may render visually but controls remain inert; only interactive presentation enables focus and navigation. Keep route/query and consent analytics contracts unchanged.

- [ ] **Step 4: Run focused GREEN**

Run: npm test -- components/home/jaw/JawZoneOverlay.test.tsx

Expected: PASS for phase gate, tease, geometry, hover/focus/tap, assistance links, routes, analytics, Escape, reverse closure, resize, reduced motion, and no debug rectangles.

- [ ] **Step 5: Commit**

    git add components/home/jaw/JawZoneOverlay.tsx components/home/jaw/JawZoneOverlay.test.tsx components/home/jaw/jawExperience.module.css
    git commit -m "feat: reveal anatomical jaw pain map"

### Task 3: Integrate detail dwell, contained jaw, and gradient exit

**Files:**
- Modify: components/home/ClinicStory.tsx
- Modify: components/home/ClinicStory.test.tsx
- Modify: components/home/clinicStory.module.css

**Interfaces:**

Consumes ClinicStoryMotionState and JawMapPresentation. Produces test IDs jaw-transition-cue, jaw-loading-ring, jaw-contained-artboard, clinic-story-exit while preserving clinic-frame and clinic-handoff.

Add a local test harness instead of relying on an undefined scroll helper:

    function renderStoryAt(initialProgressVh: number) {
      stubMatchMedia(false);
      const view = render(<ClinicStory />);
      const section = screen.getByTestId("clinic-story");
      const track = screen.getByRole("list");
      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: 1000,
      });
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: 1440,
      });
      Object.defineProperty(track, "scrollWidth", {
        configurable: true,
        value: 4200,
      });

      const setProgress = (progressVh: number) => {
        const top = -progressVh * (window.innerHeight / 100);
        section.getBoundingClientRect = () => ({
          bottom: top + 10300,
          height: 10300,
          left: 0,
          right: 1440,
          top,
          width: 1440,
          x: 0,
          y: top,
          toJSON: () => ({}),
        }) satisfies DOMRect;
        act(() => window.dispatchEvent(new Event("scroll")));
      };

      setProgress(initialProgressVh);
      return { ...view, setProgress };
    }

- [ ] **Step 1: Write failing integration tests**

    it("keeps jaw absent until full detail dwell completes", () => {
      const { setProgress } = renderStoryAt(499);
      expect(screen.queryByTestId(
        "jaw-contained-artboard",
      )).not.toBeInTheDocument();
      expect(screen.getByTestId(
        "clinic-handoff",
      )).toHaveAttribute("data-frame-id", "detail");

      setProgress(535);
      expect(screen.getByTestId(
        "jaw-transition-cue",
      )).toHaveTextContent("Zóny bolesti");
    });

    it("removes cue before map appears", () => {
      renderStoryAt(700);
      expect(screen.queryByTestId(
        "jaw-transition-cue",
      )).not.toBeInTheDocument();
      expect(screen.queryByRole("link", {
        name: "Chýba mi zub",
      })).not.toBeInTheDocument();
    });

    it("preserves gallery identity and semantic handoff", () => {
      render(<ClinicStory />);
      expect(screen.getAllByTestId("clinic-frame").map(
        (node) => node.dataset.frameId,
      )).toEqual(photoFrames.map((frame) => frame.id));
      expect(screen.getByTestId(
        "clinic-handoff",
      )).toHaveAttribute("data-frame-id", "detail");
    });

- [ ] **Step 2: Run focused RED**

Run: npm test -- components/home/ClinicStory.test.tsx

Expected: FAIL. Current jaw starts during zoom, no cue/ring exists, artboard fills viewport, direct links appear early, and exit lacks matching gradient.

- [ ] **Step 3: Implement phase-driven layers**

    const presentation: JawMapPresentation = motion.interactive
      ? "interactive"
      : motion.mapReveal > 0
        ? "reveal"
        : motion.teaseProgress > 0
          ? "tease"
          : "hidden";

    {motion.cueOpacity > 0 ? (
      <div
        className={styles.transitionCue}
        data-testid="jaw-transition-cue"
      >
        <span>Zóny bolesti</span>
        <span
          aria-hidden="true"
          className={styles.loadingRing}
          data-testid="jaw-loading-ring"
        />
      </div>
    ) : null}

Keep gallery opaque through detail dwell. Fade handoff photo into blurred background during 500–530. Mount frame player only inside jaw-contained-artboard after handoff. Desktop target size: min(74vw, 68dvh). Mobile target size: min(88vw, 50dvh). Keep caption/heading/artboard/assistance lanes disjoint.

Add one exit gradient layer inside existing sticky pin. During 900–1030, fade/blur/scale jaw scene and let patient results rise naturally. Do not add another sticky or scroll container.

- [ ] **Step 4: Run focused GREEN**

Run: npm test -- components/home/ClinicStory.test.tsx

Expected: PASS for gallery identity, delayed jaw, cue/ring window, map gate, raw reverse closure, reduced/failure/no-JS fallback, contained artboard, mobile safe lanes, and exit layer.

- [ ] **Step 5: Commit**

    git add components/home/ClinicStory.tsx components/home/ClinicStory.test.tsx components/home/clinicStory.module.css
    git commit -m "feat: choreograph gallery to jaw pain map"

### Task 4: Verify responsive experience and hold release gate

**Files:**
- Modify: COLLAB.md

- [ ] **Step 1: Run verification**

    npm test -- components/home/clinicStoryMotion.test.ts components/home/jaw/JawZoneOverlay.test.tsx components/home/ClinicStory.test.tsx
    npm test
    npm run lint
    npm run typecheck
    npm run jaw:validate
    npm run build
    git diff --check
    git diff origin/main...HEAD | rg -n "ghp_|github_pat_|AKIA|BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY"

Expected: all checks exit 0. Jaw validator still reports 72 desktop and 60 mobile frames with endpoint SSE 0. Credential scan finds no source secret.

- [ ] **Step 2: Browser-check desktop**

At 1920×1080 and 1440×900 inspect: pre-detail gallery, fullscreen detail dwell, cue/ring opening, tease, final map, problem card, assistance bar, gradient exit, and reverse scroll. Verify no early jaw/text/control, no debug boxes, aligned short leaders, clean console, no horizontal overflow.

- [ ] **Step 3: Browser-check mobile**

At 390×844 and 375×812: swipe gallery natively to detail, inspect opening and map, tap zones, close card, use keyboard/focus where available, open menu, verify safe lanes, no overflow, clean console.

- [ ] **Step 4: Record localhost handoff**

Update COLLAB.md with test counts, viewports, checkpoint evidence, and http://localhost:3000/. Commit:

    git add COLLAB.md
    git commit -m "docs: record jaw map localhost review"

Stop before merge/push. Request explicit user approval.

---

## Self-review

**Spec coverage:** Task 1 owns timing, speed, cue, tease, map, reverse, and exit gates. Task 2 owns attractive anatomical zones, pop motion, patient-language cards, helper redesign, accessibility, routes, and analytics. Task 3 owns complete gallery, fullscreen detail dwell, contained jaw, cue/ring, safe lanes, fallbacks, and gradient exit. Task 4 owns project/browser verification and localhost approval gate.

**Completeness scan:** Every step names concrete files, behavior, commands, expected results, and local helpers. No deferred implementation note remains.

**Type consistency:** Task 1 produces ClinicStoryMotionState. Task 3 consumes it. Task 2 produces JawMapPresentation. Task 3 consumes it and passes presentation to JawZoneOverlay. Existing route/content/analytics types stay unchanged.
