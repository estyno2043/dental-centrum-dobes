import type { JSX } from "react";

import { CaseGallery } from "@/components/patients/CaseGallery";
import {
  featuredCase,
  patientCases,
} from "@/components/patients/patientsContent";
import { OptionSwitcher } from "./OptionSwitcher";
import { BridgeScene } from "./ProstheticsArt";
import {
  decision,
  immediate,
  lifespan,
  opening,
  options,
  prostheticsCaseIds,
} from "./prostheticsContent";
import styles from "./prosthetics.module.css";

const cases = [featuredCase, ...patientCases].filter((entry) =>
  (prostheticsCaseIds as readonly string[]).includes(entry.id),
);

const YEARS = Array.from({ length: lifespan.scale.withRepairs + 1 }, (_, i) => i);

/**
 * The body of `/sluzby/protetika`.
 *
 * Built 2026-09-25 on the theme of *made to measure*: ivory and slate blue,
 * a drawn bridge settling into its gap, and the three ways to replace a
 * missing tooth side by side. The clinic's own answer about who decides is
 * given a section of its own, because it is the most useful thing on the
 * page: the doctor decides what the mouth can carry, the patient the budget.
 */
export function ProstheticsBody(): JSX.Element {
  const { literatureFrom, literatureTo, withRepairs } = lifespan.scale;
  const pct = (years: number) => `${(years / withRepairs) * 100}%`;

  return (
    <>
      {/* --- the question ----------------------------------------------- */}
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
        <BridgeScene className={styles.bridge} floatClassName={styles.float} />
      </section>

      {/* --- the three ways --------------------------------------------- */}
      <section aria-labelledby="options-heading" className={styles.block}>
        <h2 className={styles.sectionHeading} id="options-heading">
          {options.heading}
        </h2>
        <OptionSwitcher />
      </section>

      {/* --- who decides ------------------------------------------------ */}
      <section aria-labelledby="decision-heading" className={styles.decision}>
        <div className={styles.decisionInner}>
          <h2 className={styles.decisionHeading} id="decision-heading">
            {decision.heading}
          </h2>
          <div className={styles.decisionSides}>
            {[decision.doctor, decision.patient].map((side) => (
              <div className={styles.decisionSide} key={side.title}>
                <h3>{side.title}</h3>
                <p>{side.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- how long a denture lasts ----------------------------------- */}
      <section aria-labelledby="lifespan-heading" className={styles.block}>
        <h2 className={styles.sectionHeading} id="lifespan-heading">
          {lifespan.heading}
        </h2>
        <p className={styles.lifespanClaim}>{lifespan.claim}</p>
        <p className={styles.prose}>{lifespan.body}</p>

        {/*
          A ten-year scale. The literature's three to five years shaded, the
          clinic's "up to ten with small repairs" dotted beyond it. The words
          above say the same; the scale is hidden from assistive technology.
        */}
        <div aria-hidden="true" className={styles.scale}>
          <div className={styles.scaleTrack}>
            <span
              className={styles.scaleLiterature}
              style={{ left: pct(literatureFrom), width: pct(literatureTo - literatureFrom) }}
            />
            <span
              className={styles.scaleRepairs}
              style={{ left: pct(literatureTo), width: pct(withRepairs - literatureTo) }}
            />
          </div>
          <div className={styles.scaleYears}>
            {YEARS.map((year) => (
              <span key={year} style={{ left: pct(year) }}>
                {year}
              </span>
            ))}
          </div>
          <div className={styles.scaleLegend}>
            <span className={styles.legendLiterature}>Literatúra</span>
            <span className={styles.legendRepairs}>S menšími opravami</span>
          </div>
        </div>

        <p className={styles.repair}>
          <span>{lifespan.repair.label}</span>
          <strong>{lifespan.repair.price}</strong>
        </p>
      </section>

      {/* --- straight after an extraction ------------------------------- */}
      <section aria-labelledby="immediate-heading" className={styles.block}>
        <div className={styles.immediate}>
          <div>
            <h2 className={styles.immediateHeading} id="immediate-heading">
              {immediate.heading}
            </h2>
            <p className={styles.prose}>{immediate.body}</p>
          </div>
          <ul className={styles.immediateList}>
            {immediate.items.map((item) => (
              <li key={item.row}>
                <span>{item.label}</span>
                <strong>{item.price}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- the work --------------------------------------------------- */}
      <section aria-labelledby="work-heading" className={styles.block}>
        <h2 className={styles.sectionHeading} id="work-heading">
          Naše práce
        </h2>
        <figure className={styles.case}>
          <CaseGallery cases={cases} />
          <figcaption className={styles.caseNote}>
            Fotografie zverejňujeme iba s písomným súhlasom pacienta.
          </figcaption>
        </figure>
      </section>
    </>
  );
}
