import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { navigationItems } from "@/components/hero/heroContent";
import { Footer } from "./Footer";
import {
  clinicAddress,
  clinicLandline,
  clinicPhone,
  openingHours,
} from "./siteContent";

describe("Footer", () => {
  /*
   * The reason the footer exists. A clinic site without an address and hours
   * is unusable, and these were missing from every page until now.
   */
  it("carries the address, the hours and both numbers", () => {
    render(<Footer />);

    /* Street and city are two text nodes inside one link, split by a <br>. */
    const address = screen.getByRole("link", {
      name: new RegExp(clinicAddress.street),
    });
    expect(address.textContent).toContain(clinicAddress.street);
    expect(address.textContent).toContain(clinicAddress.city);
    /* The booking link reads "Objednajte sa 0918 800 002" to a screen reader. */
    expect(
      screen.getByRole("link", { name: new RegExp(clinicPhone.label) }),
    ).toHaveAttribute("href", clinicPhone.href);
    expect(
      screen.getByRole("link", { name: clinicLandline.label }),
    ).toHaveAttribute("href", clinicLandline.href);

    for (const row of openingHours) {
      expect(screen.getByText(row.days)).toBeInTheDocument();
      expect(screen.getByText(row.hours)).toBeInTheDocument();
    }
  });

  /*
   * One source of destinations. The footer reads the same list both menus do,
   * so a link cannot be right in the menu and stale down here. Kontakt is the
   * exception and has to be: it points at this footer, and a link that scrolls
   * to the element it sits inside is a link to nowhere.
   */
  it("lists the same destinations as the menus, except itself", () => {
    render(<Footer />);
    const nav = screen.getByRole("navigation", { name: "Pätička" });

    for (const item of navigationItems) {
      if (item.href === "#kontakt") {
        expect(
          screen.queryByRole("link", { name: item.label }),
        ).not.toBeInTheDocument();
        continue;
      }
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute(
        "href",
        item.href,
      );
    }
    expect(nav).toBeInTheDocument();
  });

  /*
   * The menu's Kontakt entry scrolls here instead of opening a page, so this
   * id is the destination. Without it the menu link goes nowhere.
   */
  it("is the anchor the menu's Kontakt entry points at", () => {
    render(<Footer />);

    expect(screen.getByRole("contentinfo")).toHaveAttribute("id", "kontakt");
    expect(navigationItems.map((item) => item.href)).toContain("#kontakt");
  });

  /*
   * Not decoration. The header takes its appearance from the zone beneath it,
   * and without a declaration here it would keep the pale mode of the section
   * above and put a white logo on light chrome over an ink footer.
   */
  it("declares its own header mode", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toHaveAttribute(
      "data-header-mode",
      "none",
    );
  });

  /*
   * ⚠️ No legal row yet: the privacy notice and the operator's identification
   * do not exist. This fails if somebody adds a link to a page that is not
   * there, which in a footer reads as a promise the site cannot keep.
   */
  it("promises no legal pages that do not exist", () => {
    render(<Footer />);
    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href") ?? "");

    expect(hrefs.filter((href) => /ochran|gdpr|podmienk/i.test(href))).toEqual(
      [],
    );
  });
});
