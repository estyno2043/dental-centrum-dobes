import { getServiceBySlug } from "@/components/services/servicesContent";

export type JawZoneId =
  | "front"
  | "premolar"
  | "molar"
  | "gum"
  | "missing"
  | "unsure";

export type JawProblemId =
  | "shape-color"
  | "chipped"
  | "gap"
  | "sensitivity"
  | "lost-filling"
  | "bite-pain"
  | "pulsing"
  | "cracked"
  | "bleeding"
  | "receding"
  | "odor"
  | "missing-tooth"
  | "removable-replacement";

/*
 * Where each choice on the jaw leads, as of 2026-09-26.
 *
 * The jaw used to send every choice to a `/problemy/<zone>` placeholder page
 * marked "Demo obsahu", with a form and a stale 100 € entry price. The user
 * asked for those pages to go and for each problem to lead straight to the
 * service page that answers it, with the choice of page left to us. The
 * reasoning, problem by problem:
 *
 * - Front teeth, shape or colour, chipped, gap: aesthetic dentistry. Its
 *   composite veneer is written for exactly "tvar alebo odštiepenie jedného-
 *   dvoch zubov", and its comparison covers whitening and veneers.
 * - Premolars, sensitivity and a lost filling: white fillings. Sensitivity
 *   to sweet or cold is the classic sign of a cavity.
 * - Molars, pain on biting, throbbing, a cracked tooth: endodontics, whose
 *   page opens on "Povedali vám, že zub musí von?" and covers the crown after.
 * - Gums bleeding and receding: periodontology, whose symptom checklist lists
 *   both. Bad breath: dental hygiene, the usual first step.
 * - A missing tooth: implants. Wearing a removable denture: prosthetics,
 *   which covers dentures and dentures on implants.
 * - "Neviem / bolí to celé": the entry examination.
 *
 * `/problemy/<zone>` still resolves, as a permanent redirect to the same
 * service, so an old link or bookmark lands somewhere useful.
 */

export type JawProblem = Readonly<{
  id: string;
  patientLabel: string;
  /** The service page this problem leads to. */
  service: string;
  /** That page's name, shown under the problem as where the row goes. */
  destination: string;
  href: `/sluzby/${string}`;
}>;

export type JawZone = Readonly<{
  id: JawZoneId;
  /** Kept for the redirect from the retired `/problemy/<slug>` pages. */
  slug: string;
  label: string;
  /** The zone's own page, for the direct entries and the no-script list. */
  service: string;
  href: `/sluzby/${string}`;
  problems: readonly JawProblem[];
}>;

export const JAW_DISCLAIMER =
  "Orientačná pomôcka. Presnú príčinu určí až vyšetrenie.";

type JawProblemSource = Readonly<{
  id: JawProblemId;
  patientLabel: string;
  service: string;
}>;

type JawZoneSource = Readonly<{
  id: JawZoneId;
  slug: string;
  label: string;
  service: string;
  problems: readonly JawProblemSource[];
}>;

function serviceName(slug: string): string {
  const service = getServiceBySlug(slug);
  if (!service) throw new Error(`Jaw destination "${slug}" is not a service.`);
  return service.name;
}

function makeZone(source: JawZoneSource): JawZone {
  const problems = Object.freeze(
    source.problems.map((problem) =>
      Object.freeze({
        ...problem,
        destination: serviceName(problem.service),
        href: `/sluzby/${problem.service}` as const,
      }),
    ),
  );

  serviceName(source.service);
  return Object.freeze({
    ...source,
    href: `/sluzby/${source.service}` as const,
    problems,
  });
}

export const JAW_ZONES: readonly JawZone[] = Object.freeze([
  makeZone({
    id: "front",
    slug: "predne-zuby",
    label: "Predné zuby",
    service: "esteticka-stomatologia",
    problems: [
      {
        id: "shape-color",
        patientLabel: "Nepáči sa mi tvar alebo farba",
        service: "esteticka-stomatologia",
      },
      {
        id: "chipped",
        patientLabel: "Odštiepený zub",
        service: "esteticka-stomatologia",
      },
      {
        id: "gap",
        patientLabel: "Medzera",
        service: "esteticka-stomatologia",
      },
    ],
  }),
  makeZone({
    id: "premolar",
    slug: "crenove-zuby",
    label: "Črenové zuby",
    service: "biele-vyplne",
    problems: [
      {
        id: "sensitivity",
        patientLabel: "Citlivosť na sladké alebo studené",
        service: "biele-vyplne",
      },
      {
        id: "lost-filling",
        patientLabel: "Vypadla plomba",
        service: "biele-vyplne",
      },
    ],
  }),
  makeZone({
    id: "molar",
    slug: "stolicky",
    label: "Stoličky",
    service: "endodoncia",
    problems: [
      {
        id: "bite-pain",
        patientLabel: "Bolí ma pri hryzení",
        service: "endodoncia",
      },
      {
        id: "pulsing",
        patientLabel: "Pulzujúca bolesť",
        service: "endodoncia",
      },
      {
        id: "cracked",
        patientLabel: "Prasknutý zub",
        service: "endodoncia",
      },
    ],
  }),
  makeZone({
    id: "gum",
    slug: "dasna",
    label: "Ďasná",
    service: "parodontologia",
    problems: [
      {
        id: "bleeding",
        patientLabel: "Krvácajú pri čistení",
        service: "parodontologia",
      },
      {
        id: "receding",
        patientLabel: "Ustupujú",
        service: "parodontologia",
      },
      {
        id: "odor",
        patientLabel: "Zápach",
        service: "dentalna-hygiena",
      },
    ],
  }),
  makeZone({
    id: "missing",
    slug: "chybajuci-zub",
    label: "Chýbajúci zub",
    service: "zubne-implantaty",
    problems: [
      {
        id: "missing-tooth",
        patientLabel: "Chýba mi zub",
        service: "zubne-implantaty",
      },
      {
        id: "removable-replacement",
        patientLabel: "Nosím snímateľnú náhradu",
        service: "protetika",
      },
    ],
  }),
  makeZone({
    id: "unsure",
    slug: "neviem",
    label: "Neviem / bolí to celé",
    service: "vstupna-prehliadka",
    problems: [],
  }),
]);

function createNullPrototypeLookup<K extends string, V>(
  entries: readonly (readonly [K, V])[],
): Readonly<Record<K, V>> {
  return Object.freeze(Object.assign(Object.create(null), Object.fromEntries(entries)));
}

export const JAW_ZONE_BY_SLUG: Readonly<Record<string, JawZone | undefined>> =
  createNullPrototypeLookup(JAW_ZONES.map((zone) => [zone.slug, zone] as const));

const JAW_ZONE_BY_ID: Readonly<Record<string, JawZone | undefined>> =
  createNullPrototypeLookup(JAW_ZONES.map((zone) => [zone.id, zone] as const));

export function getJawZoneBySlug(slug: string): JawZone | undefined {
  return JAW_ZONE_BY_SLUG[slug];
}

export function getJawProblem(
  zoneId: string,
  problemId: string,
): JawProblem | undefined {
  return JAW_ZONE_BY_ID[zoneId]?.problems.find(
    (problem) => problem.id === problemId,
  );
}
