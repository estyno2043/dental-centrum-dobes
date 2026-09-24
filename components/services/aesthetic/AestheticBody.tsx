import Link from "next/link";
import type { JSX } from "react";
import { IconArrowNarrowRight } from "@tabler/icons-react";

import { CaseGallery } from "@/components/patients/CaseGallery";
import {
  featuredCase,
  patientCases,
} from "@/components/patients/patientsContent";
import { ShadeGuide } from "./ShadeGuide";
import { SolutionSwitcher } from "./SolutionSwitcher";
import {
  aestheticCaseIds,
  aestheticIntro,
  course,
  coursePhoto,
  longevity,
  material,
  mockUp,
  solutions,
} from "./aestheticContent";
import styles from "./aesthetic.module.css";

const cases = [featuredCase, ...patientCases].filter((entry) =>
  (aestheticCaseIds as readonly string[]).includes(entry.id),
);

/* The band quotes the ceramic option's own price rather than a copy of it. */
const ceramicPrice = solutions.find((s) => s.id === "keramika")?.price;

/**
 * Estetická stomatológia.
 *
 * Built around a decision rather than a procedure. The hygiene page is a
 * protocol and reads as a sequence; this one is five options with different
 * prices for what looks to a patient like the same thing, so its spine is a
 * comparison they can switch between.
 *
 * Dressed on 2026-09-24, when the user found it plain: porcelain, pearl and
 * champagne gold. A drawn shade guide opens it, the options carry glyphs and
 * a meter for how much tooth each one takes, a dark band shows the clinic's
 * own ceramic veneers, and the visits read as a numbered path beside the
 * scanner photograph. Still slow and spacious: these are the clinic's
 * expensive procedures, and a page that hurries reads as a page that sells.
 */
export function AestheticBody(): JSX.Element {
  return (
    <>
      <section aria-labelledby="solutions-heading" className={styles.solutions}>
        <div className={styles.intro}>
          <div>
            <h2 className={styles.headline} id="solutions-heading">
              {aestheticIntro.headline}
            </h2>
            <p className={styles.lead}>{aestheticIntro.lead}</p>
          </div>
          <ShadeGuide
            className={styles.shadeGuide}
            sparkleClassName={styles.glint}
          />
        </div>
        <SolutionSwitcher />
      </section>

      {/* --- the material, on espresso ---------------------------------- */}
      <section aria-labelledby="material-heading" className={styles.material}>
        <div className={styles.materialInner}>
          <div className={styles.materialText}>
            <p className={styles.materialEyebrow}>{material.eyebrow}</p>
            <h2 className={styles.materialHeading} id="material-heading">
              {material.heading}
            </h2>
            <p className={styles.materialBody}>{material.body}</p>
            {ceramicPrice ? (
              <p className={styles.materialPrice}>
                {ceramicPrice}
                <span>{material.priceNote}</span>
              </p>
            ) : null}
          </div>
          <figure className={styles.materialPhoto}>
            {/* eslint-disable-next-line @next/next/no-img-element -- Pre-cropped clinic asset. */}
            <img
              alt={material.photo.alt}
              decoding="async"
              height={material.photo.height}
              loading="lazy"
              sizes="(max-width: 860px) 100vw, 22rem"
              src={`/media/sluzby/${material.photo.src}.webp`}
              srcSet={
                `/media/sluzby/${material.photo.src}-mobile.webp ${material.photo.width / 2}w, ` +
                `/media/sluzby/${material.photo.src}.webp ${material.photo.width}w`
              }
              width={material.photo.width}
            />
          </figure>
        </div>
      </section>

      {/* --- the fear, answered ------------------------------------------
          Not with the mock-up, which the clinic offers but rarely sells, but
          with the fortnight that patients actually dread — and which the
          next-day milled temporaries remove. --- */}
      <section aria-labelledby="course-heading" className={styles.preview}>
        <figure className={styles.coursePhoto}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Pre-cropped clinic asset. */}
          <img
            alt={coursePhoto.alt}
            decoding="async"
            height={coursePhoto.height}
            loading="lazy"
            sizes="(max-width: 860px) 100vw, 24rem"
            src={`/media/sluzby/${coursePhoto.src}.webp`}
            srcSet={
              `/media/sluzby/${coursePhoto.src}-mobile.webp ${coursePhoto.width / 2}w, ` +
              `/media/sluzby/${coursePhoto.src}.webp ${coursePhoto.width}w`
            }
            width={coursePhoto.width}
          />
        </figure>

        <div className={styles.previewText}>
          <h2 className={styles.sectionHeading} id="course-heading">
            {course.heading}
          </h2>
          <p className={styles.previewLead}>{course.lead}</p>

          <ol className={styles.previewSteps}>
            {course.steps.map((step, index) => (
              <li key={step.name}>
                <span aria-hidden="true" className={styles.stepNumber}>
                  {index + 1}
                </span>
                <div className={styles.previewStepHead}>
                  <h3>{step.name}</h3>
                  <span>{step.when}</span>
                </div>
                <p>{step.note}</p>
              </li>
            ))}
          </ol>

          <p className={styles.previewNote}>{course.note}</p>
        </div>
      </section>

      {/* --- the option, priced honestly ---------------------------------- */}
      <aside aria-labelledby="mockup-heading" className={styles.option}>
        <div className={styles.optionInner}>
          <p className={styles.optionTag}>Voliteľné</p>
          <h2 className={styles.optionHeading} id="mockup-heading">
            {mockUp.heading}
          </h2>
          <p className={styles.optionBody}>{mockUp.body}</p>
          <ul className={styles.optionSteps}>
            {mockUp.steps.map((step) => (
              <li key={step.name}>
                <div className={styles.previewStepHead}>
                  <h3>{step.name}</h3>
                  <span>{step.price}</span>
                </div>
                <p>{step.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </aside>

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
        <div className={styles.longevityInner}>
          <h2 className={styles.longevityHeading} id="longevity-heading">
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
        </div>
      </section>
    </>
  );
}
