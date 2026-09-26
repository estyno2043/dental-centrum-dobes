import Link from "next/link";
import type { JSX } from "react";
import {
  IconArrowNarrowRight,
  IconCar,
  IconClock,
  IconPhone,
  IconStarFilled,
} from "@tabler/icons-react";

import { ReviewsTrigger } from "@/components/reviews/ReviewsTrigger";
import { reviewSummary } from "@/components/reviews/reviewsContent";
import { clinicLandline, clinicPhone, openingHours } from "@/components/site/siteContent";
import { OpenNow } from "./OpenNow";
import { ServiceBooking } from "./ServiceBooking";
import styles from "./bookingPanel.module.css";

/**
 * The close of every service page: why to book, the fastest way to do it,
 * and the form.
 *
 * Built 2026-09-26 when the user asked for every service page to convert
 * without pushing. Everything on the left is a fact the site already states
 * elsewhere (the Google score, the hours, free parking, the entry package);
 * nothing is invented to make the page sell. The phone is as large as the
 * form, because somebody who has put off a dentist rings rather than types.
 */
export function BookingPanel({
  service,
  serviceName,
  showEntryOffer,
  tone,
}: {
  readonly service: string;
  readonly serviceName: string;
  /** Suggest the entry examination to first-time visitors. Off on its own page. */
  readonly showEntryOffer: boolean;
  /** "kids" for the children's page: the same panel in its pastels. */
  readonly tone?: "kids";
}): JSX.Element {
  return (
    <aside
      aria-labelledby="booking-heading"
      className={styles.panel}
      data-tone={tone}
      id="booking"
    >
      <div className={styles.inner}>
        <div className={styles.pitch}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" className={styles.eyebrowRule} />
            Objednať sa · {serviceName}
          </p>
          <h2 className={styles.heading} id="booking-heading">
            Ozveme sa vám a nájdeme termín.
          </h2>
          <p className={styles.lead}>
            Nechajte nám meno a číslo. Zavoláme vám a dohodneme sa na čase,
            ktorý vám vyhovuje. Alebo nám rovno zavolajte.
          </p>

          <a className={styles.phone} href={clinicPhone.href}>
            <span aria-hidden="true" className={styles.phoneIcon}>
              <IconPhone size={22} stroke={1.7} />
            </span>
            <span>
              <small>Zavolajte priamo</small>
              <strong>{clinicPhone.label}</strong>
            </span>
          </a>
          <p className={styles.phoneMeta}>
            <OpenNow className={styles.open} dotClassName={styles.dot} />
            <span>
              Pevná linka <a href={clinicLandline.href}>{clinicLandline.label}</a>
            </span>
          </p>

          <ul className={styles.trust}>
            <li>
              <ReviewsTrigger className={styles.trustButton}>
                <IconStarFilled aria-hidden="true" className={styles.star} size={16} />
                <span>
                  <strong>{reviewSummary.average}</strong> {reviewSummary.countLabel} na Google
                </span>
              </ReviewsTrigger>
            </li>
            <li>
              <IconClock aria-hidden="true" size={16} stroke={1.7} />
              <span>
                {openingHours.map((row) => `${row.short} ${row.hours}`).join(" · ")}
              </span>
            </li>
            <li>
              <IconCar aria-hidden="true" size={16} stroke={1.7} />
              <span>Parkovanie pri klinike zdarma</span>
            </li>
          </ul>

          {showEntryOffer ? (
            <Link className={styles.entry} href="/sluzby/vstupna-prehliadka">
              <span>
                <small>Ste u nás prvýkrát?</small>
                Začnite vstupnou prehliadkou za 80 €
              </span>
              <IconArrowNarrowRight aria-hidden="true" size={18} stroke={1.7} />
            </Link>
          ) : null}
        </div>

        <div className={styles.card}>
          <ServiceBooking service={service} />
        </div>
      </div>
    </aside>
  );
}
