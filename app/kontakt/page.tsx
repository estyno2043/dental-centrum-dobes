import type { Metadata } from "next";
import type { JSX } from "react";

import { ContactForm } from "@/components/conversion/ContactForm";
import { SiteHeader } from "@/components/hero/SiteHeader";
import {
  clinicAddress,
  clinicFacts,
  clinicLandline,
  clinicPhone,
  openingHours,
} from "@/components/site/siteContent";
import styles from "./kontakt.module.css";

export const metadata: Metadata = {
  title: "Kontakt — Dental Centrum Dobeš",
  description:
    "Dental Centrum Dobeš, Vlárska 13/c, Bratislava-Kramáre. Objednajte sa " +
    "na 0918 800 002 alebo cez formulár. Po–Št 8:00–19:00, Pi 8:00–14:00.",
};

/**
 * `/kontakt`.
 *
 * Built like `/cennik` rather than on a shared shell: those two and `/tim`
 * each carry their own intro, and a third parallel abstraction would be one
 * more than three pages justify.
 *
 * Address and hours come from the clinic's previous site and are flagged in
 * `siteContent.ts` as needing one read-back. They are published rather than
 * withheld because a clinic page without an address is useless, and these are
 * the clinic's own stated details rather than a guess.
 */
export default function ContactPage(): JSX.Element {
  return (
    <>
      {/*
        Pale ground: the header's only logo asset is white, so it has to be
        told, exactly as `/cennik` and `/tim` tell it.
      */}
      <SiteHeader />
      <main className={styles.page} data-header-mode="light">
        <div className={styles.inner}>
          <p className={styles.kicker}>Kontakt</p>
          <h1 className={styles.headline}>Ozvite sa nám.</h1>
          <p className={styles.lead}>
            Zavolajte, alebo nechajte číslo a ozveme sa vám sami. Termín vám
            vieme dať spravidla do mesiaca, akútne stavy riešime prednostne.
          </p>

          <div className={styles.layout}>
            <div className={styles.details}>
              <a className={styles.phoneCard} href={clinicPhone.href}>
                <span className={styles.phoneLabel}>Zavolajte nám</span>
                <span className={styles.phoneNumber}>{clinicPhone.label}</span>
              </a>

              <div>
                <h2 className={styles.blockHeading}>Kde nás nájdete</h2>
                <address className={styles.address}>
                  <a
                    href={clinicAddress.mapHref}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {clinicAddress.street}
                    <br />
                    {clinicAddress.city}
                  </a>
                </address>
              </div>

              <div>
                <h2 className={styles.blockHeading}>Ordinačné hodiny</h2>
                <dl className={styles.hours}>
                  {openingHours.map((row) => (
                    <div key={row.days}>
                      <dt>{row.days}</dt>
                      <dd>{row.hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <h2 className={styles.blockHeading}>Pevná linka</h2>
                <p className={styles.address}>
                  <a href={clinicLandline.href}>{clinicLandline.label}</a>
                </p>
              </div>

              <ul className={styles.facts}>
                {clinicFacts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </div>

            <div className={styles.formColumn}>
              <h2 className={styles.formTitle}>Napíšte nám</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
