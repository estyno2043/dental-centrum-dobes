"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
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

type ZoneLabel = Readonly<{
  zone: InteractiveZoneId;
  anchor: readonly [number, number];
  label: readonly [number, number];
  connector: string;
  revealIndex: number;
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

const LABELS: readonly ZoneLabel[] = [
  {
    zone: "front",
    anchor: [1030, 420],
    label: [1120, 330],
    connector: "M 1088 353 C 1070 372 1050 397 1030 420",
    revealIndex: 0,
  },
  {
    zone: "premolar",
    anchor: [735, 435],
    label: [650, 340],
    connector: "M 682 365 C 700 388 718 414 735 435",
    revealIndex: 1,
  },
  {
    zone: "molar",
    anchor: [1310, 480],
    label: [1400, 395],
    connector: "M 1366 418 C 1348 438 1328 460 1310 480",
    revealIndex: 2,
  },
  {
    zone: "gum",
    anchor: [1170, 760],
    label: [1260, 845],
    connector: "M 1228 822 C 1208 803 1188 781 1170 760",
    revealIndex: 3,
  },
] as const;

const LABEL_WIDTHS: Readonly<Record<InteractiveZoneId, number>> = Object.freeze({
  front: 174,
  premolar: 196,
  molar: 132,
  gum: 112,
});

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
  const triggerRefs = useRef<Partial<Record<JawSurfaceId, SVGPathElement>>>({});
  const activeSurfaceRef = useRef<JawSurfaceId | null>(null);
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

  const focusTrigger = useCallback((surfaceId: JawSurfaceId | null) => {
    triggerRefs.current[surfaceId ?? "front"]?.focus();
  }, []);

  const close = useCallback(
    (restoreFocus: boolean) => {
      const surfaceId = activeSurfaceRef.current;
      activeSurfaceRef.current = null;
      setState((current) => ({ ...current, openZone: null, pinned: false }));
      if (restoreFocus) {
        skipRestoredFocusRef.current = true;
        focusTrigger(surfaceId);
      }
    },
    [focusTrigger],
  );

  useEffect(() => {
    if (enabled) return;
    const focusedInside = rootRef.current?.contains(document.activeElement) ?? false;
    activeSurfaceRef.current = null;
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
      activeSurfaceRef.current = null;
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

  const open = useCallback((surface: Surface, pin: boolean) => {
    if (!enabled) return;
    activeSurfaceRef.current = surface.id;
    setState((current) => ({
      ...current,
      openZone: surface.zone,
      pinned: pin || current.pinned,
    }));
  }, [enabled]);

  const closeUnpinned = useCallback((event: ReactPointerEvent<SVGPathElement | HTMLElement>) => {
    const related = event.relatedTarget;
    if (related instanceof Node && rootRef.current?.contains(related)) return;
    setState((current) => current.pinned ? current : { ...current, openZone: null });
  }, []);

  const activateZone = useCallback((surface: Surface) => {
    if (!enabled) return;
    open(surface, true);
    emitJawAnalytics({ consent: analyticsConsent, event: "jaw_zone_click", zone: surface.zone });
  }, [analyticsConsent, enabled, open]);

  const onSurfaceKeyDown = useCallback((
    event: ReactKeyboardEvent<SVGPathElement>,
    surface: Surface,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activateZone(surface);
  }, [activateZone]);

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

  return (
    <div
      className={classNames(styles.zoneOverlay, !enabled && styles.zoneOverlayDisabled)}
      data-active-zone={visibleState.openZone ?? undefined}
      data-presentation={artworkVisible ? effectivePresentation : "hidden"}
      data-testid="jaw-zone-overlay"
      ref={rootRef}
      tabIndex={-1}
    >
      {artworkVisible ? (
        <div className={styles.zoneArtboard} data-testid="jaw-artboard">
          <svg
            aria-hidden={!enabled}
            className={styles.zoneArtwork}
            viewBox={`0 0 ${MASTER_WIDTH} ${MASTER_HEIGHT}`}
          >
            <defs>
              <linearGradient id="jaw-zone-fill" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#efd8a3" />
                <stop offset="1" stopColor="#d68f89" />
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
            {mapVisible ? LABELS.map((label) => {
              const width = LABEL_WIDTHS[label.zone];
              return (
                <g
                  className={styles.zoneMarker}
                  data-active={visibleState.openZone === label.zone}
                  data-zone-label={label.zone}
                  key={label.zone}
                  style={{ "--zone-index": label.revealIndex } as CSSProperties}
                >
                  <path
                    className={styles.zoneConnector}
                    d={label.connector}
                    data-testid={`jaw-connector-${label.zone}`}
                  />
                  <circle
                    className={styles.zoneAnchor}
                    cx={label.anchor[0]}
                    cy={label.anchor[1]}
                    r="6"
                  />
                  <g
                    className={styles.zoneLabel}
                    data-testid={`jaw-zone-label-${label.zone}`}
                    transform={`translate(${label.label[0]} ${label.label[1]})`}
                  >
                    <rect height="42" rx="21" width={width} x={-width / 2} y="-21" />
                    <text dominantBaseline="middle" textAnchor="middle" y="1">
                      {ZONES[label.zone].label}
                    </text>
                  </g>
                </g>
              );
            }) : null}
            {SURFACES.map((surface) => (
              <path
                aria-hidden={!enabled}
                aria-label={enabled ? ZONES[surface.zone].label : undefined}
                aria-pressed={enabled ? visibleState.openZone === surface.zone : undefined}
                className={styles.zoneHit}
                d={surface.path}
                data-testid={`jaw-hit-${surface.id}`}
                data-zone={surface.zone}
                key={`hit-${surface.id}`}
                onBlur={() => {
                  if (!state.pinned) setState((current) => ({ ...current, openZone: null }));
                }}
                onClick={() => activateZone(surface)}
                onFocus={() => {
                  if (skipRestoredFocusRef.current) {
                    skipRestoredFocusRef.current = false;
                    return;
                  }
                  open(surface, false);
                }}
                onKeyDown={(event) => onSurfaceKeyDown(event, surface)}
                onPointerEnter={() => open(surface, false)}
                onPointerLeave={closeUnpinned}
                ref={(element) => {
                  triggerRefs.current[surface.id] = element ?? undefined;
                }}
                role={enabled ? "button" : undefined}
                tabIndex={enabled ? 0 : -1}
              />
            ))}
          </svg>
        </div>
      ) : null}

      {enabled ? (
        <aside
          aria-label={activeZone?.label ?? "Výber zóny bolesti"}
          className={classNames(styles.guidanceRail, state.mode === "mobile" && styles.zonePanel)}
          data-problem-panel={state.mode}
          data-testid={activeZone ? "jaw-problem-panel" : "jaw-zone-guidance"}
          onPointerEnter={() => undefined}
          onPointerLeave={closeUnpinned}
          role={state.mode === "mobile" && activeZone ? "dialog" : "region"}
        >
          {activeZone ? (
            <>
              <div className={styles.cardTop}>
                <div>
                  <p className={styles.cardKicker}>Vyberte problém</p>
                  <h2>{activeZone.label}</h2>
                </div>
                {state.mode === "mobile" ? (
                  <button className={styles.closeButton} onClick={() => close(true)} type="button">
                    Zavrieť
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
                      {problem.patientLabel}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <p className={styles.cardKicker}>Zóny bolesti</p>
              <h2>Vyberte zvýraznenú oblasť</h2>
              <p className={styles.guidanceCopy}>Kliknite na miesto, kde problém cítite.</p>
              <nav aria-label="Iná situácia" className={styles.directEntries}>
                {directLinks}
              </nav>
            </>
          )}
        </aside>
      ) : null}

      <p aria-live="polite" className={styles.zoneStatus}>
        {visibleState.pinned && activeZone ? `${activeZone.label}: vyberte problém.` : ""}
      </p>
    </div>
  );
}
