import { act, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, expect, test, vi } from "vitest";
import { ClinicStory } from "./ClinicStory";
import { photoFrames } from "./photoStripContent";

const jawSequenceMetrics = vi.hoisted(() => ({ renders: 0 }));

vi.mock("./jaw/JawFrameSequence", () => ({
  JawFrameSequence: ({
    onExactFrameDrawn,
    profile,
    reducedMotion,
  }: Readonly<{
    onExactFrameDrawn: (index: number) => void;
    profile: "desktop" | "mobile";
    reducedMotion: boolean;
  }>) => {
    jawSequenceMetrics.renders += 1;
    return (
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
    );
  },
}));

const cssText = readFileSync("components/home/clinicStory.module.css", "utf8");
let resizeCallbacks: ResizeObserverCallback[] = [];

afterEach(() => {
  resizeCallbacks = [];
  jawSequenceMetrics.renders = 0;
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function stubMatchMedia(reduced: boolean, wide = true) {
  resizeCallbacks = [];
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
      constructor(callback: ResizeObserverCallback) {
        resizeCallbacks.push(callback);
      }
      observe() {}
      disconnect() {}
    },
  );
}

function triggerResizeObservers() {
  for (const callback of resizeCallbacks) callback([], {} as ResizeObserver);
}

function installDesktopGeometry() {
  const section = screen.getByTestId("clinic-story");
  const track = screen.getByRole("list");
  const detail = screen.getAllByTestId("clinic-frame").at(-1)!;
  let progressVh = 0;
  let scrollY = 0;

  Object.defineProperty(window, "innerHeight", { configurable: true, value: 1000 });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
  Object.defineProperty(window, "scrollY", { configurable: true, get: () => scrollY });
  Object.defineProperty(track, "scrollWidth", { configurable: true, value: 4200 });
  Object.defineProperty(detail, "offsetLeft", { configurable: true, value: 940 });
  Object.defineProperty(detail, "offsetTop", { configurable: true, value: 220 });
  Object.defineProperty(detail, "offsetWidth", { configurable: true, value: 360 });
  Object.defineProperty(detail, "offsetHeight", { configurable: true, value: 540 });
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

  triggerResizeObservers();

  return {
    section,
    setProgress(nextProgressVh: number) {
      progressVh = nextProgressVh;
      scrollY = nextProgressVh * 10;
      act(() => window.dispatchEvent(new Event("scroll")));
    },
  };
}

function installMobilePerformanceGeometry() {
  const section = screen.getByTestId("clinic-story");
  const scrollViewport = screen.getByTestId("clinic-track-viewport");
  const track = screen.getByRole("list");
  const detail = screen.getAllByTestId("clinic-frame").at(-1)!;
  let progressVh = 0;
  let scrollY = 0;
  let scrollLeft = 24;
  const metrics = { layoutReads: 0, scrollWrites: 0 };

  Object.defineProperty(window, "innerHeight", { configurable: true, value: 844 });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
  Object.defineProperty(window, "scrollY", { configurable: true, get: () => scrollY });
  Object.defineProperty(track, "scrollWidth", {
    configurable: true,
    get: () => {
      metrics.layoutReads += 1;
      return 2380;
    },
  });
  Object.defineProperty(scrollViewport, "scrollLeft", {
    configurable: true,
    get: () => {
      metrics.layoutReads += 1;
      return scrollLeft;
    },
    set: (value: number) => {
      metrics.scrollWrites += 1;
      scrollLeft = value;
    },
  });
  for (const [property, value] of [
    ["offsetLeft", 1960],
    ["offsetTop", 230],
    ["offsetWidth", 320],
    ["offsetHeight", 472],
  ] as const) {
    Object.defineProperty(detail, property, {
      configurable: true,
      get: () => {
        metrics.layoutReads += 1;
        return value;
      },
    });
  }
  section.getBoundingClientRect = () => {
    metrics.layoutReads += 1;
    return {
      bottom: 6583 - progressVh * 8.44,
      height: 6583,
      left: 0,
      right: 390,
      top: -progressVh * 8.44,
      width: 390,
      x: 0,
      y: -progressVh * 8.44,
      toJSON: () => ({}),
    } satisfies DOMRect;
  };
  detail.getBoundingClientRect = () => {
    metrics.layoutReads += 1;
    return {
      bottom: 702,
      height: 472,
      left: 42,
      right: 362,
      top: 230,
      width: 320,
      x: 42,
      y: 230,
      toJSON: () => ({}),
    } satisfies DOMRect;
  };

  triggerResizeObservers();
  metrics.layoutReads = 0;
  metrics.scrollWrites = 0;

  return {
    metrics,
    setProgress(nextProgressVh: number) {
      progressVh = nextProgressVh;
      scrollY = nextProgressVh * 8.44;
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
  // A scroll prompt, not a spinner: a turning ring told readers to wait, and
  // waiting is the one thing that leaves this scene where it started.
  expect(screen.getByText("Scrollujte")).toBeVisible();
  expect(screen.getByTestId("jaw-scroll-hint")).toBeInTheDocument();
  expect(screen.queryByTestId("jaw-loading-ring")).not.toBeInTheDocument();
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
  // The cue falls and fades rather than turning: a ring that goes round
  // forever reads as "loading", which is the opposite of what to do here.
  expect(cssText).toMatch(/@keyframes\s+jaw-scroll-drift/);
  expect(cssText).not.toMatch(/@keyframes\s+jaw-loading-spin/);
  expect(cssText).toMatch(/\.jawMedia\s*\{[^}]*inset:\s*0\.1px;/);
});

test("keeps native mobile momentum free from programmatic scroll writes", () => {
  stubMatchMedia(false, false);
  render(<ClinicStory />);
  const { metrics, setProgress } = installMobilePerformanceGeometry();

  setProgress(110);

  expect(metrics.scrollWrites).toBe(0);
});

test("uses cached geometry instead of layout reads inside mobile document scroll", () => {
  stubMatchMedia(false, false);
  render(<ClinicStory />);
  const { metrics, setProgress } = installMobilePerformanceGeometry();

  setProgress(110);

  expect(metrics.layoutReads).toBe(0);
});

test("does not rerender jaw subtree for every mobile scroll sample", () => {
  stubMatchMedia(false, false);
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  render(<ClinicStory />);
  const { setProgress } = installMobilePerformanceGeometry();
  setProgress(250);
  jawSequenceMetrics.renders = 0;

  setProgress(251);
  setProgress(252);
  setProgress(253);

  expect(jawSequenceMetrics.renders).toBe(0);
});

test("interpolates coarse mobile scroll targets across animation frames", () => {
  stubMatchMedia(false, false);
  const callbacks: FrameRequestCallback[] = [];
  let nextId = 0;
  let now = performance.now();
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      callbacks.push(callback);
      nextId += 1;
      return nextId;
    }),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  render(<ClinicStory />);
  const section = screen.getByTestId("clinic-story");
  const { setProgress } = installMobilePerformanceGeometry();

  setProgress(130);
  expect(section.style.getPropertyValue("--snap")).toBe("0");

  for (let frame = 0; frame < 12; frame += 1) {
    const callback = callbacks.shift();
    expect(callback).toBeDefined();
    now += 1000 / 60;
    act(() => callback!(now));
  }

  const interpolatedSnap = Number(section.style.getPropertyValue("--snap"));
  expect(interpolatedSnap).toBeGreaterThan(0);
  expect(interpolatedSnap).toBeLessThan(1);
});

test("keeps jaw UI behind smoothed mobile story motion", () => {
  stubMatchMedia(false, false);
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  render(<ClinicStory />);
  const { setProgress } = installMobilePerformanceGeometry();

  setProgress(250);

  expect(screen.queryByTestId("jaw-viewport")).not.toBeInTheDocument();
});

test("moves handoff with compositor-only FLIP and drops mobile blur", () => {
  expect(cssText).not.toMatch(/--handoff-(?:left|top|width|height)/);
  expect(cssText).toMatch(/\.handoffPhoto\s*\{[\s\S]*?inset:\s*0;[\s\S]*?transform:\s*translate3d\(/);
  expect(cssText).not.toMatch(/will-change:\s*top,\s*left,\s*width,\s*height/);
  expect(cssText).toMatch(/\.trackViewport\s*\{[\s\S]*?overflow:\s*visible;/);
  expect(cssText).toMatch(
    /\.section\[data-snap-active="true"\] \.trackViewport\s*\{[\s\S]*?overflow-x:\s*hidden;/,
  );
  expect(cssText).not.toMatch(
    /\.section\[data-snap-active="true"\] \.trackViewport\s*\{[\s\S]*?overflow-x:\s*clip;/,
  );
  expect(cssText).toMatch(/@media \(max-width: 767px\)[\s\S]*?\.handoffPhoto\s*\{[\s\S]*?filter:\s*none;/);
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
  })).toHaveLength(4);
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
