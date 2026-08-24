import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { entryExam } from "@/components/site/siteContent";
import PricingPage from "./page";

test("publishes the entry examination and its price", () => {
  render(<PricingPage />);

  expect(
    screen.getByRole("heading", { name: entryExam.label }),
  ).toBeInTheDocument();
  expect(screen.getByText(entryExam.price)).toBeInTheDocument();
});

test("says what the examination includes, CT only when needed", () => {
  render(<PricingPage />);

  expect(screen.getByText(/Približne 30 minút/)).toBeInTheDocument();
  expect(screen.getByText(/Panoramatická snímka/)).toBeInTheDocument();
  expect(screen.getByText(/Intraorálne fotografie a skeny/)).toBeInTheDocument();
  expect(
    screen.getByText(/CT snímka iba vtedy, keď je medicínsky potrebná/),
  ).toBeInTheDocument();
  expect(screen.getByText(/Plán ďalšieho ošetrenia a jeho cenu/)).toBeInTheDocument();
});

test("routes the booking CTA at the contact page", () => {
  render(<PricingPage />);

  expect(screen.getByRole("link", { name: entryExam.cta })).toHaveAttribute(
    "href",
    "/kontakt",
  );
});

test("publishes no price other than the approved entry examination", () => {
  const { container } = render(<PricingPage />);

  /*
   * The clinic's internal list runs to 200+ coded items and is not approved
   * for the web. The entry examination may appear more than once — it is both
   * the price and the call to action — so what is asserted is that no *other*
   * figure reaches the page.
   */
  const amounts = new Set(
    (container.textContent ?? "").match(/\d[\d\s.,]*\s*€/g)?.map((match) =>
      match.replace(/\s+/g, " ").trim(),
    ) ?? [],
  );

  expect([...amounts]).toEqual([entryExam.price]);
});
