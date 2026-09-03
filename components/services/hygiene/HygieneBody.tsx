import type { JSX } from "react";
import { IconCheck, IconMinus } from "@tabler/icons-react";

import { PhotoFrame } from "../PhotoFrame";
import {
  comparison,
  hygienePrices,
  protocol,
  recall,
  suitedFor,
} from "./hygieneContent";
import styles from "./hygiene.module.css";

/**
 * The body of `/sluzby/dentalna-hygiena`.
 *
 * Its own component rather than the shared service layout, because the shapes
 * of these two pages are genuinely different. The entry examination is a
 * *package* — what you get, what it costs, a table. GBT is a *protocol*: eight
 * named steps in a fixed order, and that sequence is the page rather than a
 * footnote at the bottom of one.
 *
 * The shell around this — backdrop, the morph out of the catalogue card, the
 * back button — stays shared, so the pages keep reading as a family while
 * their middles differ.
 *
 * Photography does not exist for this service yet beyond the card image, so
 * the frames say what to shoot and hold the space at the right shape. They are
 * meant to look unfinished.
 */
export function HygieneBody(): JSX.Element {
  return (
    <>
      {/* --- the comparison, which is what actually persuades ------------ */}
      <section aria-labelledby="gbt-compare" className={styles.compare}>
        <h2 className={styles.sectionHeading} id="gbt-compare">
          {comparison.heading}
        </h2>
        <div className={styles.compareGrid}>
          {/*
            The old way first and stated plainly, not as a caricature. Someone
            who has sat through conventional scaling should recognise their own
            appointment here; someone who has not should not be frightened.
          */}
          <div className={styles.compareCard} data-side="classic">
            <h3>{comparison.classic.title}</h3>
            <ul>
              {comparison.classic.points.map((point) => (
                <li key={point}>
                  <IconMinus aria-hidden="true" size={15} stroke={2} />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.compareCard} data-side="gbt">
            <h3>{comparison.gbt.title}</h3>
            <ul>
              {comparison.gbt.points.map((point) => (
                <li key={point}>
                  <IconCheck aria-hidden="true" size={15} stroke={2.2} />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* --- the protocol: the spine of the page ------------------------- */}
      <section aria-labelledby="gbt-protocol" className={styles.protocol}>
        <h2 className={styles.sectionHeading} id="gbt-protocol">
          Osem krokov, vždy v tomto poradí
        </h2>
        <p className={styles.protocolLead}>
          Protokol nie je zoznam možností. Kroky idú za sebou, lebo každý ďalší
          stojí na tom, čo ukázal predchádzajúci.
        </p>

        <ol className={styles.steps}>
          {protocol.map((step) => (
            <li
              className={styles.step}
              data-optional={step.optional}
              key={step.number}
            >
              <div className={styles.stepMark}>
                <span className={styles.stepNumber}>
                  {String(step.number).padStart(2, "0")}
                </span>
                <span className={styles.stepName}>{step.name}</span>
              </div>
              <div className={styles.stepBody}>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                {/*
                  The clinic performs PERIOFLOW only for periodontal patients.
                  Rendered as a condition rather than dropped, because a
                  protocol that quietly changes length is one nobody can check —
                  and "only if you need it" is reassurance, not a caveat.
                */}
                {step.optional ? (
                  <p className={styles.optionalNote}>
                    <span className={styles.optionalTag}>Nie pre každého</span>
                    {step.optionalNote}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        {/*
          Two frames of different shapes, set into the run of the steps rather
          than gathered into a grid at the end — the sequence is the story, and
          pictures belong beside the moments they show.
        */}
        <div className={styles.protocolPhotos}>
          <PhotoFrame
            brief="Zafarbený povlak na predných zuboch, zblízka. Toto je krok 2 a je to najsilnejší obrázok celej stránky — pacient uvidí, čo mu doma uniká."
            ratio="4 / 3"
          />
          <PhotoFrame
            brief="AIRFLOW v ruke hygieničky počas ošetrenia, na výšku. Tvár pacienta nemusí byť v zábere."
            ratio="3 / 4"
          />
        </div>
      </section>

      {/* --- who benefits most ------------------------------------------- */}
      <section aria-labelledby="gbt-for" className={styles.suited}>
        <h2 className={styles.sectionHeading} id="gbt-for">
          Zvlášť sa oplatí, ak máte
        </h2>
        <ul className={styles.chips}>
          {suitedFor.map((item) => (
            <li className={styles.chip} key={item}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* --- practical: interval, then price ----------------------------- */}
      <section aria-labelledby="gbt-recall" className={styles.practical}>
        <div className={styles.recall}>
          <h2 className={styles.sectionHeading} id="gbt-recall">
            {recall.heading}
          </h2>
          <dl className={styles.intervals}>
            {[recall.standard, recall.perio].map((entry) => (
              <div key={entry.label}>
                <dt>{entry.label}</dt>
                <dd>{entry.value}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.recallNote}>{recall.note}</p>
        </div>

        <div className={styles.prices}>
          <h3 className={styles.pricesHeading}>Z cenníka</h3>
          <dl className={styles.priceRows}>
            {hygienePrices.map((entry) => (
              <div className={styles.priceRow} key={entry.label}>
                <dt>{entry.label}</dt>
                <dd>{entry.price}</dd>
              </div>
            ))}
          </dl>
          {/*
            No total. The price list bills these separately and does not say
            which combination an appointment is; a "GBT od X €" would be a
            number nobody at the clinic has agreed to.
          */}
          <p className={styles.pricesNote}>
            Čo presne budete potrebovať, povieme po prvom kroku — a cenu
            poviete vopred, nie po ošetrení.
          </p>
        </div>
      </section>
    </>
  );
}
