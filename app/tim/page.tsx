/* eslint-disable @next/next/no-img-element -- The logo is the approved static asset, matching the hero's markup. */

import type { Metadata } from "next";
import Link from "next/link";
import { TeamIntro } from "@/components/team/TeamIntro";
import { TeamQuote } from "@/components/team/TeamQuote";
import { TeamRoster } from "@/components/team/TeamRoster";
import { TeamStats } from "@/components/team/TeamStats";
import { teamCta } from "@/components/team/teamContent";
import styles from "@/components/team/team.module.css";

export const metadata: Metadata = {
  title: "Tím — Dental Centrum Dobeš",
  description:
    "Ľudia, ktorí sa starajú o ľudí. Lekári, hygiena a recepcia Dental Centrum Dobeš.",
};

export default function TeamPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Hlavná navigácia">
        <Link className={styles.navLogo} href="/">
          <img src="/media/dobes-logo-white.png" alt="Dental Centrum Dobeš" />
        </Link>
        <Link className={styles.navBack} href="/">
          <span aria-hidden="true">←</span> Späť na úvod
        </Link>
      </nav>

      <TeamIntro />
      <TeamRoster />
      <TeamQuote />
      <TeamStats />

      <section className={styles.cta} aria-labelledby="cta-heading">
        <h2 className={styles.ctaHeadline} id="cta-heading">
          {teamCta.headline}
        </h2>
        <p className={styles.ctaBody}>{teamCta.body}</p>
        <a className={styles.ctaAction} href={teamCta.action.href}>
          {teamCta.action.label}
        </a>
      </section>
    </main>
  );
}
