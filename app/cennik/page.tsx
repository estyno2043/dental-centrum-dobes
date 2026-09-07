import type { Metadata } from "next";
import type { JSX } from "react";

import { SiteHeader } from "@/components/hero/SiteHeader";
import { PriceList } from "@/components/pricing/PriceList";
import { priceGroups, priceValidFrom } from "@/components/pricing/pricingContent";
import styles from "@/components/pricing/pricing.module.css";

const entryCount = priceGroups.reduce(
  (sum, group) => sum + group.entries.length,
  0,
);

export const metadata: Metadata = {
  title: "Cenník — Dental Centrum Dobeš",
  description:
    `Kompletný cenník výkonov a produktov Dental Centrum Dobeš na Kramároch, ` +
    `platný od ${priceValidFrom}. ${entryCount} položiek s vyhľadávaním.`,
};

export default function PricingPage(): JSX.Element {
  return (
    <>
      <SiteHeader />
      {/*
        Pale ground: the header's only logo asset is white, so it has to be
        told, exactly as `/tim` tells it.
      */}
      <main className={styles.page} data-header-mode="light">
        <div className={styles.inner}>
          <p className={styles.kicker}>Cenník</p>
          <h1 className={styles.headline}>Ceny bez prekvapení.</h1>
          <p className={styles.lead}>
            Celý cenník výkonov aj produktov, tak ako ho máme na ambulancii.
            Cenu ošetrenia poznáte predtým, než začneme. A ak si nie ste istí,
            čo potrebujete, povieme vám to na vstupnej prehliadke.
          </p>
          <PriceList />
        </div>
      </main>
    </>
  );
}
