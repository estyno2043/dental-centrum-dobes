"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { IconArrowNarrowRight, IconPhone } from "@tabler/icons-react";

import { clinicPhone } from "@/components/site/siteContent";
import styles from "./stickyBookingBar.module.css";

/**
 * The way to act, one tap away wherever the reader decides.
 *
 * Non-invasive by construction: it stays away for the first half-screen, so
 * the page opens clean; it leaves the moment the booking panel is on screen,
 * so it never sits over the form it points to; and it covers nothing a
 * reader has to read, because it is a slim bar at the foot of the screen on a
 * phone and a pill in the corner on a desktop.
 *
 * `inert` while hidden, so the keyboard and screen readers skip it rather
 * than landing on an invisible button.
 */
export function StickyBookingBar({
  serviceName,
  price,
}: {
  readonly serviceName: string;
  /** Shown on the entry page, where the price is the argument. */
  readonly price?: { readonly now: string; readonly was?: string };
}): JSX.Element {
  const [visible, setVisible] = useState(false);
  const frame = useRef(0);

  useEffect(() => {
    const update = () => {
      frame.current = 0;
      const booking = document.getElementById("booking");
      const past = window.scrollY > window.innerHeight * 0.5;
      const bookingInView = booking
        ? booking.getBoundingClientRect().top < window.innerHeight * 0.92
        : false;
      setVisible(past && !bookingInView);
    };
    const onScroll = () => {
      if (!frame.current) frame.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-label="Objednanie"
      className={styles.bar}
      data-visible={visible}
      inert={!visible}
      role="region"
    >
      <p className={styles.context}>
        {price ? (
          <>
            <strong>{price.now}</strong>
            {price.was ? <s>{price.was}</s> : null}
          </>
        ) : (
          <span>{serviceName}</span>
        )}
      </p>
      <a className={styles.call} href={clinicPhone.href}>
        <IconPhone aria-hidden="true" size={18} stroke={1.8} />
        <span className={styles.callLabel}>{clinicPhone.label}</span>
        <span className={styles.callShort}>Zavolať</span>
      </a>
      <a className={styles.book} href="#booking">
        Objednať sa
        <IconArrowNarrowRight aria-hidden="true" size={18} stroke={1.8} />
      </a>
    </div>
  );
}
