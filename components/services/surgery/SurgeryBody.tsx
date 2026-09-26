import Link from "next/link";
import type { JSX } from "react";
import { IconArrowNarrowRight, IconCheck } from "@tabler/icons-react";

import {
  IconExtraction,
  IconImplant,
  IconMucosa,
  IconResection,
  IconWisdom,
  WisdomScene,
} from "./SurgeryArt";
import {
  aftercare,
  healing,
  honesty,
  opening,
  prices,
  procedures,
} from "./surgeryContent";
import styles from "./surgery.module.css";

const PROCEDURE_ICONS = {
  osmicky: IconWisdom,
  extrakcie: IconExtraction,
  resekcie: IconResection,
  implantaty: IconImplant,
  sliznice: IconMucosa,
} as const;

/**
 * The body of `/sluzby/stomatochirurgia`.
 *
 * Built 2026-09-26 to be calm: sand, walnut and a soft clay, a drawn wisdom
 * tooth rather than anything graphic. It answers the two fears first, how bad
 * and how long, in the clinic's own plain words, and puts the prices where
 * they can be read at a glance.
 */
export function SurgeryBody(): JSX.Element {
  return (
    <>
      {/* --- the promise ------------------------------------------------ */}
      <section aria-labelledby="opening-heading" className={styles.opening}>
        <div>
          <h2 className={styles.openingHeading} id="opening-heading">
            {opening.heading}
          </h2>
          <p className={styles.openingBody}>{opening.body}</p>
          <dl className={styles.facts}>
            {opening.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <WisdomScene className={styles.scene} pathClassName={styles.ghost} />
      </section>

      {/* --- what we do ------------------------------------------------- */}
      <section aria-labelledby="procedures-heading" className={styles.block}>
        <h2 className={styles.sectionHeading} id="procedures-heading">
          {procedures.heading}
        </h2>
        <ul className={styles.procedures}>
          {procedures.items.map((item) => {
            const Glyph = PROCEDURE_ICONS[item.id as keyof typeof PROCEDURE_ICONS];
            return (
              <li key={item.id}>
                <Glyph className={styles.procedureIcon} />
                <h3>{item.name}</h3>
                <p>{item.note}</p>
                {item.link ? (
                  <Link className={styles.procedureLink} href={item.link.href}>
                    <span>{item.link.label}</span>
                    <IconArrowNarrowRight size={16} stroke={1.7} />
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      {/* --- the honest part, on walnut --------------------------------- */}
      <section aria-labelledby="honesty-heading" className={styles.honesty}>
        <div className={styles.honestyInner}>
          <div>
            <h2 className={styles.honestyHeading} id="honesty-heading">
              {honesty.heading}
            </h2>
            <p className={styles.honestyBody}>{honesty.body}</p>
          </div>
          <div className={styles.sedation}>
            <h3>{honesty.sedation.title}</h3>
            <p>{honesty.sedation.body}</p>
          </div>
        </div>
      </section>

      {/* --- healing ---------------------------------------------------- */}
      <section aria-labelledby="healing-heading" className={styles.block}>
        <h2 className={styles.sectionHeading} id="healing-heading">
          {healing.heading}
        </h2>
        <ol className={styles.timeline}>
          {healing.steps.map((step) => (
            <li key={step.title}>
              <span aria-hidden="true" className={styles.dot} />
              <p className={styles.when}>{step.when}</p>
              <h3>{step.title}</h3>
              <p className={styles.stepNote}>{step.note}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* --- aftercare -------------------------------------------------- */}
      <section aria-labelledby="aftercare-heading" className={styles.block}>
        <div className={styles.aftercare}>
          <h2 className={styles.aftercareHeading} id="aftercare-heading">
            {aftercare.heading}
          </h2>
          <p className={styles.aftercareNote}>{aftercare.note}</p>
          <ul className={styles.aftercareList}>
            {aftercare.items.map((item) => (
              <li key={item}>
                <span aria-hidden="true" className={styles.check}>
                  <IconCheck size={14} stroke={2.4} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- prices ----------------------------------------------------- */}
      <section aria-labelledby="prices-heading" className={styles.block}>
        <h2 className={styles.sectionHeading} id="prices-heading">
          {prices.heading}
        </h2>
        <div className={styles.priceGroups}>
          {prices.groups.map((group) => (
            <div className={styles.priceGroup} key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.lines.map((line) => (
                  <li key={line.row}>
                    <span>{line.label}</span>
                    <strong data-free={line.price === "Zdarma"}>{line.price}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className={styles.priceNote}>
          {prices.note}{" "}
          <Link className={styles.inlineLink} href={prices.linkHref}>
            {prices.linkLabel}
          </Link>
        </p>
      </section>
    </>
  );
}
