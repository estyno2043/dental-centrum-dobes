import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { afterEach, expect, test, vi } from "vitest";

import { BackButton, PREVIOUS_KEY } from "./BackButton";

const back = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back, push, replace: vi.fn(), prefetch: vi.fn() }),
}));

afterEach(() => {
  back.mockClear();
  push.mockClear();
  window.sessionStorage.clear();
});

/*
 * Going back is only right when there is somewhere of ours to go back to.
 * Someone who opened a service page from a search result has history too, and
 * sending them into a search result from a button on the clinic's own site
 * would be a small betrayal.
 */
test("returns through history when the reader came from our own page", async () => {
  window.sessionStorage.setItem(PREVIOUS_KEY, "/");
  const user = userEvent.setup();
  render(<BackButton ground="light" scrolled={false} />);

  await user.click(screen.getByRole("button", { name: /späť/i }));

  expect(back).toHaveBeenCalledTimes(1);
  expect(push).not.toHaveBeenCalled();
});

test("goes to the homepage when they arrived cold", async () => {
  const user = userEvent.setup();
  render(<BackButton ground="light" scrolled={false} />);

  await user.click(screen.getByRole("button", { name: /späť/i }));

  expect(push).toHaveBeenCalledWith("/");
  expect(back).not.toHaveBeenCalled();
});

/* Storage can be refused outright; the homepage is the safe answer. */
test("survives storage being unavailable", async () => {
  const getItem = vi
    .spyOn(Storage.prototype, "getItem")
    .mockImplementation(() => {
      throw new Error("denied");
    });
  const user = userEvent.setup();
  render(<BackButton ground="light" scrolled={false} />);

  await user.click(screen.getByRole("button", { name: /späť/i }));

  expect(push).toHaveBeenCalledWith("/");
  getItem.mockRestore();
});

/*
 * It stands where the menu stands — same corner, in the menu's own positioning
 * root — but it does not borrow the trigger's shell. That rectangle holds two
 * marks and a word because it does two things; this does one.
 */
test("takes the menu's place in the corner", () => {
  const header = readFileSync("components/hero/SiteHeader.tsx", "utf8");
  const source = readFileSync("components/hero/BackButton.tsx", "utf8");
  const css = readFileSync("components/hero/hero.module.css", "utf8");

  expect(source).toContain("styles.desktopMenuRoot");
  expect(source).not.toContain("styles.desktopMenuTrigger");
  expect(header).toMatch(/mode === "quiet" \? \(\s*<BackButton/);

  const disc = css.match(/\.backTrigger \{[^}]*\}/)?.[0] ?? "";
  expect(disc).toMatch(/border-radius:\s*50%/);
  expect(disc).toMatch(/width:\s*54px/);
});

/*
 * A disc with one stroke in it and no visible word, so the word has to reach
 * assistive technology some other way — or the control announces itself as
 * nothing at all.
 */
test("says what it is without printing it", () => {
  render(<BackButton ground="light" scrolled={false} />);

  const button = screen.getByRole("button", { name: "Späť" });
  expect(button.querySelector("svg")).toBeInTheDocument();
  expect(button.querySelector("[aria-hidden='true']")).toBeInTheDocument();
});
