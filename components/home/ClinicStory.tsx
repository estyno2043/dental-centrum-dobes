"use client";

import { useEffect, useRef, type CSSProperties, type JSX } from "react";
import { useMediaQuery } from "../hero/useMediaQuery";
import {
  mapClinicStoryMotion,
  type ClinicStoryProfile,
} from "./clinicStoryMotion";
import {
  JawExperience,
  type JawExperienceHandle,
} from "./jaw/JawExperience";
import { NetlifyJawFormDefinition } from "./jaw/NetlifyJawFormDefinition";
import { photoFrames, photoStripIntro } from "./photoStripContent";
import styles from "./clinicStory.module.css";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const wideViewportQuery = "(min-width: 768px)";

export function ClinicStory(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const finalFrameRef = useRef<HTMLLIElement>(null);
  const jawExperienceRef = useRef<JawExperienceHandle>(null);
  const prefersReducedMotion = useMediaQuery(reducedMotionQuery, true);
  const isWideViewport = useMediaQuery(wideViewportQuery, false);
  const profile: ClinicStoryProfile = isWideViewport ? "desktop" : "mobile";

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const finalFrame = finalFrameRef.current;
    if (prefersReducedMotion || !section || !track || !finalFrame) return;

    let frameRequest = 0;
    let mobileSnapStart: number | null = null;

    const writeHandoffGeometry = (zoom: number, blur: number): void => {
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

    const renderMotion = (): void => {
      frameRequest = 0;
      const scrollVh =
        Math.max(0, -section.getBoundingClientRect().top) /
        Math.max(1, window.innerHeight / 100);
      const motion = mapClinicStoryMotion(scrollVh, profile);
      const travel = Math.max(0, track.scrollWidth - window.innerWidth);

      section.style.setProperty("--grow", String(motion.grow));
      section.style.setProperty("--pan", String(motion.pan));
      section.style.setProperty("--snap", String(motion.snap));
      section.style.setProperty("--zoom", String(motion.zoom));
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
      jawExperienceRef.current?.setMotion(motion);
    };

    const scheduleRender = (): void => {
      if (!frameRequest) {
        frameRequest = window.requestAnimationFrame(renderMotion);
      }
    };

    const initialScrollVh =
      Math.max(0, -section.getBoundingClientRect().top) /
      Math.max(1, window.innerHeight / 100);
    if (profile === "mobile" && initialScrollVh < 90) track.scrollLeft = 0;

    scheduleRender();
    window.addEventListener("scroll", scheduleRender, { passive: true });
    window.addEventListener("resize", scheduleRender);

    return () => {
      window.cancelAnimationFrame(frameRequest);
      window.removeEventListener("scroll", scheduleRender);
      window.removeEventListener("resize", scheduleRender);
    };
  }, [prefersReducedMotion, profile]);

  return (
    <section
      className={`${styles.section} ${prefersReducedMotion ? styles.reduced : ""}`}
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

        <div className={styles.jawHost} data-testid="jaw-experience-host">
          <JawExperience
            ref={jawExperienceRef}
            profile={profile}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
      </div>

      <NetlifyJawFormDefinition />
    </section>
  );
}
