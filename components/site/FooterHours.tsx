"use client";

import type { JSX } from "react";

import { openingHours } from "./siteContent";
import { useOpenStatus } from "./useOpenStatus";
import styles from "./footer.module.css";

/**
 * Opening hours that know what day it is.
 *
 * The reference footer this was modelled on lists its hours as a dead table.
 * This marks today's row and says whether the clinic is open right now, which
 * is the only question anybody actually has when they look at opening hours.
 *
 * ⚠️ Resolved after mount, never on the server. The server has no idea what
 * time it is where the reader is, and rendering a guess would either mismatch
 * on hydration or state the wrong thing for a minute. Until it resolves the
 * rows render plainly, which is what a reader without JavaScript keeps.
 *
 * ⚠️ It does not know about holidays. So it never says "open" without also
 * showing the hours it is reasoning from, and the closed wording is
 * "Dnes máme zatvorené" rather than a promise about tomorrow.
 */
/**
 * The current minute, or `null` on the server.
 *
 * `useSyncExternalStore` rather than an effect that sets state: the server
 * snapshot is `null`, so the first client render matches the server's markup
 * exactly and there is no hydration mismatch to paper over. The subscription
 * also keeps it honest across a minute boundary, which matters at 18:59.
 */


export function FooterHours(): JSX.Element {
  const { today, label: status } = useOpenStatus();

  return (
    <>
      <dl className={styles.hours}>
        {openingHours.map((row) => (
          <div
            data-today={row === today ? "true" : undefined}
            key={row.days}
          >
            <dt>{row.days}</dt>
            <dd>{row.hours}</dd>
          </div>
        ))}
      </dl>
      {status ? (
        <p aria-live="polite" className={styles.status}>
          {status}
        </p>
      ) : null}
    </>
  );
}
