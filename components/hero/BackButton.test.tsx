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
 * It wears the menu trigger's shell so it lands in the same corner at the same
 * size — the one control changing its job, not a second button appearing.
 */
test("takes the menu trigger's place rather than sitting beside it", () => {
  const header = readFileSync("components/hero/SiteHeader.tsx", "utf8");
  const source = readFileSync("components/hero/BackButton.tsx", "utf8");

  expect(source).toContain("styles.desktopMenuTrigger");
  expect(source).toContain("styles.desktopMenuRoot");
  expect(header).toMatch(/mode === "quiet" \? \(\s*<BackButton/);
});
