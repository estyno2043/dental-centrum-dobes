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

  it("renders seven anatomical masks and four connectors, and no hit paths over the jaw", () => {
    const { container } = renderOverlay();

    expect(screen.getAllByTestId(/jaw-mask-/)).toHaveLength(7);
    expect(screen.getAllByTestId(/jaw-anchor-/)).toHaveLength(4);

    /*
     * The regression this whole rework exists for. Seven invisible hit paths
     * used to cover the jaw edge to edge, so travelling to the front teeth
     * from outside crossed the molar and premolar surfaces and opened each of
     * them on the way past. Nothing over the anatomy may be interactive again.
     */
    expect(screen.queryAllByTestId(/jaw-hit-/)).toHaveLength(0);
    expect(screen.getAllByTestId(/jaw-zone-button-/)).toHaveLength(4);
    expect(screen.getAllByTestId(/jaw-pulse-/)).toHaveLength(4);
    const leaders = screen.getAllByTestId(/jaw-leader-/);
    expect(leaders).toHaveLength(4);
    /*
     * The arrowhead is gone — a leader now ends in the anchor ring, which is
     * also what the travelling pulse lands on. Both copies of the path declare
     * `pathLength="100"`, which is what lets the draw-in and the pulse be
     * written as percentages instead of measured per path; drop it and both
     * animations silently mistime.
     */
    expect(leaders.every((leader) => leader.getAttribute("marker-end"))).toBe(false);
    expect(leaders.every((leader) => leader.getAttribute("pathLength") === "100")).toBe(true);
    expect(
      screen.getAllByTestId(/jaw-pulse-/).every((pulse) => pulse.getAttribute("pathLength") === "100"),
    ).toBe(true);
    for (const label of ["Predné zuby", "Črenové zuby", "Stoličky", "Ďasná"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
    expect(container.querySelectorAll("polygon")).toHaveLength(0);
    expect(container.querySelector('[data-testid="jaw-debug-rect"]')).not.toBeInTheDocument();
    expect(screen.getAllByTestId(/jaw-mask-/).every((mask) => mask.getAttribute("d")?.includes("C")))
      .toBe(true);
  });

  it("opens patient-language problems from hover focus and tap", async () => {
    const user = userEvent.setup();
    renderOverlay();
    const molar = screen.getByTestId("jaw-zone-button-molar");

    fireEvent.pointerEnter(molar);
    expect(screen.getByRole("region", { name: "Stoličky" })).toBeVisible();
    expect(screen.getByRole("link", { name: /^Bolí ma pri hryzení/ })).toBeVisible();
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

    await user.click(screen.getByTestId("jaw-zone-button-molar"));
    expect(dataLayer.push).toHaveBeenCalledWith({
      event: "jaw_zone_click",
      jaw_zone: "molar",
    });
    expect(screen.getByRole("link", { name: /^Pulzujúca bolesť/ })).toHaveAttribute(
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
    const front = screen.getByTestId("jaw-zone-button-front");
    await user.click(front);

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("region", { name: "Predné zuby" })).not.toBeInTheDocument();
    expect(front).toHaveFocus();
  });

  it("closes immediately and focuses safe root when presentation reverses", async () => {
    const user = userEvent.setup();
    const { rerender } = renderOverlay();
    await user.click(screen.getByTestId("jaw-zone-button-front"));

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
    const gum = screen.getByTestId("jaw-zone-button-gum");
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
    })).toHaveLength(4);
    expect(screen.getByRole("link", { name: "Chýba mi zub" })).toBeVisible();
  });

  /*
   * The close control is a glyph now, not the word it used to be. Its name has
   * to survive that: the mark itself is hidden from assistive technology and
   * the word is carried by the label and a visually hidden span, so a screen
   * reader still hears "Zavrieť" rather than a multiplication sign.
   */
  it("keeps the close control named after it became an icon", async () => {
    const user = userEvent.setup();
    renderOverlay();
    changeViewport(true);
    await user.click(screen.getByTestId("jaw-zone-button-gum"));

    const close = screen.getByRole("button", { name: "Zavrieť" });
    expect(close.querySelector("[aria-hidden='true']")).toBeInTheDocument();
    expect(close.querySelector(`.${styles.srOnly}`)).toHaveTextContent("Zavrieť");
  });

  /*
   * The three faults these buttons actually had. Each one is a thing a reader
   * could hit, not a matter of taste, so each is pinned here.
   */
  it("keeps the button fixes: wrapping bar, no dangling rule, room in the close control", () => {
    // The bar holds a question and two labels and used to be held on one line,
    // which pushed it past its own max-width between the phone breakpoint and
    // roughly 900px.
    expect(cssText).toMatch(/\.assistanceBar\s*\{[^}]*flex-wrap:\s*wrap/);
    expect(cssText).not.toMatch(/\.assistanceBar\s*\{[^}]*white-space:\s*nowrap/);

    // Every problem row carried a bottom rule, including the last, which left
    // a line hanging over the card's own edge.
    expect(cssText).toMatch(/\.problemList li:last-child a\s*\{[^}]*border-bottom:\s*0/);

    // "Zavrieť" sat in a 44px minimum with no padding of its own and ran into
    // its border; the control is now a fixed round icon button.
    expect(cssText).toMatch(/\.closeButton\s*\{[^}]*width:\s*44px/);
    expect(cssText).toMatch(/\.closeButton\s*\{[^}]*height:\s*44px/);
  });

  /*
   * Keyboard focus used to be signalled by the same fill that hover produces,
   * which gives a keyboard user no way to tell the two apart.
   */
  it("gives every jaw control a focus ring of its own", () => {
    for (const selector of ["directEntry", "problemList a", "closeButton"]) {
      const pattern = selector.includes(" ")
        ? String.raw`\.${selector.split(" ")[0]} a:focus-visible\s*\{[^}]*outline:`
        : String.raw`\.${selector}:focus-visible\s*\{[^}]*outline:`;
      expect(cssText).toMatch(new RegExp(pattern));
    }
  });

  /*
   * Both leaders used to miss the teeth they name. Measured against the
   * sequence's final frame — 1280x720 onto this 1920x1080 viewBox at exactly
   * 1.5x — the lower arch's midline is x≈981 and its four incisors span
   * 910–1053, which puts the premolars at roughly 760–864 and the molars at
   * 1202–1290. The premolar anchor sat at 720, past its own teeth and on the
   * molars; the molar anchor sat at 1300, off the gum entirely.
   */
  it("aims each leader at the teeth it names", () => {
    renderOverlay();

    const MIDLINE = 981;
    const at = (zone: string) =>
      Number(screen.getByTestId(`jaw-anchor-${zone}`).getAttribute("cx"));

    const premolar = at("premolar");
    const molar = at("molar");

    // Premolars sit in front of molars, so the premolar anchor has to be the
    // nearer of the two to the midline. Swap them back and this fails.
    expect(Math.abs(premolar - MIDLINE)).toBeLessThan(Math.abs(molar - MIDLINE));

    // And both have to land on the arch rather than beside it.
    for (const x of [premolar, molar]) {
      expect(x).toBeGreaterThan(560);
      expect(x).toBeLessThan(1400);
    }

    // Each anchor belongs to its own side's teeth, not the other's.
    expect(premolar).toBeGreaterThan(760);
    expect(premolar).toBeLessThan(910);
    expect(molar).toBeGreaterThan(1190);
  });

  /*
   * With a card open, every zone must still be reachable. The card used to be
   * anchored to the bottom and left to size itself, which worked at one window
   * height and at shorter ones grew straight up over the premolar control —
   * opening any other zone then took that quarter of the map out of reach.
   * Pinning the top below the controls is what makes that impossible, so the
   * property is pinned here rather than the pixel values.
   */
  it("holds the problem card below the controls by its top edge", () => {
    expect(cssText).toMatch(/\.zoneCard\s*\{[^}]*\btop:\s*5[0-9]%/);
    expect(cssText).not.toMatch(/\.zoneCard\s*\{[^}]*\btop:\s*auto/);
    expect(cssText).toMatch(/\.zoneCard\s*\{[^}]*overflow-y:\s*auto/);
  });

  /*
   * A symptom is not a diagnosis. The same one leads to more than one
   * treatment and only an examination decides which, so the row names the
   * whole list rather than picking the likeliest — and it goes inside the
   * link, where a screen reader hears it without having to hover anything.
   */
  it("tells each row where it leads, in full", () => {
    renderOverlay();
    fireEvent.pointerEnter(screen.getByTestId("jaw-zone-button-molar"));

    const row = screen.getByRole("link", { name: /^Bolí ma pri hryzení/ });
    expect(row.textContent).toContain("Endodoncia pod mikroskopom");
    expect(row.textContent).toContain("extrakcia");
  });

  /*
   * The card stands in a room. Perspective belongs to whatever contains the
   * transformed element, so it lives on the overlay — a card cannot give
   * itself any — and one shared value keeps the unfold and the tilt looking at
   * the same horizon.
   */
  it("gives the card depth from the overlay, not from itself", () => {
    expect(cssText).toMatch(/\.zoneOverlay \{[^}]*perspective:\s*1400px/);
    expect(cssText).toMatch(/\.zoneCard \{[^}]*transform-style:\s*preserve-3d/);
    expect(cssText).toMatch(/\.cardTop \{[^}]*translateZ/);
    expect(cssText).toMatch(/\.problemList \{[^}]*translateZ/);
  });

  /* And it is hinged to the tooth, not to its own corner. */
  it("unfolds from an origin the script measures off the anchor", () => {
    const source = readFileSync("components/home/jaw/JawZoneOverlay.tsx", "utf8");

    expect(source).toMatch(/jaw-anchor-\$\{zone\}/);
    expect(source).toContain("transformOrigin");
    expect(cssText).toMatch(/@keyframes card-unfold/);
  });

  /*
   * The jaw was drawn in a bespoke amber that appears nowhere else on the
   * site — leaders, anchors, the pulse, the masks, the card, the buttons. All
   * of it is the brand's own palette now, and the taupe is spent on the two
   * things that mean something rather than on every edge.
   */
  it("keeps the whole jaw out of the old amber", () => {
    const amber = [
      "#dfbd80", "#f0cf91", "#fff2ca", "#efd8a3", "#d68f89",
      "239 208 150", "255 226 169", "248 218 160",
      "238, 195, 133", "232, 178, 137", "247, 218, 160",
    ];
    for (const value of amber) {
      expect(cssText).not.toContain(value);
    }

    // A neutral hairline around the card; the taupe reserved for the accents.
    const card = cssText.match(/\.zoneCard \{[^}]*\}/)?.[0] ?? "";
    expect(card).toMatch(/border:\s*1px solid rgb\(250 249 246/);
    expect(cssText).toMatch(/\.cardKicker \{[^}]*color:\s*var\(--taupe\)/);
    expect(cssText).toMatch(
      /\.zoneMarker\[data-active="true"\] \.zoneLeader \{[^}]*stroke:\s*var\(--taupe\)/,
    );
  });

  /*
   * Hollow at rest, filled when live. A solid dot on all four zones is four
   * things shouting at once; filling one ring is what says "this one".
   */
  it("leaves the anchors hollow until their zone is live", () => {
    const anchor = cssText.match(/\.zoneAnchor \{[^}]*\}/)?.[0] ?? "";

    expect(anchor).toMatch(/stroke:\s*var\(--porcelain\)/);
    expect(anchor).not.toMatch(/fill:\s*var\(--taupe\)/);
    expect(cssText).toMatch(
      /\.zoneMarker\[data-active="true"\] \.zoneAnchor \{[^}]*fill:\s*var\(--taupe\)/,
    );
  });

  it("keeps one centered 16:9 artboard and pop-motion contracts", () => {
    renderOverlay();
    expect(screen.getByTestId("jaw-artboard")).toHaveClass(styles.zoneArtboard);
    expect(cssText).toMatch(/\.zoneArtboard[\s\S]*aspect-ratio:\s*16\s*\/\s*9/);
    expect(cssText).toMatch(/@keyframes\s+zone-pop/);
    expect(cssText).toMatch(/@keyframes\s+zone-mask-pop[\s\S]*opacity:\s*0\.18/);
    expect(cssText).toMatch(/\.zoneOverlay\[data-presentation="reveal"\] \.zoneMask[\s\S]*animation:\s*zone-mask-pop/);
    expect(cssText).toMatch(/@keyframes\s+zone-tease/);
    expect(cssText).toMatch(/@keyframes\s+zone-heading-pop[\s\S]*translate\(-50%,\s*0\)/);
    expect(cssText).toMatch(/@keyframes\s+assistance-pop[\s\S]*translateX\(-50%\)/);
    expect(cssText).toMatch(/\.zoneHeading[\s\S]*animation:\s*zone-heading-pop/);
    expect(cssText).toMatch(/\.assistanceBar[\s\S]*animation:\s*assistance-pop/);
    expect(cssText).toMatch(/\.assistanceBar[\s\S]*left:\s*50%/);
  });
});
