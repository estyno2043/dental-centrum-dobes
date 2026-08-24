import type { JawProblem, JawZone } from "@/components/home/jaw/jawContent";

export const ENTRY_EXAM_FACTS = Object.freeze([
  "Približne 30 minút",
  "Panoramatická snímka",
  "Intraorálne fotografie a skeny",
  "CT iba vtedy, keď je klinicky indikované",
  "Liečebný plán a ďalšia cena podľa nálezu",
] as const);

export function problemHref(zone: JawZone, problem?: JawProblem): string {
  return problem
    ? `${zone.route}?problem=${encodeURIComponent(problem.id)}`
    : zone.route;
}
