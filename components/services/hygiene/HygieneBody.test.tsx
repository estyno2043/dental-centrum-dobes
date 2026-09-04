import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HygieneBody } from "./HygieneBody";
import { protocol, suitedFor } from "./hygieneContent";

describe("HygieneBody", () => {
  it("puts the protocol on the page as an ordered sequence", () => {
    const { container } = render(<HygieneBody />);

    // Several lists on the page; the protocol is the only ordered one, and
    // that ordering is the claim being made about it.
    const steps = container.querySelector("ol");
    expect(steps?.querySelectorAll("li")).toHaveLength(protocol.length);
    for (const step of protocol) {
      expect(screen.getByText(step.title)).toBeInTheDocument();
    }
  });

  it("shows the conditional step as conditional rather than hiding it", () => {
    const { container } = render(<HygieneBody />);

    const optional = container.querySelectorAll('[data-optional="true"]');
    expect(optional).toHaveLength(1);
    expect(screen.getByText("Nie pre každého")).toBeInTheDocument();
    expect(screen.getByText(/Hlbšie vačky/)).toBeInTheDocument();
  });

  it("names every group this is worth most to", () => {
    render(<HygieneBody />);

    for (const item of suitedFor) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  /*
   * The disclosing pair is the page's argument in one image: the purple is
   * biofilm that was there all along and could not be seen. It is a slider
   * rather than two stills because dragging the line across it is proof, and
   * looking at two pictures side by side is only a claim.
   */
  it("shows the disclosing step as a draggable comparison", () => {
    render(<HygieneBody />);

    expect(screen.getByRole("slider")).toBeInTheDocument();
    expect(screen.getByAltText(/^Pred ošetrením/)).toHaveAttribute(
      "src",
      "/media/hygiena-gbt-pred.webp",
    );
    expect(screen.getByAltText(/^Po ošetrení/)).toHaveAttribute(
      "src",
      "/media/hygiena-gbt-po.webp",
    );
  });

  it("shows the clinic's own AIRFLOW unit beside the step it belongs to", () => {
    render(<HygieneBody />);

    const photo = screen.getByAltText(/EMS AIRFLOW/);
    expect(photo).toHaveAttribute("src", "/media/sluzby/hygiena-airflow.webp");
    expect(photo.getAttribute("srcSet")).toContain("hygiena-airflow-mobile.webp 450w");
  });

  /*
   * The comparison is where the case is made, so the way to act belongs there
   * too — not eight steps and a price list further down.
   */
  it("offers a way to act where the comparison lands", () => {
    render(<HygieneBody />);

    expect(
      screen.getByRole("link", { name: "Objednať sa na hygienu" }),
    ).toHaveAttribute("href", "#booking");
    expect(screen.getByRole("link", { name: /0918 800 002/ })).toHaveAttribute(
      "href",
      "tel:+421918800002",
    );
  });

  /* Both frames are filled now; a leftover placeholder would be a bug. */
  it("has no placeholders left", () => {
    render(<HygieneBody />);

    expect(screen.queryByText("Miesto pre fotku")).not.toBeInTheDocument();
  });
});
