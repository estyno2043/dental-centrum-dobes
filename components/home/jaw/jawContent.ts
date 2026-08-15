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

export type JawProblem = Readonly<{
  id: string;
  patientLabel: string;
  destination: string;
}>;

export type JawZone = Readonly<{
  id: JawZoneId;
  slug: string;
  label: string;
  route: `/problemy/${string}`;
  problems: readonly JawProblem[];
}>;

export const JAW_DISCLAIMER =
  "Orientačná pomôcka. Presnú príčinu určí až vyšetrenie.";
export const ENTRY_EXAM_LABEL = "Vstupné vyšetrenie — 100 EUR";

type JawProblemSource = Readonly<{
  id: JawProblemId;
  patientLabel: string;
  destination: string;
}>;

type JawZoneSource = Readonly<Omit<JawZone, "problems"> & {
  problems: readonly JawProblemSource[];
}>;

function makeZone(source: JawZoneSource): JawZone {
  const problems = Object.freeze(
    source.problems.map((problem) => Object.freeze({ ...problem })),
  );

  return Object.freeze({ ...source, problems });
}

export const JAW_ZONES: readonly JawZone[] = Object.freeze([
  makeZone({
    id: "front",
    slug: "predne-zuby",
    label: "Predné zuby",
    route: "/problemy/predne-zuby",
    problems: [
      {
        id: "shape-color",
        patientLabel: "Nepáči sa mi tvar alebo farba",
        destination: "Fazety, bielenie, kompozit",
      },
      {
        id: "chipped",
        patientLabel: "Odštiepený zub",
        destination: "Fazety, bielenie, kompozit",
      },
      {
        id: "gap",
        patientLabel: "Medzera",
        destination: "Fazety, bielenie, kompozit",
      },
    ],
  }),
  makeZone({
    id: "premolar",
    slug: "crenove-zuby",
    label: "Črenové zuby",
    route: "/problemy/crenove-zuby",
    problems: [
      {
        id: "sensitivity",
        patientLabel: "Citlivosť na sladké alebo studené",
        destination: "Záchovná starostlivosť, inlay, korunka",
      },
      {
        id: "lost-filling",
        patientLabel: "Vypadla plomba",
        destination: "Záchovná starostlivosť, inlay, korunka",
      },
    ],
  }),
  makeZone({
    id: "molar",
    slug: "stolicky",
    label: "Stoličky",
    route: "/problemy/stolicky",
    problems: [
      {
        id: "bite-pain",
        patientLabel: "Bolí ma pri hryzení",
        destination: "Endodoncia pod mikroskopom, korunka, extrakcia",
      },
      {
        id: "pulsing",
        patientLabel: "Pulzujúca bolesť",
        destination: "Endodoncia pod mikroskopom, korunka, extrakcia",
      },
      {
        id: "cracked",
        patientLabel: "Prasknutý zub",
        destination: "Endodoncia pod mikroskopom, korunka, extrakcia",
      },
    ],
  }),
  makeZone({
    id: "gum",
    slug: "dasna",
    label: "Ďasná",
    route: "/problemy/dasna",
    problems: [
      {
        id: "bleeding",
        patientLabel: "Krvácajú pri čistení",
        destination: "Dentálna hygiena GBT, parodontológia",
      },
      {
        id: "receding",
        patientLabel: "Ustupujú",
        destination: "Dentálna hygiena GBT, parodontológia",
      },
      {
        id: "odor",
        patientLabel: "Zápach",
        destination: "Dentálna hygiena GBT, parodontológia",
      },
    ],
  }),
  makeZone({
    id: "missing",
    slug: "chybajuci-zub",
    label: "Chýbajúci zub",
    route: "/problemy/chybajuci-zub",
    problems: [
      {
        id: "missing-tooth",
        patientLabel: "Chýba mi zub",
        destination: "Implantát Osstem",
      },
      {
        id: "removable-replacement",
        patientLabel: "Nosím snímateľnú náhradu",
        destination: "Implantát Osstem",
      },
    ],
  }),
  makeZone({
    id: "unsure",
    slug: "neviem",
    label: "Neviem / bolí to celé",
    route: "/problemy/neviem",
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
