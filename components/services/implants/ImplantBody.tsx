import Link from "next/link";
import type { JSX } from "react";
import { IconArrowNarrowRight } from "@tabler/icons-react";

import { PhotoFrame } from "../PhotoFrame";
import { ImplantCost } from "./ImplantCost";
import { bone, cost, guarantee, system, timeline } from "./implantContent";
import styles from "./implants.module.css";

/**
 * The body of `/sluzby/zubne-implantaty`.
 *
 * The clinic's most expensive service, so the order is the order the two
 * objections actually arrive in. First the money, stated in full rather than
 * teased — this is the page where hiding the number loses the reader. Then the
 * gap, which is the fear underneath the money, and which the clinic's own
 * protocol answers outright: a temporary tooth through all three months.
 *
 * The guarantee sits between them on purpose, as the one place on the site
 * where the clinic takes the risk instead of the patient.
 *
 * ⚠️ No financing anywhere. The clinic does not offer instalments; the
 * calculator this page was originally to carry would have priced a service
 * that does not exist. See `implantContent.ts`.
 */
export function ImplantBody(): JSX.Element {
  return (
    <>
      {/* --- the money, whole -------------------------------------------- */}
      <section aria-labelledby="cost-heading" className={styles.money}>
        <div>
          <h2 className={styles.sectionHeading} id="cost-heading">
            {cost.heading}
          </h2>
          <p className={styles.lead}>{cost.lead}</p>
          <ImplantCost />
        </div>

        <div className={styles.addOns}>
          <h3 className={styles.addOnsHeading}>{cost.addOnsHeading}</h3>
          <ul>
            {cost.addOns.map((item) => (
              <li key={item.label}>
                <div className={styles.costRow}>
                  <h4>{item.label}</h4>
                  <span className={styles.costPrice}>{item.price}</span>
                </div>
                <p>{item.note}</p>
              </li>
            ))}
          </ul>
          <p className={styles.addOnsNote}>{cost.addOnsNote}</p>
        </div>
      </section>

      {/* --- the fear under the money ------------------------------------ */}
      <section aria-labelledby="timeline-heading" className={styles.timeline}>
        <h2 className={styles.sectionHeading} id="timeline-heading">
          {timeline.heading}
        </h2>
        <p className={styles.lead}>{timeline.lead}</p>

        <dl className={styles.facts}>
          {timeline.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>

        <ol className={styles.phases}>
          {timeline.phases.map((phase, index) => (
            <li
              className={phase.reassures ? styles.phaseKey : undefined}
              key={phase.name}
            >
              <span aria-hidden="true" className={styles.phaseIndex}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className={styles.phaseHead}>
                <h3>{phase.name}</h3>
                <span className={styles.phaseWhen}>{phase.when}</span>
              </div>
              <p>{phase.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* --- who carries the risk ---------------------------------------- */}
      <section aria-labelledby="guarantee-heading" className={styles.guarantee}>
        <div className={styles.guaranteeInner}>
          <h2 className={styles.sectionHeading} id="guarantee-heading">
            {guarantee.heading}
          </h2>
          <p className={styles.guaranteeClaim}>{guarantee.claim}</p>
          <p className={styles.guaranteeBody}>{guarantee.body}</p>
          <dl className={styles.guaranteeFacts}>
            {guarantee.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* --- the system --------------------------------------------------- */}
      <section aria-labelledby="system-heading" className={styles.system}>
        <div className={styles.systemText}>
          <h2 className={styles.sectionHeading} id="system-heading">
            {system.heading}
          </h2>
          <p className={styles.lead}>{system.body}</p>
          <ul className={styles.systemPoints}>
            {system.points.map((point) => (
              <li key={point.title}>
                <h3>{point.title}</h3>
                <p>{point.note}</p>
              </li>
            ))}
          </ul>
        </div>

        <PhotoFrame
          brief="Implantát Osstem v ruke alebo na modeli čeľuste, zblízka, na tmavom podklade. Na starej stránke kliniky (bratislavazubar.sk) k tomu existujú obrázky — buď ich prevezmeme, alebo sa dofotí vlastný záber."
          ratio="4 / 5"
        />
      </section>

      {/* --- the honest caveat -------------------------------------------- */}
      <section aria-labelledby="bone-heading" className={styles.bone}>
        <h2 className={styles.sectionHeading} id="bone-heading">
          {bone.heading}
        </h2>
        <p className={styles.boneBody}>{bone.body}</p>
        <Link className={styles.boneLink} href={bone.linkHref}>
          <span>{bone.linkLabel}</span>
          <IconArrowNarrowRight size={18} stroke={1.7} />
        </Link>
      </section>
    </>
  );
}
