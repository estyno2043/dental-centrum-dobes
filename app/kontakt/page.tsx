import type { Metadata } from "next";
import type { JSX } from "react";

import { ContactForm } from "@/components/conversion/ContactForm";
import { PageShell } from "@/components/site/PageShell";
import { clinicFacts, clinicPhone } from "@/components/site/siteContent";
import styles from "./kontakt.module.css";

export const metadata: Metadata = {
  title: "Kontakt — Dental Centrum Dobeš",
  description:
    "Objednajte sa do Dental Centrum Dobeš na Kramároch. Zavolajte na " +
    "0918 800 002 alebo nám napíšte cez objednávkový formulár.",
};

/**
 * ⚠️ Address, e-mail and opening hours are deliberately absent.
 *
 * The clinic has not confirmed any of them, and a contact page is the single
 * worst place on a site to publish a plausible guess — someone drives to it.
 * Every fact below comes from the clinic's own brief. Recorded as a blocker in
 * `COLLAB.md`.
 */
export default function ContactPage(): JSX.Element {
  return (
    <PageShell
      eyebrow="Kontakt"
      lead="Zavolajte nám, alebo nechajte číslo a ozveme sa vám sami. Akútne stavy riešime prednostne."
      title="Ozvite sa nám."
    >
      <div className={styles.layout}>
        <div className={styles.details}>
          <a className={styles.phoneCard} href={clinicPhone.href}>
            <span className={styles.phoneLabel}>Zavolajte nám</span>
            <span className={styles.phoneNumber}>{clinicPhone.label}</span>
          </a>

          <ul className={styles.facts}>
            {clinicFacts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>

        <div className={styles.formColumn}>
          <h2 className={styles.formTitle}>Objednávkový formulár</h2>
          <ContactForm />
        </div>
      </div>
    </PageShell>
  );
}
