"use client";

import { useSyncExternalStore } from "react";

import { openingHours } from "./siteContent";

const subscribe = (onChange: () => void): (() => void) => {
  const timer = setInterval(onChange, 60_000);
  return () => clearInterval(timer);
};

const currentMinute = (): number => Math.floor(Date.now() / 60_000);

export type OpenStatus = {
  /** The row for today, or undefined on a closed day. */
  readonly today: (typeof openingHours)[number] | undefined;
  /** "Dnes otvorené do 19:00" and the like; null until mounted. */
  readonly label: string | null;
  /** True while the clinic is open right now. */
  readonly open: boolean;
};

/**
 * Whether the clinic is open, from the reader's clock.
 *
 * `useSyncExternalStore` with a `null` server snapshot, so the server and the
 * first client render agree (no status) and the real one arrives after
 * hydration, then refreshes once a minute. Shared by the footer and the
 * booking panel on the service pages.
 */
export function useOpenStatus(): OpenStatus {
  const minute = useSyncExternalStore<number | null>(
    subscribe,
    currentMinute,
    () => null,
  );
  const now = minute === null ? null : new Date(minute * 60_000);

  const day = now?.getDay();
  const today = openingHours.find((row) =>
    day === undefined ? false : (row.weekdays as readonly number[]).includes(day),
  );

  if (!now) return { today, label: null, open: false };
  if (!today) return { today, label: "Dnes máme zatvorené", open: false };
  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour < today.opens) {
    return { today, label: `Dnes otvárame o ${today.opens}:00`, open: false };
  }
  if (hour < today.closes) {
    return { today, label: `Dnes otvorené do ${today.closes}:00`, open: true };
  }
  return { today, label: "Dnes máme zatvorené", open: false };
}
