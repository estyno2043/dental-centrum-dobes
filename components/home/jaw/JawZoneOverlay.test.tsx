import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { JawZoneOverlay, type JawZoneOverlayProps } from "./JawZoneOverlay";
import styles from "./jawExperience.module.css";

const originalMatchMedia = window.matchMedia;
const cssText = readFileSync("components/home/jaw/jawExperience.module.css", "utf8");
let viewportMobile = false;
const viewportListeners = new Set<(event: MediaQueryListEvent) => void>();

function setViewport(mobile: boolean): void {
  viewportMobile = mobile;
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: viewportMobile && query.includes("max-width: 767px"),
      media: query,
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        viewportListeners.add(listener);
      },
      removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        viewportListeners.delete(listener);
      },
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function changeViewport(mobile: boolean): void {
  viewportMobile = mobile;
  act(() => {
    for (const listener of viewportListeners) {
      listener({ matches: mobile } as MediaQueryListEvent);
    }
  });
}

function renderOverlay(overrides: Partial<React.ComponentProps<typeof JawZoneOverlay>> = {}) {
  return render(
    <JawZoneOverlay
      analyticsConsent={false}
      exactEndDrawn
      interactive
      reducedMotion={false}
      visible
      {...overrides}
    />,
  );
}

describe("JawZoneOverlay", () => {
  beforeEach(() => setViewport(false));
  afterEach(() => {
    vi.useRealTimers();
    viewportListeners.clear();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it("maps seven visual surfaces onto four jaw zones with separate direct entries", () => {
    const { container } = renderOverlay();

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
    const artboard = screen.getByTestId("jaw-artboard");
    expect(artboard.querySelector("svg")).toBeTruthy();
    expect(artboard.querySelectorAll("button")).toHaveLength(7);
    expect(container.querySelector("svg")?.parentElement).toBe(artboard);
  });

  it("keeps SVG and hit controls in one centered 16:9 artboard on portrait screens", () => {
    setViewport(true);
    renderOverlay();

    const artboard = screen.getByTestId("jaw-artboard");
    expect(artboard).toHaveClass(styles.zoneArtboard);
    expect(artboard.querySelector("svg")?.parentElement).toBe(artboard);
    expect(
      screen.getAllByRole("button", { name: /Predné zuby|Črenové zuby|Stoličky|Ďasná/ })
        .every((control) => control.parentElement === artboard),
    ).toBe(true);
    expect(cssText).toMatch(/\.zoneArtboard[\s\S]*aspect-ratio:\s*16\s*\/\s*9/);
  });

  it("keeps motion-time controls unavailable", () => {
    renderOverlay({ interactive: false });

    for (const control of screen.getAllByRole("button")) {
      expect(control).toHaveAttribute("aria-disabled", "true");
      expect(control).toHaveAttribute("tabindex", "-1");
      expect(control).toHaveClass(styles.zoneControlDisabled);
    }
    for (const entry of [
      screen.getByRole("link", { name: "Chýbajúci zub" }),
      screen.getByRole("link", { name: "Neviem / bolí to celé" }),
    ]) {
      expect(entry).toHaveAttribute("aria-disabled", "true");
      expect(entry).toHaveAttribute("tabindex", "-1");
      expect(fireEvent.click(entry)).toBe(false);
    }
  });

  it("requires exact end, visibility, and reduced-motion props at its public boundary", () => {
    const props = {
      analyticsConsent: false,
      exactEndDrawn: true,
      interactive: true,
      reducedMotion: false,
      visible: true,
    } satisfies JawZoneOverlayProps;

    expect(props.exactEndDrawn).toBe(true);

    // @ts-expect-error parent must provide final-frame proof; fail-open is forbidden.
    const missingExactEnd: JawZoneOverlayProps = {
      analyticsConsent: false,
      interactive: true,
      reducedMotion: false,
      visible: true,
    };
    expect(missingExactEnd).toBeDefined();
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

  it("records direct-zone activation without blocking navigation when consent exists", () => {
    const dataLayer = { push: vi.fn() };
    Object.assign(window, { dataLayer });
    renderOverlay({ analyticsConsent: true });
    const direct = screen.getByRole("link", { name: "Chýbajúci zub" });
    direct.addEventListener("click", (event) => event.preventDefault());

    fireEvent.click(direct);

    expect(dataLayer.push).toHaveBeenCalledWith({
      event: "jaw_zone_click",
      jaw_zone: "missing",
    });
    delete (window as Window & { dataLayer?: unknown }).dataLayer;
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

    rerender(
      <JawZoneOverlay
        analyticsConsent={false}
        exactEndDrawn
        interactive={false}
        reducedMotion={false}
        visible
      />,
    );

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

    rerender(
      <JawZoneOverlay
        analyticsConsent={false}
        exactEndDrawn={false}
        interactive
        reducedMotion={false}
        revealStartedAt={startedAt}
        visible
      />,
    );
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

  it("enables reduced motion immediately without waiting for stagger", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-15T12:00:00.000Z"));
    renderOverlay({ reducedMotion: true, revealStartedAt: Date.now() });

    expect(screen.getByRole("button", { name: "Predné zuby" })).toHaveAttribute(
      "aria-disabled",
      "false",
    );
  });

  it("closes and disables all entries when parent hides overlay", async () => {
    const user = userEvent.setup();
    const { rerender } = renderOverlay();
    const front = screen.getByRole("button", { name: "Predné zuby" });
    await user.click(front);
    front.focus();

    rerender(
      <JawZoneOverlay
        analyticsConsent={false}
        exactEndDrawn
        interactive
        reducedMotion={false}
        visible={false}
      />,
    );

    expect(screen.queryByRole("region", { name: "Predné zuby" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Predné zuby" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("link", { name: "Chýbajúci zub" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
    expect(screen.getByRole("heading", { name: "Kde vás to trápi?" })).toHaveFocus();
  });

  it("reconciles desktop and mobile mode changes without leaving card state open", async () => {
    const user = userEvent.setup();
    renderOverlay();
    const front = screen.getByRole("button", { name: "Predné zuby" });
    await user.click(front);
    expect(screen.getByRole("region", { name: "Predné zuby" })).toBeVisible();

    changeViewport(true);

    expect(screen.queryByRole("region", { name: "Predné zuby" })).not.toBeInTheDocument();
    await user.click(front);
    expect(screen.getByRole("dialog", { name: "Predné zuby" })).toBeVisible();
  });

  it("contains no arrow or leader CSS", () => {
    expect(styles).not.toHaveProperty("leader");
    expect(cssText).not.toMatch(/\.leader|\bline\b|arrow/i);
  });
});
