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

  /*
   * A slide is a treatment; a service page can hold several. Whitening is one
   * of five options on the aesthetics page, and without its own card the slide
   * would carry that page's name and photograph — promising somebody who came
   * for whitening something broader than they asked about.
   */
  it("lets a slide carry its own card while linking to the service", () => {
    render(<InvestmentShowcase />);

    const whitening = slides.find((s) => s.slug === "esteticka-stomatologia")!;
    const link = screen.getByRole("link", { name: /Bielenie Nite White/ });

    expect(link).toHaveAttribute("href", "/sluzby/esteticka-stomatologia");
    expect(link.querySelector("img")).toHaveAttribute(
      "src",
      `/media/sluzby/${whitening.card!.image}.webp`,
    );
    expect(link).not.toHaveTextContent("Fazety, keramické korunky");
  });

  /*
   * The card promises whitening and the page has to open on it — otherwise the
   * click lands somewhere that has to be searched for what was clicked.
   */
  it("opens the aesthetics page on the treatment the card promised", async () => {
    const { solutions } = await import(
      "@/components/services/aesthetic/aestheticContent"
    );

    expect(solutions[0]?.id).toBe("bielenie");
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
    // Comments stripped: the note above the rule explains why `abs()` is
    // avoided, and the guard below would otherwise trip over that sentence.
    const rules = css.replace(/\/\*[\s\S]*?\*\//g, "");

    expect(rules).toMatch(/min-height:\s*calc\(\(var\(--count\) \+ 1\) \* 100vh\)/);
    // `max(a - b, b - a)` rather than `abs()` — same arithmetic, but `abs()`
    // only reached Chrome in 2025 and this has to work on older phones.
    expect(rules.replace(/\s+/g, " ")).toContain(
      "max(var(--slide) - var(--index), var(--index) - var(--slide))",
    );
    expect(rules).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*min-height:\s*0/,
    );
  });
});
