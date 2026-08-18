import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { DesktopMenu } from "./DesktopMenu";

afterEach(() => {
  vi.useRealTimers();
});

test("renders a closed trigger with a distinct accessible name from the mobile menu", () => {
  render(<DesktopMenu scrolled={false} />);

  const trigger = screen.getByRole("button", { name: "Otvoriť navigáciu" });
  expect(trigger).toBeInTheDocument();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("clicking the trigger opens the panel and makes its links reachable", async () => {
  const user = userEvent.setup();
  render(<DesktopMenu scrolled={false} />);

  const trigger = screen.getByRole("button", { name: "Otvoriť navigáciu" });
  await user.click(trigger);

  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("link", { name: "Služby" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Cenník" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Tím" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Kontakt" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /0918 800 002/ })).toHaveAttribute(
    "href",
    "tel:+421918800002",
  );

  await user.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("Escape closes the panel and returns focus to the trigger", async () => {
  const user = userEvent.setup();
  render(<DesktopMenu scrolled={false} />);

  const trigger = screen.getByRole("button", { name: "Otvoriť navigáciu" });
  await user.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");

  await user.keyboard("{Escape}");

  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveFocus();
});

test("opens on hover after a short delay and closes after leaving", () => {
  vi.useFakeTimers();
  render(<DesktopMenu scrolled={false} />);

  const trigger = screen.getByRole("button", { name: "Otvoriť navigáciu" });
  fireEvent.mouseEnter(trigger.parentElement as Element);

  act(() => vi.advanceTimersByTime(60));
  expect(trigger).toHaveAttribute("aria-expanded", "false");

  act(() => vi.advanceTimersByTime(40));
  expect(trigger).toHaveAttribute("aria-expanded", "true");

  fireEvent.mouseLeave(trigger.parentElement as Element);

  act(() => vi.advanceTimersByTime(150));
  expect(trigger).toHaveAttribute("aria-expanded", "true");

  act(() => vi.advanceTimersByTime(80));
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("re-entering before the close delay elapses cancels the close", () => {
  vi.useFakeTimers();
  render(<DesktopMenu scrolled={false} />);

  const trigger = screen.getByRole("button", { name: "Otvoriť navigáciu" });
  const root = trigger.parentElement as Element;

  fireEvent.mouseEnter(root);
  act(() => vi.advanceTimersByTime(90));
  expect(trigger).toHaveAttribute("aria-expanded", "true");

  fireEvent.mouseLeave(root);
  act(() => vi.advanceTimersByTime(100));
  fireEvent.mouseEnter(root);
  act(() => vi.advanceTimersByTime(300));

  expect(trigger).toHaveAttribute("aria-expanded", "true");
});

test("keyboard focus opens the panel; focus leaving the root closes it", async () => {
  const user = userEvent.setup();
  render(
    <div>
      <DesktopMenu scrolled={false} />
      <button type="button">Elsewhere</button>
    </div>,
  );

  await user.tab();
  const trigger = screen.getByRole("button", { name: "Otvoriť navigáciu" });
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute("aria-expanded", "true");

  // 5 focusable links inside the open panel (Služby, Cenník, Tím, Kontakt,
  // then the phone CTA) sit between the trigger and the next external
  // element, so 6 tabs are needed to reach it.
  await user.tab();
  await user.tab();
  await user.tab();
  await user.tab();
  await user.tab();
  await user.tab();

  expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("keyboard focus still opens the panel after an open/close click sequence", async () => {
  const user = userEvent.setup();
  render(
    <div>
      <button type="button">Before</button>
      <DesktopMenu scrolled={false} />
    </div>,
  );

  const trigger = screen.getByRole("button", { name: "Otvoriť navigáciu" });
  await user.click(trigger); // open
  await user.click(trigger); // close — trigger stays focused, no new focus event fires

  screen.getByRole("button", { name: "Before" }).focus();
  await user.tab(); // genuine keyboard focus of the trigger

  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute("aria-expanded", "true");
});
