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
  sync: () => void;
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

type AnimatedJawFrameSequenceProps = Omit<JawFrameSequenceProps, "reducedMotion">;

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function StaticJawFrame({ profile, mode }: Readonly<{ profile: JawSequenceProfile; mode: SequenceMode }>) {
  const manifest = jawSequenceManifests[profile];
  const source = mode === "fallback" || mode === "reduced"
    ? manifest.frames[manifest.endFrame - 1].url
    : manifest.frames[manifest.startFrame - 1].url;

  return (
    <img
      className={styles.staticFrame}
      src={source}
      alt=""
      aria-hidden="true"
      hidden={mode === "ready"}
    />
  );
}

function AnimatedJawFrameSequence({
  profile,
  targetFrame,
  direction,
  visible,
  onExactFrameDrawn,
  onPermanentFailure,
}: AnimatedJawFrameSequenceProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<Runtime | undefined>(undefined);
  const targetRef = useRef(targetFrame);
  const directionRef = useRef(direction);
  const visibleRef = useRef(visible);
  const exactCallbackRef = useRef(onExactFrameDrawn);
  const failureCallbackRef = useRef(onPermanentFailure);
  const lastExactFrameRef = useRef<number | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    targetRef.current = targetFrame;
    directionRef.current = direction;
    visibleRef.current = visible;
    exactCallbackRef.current = onExactFrameDrawn;
    failureCallbackRef.current = onPermanentFailure;
  }, [direction, onExactFrameDrawn, onPermanentFailure, targetFrame, visible]);

  useEffect(() => {
    const manifest = jawSequenceManifests[profile];
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    let disposed = false;
    let pageVisible = document.visibilityState !== "hidden";
    let hasSuccessfulDraw = false;
    let failures = 0;
    let failedPermanently = false;
    let rafId: number | undefined;
    const indexByUrl = new Map<string, number>(manifest.frames.map((frame) => [frame.url, frame.index]));
    const loaderRef = { current: undefined as JawSequenceLoader | undefined };

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
      setReady(false);
    };

    const markPermanentFailure = () => {
      if (failedPermanently) return;
      failedPermanently = true;
      loaderRef.current?.setVisible(false);
      setFailed(true);
      failureCallbackRef.current();
    };

    const reportRelevantFailure = (index: number, signal?: AbortSignal, error?: unknown) => {
      const target = clampFrame(targetRef.current, manifest.frameCount);
      if (disposed || !isActive() || signal?.aborted || isAbortError(error) || Math.abs(index - target) > 1) {
        return;
      }
      failures += 1;
      if (failures >= 3) markPermanentFailure();
    };

    const browserDecode = createBrowserJawFrameDecoder(manifest);
    const decode = (url: string, signal: AbortSignal) =>
      browserDecode(url, signal).catch((error: unknown) => {
        const index = indexByUrl.get(url);
        if (index !== undefined) reportRelevantFailure(index, signal, error);
        throw error;
      });

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
        if (isCurrentWindow) reportRelevantFailure(frame.index);
        return;
      }

      try {
        drawContained(context, frame, canvas, manifest.width, manifest.height);
      } catch {
        if (isCurrentWindow) reportRelevantFailure(frame.index);
        return;
      }

      failures = 0;
      if (!hasSuccessfulDraw) {
        hasSuccessfulDraw = true;
        setReady(true);
      }
      if (exact && frame.index === target && lastExactFrameRef.current !== target) {
        lastExactFrameRef.current = target;
        exactCallbackRef.current(target);
      }
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

    const sync = () => {
      const active = isActive();
      loaderRef.current?.setVisible(active);
      loaderRef.current?.setTarget(clampFrame(targetRef.current, manifest.frameCount), directionRef.current);
      if (active) {
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

    const loader = createJawSequenceLoader({
      manifest,
      cacheLimit: profile === "desktop" ? 12 : 8,
      decode,
    });
    loaderRef.current = loader;
    const unsubscribe = loader.subscribe(requestDraw);
    const onVisibilityChange = () => {
      pageVisible = document.visibilityState !== "hidden";
      sync();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    lastExactFrameRef.current = undefined;
    runtimeRef.current = { loader, requestDraw, sync };
    sync();

    return () => {
      if (disposed) return;
      disposed = true;
      if (rafId !== undefined) window.cancelAnimationFrame(rafId);
      runtimeRef.current = undefined;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      unsubscribe();
      resizeObserver.disconnect();
      loaderRef.current?.dispose();
    };
  }, [profile]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    runtime.sync();
  }, [direction, profile, targetFrame, visible]);

  const mode: SequenceMode = failed ? "fallback" : ready ? "ready" : "loading";

  return (
    <div
      ref={stageRef}
      className={styles.sequenceStage}
      data-jaw-sequence-state={mode}
    >
      <StaticJawFrame profile={profile} mode={mode} />
      <canvas
        ref={canvasRef}
        className={styles.sequenceCanvas}
        aria-hidden="true"
      />
    </div>
  );
}

export function JawFrameSequence({ reducedMotion, ...props }: JawFrameSequenceProps) {
  if (reducedMotion) {
    return (
      <div className={styles.sequenceStage} data-jaw-sequence-state="reduced">
        <StaticJawFrame profile={props.profile} mode="reduced" />
      </div>
    );
  }

  return <AnimatedJawFrameSequence key={props.profile} {...props} />;
}
