import Link from "next/link";
import type { JSX } from "react";
import { IconArrowNarrowRight } from "@tabler/icons-react";

import { More } from "../More";
import {
  compare,
  cost,
  crown,
  guarantee,
  limit,
  microscope,
  odds,
  opening,
  pain,
  photos,
  visit,
  xray,
} from "./endoContent";
import styles from "./endo.module.css";

type Photo = {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
};

/** A pre-cropped clinic photograph with its half-size candidate. */
function Picture({
  photo,
  className,
}: {
  readonly photo: Photo;
  readonly className?: string;
}): JSX.Element {
  return (
    <figure className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element -- Pre-cropped clinic asset. */}
      <img
        alt={photo.alt}
        decoding="async"
        height={photo.height}
        loading="lazy"
        sizes="(max-width: 860px) 100vw, 26rem"
        src={`/media/sluzby/${photo.src}.webp`}
        srcSet={
          `/media/sluzby/${photo.src}-mobile.webp ${photo.width / 2}w, ` +
          `/media/sluzby/${photo.src}.webp ${photo.width}w`
        }
        width={photo.width}
      />
    </figure>
  );
}

/**
 * The body of `/sluzby/endodoncia`.
 *
 * Rebuilt on 2026-09-24 after the user's note that it read as too much text
 * and not enough to look at. Every section now leads with one line strong
 * enough to stand alone, and the explanation behind it waits under "Zobraziť
 * viac" for whoever wants it. The page can be read by its headings.
 *
 * Colour and photography do the rest: the odds sit on the clinic's walnut, the
 * microscope section is a dark band with the microscope itself behind it, and
 * three photographs from the clinic's own shoot sit beside the sections they
 * show — the doctor at the eyepiece, a treatment under magnification, and the
 * radiograph the price is estimated from.
 *
 * The order is unchanged and still argues about time before money: somebody
 * with a sore tooth is deciding whether to ring today, and whether the tooth
 * can be saved at all matters more to them than what it costs.
 */
export function EndoBody(): JSX.Element {
  return (
    <>
      {/* --- the sentence the reader arrived with ------------------------ */}
      <section aria-labelledby="opening-heading" className={styles.opening}>
        <div>
          <h2 className={styles.openingHeading} id="opening-heading">
            {opening.heading}
          </h2>
          <p className={styles.openingBody}>{opening.body}</p>

          <div className={styles.pain}>
            <h3 className={styles.painHeading}>{pain.heading}</h3>
            <p className={styles.painClaim}>{pain.claim}</p>
            <More>
              <p className={styles.prose}>{pain.body}</p>
            </More>
          </div>
        </div>
        <Picture className={styles.photo} photo={photos.detail} />
      </section>

      {/* --- why today, on the clinic's walnut --------------------------- */}
      <section aria-labelledby="odds-heading" className={styles.odds}>
        <div className={styles.oddsInner}>
          <div>
            <h2 className={styles.oddsHeading} id="odds-heading">
              {odds.heading}
            </h2>
            <p className={styles.claim}>{odds.claim}</p>
            <More tone="light">
              <p className={styles.oddsProse}>{odds.body}</p>
              <p className={styles.oddsProse}>{odds.note}</p>
            </More>
          </div>

          <div className={styles.lowers}>
            <h3 className={styles.lowersHeading}>{odds.lowersHeading}</h3>
            <ul>
              {odds.lowers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className={styles.ctaText}>{odds.cta.text}</p>
            {/* A plain anchor to the booking form the shell already renders. */}
            <a className={styles.cta} href={odds.cta.href}>
              {odds.cta.label}
              <IconArrowNarrowRight aria-hidden="true" size={18} stroke={1.8} />
            </a>
          </div>
        </div>
      </section>

      {/* --- where the promises stop ------------------------------------- */}
      <section aria-labelledby="guarantee-heading" className={styles.honest}>
        <h2 className={styles.honestHeading} id="guarantee-heading">
          {guarantee.heading}
        </h2>
        <p className={styles.honestBody}>{guarantee.body}</p>
      </section>

      {/* --- the microscope, with the microscope behind it --------------- */}
      <section aria-labelledby="scope-heading" className={styles.scope}>
        <div className={styles.scopeInner}>
          {/* Decorative: the section says what it is in words. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- Pre-cropped clinic asset. */}
          <img
            alt=""
            aria-hidden="true"
            className={styles.scopePhoto}
            decoding="async"
            loading="lazy"
            sizes="(max-width: 860px) 100vw, 68rem"
            src={`/media/sluzby/${photos.microscope.src}.webp`}
            srcSet={
              `/media/sluzby/${photos.microscope.src}-mobile.webp ${photos.microscope.width / 2}w, ` +
              `/media/sluzby/${photos.microscope.src}.webp ${photos.microscope.width}w`
            }
          />
          <div className={styles.scopeText}>
            <h2 className={styles.scopeHeading} id="scope-heading">
              {microscope.heading}
            </h2>
            <p className={styles.freeTag}>{microscope.free}</p>
            <ul className={styles.scopePoints}>
              {microscope.points.map((point) => (
                <li key={point.title}>
                  <h3>{point.title}</h3>
                  <p>{point.note}</p>
                </li>
              ))}
            </ul>
            <More tone="light">
              <p className={styles.oddsProse}>{microscope.body}</p>
            </More>
          </div>
        </div>
      </section>

      {/* --- the proof, on the radiograph -------------------------------- */}
      <section aria-labelledby="xray-heading" className={styles.block}>
        <h2 className={styles.sectionHeading} id="xray-heading">
          {xray.heading}
        </h2>
        <div className={styles.xrays}>
          {[xray.before, xray.after].map((shot) => (
            <figure className={styles.xray} key={shot.src}>
              {/* eslint-disable-next-line @next/next/no-img-element -- Pre-sized clinic radiograph. */}
              <img
                alt={shot.alt}
                decoding="async"
                height={xray.height}
                loading="lazy"
                sizes="(max-width: 860px) 100vw, 30rem"
                src={`/media/sluzby/${shot.src}.webp`}
                srcSet={
                  `/media/sluzby/${shot.src}-mobile.webp ${xray.width / 2}w, ` +
                  `/media/sluzby/${shot.src}.webp ${xray.width}w`
                }
                width={xray.width}
              />
              <figcaption className={styles.xrayLabel}>{shot.label}</figcaption>
            </figure>
          ))}
        </div>
        <p className={styles.xrayCaption}>{xray.caption}</p>
      </section>

      {/* --- the appointment --------------------------------------------- */}
      <section aria-labelledby="visit-heading" className={styles.split}>
        <Picture className={styles.photo} photo={photos.work} />
        <div>
          <h2 className={styles.sectionHeading} id="visit-heading">
            {visit.heading}
          </h2>
          <dl className={styles.facts}>
            {visit.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          <More>
            <p className={styles.prose}>{visit.lead}</p>
            <p className={styles.prose}>{visit.body}</p>
          </More>
        </div>
      </section>

      {/* --- the price, estimated from the radiograph -------------------- */}
      <section aria-labelledby="cost-heading" className={styles.split}>
        <div>
          <h2 className={styles.sectionHeading} id="cost-heading">
            {cost.heading}
          </h2>
          <div className={styles.estimate}>
            <p className={styles.estimateExample}>{cost.exampleHeading}</p>
            <p className={styles.estimateTotal}>
              <span>{cost.estimateLabel}</span>
              <strong>{cost.estimate}</strong>
            </p>
            <p className={styles.costNote}>{cost.estimateNote}</p>
            <p className={styles.estimateFree}>{cost.freeNote}</p>
          </div>

          <More label="Zobraziť rozpis ceny">
            <p className={styles.prose}>{cost.lead}</p>
            <ol className={styles.costItems}>
              {cost.lines.map((line) => (
                <li key={line.label}>
                  <div className={styles.costRow}>
                    <h4>{line.label}</h4>
                    <span className={styles.costPrice}>{line.price}</span>
                  </div>
                  {line.note ? <p>{line.note}</p> : null}
                </li>
              ))}
            </ol>
            <h3 className={styles.twoVisitsHeading}>{cost.twoVisitsHeading}</h3>
            <p className={styles.prose}>{cost.twoVisits}</p>
          </More>
        </div>
        <Picture className={styles.photo} photo={photos.xray} />
      </section>

      {/* --- against the alternative ------------------------------------- */}
      <section aria-labelledby="compare-heading" className={styles.compare}>
        <h2 className={styles.sectionHeading} id="compare-heading">
          {compare.heading}
        </h2>
        <div className={styles.scales}>
          <div className={styles.scaleKeep}>
            <span className={styles.scaleLabel}>{compare.keep.label}</span>
            <strong>{compare.keep.value}</strong>
            <p>{compare.keep.note}</p>
          </div>
          <div className={styles.scaleReplace}>
            <span className={styles.scaleLabel}>{compare.replace.label}</span>
            <strong>{compare.replace.value}</strong>
            <p>{compare.replace.note}</p>
            <Link className={styles.scaleLink} href={compare.replace.href}>
              <span>Zubné implantáty</span>
              <IconArrowNarrowRight size={16} stroke={1.7} />
            </Link>
          </div>
        </div>
        <More>
          <p className={styles.prose}>{compare.lead}</p>
          <p className={styles.prose}>{compare.note}</p>
        </More>
      </section>

      {/* --- the questions that follow, closed until asked --------------- */}
      <section aria-labelledby="faq-heading" className={styles.block}>
        <h2 className={styles.sectionHeading} id="faq-heading">
          Ďalšie otázky
        </h2>
        <div className={styles.faq}>
          {[
            { q: crown.heading, a: crown.body, href: crown.linkHref, label: crown.linkLabel },
            { q: limit.heading, a: limit.body, href: limit.linkHref, label: limit.linkLabel },
          ].map((item) => (
            <details className={styles.faqItem} key={item.q}>
              <summary>{item.q}</summary>
              <p className={styles.prose}>{item.a}</p>
              <Link className={styles.textLink} href={item.href}>
                <span>{item.label}</span>
                <IconArrowNarrowRight size={18} stroke={1.7} />
              </Link>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
