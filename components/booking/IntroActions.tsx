import type { JSX } from "react";
import { IconArrowNarrowRight, IconPhone } from "@tabler/icons-react";

import { clinicPhone } from "@/components/site/siteContent";
import styles from "./introActions.module.css";

/**
 * Two small actions at the top of a service page, beside its name: book, or
 * ring. Above the fold on every page without shouting over the page's own
 * opening, which is what does the persuading.
 */
export function IntroActions(): JSX.Element {
  return (
    <div className={styles.actions}>
      <a className={styles.book} href="#booking">
        Objednať sa
        <IconArrowNarrowRight aria-hidden="true" size={16} stroke={1.8} />
      </a>
      <a className={styles.call} href={clinicPhone.href}>
        <IconPhone aria-hidden="true" size={16} stroke={1.8} />
        {clinicPhone.label}
      </a>
    </div>
  );
}
