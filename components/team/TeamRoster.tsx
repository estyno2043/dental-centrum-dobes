"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState, type JSX } from "react";
import { PortraitPlate } from "./PortraitPlate";
import { TeamMemberDialog } from "./TeamMemberDialog";
import { teamGroups, type TeamMember } from "./teamContent";
import { useMediaQuery } from "../hero/useMediaQuery";
import styles from "./team.module.css";

const premiumEase = [0.22, 1, 0.36, 1] as const;

/**
 * The page's centrepiece: an index of names rather than a grid of headshots.
 *
 * A grid shows everyone at once and says nothing about any of them. Reading a
 * list one name at a time is how you meet people, so the list leads and a
 * single large portrait follows the reader's attention. Pointer and keyboard
 * drive the same state, so tabbing through the names is not a degraded path —
 * it is the same experience without a mouse.
 *
 * Below 900px the stage would fight the list for the fold, so each row carries
 * its own portrait instead and the stage is not rendered at all.
 */
export function TeamRoster(): JSX.Element {
  const members = useMemo(
    () => teamGroups.flatMap((group) => group.members),
    [],
  );

  const [activeId, setActiveId] = useState(members[0].id);
  const [openMember, setOpenMember] = useState<TeamMember | null>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const hasStage = useMediaQuery("(min-width: 900px)", true);

  const active =
    members.find((member) => member.id === activeId) ?? members[0];
  const activeIndex = members.indexOf(active);

  return (
    <section className={styles.roster} aria-labelledby="roster-heading">
      <h2 className={styles.visuallyHidden} id="roster-heading">
        Ľudia v tíme
      </h2>

      {hasStage ? (
        <div className={styles.stage} aria-hidden="true">
          <div className={styles.stageFrame}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={active.id}
                className={styles.stageLayer}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 1.04, y: 18 }
                }
                animate={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 1, scale: 1, y: 0 }
                }
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.99, y: -12 }
                }
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.72,
                  ease: premiumEase,
                }}
              >
                <PortraitPlate member={active} eager />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className={styles.stageMeta}>
            <span className={styles.stageIndex}>
              {String(activeIndex + 1).padStart(2, "0")}
              <span className={styles.stageCount}>
                /{String(members.length).padStart(2, "0")}
              </span>
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={active.id}
                className={styles.stageFocus}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.4,
                  ease: premiumEase,
                }}
              >
                {active.focus}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      ) : null}

      <div className={styles.index}>
        {teamGroups.map((group) => (
          <div className={styles.group} key={group.id}>
            <h3 className={styles.groupLabel}>{group.label}</h3>
            <ul className={styles.list}>
              {group.members.map((member) => {
                const isActive = hasStage && member.id === active.id;

                return (
                  <li key={member.id}>
                    <button
                      type="button"
                      className={`${styles.row} ${isActive ? styles.rowActive : ""}`}
                      onPointerEnter={() => setActiveId(member.id)}
                      onFocus={() => setActiveId(member.id)}
                      onClick={() => setOpenMember(member)}
                      aria-label={`${member.name}, ${member.role} — otvoriť profil`}
                    >
                      {hasStage ? null : (
                        <span className={styles.rowPortrait} aria-hidden="true">
                          <PortraitPlate member={member} />
                        </span>
                      )}

                      <span className={styles.rowBody}>
                        <span className={styles.rowName}>{member.name}</span>
                        <span className={styles.rowRole}>{member.role}</span>
                        {hasStage ? null : (
                          <span className={styles.rowFocus}>{member.focus}</span>
                        )}
                      </span>

                      <span className={styles.rowMarker} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <TeamMemberDialog
        member={openMember}
        onClose={() => setOpenMember(null)}
      />
    </section>
  );
}
