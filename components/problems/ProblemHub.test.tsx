import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JAW_DISCLAIMER, JAW_ZONES } from "@/components/home/jaw/jawContent";

import { ProblemHub } from "./ProblemHub";

describe("ProblemHub", () => {
  it("offers all six patient-language routes without diagnostic claims", () => {
    render(<ProblemHub />);

    expect(screen.getByRole("heading", { level: 1, name: "Čo vás trápi?" })).toBeVisible();
    const cards = screen.getAllByTestId("problem-zone-card");
    expect(cards).toHaveLength(6);

    for (const [index, zone] of JAW_ZONES.entries()) {
      const card = cards[index];
      expect(within(card).getByRole("link")).toHaveAttribute("href", zone.route);
      expect(within(card).getByRole("heading", { name: zone.label })).toBeVisible();
      for (const problem of zone.problems) {
        expect(card).toHaveTextContent(problem.patientLabel);
      }
    }

    expect(screen.getByText(JAW_DISCLAIMER)).toBeVisible();
  });

  it("keeps one examination CTA and tour return", () => {
    render(<ProblemHub />);

    expect(screen.getByRole("link", { name: "Objednať vstupné vyšetrenie — 100 €" }))
      .toHaveAttribute("href", "/kontakt?typ=vstupne-vysetrenie");
    expect(screen.getByRole("link", { name: "Pozrieť interaktívnu mapu" }))
      .toHaveAttribute("href", "/#ambulancia");
  });
});
