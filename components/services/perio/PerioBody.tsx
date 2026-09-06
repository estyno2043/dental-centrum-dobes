import Link from "next/link";
import type { JSX } from "react";
import { IconArrowNarrowRight } from "@tabler/icons-react";

import { PhotoFrame } from "../PhotoFrame";
import { SymptomCheck } from "./SymptomCheck";
import {
  causes,
  check,
  cost,
  disease,
  outcome,
  plasma,
  protocol,
  systemic,
} from "./perioContent";
import styles from "./perio.module.css";

/**
 * The body of `/sluzby/parodontologia`.
 *
 * Ordered against the one thing that makes this disease different: nobody
 * arrives looking for the treatment, because it does not hurt. So the page
 * spends its opening on recognition, and only explains the disease to a reader
 * who has already seen themselves in it. Everything after that answers a
 * question the checklist has just raised — what is it, why me, does it matter
 * beyond my mouth, what do you actually do, and what does it cost to find out.
 */
export function PerioBody(): JSX.Element {
  return (
    <>
      {/* --- recognition, before anything is explained ------------------- */}
      <section aria-labelledby="check-heading" className={styles.recognise}>
        <div>
          <h2 className={styles.headline} id="check-heading">
            {check.heading}
          </h2>
          <p className={styles.lead}>{check.lead}</p>
        </div>
        <SymptomCheck />
      </section>

      {/* --- what it actually is ----------------------------------------- */}
      <section aria-labelledby="disease-heading" className={styles.block}>
        <h2 className={styles.sectionHeading} id="disease-heading">
          {disease.heading}
        </h2>
        <p className={styles.prose}>{disease.body}</p>
      </section>

      {/* --- and why it is not your fault alone --------------------------- */}
      <section aria-labelledby="causes-heading" className={styles.block}>
        <h2 className={styles.sectionHeading} id="causes-heading">
          {causes.heading}
        </h2>
        <p className={styles.lead}>{causes.lead}</p>
        <ol className={styles.causes}>
          {causes.items.map((item, index) => (
            <li key={item.name}>
              <span aria-hidden="true" className={styles.causeIndex}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{item.name}</h3>
              <p>{item.note}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* --- the stake --------------------------------------------------- */}
      <section aria-labelledby="systemic-heading" className={styles.systemic}>
        <h2 className={styles.sectionHeading} id="systemic-heading">
          {systemic.heading}
        </h2>
        <p className={styles.systemicBody}>{systemic.body}</p>
      </section>

      {/* --- the protocol, which is the actual differentiator ------------- */}
      <section aria-labelledby="protocol-heading" className={styles.block}>
        <h2 className={styles.sectionHeading} id="protocol-heading">
          {protocol.heading}
        </h2>
        <p className={styles.lead}>{protocol.lead}</p>
        <ol className={styles.steps}>
          {protocol.steps.map((step, index) => (
            <li
              className={step.pivotal ? styles.stepPivotal : undefined}
              key={step.name}
            >
              <span aria-hidden="true" className={styles.stepIndex}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{step.name}</h3>
                <p>{step.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* --- the part nobody else offers ---------------------------------- */}
      <section aria-labelledby="plasma-heading" className={styles.plasma}>
        <div className={styles.plasmaInner}>
          <h2 className={styles.sectionHeading} id="plasma-heading">
            {plasma.heading}
          </h2>
          <p className={styles.plasmaClaim}>{plasma.claim}</p>
          <p className={styles.plasmaBody}>{plasma.body}</p>
          <dl className={styles.plasmaFacts}>
            {plasma.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* --- the price of finding out ------------------------------------- */}
      <section aria-labelledby="cost-heading" className={styles.money}>
        <div>
          <h2 className={styles.sectionHeading} id="cost-heading">
            {cost.heading}
          </h2>
          <p className={styles.lead}>{cost.lead}</p>

          <ol className={styles.costItems}>
            {cost.items.map((item) => (
              <li key={item.label}>
                <div className={styles.costRow}>
                  <h3>{item.label}</h3>
                  <span className={styles.costPrice}>{item.price}</span>
                </div>
                <p>{item.note}</p>
              </li>
            ))}
          </ol>

          <p className={styles.costTotal}>
            <span className={styles.costTotalLabel}>{cost.totalLabel}</span>
            <strong>{cost.total}</strong>
          </p>
          <p className={styles.costAlternative}>{cost.alternative}</p>
        </div>

        <div className={styles.later}>
          <h3 className={styles.laterHeading}>{cost.laterHeading}</h3>
          <ul>
            {cost.later.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                <span className={styles.costPrice}>{item.price}</span>
              </li>
            ))}
          </ul>
          <p className={styles.laterNote}>{cost.laterNote}</p>
        </div>
      </section>

      {/* --- the clinic's own sentence ------------------------------------ */}
      <section aria-labelledby="outcome-heading" className={styles.outcome}>
        <h2 className={styles.outcomeClaim} id="outcome-heading">
          {outcome.claim}
        </h2>
        <p className={styles.prose}>{outcome.body}</p>
        <Link className={styles.outcomeLink} href={outcome.linkHref}>
          <span>{outcome.linkLabel}</span>
          <IconArrowNarrowRight size={18} stroke={1.7} />
        </Link>

        <PhotoFrame
          brief="RTG snímka toho istého chrupu pred liečbou a po nej, vedľa seba — na parodontitíde je dorastená kosť vidieť a je to dôkaz, aký fotka úsmevu nedá. Alternatíva: odber krvi na plazmu v ordinácii."
          ratio="16 / 9"
        />
      </section>
    </>
  );
}
