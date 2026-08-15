import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { JawZoneOverlay } from "./JawZoneOverlay";
import styles from "./jawExperience.module.css";

const originalMatchMedia = window.matchMedia;
const cssText = readFileSync("components/home/jaw/jawExperience.module.css", "utf8");

function setViewport(mobile: boolean): void {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: mobile && query.includes("max-width: 767px"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function renderOverlay(overrides: Partial<React.ComponentProps<typeof JawZoneOverlay>> = {}) {
  return render(
    <JawZoneOverlay analyticsConsent={false} interactive {...overrides} />,
  );
}

describe("JawZoneOverlay", () => {
  beforeEach(() => setViewport(false));
  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it("maps seven visual surfaces onto four jaw zones with separate direct entries", () => {
    renderOverlay();

    expect(screen.getAllByTestId("jaw-hit-surface")).toHaveLength(7);
    expect(
      screen.getAllByRole("button", { name: /Predné zuby|Črenové zuby|Stoličky|Ďasná/ }),
    ).toHaveLength(7);
    expect(screen.getByTestId("jaw-hit-premolar-left")).toHaveAttribute("data-zone", "premolar");
    expect(screen.getByTestId("jaw-hit-premolar-right")).toHaveAttribute("data-zone", "premolar");
    expect(screen.getByTestId("jaw-hit-molar-left")).toHaveAttribute("data-zone", "molar");
    expect(screen.getByTestId("jaw-hit-molar-right")).toHaveAttribute("data-zone", "molar");
    expect(screen.getByTestId("jaw-hit-gum-upper")).toHaveAttribute("data-zone", "gum");
    expect(screen.getByTestId("jaw-hit-gum-lower")).toHaveAttribute("data-zone", "gum");
    expect(screen.getByRole("link", { name: "Chýbajúci zub" })).toHaveAttribute(
      "href",
      "/problemy/chybajuci-zub",
    );
    expect(screen.getByRole("link", { name: "Neviem / bolí to celé" })).toHaveAttribute(
      "href",
      "/problemy/neviem",
    );
  });

  it("keeps motion-time controls unavailable", () => {
    renderOverlay({ interactive: false });

    for (const control of screen.getAllByRole("button")) {
      expect(control).toHaveAttribute("aria-disabled", "true");
      expect(control).toHaveAttribute("tabindex", "-1");
      expect(control).toHaveClass(styles.zoneControlDisabled);
    }
  });

  it("opens desktop card on hover and focus then pins it on click", async () => {
    const user = userEvent.setup();
    renderOverlay();
    const front = screen.getByRole("button", { name: "Predné zuby" });

    fireEvent.pointerEnter(front);
    expect(screen.getByRole("region", { name: "Predné zuby" })).toBeVisible();
    fireEvent.pointerLeave(front);
    expect(screen.queryByRole("region", { name: "Predné zuby" })).not.toBeInTheDocument();

    await user.tab();
    expect(screen.getByRole("region", { name: "Predné zuby" })).toBeVisible();
    await user.click(front);
    fireEvent.pointerLeave(front);
    expect(screen.getByRole("region", { name: "Predné zuby" })).toBeVisible();
  });

  it("keeps hover card open while pointer enters card", () => {
    renderOverlay();
    const front = screen.getByRole("button", { name: "Predné zuby" });
    fireEvent.pointerEnter(front);
    const card = screen.getByRole("region", { name: "Predné zuby" });

    fireEvent.pointerEnter(card);
    fireEvent.pointerLeave(front, { relatedTarget: card });

    expect(screen.getByRole("region", { name: "Predné zuby" })).toBeVisible();
  });

  it("uses validated problem route without navigation interception", async () => {
    const user = userEvent.setup();
    renderOverlay({ analyticsConsent: true });
    await user.click(screen.getByTestId("jaw-hit-molar-left"));
    const problem = screen.getByRole("link", { name: "Pulzujúca bolesť" });

    expect(problem).toHaveAttribute("href", "/problemy/stolicky?problem=pulsing");
  });

  it("closes a pinned card on Escape and restores focus to trigger", async () => {
    const user = userEvent.setup();
    renderOverlay();
    const front = screen.getByRole("button", { name: "Predné zuby" });
    await user.click(front);
    expect(screen.getByRole("region", { name: "Predné zuby" })).toBeVisible();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("region", { name: "Predné zuby" })).not.toBeInTheDocument();
    expect(front).toHaveFocus();
  });

  it("closes immediately and returns focus to safe heading when interaction reverses", async () => {
    const user = userEvent.setup();
    const { rerender } = renderOverlay();
    const front = screen.getByRole("button", { name: "Predné zuby" });
    await user.click(front);
    front.focus();

    rerender(<JawZoneOverlay analyticsConsent={false} interactive={false} />);

    expect(screen.queryByRole("region", { name: "Predné zuby" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kde vás to trápi?" })).toHaveFocus();
  });

  it("waits for exact endpoint and reveal interval before enabling controls", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-15T12:00:00.000Z"));
    const startedAt = Date.now();
    const { rerender } = renderOverlay({ exactEndDrawn: true, revealStartedAt: startedAt });
    expect(screen.getByRole("button", { name: "Predné zuby" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    act(() => vi.advanceTimersByTime(719));
    expect(screen.getByRole("button", { name: "Predné zuby" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole("button", { name: "Predné zuby" })).toHaveAttribute(
      "aria-disabled",
      "false",
    );

    rerender(<JawZoneOverlay analyticsConsent={false} exactEndDrawn={false} interactive revealStartedAt={startedAt} />);
    expect(screen.getByRole("button", { name: "Predné zuby" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("opens compact mobile panel and returns focus after explicit close", async () => {
    setViewport(true);
    const user = userEvent.setup();
    renderOverlay();
    const gum = screen.getByTestId("jaw-hit-gum-upper");
    await user.click(gum);

    expect(screen.getByRole("dialog", { name: "Ďasná" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Zavrieť" }));

    expect(screen.queryByRole("dialog", { name: "Ďasná" })).not.toBeInTheDocument();
    expect(gum).toHaveFocus();
  });

  it("contains no arrow or leader CSS", () => {
    expect(styles).not.toHaveProperty("leader");
    expect(cssText).not.toMatch(/\.leader|\bline\b|arrow/i);
  });
});
