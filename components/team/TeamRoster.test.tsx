import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { TeamRoster } from "./TeamRoster";
import { teamGroups } from "./teamContent";

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Stubs `matchMedia` so the roster can be rendered with and without the stage. */
function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  );
}

const [firstMember, secondMember] = teamGroups[0].members;

test("lists every member under its group heading", () => {
  stubMatchMedia(true);
  render(<TeamRoster />);

  for (const group of teamGroups) {
    expect(screen.getByText(group.label)).toBeInTheDocument();

    for (const member of group.members) {
      expect(screen.getByText(member.name)).toBeInTheDocument();
    }
  }
});

test("focusing a name moves the stage to that member", async () => {
  const user = userEvent.setup();
  stubMatchMedia(true);
  render(<TeamRoster />);

  // The stage starts on the first member, so its focus line is the one shown.
  expect(screen.getByText(firstMember.focus)).toBeInTheDocument();

  await user.tab();
  await user.tab();

  await waitFor(() => {
    expect(screen.getByText(secondMember.focus)).toBeInTheDocument();
  });
});

test("opens a profile with the member's biography and closes on Escape", async () => {
  const user = userEvent.setup();
  stubMatchMedia(true);
  render(<TeamRoster />);

  await user.click(
    screen.getByRole("button", {
      name: `${firstMember.name}, ${firstMember.role} — otvoriť profil`,
    }),
  );

  const dialog = await screen.findByRole("dialog");
  expect(dialog).toHaveTextContent(firstMember.bio);
  expect(dialog).toHaveTextContent(String(firstMember.since));

  await user.keyboard("{Escape}");

  await waitFor(() => {
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

test("below the stage breakpoint each row carries its own portrait and focus line", () => {
  stubMatchMedia(false);
  render(<TeamRoster />);

  // With no stage, the focus line has to live in the row instead.
  expect(screen.getByText(firstMember.focus)).toBeInTheDocument();
  expect(screen.getByText(secondMember.focus)).toBeInTheDocument();
});
