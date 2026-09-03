import Link from "next/link";
import type { JSX } from "react";
import { IconCheck, IconPhone } from "@tabler/icons-react";

import { GoogleMark } from "@/components/reviews/GoogleMark";
import { ReviewsTrigger } from "@/components/reviews/ReviewsTrigger";
import { reviews } from "@/components/reviews/reviewsContent";
import { CaseGallery } from "@/components/patients/CaseGallery";
import {
  featuredCase,
  patientCases,
} from "@/components/patients/patientsContent";
import { getServiceDetail } from "../serviceDetail";
import {
  entrySteps,
  objections,
  offer,
  proofReviewIds,
  reassurances,
} from "./entryContent";
import styles from "./entry.module.css";

const detail = getServiceDetail("vstupna-prehliadka");
const proof = proofReviewIds
  .map((id) => reviews.find((review) => review.id === id))
  .filter((review) => review !== undefined);

/**
 * The entry examination — the page most patients arrive on and the one the
 * clinic is won or lost on.
 *
 * Ordered by the questions somebody actually asks, in the order they ask them:
 * what does it cost, what do I get, has anyone else survived it, what happens
 * on the day, and the things they would otherwise ring up to check. The offer
 * comes first because a reader deciding whether this is worth a phone call
 * should not have to scroll for the number.
 *
 * Every element is grounded in something the clinic already has — the price
 * list, their Google reviews, their own published positions. Nothing is
 * invented to make the page convert better: a first-visit page that promises
 * what the clinic cannot keep loses the patient in the chair rather than
 * before it.
 */
export function EntryBody(): JSX.Element {
  return (
    <>
      {/* --- the offer, before anything else ---------------------------- */}
      <section aria-labelledby="offer-heading" className={styles.offer}>
        <div className={styles.offerCard}>
          <h2 className={styles.offerHeading} id="offer-heading">
            Vstupný balík pre nových pacientov
          </h2>

          <ul className={styles.offerItems}>
            {offer.items.map((item) => (
              <li className={styles.offerItem} key={item.label}>
                <span>{item.label}</span>
                <span
                  className={styles.offerPrice}
                  data-free={"free" in item && item.free}
                >
                  {"free" in item && item.free ? (
                    <>
                      <s>{item.price}</s>
                      <em>zdarma</em>
                    </>
                  ) : (
                    item.price
                  )}
                </span>
              </li>
            ))}
          </ul>

          <div className={styles.offerTotal}>
            <span className={styles.offerTotalLabel}>Spolu zaplatíte</span>
            <span className={styles.offerTotalValue}>
              <s>{offer.listTotal}</s>
              <strong>{offer.total}</strong>
            </span>
          </div>
          <p className={styles.offerSaving}>{offer.saving}</p>
          <p className={styles.offerCaption}>{offer.caption}</p>

          {/*
            Two ways to act, side by side, and the telephone is not the smaller
            one — somebody who has been putting off a dentist for years rings
            rather than fills in a form.
          */}
          <div className={styles.actions}>
            <a className={styles.actionPrimary} href="#booking">
              Objednať sa
            </a>
            <a className={styles.actionPhone} href="tel:+421918800002">
              <IconPhone size={17} stroke={1.7} />
              0918 800 002
            </a>
          </div>
        </div>

        <ul className={styles.reassurances}>
          {reassurances.map((item) => {
            const body = (
              <>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </>
            );

            /*
              The rating opens the same bar the hero's does — it is the one
              figure here somebody will want to check, and on a page asking
              for a phone call, "prove it" should be one tap rather than a
              trip to Google and back.
            */
            return (
              <li key={item.label}>
                {"reviews" in item ? (
                  <ReviewsTrigger
                    className={styles.ratingTrigger}
                    hint="Čítať recenzie"
                    hintClassName={styles.ratingHint}
                  >
                    {body}
                  </ReviewsTrigger>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* --- what the money buys ---------------------------------------- */}
      {detail ? (
        <section aria-labelledby="includes-heading" className={styles.includes}>
          <h2 className={styles.sectionHeading} id="includes-heading">
            {detail.benefitsHeading}
          </h2>
          <ul className={styles.inclusions}>
            {detail.benefits.map((benefit) => (
              <li key={benefit.title}>
                <IconCheck aria-hidden="true" size={16} stroke={2.2} />
                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* --- proof, from people who were also putting it off ------------- */}
      <section aria-labelledby="proof-heading" className={styles.proof}>
        <div className={styles.proofHead}>
          <span className={styles.proofMark}>
            <GoogleMark />
          </span>
          <h2 className={styles.sectionHeading} id="proof-heading">
            Čo hovoria pacienti
          </h2>
        </div>
        <ul className={styles.quotes}>
          {proof.map((review) => (
            <li className={styles.quote} key={review.id}>
              <span aria-label={`${review.rating} z 5`} className={styles.stars} role="img">
                <span aria-hidden="true">{"★".repeat(review.rating)}</span>
              </span>
              <blockquote>
                <p>{review.text}</p>
              </blockquote>
              <cite>{review.author}</cite>
            </li>
          ))}
        </ul>
      </section>

      {/* --- the day itself ---------------------------------------------- */}
      <section aria-labelledby="how-heading" className={styles.how}>
        <h2 className={styles.sectionHeading} id="how-heading">
          Ako to prebieha
        </h2>
        <ol className={styles.howSteps}>
          {entrySteps.map((step, index) => (
            <li key={step.title}>
              <span className={styles.howNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{step.title}</h3>
              <p>{step.note}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* --- the reasons people do not ring ------------------------------ */}
      <section aria-labelledby="doubts-heading" className={styles.doubts}>
        <h2 className={styles.sectionHeading} id="doubts-heading">
          Čo sa pýtate najčastejšie
        </h2>
        <dl className={styles.doubtList}>
          {objections.map((item) => (
            <div className={styles.doubt} key={item.question}>
              <dt>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* --- results ------------------------------------------------------ */}
      <section aria-labelledby="result-heading" className={styles.results}>
        <h2 className={styles.sectionHeading} id="result-heading">
          Kam to vedie
        </h2>
        {/*
          ⚠️ NOT FOR PUBLICATION. Six identifiable faces, written consent
          outstanding on every one, and the treatments beside them are
          estimates read off the photographs. See `patientsContent.ts`.
        */}
        <figure className={styles.case}>
          <CaseGallery cases={[featuredCase, ...patientCases]} />
          <figcaption className={styles.caseNote}>
            Fotografie zverejňujeme iba s písomným súhlasom pacienta.
          </figcaption>
        </figure>
      </section>

      {/*
        The bar that follows on a phone. A page this long puts the only way to
        act several flicks away from wherever the reader decides, and the
        decision does not wait for them to scroll back.
      */}
      <div className={styles.stickyBar}>
        <span className={styles.stickyPrice}>
          <strong>{offer.total}</strong>
          <s>{offer.listTotal}</s>
        </span>
        <Link className={styles.stickyAction} href="#booking">
          Objednať sa
        </Link>
      </div>
    </>
  );
}
