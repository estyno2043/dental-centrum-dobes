import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { allServices } from "@/components/services/servicesContent";
import { InvestmentShowcase } from "./InvestmentShowcase";
import { investmentIntro, slides } from "./investmentContent";

describe("InvestmentShowcase", () => {
  it("shows the slide's name, its points and what it costs", () => {
    render(<InvestmentShowcase />);
    const slide = slides[0]!;

    expect(
      screen.getByRole("heading", { name: investmentIntro.headline }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: slide.title })).toBeInTheDocument();
    for (const point of slide.points) {
      expect(screen.getByText(point)).toBeInTheDocument();
    }
    expect(screen.getByText(slide.price.value)).toBeInTheDocument();
  });

  /*
   * The card has to be the catalogue's card, not a lookalike: same link and
   * the same `data-service-photo` frame the morph flies out of. Two cards that
   * looked alike and behaved differently would be worse than none.
   */
  it("carries the same link and morph frame as the catalogue's card", () => {
    const { container } = render(<InvestmentShowcase />);
    const slide = slides[0]!;

    const link = screen.getByRole("link", { name: /Vstupná prehliadka/ });
    expect(link).toHaveAttribute("href", `/sluzby/${slide.slug}`);
    expect(link.querySelector("[data-service-photo]")).not.toBeNull();
    expect(container.querySelector("[data-slide]")).not.toBeNull();
  });

  it("points every slide at a service that exists", () => {
    for (const slide of slides) {
      expect(
        allServices.find((service) => service.slug === slide.slug),
        `${slide.slug} is not a service`,
      ).toBeDefined();
    }
  });

  it("still offers the whole price list", () => {
    render(<InvestmentShowcase />);

    expect(screen.getByRole("link", { name: /Celý cenník/ })).toHaveAttribute(
      "href",
      "/cennik",
    );
  });

  /*
   * The section reserves a viewport per slide plus one for the last to stand
   * still in, and every fade is derived from `--slide` alone. Reduced motion
   * takes the whole mechanism away rather than merely shortening it — a
   * scroll-linked cross-fade is exactly the motion that setting is about.
   */
  it("drives the run from one value, and drops it under reduced motion", () => {
    const css = readFileSync("components/pricing/investment.module.css", "utf8");

    expect(css).toMatch(/min-height:\s*calc\(\(var\(--count\) \+ 1\) \* 100vh\)/);
    expect(css).toMatch(/abs\(var\(--slide\) - var\(--index\)\)/);
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*min-height:\s*0/,
    );
  });
});
