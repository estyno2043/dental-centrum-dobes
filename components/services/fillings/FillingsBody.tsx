import Link from "next/link";
import type { JSX } from "react";
import { IconArrowNarrowRight } from "@tabler/icons-react";

import { CaseGallery } from "@/components/patients/CaseGallery";
import {
  featuredCase,
  patientCases,
} from "@/components/patients/patientsContent";
import { More } from "../More";
import { IconDepth, IconLayers, IconPosition, ToothSplit } from "./FillingsArt";
import { SurfacePicker } from "./SurfacePicker";
import {
  amalgam,
  beyond,
  casesIntro,
  fillingsCaseIds,
  longevity,
  materials,
  opening,
  surfaces,
  visit,
} from "./fillingsContent";
import styles from "./fillings.module.css";

const cases = [featuredCase, ...patientCases].filter((entry) =>
  (fillingsCaseIds as readonly string[]).includes(entry.id),
);

const FACTOR_ICONS = [IconDepth, IconPosition, IconLayers];

/**
 * The body of `/sluzby/biele-vyplne`.
 *
 * Built 2026-09-25 around the service's own promise: a filling you cannot
 * tell from the tooth. Enamel white and mint, with one dark moment for the
 * old amalgam fillings people want gone. The page's device is the price on a
 * drawn tooth, because "one, two or three surfaces" means nothing until you
 * can see which surfaces those are.
 */
export function FillingsBody(): JSX.Element {
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
        <ToothSplit className={styles.toothSplit} sparkleClassName={styles.glint} />
      </section>

      {/* --- the price, on the tooth ------------------------------------ */}
      <section aria-labelledby="surfaces-heading" className={styles.surfaces}>
        <div className={styles.surfacesInner}>
          <h2 className={styles.sectionHeading} id="surfaces-heading">
            {surfaces.heading}
          </h2>
          <p className={styles.lead}>{surfaces.lead}</p>
          <SurfacePicker />

          <h3 className={styles.factorsHeading}>{surfaces.rangeHeading}</h3>
          <ul className={styles.factors}>
            {surfaces.factors.map((factor, index) => {
              const FactorIcon = FACTOR_ICONS[index % FACTOR_ICONS.length];
              return (
                <li key={factor.title}>
                  <FactorIcon className={styles.factorIcon} />
                  <h4>{factor.title}</h4>
                  <p>{factor.note}</p>
                </li>
              );
            })}
          </ul>
          <p className={styles.deepNote}>{surfaces.deepNote}</p>
        </div>
      </section>

      {/* --- the visit -------------------------------------------------- */}
      <section aria-labelledby="visit-heading" className={styles.block}>
        <h2 className={styles.sectionHeading} id="visit-heading">
          {visit.heading}
        </h2>
        <ol className={styles.steps}>
          {visit.steps.map((step, index) => (
            <li key={step.title}>
              <span aria-hidden="true" className={styles.stepNumber}>
                {index + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.note}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* --- the old dark fillings -------------------------------------- */}
      <section aria-labelledby="amalgam-heading" className={styles.amalgam}>
        <div className={styles.amalgamInner}>
          <div aria-hidden="true" className={styles.amalgamSwatches}>
            <span className={styles.swatchOld} />
            <IconArrowNarrowRight size={22} stroke={1.6} />
            <span className={styles.swatchNew} />
          </div>
          <div>
            <h2 className={styles.amalgamHeading} id="amalgam-heading">
              {amalgam.heading}
            </h2>
            <p className={styles.amalgamBody}>{amalgam.body}</p>
            <a className={styles.cta} href={amalgam.cta.href}>
              {amalgam.cta.label}
              <IconArrowNarrowRight aria-hidden="true" size={18} stroke={1.8} />
            </a>
          </div>
        </div>
      </section>

      {/* --- materials -------------------------------------------------- */}
      <section aria-labelledby="materials-heading" className={styles.block}>
        <h2 className={styles.sectionHeading} id="materials-heading">
          {materials.heading}
        </h2>
        <ul className={styles.materials}>
          {materials.items.map((item) => (
            <li key={item.name}>
              <span className={styles.materialUse}>{item.use}</span>
              <h3>{item.name}</h3>
              <p>{item.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* --- how long, and when it is not enough ------------------------ */}
      <section aria-labelledby="longevity-heading" className={styles.twoUp}>
        <div className={styles.longevity}>
          <h2 className={styles.longevityHeading} id="longevity-heading">
            {longevity.heading}
          </h2>
          <p className={styles.longevityClaim}>{longevity.claim}</p>
          <p className={styles.prose}>{longevity.body}</p>
          <Link className={styles.textLink} href={longevity.linkHref}>
            <span>{longevity.linkLabel}</span>
            <IconArrowNarrowRight size={18} stroke={1.7} />
          </Link>
        </div>

        <div className={styles.beyond}>
          <h2 className={styles.beyondHeading}>{beyond.heading}</h2>
          <ul className={styles.beyondList}>
            {beyond.items.map((item) => (
              <li key={item.title}>
                <div className={styles.beyondRow}>
                  <h3>{item.title}</h3>
                  <span>{item.price}</span>
                </div>
                <p>{item.note}</p>
              </li>
            ))}
          </ul>
          <More>
            <p className={styles.prose}>{beyond.crownNote}</p>
            <Link className={styles.textLink} href={beyond.crownLinkHref}>
              <span>{beyond.crownLinkLabel}</span>
              <IconArrowNarrowRight size={18} stroke={1.7} />
            </Link>
          </More>
        </div>
      </section>

      {/* --- the material, shown ---------------------------------------- */}
      <section aria-labelledby="cases-heading" className={styles.block}>
        <h2 className={styles.sectionHeading} id="cases-heading">
          {casesIntro.heading}
        </h2>
        <p className={styles.lead}>{casesIntro.note}</p>
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
