import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EndoBody } from "./EndoBody";
import { cost, odds, pain } from "./endoContent";

/*
 * The page was shortened on 2026-09-24: one strong line per section stays in
 * view and the explanation waits under "Zobraziť viac". These guard both
 * halves: the strong lines are never folded away, and the detail is folded
 * rather than deleted.
 */
describe("EndoBody", () => {
  it("keeps each section's strong line outside any fold", () => {
    render(<EndoBody />);

    for (const line of [pain.claim, odds.claim]) {
      expect(screen.getByText(line).closest("details")).toBeNull();
    }
    expect(screen.getByText(cost.estimate).closest("details")).toBeNull();
    expect(
      screen.getByRole("link", { name: odds.cta.label }).closest("details"),
    ).toBeNull();
  });

  it("folds the explanations under Zobraziť viac instead of dropping them", () => {
    const { container } = render(<EndoBody />);

    for (const text of [pain.body, odds.body, cost.twoVisits]) {
      const details = screen.getByText(text).closest("details");
      expect(details).not.toBeNull();
      expect(details).not.toHaveAttribute("open");
    }
    expect(container.querySelectorAll("details[open]")).toHaveLength(0);
  });

  it("labels the price breakdown as a breakdown", () => {
    render(<EndoBody />);

    const summary = screen.getByText("Zobraziť rozpis ceny").closest("summary");
    expect(summary?.parentElement).toContainElement(
      screen.getByText(cost.lines[0].label),
    );
  });
});
