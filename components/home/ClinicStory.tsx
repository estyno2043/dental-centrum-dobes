"use client";

import {
  useCallback,
  useEffect,
  useMemo,
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

function storyScrollVh(section: HTMLElement): number {
  return (
    Math.max(0, -section.getBoundingClientRect().top) /
    Math.max(1, window.innerHeight / 100)
  );
}

function writeHandoffGeometry(
  section: HTMLElement,
  finalFrame: HTMLElement,
  detail: number,
  handoff: number,
): void {
  const rect = finalFrame.getBoundingClientRect();
  const inverse = 1 - detail;
  section.style.setProperty("--handoff-left", `${rect.left * inverse}px`);
  section.style.setProperty("--handoff-top", `${rect.top * inverse}px`);
  section.style.setProperty(
    "--handoff-width",
    `${rect.width + (window.innerWidth - rect.width) * detail}px`,
  );
  section.style.setProperty(
    "--handoff-height",
    `${rect.height + (window.innerHeight - rect.height) * detail}px`,
  );
  section.style.setProperty("--handoff-blur", String(handoff));
}

export function ClinicStory(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const finalFrameRef = useRef<HTMLLIElement>(null);
  const targetProgressRef = useRef(0);
  const directionRef = useRef<-1 | 0 | 1>(0);
  const rawZoneVisibleRef = useRef(false);
  const [sequenceFailed, setSequenceFailed] = useState(false);
  const [exactEndDrawn, setExactEndDrawn] = useState(false);
  const [revealComplete, setRevealComplete] = useState(false);
  const [targetFrame, setTargetFrame] = useState(1);
  const [direction, setDirection] = useState<-1 | 0 | 1>(0);
  const [progressVh, setProgressVh] = useState(0);
  const prefersReducedMotion = useMediaQuery(reducedMotionQuery, true);
  const isWideViewport = useMediaQuery(wideViewportQuery, false);
  const profile = getProfile(isWideViewport);
  const manifest = jawSequenceManifests[profile as JawSequenceProfile];
  const renderMotion = useMemo(
    () =>
      mapRenderMotion(
        progressVh,
        profile,
        manifest.frameCount,
        exactEndDrawn || sequenceFailed || prefersReducedMotion,
        revealComplete || sequenceFailed || prefersReducedMotion,
      ),
    [exactEndDrawn, manifest.frameCount, prefersReducedMotion, profile, progressVh, revealComplete, sequenceFailed],
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
    if (prefersReducedMotion || sequenceFailed || !renderMotion.state.zonesVisible || !exactEndDrawn) {
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
  }, [exactEndDrawn, prefersReducedMotion, renderMotion.state.zonesVisible, sequenceFailed]);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const finalFrame = finalFrameRef.current;
    if (!section || !track || !finalFrame) return;

    const currentManifest = jawSequenceManifests[profile as JawSequenceProfile];
    let disposed = false;
    let rafId: number | undefined;
    let lastTime = performance.now();
    let damped: DampedMotionState = { value: 0, velocity: 0 };
    let mobileSnapStart: number | undefined;
    let pageVisible = document.visibilityState !== "hidden";

    const write = () => {
      const currentProgress = storyScrollVh(section);
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
      const nextDirection: -1 | 0 | 1 =
        nextTarget > previousTarget ? 1 : nextTarget < previousTarget ? -1 : 0;
      directionRef.current = nextDirection;
      setDirection(nextDirection);
      setProgressVh(currentProgress);

      section.style.setProperty("--grow", String(raw.state.grow));
      section.style.setProperty("--pan", String(raw.state.pan));
      section.style.setProperty("--snap", String(raw.snap));
      section.style.setProperty("--detail", String(raw.state.detail));
      section.style.setProperty("--handoff", String(raw.state.handoff));
      section.style.setProperty("--sequence-progress", String(raw.state.sequenceProgress));
      section.style.setProperty("--cue-opacity", String(raw.state.cueOpacity));
      section.style.setProperty("--tease", String(raw.state.teaseProgress));
      section.style.setProperty("--map-reveal", String(raw.state.mapReveal));
      section.style.setProperty("--exit", String(raw.state.exit));
      section.style.setProperty(
        "--jaw-opacity",
        String(raw.state.handoff * (1 - raw.state.exit)),
      );
      section.style.setProperty(
        "--travel",
        `${Math.max(0, track.scrollWidth - window.innerWidth)}px`,
      );

      if (profile === "mobile") {
        if (raw.snap > 0 && mobileSnapStart === undefined) mobileSnapStart = track.scrollLeft;
        if (raw.snap === 0) mobileSnapStart = undefined;
        if (mobileSnapStart !== undefined) {
          const targetScroll =
            finalFrame.offsetLeft - (window.innerWidth - finalFrame.offsetWidth) / 2;
          track.scrollLeft = mobileSnapStart + (targetScroll - mobileSnapStart) * raw.snap;
        }
      }

      writeHandoffGeometry(section, finalFrame, raw.state.detail, raw.state.handoff);

      if (!raw.state.zonesVisible && rawZoneVisibleRef.current) {
        setExactEndDrawn(false);
        setRevealComplete(false);
      }
      rawZoneVisibleRef.current = raw.state.zonesVisible;

      if (!prefersReducedMotion && pageVisible && rafId === undefined) {
        lastTime = performance.now();
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const tick = (now: number) => {
      rafId = undefined;
      if (disposed || !pageVisible || prefersReducedMotion) return;
      const deltaSeconds = Math.max(0, (now - lastTime) / 1000);
      lastTime = now;
      damped = stepCriticallyDamped(damped, targetProgressRef.current, deltaSeconds, 0.18);
      const nextFrame =
        1 + Math.round(damped.value * (currentManifest.frameCount - 1));
      setTargetFrame((current) => (current === nextFrame ? current : nextFrame));

      if (
        Math.abs(damped.value - targetProgressRef.current) > 0.00005 ||
        Math.abs(damped.velocity) > 0.001
      ) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const onVisibilityChange = () => {
      pageVisible = document.visibilityState !== "hidden";
      if (pageVisible) write();
    };

    write();
    window.addEventListener("scroll", write, { passive: true });
    window.addEventListener("resize", write);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      disposed = true;
      if (rafId !== undefined) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", write);
      window.removeEventListener("resize", write);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [prefersReducedMotion, profile]);

  const jawVisible =
    renderMotion.state.handoff > 0 ||
    renderMotion.state.sequenceProgress > 0 ||
    sequenceFailed ||
    prefersReducedMotion;
  const failureZoneReady = sequenceFailed && renderMotion.state.zonesVisible;
  const zoneVisible =
    renderMotion.state.teaseProgress > 0 ||
    renderMotion.state.zonesVisible ||
    failureZoneReady ||
    prefersReducedMotion;
  const zoneInteractive =
    renderMotion.state.interactive || failureZoneReady || prefersReducedMotion;
  const mapPresentation: JawMapPresentation = prefersReducedMotion || zoneInteractive
    ? "interactive"
    : renderMotion.state.phase === "tease"
      ? "tease"
      : renderMotion.state.mapReveal > 0 || renderMotion.state.zonesVisible
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
          <header className={styles.intro}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowRule} aria-hidden="true" />
              {photoStripIntro.eyebrow}
            </p>
            <h2 className={styles.headline} id="clinic-story-heading">
              {photoStripIntro.headline}
            </h2>
          </header>

          <ul className={styles.track} ref={trackRef} data-native-swipe="true">
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
            {renderMotion.state.cueOpacity > 0.01 ? (
              <div className={styles.jawCue} aria-live="polite">
                <span aria-hidden="true" className={styles.loadingRing} data-testid="jaw-loading-ring" />
                <span>Zóny bolesti</span>
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
