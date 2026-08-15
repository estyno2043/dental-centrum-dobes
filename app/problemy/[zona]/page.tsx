import { notFound } from "next/navigation";

import { JawAppointmentForm } from "@/components/home/jaw/JawAppointmentForm";
import {
  ENTRY_EXAM_LABEL,
  JAW_DISCLAIMER,
  JAW_ZONES,
  getJawProblem,
  getJawZoneBySlug,
} from "@/components/home/jaw/jawContent";

import styles from "../problemy.module.css";

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

  return (
    <main className={styles.page}>
      <p className={styles.marker}>Demo obsahu</p>
      <h1>{zone.label}</h1>
      {problem ? <p data-testid="selected-problem">{problem.patientLabel}</p> : null}
      <p className={styles.disclaimer}>{JAW_DISCLAIMER}</p>
      <p className={styles.price}>{ENTRY_EXAM_LABEL}</p>
      <JawAppointmentForm problem={problem} zone={zone} />
    </main>
  );
}
