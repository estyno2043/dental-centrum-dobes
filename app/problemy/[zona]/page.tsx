import { notFound, permanentRedirect } from "next/navigation";

import {
  JAW_ZONES,
  getJawProblem,
  getJawZoneBySlug,
} from "@/components/home/jaw/jawContent";

/*
 * The retired problem pages.
 *
 * Until 2026-09-26 every choice on the jaw landed here, on a placeholder
 * marked "Demo obsahu" with a form and a stale entry price. The user asked
 * for these pages to go and for each problem to lead to the service page
 * that answers it; the jaw now links there directly. This route stays only
 * so an old link or bookmark lands on the same service rather than a 404:
 * the problem's own page when the query names one, the zone's otherwise.
 */

type ProblemSearchParams = Readonly<Record<string, string | string[] | undefined>>;
type ProblemPageProps = Readonly<{
  params: Promise<{ zona: string }>;
  searchParams: Promise<ProblemSearchParams>;
}>;

export function generateStaticParams() {
  return JAW_ZONES.map(({ slug }) => ({ zona: slug }));
}

export default async function ProblemRedirect({
  params,
  searchParams,
}: ProblemPageProps): Promise<never> {
  const { zona } = await params;
  const query = await searchParams;
  const zone = getJawZoneBySlug(zona);
  if (!zone) notFound();

  const problemId = typeof query.problem === "string" ? query.problem : undefined;
  const problem = problemId ? getJawProblem(zone.id, problemId) : undefined;

  permanentRedirect(problem?.href ?? zone.href);
}
