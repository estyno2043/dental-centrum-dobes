import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SurfacePicker } from "./SurfacePicker";
import { surfaces } from "./fillingsContent";

describe("SurfacePicker", () => {
  it("starts on one surface and shows its price", () => {
    render(<SurfacePicker />);
    expect(screen.getByRole("radio", { name: "1 plôška" })).toBeChecked();
    expect(screen.getByText(surfaces.options[0].price)).toBeInTheDocument();
  });

  /*
   * The drawing lights exactly the surfaces the price is for: the chewing
   * surface alone, then one side, then both.
   */
  it("lights the surfaces it prices", async () => {
    const user = userEvent.setup();
    const { container } = render(<SurfacePicker />);
    const lit = () =>
      Array.from(container.querySelectorAll("[data-surface]"))
        .filter((el) => el.getAttribute("fill") !== "transparent")
        .map((el) => el.getAttribute("data-surface"));

    expect(lit()).toEqual(["occlusal"]);

    await user.click(screen.getByRole("radio", { name: "2 plôšky" }));
    expect(lit()).toEqual(["mesial", "occlusal"]);
    expect(screen.getByText(surfaces.options[1].price)).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "3 plôšky" }));
    expect(lit()).toEqual(["mesial", "occlusal", "distal"]);
    expect(screen.getByText(surfaces.options[2].which)).toBeInTheDocument();
  });
});
