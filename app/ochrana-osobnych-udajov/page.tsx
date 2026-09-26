import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { SiteHeader } from "@/components/hero/SiteHeader";
import {
  bookingRetention,
  operators,
  privacyContact,
  privacyEffective,
  privacyReady,
  privacySections,
} from "@/components/legal/legalContent";
import styles from "@/components/legal/legal.module.css";

export const metadata: Metadata = {
  title: "Ochrana osobných údajov — Dental Centrum Dobeš",
  description:
    "Ako Dental Centrum Dobeš spracúva osobné údaje z objednávkového formulára, " +
    "aké má web cookies a aké máte práva.",
};

/**
 * The privacy notice.
 *
 * Answers 404 until every fact the clinic has to supply is in
 * `legalContent.ts` (seat, register entry, a privacy e-mail, how long a
 * booking is kept, the effective date). A published notice with a blank
 * where the controller's address should be is worse than none.
 */
export default function PrivacyPage(): JSX.Element {
  if (!privacyReady) notFound();

  return (
    <>
      <SiteHeader />
      <main className={styles.page} data-header-mode="light">
        <div className={styles.inner}>
          <p className={styles.kicker}>Ochrana osobných údajov</p>
          <h1 className={styles.headline}>Vaše údaje a čo s nimi robíme.</h1>
          <p className={styles.lead}>
            Stručne a presne: čo náš web o vás zistí, načo to potrebujeme a
            ako to môžete kedykoľvek zmeniť.
          </p>

          <section aria-labelledby="operator-heading" className={styles.card}>
            <h2 className={styles.cardHeading} id="operator-heading">
              {operators.length > 1 ? "Prevádzkovatelia" : "Prevádzkovateľ"}
            </h2>
            {operators.map((operator) => (
              <p className={styles.operator} key={operator.ico}>
                <strong>{operator.name}</strong>
                <span className={styles.role}>{operator.role}</span>
                <span>{operator.seat}</span>
                <span>IČO: {operator.ico}</span>
                <span>{operator.register}</span>
              </p>
            ))}
            <p className={styles.contact}>
              Otázky k ochrane údajov:{" "}
              <a href={`mailto:${privacyContact.email}`}>{privacyContact.email}</a>
              {" · "}
              <a href={`tel:+421${privacyContact.phone.replace(/\s/g, "").slice(1)}`}>
                {privacyContact.phone}
              </a>
            </p>
          </section>

          {privacySections(bookingRetention ?? "").map((section) => (
            <section className={styles.section} key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}

          <p className={styles.effective}>Platné od {privacyEffective}.</p>
        </div>
      </main>
    </>
  );
}
