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

  if (input.event === "jaw_problem_click") {
    return Boolean(getJawProblem(input.zone, input.problem));
  }

  if (input.event === "jaw_cta_click" && input.problem !== undefined) {
    return Boolean(getJawProblem(input.zone, input.problem));
  }

  return true;
}

export function emitJawAnalytics(
  input: JawAnalyticsInput,
  push: AnalyticsPush | undefined =
    typeof window === "undefined"
      ? undefined
      : window.dataLayer?.push.bind(window.dataLayer),
): boolean {
  if (!input.consent || !push || !isControlledInput(input)) return false;

  const payload: Record<string, string> = {
    event: input.event,
    jaw_zone: input.zone,
  };
  if ("problem" in input && input.problem !== undefined) {
    payload.jaw_problem = input.problem;
  }

  try {
    push(payload);
    return true;
  } catch {
    return false;
  }
}
