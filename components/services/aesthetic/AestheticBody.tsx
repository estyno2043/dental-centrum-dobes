import Link from "next/link";
import type { JSX } from "react";
import { IconArrowNarrowRight } from "@tabler/icons-react";

import { CaseGallery } from "@/components/patients/CaseGallery";
import {
  featuredCase,
  patientCases,
} from "@/components/patients/patientsContent";
import { PhotoFrame } from "../PhotoFrame";
import { SolutionSwitcher } from "./SolutionSwitcher";
import {
  aestheticCaseIds,
  aestheticIntro,
  longevity,
  preview,
} from "./aestheticContent";
import styles from "./aesthetic.module.css";

const cases = [featuredCase, ...patientCases].filter((entry) =>
  (aestheticCaseIds as readonly string[]).includes(entry.id),
);

/**
 * Estetická stomatológia.
 *
 * Built around a decision rather than a procedure. The hygiene page is a
 * protocol and reads as a sequence; this one is five options with different
 * prices for what looks to a patient like the same thing, so its spine is a
 * comparison they can switch between.
 *
 * Quieter and darker than its siblings, and slower — wider margins, larger
 * type, a single column of prose. These are the clinic's expensive procedures,
 * and a page that hurries the reader through them reads as a page that is
 * selling. The order sells instead by removing the thing that actually stops
 * people: not the price, but that the tooth does not grow back.
 */
export function AestheticBody(): JSX.Element {
  return (
    <>
      <section aria-labelledby="solutions-heading" className={styles.solutions}>
        <h2 className={styles.headline} id="solutions-heading">
          {aestheticIntro.headline}
        </h2>
        <p className={styles.lead}>{aestheticIntro.lead}</p>
        <SolutionSwitcher />
      </section>

      {/* --- the fear, answered ------------------------------------------ */}
      <section aria-labelledby="preview-heading" className={styles.preview}>
        <div className={styles.previewText}>
          <h2 className={styles.sectionHeading} id="preview-heading">
            {preview.heading}
          </h2>
          <p className={styles.previewLead}>{preview.lead}</p>

          <ol className={styles.previewSteps}>
            {preview.steps.map((step) => (
              <li key={step.name}>
                <div className={styles.previewStepHead}>
                  <h3>{step.name}</h3>
                  <span>{step.price}</span>
                </div>
                <p>{step.note}</p>
              </li>
            ))}
          </ol>

          <p className={styles.previewNote}>{preview.note}</p>
        </div>

        <PhotoFrame
          brief="Voskový mock up nasadený na vlastných zuboch pacienta, zblízka na úsmev. Toto je najsilnejší obrázok stránky — ukazuje výsledok predtým, než sa čokoľvek brúsi."
          ratio="4 / 5"
        />
      </section>

      {/* --- proof -------------------------------------------------------- */}
      <section aria-labelledby="work-heading" className={styles.work}>
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

      {/* --- what keeps it ------------------------------------------------ */}
      <section aria-labelledby="longevity-heading" className={styles.longevity}>
        <h2 className={styles.sectionHeading} id="longevity-heading">
          {longevity.heading}
        </h2>
        <p className={styles.longevityClaim}>{longevity.claim}</p>
        <p className={styles.longevityBody}>{longevity.body}</p>
        {/*
          The one place on the site where a service page should hand the reader
          to another: the thing that keeps this work is the appointment on that
          page, and saying so is more useful than any cross-sell.
        */}
        <Link className={styles.longevityLink} href={longevity.linkHref}>
          <span>{longevity.linkLabel}</span>
          <IconArrowNarrowRight size={18} stroke={1.7} />
        </Link>
      </section>
    </>
  );
}
