"use client";

import { useEffect, useState, type JSX } from "react";
import styles from "./hero.module.css";

const transitionMs = 560;

type RotatingHeadlineProps = Readonly<{
  variants: readonly string[];
  intervalMs: number;
  finalHoldMs: number;
}>;

export function RotatingHeadline({
  variants,
  intervalMs,
  finalHoldMs,
}: RotatingHeadlineProps): JSX.Element {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");

  useEffect(() => {
    if (
      variants.length < 2 ||
      globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    let transitionTimer: ReturnType<typeof setTimeout> | undefined;
    let currentIndex = 0;

    const scheduleRotation = (holdMs: number) => {
      holdTimer = setTimeout(() => {
        setPhase("out");

        transitionTimer = setTimeout(() => {
          currentIndex = (currentIndex + 1) % variants.length;
          const nextHold =
            currentIndex === variants.length - 1 ? finalHoldMs : intervalMs;

          setIndex(currentIndex);
          setPhase("in");
          scheduleRotation(nextHold);
        }, transitionMs);
      }, holdMs);
    };

    scheduleRotation(intervalMs);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(transitionTimer);
    };
  }, [finalHoldMs, intervalMs, variants]);

  const phaseClass =
    phase === "out" ? styles.out : phase === "in" ? styles.in : "";

  return (
    <span className={styles.rotating}>
      <span className={`${styles.variant} ${phaseClass}`}>
        {variants[index] ?? ""}
      </span>
    </span>
  );
}
