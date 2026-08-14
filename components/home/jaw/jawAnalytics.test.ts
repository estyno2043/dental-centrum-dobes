import { afterEach, describe, expect, it, vi } from "vitest";
import { emitJawAnalytics } from "./jawAnalytics";

afterEach(() => {
  delete window.dataLayer;
});

describe("emitJawAnalytics", () => {
  it("does not dispatch without analytics consent", () => {
    const push = vi.fn();

    expect(
      emitJawAnalytics(
        { consent: false, event: "jaw_zone_click", zone: "molar" },
        push,
      ),
    ).toBe(false);
    expect(push).not.toHaveBeenCalled();
  });

  it("dispatches controlled zone and problem ids after consent", () => {
    const push = vi.fn();

    expect(
      emitJawAnalytics(
        {
          consent: true,
          event: "jaw_problem_click",
          zone: "molar",
          problem: "pulsing",
        },
        push,
      ),
    ).toBe(true);
    expect(push).toHaveBeenCalledWith({
      event: "jaw_problem_click",
      jaw_zone: "molar",
      jaw_problem: "pulsing",
    });
  });

  it("rejects an unexpected problem on a zone-only event", () => {
    const push = vi.fn();
    const malformedZoneClick = {
      consent: true,
      event: "jaw_zone_click",
      zone: "front",
      problem: "chipped",
    } as Parameters<typeof emitJawAnalytics>[0];

    expect(emitJawAnalytics(malformedZoneClick, push)).toBe(false);
    expect(push).not.toHaveBeenCalled();
  });

  it("uses the optional browser adapter and stays no-op safe when absent", () => {
    expect(
      emitJawAnalytics({
        consent: true,
        event: "jaw_cta_click",
        zone: "unsure",
      }),
    ).toBe(false);

    const push = vi.fn();
    window.dataLayer = { push };
    expect(
      emitJawAnalytics({
        consent: true,
        event: "jaw_cta_click",
        zone: "unsure",
      }),
    ).toBe(true);
    expect(push).toHaveBeenCalledWith({
      event: "jaw_cta_click",
      jaw_zone: "unsure",
    });
  });

  it("does not throw when browser dataLayer push is malformed", () => {
    window.dataLayer = {
      push: null as unknown as (payload: Record<string, string>) => void,
    };

    expect(() =>
      emitJawAnalytics({
        consent: true,
        event: "jaw_zone_click",
        zone: "front",
      }),
    ).not.toThrow();
    expect(
      emitJawAnalytics({
        consent: true,
        event: "jaw_zone_click",
        zone: "front",
      }),
    ).toBe(false);
  });

  it("does not let a broken analytics adapter block user flow", () => {
    const push = vi.fn(() => {
      throw new Error("analytics unavailable");
    });

    expect(() =>
      emitJawAnalytics(
        { consent: true, event: "jaw_zone_click", zone: "front" },
        push,
      ),
    ).not.toThrow();
    expect(push).toHaveBeenCalledOnce();
  });

  it("rejects uncontrolled event, zone, mismatched problem, and prototype ids", () => {
    const push = vi.fn();
    const unsafeInputs = [
      { consent: true, event: "page_view", zone: "molar" },
      { consent: true, event: "jaw_zone_click", zone: "constructor" },
      {
        consent: true,
        event: "jaw_problem_click",
        zone: "molar",
        problem: "bleeding",
      },
      {
        consent: true,
        event: "jaw_problem_click",
        zone: "__proto__",
        problem: "toString",
      },
    ];

    for (const input of unsafeInputs) {
      expect(
        emitJawAnalytics(
          input as Parameters<typeof emitJawAnalytics>[0],
          push,
        ),
      ).toBe(false);
    }
    expect(push).not.toHaveBeenCalled();
  });

  it("emits only allowed payload keys and drops arbitrary PII fields", () => {
    const push = vi.fn();
    const input = {
      consent: true,
      event: "jaw_cta_click",
      zone: "front",
      problem: "chipped",
      name: "Patient",
      phone: "+421900000000",
      email: "patient@example.test",
      text: "free text",
      diagnosis: "unverified",
    } as Parameters<typeof emitJawAnalytics>[0];

    expect(emitJawAnalytics(input, push)).toBe(true);

    const payload = push.mock.calls[0][0] as Record<string, string>;
    expect(payload).toEqual({
      event: "jaw_cta_click",
      jaw_zone: "front",
      jaw_problem: "chipped",
    });
    expect(Object.keys(payload).sort()).toEqual([
      "event",
      "jaw_problem",
      "jaw_zone",
    ]);
    expect(JSON.stringify(payload)).not.toMatch(
      /name|phone|email|text|diagnosis|Patient|421900|example\.test|unverified/i,
    );
  });
});
