import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { clinicPhone, entryExam } from "@/components/site/siteContent";
import { ConversionBlock } from "./ConversionBlock";

vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  },
);

test("asks the closing question", () => {
  render(<ConversionBlock />);

  expect(
    screen.getByRole("heading", { name: "Začnime tým, čo vás trápi." }),
  ).toBeInTheDocument();
});

test("offers both routes out and the phone", () => {
  render(<ConversionBlock />);

  expect(screen.getByRole("link", { name: entryExam.cta })).toHaveAttribute(
    "href",
    "/kontakt",
  );
  expect(
    screen.getByRole("link", { name: "Nájsť riešenie podľa problému" }),
  ).toHaveAttribute("href", "/problemy");
  expect(
    screen.getByRole("link", { name: clinicPhone.label }),
  ).toHaveAttribute("href", clinicPhone.href);
});
