"use client";

import type { JSX } from "react";

import { useOpenStatus } from "@/components/site/useOpenStatus";

/** "Dnes otvorené do 19:00", with a green dot while the clinic is open. */
export function OpenNow({ className, dotClassName }: {
  readonly className?: string;
  readonly dotClassName?: string;
}): JSX.Element | null {
  const { label, open } = useOpenStatus();
  if (!label) return null;
  return (
    <span className={className} data-open={open}>
      <span aria-hidden="true" className={dotClassName} data-open={open} />
      {label}
    </span>
  );
}
