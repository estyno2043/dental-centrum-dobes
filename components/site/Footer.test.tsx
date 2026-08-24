import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";

import { Footer } from "./Footer";
import { clinicPhone, navigationItems } from "./siteContent";

test("carries every navigation destination", () => {
  render(<Footer />);

  const nav = screen.getByRole("navigation", { name: "Pätička" });
  for (const item of navigationItems) {
    expect(within(nav).getByRole("link", { name: item.label })).toHaveAttribute(
      "href",
      item.href,
    );
  }
});

test("carries the clinic phone as a dialable link and the logo home", () => {
  render(<Footer />);

  expect(
    screen.getByRole("link", { name: new RegExp(clinicPhone.label) }),
  ).toHaveAttribute("href", clinicPhone.href);
  expect(
    screen.getByRole("link", { name: "Dental Centrum Dobeš" }),
  ).toHaveAttribute("href", "/");
});

test("publishes no address, e-mail address or company identification", () => {
  const { container } = render(<Footer />);

  // None of these has been confirmed by the clinic, so none may be published.
  expect(container.textContent).not.toMatch(/Vlárska|IČO|DIČ/);
  expect(container.textContent).not.toMatch(/\S+@\S+\.\S+/);
});

test("links to no legal page while none exists", () => {
  render(<Footer />);

  for (const link of screen.getAllByRole("link")) {
    expect(link.getAttribute("href")).not.toMatch(
      /ochrana|osobn|gdpr|podmienky|cookies/i,
    );
  }
});
