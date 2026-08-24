import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JawAppointmentForm } from "@/components/home/jaw/JawAppointmentForm";
import {
  ENTRY_EXAM_LABEL,
  JAW_DISCLAIMER,
  JAW_ZONES,
  getJawProblem,
  getJawZoneBySlug,
} from "@/components/home/jaw/jawContent";
import {
  ENTRY_EXAM_FACTS,
  problemHref,
} from "@/components/problems/problemContent";

import styles from "../problemy.module.css";

const CLINIC_PHONE_LABEL = "0918 800 002";
const CLINIC_PHONE_HREF = "tel:+421918800002";

type ProblemSearchParams = Readonly<Record<string, string | string[] | undefined>>;
type ProblemPageProps = Readonly<{
  params: Promise<{ zona: string }>;
  searchParams: Promise<ProblemSearchParams>;
}>;

function selectedProblemId(query: ProblemSearchParams): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(query, "problem")) return undefined;
  return typeof query.problem === "string" ? query.problem : undefined;
}

export function generateStaticParams() {
  return JAW_ZONES.map(({ slug }) => ({ zona: slug }));
}

export async function generateMetadata({
  params,
}: Pick<ProblemPageProps, "params">): Promise<Metadata> {
  const { zona } = await params;
  const zone = getJawZoneBySlug(zona);

  if (!zone) {
    return {
      title: "Problémy a riešenia — Dental Centrum Dobeš",
      description: "Orientačná mapa problémov a možností ošetrenia.",
    };
  }

  return {
    title: `${zone.label} — Dental Centrum Dobeš`,
    description: `Čo môže znamenať problém v oblasti ${zone.label.toLocaleLowerCase("sk")}, ako začína vyšetrenie a ako sa objednať.`,
  };
}

export default async function ProblemPage({
  params,
  searchParams,
}: ProblemPageProps) {
  const { zona } = await params;
  const query = await searchParams;
  const zone = getJawZoneBySlug(zona);
  if (!zone) {
    notFound();
    return null;
  }

  const problemId = selectedProblemId(query);
  const problem = problemId ? getJawProblem(zone.id, problemId) : undefined;
  const destinations = [...new Set(zone.problems.map(({ destination }) => destination))];

  return (
    <main className={styles.page}>
      <article className={styles.detailShell}>
        <nav aria-label="Omrvinková navigácia" className={styles.breadcrumb}>
          <Link href="/problemy">Problémy a riešenia</Link>
          <span aria-hidden="true">/</span>
          <span>{zone.label}</span>
        </nav>

        <header className={styles.detailHero}>
          <p className={styles.marker}>Oblasť bolesti</p>
          <h1>{zone.label}</h1>
          {problem ? (
            <p className={styles.selectedProblem} data-testid="selected-problem">
              {problem.patientLabel}
            </p>
          ) : (
            <p className={styles.detailLead}>
              {zone.problems.length > 0
                ? "Vyberte opis, ktorý je najbližšie tomu, čo cítite."
                : "Začneme vstupným vyšetrením."}
            </p>
          )}
        </header>

        {zone.problems.length > 0 ? (
          <section
            aria-labelledby="problem-options-heading"
            className={styles.choiceSection}
          >
            <h2 id="problem-options-heading">Čo cítite?</h2>
            <div className={styles.choiceList}>
              {zone.problems.map((option) => (
                <Link
                  aria-current={problem?.id === option.id ? "page" : undefined}
                  className={styles.choiceLink}
                  href={problemHref(zone, option)}
                  key={option.id}
                >
                  <span>{option.patientLabel}</span>
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <div className={styles.detailGrid}>
          <section className={styles.detailCard}>
            <p className={styles.marker}>Orientácia</p>
            <h2>Čo môže nasledovať</h2>
            {destinations.length > 0 ? (
              <ul className={styles.destinationList}>
                {destinations.map((destination) => (
                  <li key={destination}>{destination}</li>
                ))}
              </ul>
            ) : (
              <p>Možnosti ošetrenia určíme až podľa nálezu.</p>
            )}
          </section>

          <section className={styles.detailCard}>
            <p className={styles.marker}>Prvý krok</p>
            <h2>Ako začneme</h2>
            <p className={styles.price}>{ENTRY_EXAM_LABEL}</p>
            <ul className={styles.factList}>
              {ENTRY_EXAM_FACTS.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </section>
        </div>

        <p className={styles.disclaimer}>{JAW_DISCLAIMER}</p>

        <section aria-labelledby="booking-heading" className={styles.bookingSection}>
          <div className={styles.bookingIntro}>
            <p className={styles.marker}>Objednanie</p>
            <h2 id="booking-heading">Objednajte vstupné vyšetrenie</h2>
            <p>Zanechajte kontakt. Ozveme sa vám a dohodneme vhodný termín.</p>
            <a className={styles.phoneAction} href={CLINIC_PHONE_HREF}>
              {CLINIC_PHONE_LABEL}
            </a>
          </div>
          <JawAppointmentForm problem={problem} zone={zone} />
        </section>
      </article>
    </main>
  );
}
