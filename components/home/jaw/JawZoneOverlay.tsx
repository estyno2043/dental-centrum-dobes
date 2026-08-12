"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type JSX,
} from "react";
import { jawZones, type JawZoneId } from "./jawContent";
import type { JawHitId } from "./jawModelContract";
import styles from "./jawExperience.module.css";

export type Point = Readonly<{ x: number; y: number }>;
export type ProjectedAnchor = Point & Readonly<{ visible: boolean }>;
export type ProjectedAnchors = Readonly<Record<JawHitId, ProjectedAnchor>>;

export type JawZoneOverlayProps = {
  projectedAnchors: ProjectedAnchors;
  profile: "desktop" | "mobile";
  interactive: boolean;
  onZoneSelect(zoneId: JawZoneId, trigger: HTMLButtonElement): void;
  onZoneHighlight(zoneId: JawZoneId | null): void;
};

export type JawZoneOverlayHandle = {
  setProjectedAnchors(anchors: ProjectedAnchors): void;
};

const LEADERS: readonly Readonly<{ id: JawHitId; zoneId: JawZoneId }>[] = [
  { id: "front", zoneId: "front" },
  { id: "premolar.left", zoneId: "premolar" },
  { id: "premolar.right", zoneId: "premolar" },
  { id: "molar.left", zoneId: "molar" },
  { id: "molar.right", zoneId: "molar" },
  { id: "gum.upper", zoneId: "gum" },
  { id: "gum.lower", zoneId: "gum" },
];

export function cardEdgeTowardTarget(rect: DOMRect, target: Point): Point {
  const center = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  const scale =
    1 /
    Math.max(
      Math.abs(dx) / Math.max(1, rect.width / 2),
      Math.abs(dy) / Math.max(1, rect.height / 2),
      1,
    );
  return { x: center.x + dx * scale, y: center.y + dy * scale };
}

export function zoneIdForHit(hitId: JawHitId): JawZoneId {
  if (hitId.startsWith("premolar.")) return "premolar";
  if (hitId.startsWith("molar.")) return "molar";
  if (hitId.startsWith("gum.")) return "gum";
  return "front";
}

export const JawZoneOverlay = forwardRef<
  JawZoneOverlayHandle,
  JawZoneOverlayProps
>(function JawZoneOverlay(
  {
    projectedAnchors,
    profile,
    interactive,
    onZoneSelect,
    onZoneHighlight,
  },
  ref,
): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const anchorsRef = useRef(projectedAnchors);
  const buttonRefs = useRef(new Map<JawZoneId, HTMLButtonElement>());
  const lineRefs = useRef(new Map<JawHitId, SVGLineElement>());

  const drawLeaders = useCallback((anchors: ProjectedAnchors): void => {
    anchorsRef.current = anchors;
    const rootRect = rootRef.current?.getBoundingClientRect();
    if (!rootRect) return;

    for (const leader of LEADERS) {
      const line = lineRefs.current.get(leader.id);
      const button = buttonRefs.current.get(leader.zoneId);
      const target = anchors[leader.id];
      if (!line || !button) continue;

      const buttonRect = button.getBoundingClientRect();
      const localRect = new DOMRect(
        buttonRect.left - rootRect.left,
        buttonRect.top - rootRect.top,
        buttonRect.width,
        buttonRect.height,
      );
      const start = cardEdgeTowardTarget(localRect, target);
      line.setAttribute("x1", String(start.x));
      line.setAttribute("y1", String(start.y));
      line.setAttribute("x2", String(target.x));
      line.setAttribute("y2", String(target.y));
      line.dataset.visible = String(target.visible);
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      setProjectedAnchors: drawLeaders,
    }),
    [drawLeaders],
  );

  useLayoutEffect(() => {
    drawLeaders(projectedAnchors);
  }, [drawLeaders, projectedAnchors, profile]);

  return (
    <div
      ref={rootRef}
      className={styles.zoneOverlay}
      data-profile={profile}
      data-testid="jaw-zone-overlay"
      onFocusCapture={(event) => {
        event.currentTarget.style.opacity = "1";
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          event.currentTarget.style.removeProperty("opacity");
        }
      }}
    >
      <svg className={styles.leaders} aria-hidden="true">
        {LEADERS.map((leader) => (
          <line
            key={leader.id}
            ref={(node) => {
              if (node) lineRefs.current.set(leader.id, node);
              else lineRefs.current.delete(leader.id);
            }}
            className={styles.leader}
            data-testid={`jaw-leader-${leader.id}`}
            data-visible="false"
          />
        ))}
      </svg>

      <div
        className={styles.zoneControls}
        role="group"
        aria-label="Vyberte oblasť, ktorá vás trápi"
      >
        {jawZones.map((zone) => (
          <button
            key={zone.id}
            ref={(node) => {
              if (node) buttonRefs.current.set(zone.id, node);
              else buttonRefs.current.delete(zone.id);
            }}
            type="button"
            className={styles.zoneButton}
            data-zone-id={zone.id}
            aria-disabled={!interactive}
            tabIndex={interactive ? 0 : -1}
            style={{ pointerEvents: interactive ? "auto" : "none" }}
            onClick={(event) => {
              if (interactive) onZoneSelect(zone.id, event.currentTarget);
            }}
            onFocus={() => {
              if (interactive) onZoneHighlight(zone.id);
            }}
            onBlur={() => onZoneHighlight(null)}
            onPointerEnter={() => {
              if (interactive) onZoneHighlight(zone.id);
            }}
            onPointerLeave={() => onZoneHighlight(null)}
          >
            {zone.label}
          </button>
        ))}
      </div>
    </div>
  );
});
