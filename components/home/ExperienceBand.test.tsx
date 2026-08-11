import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ExperienceBand } from "./ExperienceBand";

test("keeps only centered headline copy in statement scene", () => {
  render(<ExperienceBand />);

  const region = screen.getByRole("region", {
    name: "Meníme zážitok u zubára a vraciame vám sebavedomie.",
  });
  expect(region).toBeInTheDocument();
  expect(screen.queryByText("Nový zážitok")).not.toBeInTheDocument();
  expect(screen.getByTestId("statement-copy")).toHaveAttribute(
    "data-centered",
    "true",
  );
});
