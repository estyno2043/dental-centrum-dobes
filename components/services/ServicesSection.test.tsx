import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ServicesSection } from "./ServicesSection";
/*
 * The lead sits inside the link, so a card's accessible name is its service
 * name followed by that line. That is deliberate — the whole card is one
 * target, and the extra context helps rather than hurts — so these match on
 * the name rather than demanding it be the entire string.
 */
function named(name: string): RegExp {
  return new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
}

import {
  allServices,
  featuredServices,
  furtherServices,
  servicesIntro,
} from "./servicesContent";

describe("ServicesSection", () => {
  it("asks the header for a background, since the section is pale", () => {
    const { container } = render(<ServicesSection />);

    expect(container.querySelector("section")).toHaveAttribute(
      "data-header-mode",
      "light",
    );
    expect(
      screen.getByRole("heading", { level: 2, name: servicesIntro.headline }),
    ).toBeInTheDocument();
  });

  it("leads with five services and lists the other five", () => {
    render(<ServicesSection />);

    expect(featuredServices).toHaveLength(5);
    expect(furtherServices).toHaveLength(5);

    for (const service of allServices) {
      expect(
        screen.getByRole("link", { name: named(service.name) }),
      ).toHaveAttribute("href", `/sluzby/${service.slug}`);
    }
  });

  /*
   * The split is the whole point of the section: five with photography and
   * five without. If someone gives the further five images, they stop being
   * the quieter half and the section flattens into a catalogue.
   */
  it("gives a photograph to the five that lead, and to nobody else", () => {
    const { container } = render(<ServicesSection />);

    expect(container.querySelectorAll("img")).toHaveLength(
      featuredServices.length,
    );
    for (const service of featuredServices) {
      expect(service.image).toBeTruthy();
      expect(
        container.querySelector(`img[src="/media/sluzby/${service.image}.webp"]`),
      ).toBeInTheDocument();
    }
    for (const service of furtherServices) {
      expect(service.image).toBeUndefined();
    }
  });

  /*
   * The arrows and the numbers repeat what the link already says, so they are
   * hidden rather than read out twice per card. A card's name must therefore
   * begin with the service, not with "01" or an arrow glyph.
   */
  it("keeps its decoration out of the accessible name", () => {
    const { container } = render(<ServicesSection />);

    /*
     * `named()` anchors at the start of the accessible name, so a card whose
     * number or arrow leaked into that name would not be found at all — which
     * is the assertion. `textContent` is no use here: it reports hidden nodes
     * too, and every card's text does begin with its number.
     */
    for (const service of allServices) {
      expect(
        screen.getByRole("link", { name: named(service.name) }),
      ).toBeInTheDocument();
    }

    const decorations = container.querySelectorAll(
      "svg, [class*='index'], [class*='rrow']",
    );
    expect(decorations.length).toBeGreaterThan(0);
    for (const decoration of decorations) {
      expect(decoration.closest("[aria-hidden='true']")).not.toBeNull();
    }
  });

  /*
   * Nothing in this file may state a price, a duration or a clinical promise —
   * none of that has been supplied by the clinic yet, and a service page that
   * invents it is worse than one that says nothing.
   */
  it("states no price or duration anywhere in the copy", () => {
    const copy = allServices
      .flatMap((service) => [service.name, service.lead])
      .concat(servicesIntro.headline, servicesIntro.lead)
      .join(" ");

    expect(copy).not.toMatch(/\d+\s*(?:€|EUR|eur)/);
    expect(copy).not.toMatch(/\bcena\b|\bod \d/i);
  });
});
