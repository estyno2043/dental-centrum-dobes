import type { JSX } from "react";
import {
  IconArrowNarrowRight,
  IconCheck,
  IconPhone,
  IconStarFilled,
} from "@tabler/icons-react";

import { ServiceCta } from "@/components/booking/ServiceCta";
import { GoogleMark } from "@/components/reviews/GoogleMark";
import { ReviewsTrigger } from "@/components/reviews/ReviewsTrigger";
import { reviewSummary, reviews } from "@/components/reviews/reviewsContent";
import { CaseGallery } from "@/components/patients/CaseGallery";
import {
  featuredCase,
  patientCases,
} from "@/components/patients/patientsContent";
import { clinicPhone } from "@/components/site/siteContent";
import { getServiceDetail } from "../serviceDetail";
import {
  entryPhotos,
  entrySteps,
  objections,
  offer,
  proofReviewIds,
  reassurances,
  type EntryPhoto,
} from "./entryContent";
import styles from "./entry.module.css";

const detail = getServiceDetail("vstupna-prehliadka");
const proof = proofReviewIds
  .map((id) => reviews.find((review) => review.id === id))
  .filter((review) => review !== undefined);

/** A pre-cropped clinic photograph with its half-size candidate. */
function Photo({
  photo,
  sizes,
  className,
  priority = false,
}: {
  readonly photo: EntryPhoto;
  readonly sizes: string;
  readonly className?: string;
  readonly priority?: boolean;
}): JSX.Element {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Pre-cropped clinic asset.
    <img
      alt={photo.alt}
      className={className}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      height={photo.height}
      loading={priority ? "eager" : "lazy"}
      sizes={sizes}
      src={`/media/sluzby/${photo.src}.webp`}
      srcSet={
        `/media/sluzby/${photo.src}-mobile.webp ${photo.width / 2}w, ` +
        `/media/sluzby/${photo.src}.webp ${photo.width}w`
      }
      width={photo.width}
    />
  );
}

/**
 * The entry examination: the page most new patients arrive on, and the one
 * the clinic is won or lost on.
 *
 * Rebuilt 2026-09-26 to be both more visual and more clearly a page you can
 * act on. It opens on the offer beside the two people who will greet you, the
 * price and both ways to book in the first screen; what the 80 € buys is a
 * bento of the clinic's own photographs; the reviews, the steps beside the
 * waiting room, the questions as an accordion, and the results follow.
 *
 * Every element is still grounded in something the clinic already has: the
 * price list, their Google reviews, their answers. Nothing is invented to
 * convert better; a first-visit page that promises what the clinic cannot keep
 * loses the patient in the chair rather than before it.
 */
export function EntryBody(): JSX.Element {
  return (
    <>
      {/* --- the offer, beside the people ------------------------------ */}
      <section aria-labelledby="offer-heading" className={styles.hero}>
        <div className={styles.heroText}>
          <h2 className={styles.heroHeading} id="offer-heading">
            Celý chrup, jeden obraz a plán, ktorému rozumiete.
          </h2>
          <p className={styles.heroLead}>{detail?.lead}</p>

          <div className={styles.offerCard}>
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
              <span className={styles.offerTotalLabel}>
                Spolu zaplatíte
                <small>{offer.saving}</small>
              </span>
              <span className={styles.offerTotalValue}>
                <s>{offer.listTotal}</s>
                <strong>{offer.total}</strong>
              </span>
            </div>
            <p className={styles.offerCaption}>{offer.caption}</p>

            {/*
              Two ways to act, side by side, and the telephone is not the
              smaller one: somebody who has put off a dentist for years rings
              rather than fills in a form.
            */}
            <div className={styles.actions}>
              <a className={styles.actionPrimary} href="#booking">
                Objednať sa na prehliadku
                <IconArrowNarrowRight aria-hidden="true" size={18} stroke={1.8} />
              </a>
              <a className={styles.actionPhone} href={clinicPhone.href}>
                <IconPhone aria-hidden="true" size={17} stroke={1.7} />
                {clinicPhone.label}
              </a>
            </div>
          </div>
        </div>

        <figure className={styles.heroPhoto}>
          <Photo
            photo={entryPhotos.hero}
            priority
            sizes="(max-width: 900px) 100vw, 34rem"
          />
          {/* The rating on the photograph: the one figure people check. */}
          <ReviewsTrigger className={styles.heroBadge} hint="Čítať recenzie" hintClassName={styles.heroBadgeHint}>
            <span className={styles.heroBadgeMark}>
              <GoogleMark />
            </span>
            <strong>{reviewSummary.average}</strong>
            <span>
              <IconStarFilled aria-hidden="true" size={13} />
              {reviewSummary.countLabel}
            </span>
          </ReviewsTrigger>
        </figure>
      </section>

      {/* --- the plain facts, in one strip ------------------------------ */}
      <ul className={styles.strip}>
        {reassurances
          .filter((item) => !("reviews" in item))
          .map((item) => (
            <li key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </li>
          ))}
      </ul>

      {/* --- what the money buys, shown ------------------------------- */}
      {detail ? (
        <section aria-labelledby="includes-heading" className={styles.includes}>
          <h2 className={styles.sectionHeading} id="includes-heading">
            {detail.benefitsHeading}
          </h2>
          <ul className={styles.bento}>
            {detail.benefits.map((benefit, index) => {
              const photo = entryPhotos.benefits[index];
              return (
                <li className={styles.tile} key={benefit.title}>
                  {photo ? (
                    <Photo
                      className={styles.tilePhoto}
                      photo={photo}
                      sizes="(max-width: 900px) 100vw, 34rem"
                    />
                  ) : null}
                  <div className={styles.tileText}>
                    <span aria-hidden="true" className={styles.tileCheck}>
                      <IconCheck size={14} stroke={2.4} />
                    </span>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.note}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* --- proof, from people who were also putting it off ------------- */}
      <section aria-labelledby="proof-heading" className={styles.proof}>
        <div className={styles.proofHead}>
          <h2 className={styles.sectionHeading} id="proof-heading">
            Čo hovoria pacienti
          </h2>
          <ReviewsTrigger className={styles.proofMore}>
            <span className={styles.proofMark}>
              <GoogleMark />
            </span>
            {reviewSummary.average} · všetky recenzie
          </ReviewsTrigger>
        </div>
        <ul className={styles.quotes}>
          {proof.map((review) => (
            <li className={styles.quote} key={review.id}>
              <span aria-label={`${review.rating} z 5`} className={styles.stars} role="img">
                {Array.from({ length: review.rating }, (_, i) => (
                  <IconStarFilled aria-hidden="true" key={i} size={14} />
                ))}
              </span>
              <blockquote>
                <p>{review.text}</p>
              </blockquote>
              <footer className={styles.quoteAuthor}>
                <span aria-hidden="true" className={styles.avatar}>
                  {review.author.trim().charAt(0).toUpperCase()}
                </span>
                <cite>{review.author}</cite>
              </footer>
            </li>
          ))}
        </ul>
      </section>

      {/* --- the day itself, beside the waiting room --------------------- */}
      <section aria-labelledby="how-heading" className={styles.how}>
        <figure className={styles.howPhoto}>
          <Photo photo={entryPhotos.waitingRoom} sizes="(max-width: 900px) 100vw, 26rem" />
        </figure>
        <div>
          <h2 className={styles.sectionHeading} id="how-heading">
            Ako to prebieha
          </h2>
          <ol className={styles.howSteps}>
            {entrySteps.map((step, index) => (
              <li key={step.title}>
                <span aria-hidden="true" className={styles.howNumber}>
                  {index + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.note}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ServiceCta
        heading={`Vstupná prehliadka za ${offer.total} namiesto ${offer.listTotal}`}
        text="Tridsať minút, snímky v cene a plán, v ktorom je jasné, čo je súrne a čo počká."
      />

      {/* --- the reasons people do not ring ------------------------------ */}
      <section aria-labelledby="doubts-heading" className={styles.doubts}>
        <h2 className={styles.sectionHeading} id="doubts-heading">
          Čo sa pýtate najčastejšie
        </h2>
        <div className={styles.doubtList}>
          {objections.map((item) => (
            <details className={styles.doubt} key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* --- results ------------------------------------------------------ */}
      <section aria-labelledby="result-heading" className={styles.results}>
        <h2 className={styles.sectionHeading} id="result-heading">
          Kam to vedie
        </h2>
        {/*
          Publication and accuracy both cleared by the clinic on 2026-09-04;
          `patientsContent.ts` records what was asked and what came back.
        */}
        <figure className={styles.case}>
          <CaseGallery cases={[featuredCase, ...patientCases]} />
          <figcaption className={styles.caseNote}>
            Fotografie zverejňujeme iba s písomným súhlasom pacienta.
          </figcaption>
        </figure>
      </section>
    </>
  );
}
