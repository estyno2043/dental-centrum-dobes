import type { JSX, ReactNode } from "react";

import { SiteHeader } from "@/components/hero/SiteHeader";
import { Footer } from "./Footer";
import styles from "./pageShell.module.css";

type PageShellProps = Readonly<{
  eyebrow: string;
  title: string;
  lead?: string;
  children: ReactNode;
}>;

/**
 * The shell every content subpage sits in.
 *
 * `data-header-mode="light"` matters more than it looks. The header hides
 * itself with `visibility` unless a section asks for it, and its only
 * concession to a page without a hero is that `onHero` stays true near the
 * top. Without a zone declaring a mode, scrolling down a subpage would take
 * the navigation away and leave no way back. Declaring `light` also settles
 * the ground these pages use: pale, because the header's only logo asset is
 * white and `light` is the mode that gives it a bar dark enough to read on.
 */
export function PageShell({
  eyebrow,
  title,
  lead,
  children,
}: PageShellProps): JSX.Element {
  return (
    <>
      <SiteHeader />
      <main className={styles.page} data-header-mode="light">
        <header className={styles.intro}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" className={styles.eyebrowRule} />
            {eyebrow}
          </p>
          <h1 className={styles.title}>{title}</h1>
          {lead ? <p className={styles.lead}>{lead}</p> : null}
        </header>
        {children}
      </main>
      <Footer />
    </>
  );
}
