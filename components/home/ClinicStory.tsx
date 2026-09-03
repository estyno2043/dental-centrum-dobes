"use client";

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
} from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useMediaQuery } from "../hero/useMediaQuery";
import {
  DESKTOP_STORY_SCROLL_VH,
  MOBILE_STORY_SCROLL_VH,
  mapClinicStoryMotion,
  type ClinicStoryPhase,
  type ClinicStoryProfile,
  type ClinicStoryMotionState,
} from "./clinicStoryMotion";
import { JawFrameSequence, type JawFrameSequenceHandle } from "./jaw/JawFrameSequence";
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

gsap.registerPlugin(ScrollTrigger, useGSAP);

const detailFrame = (() => {
  const frame = photoFrames.find((candidate) => candidate.id === "detail");
  if (!frame) throw new Error("ClinicStory requires photoFrames detail handoff");
  return frame;
})();

type RenderMotion = Readonly<{
  state: ClinicStoryMotionState;
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
  trackTravel: number;
  viewportHeight: number;
  viewportWidth: number;
}>;

function getProfile(isWideViewport: boolean): ClinicStoryProfile {
  return isWideViewport ? "desktop" : "mobile";
}

function mapRenderMotion(
  progressVh: number,
  profile: ClinicStoryProfile,
  frameCount: number,
  exactEndDrawn: boolean,
): RenderMotion {
  return {
    state: mapClinicStoryMotion({
      progressVh,
      profile,
      frameCount,
      exactEndDrawn,
      revealComplete: false,
    }),
  };
}

function renderFlagsFor(state: ClinicStoryMotionState): RenderFlags {
  return {
    cueVisible: state.cueOpacity > 0.01,
    interactiveWindow: state.mapReveal > 0 && state.exit < 1,
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
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const finalFrameRef = useRef<HTMLLIElement>(null);
  const jawSequenceRef = useRef<JawFrameSequenceHandle>(null);
  const rawZoneVisibleRef = useRef(false);
  const [sequenceFailed, setSequenceFailed] = useState(false);
  const [exactEndDrawn, setExactEndDrawn] = useState(false);
  const prefersReducedMotion = useMediaQuery(reducedMotionQuery, true);
  const isWideViewport = useMediaQuery(wideViewportQuery, false);
  const profile = getProfile(isWideViewport);
  const manifest = jawSequenceManifests[profile as JawSequenceProfile];
  const [renderFlags, setRenderFlags] = useState<RenderFlags>(() =>
    renderFlagsFor(
      mapRenderMotion(0, profile, manifest.frameCount, false).state,
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

  useGSAP(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    const finalFrame = finalFrameRef.current;
    if (!section || !pin || !track || !finalFrame) return;
    const intro = section.querySelector(`.${styles.intro}`);
    const otherFrames = Array.from(track.children).filter(
      (frame) => frame !== finalFrame,
    );

    const currentManifest = jawSequenceManifests[profile as JawSequenceProfile];
    const storyEnd = profile === "mobile" ? MOBILE_STORY_SCROLL_VH : DESKTOP_STORY_SCROLL_VH;
    const playhead = { progressVh: 0 };
    let previousSequenceProgress = 0;
    let preloadRequested = false;
    let stableMobileViewport = {
      height: Math.max(1, window.innerHeight),
      width: Math.max(1, window.innerWidth),
    };
    let layout: StoryLayout = {
      finalHeight: 1,
      finalLeft: 0,
      finalTop: 0,
      finalWidth: 1,
      trackTravel: 0,
      viewportHeight: Math.max(1, window.innerHeight),
      viewportWidth: Math.max(1, window.innerWidth),
    };

    const applyVisualMotion = (motion: RenderMotion) => {
      const trackX = -layout.trackTravel * motion.state.pan;
      const currentFinalLeft = layout.finalLeft + trackX;
      const handoffX =
        currentFinalLeft + layout.finalWidth / 2 - layout.viewportWidth / 2;
      const handoffY =
        layout.finalTop + layout.finalHeight / 2 - layout.viewportHeight / 2;
      const fullscreenScale = Math.max(
        layout.viewportWidth / layout.finalWidth,
        layout.viewportHeight / layout.finalHeight,
      );
      const detailScale = 1 + (fullscreenScale - 1) * motion.state.detail;
      const galleryOpacity = 1 - motion.state.detail;

      section.style.setProperty("--grow", String(motion.state.grow));
      section.style.setProperty("--pan", String(motion.state.pan));
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
      gsap.set(track, { force3D: true, x: trackX });
      gsap.set(finalFrame, {
        borderRadius: motion.state.detail >= 0.999 ? 0 : 4,
        force3D: true,
        scale: detailScale,
        x: -handoffX * motion.state.detail,
        y: -handoffY * motion.state.detail,
        zIndex: motion.state.detail > 0 ? 2 : 0,
      });
      if (intro) gsap.set(intro, { opacity: galleryOpacity });
      gsap.set(otherFrames, { opacity: galleryOpacity });
    };

    const updateRenderFlags = (motion: RenderMotion) => {
      const nextFlags = renderFlagsFor(motion.state);
      setRenderFlags((current) =>
        sameRenderFlags(current, nextFlags) ? current : nextFlags,
      );

      if (!motion.state.zonesVisible && rawZoneVisibleRef.current) {
        setExactEndDrawn(false);
      }
      rawZoneVisibleRef.current = motion.state.zonesVisible;
    };

    const measure = () => {
      /* All layout reads stay together. ScrollTrigger runs this only on refresh. */
      const viewportWidth = Math.max(1, window.innerWidth);
      const liveViewportHeight = Math.max(1, window.innerHeight);
      if (
        profile === "mobile" &&
        Math.abs(viewportWidth - stableMobileViewport.width) > 40
      ) {
        stableMobileViewport = {
          height: liveViewportHeight,
          width: viewportWidth,
        };
      }
      const viewportHeight = profile === "mobile"
        ? stableMobileViewport.height
        : liveViewportHeight;
      const finalLeft = finalFrame.offsetLeft;
      const finalWidth = Math.max(1, finalFrame.offsetWidth);
      const finalTop = track.offsetTop;
      const finalHeight = Math.max(1, track.offsetHeight);
      const centeredFinalLeft = (viewportWidth - finalWidth) / 2;

      layout = {
        finalHeight,
        finalLeft,
        finalTop,
        finalWidth,
        trackTravel: Math.max(0, finalLeft - centeredFinalLeft),
        viewportHeight,
        viewportWidth,
      };

      /* Writes happen only after every measurement above has completed. */
      section.style.setProperty("--travel", `${layout.trackTravel}px`);
      if (profile === "mobile") {
        section.style.setProperty(
          "--story-height",
          `${(MOBILE_STORY_SCROLL_VH * viewportHeight) / 100}px`,
        );
        pin.style.setProperty("--pin-height", `${viewportHeight}px`);
      }
    };

    const sync = () => {
      const motion = mapRenderMotion(
        playhead.progressVh,
        profile,
        currentManifest.frameCount,
        false,
      );
      const previousTarget = previousSequenceProgress;
      const nextTarget = motion.state.sequenceProgress;

      previousSequenceProgress = nextTarget;
      const nextDirection: -1 | 0 | 1 =
        nextTarget > previousTarget ? 1 : nextTarget < previousTarget ? -1 : 0;
      const nextFrame =
        1 + Math.round(nextTarget * (currentManifest.frameCount - 1));
      const nextJawVisible = motion.state.handoff > 0 || motion.state.sequenceProgress > 0;
      jawSequenceRef.current?.setMotion(nextFrame, nextDirection, nextJawVisible);
      if (!preloadRequested && motion.state.pan >= 0.5) {
        preloadRequested = true;
        jawSequenceRef.current?.preload();
      }
      applyVisualMotion(motion);
      updateRenderFlags(motion);
    };

    measure();
    sync();

    if (prefersReducedMotion) return;

    const timeline = gsap.timeline({ paused: true, onUpdate: sync });
    timeline.to(playhead, {
      duration: storyEnd,
      ease: "none",
      progressVh: storyEnd,
    });

    ScrollTrigger.config({ ignoreMobileResize: true });
    ScrollTrigger.create({
      animation: timeline,
      end: "bottom top",
      invalidateOnRefresh: true,
      onRefresh: () => {
        measure();
        sync();
      },
      scrub: true,
      start: "top top",
      trigger: section,
    });
  }, {
    dependencies: [prefersReducedMotion, profile],
    revertOnUpdate: true,
    scope: sectionRef,
  });

  const jawVisible = renderFlags.jawVisible || sequenceFailed || prefersReducedMotion;
  const failureZoneReady = sequenceFailed && renderFlags.zonesVisible;
  const zoneVisible =
    renderFlags.zoneVisible ||
    failureZoneReady ||
    prefersReducedMotion;
  const zoneInteractive =
    (renderFlags.interactiveWindow && exactEndDrawn) ||
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
      <div className={styles.pin} data-testid="clinic-story-pin" ref={pinRef}>
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

          <div
            className={styles.trackViewport}
            data-native-swipe={prefersReducedMotion ? "true" : "false"}
            data-testid="clinic-track-viewport"
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
                    frame.id === detailFrame.id ? (
                      <picture className={styles.detailPicture}>
                        <source
                          media="(max-width: 767px)"
                          srcSet="/media/strip-07-detail-mobile.jpg"
                        />
                        <img
                          alt={`${frame.label} — Dental Centrum Dobeš`}
                          className={styles.photo}
                          decoding="async"
                          fetchPriority="low"
                          src={frame.src}
                        />
                      </picture>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element -- static pre-cropped clinic asset.
                      <img
                        alt={`${frame.label} — Dental Centrum Dobeš`}
                        className={styles.photo}
                        decoding="async"
                        fetchPriority="low"
                        src={frame.src}
                      />
                    )
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

        <div
          className={styles.jawLayer}
          data-testid="jaw-layer"
          data-visible={jawVisible ? "true" : "false"}
        >
            <div className={styles.jawViewport} data-testid="jaw-viewport">
              <div className={styles.jawMedia}>
                <JawFrameSequence
                  direction={0}
                  onExactFrameDrawn={onExactFrameDrawn}
                  onPermanentFailure={onPermanentFailure}
                  profile={profile as JawSequenceProfile}
                  reducedMotion={prefersReducedMotion}
                  ref={jawSequenceRef}
                  targetFrame={1}
                  visible={false}
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
