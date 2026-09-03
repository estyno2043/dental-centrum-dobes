import Link from "next/link";
import type { JSX } from "react";
import { IconArrowNarrowRight } from "@tabler/icons-react";

import { anchorPrices, priceGroups } from "./pricingContent";
import styles from "./pricingBand.module.css";

const entryCount = priceGroups.reduce(
  (sum, group) => sum + group.entries.length,
  0,
);

/**
 * The homepage's last word: four prices and the way to the rest.
 *
 * Four, not the whole list. The page this sits at the end of has already spent
 * twenty thousand pixels on why; someone still reading wants to know what it
 * costs, and a 248-row table answers that by burying it. These are the four
 * people ring up to ask.
 *
 * Whole procedures, never an "od" teased off the cheapest component — see the
 * note on `anchorPrices`. A price that is technically true and practically
 * wrong is worse here than no price at all, because this is the number someone
 * carries into the appointment.
 *
 * A Server Component: it is four strings and a link, and there is nothing here
 * a browser needs to be told twice.
 */
export function PricingBand(): JSX.Element {
  return (
    <section
      aria-labelledby="pricing-heading"
      className={styles.band}
      data-header-mode="light"
      id="cennik"
    >
      <div className={styles.inner}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" className={styles.eyebrowRule} />
            Cenník
          </p>
          <h2 className={styles.headline} id="pricing-heading">
            Cenu poznáte skôr, než si sadnete do kresla.
          </h2>
          <p className={styles.lead}>
            Žiadne dopočítavanie po ošetrení. Toto sú ceny, na ktoré sa pýtate
            najčastejšie — zvyšok nájdete v cenníku.
          </p>
        </header>

        <ul className={styles.prices}>
          {anchorPrices.map((entry) => (
            <li className={styles.price} key={entry.label}>
              <span className={styles.amount}>{entry.price}</span>
              <span className={styles.label}>{entry.label}</span>
            </li>
          ))}
        </ul>

        <Link className={styles.more} href="/cennik">
          <span>Celý cenník — {entryCount} položiek</span>
          <IconArrowNarrowRight size={18} stroke={1.7} />
        </Link>
      </div>
    </section>
  );
}
