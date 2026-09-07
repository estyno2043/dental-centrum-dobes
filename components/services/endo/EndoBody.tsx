import Link from "next/link";
import type { JSX } from "react";
import { IconArrowNarrowRight } from "@tabler/icons-react";

import { PhotoFrame } from "../PhotoFrame";
import {
  compare,
  cost,
  crown,
  guarantee,
  limit,
  microscope,
  odds,
  visit,
} from "./endoContent";
import styles from "./endo.module.css";

/**
 * The body of `/sluzby/endodoncia`.
 *
 * Ordered against the decision the reader is actually making, which is *when*
 * rather than *whether*: somebody with a sore tooth has usually been told it
 * has to come out, and is weighing that against waiting. So the odds open the
 * page, the honest absence of a guarantee sits directly under them, and only
 * then does it explain how the work is done and what it costs.
 *
 * The price comes late on purpose. On this page it is not the objection — the
 * objection is that the tooth might not be saveable at all, and money only
 * matters once the reader believes it might.
 */
export function EndoBody(): JSX.Element {
  return (
    <>
      {/* --- why today rather than next month ---------------------------- */}
      <section aria-labelledby="odds-heading" className={styles.odds}>
        <div>
          <h2 className={styles.sectionHeading} id="odds-heading">
            {odds.heading}
          </h2>
          <p className={styles.claim}>{odds.claim}</p>
          <p className={styles.prose}>{odds.body}</p>
          <p className={styles.oddsNote}>{odds.note}</p>
        </div>

        <div className={styles.lowers}>
          <h3 className={styles.lowersHeading}>{odds.lowersHeading}</h3>
          <ul>
            {odds.lowers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- and where the promises stop ---------------------------------- */}
      <section aria-labelledby="guarantee-heading" className={styles.honest}>
        <h2 className={styles.honestHeading} id="guarantee-heading">
          {guarantee.heading}
        </h2>
        <p className={styles.honestBody}>{guarantee.body}</p>
      </section>

      {/* --- what the microscope changes ---------------------------------- */}
      <section aria-labelledby="scope-heading" className={styles.block}>
        <h2 className={styles.sectionHeading} id="scope-heading">
          {microscope.heading}
        </h2>
        <p className={styles.prose}>{microscope.body}</p>
        <p className={styles.freeTag}>{microscope.free}</p>

        <ul className={styles.scopePoints}>
          {microscope.points.map((point) => (
            <li key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* --- the appointment ---------------------------------------------- */}
      <section aria-labelledby="visit-heading" className={styles.block}>
        <h2 className={styles.sectionHeading} id="visit-heading">
          {visit.heading}
        </h2>
        <p className={styles.lead}>{visit.lead}</p>
        <dl className={styles.facts}>
          {visit.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.prose}>{visit.body}</p>
      </section>

      {/* --- the money, and why it is an estimate ------------------------- */}
      <section aria-labelledby="cost-heading" className={styles.money}>
        <div>
          <h2 className={styles.sectionHeading} id="cost-heading">
            {cost.heading}
          </h2>
          <p className={styles.lead}>{cost.lead}</p>

          <h3 className={styles.exampleHeading}>{cost.exampleHeading}</h3>
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

          <p className={styles.costTotal}>
            <span className={styles.costTotalLabel}>{cost.estimateLabel}</span>
            <strong>{cost.estimate}</strong>
          </p>
          <p className={styles.costNote}>{cost.estimateNote}</p>
          <p className={styles.freeTag}>{cost.freeNote}</p>
        </div>

        <div className={styles.twoVisits}>
          <h3 className={styles.twoVisitsHeading}>{cost.twoVisitsHeading}</h3>
          <p>{cost.twoVisits}</p>
        </div>
      </section>

      {/* --- against the alternative -------------------------------------- */}
      <section aria-labelledby="compare-heading" className={styles.compare}>
        <h2 className={styles.sectionHeading} id="compare-heading">
          {compare.heading}
        </h2>
        <p className={styles.lead}>{compare.lead}</p>

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
        <p className={styles.costNote}>{compare.note}</p>
      </section>

      {/* --- the follow-on question --------------------------------------- */}
      <section aria-labelledby="crown-heading" className={styles.block}>
        <h2 className={styles.sectionHeading} id="crown-heading">
          {crown.heading}
        </h2>
        <p className={styles.prose}>{crown.body}</p>
        <Link className={styles.textLink} href={crown.linkHref}>
          <span>{crown.linkLabel}</span>
          <IconArrowNarrowRight size={18} stroke={1.7} />
        </Link>
      </section>

      {/* --- the honest limit --------------------------------------------- */}
      <section aria-labelledby="limit-heading" className={styles.block}>
        <h2 className={styles.sectionHeading} id="limit-heading">
          {limit.heading}
        </h2>
        <p className={styles.prose}>{limit.body}</p>
        <Link className={styles.textLink} href={limit.linkHref}>
          <span>{limit.linkLabel}</span>
          <IconArrowNarrowRight size={18} stroke={1.7} />
        </Link>

        <PhotoFrame
          brief="RTG snímka pred reliečbou a po nej, vedľa seba — na endodoncii je dôkaz práve na snímke: kanáliky zaplnené po hrot koreňa a ustupujúci zápal okolo neho. Doktor snímky má a vyberá ich (2026-09-06). Nie je na nich nikoho tvár."
          ratio="16 / 9"
        />
      </section>
    </>
  );
}
