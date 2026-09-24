import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { SCROLL_REQUEST } from "@/components/scroll/scrollToSection";
import { MobileMenu } from "./MobileMenu";

test("renders the Dental Menu Mark with an explicit accessible name", () => {
  render(<MobileMenu />);

  const trigger = screen.getByRole("button", { name: "Otvoriť menu" });
  expect(trigger).toBeInTheDocument();
  expect(trigger).toHaveTextContent("Menu");
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("opens the complete mobile navigation", async () => {
  const user = userEvent.setup();
  render(<MobileMenu />);

  await user.click(screen.getByRole("button", { name: "Otvoriť menu" }));

  const dialog = await screen.findByRole("dialog", {
    name: "Hlavná navigácia",
  });
  expect(dialog).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Služby" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Cenník" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Tím" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Kontakt" })).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /Interaktívna prehliadka klinikou/ }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /0918 800 002/ })).toHaveAttribute(
    "href",
    "tel:+421918800002",
  );
});

test("closes after a destination is activated", async () => {
  const user = userEvent.setup();
  render(<MobileMenu />);

  await user.click(screen.getByRole("button", { name: "Otvoriť menu" }));
  await user.click(await screen.findByRole("link", { name: "Služby" }));

  await waitFor(() => {
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

test("Escape closes the dialog and restores focus to the trigger", async () => {
  const user = userEvent.setup();
  render(<MobileMenu />);

  const trigger = screen.getByRole("button", { name: "Otvoriť menu" });
  await user.click(trigger);
  expect(await screen.findByRole("dialog")).toBeInTheDocument();

  await user.keyboard("{Escape}");

  await waitFor(() => {
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  expect(trigger).toHaveFocus();
});

/*
 * Eased scrolling is off on touch devices, so on a phone nobody answers the
 * scroll request the menu sends. The menu used to cancel the link and send
 * the request anyway, which left every section link doing nothing at all.
 */
test("scrolls to the section natively when no eased scroller answers", async () => {
  const user = userEvent.setup();
  const section = document.createElement("section");
  section.id = "sluzby";
  const scrollIntoView = vi.fn();
  section.scrollIntoView = scrollIntoView;
  document.body.appendChild(section);

  try {
    render(<MobileMenu />);
    await user.click(screen.getByRole("button", { name: "Otvoriť menu" }));
    await user.click(await screen.findByRole("link", { name: "Služby" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1));
  } finally {
    section.remove();
  }
});

test("leaves the trip to the eased scroller when one is running", async () => {
  const user = userEvent.setup();
  const section = document.createElement("section");
  section.id = "sluzby";
  const scrollIntoView = vi.fn();
  section.scrollIntoView = scrollIntoView;
  document.body.appendChild(section);
  const handled = vi.fn((event: Event) => event.preventDefault());
  window.addEventListener(SCROLL_REQUEST, handled);

  try {
    render(<MobileMenu />);
    await user.click(screen.getByRole("button", { name: "Otvoriť menu" }));
    await user.click(await screen.findByRole("link", { name: "Služby" }));

    await waitFor(() => expect(handled).toHaveBeenCalledTimes(1));
    expect(scrollIntoView).not.toHaveBeenCalled();
  } finally {
    window.removeEventListener(SCROLL_REQUEST, handled);
    section.remove();
  }
});
