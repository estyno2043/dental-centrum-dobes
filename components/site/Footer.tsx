import Link from "next/link";

import {
  operators,
  privacyPath,
  privacyReady,
} from "@/components/legal/legalContent";
import type { JSX } from "react";

import { navigationItems } from "@/components/hero/heroContent";
import { FooterHours } from "./FooterHours";
import { FooterMark } from "./FooterMark";
import {
  clinicAddress,
  clinicLandline,
  clinicMap,
  clinicName,
  clinicPhone,
} from "./siteContent";
import styles from "./footer.module.css";

/**
 * The site footer, on every page, and the destination of the menu's Kontakt
 * entry — hence `id="kontakt"`.
 *
 * Shaped after the reference the user supplied: a footer nearly a screen tall,
 * a wordmark standing still on the left while a column of labelled blocks
 * travels past it on the right. What was not taken is the reference's bank
 * details and funding notice, which are its legal obligation rather than its
 * design.
 *
 * `data-header-mode="none"` is not decoration. The header takes its appearance
 * from whichever zone sits under it, and without a declaration here it would
 * keep the pale mode of the section above and put a white logo on light chrome
 * over an ink footer.
 *
 * The legal row, the operator's identification and the privacy notice, is
 * drafted in `components/legal/legalContent.ts` (2026-09-26) and appears here
 * only when `privacyReady` is true, which needs facts only the clinic can
 * give (seat, register entry, a privacy e-mail). Until then the row is the
 * copyright line alone: inventing a seat or linking a page that answers 404
 * would put a false claim in the one part of a site people read as factual.
 */
export function Footer(): JSX.Element {
  return (
    <footer className={styles.footer} data-header-mode="none" id="kontakt">
      <div className={styles.inner}>
        {/* Stands still; the blocks travel past it. */}
        <div className={styles.markColumn}>
          <FooterMark />
          <p className={styles.tagline}>
            Súkromná zubná klinika pri Kramároch v&nbsp;Bratislave
          </p>
        </div>

        <div className={styles.blocks}>
          <section className={styles.block}>
            <h2 className={styles.label}>Kontakt</h2>
            <a className={styles.line} href={clinicPhone.href}>
              {clinicPhone.label}
            </a>
            <a className={styles.line} href={clinicLandline.href}>
              {clinicLandline.label}
            </a>
          </section>

          <section className={styles.block}>
            <h2 className={styles.label}>Kde nás nájdete</h2>
            <address className={styles.address}>
              {clinicAddress.street}
              <br />
              {clinicAddress.city}
            </address>
            {/*
              OpenStreetMap, not Google: an embedded Google map calls home and
              sets cookies before anybody has consented to anything, and this
              site has no consent banner yet. Lazy, so it costs nothing until
              somebody reaches the bottom of a page.
            */}
            <div className={styles.map}>
              <iframe
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={clinicMap.embedHref}
                title={clinicMap.title}
              />
            </div>
            <a
              className={styles.mapLink}
              href={clinicAddress.mapHref}
              rel="noreferrer"
              target="_blank"
            >
              Otvoriť v mapách
            </a>
          </section>

          <section className={styles.block}>
            <h2 className={styles.label}>Ordinačné hodiny</h2>
            <FooterHours />
          </section>

          <section className={styles.block}>
            <h2 className={styles.label}>Na webe</h2>
            <nav aria-label="Pätička">
              <ul className={styles.nav}>
                {/*
                  Everything except Kontakt, which is this footer. A link that
                  scrolls to the element it sits inside is a link to nowhere.
                */}
                {navigationItems
                  .filter((item) => item.href !== "#kontakt")
                  .map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>{item.label}</Link>
                    </li>
                  ))}
              </ul>
            </nav>
          </section>
        </div>
      </div>

      <p className={styles.legal}>
        © {new Date().getFullYear()} {clinicName}
        {privacyReady ? (
          <>
            {operators.map((operator) => (
              <span className={styles.legalItem} key={operator.ico}>
                {operator.name}, {operator.seat}, IČO {operator.ico}
              </span>
            ))}
            <Link className={styles.legalItem} href={privacyPath}>
              Ochrana osobných údajov
            </Link>
          </>
        ) : null}
      </p>
    </footer>
  );
}
