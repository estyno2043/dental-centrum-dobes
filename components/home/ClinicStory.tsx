"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type JSX,
} from "react";
import { useMediaQuery } from "../hero/useMediaQuery";
import {
  mapClinicStoryMotion,
  stepCriticallyDamped,
  type ClinicStoryProfile,
  type DampedMotionState,
} from "./clinicStoryMotion";
import {
  getJawTrackingModel,
  mapJawSourcePointToViewport,
  type JawCalloutKind,
  type JawPoint,
} from "./jawTracking";
import { createLatestSeekQueue, type LatestSeekQueue } from "./jawSeekQueue";
import {
  JAW_STORY_END,
  JAW_STORY_START,
  mapJawStoryMotion,
  selectJawSegment,
} from "./jawStoryMotion";
import { photoFrames, photoStripIntro } from "./photoStripContent";
import styles from "./clinicStory.module.css";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const wideViewportQuery = "(min-width: 768px)";
const hiddenLayerOpacity = "0";

export const jawSegments = [
  {
    desktop: "/media/jaw-story/jaw-01-1080.mp4",
    mobile: "/media/jaw-story/jaw-01-720.mp4",
  },
  {
    desktop: "/media/jaw-story/jaw-02-1080.mp4",
    mobile: "/media/jaw-story/jaw-02-720.mp4",
  },
  {
    desktop: "/media/jaw-story/jaw-03-1080.mp4",
    mobile: "/media/jaw-story/jaw-03-720.mp4",
  },
  {
    desktop: "/media/jaw-story/jaw-04-1080.mp4",
    mobile: "/media/jaw-story/jaw-04-720.mp4",
  },
] as const;

const callouts: Readonly<
  Record<
    JawCalloutKind,
    Readonly<{ eyebrow: string; title: string; copy: string }>
  >
> = {
  bite: {
    eyebrow: "01 / Protetika",
    title: "Prirodzený zhryz",
    copy: "Korunky a mostíky navrhnuté ako jeden funkčný celok.",
  },
  tooth: {
    eyebrow: "02 / Endodoncia",
    title: "Zachovať vlastný zub",
    copy: "Mikroskopická endodoncia pre detail, ktorý voľným okom nevidno.",
  },
  gum: {
    eyebrow: "03 / Prevencia",
    title: "Zdravý základ",
    copy: "GBT hygiena chráni zuby, ďasná aj implantáty.",
  },
};

const calloutKinds = Object.keys(callouts) as JawCalloutKind[];

function mediaSource(index: number, profile: ClinicStoryProfile): string {
  const segment = jawSegments[index];
  return profile === "desktop" ? segment.desktop : segment.mobile;
}

function calloutOpacity(kind: JawCalloutKind, globalTime: number): number {
  const progress =
    JAW_STORY_START +
    (Math.min(8, Math.max(0, globalTime)) / 8) *
      (JAW_STORY_END - JAW_STORY_START);
  return mapJawStoryMotion(progress).callouts[kind];
}

function cardEdgeTowardTarget(rect: DOMRect, target: JawPoint): JawPoint {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const deltaX = target.x - centerX;
  const deltaY = target.y - centerY;
  const scale =
    1 /
    Math.max(
      Math.abs(deltaX) / Math.max(1, rect.width / 2),
      Math.abs(deltaY) / Math.max(1, rect.height / 2),
      1,
    );

  return {
    x: centerX + deltaX * scale,
    y: centerY + deltaY * scale,
  };
}

export function ClinicStory(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const finalFrameRef = useRef<HTMLLIElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const cardRefs = useRef<Partial<Record<JawCalloutKind, HTMLElement>>>({});
  const pathRefs = useRef<Partial<Record<JawCalloutKind, SVGPathElement>>>({});
  const dotRefs = useRef<Partial<Record<JawCalloutKind, SVGCircleElement>>>({});
  const leaderRefs = useRef<Partial<Record<JawCalloutKind, SVGSVGElement>>>({});
  const prefersReducedMotion = useMediaQuery(reducedMotionQuery, true);
  const isWideViewport = useMediaQuery(wideViewportQuery, false);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    const finalFrame = finalFrameRef.current;
    const deck = videoRefs.current.filter(
      (video): video is HTMLVideoElement => video !== null,
    );
    if (prefersReducedMotion || !section || !pin || !track || !finalFrame) {
      return;
    }

    const profile: ClinicStoryProfile = isWideViewport ? "desktop" : "mobile";
    const initialScrollVh =
      Math.max(0, -section.getBoundingClientRect().top) /
      Math.max(1, window.innerHeight / 100);
    if (profile === "mobile" && initialScrollVh < 90) {
      track.scrollLeft = 0;
    }
    let mounted = true;
    let frameRequest = 0;
    let lastFrameTime = performance.now();
    let targetJawProgress = 0;
    let dampedJaw: DampedMotionState = { value: 0, velocity: 0 };
    let mobileSnapStart: number | null = null;
    let desiredSegment = 0;
    let activeSlot = 0;
    const slotSegments = [0, 1];
    const queues: Array<LatestSeekQueue | null> = [null, null];

    const updateCallouts = (globalTime: number) => {
      const viewport = { width: pin.clientWidth || window.innerWidth, height: pin.clientHeight || window.innerHeight };
      section.dataset.displayedTime = globalTime.toFixed(4);

      for (const kind of calloutKinds) {
        const model = getJawTrackingModel(kind, globalTime, profile);
        const target = mapJawSourcePointToViewport(
          model.target,
          viewport,
          profile,
        );
        const card = cardRefs.current[kind];
        const path = pathRefs.current[kind];
        const dot = dotRefs.current[kind];
        const leader = leaderRefs.current[kind];
        const opacity = calloutOpacity(kind, globalTime);

        section.style.setProperty(`--${kind}-opacity`, String(opacity));
        if (!card || !path || !dot || !leader) continue;

        card.style.left = `${model.cardAnchor.x * viewport.width}px`;
        card.style.top = `${model.cardAnchor.y * viewport.height}px`;
        leader.setAttribute("viewBox", `0 0 ${viewport.width} ${viewport.height}`);

        const cardRect = card.getBoundingClientRect();
        const edge = cardEdgeTowardTarget(cardRect, target);
        const bendX = edge.x + (target.x - edge.x) * 0.58;
        path.setAttribute(
          "d",
          `M ${edge.x} ${edge.y} L ${bendX} ${edge.y} L ${target.x} ${target.y}`,
        );
        dot.setAttribute("cx", String(target.x));
        dot.setAttribute("cy", String(target.y));
      }
    };

    const createQueueForSlot = (slot: number, segmentIndex: number) => {
      const video = deck[slot];
      if (!video) return;
      queues[slot]?.cancel();
      slotSegments[slot] = segmentIndex;
      video.src = mediaSource(segmentIndex, profile);
      video.preload = "auto";
      video.style.opacity = hiddenLayerOpacity;

      queues[slot] = createLatestSeekQueue(video, (localTime) => {
        if (!mounted || slotSegments[slot] !== segmentIndex) return;
        const displayedTime = segmentIndex * 2 + localTime;

        if (desiredSegment === segmentIndex) {
          deck[activeSlot]?.style.setProperty("opacity", hiddenLayerOpacity);
          video.style.opacity = "1";
          activeSlot = slot;
          section.dataset.segment = String(segmentIndex + 1);
          updateCallouts(displayedTime);
        }
      });
    };

    if (deck.length === 2) {
      createQueueForSlot(0, 0);
      createQueueForSlot(1, 1);
      queues[0]?.request(0);
    }

    const requestJawTime = (globalTime: number) => {
      if (deck.length !== 2) return;
      const selection = selectJawSegment(globalTime);
      desiredSegment = selection.index;
      section.dataset.requestedTime = selection.globalTime.toFixed(4);

      if (slotSegments[activeSlot] === selection.index) {
        queues[activeSlot]?.request(selection.localTime);
        return;
      }

      const targetSlot = 1 - activeSlot;
      if (slotSegments[targetSlot] !== selection.index) {
        createQueueForSlot(targetSlot, selection.index);
      }
      queues[targetSlot]?.request(selection.localTime);
    };

    const writeHandoffGeometry = (zoom: number, blur: number) => {
      if (zoom <= 0) return;
      const rect = finalFrame.getBoundingClientRect();
      const inverse = 1 - zoom;
      section.style.setProperty("--handoff-left", `${rect.left * inverse}px`);
      section.style.setProperty("--handoff-top", `${rect.top * inverse}px`);
      section.style.setProperty(
        "--handoff-width",
        `${rect.width + (window.innerWidth - rect.width) * zoom}px`,
      );
      section.style.setProperty(
        "--handoff-height",
        `${rect.height + (window.innerHeight - rect.height) * zoom}px`,
      );
      section.style.setProperty("--handoff-blur", String(blur));
    };

    const renderDirectMotion = () => {
      const scrollVh =
        Math.max(0, -section.getBoundingClientRect().top) /
        Math.max(1, window.innerHeight / 100);
      const motion = mapClinicStoryMotion(scrollVh, profile);
      const travel = Math.max(0, track.scrollWidth - window.innerWidth);

      section.style.setProperty("--grow", String(motion.grow));
      section.style.setProperty("--pan", String(motion.pan));
      section.style.setProperty("--snap", String(motion.snap));
      section.style.setProperty("--zoom", String(motion.zoom));
      section.style.setProperty("--photo-blur", String(motion.blur));
      section.style.setProperty("--jaw-opacity", String(motion.jawOpacity));
      section.style.setProperty("--final-opacity", String(motion.finalOpacity));
      section.style.setProperty("--travel", `${travel}px`);

      if (profile === "mobile") {
        if (motion.snap > 0 && mobileSnapStart === null) {
          mobileSnapStart = track.scrollLeft;
        }
        if (motion.snap === 0) mobileSnapStart = null;
        if (mobileSnapStart !== null) {
          const targetScroll =
            finalFrame.offsetLeft -
            (window.innerWidth - finalFrame.offsetWidth) / 2;
          track.scrollLeft =
            mobileSnapStart + (targetScroll - mobileSnapStart) * motion.snap;
        }
      }

      writeHandoffGeometry(motion.zoom, motion.blur);
      targetJawProgress = motion.globalTime / 8;

      if (!frameRequest) {
        lastFrameTime = performance.now();
        frameRequest = window.requestAnimationFrame(tick);
      }
    };

    const tick = (now: number) => {
      frameRequest = 0;
      const deltaSeconds = Math.max(0, (now - lastFrameTime) / 1000);
      lastFrameTime = now;
      dampedJaw = stepCriticallyDamped(
        dampedJaw,
        targetJawProgress,
        deltaSeconds,
        0.18,
      );
      requestJawTime(dampedJaw.value * 8);

      if (
        mounted &&
        (Math.abs(dampedJaw.value - targetJawProgress) > 0.00005 ||
          Math.abs(dampedJaw.velocity) > 0.001)
      ) {
        frameRequest = window.requestAnimationFrame(tick);
      }
    };

    renderDirectMotion();
    dampedJaw = { value: targetJawProgress, velocity: 0 };
    requestJawTime(targetJawProgress * 8);
    window.addEventListener("scroll", renderDirectMotion, { passive: true });
    window.addEventListener("resize", renderDirectMotion);

    return () => {
      mounted = false;
      queues.forEach((queue) => queue?.cancel());
      window.cancelAnimationFrame(frameRequest);
      window.removeEventListener("scroll", renderDirectMotion);
      window.removeEventListener("resize", renderDirectMotion);
    };
  }, [isWideViewport, prefersReducedMotion]);

  return (
    <section
      className={`${styles.section} ${prefersReducedMotion ? styles.reduced : ""}`}
      ref={sectionRef}
      aria-labelledby="clinic-story-heading"
      style={{ pointerEvents: "auto" }}
    >
      <div className={styles.pin} ref={pinRef} data-testid="clinic-story-pin">
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

          <ul
            className={styles.track}
            ref={trackRef}
            data-native-swipe="true"
          >
            {photoFrames.map((frame, index) => (
              <li
                className={styles.frame}
                key={frame.id}
                ref={index === photoFrames.length - 1 ? finalFrameRef : undefined}
                data-testid={
                  index === photoFrames.length - 1
                    ? "clinic-story-final-frame"
                    : "clinic-gallery-frame"
                }
                data-gallery-frame="true"
                style={{ "--ratio": frame.ratio } as CSSProperties}
              >
                {frame.src ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Pre-cropped static clinic asset.
                  <img
                    className={styles.photo}
                    src={frame.src}
                    alt={`${frame.label} — Dental Centrum Dobeš`}
                    fetchPriority="low"
                    decoding="async"
                  />
                ) : (
                  <div className={styles.placeholder}>
                    <span className={styles.placeholderIndex}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.placeholderLabel}>{frame.label}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <picture className={styles.handoffPicture}>
          <source
            media="(max-width: 767px)"
            srcSet="/media/strip-07-detail-mobile.jpg"
          />
          <img
            className={styles.handoffPhoto}
            data-testid="clinic-story-handoff"
            src="/media/strip-07-detail.jpg"
            alt=""
            aria-hidden="true"
            decoding="async"
          />
        </picture>

        <div className={styles.jawLayer}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Static continuity frame beneath decoded video. */}
          <img
            className={styles.poster}
            src="/media/jaw-story/jaw-poster.jpg"
            alt=""
            aria-hidden="true"
          />
          {!prefersReducedMotion && (
            <div className={styles.mediaDeck} aria-hidden="true">
              {[0, 1].map((slot) => (
                <video
                  className={styles.videoLayer}
                  data-testid="jaw-video-layer"
                  key={slot}
                  ref={(node) => {
                    videoRefs.current[slot] = node;
                  }}
                  src={mediaSource(slot, isWideViewport ? "desktop" : "mobile")}
                  muted
                  playsInline
                  preload="auto"
                  poster="/media/jaw-story/jaw-poster.jpg"
                />
              ))}
            </div>
          )}
          <div className={styles.scrim} aria-hidden="true" />
        </div>

        <div className={styles.annotations}>
          {calloutKinds.map((kind) => {
            const content = callouts[kind];
            return (
              <div className={`${styles.callout} ${styles[kind]}`} key={kind}>
                <svg
                  className={styles.leader}
                  ref={(node) => {
                    if (node) leaderRefs.current[kind] = node;
                  }}
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    ref={(node) => {
                      if (node) pathRefs.current[kind] = node;
                    }}
                    pathLength="1"
                  />
                  <circle
                    ref={(node) => {
                      if (node) dotRefs.current[kind] = node;
                    }}
                    r="4"
                  />
                </svg>
                <article
                  className={styles.calloutCard}
                  ref={(node) => {
                    if (node) cardRefs.current[kind] = node;
                  }}
                >
                  <p className={styles.calloutEyebrow}>{content.eyebrow}</p>
                  <h3>{content.title}</h3>
                  <p>{content.copy}</p>
                </article>
              </div>
            );
          })}
        </div>

        <div className={styles.finalCopy}>
          <p>Dental Centrum Dobeš</p>
          <h2>Jeden plán. Každý zub v&nbsp;súvislostiach.</h2>
        </div>
      </div>
    </section>
  );
}
