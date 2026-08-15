import {
  JAW_ZONES,
  getJawProblem,
  type JawProblemId,
  type JawZoneId,
} from "./jawContent";

export type JawAnalyticsEvent =
  | "jaw_zone_click"
  | "jaw_problem_click"
  | "jaw_cta_click";

export type JawAnalyticsInput =
  | Readonly<{
      consent: boolean;
      event: "jaw_zone_click";
      zone: JawZoneId;
    }>
  | Readonly<{
      consent: boolean;
      event: "jaw_problem_click";
      zone: JawZoneId;
      problem: JawProblemId;
    }>
  | Readonly<{
      consent: boolean;
      event: "jaw_cta_click";
      zone: JawZoneId;
      problem?: JawProblemId;
    }>;

type AnalyticsPush = (payload: Record<string, string>) => void;

declare global {
  interface Window {
    dataLayer?: { push: AnalyticsPush };
  }
}

const EVENTS: ReadonlySet<string> = new Set<JawAnalyticsEvent>([
  "jaw_zone_click",
  "jaw_problem_click",
  "jaw_cta_click",
]);
const ZONES: ReadonlySet<string> = new Set(JAW_ZONES.map((zone) => zone.id));

function isControlledInput(input: JawAnalyticsInput): boolean {
  if (!EVENTS.has(input.event) || !ZONES.has(input.zone)) return false;

  const candidate = input as JawAnalyticsInput & { problem?: unknown };

  switch (input.event) {
    case "jaw_zone_click":
      return !("problem" in candidate);
    case "jaw_problem_click":
      return (
        typeof candidate.problem === "string" &&
        Boolean(getJawProblem(input.zone, candidate.problem))
      );
    case "jaw_cta_click":
      return (
        candidate.problem === undefined ||
        (typeof candidate.problem === "string" &&
          Boolean(getJawProblem(input.zone, candidate.problem)))
      );
  }
}

function resolveAnalyticsPush(push: AnalyticsPush | undefined): AnalyticsPush | undefined {
  if (typeof push === "function") return push;
  if (typeof window === "undefined") return undefined;

  try {
    const browserPush = window.dataLayer?.push;
    return typeof browserPush === "function"
      ? browserPush.bind(window.dataLayer)
      : undefined;
  } catch {
    return undefined;
  }
}

export function emitJawAnalytics(
  input: JawAnalyticsInput,
  push?: AnalyticsPush,
): boolean {
  if (!input.consent || !isControlledInput(input)) return false;

  const analyticsPush = resolveAnalyticsPush(push);
  if (!analyticsPush) return false;

  const payload: Record<string, string> = {
    event: input.event,
    jaw_zone: input.zone,
  };
  if (
    (input.event === "jaw_problem_click" || input.event === "jaw_cta_click") &&
    input.problem !== undefined
  ) {
    payload.jaw_problem = input.problem;
  }

  try {
    analyticsPush(payload);
    return true;
  } catch {
    return false;
  }
}
