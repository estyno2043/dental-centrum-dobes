import Link from "next/link";
import type { JSX } from "react";

import { clinicName, clinicPhone, navigationItems } from "./siteContent";
import styles from "./footer.module.css";

/**
 * The site footer.
 *
 * A plain server component — nothing here moves, so nothing here needs a
 * client bundle.
 *
 * The clinic's practical facts are deliberately not repeated here — they are
 * the contact page's job, and `/kontakt` would otherwise state them twice on
 * one screen.
 *
 * ⚠️ No legal links. Zásady ochrany osobných údajov, the operator's
 * identification (obchodné meno, sídlo, IČO) and the clinic's address all
 * belong in this footer and none of them exist yet. Inventing a link target or
 * a company detail would put a false claim in the one place on a site people
 * trust to be factual, so the row is absent until the clinic supplies it.
 * Recorded as a blocker in `COLLAB.md`.
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
