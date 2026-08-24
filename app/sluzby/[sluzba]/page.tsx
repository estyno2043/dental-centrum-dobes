import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { SiteHeader } from "@/components/hero/SiteHeader";
import {
  allServices,
  getServiceBySlug,
} from "@/components/services/servicesContent";
import styles from "./service.module.css";

/**
 * A service page.
 *
 * ⚠️ PLACEHOLDER. It carries the name and the one line the section already
 * shows, and nothing else. It exists so the section's cards lead somewhere
 * real while the ten pages are written one at a time — it is not the finished
 * page and must not be published as one.
 *
 * Two things it is still missing:
 *
 * - The content. What the treatment involves, how long it takes, what it
 *   costs and which insurers cover it all have to come from the clinic.
 * - The booking form. `JawAppointmentForm` requires a `zone: JawZone`, so it
 *   cannot sit under a service until that coupling is loosened — and five of
 *   the ten services have no jaw zone at all.
 */
type ServicePageProps = Readonly<{
  params: Promise<{ sluzba: string }>;
}>;

export function generateStaticParams() {
  return allServices.map(({ slug }) => ({ sluzba: slug }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { sluzba } = await params;
  const service = getServiceBySlug(sluzba);
  if (!service) return {};

  return {
    title: `${service.name} — Dental Centrum Dobeš`,
    description: service.lead,
  };
}

export default async function ServicePage({
  params,
}: ServicePageProps): Promise<JSX.Element> {
  const { sluzba } = await params;
  const service = getServiceBySlug(sluzba);
  if (!service) notFound();

  return (
    <>
      <SiteHeader />
      <main className={styles.page} data-header-mode="light">
        <article className={styles.body}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowRule} aria-hidden="true" />
            Služby
          </p>
          <h1 className={styles.headline}>{service.name}</h1>
          <p className={styles.lead}>{service.lead}</p>
          <p className={styles.pending}>
            Obsah tejto stránky pripravujeme.
          </p>
        </article>
      </main>
    </>
  );
}
