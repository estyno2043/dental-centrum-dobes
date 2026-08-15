import { act, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, expect, test, vi } from "vitest";
import { ClinicStory } from "./ClinicStory";
import { photoFrames } from "./photoStripContent";

vi.mock("./jaw/JawFrameSequence", () => ({
  JawFrameSequence: ({
    onExactFrameDrawn,
    profile,
    reducedMotion,
  }: Readonly<{
    onExactFrameDrawn: (index: number) => void;
    profile: "desktop" | "mobile";
    reducedMotion: boolean;
  }>) => (
    <div data-jaw-sequence-state={reducedMotion ? "reduced" : "ready"}>
      {/* eslint-disable-next-line @next/next/no-img-element -- deterministic sequence mock. */}
      <img
        alt=""
        src={`/media/jaw-sequence/${profile}/frame-${profile === "desktop" ? "072" : "060"}.webp`}
      />
      <button
        data-testid="jaw-exact-frame-signal"
        onClick={() => onExactFrameDrawn(profile === "desktop" ? 72 : 60)}
        type="button"
      >
        signal exact frame
      </button>
    </div>
  ),
}));

const cssText = readFileSync("components/home/clinicStory.module.css", "utf8");

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function stubMatchMedia(reduced: boolean, wide = true) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? reduced : wide,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
}

function installDesktopGeometry() {
  const section = screen.getByTestId("clinic-story");
  const track = screen.getByRole("list");
  const detail = screen.getAllByTestId("clinic-frame").at(-1)!;
  let progressVh = 0;

  Object.defineProperty(window, "innerHeight", { configurable: true, value: 1000 });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
  Object.defineProperty(track, "scrollWidth", { configurable: true, value: 4200 });
  section.getBoundingClientRect = () =>
    ({
      bottom: 10300 - progressVh * 10,
      height: 10300,
      left: 0,
      right: 1440,
      top: -progressVh * 10,
      width: 1440,
      x: 0,
      y: -progressVh * 10,
      toJSON: () => ({}),
    }) satisfies DOMRect;
  detail.getBoundingClientRect = () =>
    ({
      bottom: 760,
      height: 540,
      left: 940,
      right: 1300,
      top: 220,
      width: 360,
      x: 940,
      y: 220,
      toJSON: () => ({}),
    }) satisfies DOMRect;

  return {
    section,
    setProgress(nextProgressVh: number) {
      progressVh = nextProgressVh;
      act(() => window.dispatchEvent(new Event("scroll")));
    },
  };
}

test("keeps complete gallery and semantic detail handoff before jaw pixels", () => {
  stubMatchMedia(false);
  const { container } = render(<ClinicStory />);
  const { section, setProgress } = installDesktopGeometry();

  expect(screen.getAllByTestId("clinic-frame")).toHaveLength(photoFrames.length);
  expect(screen.getAllByTestId("clinic-frame").map((node) => node.dataset.frameId)).toEqual(
    photoFrames.map((frame) => frame.id),
  );
  expect(screen.getByTestId("clinic-handoff")).toHaveAttribute("data-frame-id", "detail");
  expect(section).toHaveAttribute("data-desktop-vh", "1030");

  setProgress(460);
  expect(section.style.getPropertyValue("--detail")).toBe("1");
  expect(section.style.getPropertyValue("--handoff")).toBe("0");
  expect(container.querySelector('[data-jaw-sequence-state]')).not.toBeInTheDocument();
  expect(screen.queryByText("Zóny bolesti")).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Kde vás to trápi?" })).not.toBeInTheDocument();
});

test("shows contained jaw with transient pain-zone loading cue", () => {
  stubMatchMedia(false);
  render(<ClinicStory />);
  const { setProgress } = installDesktopGeometry();

  setProgress(545);
  expect(screen.getByTestId("jaw-viewport")).toBeInTheDocument();
  expect(screen.getByText("Zóny bolesti")).toBeVisible();
  expect(screen.getByTestId("jaw-loading-ring")).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Kde vás to trápi?" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Chýba mi zub" })).not.toBeInTheDocument();
});

test("teases zones before map labels then removes loading cue", () => {
  stubMatchMedia(false);
  render(<ClinicStory />);
  const { setProgress } = installDesktopGeometry();

  setProgress(685);
  expect(screen.queryByText("Zóny bolesti")).not.toBeInTheDocument();
  fireEvent.click(screen.getByTestId("jaw-exact-frame-signal"));
  expect(screen.getByTestId("jaw-zone-overlay")).toHaveAttribute("data-presentation", "tease");
  expect(screen.queryByRole("heading", { name: "Kde vás to trápi?" })).not.toBeInTheDocument();
  expect(screen.queryAllByRole("button", { name: /Predné|Črenové|Stoličky|Ďasná/ })).toHaveLength(0);

  setProgress(730);
  expect(screen.getByRole("heading", { name: "Kde vás to trápi?" })).toBeVisible();
  expect(screen.getAllByTestId(/jaw-leader-/)).toHaveLength(4);
  expect(screen.queryAllByRole("button", { name: /Predné|Črenové|Stoličky|Ďasná/ })).toHaveLength(0);
});

test("uses contained rounded scene and gradient dissolve into next section", () => {
  expect(cssText).toMatch(/\.jawViewport[\s\S]*border-radius:\s*clamp\(/);
  expect(cssText).toMatch(/\.jawViewport[\s\S]*width:\s*min\(/);
  expect(cssText).toMatch(/\.exitGradient[\s\S]*linear-gradient/);
  expect(cssText).toMatch(/@keyframes\s+jaw-loading-spin/);
  expect(cssText).toMatch(/\.jawMedia\s*\{[^}]*inset:\s*0\.1px;/);
});

test("renders static open map and six routes for reduced motion", () => {
  stubMatchMedia(true);
  const { container } = render(<ClinicStory />);

  expect(container.querySelector('[data-jaw-sequence-state="reduced"] img')).toHaveAttribute(
    "src",
    "/media/jaw-sequence/desktop/frame-072.webp",
  );
  expect(screen.getByRole("heading", { name: "Kde vás to trápi?" })).toBeVisible();
  expect(
    screen.getAllByRole("link", {
      name: /Chýba mi zub|Neviem \/ bolí to celé/,
    }),
  ).toHaveLength(2);
  expect(screen.getAllByRole("button", {
    name: /Predné zuby|Črenové zuby|Stoličky|Ďasná/,
  })).toHaveLength(7);
});

test("keeps gallery geometry when sequence reports permanent failure", () => {
  stubMatchMedia(false);
  render(<ClinicStory />);
  const { section, setProgress } = installDesktopGeometry();
  setProgress(545);

  fireEvent(window, new Event("jaw-sequence-permanent-failure"));
  expect(screen.getAllByTestId("clinic-frame")).toHaveLength(photoFrames.length);
  expect(screen.getByTestId("clinic-handoff")).toHaveAttribute("data-frame-id", "detail");
  expect(section).toHaveAttribute("data-desktop-vh", "1030");
});
