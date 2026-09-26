import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { BookingPanel } from "@/components/booking/BookingPanel";
import { IntroActions } from "@/components/booking/IntroActions";
import { StickyBookingBar } from "@/components/booking/StickyBookingBar";
import { offer as entryOffer } from "@/components/services/entry/entryContent";
import { SiteHeader } from "@/components/hero/SiteHeader";
import { AestheticBody } from "@/components/services/aesthetic/AestheticBody";
import { EndoBody } from "@/components/services/endo/EndoBody";
import { FillingsBody } from "@/components/services/fillings/FillingsBody";
import { ProstheticsBody } from "@/components/services/prosthetics/ProstheticsBody";
import { SurgeryBody } from "@/components/services/surgery/SurgeryBody";
import { BackdropFade } from "@/components/services/BackdropFade";
import { EntryBody } from "@/components/services/entry/EntryBody";
import { HygieneBody } from "@/components/services/hygiene/HygieneBody";
import { ImplantBody } from "@/components/services/implants/ImplantBody";
import { KidsBody } from "@/components/services/kids/KidsBody";
import { PerioBody } from "@/components/services/perio/PerioBody";
import { CaseGallery } from "@/components/patients/CaseGallery";
import {
  featuredCase,
  patientCases,
} from "@/components/patients/patientsContent";
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

/**
 * Services whose page is its own shape rather than the shared one.
 *
 * The shell — backdrop, the morph out of the catalogue card, the back button,
 * the booking form — stays common, so the pages read as a family. What differs
 * is the middle, because the services differ: the entry examination is a
 * package and reads as one, while dental hygiene is an eight-step protocol and
 * that sequence *is* its page. Forcing both through one layout would have made
 * the second a worse version of the first.
 *
 * A slug absent here falls back to the shared layout, so adding a bespoke page
 * is one line and never a rewrite.
 */
/**
 * Pages that want a different ground under them.
 *
 * The shell's cream is the site's, and every service page keeps it except the
 * children's one, which the user asked to carry a pink-to-blue wash. Declared
 * here as an attribute rather than painted from inside the body, because the
 * body renders *inside* the shell's padded, max-width column and cannot reach
 * the full page. One attribute, one rule in `service.module.css`.
 */
const BESPOKE_TONES: Readonly<Record<string, string>> = {
  "osetrenie-deti": "kids",
};

/*
 * Bodies that open on a hero of their own: a large headline, facts and a
 * drawing. On these the shell's intro used to stack a second, equally large
 * headline and lead above it, two openings in a row (2026-09-26 audit). For
 * them the intro becomes one line, "Služby · <name>", and the body's own
 * opening is the hero. The name is still the page's `h1`; it is only drawn
 * small. The hygiene, entry and implant bodies start straight into their
 * content, so they keep the full intro.
 */
const BESPOKE_HEROES: ReadonlySet<string> = new Set([
  "vstupna-prehliadka",
  "esteticka-stomatologia",
  "parodontologia",
  "endodoncia",
  "osetrenie-deti",
  "biele-vyplne",
  "protetika",
  "stomatochirurgia",
]);

const OWN_OPENING_ACTIONS: ReadonlySet<string> = new Set([
  "vstupna-prehliadka",
  "dentalna-hygiena",
]);

const BESPOKE_BODIES: Readonly<Record<string, () => JSX.Element>> = {
  "dentalna-hygiena": HygieneBody,
  "vstupna-prehliadka": EntryBody,
  "esteticka-stomatologia": AestheticBody,
  "zubne-implantaty": ImplantBody,
  parodontologia: PerioBody,
  endodoncia: EndoBody,
  "osetrenie-deti": KidsBody,
  "biele-vyplne": FillingsBody,
  protetika: ProstheticsBody,
  stomatochirurgia: SurgeryBody,
};

export default async function ServicePage({
  params,
}: ServicePageProps): Promise<JSX.Element> {
  const { sluzba } = await params;
  const service = getServiceBySlug(sluzba);
  if (!service) notFound();

  const detail = getServiceDetail(sluzba);
  const BespokeBody = BESPOKE_BODIES[sluzba];
  const hero = BESPOKE_HEROES.has(sluzba);
  /* The entry and hygiene pages open on their own pair of buttons. */
  const introActions = !OWN_OPENING_ACTIONS.has(sluzba);

  return (
    <>
      {/* The page knows it is quiet, so the header need not wait for a
          measurement to find out — see `SiteHeader`. */}
      <SiteHeader initialMode="quiet" />
      <main
        className={styles.page}
        data-header-mode="quiet"
        data-tone={BESPOKE_TONES[sluzba]}
      >
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

        <BackdropFade />

        {hero ? (
          <header className={`${styles.intro} ${styles.introCompact}`}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowRule} aria-hidden="true" />
              {detail?.kicker ?? "Služby"}
            </p>
            <h1 className={styles.headlineCompact}>{service.name}</h1>
            {introActions ? (
              <div className={styles.introActionsCompact}>
                <IntroActions />
              </div>
            ) : null}
          </header>
        ) : (
          <header className={styles.intro}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowRule} aria-hidden="true" />
              {detail?.kicker ?? "Služby"}
            </p>
            <h1 className={styles.headline}>{service.name}</h1>
            <p className={styles.lead}>{detail?.lead ?? service.lead}</p>
            {introActions ? <IntroActions /> : null}
          </header>
        )}

        {BespokeBody ? (
          <BespokeBody />
        ) : detail ? (
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
              {/*
                Four things, each with its own line of explanation. What was
                here before was a dozen mixed together — the deliverables and
                the conveniences in one column — which read as a wall and hid
                the four that the price actually buys.
              */}
              <ul className={styles.inclusions}>
                {detail.benefits.map((benefit, index) => (
                  <li key={benefit.title}>
                    <span aria-hidden="true" className={styles.inclusionIndex}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className={styles.inclusionTitle}>{benefit.title}</h3>
                    <p className={styles.inclusionNote}>{benefit.note}</p>
                  </li>
                ))}
              </ul>

              <h3 className={styles.extrasHeading}>{detail.extrasHeading}</h3>
              <ul className={styles.extras}>
                {detail.extras.map((extra) => (
                  <li key={extra}>
                    <span aria-hidden="true" className={styles.tick} />
                    {extra}
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
                      <li className={item.free ? styles.bundleFree : undefined} key={item.label}>
                        <span>{item.label}</span>
                        <span className={styles.bundlePrice}>
                          {item.free ? (
                            <>
                              {/* The price stays, struck through: what it is
                                  worth is the reason free means anything. */}
                              <s>{item.price}</s>
                              <em className={styles.freeTag}>zdarma</em>
                            </>
                          ) : (
                            item.price
                          )}
                        </span>
                      </li>
                    ))}
                    <li className={styles.bundleTotal}>
                      <span>Spolu</span>
                      <span className={styles.bundlePrice}>
                        <s className={styles.bundleWas}>
                          {detail.bundle.listTotal}
                        </s>
                        {detail.bundle.total}
                      </span>
                    </li>
                  </ul>
                  <p className={styles.bundleSaving}>{detail.bundle.saving}</p>
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
              Publication and accuracy both cleared by the clinic on
              2026-09-04 — see the header of `patientsContent.ts`, which
              records what was asked and what came back.
            */}
            <section className={styles.block} aria-labelledby="result-heading">
              <h2 className={styles.blockHeading} id="result-heading">
                Kam to vedie
              </h2>
              <figure className={styles.case}>
                <CaseGallery cases={[featuredCase, ...patientCases]} />
                <figcaption className={styles.caseNote}>
                  Fotografie zverejňujeme iba s písomným súhlasom pacienta.
                </figcaption>
              </figure>
            </section>
          </>
        ) : (
          <p className={styles.pending}>Obsah tejto stránky pripravujeme.</p>
        )}

        {/*
          The close of every page, and the target of every "Objednať sa" on
          it (`#booking`). See `BookingPanel` for why it says what it says.
        */}
        <BookingPanel
          service={service.slug}
          serviceName={service.name}
          showEntryOffer={sluzba !== "vstupna-prehliadka"}
          tone={sluzba === "osetrenie-deti" ? "kids" : undefined}
        />

      </main>

      {/*
        Outside `main` on purpose: the shell gives every direct child of the
        page `position: relative`, which would take the bar out of `fixed`.
      */}
      <StickyBookingBar
        price={
          sluzba === "vstupna-prehliadka"
            ? { now: entryOffer.total, was: entryOffer.listTotal }
            : undefined
        }
        serviceName={service.name}
      />
    </>
  );
}
