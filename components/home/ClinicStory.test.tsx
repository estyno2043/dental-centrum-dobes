import { act, fireEvent, render, screen } from "@testing-library/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
  ScrollTrigger.killAll();
  resizeCallbacks = [];
  jawSequenceMetrics.renders = 0;
  vi.useRealTimers();
  vi.restoreAllMocks();
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

function mobileMediaBlock(): string {
  /* There is more than one: the layout block, and the scroll-timeline block
     that only applies where the browser has view timelines. */
  const marker = "@media (max-width: 767px) {";
  const blocks: string[] = [];
  for (let at = cssText.indexOf(marker); at >= 0; at = cssText.indexOf(marker, at + 1)) {
    const end = cssText.indexOf("\n}\n", at);
    if (end < 0) throw new Error("mobile media block is unterminated");
    blocks.push(cssText.slice(at, end));
  }
  if (blocks.length === 0) {
    throw new Error("mobile media block missing from clinicStory.module.css");
  }
  return blocks.join("\n");
}


function triggerResizeObservers() {
  for (const callback of resizeCallbacks) callback([], {} as ResizeObserver);
  ScrollTrigger.refresh();
}

function setStoryProgress(section: HTMLElement, progressVh: number, storyEnd: number) {
  const trigger = ScrollTrigger.getAll().find((candidate) => candidate.trigger === section);
  if (!trigger?.animation) throw new Error("ClinicStory ScrollTrigger was not created");
  act(() => {
    trigger.animation!.progress(progressVh / storyEnd);
  });
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
      setStoryProgress(section, nextProgressVh, 1030);
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
      setStoryProgress(section, nextProgressVh, 780);
    },
  };
}

test("keeps complete gallery and uses one detail visual through fullscreen handoff", () => {
  stubMatchMedia(false);
  const { container } = render(<ClinicStory />);
  const { section, setProgress } = installDesktopGeometry();

  expect(screen.getAllByTestId("clinic-frame")).toHaveLength(photoFrames.length);
  expect(screen.getAllByTestId("clinic-frame").map((node) => node.dataset.frameId)).toEqual(
    photoFrames.map((frame) => frame.id),
  );
  expect(container.querySelectorAll('[data-frame-id="detail"]')).toHaveLength(1);
  expect(screen.queryByTestId("clinic-handoff")).not.toBeInTheDocument();
  expect(
    container.querySelector('[data-frame-id="detail"] source[media="(max-width: 767px)"]'),
  ).toHaveAttribute("srcset", "/media/strip-07-detail-mobile.jpg");
  expect(section).toHaveAttribute("data-desktop-vh", "1030");

  setProgress(460);
  /* The zoom is read off the frame it actually scales, not a variable no
     stylesheet consumes. */
  expect(screen.getAllByTestId("clinic-frame").at(-1)!.style.transform).toContain("scale(");
  expect(section.style.getPropertyValue("--handoff")).toBe("0");
  expect(container.querySelector('[data-jaw-sequence-state]')).toBeInTheDocument();
  expect(screen.getByTestId("jaw-layer")).toHaveAttribute("data-visible", "false");
  expect(screen.queryByText("Zóny bolesti")).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Kde vás to trápi?" })).not.toBeInTheDocument();
});

test("expands the original mobile detail frame instead of revealing a replacement", () => {
  stubMatchMedia(false, false);
  render(<ClinicStory />);
  const detail = screen.getAllByTestId("clinic-frame").at(-1)!;
  const { setProgress } = installMobilePerformanceGeometry();

  setProgress(300);

  expect(detail.style.transform).toContain("translate3d(");
  expect(detail.style.transform).toContain("scale(");
  expect(screen.queryByTestId("clinic-handoff")).not.toBeInTheDocument();
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
  expect(screen.getAllByRole("button", { name: /Predné|Črenové|Stoličky|Ďasná/ })).toHaveLength(4);
});

test("uses contained rounded scene and gradient dissolve into next section", () => {
  expect(cssText).toMatch(/\.jawViewport[\s\S]*border-radius:\s*clamp\(/);
  expect(cssText).toMatch(/\.jawViewport[\s\S]*width:\s*min\(/);
  expect(cssText).toMatch(/\.jawViewport\s*\{[^}]*overflow:\s*clip;/);
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
  setProgress(400);
  jawSequenceMetrics.renders = 0;

  setProgress(410);
  setProgress(420);
  setProgress(430);

  expect(jawSequenceMetrics.renders).toBe(0);
});

test("holds mobile gallery on frame one before moving it through GSAP transform", () => {
  stubMatchMedia(false, false);
  render(<ClinicStory />);
  const track = screen.getByRole("list");
  const { setProgress } = installMobilePerformanceGeometry();

  setProgress(35.99);

  expect(track.style.transform).toContain("translate3d(0px");

  setProgress(138);

  /* Half the pan of a 1925px travel, read off the transform that carries it. */
  expect(track.style.transform).toContain("translate3d(-962.5px");
  expect(screen.getByTestId("clinic-track-viewport")).toHaveAttribute(
    "data-native-swipe",
    "false",
  );
});

test("leaves mobile sticky geometry to CSS instead of freezing mount-time pixels", () => {
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 844 });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
  stubMatchMedia(false, false);
  render(<ClinicStory />);
  const section = screen.getByTestId("clinic-story");
  const pin = screen.getByTestId("clinic-story-pin");

  triggerResizeObservers();

  /*
   * These two used to be written as the mount-time `window.innerHeight` and
   * then deliberately never refreshed, so that a retracting URL bar could not
   * jump the scene mid-scroll. Stability was the right goal; pixels were the
   * wrong way to reach it. iOS retracts that bar on the first scroll, which
   * left the pin ~135px shorter than the screen — a dead strip showing the
   * next section — and left every phase boundary calibrated to a viewport
   * that no longer existed. `lvh` is constant *and* covers the tallest state,
   * so the geometry is now stable by construction rather than by a guard.
   */
  expect(pin.style.getPropertyValue("--pin-height")).toBe("");
  expect(section.style.getPropertyValue("--story-height")).toBe("");

  Object.defineProperty(window, "innerHeight", { configurable: true, value: 700 });
  triggerResizeObservers();

  expect(pin.style.getPropertyValue("--pin-height")).toBe("");
  expect(section.style.getPropertyValue("--story-height")).toBe("");
});

test("sizes the mobile pinned scene in viewport units the URL bar cannot move", () => {
  const mobile = mobileMediaBlock();

  expect(mobile).toMatch(/\.pin\s*\{[^}]*height:\s*100lvh;/);
  expect(mobile).toMatch(/\.section\s*\{[^}]*height:\s*780lvh;/);

  /*
   * `dvh` tracks the retracting URL bar, so any layout expressed in it
   * reflows the seven-frame flex track on every frame of that retraction —
   * during the exact scroll that starts the gallery. The scene composes in
   * `svh` (always visible) inside a pin sized in `lvh` (always covering).
   */
  expect(mobile.replace(/\/\*[\s\S]*?\*\//g, "")).not.toMatch(/dvh/);
  expect(mobile).toMatch(/--frame-h:\s*56svh;/);
});

test("composes mobile scene layers against the viewport each one needs", () => {
  const mobile = mobileMediaBlock();

  /*
   * The gallery composes in the always-visible box, so nothing it shows can
   * hide behind the browser bar. The jaw scene is full-bleed and has to reach
   * the bottom of the glass, so it fills `lvh` and publishes the difference
   * for its own controls to keep clear of.
   */
  expect(mobile).toMatch(/\.galleryLayer\s*\{[^}]*height:\s*100svh;/);
  expect(mobile).toMatch(/\.jawLayer\s*\{[^}]*height:\s*100lvh;/);
  expect(mobile).toMatch(/--jaw-safe-bottom:\s*calc\(100lvh - 100svh\);/);
});

test("links mobile gallery directly to scroll and ignores browser-bar resizes", () => {
  const configSpy = vi.spyOn(ScrollTrigger, "config");
  stubMatchMedia(false, false);
  render(<ClinicStory />);
  const section = screen.getByTestId("clinic-story");
  installMobilePerformanceGeometry();
  const trigger = ScrollTrigger.getAll().find((candidate) => candidate.trigger === section);

  /*
   * A number, not `true`: iOS delivers scroll samples in bursts under
   * momentum, and applying each the instant it lands is what stepped the
   * scene and hard-cut it when the finger left the glass.
   */
  expect(trigger?.vars.scrub).toBe(0.3);
  expect(configSpy).toHaveBeenCalledWith({ ignoreMobileResize: true });
});

test("keeps mobile tooth zones clickable from reveal until story exit completes", () => {
  stubMatchMedia(false, false);
  render(<ClinicStory />);
  const { setProgress } = installMobilePerformanceGeometry();

  setProgress(571);
  fireEvent.click(screen.getByTestId("jaw-exact-frame-signal"));
  expect(screen.getAllByTestId(/jaw-zone-button-/)).toHaveLength(4);
  expect(screen.getAllByTestId(/jaw-zone-button-/).every((button) => !button.hasAttribute("disabled"))).toBe(true);

  setProgress(700);
  expect(screen.getAllByTestId(/jaw-zone-button-/).every((button) => !button.hasAttribute("disabled"))).toBe(true);

  setProgress(780);
  expect(screen.getAllByTestId(/jaw-zone-button-/).every((button) => button.hasAttribute("disabled"))).toBe(true);
});

test("keeps jaw UI behind smoothed mobile story motion", () => {
  stubMatchMedia(false, false);
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  render(<ClinicStory />);
  const { setProgress } = installMobilePerformanceGeometry();

  setProgress(250);

  expect(screen.getByTestId("jaw-viewport")).toBeInTheDocument();
  expect(screen.getByTestId("jaw-layer")).toHaveAttribute("data-visible", "false");
});

test("keeps one compositor-owned detail visual and no large animated blur", () => {
  expect(cssText).not.toMatch(/\.handoff(?:Picture|Photo)/);
  expect(cssText).not.toMatch(/will-change:\s*top,\s*left,\s*width,\s*height/);
  expect(cssText).toMatch(/\.trackViewport\s*\{[\s\S]*?overflow:\s*visible;/);
  expect(cssText).toMatch(
    /@media \(max-width: 767px\)[\s\S]*?\.trackViewport\s*\{[\s\S]*?overflow:\s*visible;[\s\S]*?touch-action:\s*pan-y;/,
  );
  expect(cssText).toMatch(
    /\.reduced \.trackViewport\s*\{[\s\S]*?overflow-x:\s*auto;[\s\S]*?scroll-snap-type:\s*x mandatory;/,
  );
  expect(cssText).not.toContain("data-snap-active");
  expect(cssText).not.toMatch(/filter:\s*blur\(calc\(var\(--handoff/);
  expect(cssText).not.toMatch(
    /@media \(max-width: 767px\)[\s\S]*?\.jawMedia\s*\{[^}]*transform:/,
  );
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
  expect(screen.queryByTestId("clinic-handoff")).not.toBeInTheDocument();
  expect(section).toHaveAttribute("data-desktop-vh", "1030");
});

test("brings the mobile card forward without touching the transform GSAP owns", () => {
  const mobile = mobileMediaBlock();

  /*
   * The independent `scale` property, so it composes with the fullscreen
   * handoff GSAP writes to the detail frame's `transform` instead of one
   * clobbering the other. Driven by `--grow`, which is already written once
   * per sample, so the arrival costs no extra work.
   */
  expect(mobile).toMatch(/\.frame\s*\{[^}]*scale:\s*calc\(0\.88 \+ var\(--grow\) \* 0\.12\);/);
  expect(mobile).not.toMatch(/\.frame\s*\{[^}]*transform:/);
  expect(mobile).not.toMatch(/animation-timeline/);
});
