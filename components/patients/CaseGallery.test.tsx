import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CaseGallery } from "./CaseGallery";
import { featuredCase, patientCases } from "./patientsContent";

const allCases = [featuredCase, ...patientCases];

describe("CaseGallery", () => {
  it("gives every case a dot and marks only the first as current", () => {
    render(<CaseGallery cases={allCases} />);

    const dots = screen.getAllByRole("button");
    expect(dots).toHaveLength(allCases.length);
    expect(dots[0]).toHaveAttribute("aria-current", "true");
    for (const dot of dots.slice(1)) {
      expect(dot).toHaveAttribute("aria-current", "false");
    }
  });

  it("swaps the photographs and the facts when a dot is clicked", async () => {
    const user = userEvent.setup();
    render(<CaseGallery cases={allCases} />);

    const third = allCases[2]!;
    await user.click(screen.getByRole("button", { name: /Práca 3 z/ }));

    expect(
      screen.getByAltText(`Po ošetrení — ${third.problem}`),
    ).toHaveAttribute("src", third.after);
    expect(screen.getByText(third.problem)).toBeInTheDocument();
    for (const fact of third.facts) {
      expect(screen.getByText(fact.value)).toBeInTheDocument();
    }
  });

  /*
   * The divider is the reason this component does not key on the case. Someone
   * comparing six results wants the same slice of each, not to re-drag it
   * every time — so the position has to survive the switch.
   */
  it("keeps the divider where the reader left it across a switch", async () => {
    const user = userEvent.setup();
    render(<CaseGallery cases={allCases} />);

    // jsdom does not step a range on arrow keys, so drive its change event
    // directly — that is the same path a real drag takes.
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "72" } });
    const moved = (slider as HTMLInputElement).value;
    expect(moved).toBe("72");

    await user.click(screen.getByRole("button", { name: /Práca 4 z/ }));
    expect((screen.getByRole("slider") as HTMLInputElement).value).toBe(moved);
  });

  it("walks the cases with arrow keys and wraps at both ends", async () => {
    const user = userEvent.setup();
    render(<CaseGallery cases={allCases} />);

    await user.tab();
    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getAllByRole("button")[allCases.length - 1]).toHaveAttribute(
      "aria-current",
      "true",
    );

    await user.keyboard("{ArrowRight}");
    expect(screen.getAllByRole("button")[0]).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});
