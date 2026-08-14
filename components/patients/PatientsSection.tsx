import type { JSX } from "react";
import { BeforeAfter } from "./BeforeAfter";
import {
  featuredCase,
  patientCases,
  patientsConsent,
  patientsIntro,
} from "./patientsContent";
import styles from "./patients.module.css";

/**
 * "Naši pacienti" — the results section.
 *
 * Light, against the dark hero, statement and clinic story above it. That
 * contrast is the point: the page has been cinematic and dim up to here, and
 * this is where it opens up and gets factual.
 *
 * Each case carries what was actually done — visits, span, what was made —
 * rather than only a picture. A before/after with no context is a claim; with
 * the number of visits beside it, it is evidence.
 */
export function PatientsSection(): JSX.Element {
  return (
    /*
     * Tells the header to take a background while it sits over this section.
     * It is the only light section on the page, and white type on greige is
     * unreadable without one.
     */
    <section
      className={styles.section}
      aria-labelledby="patients-heading"
      data-header-mode="light"
    >
      <div className={styles.inner}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowRule} aria-hidden="true" />
            {patientsIntro.eyebrow}
          </p>
          <h2 className={styles.headline} id="patients-heading">
            {patientsIntro.headline}
          </h2>
          <p className={styles.lead}>{patientsIntro.lead}</p>
        </header>

        <figure className={styles.featured}>
          <BeforeAfter patientCase={featuredCase} />
          <figcaption className={styles.featuredMeta}>
            <p className={styles.problem}>{featuredCase.problem}</p>
            <ul className={styles.tags}>
              {featuredCase.treatments.map((treatment) => (
                <li key={treatment}>{treatment}</li>
              ))}
            </ul>
            <dl className={styles.facts}>
              {featuredCase.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </figcaption>
        </figure>

        <ul className={styles.grid}>
          {patientCases.map((patientCase) => (
            <li className={styles.card} key={patientCase.id}>
              <BeforeAfter patientCase={patientCase} />
              <p className={styles.problem}>{patientCase.problem}</p>
              <ul className={styles.tags}>
                {patientCase.treatments.map((treatment) => (
                  <li key={treatment}>{treatment}</li>
                ))}
              </ul>
              <dl className={styles.facts}>
                {patientCase.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>

        <p className={styles.consent}>{patientsConsent}</p>
      </div>
    </section>
  );
}
