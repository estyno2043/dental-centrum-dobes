import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

import { Footer } from "@/components/site/Footer";
import { navigationItems } from "@/components/site/siteContent";
import { DesktopMenu } from "./DesktopMenu";
import { MobileMenu } from "./MobileMenu";

/**
 * The two menus and the footer read one list, but nothing stops a future edit
 * from hard-coding a destination into one of them. These tests compare what
 * each actually renders, so a divergence fails here rather than on the phone.
 */

async function openMobileDestinations(): Promise<Map<string, string | null>> {
  const user = userEvent.setup();
  render(<MobileMenu />);
  await user.click(screen.getByRole("button", { name: "Otvoriť menu" }));

  const nav = await screen.findByRole("navigation", { name: "Mobilná navigácia" });
  return new Map(
    within(nav)
      .getAllByRole("link")
      .map((link) => [link.textContent?.replace(/^\d+/, "") ?? "", link.getAttribute("href")]),
  );
}

test("desktop menu points every item at its real destination", async () => {
  const user = userEvent.setup();
  render(<DesktopMenu scrolled={false} />);
  await user.click(screen.getByRole("button", { name: "Otvoriť navigáciu" }));

  for (const item of navigationItems) {
    expect(screen.getByRole("link", { name: item.label })).toHaveAttribute(
      "href",
      item.href,
    );
  }
});

test("mobile menu points every item at the same destination as the desktop menu", async () => {
  const destinations = await openMobileDestinations();

  for (const item of navigationItems) {
    expect(destinations.get(item.label)).toBe(item.href);
  }
});

test("no menu or footer link is left pointing at a bare fragment", async () => {
  const { container: footer } = render(<Footer />);
  const user = userEvent.setup();
  render(<DesktopMenu scrolled={false} />);
  await user.click(screen.getByRole("button", { name: "Otvoriť navigáciu" }));

  const links = [
    ...footer.querySelectorAll("a"),
    ...screen.getAllByRole("link"),
  ];

  expect(links.length).toBeGreaterThan(0);
  for (const link of links) {
    expect(link.getAttribute("href")).not.toBe("#");
  }
});
