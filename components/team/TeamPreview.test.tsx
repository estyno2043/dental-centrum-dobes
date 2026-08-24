import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { TeamPreview } from "./TeamPreview";
import { teamMembers } from "./teamContent";

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

test("shows four faces, not the whole roster", () => {
  render(<TeamPreview />);

  const portraits = screen.getAllByRole("img");
  expect(portraits).toHaveLength(4);
  expect(portraits.length).toBeLessThan(teamMembers.length);
});

test("names each face from the clinic's own roster", () => {
  render(<TeamPreview />);

  const names = new Set(teamMembers.map((member) => member.name));
  for (const portrait of screen.getAllByRole("img")) {
    expect(names).toContain(portrait.getAttribute("alt"));
  }
});

test("carries the headline and the way through to the full team", () => {
  render(<TeamPreview />);

  expect(
    screen.getByRole("heading", { name: "Ľudia, ktorým môžete dôverovať." }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /Spoznajte celý tím/ }),
  ).toHaveAttribute("href", "/tim");
});

test("claims no role for anyone in the preview", () => {
  const { container } = render(<TeamPreview />);

  // Seven of the eleven are published by the clinic with a degree and no
  // stated role. A homepage is the last place to start guessing job titles.
  expect(container.textContent).not.toMatch(/sestra|hygienič|lekár|zubár/i);
});
