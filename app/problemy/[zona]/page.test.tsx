import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { notFound } = vi.hoisted(() => ({ notFound: vi.fn() }));

vi.mock("next/navigation", () => ({ notFound }));

import ProblemPage, { generateStaticParams } from "./page";

type Search = Record<string, string | string[] | undefined>;

async function renderPage(zona: string, searchParams: Search = {}) {
  render(
    await ProblemPage({
      params: Promise.resolve({ zona }),
      searchParams: Promise.resolve(searchParams),
    }),
  );
}

describe("jaw problem route", () => {
  beforeEach(() => notFound.mockClear());

  it("prerenders only the six approved zone routes", () => {
    expect(generateStaticParams()).toEqual([
      { zona: "predne-zuby" },
      { zona: "crenove-zuby" },
      { zona: "stolicky" },
      { zona: "dasna" },
      { zona: "chybajuci-zub" },
      { zona: "neviem" },
    ]);
  });

  it("shows only a validated patient-language problem selection", async () => {
    await renderPage("stolicky", { problem: "pulsing" });

    expect(screen.getByText("Pulzujúca bolesť")).toBeVisible();
  });

  it("does not make a selected-problem claim for invalid, repeated, or inherited query data", async () => {
    await renderPage("stolicky", { problem: "not-a-problem" });
    expect(screen.queryByTestId("selected-problem")).not.toBeInTheDocument();

    const repeated = await ProblemPage({
      params: Promise.resolve({ zona: "stolicky" }),
      searchParams: Promise.resolve({ problem: ["pulsing", "cracked"] }),
    });
    const inherited = await ProblemPage({
      params: Promise.resolve({ zona: "stolicky" }),
      searchParams: Promise.resolve(Object.create({ problem: "pulsing" }) as Search),
    });

    const { unmount } = render(repeated);
    expect(screen.queryByTestId("selected-problem")).not.toBeInTheDocument();
    unmount();
    render(inherited);
    expect(screen.queryByTestId("selected-problem")).not.toBeInTheDocument();
  });

  it("uses normal not-found handling for an unknown zone", async () => {
    await ProblemPage({
      params: Promise.resolve({ zona: "neexistuje" }),
      searchParams: Promise.resolve({}),
    });

    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("keeps required demo content and exact entry examination label on valid pages", async () => {
    await renderPage("dasna");

    expect(screen.getByText("Demo obsahu")).toBeVisible();
    expect(
      screen.getByText("Orientačná pomôcka. Presnú príčinu určí až vyšetrenie."),
    ).toBeVisible();
    expect(screen.getByText("Vstupné vyšetrenie — 100 EUR")).toBeVisible();
  });
});
