"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { IconX } from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { JSX } from "react";
import { PortraitPlate } from "./PortraitPlate";
import type { TeamMember } from "./teamContent";
import styles from "./team.module.css";

const premiumEase = [0.22, 1, 0.36, 1] as const;

/**
 * The profile a name opens into.
 *
 * Radix owns focus trapping, scroll locking and Escape, matching the mobile
 * menu already in the project rather than inventing a second dialog dialect.
 * `forceMount` hands the exit animation to AnimatePresence, which Radix would
 * otherwise cut short by unmounting immediately.
 */
export function TeamMemberDialog({
  member,
  onClose,
}: {
  member: TeamMember | null;
  onClose: () => void;
}): JSX.Element {
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <Dialog.Root
      open={member !== null}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <Dialog.Portal forceMount>
        <AnimatePresence>
          {member ? (
            <>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className={styles.dialogOverlay}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
                />
              </Dialog.Overlay>

              <Dialog.Content asChild forceMount>
                <motion.div
                  className={styles.dialogPanel}
                  initial={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: 40, scale: 0.98 }
                  }
                  animate={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : { opacity: 1, y: 0, scale: 1 }
                  }
                  exit={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: 24, scale: 0.99 }
                  }
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.5,
                    ease: premiumEase,
                  }}
                >
                  <div className={styles.dialogPortrait}>
                    <PortraitPlate member={member} eager />
                  </div>

                  <div className={styles.dialogBody}>
                    <p className={styles.dialogRole}>{member.role}</p>
                    <Dialog.Title className={styles.dialogName}>
                      {member.name}
                    </Dialog.Title>
                    <Dialog.Description className={styles.dialogFocus}>
                      {member.focus}
                    </Dialog.Description>

                    <p className={styles.dialogBio}>{member.bio}</p>

                    <dl className={styles.dialogFacts}>
                      <div>
                        <dt>V tíme od</dt>
                        <dd>{member.since}</dd>
                      </div>
                      <div>
                        <dt>Jazyky</dt>
                        <dd>{member.languages.join(" · ")}</dd>
                      </div>
                    </dl>
                  </div>

                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className={styles.dialogClose}
                      aria-label="Zavrieť profil"
                    >
                      <IconX stroke={1.7} />
                    </button>
                  </Dialog.Close>
                </motion.div>
              </Dialog.Content>
            </>
          ) : null}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
