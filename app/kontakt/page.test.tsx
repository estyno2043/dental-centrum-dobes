import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  clinicAddress,
  clinicFacts,
  clinicPhone,
  openingHours,
} from "@/components/site/siteContent";
import ContactPage from "./page";

describe("contact page", () => {
  it("puts the address, hours and number where somebody looks for them", () => {
    render(<ContactPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Ozvite sa nám." }),
    ).toBeInTheDocument();
    /* Street and city are two text nodes inside one link, split by a <br>. */
    expect(
      screen.getAllByRole("link", {
        name: new RegExp(clinicAddress.street),
      })[0]!.textContent,
    ).toContain(clinicAddress.city);
    expect(screen.getAllByText(openingHours[0]!.hours).length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getAllByRole("link", { name: new RegExp(clinicPhone.label) })
        .length,
    ).toBeGreaterThan(0);

    for (const fact of clinicFacts) {
      expect(screen.getByText(fact)).toBeInTheDocument();
    }
  });

  /*
   * The map link is a search for the written address rather than a place id.
   * A stale pin sends somebody to a door that is not there; a search for the
   * street does not.
   */
  it("links the address to a maps search, not a pinned place", () => {
    render(<ContactPage />);
    const map = screen.getAllByRole("link", {
      name: new RegExp(clinicAddress.street),
    })[0]!;

    expect(map).toHaveAttribute("href", clinicAddress.mapHref);
    expect(map.getAttribute("href")).toContain("/maps/search/");
    expect(map).toHaveAttribute("rel", "noreferrer");
  });

  /*
   * Netlify's runtime rejects `data-netlify` forms that live only in App
   * Router output. The detection schema is in `public/__forms.html` and the
   * live form posts to it, exactly as the booking form does; carrying the
   * attributes here would be misleading and used to break the build.
   */
  it("posts to the forms endpoint rather than declaring detection", () => {
    render(<ContactPage />);
    const form = screen.getByTestId("contact-form");

    expect(form).toHaveAttribute("action", "/__forms.html");
    expect(form).not.toHaveAttribute("data-netlify");
    expect(form.querySelector('input[name="form-name"]')).toHaveValue("kontakt");
  });
});
