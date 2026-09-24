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

describe("BeforeAfter pointer dragging", () => {
  function frameWithWidth() {
    render(<BeforeAfter patientCase={testCase} />);
    const frame = screen.getByTestId("before-after");
    /* jsdom measures nothing, so the frame is given a box to map against. */
    frame.getBoundingClientRect = () =>
      ({
        bottom: 200,
        height: 200,
        left: 100,
        right: 400,
        top: 0,
        width: 300,
        x: 100,
        y: 0,
        toJSON: () => ({}),
      }) satisfies DOMRect;
    return frame;
  }

  it("moves the divider from a drag that starts anywhere on the frame", () => {
    const frame = frameWithWidth();
    frame.setPointerCapture = () => {};

    /*
     * A touch on the photograph, well away from the divider. The old control
     * was a range stretched across the frame, which on iOS only answers a
     * touch that lands on its thumb — so this did nothing and the page
     * scrolled instead.
     */
    fireEvent.pointerDown(frame, { pointerId: 1, pointerType: "touch", clientX: 250 });

    expect(frame.style.getPropertyValue("--pos")).toBe("50%");

    fireEvent.pointerMove(frame, { pointerId: 1, pointerType: "touch", clientX: 340 });

    expect(frame.style.getPropertyValue("--pos")).toBe("80%");
  });

  it("clamps to the frame when the finger travels past its edges", () => {
    const frame = frameWithWidth();
    frame.setPointerCapture = () => {};

    fireEvent.pointerDown(frame, { pointerId: 1, pointerType: "touch", clientX: 250 });
    fireEvent.pointerMove(frame, { pointerId: 1, pointerType: "touch", clientX: 40 });
    expect(frame.style.getPropertyValue("--pos")).toBe("0%");

    fireEvent.pointerMove(frame, { pointerId: 1, pointerType: "touch", clientX: 900 });
    expect(frame.style.getPropertyValue("--pos")).toBe("100%");
  });

  it("ignores movement that is not part of a drag", () => {
    const frame = frameWithWidth();

    fireEvent.pointerMove(frame, { pointerId: 1, pointerType: "touch", clientX: 340 });

    expect(frame.style.getPropertyValue("--pos")).toBe("50%");
  });

  it("commits the dragged value to the native control on release", () => {
    const frame = frameWithWidth();
    frame.setPointerCapture = () => {};
    const slider = screen.getByRole("slider");

    fireEvent.pointerDown(frame, { pointerId: 1, pointerType: "touch", clientX: 250 });
    fireEvent.pointerMove(frame, { pointerId: 1, pointerType: "touch", clientX: 340 });
    fireEvent.pointerUp(frame, { pointerId: 1, pointerType: "touch" });

    /* So arrowing after a drag continues from where the finger left off. */
    expect(slider).toHaveValue("80");
  });

  it("leaves the native range out of the pointer path but keeps it for the keyboard", () => {
    const frame = frameWithWidth();
    const slider = screen.getByRole("slider");

    expect(slider).toHaveAttribute("type", "range");

    fireEvent.change(slider, { target: { value: "30" } });

    expect(frame.style.getPropertyValue("--pos")).toBe("30%");
    expect(slider).toHaveValue("30");
  });
});
