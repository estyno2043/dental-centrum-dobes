import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { ServiceBooking } from "@/components/booking/ServiceBooking";
import { SiteHeader } from "@/components/hero/SiteHeader";
import { BeforeAfter } from "@/components/patients/BeforeAfter";
import { featuredCase } from "@/components/patients/patientsContent";
import { getServiceDetail } from "@/components/services/serviceDetail";
import {
  allServices,
  getServiceBySlug,
} from "@/components/services/servicesContent";
import styles from "./service.module.css";

/**
 * A service page.
 *
 * Services with an entry in `serviceDetail.ts` render in full; the rest fall
 * back to their name and the one line the section already shows, so the
 * catalogue's cards always lead somewhere real while the pages are written one
 * at a time.
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

  const detail = getServiceDetail(sluzba);
  return {
    title: `${service.name} — Dental Centrum Dobeš`,
    description: detail?.lead ?? service.lead,
  };
}

export default async function ServicePage({
  params,
}: ServicePageProps): Promise<JSX.Element> {
  const { sluzba } = await params;
  const service = getServiceBySlug(sluzba);
  if (!service) notFound();

  const detail = getServiceDetail(sluzba);

  return (
    <>
      <SiteHeader />
      <main className={styles.page} data-header-mode="light">
        <header className={styles.intro}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowRule} aria-hidden="true" />
            {detail?.kicker ?? "Služby"}
          </p>
          <h1 className={styles.headline}>{service.name}</h1>
          <p className={styles.lead}>{detail?.lead ?? service.lead}</p>

          {detail ? (
            <dl className={styles.facts}>
              {detail.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className={styles.pending}>Obsah tejto stránky pripravujeme.</p>
          )}
        </header>

        {detail ? (
          <>
            <section className={styles.block} aria-labelledby="benefits-heading">
              <h2 className={styles.blockHeading} id="benefits-heading">
                {detail.benefitsHeading}
              </h2>
              <ul className={styles.benefits}>
                {detail.benefits.map((benefit, index) => (
                  <li key={benefit.title}>
                    <span aria-hidden="true" className={styles.benefitIndex}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                    <p className={styles.benefitBody}>{benefit.body}</p>
                  </li>
                ))}
              </ul>
            </section>

            {detail.bundle ? (
              <section className={styles.bundle} aria-labelledby="bundle-heading">
                <div className={styles.bundleInner}>
                  <h2 className={styles.blockHeading} id="bundle-heading">
                    {detail.bundle.heading}
                  </h2>
                  <p className={styles.bundleIntro}>{detail.bundle.intro}</p>
                  <ul className={styles.bundleList}>
                    {detail.bundle.items.map((item) => (
                      <li key={item.label}>
                        <span>{item.label}</span>
                        <span className={styles.bundlePrice}>{item.price}</span>
                      </li>
                    ))}
                    <li className={styles.bundleTotal}>
                      <span>Spolu</span>
                      <span className={styles.bundlePrice}>
                        {detail.bundle.total}
                      </span>
                    </li>
                  </ul>
                  {/*
                    Rendered as something to ask about rather than as an offer.
                    The clinic's own wording was seasonal, and a promotion that
                    has quietly lapsed is worse on a page than no promotion.
                  */}
                  {detail.bundle.unconfirmed ? (
                    <p className={styles.bundleNote}>{detail.bundle.unconfirmed}</p>
                  ) : null}
                </div>
              </section>
            ) : null}

            <section className={styles.block} aria-labelledby="steps-heading">
              <h2 className={styles.blockHeading} id="steps-heading">
                {detail.stepsHeading}
              </h2>
              <ol className={styles.steps}>
                {detail.steps.map((step, index) => (
                  <li key={step.title}>
                    <span aria-hidden="true" className={styles.stepIndex}>
                      {index + 1}
                    </span>
                    <h3 className={styles.benefitTitle}>{step.title}</h3>
                    <p className={styles.benefitBody}>{step.body}</p>
                  </li>
                ))}
              </ol>
            </section>

            {/*
              ⚠️ NOT FOR PUBLICATION. These are the same test photographs the
              homepage carries: written consent for each case is still
              outstanding and the accompanying text describes nobody real. The
              layout is here so it can be reviewed; the photographs have to be
              replaced by consented cases before this page goes live.
            */}
            <section className={styles.block} aria-labelledby="result-heading">
              <h2 className={styles.blockHeading} id="result-heading">
                Kam to vedie
              </h2>
              <figure className={styles.case}>
                <BeforeAfter patientCase={featuredCase} />
                <figcaption className={styles.caseNote}>
                  Fotografie zverejňujeme iba s písomným súhlasom pacienta.
                </figcaption>
              </figure>
            </section>

            <p className={styles.closing}>{detail.closing}</p>
          </>
        ) : null}

        {/*
          At the foot of every service page, and deliberately plain — the page
          above it is what persuades.
        */}
        <aside className={styles.booking} aria-labelledby="booking-heading">
          <h2 className={styles.blockHeading} id="booking-heading">
            Objednať sa
          </h2>
          <ServiceBooking service={service.slug} />
        </aside>
      </main>
    </>
  );
}
