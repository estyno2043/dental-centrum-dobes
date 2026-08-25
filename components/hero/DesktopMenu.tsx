"use client";

import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type JSX,
  type KeyboardEvent,
} from "react";
import { IconDental, IconMenuDeep } from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";
import { navigationItems } from "./heroContent";
import styles from "./hero.module.css";

const openDelayMs = 90;
const closeDelayMs = 220;
const premiumEase = [0.22, 1, 0.36, 1] as const;

type DesktopMenuProps = Readonly<{
  scrolled: boolean;
  /**
   * What the panel will be standing on when it opens. Its glass is a dark
   * tint, which over a pale section turns into a light wash and takes the
   * white type with it — so on light ground it has to weigh more.
   */
  ground: "dark" | "light";
}>;

export function DesktopMenu({ ground, scrolled }: DesktopMenuProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const suppressFocusOpenRef = useRef(false);
  const prefersReducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    return () => {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
    };
  }, []);

  const clearTimers = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  };

  const close = () => {
    clearTimers();
    setOpen(false);
  };

  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current);
    if (open) return;
    openTimer.current = setTimeout(() => setOpen(true), openDelayMs);
  };

  const handleMouseLeave = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), closeDelayMs);
  };

  const handleFocus = () => {
    // A mousedown on the trigger focuses it natively just before the click
    // handler runs; skip the focus-driven open here so the click's own
    // toggle is the single source of truth for mouse interactions.
    if (suppressFocusOpenRef.current) {
      suppressFocusOpenRef.current = false;
      return;
    }
    clearTimers();
    setOpen(true);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (rootRef.current?.contains(event.relatedTarget as Node | null)) return;
    close();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      close();
      triggerRef.current?.focus();
    }
  };

  return (
    // This wrapper only delegates hover/focus/keyboard events for its own
    // focusable children (the trigger button and panel links/CTA); it
    // carries no semantics of its own and needs no role or tab stop.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={rootRef}
      className={[styles.desktopMenuRoot, scrolled ? styles.scrolled : ""]
        .filter(Boolean)
        .join(" ")}
      data-ground={ground}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label="Otvoriť navigáciu"
        aria-expanded={open}
        aria-controls="desktop-menu-panel"
        className={styles.desktopMenuTrigger}
        onMouseDown={() => {
          suppressFocusOpenRef.current = true;
        }}
        onClick={() => {
          suppressFocusOpenRef.current = false;
          clearTimers();
          setOpen((value) => !value);
        }}
      >
        <span className={styles.mobileMenuTooth} aria-hidden="true">
          <IconDental stroke={1.6} />
        </span>
        <span className={styles.mobileMenuDivider} aria-hidden="true" />
        <span className={styles.mobileMenuAction} aria-hidden="true">
          <IconMenuDeep stroke={1.7} />
          <span>Menu</span>
        </span>
      </button>

      <motion.div
        id="desktop-menu-panel"
        className={styles.desktopMenuPanel}
        inert={!open}
        style={{ pointerEvents: open ? "auto" : "none" }}
        initial={false}
        animate={
          prefersReducedMotion
            ? { opacity: open ? 1 : 0 }
            : { opacity: open ? 1 : 0, y: open ? 0 : -10, scale: open ? 1 : 0.97 }
        }
        transition={{ duration: prefersReducedMotion ? 0 : 0.38, ease: premiumEase }}
      >
        <motion.nav
          aria-label="Navigácia"
          className={styles.desktopMenuLinks}
          initial={false}
          animate={open ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: {
              transition: {
                delayChildren: prefersReducedMotion ? 0 : 0.06,
                staggerChildren: prefersReducedMotion ? 0 : 0.06,
              },
            },
          }}
        >
          {navigationItems.map((item, index) => (
            <motion.a
              key={item.label}
              href={item.href}
              className={styles.desktopMenuLink}
              variants={{
                hidden: { opacity: 0, x: prefersReducedMotion ? 0 : 16 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.42, ease: premiumEase }}
            >
              <span aria-hidden="true" className={styles.desktopMenuIndex}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item.label}</span>
              {/* Says where the row goes; the label already says what it is. */}
              <span aria-hidden="true" className={styles.desktopMenuArrow}>
                →
              </span>
            </motion.a>
          ))}
        </motion.nav>

        <div className={styles.desktopMenuFooter}>
          <a className={styles.mobileMenuPhone} href="tel:+421918800002">
            <span>Objednajte sa</span>
            <strong>0918 800 002</strong>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
