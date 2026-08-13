"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";
import type { ClinicStoryMotionState } from "../clinicStoryMotion";
import { getJawZone, type JawZoneId } from "./jawContent";
import { JawDetailPanel } from "./JawDetailPanel";
import type { JawSceneController } from "./JawSceneController";
import type { JawHitId } from "./jawModelContract";
import {
  JawZoneOverlay,
  zoneIdForHit,
  type JawZoneOverlayHandle,
  type ProjectedAnchors,
} from "./JawZoneOverlay";
import styles from "./jawExperience.module.css";

export type JawExperienceProps = {
  profile: "desktop" | "mobile";
  prefersReducedMotion: boolean;
  onPermanentFallbackChange?: (permanent: boolean) => void;
};

export type JawExperienceHandle = {
  setMotion(state: ClinicStoryMotionState): void;
};

type LoadState = "poster" | "ready" | "fallback";

const SOURCE_URL =
  "https://sketchfab.com/3d-models/free-teeth-base-mesh-b66fde0dc3eb44b0908096aa51b96431";
const LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/";
const HIT_IDS: readonly JawHitId[] = [
  "front",
  "premolar.left",
  "premolar.right",
  "molar.left",
  "molar.right",
  "gum.upper",
  "gum.lower",
];

const RESTING_MOTION: ClinicStoryMotionState = {
  grow: 1,
  pan: 1,
  snap: 1,
  zoom: 1,
  blur: 1,
  jawOpacity: 0,
  jawOpen: 0,
  jawSeparation: 0,
  labelsOpacity: 0,
  interactive: false,
};

const FINAL_MOTION: ClinicStoryMotionState = {
  ...RESTING_MOTION,
  jawOpacity: 1,
  jawOpen: 1,
  jawSeparation: 1,
  labelsOpacity: 1,
  interactive: true,
};

function fallbackAnchors(
  profile: "desktop" | "mobile",
  width?: number,
  height?: number,
): ProjectedAnchors {
  const viewportWidth = Math.max(
    1,
    width ?? (profile === "mobile" ? 390 : 1200),
  );
  const viewportHeight = Math.max(
    1,
    height ?? (profile === "mobile" ? 700 : 760),
  );
  const centerX = viewportWidth * 0.5;
  const centerY = viewportHeight * (profile === "mobile" ? 0.36 : 0.48);
  const spread = viewportWidth * (profile === "mobile" ? 0.2 : 0.19);
  const arch = viewportHeight * 0.12;

  return {
    front: { x: centerX, y: centerY, visible: true },
    "premolar.left": {
      x: centerX - spread * 0.55,
      y: centerY + arch * 0.18,
      visible: true,
    },
    "premolar.right": {
      x: centerX + spread * 0.55,
      y: centerY + arch * 0.18,
      visible: true,
    },
    "molar.left": {
      x: centerX - spread,
      y: centerY + arch * 0.42,
      visible: true,
    },
    "molar.right": {
      x: centerX + spread,
      y: centerY + arch * 0.42,
      visible: true,
    },
    "gum.upper": {
      x: centerX,
      y: centerY - arch,
      visible: true,
    },
    "gum.lower": {
      x: centerX,
      y: centerY + arch,
      visible: true,
    },
  };
}

function setMotionVariables(
  host: HTMLDivElement | null,
  state: ClinicStoryMotionState,
): void {
  if (!host) return;
  host.style.setProperty("--jaw-opacity", String(state.jawOpacity));
  host.style.setProperty("--labels-opacity", String(state.labelsOpacity));
  host.style.setProperty(
    "--heading-opacity",
    String(state.jawOpacity * (1 - state.labelsOpacity * 0.45)),
  );
}

function setVisualOpacities(
  poster: HTMLImageElement | null,
  canvas: HTMLCanvasElement | null,
  jawOpacity: number,
  frameReady: boolean,
  fallback = false,
): void {
  const opacity = Math.min(1, Math.max(0, jawOpacity));
  if (poster) poster.style.opacity = String(fallback ? 1 : frameReady ? 0 : opacity);
  if (canvas) canvas.style.opacity = String(fallback ? 0 : frameReady ? opacity : 0);
}

function creditOpacity(state: ClinicStoryMotionState): number {
  const jawOpacity = Math.min(1, Math.max(0, state.jawOpacity));
  const labelsOpacity = Math.min(1, Math.max(0, state.labelsOpacity));
  return jawOpacity * labelsOpacity;
}

export const JawExperience = forwardRef<
  JawExperienceHandle,
  JawExperienceProps
>(function JawExperience(
  { profile, prefersReducedMotion, onPermanentFallbackChange },
  ref,
): JSX.Element {
  const hostRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const creditRef = useRef<HTMLParagraphElement>(null);
  const overlayRef = useRef<JawZoneOverlayHandle>(null);
  const controllerRef = useRef<JawSceneController | null>(null);
  const motionRef = useRef<ClinicStoryMotionState>(RESTING_MOTION);
  const fallbackModeRef = useRef(prefersReducedMotion);
  const contextFallbackRef = useRef(false);
  const frameReadyRef = useRef(false);
  const interactiveRef = useRef(prefersReducedMotion);
  const controlsEnabledRef = useRef(prefersReducedMotion);
  const selectedZoneRef = useRef<JawZoneId | null>(null);
  const highlightedZoneRef = useRef<JawZoneId | null>(null);
  const selectedTriggerRef = useRef<HTMLButtonElement | null>(null);
  const intersectingRef = useRef(false);
  const permanentFallbackCallbackRef = useRef(onPermanentFallbackChange);
  permanentFallbackCallbackRef.current = onPermanentFallbackChange;
  const [loadState, setLoadState] = useState<LoadState>(
    prefersReducedMotion ? "fallback" : "poster",
  );
  const [interactive, setInteractive] = useState(prefersReducedMotion);
  const [selectedZoneId, setSelectedZoneId] = useState<JawZoneId | null>(null);
  const [activeProblemId, setActiveProblemId] = useState<string | null>(null);
  const [activeSolutionId, setActiveSolutionId] = useState<string | null>(null);
  const [panelAnnouncement, setPanelAnnouncement] = useState("");
  const initialAnchors = useMemo(() => fallbackAnchors(profile), [profile]);

  const focusSelectedTrigger = useCallback((): void => {
    window.setTimeout(() => selectedTriggerRef.current?.focus(), 0);
  }, []);

  const closePanel = useCallback(
    (restoreFocus = true): void => {
      if (selectedZoneRef.current) setPanelAnnouncement("Detail zatvorený.");
      selectedZoneRef.current = null;
      setSelectedZoneId(null);
      setActiveProblemId(null);
      setActiveSolutionId(null);
      controllerRef.current?.setPanelOpen(false);
      controllerRef.current?.setActiveZone(null);
      if (restoreFocus) focusSelectedTrigger();
    },
    [focusSelectedTrigger],
  );

  const renderAndProject = useCallback((): void => {
    const controller = controllerRef.current;
    if (
      !controller || !intersectingRef.current
    ) {
      return;
    }
    controller.render();
    const projected = Object.fromEntries(
      HIT_IDS.map((hitId) => [hitId, controller.projectAnchor(hitId)]),
    ) as ProjectedAnchors;
    overlayRef.current?.setProjectedAnchors(projected);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      setMotion(state): void {
        if (prefersReducedMotion || fallbackModeRef.current) return;
        motionRef.current = state;
        if (contextFallbackRef.current) return;
        setMotionVariables(hostRef.current, state);
        setVisualOpacities(
          posterRef.current,
          canvasRef.current,
          state.jawOpacity,
          frameReadyRef.current,
        );
        if (creditRef.current) {
          creditRef.current.style.opacity = String(creditOpacity(state));
        }
        controllerRef.current?.setMotion(state);

        if (interactiveRef.current === state.interactive) return;
        interactiveRef.current = state.interactive;
        controlsEnabledRef.current = state.interactive;
        setInteractive(state.interactive);
        if (!state.interactive && selectedZoneRef.current) closePanel();
      },
    }),
    [closePanel, prefersReducedMotion],
  );

  useEffect(() => {
    if (!prefersReducedMotion && loadState !== "fallback") return;
    const host = hostRef.current;
    if (!host) return;
    const setFallbackAnchors = (width: number, height: number): void => {
      overlayRef.current?.setProjectedAnchors(
        fallbackAnchors(profile, width, height),
      );
    };
    const rect = host.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setFallbackAnchors(rect.width, rect.height);
    }
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setFallbackAnchors(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, [loadState, prefersReducedMotion, profile]);

  useEffect(() => {
    let cancelled = false;
    let loadFailed = false;
    let createdController: JawSceneController | null = null;
    let loadStarted = false;
    let contextSuspended = false;
    let sceneGeneration = 0;
    const host = hostRef.current;
    const canvas = canvasRef.current;

    const takeController = (): JawSceneController | null => {
      const controller = createdController ?? controllerRef.current;
      createdController = null;
      if (controllerRef.current === controller) controllerRef.current = null;
      return controller;
    };

    const disposeController = (): void => {
      takeController()?.dispose();
    };

    disposeController();
    frameReadyRef.current = false;
    intersectingRef.current = false;
    permanentFallbackCallbackRef.current?.(false);

    if (prefersReducedMotion) {
      fallbackModeRef.current = true;
      motionRef.current = FINAL_MOTION;
      interactiveRef.current = true;
      controlsEnabledRef.current = true;
      setInteractive(true);
      setLoadState("fallback");
      setMotionVariables(host, FINAL_MOTION);
      setVisualOpacities(posterRef.current, canvas, 1, false, true);
      overlayRef.current?.setProjectedAnchors(fallbackAnchors(profile));
      return;
    }

    fallbackModeRef.current = false;
    contextFallbackRef.current = false;
    interactiveRef.current = motionRef.current.interactive;
    controlsEnabledRef.current = motionRef.current.interactive;
    setInteractive(motionRef.current.interactive);
    setLoadState("poster");
    setMotionVariables(host, motionRef.current);
    setVisualOpacities(
      posterRef.current,
      canvas,
      motionRef.current.jawOpacity,
      false,
    );
    if (!host || !canvas) return;

    const failToFallback = (): void => {
      if (cancelled || loadFailed) return;
      loadFailed = true;
      disposeController();
      fallbackModeRef.current = true;
      motionRef.current = FINAL_MOTION;
      controlsEnabledRef.current = true;
      setInteractive(true);
      setLoadState("fallback");
      setMotionVariables(host, FINAL_MOTION);
      setVisualOpacities(posterRef.current, canvas, 1, false, true);
      overlayRef.current?.setProjectedAnchors(fallbackAnchors(profile));
      permanentFallbackCallbackRef.current?.(true);
    };

    let startController = (): void => {};

    const suspendForContextLoss = (): void => {
      if (cancelled || loadFailed || contextSuspended) return;
      contextSuspended = true;
      contextFallbackRef.current = true;
      sceneGeneration += 1;
      loadStarted = false;
      frameReadyRef.current = false;
      controlsEnabledRef.current = true;
      setInteractive(true);
      setLoadState("fallback");
      setMotionVariables(host, FINAL_MOTION);
      setVisualOpacities(posterRef.current, canvas, 1, false, true);
      overlayRef.current?.setProjectedAnchors(fallbackAnchors(profile));
    };

    const restoreAfterContextLoss = (): void => {
      if (cancelled || loadFailed || !contextSuspended) return;
      contextSuspended = false;
      contextFallbackRef.current = false;
      disposeController();
      frameReadyRef.current = false;
      loadStarted = false;
      controlsEnabledRef.current = motionRef.current.interactive;
      setInteractive(motionRef.current.interactive);
      startController();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry || cancelled) return;
        intersectingRef.current = entry.isIntersecting;
        if (!entry.isIntersecting) return;
        if (createdController) {
          renderAndProject();
          return;
        }
        startController();
      },
      { rootMargin: "150% 0px" },
    );

    startController = (): void => {
      if (
        cancelled ||
        loadFailed ||
        contextSuspended ||
        loadStarted ||
        !intersectingRef.current ||
        document.visibilityState === "hidden"
      ) {
        return;
      }
      loadStarted = true;
      const generation = sceneGeneration;

      void (async () => {
        try {
          const { JawSceneController } = await import("./JawSceneController");
          if (cancelled || generation !== sceneGeneration) return;
          const controller = await JawSceneController.create(canvas, {
            profile,
            modelUrl: `/media/jaw/jaw-${profile}.glb`,
            onFirstFrame: () => {
              if (cancelled || generation !== sceneGeneration) return;
              frameReadyRef.current = true;
              setMotionVariables(host, motionRef.current);
              setVisualOpacities(
                posterRef.current,
                canvas,
                motionRef.current.jawOpacity,
                true,
              );
              setLoadState("ready");
            },
            onFatalError: failToFallback,
            onContextLost: suspendForContextLoss,
            onContextRestored: restoreAfterContextLoss,
            requestRender: renderAndProject,
          });
          if (
            cancelled ||
            loadFailed ||
            contextSuspended ||
            generation !== sceneGeneration
          ) {
            controller.dispose();
            return;
          }
          createdController = controller;
          controllerRef.current = controller;
          controller.setMotion(motionRef.current);
          controller.setPanelOpen(Boolean(selectedZoneRef.current));
          controller.setActiveZone(
            highlightedZoneRef.current ?? selectedZoneRef.current,
          );
          renderAndProject();
        } catch {
          if (generation === sceneGeneration) failToFallback();
        }
      })();
    };
    observer.observe(host);

    const onVisibilityChange = (): void => {
      if (document.visibilityState !== "hidden") startController();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      disposeController();
    };
  }, [prefersReducedMotion, profile, renderAndProject]);

  const selectZone = useCallback(
    (zoneId: JawZoneId, trigger: HTMLButtonElement): void => {
      if (!controlsEnabledRef.current) return;
      selectedZoneRef.current = zoneId;
      selectedTriggerRef.current = trigger;
      setPanelAnnouncement(`Otvorený detail: ${getJawZone(zoneId)?.label ?? ""}`);
      setSelectedZoneId(zoneId);
      setActiveProblemId(null);
      setActiveSolutionId(null);
      controllerRef.current?.setActiveZone(zoneId);
      controllerRef.current?.setPanelOpen(true);
    },
    [],
  );

  const handleZoneHighlight = useCallback((zoneId: JawZoneId | null): void => {
    highlightedZoneRef.current = zoneId;
    controllerRef.current?.setActiveZone(zoneId ?? selectedZoneRef.current);
  }, []);

  const handleCanvasPointer = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>): void => {
      if (!controlsEnabledRef.current) return;
      const hitId = controllerRef.current?.hitTest(
        event.clientX,
        event.clientY,
      );
      if (!hitId) return;
      const zoneId = zoneIdForHit(hitId);
      const trigger = hostRef.current?.querySelector<HTMLButtonElement>(
        `[data-zone-id="${zoneId}"]`,
      );
      if (trigger) selectZone(zoneId, trigger);
    },
    [selectZone],
  );

  const selectedZone = selectedZoneId ? getJawZone(selectedZoneId) : undefined;
  const fallbackVisible = prefersReducedMotion || loadState === "fallback";
  const controlsInteractive = fallbackVisible || interactive;
  const sceneInteractive = !fallbackVisible && interactive;
  controlsEnabledRef.current = controlsInteractive;

  return (
    <div
      ref={hostRef}
      className={styles.experience}
      data-load-state={loadState}
      data-reduced-motion={prefersReducedMotion ? "true" : "false"}
      style={{ pointerEvents: "none" }}
    >
      <div
        className={styles.visualStage}
        style={{ pointerEvents: sceneInteractive ? "auto" : "none" }}
      >
        {/* The authored WebP is a continuity layer whose pixels must align with the canvas. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={posterRef}
          className={styles.poster}
          data-faded={loadState === "ready" ? "true" : "false"}
          style={{
            opacity: fallbackVisible
              ? 1
              : loadState === "ready"
                ? 0
                : motionRef.current.jawOpacity,
          }}
          src={
            fallbackVisible
              ? "/media/jaw/jaw-fallback.webp"
              : "/media/jaw/jaw-poster.webp"
          }
          alt={
            fallbackVisible
              ? "Statický model chrupu s vyznačenými oblasťami"
              : "Model chrupu sa načítava"
          }
        />
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          data-testid="jaw-canvas"
          data-frame-ready={loadState === "ready" ? "true" : "false"}
          style={{
            opacity:
              !fallbackVisible && loadState === "ready"
                ? motionRef.current.jawOpacity
                : 0,
          }}
          aria-hidden="true"
          onPointerDown={handleCanvasPointer}
        />
      </div>

      <h2 className={styles.heading}>Kde vás to trápi?</h2>

      <JawZoneOverlay
        ref={overlayRef}
        projectedAnchors={initialAnchors}
        profile={profile}
        interactive={controlsInteractive}
        onZoneSelect={selectZone}
        onZoneHighlight={handleZoneHighlight}
      />

      <p
        ref={creditRef}
        className={styles.modelCredit}
        data-testid="jaw-model-credit"
        style={{
          opacity: fallbackVisible ? 1 : creditOpacity(motionRef.current),
          pointerEvents: controlsInteractive ? "auto" : "none",
        }}
      >
        3D model: {" "}
        <a
          href={SOURCE_URL}
          target="_blank"
          rel="noreferrer"
          tabIndex={controlsInteractive ? 0 : -1}
        >
          Free Teeth Base Mesh
        </a>{" "}
        — ferrumiron6, upravené, {" "}
        <a
          href={LICENSE_URL}
          target="_blank"
          rel="noreferrer"
          tabIndex={controlsInteractive ? 0 : -1}
        >
          CC BY 4.0
        </a>
        .
      </p>

      <p
        className={styles.liveRegion}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {panelAnnouncement}
      </p>

      {selectedZone ? (
        <JawDetailPanel
          zone={selectedZone}
          portalContainer={hostRef.current}
          activeProblemId={activeProblemId}
          activeSolutionId={activeSolutionId}
          onProblemSelect={(problemId) => {
            setActiveProblemId(problemId);
            setActiveSolutionId(null);
            const problem = selectedZone?.problems.find(
              (candidate) => candidate.id === problemId,
            );
            setPanelAnnouncement(`Vybraný problém: ${problem?.label ?? ""}`);
          }}
          onSolutionSelect={(solutionId) => {
            setActiveSolutionId(solutionId);
            const problem = selectedZone?.problems.find(
              (candidate) => candidate.id === activeProblemId,
            );
            const solution = problem?.solutions.find(
              (candidate) => candidate.id === solutionId,
            );
            setPanelAnnouncement(`Vybrané riešenie: ${solution?.label ?? ""}`);
          }}
          onBack={() => {
            if (activeSolutionId) {
              setActiveSolutionId(null);
              const problem = selectedZone?.problems.find(
                (candidate) => candidate.id === activeProblemId,
              );
              setPanelAnnouncement(`Vybraný problém: ${problem?.label ?? ""}`);
            } else {
              setActiveProblemId(null);
              setPanelAnnouncement(`Otvorený detail: ${selectedZone.label}`);
            }
          }}
          onClose={() => closePanel()}
        />
      ) : null}
    </div>
  );
});
