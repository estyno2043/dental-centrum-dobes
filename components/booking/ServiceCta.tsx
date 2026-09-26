import type { JSX } from "react";
import { IconArrowNarrowRight, IconPhone } from "@tabler/icons-react";

import { clinicPhone } from "@/components/site/siteContent";
import styles from "./serviceCta.module.css";

/**
 * A pause in the middle of a service page where the reader can act.
 *
 * Placed right after the part of a page that settles the reader's question,
 * worded as that page's next step rather than a slogan. One sentence, the
 * two ways to act, nothing else.
 */
export function ServiceCta({
  heading,
  text,
}: {
  readonly heading: string;
  readonly text: string;
}): JSX.Element {
  return (
    <aside className={styles.wrap}>
      <div className={styles.cta}>
        <div className={styles.copy}>
          <p className={styles.heading}>{heading}</p>
          <p className={styles.text}>{text}</p>
        </div>
        <div className={styles.actions}>
          <a className={styles.book} href="#booking">
            Objednať sa
            <IconArrowNarrowRight aria-hidden="true" size={18} stroke={1.8} />
          </a>
          <a className={styles.call} href={clinicPhone.href}>
            <IconPhone aria-hidden="true" size={17} stroke={1.8} />
            {clinicPhone.label}
          </a>
        </div>
      </div>
    </aside>
  );
}
