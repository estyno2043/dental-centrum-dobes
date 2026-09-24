import Link from "next/link";
import type { JSX } from "react";

import { navigationItems } from "@/components/hero/heroContent";
import {
  clinicAddress,
  clinicLandline,
  clinicName,
  clinicPhone,
  openingHours,
} from "./siteContent";
import styles from "./footer.module.css";

/**
 * The site footer, on every page.
 *
 * A plain server component: nothing here moves, so nothing here needs a client
 * bundle.
 *
 * `data-header-mode="none"` is not decoration. The header reads the mode off
 * whichever zone sits under it, and without a declaration here it would keep
 * the mode of the section above, which on most pages is a pale one. Over an
 * ink footer that would put a white logo on light-mode chrome.
 *
 * ⚠️ No legal row yet. Zásady ochrany osobných údajov and the operator's
 * identification (obchodné meno, sídlo, IČO) belong here and none of them
 * exist. Inventing a link target or a company number would put a false claim
 * in the one part of a site people read as factual, so the row is absent
 * rather than approximated.
 */
export function Footer(): JSX.Element {
  return (
    <footer className={styles.footer} data-header-mode="none">
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link className={styles.logo} href="/">
            {/* eslint-disable-next-line @next/next/no-img-element -- The approved logo asset, used at its own size. */}
            <img
              alt={clinicName}
              height="381"
              src="/media/dobes-logo-white.png"
              width="900"
            />
          </Link>
          <p className={styles.tagline}>
            Súkromná zubná klinika pri Kramároch v&nbsp;Bratislave
          </p>
          <a className={styles.phone} href={clinicPhone.href}>
            <span className={styles.phoneLabel}>Objednajte sa</span>
            <span className={styles.phoneNumber}>{clinicPhone.label}</span>
          </a>
        </div>

        <div className={styles.contact}>
          <h2 className={styles.heading}>Kde nás nájdete</h2>
          <address className={styles.address}>
            <a href={clinicAddress.mapHref} rel="noreferrer" target="_blank">
              {clinicAddress.street}
              <br />
              {clinicAddress.city}
            </a>
          </address>
          <dl className={styles.hours}>
            {openingHours.map((row) => (
              <div key={row.days}>
                <dt>{row.days}</dt>
                <dd>{row.hours}</dd>
              </div>
            ))}
          </dl>
          <a className={styles.landline} href={clinicLandline.href}>
            {clinicLandline.label}
          </a>
        </div>

        <nav aria-label="Pätička" className={styles.nav}>
          <ul>
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className={styles.legal}>
        © {new Date().getFullYear()} {clinicName}
      </p>
    </footer>
  );
}
