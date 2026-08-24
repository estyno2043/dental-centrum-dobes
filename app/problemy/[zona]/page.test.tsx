import { cleanup, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { JAW_DISCLAIMER } from "@/components/home/jaw/jawContent";

const { notFound } = vi.hoisted(() => ({ notFound: vi.fn() }));

vi.mock("next/navigation", () => ({ notFound }));

import ProblemPage, {
  generateMetadata,
  generateStaticParams,
} from "./page";

type Search = Record<string, string | string[] | undefined>;

async function page(zona: string, searchParams: Search = {}) {
  return ProblemPage({
    params: Promise.resolve({ zona }),
    searchParams: Promise.resolve(searchParams),
  });
}

async function renderPage(zona: string, searchParams: Search = {}) {
  render(await page(zona, searchParams));
}

describe("patient problem route", () => {
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

  it("turns a controlled selection into a clear conversion path", async () => {
    await renderPage("stolicky", { problem: "bite-pain" });

    expect(screen.queryByText("Demo obsahu")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Problémy a riešenia" })).toHaveAttribute(
      "href",
      "/problemy",
    );
    expect(screen.getByRole("heading", { level: 1, name: "Stoličky" })).toBeVisible();
    expect(screen.getByTestId("selected-problem")).toHaveTextContent("Bolí ma pri hryzení");
    expect(screen.getByRole("heading", { level: 2, name: "Čo môže nasledovať" })).toBeVisible();
    expect(screen.getByText("Endodoncia pod mikroskopom, korunka, extrakcia")).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: "Ako začneme" })).toBeVisible();
    expect(screen.getByText(JAW_DISCLAIMER)).toBeVisible();
    expect(screen.getByTestId("jaw-appointment-form")).toBeVisible();
    expect(screen.getByRole("link", { name: "0918 800 002" })).toHaveAttribute(
      "href",
      "tel:+421918800002",
    );
  });

  it("renders controlled patient choices and marks only the selected one", async () => {
    await renderPage("stolicky", { problem: "pulsing" });
    const choices = screen.getByRole("region", { name: "Čo cítite?" });

    expect(within(choices).getAllByRole("link")).toHaveLength(3);
    expect(within(choices).getByRole("link", { name: "Pulzujúca bolesť" }))
      .toHaveAttribute("aria-current", "page");
    expect(within(choices).getByRole("link", { name: "Prasknutý zub" }))
      .toHaveAttribute("href", "/problemy/stolicky?problem=cracked");
  });

  it("rejects unknown, repeated, inherited, and array problem values from page and form", async () => {
    const cases: Search[] = [
      { problem: "not-a-problem" },
      { problem: ["pulsing", "cracked"] },
      Object.create({ problem: "pulsing" }) as Search,
    ];

    for (const search of cases) {
      render(await page("stolicky", search));
      expect(screen.queryByTestId("selected-problem")).not.toBeInTheDocument();
      const form = screen.getByTestId("jaw-appointment-form");
      expect(form.querySelector('input[name="problem"]')).toHaveValue("");
      cleanup();
    }
  });

  it("does not render an empty choice list for the unsure route", async () => {
    await renderPage("neviem");

    expect(screen.queryByRole("heading", { level: 2, name: "Čo cítite?" })).not.toBeInTheDocument();
    expect(screen.getByText("Začneme vstupným vyšetrením.")).toBeVisible();
  });

  it("uses normal not-found handling for an unknown zone", async () => {
    await page("neexistuje");
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("generates controlled metadata without leaking unknown slugs", async () => {
    await expect(generateMetadata({ params: Promise.resolve({ zona: "dasna" }) }))
      .resolves.toMatchObject({ title: "Ďasná — Dental Centrum Dobeš" });
    await expect(generateMetadata({ params: Promise.resolve({ zona: "invalid" }) }))
      .resolves.toMatchObject({ title: "Problémy a riešenia — Dental Centrum Dobeš" });
  });
});
