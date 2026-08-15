"use client";
/* eslint-disable @next/next/no-img-element -- Canvas fallback must preserve raw sequence endpoint pixels. */

import { useEffect, useRef, useState } from "react";

import { jawSequenceManifests, type JawSequenceProfile } from "./jawSequenceManifest.generated";
import {
  createBrowserJawFrameDecoder,
  createJawSequenceLoader,
  type DecodedJawFrame,
  type JawSequenceLoader,
} from "./jawSequenceLoader";
import styles from "./jawExperience.module.css";

export type JawFrameSequenceProps = Readonly<{
  profile: JawSequenceProfile;
  targetFrame: number;
  direction: -1 | 0 | 1;
  reducedMotion: boolean;
  visible: boolean;
  onExactFrameDrawn: (index: number) => void;
  onPermanentFailure: () => void;
}>;

type SequenceMode = "fallback" | "loading" | "ready" | "reduced";

type Runtime = Readonly<{
  loader: JawSequenceLoader;
  requestDraw: () => void;
  syncVisible: () => void;
}>;

const dprCap: Readonly<Record<JawSequenceProfile, number>> = {
  desktop: 1.5,
  mobile: 1.25,
};

function clampFrame(index: number, count: number): number {
  if (!Number.isFinite(index)) return 1;
  return Math.max(1, Math.min(count, Math.round(index)));
}

function drawContained(
  context: CanvasRenderingContext2D,
  frame: DecodedJawFrame,
  canvas: HTMLCanvasElement,
  sourceWidth: number,
  sourceHeight: number,
): void {
  const scale = Math.min(canvas.width / sourceWidth, canvas.height / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const left = (canvas.width - width) / 2;
  const top = (canvas.height - height) / 2;

  // Do not clear first. If drawImage fails, already visible pixels remain.
  context.drawImage(frame.source, left, top, width, height);
}

export function JawFrameSequence({
  profile,
  targetFrame,
  direction,
  reducedMotion,
  visible,
  onExactFrameDrawn,
  onPermanentFailure,
}: JawFrameSequenceProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<Runtime | undefined>(undefined);
  const targetRef = useRef(targetFrame);
  const directionRef = useRef(direction);
  const visibleRef = useRef(visible);
  const exactCallbackRef = useRef(onExactFrameDrawn);
  const failureCallbackRef = useRef(onPermanentFailure);
  const [readyProfile, setReadyProfile] = useState<JawSequenceProfile | undefined>(undefined);
  const [failedProfile, setFailedProfile] = useState<JawSequenceProfile | undefined>(undefined);

  useEffect(() => {
    targetRef.current = targetFrame;
    directionRef.current = direction;
    visibleRef.current = visible;
    exactCallbackRef.current = onExactFrameDrawn;
    failureCallbackRef.current = onPermanentFailure;
  }, [direction, onExactFrameDrawn, onPermanentFailure, targetFrame, visible]);

  useEffect(() => {
    if (reducedMotion) return;

    const manifest = jawSequenceManifests[profile];
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const loader = createJawSequenceLoader({
      manifest,
      cacheLimit: profile === "desktop" ? 12 : 8,
      decode: createBrowserJawFrameDecoder(manifest),
    });
    let disposed = false;
    let pageVisible = document.visibilityState !== "hidden";
    let hasSuccessfulDraw = false;
    let failures = 0;
    let failedPermanently = false;
    let rafId: number | undefined;

    const isActive = () => visibleRef.current && pageVisible && !failedPermanently;
    const updateCanvasSize = (width: number, height: number) => {
      if (width <= 0 || height <= 0) return;
      const ratio = Math.min(window.devicePixelRatio || 1, dprCap[profile]);
      const backingWidth = Math.max(1, Math.round(width * ratio));
      const backingHeight = Math.max(1, Math.round(height * ratio));
      if (canvas.width === backingWidth && canvas.height === backingHeight) return;
      canvas.width = backingWidth;
      canvas.height = backingHeight;
      hasSuccessfulDraw = false;
      setReadyProfile((current) => (current === profile ? undefined : current));
    };

    const markPermanentFailure = () => {
      if (failedPermanently) return;
      failedPermanently = true;
      loader.setVisible(false);
      setFailedProfile(profile);
      failureCallbackRef.current();
    };

    const draw = () => {
      rafId = undefined;
      if (disposed || !isActive()) return;
      const target = clampFrame(targetRef.current, manifest.frameCount);
      const exact = loader.getExact(target);
      const frame = exact ?? loader.getNearest(target);
      if (!frame) return;
      const context = canvas.getContext("2d");
      const isCurrentWindow = Math.abs(frame.index - target) <= 1;
      if (!context) {
        if (isCurrentWindow) {
          failures += 1;
          if (failures >= 3) markPermanentFailure();
        }
        return;
      }

      try {
        drawContained(context, frame, canvas, manifest.width, manifest.height);
      } catch {
        if (isCurrentWindow) {
          failures += 1;
          if (failures >= 3) markPermanentFailure();
        }
        return;
      }

      failures = 0;
      if (!hasSuccessfulDraw) {
        hasSuccessfulDraw = true;
        setReadyProfile(profile);
      }
      if (exact && frame.index === target) exactCallbackRef.current(target);
    };

    const requestDraw = () => {
      if (disposed || !isActive() || rafId !== undefined) return;
      let ranSynchronously = false;
      const requestedId = window.requestAnimationFrame(() => {
        ranSynchronously = true;
        rafId = undefined;
        draw();
      });
      if (!ranSynchronously) rafId = requestedId;
    };

    const syncVisible = () => {
      loader.setVisible(isActive());
      if (isActive()) {
        loader.setTarget(clampFrame(targetRef.current, manifest.frameCount), directionRef.current);
        requestDraw();
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || disposed) return;
      updateCanvasSize(entry.contentRect.width, entry.contentRect.height);
      requestDraw();
    });
    resizeObserver.observe(stage);
    const initialRect = stage.getBoundingClientRect();
    updateCanvasSize(initialRect.width, initialRect.height);

    const unsubscribe = loader.subscribe(requestDraw);
    const onVisibilityChange = () => {
      pageVisible = document.visibilityState !== "hidden";
      syncVisible();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    runtimeRef.current = { loader, requestDraw, syncVisible };
    syncVisible();

    return () => {
      if (disposed) return;
      disposed = true;
      if (rafId !== undefined) window.cancelAnimationFrame(rafId);
      runtimeRef.current = undefined;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      unsubscribe();
      resizeObserver.disconnect();
      loader.dispose();
    };
  }, [profile, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const runtime = runtimeRef.current;
    if (!runtime) return;
    const manifest = jawSequenceManifests[profile];
    runtime.loader.setTarget(clampFrame(targetFrame, manifest.frameCount), direction);
    runtime.syncVisible();
    runtime.requestDraw();
  }, [direction, profile, reducedMotion, targetFrame, visible]);

  const manifest = jawSequenceManifests[profile];
  const renderedMode: SequenceMode = reducedMotion
    ? "reduced"
    : failedProfile === profile
      ? "fallback"
      : readyProfile === profile
        ? "ready"
        : "loading";
  const staticSource = renderedMode === "fallback" || renderedMode === "reduced"
    ? manifest.frames[manifest.endFrame - 1].url
    : manifest.frames[manifest.startFrame - 1].url;

  return (
    <div
      ref={stageRef}
      className={styles.sequenceStage}
      data-jaw-sequence-state={renderedMode}
    >
      <img
        className={styles.staticFrame}
        src={staticSource}
        alt=""
        aria-hidden="true"
        hidden={renderedMode === "ready"}
      />
      {!reducedMotion ? (
        <canvas
          ref={canvasRef}
          className={styles.sequenceCanvas}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
