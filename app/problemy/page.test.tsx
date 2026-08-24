import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ProblemsPage, { metadata } from "./page";

describe("/problemy", () => {
  it("renders the patient intent hub as main content", () => {
    render(<ProblemsPage />);

    expect(screen.getByRole("main")).toBeVisible();
    expect(screen.getByRole("heading", { level: 1, name: "Čo vás trápi?" })).toBeVisible();
  });

  it("exports focused route metadata", () => {
    expect(metadata).toMatchObject({
      title: "Čo vás trápi? — Dental Centrum Dobeš",
      description: expect.stringContaining("problém"),
    });
  });
});
