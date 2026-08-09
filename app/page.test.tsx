import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import HomePage from "./page";

test("keeps the photo strip beside the statement band so sticky binds to the viewport", () => {
  render(<HomePage />);

  const statementBand = screen.getByRole("region", {
    name: "Meníme zážitok u zubára a vraciame vám sebavedomie.",
  });
  const photoStrip = screen.getByRole("region", {
    name: "Miesto, kde sa nikto neponáhľa.",
  });

  expect(photoStrip.parentElement).toBe(statementBand.parentElement);
});

test("keeps the statement motion surface and exit veil inside the statement region", () => {
  render(<HomePage />);

  const statementBand = screen.getByRole("region", {
    name: "Meníme zážitok u zubára a vraciame vám sebavedomie.",
  });

  expect(
    within(statementBand).getByTestId("statement-motion-surface"),
  ).toBeInTheDocument();
  expect(
    within(statementBand).getByTestId("statement-gradient-veil"),
  ).toBeInTheDocument();
});
