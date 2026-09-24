"use client";

/* eslint-disable jsx-a11y/anchor-is-valid -- Destinations stay as approved placeholders until their sections exist. */

import * as Dialog from "@radix-ui/react-dialog";
import {
  IconDental,
  IconMenuDeep,
  IconX,
} from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState, type JSX } from "react";
import {
  scrollToSection,
  sectionIdFromHref,
} from "@/components/scroll/scrollToSection";
import { navigationItems } from "./heroContent";
import styles from "./hero.module.css";

const premiumEase = [0.22, 1, 0.36, 1] as const;

export function MobileMenu(): JSX.Element {
  const [open, setOpen] = useState(false);
  /*
   * The section a link asked for, travelled to once the panel has left.
   *
   * Not on click: the dialog holds the page's scroll locked for as long as it
   * is mounted, and it stays mounted through its exit animation, so a scroll
   * started any earlier goes nowhere.
   */
  const pendingSectionRef = useRef<string | null>(null);

  const travelToPendingSection = () => {
    const id = pendingSectionRef.current;
    pendingSectionRef.current = null;
    if (!id) return;
    /*
     * One task later, so the scroll lock is released before we move. Eased
     * scrolling takes the trip where it runs; it is off on touch devices, and
     * there the browser's own scroll is the answer rather than nothing.
     */
    setTimeout(() => {
      if (scrollToSection(id)) return;
      document.getElementById(id)?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }, 0);
  };
  const prefersReducedMotion = useReducedMotion() ?? false;
  const movement = prefersReducedMotion ? 0 : 28;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <motion.button
          type="button"
          aria-label="Otvoriť menu"
          className={styles.mobileMenuTrigger}
          animate={{ scale: open && !prefersReducedMotion ? 0.96 : 1 }}
          /*
           * A spring on the way back, so the corner settles rather than
           * arriving. Only the release is worth a bounce; the press is not.
           */
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : open
                ? { duration: 0.35, ease: premiumEase }
                : { type: "spring", bounce: 0.28, duration: 0.6 }
          }
        >
          <motion.span
            className={styles.mobileMenuOrbit}
            aria-hidden="true"
              animate={{ rotate: open && !prefersReducedMotion ? 38 : 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : open
                  ? { duration: 0.6, ease: premiumEase }
                  : { type: "spring", bounce: 0.24, duration: 0.7 }
            }
          />
          <span className={styles.mobileMenuTooth} aria-hidden="true">
            <IconDental stroke={1.6} />
          </span>
          <span className={styles.mobileMenuDivider} aria-hidden="true" />
          <span className={styles.mobileMenuAction} aria-hidden="true">
            <IconMenuDeep stroke={1.7} />
            <span>Menu</span>
          </span>
        </motion.button>
      </Dialog.Trigger>

      {/*
        * `forceMount` on the portal as well as its children. Without it Radix
        * removes the portal subtree the moment `open` turns false, so the
        * panel is gone before `AnimatePresence` can run an exit and the menu
        * appears to vanish rather than leave.
        */}
      <Dialog.Portal forceMount>
        <AnimatePresence onExitComplete={travelToPendingSection}>
          {open ? (
            <>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className={styles.mobileMenuOverlay}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
                />
              </Dialog.Overlay>

              <Dialog.Content asChild forceMount>
                <motion.div
                  className={styles.mobileMenuPanel}
                  initial={{ opacity: 0, x: movement }}
                  animate={{ opacity: 1, x: 0 }}
                  /*
                   * Further out than it came in, and with the ease mirrored,
                   * so leaving reads as travel rather than a cut. Enter and
                   * exit still follow the same path.
                   */
                  exit={{ opacity: 0, x: movement * 2.4 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.52,
                    ease: premiumEase,
                  }}
                >
                  {/*
                   * A gradient that only exists on the way out: it sweeps
                   * across the panel as the panel slides, so the two read as
                   * one movement instead of the panel simply fading.
                   */}
                  <motion.span
                    aria-hidden="true"
                    className={styles.mobileMenuSheen}
                    initial={{ opacity: 0, x: "-120%" }}
                    animate={{ opacity: 0, x: "-120%" }}
                    exit={{ opacity: prefersReducedMotion ? 0 : 1, x: "120%" }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.52,
                      ease: premiumEase,
                    }}
                  />
                  <Dialog.Title className={styles.visuallyHidden}>
                    Hlavná navigácia
                  </Dialog.Title>
                  <Dialog.Description className={styles.visuallyHidden}>
                    Navigácia Dental Centrum Dobeš
                  </Dialog.Description>

                  <div className={styles.mobileMenuPanelHeader}>
                    <span className={styles.mobileMenuEyebrow}>Dental Centrum Dobeš</span>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className={styles.mobileMenuClose}
                        aria-label="Zavrieť menu"
                      >
                        <IconDental aria-hidden="true" stroke={1.5} />
                        <IconX aria-hidden="true" stroke={1.6} />
                      </button>
                    </Dialog.Close>
                  </div>

                  <motion.nav
                    aria-label="Mobilná navigácia"
                    className={styles.mobileMenuLinks}
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: {
                        transition: {
                          delayChildren: prefersReducedMotion ? 0 : 0.12,
                          staggerChildren: prefersReducedMotion ? 0 : 0.06,
                        },
                      },
                    }}
                  >
                    {navigationItems.map((item, index) => (
                      <motion.div
                        key={item.label}
                        variants={{
                          hidden: {
                            opacity: 0,
                            x: prefersReducedMotion ? 0 : 14,
                            y: prefersReducedMotion ? 0 : 12,
                          },
                          visible: { opacity: 1, x: 0, y: 0 },
                        }}
                        transition={{
                          duration: prefersReducedMotion ? 0 : 0.5,
                          ease: premiumEase,
                        }}
                      >
                        <Dialog.Close asChild>
                          <a
                            className={styles.mobileMenuLink}
                            href={item.href}
                            onClick={(event) => {
                              const id = sectionIdFromHref(item.href);
                              /* Another page, or no such section here: let the
                                 browser navigate as usual. */
                              if (!id || !document.getElementById(id)) return;
                              event.preventDefault();
                              pendingSectionRef.current = id;
                              /*
                                Closed by hand: `Dialog.Close` skips its own
                                close when the link's handler has called
                                `preventDefault`, so without this the panel
                                stayed open over a page that never moved.
                              */
                              setOpen(false);
                            }}
                          >
                            <span aria-hidden="true">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            {item.label}
                          </a>
                        </Dialog.Close>
                      </motion.div>
                    ))}
                  </motion.nav>

                  <div className={styles.mobileMenuFooter}>
                    <Dialog.Close asChild>
                      <a className={styles.mobileMenuTour} href="#">
                        Interaktívna prehliadka klinikou
                        <span aria-hidden="true">↗</span>
                      </a>
                    </Dialog.Close>
                    <a className={styles.mobileMenuPhone} href="tel:+421918800002">
                      <span>Objednajte sa</span>
                      <strong>0918 800 002</strong>
                    </a>
                  </div>
                </motion.div>
              </Dialog.Content>
            </>
          ) : null}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
