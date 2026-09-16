"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { PatientCase } from "./patientsContent";
import styles from "./patients.module.css";

/**
 * Before/after comparison with a draggable divider.
 *
 * A native `<input type="range">` is still the control a keyboard and a
 * screen reader meet: arrow keys, Home/End, and an announced value, none of
 * which is worth hand-writing. It is no longer the pointer target, though,
 * because stretching one across the frame only ever worked with a mouse — on
 * iOS a range responds to a touch that starts on its thumb and ignores the
 * rest of the track, so a 44px strip at the divider was the only place the
 * photograph could be dragged from, and every other touch scrolled the page.
 *
 * Pointer events cover mouse, finger and pen in one path, and the frame takes
 * them so a drag starts anywhere. `touch-action: pan-y` is what makes that
 * safe: the browser keeps vertical scrolling, and only the horizontal gesture
 * comes here.
 *
 * During a drag the position is written straight to the element as `--pos`
 * rather than through state, so a move costs a style write instead of a React
 * render. State is committed once on release, which is also what keeps the
 * native input's value in step for whoever picks it up with the keyboard.
 */
export function BeforeAfter({
  patientCase,
}: {
  patientCase: PatientCase;
}): JSX.Element {
  const [position, setPosition] = useState(50);
  const frameRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const draggingRef = useRef(false);
  const liveRef = useRef(50);
  const labelId = useId();

  const hasPhotos = Boolean(patientCase.before && patientCase.after);

  const paint = useCallback((next: number) => {
    liveRef.current = next;
    frameRef.current?.style.setProperty("--pos", `${next}%`);
    /* Keep the real control honest, so arrowing after a drag continues from
       where the finger left off rather than from the last committed render. */
    if (inputRef.current) inputRef.current.value = String(Math.round(next));
  }, []);

  const positionFrom = useCallback((clientX: number): number | null => {
    const frame = frameRef.current;
    if (!frame) return null;
    const rect = frame.getBoundingClientRect();
    if (rect.width === 0) return null;
    const ratio = (clientX - rect.left) / rect.width;
    return Math.min(100, Math.max(0, ratio * 100));
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const next = positionFrom(event.clientX);
      if (next === null) return;
      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      paint(next);
      /*
       * Only a mouse gets focused here. Touch does not use arrow keys, and
       * focusing on every tap would draw the frame's focus ring around each
       * drag.
       */
      if (event.pointerType === "mouse") {
        inputRef.current?.focus({ preventScroll: true });
      }
    },
    [paint, positionFrom],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      const next = positionFrom(event.clientX);
      if (next !== null) paint(next);
    },
    [paint, positionFrom],
  );

  const endDrag = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setPosition(Math.round(liveRef.current));
  }, []);

  return (
    <div
      className={styles.compare}
      data-testid="before-after"
      onPointerCancel={endDrag}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      ref={frameRef}
      style={{ "--pos": `${position}%` } as CSSProperties}
    >
      <div className={styles.layerAfter}>
        {hasPhotos ? (
          // eslint-disable-next-line @next/next/no-img-element -- Pre-cropped case photography; the image service adds nothing here.
          <img src={patientCase.after} alt={`Po ošetrení — ${patientCase.problem}`} />
        ) : (
          <span className={styles.placeholder} data-side="po">
            Po
          </span>
        )}
      </div>

      <div className={styles.layerBefore}>
        {hasPhotos ? (
          // eslint-disable-next-line @next/next/no-img-element -- Pre-cropped case photography; the image service adds nothing here.
          <img src={patientCase.before} alt={`Pred ošetrením — ${patientCase.problem}`} />
        ) : (
          <span className={styles.placeholder} data-side="pred">
            Pred
          </span>
        )}
      </div>

      <span className={styles.divider} aria-hidden="true">
        <span className={styles.knob} />
      </span>

      <span className={styles.visuallyHidden} id={labelId}>
        Porovnanie pred a po ošetrením: {patientCase.problem}
      </span>
      <input
        aria-labelledby={labelId}
        aria-valuetext={`Zobrazené ${position} % stavu pred ošetrením`}
        className={styles.range}
        max={100}
        min={0}
        onChange={(event) => {
          const next = Number(event.target.value);
          liveRef.current = next;
          setPosition(next);
        }}
        ref={inputRef}
        step={1}
        type="range"
        value={position}
      />
    </div>
  );
}
