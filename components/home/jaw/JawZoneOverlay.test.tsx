import { act, fireEvent, render, screen, within } from "@testing-library/react";
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

function renderOverlay(overrides: Partial<JawZoneOverlayProps> = {}) {
  return render(
    <JawZoneOverlay
      analyticsConsent={false}
      exactEndDrawn
      presentation="interactive"
      reducedMotion={false}
      visible
      {...overrides}
    />,
  );
}

describe("JawZoneOverlay pain map", () => {
  beforeEach(() => setViewport(false));
  afterEach(() => {
    viewportListeners.clear();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: originalMatchMedia,
    });
    delete (window as Window & { dataLayer?: unknown }).dataLayer;
  });

  it("teases anatomy without exposing guidance, controls, or routes", () => {
    const { container } = renderOverlay({ presentation: "tease" });

    expect(screen.queryByTestId("jaw-zone-guidance")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getAllByTestId(/jaw-mask-/)).toHaveLength(7);
    expect(container.querySelector('[data-presentation="tease"]')).toBeInTheDocument();
  });

  it("renders compact anatomical labels and one stable idle rail", () => {
    const { container } = renderOverlay();

    expect(screen.getAllByTestId(/jaw-mask-/)).toHaveLength(7);
    expect(screen.getAllByTestId(/jaw-hit-/)).toHaveLength(7);
    expect(screen.getAllByTestId(/jaw-connector-/)).toHaveLength(4);
    expect(screen.getAllByTestId(/jaw-zone-label-/)).toHaveLength(4);
    expect(container.querySelector("marker")).not.toBeInTheDocument();
    expect(screen.queryByTestId("jaw-assistance")).not.toBeInTheDocument();

    const guidance = screen.getByTestId("jaw-zone-guidance");
    expect(guidance).toHaveTextContent("Vyberte zvýraznenú oblasť");
    expect(within(guidance).getByRole("link", { name: "Chýba mi zub" })).toHaveAttribute(
      "href",
      "/problemy/chybajuci-zub",
    );
    expect(within(guidance).getByRole("link", { name: "Neviem / bolí to celé" })).toHaveAttribute(
      "href",
      "/problemy/neviem",
    );
  });

  it("moves patient-language problems into the desktop rail", async () => {
    const user = userEvent.setup();
    renderOverlay();
    const molar = screen.getByTestId("jaw-hit-molar-left");

    fireEvent.pointerEnter(molar);
    const rail = screen.getByTestId("jaw-problem-panel");
    expect(rail).toHaveTextContent("Stoličky");
    expect(rail).toHaveAttribute("data-problem-panel", "desktop");
    expect(within(rail).getByRole("link", { name: "Bolí ma pri hryzení" })).toHaveAttribute(
      "href",
      "/problemy/stolicky?problem=bite-pain",
    );
    expect(screen.getByTestId("jaw-zone-overlay")).toHaveAttribute("data-active-zone", "molar");

    fireEvent.pointerLeave(molar);
    expect(screen.queryByTestId("jaw-problem-panel")).not.toBeInTheDocument();
    expect(screen.getByTestId("jaw-zone-guidance")).toBeVisible();

    fireEvent.focus(molar);
    expect(screen.getByTestId("jaw-problem-panel")).toBeVisible();
    await user.click(molar);
    fireEvent.pointerLeave(molar);
    expect(screen.getByTestId("jaw-problem-panel")).toBeVisible();
  });

  it("keeps click-to-pin, Escape, and exact trigger focus restoration", async () => {
    const user = userEvent.setup();
    renderOverlay();
    const front = screen.getByTestId("jaw-hit-front");
    await user.click(front);

    expect(front).toHaveAttribute("aria-pressed", "true");
    await user.keyboard("{Escape}");

    expect(screen.queryByTestId("jaw-problem-panel")).not.toBeInTheDocument();
    expect(front).toHaveFocus();
  });

  it("uses controlled problem routes and consent-gated analytics", async () => {
    const dataLayer = { push: vi.fn() };
    Object.assign(window, { dataLayer });
    const user = userEvent.setup();
    renderOverlay({ analyticsConsent: true });

    await user.click(screen.getByTestId("jaw-hit-molar-right"));
    expect(dataLayer.push).toHaveBeenCalledWith({
      event: "jaw_zone_click",
      jaw_zone: "molar",
    });
    expect(screen.getByRole("link", { name: "Pulzujúca bolesť" })).toHaveAttribute(
      "href",
      "/problemy/stolicky?problem=pulsing",
    );
  });

  it("keeps reveal labels inert until final interaction gate", () => {
    const { container } = renderOverlay({ presentation: "reveal" });

    expect(screen.getAllByTestId(/jaw-zone-label-/)).toHaveLength(4);
    expect(screen.queryByTestId("jaw-zone-guidance")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(container.querySelector('[data-presentation="reveal"]')).toBeInTheDocument();
  });

  it("requires visibility and exact final frame at public boundary", () => {
    const { rerender } = renderOverlay({ exactEndDrawn: false });
    expect(screen.queryByTestId("jaw-zone-guidance")).not.toBeInTheDocument();

    rerender(
      <JawZoneOverlay
        analyticsConsent={false}
        exactEndDrawn
        presentation="interactive"
        reducedMotion={false}
        visible={false}
      />,
    );
    expect(screen.queryByTestId("jaw-zone-guidance")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("closes immediately and focuses safe root when presentation reverses", async () => {
    const user = userEvent.setup();
    const { rerender } = renderOverlay();
    await user.click(screen.getByTestId("jaw-hit-front"));

    rerender(
      <JawZoneOverlay
        analyticsConsent={false}
        exactEndDrawn
        presentation="tease"
        reducedMotion={false}
        visible
      />,
    );

    expect(screen.queryByTestId("jaw-problem-panel")).not.toBeInTheDocument();
    expect(screen.getByTestId("jaw-zone-overlay")).toHaveFocus();
  });

  it("opens a compact mobile problem sheet and reconciles viewport changes", async () => {
    const user = userEvent.setup();
    renderOverlay();
    const gum = screen.getByTestId("jaw-hit-gum-upper");
    await user.click(gum);
    expect(screen.getByTestId("jaw-problem-panel")).toHaveAttribute(
      "data-problem-panel",
      "desktop",
    );

    changeViewport(true);
    expect(screen.queryByTestId("jaw-problem-panel")).not.toBeInTheDocument();
    await user.click(gum);
    const sheet = screen.getByRole("dialog", { name: "Ďasná" });
    expect(sheet).toHaveAttribute("data-problem-panel", "mobile");
    expect(gum).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Zavrieť" }));
    expect(gum).toHaveFocus();
  });

  it("shows final interactive map immediately for reduced motion", () => {
    renderOverlay({
      exactEndDrawn: false,
      presentation: "hidden",
      reducedMotion: true,
    });

    expect(screen.getByTestId("jaw-zone-guidance")).toHaveTextContent(
      "Vyberte zvýraznenú oblasť",
    );
    expect(screen.getAllByRole("button", {
      name: /Predné zuby|Črenové zuby|Stoličky|Ďasná/,
    })).toHaveLength(7);
    expect(screen.getByRole("link", { name: "Chýba mi zub" })).toBeVisible();
  });

  it("locks desktop rail, touch targets, mobile sheet, and pop-motion contracts", () => {
    renderOverlay();
    expect(screen.getByTestId("jaw-artboard")).toHaveClass(styles.zoneArtboard);
    expect(cssText).toMatch(/\.zoneOverlay[\s\S]*grid-template-columns:\s*340px\s+minmax\(0,\s*1fr\)/);
    expect(cssText).toMatch(/\.guidanceRail[\s\S]*width:\s*340px/);
    expect(cssText).toMatch(/\.zoneConnector[\s\S]*stroke-width:\s*2[\s\S]*vector-effect:\s*non-scaling-stroke/);
    expect(cssText).toMatch(/\.zoneHit[\s\S]*stroke-width:\s*48[\s\S]*vector-effect:\s*non-scaling-stroke/);
    expect(cssText).toMatch(/\.zonePanel[\s\S]*max-height:\s*min\(44dvh,\s*24rem\)/);
    expect(cssText).toMatch(/@keyframes\s+zone-pop/);
    expect(cssText).toMatch(/@keyframes\s+zone-mask-pop[\s\S]*opacity:\s*0\.18/);
  });
});
