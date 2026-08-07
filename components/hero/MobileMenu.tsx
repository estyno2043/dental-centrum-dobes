"use client";

/* eslint-disable jsx-a11y/anchor-is-valid -- Destinations stay as approved placeholders until their sections exist. */

import * as Dialog from "@radix-ui/react-dialog";
import {
  IconDental,
  IconMenuDeep,
  IconX,
} from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type JSX } from "react";
import { navigationItems } from "./heroContent";
import styles from "./hero.module.css";

const premiumEase = [0.22, 1, 0.36, 1] as const;

export function MobileMenu(): JSX.Element {
  const [open, setOpen] = useState(false);
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
          transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: premiumEase }}
        >
          <motion.span
            className={styles.mobileMenuOrbit}
            aria-hidden="true"
            animate={{ rotate: open && !prefersReducedMotion ? 38 : 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: premiumEase }}
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

      <Dialog.Portal>
        <AnimatePresence>
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
                  exit={{ opacity: 0, x: movement }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.58,
                    ease: premiumEase,
                  }}
                >
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
                          <a className={styles.mobileMenuLink} href={item.href}>
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
                        Prehliadka kliniky
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
