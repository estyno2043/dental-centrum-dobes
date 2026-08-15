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

  it("teases anatomy without exposing heading controls or direct routes", () => {
    const { container } = renderOverlay({ presentation: "tease" });

    expect(screen.queryByRole("heading", { name: "Kde vás to trápi?" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getAllByTestId(/jaw-mask-/)).toHaveLength(7);
    expect(container.querySelector('[data-presentation="tease"]')).toBeInTheDocument();
  });

  it("renders seven anatomical masks and four clear arrow labels without debug boxes", () => {
    const { container } = renderOverlay();

    expect(screen.getAllByTestId(/jaw-mask-/)).toHaveLength(7);
    expect(screen.getAllByTestId(/jaw-hit-/)).toHaveLength(7);
    expect(screen.getAllByTestId(/jaw-anchor-/)).toHaveLength(4);
    const leaders = screen.getAllByTestId(/jaw-leader-/);
    expect(leaders).toHaveLength(4);
    expect(leaders.every((leader) => leader.getAttribute("marker-end") === "url(#jaw-arrowhead)"))
      .toBe(true);
    expect(screen.getAllByTestId(/jaw-zone-label-/)).toHaveLength(4);
    expect(container.querySelectorAll("polygon")).toHaveLength(0);
    expect(container.querySelector('[data-testid="jaw-debug-rect"]')).not.toBeInTheDocument();
    expect(screen.getAllByTestId(/jaw-mask-/).every((mask) => mask.getAttribute("d")?.includes("C")))
      .toBe(true);
  });

  it("opens patient-language problems from hover focus and tap", async () => {
    const user = userEvent.setup();
    renderOverlay();
    const molar = screen.getByTestId("jaw-hit-molar-left");

    fireEvent.pointerEnter(molar);
    expect(screen.getByRole("region", { name: "Stoličky" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Bolí ma pri hryzení" })).toBeVisible();
    fireEvent.pointerLeave(molar);
    expect(screen.queryByRole("region", { name: "Stoličky" })).not.toBeInTheDocument();

    fireEvent.focus(molar);
    expect(screen.getByRole("region", { name: "Stoličky" })).toBeVisible();
    await user.click(molar);
    fireEvent.pointerLeave(molar);
    expect(screen.getByRole("region", { name: "Stoličky" })).toBeVisible();
  });

  it("uses existing problem routes and consent-gated analytics", async () => {
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

  it("moves direct entries into subtle bottom-centre assistance bar", () => {
    renderOverlay();

    const assistance = screen.getByTestId("jaw-assistance");
    expect(assistance).toHaveTextContent("Nenašli ste miesto?");
    expect(screen.getByRole("link", { name: "Chýba mi zub" })).toHaveAttribute(
      "href",
      "/problemy/chybajuci-zub",
    );
    expect(screen.getByRole("link", { name: "Neviem / bolí to celé" })).toHaveAttribute(
      "href",
      "/problemy/neviem",
    );
    expect(assistance).toHaveClass(styles.assistanceBar);
  });

  it("keeps reveal labels inert until final interaction gate", () => {
    const { container } = renderOverlay({ presentation: "reveal" });

    expect(screen.getByRole("heading", { name: "Kde vás to trápi?" })).toBeVisible();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(container.querySelector('[data-presentation="reveal"]')).toBeInTheDocument();
  });

  it("requires visibility and exact final frame at public boundary", () => {
    const { rerender } = renderOverlay({ exactEndDrawn: false });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    rerender(
      <JawZoneOverlay
        analyticsConsent={false}
        exactEndDrawn
        presentation="interactive"
        reducedMotion={false}
        visible={false}
      />,
    );
    expect(screen.queryByRole("heading", { name: "Kde vás to trápi?" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("closes pinned card on Escape and restores exact SVG trigger focus", async () => {
    const user = userEvent.setup();
    renderOverlay();
    const front = screen.getByTestId("jaw-hit-front");
    await user.click(front);

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("region", { name: "Predné zuby" })).not.toBeInTheDocument();
    expect(front).toHaveFocus();
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

    expect(screen.queryByRole("region", { name: "Predné zuby" })).not.toBeInTheDocument();
    expect(screen.getByTestId("jaw-zone-overlay")).toHaveFocus();
  });

  it("opens compact mobile problem sheet and reconciles viewport changes", async () => {
    const user = userEvent.setup();
    renderOverlay();
    const gum = screen.getByTestId("jaw-hit-gum-upper");
    await user.click(gum);
    expect(screen.getByRole("region", { name: "Ďasná" })).toBeVisible();

    changeViewport(true);
    expect(screen.queryByRole("region", { name: "Ďasná" })).not.toBeInTheDocument();
    await user.click(gum);
    expect(screen.getByRole("dialog", { name: "Ďasná" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Zavrieť" }));
    expect(gum).toHaveFocus();
  });

  it("shows final interactive map immediately for reduced motion", () => {
    renderOverlay({
      exactEndDrawn: false,
      presentation: "hidden",
      reducedMotion: true,
    });

    expect(screen.getByRole("heading", { name: "Kde vás to trápi?" })).toBeVisible();
    expect(screen.getAllByRole("button", {
      name: /Predné zuby|Črenové zuby|Stoličky|Ďasná/,
    })).toHaveLength(7);
    expect(screen.getByRole("link", { name: "Chýba mi zub" })).toBeVisible();
  });

  it("keeps one centered 16:9 artboard and pop-motion contracts", () => {
    renderOverlay();
    expect(screen.getByTestId("jaw-artboard")).toHaveClass(styles.zoneArtboard);
    expect(cssText).toMatch(/\.zoneArtboard[\s\S]*aspect-ratio:\s*16\s*\/\s*9/);
    expect(cssText).toMatch(/@keyframes\s+zone-pop/);
    expect(cssText).toMatch(/@keyframes\s+zone-tease/);
    expect(cssText).toMatch(/@keyframes\s+zone-heading-pop[\s\S]*translate\(-50%,\s*0\)/);
    expect(cssText).toMatch(/@keyframes\s+assistance-pop[\s\S]*translateX\(-50%\)/);
    expect(cssText).toMatch(/\.zoneHeading[\s\S]*animation:\s*zone-heading-pop/);
    expect(cssText).toMatch(/\.assistanceBar[\s\S]*animation:\s*assistance-pop/);
    expect(cssText).toMatch(/\.assistanceBar[\s\S]*left:\s*50%/);
  });
});
