import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BeforeAfter } from "./BeforeAfter";
import type { PatientCase } from "./patientsContent";

const testCase: PatientCase = {
  id: "test",
  treatments: ["Fazety"],
  problem: "Tmavé predné zuby.",
  facts: [{ label: "Návštev", value: "3" }],
};

describe("BeforeAfter", () => {
  it("exposes the divider as a labelled slider", () => {
    render(<BeforeAfter patientCase={testCase} />);

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAccessibleName(/Tmavé predné zuby/);
    expect(slider).toHaveValue("50");
  });

  /*
   * Keyboard, touch and pointer support all come from the divider being a
   * native range input rather than hand-written pointer handlers. jsdom does
   * not implement the input's own arrow-key stepping, so the behaviour cannot
   * be exercised here — asserting the element type is what would fail if
   * someone swapped it for a div, which is the regression worth catching.
   */
  it("uses a native range input, which is what carries keyboard support", () => {
    render(<BeforeAfter patientCase={testCase} />);

    const slider = screen.getByRole("slider");
    expect(slider.tagName).toBe("INPUT");
    expect(slider).toHaveAttribute("type", "range");
  });

  it("moves the divider when the value changes", async () => {
    const user = userEvent.setup();
    const { container } = render(<BeforeAfter patientCase={testCase} />);

    const slider = screen.getByRole("slider");
    const frame = container.firstElementChild as HTMLElement;
    expect(frame.style.getPropertyValue("--pos")).toBe("50%");

    fireEvent.change(slider, { target: { value: "80" } });
    await user.tab();

    expect(slider).toHaveValue("80");
    expect(frame.style.getPropertyValue("--pos")).toBe("80%");
  });

  it("falls back to labelled placeholders when a case has no photography", () => {
    render(<BeforeAfter patientCase={testCase} />);

    expect(screen.getByText("Pred")).toBeInTheDocument();
    expect(screen.getByText("Po")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders both photographs once a case has them", () => {
    render(
      <BeforeAfter
        patientCase={{
          ...testCase,
          before: "/media/pred.jpg",
          after: "/media/po.jpg",
        }}
      />,
    );

    expect(screen.getByAltText(/^Pred ošetrením/)).toBeInTheDocument();
    expect(screen.getByAltText(/^Po ošetrení/)).toBeInTheDocument();
  });
});
