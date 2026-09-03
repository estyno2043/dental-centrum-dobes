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
   * Photography does not exist for this service yet. The frames hold the shape
   * and say what to shoot; when the files land they replace these, and this
   * test is deleted with the last one.
   */
  it("reserves the missing photographs with a brief", () => {
    render(<HygieneBody />);

    const frames = screen.getAllByText("Miesto pre fotku");
    expect(frames).toHaveLength(2);
    expect(screen.getByText(/Zafarbený povlak/)).toBeInTheDocument();
  });
});
