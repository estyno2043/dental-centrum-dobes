import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { clinicPhone } from "@/components/site/siteContent";
import ContactPage from "./page";

test("offers the phone and the booking form", () => {
  render(<ContactPage />);

  expect(
    screen.getAllByRole("link", { name: new RegExp(clinicPhone.label) })[0],
  ).toHaveAttribute("href", clinicPhone.href);
  expect(screen.getByTestId("contact-form")).toBeInTheDocument();
  expect(screen.getByLabelText(/Meno a priezvisko/)).toBeRequired();
  expect(screen.getByLabelText(/Telefón/)).toBeRequired();
});

test("submits through Netlify Forms with a honeypot", () => {
  render(<ContactPage />);

  const form = screen.getByTestId("contact-form");
  expect(form).toHaveAttribute("data-netlify", "true");
  expect(form).toHaveAttribute("data-netlify-honeypot", "bot-field");
  expect(form).toHaveAttribute("name", "kontakt");
});

test("states the confirmed facts", () => {
  render(<ContactPage />);

  expect(screen.getByText("Parkovanie pre pacientov zdarma")).toBeInTheDocument();
  expect(screen.getByText("Platba kartou aj v hotovosti")).toBeInTheDocument();
  expect(
    screen.getByText("Akútnych pacientov ošetríme prednostne"),
  ).toBeInTheDocument();
});

test("publishes no address, e-mail address or opening hours", () => {
  const { container } = render(<ContactPage />);

  // The clinic has confirmed none of these. A contact page is the worst place
  // on the site to publish a plausible guess, so their absence is the test.
  expect(container.textContent).not.toMatch(/Vlárska|Bratislava,|IČO/);
  expect(container.textContent).not.toMatch(/\S+@\S+\.\S+/);
  expect(container.textContent).not.toMatch(/\d{1,2}[:.]\d{2}\s*[–-]\s*\d{1,2}[:.]\d{2}/);
});
