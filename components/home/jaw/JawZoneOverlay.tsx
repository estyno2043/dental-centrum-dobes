"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { emitJawAnalytics } from "./jawAnalytics";
import {
  JAW_ZONES,
  type JawProblemId,
  type JawZone,
  type JawZoneId,
} from "./jawContent";
import styles from "./jawExperience.module.css";

type JawSurfaceId =
  | "front"
  | "premolar-left"
  | "premolar-right"
  | "molar-left"
  | "molar-right"
  | "gum-upper"
  | "gum-lower";

type InteractiveZoneId = Extract<JawZoneId, "front" | "premolar" | "molar" | "gum">;

type Surface = Readonly<{
  id: JawSurfaceId;
  zone: InteractiveZoneId;
  path: string;
  revealIndex: number;
}>;

type ZoneMarker = Readonly<{
  zone: InteractiveZoneId;
  anchor: readonly [number, number];
  leader: string;
  label: readonly [number, number];
  revealIndex: number;
  /**
   * Which edge of the button the hover fill sweeps in from — always the edge
   * facing its own line, so the fill runs towards the anatomy it points at.
   */
  origin: "top" | "right" | "bottom" | "left";
}>;

type OverlayState = Readonly<{
  openZone: InteractiveZoneId | null;
  pinned: boolean;
  mode: "desktop" | "mobile";
}>;

export type JawMapPresentation = "hidden" | "tease" | "reveal" | "interactive";

export type JawZoneOverlayProps = Readonly<{
  analyticsConsent: boolean;
  exactEndDrawn: boolean;
  presentation: JawMapPresentation;
  reducedMotion: boolean;
  visible: boolean;
}>;

const MASTER_WIDTH = 1920;
const MASTER_HEIGHT = 1080;

const SURFACES: readonly Surface[] = [
  {
    id: "front",
    zone: "front",
    path: "M 770 410 C 825 365 1095 365 1150 410 C 1160 490 1160 635 1140 700 C 1045 735 875 735 780 700 C 760 625 760 490 770 410 Z",
    revealIndex: 0,
  },
  {
    id: "premolar-left",
    zone: "premolar",
    path: "M 655 405 C 690 380 765 375 810 395 C 805 500 800 625 780 720 C 735 745 675 745 640 710 C 635 610 640 495 655 405 Z",
    revealIndex: 1,
  },
  {
    id: "premolar-right",
    zone: "premolar",
    path: "M 1110 395 C 1155 375 1230 380 1265 405 C 1280 495 1285 610 1280 710 C 1245 745 1185 745 1140 720 C 1120 625 1115 500 1110 395 Z",
    revealIndex: 1,
  },
  {
    id: "molar-left",
    zone: "molar",
    path: "M 545 435 C 575 400 645 390 680 410 C 675 500 670 610 650 700 C 620 730 565 720 535 680 C 525 600 530 505 545 435 Z",
    revealIndex: 2,
  },
  {
    id: "molar-right",
    zone: "molar",
    path: "M 1240 410 C 1275 390 1345 400 1375 435 C 1390 505 1395 600 1385 680 C 1355 720 1300 730 1270 700 C 1250 610 1245 500 1240 410 Z",
    revealIndex: 2,
  },
  {
    id: "gum-upper",
    zone: "gum",
    path: "M 560 305 C 690 250 1230 250 1360 305 C 1345 350 1315 385 1270 410 C 1120 365 800 365 650 410 C 605 385 575 350 560 305 Z",
    revealIndex: 3,
  },
  {
    id: "gum-lower",
    zone: "gum",
    path: "M 600 690 C 745 735 1175 735 1320 690 C 1310 755 1275 805 1225 835 C 1060 875 860 875 695 835 C 645 805 610 755 600 690 Z",
    revealIndex: 3,
  },
] as const;

const MARKERS: readonly ZoneMarker[] = [
  {
    zone: "front",
    anchor: [960, 470],
    leader: "M 960 292 C 960 340 960 405 960 470",
    label: [960, 255],
    revealIndex: 0,
    origin: "bottom",
  },
  /*
   * Both of these used to miss. Measured against the sequence's final frame,
   * whose 1280x720 maps onto this 1920x1080 viewBox at exactly 1.5x, the
   * lower arch's midline sits at x≈981 and its four incisors span 910–1053.
   * Counting outwards from there puts the left premolars at roughly 760–864
   * and the right molars at 1202–1290.
   *
   * The old premolar anchor at x=720 was past the premolars entirely and sat
   * on the left molars' chewing surfaces; the old molar anchor at x=1300 was
   * off the gum altogether, on the blurred background behind it.
   */
  {
    zone: "premolar",
    anchor: [830, 585],
    /*
     * Dips as it travels, so it grazes under the left molars rather than
     * across them — a line to the premolars that crosses the molars on its way
     * is its own kind of wrong answer.
     */
    leader: "M 480 540 C 600 556 715 572 830 585",
    label: [385, 532],
    revealIndex: 1,
    origin: "right",
  },
  {
    zone: "molar",
    anchor: [1240, 535],
    leader: "M 1535 548 C 1440 543 1340 538 1240 535",
    label: [1625, 552],
    revealIndex: 2,
    origin: "left",
  },
  {
    zone: "gum",
    anchor: [960, 745],
    leader: "M 960 880 C 960 835 960 790 960 745",
    label: [960, 920],
    revealIndex: 3,
    origin: "top",
  },
] as const;

const ZONES: Readonly<Record<InteractiveZoneId, JawZone>> = Object.freeze(
  Object.fromEntries(
    JAW_ZONES.filter((zone): zone is JawZone & { id: InteractiveZoneId } =>
      ["front", "premolar", "molar", "gum"].includes(zone.id),
    ).map((zone) => [zone.id, zone]),
  ) as Record<InteractiveZoneId, JawZone>,
);

const DIRECT_ZONES = JAW_ZONES.filter(
  (zone) => zone.id === "missing" || zone.id === "unsure",
);

function getMode(): OverlayState["mode"] {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
    ? "mobile"
    : "desktop";
}

function zoneHref(zone: JawZone, problemId: string): string {
  const problem = zone.problems.find((candidate) => candidate.id === problemId);
  return problem ? `${zone.route}?problem=${encodeURIComponent(problem.id)}` : zone.route;
}

function classNames(...values: Array<string | false | undefined>): string {
  return values.filter(Boolean).join(" ");
}

function directLabel(zone: JawZone): string {
  return zone.id === "missing" ? "Chýba mi zub" : zone.label;
}

export function JawZoneOverlay({
  analyticsConsent,
  exactEndDrawn,
  presentation,
  reducedMotion,
  visible,
}: JawZoneOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const triggerRefs = useRef<Partial<Record<InteractiveZoneId, HTMLButtonElement>>>({});
  const activeTriggerRef = useRef<InteractiveZoneId | null>(null);
  const skipRestoredFocusRef = useRef(false);
  const [state, setState] = useState<OverlayState>(() => ({
    openZone: null,
    pinned: false,
    mode: getMode(),
  }));

  const effectivePresentation: JawMapPresentation = reducedMotion
    ? "interactive"
    : presentation;
  const endpointReady = reducedMotion || exactEndDrawn;
  const artworkVisible = visible && endpointReady && effectivePresentation !== "hidden";
  const mapVisible = artworkVisible && effectivePresentation !== "tease";
  const enabled = mapVisible && effectivePresentation === "interactive";
  const visibleState = enabled ? state : { ...state, openZone: null, pinned: false };
  const activeZone = visibleState.openZone ? ZONES[visibleState.openZone] : undefined;

  const focusTrigger = useCallback((zoneId: InteractiveZoneId | null) => {
    triggerRefs.current[zoneId ?? "front"]?.focus();
  }, []);

  const close = useCallback(
    (restoreFocus: boolean) => {
      const zoneId = activeTriggerRef.current;
      activeTriggerRef.current = null;
      setState((current) => ({ ...current, openZone: null, pinned: false }));
      if (restoreFocus) {
        skipRestoredFocusRef.current = true;
        focusTrigger(zoneId);
      }
    },
    [focusTrigger],
  );

  useEffect(() => {
    if (enabled) return;
    const focusedInside = rootRef.current?.contains(document.activeElement) ?? false;
    activeTriggerRef.current = null;
    if (focusedInside) rootRef.current?.focus();
    const timer = window.setTimeout(() => {
      setState((current) => ({ ...current, openZone: null, pinned: false }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [enabled]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const onChange = (event: MediaQueryListEvent) => {
      const nextMode: OverlayState["mode"] = event.matches ? "mobile" : "desktop";
      const focusedInside = rootRef.current?.contains(document.activeElement) ?? false;
      activeTriggerRef.current = null;
      setState((current) => ({ ...current, mode: nextMode, openZone: null, pinned: false }));
      if (focusedInside) rootRef.current?.focus();
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && state.pinned) close(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close, state.pinned]);

  /*
   * Clicking away closes the card — the gesture everyone already tries first,
   * ahead of the close button and well ahead of Escape.
   *
   * `pointerdown` rather than `click`, so it goes as the gesture starts rather
   * than a beat later when the finger lifts. Two things count as inside: the
   * card, and the zone buttons. The buttons have to be excluded or clicking
   * one while another zone is open would close and reopen the card inside a
   * single gesture, which reads as a flicker rather than as a switch. Empty
   * space inside the overlay is deliberately *not* excluded — clicking beside
   * the jaw is exactly the "somewhere else" this is for.
   *
   * Focus is not restored here, unlike Escape. Escape is a request to go back
   * to where you were; a click elsewhere already says where you want to be,
   * and pulling focus back to the jaw would take it away again.
   *
   * Only while pinned. An unpinned card is a hover preview and already leaves
   * when the pointer does.
   */
  useEffect(() => {
    if (!state.pinned) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (cardRef.current?.contains(target)) return;
      if (
        Object.values(triggerRefs.current).some((trigger) =>
          trigger?.contains(target),
        )
      ) {
        return;
      }
      close(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [close, state.pinned]);

  /*
   * The card unfolds from the spot on the jaw it belongs to, not from its own
   * corner. The anchor's position is measured against the card's own box and
   * handed over as `transform-origin`, which may sit well outside that box —
   * that is the point: the panel swings out of the tooth rather than appearing
   * beside it.
   */
  useEffect(() => {
    const card = cardRef.current;
    const zone = visibleState.openZone;
    if (!card || !zone) return;

    const anchor = document.querySelector(`[data-testid="jaw-anchor-${zone}"]`);
    if (!anchor) return;

    const from = anchor.getBoundingClientRect();
    const box = card.getBoundingClientRect();
    card.style.transformOrigin = `${from.left + from.width / 2 - box.left}px ${
      from.top + from.height / 2 - box.top
    }px`;
  }, [visibleState.openZone, visibleState.mode]);

  const open = useCallback((zoneId: InteractiveZoneId, pin: boolean) => {
    if (!enabled) return;
    activeTriggerRef.current = zoneId;
    setState((current) => ({
      ...current,
      openZone: zoneId,
      pinned: pin || current.pinned,
    }));
  }, [enabled]);

  /*
   * The card holds itself in space against the pointer: a few degrees of tilt,
   * written as two custom properties. Cheap enough to run on every move — two
   * property writes and a composited rotation — and it is what turns the panel
   * from a picture of a card into something occupying room in front of the jaw.
   */
  const tiltToPointer = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--tilt-y", `${(x * 7).toFixed(2)}deg`);
    card.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
  }, []);

  const releaseTilt = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  }, []);

  const closeUnpinned = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const related = event.relatedTarget;
    if (related instanceof Node && rootRef.current?.contains(related)) return;
    setState((current) => current.pinned ? current : { ...current, openZone: null });
  }, []);

  const activateZone = useCallback((zoneId: InteractiveZoneId) => {
    if (!enabled) return;
    open(zoneId, true);
    emitJawAnalytics({ consent: analyticsConsent, event: "jaw_zone_click", zone: zoneId });
  }, [analyticsConsent, enabled, open]);

  const onDirectClick = useCallback((zone: JawZone, event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (!enabled) {
      event.preventDefault();
      return;
    }
    emitJawAnalytics({ consent: analyticsConsent, event: "jaw_zone_click", zone: zone.id });
  }, [analyticsConsent, enabled]);

  const directLinks = useMemo(() => DIRECT_ZONES.map((zone) => (
    <a
      className={styles.directEntry}
      href={zone.route}
      key={zone.id}
      onClick={(event) => onDirectClick(zone, event)}
    >
      {directLabel(zone)}
    </a>
  )), [onDirectClick]);

  const card = enabled && activeZone ? (
    <section
      aria-label={activeZone.label}
      className={classNames(styles.zoneCard, visibleState.mode === "mobile" && styles.zonePanel)}
      /*
       * Away from the active zone's own button. Only the premolar control sits
       * out to the left; the card's default side would sit straight on top of
       * it.
       */
      data-side={visibleState.openZone === "premolar" ? "right" : "left"}
      onPointerLeave={(event) => {
        releaseTilt();
        closeUnpinned(event);
      }}
      onPointerMove={tiltToPointer}
      ref={cardRef}
      role={visibleState.mode === "mobile" ? "dialog" : "region"}
    >
      <div className={styles.cardTop}>
        <p className={styles.cardKicker}>Vyberte problém</p>
        <h3>{activeZone.label}</h3>
        {visibleState.mode === "mobile" ? (
          <button
            aria-label="Zavrieť"
            className={styles.closeButton}
            onClick={() => close(true)}
            type="button"
          >
            {/* The glyph is decoration; the button's name comes from the label
                above and the hidden word below, so nothing is lost when the
                mark cannot be read. */}
            <span aria-hidden="true">✕</span>
            <span className={styles.srOnly}>Zavrieť</span>
          </button>
        ) : null}
      </div>
      <ul className={styles.problemList}>
        {activeZone.problems.map((problem) => (
          <li key={problem.id}>
            <a
              href={zoneHref(activeZone, problem.id)}
              onClick={() => {
                emitJawAnalytics({
                  consent: analyticsConsent,
                  event: "jaw_problem_click",
                  zone: activeZone.id,
                  problem: problem.id as JawProblemId,
                });
              }}
            >
              <span className={styles.problemLabel}>{problem.patientLabel}</span>
              {/*
                Where the row goes. Deliberately the whole list rather than the
                first of it: the same symptom leads to more than one treatment
                and only an examination decides which, so naming one would be a
                diagnosis the page is not entitled to make.
              */}
              <span className={styles.problemDestination}>
                <span>{problem.destination}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  ) : null;

  return (
    <div
      className={classNames(styles.zoneOverlay, !enabled && styles.zoneOverlayDisabled)}
      data-presentation={artworkVisible ? effectivePresentation : "hidden"}
      data-testid="jaw-zone-overlay"
      ref={rootRef}
      tabIndex={-1}
    >
      {mapVisible ? (
        <>
          <h2 className={styles.zoneHeading}>Kde vás to trápi?</h2>
          <p className={styles.zonePrompt}>Vyberte oblasť a povedzte nám, čo cítite.</p>
        </>
      ) : null}
      {artworkVisible ? (
        <div className={styles.zoneArtboard} data-testid="jaw-artboard">
          <svg
            className={styles.zoneArtwork}
            viewBox={`0 0 ${MASTER_WIDTH} ${MASTER_HEIGHT}`}
          >
            <defs>
              {/*
                Porcelain into the brand's taupe. It used to run peach into
                dusty pink — a warm wash over pink gums, which is nearly
                invisible and, where it did show, looked like a photo filter
                rather than a highlight.
              */}
              <linearGradient id="jaw-zone-fill" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#faf9f6" />
                <stop offset="1" stopColor="#ae9b7e" />
              </linearGradient>
            </defs>
            {SURFACES.map((surface) => (
              <path
                className={classNames(
                  styles.zoneMask,
                  visibleState.openZone === surface.zone && styles.zoneMaskSelected,
                )}
                d={surface.path}
                data-testid={`jaw-mask-${surface.id}`}
                data-zone={surface.zone}
                key={`mask-${surface.id}`}
                style={{ "--zone-index": surface.revealIndex } as CSSProperties}
              />
            ))}
            {mapVisible ? MARKERS.map((marker) => (
              <g
                className={styles.zoneMarker}
                data-active={visibleState.openZone === marker.zone}
                key={marker.zone}
                style={{ "--zone-index": marker.revealIndex } as CSSProperties}
              >
                <path
                  className={styles.zoneLeader}
                  d={marker.leader}
                  data-testid={`jaw-leader-${marker.zone}`}
                  pathLength={100}
                />
                {/*
                  The same path again, drawn as one short dash that runs from
                  the button end to the jaw end while the zone is active — the
                  button sending a signal to the place it names. Two elements
                  rather than one because the line has to stay drawn underneath
                  while the dash travels over it.
                */}
                <path
                  className={styles.zonePulse}
                  d={marker.leader}
                  data-testid={`jaw-pulse-${marker.zone}`}
                  pathLength={100}
                />
                <circle
                  className={styles.zoneHalo}
                  cx={marker.anchor[0]}
                  cy={marker.anchor[1]}
                  r="8"
                />
                <circle
                  className={styles.zoneAnchor}
                  cx={marker.anchor[0]}
                  cy={marker.anchor[1]}
                  data-testid={`jaw-anchor-${marker.zone}`}
                  r="8"
                />
              </g>
            )) : null}
          </svg>

          {/*
            The controls. HTML rather than shapes inside the SVG: a real button
            brings its own focus handling, its own keyboard behaviour and a
            hit area that does not depend on where a path happens to be
            painted.

            This replaces seven invisible hit paths laid over the anatomy. Those
            sat edge to edge, so reaching the front teeth from outside the jaw
            meant crossing the molar and premolar surfaces, and each crossing
            opened its own card on the way past. Four separated buttons cannot
            do that to each other.

            Positioned from the same master coordinates the lines are drawn in.
            The artboard is locked to 16:9 and the viewBox is 1920×1080, so a
            percentage of the box and a fraction of the viewBox are the same
            place.
          */}
          <div className={styles.zoneButtons} data-testid="jaw-zone-buttons">
              {MARKERS.map((marker) => (
                <button
                  aria-expanded={enabled ? visibleState.openZone === marker.zone : undefined}
                  aria-hidden={!enabled}
                  className={styles.zoneButton}
                  data-active={visibleState.openZone === marker.zone}
                  data-origin={marker.origin}
                  data-testid={`jaw-zone-button-${marker.zone}`}
                  data-zone={marker.zone}
                  disabled={!enabled}
                  key={marker.zone}
                  onBlur={() => {
                    if (!state.pinned) setState((current) => ({ ...current, openZone: null }));
                  }}
                  onClick={() => activateZone(marker.zone)}
                  onFocus={() => {
                    if (skipRestoredFocusRef.current) {
                      skipRestoredFocusRef.current = false;
                      return;
                    }
                    open(marker.zone, false);
                  }}
                  onPointerEnter={() => open(marker.zone, false)}
                  onPointerLeave={closeUnpinned}
                  ref={(element) => {
                    triggerRefs.current[marker.zone] = element ?? undefined;
                  }}
                  /*
                   * A `<button>` cannot shed its implicit role, and until the
                   * map is live these are labels rather than controls — the
                   * same contract the paths they replaced held.
                   */
                  role={enabled ? undefined : "presentation"}
                  style={{
                    "--x": `${(marker.label[0] / MASTER_WIDTH) * 100}%`,
                    "--y": `${(marker.label[1] / MASTER_HEIGHT) * 100}%`,
                    "--zone-index": marker.revealIndex,
                  } as CSSProperties}
                  tabIndex={enabled ? 0 : -1}
                  type="button"
                >
                  <span aria-hidden="true" className={styles.zoneButtonMark} />
                  <span className={styles.zoneButtonLabel}>{ZONES[marker.zone].label}</span>
                </button>
              ))}
          </div>
        </div>
      ) : null}
      {enabled ? (
        <div className={styles.assistanceBar} data-testid="jaw-assistance">
          <span>Nenašli ste miesto?</span>
          {directLinks}
        </div>
      ) : null}
      {card}
      <p aria-live="polite" className={styles.zoneStatus}>
        {visibleState.pinned && activeZone ? `${activeZone.label}: vyberte problém.` : ""}
      </p>
    </div>
  );
}
