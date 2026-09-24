import type { JSX, ReactNode } from "react";
import { IconChevronDown } from "@tabler/icons-react";

import styles from "./more.module.css";

/**
 * "Zobraziť viac" for a service page.
 *
 * The user's note on endodontics was that the page read as a wall of text:
 * whoever wants the detail will open it, and everybody else should be able to
 * read the page by its headings and its one strong line per section.
 *
 * A native `<details>` rather than a client component. It opens with a click,
 * a keypress or a screen reader with no JavaScript at all, the browser's own
 * find-in-page opens it when a search lands inside, and it costs no bundle.
 * The label swaps to "Zobraziť menej" through CSS on `[open]`.
 */
export function More({
  children,
  label = "Zobraziť viac",
  tone = "dark",
}: {
  readonly children: ReactNode;
  readonly label?: string;
  /** `light` for text on a dark panel. */
  readonly tone?: "dark" | "light";
}): JSX.Element {
  return (
    <details className={styles.more} data-tone={tone}>
      <summary>
        <span className={styles.open}>{label}</span>
        <span className={styles.close}>Zobraziť menej</span>
        <IconChevronDown aria-hidden="true" size={16} stroke={1.8} />
      </summary>
      <div className={styles.body}>{children}</div>
    </details>
  );
}
