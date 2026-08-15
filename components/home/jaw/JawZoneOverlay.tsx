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

type Point = readonly [number, number];

type Surface = Readonly<{
  id: JawSurfaceId;
  zone: InteractiveZoneId;
  points: readonly Point[];
  revealIndex: number;
}>;

type OverlayState = Readonly<{
  openZone: InteractiveZoneId | null;
  pinned: boolean;
  mode: "desktop" | "mobile";
}>;

export type JawZoneOverlayProps = Readonly<{
  analyticsConsent: boolean;
  interactive: boolean;
  exactEndDrawn: boolean;
  reducedMotion: boolean;
  revealStartedAt?: number;
  visible: boolean;
}>;

const MASTER_WIDTH = 1920;
const MASTER_HEIGHT = 1080;
const REVEAL_DELAY_MS = 540;
const REVEAL_TRANSITION_MS = 180;
const ACTIVATION_DELAY_MS = REVEAL_DELAY_MS + REVEAL_TRANSITION_MS;

const SURFACES: readonly Surface[] = [
  {
    id: "front",
    zone: "front",
    points: [[790 / MASTER_WIDTH, 350 / MASTER_HEIGHT], [1130 / MASTER_WIDTH, 350 / MASTER_HEIGHT], [1150 / MASTER_WIDTH, 710 / MASTER_HEIGHT], [770 / MASTER_WIDTH, 710 / MASTER_HEIGHT]],
    revealIndex: 0,
  },
  {
    id: "premolar-left",
    zone: "premolar",
    points: [[690 / MASTER_WIDTH, 365 / MASTER_HEIGHT], [805 / MASTER_WIDTH, 350 / MASTER_HEIGHT], [780 / MASTER_WIDTH, 720 / MASTER_HEIGHT], [660 / MASTER_WIDTH, 740 / MASTER_HEIGHT]],
    revealIndex: 1,
  },
  {
    id: "premolar-right",
    zone: "premolar",
    points: [[1115 / MASTER_WIDTH, 350 / MASTER_HEIGHT], [1230 / MASTER_WIDTH, 365 / MASTER_HEIGHT], [1260 / MASTER_WIDTH, 740 / MASTER_HEIGHT], [1140 / MASTER_WIDTH, 720 / MASTER_HEIGHT]],
    revealIndex: 1,
  },
  {
    id: "molar-left",
    zone: "molar",
    points: [[620 / MASTER_WIDTH, 385 / MASTER_HEIGHT], [700 / MASTER_WIDTH, 365 / MASTER_HEIGHT], [660 / MASTER_WIDTH, 740 / MASTER_HEIGHT], [605 / MASTER_WIDTH, 715 / MASTER_HEIGHT]],
    revealIndex: 2,
  },
  {
    id: "molar-right",
    zone: "molar",
    points: [[1220 / MASTER_WIDTH, 365 / MASTER_HEIGHT], [1300 / MASTER_WIDTH, 385 / MASTER_HEIGHT], [1315 / MASTER_WIDTH, 715 / MASTER_HEIGHT], [1260 / MASTER_WIDTH, 740 / MASTER_HEIGHT]],
    revealIndex: 2,
  },
  {
    id: "gum-upper",
    zone: "gum",
    points: [[620 / MASTER_WIDTH, 300 / MASTER_HEIGHT], [1300 / MASTER_WIDTH, 300 / MASTER_HEIGHT], [1270 / MASTER_WIDTH, 405 / MASTER_HEIGHT], [650 / MASTER_WIDTH, 405 / MASTER_HEIGHT]],
    revealIndex: 3,
  },
  {
    id: "gum-lower",
    zone: "gum",
    points: [[620 / MASTER_WIDTH, 675 / MASTER_HEIGHT], [1300 / MASTER_WIDTH, 675 / MASTER_HEIGHT], [1260 / MASTER_WIDTH, 800 / MASTER_HEIGHT], [660 / MASTER_WIDTH, 800 / MASTER_HEIGHT]],
    revealIndex: 3,
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

function pointsToString(points: readonly Point[]): string {
  return points
    .map(([x, y]) => `${Math.round(x * MASTER_WIDTH)},${Math.round(y * MASTER_HEIGHT)}`)
    .join(" ");
}

function boxFor(points: readonly Point[]): CSSProperties {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const width = Math.max(...xs) - left;
  const height = Math.max(...ys) - top;

  return {
    left: `${left * 100}%`,
    top: `${top * 100}%`,
    width: `${width * 100}%`,
    height: `${height * 100}%`,
  };
}

function zoneHref(zone: JawZone, problemId: string): string {
  const problem = zone.problems.find((candidate) => candidate.id === problemId);
  return problem ? `${zone.route}?problem=${encodeURIComponent(problem.id)}` : zone.route;
}

function classNames(...values: Array<string | false | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function JawZoneOverlay({
  analyticsConsent,
  interactive,
  exactEndDrawn,
  reducedMotion,
  revealStartedAt,
  visible,
}: JawZoneOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const triggerRefs = useRef<Partial<Record<JawSurfaceId, HTMLButtonElement>>>({});
  const activeSurfaceRef = useRef<JawSurfaceId | null>(null);
  const skipRestoredFocusRef = useRef(false);
  const closeTimeoutRef = useRef<number | undefined>(undefined);
  const [revealSignal, setRevealSignal] = useState(() => ({
    startedAt: revealStartedAt,
    complete: revealStartedAt === undefined,
  }));
  const [state, setState] = useState<OverlayState>(() => ({
    openZone: null,
    pinned: false,
    mode: getMode(),
  }));
  const gateReady = visible && interactive && exactEndDrawn;

  const revealComplete = reducedMotion || revealStartedAt === undefined
    || (revealSignal.startedAt === revealStartedAt && revealSignal.complete);
  const enabled = gateReady && revealComplete;
  const visibleState = gateReady ? state : { ...state, openZone: null, pinned: false };
  const activeZone = visibleState.openZone ? ZONES[visibleState.openZone] : undefined;

  const clearScheduledClose = useCallback(() => {
    if (closeTimeoutRef.current !== undefined) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = undefined;
    }
  }, []);

  const focusTrigger = useCallback((surfaceId: JawSurfaceId | null) => {
    triggerRefs.current[surfaceId ?? "front"]?.focus();
  }, []);

  const close = useCallback(
    (restoreFocus: boolean) => {
      clearScheduledClose();
      const surfaceId = activeSurfaceRef.current;
      activeSurfaceRef.current = null;
      setState((current) => ({ ...current, openZone: null, pinned: false }));
      if (restoreFocus) {
        skipRestoredFocusRef.current = true;
        focusTrigger(surfaceId);
      }
    },
    [clearScheduledClose, focusTrigger],
  );

  useEffect(() => {
    if (!gateReady) {
      const focusedInside = rootRef.current?.contains(document.activeElement) ?? false;
      clearScheduledClose();
      activeSurfaceRef.current = null;
      if (focusedInside) headingRef.current?.focus();
      const timeout = window.setTimeout(() => {
        setState((current) => ({ ...current, openZone: null, pinned: false }));
      }, 0);
      return () => window.clearTimeout(timeout);
    }
  }, [clearScheduledClose, gateReady]);

  useEffect(() => {
    if (!gateReady || reducedMotion || revealStartedAt === undefined) return;

    const remaining = Math.max(0, ACTIVATION_DELAY_MS - (Date.now() - revealStartedAt));
    const timeout = window.setTimeout(
      () => setRevealSignal({ startedAt: revealStartedAt, complete: true }),
      remaining,
    );
    return () => window.clearTimeout(timeout);
  }, [gateReady, reducedMotion, revealStartedAt]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const onChange = (event: MediaQueryListEvent) => {
      const nextMode: OverlayState["mode"] = event.matches ? "mobile" : "desktop";
      const focusedInside = rootRef.current?.contains(document.activeElement) ?? false;
      activeSurfaceRef.current = null;
      setState((current) => ({ ...current, mode: nextMode, openZone: null, pinned: false }));
      if (focusedInside) headingRef.current?.focus();
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => () => clearScheduledClose(), [clearScheduledClose]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && state.pinned) close(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close, state.pinned]);

  const open = useCallback((surface: Surface, pin: boolean) => {
    if (!enabled) return;
    clearScheduledClose();
    activeSurfaceRef.current = surface.id;
    setState((current) => ({ ...current, openZone: surface.zone, pinned: pin || current.pinned }));
  }, [clearScheduledClose, enabled]);

  const scheduleUnpinnedClose = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const related = event.relatedTarget;
    if (related instanceof Node && rootRef.current?.contains(related)) return;
    clearScheduledClose();
    setState((current) => current.pinned ? current : { ...current, openZone: null });
  }, [clearScheduledClose]);

  const onZoneClick = useCallback((surface: Surface) => {
    if (!enabled) return;
    open(surface, true);
    emitJawAnalytics({ consent: analyticsConsent, event: "jaw_zone_click", zone: surface.zone });
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
      aria-disabled={!enabled}
      className={classNames(styles.directEntry, !enabled && styles.directEntryDisabled)}
      href={zone.route}
      key={zone.id}
      onClick={(event) => onDirectClick(zone, event)}
      tabIndex={enabled ? 0 : -1}
    >
      {zone.label}
    </a>
  )), [enabled, onDirectClick]);

  const card = activeZone ? (
    <section
      aria-label={activeZone.label}
      className={classNames(styles.zoneCard, visibleState.mode === "mobile" && styles.zonePanel)}
      onPointerEnter={clearScheduledClose}
      onPointerLeave={scheduleUnpinnedClose}
      role={visibleState.mode === "mobile" ? "dialog" : "region"}
    >
      <div className={styles.cardTop}>
        <p className={styles.cardKicker}>Vyberte problém</p>
        <h3>{activeZone.label}</h3>
        {visibleState.mode === "mobile" ? (
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
    </section>
  ) : null;

  return (
    <div
      className={classNames(styles.zoneOverlay, !enabled && styles.zoneOverlayDisabled)}
      ref={rootRef}
    >
      <h2 className={styles.zoneHeading} ref={headingRef} tabIndex={-1}>
        Kde vás to trápi?
      </h2>
      <p className={styles.zonePrompt}>Vyberte oblasť, ktorá vás trápi.</p>
      <div className={styles.zoneArtboard} data-testid="jaw-artboard">
        <svg aria-hidden="true" className={styles.zoneArtwork} viewBox={`0 0 ${MASTER_WIDTH} ${MASTER_HEIGHT}`}>
          {SURFACES.map((surface) => (
            <polygon
              className={classNames(
                styles.zoneSurface,
                visibleState.openZone === surface.zone && styles.zoneSurfaceSelected,
              )}
              data-zone={surface.zone}
              data-testid="jaw-hit-surface"
              key={surface.id}
              points={pointsToString(surface.points)}
              style={{ "--zone-index": surface.revealIndex } as CSSProperties}
            />
          ))}
        </svg>
        {SURFACES.map((surface) => (
          <button
            aria-disabled={!enabled}
            aria-pressed={visibleState.openZone === surface.zone}
            className={classNames(styles.zoneControl, !enabled && styles.zoneControlDisabled)}
            data-testid={`jaw-hit-${surface.id}`}
            data-zone={surface.zone}
            disabled={!enabled}
            key={surface.id}
            onBlur={() => {
              if (!state.pinned) setState((current) => ({ ...current, openZone: null }));
            }}
            onClick={() => onZoneClick(surface)}
            onFocus={() => {
              if (skipRestoredFocusRef.current) {
                skipRestoredFocusRef.current = false;
                return;
              }
              open(surface, false);
            }}
            onPointerEnter={() => open(surface, false)}
            onPointerLeave={scheduleUnpinnedClose}
            ref={(element) => {
              triggerRefs.current[surface.id] = element ?? undefined;
            }}
            style={{ ...boxFor(surface.points), "--zone-index": surface.revealIndex } as CSSProperties}
            tabIndex={enabled ? 0 : -1}
            type="button"
          >
            <span>{ZONES[surface.zone].label}</span>
          </button>
        ))}
      </div>
      <div className={styles.directEntries}>{directLinks}</div>
      {card}
      <p aria-live="polite" className={styles.zoneStatus}>
        {visibleState.pinned && activeZone ? `${activeZone.label}: vyberte problém.` : ""}
      </p>
    </div>
  );
}
