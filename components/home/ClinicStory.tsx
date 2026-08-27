"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
} from "react";

import { useMediaQuery } from "../hero/useMediaQuery";
import {
  DESKTOP_STORY_SCROLL_VH,
  MOBILE_PHASES,
  MOBILE_STORY_SCROLL_VH,
  mapClinicStoryMotion,
  stepCriticallyDamped,
  type ClinicStoryPhase,
  type ClinicStoryProfile,
  type ClinicStoryMotionState,
  type DampedMotionState,
} from "./clinicStoryMotion";
import { JawFrameSequence } from "./jaw/JawFrameSequence";
import { JAW_DISCLAIMER, JAW_ZONES } from "./jaw/jawContent";
import {
  jawSequenceManifests,
  type JawSequenceProfile,
} from "./jaw/jawSequenceManifest.generated";
import { JawZoneOverlay, type JawMapPresentation } from "./jaw/JawZoneOverlay";
import { photoFrames, photoStripIntro } from "./photoStripContent";
import styles from "./clinicStory.module.css";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const wideViewportQuery = "(min-width: 768px)";
const analyticsConsent = false;
const REVEAL_TOTAL_MS = 720;

const detailFrame = (() => {
  const frame = photoFrames.find((candidate) => candidate.id === "detail");
  if (!frame) throw new Error("ClinicStory requires photoFrames detail handoff");
  return frame;
})();

type RenderMotion = Readonly<{
  state: ClinicStoryMotionState;
  snap: number;
}>;

type RenderFlags = Readonly<{
  cueVisible: boolean;
  interactiveWindow: boolean;
  jawVisible: boolean;
  mapStarted: boolean;
  phase: ClinicStoryPhase;
  zoneVisible: boolean;
  zonesVisible: boolean;
}>;

type StoryLayout = Readonly<{
  finalHeight: number;
  finalLeft: number;
  finalTop: number;
  finalWidth: number;
  sectionTop: number;
  trackTravel: number;
  viewportHeight: number;
  viewportWidth: number;
}>;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function getProfile(isWideViewport: boolean): ClinicStoryProfile {
  return isWideViewport ? "desktop" : "mobile";
}

function mapRenderMotion(
  progressVh: number,
  profile: ClinicStoryProfile,
  frameCount: number,
  exactEndDrawn: boolean,
  revealComplete: boolean,
): RenderMotion {
  return {
    state: mapClinicStoryMotion({
      progressVh,
      profile,
      frameCount,
      exactEndDrawn,
      revealComplete,
    }),
    snap:
      profile === "mobile"
        ? clamp01(
            (progressVh - MOBILE_PHASES.galleryEnd) /
              (MOBILE_PHASES.snapEnd - MOBILE_PHASES.galleryEnd),
          )
        : 1,
  };
}

function renderFlagsFor(state: ClinicStoryMotionState): RenderFlags {
  return {
    cueVisible: state.cueOpacity > 0.01,
    interactiveWindow: state.phase === "interactive",
    jawVisible: state.handoff > 0 || state.sequenceProgress > 0,
    mapStarted: state.mapReveal > 0,
    phase: state.phase,
    zoneVisible: state.teaseProgress > 0 || state.zonesVisible,
    zonesVisible: state.zonesVisible,
  };
}

function sameRenderFlags(left: RenderFlags, right: RenderFlags): boolean {
  return (
    left.cueVisible === right.cueVisible &&
    left.interactiveWindow === right.interactiveWindow &&
    left.jawVisible === right.jawVisible &&
    left.mapStarted === right.mapStarted &&
    left.phase === right.phase &&
    left.zoneVisible === right.zoneVisible &&
    left.zonesVisible === right.zonesVisible
  );
}

export function ClinicStory(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const trackViewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const finalFrameRef = useRef<HTMLLIElement>(null);
  const targetProgressRef = useRef(0);
  const rawZoneVisibleRef = useRef(false);
  const [sequenceFailed, setSequenceFailed] = useState(false);
  const [exactEndDrawn, setExactEndDrawn] = useState(false);
  const [revealComplete, setRevealComplete] = useState(false);
  const [targetFrame, setTargetFrame] = useState(1);
  const [direction, setDirection] = useState<-1 | 0 | 1>(0);
  const prefersReducedMotion = useMediaQuery(reducedMotionQuery, true);
  const isWideViewport = useMediaQuery(wideViewportQuery, false);
  const profile = getProfile(isWideViewport);
  const manifest = jawSequenceManifests[profile as JawSequenceProfile];
  const [renderFlags, setRenderFlags] = useState<RenderFlags>(() =>
    renderFlagsFor(
      mapRenderMotion(0, profile, manifest.frameCount, false, false).state,
    ),
  );

  const onPermanentFailure = useCallback(() => {
    setSequenceFailed(true);
    setExactEndDrawn(true);
  }, []);

  const onExactFrameDrawn = useCallback(
    (frame: number) => {
      if (frame === manifest.endFrame) setExactEndDrawn(true);
    },
    [manifest.endFrame],
  );

  useEffect(() => {
    if (prefersReducedMotion || sequenceFailed || !renderFlags.zonesVisible || !exactEndDrawn) {
      const reset = window.setTimeout(() => {
        setRevealComplete(prefersReducedMotion || sequenceFailed);
      }, 0);
      return () => window.clearTimeout(reset);
    }

    let completion: number | undefined;
    const begin = window.setTimeout(() => {
      setRevealComplete(false);
      completion = window.setTimeout(() => setRevealComplete(true), REVEAL_TOTAL_MS);
    }, 0);
    return () => {
      window.clearTimeout(begin);
      if (completion !== undefined) window.clearTimeout(completion);
    };
  }, [exactEndDrawn, prefersReducedMotion, renderFlags.zonesVisible, sequenceFailed]);

  useEffect(() => {
    const section = sectionRef.current;
    const intro = introRef.current;
    const trackViewport = trackViewportRef.current;
    const track = trackRef.current;
    const finalFrame = finalFrameRef.current;
    if (!section || !intro || !trackViewport || !track || !finalFrame) return;

    const currentManifest = jawSequenceManifests[profile as JawSequenceProfile];
    let disposed = false;
    let rafId: number | undefined;
    let lastTime = performance.now();
    let sequenceDamped: DampedMotionState = { value: 0, velocity: 0 };
    let storyDamped: DampedMotionState = { value: 0, velocity: 0 };
    let targetStoryProgress = 0;
    let targetSequenceProgress = 0;
    let targetSnap = 0;
    let mobileSnapStart: number | undefined;
    let mobileScrollLeft = 0;
    let pageVisible = document.visibilityState !== "hidden";
    const storyEnd = profile === "mobile" ? MOBILE_STORY_SCROLL_VH : DESKTOP_STORY_SCROLL_VH;
    let layout: StoryLayout = {
      finalHeight: 1,
      finalLeft: 0,
      finalTop: 0,
      finalWidth: 1,
      sectionTop: 0,
      trackTravel: 0,
      viewportHeight: Math.max(1, window.innerHeight),
      viewportWidth: Math.max(1, window.innerWidth),
    };

    const applyVisualMotion = (motion: RenderMotion) => {
      const snapStart = mobileSnapStart ?? mobileScrollLeft;
      const baseFinalLeft =
        profile === "mobile"
          ? layout.finalLeft - snapStart
          : layout.finalLeft - layout.trackTravel;
      const centeredFinalLeft = (layout.viewportWidth - layout.finalWidth) / 2;
      const snapShift = profile === "mobile" ? centeredFinalLeft - baseFinalLeft : 0;
      const currentFinalLeft = baseFinalLeft + snapShift * motion.snap;
      const handoffX =
        currentFinalLeft + layout.finalWidth / 2 - layout.viewportWidth / 2;
      const handoffY =
        layout.finalTop + layout.finalHeight / 2 - layout.viewportHeight / 2;

      section.style.setProperty("--grow", String(motion.state.grow));
      section.style.setProperty("--pan", String(motion.state.pan));
      section.style.setProperty("--snap", String(motion.snap));
      section.style.setProperty("--snap-shift", `${snapShift * motion.snap}px`);
      section.style.setProperty("--detail", String(motion.state.detail));
      section.style.setProperty("--handoff", String(motion.state.handoff));
      section.style.setProperty("--sequence-progress", String(motion.state.sequenceProgress));
      section.style.setProperty("--cue-opacity", String(motion.state.cueOpacity));
      section.style.setProperty("--tease", String(motion.state.teaseProgress));
      section.style.setProperty("--map-reveal", String(motion.state.mapReveal));
      section.style.setProperty("--exit", String(motion.state.exit));
      section.style.setProperty(
        "--jaw-opacity",
        String(motion.state.handoff * (1 - motion.state.exit)),
      );
      section.style.setProperty("--handoff-x", `${handoffX}px`);
      section.style.setProperty("--handoff-y", `${handoffY}px`);
      section.style.setProperty(
        "--handoff-scale-x",
        String(layout.finalWidth / layout.viewportWidth),
      );
      section.style.setProperty(
        "--handoff-scale-y",
        String(layout.finalHeight / layout.viewportHeight),
      );
      section.style.setProperty("--handoff-blur", String(motion.state.handoff));
      section.dataset.snapActive = String(profile === "mobile" && motion.snap > 0);
      if (profile === "mobile" && motion.snap === 0 && targetSnap === 0) {
        mobileSnapStart = undefined;
      }
    };

    const updateRenderFlags = (motion: RenderMotion) => {
      const nextFlags = renderFlagsFor(motion.state);
      setRenderFlags((current) =>
        sameRenderFlags(current, nextFlags) ? current : nextFlags,
      );

      if (!motion.state.zonesVisible && rawZoneVisibleRef.current) {
        setExactEndDrawn(false);
        setRevealComplete(false);
      }
      rawZoneVisibleRef.current = motion.state.zonesVisible;
    };

    const measure = () => {
      /* All layout reads stay together and run only on resize/content settle. */
      const sectionRect = section.getBoundingClientRect();
      const viewportWidth = Math.max(1, window.innerWidth);
      const viewportHeight = Math.max(1, window.innerHeight);
      const trackWidth = track.scrollWidth;
      const finalLeft = finalFrame.offsetLeft;
      const finalWidth = Math.max(1, finalFrame.offsetWidth);
      const finalTop = track.offsetTop;
      const finalHeight = Math.max(1, track.offsetHeight);
      const nextMobileScrollLeft = trackViewport.scrollLeft;

      layout = {
        finalHeight,
        finalLeft,
        finalTop,
        finalWidth,
        sectionTop: window.scrollY + sectionRect.top,
        trackTravel: Math.max(0, trackWidth - viewportWidth),
        viewportHeight,
        viewportWidth,
      };
      if (mobileSnapStart === undefined) mobileScrollLeft = nextMobileScrollLeft;

      /* Writes happen only after every measurement above has completed. */
      section.style.setProperty("--travel", `${layout.trackTravel}px`);
    };

    const readTarget = (settleImmediately = false) => {
      const currentProgress =
        Math.max(0, window.scrollY - layout.sectionTop) /
        Math.max(1, layout.viewportHeight / 100);
      const raw = mapRenderMotion(
        currentProgress,
        profile,
        currentManifest.frameCount,
        false,
        false,
      );
      const previousTarget = targetProgressRef.current;
      const nextTarget = raw.state.sequenceProgress;

      targetProgressRef.current = nextTarget;
      targetStoryProgress = clamp01(currentProgress / storyEnd);
      targetSequenceProgress = nextTarget;
      targetSnap = raw.snap;
      const nextDirection: -1 | 0 | 1 =
        nextTarget > previousTarget ? 1 : nextTarget < previousTarget ? -1 : 0;
      setDirection((current) => (current === nextDirection ? current : nextDirection));

      if (profile === "mobile") {
        if (raw.snap > 0 && mobileSnapStart === undefined) {
          mobileSnapStart = mobileScrollLeft;
        }
      }

      if (settleImmediately || prefersReducedMotion || profile === "desktop") {
        storyDamped = { value: targetStoryProgress, velocity: 0 };
        applyVisualMotion(raw);
        updateRenderFlags(raw);
      }

      if (settleImmediately || prefersReducedMotion) {
        sequenceDamped = { value: targetSequenceProgress, velocity: 0 };
        const nextFrame =
          1 + Math.round(targetSequenceProgress * (currentManifest.frameCount - 1));
        setTargetFrame((current) => (current === nextFrame ? current : nextFrame));
      } else if (pageVisible && rafId === undefined) {
        lastTime = performance.now();
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const tick = (now: number) => {
      rafId = undefined;
      if (disposed || !pageVisible || prefersReducedMotion) return;
      const deltaSeconds = Math.max(0, (now - lastTime) / 1000);
      lastTime = now;
      if (profile === "mobile") {
        storyDamped = stepCriticallyDamped(
          storyDamped,
          targetStoryProgress,
          deltaSeconds,
          0.12,
        );
        const visualMotion = mapRenderMotion(
          storyDamped.value * storyEnd,
          profile,
          currentManifest.frameCount,
          false,
          false,
        );
        applyVisualMotion(visualMotion);
        updateRenderFlags(visualMotion);
      }

      sequenceDamped = stepCriticallyDamped(
        sequenceDamped,
        targetSequenceProgress,
        deltaSeconds,
        0.18,
      );
      const nextFrame =
        1 + Math.round(sequenceDamped.value * (currentManifest.frameCount - 1));
      setTargetFrame((current) => (current === nextFrame ? current : nextFrame));

      if (
        (profile === "mobile" &&
          (Math.abs(storyDamped.value - targetStoryProgress) > 0.00005 ||
            Math.abs(storyDamped.velocity) > 0.001)) ||
        Math.abs(sequenceDamped.value - targetSequenceProgress) > 0.00005 ||
        Math.abs(sequenceDamped.velocity) > 0.001
      ) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const onTrackScroll = () => {
      if (mobileSnapStart === undefined) mobileScrollLeft = trackViewport.scrollLeft;
    };
    const onDocumentScroll = () => readTarget(false);
    const onResize = () => {
      measure();
      readTarget(true);
    };

    const onVisibilityChange = () => {
      pageVisible = document.visibilityState !== "hidden";
      if (pageVisible) readTarget(true);
    };

    const resizeObserver = new ResizeObserver(() => {
      measure();
      readTarget(true);
    });
    resizeObserver.observe(section);
    resizeObserver.observe(intro);
    resizeObserver.observe(trackViewport);
    resizeObserver.observe(track);

    measure();
    readTarget(true);
    window.addEventListener("scroll", onDocumentScroll, { passive: true });
    window.addEventListener("resize", onResize);
    trackViewport.addEventListener("scroll", onTrackScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      disposed = true;
      if (rafId !== undefined) window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onDocumentScroll);
      window.removeEventListener("resize", onResize);
      trackViewport.removeEventListener("scroll", onTrackScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [prefersReducedMotion, profile]);

  const jawVisible = renderFlags.jawVisible || sequenceFailed || prefersReducedMotion;
  const failureZoneReady = sequenceFailed && renderFlags.zonesVisible;
  const zoneVisible =
    renderFlags.zoneVisible ||
    failureZoneReady ||
    prefersReducedMotion;
  const zoneInteractive =
    (renderFlags.interactiveWindow && exactEndDrawn && revealComplete) ||
    failureZoneReady ||
    prefersReducedMotion;
  const mapPresentation: JawMapPresentation = prefersReducedMotion || zoneInteractive
    ? "interactive"
    : renderFlags.phase === "tease"
      ? "tease"
      : renderFlags.mapStarted || renderFlags.zonesVisible
        ? "reveal"
        : "hidden";

  return (
    <section
      className={`${styles.section} ${prefersReducedMotion ? styles.reduced : ""}`}
      data-desktop-vh={DESKTOP_STORY_SCROLL_VH}
      data-mobile-vh={MOBILE_STORY_SCROLL_VH}
      data-testid="clinic-story"
      ref={sectionRef}
      aria-labelledby="clinic-story-heading"
      style={{ pointerEvents: "auto" }}
    >
      <div className={styles.pin} data-testid="clinic-story-pin">
        <div className={styles.galleryLayer}>
          <header className={styles.intro} ref={introRef}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowRule} aria-hidden="true" />
              {photoStripIntro.eyebrow}
            </p>
            <h2 className={styles.headline} id="clinic-story-heading">
              {photoStripIntro.headline}
            </h2>
          </header>

          <div
            className={styles.trackViewport}
            data-native-swipe="true"
            data-testid="clinic-track-viewport"
            ref={trackViewportRef}
          >
            <ul className={styles.track} ref={trackRef}>
              {photoFrames.map((frame) => (
                <li
                  className={styles.frame}
                  data-frame-id={frame.id}
                  data-gallery-frame="true"
                  data-testid="clinic-frame"
                  key={frame.id}
                  ref={frame.id === detailFrame.id ? finalFrameRef : undefined}
                  style={{ "--ratio": frame.ratio } as CSSProperties}
                >
                  {frame.src ? (
                    // eslint-disable-next-line @next/next/no-img-element -- static pre-cropped clinic asset.
                    <img
                      alt={`${frame.label} — Dental Centrum Dobeš`}
                      className={styles.photo}
                      decoding="async"
                      fetchPriority="low"
                      src={frame.src}
                    />
                  ) : (
                    <div className={styles.placeholder}>
                      <span className={styles.placeholderLabel}>{frame.label}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <picture className={styles.handoffPicture} data-frame-id={detailFrame.id} data-testid="clinic-handoff">
          <source media="(max-width: 767px)" srcSet="/media/strip-07-detail-mobile.jpg" />
          <img
            alt=""
            aria-hidden="true"
            className={styles.handoffPhoto}
            decoding="async"
            src={detailFrame.src}
          />
        </picture>

        {jawVisible ? (
          <div className={styles.jawLayer} data-visible="true">
            <div className={styles.jawViewport} data-testid="jaw-viewport">
              <div className={styles.jawMedia}>
                <JawFrameSequence
                  direction={direction}
                  onExactFrameDrawn={onExactFrameDrawn}
                  onPermanentFailure={onPermanentFailure}
                  profile={profile as JawSequenceProfile}
                  reducedMotion={prefersReducedMotion}
                  targetFrame={targetFrame}
                  visible={jawVisible}
                />
              </div>
              <div className={styles.scrim} aria-hidden="true" />
              <JawZoneOverlay
                analyticsConsent={analyticsConsent}
                exactEndDrawn={exactEndDrawn || sequenceFailed}
                presentation={mapPresentation}
                reducedMotion={prefersReducedMotion}
                visible={zoneVisible}
              />
            </div>
            {renderFlags.cueVisible ? (
              /*
                A scroll prompt, not a spinner.

                It used to wear a rotating ring, which is the universal sign
                for "wait, something is loading" — so readers waited, and the
                one thing that actually advances the scene is scrolling. The
                chevron drifts downward instead: the same corner of the screen,
                the opposite instruction.
              */
              <div className={styles.jawCue} aria-live="polite">
                <span aria-hidden="true" className={styles.scrollHint} data-testid="jaw-scroll-hint">
                  <svg viewBox="0 0 24 24">
                    <path d="M6 9.5 12 15.5 18 9.5" />
                  </svg>
                </span>
                <span className={styles.cueText}>
                  <strong>Scrollujte</strong>
                  <span>Zóny bolesti</span>
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div aria-hidden="true" className={styles.exitGradient} />

        <noscript data-testid="jaw-noscript-fallback">
          <section className={styles.noScriptFallback}>
            {/* eslint-disable-next-line @next/next/no-img-element -- no-JS fallback needs direct stable endpoint. */}
            <img alt="Otvorená čeľusť" src="/media/jaw-sequence/desktop/frame-072.webp" />
            <h2>Kde vás to trápi?</h2>
            <p>{JAW_DISCLAIMER}</p>
            <ul>
              {JAW_ZONES.map((zone) => (
                <li key={zone.id}>
                  <a href={zone.route}>{zone.label}</a>
                </li>
              ))}
            </ul>
          </section>
        </noscript>
      </div>
    </section>
  );
}
