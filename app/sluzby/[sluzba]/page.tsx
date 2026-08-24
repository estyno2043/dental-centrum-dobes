import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { ServiceBooking } from "@/components/booking/ServiceBooking";
import { SiteHeader } from "@/components/hero/SiteHeader";
import { BeforeAfter } from "@/components/patients/BeforeAfter";
import { featuredCase } from "@/components/patients/patientsContent";
import {
  getServiceDetail,
  type ServicePhoto,
} from "@/components/services/serviceDetail";
import {
  allServices,
  getServiceBySlug,
} from "@/components/services/servicesContent";
import {
  BACKDROP_ATTRIBUTE,
  BACKDROP_FILTER,
  BACKDROP_SCRIM,
} from "@/components/services/serviceTransition";
import styles from "./service.module.css";

/**
 * A service page.
 *
 * Kept short on purpose: a headline, a picture, a column of one-line benefits,
 * what it costs, and a form. Services with an entry in `serviceDetail.ts`
 * render in full; the rest fall back to their name and the line the catalogue
 * already shows, so its cards always lead somewhere real while the pages are
 * written one at a time.
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

/** Pre-cropped clinic assets; the image service adds nothing to them. */
function Photo({
  photo,
  sizes,
  ratio,
}: Readonly<{ photo: ServicePhoto; sizes: string; ratio: number }>): JSX.Element {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- see above
    <img
      alt={photo.alt}
      decoding="async"
      height={Math.round(photo.width * ratio)}
      sizes={sizes}
      src={`/media/sluzby/${photo.src}.webp`}
      srcSet={
        `/media/sluzby/${photo.src}-mobile.webp ${photo.width / 2}w, ` +
        `/media/sluzby/${photo.src}.webp ${photo.width}w`
      }
      width={photo.width}
    />
  );
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
      <main className={styles.page} data-header-mode="quiet">
        {/*
          The service's own photograph, filling the page behind everything.
          It carries the `view-transition-name` the catalogue card hands over,
          so opening a service grows the picture out of its card and into this.
          Decorative — the page says what it is in words.
        */}
        <div
          aria-hidden="true"
          className={styles.backdrop}
          {...{ [BACKDROP_ATTRIBUTE]: "" }}
        >
          {service.image ? (
            /* eslint-disable-next-line @next/next/no-img-element -- Pre-cropped clinic asset. */
            <img
              alt=""
              className={styles.backdropPhoto}
              src={`/media/sluzby/${service.image}.webp`}
              /*
               * The look lives in `serviceTransition.ts` and is applied from
               * there, not from the stylesheet. The clone that flies out of the
               * catalogue card animates towards these exact values — two copies
               * of them would drift the first time either was touched, and the
               * symptom is an unexplainable flicker as the animation lands.
               */
              style={{ filter: BACKDROP_FILTER }}
            />
          ) : null}
          <span className={styles.scrim} style={{ background: BACKDROP_SCRIM }} />
        </div>

        <header className={styles.intro}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowRule} aria-hidden="true" />
            {detail?.kicker ?? "Služby"}
          </p>
          <h1 className={styles.headline}>{service.name}</h1>
          <p className={styles.lead}>{detail?.lead ?? service.lead}</p>
        </header>

        {detail ? (
          <>
            <dl className={styles.facts}>
              {detail.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>

            <section className={styles.block} aria-labelledby="benefits-heading">
              <h2 className={styles.blockHeading} id="benefits-heading">
                {detail.benefitsHeading}
              </h2>
              <ul className={styles.benefits}>
                {detail.benefits.map((benefit) => (
                  <li key={benefit}>
                    <span aria-hidden="true" className={styles.tick} />
                    {benefit}
                  </li>
                ))}
              </ul>
            </section>

            <div className={styles.gallery}>
              {detail.gallery.map((photo) => (
                <figure key={photo.src}>
                  <Photo
                    photo={photo}
                    ratio={3 / 4}
                    sizes="(max-width: 700px) 100vw, 22rem"
                  />
                </figure>
              ))}
            </div>

            {detail.bundle ? (
              <section className={styles.bundle} aria-labelledby="bundle-heading">
                <div className={styles.bundleInner}>
                  <h2 className={styles.blockHeading} id="bundle-heading">
                    {detail.bundle.heading}
                  </h2>
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
                    A question to ask, not an offer. The clinic's own wording
                    was seasonal, and a promotion that has quietly lapsed is
                    worse on a page than no promotion at all.
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
                {detail.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            {/*
              ⚠️ NOT FOR PUBLICATION. The same unconsented test pair the
              homepage carries: written consent is outstanding and the case text
              describes nobody real. The layout is here to be judged; the
              photographs must be replaced by consented cases first.
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
          </>
        ) : (
          <p className={styles.pending}>Obsah tejto stránky pripravujeme.</p>
        )}

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
