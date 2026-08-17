import type { Metadata } from "next";
import type { JSX } from "react";

import { SiteHeader } from "@/components/hero/SiteHeader";
import { TeamGrid } from "@/components/team/TeamGrid";
import { teamIntro, teamMembers } from "@/components/team/teamContent";
import styles from "@/components/team/team.module.css";

export const metadata: Metadata = {
  title: "Tím — Dental Centrum Dobeš",
  description:
    `${teamMembers.length} ľudí, ktorí sa v Dental Centrum Dobeš na Kramároch ` +
    "starajú o vaše zuby — lekári, dentálna hygienička a zdravotné sestry.",
};

export default function TeamPage(): JSX.Element {
  return (
    <>
      <SiteHeader />
      {/*
       * `data-header-mode="light"` for the whole page, not per section. There
       * is no hero here to carry the logo, so the header would otherwise be
       * hidden the moment the reader scrolls past the first screen — and on a
       * subpage the way back to the rest of the site has to stay reachable.
       */}
      <main className={styles.page} data-header-mode="light">
        <header className={styles.intro}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowRule} aria-hidden="true" />
            {teamIntro.eyebrow}
          </p>
          <h1 className={styles.headline}>{teamIntro.headline}</h1>
          <p className={styles.lead}>{teamIntro.lead}</p>
        </header>

        <TeamGrid />
      </main>
    </>
  );
}
